// Mobile app (M1–M6, M12). Counts can only be entered here, never on paper or Excel.
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db.js';
import { MANAGERS, requireMobile } from '../lib/auth.js';
import { forbidden, notFound } from '../lib/errors.js';
import { currentUser, parse, tx } from '../lib/http.js';
import { counterView, enterLine, startTask, submitTask } from '../engine/counts.js';

const routes: FastifyPluginAsync = async (app) => {
  // M1 My tasks today: every task is assigned to a named person with a due time.
  app.get('/m/tasks', async (req) => {
    const uid = req.user.sub;
    const role = req.user.role;
    const counts = await prisma.countTask.findMany({ where: { assigneeId: uid, status: { in: ['ASSIGNED', 'IN_PROGRESS'] } }, include: { lines: { select: { itemId: true, countedQty: true } } }, orderBy: { dueAt: 'asc' } });
    const locs = new Map((await prisma.location.findMany({ where: { id: { in: counts.map((c) => c.locationId) } } })).map((l) => [l.id, l.name]));
    const recountItems = new Map(
      (await prisma.item.findMany({ where: { id: { in: counts.filter((c) => c.type === 'RECOUNT').flatMap((c) => c.lines.map((l) => l.itemId)) } } })).map((i) => [i.id, i.name]),
    );
    const tasks: Record<string, unknown>[] = counts.map((c) => ({
      kind: c.type === 'RECOUNT' ? 'RECOUNT' : 'COUNT',
      id: c.id,
      title: `${c.type === 'RECOUNT' ? 'Recount' : c.type === 'FULL' ? 'Full count' : 'Spot count'}, ${locs.get(c.locationId)?.toLowerCase()}`,
      // Spot counts don't reveal items until started; recounts list them (the counter still sees no numbers).
      subtitle: c.type === 'RECOUNT' ? `${c.lines.length} items, requested by the system` : `${c.lines.length} items picked by the system`,
      items: c.type === 'RECOUNT' ? c.lines.map((l) => recountItems.get(l.itemId)) : undefined,
      dueAt: c.dueAt,
      status: c.status,
    }));

    if (['RECEIVER', 'STORE', 'COUNTER', 'OUTLET_MANAGER'].includes(role)) {
      const pos = await prisma.purchaseOrder.findMany({ where: { outletId: { in: req.user.outletIds }, status: 'APPROVED', createdById: { not: uid } } });
      const received = new Set((await prisma.grn.findMany({ where: { poId: { in: pos.map((p) => p.id) } } })).map((g) => g.poId));
      const vendors = new Map((await prisma.vendor.findMany({ where: { id: { in: pos.map((p) => p.vendorId) } } })).map((v) => [v.id, v.name]));
      for (const p of pos.filter((p) => !received.has(p.id))) {
        tasks.push({ kind: 'RECEIVE', id: p.id, title: `Receive ${vendors.get(p.vendorId)}`, subtitle: `${p.poNo}, weigh on scale at the door`, dueAt: p.expectedAt });
      }
      const incoming = await prisma.transfer.findMany({ where: { toOutletId: { in: req.user.outletIds }, status: 'IN_TRANSIT', dispatchedById: { not: uid } } });
      for (const t of incoming) tasks.push({ kind: 'TRANSFER', id: t.id, title: `Confirm transfer ${t.number}`, subtitle: 'Enter what arrived', dueAt: t.dueBy });
    }
    if (['KITCHEN_STAFF', 'BAR_STAFF', 'HEAD_CHEF', 'BAR_MANAGER', 'COUNTER', 'STORE'].includes(role)) {
      tasks.push({ kind: 'WASTAGE', id: 'closing-wastage', title: 'Log closing wastage', subtitle: 'Kitchen and bar', dueAt: null });
    }
    if (role === 'CASHIER') {
      const shift = await prisma.cashShift.findFirst({ where: { cashierId: uid, status: 'OPEN' } });
      tasks.push(shift ? { kind: 'CASH_CLOSE', id: shift.id, title: `Close ${shift.shiftName} shift`, subtitle: `Till ${shift.till}`, dueAt: null } : { kind: 'CASH_OPEN', id: 'open', title: 'Open shift', subtitle: 'Count the float', dueAt: null });
    }
    if (MANAGERS.includes(role) || role === 'OWNER' || role === 'FINANCE_HEAD') {
      const [ex, w, sc] = await Promise.all([
        prisma.exception.count({ where: { assigneeId: uid, status: { not: 'RESOLVED' } } }),
        prisma.wastageEntry.count({ where: { routedToId: uid, status: 'PENDING' } }),
        MANAGERS.includes(role) ? prisma.cashShift.count({ where: { outletId: { in: req.user.outletIds }, status: 'COUNT_SUBMITTED', cashierId: { not: uid } } }) : Promise.resolve(0),
      ]);
      if (ex + w + sc) tasks.push({ kind: 'APPROVALS', id: 'approvals', title: 'Explain and approve', subtitle: `${ex} exceptions, ${w} wastage, ${sc} cash counts`, dueAt: null });
    }
    return tasks;
  });

  app.post<{ Params: { id: string } }>('/m/counts/:id/start', async (req) => {
    requireMobile(req);
    const user = await currentUser(req);
    return tx((t) => startTask(t, user, req.params.id));
  });

  app.get<{ Params: { id: string } }>('/m/counts/:id', async (req) => {
    requireMobile(req);
    const task = await prisma.countTask.findUnique({ where: { id: req.params.id } });
    if (!task) throw notFound('Count');
    if (task.assigneeId !== req.user.sub) throw forbidden('NOT_ASSIGNEE', 'This count is assigned to someone else');
    if (task.status === 'ASSIGNED') return { id: task.id, status: task.status, message: 'You find out which items to count when you start.' };
    return counterView(prisma, task.id);
  });

  // M3 / M4 blind count entry.
  app.put<{ Params: { id: string; lineId: string } }>('/m/counts/:id/lines/:lineId', async (req) => {
    requireMobile(req);
    const body = parse(
      z.object({
        sealedUnits: z.number().int().min(0).optional(),
        openWeightG: z.number().min(0).optional(),
        scaleReadings: z.array(z.object({ kg: z.number().min(0), deviceId: z.string().optional() })).optional(),
        typedQty: z.number().min(0).optional(),
        photoIds: z.array(z.string()).optional(),
      }),
      req.body,
    );
    const user = await currentUser(req);
    return tx((t) => enterLine(t, user, req.params.id, req.params.lineId, body));
  });

  // M5: submitted; the result is not shown.
  app.post<{ Params: { id: string } }>('/m/counts/:id/submit', async (req) => {
    requireMobile(req);
    const user = await currentUser(req);
    return tx((t) => submitTask(t, user, req.params.id), 60_000);
  });

  // M12 inbox for managers and owners.
  app.get('/m/approvals', async (req) => {
    const uid = req.user.sub;
    const ex = await prisma.exception.findMany({ where: { assigneeId: uid, status: { not: 'RESOLVED' } }, orderBy: { impact: 'desc' } });
    const outlets = new Map((await prisma.outlet.findMany({ where: { orgId: req.user.orgId } })).map((o) => [o.id, o.name]));
    const wastage = await prisma.wastageEntry.findMany({ where: { routedToId: uid, status: 'PENDING', loggedById: { not: uid } } });
    const items = new Map((await prisma.item.findMany({ where: { id: { in: wastage.map((w) => w.itemId) } } })).map((i) => [i.id, i]));
    const people = new Map((await prisma.user.findMany({ where: { id: { in: wastage.map((w) => w.loggedById) } } })).map((u) => [u.id, u.shortName]));
    return {
      exceptions: ex.map((e) => ({ id: e.id, title: e.title, summary: e.summary, impact: e.impact, severity: e.severity, status: e.status, dueAt: e.dueAt, outlet: e.outletId ? outlets.get(e.outletId) : null })),
      wastage: wastage.map((w) => ({ id: w.id, item: items.get(w.itemId)?.name, qty: w.qty, unit: items.get(w.itemId)?.baseUnit, value: w.value, reason: w.reasonCode, loggedBy: people.get(w.loggedById), loggedAt: w.loggedAt })),
    };
  });
};
export default routes;

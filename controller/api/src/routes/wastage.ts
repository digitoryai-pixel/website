import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db.js';
import { outletScope, requireMobile, requireOutlet } from '../lib/auth.js';
import { currentUser, parse, tx } from '../lib/http.js';
import { decideWastage, dispatchTransfer, logWastage, receiveTransfer, transferReceiverView } from '../engine/wastage.js';

const routes: FastifyPluginAsync = async (app) => {
  // M8 Log wastage — when it happens, weighed and photographed.
  app.post('/m/wastage', async (req) => {
    requireMobile(req);
    const body = parse(
      z.object({
        outletId: z.string(), itemId: z.string(), locationId: z.string().optional(), section: z.string().optional(),
        scaleReadings: z.array(z.object({ kg: z.number().positive() })).optional(), typedQty: z.number().positive().optional(),
        reasonCode: z.string().min(1), photoIds: z.array(z.string()).optional(), isBreakage: z.boolean().optional(),
      }),
      req.body,
    );
    requireOutlet(req, body.outletId);
    const user = await currentUser(req);
    return tx((t) => logWastage(t, user, body));
  });

  app.get<{ Querystring: { outletId?: string; from?: string; to?: string; status?: string; mine?: string } }>('/wastage', async (req) => {
    const q = req.query;
    const rows = await prisma.wastageEntry.findMany({
      where: {
        outletId: { in: outletScope(req, q.outletId) },
        ...(q.from || q.to ? { businessDate: { gte: q.from ?? '0000', lte: q.to ?? '9999' } } : {}),
        ...(q.status ? { status: q.status as 'PENDING' } : {}),
        ...(q.mine === '1' ? { routedToId: req.user.sub } : {}),
      },
      orderBy: { loggedAt: 'desc' },
      take: 200,
    });
    const items = new Map((await prisma.item.findMany({ where: { id: { in: rows.map((r) => r.itemId) } } })).map((i) => [i.id, i]));
    const people = new Map((await prisma.user.findMany({ where: { id: { in: rows.flatMap((r) => [r.loggedById, r.routedToId, r.decidedById]).filter(Boolean) as string[] } } })).map((u) => [u.id, u.shortName]));
    const photos = await prisma.attachment.findMany({ where: { entityType: 'wastage', entityId: { in: rows.map((r) => r.id) } } });
    return rows.map((r) => ({
      ...r, item: items.get(r.itemId)?.name, unit: items.get(r.itemId)?.baseUnit, loggedBy: people.get(r.loggedById), routedTo: people.get(r.routedToId),
      decidedBy: r.decidedById ? people.get(r.decidedById) : null, photos: photos.filter((p) => p.entityId === r.id).map((p) => p.id),
      canDecide: r.status === 'PENDING' && r.loggedById !== req.user.sub && (r.routedToId === req.user.sub || ['OWNER', 'FINANCE_HEAD'].includes(req.user.role)),
    }));
  });

  app.post<{ Params: { id: string } }>('/wastage/:id/decide', async (req) => {
    const body = parse(z.object({ approve: z.boolean(), note: z.string().optional() }), req.body);
    const user = await currentUser(req);
    return tx((t) => decideWastage(t, user, req.params.id, body.approve, body.note));
  });

  // Transfers: dispatch in the app, confirm blind at the receiving store.
  app.post('/m/transfers', async (req) => {
    requireMobile(req);
    const body = parse(z.object({ fromOutletId: z.string(), toOutletId: z.string(), lines: z.array(z.object({ itemId: z.string(), qty: z.number().positive() })).min(1) }), req.body);
    requireOutlet(req, body.fromOutletId);
    const user = await currentUser(req);
    return tx((t) => dispatchTransfer(t, user, body));
  });

  app.get('/m/transfers/incoming', async (req) => {
    requireMobile(req);
    const rows = await prisma.transfer.findMany({ where: { toOutletId: { in: req.user.outletIds }, status: 'IN_TRANSIT', dispatchedById: { not: req.user.sub } }, orderBy: { dispatchedAt: 'asc' } });
    return Promise.all(rows.map((r) => transferReceiverView(prisma, r.id)));
  });

  app.post<{ Params: { id: string } }>('/m/transfers/:id/receive', async (req) => {
    requireMobile(req);
    const body = parse(z.object({ lines: z.array(z.object({ lineId: z.string(), qtyReceived: z.number().min(0) })).min(1) }), req.body);
    const user = await currentUser(req);
    const t0 = await prisma.transfer.findUniqueOrThrow({ where: { id: req.params.id } });
    requireOutlet(req, t0.toOutletId);
    return tx((t) => receiveTransfer(t, user, req.params.id, body.lines));
  });

  app.get<{ Querystring: { outletId?: string; status?: string } }>('/transfers', async (req) => {
    const ids = outletScope(req, req.query.outletId);
    const rows = await prisma.transfer.findMany({
      where: { OR: [{ fromOutletId: { in: ids } }, { toOutletId: { in: ids } }], ...(req.query.status ? { status: req.query.status as 'IN_TRANSIT' } : {}) },
      include: { lines: true },
      orderBy: { dispatchedAt: 'desc' },
      take: 100,
    });
    const outlets = new Map((await prisma.outlet.findMany({ where: { orgId: req.user.orgId } })).map((o) => [o.id, o.name]));
    const items = new Map((await prisma.item.findMany({ where: { id: { in: rows.flatMap((r) => r.lines.map((l) => l.itemId)) } } })).map((i) => [i.id, i]));
    return rows.map((r) => ({
      ...r, from: outlets.get(r.fromOutletId), to: outlets.get(r.toOutletId), overdue: r.status === 'IN_TRANSIT' && r.dueBy < new Date(),
      lines: r.lines.map((l) => ({ ...l, item: items.get(l.itemId)?.name, unit: items.get(l.itemId)?.baseUnit })),
    }));
  });
};
export default routes;

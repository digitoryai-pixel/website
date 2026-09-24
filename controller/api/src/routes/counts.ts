import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db.js';
import { CONTROL_VIEWERS, MANAGERS, outletScope, requireOutlet, requireRole } from '../lib/auth.js';
import { notFound } from '../lib/errors.js';
import { currentUser, parse, tx } from '../lib/http.js';
import { approveLines, createCountTask, reviewTask, sendBack } from '../engine/counts.js';

const routes: FastifyPluginAsync = async (app) => {
  // Stock counts list (web). Recount tasks are shown inside their parent.
  app.get<{ Querystring: { outletId?: string; from?: string; to?: string; needsApproval?: string } }>('/counts', async (req) => {
    const q = req.query;
    const tasks = await prisma.countTask.findMany({
      where: {
        outletId: { in: outletScope(req, q.outletId) }, type: { not: 'RECOUNT' },
        ...(q.from || q.to ? { businessDate: { gte: q.from ?? '0000', lte: q.to ?? '9999' } } : {}),
        ...(q.needsApproval === '1' ? { lines: { some: { status: { in: ['NEEDS_APPROVAL', 'SENT_BACK'] } } } } : {}),
      },
      include: { lines: { select: { status: true, varianceValue: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    const people = new Map((await prisma.user.findMany({ where: { id: { in: tasks.map((t) => t.assigneeId) } } })).map((u) => [u.id, u.shortName]));
    const locs = new Map((await prisma.location.findMany({ where: { id: { in: tasks.map((t) => t.locationId) } }, include: { outlet: true } })).map((l) => [l.id, l]));
    return tasks.map((t) => ({
      id: t.id, type: t.type, status: t.status, businessDate: t.businessDate, dueAt: t.dueAt, submittedAt: t.submittedAt,
      outlet: locs.get(t.locationId)?.outlet.name, location: locs.get(t.locationId)?.name, counter: people.get(t.assigneeId),
      items: t.lines.length,
      needApproval: t.lines.filter((l) => l.status === 'NEEDS_APPROVAL' || l.status === 'SENT_BACK').length,
    }));
  });

  // S3 review. Only owners/finance/controllers and managers see system quantities.
  app.get<{ Params: { id: string } }>('/counts/:id/review', async (req) => {
    requireRole(req, [...CONTROL_VIEWERS, ...MANAGERS]);
    const task = await prisma.countTask.findUnique({ where: { id: req.params.id } });
    if (!task) throw notFound('Count');
    requireOutlet(req, task.outletId);
    const r = await reviewTask(prisma, task.id);
    return { ...r, canApprove: ![r.counterId, r.recounterId].includes(req.user.sub) };
  });

  // Schedule a spot count. The system picks the items; it is never assigned to its creator.
  app.post('/counts', async (req) => {
    requireRole(req, [...CONTROL_VIEWERS, 'OUTLET_MANAGER', 'BAR_MANAGER']);
    const body = parse(
      z.object({ outletId: z.string(), locationId: z.string(), assigneeId: z.string().optional(), dueAt: z.string().datetime(), itemCount: z.number().int().min(1).max(60).optional() }),
      req.body,
    );
    requireOutlet(req, body.outletId);
    const user = await currentUser(req);
    return tx((t) => createCountTask(t, { orgId: user.orgId, outletId: body.outletId, locationId: body.locationId, type: 'SPOT', assigneeId: body.assigneeId, assignedById: user.id, dueAt: new Date(body.dueAt), itemCount: body.itemCount }));
  });

  app.post<{ Params: { id: string } }>('/counts/:id/approve', async (req) => {
    requireRole(req, [...CONTROL_VIEWERS, 'OUTLET_MANAGER']);
    const body = parse(z.object({ lineIds: z.array(z.string()).min(1), reasonCode: z.string().min(1) }), req.body);
    const user = await currentUser(req);
    return tx((t) => approveLines(t, user, req.params.id, body.lineIds, body.reasonCode));
  });

  app.post<{ Params: { id: string } }>('/counts/:id/send-back', async (req) => {
    requireRole(req, [...CONTROL_VIEWERS, 'OUTLET_MANAGER']);
    const body = parse(z.object({ lineIds: z.array(z.string()).min(1), note: z.string().min(1) }), req.body);
    const user = await currentUser(req);
    return tx((t) => sendBack(t, user, req.params.id, body.lineIds, body.note));
  });
};
export default routes;

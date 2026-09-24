import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db.js';
import { outletScope } from '../lib/auth.js';
import { notFound, forbidden } from '../lib/errors.js';
import { currentUser, parse, tx } from '../lib/http.js';
import { ROLE_LABEL } from '../lib/people.js';
import { closeException, decideException, explainException, ownerDisplay, reassignException, tickCheck } from '../engine/exceptions.js';
import { exceptionScope } from '../engine/views.js';

const routes: FastifyPluginAsync = async (app) => {
  app.get<{ Querystring: { status?: string; type?: string; outletId?: string; assignedToMe?: string; from?: string; to?: string } }>('/exceptions', async (req) => {
    const q = req.query;
    const rows = await prisma.exception.findMany({
      where: {
        ...exceptionScope(req.user.orgId, outletScope(req, q.outletId), req.user.sub),
        ...(q.status ? { status: { in: q.status.split(',') as ('OPEN' | 'RESOLVED')[] } } : {}),
        ...(q.type ? { type: { in: q.type.split(',') as 'FOOD_COST'[] } } : {}),
        ...(q.assignedToMe === '1' ? { assigneeId: req.user.sub } : {}),
        ...(q.from || q.to ? { businessDate: { gte: q.from ?? '0000', lte: q.to ?? '9999' } } : {}),
      },
      orderBy: [{ impact: 'desc' }],
      take: 200,
    });
    const users = new Map((await prisma.user.findMany({ where: { id: { in: rows.map((r) => r.assigneeId!).filter(Boolean) } } })).map((u) => [u.id, u]));
    return rows.map((r) => ({ ...r, owner: ownerDisplay(r, users.get(r.assigneeId ?? ''), req.user.sub) }));
  });

  // S2 / M12 detail. Same layout for every type; only the driver panel changes.
  app.get<{ Params: { id: string } }>('/exceptions/:id', async (req) => {
    const ex = await prisma.exception.findFirst({ where: { id: req.params.id, orgId: req.user.orgId }, include: { events: { orderBy: { at: 'asc' } } } });
    if (!ex) throw notFound('Exception');
    const visible = ex.assigneeId === req.user.sub || [ex.outletId, ...ex.outletIds].some((o) => o && req.user.outletIds.includes(o));
    if (!visible) throw forbidden('OUTLET_SCOPE', 'This exception is outside your access');
    const people = new Map(
      (await prisma.user.findMany({ where: { id: { in: [ex.assigneeId, ...ex.escalationPath, ...ex.involvedUserIds, ...ex.events.map((e) => e.actorId)].filter(Boolean) as string[] } } })).map((u) => [u.id, u]),
    );
    const evidence = await prisma.attachment.findMany({ where: { entityType: 'exception', entityId: ex.id } });
    const outlet = ex.outletId ? await prisma.outlet.findUnique({ where: { id: ex.outletId } }) : null;
    const assignee = people.get(ex.assigneeId ?? '');
    const person = (id: string) => {
      const u = people.get(id);
      return u ? { id, name: id === req.user.sub ? 'you' : u.shortName, role: u.title ?? ROLE_LABEL[u.role] } : { id, name: '—', role: '' };
    };
    return {
      ...ex,
      outlet: outlet?.name ?? null,
      owner: ownerDisplay(ex, assignee, req.user.sub),
      assignee: assignee ? person(assignee.id) : null,
      escalatesTo: ex.escalationPath.map(person),
      involved: ex.involvedUserIds.map(person),
      evidence,
      events: ex.events.map((e) => ({ ...e, actor: e.actorId ? people.get(e.actorId)?.shortName ?? null : 'System' })),
      // The UI hides actions rather than showing an error: nobody approves their own entry.
      can: {
        close: ex.status !== 'RESOLVED' && !ex.involvedUserIds.includes(req.user.sub),
        explain: ex.status === 'OPEN' && ex.assigneeId === req.user.sub && !ex.involvedUserIds.includes(req.user.sub),
        decide: ex.status === 'AWAITING_DECISION' && ex.assigneeId === req.user.sub && (ex.explanation as { byId?: string } | null)?.byId !== req.user.sub,
        reassign: ex.status !== 'RESOLVED',
      },
    };
  });

  app.post<{ Params: { id: string } }>('/exceptions/:id/reassign', async (req) => {
    const body = parse(z.object({ userId: z.string() }), req.body);
    const user = await currentUser(req);
    return tx((t) => reassignException(t, user, req.params.id, body.userId));
  });

  app.post<{ Params: { id: string; index: string } }>('/exceptions/:id/checks/:index', async (req) => {
    const body = parse(z.object({ done: z.boolean() }), req.body);
    const user = await currentUser(req);
    return tx((t) => tickCheck(t, user, req.params.id, Number(req.params.index), body.done));
  });

  // Closing needs a reason code and evidence; free text alone is rejected.
  app.post<{ Params: { id: string } }>('/exceptions/:id/close', async (req) => {
    const body = parse(z.object({ reasonCode: z.string().min(1), note: z.string().max(2000).optional(), evidenceIds: z.array(z.string()).min(1) }), req.body);
    const user = await currentUser(req);
    return tx((t) => closeException(t, user, req.params.id, body));
  });

  // M12 Explain and approve.
  app.post<{ Params: { id: string } }>('/exceptions/:id/explain', async (req) => {
    const body = parse(z.object({ reasonCode: z.string().min(1), note: z.string().min(1).max(2000), evidenceIds: z.array(z.string()).min(1) }), req.body);
    const user = await currentUser(req);
    return tx((t) => explainException(t, user, req.params.id, body));
  });

  app.post<{ Params: { id: string } }>('/exceptions/:id/decide', async (req) => {
    const body = parse(z.object({ decision: z.enum(['ACCEPT', 'REJECT']), note: z.string().max(2000).optional() }), req.body);
    const user = await currentUser(req);
    return tx((t) => decideException(t, user, req.params.id, body));
  });
};
export default routes;

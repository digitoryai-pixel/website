import type { FastifyPluginAsync } from 'fastify';
import { prisma } from '../db.js';
import { outletScope } from '../lib/auth.js';
import { addDays, businessDate } from '../lib/time.js';
import { actionCentre, exceptionScope, flashKpis } from '../engine/views.js';
import { rankExceptions } from '../engine/exceptions.js';

const routes: FastifyPluginAsync = async (app) => {
  // M10 Daily Flash / S1 KPI tiles. Defaults to the last closed business day.
  app.get<{ Querystring: { date?: string; outletId?: string } }>('/flash', async (req) => {
    const ids = outletScope(req, req.query.outletId);
    const date = req.query.date ?? addDays(businessDate(), -1);
    const kpis = await flashKpis(prisma, ids, date);
    const open = rankExceptions(await prisma.exception.findMany({ where: { ...exceptionScope(req.user.orgId, ids, req.user.sub), status: { not: 'RESOLVED' } } }));
    const largest = open[0];
    const outlet = largest?.outletId ? await prisma.outlet.findUnique({ where: { id: largest.outletId } }) : null;
    return {
      ...kpis,
      outlets: ids.length,
      open: {
        critical: open.filter((e) => e.severity === 'CRITICAL').length,
        attention: open.filter((e) => e.severity === 'ATTENTION').length,
        pending: open.filter((e) => e.severity === 'PENDING').length,
      },
      largest: largest ? { id: largest.id, title: largest.title, impact: largest.impact, outlet: outlet?.name ?? null } : null,
    };
  });

  // S1 Action Centre: ranked by ₹ impact, then severity.
  app.get<{ Querystring: { outletId?: string; severity?: 'CRITICAL' | 'ATTENTION' | 'PENDING'; area?: string } }>('/action-centre', async (req) =>
    actionCentre(prisma, req.user.orgId, req.user.sub, outletScope(req, req.query.outletId), { severity: req.query.severity, area: req.query.area }),
  );

  app.get('/notifications', async (req) =>
    prisma.notification.findMany({ where: { userId: req.user.sub, channel: 'IN_APP' }, orderBy: { createdAt: 'desc' }, take: 50 }),
  );
  app.post<{ Params: { id: string } }>('/notifications/:id/read', async (req) => {
    await prisma.notification.updateMany({ where: { id: req.params.id, userId: req.user.sub }, data: { status: 'READ' } });
    return { ok: true };
  });
};
export default routes;

import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db.js';
import { CONTROL_VIEWERS, OWNERS, requireRole } from '../lib/auth.js';
import { currentUser, parse, tx, zMonth } from '../lib/http.js';
import { checklist, lockPeriod, misPack, reopenPeriod, scheduleFullCount } from '../engine/monthend.js';

const routes: FastifyPluginAsync = async (app) => {
  app.addHook('onRequest', async (req) => requireRole(req, CONTROL_VIEWERS));

  app.get<{ Params: { month: string } }>('/periods/:month/checklist', async (req) => checklist(prisma, req.user.orgId, parse(zMonth, req.params.month)));

  app.post<{ Params: { month: string } }>('/periods/:month/full-count', async (req) => {
    requireRole(req, OWNERS);
    const body = parse(z.object({ dueAt: z.string().datetime() }), req.body);
    const user = await currentUser(req);
    return tx((t) => scheduleFullCount(t, user, parse(zMonth, req.params.month), new Date(body.dueAt)), 60_000);
  });

  app.post<{ Params: { month: string } }>('/periods/:month/lock', async (req) => {
    const user = await currentUser(req);
    return tx((t) => lockPeriod(t, user, parse(zMonth, req.params.month)), 60_000);
  });

  app.post<{ Params: { month: string } }>('/periods/:month/reopen', async (req) => {
    const body = parse(z.object({ reason: z.string().min(5) }), req.body);
    const user = await currentUser(req);
    return tx((t) => reopenPeriod(t, user, parse(zMonth, req.params.month), body.reason));
  });

  // MIS pack for the accountant (Tally/Zoho export is Phase 2).
  app.get<{ Params: { month: string }; Querystring: { format?: string } }>('/periods/:month/mis', async (req, reply) => {
    const pack = await misPack(prisma, req.user.orgId, parse(zMonth, req.params.month));
    if (req.query.format === 'csv') {
      return reply.header('Content-Type', 'text/csv').header('Content-Disposition', `attachment; filename="mis-${pack.month}.csv"`).send(pack.csv);
    }
    return pack;
  });
};
export default routes;

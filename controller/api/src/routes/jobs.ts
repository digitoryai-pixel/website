// Manual triggers for the scheduled jobs (owners / finance only).
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { OWNERS, requireRole } from '../lib/auth.js';
import { parse, tx, zDate } from '../lib/http.js';
import { addDays, businessDate } from '../lib/time.js';
import { closeDay, closeDayAllOutlets } from '../engine/dayclose.js';
import { escalateOverdue } from '../engine/exceptions.js';
import { flagOverdueTransfers } from '../engine/wastage.js';
import { dispatchNotifications, sendDailyFlash } from '../jobs/scheduler.js';

const routes: FastifyPluginAsync = async (app) => {
  app.addHook('onRequest', async (req) => requireRole(req, OWNERS));

  app.post('/jobs/day-close', async (req) => {
    const b = parse(z.object({ date: zDate.optional(), outletId: z.string().optional() }), req.body ?? {});
    const date = b.date ?? addDays(businessDate(), -1);
    const res = await tx((t) => (b.outletId ? closeDay(t, req.user.orgId, b.outletId, date).then((r) => [r]) : closeDayAllOutlets(t, req.user.orgId, date)), 120_000);
    await tx((t) => flagOverdueTransfers(t, req.user.orgId));
    await dispatchNotifications();
    return res;
  });

  app.post('/jobs/escalate', async () => {
    const moved = await tx((t) => escalateOverdue(t), 60_000);
    await dispatchNotifications();
    return { moved };
  });

  app.post('/jobs/daily-flash', async (req) => {
    const sent = await sendDailyFlash(req.user.orgId);
    return { sent };
  });
};
export default routes;

// S4 Liquor control, S5 KOT-to-bill, S7 Giveaways.
import type { FastifyPluginAsync } from 'fastify';
import { prisma } from '../db.js';
import { CONTROL_VIEWERS, MANAGERS, outletScope, requireOutlet, requireRole } from '../lib/auth.js';
import { badRequest } from '../lib/errors.js';
import { addDays, businessDate } from '../lib/time.js';
import { giveawaysView, kotView, liquorControl, liquorSkuTrail } from '../engine/views.js';

const yesterday = () => addDays(businessDate(), -1);

const routes: FastifyPluginAsync = async (app) => {
  app.addHook('onRequest', async (req) => requireRole(req, [...CONTROL_VIEWERS, ...MANAGERS]));

  app.get<{ Querystring: { outletId: string; locationId?: string; from?: string; to?: string } }>('/liquor', async (req) => {
    if (!req.query.outletId) throw badRequest('OUTLET_REQUIRED', 'Pick an outlet');
    requireOutlet(req, req.query.outletId);
    const to = req.query.to ?? yesterday();
    return liquorControl(prisma, req.user.orgId, req.query.outletId, req.query.locationId, req.query.from ?? addDays(to, -6), to);
  });

  app.get<{ Params: { itemId: string }; Querystring: { outletId: string; from?: string; to?: string } }>('/liquor/:itemId/trail', async (req) => {
    requireOutlet(req, req.query.outletId);
    const to = req.query.to ?? yesterday();
    return liquorSkuTrail(prisma, req.query.outletId, req.params.itemId, req.query.from ?? addDays(to, -6), to);
  });

  app.get<{ Querystring: { outletId: string; date?: string } }>('/kot-match', async (req) => {
    if (!req.query.outletId) throw badRequest('OUTLET_REQUIRED', 'Pick an outlet');
    requireOutlet(req, req.query.outletId);
    return kotView(prisma, req.query.outletId, req.query.date ?? yesterday());
  });

  app.get<{ Querystring: { outletId?: string; from?: string; to?: string } }>('/giveaways', async (req) => {
    const to = req.query.to ?? yesterday();
    return giveawaysView(prisma, outletScope(req, req.query.outletId), req.query.from ?? addDays(to, -13), to);
  });
};
export default routes;

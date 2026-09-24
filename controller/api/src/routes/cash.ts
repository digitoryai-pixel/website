import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db.js';
import { CONTROL_VIEWERS, MANAGERS, outletScope, requireMobile, requireOutlet, requireRole } from '../lib/auth.js';
import { currentUser, parse, tx } from '../lib/http.js';
import { openShift, secondCount, submitClose } from '../engine/cash.js';

const denoms = z.object({
  '2000': z.number().int().min(0).optional(), '500': z.number().int().min(0).optional(), '200': z.number().int().min(0).optional(),
  '100': z.number().int().min(0).optional(), '50': z.number().int().min(0).optional(), '20': z.number().int().min(0).optional(),
  '10': z.number().int().min(0).optional(), coins: z.number().min(0).optional(),
});

const routes: FastifyPluginAsync = async (app) => {
  // M7: blind float count at open
  app.post('/m/cash/shifts', async (req) => {
    requireMobile(req);
    requireRole(req, ['CASHIER', ...MANAGERS]);
    const body = parse(z.object({ outletId: z.string(), till: z.string(), shiftName: z.string(), floatDenoms: denoms }), req.body);
    requireOutlet(req, body.outletId);
    const user = await currentUser(req);
    const s = await tx((t) => openShift(t, user, body));
    return { id: s.id, till: s.till, shiftName: s.shiftName, openedAt: s.openedAt, floatCounted: s.floatCounted };
  });

  // The cashier's own open shift, without the expected amount.
  app.get('/m/cash/shifts/current', async (req) => {
    requireMobile(req);
    const s = await prisma.cashShift.findFirst({ where: { cashierId: req.user.sub, status: { in: ['OPEN', 'COUNT_SUBMITTED'] } }, orderBy: { openedAt: 'desc' } });
    if (!s) return null;
    return { id: s.id, outletId: s.outletId, till: s.till, shiftName: s.shiftName, openedAt: s.openedAt, status: s.status, ...(s.status === 'COUNT_SUBMITTED' ? { counted: s.closeCounted, expected: s.expectedCash, variance: s.variance } : {}) };
  });

  app.post<{ Params: { id: string } }>('/m/cash/shifts/:id/close', async (req) => {
    requireMobile(req);
    const body = parse(z.object({ denoms }), req.body);
    const user = await currentUser(req);
    return tx((t) => submitClose(t, user, req.params.id, body.denoms));
  });

  // Duty manager second count; both PINs sign the handover.
  app.get('/m/cash/second-counts', async (req) => {
    requireMobile(req);
    requireRole(req, MANAGERS);
    const rows = await prisma.cashShift.findMany({ where: { outletId: { in: req.user.outletIds }, status: 'COUNT_SUBMITTED', cashierId: { not: req.user.sub } } });
    const people = new Map((await prisma.user.findMany({ where: { id: { in: rows.map((r) => r.cashierId) } } })).map((u) => [u.id, u.shortName]));
    // The manager counts blind too: no expected amount here.
    return rows.map((r) => ({ id: r.id, till: r.till, shiftName: r.shiftName, cashier: people.get(r.cashierId), closedAt: r.closedAt }));
  });

  app.post<{ Params: { id: string } }>('/m/cash/shifts/:id/second-count', async (req) => {
    requireMobile(req);
    requireRole(req, MANAGERS);
    const body = parse(z.object({ denoms, managerPin: z.string().min(4), cashierPin: z.string().min(4) }), req.body);
    const user = await currentUser(req);
    return tx((t) => secondCount(t, user, req.params.id, body));
  });

  // Web: shift history with variances stored against cashier and shift.
  app.get<{ Querystring: { outletId?: string; from?: string; to?: string } }>('/cash/shifts', async (req) => {
    requireRole(req, [...CONTROL_VIEWERS, ...MANAGERS]);
    const rows = await prisma.cashShift.findMany({
      where: { outletId: { in: outletScope(req, req.query.outletId) }, ...(req.query.from || req.query.to ? { businessDate: { gte: req.query.from ?? '0000', lte: req.query.to ?? '9999' } } : {}) },
      include: { drawerOpens: true },
      orderBy: { openedAt: 'desc' },
      take: 200,
    });
    const people = new Map((await prisma.user.findMany({ where: { id: { in: rows.flatMap((r) => [r.cashierId, r.secondCounterId]).filter(Boolean) as string[] } } })).map((u) => [u.id, u.shortName]));
    const outlets = new Map((await prisma.outlet.findMany({ where: { id: { in: req.user.outletIds } } })).map((o) => [o.id, o.name]));
    return rows.map((r) => ({
      id: r.id, outlet: outlets.get(r.outletId), businessDate: r.businessDate, till: r.till, shiftName: r.shiftName,
      cashier: people.get(r.cashierId), secondCounter: r.secondCounterId ? people.get(r.secondCounterId) : null,
      floatExpected: r.floatExpected, floatCounted: r.floatCounted, expected: r.expectedCash, counted: r.secondCounted ?? r.closeCounted,
      variance: r.variance, status: r.status, noSaleOpens: r.drawerOpens.filter((d) => !d.withSale).length, exceptionId: r.exceptionId,
    }));
  });
};
export default routes;

// Ingestion from Digitory POS / KDS / flow meters. Authenticated by X-Api-Key and X-Org-Id.
import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { prisma } from '../db.js';
import { AppError } from '../lib/errors.js';
import { parse, tx, zDate } from '../lib/http.js';
import { assertPeriodOpen } from '../lib/period.js';
import { ingestBill, ingestCashTxn, ingestDrawerOpen, ingestGiveaway, ingestKot, ingestKotDisposition } from '../engine/pos.js';

async function orgFrom(req: FastifyRequest) {
  const key = String(req.headers['x-api-key'] ?? '');
  const expected = process.env.POS_INGEST_KEY ?? '';
  const ok = expected.length > 0 && key.length === expected.length && timingSafeEqual(Buffer.from(key), Buffer.from(expected));
  if (!ok) throw new AppError(401, 'BAD_API_KEY', 'Invalid integration key');
  const orgId = String(req.headers['x-org-id'] ?? '');
  const org = await prisma.org.findUnique({ where: { id: orgId } });
  if (!org) throw new AppError(401, 'BAD_ORG', 'Unknown org');
  return org.id;
}

async function assertOutlet(orgId: string, outletId: string) {
  const o = await prisma.outlet.findFirst({ where: { id: outletId, orgId } });
  if (!o) throw new AppError(404, 'NOT_FOUND', 'Outlet not found');
}

const iso = z.string().datetime({ offset: true });

const routes: FastifyPluginAsync = async (app) => {
  app.post('/integrations/pos/kots', async (req) => {
    const orgId = await orgFrom(req);
    const b = parse(
      z.object({
        outletId: z.string(), kotNo: z.string(), firedAt: iso, tableNo: z.string().optional(), section: z.string().optional(), stewardId: z.string().optional(), station: z.string(),
        items: z.array(z.object({ menuItemId: z.string(), qty: z.number().positive(), amount: z.number().min(0) })).min(1),
      }),
      req.body,
    );
    await assertOutlet(orgId, b.outletId);
    const k = await tx((t) => ingestKot(t, orgId, b));
    return { id: k.id };
  });

  app.post('/integrations/pos/bills', async (req) => {
    const orgId = await orgFrom(req);
    const b = parse(
      z.object({
        outletId: z.string(), billNo: z.string(), openedAt: iso, paidAt: iso.optional(), status: z.enum(['OPEN', 'PAID', 'VOIDED']),
        tableNo: z.string().optional(), section: z.string().optional(), stewardId: z.string().optional(), paymentMode: z.string().optional(), netAmount: z.number(),
        items: z.array(z.object({ menuItemId: z.string(), qty: z.number().positive(), amount: z.number(), kotNo: z.string().optional(), kotLine: z.number().int().min(0).optional() })),
      }),
      req.body,
    );
    await assertOutlet(orgId, b.outletId);
    const bill = await tx((t) => ingestBill(t, orgId, b));
    return { id: bill.id };
  });

  app.post('/integrations/pos/kot-dispositions', async (req) => {
    const orgId = await orgFrom(req);
    const b = parse(
      z.object({ outletId: z.string(), kotNo: z.string(), line: z.number().int().min(0), disposition: z.enum(['VOIDED', 'STAFF_MEAL', 'NC']), reason: z.string().min(1), approverId: z.string().optional() }),
      req.body,
    );
    await assertOutlet(orgId, b.outletId);
    return tx((t) => ingestKotDisposition(t, orgId, b));
  });

  app.post('/integrations/pos/giveaways', async (req) => {
    const orgId = await orgFrom(req);
    const b = parse(
      z.object({
        outletId: z.string(), at: iso, type: z.enum(['DISCOUNT', 'COMP', 'VOID_BEFORE_KOT', 'VOID_AFTER_KOT', 'VOID_AFTER_PAYMENT', 'REFUND']),
        billNo: z.string().optional(), amount: z.number().positive(), reasonCode: z.string().min(1), approverId: z.string(), givenById: z.string().optional(),
        paidMode: z.string().optional(), refundMode: z.string().optional(),
      }),
      req.body,
    );
    await assertOutlet(orgId, b.outletId);
    const g = await tx((t) => ingestGiveaway(t, orgId, b));
    return { id: g.id };
  });

  app.post('/integrations/pos/drawer-opens', async (req) => {
    const orgId = await orgFrom(req);
    const b = parse(z.object({ outletId: z.string(), till: z.string(), at: iso, withSale: z.boolean(), billNo: z.string().optional() }), req.body);
    await assertOutlet(orgId, b.outletId);
    const d = await tx((t) => ingestDrawerOpen(t, b));
    return { id: d.id };
  });

  app.post('/integrations/pos/cash-txns', async (req) => {
    const orgId = await orgFrom(req);
    const b = parse(z.object({ outletId: z.string(), till: z.string(), at: iso, kind: z.enum(['SALE', 'REFUND', 'PAYOUT']), amount: z.number(), ref: z.string().optional() }), req.body);
    await assertOutlet(orgId, b.outletId);
    const c = await tx((t) => ingestCashTxn(t, b));
    return { id: c.id };
  });

  // Brewpub flow meters / tank levels.
  app.post('/integrations/draught-draws', async (req) => {
    const orgId = await orgFrom(req);
    const b = parse(
      z.object({ outletId: z.string(), itemId: z.string(), tankNo: z.string(), businessDate: zDate, drawnMl: z.number().positive(), source: z.enum(['FLOW_METER', 'TANK_LEVEL']), standardYieldPct: z.number().min(50).max(100) }),
      req.body,
    );
    await assertOutlet(orgId, b.outletId);
    await assertPeriodOpen(prisma, orgId, b.businessDate);
    return prisma.draughtDraw.create({ data: b });
  });

  // Store issues to kitchen sections (for recipe variance).
  app.post('/integrations/section-issues', async (req) => {
    const orgId = await orgFrom(req);
    const b = parse(z.object({ outletId: z.string(), section: z.string(), itemId: z.string(), businessDate: zDate, qtyIssued: z.number().min(0), qtyReturned: z.number().min(0).default(0) }), req.body);
    await assertOutlet(orgId, b.outletId);
    await assertPeriodOpen(prisma, orgId, b.businessDate);
    return prisma.sectionIssue.create({ data: b });
  });
};
export default routes;

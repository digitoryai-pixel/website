import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db.js';
import { CONTROL_VIEWERS, outletScope, requireMobile, requireOutlet, requireRole } from '../lib/auth.js';
import { notFound } from '../lib/errors.js';
import { currentUser, parse, tx, zDate } from '../lib/http.js';
import { approvePO, createPO, decideInvoice, enterInvoice, receiveGoods, receiverView, type MatchLine } from '../engine/purchasing.js';

const PAYMENT_LABEL: Record<string, string> = {
  RELEASED: 'Released', PAID: 'Paid', ON_HOLD: 'On hold', NEEDS_APPROVAL: 'Needs approval', BLOCKED: 'Blocked', WAITING_GRN: 'Not due', MATCHED: 'Released',
};

const routes: FastifyPluginAsync = async (app) => {
  // ── Purchase orders (W5 steps 1–2)
  app.get<{ Querystring: { outletId?: string; status?: string } }>('/pos', async (req) => {
    const pos = await prisma.purchaseOrder.findMany({
      where: { outletId: { in: outletScope(req, req.query.outletId) }, ...(req.query.status ? { status: req.query.status as 'APPROVED' } : {}) },
      include: { lines: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    const vendors = new Map((await prisma.vendor.findMany({ where: { orgId: req.user.orgId } })).map((v) => [v.id, v.name]));
    return pos.map((p) => ({ ...p, vendor: vendors.get(p.vendorId), total: p.lines.reduce((s, l) => s + l.qty * l.rate, 0), canApprove: p.status === 'PENDING_APPROVAL' && p.createdById !== req.user.sub }));
  });

  app.post('/pos', async (req) => {
    requireRole(req, [...CONTROL_VIEWERS, 'PURCHASE', 'STORE', 'OUTLET_MANAGER', 'HEAD_CHEF', 'BAR_MANAGER']);
    const body = parse(
      z.object({
        outletId: z.string(), vendorId: z.string(), indentRef: z.string().optional(), expectedAt: z.string().datetime().optional(),
        lines: z.array(z.object({ itemId: z.string(), qty: z.number().positive(), rate: z.number().positive().optional() })).min(1),
      }),
      req.body,
    );
    requireOutlet(req, body.outletId);
    const user = await currentUser(req);
    return tx((t) => createPO(t, user, body));
  });

  app.post<{ Params: { id: string } }>('/pos/:id/approve', async (req) => {
    requireRole(req, [...CONTROL_VIEWERS, 'OUTLET_MANAGER', 'PURCHASE']);
    const body = parse(z.object({ approve: z.boolean().default(true) }), req.body ?? {});
    const user = await currentUser(req);
    return tx((t) => approvePO(t, user, req.params.id, body.approve));
  });

  // ── M9 Receive goods (mobile only, blind)
  app.get('/m/receiving', async (req) => {
    requireMobile(req);
    const pos = await prisma.purchaseOrder.findMany({ where: { outletId: { in: req.user.outletIds }, status: 'APPROVED', createdById: { not: req.user.sub } }, orderBy: { expectedAt: 'asc' } });
    const received = new Set((await prisma.grn.findMany({ where: { poId: { in: pos.map((p) => p.id) } } })).map((g) => g.poId));
    const vendors = new Map((await prisma.vendor.findMany({ where: { orgId: req.user.orgId } })).map((v) => [v.id, v.name]));
    return pos.filter((p) => !received.has(p.id)).map((p) => ({ poId: p.id, poNo: p.poNo, vendor: vendors.get(p.vendorId), expectedAt: p.expectedAt, outletId: p.outletId }));
  });

  app.get<{ Params: { poId: string } }>('/m/receiving/:poId', async (req) => {
    requireMobile(req);
    return receiverView(prisma, await currentUser(req), req.params.poId);
  });

  app.post('/m/grns', async (req) => {
    requireMobile(req);
    const body = parse(
      z.object({
        outletId: z.string(), poId: z.string().optional(), vendorId: z.string(), invoiceNo: z.string().optional(),
        invoicePhotoId: z.string(), goodsPhotoId: z.string(),
        lines: z.array(z.object({ itemId: z.string(), qty: z.number().min(0).optional(), scaleReadings: z.array(z.object({ kg: z.number().min(0) })).optional() })).min(1),
      }),
      req.body,
    );
    requireOutlet(req, body.outletId);
    const user = await currentUser(req);
    return tx((t) => receiveGoods(t, user, body));
  });

  // ── Invoices and S6 three-way match
  app.post('/invoices', async (req) => {
    requireRole(req, [...CONTROL_VIEWERS, 'PURCHASE', 'STORE', 'OUTLET_MANAGER']);
    const body = parse(
      z.object({
        outletId: z.string(), vendorId: z.string(), invoiceNo: z.string().min(1), invoiceDate: zDate, poId: z.string().optional(), grnId: z.string().optional(),
        lines: z.array(z.object({ itemId: z.string(), qty: z.number().positive(), rate: z.number().positive() })).min(1),
      }),
      req.body,
    );
    requireOutlet(req, body.outletId);
    const user = await currentUser(req);
    return tx((t) => enterInvoice(t, user, body));
  });

  app.get<{ Querystring: { outletId?: string; from?: string; to?: string; status?: string } }>('/invoices', async (req) => {
    const q = req.query;
    const rows = await prisma.invoice.findMany({
      where: {
        outletId: { in: outletScope(req, q.outletId) },
        ...(q.from || q.to ? { invoiceDate: { gte: q.from ?? '0000', lte: q.to ?? '9999' } } : {}),
        ...(q.status ? { status: { in: q.status.split(',') as 'ON_HOLD'[] } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    const vendors = new Map((await prisma.vendor.findMany({ where: { orgId: req.user.orgId } })).map((v) => [v.id, v.name]));
    const pos = new Map((await prisma.purchaseOrder.findMany({ where: { id: { in: rows.map((r) => r.poId!).filter(Boolean) } } })).map((p) => [p.id, p.poNo]));
    const grns = new Map((await prisma.grn.findMany({ where: { id: { in: rows.map((r) => r.grnId!).filter(Boolean) } } })).map((g) => [g.id, g.grnNo]));
    const order = ['ON_HOLD', 'NEEDS_APPROVAL', 'BLOCKED', 'WAITING_GRN', 'RELEASED', 'MATCHED', 'PAID'];
    return rows
      .map((r) => ({
        id: r.id, vendor: vendors.get(r.vendorId), invoiceNo: r.invoiceNo, invoiceDate: r.invoiceDate,
        po: r.poId ? pos.get(r.poId) : null, grn: r.grnId ? grns.get(r.grnId) : r.poId ? 'not received' : null,
        amount: r.amount, payable: r.payable, difference: r.difference, check: r.checkResult, status: r.status, payment: PAYMENT_LABEL[r.status],
      }))
      .sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));
  });

  app.get<{ Params: { id: string } }>('/invoices/:id', async (req) => {
    const inv = await prisma.invoice.findFirst({ where: { id: req.params.id, outletId: { in: req.user.outletIds } }, include: { lines: true, debitNotes: true } });
    if (!inv) throw notFound('Invoice');
    const vendor = await prisma.vendor.findUniqueOrThrow({ where: { id: inv.vendorId } });
    const po = inv.poId ? await prisma.purchaseOrder.findUnique({ where: { id: inv.poId } }) : null;
    const grn = inv.grnId ? await prisma.grn.findUnique({ where: { id: inv.grnId }, include: { lines: true } }) : null;
    const people = new Map((await prisma.user.findMany({ where: { id: { in: [po?.createdById, po?.approvedById, grn?.receivedById, inv.enteredById, inv.decidedById].filter(Boolean) as string[] } } })).map((u) => [u.id, u.shortName]));
    const evidence = grn ? await prisma.attachment.findMany({ where: { entityType: 'grn', entityId: grn.id } }) : [];
    const involved = [po?.createdById, grn?.receivedById, inv.enteredById];
    return {
      ...inv,
      vendor: vendor.name,
      poNo: po?.poNo ?? null,
      grnNo: grn?.grnNo ?? null,
      trail: {
        poBy: po ? people.get(po.createdById) : null,
        approvedBy: po?.approvedById ? people.get(po.approvedById) : null,
        receivedBy: grn ? people.get(grn.receivedById) : null,
        weighed: grn ? grn.lines.every((l) => l.weighed || !l.typedFlag) : false,
        decidedBy: inv.decidedById ? people.get(inv.decidedById) : null,
      },
      lines: (inv.matchLines as MatchLine[] | null) ?? [],
      evidence,
      can: { decide: !involved.includes(req.user.sub) && ['ON_HOLD', 'NEEDS_APPROVAL'].includes(inv.status) },
    };
  });

  app.post<{ Params: { id: string } }>('/invoices/:id/decide', async (req) => {
    requireRole(req, [...CONTROL_VIEWERS, 'OUTLET_MANAGER', 'PURCHASE']);
    const body = parse(z.object({ action: z.enum(['ACCEPT_DIFFERENCE', 'DEBIT_NOTE', 'APPROVE_NO_PO', 'MARK_PAID']), reasonCode: z.string().optional(), note: z.string().optional() }), req.body);
    const user = await currentUser(req);
    return tx((t) => decideInvoice(t, user, req.params.id, body));
  });
};
export default routes;

// W5: receiving and three-way match. No vendor is paid until PO, GRN and invoice agree,
// or a named approver accepts the difference.
import type { Invoice, User } from '@prisma/client';
import type { Tx } from '../db.js';
import { getControls } from '../lib/controls.js';
import { badRequest, conflict, forbidden, notFound } from '../lib/errors.js';
import { inr } from '../lib/format.js';
import { assertPeriodOpen } from '../lib/period.js';
import { businessDate as bizDate, round2 } from '../lib/time.js';
import { audit } from '../lib/audit.js';
import { raiseException } from './exceptions.js';
import { postMovement } from './stock.js';

const nextNo = async (tx: Tx, prefix: 'PO' | 'GRN' | 'DN') => {
  const n = prefix === 'PO' ? await tx.purchaseOrder.count() : prefix === 'GRN' ? await tx.grn.count() : await tx.debitNote.count();
  return `${prefix}-${String(n + 1).padStart(4, '0')}`;
};

export async function createPO(
  tx: Tx,
  user: User,
  a: { outletId: string; vendorId: string; indentRef?: string; expectedAt?: string; lines: { itemId: string; qty: number; rate?: number }[] },
) {
  if (!a.lines.length) throw badRequest('NO_LINES', 'Add at least one item');
  const vendor = await tx.vendor.findFirst({ where: { id: a.vendorId, orgId: user.orgId }, include: { rates: true } });
  if (!vendor) throw notFound('Vendor');
  const lines = [];
  for (const l of a.lines) {
    const item = await tx.item.findFirst({ where: { id: l.itemId, orgId: user.orgId } });
    if (!item) throw notFound('Item');
    const contract = vendor.rates.filter((r) => r.itemId === l.itemId).sort((x, y) => +y.validFrom - +x.validFrom)[0];
    lines.push({ itemId: l.itemId, qty: l.qty, rate: l.rate ?? contract?.rate ?? item.standardCost });
  }
  return tx.purchaseOrder.create({
    data: {
      outletId: a.outletId, vendorId: a.vendorId, poNo: await nextNo(tx, 'PO'), indentRef: a.indentRef, createdById: user.id,
      expectedAt: a.expectedAt ? new Date(a.expectedAt) : null, lines: { create: lines },
    },
    include: { lines: true },
  });
}

export async function approvePO(tx: Tx, user: User, poId: string, approve: boolean, now = new Date()) {
  const po = await tx.purchaseOrder.findUnique({ where: { id: poId } });
  if (!po) throw notFound('PO');
  if (po.createdById === user.id) throw forbidden('SELF_APPROVAL', "PO creator can't approve the PO");
  if (po.status !== 'PENDING_APPROVAL') throw conflict('NOT_PENDING', 'This PO is not waiting for approval');
  const updated = await tx.purchaseOrder.update({
    where: { id: poId },
    data: { status: approve ? 'APPROVED' : 'REJECTED', approvedById: user.id, approvedAt: now },
  });
  await audit(tx, { orgId: user.orgId, actorId: user.id, action: approve ? 'po.approve' : 'po.reject', entity: 'po', entityId: poId });
  return updated;
}

/** What the receiver sees at the door. Ordered quantity is hidden when blind receiving is on. */
export async function receiverView(tx: Tx, user: User, poId: string) {
  const po = await tx.purchaseOrder.findUnique({ where: { id: poId }, include: { lines: true } });
  if (!po) throw notFound('PO');
  const controls = await getControls(tx, user.orgId, po.outletId);
  const items = await tx.item.findMany({ where: { id: { in: po.lines.map((l) => l.itemId) } } });
  const vendor = await tx.vendor.findUniqueOrThrow({ where: { id: po.vendorId } });
  const blind = controls.settings.blindReceiving;
  return {
    poId: po.id,
    poNo: po.poNo,
    outletId: po.outletId,
    vendorId: po.vendorId,
    vendor: vendor.name,
    blind,
    lines: po.lines.map((l) => {
      const it = items.find((i) => i.id === l.itemId)!;
      return { itemId: it.id, name: it.name, baseUnit: it.baseUnit, weighOnScale: it.countMode === 'WEIGHT', ...(blind ? {} : { orderedQty: l.qty }) };
    }),
  };
}

/** M9: the GRN is created at the door with weights and photos. */
export async function receiveGoods(
  tx: Tx,
  user: User,
  a: {
    outletId: string;
    poId?: string;
    vendorId: string;
    invoiceNo?: string;
    lines: { itemId: string; qty?: number; scaleReadings?: { kg: number }[] }[];
    invoicePhotoId?: string;
    goodsPhotoId?: string;
  },
  now = new Date(),
) {
  const bd = bizDate(now);
  await assertPeriodOpen(tx, user.orgId, bd);
  const controls = await getControls(tx, user.orgId, a.outletId);
  if (a.poId) {
    const po = await tx.purchaseOrder.findUnique({ where: { id: a.poId } });
    if (!po) throw notFound('PO');
    if (po.status !== 'APPROVED') throw conflict('PO_NOT_APPROVED', 'Goods can only be received against an approved PO');
    if (po.createdById === user.id) throw forbidden('SELF_RECEIVE', 'The PO creator cannot receive against their own PO');
  }
  if (!a.invoicePhotoId || !a.goodsPhotoId) throw badRequest('PHOTO_REQUIRED', 'Invoice photo and goods photo are required');

  const grnLines = [];
  for (const l of a.lines) {
    const item = await tx.item.findFirst({ where: { id: l.itemId, orgId: user.orgId } });
    if (!item) throw notFound('Item');
    const weighed = !!l.scaleReadings?.length;
    const qty = weighed ? l.scaleReadings!.reduce((s, r) => s + r.kg, 0) : l.qty;
    if (qty === undefined || qty < 0) throw badRequest('QTY_REQUIRED', `Enter what arrived for ${item.name}`);
    // Weight-based items are weighed on the scale at the door; typed weights are flagged.
    grnLines.push({ item, qty: round2(qty), weighed, typedFlag: item.countMode === 'WEIGHT' && !weighed });
  }

  let duplicateWarning: string | null = null;
  if (a.invoiceNo) {
    const dup = await tx.invoice.findFirst({ where: { vendorId: a.vendorId, invoiceNo: a.invoiceNo, status: { not: 'BLOCKED' } } });
    if (dup) duplicateWarning = `Invoice ${a.invoiceNo} was already entered for this vendor. Payment will be blocked.`;
  }

  const grn = await tx.grn.create({
    data: {
      outletId: a.outletId, vendorId: a.vendorId, poId: a.poId, grnNo: await nextNo(tx, 'GRN'), receivedById: user.id,
      receivedAt: now, businessDate: bd, blind: controls.settings.blindReceiving, invoiceNo: a.invoiceNo,
      lines: { create: grnLines.map((g) => ({ itemId: g.item.id, qty: g.qty, weighed: g.weighed, typedFlag: g.typedFlag })) },
    },
  });
  await tx.attachment.updateMany({ where: { id: { in: [a.invoicePhotoId, a.goodsPhotoId] }, orgId: user.orgId }, data: { entityType: 'grn', entityId: grn.id } });

  const poLines = a.poId ? await tx.poLine.findMany({ where: { poId: a.poId } }) : [];
  for (const g of grnLines) {
    const rate = poLines.find((p) => p.itemId === g.item.id)?.rate ?? g.item.standardCost;
    await postMovement(tx, {
      outletId: a.outletId, item: g.item, type: 'GRN', qty: g.qty, at: now, businessDate: bd,
      refType: 'grn', refId: grn.id, createdById: user.id, unitCost: rate,
    });
  }

  // An invoice that was waiting for this GRN can now be matched.
  if (a.poId) {
    const waiting = await tx.invoice.findMany({ where: { poId: a.poId, status: 'WAITING_GRN' } });
    for (const inv of waiting) {
      await tx.invoice.update({ where: { id: inv.id }, data: { grnId: grn.id } });
      await runMatch(tx, user.orgId, inv.id, now);
    }
  }
  return { grnId: grn.id, grnNo: grn.grnNo, lines: grnLines.length, duplicateWarning };
}

export async function enterInvoice(
  tx: Tx,
  user: User,
  a: { outletId: string; vendorId: string; invoiceNo: string; invoiceDate: string; poId?: string; grnId?: string; lines: { itemId: string; qty: number; rate: number }[] },
  now = new Date(),
) {
  if (!a.lines.length) throw badRequest('NO_LINES', 'Enter the invoice lines');
  await assertPeriodOpen(tx, user.orgId, a.invoiceDate);
  const amount = round2(a.lines.reduce((s, l) => s + l.qty * l.rate, 0));
  let grnId = a.grnId;
  if (!grnId && a.poId) grnId = (await tx.grn.findFirst({ where: { poId: a.poId }, orderBy: { receivedAt: 'desc' } }))?.id;

  // Duplicate vendor + invoice number is blocked outright.
  const dup = await tx.invoice.findFirst({ where: { vendorId: a.vendorId, invoiceNo: a.invoiceNo, status: { not: 'BLOCKED' } } });
  const inv = await tx.invoice.create({
    data: {
      outletId: a.outletId, vendorId: a.vendorId, invoiceNo: a.invoiceNo, invoiceDate: a.invoiceDate, poId: a.poId, grnId,
      amount, enteredById: user.id, status: dup ? 'BLOCKED' : 'WAITING_GRN', checkResult: dup ? 'Duplicate invoice number' : null,
      duplicateOfId: dup?.id, lines: { create: a.lines },
    },
  });
  if (dup) {
    const vendor = await tx.vendor.findUniqueOrThrow({ where: { id: a.vendorId } });
    await raiseException(tx, {
      orgId: user.orgId, outletId: a.outletId, type: 'DUPLICATE_INVOICE', severity: 'ATTENTION',
      title: `Duplicate invoice ${a.invoiceNo} from ${vendor.name}`,
      summary: `Already entered on ${dup.invoiceDate} for ${inr(dup.amount)}. Payment blocked.`,
      impact: amount, businessDate: a.invoiceDate, groupKey: `DUPINV:${a.vendorId}:${a.invoiceNo}`,
      involvedUserIds: [user.id], sourceRefs: [{ type: 'invoice', id: inv.id, label: a.invoiceNo }], now,
    });
    return tx.invoice.findUniqueOrThrow({ where: { id: inv.id } });
  }
  return runMatch(tx, user.orgId, inv.id, now);
}

export type MatchLine = {
  itemId: string; item: string; unit: string;
  poQty: number | null; poRate: number | null; received: number;
  invQty: number; invRate: number; invoiced: number; payable: number; difference: number;
  contractRate: number | null; lastRate: number | null; rateFlag: boolean;
};

export async function runMatch(tx: Tx, orgId: string, invoiceId: string, now = new Date()): Promise<Invoice> {
  const inv = await tx.invoice.findUniqueOrThrow({ where: { id: invoiceId }, include: { lines: true } });
  const vendor = await tx.vendor.findUniqueOrThrow({ where: { id: inv.vendorId }, include: { rates: true } });
  const controls = await getControls(tx, orgId, inv.outletId);

  if (!inv.poId) {
    // Invoices without a PO need an approver who didn't make the purchase.
    const updated = await tx.invoice.update({ where: { id: inv.id }, data: { status: 'NEEDS_APPROVAL', checkResult: 'No PO', payable: inv.amount, difference: 0 } });
    const grn = inv.grnId ? await tx.grn.findUnique({ where: { id: inv.grnId } }) : null;
    const ex = await raiseException(tx, {
      orgId, outletId: inv.outletId, type: 'NO_PO_INVOICE', severity: 'ATTENTION',
      title: `Invoice ${inv.invoiceNo} from ${vendor.name} has no PO`,
      summary: `${inr(inv.amount)}. Needs an approver who didn't make the purchase.`,
      impact: inv.amount, businessDate: inv.invoiceDate, groupKey: `NOPO:${inv.id}`,
      involvedUserIds: [inv.enteredById, grn?.receivedById].filter(Boolean) as string[],
      sourceRefs: [{ type: 'invoice', id: inv.id, label: inv.invoiceNo }], now,
    });
    return tx.invoice.update({ where: { id: updated.id }, data: { exceptionId: ex.id } });
  }
  if (!inv.grnId) return tx.invoice.update({ where: { id: inv.id }, data: { status: 'WAITING_GRN', checkResult: 'Waiting for GRN' } });

  const po = await tx.purchaseOrder.findUniqueOrThrow({ where: { id: inv.poId }, include: { lines: true } });
  const grn = await tx.grn.findUniqueOrThrow({ where: { id: inv.grnId }, include: { lines: true } });
  const items = new Map((await tx.item.findMany({ where: { id: { in: inv.lines.map((l) => l.itemId) } } })).map((i) => [i.id, i]));

  const lines: MatchLine[] = [];
  for (const il of inv.lines) {
    const pl = po.lines.find((p) => p.itemId === il.itemId);
    const received = grn.lines.filter((g) => g.itemId === il.itemId).reduce((s, g) => s + g.qty, 0);
    const invoiced = round2(il.qty * il.rate);
    // Payable is the lower of received and ordered, at the PO rate. Never the invoice number by default.
    const payable = pl ? round2(Math.min(received, pl.qty) * pl.rate) : 0;
    const contract = vendor.rates.filter((r) => r.itemId === il.itemId).sort((x, y) => +y.validFrom - +x.validFrom)[0]?.rate ?? null;
    const last = await tx.invoiceLine.findFirst({
      where: { itemId: il.itemId, invoice: { vendorId: inv.vendorId, id: { not: inv.id }, status: { in: ['RELEASED', 'PAID', 'MATCHED'] } } },
      orderBy: { invoice: { createdAt: 'desc' } },
    });
    const ref = pl?.rate ?? contract ?? last?.rate ?? il.rate;
    const rateFlag = il.rate > ref * (1 + controls.settings.rateTolerancePct / 100);
    lines.push({
      itemId: il.itemId, item: items.get(il.itemId)?.name ?? il.itemId, unit: items.get(il.itemId)?.baseUnit ?? '',
      poQty: pl?.qty ?? null, poRate: pl?.rate ?? null, received, invQty: il.qty, invRate: il.rate,
      invoiced, payable, difference: round2(invoiced - payable), contractRate: contract, lastRate: last?.rate ?? null, rateFlag,
    });
  }
  const payable = round2(lines.reduce((s, l) => s + l.payable, 0));
  const difference = round2(inv.amount - payable);
  const qtyDiff = lines.some((l) => Math.abs(l.invQty - l.received) > 0.001 || (l.poQty !== null && l.received - l.poQty > 0.001));
  const rateDiff = lines.some((l) => l.poRate !== null && Math.abs(l.invRate - l.poRate) > 0.001);
  const matched = Math.abs(difference) < 1 && !qtyDiff && !rateDiff;
  const check = matched ? 'Matched' : qtyDiff && rateDiff ? 'Qty and rate differ' : qtyDiff ? 'Qty differs' : 'Rate differs';

  const updated = await tx.invoice.update({
    where: { id: inv.id },
    data: { status: matched ? 'RELEASED' : 'ON_HOLD', checkResult: check, payable, difference, matchLines: lines },
  });
  if (matched) return updated;

  const people = [po.createdById, po.approvedById, grn.receivedById].filter(Boolean) as string[];
  const purchaser = await tx.user.findUnique({ where: { id: po.createdById } });
  const flagged = lines.filter((l) => l.rateFlag).sort((x, y) => y.invQty * (y.invRate - (y.poRate ?? 0)) - x.invQty * (x.invRate - (x.poRate ?? 0)))[0];
  let exId: string;
  if (flagged) {
    // Rate above last purchase or contract beyond tolerance is flagged before payment.
    const base = flagged.poRate ?? flagged.contractRate ?? flagged.lastRate ?? flagged.invRate;
    const pct = Math.round(((flagged.invRate - base) / base) * 100);
    const monthlyQty = await monthlyVolume(tx, inv.outletId, inv.vendorId, flagged.itemId, now);
    const ex = await raiseException(tx, {
      orgId, outletId: inv.outletId, type: 'RATE_VARIANCE', severity: 'ATTENTION',
      title: `${flagged.item} rate up ${pct}% at ${vendor.name}`,
      summary: `₹${base} → ₹${flagged.invRate}/${flagged.unit.toLowerCase()}. Invoice ${inv.invoiceNo} on hold; ${inr((flagged.invRate - base) * monthlyQty)} a month at current volume.`,
      impact: round2((flagged.invRate - base) * monthlyQty),
      businessDate: inv.invoiceDate, groupKey: `RATE:${inv.vendorId}:${flagged.itemId}`,
      assigneeId: purchaser?.role === 'PURCHASE' ? purchaser.id : undefined,
      detail: { invoiceId: inv.id, lines },
      suggestedChecks: ['Confirm rate with the contract on file', 'Ask the vendor for a credit note', 'Get a quote from a second vendor'],
      sourceRefs: [{ type: 'invoice', id: inv.id, label: `Invoice ${inv.invoiceNo}` }], now,
    });
    exId = ex.id;
  } else {
    const ex = await raiseException(tx, {
      orgId, outletId: inv.outletId, type: 'THREE_WAY_MISMATCH', severity: 'ATTENTION',
      title: `Invoice ${inv.invoiceNo} from ${vendor.name} doesn't match: ${check.toLowerCase()}`,
      summary: `Invoiced ${inr(inv.amount)}, payable ${inr(payable)}. Difference ${inr(difference)}.`,
      impact: Math.abs(difference), businessDate: inv.invoiceDate, groupKey: `3WAY:${inv.id}`,
      involvedUserIds: people.filter((p) => p !== purchaser?.id),
      detail: { invoiceId: inv.id, lines }, sourceRefs: [{ type: 'invoice', id: inv.id, label: `Invoice ${inv.invoiceNo}` }], now,
    });
    exId = ex.id;
  }
  return tx.invoice.update({ where: { id: inv.id }, data: { exceptionId: exId } });
}

/** What this outlet received of the item from this vendor in the last 30 days. */
async function monthlyVolume(tx: Tx, outletId: string, vendorId: string, itemId: string, now: Date) {
  const since = new Date(now.getTime() - 30 * 86_400_000);
  const r = await tx.grnLine.aggregate({ _sum: { qty: true }, where: { itemId, grn: { outletId, vendorId, receivedAt: { gte: since, lte: now } } } });
  return r._sum.qty ?? 0;
}

/** S6 actions. Every decision is logged against the approver with a reason. */
export async function decideInvoice(
  tx: Tx,
  user: User,
  invoiceId: string,
  body: { action: 'ACCEPT_DIFFERENCE' | 'DEBIT_NOTE' | 'APPROVE_NO_PO' | 'MARK_PAID'; reasonCode?: string; note?: string },
  now = new Date(),
) {
  const inv = await tx.invoice.findUnique({ where: { id: invoiceId } });
  if (!inv) throw notFound('Invoice');
  const po = inv.poId ? await tx.purchaseOrder.findUnique({ where: { id: inv.poId } }) : null;
  const grn = inv.grnId ? await tx.grn.findUnique({ where: { id: inv.grnId } }) : null;
  const involved = [po?.createdById, grn?.receivedById, inv.enteredById].filter(Boolean);
  if (body.action !== 'MARK_PAID' && involved.includes(user.id)) {
    throw forbidden('SELF_APPROVAL', 'You created, received or entered this purchase, so someone else must decide');
  }

  let data: Parameters<typeof tx.invoice.update>[0]['data'];
  switch (body.action) {
    case 'ACCEPT_DIFFERENCE': {
      if (inv.status !== 'ON_HOLD') throw conflict('NOT_ON_HOLD', 'Only invoices on hold can be accepted');
      const rc = body.reasonCode && (await tx.reasonCode.findFirst({ where: { orgId: user.orgId, domain: 'INVOICE_ACCEPT', code: body.reasonCode } }));
      if (!rc) throw badRequest('REASON_REQUIRED', 'Accepting a difference needs a reason code');
      data = { status: 'RELEASED', payable: inv.amount, decidedById: user.id, decisionReason: body.reasonCode, decidedAt: now };
      break;
    }
    case 'DEBIT_NOTE': {
      if (inv.status !== 'ON_HOLD') throw conflict('NOT_ON_HOLD', 'Only invoices on hold can get a debit note');
      await tx.debitNote.create({
        data: { invoiceId, number: await nextNo(tx, 'DN'), amount: inv.difference ?? 0, reason: body.note ?? inv.checkResult ?? 'Three-way mismatch', createdById: user.id },
      });
      data = { status: 'RELEASED', decidedById: user.id, decisionReason: 'DEBIT_NOTE', decidedAt: now };
      break;
    }
    case 'APPROVE_NO_PO': {
      if (inv.status !== 'NEEDS_APPROVAL') throw conflict('NOT_NEEDS_APPROVAL', 'This invoice does not need approval');
      if (!body.reasonCode) throw badRequest('REASON_REQUIRED', 'Approving an invoice without a PO needs a reason code');
      data = { status: 'RELEASED', decidedById: user.id, decisionReason: body.reasonCode, decidedAt: now };
      break;
    }
    case 'MARK_PAID': {
      if (inv.status !== 'RELEASED') throw conflict('NOT_RELEASED', 'Only released invoices can be paid');
      data = { status: 'PAID' };
      break;
    }
  }
  const updated = await tx.invoice.update({ where: { id: invoiceId }, data });
  if (inv.exceptionId && body.action !== 'MARK_PAID') {
    const ex = await tx.exception.findUnique({ where: { id: inv.exceptionId } });
    if (ex && ex.status !== 'RESOLVED') {
      await tx.exception.update({ where: { id: ex.id }, data: { status: 'RESOLVED', closedAt: now, closedById: user.id, closeReasonCode: body.reasonCode ?? body.action, closeNote: body.note } });
      await tx.exceptionEvent.create({ data: { exceptionId: ex.id, at: now, actorId: user.id, kind: 'CLOSED', payload: { via: 'S6', action: body.action } } });
    }
  }
  await audit(tx, { orgId: user.orgId, actorId: user.id, action: `invoice.${body.action.toLowerCase()}`, entity: 'invoice', entityId: invoiceId, before: { status: inv.status }, after: { status: updated.status, reason: body.reasonCode } });
  return updated;
}

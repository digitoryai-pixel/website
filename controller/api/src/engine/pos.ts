// Ingestion from Digitory POS and KDS. Because Digitory runs both, every KOT item can be
// traced to a bill, a void, a staff meal or an approved NC (W6).
import type { GiveawayType, KotDisposition, MovementType } from '@prisma/client';
import type { Tx } from '../db.js';
import { badRequest, notFound } from '../lib/errors.js';
import { assertPeriodOpen } from '../lib/period.js';
import { businessDate as bizDate } from '../lib/time.js';
import { postMovement } from './stock.js';

export async function recipeUsage(tx: Tx, menuItemId: string, qty: number) {
  const recipe = await tx.recipe.findFirst({ where: { menuItemId, active: true }, include: { lines: true }, orderBy: { version: 'desc' } });
  return (recipe?.lines ?? []).map((l) => ({ itemId: l.itemId, qty: l.qty * qty }));
}

async function consume(tx: Tx, outletId: string, menuItemId: string, qty: number, at: Date, type: MovementType, refType: string, refId: string, approvedById?: string | null) {
  for (const u of await recipeUsage(tx, menuItemId, qty)) {
    const item = await tx.item.findUniqueOrThrow({ where: { id: u.itemId } });
    await postMovement(tx, { outletId, item, type, qty: -u.qty, at, businessDate: bizDate(at), refType, refId, approvedById });
  }
}

export type KotIn = {
  outletId: string;
  kotNo: string;
  firedAt: string;
  tableNo?: string;
  section?: string;
  stewardId?: string;
  station: string;
  items: { menuItemId: string; qty: number; amount: number }[];
};

export async function ingestKot(tx: Tx, orgId: string, k: KotIn) {
  const firedAt = new Date(k.firedAt);
  await assertPeriodOpen(tx, orgId, bizDate(firedAt));
  const existing = await tx.kot.findUnique({ where: { outletId_kotNo: { outletId: k.outletId, kotNo: k.kotNo } } });
  if (existing) return existing; // idempotent
  return tx.kot.create({
    data: {
      outletId: k.outletId, kotNo: k.kotNo, businessDate: bizDate(firedAt), firedAt, tableNo: k.tableNo, section: k.section,
      stewardId: k.stewardId, station: k.station, items: { create: k.items },
    },
    include: { items: true },
  });
}

export type BillIn = {
  outletId: string;
  billNo: string;
  openedAt: string;
  paidAt?: string;
  status: 'OPEN' | 'PAID' | 'VOIDED';
  tableNo?: string;
  section?: string;
  stewardId?: string;
  paymentMode?: string;
  netAmount: number;
  items: { menuItemId: string; qty: number; amount: number; kotNo?: string; kotLine?: number }[];
};

export async function ingestBill(tx: Tx, orgId: string, b: BillIn) {
  const openedAt = new Date(b.openedAt);
  const bd = bizDate(openedAt);
  await assertPeriodOpen(tx, orgId, bd);
  const prev = await tx.bill.findUnique({ where: { outletId_billNo: { outletId: b.outletId, billNo: b.billNo } }, include: { items: true } });
  if (prev?.status === 'PAID') return prev; // a paid bill is final; voids arrive as giveaways
  if (prev) {
    await tx.billItem.deleteMany({ where: { billId: prev.id } });
    await tx.bill.delete({ where: { id: prev.id } });
  }
  const items = [];
  for (const it of b.items) {
    let kotItemId: string | undefined;
    if (it.kotNo) {
      const kot = await tx.kot.findUnique({ where: { outletId_kotNo: { outletId: b.outletId, kotNo: it.kotNo } }, include: { items: true } });
      if (!kot) throw notFound(`KOT ${it.kotNo}`);
      kotItemId = kot.items.find((ki, i) => (it.kotLine !== undefined ? i === it.kotLine : ki.menuItemId === it.menuItemId))?.id;
    }
    items.push({ menuItemId: it.menuItemId, qty: it.qty, amount: it.amount, kotItemId });
  }
  const bill = await tx.bill.create({
    data: {
      outletId: b.outletId, billNo: b.billNo, businessDate: bd, tableNo: b.tableNo, section: b.section, stewardId: b.stewardId,
      openedAt, paidAt: b.paidAt ? new Date(b.paidAt) : null, status: b.status, netAmount: b.netAmount, paymentMode: b.paymentMode,
      items: { create: items },
    },
    include: { items: true },
  });
  if (b.status === 'PAID') {
    for (const it of bill.items) await consume(tx, b.outletId, it.menuItemId, it.qty, bill.paidAt ?? openedAt, 'SALE', 'bill', bill.id);
  }
  return bill;
}

/** A KOT item that ends as a void, staff meal or NC. NC and staff meals need a reason and approver, like comps. */
export async function ingestKotDisposition(
  tx: Tx,
  orgId: string,
  d: { outletId: string; kotNo: string; line: number; disposition: Exclude<KotDisposition, 'PENDING' | 'BILLED' | 'UNACCOUNTED'>; reason: string; approverId?: string },
) {
  const kot = await tx.kot.findUnique({ where: { outletId_kotNo: { outletId: d.outletId, kotNo: d.kotNo } }, include: { items: true } });
  if (!kot) throw notFound(`KOT ${d.kotNo}`);
  const ki = kot.items[d.line];
  if (!ki) throw notFound('KOT line');
  if ((d.disposition === 'NC' || d.disposition === 'STAFF_MEAL') && !d.approverId) {
    throw badRequest('APPROVER_REQUIRED', 'NC and staff meals need an approver');
  }
  await tx.kotItem.update({
    where: { id: ki.id },
    data: { disposition: d.disposition, voidReason: d.disposition === 'VOIDED' ? d.reason : null, ncReasonCode: d.disposition !== 'VOIDED' ? d.reason : null, ncApproverId: d.approverId },
  });
  if (d.disposition !== 'VOIDED') {
    await consume(tx, d.outletId, ki.menuItemId, ki.qty, kot.firedAt, d.disposition === 'STAFF_MEAL' ? 'STAFF_MEAL' : 'COMP', 'kotItem', ki.id, d.approverId);
  }
  return { ok: true };
}

export async function ingestGiveaway(
  tx: Tx,
  orgId: string,
  g: { outletId: string; at: string; type: GiveawayType; billNo?: string; amount: number; reasonCode: string; approverId: string; givenById?: string; paidMode?: string; refundMode?: string },
) {
  const at = new Date(g.at);
  await assertPeriodOpen(tx, orgId, bizDate(at));
  // A refund without an original bill can't be processed on POS at all.
  let billId: string | undefined;
  if (g.billNo) billId = (await tx.bill.findUnique({ where: { outletId_billNo: { outletId: g.outletId, billNo: g.billNo } } }))?.id;
  if (g.type === 'REFUND' && !billId) throw badRequest('REFUND_NEEDS_BILL', 'A refund must reference the original bill');
  if (!g.reasonCode || !g.approverId) throw badRequest('REASON_APPROVER', 'Every discount, comp, void and refund needs a reason code and approver');
  if (g.type === 'VOID_AFTER_PAYMENT' && billId) await tx.bill.update({ where: { id: billId }, data: { status: 'VOIDED' } });
  return tx.giveaway.create({ data: { ...g, at, billId, businessDate: bizDate(at) } });
}

export async function ingestDrawerOpen(tx: Tx, d: { outletId: string; till: string; at: string; withSale: boolean; billNo?: string }) {
  const shift = await tx.cashShift.findFirst({ where: { outletId: d.outletId, till: d.till, status: 'OPEN' } });
  if (!shift) throw notFound(`Open shift on till ${d.till}`);
  return tx.drawerOpen.create({ data: { shiftId: shift.id, at: new Date(d.at), withSale: d.withSale, billNo: d.billNo } });
}

export async function ingestCashTxn(tx: Tx, d: { outletId: string; till: string; at: string; kind: 'SALE' | 'REFUND' | 'PAYOUT'; amount: number; ref?: string }) {
  const shift = await tx.cashShift.findFirst({ where: { outletId: d.outletId, till: d.till, status: 'OPEN' } });
  if (!shift) throw notFound(`Open shift on till ${d.till}`);
  const signed = d.kind === 'SALE' ? Math.abs(d.amount) : -Math.abs(d.amount);
  return tx.cashTxn.create({ data: { shiftId: shift.id, kind: d.kind, amount: signed, at: new Date(d.at), ref: d.ref } });
}

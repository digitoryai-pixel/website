// W7: wastage and transfers. Anything that leaves stock without a sale is logged when it happens.
import type { User } from '@prisma/client';
import type { Tx } from '../db.js';
import { getControls, limitFor } from '../lib/controls.js';
import { badRequest, conflict, forbidden, notFound } from '../lib/errors.js';
import { inr, qty as fmtQty } from '../lib/format.js';
import { notify } from '../lib/notify.js';
import { assertPeriodOpen } from '../lib/period.js';
import { owner, usersWithRole } from '../lib/people.js';
import { businessDate as bizDate, hours, round2 } from '../lib/time.js';
import { raiseException } from './exceptions.js';
import { postMovement } from './stock.js';

export async function logWastage(
  tx: Tx,
  user: User,
  a: {
    outletId: string;
    itemId: string;
    locationId?: string;
    section?: string;
    scaleReadings?: { kg: number }[];
    typedQty?: number;
    reasonCode: string;
    photoIds?: string[];
    isBreakage?: boolean;
  },
  now = new Date(),
) {
  const bd = bizDate(now);
  await assertPeriodOpen(tx, user.orgId, bd);
  const item = await tx.item.findFirst({ where: { id: a.itemId, orgId: user.orgId } });
  if (!item) throw notFound('Item');
  const rc = await tx.reasonCode.findFirst({ where: { orgId: user.orgId, domain: 'WASTAGE', code: a.reasonCode } });
  if (!rc) throw badRequest('REASON_REQUIRED', 'Pick a wastage reason');
  const weighed = !!a.scaleReadings?.length;
  const q = weighed ? a.scaleReadings!.reduce((s, r) => s + r.kg, 0) : a.typedQty;
  if (!q || q <= 0) throw badRequest('QTY_REQUIRED', 'Weigh or enter the quantity wasted');
  const value = round2(q * item.standardCost);
  const controls = await getControls(tx, user.orgId, a.outletId);
  if (value > controls.settings.wastagePhotoAbove && !a.photoIds?.length) {
    throw badRequest('PHOTO_REQUIRED', `Photo required above ${inr(controls.settings.wastagePhotoAbove)}`);
  }

  // Route to the lowest manager whose limit covers it; the person logging can never approve.
  const managers = (await usersWithRole(tx, user.orgId, ['HEAD_CHEF', 'BAR_MANAGER', 'DUTY_MANAGER', 'OUTLET_MANAGER'], a.outletId)).filter((m) => m.id !== user.id);
  const order = ['HEAD_CHEF', 'BAR_MANAGER', 'DUTY_MANAGER', 'OUTLET_MANAGER'];
  managers.sort((x, y) => order.indexOf(x.role) - order.indexOf(y.role));
  const preferKitchen = item.category !== 'SPIRITS_WINE' && item.category !== 'DRAUGHT_BEER' && item.category !== 'BOTTLED_BEER';
  const candidates = managers.filter((m) => (preferKitchen ? m.role !== 'BAR_MANAGER' : m.role !== 'HEAD_CHEF'));
  const approver = candidates.find((m) => limitFor(controls, m.role, 'wastage') >= value) ?? (await owner(tx, user.orgId))!;

  const entry = await tx.wastageEntry.create({
    data: {
      outletId: a.outletId, locationId: a.locationId, section: a.section, itemId: item.id, qty: round2(q), value,
      reasonCode: a.reasonCode, isBreakage: !!a.isBreakage, entryMethod: weighed ? 'SCALE' : 'TYPED',
      loggedById: user.id, loggedAt: now, businessDate: bd, routedToId: approver.id,
    },
  });
  if (a.photoIds?.length) {
    await tx.attachment.updateMany({ where: { id: { in: a.photoIds }, orgId: user.orgId }, data: { entityType: 'wastage', entityId: entry.id } });
  }
  await notify(tx, {
    userId: approver.id, channels: ['PUSH', 'IN_APP'], kind: 'DECISION',
    title: `Approve wastage: ${item.name}`,
    body: `${user.shortName} logged ${fmtQty(q, item.baseUnit)} (${inr(value)}), ${rc.label}.`,
  });
  return { ...entry, routedTo: approver.shortName };
}

export async function decideWastage(tx: Tx, user: User, id: string, approve: boolean, note?: string, now = new Date()) {
  const w = await tx.wastageEntry.findUnique({ where: { id } });
  if (!w) throw notFound('Wastage entry');
  if (w.status !== 'PENDING') throw conflict('DECIDED', 'Already decided');
  if (w.loggedById === user.id) throw forbidden('SELF_APPROVAL', "You can't approve your own entry");
  const controls = await getControls(tx, user.orgId, w.outletId);
  if (w.routedToId !== user.id && !['OWNER', 'FINANCE_HEAD'].includes(user.role)) throw forbidden('NOT_APPROVER', 'This wastage is routed to someone else');
  if (approve && w.value > limitFor(controls, user.role, 'wastage')) throw forbidden('ABOVE_LIMIT', 'Above your wastage limit');
  await assertPeriodOpen(tx, user.orgId, w.businessDate);
  const updated = await tx.wastageEntry.update({
    where: { id },
    data: { status: approve ? 'APPROVED' : 'REJECTED', decidedById: user.id, decidedAt: now, decisionNote: note },
  });
  if (approve) {
    const item = await tx.item.findUniqueOrThrow({ where: { id: w.itemId } });
    await postMovement(tx, {
      outletId: w.outletId, item, locationId: w.locationId, type: w.isBreakage ? 'BREAKAGE' : 'WASTAGE', qty: -w.qty, at: w.loggedAt,
      businessDate: w.businessDate, refType: 'wastage', refId: w.id, reasonCode: w.reasonCode, approvedById: user.id, createdById: w.loggedById,
    });
  }
  return updated;
}

export async function dispatchTransfer(
  tx: Tx,
  user: User,
  a: { fromOutletId: string; toOutletId: string; lines: { itemId: string; qty: number }[] },
  now = new Date(),
) {
  if (a.fromOutletId === a.toOutletId) throw badRequest('SAME_OUTLET', 'Pick a different receiving outlet');
  if (!a.lines.length) throw badRequest('NO_LINES', 'Add items to send');
  const bd = bizDate(now);
  await assertPeriodOpen(tx, user.orgId, bd);
  const controls = await getControls(tx, user.orgId, a.toOutletId);
  const n = await tx.transfer.count();
  const t = await tx.transfer.create({
    data: {
      number: `TR-${String(n + 1).padStart(4, '0')}`, fromOutletId: a.fromOutletId, toOutletId: a.toOutletId,
      dispatchedById: user.id, dispatchedAt: now, dueBy: new Date(now.getTime() + hours(controls.settings.transferDueHours)),
      lines: { create: a.lines.map((l) => ({ itemId: l.itemId, qtySent: l.qty })) },
    },
    include: { lines: true },
  });
  for (const l of a.lines) {
    const item = await tx.item.findUniqueOrThrow({ where: { id: l.itemId } });
    await postMovement(tx, { outletId: a.fromOutletId, item, type: 'TRANSFER_OUT', qty: -l.qty, at: now, businessDate: bd, refType: 'transfer', refId: t.id, createdById: user.id });
  }
  return t;
}

/** Transfers are confirmed blind by the receiving outlet. */
export async function transferReceiverView(tx: Tx, id: string) {
  const t = await tx.transfer.findUnique({ where: { id }, include: { lines: true } });
  if (!t) throw notFound('Transfer');
  const items = await tx.item.findMany({ where: { id: { in: t.lines.map((l) => l.itemId) } } });
  const from = await tx.outlet.findUniqueOrThrow({ where: { id: t.fromOutletId } });
  return {
    id: t.id, number: t.number, from: from.name, dispatchedAt: t.dispatchedAt, status: t.status,
    lines: t.lines.map((l) => ({ lineId: l.id, itemId: l.itemId, name: items.find((i) => i.id === l.itemId)?.name, baseUnit: items.find((i) => i.id === l.itemId)?.baseUnit })),
  };
}

export async function receiveTransfer(
  tx: Tx,
  user: User,
  id: string,
  lines: { lineId: string; qtyReceived: number }[],
  now = new Date(),
) {
  const t = await tx.transfer.findUnique({ where: { id }, include: { lines: true } });
  if (!t) throw notFound('Transfer');
  if (t.status !== 'IN_TRANSIT') throw conflict('RECEIVED', 'Already received');
  if (t.dispatchedById === user.id) throw forbidden('SELF_APPROVAL', 'The sender cannot confirm receipt');
  if (lines.length !== t.lines.length) throw badRequest('LINES_REQUIRED', 'Enter what arrived for every item');
  const bd = bizDate(now);
  await assertPeriodOpen(tx, user.orgId, bd);
  let gapValue = 0;
  const gaps: string[] = [];
  for (const r of lines) {
    const l = t.lines.find((x) => x.id === r.lineId);
    if (!l) throw notFound('Transfer line');
    const item = await tx.item.findUniqueOrThrow({ where: { id: l.itemId } });
    await tx.transferLine.update({ where: { id: l.id }, data: { qtyReceived: r.qtyReceived } });
    await postMovement(tx, { outletId: t.toOutletId, item, type: 'TRANSFER_IN', qty: r.qtyReceived, at: now, businessDate: bd, refType: 'transfer', refId: t.id, createdById: user.id });
    const gap = l.qtySent - r.qtyReceived;
    if (Math.abs(gap) > 0.001) {
      gapValue += gap * item.standardCost;
      gaps.push(`${fmtQty(Math.abs(gap), item.baseUnit)} ${item.name.toLowerCase()}`);
    }
  }
  const status = gaps.length ? 'RECEIVED_WITH_GAP' : 'RECEIVED';
  await tx.transfer.update({ where: { id }, data: { status, receivedById: user.id, receivedAt: now } });
  if (gaps.length) {
    const from = await tx.outlet.findUniqueOrThrow({ where: { id: t.fromOutletId } });
    const to = await tx.outlet.findUniqueOrThrow({ where: { id: t.toOutletId } });
    const sent = t.lines.reduce((s, l) => s + l.qtySent, 0);
    const got = lines.reduce((s, l) => s + l.qtyReceived, 0);
    const ex = await raiseException(tx, {
      orgId: user.orgId, outletId: t.toOutletId, outletIds: [t.fromOutletId, t.toOutletId], type: 'TRANSFER_GAP',
      severity: Math.abs(gapValue) >= 10000 ? 'CRITICAL' : 'ATTENTION',
      title: `Transfer ${gapValue > 0 ? 'short' : 'over'}: ${gaps.join(', ')}`,
      summary: `${from.name} to ${to.name}. Sent ${round2(sent)}, received ${round2(got)}.`,
      impact: Math.abs(gapValue), businessDate: bd, groupKey: `TRANSFER:${t.id}`,
      ownerLabel: 'Both stores', involvedUserIds: [t.dispatchedById, user.id],
      suggestedChecks: ['Weigh the remaining stock at the sending store', 'Check the vehicle and driver log'],
      sourceRefs: [{ type: 'transfer', id: t.id, label: t.number }], now,
    });
    await tx.transfer.update({ where: { id }, data: { exceptionId: ex.id } });
  }
  return { status, gaps };
}

/** Stock can't sit in transit indefinitely. */
export async function flagOverdueTransfers(tx: Tx, orgId: string, now = new Date()) {
  const overdue = await tx.transfer.findMany({ where: { status: 'IN_TRANSIT', overdueFlagged: false, dueBy: { lt: now } }, include: { lines: true } });
  let n = 0;
  for (const t of overdue) {
    const from = await tx.outlet.findUniqueOrThrow({ where: { id: t.fromOutletId } });
    if (from.orgId !== orgId) continue;
    const to = await tx.outlet.findUniqueOrThrow({ where: { id: t.toOutletId } });
    const items = await tx.item.findMany({ where: { id: { in: t.lines.map((l) => l.itemId) } } });
    const value = t.lines.reduce((s, l) => s + l.qtySent * (items.find((i) => i.id === l.itemId)?.standardCost ?? 0), 0);
    await raiseException(tx, {
      orgId, outletId: t.toOutletId, outletIds: [t.fromOutletId, t.toOutletId], type: 'TRANSFER_OVERDUE', severity: 'ATTENTION',
      title: `Transfer ${t.number} not received in time`,
      summary: `${from.name} to ${to.name}, dispatched ${t.dispatchedAt.toISOString()}. Still in transit.`,
      impact: value, businessDate: bizDate(now), groupKey: `TRANSFER:${t.id}`, ownerLabel: 'Both stores',
      involvedUserIds: [t.dispatchedById], sourceRefs: [{ type: 'transfer', id: t.id, label: t.number }], now,
    });
    await tx.transfer.update({ where: { id: t.id }, data: { overdueFlagged: true } });
    n++;
  }
  return n;
}

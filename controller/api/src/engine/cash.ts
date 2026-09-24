// W4: cash shift close. Blind by denomination; expected shown only after submit; handover needs both PINs.
import bcrypt from 'bcryptjs';
import type { User } from '@prisma/client';
import type { Tx } from '../db.js';
import { getControls } from '../lib/controls.js';
import { badRequest, conflict, forbidden, notFound } from '../lib/errors.js';
import { inr } from '../lib/format.js';
import { assertPeriodOpen } from '../lib/period.js';
import { businessDate as bizDate, hours, round2 } from '../lib/time.js';
import { raiseException } from './exceptions.js';

export const NOTES = ['2000', '500', '200', '100', '50', '20', '10'] as const;
export type Denoms = Partial<Record<(typeof NOTES)[number], number>> & { coins?: number };

export function sumDenoms(d: Denoms): number {
  let s = 0;
  for (const n of NOTES) {
    const c = d[n] ?? 0;
    if (c < 0 || !Number.isInteger(c)) throw badRequest('DENOM_INVALID', `Count of ₹${n} notes must be a whole number`);
    s += Number(n) * c;
  }
  if ((d.coins ?? 0) < 0) throw badRequest('DENOM_INVALID', 'Coins cannot be negative');
  return round2(s + (d.coins ?? 0));
}

export async function openShift(
  tx: Tx,
  cashier: User,
  a: { outletId: string; till: string; shiftName: string; floatDenoms: Denoms },
  now = new Date(),
) {
  const open = await tx.cashShift.findFirst({ where: { outletId: a.outletId, till: a.till, status: { in: ['OPEN', 'COUNT_SUBMITTED'] } } });
  if (open) throw conflict('TILL_OPEN', `Till ${a.till} already has an open shift`);
  const prev = await tx.cashShift.findFirst({ where: { outletId: a.outletId, till: a.till }, orderBy: { openedAt: 'desc' } });
  const floatExpected = prev?.floatExpected ?? 5000; // the float stays in the drawer; takings are banked
  const floatCounted = sumDenoms(a.floatDenoms); // float is counted blind at shift open too
  return tx.cashShift.create({
    data: {
      outletId: a.outletId, till: a.till, cashierId: cashier.id, shiftName: a.shiftName, businessDate: bizDate(now),
      openedAt: now, floatExpected, floatCounted, floatDenoms: a.floatDenoms,
    },
  });
}

async function expectedCash(tx: Tx, shiftId: string, floatExpected: number) {
  const r = await tx.cashTxn.aggregate({ _sum: { amount: true }, where: { shiftId } });
  return round2(floatExpected + (r._sum.amount ?? 0));
}

/** M7 submit. The expected amount appears only now. */
export async function submitClose(tx: Tx, cashier: User, shiftId: string, denoms: Denoms, now = new Date()) {
  const shift = await tx.cashShift.findUnique({ where: { id: shiftId } });
  if (!shift) throw notFound('Shift');
  if (shift.cashierId !== cashier.id) throw forbidden('NOT_YOUR_SHIFT', 'Only the cashier on this shift can count it');
  if (shift.status !== 'OPEN') throw conflict('ALREADY_COUNTED', 'This shift has already been counted');
  await assertPeriodOpen(tx, cashier.orgId, shift.businessDate);
  const controls = await getControls(tx, cashier.orgId, shift.outletId);
  const counted = sumDenoms(denoms);
  const expected = await expectedCash(tx, shiftId, shift.floatExpected);
  const variance = round2(counted - expected);
  const matches = Math.abs(variance) <= controls.settings.cashTolerance;
  await tx.cashShift.update({
    where: { id: shiftId },
    data: {
      closedAt: now, closeDenoms: denoms, closeCounted: counted, expectedCash: expected, variance,
      status: matches ? 'CLOSED_MATCHED' : 'COUNT_SUBMITTED',
      handoverCashierAt: matches ? now : null,
    },
  });
  if (matches) await afterClose(tx, cashier.orgId, shiftId, now);
  return {
    counted,
    expected,
    variance,
    matches,
    next: matches ? 'Shift closed.' : 'The duty manager now counts again and both of you sign the handover.',
  };
}

async function checkPin(user: User, pin: string) {
  if (!user.pinHash || !(await bcrypt.compare(pin, user.pinHash))) throw forbidden('PIN_INVALID', `PIN for ${user.shortName} is wrong`);
}

/** Differs: second count by the duty manager, both sign the handover with PINs. */
export async function secondCount(
  tx: Tx,
  manager: User,
  shiftId: string,
  body: { denoms: Denoms; managerPin: string; cashierPin: string },
  now = new Date(),
) {
  const shift = await tx.cashShift.findUnique({ where: { id: shiftId } });
  if (!shift) throw notFound('Shift');
  if (shift.status !== 'COUNT_SUBMITTED') throw conflict('NO_SECOND_COUNT', 'This shift does not need a second count');
  if (shift.cashierId === manager.id) throw forbidden('SELF_APPROVAL', 'The second count must be by a different person');
  const cashier = await tx.user.findUniqueOrThrow({ where: { id: shift.cashierId } });
  await checkPin(manager, body.managerPin);
  await checkPin(cashier, body.cashierPin);
  const counted = sumDenoms(body.denoms);
  const variance = round2(counted - (shift.expectedCash ?? 0));
  await tx.cashShift.update({
    where: { id: shiftId },
    data: {
      secondCounterId: manager.id, secondDenoms: body.denoms, secondCounted: counted, variance,
      handoverCashierAt: now, handoverManagerAt: now, status: 'CLOSED_VARIANCE',
    },
  });
  const controls = await getControls(tx, manager.orgId, shift.outletId);
  if (Math.abs(variance) > controls.settings.cashTolerance) {
    const n = await shortagesInLast30(tx, shift.cashierId, now);
    const ex = await raiseException(tx, {
      orgId: manager.orgId,
      outletId: shift.outletId,
      type: 'CASH_VARIANCE',
      severity: Math.abs(variance) >= controls.settings.cashCriticalAbove ? 'CRITICAL' : 'ATTENTION',
      title: `Cash ${variance < 0 ? 'short' : 'over'} on ${shift.shiftName} shift`,
      summary: `Till ${shift.till}, cashier ${cashier.shortName}.${n > 1 ? ` ${ordinal(n)} shortage this month.` : ''}`,
      impact: Math.abs(variance),
      businessDate: shift.businessDate,
      groupKey: `CASH:${shift.id}`,
      involvedUserIds: [shift.cashierId, manager.id],
      detail: { shiftId, expected: shift.expectedCash, counted: shift.closeCounted, secondCounted: counted },
      suggestedChecks: ['Check card and UPI slips against POS', 'Review drawer opens without a sale', 'Check refunds paid in cash'],
      sourceRefs: [{ type: 'cashShift', id: shift.id, label: `Till ${shift.till}, ${shift.shiftName}` }],
      now,
    });
    await tx.cashShift.update({ where: { id: shiftId }, data: { exceptionId: ex.id } });
  }
  await afterClose(tx, manager.orgId, shiftId, now);
  return { counted, variance };
}

async function shortagesInLast30(tx: Tx, cashierId: string, now: Date) {
  return tx.cashShift.count({
    where: { cashierId, variance: { lt: 0 }, closedAt: { gte: new Date(now.getTime() - hours(24 * 30)) } },
  });
}

const ordinal = (n: number) => ['', 'First', 'Second', 'Third', 'Fourth', 'Fifth'][n] ?? `${n}th`;

/** Small but repeated shortages by one cashier raise an exception even if each is under tolerance. */
async function afterClose(tx: Tx, orgId: string, shiftId: string, now: Date) {
  const shift = await tx.cashShift.findUniqueOrThrow({ where: { id: shiftId }, include: { drawerOpens: true } });
  const controls = await getControls(tx, orgId, shift.outletId);
  const cashier = await tx.user.findUniqueOrThrow({ where: { id: shift.cashierId } });
  const since = new Date(now.getTime() - hours(24 * 30));
  const shorts = await tx.cashShift.findMany({ where: { cashierId: shift.cashierId, variance: { lt: 0 }, closedAt: { gte: since } } });
  if (shorts.length >= controls.settings.cashPatternCount) {
    const total = shorts.reduce((s, x) => s + Math.abs(x.variance ?? 0), 0);
    await raiseException(tx, {
      orgId, outletId: shift.outletId, type: 'CASH_PATTERN', severity: 'ATTENTION',
      title: `${shorts.length} cash shortages in 30 days by ${cashier.shortName}`,
      summary: `Total ${inr(total)} across ${shorts.length} shifts; each may be under tolerance on its own.`,
      impact: total, businessDate: shift.businessDate, groupKey: `CASHPATTERN:${shift.cashierId}`,
      involvedUserIds: [shift.cashierId],
      suggestedChecks: ['Review this cashier\'s drawer opens without a sale', 'Rotate the till for the next shifts'],
      now,
    });
  }
  const noSale = shift.drawerOpens.filter((d) => !d.withSale).length;
  if (noSale >= 5) {
    await raiseException(tx, {
      orgId, outletId: shift.outletId, type: 'DRAWER_OPEN_PATTERN', severity: 'PENDING',
      title: `Drawer opened ${noSale} times without a sale`,
      summary: `Till ${shift.till}, cashier ${cashier.shortName}, ${shift.shiftName} shift.`,
      impact: 0, businessDate: shift.businessDate, groupKey: `DRAWER:${shift.cashierId}:${shift.businessDate}`,
      involvedUserIds: [shift.cashierId], now,
    });
  }
}

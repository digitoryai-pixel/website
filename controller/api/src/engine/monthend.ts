// W8 / S8: month-end close is a checklist the system mostly completes itself.
import type { User } from '@prisma/client';
import type { Tx } from '../db.js';
import { audit } from '../lib/audit.js';
import { badRequest, conflict, forbidden } from '../lib/errors.js';
import { inr } from '../lib/format.js';
import { atLocal, monthRange, round2 } from '../lib/time.js';
import { createCountTask } from './counts.js';

type Cell = { ok: boolean; label: string; value?: number; href?: string };
export type Checklist = {
  month: string;
  status: 'OPEN' | 'LOCKED';
  outlets: { outletId: string; name: string; ready: boolean; cells: Record<string, Cell> }[];
  steps: { key: string; label: string; doneBy: string }[];
  readyCount: number;
  blockers: string[];
  history: unknown;
};

const STEPS = [
  { key: 'fullCount', label: 'Full stock count, in app', doneBy: 'Outlet staff, blind' },
  { key: 'varianceApprovals', label: 'Variance approvals', doneBy: 'Owner' },
  { key: 'grnInvoice', label: 'GRN and invoice match', doneBy: 'System, finance' },
  { key: 'cash', label: 'Cash and wallet reconciliation', doneBy: 'System' },
  { key: 'transfers', label: 'Transfers', doneBy: 'System' },
  { key: 'criticals', label: 'Critical exceptions', doneBy: 'Owners' },
  { key: 'mis', label: 'Monthly MIS pack', doneBy: 'System' },
];

const fmtDay = (d: Date) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });

export async function checklist(tx: Tx, orgId: string, month: string): Promise<Checklist> {
  const { from, to } = monthRange(month);
  const period = await tx.period.findUnique({ where: { orgId_month: { orgId, month } } });
  const outlets = await tx.outlet.findMany({ where: { orgId, kind: 'RESTAURANT' }, orderBy: { name: 'asc' } });
  const out: Checklist['outlets'] = [];
  const blockers: string[] = [];

  for (const o of outlets) {
    const cells: Record<string, Cell> = {};
    const full = await tx.countTask.findMany({ where: { outletId: o.id, type: 'FULL', periodMonth: month } });
    const doneFull = full.length > 0 && full.every((t) => t.status === 'SUBMITTED' || t.status === 'CLOSED');
    const lastDone = full.map((t) => t.submittedAt).filter(Boolean).sort((a, b) => +b! - +a!)[0];
    cells.fullCount = { ok: doneFull, label: !full.length ? 'Not scheduled' : doneFull ? `Done ${fmtDay(lastDone!)}` : `${full.filter((t) => t.status === 'SUBMITTED' || t.status === 'CLOSED').length} of ${full.length} done` };

    const open = await tx.countLine.findMany({
      where: { status: { in: ['NEEDS_APPROVAL', 'SENT_BACK', 'RECOUNT_REQUESTED'] }, task: { outletId: o.id, businessDate: { gte: from, lte: to }, type: { not: 'RECOUNT' } } },
    });
    const openVal = Math.abs(open.reduce((s, l) => s + (l.varianceValue ?? 0), 0));
    cells.varianceApprovals = { ok: open.length === 0, label: open.length ? `${open.length} line${open.length > 1 ? 's' : ''} open` : 'Approved', value: openVal };

    const inv = await tx.invoice.count({ where: { outletId: o.id, invoiceDate: { gte: from, lte: to }, status: { in: ['ON_HOLD', 'NEEDS_APPROVAL', 'WAITING_GRN', 'BLOCKED'] } } });
    cells.grnInvoice = { ok: inv === 0, label: inv ? `${inv} open` : 'All matched' };

    const shifts = await tx.cashShift.count({ where: { outletId: o.id, businessDate: { gte: from, lte: to }, status: { in: ['OPEN', 'COUNT_SUBMITTED'] } } });
    cells.cash = { ok: shifts === 0, label: shifts ? `${shifts} shift${shifts > 1 ? 's' : ''} open` : 'Reconciled' };

    const transit = await tx.transfer.count({ where: { status: 'IN_TRANSIT', OR: [{ fromOutletId: o.id }, { toOutletId: o.id }], dispatchedAt: { lte: atLocal(to, 29) } } });
    cells.transfers = { ok: transit === 0, label: transit ? `${transit} in transit` : 'None in transit' };

    const crit = await tx.exception.findMany({ where: { orgId, outletId: o.id, severity: 'CRITICAL', status: { not: 'RESOLVED' }, businessDate: { lte: to } } });
    cells.criticals = { ok: crit.length === 0, label: `${crit.length} open` };

    const ready = Object.values(cells).every((c) => c.ok);
    cells.mis = { ok: ready, label: ready ? 'Ready' : 'Waiting' };
    out.push({ outletId: o.id, name: o.name, ready, cells });

    if (!ready) {
      const parts: string[] = [];
      if (!cells.fullCount.ok) parts.push(`full count ${cells.fullCount.label.toLowerCase()}`);
      if (!cells.varianceApprovals.ok) parts.push(`${open.length} unapproved variance line${open.length > 1 ? 's' : ''} (${inr(openVal)})`);
      if (!cells.grnInvoice.ok) parts.push(`${inv} invoice${inv > 1 ? 's' : ''} not matched`);
      if (!cells.cash.ok) parts.push(`${shifts} cash shift${shifts > 1 ? 's' : ''} not reconciled`);
      if (!cells.transfers.ok) parts.push(`${transit} transfer${transit > 1 ? 's' : ''} in transit`);
      for (const c of crit) parts.push(`critical exception: ${c.title.toLowerCase()} ${inr(c.impact)} on ${c.businessDate}`);
      blockers.push(`${o.name} has ${parts.join(' and ')}.`);
    }
  }
  return {
    month,
    status: period?.status ?? 'OPEN',
    outlets: out,
    steps: STEPS,
    readyCount: out.filter((o) => o.ready).length,
    blockers,
    history: period?.history ?? [],
  };
}

export async function scheduleFullCount(tx: Tx, user: User, month: string, dueAt: Date) {
  const outlets = await tx.outlet.findMany({ where: { orgId: user.orgId, kind: 'RESTAURANT' }, include: { locations: true } });
  const created = [];
  for (const o of outlets) {
    for (const loc of o.locations) {
      const exists = await tx.countTask.findFirst({ where: { locationId: loc.id, type: 'FULL', periodMonth: month } });
      if (exists) continue;
      const hasItems = await tx.itemLocation.count({ where: { locationId: loc.id } });
      if (!hasItems) continue;
      created.push(await createCountTask(tx, { orgId: user.orgId, outletId: o.id, locationId: loc.id, type: 'FULL', assignedById: user.id, dueAt, periodMonth: month }));
    }
  }
  return { created: created.length };
}

/** The lock button stays disabled until every outlet is clear; the API says why rather than failing silently. */
export async function lockPeriod(tx: Tx, user: User, month: string, now = new Date()) {
  if (!['OWNER', 'FINANCE_HEAD'].includes(user.role)) throw forbidden('ROLE', 'Only the owner or finance head can lock a period');
  const c = await checklist(tx, user.orgId, month);
  if (c.status === 'LOCKED') throw conflict('ALREADY_LOCKED', `${month} is already locked`);
  if (c.readyCount !== c.outlets.length) throw conflict('NOT_READY', 'Period cannot be locked yet', { blockers: c.blockers });
  const p = await tx.period.upsert({ where: { orgId_month: { orgId: user.orgId, month } }, update: {}, create: { orgId: user.orgId, month } });
  const history = [...((p.history as object[]) ?? []), { action: 'LOCK', byId: user.id, at: now.toISOString() }];
  await tx.period.update({ where: { id: p.id }, data: { status: 'LOCKED', lockedById: user.id, lockedAt: now, history } });
  await audit(tx, { orgId: user.orgId, actorId: user.id, action: 'period.lock', entity: 'period', entityId: p.id, after: { month } });
  return checklist(tx, user.orgId, month);
}

/** After lock, only the finance head can reopen, with a logged reason. */
export async function reopenPeriod(tx: Tx, user: User, month: string, reason: string, now = new Date()) {
  if (user.role !== 'FINANCE_HEAD') throw forbidden('ROLE', 'Only the finance head can reopen a locked period');
  if (!reason?.trim()) throw badRequest('REASON_REQUIRED', 'Give a reason for reopening');
  const p = await tx.period.findUnique({ where: { orgId_month: { orgId: user.orgId, month } } });
  if (p?.status !== 'LOCKED') throw conflict('NOT_LOCKED', `${month} is not locked`);
  const history = [...((p.history as object[]) ?? []), { action: 'REOPEN', byId: user.id, at: now.toISOString(), reason }];
  await tx.period.update({ where: { id: p.id }, data: { status: 'OPEN', history } });
  await audit(tx, { orgId: user.orgId, actorId: user.id, action: 'period.reopen', entity: 'period', entityId: p.id, after: { month, reason } });
  return checklist(tx, user.orgId, month);
}

/** MIS pack for the accountant until the Tally/Zoho export arrives in Phase 2. */
export async function misPack(tx: Tx, orgId: string, month: string) {
  const { from, to } = monthRange(month);
  const outlets = await tx.outlet.findMany({ where: { orgId, kind: 'RESTAURANT' }, orderBy: { name: 'asc' } });
  const rows = [];
  for (const o of outlets) {
    const dcs = await tx.dayClose.findMany({ where: { outletId: o.id, businessDate: { gte: from, lte: to } } });
    const k = (key: string) => dcs.reduce((s, d) => s + ((d.kpis as Record<string, number>)[key] ?? 0), 0);
    const purchases = await tx.invoice.aggregate({ _sum: { amount: true }, where: { outletId: o.id, invoiceDate: { gte: from, lte: to }, status: { in: ['RELEASED', 'PAID'] } } });
    const debit = await tx.debitNote.aggregate({ _sum: { amount: true }, where: { invoice: { outletId: o.id, invoiceDate: { gte: from, lte: to } } } });
    rows.push({
      outlet: o.name,
      netSales: round2(k('netSales')),
      foodSales: round2(k('foodSales')),
      foodCost: round2(k('foodCost')),
      foodCostPct: k('foodSales') ? round2((k('foodCost') / k('foodSales')) * 100) : 0,
      foodTheoPct: k('foodSales') ? round2((k('foodTheo') / k('foodSales')) * 100) : 0,
      bevSales: round2(k('bevSales')),
      bevCost: round2(k('bevCost')),
      bevCostPct: k('bevSales') ? round2((k('bevCost') / k('bevSales')) * 100) : 0,
      giveaways: round2(k('giveaways')),
      wastage: round2(k('wastage')),
      stockVariance: round2(k('stockVariance')),
      cashVariance: round2(k('cashVariance')),
      unbilledKot: round2(k('unbilledKot')),
      purchases: round2(purchases._sum.amount ?? 0),
      debitNotes: round2(debit._sum.amount ?? 0),
    });
  }
  const headers = Object.keys(rows[0] ?? { outlet: '' });
  const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => JSON.stringify((r as Record<string, unknown>)[h] ?? '')).join(','))].join('\n');
  return { month, rows, csv };
}

// Read models behind the web screens (S1, S4, S5, S7) and the Daily Flash (M10).
import type { Exception, Severity } from '@prisma/client';
import type { Tx } from '../db.js';
import { getControls } from '../lib/controls.js';
import { ROLE_LABEL } from '../lib/people.js';
import { addDays, round2 } from '../lib/time.js';
import { ownerDisplay, rankExceptions } from './exceptions.js';
import { draughtYield } from './dayclose.js';
import { varianceValue } from './stock.js';

type Kpis = Record<string, number>;

export async function flashKpis(tx: Tx, outletIds: string[], date: string) {
  const rows = await tx.dayClose.findMany({ where: { outletId: { in: outletIds }, businessDate: date } });
  const sum = (k: string) => rows.reduce((s, r) => s + ((r.kpis as Kpis)[k] ?? 0), 0);
  const netSales = sum('netSales');
  const last = sum('netSalesLastWeek');
  const foodSales = sum('foodSales');
  const bevSales = sum('bevSales');
  return {
    date,
    outletsClosed: rows.length,
    netSales: round2(netSales),
    netSalesVsLastWeekPct: last ? round2(((netSales - last) / last) * 100) : null,
    foodCostPct: foodSales ? round2((sum('foodCost') / foodSales) * 100) : 0,
    foodCostVsTheoryPts: foodSales ? round2(((sum('foodCost') - sum('foodTheo')) / foodSales) * 100) : 0,
    bevCostPct: bevSales ? round2((sum('bevCost') / bevSales) * 100) : 0,
    bevCostVsTheoryPts: bevSales ? round2(((sum('bevCost') - sum('bevTheo')) / bevSales) * 100) : 0,
    giveaways: round2(sum('giveaways')),
    unbilledKot: round2(sum('unbilledKot')),
    unbilledKotOutlets: rows.filter((r) => (r.kpis as Kpis).unbilledKot > 0).length,
    stockVariance: round2(sum('stockVariance')),
    cashVariance: round2(sum('cashVariance')),
    cashVarianceShifts: await tx.cashShift.count({ where: { outletId: { in: outletIds }, businessDate: date, variance: { not: 0 }, status: 'CLOSED_VARIANCE' } }),
    wastage: round2(sum('wastage')),
  };
}

/** Exceptions visible to a user: their outlets, plus anything assigned to them. */
export function exceptionScope(orgId: string, outletIds: string[], userId: string) {
  return { orgId, OR: [{ outletId: { in: outletIds } }, { outletIds: { hasSome: outletIds } }, { assigneeId: userId }] };
}

export async function actionCentre(tx: Tx, orgId: string, userId: string, outletIds: string[], filters: { severity?: Severity; area?: string }) {
  const areaTypes: Record<string, Exception['type'][]> = {
    stock: ['STOCK_VARIANCE', 'COUNT_NOT_STARTED'],
    liquor: ['LIQUOR_VARIANCE', 'DRAUGHT_YIELD'],
    kot: ['UNBILLED_KOT'],
    purchases: ['RATE_VARIANCE', 'THREE_WAY_MISMATCH', 'NO_PO_INVOICE', 'DUPLICATE_INVOICE'],
    giveaways: ['GIVEAWAY_PATTERN', 'VOID_AFTER_PAYMENT', 'REFUND_MODE_MISMATCH'],
    cash: ['CASH_VARIANCE', 'CASH_PATTERN', 'DRAWER_OPEN_PATTERN'],
    wastage: ['WASTAGE_ABOVE_LIMIT', 'TRANSFER_GAP', 'TRANSFER_OVERDUE'],
    cost: ['FOOD_COST', 'BEVERAGE_COST'],
  };
  const where = {
    ...exceptionScope(orgId, outletIds, userId),
    status: { not: 'RESOLVED' as const },
    ...(filters.severity ? { severity: filters.severity } : {}),
    ...(filters.area && areaTypes[filters.area] ? { type: { in: areaTypes[filters.area] } } : {}),
  };
  const rows = rankExceptions(await tx.exception.findMany({ where }));
  const users = new Map((await tx.user.findMany({ where: { id: { in: rows.map((r) => r.assigneeId!).filter(Boolean) } } })).map((u) => [u.id, u]));
  const outlets = new Map((await tx.outlet.findMany({ where: { orgId } })).map((o) => [o.id, o]));
  return {
    counts: {
      open: rows.length,
      critical: rows.filter((r) => r.severity === 'CRITICAL').length,
      attention: rows.filter((r) => r.severity === 'ATTENTION').length,
      pending: rows.filter((r) => r.severity === 'PENDING').length,
    },
    items: rows.map((r) => ({
      id: r.id,
      type: r.type,
      severity: r.severity,
      status: r.status,
      impact: r.impact,
      title: r.title,
      summary: r.summary,
      outlet: r.outletId ? outlets.get(r.outletId)?.name : null,
      owner: ownerDisplay(r, users.get(r.assigneeId ?? ''), userId),
      dueAt: r.dueAt,
      overdue: r.dueAt < new Date(),
      occurrences: r.occurrences,
    })),
  };
}

// ─────────────── S4 Liquor control ───────────────

export async function liquorControl(tx: Tx, orgId: string, outletId: string, locationId: string | undefined, from: string, to: string) {
  const items = await tx.item.findMany({ where: { orgId, category: 'SPIRITS_WINE', active: true } });
  const moves = await tx.stockMovement.findMany({
    where: { outletId, itemId: { in: items.map((i) => i.id) }, ...(locationId ? { locationId } : {}), businessDate: { lte: to } },
  });
  const pending = await tx.countLine.findMany({
    where: { status: { in: ['NEEDS_APPROVAL', 'SENT_BACK'] }, itemId: { in: items.map((i) => i.id) }, task: { outletId, businessDate: { gte: from, lte: to }, type: { not: 'RECOUNT' } }, ...(locationId ? { locationId } : {}) },
  });
  const recounts = await tx.countLine.findMany({ where: { originalLineId: { in: pending.map((p) => p.id) } } });
  const rows = items
    .map((it) => {
      const m = moves.filter((x) => x.itemId === it.id);
      const before = m.filter((x) => x.businessDate < from).reduce((s, x) => s + x.qty, 0);
      const inRange = m.filter((x) => x.businessDate >= from);
      const t = (types: string[]) => inRange.filter((x) => types.includes(x.type)).reduce((s, x) => s + x.qty, 0);
      const received = t(['GRN', 'TRANSFER_IN']);
      const sold = -t(['SALE']);
      const comp = -t(['COMP', 'STAFF_MEAL']);
      const breakage = -t(['BREAKAGE', 'WASTAGE']);
      const transferredOut = -t(['TRANSFER_OUT']);
      const posted = t(['ADJUSTMENT']);
      const unposted = pending.filter((p) => p.itemId === it.id).reduce((s, p) => s + (recounts.find((r) => r.originalLineId === p.id)?.variance ?? p.variance ?? 0), 0);
      const variance = round2(posted + unposted);
      const closing = round2(before + received - sold - comp - breakage - transferredOut + variance);
      return {
        itemId: it.id, sku: it.name, opening: round2(before), received: round2(received), sold: round2(sold), compStaff: round2(comp),
        breakage: round2(breakage), closing, variance, value: varianceValue(it, variance), soldValue: round2(sold * (it.sellingPricePerUnit ?? 0)),
      };
    })
    .filter((r) => r.opening || r.received || r.sold || r.closing)
    .sort((a, b) => a.value - b.value);

  // Variance % by bar across all outlets in the org for comparison.
  const bars = await tx.location.findMany({ where: { kind: 'BAR', outlet: { orgId } }, include: { outlet: true } });
  const byBar = [];
  for (const b of bars) {
    const mv = await tx.stockMovement.findMany({ where: { locationId: b.id, itemId: { in: items.map((i) => i.id) }, businessDate: { gte: from, lte: to }, type: { in: ['SALE', 'ADJUSTMENT'] } } });
    const soldVal = mv.filter((x) => x.type === 'SALE').reduce((s, x) => s - x.qty * (items.find((i) => i.id === x.itemId)!.sellingPricePerUnit ?? 0), 0);
    const pend = await tx.countLine.findMany({ where: { locationId: b.id, status: { in: ['NEEDS_APPROVAL', 'SENT_BACK'] }, itemId: { in: items.map((i) => i.id) }, task: { businessDate: { gte: from, lte: to }, type: { not: 'RECOUNT' } } } });
    const rc = await tx.countLine.findMany({ where: { originalLineId: { in: pend.map((p) => p.id) } } });
    const varVal =
      mv.filter((x) => x.type === 'ADJUSTMENT').reduce((s, x) => s + varianceValue(items.find((i) => i.id === x.itemId)!, x.qty), 0) +
      pend.reduce((s, p) => s + (rc.find((r) => r.originalLineId === p.id)?.varianceValue ?? p.varianceValue ?? 0), 0);
    byBar.push({ locationId: b.id, bar: `${b.outlet.name} ${b.name.toLowerCase()}`, pct: soldVal ? round2((Math.abs(varVal) / soldVal) * 100) : 0 });
  }
  const controls = await getControls(tx, orgId, outletId);
  const draught = [];
  for (let d = from; d <= to; d = addDays(d, 1)) draught.push(...(await draughtYield(tx, outletId, d)));
  const byBeer = new Map<string, { beer: string; drawn: number; sold: number; std: number; tank: string; source: string }>();
  for (const y of draught) {
    const cur = byBeer.get(y.itemId) ?? { beer: y.beer, drawn: 0, sold: 0, std: y.stdPct, tank: y.tank, source: y.source };
    cur.drawn += y.drawnMl;
    cur.sold += y.soldMl;
    byBeer.set(y.itemId, cur);
  }
  return {
    rows,
    byBar: byBar.sort((a, b) => b.pct - a.pct),
    tolerancePct: controls.tolerances.SPIRITS_WINE.pct * 2,
    draught: [...byBeer.values()].map((b) => ({ ...b, yieldPct: b.drawn ? round2((b.sold / b.drawn) * 100) : 0 })),
  };
}

/** Clicking a SKU shows every count, receipt and pour behind the number. */
export async function liquorSkuTrail(tx: Tx, outletId: string, itemId: string, from: string, to: string) {
  const moves = await tx.stockMovement.findMany({ where: { outletId, itemId, businessDate: { gte: from, lte: to } }, orderBy: { at: 'asc' } });
  const counts = await tx.countLine.findMany({ where: { itemId, task: { outletId, businessDate: { gte: from, lte: to } } }, include: { task: true } });
  const people = new Map((await tx.user.findMany({ where: { id: { in: [...moves.map((m) => m.approvedById), ...counts.map((c) => c.countedById)].filter(Boolean) as string[] } } })).map((u) => [u.id, u.shortName]));
  return {
    movements: moves.map((m) => ({ at: m.at, type: m.type, qty: m.qty, ref: m.refType ? `${m.refType}:${m.refId}` : null, reason: m.reasonCode, approvedBy: m.approvedById ? people.get(m.approvedById) : null })),
    counts: counts.map((c) => ({ at: c.countedAt, type: c.task.type, counted: c.countedQty, system: c.systemQty, variance: c.variance, by: c.countedById ? people.get(c.countedById) : null, status: c.status })),
  };
}

// ─────────────── S5 KOT-to-bill ───────────────

export async function kotView(tx: Tx, outletId: string, date: string) {
  const items = await tx.kotItem.findMany({ where: { kot: { outletId, businessDate: date } }, include: { kot: true } });
  const menu = new Map((await tx.menuItem.findMany({ where: { id: { in: items.map((i) => i.menuItemId) } } })).map((m) => [m.id, m]));
  const stewards = new Map((await tx.user.findMany({ where: { id: { in: items.map((i) => i.kot.stewardId).filter(Boolean) as string[] } } })).map((u) => [u.id, u]));
  const count = (d: string) => items.filter((i) => i.disposition === d).length;
  const un = items.filter((i) => i.disposition === 'UNACCOUNTED').sort((a, b) => +a.kot.firedAt - +b.kot.firedAt);
  // The day's exception stays linked after it is explained, so the pattern panel survives closure.
  const ex = await tx.exception.findFirst({ where: { groupKey: `KOT:${outletId}:${date}` } });
  const assignee = ex?.assigneeId ? await tx.user.findUnique({ where: { id: ex.assigneeId } }) : null;
  return {
    fired: { items: items.length, value: round2(items.reduce((s, i) => s + i.amount, 0)) },
    breakdown: {
      billed: count('BILLED'),
      voided: count('VOIDED'),
      staffMeals: count('STAFF_MEAL'),
      nc: count('NC'),
      pending: count('PENDING'),
      notAccounted: un.length,
      notAccountedValue: round2(un.reduce((s, i) => s + i.amount, 0)),
    },
    notAccounted: un.map((i) => ({
      kot: i.kot.kotNo, time: i.kot.firedAt, table: i.kot.tableNo, steward: stewards.get(i.kot.stewardId ?? '')?.shortName ?? '—',
      item: menu.get(i.menuItemId)?.name, qty: i.qty, amount: i.amount, station: i.kot.station,
    })),
    pattern: (ex?.detail as { pattern?: unknown } | null)?.pattern ?? null,
    exception: ex ? { id: ex.id, status: ex.status, dueAt: ex.dueAt, assignee: assignee ? `${assignee.shortName}, ${ROLE_LABEL[assignee.role].toLowerCase()}` : null } : null,
  };
}

// ─────────────── S7 Giveaways ───────────────

export async function giveawaysView(tx: Tx, outletIds: string[], from: string, to: string) {
  const rows = await tx.giveaway.findMany({ where: { outletId: { in: outletIds }, businessDate: { gte: from, lte: to } } });
  const bills = await tx.bill.findMany({ where: { outletId: { in: outletIds }, businessDate: { gte: from, lte: to }, status: 'PAID' } });
  const net = bills.reduce((s, b) => s + b.netAmount, 0);
  const sum = (types: string[]) => round2(rows.filter((r) => types.includes(r.type)).reduce((s, r) => s + r.amount, 0));
  const pct = (v: number) => (net ? round2((v / net) * 100) : 0);

  // Baseline = same outlets over the 8 weeks before the range.
  const days = Math.round((+new Date(to) - +new Date(from)) / 86_400_000) + 1;
  const bFrom = addDays(from, -56);
  const bTo = addDays(from, -1);
  const baseRows = await tx.giveaway.findMany({ where: { outletId: { in: outletIds }, businessDate: { gte: bFrom, lte: bTo } } });
  const baseBills = await tx.bill.aggregate({ _sum: { netAmount: true }, where: { outletId: { in: outletIds }, businessDate: { gte: bFrom, lte: bTo }, status: 'PAID' } });
  const baseNet = baseBills._sum.netAmount ?? 0;
  const baselinePct = baseNet ? round2((baseRows.reduce((s, r) => s + r.amount, 0) / baseNet) * 100) : null;
  const compBaselinePct = baseNet ? round2((baseRows.filter((r) => r.type === 'COMP').reduce((s, r) => s + r.amount, 0) / baseNet) * 100) : null;

  const series = [];
  for (let d = from; d <= to; d = addDays(d, 1)) {
    const g = rows.filter((r) => r.businessDate === d).reduce((s, r) => s + r.amount, 0);
    const n = bills.filter((b) => b.businessDate === d).reduce((s, b) => s + b.netAmount, 0);
    series.push({ date: d, pct: n ? round2((g / n) * 100) : 0, amount: round2(g) });
  }

  const approvers = [...new Set(rows.map((r) => r.approverId))];
  const users = new Map((await tx.user.findMany({ where: { id: { in: approvers } }, include: { outlets: { include: { outlet: true } } } })).map((u) => [u.id, u]));
  const openEx = await tx.exception.findMany({ where: { status: { not: 'RESOLVED' }, type: { in: ['GIVEAWAY_PATTERN', 'VOID_AFTER_PAYMENT', 'REFUND_MODE_MISMATCH'] }, involvedUserIds: { hasSome: approvers } } });
  const byApprover = approvers.map((id) => {
    const mine = rows.filter((r) => r.approverId === id);
    const base = baseRows.filter((r) => r.approverId === id).reduce((s, r) => s + r.amount, 0) / 56;
    const cur = mine.reduce((s, r) => s + r.amount, 0) / days;
    const u = users.get(id)!;
    const flag = openEx.find((e) => e.involvedUserIds.includes(id));
    return {
      userId: id, name: u.shortName, role: `${u.title ?? ROLE_LABEL[u.role]}, ${u.outlets[0]?.outlet.name ?? ''}`,
      discounts: round2(mine.filter((r) => r.type === 'DISCOUNT').reduce((s, r) => s + r.amount, 0)),
      comps: round2(mine.filter((r) => r.type === 'COMP').reduce((s, r) => s + r.amount, 0)),
      voids: round2(mine.filter((r) => r.type.startsWith('VOID')).reduce((s, r) => s + r.amount, 0)),
      refunds: round2(mine.filter((r) => r.type === 'REFUND').reduce((s, r) => s + r.amount, 0)),
      vsBaseline: base ? round2(cur / base) : null,
      flag: flag ? (flag.type === 'VOID_AFTER_PAYMENT' ? 'Void after payment' : 'Exception open') : null,
      exceptionId: flag?.id ?? null,
    };
  });
  const comps = sum(['COMP']);
  return {
    tiles: {
      discounts: { amount: sum(['DISCOUNT']), pct: pct(sum(['DISCOUNT'])) },
      comps: { amount: comps, pct: pct(comps), baselinePct: compBaselinePct },
      voidsAfterKot: { amount: sum(['VOID_AFTER_KOT', 'VOID_AFTER_PAYMENT']), pct: pct(sum(['VOID_AFTER_KOT', 'VOID_AFTER_PAYMENT'])) },
      voidsBeforeKot: { amount: sum(['VOID_BEFORE_KOT']) },
      refunds: { amount: sum(['REFUND']), allWithBill: rows.filter((r) => r.type === 'REFUND').every((r) => r.billId) },
    },
    series,
    baselinePct,
    byApprover: byApprover.sort((a, b) => (b.vsBaseline ?? 0) - (a.vsBaseline ?? 0)),
  };
}

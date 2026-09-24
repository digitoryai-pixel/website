// W1: reconciliations run after day close at every outlet. Only items outside each outlet's
// own baseline become exceptions.
import type { Prisma } from '@prisma/client';
import type { Tx } from '../db.js';
import { getControls } from '../lib/controls.js';
import { inr } from '../lib/format.js';
import { MANAGERS } from '../lib/auth.js';
import { usersWithRole } from '../lib/people.js';
import { addDays, dayOfWeek, round2 } from '../lib/time.js';
import { onAccept, raiseException, type Driver } from './exceptions.js';
import { recipeUsage } from './pos.js';
import { varianceValue } from './stock.js';

const hhmm = (d: Date) => d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });

// ─────────────── KOT-to-bill (W6) ───────────────

export async function kotMatch(tx: Tx, orgId: string, outletId: string, date: string, now: Date) {
  const controls = await getControls(tx, orgId, outletId);
  const kots = await tx.kot.findMany({ where: { outletId, businessDate: date }, include: { items: true } });
  const billed = new Map(
    (await tx.billItem.findMany({ where: { kotItemId: { in: kots.flatMap((k) => k.items.map((i) => i.id)) } }, include: { bill: true } }))
      .map((bi) => [bi.kotItemId!, bi.bill.status]),
  );
  const unaccounted: { kot: (typeof kots)[number]; item: (typeof kots)[number]['items'][number] }[] = [];
  for (const k of kots) {
    for (const it of k.items) {
      if (it.disposition !== 'PENDING' && it.disposition !== 'UNACCOUNTED') continue;
      const status = billed.get(it.id);
      if (status === 'PAID') {
        await tx.kotItem.update({ where: { id: it.id }, data: { disposition: 'BILLED' } });
      } else {
        await tx.kotItem.update({ where: { id: it.id }, data: { disposition: 'UNACCOUNTED' } });
        unaccounted.push({ kot: k, item: it });
      }
    }
  }
  if (!unaccounted.length) return null;

  const total = unaccounted.reduce((s, u) => s + u.item.amount, 0);
  const bySteward = new Map<string, number>();
  for (const u of unaccounted) if (u.kot.stewardId) bySteward.set(u.kot.stewardId, (bySteward.get(u.kot.stewardId) ?? 0) + 1);
  const [topSteward, topCount] = [...bySteward.entries()].sort((a, b) => b[1] - a[1])[0] ?? [null, 0];
  const steward = topSteward ? await tx.user.findUnique({ where: { id: topSteward } }) : null;
  const sections = [...new Set(unaccounted.map((u) => u.kot.section).filter(Boolean))];
  const times = unaccounted.map((u) => u.kot.firedAt).sort((a, b) => +a - +b);

  // Patterns by steward over 30 days.
  let pattern: Prisma.InputJsonValue | undefined;
  if (steward) {
    const since = addDays(date, -30);
    const hist = await tx.kotItem.findMany({
      where: { disposition: { in: ['UNACCOUNTED', 'NC'] }, exceptionId: { not: null }, kot: { stewardId: steward.id, businessDate: { gte: since, lt: date } } },
      include: { kot: true },
    });
    const nights = new Set(hist.map((h) => h.kot.businessDate)).size + 1;
    pattern = { stewardId: steward.id, steward: steward.shortName, share: `${topCount} of ${unaccounted.length}`, nights30: nights, total30: round2(hist.reduce((s, h) => s + h.amount, 0) + total) };
  }
  const ex = await raiseException(tx, {
    orgId, outletId, type: 'UNBILLED_KOT', severity: controls.settings.unbilledKotSeverity,
    title: `${unaccounted.length} KOT items never billed`,
    summary: `${sections.length ? `Section ${sections.join(', ')}, ` : ''}${hhmm(times[0])}–${hhmm(times[times.length - 1])}.${steward ? ` ${topCount} of ${unaccounted.length} served by ${steward.shortName}.` : ''}`,
    impact: total, businessDate: date, groupKey: `KOT:${outletId}:${date}`,
    involvedUserIds: [...bySteward.keys()],
    detail: { kotItemIds: unaccounted.map((u) => u.item.id), pattern: pattern ?? null },
    suggestedChecks: ['Check CCTV for the tables involved', 'Check whether the party moved tables', 'Ask the steward to explain each item'],
    sourceRefs: unaccounted.slice(0, 20).map((u) => ({ type: 'kot', id: u.kot.id, label: u.kot.kotNo })),
    now,
  });
  await tx.kotItem.updateMany({ where: { id: { in: unaccounted.map((u) => u.item.id) } }, data: { exceptionId: ex.id } });
  return ex;
}

// Valid explanations are recorded as NC with an approver, so they count next time.
onAccept('UNBILLED_KOT', async (tx, ex, approver, reasonCode) => {
  await tx.kotItem.updateMany({ where: { exceptionId: ex.id, disposition: 'UNACCOUNTED' }, data: { disposition: 'NC', ncReasonCode: reasonCode, ncApproverId: approver.id } });
});

// ─────────────── Cost vs theoretical (S2 drivers) ───────────────

type CostBreakdown = {
  sales: number;
  theoretical: number;
  actual: number;
  drivers: Driver[];
  recipeItems: { item: string; sold: number; ingredient: string; unit: string; theoretical: number; actual: number; gap: number }[];
  wastage: number;
};

async function soldByMenuItem(tx: Tx, outletId: string, date: string) {
  const items = await tx.billItem.findMany({ where: { bill: { outletId, businessDate: date, status: 'PAID' } } });
  const m = new Map<string, { qty: number; amount: number }>();
  for (const it of items) {
    const cur = m.get(it.menuItemId) ?? { qty: 0, amount: 0 };
    m.set(it.menuItemId, { qty: cur.qty + it.qty, amount: cur.amount + it.amount });
  }
  return m;
}

export async function costBreakdown(tx: Tx, outletId: string, date: string, kind: 'FOOD' | 'BEVERAGE'): Promise<CostBreakdown> {
  const sold = await soldByMenuItem(tx, outletId, date);
  const menu = new Map((await tx.menuItem.findMany({ where: { id: { in: [...sold.keys()] } }, include: { recipes: { where: { active: true }, include: { lines: true } } } })).map((m) => [m.id, m]));
  const kinds = kind === 'FOOD' ? ['FOOD'] : ['BEVERAGE', 'LIQUOR'];
  const allItems = new Map((await tx.item.findMany()).map((i) => [i.id, i]));

  let sales = 0;
  let theoretical = 0;
  const theoUsage = new Map<string, number>(); // itemId → qty
  const usageByMenu = new Map<string, Map<string, number>>();
  for (const [menuId, s] of sold) {
    const mi = menu.get(menuId);
    if (!mi || !kinds.includes(mi.kind)) continue;
    sales += s.amount;
    for (const u of await recipeUsage(tx, menuId, s.qty)) {
      const it = allItems.get(u.itemId)!;
      theoretical += u.qty * it.standardCost;
      theoUsage.set(u.itemId, (theoUsage.get(u.itemId) ?? 0) + u.qty);
      const mm = usageByMenu.get(menuId) ?? new Map();
      mm.set(u.itemId, (mm.get(u.itemId) ?? 0) + u.qty);
      usageByMenu.set(menuId, mm);
    }
  }
  const isKind = (itemId: string) => {
    const c = allItems.get(itemId)?.category;
    const bev = c === 'SPIRITS_WINE' || c === 'DRAUGHT_BEER' || c === 'BOTTLED_BEER';
    return kind === 'FOOD' ? !bev : bev;
  };

  // 1. Rate: bought above the standard rate.
  const drivers: Driver[] = [];
  const billed = await tx.invoiceLine.findMany({
    where: { itemId: { in: [...theoUsage.keys()] }, invoice: { outletId, invoiceDate: { gte: addDays(date, -7), lte: date }, status: { not: 'BLOCKED' } } },
    include: { invoice: true },
    orderBy: { invoice: { createdAt: 'desc' } },
  });
  for (const [itemId, q] of theoUsage) {
    const it = allItems.get(itemId)!;
    const last = billed.find((b) => b.itemId === itemId);
    if (last && last.rate > it.standardCost * 1.02) {
      drivers.push({ label: `${it.name} bought at ₹${round2(last.rate)}/${it.baseUnit.toLowerCase()} vs ₹${it.standardCost}`, amount: round2((last.rate - it.standardCost) * q) });
    }
  }

  // 2. Wastage above baseline (same weekday, last 4 weeks).
  const wastageRows = await tx.wastageEntry.findMany({ where: { outletId, businessDate: date, status: { not: 'REJECTED' } } });
  const wastage = wastageRows.filter((w) => isKind(w.itemId)).reduce((s, w) => s + w.value, 0);
  const past = await tx.wastageEntry.findMany({ where: { outletId, businessDate: { in: [7, 14, 21, 28].map((n) => addDays(date, -n)) }, status: { not: 'REJECTED' } } });
  const baselineWastage = past.filter((w) => isKind(w.itemId)).reduce((s, w) => s + w.value, 0) / 4;
  if (wastage - baselineWastage > 100) {
    drivers.push({ label: `${kind === 'FOOD' ? 'Prep wastage' : 'Bar wastage'} above baseline (M8 entries: ${wastageRows.filter((w) => isKind(w.itemId)).length})`, amount: round2(wastage - baselineWastage) });
  }

  // 3. Recipe variance: store issues to a section vs what recipes say was used.
  const issues = await tx.sectionIssue.findMany({ where: { outletId, businessDate: date } });
  const recipeItems: CostBreakdown['recipeItems'] = [];
  const bySection = new Map<string, number>();
  for (const iss of issues) {
    if (!isKind(iss.itemId)) continue;
    const it = allItems.get(iss.itemId)!;
    const actual = iss.qtyIssued - iss.qtyReturned;
    const theo = theoUsage.get(iss.itemId) ?? 0;
    const wasted = wastageRows.filter((w) => w.itemId === iss.itemId).reduce((s, w) => s + w.qty, 0);
    const gapQty = actual - theo - wasted;
    if (Math.abs(gapQty * it.standardCost) < 50) continue;
    bySection.set(iss.section, (bySection.get(iss.section) ?? 0) + gapQty * it.standardCost);
    // Attribute the gap to the menu item that uses the most of this ingredient.
    const top = [...usageByMenu.entries()].filter(([, m]) => m.has(iss.itemId)).sort((a, b) => b[1].get(iss.itemId)! - a[1].get(iss.itemId)!)[0];
    recipeItems.push({
      item: top ? menu.get(top[0])!.name : '—', sold: top ? sold.get(top[0])!.qty : 0, ingredient: it.name, unit: it.baseUnit,
      theoretical: round2(theo), actual: round2(actual - wasted), gap: round2(gapQty * it.standardCost),
    });
  }
  for (const [section, amt] of bySection) drivers.push({ label: `Recipe variance, ${section.toLowerCase()} section`, amount: round2(amt) });

  // 4. Mix: theoretical % vs this outlet's normal theoretical %.
  const prevTheo: number[] = [];
  for (const n of [7, 14, 21, 28]) {
    const dc = await tx.dayClose.findUnique({ where: { outletId_businessDate: { outletId, businessDate: addDays(date, -n) } } });
    const k = dc?.kpis as Record<string, number> | undefined;
    const v = kind === 'FOOD' ? k?.foodTheoPct : k?.bevTheoPct;
    if (v) prevTheo.push(v);
  }
  if (prevTheo.length && sales > 0) {
    const base = prevTheo.reduce((a, b) => a + b, 0) / prevTheo.length;
    const mix = round2(((theoretical / sales) * 100 - base) / 100 * sales);
    if (Math.abs(mix) > 100) drivers.push({ label: mix < 0 ? 'Sales mix shifted toward higher-margin items' : 'Sales mix shifted toward lower-margin items', amount: mix });
  }

  const gap = drivers.reduce((s, d) => s + d.amount, 0);
  recipeItems.sort((a, b) => b.gap - a.gap);
  return { sales: round2(sales), theoretical: round2(theoretical), actual: round2(theoretical + gap), drivers: drivers.sort((a, b) => b.amount - a.amount), recipeItems, wastage: round2(wastage) };
}

async function costException(tx: Tx, orgId: string, outletId: string, date: string, now: Date) {
  const controls = await getControls(tx, orgId, outletId);
  const food = await costBreakdown(tx, outletId, date, 'FOOD');
  if (food.sales <= 0) return { food, bev: await costBreakdown(tx, outletId, date, 'BEVERAGE') };
  const actualPct = (food.actual / food.sales) * 100;
  const theoPct = (food.theoretical / food.sales) * 100;
  const gapPts = actualPct - theoPct;
  if (gapPts > controls.settings.foodCostGapPts) {
    const outlet = await tx.outlet.findUniqueOrThrow({ where: { id: outletId } });
    const chef = (await usersWithRole(tx, orgId, ['HEAD_CHEF'], outletId))[0];
    // How often in the last 7 days
    let daysAbove = 1;
    for (let n = 1; n < 7; n++) {
      const dc = await tx.dayClose.findUnique({ where: { outletId_businessDate: { outletId, businessDate: addDays(date, -n) } } });
      const k = dc?.kpis as Record<string, number> | undefined;
      if (k && k.foodCostPct - k.foodTheoPct > controls.settings.foodCostGapPts) daysAbove++;
    }
    const checks: string[] = [];
    for (const d of food.drivers) {
      if (d.label.includes('bought at')) checks.push(`Confirm ${d.label.split(' bought')[0]} rate with contract`);
      else if (d.label.includes('wastage')) checks.push(`Review ${food.recipeItems.length ? '' : 'the '}wastage photos`);
      else if (d.label.includes('Recipe variance')) checks.push(`Weigh 5 ${food.recipeItems[0]?.item.toLowerCase() ?? 'portions'} portions on scale`, 'Check recipe version in use');
    }
    const top = food.drivers[0];
    await raiseException(tx, {
      orgId, outletId, type: 'FOOD_COST', severity: 'ATTENTION',
      title: `Food cost ${gapPts.toFixed(1)} pts above theoretical`,
      summary: `${outlet.name}. ${food.drivers.filter((d) => d.amount > 0).slice(0, 3).map((d) => `${d.label.replace(/ \(.*\)/, '')} ${inr(d.amount, { sign: true })}`).join(', ')}.`,
      impact: food.actual - food.theoretical, businessDate: date, groupKey: `FOODCOST:${outletId}:${date}`,
      assigneeId: chef?.id,
      drivers: food.drivers,
      detail: {
        actualPct: round2(actualPct), theoreticalPct: round2(theoPct), sales: food.sales, daysAbove7: daysAbove,
        headline: `Food cost has been above theoretical for ${daysAbove} of the last 7 days.${top ? ` Largest driver: ${top.label}.` : ''}`,
        recipeItems: food.recipeItems,
      },
      suggestedChecks: [...new Set(checks)],
      now,
    });
  }
  return { food, bev: await costBreakdown(tx, outletId, date, 'BEVERAGE') };
}

// ─────────────── Giveaways (S7) ───────────────

export async function giveawayChecks(tx: Tx, orgId: string, outletId: string, date: string, now: Date) {
  const controls = await getControls(tx, orgId, outletId);
  const today = await tx.giveaway.findMany({ where: { outletId, businessDate: date } });
  const outlet = await tx.outlet.findUniqueOrThrow({ where: { id: outletId } });
  const mgrRoles = new Set(MANAGERS);

  // Per approver comps vs their own baseline for this outlet and weekday.
  const sameDays = [7, 14, 21, 28, 35, 42, 49, 56].map((n) => addDays(date, -n));
  const hist = await tx.giveaway.findMany({ where: { outletId, businessDate: { in: sameDays }, type: 'COMP' } });
  const byApprover = new Map<string, typeof today>();
  for (const g of today.filter((g) => g.type === 'COMP')) byApprover.set(g.approverId, [...(byApprover.get(g.approverId) ?? []), g]);
  for (const [approverId, rows] of byApprover) {
    const amt = rows.reduce((s, r) => s + r.amount, 0);
    const base = hist.filter((h) => h.approverId === approverId).reduce((s, h) => s + h.amount, 0) / sameDays.length;
    if (base <= 0 || amt < 2000) continue;
    const ratio = amt / base;
    if (ratio < controls.settings.giveawayMultiple) continue;
    const approver = await tx.user.findUniqueOrThrow({ where: { id: approverId } });
    await raiseException(tx, {
      orgId, outletId, type: 'GIVEAWAY_PATTERN', severity: 'ATTENTION',
      title: `Comps at ${ratio.toFixed(1)}× baseline`,
      summary: `${outlet.name}. ${rows.length} bills, all approved by the same ${approver.title?.toLowerCase() ?? 'manager'}.`,
      impact: amt - base, businessDate: date, groupKey: `COMPS:${approverId}:${date}`,
      involvedUserIds: [approverId], routePastOutlet: mgrRoles.has(approver.role),
      detail: { approverId, ratio: round2(ratio), baseline: round2(base), amount: amt, bills: rows.map((r) => r.billNo) },
      suggestedChecks: ['Review the reason codes on each comp', 'Check whether the guests are regulars or staff'],
      now,
    });
  }

  // Voids after payment go straight past the outlet when a manager did them.
  for (const v of today.filter((g) => g.type === 'VOID_AFTER_PAYMENT')) {
    const by = await tx.user.findUniqueOrThrow({ where: { id: v.approverId } });
    await raiseException(tx, {
      orgId, outletId, type: 'VOID_AFTER_PAYMENT', severity: 'CRITICAL',
      title: 'Bill voided after payment',
      summary: `${outlet.name}, bill ${v.billNo}. Voided by ${by.title?.toLowerCase() ?? by.shortName}${mgrRoles.has(by.role) ? ', so sent to you' : ''}.`,
      impact: v.amount, businessDate: date, groupKey: `VOIDPAID:${v.id}`,
      involvedUserIds: [v.approverId, v.givenById].filter(Boolean) as string[], routePastOutlet: mgrRoles.has(by.role),
      suggestedChecks: ['Get the guest contact and confirm the refund', 'Check how the money was returned'],
      sourceRefs: v.billId ? [{ type: 'bill', id: v.billId, label: v.billNo ?? '' }] : [], now,
    });
  }

  // Refund in a different mode than the guest paid.
  for (const r of today.filter((g) => g.type === 'REFUND' && g.paidMode && g.refundMode && g.paidMode !== g.refundMode)) {
    const by = await tx.user.findUniqueOrThrow({ where: { id: r.approverId } });
    await raiseException(tx, {
      orgId, outletId, type: 'REFUND_MODE_MISMATCH', severity: 'ATTENTION',
      title: `Refund paid as ${r.refundMode!.toLowerCase()} on a ${r.paidMode!.toLowerCase()} bill`,
      summary: `${outlet.name}, bill ${r.billNo}. Approved by ${by.shortName}.`,
      impact: r.amount, businessDate: date, groupKey: `REFUNDMODE:${r.id}`, involvedUserIds: [r.approverId],
      routePastOutlet: mgrRoles.has(by.role), now,
    });
  }
}

// ─────────────── Draught (S4) ───────────────

export async function draughtYield(tx: Tx, outletId: string, date: string) {
  const draws = await tx.draughtDraw.findMany({ where: { outletId, businessDate: date } });
  const out = [];
  for (const d of draws) {
    const sold = await tx.stockMovement.aggregate({ _sum: { qty: true }, where: { outletId, itemId: d.itemId, type: 'SALE', businessDate: date } });
    const soldMl = -(sold._sum.qty ?? 0);
    const item = await tx.item.findUniqueOrThrow({ where: { id: d.itemId } });
    out.push({ itemId: d.itemId, beer: item.name, tank: d.tankNo, drawnMl: d.drawnMl, soldMl, yieldPct: d.drawnMl ? round2((soldMl / d.drawnMl) * 100) : 0, stdPct: d.standardYieldPct, source: d.source });
  }
  return out;
}

async function draughtChecks(tx: Tx, orgId: string, outletId: string, date: string, now: Date) {
  const controls = await getControls(tx, orgId, outletId);
  for (const y of await draughtYield(tx, outletId, date)) {
    if (y.stdPct - y.yieldPct <= controls.settings.draughtYieldGapPts) continue;
    const item = await tx.item.findUniqueOrThrow({ where: { id: y.itemId } });
    const lostMl = y.drawnMl * (y.stdPct / 100) - y.soldMl;
    const barMgr = (await usersWithRole(tx, orgId, ['BAR_MANAGER'], outletId))[0];
    await raiseException(tx, {
      orgId, outletId, type: 'DRAUGHT_YIELD', severity: 'ATTENTION',
      title: `${y.beer} yield ${y.yieldPct}% vs ${y.stdPct}% standard`,
      summary: `${round2(y.drawnMl / 1000)} l drawn from serving tank ${y.tank}, ${round2(y.soldMl / 1000)} l sold.`,
      impact: varianceValue({ ...item, category: 'SPIRITS_WINE' }, lostMl), businessDate: date, groupKey: `DRAUGHT:${outletId}:${y.itemId}:${date}`,
      assigneeId: barMgr?.id, suggestedChecks: ['Check line cleaning and foam loss logs', 'Compare flow meter with tank level'], now,
    });
  }
}

// ─────────────── Counts not started ───────────────

export async function countsNotStarted(tx: Tx, orgId: string, now: Date) {
  const late = await tx.countTask.findMany({ where: { status: 'ASSIGNED', dueAt: { lt: now }, type: { not: 'RECOUNT' } } });
  for (const t of late) {
    const loc = await tx.location.findUniqueOrThrow({ where: { id: t.locationId }, include: { outlet: true } });
    if (loc.outlet.orgId !== orgId) continue;
    const who = await tx.user.findUniqueOrThrow({ where: { id: t.assigneeId } });
    await raiseException(tx, {
      orgId, outletId: t.outletId, type: 'COUNT_NOT_STARTED', severity: 'PENDING',
      title: `${loc.name} ${t.type === 'FULL' ? 'full' : 'spot'} count not started`,
      summary: `${loc.outlet.name}. Assigned to ${who.shortName}, due ${hhmm(t.dueAt)}.`,
      impact: 0, businessDate: t.businessDate, groupKey: `COUNTLATE:${t.id}`, assigneeId: who.id, now,
    });
  }
}

// ─────────────── Day close orchestration ───────────────

export async function closeDay(tx: Tx, orgId: string, outletId: string, date: string, now = new Date()) {
  const before = await tx.exception.count({ where: { orgId, outletId } });
  await kotMatch(tx, orgId, outletId, date, now);
  const { food, bev } = await costException(tx, orgId, outletId, date, now);
  await giveawayChecks(tx, orgId, outletId, date, now);
  await draughtChecks(tx, orgId, outletId, date, now);

  const bills = await tx.bill.findMany({ where: { outletId, businessDate: date, status: 'PAID' } });
  const netSales = bills.reduce((s, b) => s + b.netAmount, 0);
  const lastWeek = await tx.bill.aggregate({ _sum: { netAmount: true }, where: { outletId, businessDate: addDays(date, -7), status: 'PAID' } });
  const give = await tx.giveaway.findMany({ where: { outletId, businessDate: date } });
  const unbilled = await tx.kotItem.aggregate({ _sum: { amount: true }, where: { disposition: 'UNACCOUNTED', kot: { outletId, businessDate: date } } });
  const adj = await tx.stockMovement.findMany({ where: { outletId, businessDate: date, type: 'ADJUSTMENT' } });
  const items = new Map((await tx.item.findMany({ where: { id: { in: adj.map((a) => a.itemId) } } })).map((i) => [i.id, i]));
  const pendingLines = await tx.countLine.findMany({ where: { status: { in: ['NEEDS_APPROVAL', 'SENT_BACK'] }, task: { outletId, businessDate: date, type: { not: 'RECOUNT' } } } });
  const recounts = await tx.countLine.findMany({ where: { originalLineId: { in: pendingLines.map((p) => p.id) } } });
  const stockVariance =
    adj.reduce((s, a) => s + varianceValue(items.get(a.itemId)!, a.qty), 0) +
    pendingLines.reduce((s, l) => s + (recounts.find((r) => r.originalLineId === l.id)?.varianceValue ?? l.varianceValue ?? 0), 0);
  const shifts = await tx.cashShift.findMany({ where: { outletId, businessDate: date, status: { in: ['CLOSED_MATCHED', 'CLOSED_VARIANCE'] } } });
  const kpis = {
    netSales: round2(netSales),
    netSalesLastWeek: round2(lastWeek._sum.netAmount ?? 0),
    dow: dayOfWeek(date),
    foodSales: food.sales,
    foodCost: food.actual,
    foodTheo: food.theoretical,
    foodCostPct: food.sales ? round2((food.actual / food.sales) * 100) : 0,
    foodTheoPct: food.sales ? round2((food.theoretical / food.sales) * 100) : 0,
    bevSales: bev.sales,
    bevCost: bev.actual,
    bevTheo: bev.theoretical,
    bevCostPct: bev.sales ? round2((bev.actual / bev.sales) * 100) : 0,
    bevTheoPct: bev.sales ? round2((bev.theoretical / bev.sales) * 100) : 0,
    giveaways: round2(give.reduce((s, g) => s + g.amount, 0)),
    unbilledKot: round2(unbilled._sum.amount ?? 0),
    stockVariance: round2(stockVariance),
    cashVariance: round2(shifts.reduce((s, x) => s + (x.variance ?? 0), 0)),
    wastage: round2(food.wastage + bev.wastage),
  };
  const created = (await tx.exception.count({ where: { orgId, outletId } })) - before;
  await tx.dayClose.upsert({
    where: { outletId_businessDate: { outletId, businessDate: date } },
    update: { closedAt: now, kpis, exceptionsCreated: created },
    create: { outletId, businessDate: date, closedAt: now, kpis, exceptionsCreated: created },
  });
  return { outletId, date, kpis, exceptionsCreated: created };
}

export async function closeDayAllOutlets(tx: Tx, orgId: string, date: string, now = new Date()) {
  const outlets = await tx.outlet.findMany({ where: { orgId, kind: 'RESTAURANT' } });
  const results = [];
  for (const o of outlets) results.push(await closeDay(tx, orgId, o.id, date, now));
  await countsNotStarted(tx, orgId, now);
  return results;
}


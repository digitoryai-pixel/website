// W2: physical stock count, in the app. Blind count → snapshot → tolerance → blind recount → owner approval.
import type { CountLine, CountTask, Item, Role, User } from '@prisma/client';
import type { Tx } from '../db.js';
import { getControls, limitFor } from '../lib/controls.js';
import { badRequest, conflict, forbidden, notFound } from '../lib/errors.js';
import { inr, qty as fmtQty } from '../lib/format.js';
import { notify } from '../lib/notify.js';
import { assertPeriodOpen } from '../lib/period.js';
import { usersWithRole } from '../lib/people.js';
import { businessDate as bizDate, round2 } from '../lib/time.js';
import { closeException, onAccept, raiseException } from './exceptions.js';
import { openBottleMl, postMovement, theoreticalQty, varianceValue } from './stock.js';

export const COUNTING_ROLES: Role[] = ['COUNTER', 'STORE', 'BAR_STAFF', 'BAR_MANAGER', 'KITCHEN_STAFF', 'RECEIVER'];

/** Items are picked at random and weighted toward liquor and high-value stock, so staff can't prepare. */
export function weightedPick<T extends { item: Pick<Item, 'category' | 'isHighValue'> }>(pool: T[], n: number, rand = Math.random): T[] {
  const bag = pool.map((p) => ({ p, w: (p.item.category === 'SPIRITS_WINE' ? 3 : 1) + (p.item.isHighValue ? 2 : 0) }));
  const out: T[] = [];
  while (out.length < n && bag.length) {
    const total = bag.reduce((s, b) => s + b.w, 0);
    let r = rand() * total;
    const idx = bag.findIndex((b) => (r -= b.w) <= 0);
    out.push(bag.splice(idx === -1 ? bag.length - 1 : idx, 1)[0].p);
  }
  return out;
}

async function pickCounter(tx: Tx, orgId: string, outletId: string, exclude: string[]) {
  const people = (await usersWithRole(tx, orgId, COUNTING_ROLES, outletId)).filter((u) => !exclude.includes(u.id));
  if (!people.length) throw conflict('NO_COUNTER', 'No eligible counter at this outlet');
  const load = await Promise.all(
    people.map(async (u) => ({ u, n: await tx.countTask.count({ where: { assigneeId: u.id, status: { in: ['ASSIGNED', 'IN_PROGRESS'] } } }) })),
  );
  return load.sort((a, b) => a.n - b.n)[0].u;
}

export async function createCountTask(
  tx: Tx,
  a: {
    orgId: string;
    outletId: string;
    locationId: string;
    type: 'SPOT' | 'FULL';
    assigneeId?: string;
    assignedById?: string | null;
    dueAt: Date;
    itemCount?: number;
    periodMonth?: string;
    now?: Date;
    rand?: () => number;
  },
) {
  const now = a.now ?? new Date();
  await assertPeriodOpen(tx, a.orgId, bizDate(now));
  // Never self-assigned.
  if (a.assigneeId && a.assignedById && a.assigneeId === a.assignedById) {
    throw forbidden('SELF_ASSIGN', 'A count cannot be assigned to the person creating it');
  }
  const assignee = a.assigneeId
    ? await tx.user.findFirst({ where: { id: a.assigneeId, orgId: a.orgId, outlets: { some: { outletId: a.outletId } } } })
    : await pickCounter(tx, a.orgId, a.outletId, a.assignedById ? [a.assignedById] : []);
  if (!assignee) throw notFound('Counter');

  const pool = await tx.itemLocation.findMany({ where: { locationId: a.locationId, item: { active: true } }, include: { item: true } });
  if (!pool.length) throw badRequest('EMPTY_LOCATION', 'No items are mapped to this location');
  const controls = await getControls(tx, a.orgId, a.outletId);
  const picked = a.type === 'FULL' ? pool : weightedPick(pool, a.itemCount ?? controls.settings.spotCountItems, a.rand);
  picked.sort((x, y) => x.sortOrder - y.sortOrder); // shelf order, not alphabetical

  const task = await tx.countTask.create({
    data: {
      outletId: a.outletId,
      locationId: a.locationId,
      type: a.type,
      assigneeId: assignee.id,
      assignedById: a.assignedById ?? null,
      dueAt: a.dueAt,
      periodMonth: a.periodMonth,
      businessDate: bizDate(now),
      createdAt: now,
      lines: { create: picked.map((p, i) => ({ itemId: p.itemId, locationId: a.locationId, sortOrder: i })) },
    },
  });
  await notify(tx, {
    userId: assignee.id,
    channels: ['PUSH', 'IN_APP'],
    kind: 'TASK',
    title: a.type === 'FULL' ? 'Full stock count assigned' : 'Spot count assigned',
    body: `${picked.length} items picked by the system. Due ${a.dueAt.toISOString()}.`,
  });
  return task;
}

async function ownTask(tx: Tx, user: User, taskId: string) {
  const task = await tx.countTask.findUnique({ where: { id: taskId }, include: { lines: true } });
  if (!task) throw notFound('Count task');
  if (task.assigneeId !== user.id) throw forbidden('NOT_ASSIGNEE', 'This count is assigned to someone else');
  return task;
}

export async function startTask(tx: Tx, user: User, taskId: string, now = new Date()) {
  const task = await ownTask(tx, user, taskId);
  if (task.status === 'SUBMITTED' || task.status === 'CLOSED') throw conflict('SUBMITTED', 'Already submitted');
  if (task.status === 'ASSIGNED') {
    await tx.countTask.update({ where: { id: taskId }, data: { status: 'IN_PROGRESS', startedAt: now, snapshotAt: now } });
  }
  return counterView(tx, taskId);
}

/** What the counter sees: items by location in shelf order. Never system quantity, never the other count. */
export async function counterView(tx: Tx, taskId: string) {
  const task = await tx.countTask.findUniqueOrThrow({ where: { id: taskId }, include: { lines: { orderBy: { sortOrder: 'asc' } } } });
  const items = await tx.item.findMany({ where: { id: { in: task.lines.map((l) => l.itemId) } } });
  const shelves = await tx.itemLocation.findMany({ where: { locationId: task.locationId, itemId: { in: items.map((i) => i.id) } } });
  const loc = await tx.location.findUniqueOrThrow({ where: { id: task.locationId } });
  const byId = new Map(items.map((i) => [i.id, i]));
  return {
    id: task.id,
    type: task.type,
    status: task.status,
    location: loc.name,
    dueAt: task.dueAt,
    counted: task.lines.filter((l) => l.countedQty !== null).length,
    total: task.lines.length,
    lines: task.lines.map((l) => {
      const it = byId.get(l.itemId)!;
      return {
        id: l.id,
        itemId: it.id,
        name: it.name,
        shelf: shelves.find((s) => s.itemId === it.id)?.shelf ?? null,
        countMode: it.countMode,
        baseUnit: it.baseUnit,
        packSize: it.packSize,
        emptyWeightG: it.emptyWeightG,
        counted: l.countedQty !== null,
        // echo back only what this person entered
        entered: l.countedQty === null ? null : { sealedUnits: l.sealedUnits, openWeightG: l.openWeightG, qty: l.countedQty, method: l.entryMethod },
      };
    }),
  };
}

export type LineEntry = {
  sealedUnits?: number;
  openWeightG?: number;
  scaleReadings?: { kg: number; deviceId?: string }[];
  typedQty?: number;
  photoIds?: string[];
};

export async function enterLine(tx: Tx, user: User, taskId: string, lineId: string, e: LineEntry, now = new Date()) {
  const task = await ownTask(tx, user, taskId);
  if (task.status !== 'IN_PROGRESS') throw conflict('NOT_STARTED', 'Start the count first');
  const line = task.lines.find((l) => l.id === lineId);
  if (!line) throw notFound('Count line');
  const item = await tx.item.findUniqueOrThrow({ where: { id: line.itemId } });
  const controls = await getControls(tx, user.orgId, task.outletId);

  let q: number;
  let method: 'SCALE' | 'TYPED' | 'UNITS';
  let typedFlag = false;
  if (item.countMode === 'BOTTLE_AND_OPEN') {
    if (e.sealedUnits === undefined) throw badRequest('SEALED_REQUIRED', 'Enter sealed bottles (0 if none)');
    const open = e.openWeightG ? openBottleMl(item, e.openWeightG) : 0;
    q = e.sealedUnits * (item.packSize ?? 0) + open;
    method = e.openWeightG ? 'SCALE' : 'UNITS';
  } else if (item.countMode === 'WEIGHT') {
    if (e.scaleReadings?.length) {
      q = e.scaleReadings.reduce((s, r) => s + r.kg, 0);
      method = 'SCALE';
    } else if (e.typedQty !== undefined) {
      q = e.typedQty;
      method = 'TYPED';
      typedFlag = true; // typed weights are allowed but flagged for review
    } else throw badRequest('QTY_REQUIRED', 'Put the item on the scale or type the weight');
  } else {
    if (e.typedQty === undefined) throw badRequest('QTY_REQUIRED', 'Enter the count');
    q = e.typedQty;
    method = 'UNITS';
  }
  if (q < 0 || !Number.isFinite(q)) throw badRequest('QTY_INVALID', 'Quantity must be zero or more');

  const value = q * item.standardCost;
  if (value > controls.settings.countPhotoAbove && !e.photoIds?.length) {
    throw badRequest('PHOTO_REQUIRED', `Photo required above ${inr(controls.settings.countPhotoAbove)}`);
  }
  if (e.photoIds?.length) {
    await tx.attachment.updateMany({ where: { id: { in: e.photoIds }, orgId: user.orgId }, data: { entityType: 'countLine', entityId: lineId } });
  }
  await tx.countLine.update({
    where: { id: lineId },
    data: {
      countedQty: round2(q),
      sealedUnits: e.sealedUnits,
      openWeightG: e.openWeightG,
      scaleReadings: e.scaleReadings?.map((r) => ({ ...r, at: now.toISOString() })),
      entryMethod: method,
      typedFlag,
      countedAt: now,
      countedById: user.id,
      status: 'COUNTED',
    },
  });
  return counterView(tx, taskId);
}

function withinTolerance(item: Item, tol: { pct: number; rupees: number }, system: number, variance: number) {
  const value = Math.abs(varianceValue(item, variance));
  const pct = system === 0 ? (variance === 0 ? 0 : Infinity) : (Math.abs(variance) / Math.abs(system)) * 100;
  return pct <= tol.pct || value <= tol.rupees;
}

/**
 * M5: submit. The counter is never told the result. The system snapshots theoretical
 * stock at the moment each line was counted, compares, auto-accepts or asks for a recount.
 */
export async function submitTask(tx: Tx, user: User, taskId: string, now = new Date()) {
  const task = await ownTask(tx, user, taskId);
  if (task.status !== 'IN_PROGRESS') throw conflict('NOT_IN_PROGRESS', 'This count is not in progress');
  if (task.lines.some((l) => l.countedQty === null)) throw badRequest('INCOMPLETE', 'Count every item before submitting');
  await assertPeriodOpen(tx, user.orgId, task.businessDate);
  await tx.countTask.update({ where: { id: taskId }, data: { status: 'SUBMITTED', submittedAt: now } });

  if (task.type === 'RECOUNT') await evaluateRecount(tx, user, task, now);
  else await evaluateFirstCount(tx, user, task, now);

  const photos = await tx.attachment.count({ where: { entityType: 'countLine', entityId: { in: task.lines.map((l) => l.id) } } });
  const fresh = await tx.countLine.findMany({ where: { taskId } });
  return {
    submittedAt: now,
    items: fresh.length,
    scaleReadings: fresh.filter((l) => l.entryMethod === 'SCALE').length,
    photos,
    typedWeights: fresh.filter((l) => l.typedFlag).length,
    message: "The system is checking your count against sales. You won't see the result.",
  };
}

async function evaluateFirstCount(tx: Tx, user: User, task: CountTask & { lines: CountLine[] }, now: Date) {
  const controls = await getControls(tx, user.orgId, task.outletId);
  const lines = await tx.countLine.findMany({ where: { taskId: task.id } });
  const items = new Map((await tx.item.findMany({ where: { id: { in: lines.map((l) => l.itemId) } } })).map((i) => [i.id, i]));
  const off: CountLine[] = [];

  for (const l of lines) {
    const item = items.get(l.itemId)!;
    const system = await theoreticalQty(tx, task.outletId, item.id, l.countedAt ?? now, l.locationId);
    const variance = round2(l.countedQty! - system);
    const within = withinTolerance(item, controls.tolerances[item.category], system, variance);
    await tx.countLine.update({
      where: { id: l.id },
      data: { systemQty: system, variance, varianceValue: varianceValue(item, variance), status: within ? 'AUTO_ACCEPTED' : 'RECOUNT_REQUESTED' },
    });
    if (within) {
      await postMovement(tx, {
        outletId: task.outletId, item, locationId: l.locationId, type: 'ADJUSTMENT', qty: variance, at: l.countedAt ?? now,
        businessDate: task.businessDate, refType: 'countLine', refId: l.id, reasonCode: 'COUNT_WITHIN_TOLERANCE', createdById: l.countedById,
      });
    } else off.push(l);
  }

  if (off.length) {
    // Recount is always by a different person, counted blind.
    const recounter = await pickCounter(tx, user.orgId, task.outletId, [task.assigneeId]);
    const recount = await tx.countTask.create({
      data: {
        outletId: task.outletId,
        locationId: task.locationId,
        type: 'RECOUNT',
        assigneeId: recounter.id,
        parentTaskId: task.id,
        dueAt: new Date(now.getTime() + 35 * 60_000),
        businessDate: task.businessDate,
        periodMonth: task.periodMonth,
        createdAt: now,
        lines: { create: off.map((l, i) => ({ itemId: l.itemId, locationId: l.locationId, sortOrder: i, originalLineId: l.id })) },
      },
    });
    await notify(tx, {
      userId: recounter.id,
      channels: ['PUSH', 'IN_APP'],
      kind: 'TASK',
      title: 'Recount requested',
      body: `${off.length} items, requested by the system. Count exactly as you would normally.`,
    });
    return recount;
  }
  await tx.countTask.update({ where: { id: task.id }, data: { status: 'CLOSED' } });
  return null;
}

async function evaluateRecount(tx: Tx, user: User, recount: CountTask & { lines: CountLine[] }, now: Date) {
  const controls = await getControls(tx, user.orgId, recount.outletId);
  const parent = await tx.countTask.findUniqueOrThrow({ where: { id: recount.parentTaskId! } });
  const lines = await tx.countLine.findMany({ where: { taskId: recount.id } });
  const items = new Map((await tx.item.findMany({ where: { id: { in: lines.map((l) => l.itemId) } } })).map((i) => [i.id, i]));
  const loc = await tx.location.findUniqueOrThrow({ where: { id: recount.locationId } });
  const counter1 = await tx.user.findUniqueOrThrow({ where: { id: parent.assigneeId } });

  for (const l of lines) {
    const item = items.get(l.itemId)!;
    const system = await theoreticalQty(tx, recount.outletId, item.id, l.countedAt ?? now, l.locationId);
    const variance = round2(l.countedQty! - system);
    const value = varianceValue(item, variance);
    const within = withinTolerance(item, controls.tolerances[item.category], system, variance);
    const original = await tx.countLine.findUniqueOrThrow({ where: { id: l.originalLineId! } });
    await tx.countLine.update({ where: { id: l.id }, data: { systemQty: system, variance, varianceValue: value, status: within ? 'RECOUNT_MATCHED' : 'NEEDS_APPROVAL' } });

    if (within) {
      await tx.countLine.update({ where: { id: original.id }, data: { status: variance === 0 ? 'RECOUNT_MATCHED' : 'WITHIN_TOLERANCE' } });
      await postMovement(tx, {
        outletId: recount.outletId, item, locationId: l.locationId, type: 'ADJUSTMENT', qty: variance, at: l.countedAt ?? now,
        businessDate: recount.businessDate, refType: 'countLine', refId: l.id, reasonCode: 'RECOUNT_WITHIN_TOLERANCE', createdById: l.countedById,
      });
      continue;
    }

    // Still off: reaches the owner (S3) as an exception with the two counters excluded from approval.
    const isLiquor = item.category === 'SPIRITS_WINE';
    const severity = Math.abs(value) >= controls.settings.criticalImpactAbove ? 'CRITICAL' : Math.abs(value) >= 2000 ? 'ATTENTION' : 'PENDING';
    const barMgr = isLiquor ? (await usersWithRole(tx, user.orgId, ['BAR_MANAGER'], recount.outletId))[0] : null;
    const pegs = isLiquor ? Math.round(Math.abs(variance) / 30) : 0;
    const ex = await raiseException(tx, {
      orgId: user.orgId,
      outletId: recount.outletId,
      type: isLiquor ? 'LIQUOR_VARIANCE' : 'STOCK_VARIANCE',
      severity,
      title: `${item.name} ${variance < 0 ? 'short' : 'over'} by ${fmtQty(Math.abs(variance), item.baseUnit)} after recount`,
      summary: `${loc.name}. Counted by ${counter1.shortName}, recounted by ${user.shortName}.${isLiquor ? ` About ${pegs} pegs at selling price.` : ''}`,
      impact: Math.abs(value),
      businessDate: recount.businessDate,
      groupKey: `COUNT:${recount.outletId}:${item.id}:${recount.businessDate}`,
      assigneeId: barMgr?.id,
      involvedUserIds: [parent.assigneeId, recount.assigneeId],
      detail: { countTaskId: parent.id, recountTaskId: recount.id, lineId: original.id, recountLineId: l.id, system, count1: original.countedQty, recount: l.countedQty, unit: item.baseUnit },
      suggestedChecks: isLiquor
        ? ['Check comps and staff drinks logged since last count', 'Review bar CCTV for the last shift', 'Confirm all bottles received were put on the shelf']
        : ['Check unlogged wastage for this item', 'Confirm receipts since last count', 'Weigh a sample of portions'],
      sourceRefs: [{ type: 'countTask', id: parent.id, label: `Count at ${loc.name}` }],
      now,
    });
    await tx.countLine.update({ where: { id: original.id }, data: { status: 'NEEDS_APPROVAL', exceptionId: ex.id } });
  }

  const stillOpen = await tx.countLine.count({ where: { taskId: parent.id, status: { in: ['NEEDS_APPROVAL', 'RECOUNT_REQUESTED'] } } });
  if (!stillOpen) await tx.countTask.update({ where: { id: parent.id }, data: { status: 'CLOSED' } });
  await tx.countTask.update({ where: { id: recount.id }, data: { status: 'CLOSED' } });
}

/** S3 approve: posts adjustments with a reason code and approver. The counters are excluded. */
export async function approveLines(tx: Tx, user: User, taskId: string, lineIds: string[], reasonCode: string, now = new Date(), fromException = false) {
  if (!reasonCode) throw badRequest('REASON_REQUIRED', 'Approving needs a reason code');
  const rc = await tx.reasonCode.findFirst({ where: { orgId: user.orgId, domain: { in: ['STOCK_ADJ', 'EXCEPTION_CLOSE', 'KOT_EXPLAIN'] }, code: reasonCode } });
  if (!rc) throw badRequest('REASON_INVALID', 'Unknown reason code');
  const task = await tx.countTask.findUniqueOrThrow({ where: { id: taskId } });
  const recount = await tx.countTask.findFirst({ where: { parentTaskId: taskId } });
  if ([task.assigneeId, recount?.assigneeId].includes(user.id)) {
    throw forbidden('SELF_APPROVAL', 'People who counted cannot approve this count');
  }
  await assertPeriodOpen(tx, user.orgId, task.businessDate);
  const controls = await getControls(tx, user.orgId, task.outletId);
  const lines = await tx.countLine.findMany({ where: { id: { in: lineIds }, taskId, status: 'NEEDS_APPROVAL' } });
  if (lines.length !== lineIds.length) throw badRequest('LINES_INVALID', 'Some lines do not need approval');

  for (const l of lines) {
    const rl = recount ? await tx.countLine.findFirst({ where: { taskId: recount.id, originalLineId: l.id } }) : null;
    const item = await tx.item.findUniqueOrThrow({ where: { id: l.itemId } });
    const variance = rl?.variance ?? l.variance ?? 0;
    const value = Math.abs(varianceValue(item, variance));
    if (value > limitFor(controls, user.role, 'stockAdj')) {
      throw forbidden('ABOVE_LIMIT', `${item.name}: ${inr(value)} is above your stock adjustment limit`);
    }
    await postMovement(tx, {
      outletId: task.outletId, item, locationId: l.locationId, type: 'ADJUSTMENT', qty: variance, at: rl?.countedAt ?? l.countedAt ?? now,
      businessDate: task.businessDate, refType: 'countLine', refId: l.id, reasonCode, approvedById: user.id, createdById: user.id,
    });
    await tx.countLine.update({ where: { id: l.id }, data: { status: 'APPROVED', approvedById: user.id, approvedAt: now, approvalReason: reasonCode } });
    if (rl) await tx.countLine.update({ where: { id: rl.id }, data: { status: 'APPROVED', approvedById: user.id, approvedAt: now, approvalReason: reasonCode } });
    if (l.exceptionId && !fromException) {
      const ex = await tx.exception.findUnique({ where: { id: l.exceptionId } });
      if (ex && ex.status !== 'RESOLVED') {
        await tx.exception.update({ where: { id: ex.id }, data: { status: 'RESOLVED', closedAt: now, closedById: user.id, closeReasonCode: reasonCode, closeNote: 'Approved in stock count review' } });
        await tx.exceptionEvent.create({ data: { exceptionId: ex.id, at: now, actorId: user.id, kind: 'CLOSED', payload: { via: 'S3', reasonCode } } });
      }
    }
  }
  const stillOpen = await tx.countLine.count({ where: { taskId, status: { in: ['NEEDS_APPROVAL', 'RECOUNT_REQUESTED'] } } });
  if (!stillOpen) await tx.countTask.update({ where: { id: taskId }, data: { status: 'CLOSED' } });
  return { approved: lines.length };
}

/** "Send back for investigation" opens (or keeps) an exception with an owner and SLA. */
export async function sendBack(tx: Tx, user: User, taskId: string, lineIds: string[], note: string, now = new Date()) {
  const lines = await tx.countLine.findMany({ where: { id: { in: lineIds }, taskId, status: 'NEEDS_APPROVAL' } });
  for (const l of lines) {
    await tx.countLine.update({ where: { id: l.id }, data: { status: 'SENT_BACK' } });
    if (l.exceptionId) {
      await tx.exceptionEvent.create({ data: { exceptionId: l.exceptionId, at: now, actorId: user.id, kind: 'SENT_BACK', payload: { note } } });
    }
  }
  return { sentBack: lines.length };
}

// Accepting a stock/liquor variance explanation approves the line it came from.
for (const t of ['STOCK_VARIANCE', 'LIQUOR_VARIANCE'] as const) {
  onAccept(t, async (tx, ex, approver, reasonCode) => {
    const d = ex.detail as { countTaskId?: string; lineId?: string } | null;
    if (!d?.countTaskId || !d.lineId) return;
    const line = await tx.countLine.findUnique({ where: { id: d.lineId } });
    if (line && (line.status === 'NEEDS_APPROVAL' || line.status === 'SENT_BACK')) {
      if (line.status === 'SENT_BACK') await tx.countLine.update({ where: { id: line.id }, data: { status: 'NEEDS_APPROVAL' } });
      await approveLines(tx, approver, d.countTaskId, [d.lineId], reasonCode, new Date(), true);
    }
  });
}

/** S3 review payload: both counts, snapshot time, variance, evidence, status. */
export async function reviewTask(tx: Tx, taskId: string) {
  const task = await tx.countTask.findUniqueOrThrow({ where: { id: taskId }, include: { lines: { orderBy: { sortOrder: 'asc' } } } });
  const recount = await tx.countTask.findFirst({ where: { parentTaskId: taskId }, include: { lines: true } });
  const items = new Map((await tx.item.findMany({ where: { id: { in: task.lines.map((l) => l.itemId) } } })).map((i) => [i.id, i]));
  const locs = new Map((await tx.location.findMany({ where: { outletId: task.outletId } })).map((l) => [l.id, l]));
  const people = new Map((await tx.user.findMany({ where: { id: { in: [task.assigneeId, recount?.assigneeId].filter(Boolean) as string[] } } })).map((u) => [u.id, u]));
  const evidence = await tx.attachment.findMany({ where: { entityType: 'countLine', entityId: { in: [...task.lines, ...(recount?.lines ?? [])].map((l) => l.id) } } });

  const rows = task.lines.map((l) => {
    const rl = recount?.lines.find((r) => r.originalLineId === l.id);
    const item = items.get(l.itemId)!;
    const finalVar = rl?.variance ?? l.variance ?? 0;
    const lineEvidence = evidence.filter((e) => e.entityId === l.id || e.entityId === rl?.id);
    return {
      lineId: l.id,
      item: item.name,
      category: item.category,
      unit: item.baseUnit,
      location: locs.get(l.locationId)?.name,
      systemAtSnapshot: l.systemQty,
      count1: l.countedQty,
      recount: rl?.countedQty ?? null,
      variance: finalVar,
      value: varianceValue(item, finalVar),
      scale: [l.entryMethod, rl?.entryMethod].includes('SCALE'),
      typed: l.typedFlag || !!rl?.typedFlag,
      photos: lineEvidence.map((e) => ({ id: e.id, kind: e.kind })),
      status: l.status,
      exceptionId: l.exceptionId,
    };
  });
  const net = rows.filter((r) => r.status !== 'RECOUNT_REQUESTED').reduce((s, r) => s + r.value, 0);
  return {
    id: task.id,
    type: task.type,
    outletId: task.outletId,
    location: locs.get(task.locationId)?.name,
    status: task.status,
    counter: people.get(task.assigneeId)?.shortName,
    counterId: task.assigneeId,
    countedAt: task.startedAt,
    recounter: recount ? people.get(recount.assigneeId)?.shortName : null,
    recounterId: recount?.assigneeId ?? null,
    recountedAt: recount?.startedAt ?? null,
    snapshotAt: task.snapshotAt,
    summary: {
      itemsCounted: rows.length,
      withinTolerance: rows.filter((r) => r.status === 'AUTO_ACCEPTED').length,
      recounted: recount?.lines.length ?? 0,
      stillOff: rows.filter((r) => r.status === 'NEEDS_APPROVAL' || r.status === 'SENT_BACK').length,
      netVariance: round2(net),
    },
    lines: rows,
  };
}

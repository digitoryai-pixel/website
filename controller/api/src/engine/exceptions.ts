// W1 + W3: every exception has a ₹ impact, an owner and a due time before anyone opens the app.
import type { Exception, ExceptionType, Prisma, Role, Severity, User } from '@prisma/client';
import type { Tx } from '../db.js';
import { getControls, limitFor, type ApprovalLimit } from '../lib/controls.js';
import { badRequest, forbidden, notFound, conflict } from '../lib/errors.js';
import { inr } from '../lib/format.js';
import { notify } from '../lib/notify.js';
import { outletManager, owner, financeHead, ROLE_LABEL } from '../lib/people.js';
import { hours } from '../lib/time.js';
import { audit } from '../lib/audit.js';

export type Driver = { label: string; amount: number };
export type Check = { label: string; done: boolean; byId?: string; at?: string };
export type SourceRef = { type: string; id: string; label: string };

export type RaiseInput = {
  orgId: string;
  outletId: string | null;
  outletIds?: string[];
  type: ExceptionType;
  severity: Severity;
  title: string;
  summary: string;
  impact: number;
  businessDate: string;
  groupKey: string;
  /** Person closest to the problem (bar manager for liquor, head chef for food cost). Defaults to outlet manager. */
  assigneeId?: string | null;
  ownerLabel?: string;
  /** Skip the outlet chain entirely (a manager gave or approved what is being questioned). */
  routePastOutlet?: boolean;
  /** Anyone who gave, approved or entered what is being questioned. They are skipped in routing. */
  involvedUserIds?: string[];
  drivers?: Driver[];
  detail?: Prisma.InputJsonValue;
  suggestedChecks?: string[];
  sourceRefs?: SourceRef[];
  now?: Date;
};

const SEVERITY_RANK: Record<Severity, number> = { CRITICAL: 0, ATTENTION: 1, PENDING: 2 };

/** Which approval limit applies when an explanation is accepted for this exception type. */
const LIMIT_KIND: Partial<Record<ExceptionType, keyof ApprovalLimit>> = {
  UNBILLED_KOT: 'comps',
  GIVEAWAY_PATTERN: 'comps',
  VOID_AFTER_PAYMENT: 'comps',
  REFUND_MODE_MISMATCH: 'comps',
  STOCK_VARIANCE: 'stockAdj',
  LIQUOR_VARIANCE: 'stockAdj',
  TRANSFER_GAP: 'stockAdj',
  TRANSFER_OVERDUE: 'stockAdj',
  WASTAGE_ABOVE_LIMIT: 'wastage',
  CASH_VARIANCE: 'stockAdj',
  CASH_PATTERN: 'stockAdj',
};

/** Side effects applied when an explanation is accepted (e.g. KOT items become NC with an approver). */
type Effect = (tx: Tx, ex: Exception, approver: User, reasonCode: string) => Promise<void>;
const acceptEffects = new Map<ExceptionType, Effect>();
export function onAccept(type: ExceptionType, fn: Effect) {
  acceptEffects.set(type, fn);
}

export async function raiseException(tx: Tx, input: RaiseInput): Promise<Exception> {
  const now = input.now ?? new Date();
  const involved = new Set(input.involvedUserIds ?? []);

  // Repeat patterns (same item, staff, shift, vendor) group into one exception with history.
  const existing = await tx.exception.findFirst({ where: { groupKey: input.groupKey, status: { not: 'RESOLVED' } } });
  if (existing) {
    const severity = SEVERITY_RANK[input.severity] < SEVERITY_RANK[existing.severity] ? input.severity : existing.severity;
    const updated = await tx.exception.update({
      where: { id: existing.id },
      data: {
        occurrences: { increment: 1 },
        impact: Math.max(existing.impact, input.impact),
        severity,
        summary: input.summary,
        drivers: (input.drivers as Prisma.InputJsonValue) ?? undefined,
        detail: input.detail ?? undefined,
        sourceRefs: (input.sourceRefs as Prisma.InputJsonValue) ?? undefined,
        involvedUserIds: [...new Set([...existing.involvedUserIds, ...involved])],
      },
    });
    await tx.exceptionEvent.create({
      data: { exceptionId: existing.id, kind: 'REOCCURRED', payload: { businessDate: input.businessDate, impact: input.impact } },
    });
    return updated;
  }

  const controls = await getControls(tx, input.orgId, input.outletId);
  const mgr = await outletManager(tx, input.orgId, input.outletId);
  const own = await owner(tx, input.orgId);
  const fin = await financeHead(tx, input.orgId);
  if (!own) throw new Error('Org has no owner');

  // Default assignee, then walk up past anyone who was involved.
  const chain: string[] = [];
  const candidates = input.routePastOutlet ? [own.id] : [input.assigneeId ?? mgr?.id, mgr?.id, own.id];
  for (const id of candidates) if (id && !chain.includes(id)) chain.push(id);
  const eligible = chain.filter((id) => !involved.has(id));
  const assigneeId = eligible[0] ?? own.id;
  const routedPastOutlet = !!input.routePastOutlet || (assigneeId === own.id && chain[0] !== own.id);
  const escalationPath = eligible.slice(eligible.indexOf(assigneeId) + 1);

  const ex = await tx.exception.create({
    data: {
      orgId: input.orgId,
      outletId: input.outletId,
      outletIds: input.outletIds ?? (input.outletId ? [input.outletId] : []),
      type: input.type,
      severity: input.severity,
      title: input.title,
      summary: input.summary,
      impact: Math.round(input.impact),
      businessDate: input.businessDate,
      groupKey: input.groupKey,
      assigneeId,
      ownerLabel: input.ownerLabel,
      routedPastOutlet,
      involvedUserIds: [...involved],
      escalationPath,
      dueAt: new Date(now.getTime() + hours(controls.sla[input.severity].hours)),
      drivers: (input.drivers as Prisma.InputJsonValue) ?? undefined,
      detail: input.detail,
      suggestedChecks: input.suggestedChecks?.map((label) => ({ label, done: false })) ?? undefined,
      sourceRefs: (input.sourceRefs as Prisma.InputJsonValue) ?? undefined,
      createdAt: now,
    },
  });
  await tx.exceptionEvent.create({
    data: { exceptionId: ex.id, at: now, kind: 'CREATED', payload: { assigneeId, routedPastOutlet, escalationPath } },
  });

  const msg = `${ex.title}\n${ex.summary}\nImpact ${inr(ex.impact)}.`;
  await notify(tx, { userId: assigneeId, channels: ['PUSH', 'IN_APP'], kind: 'ASSIGNED', title: ex.title, body: msg, exceptionId: ex.id });
  // Criticals reach the owner directly and at the same time; the outlet cannot delay or hide them.
  if (ex.severity === 'CRITICAL') {
    await notify(tx, { userId: own.id, channels: ['WHATSAPP', 'IN_APP'], kind: 'CRITICAL', title: ex.title, body: msg, exceptionId: ex.id });
    if (fin && fin.id !== own.id) {
      await notify(tx, { userId: fin.id, channels: ['IN_APP'], kind: 'CRITICAL', title: ex.title, body: msg, exceptionId: ex.id });
    }
  }
  return ex;
}

async function load(tx: Tx, id: string, orgId: string) {
  const ex = await tx.exception.findFirst({ where: { id, orgId } });
  if (!ex) throw notFound('Exception');
  return ex;
}

function isAbove(ex: Exception, user: User) {
  return ex.escalationPath.includes(user.id) || user.role === 'OWNER' || user.role === 'FINANCE_HEAD';
}

function assertNotInvolved(ex: Exception, user: User) {
  if (ex.involvedUserIds.includes(user.id)) {
    throw forbidden('SELF_APPROVAL', 'You were involved in this item, so you cannot close or approve it');
  }
}

async function validateReason(tx: Tx, orgId: string, domains: string[], code: string | undefined) {
  if (!code) throw badRequest('REASON_REQUIRED', 'A reason code is required; free text alone is not accepted');
  const r = await tx.reasonCode.findFirst({ where: { orgId, domain: { in: domains }, code } });
  if (!r) throw badRequest('REASON_INVALID', `Unknown reason code ${code}`);
  return r;
}

async function assertEvidence(tx: Tx, orgId: string, ids: string[] | undefined) {
  if (!ids?.length) throw badRequest('EVIDENCE_REQUIRED', 'Attach at least one photo, scale reading or document');
  const n = await tx.attachment.count({ where: { orgId, id: { in: ids } } });
  if (n !== ids.length) throw badRequest('EVIDENCE_INVALID', 'One or more attachments were not found');
}

async function linkEvidence(tx: Tx, exId: string, ids: string[]) {
  await tx.attachment.updateMany({ where: { id: { in: ids }, entityId: null }, data: { entityType: 'exception', entityId: exId } });
}

export async function closeException(
  tx: Tx,
  user: User,
  id: string,
  body: { reasonCode?: string; note?: string; evidenceIds?: string[] },
  now = new Date(),
) {
  const ex = await load(tx, id, user.orgId);
  if (ex.status === 'RESOLVED') throw conflict('ALREADY_CLOSED', 'This exception is already closed');
  if (ex.assigneeId !== user.id && !isAbove(ex, user)) throw forbidden('NOT_OWNER', 'Only the owner of this item or someone above can close it');
  assertNotInvolved(ex, user);
  const reason = await validateReason(tx, user.orgId, ['EXCEPTION_CLOSE', 'KOT_EXPLAIN', 'STOCK_ADJ'], body.reasonCode);
  await assertEvidence(tx, user.orgId, body.evidenceIds);

  // Above the closer's limit the decision moves up (same rule as M12).
  const kind = LIMIT_KIND[ex.type];
  if (kind && ex.status === 'OPEN') {
    const controls = await getControls(tx, user.orgId, ex.outletId);
    if (ex.impact > limitFor(controls, user.role, kind)) {
      return explainException(tx, user, id, { reasonCode: reason.code, note: body.note ?? '', evidenceIds: body.evidenceIds }, now);
    }
  }
  const effect = acceptEffects.get(ex.type);
  if (effect) await effect(tx, ex, user, reason.code);
  await linkEvidence(tx, ex.id, body.evidenceIds!);
  const closed = await tx.exception.update({
    where: { id },
    data: { status: 'RESOLVED', closedAt: now, closedById: user.id, closeReasonCode: reason.code, closeNote: body.note },
  });
  await tx.exceptionEvent.create({
    data: { exceptionId: id, at: now, actorId: user.id, kind: 'CLOSED', payload: { reasonCode: reason.code, note: body.note, evidenceIds: body.evidenceIds } },
  });
  await audit(tx, { orgId: user.orgId, actorId: user.id, action: 'exception.close', entity: 'exception', entityId: id, after: { reasonCode: reason.code } });
  await feedbackRepeatCause(tx, closed, now);
  return closed;
}

/**
 * M12: the assignee explains with a reason code and evidence. Within their limit it closes;
 * above it, the decision moves up automatically.
 */
export async function explainException(
  tx: Tx,
  user: User,
  id: string,
  body: { reasonCode: string; note: string; evidenceIds?: string[] },
  now = new Date(),
) {
  const ex = await load(tx, id, user.orgId);
  if (ex.status !== 'OPEN') throw conflict('NOT_OPEN', 'Only open exceptions can be explained');
  if (ex.assigneeId !== user.id && !isAbove(ex, user)) throw forbidden('NOT_OWNER', 'This item is not assigned to you');
  assertNotInvolved(ex, user);
  const reason = await validateReason(tx, user.orgId, ['KOT_EXPLAIN', 'EXCEPTION_CLOSE', 'STOCK_ADJ'], body.reasonCode);
  await assertEvidence(tx, user.orgId, body.evidenceIds);
  await linkEvidence(tx, id, body.evidenceIds!);

  const controls = await getControls(tx, user.orgId, ex.outletId);
  const kind = LIMIT_KIND[ex.type] ?? 'stockAdj';
  const limit = limitFor(controls, user.role, kind);
  const explanation = { reasonCode: reason.code, note: body.note, byId: user.id, at: now.toISOString(), evidenceIds: body.evidenceIds };

  if (ex.impact <= limit) {
    const effect = acceptEffects.get(ex.type);
    if (effect) await effect(tx, ex, user, reason.code);
    const done = await tx.exception.update({
      where: { id },
      data: { explanation, status: 'RESOLVED', closedAt: now, closedById: user.id, closeReasonCode: reason.code, closeNote: body.note, decisionById: user.id },
    });
    await tx.exceptionEvent.create({ data: { exceptionId: id, at: now, actorId: user.id, kind: 'EXPLAINED', payload: { ...explanation, withinLimit: true } } });
    await feedbackRepeatCause(tx, done, now);
    return done;
  }

  const decider = ex.escalationPath.find((uid) => uid !== user.id) ?? (await owner(tx, user.orgId))!.id;
  const updated = await tx.exception.update({
    where: { id },
    data: {
      explanation,
      status: 'AWAITING_DECISION',
      assigneeId: decider,
      escalationPath: ex.escalationPath.filter((u) => u !== decider),
    },
  });
  await tx.exceptionEvent.create({
    data: { exceptionId: id, at: now, actorId: user.id, kind: 'EXPLAINED', payload: { ...explanation, withinLimit: false, routedTo: decider } },
  });
  await notify(tx, {
    userId: decider,
    channels: ['PUSH', 'WHATSAPP', 'IN_APP'],
    kind: 'DECISION',
    title: `Decide: ${ex.title}`,
    body: `${user.shortName} explained: ${reason.label}. ${body.note}\nAbove their limit, so it needs your accept or reject.`,
    exceptionId: id,
  });
  return updated;
}

export async function decideException(
  tx: Tx,
  user: User,
  id: string,
  body: { decision: 'ACCEPT' | 'REJECT'; note?: string },
  now = new Date(),
) {
  const ex = await load(tx, id, user.orgId);
  if (ex.status !== 'AWAITING_DECISION') throw conflict('NOT_AWAITING', 'Nothing to decide on this exception');
  if (ex.assigneeId !== user.id && !isAbove(ex, user)) throw forbidden('NOT_DECIDER', 'This decision is not yours');
  assertNotInvolved(ex, user);
  const expl = ex.explanation as { reasonCode: string; byId: string } | null;
  if (expl?.byId === user.id) throw forbidden('SELF_APPROVAL', 'You cannot accept your own explanation');

  if (body.decision === 'ACCEPT') {
    const effect = acceptEffects.get(ex.type);
    if (effect) await effect(tx, ex, user, expl!.reasonCode);
    const done = await tx.exception.update({
      where: { id },
      data: { status: 'RESOLVED', decisionById: user.id, closedAt: now, closedById: user.id, closeReasonCode: expl!.reasonCode, closeNote: body.note },
    });
    await tx.exceptionEvent.create({ data: { exceptionId: id, at: now, actorId: user.id, kind: 'ACCEPTED', payload: { note: body.note } } });
    await feedbackRepeatCause(tx, done, now);
    return done;
  }
  if (!body.note?.trim()) throw badRequest('NOTE_REQUIRED', 'Say why the explanation is rejected');
  const controls = await getControls(tx, user.orgId, ex.outletId);
  const updated = await tx.exception.update({
    where: { id },
    data: {
      status: 'OPEN',
      assigneeId: expl?.byId ?? user.id,
      escalationPath: [user.id, ...ex.escalationPath.filter((u) => u !== user.id)],
      dueAt: new Date(now.getTime() + hours(controls.sla[ex.severity].hours)),
      decisionById: user.id,
    },
  });
  await tx.exceptionEvent.create({ data: { exceptionId: id, at: now, actorId: user.id, kind: 'REJECTED', payload: { note: body.note } } });
  if (expl?.byId) {
    await notify(tx, { userId: expl.byId, channels: ['PUSH', 'IN_APP'], kind: 'DECISION', title: `Explanation rejected: ${ex.title}`, body: body.note, exceptionId: id });
  }
  return updated;
}

export async function reassignException(tx: Tx, user: User, id: string, toUserId: string, now = new Date()) {
  const ex = await load(tx, id, user.orgId);
  if (ex.status === 'RESOLVED') throw conflict('ALREADY_CLOSED', 'Closed exceptions cannot be reassigned');
  if (!isAbove(ex, user) && ex.assigneeId !== user.id) throw forbidden('NOT_ALLOWED', 'Only the assignee or someone above can reassign');
  if (ex.involvedUserIds.includes(toUserId)) throw badRequest('INVOLVED', 'That person was involved in this item and cannot own it');
  const target = await tx.user.findFirst({ where: { id: toUserId, orgId: user.orgId, active: true } });
  if (!target) throw notFound('User');
  const path = [ex.assigneeId, ...ex.escalationPath].filter((u): u is string => !!u && u !== toUserId);
  const updated = await tx.exception.update({ where: { id }, data: { assigneeId: toUserId, escalationPath: path } });
  await tx.exceptionEvent.create({ data: { exceptionId: id, at: now, actorId: user.id, kind: 'REASSIGNED', payload: { from: ex.assigneeId, to: toUserId } } });
  await notify(tx, { userId: toUserId, channels: ['PUSH', 'IN_APP'], kind: 'ASSIGNED', title: ex.title, body: `${user.shortName} assigned this to you.`, exceptionId: id });
  return updated;
}

export async function tickCheck(tx: Tx, user: User, id: string, index: number, done: boolean, now = new Date()) {
  const ex = await load(tx, id, user.orgId);
  const checks = ((ex.suggestedChecks as Check[] | null) ?? []).slice();
  if (!checks[index]) throw notFound('Check');
  checks[index] = { ...checks[index], done, byId: user.id, at: now.toISOString() };
  await tx.exception.update({ where: { id }, data: { suggestedChecks: checks } });
  await tx.exceptionEvent.create({ data: { exceptionId: id, at: now, actorId: user.id, kind: 'CHECK', payload: { index, label: checks[index].label, done } } });
  return checks;
}

/** SLA breach moves the item one level up automatically. */
export async function escalateOverdue(tx: Tx, now = new Date()) {
  const overdue = await tx.exception.findMany({ where: { status: { in: ['OPEN', 'AWAITING_DECISION'] }, dueAt: { lt: now } } });
  let moved = 0;
  for (const ex of overdue) {
    const next = ex.escalationPath[0];
    if (!next) continue; // already with the top of the chain
    const controls = await getControls(tx, ex.orgId, ex.outletId);
    await tx.exception.update({
      where: { id: ex.id },
      data: {
        assigneeId: next,
        escalationPath: ex.escalationPath.slice(1),
        escalationLevel: { increment: 1 },
        dueAt: new Date(now.getTime() + hours(controls.sla[ex.severity].hours)),
        routedPastOutlet: ex.routedPastOutlet || (await tx.user.findUnique({ where: { id: next } }))?.role === 'OWNER',
      },
    });
    await tx.exceptionEvent.create({ data: { exceptionId: ex.id, at: now, kind: 'ESCALATED', payload: { from: ex.assigneeId, to: next } } });
    await notify(tx, {
      userId: next,
      channels: ['PUSH', 'WHATSAPP', 'IN_APP'],
      kind: 'ESCALATION',
      title: `Overdue, now yours: ${ex.title}`,
      body: `${ex.summary}\nImpact ${inr(ex.impact)}. Due time was missed, so it moved up to you.`,
      exceptionId: ex.id,
    });
    moved++;
  }
  return moved;
}

/** Closure reasons feed back: the same cause closed three times in 30 days surfaces as its own flag. */
async function feedbackRepeatCause(tx: Tx, ex: Exception, now: Date) {
  if (!ex.closeReasonCode || ex.type === 'COUNT_NOT_STARTED') return;
  const since = new Date(now.getTime() - hours(24 * 30));
  const n = await tx.exception.count({
    where: { orgId: ex.orgId, outletId: ex.outletId, type: ex.type, closeReasonCode: ex.closeReasonCode, status: 'RESOLVED', closedAt: { gte: since } },
  });
  if (n < 3) return;
  const reason = await tx.reasonCode.findFirst({ where: { orgId: ex.orgId, code: ex.closeReasonCode } });
  await raiseException(tx, {
    orgId: ex.orgId,
    outletId: ex.outletId,
    type: ex.type,
    severity: 'ATTENTION',
    title: `Same cause ${n} times in 30 days: ${reason?.label ?? ex.closeReasonCode}`,
    summary: `${ex.title}. Closing each one individually is not fixing the cause.`,
    impact: ex.impact,
    businessDate: ex.businessDate,
    groupKey: `REPEAT:${ex.outletId}:${ex.type}:${ex.closeReasonCode}`,
    suggestedChecks: ['Find the root cause across the last 30 days', 'Agree a fix with the outlet team'],
    sourceRefs: [{ type: 'exception', id: ex.id, label: ex.title }],
    now,
  });
}

/** S1 ordering: ₹ impact first, then severity. */
export function rankExceptions<T extends { impact: number; severity: Severity }>(rows: T[]): T[] {
  return rows.slice().sort((a, b) => b.impact - a.impact || SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);
}

export function ownerDisplay(ex: Exception, assignee: User | undefined, viewerId: string) {
  if (ex.ownerLabel) return { name: ex.ownerLabel, sub: '' };
  if (assignee?.id === viewerId) return { name: 'You', sub: ex.routedPastOutlet ? 'Routed past outlet' : ROLE_LABEL[assignee.role] };
  return { name: assignee?.shortName ?? '—', sub: assignee ? (assignee.title ?? ROLE_LABEL[assignee.role as Role]) : '' };
}

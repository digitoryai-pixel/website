import type { Category, Role, Severity } from '@prisma/client';
import type { Tx } from '../db.js';

export type Tolerance = { pct: number; rupees: number; frequency: 'DAILY' | '3X_WEEK' | 'WEEKLY' };
export type ApprovalLimit = { discountPct: number | null; comps: number | null; wastage: number | null; stockAdj: number | null }; // null = any
export type SlaRule = { hours: number; escalateTo: Role };
export type Settings = {
  blindReceiving: boolean;
  wastagePhotoAbove: number;
  countPhotoAbove: number;
  cashTolerance: number;
  cashPatternCount: number; // shortages in 30 days that make a pattern
  transferDueHours: number;
  rateTolerancePct: number;
  criticalImpactAbove: number; // ₹ at which a stock variance is critical
  cashCriticalAbove: number;
  spotCountItems: number;
  unbilledKotSeverity: Severity;
  giveawayMultiple: number; // flag a person at this multiple of their baseline
  foodCostGapPts: number;
  draughtYieldGapPts: number;
};

export type Controls = {
  tolerances: Record<Category, Tolerance>;
  approvalLimits: Partial<Record<Role, ApprovalLimit>>;
  sla: Record<Severity, SlaRule>;
  settings: Settings;
};

export const DEFAULT_CONTROLS: Controls = {
  tolerances: {
    SPIRITS_WINE: { pct: 0.5, rupees: 500, frequency: 'DAILY' },
    DRAUGHT_BEER: { pct: 4.0, rupees: 2000, frequency: 'DAILY' },
    BOTTLED_BEER: { pct: 1.0, rupees: 200, frequency: 'DAILY' },
    MEAT_SEAFOOD: { pct: 2.0, rupees: 500, frequency: 'DAILY' },
    DAIRY: { pct: 3.0, rupees: 300, frequency: '3X_WEEK' },
    PRODUCE: { pct: 5.0, rupees: 300, frequency: '3X_WEEK' },
    DRY_STORE: { pct: 2.0, rupees: 300, frequency: 'WEEKLY' },
    PACKAGING: { pct: 5.0, rupees: 500, frequency: 'WEEKLY' },
  },
  approvalLimits: {
    CASHIER: { discountPct: 0, comps: 0, wastage: 0, stockAdj: 0 },
    DUTY_MANAGER: { discountPct: 15, comps: 3000, wastage: 2000, stockAdj: 0 },
    BAR_MANAGER: { discountPct: 15, comps: 3000, wastage: 2000, stockAdj: 0 },
    HEAD_CHEF: { discountPct: 0, comps: 0, wastage: 3000, stockAdj: 0 },
    OUTLET_MANAGER: { discountPct: 25, comps: 8000, wastage: 5000, stockAdj: 5000 },
    OWNER: { discountPct: null, comps: null, wastage: null, stockAdj: null },
    FINANCE_HEAD: { discountPct: null, comps: null, wastage: null, stockAdj: null },
  },
  sla: {
    CRITICAL: { hours: 24, escalateTo: 'OWNER' },
    ATTENTION: { hours: 72, escalateTo: 'OUTLET_MANAGER' },
    PENDING: { hours: 24 * 7, escalateTo: 'OUTLET_MANAGER' },
  },
  settings: {
    blindReceiving: true,
    wastagePhotoAbove: 500,
    countPhotoAbove: 5000,
    cashTolerance: 100,
    cashPatternCount: 3,
    transferDueHours: 12,
    rateTolerancePct: 5,
    criticalImpactAbove: 10000,
    cashCriticalAbove: 5000,
    spotCountItems: 8,
    unbilledKotSeverity: 'CRITICAL',
    giveawayMultiple: 1.8,
    foodCostGapPts: 1.5,
    draughtYieldGapPts: 2,
  },
};

/**
 * Separation of duties. These are not stored anywhere editable: an outlet can't
 * weaken the controls the owner relies on (S10).
 */
export const SEPARATION_OF_DUTIES = [
  { key: 'COUNTER_BLIND', label: "Counter can't see system quantity" },
  { key: 'RECOUNT_DIFFERENT_PERSON', label: 'Recount by a different person' },
  { key: 'NO_SELF_APPROVAL', label: 'No one approves their own entry' },
  { key: 'PO_CREATOR_CANT_APPROVE', label: "PO creator can't approve the PO" },
  { key: 'CRITICALS_REACH_OWNER', label: 'Criticals always reach the owner' },
] as const;

function merge<T extends object>(base: T, over: Partial<T> | undefined): T {
  if (!over) return base;
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [k, v] of Object.entries(over)) {
    const b = (base as Record<string, unknown>)[k];
    out[k] = v && typeof v === 'object' && !Array.isArray(v) && b && typeof b === 'object' ? merge(b as object, v as object) : v;
  }
  return out as T;
}

/** Outlet profile over chain default over product default. */
export async function getControls(tx: Tx, orgId: string, outletId?: string | null): Promise<Controls> {
  const rows = await tx.controlProfile.findMany({
    where: { orgId, OR: [{ outletId: null }, ...(outletId ? [{ outletId }] : [])] },
  });
  const chain = rows.find((r) => r.outletId === null);
  const outlet = rows.find((r) => r.outletId === outletId);
  let c = DEFAULT_CONTROLS;
  for (const r of [chain, outlet]) {
    if (!r) continue;
    c = merge(c, {
      tolerances: r.tolerances as Controls['tolerances'],
      approvalLimits: r.approvalLimits as Controls['approvalLimits'],
      sla: r.sla as Controls['sla'],
      settings: r.settings as Settings,
    });
  }
  return c;
}

/** Returns the rupee limit a role may approve, or Infinity for "Any". */
export function limitFor(c: Controls, role: Role, kind: keyof ApprovalLimit): number {
  const l = c.approvalLimits[role];
  if (!l) return 0;
  const v = l[kind];
  return v === null ? Infinity : v;
}

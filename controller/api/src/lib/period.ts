import type { Tx } from '../db.js';
import { conflict } from './errors.js';
import { monthOf } from './time.js';

/** After lock, stock, purchases and sales for the month can't be edited (W8). */
export async function assertPeriodOpen(tx: Tx, orgId: string, businessDate: string) {
  const p = await tx.period.findUnique({ where: { orgId_month: { orgId, month: monthOf(businessDate) } } });
  if (p?.status === 'LOCKED') {
    throw conflict('PERIOD_LOCKED', `${p.month} is locked. Only the finance head can reopen it, with a logged reason.`);
  }
}

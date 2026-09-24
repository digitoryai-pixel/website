// Outlets trade in IST. Business dates are "YYYY-MM-DD" in outlet local time.
const OFFSET_MIN = Number(process.env.TZ_OFFSET_MINUTES ?? 330);
// A trading day that runs past midnight still belongs to the previous date until this hour.
const DAY_ROLLOVER_HOUR = 5;

export function localParts(d: Date) {
  const t = new Date(d.getTime() + OFFSET_MIN * 60_000);
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, day: t.getUTCDate(), h: t.getUTCHours(), min: t.getUTCMinutes(), dow: t.getUTCDay() };
}

export function businessDate(d: Date = new Date()): string {
  const shifted = new Date(d.getTime() - DAY_ROLLOVER_HOUR * 3_600_000);
  const p = localParts(shifted);
  return `${p.y}-${String(p.m).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}

/** Local wall-clock time on a business date → UTC Date. hour may be ≥ 24 for after-midnight. */
export function atLocal(date: string, hour: number, minute = 0): Date {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, hour, minute) - OFFSET_MIN * 60_000);
}

export function addDays(date: string, n: number): string {
  const [y, m, d] = date.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return t.toISOString().slice(0, 10);
}

export function dayOfWeek(date: string): number {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function monthOf(date: string): string {
  return date.slice(0, 7);
}

export function monthRange(month: string): { from: string; to: string } {
  const [y, m] = month.split('-').map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return { from: `${month}-01`, to: `${month}-${String(last).padStart(2, '0')}` };
}

export const hours = (n: number) => n * 3_600_000;
export const round2 = (n: number) => Math.round(n * 100) / 100;

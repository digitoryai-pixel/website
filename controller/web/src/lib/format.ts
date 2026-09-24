// Indian money and quantity formatting. The ₹ column is the signature of the product.
export function inr(n: number | null | undefined, opts: { sign?: boolean } = {}) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  const abs = Math.round(Math.abs(n)).toLocaleString('en-IN');
  const sign = n < 0 ? '−' : opts.sign && n > 0 ? '+' : '';
  return `${sign}₹${abs}`;
}

export function inrShort(n: number | null | undefined) {
  if (n === null || n === undefined) return '—';
  const abs = Math.abs(n);
  const sign = n < 0 ? '−' : '';
  if (abs >= 1e7) return `${sign}₹${(abs / 1e7).toFixed(2)}Cr`;
  if (abs >= 1e5) return `${sign}₹${(abs / 1e5).toFixed(abs >= 1e6 ? 1 : 2).replace(/\.?0+$/, '')}L`;
  if (abs >= 1e3) return `${sign}₹${(abs / 1e3).toFixed(1).replace(/\.0$/, '')}K`;
  return `${sign}₹${Math.round(abs)}`;
}

export function qty(n: number | null | undefined, unit: string) {
  if (n === null || n === undefined) return '—';
  const sign = n < 0 ? '−' : '';
  const a = Math.abs(n);
  if (unit === 'ML') return `${sign}${Math.round(a).toLocaleString('en-IN')} ml`;
  if (unit === 'KG') return `${sign}${a.toFixed(2)} kg`;
  return `${sign}${Math.round(a)} ${unit === 'PC' ? 'pc' : unit.toLowerCase()}`;
}

export function pct(n: number | null | undefined, digits = 1) {
  if (n === null || n === undefined) return '—';
  return `${n.toFixed(digits)}%`;
}

export function pts(n: number) {
  return `${n >= 0 ? '+' : '−'}${Math.abs(n).toFixed(1)} pts`;
}

export function dueIn(iso: string | Date) {
  const ms = new Date(iso).getTime() - Date.now();
  const abs = Math.abs(ms);
  const h = Math.round(abs / 3_600_000);
  const label = abs < 3_600_000 ? `${Math.max(1, Math.round(abs / 60_000))} min` : h < 48 ? `${h} h` : `${Math.round(h / 24)} d`;
  return ms < 0 ? `Overdue ${label}` : `Due in ${label}`;
}

export function time(iso: string | Date | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' });
}

export function day(iso: string | Date | null | undefined, withWeekday = false) {
  if (!iso) return '—';
  const d = typeof iso === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T12:00:00+05:30`) : new Date(iso);
  return d.toLocaleDateString('en-IN', { ...(withWeekday ? { weekday: 'short' } : {}), day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });
}

export function dateTime(iso: string | Date | null | undefined) {
  if (!iso) return '—';
  return `${day(iso, true)}, ${time(iso)}`;
}

export const today = () => new Date(Date.now() + 5.5 * 3_600_000 - 5 * 3_600_000).toISOString().slice(0, 10);
export const addDays = (d: string, n: number) => {
  const t = new Date(`${d}T00:00:00Z`);
  t.setUTCDate(t.getUTCDate() + n);
  return t.toISOString().slice(0, 10);
};
export const yesterday = () => addDays(today(), -1);
export const lastMonth = () => {
  const t = new Date(`${today().slice(0, 7)}-01T00:00:00Z`);
  t.setUTCDate(0);
  return t.toISOString().slice(0, 7);
};

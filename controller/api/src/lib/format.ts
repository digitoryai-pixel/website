// Indian number formatting used in exception titles and messages.
export function inr(n: number, opts: { sign?: boolean } = {}): string {
  const abs = Math.abs(Math.round(n));
  const s = abs.toLocaleString('en-IN');
  const sign = n < 0 ? '−' : opts.sign && n > 0 ? '+' : '';
  return `${sign}₹${s}`;
}

export function inrShort(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? '−' : '';
  if (abs >= 1e7) return `${sign}₹${(abs / 1e7).toFixed(2)}Cr`;
  if (abs >= 1e5) return `${sign}₹${(abs / 1e5).toFixed(abs >= 1e6 ? 1 : 2).replace(/\.?0+$/, '')}L`;
  if (abs >= 1e3) return `${sign}₹${(abs / 1e3).toFixed(1).replace(/\.0$/, '')}K`;
  return `${sign}₹${Math.round(abs)}`;
}

export function qty(n: number, unit: 'ML' | 'KG' | 'PC'): string {
  if (unit === 'ML') return `${Math.round(n).toLocaleString('en-IN')} ml`;
  if (unit === 'KG') return `${n.toFixed(2)} kg`;
  return `${Math.round(n)} pc`;
}

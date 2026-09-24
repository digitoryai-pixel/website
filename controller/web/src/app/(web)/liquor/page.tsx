'use client';
import { useState } from 'react';
import { useApi } from '@/lib/hooks';
import { addDays, inr, yesterday } from '@/lib/format';
import { OutletPicker, useShell } from '@/components/WebShell';
import { ErrorBox, Explainer, Loading, PageHeader, Select } from '@/components/ui';

type Row = { itemId: string; sku: string; opening: number; received: number; sold: number; compStaff: number; breakage: number; closing: number; variance: number; value: number };
type Data = { rows: Row[]; byBar: { locationId: string; bar: string; pct: number }[]; tolerancePct: number; draught: { beer: string; drawn: number; sold: number; std: number; tank: string; yieldPct: number }[] };
type Trail = { movements: { at: string; type: string; qty: number; reason: string | null; approvedBy: string | null }[]; counts: { at: string; type: string; counted: number; system: number; variance: number; by: string; status: string }[] };
const n = (v: number) => (v === 0 ? '0' : `${v < 0 ? '−' : v > 0 ? '' : ''}${Math.abs(Math.round(v)).toLocaleString('en-IN')}`);

export default function Liquor() {
  const { session, outletId } = useShell();
  const [days, setDays] = useState('7');
  const [bar, setBar] = useState('');
  const [sku, setSku] = useState<string | null>(null);
  const oid = outletId === 'all' ? session.user.outlets[0]?.id : outletId;
  const outlets = useApi<{ id: string; locations: { id: string; name: string; kind: string }[] }[]>('web', '/outlets');
  const bars = outlets.data?.find((o) => o.id === oid)?.locations.filter((l) => l.kind === 'BAR') ?? [];
  const to = yesterday();
  const from = addDays(to, -(Number(days) - 1));
  const locId = bar || bars[0]?.id || '';
  const d = useApi<Data>('web', oid ? `/liquor?outletId=${oid}${locId ? `&locationId=${locId}` : ''}&from=${from}&to=${to}` : null);
  const trail = useApi<Trail>('web', sku ? `/liquor/${sku}/trail?outletId=${oid}&from=${from}&to=${to}` : null);
  const max = Math.max(...(d.data?.byBar.map((b) => b.pct) ?? [1]), d.data?.tolerancePct ?? 1);

  return (
    <>
      <PageHeader
        title="Liquor control"
        right={
          <>
            <OutletPicker allowAll={false} />
            <Select value={locId} onChange={setBar} options={bars.map((b) => ({ value: b.id, label: b.name }))} />
            <Select value={days} onChange={setDays} options={[{ value: '7', label: 'Last 7 days' }, { value: '14', label: 'Last 14 days' }, { value: '30', label: 'Last 30 days' }]} />
          </>
        }
      />
      <ErrorBox message={d.error?.message} />
      <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
        <div className="card overflow-x-auto">
          <div className="border-b border-slate-100 px-4 py-3 text-sm font-medium text-navy">Spirits and wine by SKU <span className="font-normal text-slate-500">in ml; variance = logged use − actual use; ₹ at selling price</span></div>
          {d.loading && !d.data ? <Loading /> : (
            <table className="grid-table">
              <thead><tr><th>SKU</th><th className="r">Opening</th><th className="r">Received</th><th className="r">Sold (POS)</th><th className="r">Comp + staff</th><th className="r">Breakage</th><th className="r">Closing</th><th className="r">Variance</th><th className="r">₹</th></tr></thead>
              <tbody>
                {d.data?.rows.map((r) => (
                  <tr key={r.itemId} className="cursor-pointer hover:bg-slate-50" onClick={() => setSku(r.itemId === sku ? null : r.itemId)}>
                    <td className="whitespace-nowrap font-medium text-brand-600">{r.sku}</td>
                    <td className="r num">{n(r.opening)}</td><td className="r num">{n(r.received)}</td><td className="r num">{n(r.sold)}</td><td className="r num">{n(r.compStaff)}</td><td className="r num">{n(r.breakage)}</td><td className="r num">{n(r.closing)}</td>
                    <td className={`r num font-medium ${r.variance < 0 ? 'text-critical' : ''}`}>{r.variance > 0 ? '+' : ''}{n(r.variance)}</td>
                    <td className={`r num ${r.value < 0 ? 'text-critical' : ''}`}>{inr(r.value, { sign: true })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="px-4 py-2 text-xs text-slate-500">Closing includes open bottles measured by weight in the app. Comps, staff drinks and breakage only count if they were logged and approved.</p>
          {sku && trail.data && (
            <div className="border-t border-slate-100 p-4 text-sm">
              <div className="mb-2 font-medium text-navy">Every count, receipt and pour behind the number</div>
              <table className="grid-table">
                <thead><tr><th>When</th><th>What</th><th className="r">ml</th><th>Reason / by</th></tr></thead>
                <tbody>
                  {trail.data.counts.map((c, i) => <tr key={`c${i}`}><td>{new Date(c.at).toLocaleString('en-IN')}</td><td>{c.type.toLowerCase()} count by {c.by} ({c.status.toLowerCase().replaceAll('_', ' ')})</td><td className="r num">{n(c.variance ?? 0)}</td><td>system {n(c.system ?? 0)}, counted {n(c.counted ?? 0)}</td></tr>)}
                  {trail.data.movements.map((m, i) => <tr key={`m${i}`}><td>{new Date(m.at).toLocaleString('en-IN')}</td><td>{m.type.toLowerCase().replaceAll('_', ' ')}</td><td className="r num">{n(m.qty)}</td><td>{[m.reason, m.approvedBy].filter(Boolean).join(', ')}</td></tr>)}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="space-y-5">
          <div className="card p-4">
            <div className="mb-3 text-sm font-medium text-navy">Variance % by bar <span className="font-normal text-slate-500">{days} days</span></div>
            {d.data?.byBar.map((b) => (
              <div key={b.locationId} className="mb-2 text-sm">
                <div className="flex justify-between"><span>{b.bar}</span><span className="num font-medium">{b.pct.toFixed(1)}%</span></div>
                <div className="relative mt-1 h-2 rounded bg-slate-100">
                  <div className="h-2 rounded" style={{ width: `${(b.pct / max) * 100}%`, background: b.pct > d.data!.tolerancePct ? 'var(--color-critical)' : 'var(--color-navy-400)' }} />
                  <div className="absolute top-[-3px] h-3.5 w-px bg-slate-500" style={{ left: `${(d.data!.tolerancePct / max) * 100}%` }} title="Tolerance" />
                </div>
              </div>
            ))}
            <div className="mt-2 text-xs text-slate-500">Tolerance {d.data?.tolerancePct.toFixed(1)}%</div>
          </div>
          {!!d.data?.draught.length && (
            <div className="card p-4">
              <div className="mb-2 text-sm font-medium text-navy">Draught, tank to tap <span className="font-normal text-slate-500">brewpub</span></div>
              <table className="grid-table">
                <thead><tr><th>Beer</th><th className="r">Yield</th><th className="r">Std</th></tr></thead>
                <tbody>{d.data.draught.map((b) => <tr key={b.beer}><td>{b.beer}</td><td className={`r num ${b.std - b.yieldPct > 2 ? 'font-semibold text-critical' : ''}`}>{b.yieldPct.toFixed(1)}%</td><td className="r num">{b.std}%</td></tr>)}</tbody>
              </table>
              {d.data.draught.filter((b) => b.std - b.yieldPct > 2).map((b) => <p key={b.beer} className="mt-2 text-xs text-slate-600">{b.beer}: {Math.round(b.drawn / 1000)} l drawn from serving tank {b.tank}, {Math.round(b.sold / 1000)} l sold.</p>)}
            </div>
          )}
        </div>
      </div>
      <Explainer>
        <p>Every column is in millilitres. Comps, staff drinks and breakage only count if they were logged and approved; otherwise they fall into variance.</p>
        <p>Draught yield compares litres sold on POS with litres drawn from the tank, using flow meters where installed. Click a SKU to see every count, receipt and pour behind the number.</p>
      </Explainer>
    </>
  );
}

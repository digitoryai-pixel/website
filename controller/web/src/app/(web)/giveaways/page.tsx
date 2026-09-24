'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useApi } from '@/lib/hooks';
import { addDays, day, inr, inrShort, yesterday } from '@/lib/format';
import { OutletPicker, useShell } from '@/components/WebShell';
import { ErrorBox, Explainer, Kpi, Loading, PageHeader, Pill, Select } from '@/components/ui';

type Data = {
  tiles: { discounts: { amount: number; pct: number }; comps: { amount: number; pct: number; baselinePct: number | null }; voidsAfterKot: { amount: number; pct: number }; refunds: { amount: number; allWithBill: boolean } };
  series: { date: string; pct: number; amount: number }[]; baselinePct: number | null;
  byApprover: { userId: string; name: string; role: string; discounts: number; comps: number; voids: number; refunds: number; vsBaseline: number | null; flag: string | null; exceptionId: string | null }[];
};

export default function Giveaways() {
  const { outletId } = useShell();
  const [range, setRange] = useState('14');
  const to = yesterday();
  const d = useApi<Data>('web', `/giveaways?outletId=${outletId}&from=${addDays(to, -Number(range) + 1)}&to=${to}`);
  const g = d.data;
  const max = Math.max(...(g?.series.map((s) => s.pct) ?? [1]), g?.baselinePct ?? 0, 1) * 1.1;
  return (
    <>
      <PageHeader title="Giveaways" sub="Discounts, comps, voids and refunds, by whom and against normal" right={<><OutletPicker /><Select value={range} onChange={setRange} options={[{ value: '7', label: 'Last 7 days' }, { value: '14', label: 'Last 14 days' }, { value: '30', label: 'Last 30 days' }]} /></>} />
      <ErrorBox message={d.error?.message} />
      {!g ? <Loading /> : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi label="Discounts" value={inrShort(g.tiles.discounts.amount)} sub={`${g.tiles.discounts.pct}% of sales`} />
            <Kpi label="Comps and NC" value={inrShort(g.tiles.comps.amount)} sub={`${g.tiles.comps.pct}%${g.tiles.comps.baselinePct !== null ? `, baseline ${g.tiles.comps.baselinePct}%` : ''}`} tone={g.tiles.comps.baselinePct !== null && g.tiles.comps.pct > g.tiles.comps.baselinePct * 1.2 ? 'bad' : 'neutral'} />
            <Kpi label="Voids after KOT" value={inrShort(g.tiles.voidsAfterKot.amount)} sub={`${g.tiles.voidsAfterKot.pct}%`} />
            <Kpi label="Refunds" value={inrShort(g.tiles.refunds.amount)} sub={g.tiles.refunds.allWithBill ? 'all with original bill' : 'some without bill'} tone={g.tiles.refunds.allWithBill ? 'good' : 'bad'} />
          </div>
          <div className="card mt-5 p-4">
            <div className="mb-3 text-sm font-medium text-navy">Giveaways as % of net sales, by day <span className="font-normal text-slate-500">bars; line = baseline {g.baselinePct ?? '—'}%</span></div>
            <div className="relative flex h-40 items-end gap-1.5">
              {g.baselinePct !== null && <div className="absolute inset-x-0 border-t-2 border-dashed border-brand" style={{ bottom: `${(g.baselinePct / max) * 100}%` }} />}
              {g.series.map((s) => (
                <div key={s.date} className="group relative flex-1">
                  <div className="rounded-t bg-navy-400 group-hover:bg-navy" style={{ height: `${(s.pct / max) * 160}px` }} title={`${day(s.date)}: ${s.pct}% (${inr(s.amount)})`} />
                </div>
              ))}
            </div>
            <div className="mt-1 flex gap-1.5 text-[10px] text-slate-500">{g.series.map((s) => <div key={s.date} className="flex-1 truncate text-center">{day(s.date)}</div>)}</div>
          </div>
          <div className="card mt-5 overflow-x-auto">
            <div className="border-b border-slate-100 px-4 py-3 text-sm font-medium text-navy">By approver <span className="font-normal text-slate-500">who gave or approved it</span></div>
            <table className="grid-table">
              <thead><tr><th>Name</th><th>Role, outlet</th><th className="r">Discounts</th><th className="r">Comps</th><th className="r">Voids</th><th className="r">Refunds</th><th className="r">vs baseline</th><th /></tr></thead>
              <tbody>
                {g.byApprover.map((a) => (
                  <tr key={a.userId}>
                    <td className="font-medium">{a.name}</td><td>{a.role}</td><td className="r num">{inr(a.discounts)}</td><td className="r num">{inr(a.comps)}</td><td className="r num">{inr(a.voids)}</td><td className="r num">{inr(a.refunds)}</td>
                    <td className={`r num font-medium ${(a.vsBaseline ?? 0) >= 1.8 ? 'text-critical' : ''}`}>{a.vsBaseline ? `${a.vsBaseline.toFixed(1)}×` : '—'}</td>
                    <td>{a.flag && (a.exceptionId ? <Link href={`/exceptions/${a.exceptionId}`}><Pill tone="red">{a.flag}</Pill></Link> : <Pill tone="red">{a.flag}</Pill>)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <Explainer>
        <p>Baselines are per outlet, day of week and person, so a busy Saturday isn&apos;t flagged but one manager comping twice as much as usual is.</p>
        <p>Every discount and comp carries a reason code and approver from POS. Voids are split into before and after KOT, and after payment. A refund without an original bill can&apos;t be processed on POS at all.</p>
      </Explainer>
    </>
  );
}

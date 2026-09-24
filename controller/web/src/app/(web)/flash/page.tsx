'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useApi } from '@/lib/hooks';
import { day, inr, inrShort, pct, pts, yesterday } from '@/lib/format';
import { OutletPicker, useShell } from '@/components/WebShell';
import { ErrorBox, Kpi, Loading, PageHeader } from '@/components/ui';

type F = {
  date: string; outlets: number; outletsClosed: number; netSales: number; netSalesVsLastWeekPct: number | null; foodCostPct: number; foodCostVsTheoryPts: number; bevCostPct: number; bevCostVsTheoryPts: number;
  giveaways: number; unbilledKot: number; stockVariance: number; cashVariance: number; wastage: number; open: { critical: number; attention: number; pending: number }; largest: { id: string; title: string; impact: number; outlet: string | null } | null;
};

export default function Flash() {
  const { outletId } = useShell();
  const [date, setDate] = useState(yesterday());
  const d = useApi<F>('web', `/flash?outletId=${outletId}&date=${date}`);
  const f = d.data;
  return (
    <>
      <PageHeader title="Daily Flash" sub={f ? `${day(f.date, true)}, ${f.outletsClosed} outlets closed` : ''} right={<><OutletPicker /><input type="date" className="input w-auto" value={date} onChange={(e) => setDate(e.target.value)} /></>} />
      <ErrorBox message={d.error?.message} />
      {!f ? <Loading /> : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Kpi label="Net sales" value={inrShort(f.netSales)} sub={f.netSalesVsLastWeekPct !== null ? `${f.netSalesVsLastWeekPct >= 0 ? '+' : ''}${f.netSalesVsLastWeekPct}% vs same day last week` : ''} />
            <Kpi label="Food cost" value={pct(f.foodCostPct)} sub={`${pts(f.foodCostVsTheoryPts)} vs theory`} tone={f.foodCostVsTheoryPts > 1 ? 'bad' : 'neutral'} />
            <Kpi label="Beverage cost" value={pct(f.bevCostPct)} sub={`${pts(f.bevCostVsTheoryPts)} vs theory`} tone={f.bevCostVsTheoryPts > 1 ? 'bad' : 'neutral'} />
            <Kpi label="Giveaways" value={inrShort(f.giveaways)} sub="discounts, comps, voids, refunds" />
            <Kpi label="Unbilled KOTs" value={inrShort(f.unbilledKot)} tone={f.unbilledKot > 0 ? 'bad' : 'good'} />
            <Kpi label="Stock variance" value={inrShort(f.stockVariance)} sub="after recounts" tone={f.stockVariance < 0 ? 'bad' : 'neutral'} />
            <Kpi label="Cash variance" value={inrShort(f.cashVariance)} tone={f.cashVariance < 0 ? 'bad' : 'neutral'} />
            <Kpi label="Wastage" value={inrShort(f.wastage)} sub="logged and approved" />
          </div>
          <div className="card mt-5 p-4 text-sm">
            <div className="font-medium text-navy">{f.open.critical} critical, {f.open.attention} attention, {f.open.pending} pending</div>
            {f.largest && <p className="mt-1">Largest: {f.largest.title}{f.largest.outlet ? ` at ${f.largest.outlet}` : ''}, {inr(f.largest.impact)}.</p>}
            <Link href="/" className="btn btn-primary mt-3">Open Action Centre</Link>
          </div>
          <p className="mt-3 text-xs text-slate-500">The same flash is pushed to owners and the finance head at 8 am. Each number is compared with theoretical or baseline.</p>
        </>
      )}
    </>
  );
}

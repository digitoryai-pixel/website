'use client';
import { useState } from 'react';
import { useApi } from '@/lib/hooks';
import { day, inrShort, pct, pts } from '@/lib/format';
import { OutletPicker, useShell } from '@/components/WebShell';
import { Empty, ErrorBox, Explainer, Kpi, Loading, PageHeader } from '@/components/ui';
import { ExceptionRow, type ExceptionItem } from '@/components/ExceptionRow';

type Flash = {
  date: string; netSales: number; netSalesVsLastWeekPct: number | null; foodCostPct: number; foodCostVsTheoryPts: number; bevCostPct: number; bevCostVsTheoryPts: number;
  stockVariance: number; unbilledKot: number; unbilledKotOutlets: number; cashVariance: number; cashVarianceShifts: number;
};
type AC = { counts: { open: number; critical: number; attention: number; pending: number }; items: ExceptionItem[] };

export default function ActionCentre() {
  const { outletId } = useShell();
  const [sev, setSev] = useState<string>('');
  const q = `outletId=${outletId}`;
  const flash = useApi<Flash>('web', `/flash?${q}`);
  const ac = useApi<AC>('web', `/action-centre?${q}${sev ? `&severity=${sev}` : ''}`);
  const f = flash.data;

  const chip = (value: string, label: string, n?: number, color?: string) => (
    <button onClick={() => setSev(value)} className={`rounded-full border px-3 py-1 text-xs ${sev === value ? 'border-navy bg-navy text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>
      {color && <span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ background: color }} />}
      {n !== undefined && <span className="num font-semibold">{n} </span>}
      {label}
    </button>
  );

  return (
    <>
      <PageHeader title="Needs attention" sub={f ? `for ${day(f.date, true)}, ${outletId === 'all' ? 'all outlets' : 'one outlet'}` : ' '} right={<OutletPicker />} />
      <ErrorBox message={flash.error?.message} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Net sales" value={inrShort(f?.netSales)} sub={f?.netSalesVsLastWeekPct != null ? `${f.netSalesVsLastWeekPct >= 0 ? '+' : ''}${f.netSalesVsLastWeekPct}% vs last week` : 'vs last week'} tone={f && (f.netSalesVsLastWeekPct ?? 0) < 0 ? 'bad' : 'good'} />
        <Kpi label="Food cost" value={pct(f?.foodCostPct)} sub={f ? `${pts(f.foodCostVsTheoryPts)} vs theory` : ''} tone={f && f.foodCostVsTheoryPts > 1 ? 'bad' : 'neutral'} />
        <Kpi label="Beverage cost" value={pct(f?.bevCostPct)} sub={f ? `${pts(f.bevCostVsTheoryPts)} vs theory` : ''} tone={f && f.bevCostVsTheoryPts > 1 ? 'bad' : 'neutral'} />
        <Kpi label="Stock variance" value={inrShort(f?.stockVariance)} sub="after recounts" tone={f && f.stockVariance < 0 ? 'bad' : 'neutral'} />
        <Kpi label="Unbilled KOTs" value={inrShort(f?.unbilledKot)} sub={f ? `${f.unbilledKotOutlets} outlet${f.unbilledKotOutlets === 1 ? '' : 's'}` : ''} tone={f && f.unbilledKot > 0 ? 'bad' : 'good'} />
        <Kpi label="Cash variance" value={inrShort(f?.cashVariance)} sub={f ? `${f.cashVarianceShifts} shift${f.cashVarianceShifts === 1 ? '' : 's'}` : ''} tone={f && f.cashVariance < 0 ? 'bad' : 'neutral'} />
      </div>

      <div className="mb-2 mt-6 flex flex-wrap items-center gap-2">
        {chip('', 'open', ac.data?.counts.open)}
        {chip('CRITICAL', 'critical', ac.data?.counts.critical, 'var(--color-critical)')}
        {chip('ATTENTION', 'attention', ac.data?.counts.attention, 'var(--color-attention)')}
        {chip('PENDING', 'pending', ac.data?.counts.pending, 'var(--color-pending)')}
        <span className="ml-auto text-xs text-slate-500">Sorted by ₹ impact, then severity</span>
      </div>
      <div className="card overflow-hidden">
        {ac.loading && !ac.data ? <Loading /> : ac.error ? <ErrorBox message={ac.error.message} /> : ac.data!.items.length === 0 ? <Empty>Nothing needs attention.</Empty> : ac.data!.items.map((e) => <ExceptionRow key={e.id} e={e} />)}
      </div>

      <Explainer>
        <p>Replaces the controller&apos;s morning report with one ranked list. Each row is a single problem with its rupee impact, a plain-language cause, a named owner and a due time.</p>
        <p>Colour bar = severity. Red critical, amber attention, grey pending. &ldquo;You&rdquo; means the item was routed past the outlet because the manager was involved.</p>
        <p>KPI tiles compare against theoretical or baseline, never against nothing.</p>
      </Explainer>
    </>
  );
}

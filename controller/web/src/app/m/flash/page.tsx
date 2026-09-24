'use client';
import Link from 'next/link';
import { useApi } from '@/lib/hooks';
import { day, inr, inrShort } from '@/lib/format';
import { MobileShell } from '@/components/MobileShell';
import { ErrorBox, Loading } from '@/components/ui';

type F = { date: string; outlets: number; netSales: number; netSalesVsLastWeekPct: number | null; foodCostPct: number; foodCostVsTheoryPts: number; bevCostPct: number; bevCostVsTheoryPts: number; giveaways: number; unbilledKot: number; stockVariance: number; cashVariance: number; open: { critical: number; attention: number }; largest: { title: string; impact: number; outlet: string | null } | null };

export default function MobileFlash() {
  const d = useApi<F>('mobile', '/flash');
  const f = d.data;
  const tile = (label: string, value: string, sub?: string, bad?: boolean) => (
    <div className="rounded-xl border border-slate-200 p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="num text-lg font-semibold text-navy">{value}</div>
      {sub && <div className={`text-xs ${bad ? 'text-critical' : 'text-slate-500'}`}>{sub}</div>}
    </div>
  );
  return (
    <MobileShell title="Daily Flash">
      <ErrorBox message={d.error?.message} />
      {!f ? <Loading /> : (
        <>
          <div className="mb-3 text-sm text-slate-500">{day(f.date, true)}, {f.outlets === 1 ? 'your outlet' : `all ${f.outlets} outlets`}</div>
          <div className="rounded-xl bg-navy p-4 text-white">
            <div className="text-xs text-white/70">Net sales</div>
            <div className="num text-3xl font-semibold">{inrShort(f.netSales)}</div>
            {f.netSalesVsLastWeekPct !== null && <div className="text-xs text-white/70">{f.netSalesVsLastWeekPct >= 0 ? '+' : ''}{f.netSalesVsLastWeekPct}% vs last week</div>}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {tile('Food cost', `${f.foodCostPct.toFixed(1)}%`, `${f.foodCostVsTheoryPts >= 0 ? '+' : ''}${f.foodCostVsTheoryPts.toFixed(1)} vs theory`, f.foodCostVsTheoryPts > 1)}
            {tile('Beverage cost', `${f.bevCostPct.toFixed(1)}%`, `${f.bevCostVsTheoryPts >= 0 ? '+' : ''}${f.bevCostVsTheoryPts.toFixed(1)} vs theory`, f.bevCostVsTheoryPts > 1)}
            {tile('Giveaways', inrShort(f.giveaways))}
            {tile('Unbilled KOTs', inrShort(f.unbilledKot), undefined, f.unbilledKot > 0)}
            {tile('Stock variance', inrShort(f.stockVariance), undefined, f.stockVariance < 0)}
            {tile('Cash variance', inrShort(f.cashVariance), undefined, f.cashVariance < 0)}
          </div>
          <div className="mt-3 rounded-xl border border-red-200 bg-critical-50 p-3 text-sm">
            <div className="font-semibold text-critical">{f.open.critical} critical, {f.open.attention} attention</div>
            {f.largest && <div className="mt-0.5">Largest: {f.largest.title}{f.largest.outlet ? ` at ${f.largest.outlet}` : ''} {inr(f.largest.impact)}</div>}
          </div>
          <Link href="/m/approvals" className="btn btn-primary mt-4 w-full justify-center py-3">Open Action Centre</Link>
        </>
      )}
    </MobileShell>
  );
}

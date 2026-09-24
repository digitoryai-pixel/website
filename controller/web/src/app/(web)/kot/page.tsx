'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useApi } from '@/lib/hooks';
import { dueIn, inr, inrShort, time, yesterday } from '@/lib/format';
import { OutletPicker, useShell } from '@/components/WebShell';
import { Empty, ErrorBox, Explainer, Loading, PageHeader } from '@/components/ui';

type Data = {
  fired: { items: number; value: number };
  breakdown: { billed: number; voided: number; staffMeals: number; nc: number; pending: number; notAccounted: number; notAccountedValue: number };
  notAccounted: { kot: string; time: string; table: string; steward: string; item: string; qty: number; amount: number; station: string }[];
  pattern: { steward: string; share: string; nights30: number; total30: number } | null;
  exception: { id: string; status: string; dueAt: string; assignee: string | null } | null;
};

export default function KotMatch() {
  const { session, outletId } = useShell();
  const [date, setDate] = useState(yesterday());
  const oid = outletId === 'all' ? session.user.outlets[0]?.id : outletId;
  const d = useApi<Data>('web', oid ? `/kot-match?outletId=${oid}&date=${date}` : null);
  const b = d.data?.breakdown;
  const seg = b ? [
    { label: 'Billed and paid', n: b.billed, color: '#94a3b8' }, { label: 'Voided with reason', n: b.voided, color: '#223345' }, { label: 'Staff meals', n: b.staffMeals, color: '#627d98' },
    { label: 'Approved NC', n: b.nc, color: '#bcccdc' }, { label: 'Not accounted for', n: b.notAccounted, color: 'var(--color-critical)' },
  ] : [];
  const total = seg.reduce((s, x) => s + x.n, 0) || 1;
  return (
    <>
      <PageHeader title="KOT-to-bill match" sub={`${session.user.outlets.find((o) => o.id === oid)?.name ?? ''}`} right={<><OutletPicker allowAll={false} /><input type="date" className="input w-auto" value={date} onChange={(e) => setDate(e.target.value)} /></>} />
      <ErrorBox message={d.error?.message} />
      {d.loading && !d.data ? <Loading /> : d.data && (
        <>
          <div className="card p-4">
            <div className="text-sm">{d.data.fired.items.toLocaleString('en-IN')} items fired to kitchen and bar ({inrShort(d.data.fired.value)}). Where each one ended up:</div>
            <div className="mt-3 flex h-4 overflow-hidden rounded">
              {seg.map((s) => s.n > 0 && <div key={s.label} style={{ width: `${Math.max((s.n / total) * 100, 0.8)}%`, background: s.color }} title={`${s.label}: ${s.n}`} />)}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
              {seg.map((s) => <span key={s.label} className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />{s.label} <span className="num font-semibold">{s.n.toLocaleString('en-IN')}</span>{s.label === 'Not accounted for' && b!.notAccountedValue > 0 && <span className="num">({inr(b!.notAccountedValue)})</span>}</span>)}
            </div>
          </div>
          <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_280px]">
            <div className="card overflow-x-auto">
              <div className="border-b border-slate-100 px-4 py-3 text-sm font-medium text-navy">Not accounted for <span className="font-normal text-slate-500">no bill, void, staff meal or approved NC</span></div>
              {d.data.notAccounted.length === 0 ? <Empty>Every KOT item is accounted for.</Empty> : (
                <table className="grid-table">
                  <thead><tr><th>KOT</th><th>Time</th><th>Table</th><th>Steward</th><th>Item</th><th className="r">Qty</th><th className="r">₹</th><th>Station</th></tr></thead>
                  <tbody>{d.data.notAccounted.map((r) => <tr key={r.kot + r.item}><td>{r.kot}</td><td>{time(r.time)}</td><td>{r.table}</td><td>{r.steward}</td><td>{r.item}</td><td className="r num">{r.qty}</td><td className="r num">{inr(r.amount)}</td><td>{r.station}</td></tr>)}</tbody>
                </table>
              )}
            </div>
            <div className="space-y-4">
              {d.data.pattern && (
                <div className="card p-4 text-sm">
                  <div className="font-medium text-navy">Pattern</div>
                  <p className="mt-1">{d.data.pattern.share} items were served by {d.data.pattern.steward}.</p>
                  <p className="mt-1">{d.data.pattern.steward} has had unbilled KOTs on {d.data.pattern.nights30} nights in the last 30, totalling {inr(d.data.pattern.total30)}.</p>
                </div>
              )}
              {d.data.exception && (
                <div className="card p-4 text-sm">
                  <div className="label">Assigned</div>
                  <div className="font-medium">{d.data.exception.assignee}</div>
                  <div className="text-xs text-slate-500">{d.data.exception.status === 'RESOLVED' ? 'Resolved' : dueIn(d.data.exception.dueAt)}</div>
                  <Link href={`/exceptions/${d.data.exception.id}`} className="btn btn-primary mt-3">Open exception</Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
      <Explainer>
        <p>Checks that every item the kitchen or bar made ended up on a paid bill or was properly explained. Only possible because Digitory runs both the POS and the KDS.</p>
        <p>Patterns by steward, section and shift build over 30 days. Valid explanations are recorded as NC with an approver, so they count next time.</p>
      </Explainer>
    </>
  );
}

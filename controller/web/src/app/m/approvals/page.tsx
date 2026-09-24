'use client';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { useAction, useApi } from '@/lib/hooks';
import { dueIn, inr, qty } from '@/lib/format';
import { MobileShell } from '@/components/MobileShell';
import { Empty, ErrorBox, Loading, SEV_COLOR } from '@/components/ui';

type A = {
  exceptions: { id: string; title: string; summary: string; impact: number; severity: string; status: string; dueAt: string; outlet: string | null }[];
  wastage: { id: string; item: string; qty: number; unit: string; value: number; reason: string; loggedBy: string }[];
};

export default function Approvals() {
  const a = useApi<A>('mobile', '/m/approvals');
  const act = useAction();
  const decide = async (id: string, approve: boolean) => {
    if (await act.run(() => api('mobile', `/wastage/${id}/decide`, { body: { approve } }))) a.reload();
  };
  return (
    <MobileShell title="Explain and approve">
      <ErrorBox message={a.error?.message ?? act.error} />
      {!a.data ? <Loading /> : (
        <>
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Exceptions</div>
          {a.data.exceptions.length === 0 ? <Empty>Nothing assigned to you.</Empty> : a.data.exceptions.map((e) => (
            <Link key={e.id} href={`/m/approvals/${e.id}`} className="mb-2 flex items-stretch overflow-hidden rounded-xl border border-slate-200">
              <span className="w-1.5" style={{ background: SEV_COLOR[e.severity] }} />
              <div className="flex-1 p-3">
                <div className="flex justify-between gap-2"><span className="font-medium">{e.title}</span><span className="num shrink-0 font-semibold">{e.impact ? inr(e.impact) : ''}</span></div>
                <div className="text-xs text-slate-500">{e.outlet} · {e.status === 'AWAITING_DECISION' ? 'Needs your decision' : dueIn(e.dueAt)}</div>
              </div>
              <ChevronRight className="m-3 h-4 w-4 self-center text-slate-400" />
            </Link>
          ))}
          {a.data.wastage.length > 0 && <div className="mb-2 mt-5 text-xs font-medium uppercase tracking-wide text-slate-400">Wastage</div>}
          {a.data.wastage.map((w) => (
            <div key={w.id} className="mb-2 rounded-xl border border-slate-200 p-3">
              <div className="flex justify-between"><span className="font-medium">{w.item}</span><span className="num font-semibold">{inr(w.value)}</span></div>
              <div className="text-xs text-slate-500">{qty(w.qty, w.unit)}, {w.reason.replaceAll('_', ' ').toLowerCase()}, by {w.loggedBy}</div>
              <div className="mt-2 flex gap-2">
                <button className="btn btn-primary flex-1 justify-center" disabled={act.busy} onClick={() => decide(w.id, true)}>Approve</button>
                <button className="btn btn-ghost flex-1 justify-center" disabled={act.busy} onClick={() => decide(w.id, false)}>Reject</button>
              </div>
            </div>
          ))}
          <Link href="/m/cash" className="mt-4 block text-center text-sm text-brand-600 underline">Cash shifts waiting for a second count</Link>
        </>
      )}
    </MobileShell>
  );
}

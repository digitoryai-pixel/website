'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { api, attachmentUrl } from '@/lib/api';
import { useAction, useApi } from '@/lib/hooks';
import { inr, qty, time } from '@/lib/format';
import { useShell } from '@/components/WebShell';
import { ErrorBox, Explainer, Kpi, Loading, PageHeader, Pill } from '@/components/ui';

type Line = { lineId: string; item: string; unit: string; location: string; systemAtSnapshot: number | null; count1: number | null; recount: number | null; variance: number; value: number; scale: boolean; typed: boolean; photos: { id: string }[]; status: string; exceptionId: string | null };
type Review = {
  id: string; outletId: string; location: string; type: string; counter: string; recounter: string | null; countedAt: string; recountedAt: string | null; snapshotAt: string;
  summary: { itemsCounted: number; withinTolerance: number; recounted: number; stillOff: number; netVariance: number }; lines: Line[]; canApprove: boolean;
};
const STATUS: Record<string, [string, 'red' | 'amber' | 'green' | 'grey']> = {
  NEEDS_APPROVAL: ['Needs approval', 'red'], SENT_BACK: ['Sent back', 'amber'], RECOUNT_MATCHED: ['Recount matched', 'green'], WITHIN_TOLERANCE: ['Within tolerance', 'green'],
  AUTO_ACCEPTED: ['Auto-accepted', 'grey'], APPROVED: ['Approved', 'green'], RECOUNT_REQUESTED: ['Recount running', 'amber'], COUNTED: ['Counted', 'grey'], PENDING: ['Not counted', 'grey'],
};

export default function CountReview() {
  const { id } = useParams<{ id: string }>();
  const { session, refreshBadge } = useShell();
  const r = useApi<Review>('web', `/counts/${id}/review`);
  const reasons = useApi<{ code: string; label: string }[]>('web', '/reason-codes?domain=STOCK_ADJ');
  const [sel, setSel] = useState<string[]>([]);
  const [reason, setReason] = useState('UNEXPLAINED_INVESTIGATE_STAFF');
  const [showAll, setShowAll] = useState(false);
  const act = useAction();
  if (r.loading && !r.data) return <Loading />;
  if (r.error) return <ErrorBox message={r.error.message} />;
  const v = r.data!;
  const s = v.summary;
  const order = ['NEEDS_APPROVAL', 'SENT_BACK', 'RECOUNT_REQUESTED', 'RECOUNT_MATCHED', 'WITHIN_TOLERANCE', 'APPROVED', 'AUTO_ACCEPTED'];
  const lines = [...v.lines].sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));
  const visible = showAll ? lines : lines.filter((l) => l.status !== 'AUTO_ACCEPTED').concat(lines.filter((l) => l.status === 'AUTO_ACCEPTED').slice(0, 3));
  const hidden = lines.length - visible.length;
  const approvable = v.lines.filter((l) => l.status === 'NEEDS_APPROVAL' || l.status === 'SENT_BACK');
  const done = async (p: Promise<unknown>) => {
    if (await act.run(() => p)) {
      setSel([]);
      r.reload();
      refreshBadge();
    }
  };

  return (
    <>
      <PageHeader
        crumbs={<><Link href="/counts" className="hover:underline">Stock counts</Link> › {v.type === 'FULL' ? 'Full' : 'Spot'} count, {v.location}</>}
        title={<span className="flex items-center gap-2">{v.location} {s.stillOff > 0 && <Pill tone="red">{s.stillOff} need approval</Pill>}</span>}
        right={v.canApprove && approvable.length > 0 && (
          <>
            <button className="btn btn-ghost" disabled={!sel.length || act.busy} onClick={() => done(api('web', `/counts/${id}/send-back`, { body: { lineIds: sel, note: 'Send back for investigation' } }))}>Send back for investigation</button>
            <button className="btn btn-primary" disabled={!sel.length || !reason || act.busy} onClick={() => done(api('web', `/counts/${id}/approve`, { body: { lineIds: sel, reasonCode: reason } }))}>Approve selected</button>
          </>
        )}
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Kpi label="Items counted" value={s.itemsCounted} sub="picked by system" />
        <Kpi label="Within tolerance" value={s.withinTolerance} sub="auto-accepted" />
        <Kpi label="Recounted" value={s.recounted} sub="by a different person" />
        <Kpi label="Still off after recount" value={s.stillOff} sub="need your approval" tone={s.stillOff ? 'bad' : 'good'} />
        <Kpi label="Net variance" value={inr(s.netVariance)} sub="cost; liquor at selling price" tone={s.netVariance < 0 ? 'bad' : 'neutral'} />
      </div>
      <p className="mt-4 text-sm text-slate-600">
        Count 1 by {v.counter} at {time(v.countedAt)}{v.recounter ? `, recount by ${v.recounter} at ${time(v.recountedAt)}` : ''}. Snapshot taken at {time(v.snapshotAt)}.
      </p>
      <ErrorBox message={act.error} />
      <div className="card mt-2 overflow-x-auto">
        <table className="grid-table">
          <thead><tr><th /><th>Item</th><th>Location</th><th className="r">System at snapshot</th><th className="r">Count 1</th><th className="r">Recount</th><th className="r">Variance</th><th className="r">₹</th><th>Evidence</th><th>Status</th></tr></thead>
          <tbody>
            {visible.map((l) => {
              const canSel = v.canApprove && (l.status === 'NEEDS_APPROVAL' || l.status === 'SENT_BACK');
              const [label, tone] = STATUS[l.status] ?? [l.status, 'grey'];
              return (
                <tr key={l.lineId}>
                  <td>{canSel && <input type="checkbox" aria-label={`Select ${l.item}`} checked={sel.includes(l.lineId)} onChange={(e) => setSel(e.target.checked ? [...sel, l.lineId] : sel.filter((x) => x !== l.lineId))} />}</td>
                  <td className="font-medium">{l.item}</td><td>{l.location}</td>
                  <td className="r num">{qty(l.systemAtSnapshot, l.unit)}</td><td className="r num">{qty(l.count1, l.unit)}</td><td className="r num">{l.recount === null ? '—' : qty(l.recount, l.unit)}</td>
                  <td className="r num">{l.variance === 0 ? '0' : qty(l.variance, l.unit)}</td><td className="r num">{inr(l.value)}</td>
                  <td className="space-x-1 whitespace-nowrap">
                    {l.scale && <Pill tone="navy">Scale</Pill>}
                    {l.typed && <Pill tone="amber">Typed</Pill>}
                    {l.photos.length > 0 && <a href={attachmentUrl('web', l.photos[0].id)} target="_blank" rel="noreferrer"><Pill tone="grey">{l.photos.length} photo{l.photos.length > 1 ? 's' : ''}</Pill></a>}
                  </td>
                  <td>{l.exceptionId ? <Link href={`/exceptions/${l.exceptionId}`}><Pill tone={tone}>{label}</Pill></Link> : <Pill tone={tone}>{label}</Pill>}</td>
                </tr>
              );
            })}
            {hidden > 0 && <tr><td colSpan={10}><button className="text-sm text-brand-600 underline" onClick={() => setShowAll(true)}>+ {hidden} more lines within tolerance</button></td></tr>}
          </tbody>
        </table>
      </div>
      {v.canApprove && approvable.length > 0 && (
        <div className="card mt-3 flex flex-wrap items-center gap-2 p-3 text-sm">
          <span>Approve {sel.length} selected as</span>
          <select className="input w-auto" value={reason} onChange={(e) => setReason(e.target.value)}>
            {(reasons.data ?? []).map((x) => <option key={x.code} value={x.code}>Reason: {x.label.toLowerCase()}</option>)}
          </select>
          <span className="text-xs text-slate-500">Adjustments post to stock with this reason and your name ({session.user.shortName}). {v.counter}{v.recounter ? ` and ${v.recounter}` : ''} cannot approve this count.</span>
        </div>
      )}
      {!v.canApprove && <div className="mt-3 text-sm text-slate-500">You counted this, so approval is for someone else.</div>}
      <Explainer>
        <p>Shows the result of a blind count after the system has done the sorting: most lines auto-accept, off lines are recounted, and only what&apos;s still off reaches the owner.</p>
        <p>Both counts and the snapshot time are visible. Liquor is shown in ml, never rounded to bottles. Approving always posts a reason code; the counters are excluded from approval.</p>
      </Explainer>
    </>
  );
}

'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useAction, useApi } from '@/lib/hooks';
import { dueIn, inr } from '@/lib/format';
import { MobileShell } from '@/components/MobileShell';
import { PhotoButton } from '@/components/PhotoButton';
import { ErrorBox, Loading } from '@/components/ui';

type Ex = {
  id: string; type: string; title: string; summary: string; impact: number; status: string; dueAt: string; outlet: string | null;
  escalatesTo: { name: string }[]; explanation: { reasonCode: string; note: string } | null; can: { explain: boolean; decide: boolean };
};

export default function Explain() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const ex = useApi<Ex>('mobile', `/exceptions/${id}`);
  const e = ex.data;
  const reasons = useApi<{ code: string; label: string }[]>('mobile', e ? `/reason-codes?domain=${e.type === 'UNBILLED_KOT' ? 'KOT_EXPLAIN' : e.type.includes('VARIANCE') ? 'STOCK_ADJ' : 'EXCEPTION_CLOSE'}` : null);
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const act = useAction();
  if (!e) return <MobileShell title="Exception" back="/m/approvals">{ex.error ? <ErrorBox message={ex.error.message} /> : <Loading />}</MobileShell>;
  const finish = async (p: () => Promise<unknown>) => {
    if (await act.run(p)) router.replace('/m/approvals');
  };
  return (
    <MobileShell title={e.title} back="/m/approvals" footer={
      e.can.explain ? (
        <button className="btn btn-primary w-full justify-center py-3 text-base" disabled={!reason || !note.trim() || !photos.length || act.busy} onClick={() => finish(() => api('mobile', `/exceptions/${id}/explain`, { body: { reasonCode: reason, note, evidenceIds: photos } }))}>Send explanation</button>
      ) : e.can.decide ? (
        <div className="flex gap-2">
          <button className="btn btn-primary flex-1 justify-center py-3" disabled={act.busy} onClick={() => finish(() => api('mobile', `/exceptions/${id}/decide`, { body: { decision: 'ACCEPT' } }))}>Accept</button>
          <button className="btn btn-ghost flex-1 justify-center py-3" disabled={act.busy || !note.trim()} onClick={() => finish(() => api('mobile', `/exceptions/${id}/decide`, { body: { decision: 'REJECT', note } }))}>Reject</button>
        </div>
      ) : undefined
    }>
      <div className="text-sm text-slate-500">{e.outlet}, {inr(e.impact)}, {dueIn(e.dueAt).toLowerCase()}</div>
      <p className="mt-2 text-sm">{e.summary}</p>
      {e.explanation && (
        <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm">
          <div className="font-medium">{e.explanation.reasonCode.replaceAll('_', ' ').toLowerCase()}</div>
          <p className="mt-1 text-slate-700">{e.explanation.note}</p>
        </div>
      )}
      {e.can.explain && (
        <>
          <div className="mt-4 text-sm font-medium">What happened?</div>
          <div className="mt-2 space-y-2">
            {reasons.data?.map((r) => (
              <button key={r.code} onClick={() => setReason(r.code)} className={`block w-full rounded-lg border px-3 py-2.5 text-left text-sm ${reason === r.code ? 'border-brand bg-brand-50 font-medium text-brand-600' : 'border-slate-200'}`}>{r.label}</button>
            ))}
          </div>
          <label className="label mt-4 block">Explanation</label>
          <textarea className="input mt-1" rows={3} value={note} onChange={(x) => setNote(x.target.value)} />
          <PhotoButton photos={photos} setPhotos={setPhotos} label="Evidence (photo, CCTV still)" />
          {e.escalatesTo[0] && <p className="mt-3 text-xs text-slate-500">If this is above your limit it goes to {e.escalatesTo[0].name} to accept or reject.</p>}
        </>
      )}
      {e.can.decide && (
        <>
          <label className="label mt-4 block">Note (required to reject)</label>
          <textarea className="input mt-1" rows={2} value={note} onChange={(x) => setNote(x.target.value)} />
        </>
      )}
      <ErrorBox message={act.error} />
    </MobileShell>
  );
}

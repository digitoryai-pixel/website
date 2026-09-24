'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useAction, useApi } from '@/lib/hooks';
import { MobileShell } from '@/components/MobileShell';
import { ErrorBox, Loading } from '@/components/ui';

type T = { id: string; number: string; from: string; lines: { lineId: string; name: string; baseUnit: string }[] };

export default function ReceiveTransfer() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const list = useApi<T[]>('mobile', '/m/transfers/incoming');
  const [q, setQ] = useState<Record<string, string>>({});
  const [res, setRes] = useState<{ status: string; gaps: string[] } | null>(null);
  const act = useAction();
  const t = list.data?.find((x) => x.id === id);
  if (res) return (
    <MobileShell title="Transfer received" back="/m">
      <p className="text-sm">{res.gaps.length ? `Recorded. The gap (${res.gaps.join(', ')}) has been raised to both stores.` : 'Recorded. Stock has moved.'}</p>
      <button className="btn btn-primary mt-6 w-full justify-center py-3" onClick={() => router.replace('/m')}>Back to my tasks</button>
    </MobileShell>
  );
  if (!t) return <MobileShell title="Transfer" back="/m">{list.loading ? <Loading /> : <p className="text-sm text-slate-500">Nothing to receive.</p>}</MobileShell>;
  return (
    <MobileShell title={`Transfer ${t.number}`} back="/m" footer={
      <button className="btn btn-primary w-full justify-center py-3 text-base" disabled={act.busy || t.lines.some((l) => !q[l.lineId])} onClick={async () => {
        const r = await act.run(() => api<{ status: string; gaps: string[] }>('mobile', `/m/transfers/${id}/receive`, { body: { lines: t.lines.map((l) => ({ lineId: l.lineId, qtyReceived: Number(q[l.lineId]) })) } }));
        if (r) setRes(r);
      }}>Confirm what arrived</button>
    }>
      <p className="mb-3 text-sm text-slate-600">From {t.from}. Enter what arrived; the quantity sent is hidden.</p>
      {t.lines.map((l) => (
        <div key={l.lineId} className="mb-3 rounded-xl border border-slate-200 p-3">
          <div className="font-medium">{l.name}</div>
          <div className="mt-2 flex items-center gap-2"><input className="input text-xl" inputMode="decimal" value={q[l.lineId] ?? ''} onChange={(e) => setQ({ ...q, [l.lineId]: e.target.value.replace(/[^\d.]/g, '') })} /><span className="text-sm text-slate-500">{l.baseUnit.toLowerCase()}</span></div>
        </div>
      ))}
      <ErrorBox message={act.error} />
    </MobileShell>
  );
}

'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useAction, useApi } from '@/lib/hooks';
import { inr } from '@/lib/format';
import { useScale } from '@/lib/scale';
import { MobileShell, useMobileUser } from '@/components/MobileShell';
import { PhotoButton } from '@/components/PhotoButton';
import { ErrorBox } from '@/components/ui';

type Item = { id: string; name: string; baseUnit: string; standardCost: number; category: string };

export default function LogWastage() {
  const me = useMobileUser();
  const items = useApi<Item[]>('mobile', '/items');
  const reasons = useApi<{ code: string; label: string }[]>('mobile', '/reason-codes?domain=WASTAGE');
  const scale = useScale();
  const [itemId, setItemId] = useState('');
  const [q, setQ] = useState('');
  const [reason, setReason] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [result, setResult] = useState<string | null>(null);
  const act = useAction();
  const item = items.data?.find((i) => i.id === itemId);
  const value = item && q ? Number(q) * item.standardCost : 0;
  const outletId = me?.user.outlets[0]?.id;
  const weighed = scale.connected && scale.locked;

  return (
    <MobileShell title="Log wastage" back="/m" footer={
      <button className="btn btn-primary w-full justify-center py-3 text-base" disabled={!itemId || !q || !reason || act.busy} onClick={async () => {
        const r = await act.run(() => api<{ routedTo: string }>('mobile', '/m/wastage', { body: { outletId, itemId, reasonCode: reason, photoIds: photos, ...(weighed ? { scaleReadings: [{ kg: Number(q) }] } : { typedQty: Number(q) }) } }));
        if (r) { setResult(`Logged. Goes to ${r.routedTo} for approval.`); setItemId(''); setQ(''); setReason(''); setPhotos([]); }
      }}>Log wastage</button>
    }>
      {result && <div className="mb-3 rounded-lg bg-ok-50 p-3 text-sm text-ok">{result}</div>}
      <div className="text-sm text-slate-500">{me?.user.outlets[0]?.name}</div>
      <label className="label mt-3 block">Item</label>
      <select className="input mt-1 text-base" value={itemId} onChange={(e) => setItemId(e.target.value)}>
        <option value="">Choose…</option>
        {items.data?.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
      </select>
      <label className="label mt-4 block">Quantity{item?.baseUnit === 'KG' ? ', from scale' : ''}</label>
      <div className="mt-1 flex items-center gap-2">
        <input className="input text-xl" inputMode="decimal" value={q} onChange={(e) => setQ(e.target.value.replace(/[^\d.]/g, ''))} />
        <span className="text-sm text-slate-500">{item?.baseUnit.toLowerCase()}</span>
        {scale.connected && <button className="btn btn-ghost" disabled={!scale.locked} onClick={() => setQ(String(scale.kg))}>Scale</button>}
      </div>
      {!scale.connected && scale.supported && <button className="mt-1 text-xs text-brand-600 underline" onClick={scale.connect}>Connect scale</button>}
      {value > 0 && <div className="mt-1 text-sm text-slate-600">≈ {inr(value)}</div>}
      <label className="label mt-4 block">Reason</label>
      <div className="mt-1 grid grid-cols-2 gap-2">
        {reasons.data?.map((r) => (
          <button key={r.code} onClick={() => setReason(r.code)} className={`rounded-lg border px-3 py-2.5 text-sm ${reason === r.code ? 'border-brand bg-brand-50 font-medium text-brand-600' : 'border-slate-200'}`}>{r.label}</button>
        ))}
      </div>
      <PhotoButton photos={photos} setPhotos={setPhotos} label="Photo required above ₹500" />
      <p className="mt-3 text-xs text-slate-500">Goes to your manager for approval. You can&apos;t approve your own entry.</p>
      <ErrorBox message={act.error} />
    </MobileShell>
  );
}

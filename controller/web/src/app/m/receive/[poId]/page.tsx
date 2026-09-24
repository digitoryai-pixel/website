'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useAction, useApi } from '@/lib/hooks';
import { useScale } from '@/lib/scale';
import { MobileShell } from '@/components/MobileShell';
import { PhotoButton } from '@/components/PhotoButton';
import { ErrorBox, Loading } from '@/components/ui';

type V = { poId: string; poNo: string; outletId: string; vendorId: string; vendor: string; blind: boolean; lines: { itemId: string; name: string; baseUnit: string; weighOnScale: boolean; orderedQty?: number }[] };

export default function Receive() {
  const { poId } = useParams<{ poId: string }>();
  const router = useRouter();
  const v = useApi<V>('mobile', `/m/receiving/${poId}`);
  const scale = useScale();
  const [qtys, setQtys] = useState<Record<string, string>>({});
  const [invoiceNo, setInvoiceNo] = useState('');
  const [invPhoto, setInvPhoto] = useState<string[]>([]);
  const [goodsPhoto, setGoodsPhoto] = useState<string[]>([]);
  const [result, setResult] = useState<{ grnNo: string; duplicateWarning: string | null } | null>(null);
  const act = useAction();
  if (!v.data) return <MobileShell title="Receive goods" back="/m">{v.error ? <ErrorBox message={v.error.message} /> : <Loading />}</MobileShell>;
  const d = v.data;
  if (result) {
    return (
      <MobileShell title="Goods received" back="/m">
        <p className="text-lg font-semibold">{result.grnNo} created</p>
        <p className="mt-1 text-sm text-slate-600">Weights and photos are attached. Finance matches it against the PO and invoice before anything is paid.</p>
        {result.duplicateWarning && <div className="mt-3"><ErrorBox message={result.duplicateWarning} /></div>}
        <button className="btn btn-primary mt-6 w-full justify-center py-3" onClick={() => router.replace('/m')}>Back to my tasks</button>
      </MobileShell>
    );
  }
  const ready = d.lines.every((l) => qtys[l.itemId] !== undefined && qtys[l.itemId] !== '') && invoiceNo && invPhoto.length && goodsPhoto.length;
  return (
    <MobileShell title="Receive goods" back="/m" footer={
      <button className="btn btn-primary w-full justify-center py-3 text-base" disabled={!ready || act.busy} onClick={async () => {
        const r = await act.run(() => api<{ grnNo: string; duplicateWarning: string | null }>('mobile', '/m/grns', {
          body: {
            outletId: d.outletId, poId, vendorId: d.vendorId, invoiceNo, invoicePhotoId: invPhoto[0], goodsPhotoId: goodsPhoto[0],
            lines: d.lines.map((l) => (l.weighOnScale && scale.connected ? { itemId: l.itemId, scaleReadings: [{ kg: Number(qtys[l.itemId]) }] } : { itemId: l.itemId, qty: Number(qtys[l.itemId]) })),
          },
        }));
        if (r) setResult(r);
      }}>Confirm receipt</button>
    }>
      <div className="font-medium">{d.vendor}, {d.poNo}</div>
      {d.blind && <p className="mt-1 rounded-lg bg-navy-50 p-2.5 text-sm text-navy">Blind receiving is on. Weigh or count what arrived; the ordered quantity is hidden.</p>}
      <div className="mt-4 space-y-3">
        {d.lines.map((l) => (
          <div key={l.itemId} className="rounded-xl border border-slate-200 p-3">
            <div className="flex justify-between"><span className="font-medium">{l.name}</span><span className="text-xs text-slate-500">{l.weighOnScale ? 'Weigh on scale' : 'Count'}</span></div>
            <div className="mt-2 flex items-center gap-2">
              <input className="input text-xl" inputMode="decimal" placeholder={l.weighOnScale ? 'kg' : 'qty'} value={qtys[l.itemId] ?? ''} onChange={(e) => setQtys({ ...qtys, [l.itemId]: e.target.value.replace(/[^\d.]/g, '') })} />
              {l.weighOnScale && scale.connected && <button className="btn btn-ghost" disabled={!scale.locked} onClick={() => setQtys({ ...qtys, [l.itemId]: String(scale.kg) })}>Use {scale.kg?.toFixed(2)}</button>}
            </div>
            {l.orderedQty !== undefined && <div className="mt-1 text-xs text-slate-500">Ordered {l.orderedQty}</div>}
          </div>
        ))}
        {scale.supported && !scale.connected && <button className="btn btn-ghost w-full justify-center" onClick={scale.connect}>Connect scale at the door</button>}
      </div>
      <div className="mt-4">
        <label className="label">Vendor invoice number</label>
        <input className="input mt-1 text-lg" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} />
      </div>
      <PhotoButton photos={invPhoto} setPhotos={setInvPhoto} label="Invoice photo" />
      <PhotoButton photos={goodsPhoto} setPhotos={setGoodsPhoto} label="Goods photo" />
      <ErrorBox message={act.error} />
    </MobileShell>
  );
}

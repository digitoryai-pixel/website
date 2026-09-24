'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Bluetooth, Check, CheckCircle2, ChevronRight, Scale } from 'lucide-react';
import { api } from '@/lib/api';
import { useAction, useApi } from '@/lib/hooks';
import { time } from '@/lib/format';
import { useScale } from '@/lib/scale';
import { MobileShell } from '@/components/MobileShell';
import { ErrorBox, Loading } from '@/components/ui';
import { PhotoButton } from '@/components/PhotoButton';

type Line = { id: string; name: string; shelf: string | null; countMode: 'WEIGHT' | 'UNITS' | 'BOTTLE_AND_OPEN'; baseUnit: string; packSize: number | null; emptyWeightG: number | null; counted: boolean };
type View = { id: string; type: string; status: string; location: string; dueAt: string; counted: number; total: number; lines: Line[]; message?: string };
type Submitted = { submittedAt: string; items: number; scaleReadings: number; photos: number; typedWeights: number; message: string };

export default function CountTask() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const v = useApi<View>('mobile', `/m/counts/${id}`);
  const [active, setActive] = useState<Line | null>(null);
  const [done, setDone] = useState<Submitted | null>(null);
  const act = useAction();

  if (done) {
    return (
      <MobileShell title="Count submitted">
        <div className="py-6 text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-ok" />
          <div className="mt-3 text-lg font-semibold">Submitted at {time(done.submittedAt)}</div>
          <p className="mt-2 text-sm text-slate-600">The system is checking your count against sales. You won&apos;t see the result.</p>
          <p className="mt-2 text-sm text-slate-600">Someone else may be asked to recount some items. That&apos;s routine and happens on every count.</p>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          {[['Items', done.items], ['Scale readings', done.scaleReadings], ['Photos', done.photos], ['Typed weights', done.typedWeights]].map(([l, n]) => (
            <div key={l} className="rounded-lg bg-slate-50 p-2"><div className="num text-lg font-semibold">{n}</div><div className="text-[11px] text-slate-500">{l}</div></div>
          ))}
        </div>
        <button className="btn btn-primary mt-6 w-full justify-center py-3" onClick={() => router.replace('/m')}>Back to my tasks</button>
      </MobileShell>
    );
  }
  if (v.loading && !v.data) return <MobileShell title="Count" back="/m"><Loading /></MobileShell>;
  if (v.error) return <MobileShell title="Count" back="/m"><ErrorBox message={v.error.message} /></MobileShell>;
  const d = v.data!;

  if (d.status === 'ASSIGNED') {
    const recount = d.type === 'RECOUNT';
    return (
      <MobileShell title={recount ? 'Recount' : 'Spot count'} back="/m" footer={
        <button className="btn btn-primary w-full justify-center py-3 text-base" disabled={act.busy} onClick={async () => { if (await act.run(() => api('mobile', `/m/counts/${id}/start`, { method: 'POST' }))) v.reload(); }}>
          {recount ? 'Start recount' : 'Start count'}
        </button>
      }>
        <p className="text-sm text-slate-600">{recount ? "Count exactly as you would normally. You won't see the first count or who did it." : d.message}</p>
        <p className="mt-2 text-sm text-slate-600">Due {time(d.dueAt)}. Put weighed items on the scale; the reading is saved as it is shown.</p>
        <ErrorBox message={act.error} />
      </MobileShell>
    );
  }

  if (active) return <Entry taskId={id} line={active} onDone={() => { setActive(null); v.reload(); }} />;

  const shelves = [...new Set(d.lines.map((l) => l.shelf ?? ''))];
  const next = d.lines.find((l) => !l.counted);
  return (
    <MobileShell title={d.location} back="/m" footer={
      next ? <button className="btn btn-primary w-full justify-center py-3 text-base" onClick={() => setActive(next)}>Count {next.name.replace(/ \d+ ml$/, '')}</button>
        : <button className="btn btn-primary w-full justify-center py-3 text-base" disabled={act.busy} onClick={async () => { const r = await act.run(() => api<Submitted>('mobile', `/m/counts/${id}/submit`, { method: 'POST' })); if (r) setDone(r); }}>Submit count</button>
    }>
      <div className="mb-3 text-sm text-slate-500">{d.counted} of {d.total} counted</div>
      <ErrorBox message={act.error} />
      {shelves.map((s) => (
        <div key={s} className="mb-4">
          {s && <div className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">{s}</div>}
          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
            {d.lines.filter((l) => (l.shelf ?? '') === s).map((l) => (
              <button key={l.id} className="flex w-full items-center gap-3 px-3.5 py-3 text-left" onClick={() => setActive(l)}>
                <div className="flex-1">
                  <div className="font-medium">{l.name}</div>
                  <div className="text-xs text-slate-500">{l.countMode === 'BOTTLE_AND_OPEN' ? 'Bottles + open bottle' : l.countMode === 'WEIGHT' ? `Count in kg, all trays` : 'Count units'}</div>
                </div>
                {l.counted ? <span className="flex items-center gap-1 text-xs font-medium text-ok"><Check className="h-4 w-4" />Counted</span> : l.id === next?.id ? <span className="text-xs font-medium text-brand-600">Next</span> : <ChevronRight className="h-4 w-4 text-slate-400" />}
              </button>
            ))}
          </div>
        </div>
      ))}
    </MobileShell>
  );
}

function Entry({ taskId, line, onDone }: { taskId: string; line: Line; onDone: () => void }) {
  const scale = useScale();
  const [readings, setReadings] = useState<number[]>([]);
  const [typed, setTyped] = useState('');
  const [typing, setTyping] = useState(false);
  const [sealed, setSealed] = useState('');
  const [openG, setOpenG] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const act = useAction();
  useEffect(() => {
    if (line.countMode === 'BOTTLE_AND_OPEN' && scale.locked && scale.kg !== null) setOpenG(String(Math.round(scale.kg * 1000)));
  }, [scale.locked, scale.kg, line.countMode]);

  const liquidMl = line.emptyWeightG && openG ? Math.max(0, Math.round((Number(openG) - line.emptyWeightG) / 0.94)) : 0;
  const totalMl = (Number(sealed) || 0) * (line.packSize ?? 0) + liquidMl;
  const body =
    line.countMode === 'BOTTLE_AND_OPEN' ? { sealedUnits: Number(sealed), ...(openG ? { openWeightG: Number(openG) } : {}) }
      : line.countMode === 'WEIGHT' ? (typing ? { typedQty: Number(typed) } : { scaleReadings: readings.map((kg) => ({ kg, deviceId: scale.connected ?? undefined })) })
        : { typedQty: Number(typed) };
  const ready = line.countMode === 'BOTTLE_AND_OPEN' ? sealed !== '' : line.countMode === 'WEIGHT' ? (typing ? typed !== '' : readings.length > 0) : typed !== '';

  return (
    <MobileShell title={line.name} back="#" footer={
      <button className="btn btn-primary w-full justify-center py-3 text-base" disabled={!ready || act.busy} onClick={async () => { if (await act.run(() => api('mobile', `/m/counts/${taskId}/lines/${line.id}`, { method: 'PUT', body: { ...body, photoIds: photos } }))) onDone(); }}>
        Save and next item
      </button>
    }>
      <button className="mb-3 text-sm text-brand-600" onClick={onDone}>‹ Back to list</button>
      {line.countMode === 'BOTTLE_AND_OPEN' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Sealed bottles and the open bottle</p>
          <div>
            <label className="label">Sealed bottles</label>
            <input className="input mt-1 text-2xl" inputMode="numeric" value={sealed} onChange={(e) => setSealed(e.target.value.replace(/\D/g, ''))} />
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="label">Open bottle on scale</div>
            <div className="mt-1 flex items-center gap-2">
              <input className="input text-xl" inputMode="numeric" placeholder="Weight in g" value={openG} onChange={(e) => setOpenG(e.target.value.replace(/[^\d.]/g, ''))} />
              <span className="text-sm text-slate-500">g</span>
            </div>
            <ScaleStatus scale={scale} />
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div><div className="label">Empty bottle (set for this SKU)</div><div className="num">{line.emptyWeightG ?? '—'} g</div></div>
              <div><div className="label">Liquid</div><div className="num">≈ {liquidMl} ml</div></div>
            </div>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 text-sm"><span className="label">Total recorded</span><div className="num text-lg font-semibold">{totalMl.toLocaleString('en-IN')} ml</div></div>
        </div>
      )}
      {line.countMode === 'WEIGHT' && (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">Count in kg, all trays</p>
          {!typing ? (
            <div className="rounded-xl border border-slate-200 p-3">
              <div className="label">Scale reading</div>
              <div className="num mt-1 text-3xl font-semibold">{scale.kg !== null ? `${scale.kg.toFixed(2)} kg` : readings.length ? `${readings.reduce((a, b) => a + b, 0).toFixed(2)} kg` : '— kg'}</div>
              <ScaleStatus scale={scale} />
              {readings.length > 0 && <div className="mt-2 text-xs text-slate-500">Trays: {readings.map((r) => r.toFixed(2)).join(' + ')} kg</div>}
              <button className="btn btn-ghost mt-3 w-full justify-center" disabled={!scale.locked || scale.kg === null} onClick={() => { setReadings([...readings, scale.kg!]); scale.reset(); }}>
                <Scale className="h-4 w-4" />{readings.length ? 'Add another tray' : 'Use this reading'}
              </button>
              <button className="mt-2 w-full text-center text-sm text-slate-500 underline" onClick={() => setTyping(true)}>Type instead</button>
            </div>
          ) : (
            <div>
              <label className="label">Weight in kg</label>
              <input className="input mt-1 text-2xl" inputMode="decimal" value={typed} onChange={(e) => setTyped(e.target.value.replace(/[^\d.]/g, ''))} />
              <p className="mt-1 text-xs text-attention">Typed weights are allowed but flagged for review.</p>
              {scale.supported && <button className="mt-2 text-sm text-brand-600 underline" onClick={() => setTyping(false)}>Use the scale</button>}
            </div>
          )}
        </div>
      )}
      {line.countMode === 'UNITS' && (
        <div>
          <label className="label">How many {line.baseUnit === 'PC' ? 'units' : ''}?</label>
          <input className="input mt-1 text-2xl" inputMode="numeric" value={typed} onChange={(e) => setTyped(e.target.value.replace(/[^\d.]/g, ''))} />
        </div>
      )}
      <PhotoButton photos={photos} setPhotos={setPhotos} label="Photo (required above ₹5,000)" />
      <ErrorBox message={act.error} />
    </MobileShell>
  );
}

function ScaleStatus({ scale }: { scale: ReturnType<typeof useScale> }) {
  if (!scale.supported) return <div className="mt-2 text-xs text-slate-500">Bluetooth scale not available on this browser; type the reading.</div>;
  if (!scale.connected) return <button className="btn btn-ghost mt-2 py-1 text-xs" onClick={scale.connect}><Bluetooth className="h-3.5 w-3.5" />Connect scale</button>;
  return <div className={`mt-2 flex items-center gap-1.5 text-xs ${scale.locked ? 'text-ok' : 'text-attention'}`}><span className="h-2 w-2 rounded-full bg-current" />{scale.locked ? 'Scale connected, reading locked' : 'Scale connected, settling…'}</div>;
}

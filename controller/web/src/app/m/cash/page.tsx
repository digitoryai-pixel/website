'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useAction, useApi } from '@/lib/hooks';
import { inr } from '@/lib/format';
import { MobileShell, useMobileUser } from '@/components/MobileShell';
import { ErrorBox, Loading } from '@/components/ui';

const NOTES = ['500', '200', '100', '50', '20', '10'] as const;
type Shift = { id: string; outletId: string; till: string; shiftName: string; status: string; counted?: number; expected?: number; variance?: number } | null;
type Denoms = Record<string, string>;
const total = (d: Denoms) => NOTES.reduce((s, n) => s + Number(n) * (Number(d[n]) || 0), 0) + (Number(d.coins) || 0);
const payload = (d: Denoms) => Object.fromEntries([...NOTES.map((n) => [n, Number(d[n]) || 0]), ['coins', Number(d.coins) || 0]]);

function DenomGrid({ d, set }: { d: Denoms; set: (d: Denoms) => void }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <table className="grid-table">
        <thead><tr><th>Note</th><th className="r">Count</th><th className="r">₹</th></tr></thead>
        <tbody>
          {NOTES.map((n) => (
            <tr key={n}>
              <td>₹{n}</td>
              <td className="r"><input className="input w-20 text-right" inputMode="numeric" value={d[n] ?? ''} onChange={(e) => set({ ...d, [n]: e.target.value.replace(/\D/g, '') })} /></td>
              <td className="r num">{((Number(d[n]) || 0) * Number(n)).toLocaleString('en-IN')}</td>
            </tr>
          ))}
          <tr><td>Coins</td><td className="r"><input className="input w-20 text-right" inputMode="numeric" value={d.coins ?? ''} onChange={(e) => set({ ...d, coins: e.target.value.replace(/\D/g, '') })} /></td><td className="r num">{(Number(d.coins) || 0).toLocaleString('en-IN')}</td></tr>
          <tr className="font-semibold"><td>Counted</td><td /><td className="r num">{total(d).toLocaleString('en-IN')}</td></tr>
        </tbody>
      </table>
    </div>
  );
}

export default function Cash() {
  const me = useMobileUser();
  const shift = useApi<Shift>('mobile', '/m/cash/shifts/current');
  const isManager = ['OUTLET_MANAGER', 'DUTY_MANAGER', 'BAR_MANAGER', 'HEAD_CHEF'].includes(me?.user.role ?? '');
  const seconds = useApi<{ id: string; till: string; shiftName: string; cashier: string }[]>('mobile', isManager ? '/m/cash/second-counts' : '/m/cash/shifts/current');
  const [d, setD] = useState<Denoms>({});
  const [till, setTill] = useState('1');
  const [shiftName, setShiftName] = useState('evening');
  const [result, setResult] = useState<{ counted: number; expected: number; variance: number; next: string } | null>(null);
  const [second, setSecond] = useState<string | null>(null);
  const [pins, setPins] = useState({ managerPin: '', cashierPin: '' });
  const act = useAction();

  if (shift.loading && shift.data === null && !shift.error) return <MobileShell title="Cash" back="/m"><Loading /></MobileShell>;
  const s = shift.data;

  if (isManager && Array.isArray(seconds.data)) {
    const target = seconds.data.find((x) => x.id === second);
    return (
      <MobileShell title="Second count" back="/m">
        {!target ? (
          seconds.data.length === 0 ? <p className="text-sm text-slate-500">No shifts waiting for a second count.</p> : seconds.data.map((x) => (
            <button key={x.id} className="mb-2 w-full rounded-xl border border-slate-200 p-3 text-left" onClick={() => setSecond(x.id)}>
              <div className="font-medium">Till {x.till}, {x.shiftName}</div><div className="text-sm text-slate-500">Cashier {x.cashier}. Count again, blind.</div>
            </button>
          ))
        ) : result ? (
          <div className="rounded-xl bg-slate-50 p-4 text-sm"><div className="font-semibold">Handover signed</div><div className="mt-1">Variance {inr(result.variance, { sign: true })} stored against the cashier and shift.</div></div>
        ) : (
          <>
            <p className="mb-3 text-sm text-slate-600">Till {target.till}, cashier {target.cashier}. Count by denomination; both of you sign with your PINs.</p>
            <DenomGrid d={d} set={setD} />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div><label className="label">Your PIN</label><input className="input mt-1" type="password" inputMode="numeric" value={pins.managerPin} onChange={(e) => setPins({ ...pins, managerPin: e.target.value })} /></div>
              <div><label className="label">Cashier&apos;s PIN</label><input className="input mt-1" type="password" inputMode="numeric" value={pins.cashierPin} onChange={(e) => setPins({ ...pins, cashierPin: e.target.value })} /></div>
            </div>
            <ErrorBox message={act.error} />
            <button className="btn btn-primary mt-4 w-full justify-center py-3" disabled={act.busy || pins.managerPin.length < 4 || pins.cashierPin.length < 4} onClick={async () => {
              const r = await act.run(() => api<{ counted: number; variance: number }>('mobile', `/m/cash/shifts/${target.id}/second-count`, { body: { denoms: payload(d), ...pins } }));
              if (r) setResult({ counted: r.counted, expected: 0, variance: r.variance, next: '' });
            }}>Sign handover</button>
          </>
        )}
      </MobileShell>
    );
  }

  if (!s) {
    return (
      <MobileShell title="Open shift" back="/m" footer={
        <button className="btn btn-primary w-full justify-center py-3 text-base" disabled={act.busy || total(d) === 0} onClick={async () => {
          if (await act.run(() => api('mobile', '/m/cash/shifts', { body: { outletId: me?.user.outlets[0]?.id, till, shiftName, floatDenoms: payload(d) } }))) { setD({}); shift.reload(); }
        }}>Open shift</button>
      }>
        <div className="mb-3 grid grid-cols-2 gap-2">
          <div><label className="label">Till</label><input className="input mt-1" value={till} onChange={(e) => setTill(e.target.value)} /></div>
          <div><label className="label">Shift</label><select className="input mt-1" value={shiftName} onChange={(e) => setShiftName(e.target.value)}><option>morning</option><option>evening</option></select></div>
        </div>
        <p className="mb-3 text-sm text-slate-600">Count the float by denomination. You won&apos;t see the expected float.</p>
        <DenomGrid d={d} set={setD} />
        <ErrorBox message={act.error} />
      </MobileShell>
    );
  }

  const shown = result ?? (s.status === 'COUNT_SUBMITTED' ? { counted: s.counted!, expected: s.expected!, variance: s.variance!, next: 'The duty manager now counts again and both of you sign the handover.' } : null);
  return (
    <MobileShell title={`Close ${s.shiftName} shift`} back="/m" footer={!shown &&
      <button className="btn btn-primary w-full justify-center py-3 text-base" disabled={act.busy || total(d) === 0} onClick={async () => {
        const r = await act.run(() => api<{ counted: number; expected: number; variance: number; next: string }>('mobile', `/m/cash/shifts/${s.id}/close`, { body: { denoms: payload(d) } }));
        if (r) setResult(r);
      }}>Submit count</button>
    }>
      <div className="mb-3 text-sm text-slate-500">{me?.user.shortName}, till {s.till}</div>
      {shown ? (
        <div className="space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
          <div className="flex justify-between"><span>Counted</span><span className="num font-semibold">{inr(shown.counted)}</span></div>
          <div className="flex justify-between"><span>Expected</span><span className="num">{inr(shown.expected)}</span></div>
          <div className={`flex justify-between font-semibold ${shown.variance < 0 ? 'text-critical' : 'text-ok'}`}><span>Variance</span><span className="num">{inr(shown.variance, { sign: true })}</span></div>
          <p className="pt-2 text-slate-600">{shown.next}</p>
        </div>
      ) : (
        <>
          <DenomGrid d={d} set={setD} />
          <p className="mt-3 text-xs text-slate-500">The expected amount appears after you submit. The duty manager then counts again and both of you sign the handover.</p>
        </>
      )}
      <ErrorBox message={act.error} />
    </MobileShell>
  );
}

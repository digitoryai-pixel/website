'use client';
import { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { api } from '@/lib/api';
import { useAction, useApi } from '@/lib/hooks';
import { useShell } from '@/components/WebShell';
import { ErrorBox, Explainer, Loading, PageHeader } from '@/components/ui';

type Tol = { pct: number; rupees: number; frequency: string };
type Lim = { discountPct: number | null; comps: number | null; wastage: number | null; stockAdj: number | null };
type C = { tolerances: Record<string, Tol>; approvalLimits: Record<string, Lim>; sla: Record<string, { hours: number; escalateTo: string }>; settings: Record<string, unknown>; separationOfDuties: { key: string; label: string }[] };
const CAT: Record<string, string> = { SPIRITS_WINE: 'Spirits and wine', DRAUGHT_BEER: 'Draught beer', BOTTLED_BEER: 'Bottled beer', MEAT_SEAFOOD: 'Meat and seafood', DAIRY: 'Dairy', PRODUCE: 'Produce', DRY_STORE: 'Dry store', PACKAGING: 'Packaging' };
const ROLES: [string, string][] = [['CASHIER', 'Cashier'], ['DUTY_MANAGER', 'Duty manager'], ['BAR_MANAGER', 'Bar manager'], ['HEAD_CHEF', 'Head chef'], ['OUTLET_MANAGER', 'Outlet manager']];
const FREQ: Record<string, string> = { DAILY: 'Daily', '3X_WEEK': '3 × week', WEEKLY: 'Weekly' };

export default function Controls() {
  const { session } = useShell();
  const [scope, setScope] = useState('chain');
  const c = useApi<C>('web', `/controls?outletId=${scope}`);
  const [draft, setDraft] = useState<C | null>(null);
  const act = useAction();
  const [saved, setSaved] = useState(false);
  useEffect(() => setDraft(c.data), [c.data]);
  const canEdit = ['OWNER', 'FINANCE_HEAD'].includes(session.user.role);
  if (!draft) return <Loading />;
  const num = (v: string) => (v === '' ? 0 : Number(v));
  const setTol = (k: string, f: keyof Tol, v: string | number) => setDraft({ ...draft, tolerances: { ...draft.tolerances, [k]: { ...draft.tolerances[k], [f]: v } } });
  const setLim = (r: string, f: keyof Lim, v: string) => setDraft({ ...draft, approvalLimits: { ...draft.approvalLimits, [r]: { ...draft.approvalLimits[r], [f]: num(v) } } });
  const setSla = (s: string, v: string) => setDraft({ ...draft, sla: { ...draft.sla, [s]: { ...draft.sla[s], hours: num(v) } } });

  return (
    <>
      <PageHeader
        title="Controls setup"
        right={
          <>
            <select className="input w-auto" value={scope} onChange={(e) => setScope(e.target.value)}>
              <option value="chain">Chain default</option>
              {session.user.outlets.filter((o) => o.kind === 'RESTAURANT').map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
            {canEdit && (
              <button className="btn btn-primary" disabled={act.busy} onClick={async () => {
                const r = await act.run(() => api('web', `/controls?outletId=${scope}`, { method: 'PUT', body: { tolerances: draft.tolerances, approvalLimits: Object.fromEntries(ROLES.map(([k]) => [k, draft.approvalLimits[k]])), sla: draft.sla } }));
                if (r) { setSaved(true); setTimeout(() => setSaved(false), 2000); c.reload(); }
              }}>{saved ? 'Saved' : 'Save changes'}</button>
            )}
          </>
        }
      />
      <ErrorBox message={act.error} />
      <fieldset disabled={!canEdit} className="grid gap-5 xl:grid-cols-2">
        <div className="card overflow-x-auto">
          <div className="border-b border-slate-100 px-4 py-3 text-sm font-medium text-navy">Count tolerances <span className="font-normal text-slate-500">beyond these, recount is automatic</span></div>
          <table className="grid-table">
            <thead><tr><th>Category</th><th>Tolerance %</th><th>Or ₹ per line</th><th>Spot count</th></tr></thead>
            <tbody>
              {Object.entries(draft.tolerances).map(([k, t]) => (
                <tr key={k}>
                  <td>{CAT[k] ?? k}</td>
                  <td><input className="input w-20" type="number" step="0.1" value={t.pct} onChange={(e) => setTol(k, 'pct', num(e.target.value))} /></td>
                  <td><input className="input w-24" type="number" value={t.rupees} onChange={(e) => setTol(k, 'rupees', num(e.target.value))} /></td>
                  <td><select className="input w-28" value={t.frequency} onChange={(e) => setTol(k, 'frequency', e.target.value)}>{Object.entries(FREQ).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card overflow-x-auto">
          <div className="border-b border-slate-100 px-4 py-3 text-sm font-medium text-navy">Approval limits <span className="font-normal text-slate-500">per person, per day</span></div>
          <table className="grid-table">
            <thead><tr><th>Role</th><th>Discount %</th><th>Comps ₹</th><th>Wastage ₹</th><th>Stock adj. ₹</th></tr></thead>
            <tbody>
              {ROLES.map(([k, label]) => {
                const l = draft.approvalLimits[k] ?? { discountPct: 0, comps: 0, wastage: 0, stockAdj: 0 };
                return (
                  <tr key={k}>
                    <td>{label}</td>
                    {(['discountPct', 'comps', 'wastage', 'stockAdj'] as const).map((f) => <td key={f}><input className="input w-24" type="number" value={l[f] ?? 0} onChange={(e) => setLim(k, f, e.target.value)} /></td>)}
                  </tr>
                );
              })}
              <tr><td>Owner, finance head</td><td>Any</td><td>Any</td><td>Any</td><td>Any</td></tr>
            </tbody>
          </table>
        </div>
        <div className="card overflow-x-auto">
          <div className="border-b border-slate-100 px-4 py-3 text-sm font-medium text-navy">Response times</div>
          <table className="grid-table">
            <thead><tr><th>Severity</th><th>Owner must close within (hours)</th><th>Then goes to</th></tr></thead>
            <tbody>{(['CRITICAL', 'ATTENTION', 'PENDING'] as const).map((s) => <tr key={s}><td>{s[0] + s.slice(1).toLowerCase()}</td><td><input className="input w-24" type="number" value={draft.sla[s].hours} onChange={(e) => setSla(s, e.target.value)} /></td><td>{draft.sla[s].escalateTo.replaceAll('_', ' ').toLowerCase()}</td></tr>)}</tbody>
          </table>
        </div>
        <div className="card p-4 text-sm">
          <div className="mb-2 font-medium text-navy">Separation of duties <span className="font-normal text-slate-500">locked on</span></div>
          {draft.separationOfDuties.map((s) => <div key={s.key} className="flex items-center gap-2 py-1"><span className="inline-flex items-center gap-1 rounded bg-ok-50 px-2 py-0.5 text-xs font-medium text-ok"><Lock className="h-3 w-3" />Always on</span>{s.label}</div>)}
          <p className="mt-2 text-xs text-slate-500">These can&apos;t be switched off, so an outlet can&apos;t weaken the controls the owner relies on.</p>
        </div>
      </fieldset>
      <Explainer>
        <p>Where the owner sets how strict the system is. Tolerances and limits are adjustable; separation of duties isn&apos;t.</p>
        <p>Changes are logged with before and after values and need the owner or finance head. Set per outlet, with a chain default.</p>
      </Explainer>
    </>
  );
}

'use client';
import { useState } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { api } from '@/lib/api';
import { useAction, useApi } from '@/lib/hooks';
import { lastMonth } from '@/lib/format';
import { useShell } from '@/components/WebShell';
import { ErrorBox, Explainer, Loading, PageHeader, Pill } from '@/components/ui';

type Cell = { ok: boolean; label: string };
type C = { month: string; status: string; outlets: { outletId: string; name: string; ready: boolean; cells: Record<string, Cell> }[]; steps: { key: string; label: string; doneBy: string }[]; readyCount: number; blockers: string[]; history: { action: string; at: string; reason?: string }[] };
const monthName = (m: string) => new Date(`${m}-15T00:00:00Z`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

export default function MonthEnd() {
  const { session } = useShell();
  const [month, setMonth] = useState(lastMonth());
  const [reason, setReason] = useState('');
  const c = useApi<C>('web', `/periods/${month}/checklist`);
  const act = useAction();
  const d = c.data;
  const run = async (p: () => Promise<unknown>) => {
    if (await act.run(p)) c.reload();
  };
  const canLock = d && d.status !== 'LOCKED' && d.readyCount === d.outlets.length;
  return (
    <>
      <PageHeader
        title={`Close ${monthName(month)}`}
        sub={d ? (d.status === 'LOCKED' ? 'Locked' : `${d.readyCount} of ${d.outlets.length} outlets ready`) : ''}
        right={
          <>
            <input type="month" className="input w-auto" value={month} onChange={(e) => setMonth(e.target.value)} />
            {d?.status === 'LOCKED' ? (
              session.user.role === 'FINANCE_HEAD' && <span className="flex gap-2"><input className="input w-56" placeholder="Reason for reopening" value={reason} onChange={(e) => setReason(e.target.value)} /><button className="btn btn-ghost" disabled={reason.trim().length < 5 || act.busy} onClick={() => run(() => api('web', `/periods/${month}/reopen`, { body: { reason } }))}><Unlock className="h-4 w-4" />Reopen</button></span>
            ) : (
              // Disabled until every outlet is clear; the blockers panel says why.
              <button className="btn btn-primary" disabled={!canLock || act.busy} title={canLock ? '' : 'Blocked, see below'} onClick={() => run(() => api('web', `/periods/${month}/lock`, { method: 'POST' }))}><Lock className="h-4 w-4" />Lock period</button>
            )}
          </>
        }
      />
      <ErrorBox message={act.error} />
      {!d ? <Loading /> : (
        <>
          <div className="card overflow-x-auto">
            <table className="grid-table">
              <thead><tr><th>Step</th><th>Done by</th>{d.outlets.map((o) => <th key={o.outletId}>{o.name}</th>)}</tr></thead>
              <tbody>
                {d.steps.map((s) => (
                  <tr key={s.key}>
                    <td className="font-medium">{s.label}</td><td className="text-slate-500">{s.doneBy}</td>
                    {d.outlets.map((o) => {
                      const cell = o.cells[s.key];
                      return <td key={o.outletId} className={cell.ok ? 'text-slate-700' : 'bg-critical-50 font-medium text-critical'}>{cell.label}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {d.blockers.length > 0 && d.status !== 'LOCKED' && (
            <div className="card mt-4 border-red-200 p-4 text-sm">
              <div className="font-medium text-critical">Blocking the lock</div>
              {d.blockers.map((b) => <p key={b} className="mt-1">{b}</p>)}
            </div>
          )}
          <div className="card mt-4 p-4 text-sm">
            <div className="font-medium text-navy">After lock</div>
            <p className="mt-1">Stock, purchases and sales for {monthName(month).split(' ')[0]} can&apos;t be edited. Only the finance head can reopen, with a logged reason.</p>
            <p className="mt-1 text-slate-500">Tally/Zoho export arrives in Phase 2; until then download the MIS pack from Reports.</p>
            {session.user.role !== 'REGIONAL_CONTROLLER' && d.status !== 'LOCKED' && !d.outlets.every((o) => o.cells.fullCount.ok) && (
              <button className="btn btn-ghost mt-3" disabled={act.busy} onClick={() => run(() => api('web', `/periods/${month}/full-count`, { body: { dueAt: new Date(Date.now() + 6 * 3600_000).toISOString() } }))}>Schedule full count of all items</button>
            )}
            {d.history.length > 0 && <div className="mt-3 space-y-1">{d.history.map((h, i) => <div key={i}><Pill tone={h.action === 'LOCK' ? 'navy' : 'amber'}>{h.action.toLowerCase()}</Pill> <span className="text-xs text-slate-500">{new Date(h.at).toLocaleString('en-IN')}{h.reason ? ` — ${h.reason}` : ''}</span></div>)}</div>}
          </div>
        </>
      )}
      <Explainer>
        <p>Turns the controller&apos;s month-end into a checklist that fills itself. Finance only acts on the red cells. The lock button stays disabled until every outlet is clear and says why.</p>
        <p>Phase 2 adds gateway, aggregator and bank rows; Phase 3 adds payroll, accruals and P&amp;L.</p>
      </Explainer>
    </>
  );
}

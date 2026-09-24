'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { CheckSquare, Square } from 'lucide-react';
import { api, attachmentUrl } from '@/lib/api';
import { useAction, useApi } from '@/lib/hooks';
import { dateTime, day, inr, qty } from '@/lib/format';
import { useShell } from '@/components/WebShell';
import { EvidencePicker } from '@/components/Evidence';
import { ErrorBox, Explainer, Loading, PageHeader, Pill, SeverityPill } from '@/components/ui';

type Person = { id: string; name: string; role: string };
type Ex = {
  id: string; type: string; severity: string; status: string; title: string; summary: string; impact: number; businessDate: string; outlet: string | null;
  drivers: { label: string; amount: number }[] | null; detail: Record<string, unknown> | null; suggestedChecks: { label: string; done: boolean }[] | null;
  sourceRefs: { type: string; id: string; label: string }[] | null; explanation: { reasonCode: string; note: string; byId: string; at: string } | null;
  dueAt: string; assignee: Person | null; escalatesTo: Person[]; involved: Person[]; owner: { name: string; sub: string }; routedPastOutlet: boolean;
  evidence: { id: string; kind: string; mime: string }[]; events: { id: string; at: string; kind: string; actor: string | null; payload: Record<string, unknown> | null }[];
  closeReasonCode: string | null; closeNote: string | null; closedAt: string | null; occurrences: number;
  can: { close: boolean; explain: boolean; decide: boolean; reassign: boolean };
};
type Reason = { code: string; label: string; domain: string };

const REASON_DOMAINS: Record<string, string> = { UNBILLED_KOT: 'KOT_EXPLAIN,EXCEPTION_CLOSE', STOCK_VARIANCE: 'STOCK_ADJ,EXCEPTION_CLOSE', LIQUOR_VARIANCE: 'STOCK_ADJ,EXCEPTION_CLOSE' };

export default function ExceptionDetail() {
  const { id } = useParams<{ id: string }>();
  const { refreshBadge } = useShell();
  const ex = useApi<Ex>('web', `/exceptions/${id}`);
  const e = ex.data;
  const reasons = useApi<Reason[]>('web', e ? `/reason-codes?domain=${REASON_DOMAINS[e.type] ?? 'EXCEPTION_CLOSE'}` : null);
  const users = useApi<{ id: string; shortName: string; roleLabel: string }[]>('web', '/users');
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [evidence, setEvidence] = useState<string[]>([]);
  const [reassignTo, setReassignTo] = useState('');
  const [decisionNote, setDecisionNote] = useState('');
  const act = useAction();

  if (ex.loading && !e) return <Loading />;
  if (ex.error) return <ErrorBox message={ex.error.message} />;
  if (!e) return null;
  const done = async (p: Promise<unknown>) => {
    const r = await act.run(() => p);
    if (r) {
      ex.reload();
      refreshBadge();
    }
  };
  const d = e.detail ?? {};
  const recipeItems = (d.recipeItems as { item: string; sold: number; ingredient: string; unit: string; theoretical: number; actual: number; gap: number }[] | undefined) ?? [];
  const totalDrivers = (e.drivers ?? []).reduce((s, x) => s + x.amount, 0);

  return (
    <>
      <PageHeader
        crumbs={<><Link href="/" className="hover:underline">Needs attention</Link> › {e.title}</>}
        title={<span className="flex flex-wrap items-center gap-2">{e.title} <SeverityPill severity={e.severity} /> {e.status === 'RESOLVED' && <Pill tone="green">Resolved</Pill>} {e.status === 'AWAITING_DECISION' && <Pill tone="navy">Awaiting decision</Pill>}</span>}
        sub={`${e.outlet ?? 'All outlets'}, ${day(e.businessDate, true)}${e.occurrences > 1 ? ` · seen ${e.occurrences} times` : ''}`}
      />
      <ErrorBox message={act.error} />
      <div className="mt-3 grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <div className="card p-5">
            <div className="num text-3xl font-semibold text-navy">{inr(e.impact)}</div>
            <div className="text-sm text-slate-500">{e.summary}</div>
            {typeof d.actualPct === 'number' && (
              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div><div className="label">Actual food cost</div><div className="num font-semibold">{(d.actualPct as number).toFixed(1)}%</div></div>
                <div><div className="label">Theoretical</div><div className="num font-semibold">{(d.theoreticalPct as number).toFixed(1)}%</div></div>
                <div><div className="label">Food net sales</div><div className="num font-semibold">{inr(d.sales as number)}</div></div>
              </div>
            )}
            {typeof d.headline === 'string' && <p className="mt-3 text-sm text-slate-700">{d.headline}</p>}
          </div>

          {!!e.drivers?.length && (
            <div className="card">
              <div className="border-b border-slate-100 px-4 py-3 text-sm font-medium text-navy">Where the {inr(e.impact)} came from <span className="font-normal text-slate-500">each driver in ₹</span></div>
              <table className="grid-table">
                <thead><tr><th>Driver</th><th className="r">₹</th></tr></thead>
                <tbody>
                  {e.drivers.map((x) => <tr key={x.label}><td>{x.label}</td><td className="r num">{inr(x.amount, { sign: true })}</td></tr>)}
                  <tr><td className="font-semibold">Total</td><td className="r num font-semibold">{inr(totalDrivers, { sign: true })}</td></tr>
                </tbody>
              </table>
            </div>
          )}

          {recipeItems.length > 0 && (
            <div className="card overflow-x-auto">
              <div className="border-b border-slate-100 px-4 py-3 text-sm font-medium text-navy">Items driving the recipe variance <span className="font-normal text-slate-500">theoretical vs actual</span></div>
              <table className="grid-table">
                <thead><tr><th>Item</th><th className="r">Sold</th><th>Main ingredient</th><th className="r">Theoretical</th><th className="r">Actual</th><th className="r">Gap ₹</th></tr></thead>
                <tbody>{recipeItems.map((r) => <tr key={r.ingredient}><td>{r.item}</td><td className="r num">{r.sold}</td><td>{r.ingredient}</td><td className="r num">{qty(r.theoretical, r.unit)}</td><td className="r num">{qty(r.actual, r.unit)}</td><td className="r num">{inr(r.gap)}</td></tr>)}</tbody>
              </table>
            </div>
          )}

          {typeof d.count1 === 'number' && (
            <div className="card p-4 text-sm">
              <div className="mb-2 font-medium text-navy">Count detail</div>
              <div className="grid grid-cols-3 gap-3">
                <div><div className="label">System at snapshot</div><div className="num">{qty(d.system as number, d.unit as string)}</div></div>
                <div><div className="label">Count 1</div><div className="num">{qty(d.count1 as number, d.unit as string)}</div></div>
                <div><div className="label">Recount</div><div className="num">{qty(d.recount as number, d.unit as string)}</div></div>
              </div>
              <Link className="mt-3 inline-block text-brand-600 underline" href={`/counts/${d.countTaskId as string}`}>Open stock count review</Link>
            </div>
          )}

          {Array.isArray(d.lines) && (
            <div className="card overflow-x-auto">
              <div className="border-b border-slate-100 px-4 py-3 text-sm font-medium text-navy">PO vs GRN vs invoice</div>
              <table className="grid-table">
                <thead><tr><th>Item</th><th className="r">PO qty</th><th className="r">PO rate</th><th className="r">Received</th><th className="r">Invoice rate</th><th className="r">Difference</th></tr></thead>
                <tbody>{(d.lines as { item: string; poQty: number; poRate: number; received: number; invRate: number; difference: number }[]).map((l) => <tr key={l.item}><td>{l.item}</td><td className="r num">{l.poQty}</td><td className="r num">{l.poRate}</td><td className="r num">{l.received}</td><td className="r num">{l.invRate}</td><td className="r num">{inr(l.difference)}</td></tr>)}</tbody>
              </table>
              <Link className="block px-4 py-2 text-sm text-brand-600 underline" href="/purchases">Open three-way match</Link>
            </div>
          )}

          {e.type === 'UNBILLED_KOT' && <Link className="btn btn-ghost" href="/kot">Open KOT-to-bill match</Link>}

          {e.explanation && (
            <div className="card p-4 text-sm">
              <div className="font-medium text-navy">Explanation</div>
              <div className="mt-1"><Pill tone="navy">{e.explanation.reasonCode.replaceAll('_', ' ').toLowerCase()}</Pill></div>
              <p className="mt-2 text-slate-700">{e.explanation.note}</p>
              <div className="mt-1 text-xs text-slate-500">{dateTime(e.explanation.at)}</div>
              {e.can.decide && (
                <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                  <input className="input" placeholder="Note (required to reject)" value={decisionNote} onChange={(x) => setDecisionNote(x.target.value)} />
                  <div className="flex gap-2">
                    <button className="btn btn-primary" disabled={act.busy} onClick={() => done(api('web', `/exceptions/${e.id}/decide`, { body: { decision: 'ACCEPT', note: decisionNote || undefined } }))}>Accept</button>
                    <button className="btn btn-ghost" disabled={act.busy || !decisionNote.trim()} onClick={() => done(api('web', `/exceptions/${e.id}/decide`, { body: { decision: 'REJECT', note: decisionNote } }))}>Reject</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {e.evidence.length > 0 && (
            <div className="card p-4">
              <div className="mb-2 text-sm font-medium text-navy">Evidence</div>
              <div className="flex flex-wrap gap-2">
                {e.evidence.map((a) => a.mime.startsWith('image/') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <a key={a.id} href={attachmentUrl('web', a.id)} target="_blank" rel="noreferrer"><img src={attachmentUrl('web', a.id)} alt="Evidence" className="h-20 w-20 rounded-md border object-cover" /></a>
                ) : <a key={a.id} className="text-sm underline" href={attachmentUrl('web', a.id)} target="_blank" rel="noreferrer">Document</a>)}
              </div>
            </div>
          )}

          <div className="card p-4">
            <div className="mb-2 text-sm font-medium text-navy">History</div>
            <ol className="space-y-1.5 text-sm">
              {e.events.map((ev) => (
                <li key={ev.id} className="flex gap-3">
                  <span className="w-32 shrink-0 text-xs text-slate-500">{dateTime(ev.at)}</span>
                  <span><span className="font-medium">{ev.actor ?? 'System'}</span> · {ev.kind.toLowerCase().replaceAll('_', ' ')}{ev.payload && 'note' in ev.payload && ev.payload.note ? `: ${String(ev.payload.note)}` : ''}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="card space-y-3 p-4 text-sm">
            <div><div className="label">Owner</div><div className="font-medium">{e.owner.name}{e.owner.sub ? `, ${e.owner.sub.toLowerCase()}` : ''}</div></div>
            <div><div className="label">Due</div><div>{dateTime(e.dueAt)}</div></div>
            <div><div className="label">Escalates to</div><div>{e.escalatesTo.length ? e.escalatesTo.map((p) => p.name).join(', then ') : 'Top of the chain'}</div></div>
            {e.involved.length > 0 && <div><div className="label">Involved (cannot close)</div><div>{e.involved.map((p) => p.name).join(', ')}</div></div>}
            {e.can.reassign && e.status !== 'RESOLVED' && (
              <div className="flex gap-2 pt-1">
                <select className="input" value={reassignTo} onChange={(x) => setReassignTo(x.target.value)}>
                  <option value="">Reassign to…</option>
                  {(users.data ?? []).filter((u) => !e.involved.some((p) => p.id === u.id)).map((u) => <option key={u.id} value={u.id}>{u.shortName}, {u.roleLabel}</option>)}
                </select>
                <button className="btn btn-ghost" disabled={!reassignTo || act.busy} onClick={() => done(api('web', `/exceptions/${e.id}/reassign`, { body: { userId: reassignTo } }))}>Go</button>
              </div>
            )}
          </div>

          {!!e.suggestedChecks?.length && (
            <div className="card p-4 text-sm">
              <div className="mb-2 font-medium text-navy">Suggested checks</div>
              {e.suggestedChecks.map((c, i) => (
                <button key={c.label} className="flex w-full items-start gap-2 py-1 text-left" disabled={e.status === 'RESOLVED'} onClick={() => done(api('web', `/exceptions/${e.id}/checks/${i}`, { body: { done: !c.done } }))}>
                  {c.done ? <CheckSquare className="mt-0.5 h-4 w-4 text-ok" /> : <Square className="mt-0.5 h-4 w-4 text-slate-400" />} <span>{c.label}</span>
                </button>
              ))}
            </div>
          )}

          {e.status === 'RESOLVED' ? (
            <div className="card p-4 text-sm">
              <div className="font-medium text-ok">Closed {dateTime(e.closedAt)}</div>
              <div className="mt-1">Reason: {e.closeReasonCode?.replaceAll('_', ' ').toLowerCase()}</div>
              {e.closeNote && <div className="mt-1 text-slate-600">{e.closeNote}</div>}
            </div>
          ) : e.can.close && e.status === 'OPEN' ? (
            <div className="card space-y-3 p-4 text-sm">
              <div className="font-medium text-navy">Close this exception</div>
              <div>
                <label className="label">Reason code</label>
                <select className="input mt-1" value={reason} onChange={(x) => setReason(x.target.value)}>
                  <option value="">Choose a reason…</option>
                  {(reasons.data ?? []).map((r) => <option key={r.code} value={r.code}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Evidence</label>
                <div className="mt-1"><EvidencePicker ch="web" ids={evidence} onChange={setEvidence} /></div>
              </div>
              <textarea className="input" rows={2} placeholder="Note (optional)" value={note} onChange={(x) => setNote(x.target.value)} />
              {/* The button stays disabled until both a reason code and evidence are present. */}
              <button className="btn btn-primary w-full justify-center" disabled={!reason || !evidence.length || act.busy} onClick={() => done(api('web', `/exceptions/${e.id}/close`, { body: { reasonCode: reason, note: note || undefined, evidenceIds: evidence } }))}>
                Close with reason
              </button>
              {(!reason || !evidence.length) && <div className="text-xs text-slate-500">Needs a reason code and at least one piece of evidence.</div>}
            </div>
          ) : null}
        </aside>
      </div>
      <Explainer>
        <p>Answers &ldquo;why&rdquo; before anyone asks. The system splits every cost movement into drivers in rupees, then shows the items behind the biggest one.</p>
        <p>Closing needs a reason code and evidence. Suggested checks are generated from the drivers, and ticks are logged. The escalation path is visible.</p>
        <p>People involved in what is being questioned can see it but can&apos;t close it; the button is hidden for them.</p>
      </Explainer>
    </>
  );
}

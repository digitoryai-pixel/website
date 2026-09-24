'use client';
import Link from 'next/link';
import { api, attachmentUrl } from '@/lib/api';
import { useAction, useApi } from '@/lib/hooks';
import { addDays, dateTime, inr, qty, yesterday } from '@/lib/format';
import { OutletPicker, useShell } from '@/components/WebShell';
import { Empty, ErrorBox, Explainer, Loading, PageHeader, Pill } from '@/components/ui';

type W = { id: string; item: string; unit: string; qty: number; value: number; reasonCode: string; section: string | null; loggedBy: string; loggedAt: string; routedTo: string; status: string; decidedBy: string | null; photos: string[]; canDecide: boolean };
type T = { id: string; number: string; from: string; to: string; dispatchedAt: string; dueBy: string; status: string; overdue: boolean; exceptionId: string | null; lines: { item: string; unit: string; qtySent: number; qtyReceived: number | null }[] };

export default function Wastage() {
  const { outletId } = useShell();
  const w = useApi<W[]>('web', `/wastage?outletId=${outletId}&from=${addDays(yesterday(), -6)}`);
  const t = useApi<T[]>('web', `/transfers?outletId=${outletId}`);
  const act = useAction();
  const decide = async (id: string, approve: boolean) => {
    if (await act.run(() => api('web', `/wastage/${id}/decide`, { body: { approve } }))) w.reload();
  };
  return (
    <>
      <PageHeader title="Wastage and transfers" sub="Anything that leaves stock without a sale is logged when it happens" right={<OutletPicker />} />
      <ErrorBox message={act.error} />
      <div className="card overflow-x-auto">
        <div className="border-b border-slate-100 px-4 py-3 text-sm font-medium text-navy">Wastage, last 7 days</div>
        {w.loading && !w.data ? <Loading /> : !w.data?.length ? <Empty>No wastage logged.</Empty> : (
          <table className="grid-table">
            <thead><tr><th>When</th><th>Item</th><th className="r">Qty</th><th className="r">₹</th><th>Reason</th><th>Logged by</th><th>Approver</th><th>Photo</th><th>Status</th></tr></thead>
            <tbody>
              {w.data.map((r) => (
                <tr key={r.id}>
                  <td>{dateTime(r.loggedAt)}</td><td>{r.item}{r.section ? <span className="text-slate-500"> · {r.section}</span> : ''}</td><td className="r num">{qty(r.qty, r.unit)}</td><td className="r num">{inr(r.value)}</td>
                  <td>{r.reasonCode.replaceAll('_', ' ').toLowerCase()}</td><td>{r.loggedBy}</td><td>{r.decidedBy ?? r.routedTo}</td>
                  <td>{r.photos[0] ? <a className="underline" href={attachmentUrl('web', r.photos[0])} target="_blank" rel="noreferrer">View</a> : '—'}</td>
                  <td>
                    {r.status === 'PENDING' && r.canDecide ? (
                      <span className="flex gap-1">
                        <button className="btn btn-primary py-1 text-xs" disabled={act.busy} onClick={() => decide(r.id, true)}>Approve</button>
                        <button className="btn btn-ghost py-1 text-xs" disabled={act.busy} onClick={() => decide(r.id, false)}>Reject</button>
                      </span>
                    ) : <Pill tone={r.status === 'APPROVED' ? 'green' : r.status === 'REJECTED' ? 'red' : 'amber'}>{r.status.toLowerCase()}</Pill>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="card mt-5 overflow-x-auto">
        <div className="border-b border-slate-100 px-4 py-3 text-sm font-medium text-navy">Transfers</div>
        {!t.data?.length ? <Empty>No transfers.</Empty> : (
          <table className="grid-table">
            <thead><tr><th>No.</th><th>From → to</th><th>Dispatched</th><th>Items (sent / received)</th><th>Status</th></tr></thead>
            <tbody>
              {t.data.map((r) => (
                <tr key={r.id}>
                  <td>{r.number}</td><td>{r.from} → {r.to}</td><td>{dateTime(r.dispatchedAt)}</td>
                  <td>{r.lines.map((l) => `${l.item} ${qty(l.qtySent, l.unit)} / ${l.qtyReceived === null ? '—' : qty(l.qtyReceived, l.unit)}`).join('; ')}</td>
                  <td>{r.exceptionId ? <Link href={`/exceptions/${r.exceptionId}`}><Pill tone="red">{r.status === 'IN_TRANSIT' ? 'Overdue' : 'Gap'}</Pill></Link> : r.status === 'IN_TRANSIT' ? <Pill tone={r.overdue ? 'red' : 'amber'}>{r.overdue ? 'Overdue' : 'In transit'}</Pill> : <Pill tone="green">Received</Pill>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Explainer>
        <p>Photo required above a value threshold. The person logging wastage cannot approve it; above the manager&apos;s limit it goes to the owner.</p>
        <p>Transfers are confirmed blind by the receiving outlet. Stock can&apos;t sit in transit indefinitely; overdue transfers are flagged.</p>
      </Explainer>
    </>
  );
}

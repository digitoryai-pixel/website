'use client';
import { useState } from 'react';
import { api, attachmentUrl } from '@/lib/api';
import { useAction, useApi } from '@/lib/hooks';
import { addDays, inr, yesterday } from '@/lib/format';
import { OutletPicker, useShell } from '@/components/WebShell';
import { Empty, ErrorBox, Explainer, Loading, PageHeader, Pill, Select } from '@/components/ui';

type Row = { id: string; vendor: string; invoiceNo: string; invoiceDate: string; po: string | null; grn: string | null; amount: number; check: string | null; status: string; payment: string };
type Line = { item: string; unit: string; poQty: number | null; poRate: number | null; received: number; invQty: number; invRate: number; invoiced: number; payable: number; difference: number; contractRate: number | null };
type Detail = {
  id: string; vendor: string; invoiceNo: string; status: string; checkResult: string; amount: number; payable: number; difference: number; poNo: string | null; grnNo: string | null;
  trail: { poBy: string | null; approvedBy: string | null; receivedBy: string | null; weighed: boolean; decidedBy: string | null }; lines: Line[]; evidence: { id: string }[];
  debitNotes: { number: string; amount: number }[]; decisionReason: string | null; can: { decide: boolean };
};
const PAY_TONE: Record<string, 'red' | 'amber' | 'green' | 'grey' | 'navy'> = { 'On hold': 'red', Blocked: 'red', 'Needs approval': 'amber', 'Not due': 'grey', Released: 'green', Paid: 'navy' };

export default function Purchases() {
  const { outletId } = useShell();
  const [range, setRange] = useState('7');
  const [openId, setOpenId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const from = addDays(yesterday(), -Number(range) + 1);
  const list = useApi<Row[]>('web', `/invoices?outletId=${outletId}&from=${from}`);
  const det = useApi<Detail>('web', openId ? `/invoices/${openId}` : null);
  const reasons = useApi<{ code: string; label: string }[]>('web', '/reason-codes?domain=INVOICE_ACCEPT,EXCEPTION_CLOSE');
  const act = useAction();
  const d = det.data;
  const decide = async (action: string, extra: Record<string, string> = {}) => {
    if (await act.run(() => api('web', `/invoices/${openId}/decide`, { body: { action, ...extra } }))) {
      det.reload();
      list.reload();
    }
  };
  const contract = d?.lines.find((l) => l.contractRate && l.invRate > l.contractRate);

  return (
    <>
      <PageHeader title="Purchases awaiting payment" right={<><OutletPicker /><Select value={range} onChange={setRange} options={[{ value: '7', label: 'This week' }, { value: '30', label: 'Last 30 days' }, { value: '90', label: 'Last 90 days' }]} /></>} />
      <div className="card overflow-x-auto">
        {list.loading && !list.data ? <Loading /> : !list.data?.length ? <Empty>No invoices.</Empty> : (
          <table className="grid-table">
            <thead><tr><th>Vendor</th><th>Invoice</th><th>PO</th><th>GRN</th><th className="r">Invoice ₹</th><th>Check</th><th>Payment</th></tr></thead>
            <tbody>
              {list.data.map((r) => (
                <tr key={r.id} className={`cursor-pointer hover:bg-slate-50 ${openId === r.id ? 'bg-brand-50' : ''}`} onClick={() => setOpenId(r.id)}>
                  <td className="font-medium">{r.vendor}</td><td>{r.invoiceNo}</td><td>{r.po ?? 'none'}</td><td>{r.grn ?? '—'}</td><td className="r num">{inr(r.amount)}</td>
                  <td className={r.check === 'Matched' ? 'text-ok' : 'text-critical'}>{r.check}</td><td><Pill tone={PAY_TONE[r.payment] ?? 'grey'}>{r.payment}</Pill></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {openId && (
        <div className="card mt-5 overflow-x-auto">
          {!d ? <Loading /> : (
            <>
              <div className="border-b border-slate-100 px-4 py-3">
                <div className="font-medium text-navy">{d.vendor}, invoice {d.invoiceNo}</div>
                <div className="text-xs text-slate-500">
                  {d.poNo ? `PO by ${d.trail.poBy}, approved by ${d.trail.approvedBy}` : 'No PO'}{d.trail.receivedBy ? `, received by ${d.trail.receivedBy}${d.trail.weighed ? ' with scale' : ''}` : ''}
                  {d.evidence.length > 0 && <> · <a className="underline" href={attachmentUrl('web', d.evidence[0].id)} target="_blank" rel="noreferrer">invoice photo</a></>}
                </div>
              </div>
              {d.lines.length > 0 && (
                <table className="grid-table">
                  <thead><tr><th>Item</th><th className="r">PO qty</th><th className="r">PO rate</th><th className="r">Received (GRN)</th><th className="r">Invoice qty</th><th className="r">Invoice rate</th><th className="r">Invoiced ₹</th><th className="r">Payable ₹</th><th className="r">Difference</th></tr></thead>
                  <tbody>
                    {d.lines.map((l) => (
                      <tr key={l.item}>
                        <td>{l.item}</td><td className="r num">{l.poQty ?? '—'} {l.unit.toLowerCase()}</td><td className="r num">{l.poRate ?? '—'}</td>
                        <td className={`r num ${l.poQty !== null && l.received < l.poQty ? 'text-critical' : ''}`}>{l.received} {l.unit.toLowerCase()}</td>
                        <td className="r num">{l.invQty}</td><td className={`r num ${l.poRate !== null && l.invRate > l.poRate ? 'text-critical' : ''}`}>{l.invRate}</td>
                        <td className="r num">{inr(l.invoiced)}</td><td className="r num">{inr(l.payable)}</td><td className="r num font-medium">{inr(l.difference)}</td>
                      </tr>
                    ))}
                    <tr className="font-semibold"><td>Total</td><td colSpan={5} /><td className="r num">{inr(d.amount)}</td><td className="r num">{inr(d.payable)}</td><td className="r num">{inr(d.difference)}</td></tr>
                  </tbody>
                </table>
              )}
              <div className="space-y-2 p-4 text-sm">
                <p>{d.checkResult}.{contract ? ` Contract rate on file: ₹${contract.contractRate}/${contract.unit.toLowerCase()}.` : ''}</p>
                {d.debitNotes.map((n) => <p key={n.number} className="text-ok">Debit note {n.number} for {inr(n.amount)} raised.</p>)}
                {d.status === 'RELEASED' && d.trail.decidedBy && <p className="text-slate-500">Released by {d.trail.decidedBy}{d.decisionReason ? ` (${d.decisionReason.replaceAll('_', ' ').toLowerCase()})` : ''}.</p>}
                <ErrorBox message={act.error} />
                {d.can.decide ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <select className="input w-64" value={reason} onChange={(e) => setReason(e.target.value)}>
                      <option value="">Reason code…</option>
                      {(reasons.data ?? []).map((r) => <option key={r.code} value={r.code}>{r.label}</option>)}
                    </select>
                    {d.status === 'ON_HOLD' && <button className="btn btn-ghost" disabled={!reason || act.busy} onClick={() => decide('ACCEPT_DIFFERENCE', { reasonCode: reason })}>Accept difference</button>}
                    {d.status === 'ON_HOLD' && <button className="btn btn-primary" disabled={act.busy} onClick={() => decide('DEBIT_NOTE', { note: d.checkResult })}>Raise debit note {inr(d.difference)}</button>}
                    {d.status === 'NEEDS_APPROVAL' && <button className="btn btn-primary" disabled={!reason || act.busy} onClick={() => decide('APPROVE_NO_PO', { reasonCode: reason })}>Approve without PO</button>}
                  </div>
                ) : ['ON_HOLD', 'NEEDS_APPROVAL'].includes(d.status) && <p className="text-slate-500">You created, received or entered this purchase, so someone else decides.</p>}
                {d.status === 'RELEASED' && <button className="btn btn-ghost" disabled={act.busy} onClick={() => decide('MARK_PAID')}>Mark paid</button>}
              </div>
            </>
          )}
        </div>
      )}
      <Explainer>
        <p>Holds payment on anything where the order, the goods received and the bill don&apos;t agree, and shows the exact rupee difference line by line.</p>
        <p>&ldquo;Payable&rdquo; is always the lower of what was received and what was ordered, at the PO rate. Duplicate vendor + invoice number is blocked outright. Invoices without a PO need an approver who didn&apos;t make the purchase.</p>
      </Explainer>
    </>
  );
}

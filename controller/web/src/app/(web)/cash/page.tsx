'use client';
import Link from 'next/link';
import { useApi } from '@/lib/hooks';
import { addDays, day, inr, yesterday } from '@/lib/format';
import { OutletPicker, useShell } from '@/components/WebShell';
import { Empty, Explainer, Loading, PageHeader, Pill } from '@/components/ui';

type Row = { id: string; outlet: string; businessDate: string; till: string; shiftName: string; cashier: string; secondCounter: string | null; floatExpected: number; floatCounted: number | null; expected: number | null; counted: number | null; variance: number | null; status: string; noSaleOpens: number; exceptionId: string | null };

export default function Cash() {
  const { outletId } = useShell();
  const d = useApi<Row[]>('web', `/cash/shifts?outletId=${outletId}&from=${addDays(yesterday(), -30)}`);
  return (
    <>
      <PageHeader title="Cash" sub="Shift closes counted blind by denomination; variance stored against cashier and shift" right={<OutletPicker />} />
      <div className="card overflow-x-auto">
        {d.loading && !d.data ? <Loading /> : !d.data?.length ? <Empty>No shifts.</Empty> : (
          <table className="grid-table">
            <thead><tr><th>Date</th><th>Outlet</th><th>Till, shift</th><th>Cashier</th><th>Second count</th><th className="r">Float</th><th className="r">Expected</th><th className="r">Counted</th><th className="r">Variance</th><th className="r">No-sale opens</th><th>Status</th></tr></thead>
            <tbody>
              {d.data.map((r) => (
                <tr key={r.id}>
                  <td>{day(r.businessDate, true)}</td><td>{r.outlet}</td><td>{r.till}, {r.shiftName}</td><td>{r.cashier}</td><td>{r.secondCounter ?? '—'}</td>
                  <td className={`r num ${r.floatCounted !== null && r.floatCounted !== r.floatExpected ? 'text-critical' : ''}`}>{inr(r.floatCounted)}</td>
                  <td className="r num">{inr(r.expected)}</td><td className="r num">{inr(r.counted)}</td>
                  <td className={`r num font-medium ${(r.variance ?? 0) < 0 ? 'text-critical' : ''}`}>{r.variance === null ? '—' : inr(r.variance, { sign: true })}</td>
                  <td className="r num">{r.noSaleOpens}</td>
                  <td>{r.exceptionId ? <Link href={`/exceptions/${r.exceptionId}`}><Pill tone="red">Exception</Pill></Link> : r.status === 'CLOSED_MATCHED' ? <Pill tone="green">Matched</Pill> : r.status === 'CLOSED_VARIANCE' ? <Pill tone="amber">Signed off</Pill> : r.status === 'COUNT_SUBMITTED' ? <Pill tone="amber">Awaiting second count</Pill> : <Pill>Open</Pill>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Explainer>
        <p>The cashier counts by denomination before seeing the expected amount; the float is counted blind at shift open too. Drawer opens without a sale are logged against the cashier.</p>
        <p>Small but repeated shortages by one cashier raise an exception even if each is under tolerance. Handover needs both cashiers&apos; PINs.</p>
      </Explainer>
    </>
  );
}

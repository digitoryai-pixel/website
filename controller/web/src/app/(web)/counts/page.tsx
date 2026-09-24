'use client';
import Link from 'next/link';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useAction, useApi } from '@/lib/hooks';
import { dateTime, day } from '@/lib/format';
import { OutletPicker, useShell } from '@/components/WebShell';
import { Empty, ErrorBox, Explainer, Loading, PageHeader, Pill } from '@/components/ui';

type Row = { id: string; type: string; status: string; businessDate: string; dueAt: string; submittedAt: string | null; outlet: string; location: string; counter: string; items: number; needApproval: number };
type Outlet = { id: string; name: string; locations: { id: string; name: string }[] };

export default function Counts() {
  const { outletId } = useShell();
  const [onlyApproval, setOnlyApproval] = useState(false);
  const list = useApi<Row[]>('web', `/counts?outletId=${outletId}${onlyApproval ? '&needsApproval=1' : ''}`);
  const outlets = useApi<Outlet[]>('web', '/outlets');
  const [loc, setLoc] = useState('');
  const act = useAction();
  const outlet = outlets.data?.find((o) => o.id === outletId);

  return (
    <>
      <PageHeader
        title="Stock counts"
        sub="Blind counts done in the mobile app, recounted by a different person when off"
        right={
          <>
            <OutletPicker />
            <label className="flex items-center gap-1.5 text-sm"><input type="checkbox" checked={onlyApproval} onChange={(e) => setOnlyApproval(e.target.checked)} /> Needs approval</label>
          </>
        }
      />
      {outlet && (
        <div className="card mb-4 flex flex-wrap items-end gap-2 p-3 text-sm">
          <div>
            <div className="label">Schedule a spot count now at {outlet.name}</div>
            <select className="input mt-1 w-56" value={loc} onChange={(e) => setLoc(e.target.value)}>
              <option value="">Location…</option>
              {outlet.locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <button
            className="btn btn-primary"
            disabled={!loc || act.busy}
            onClick={async () => {
              const r = await act.run(() => api('web', '/counts', { body: { outletId, locationId: loc, dueAt: new Date(Date.now() + 45 * 60_000).toISOString() } }));
              if (r) list.reload();
            }}
          >
            System picks items, assigns a counter
          </button>
          <ErrorBox message={act.error} />
        </div>
      )}
      <div className="card overflow-x-auto">
        {list.loading && !list.data ? <Loading /> : !list.data?.length ? <Empty>No counts.</Empty> : (
          <table className="grid-table">
            <thead><tr><th>Date</th><th>Outlet</th><th>Location</th><th>Type</th><th>Counter</th><th className="r">Items</th><th>Status</th><th /></tr></thead>
            <tbody>
              {list.data.map((r) => (
                <tr key={r.id}>
                  <td>{day(r.businessDate, true)}</td><td>{r.outlet}</td><td>{r.location}</td><td>{r.type === 'FULL' ? 'Full' : 'Spot'}</td><td>{r.counter}</td>
                  <td className="r num">{r.items}</td>
                  <td>
                    {r.needApproval ? <Pill tone="red">{r.needApproval} need approval</Pill> : r.status === 'ASSIGNED' ? <Pill tone="grey">Due {dateTime(r.dueAt)}</Pill> : r.status === 'IN_PROGRESS' ? <Pill tone="amber">Counting</Pill> : r.status === 'SUBMITTED' ? <Pill tone="amber">Recount running</Pill> : <Pill tone="green">Closed</Pill>}
                  </td>
                  <td>{r.status !== 'ASSIGNED' && r.status !== 'IN_PROGRESS' && <Link className="text-brand-600 underline" href={`/counts/${r.id}`}>Review</Link>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Explainer>
        <p>Counts exist only if done in the app, by a named person, at a recorded time and place. Items are picked at random, weighted toward liquor and high-value stock.</p>
      </Explainer>
    </>
  );
}

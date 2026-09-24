'use client';
import { useApi } from '@/lib/hooks';
import { dateTime } from '@/lib/format';
import { MobileShell } from '@/components/MobileShell';
import { Empty, Loading } from '@/components/ui';

type N = { id: string; kind: string; title: string; body: string; createdAt: string; exceptionId: string | null };

export default function Inbox() {
  const n = useApi<N[]>('mobile', '/notifications');
  return (
    <MobileShell title="Inbox">
      <p className="mb-3 text-xs text-slate-500">Criticals also reach the owner directly on WhatsApp, where they can reply 1 to open, 2 to call, or ask a question.</p>
      {!n.data ? <Loading /> : n.data.length === 0 ? <Empty>No messages.</Empty> : n.data.map((x) => (
        <a key={x.id} href={x.exceptionId ? `/m/approvals/${x.exceptionId}` : '#'} className="mb-2 block rounded-xl border border-slate-200 p-3">
          <div className="flex justify-between gap-2 text-xs text-slate-500"><span>{x.kind.replaceAll('_', ' ').toLowerCase()}</span><span>{dateTime(x.createdAt)}</span></div>
          <div className="mt-1 font-medium">{x.title}</div>
          <div className="whitespace-pre-line text-sm text-slate-600">{x.body}</div>
        </a>
      ))}
    </MobileShell>
  );
}

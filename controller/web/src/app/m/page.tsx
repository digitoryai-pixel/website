'use client';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useApi } from '@/lib/hooks';
import { time } from '@/lib/format';
import { MobileShell } from '@/components/MobileShell';
import { Empty, ErrorBox, Loading } from '@/components/ui';

type Task = { kind: string; id: string; title: string; subtitle: string; items?: string[]; dueAt: string | null; status?: string };
const HREF: Record<string, (t: Task) => string> = {
  COUNT: (t) => `/m/count/${t.id}`, RECOUNT: (t) => `/m/count/${t.id}`, RECEIVE: (t) => `/m/receive/${t.id}`, TRANSFER: (t) => `/m/transfer/${t.id}`,
  WASTAGE: () => '/m/wastage', CASH_OPEN: () => '/m/cash', CASH_CLOSE: () => '/m/cash', APPROVALS: () => '/m/approvals',
};

export default function MyTasks() {
  const tasks = useApi<Task[]>('mobile', '/m/tasks');
  const hasCount = tasks.data?.some((t) => t.kind === 'COUNT');
  return (
    <MobileShell title="My tasks today">
      <ErrorBox message={tasks.error?.message} />
      {tasks.loading && !tasks.data ? <Loading /> : !tasks.data?.length ? <Empty>Nothing assigned to you right now.</Empty> : (
        <div className="space-y-2.5">
          {tasks.data.map((t) => (
            <Link key={t.kind + t.id} href={HREF[t.kind]?.(t) ?? '/m'} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 active:bg-slate-50">
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="font-medium text-slate-900">{t.title}</div>
                  {t.dueAt && <div className="shrink-0 text-xs font-medium text-brand-600">{t.kind === 'RECEIVE' ? '~' : 'Due '}{time(t.dueAt)}</div>}
                </div>
                <div className="text-sm text-slate-500">{t.subtitle}</div>
                {t.items && <div className="mt-1 text-sm text-slate-700">{t.items.join(', ')}</div>}
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </Link>
          ))}
        </div>
      )}
      {hasCount && <p className="mt-4 text-xs text-slate-500">You find out which items to count when you start. Counts can only be done here, not on paper or Excel.</p>}
    </MobileShell>
  );
}

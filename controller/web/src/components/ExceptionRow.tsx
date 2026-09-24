import Link from 'next/link';
import { dueIn, inr } from '@/lib/format';
import { SEV_COLOR } from './ui';

export type ExceptionItem = {
  id: string; severity: string; status: string; impact: number; title: string; summary: string; outlet?: string | null;
  owner: { name: string; sub: string }; dueAt: string; overdue?: boolean; occurrences?: number;
};

export function ExceptionRow({ e, href = `/exceptions/${e.id}` }: { e: ExceptionItem; href?: string }) {
  return (
    <Link href={href} className="group flex items-stretch border-b border-slate-100 last:border-0 hover:bg-slate-50">
      <span className="w-1 shrink-0" style={{ background: SEV_COLOR[e.severity] }} aria-label={e.severity.toLowerCase()} />
      <div className="num w-28 shrink-0 px-4 py-3 text-right text-[15px] font-semibold text-navy sm:w-32">{e.impact > 0 ? inr(e.impact) : 'Count'}</div>
      <div className="min-w-0 flex-1 py-3 pr-3">
        <div className="font-medium text-slate-900 group-hover:text-brand-600">
          {e.title}
          {e.status === 'AWAITING_DECISION' && <span className="ml-2 rounded bg-navy-50 px-1.5 py-0.5 text-[11px] font-medium text-navy">Needs your decision</span>}
          {(e.occurrences ?? 1) > 1 && <span className="ml-2 text-xs text-slate-500">×{e.occurrences}</span>}
        </div>
        <div className="mt-0.5 text-sm text-slate-500">{e.summary}</div>
      </div>
      <div className="hidden w-36 shrink-0 py-3 text-sm sm:block">
        <div className="font-medium">{e.owner.name}</div>
        <div className="text-xs text-slate-500">{e.owner.sub}</div>
      </div>
      <div className={`w-24 shrink-0 py-3 pr-4 text-right text-xs ${e.overdue ? 'font-medium text-critical' : 'text-slate-500'}`}>{dueIn(e.dueAt)}</div>
    </Link>
  );
}

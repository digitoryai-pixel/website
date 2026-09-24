'use client';
import type { ReactNode } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

export const SEV_COLOR: Record<string, string> = { CRITICAL: 'var(--color-critical)', ATTENTION: 'var(--color-attention)', PENDING: 'var(--color-pending)' };
export const SEV_LABEL: Record<string, string> = { CRITICAL: 'Critical', ATTENTION: 'Attention', PENDING: 'Pending' };

export function SeverityPill({ severity }: { severity: string }) {
  const bg = severity === 'CRITICAL' ? 'bg-critical-50 text-critical' : severity === 'ATTENTION' ? 'bg-attention-50 text-attention' : 'bg-slate-100 text-slate-600';
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${bg}`}>{SEV_LABEL[severity] ?? severity}</span>;
}

export function Pill({ tone = 'grey', children }: { tone?: 'red' | 'amber' | 'green' | 'grey' | 'orange' | 'navy'; children: ReactNode }) {
  const cls = {
    red: 'bg-critical-50 text-critical', amber: 'bg-attention-50 text-attention', green: 'bg-ok-50 text-ok',
    grey: 'bg-slate-100 text-slate-600', orange: 'bg-brand-50 text-brand-600', navy: 'bg-navy-50 text-navy',
  }[tone];
  return <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{children}</span>;
}

export function Kpi({ label, value, sub, tone }: { label: string; value: ReactNode; sub?: ReactNode; tone?: 'bad' | 'good' | 'neutral' }) {
  const subCls = tone === 'bad' ? 'text-critical' : tone === 'good' ? 'text-ok' : 'text-slate-500';
  return (
    <div className="card px-4 py-3">
      <div className="label">{label}</div>
      <div className="num mt-1 text-xl font-semibold text-navy">{value}</div>
      {sub && <div className={`mt-0.5 text-xs ${subCls}`}>{sub}</div>}
    </div>
  );
}

export function Loading({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 p-6 text-sm text-slate-500">
      <Loader2 className="h-4 w-4 animate-spin" /> {label}…
    </div>
  );
}

export function ErrorBox({ message }: { message: string | null | undefined }) {
  if (!message) return null;
  return (
    <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-critical-50 px-3 py-2 text-sm text-critical">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> <span>{message}</span>
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="p-8 text-center text-sm text-slate-500">{children}</div>;
}

export function PageHeader({ crumbs, title, right, sub }: { crumbs?: ReactNode; title: ReactNode; right?: ReactNode; sub?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        {crumbs && <div className="mb-1 text-xs text-slate-500">{crumbs}</div>}
        <h1 className="text-xl font-semibold text-navy">{title}</h1>
        {sub && <div className="mt-0.5 text-sm text-slate-500">{sub}</div>}
      </div>
      {right && <div className="flex flex-wrap items-center gap-2">{right}</div>}
    </div>
  );
}

/** Explains what the screen does, as in the screens pack. */
export function Explainer({ children }: { children: ReactNode }) {
  return (
    <details className="card mt-6 px-4 py-3 text-sm text-slate-600">
      <summary className="cursor-pointer font-medium text-navy">What this screen does</summary>
      <div className="mt-2 space-y-1.5">{children}</div>
    </details>
  );
}

export function Select({ value, onChange, options, className = '' }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; className?: string }) {
  return (
    <select className={`input w-auto ${className}`} value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

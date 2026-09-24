'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { BarChart3, Bell, CheckCircle2, ChevronLeft, ListTodo, LogOut } from 'lucide-react';
import { getSession, setSession, type Session } from '@/lib/api';

const MANAGER_ROLES = ['OUTLET_MANAGER', 'DUTY_MANAGER', 'BAR_MANAGER', 'HEAD_CHEF', 'OWNER', 'FINANCE_HEAD'];

export function MobileShell({ title, back, children, footer }: { title: ReactNode; back?: string; children: ReactNode; footer?: ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const [s, setS] = useState<Session | null>(null);
  useEffect(() => {
    const x = getSession('mobile');
    if (!x) router.replace('/m/login');
    else setS(x);
  }, [router]);
  if (!s) return null;
  const isManager = MANAGER_ROLES.includes(s.user.role);
  const tabs = [
    { href: '/m', label: 'Tasks', icon: ListTodo },
    ...(isManager ? [{ href: '/m/approvals', label: 'Approve', icon: CheckCircle2 }] : []),
    ...(['OWNER', 'FINANCE_HEAD', 'OUTLET_MANAGER'].includes(s.user.role) ? [{ href: '/m/flash', label: 'Flash', icon: BarChart3 }] : []),
    { href: '/m/inbox', label: 'Inbox', icon: Bell },
  ];
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-white shadow-sm">
      <header className="sticky top-0 z-10 flex items-center gap-2 bg-navy px-3 py-3 text-white">
        {back ? (
          <Link href={back} className="flex items-center text-sm text-white/80"><ChevronLeft className="h-5 w-5" /></Link>
        ) : <span className="w-1" />}
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-semibold">{title}</div>
          <div className="truncate text-xs text-white/60">{s.user.shortName}, {s.user.outlets.map((o) => o.name).join(', ') || s.user.org.name}</div>
        </div>
        {!back && (
          <button aria-label="Sign out" className="rounded p-1 text-white/70" onClick={() => { setSession('mobile', null); router.replace('/m/login'); }}>
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </header>
      <main className="flex-1 px-4 pb-28 pt-4">{children}</main>
      {footer && <div className="fixed inset-x-0 bottom-14 z-10 mx-auto max-w-md border-t border-slate-200 bg-white p-3">{footer}</div>}
      <nav className="fixed inset-x-0 bottom-0 z-10 mx-auto flex max-w-md border-t border-slate-200 bg-white">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = t.href === '/m' ? path === '/m' : path.startsWith(t.href);
          return (
            <Link key={t.href} href={t.href} className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] ${active ? 'text-brand-600' : 'text-slate-500'}`}>
              <Icon className="h-5 w-5" />
              {t.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function useMobileUser() {
  const [s, setS] = useState<Session | null>(null);
  useEffect(() => setS(getSession('mobile')), []);
  return s;
}

'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  AlarmClock, BarChart3, Beer, Bell, BookOpen, ClipboardCheck, FileText, Gift, LayoutList, LogOut, Menu, MessageSquare, Receipt, Settings2, Trash2, Wallet, X,
} from 'lucide-react';
import { api, getSession, setSession, type Session } from '@/lib/api';
import { Logo } from './Logo';

type Ctx = { session: Session; outletId: string; setOutletId: (id: string) => void; badge: number; refreshBadge: () => void };
const ShellCtx = createContext<Ctx | null>(null);
export const useShell = () => useContext(ShellCtx)!;

const NAV: { group: string; items: { href: string; label: string; icon: typeof Bell; badge?: boolean }[] }[] = [
  { group: 'Today', items: [{ href: '/', label: 'Action Centre', icon: AlarmClock, badge: true }, { href: '/flash', label: 'Daily Flash', icon: BarChart3 }] },
  {
    group: 'Control areas',
    items: [
      { href: '/counts', label: 'Stock counts', icon: ClipboardCheck },
      { href: '/liquor', label: 'Liquor and draught', icon: Beer },
      { href: '/kot', label: 'KOT-to-bill', icon: Receipt },
      { href: '/purchases', label: 'Purchases', icon: FileText },
      { href: '/giveaways', label: 'Giveaways', icon: Gift },
      { href: '/cash', label: 'Cash', icon: Wallet },
      { href: '/wastage', label: 'Wastage and transfers', icon: Trash2 },
    ],
  },
  { group: 'Close', items: [{ href: '/close', label: 'Month-end close', icon: LayoutList }, { href: '/reports', label: 'Reports', icon: BookOpen }] },
  { group: 'Help', items: [{ href: '/ask', label: 'Ask Controller', icon: MessageSquare }, { href: '/controls', label: 'Controls setup', icon: Settings2 }] },
];

export function WebShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const [session, setS] = useState<Session | null>(null);
  const [outletId, setOutlet] = useState('all');
  const [badge, setBadge] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const s = getSession('web');
    if (!s) {
      router.replace('/login');
      return;
    }
    setS(s);
    try {
      setOutlet(localStorage.getItem('dc_outlet') ?? 'all');
    } catch {
      /* ignore */
    }
  }, [router]);

  const refreshBadge = () => {
    api<{ counts: { critical: number } }>('web', '/action-centre').then((r) => setBadge(r.counts.critical)).catch(() => undefined);
  };
  useEffect(() => {
    if (session) refreshBadge();
  }, [session]);
  useEffect(() => setOpen(false), [path]);

  if (!session) return null;
  const setOutletId = (id: string) => {
    setOutlet(id);
    try {
      localStorage.setItem('dc_outlet', id);
    } catch {
      /* ignore */
    }
  };
  const initials = session.user.name.split(' ').map((p) => p[0]).slice(0, 2).join('');

  const nav = (
    <nav className="flex h-full flex-col">
      <div className="px-5 pb-4 pt-5">
        <Logo />
        <div className="mt-1 pl-9 text-xs text-slate-500">{session.user.org.name}</div>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {NAV.map((g) => (
          <div key={g.group} className="mb-4">
            <div className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">{g.group}</div>
            {g.items.map((it) => {
              const active = it.href === '/' ? path === '/' || path.startsWith('/exceptions') : path.startsWith(it.href);
              const Icon = it.icon;
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  className={`flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm ${active ? 'bg-brand-50 font-medium text-brand-600' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1">{it.label}</span>
                  {it.badge && badge > 0 && <span className="rounded-full bg-critical px-1.5 text-[11px] font-semibold text-white">{badge}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
      <div className="border-t border-slate-100 p-3">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-navy text-xs font-semibold text-white">{initials}</div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{session.user.shortName}</div>
            <div className="truncate text-xs text-slate-500">{session.user.roleLabel}</div>
          </div>
          <button
            className="rounded p-1.5 text-slate-500 hover:bg-slate-100"
            title="Sign out"
            onClick={() => {
              setSession('web', null);
              router.replace('/login');
            }}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </nav>
  );

  return (
    <ShellCtx.Provider value={{ session, outletId, setOutletId, badge, refreshBadge }}>
      <div className="min-h-screen lg:pl-60">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-slate-200 bg-white lg:block">{nav}</aside>
        {open && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
            <aside className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl">{nav}</aside>
          </div>
        )}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-2.5 backdrop-blur lg:hidden">
          <button onClick={() => setOpen(!open)} aria-label="Menu" className="rounded p-1 hover:bg-slate-100">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Logo />
        </header>
        <main className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </ShellCtx.Provider>
  );
}

export function OutletPicker({ allowAll = true, value, onChange }: { allowAll?: boolean; value?: string; onChange?: (v: string) => void }) {
  const { session, outletId, setOutletId } = useShell();
  const v = value ?? outletId;
  const set = onChange ?? setOutletId;
  const restaurants = session.user.outlets.filter((o) => o.kind === 'RESTAURANT');
  const current = !allowAll && v === 'all' ? restaurants[0]?.id ?? '' : v;
  useEffect(() => {
    if (current !== v) set(current);
  }, [current, v, set]);
  return (
    <select className="input w-auto" value={current} onChange={(e) => set(e.target.value)}>
      {allowAll && <option value="all">All outlets</option>}
      {session.user.outlets.map((o) => (
        <option key={o.id} value={o.id}>
          {o.name}
        </option>
      ))}
    </select>
  );
}

import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Digitory Controller', appleWebApp: { capable: true, title: 'Controller', statusBarStyle: 'black-translucent' } };

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-slate-100">{children}</div>;
}

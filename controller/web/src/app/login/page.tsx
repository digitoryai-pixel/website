'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api, setSession, type Session } from '@/lib/api';
import { useAction } from '@/lib/hooks';
import { ErrorBox } from '@/components/ui';
import { Logo } from '@/components/Logo';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('shiv@hopline.in');
  const [password, setPassword] = useState('');
  const { busy, error, run } = useAction();
  return (
    <div className="grid min-h-screen place-items-center bg-navy px-4">
      <form
        className="card w-full max-w-sm p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          const s = await run(() => api<Session>('web', '/auth/login', { body: { email, password } }));
          if (s) {
            setSession('web', s);
            router.replace('/');
          }
        }}
      >
        <Logo />
        <h1 className="mt-5 text-lg font-semibold text-navy">Sign in</h1>
        <p className="mb-4 text-sm text-slate-500">Owners, finance and controllers.</p>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" className="input mb-3 mt-1" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label className="label" htmlFor="pw">Password</label>
        <input id="pw" className="input mb-4 mt-1" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <ErrorBox message={error} />
        <button type="submit" className="btn btn-primary mt-3 w-full justify-center" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <p className="mt-4 text-center text-xs text-slate-500">
          Outlet staff? <Link href="/m/login" className="text-brand-600 underline">Use the mobile app</Link>
        </p>
      </form>
    </div>
  );
}

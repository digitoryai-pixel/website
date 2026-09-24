'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api, setSession, type Session } from '@/lib/api';
import { useAction } from '@/lib/hooks';
import { ErrorBox } from '@/components/ui';
import { Logo } from '@/components/Logo';

function deviceId() {
  try {
    let id = localStorage.getItem('dc_device');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('dc_device', id);
    }
    return id;
  } catch {
    return 'unknown-device';
  }
}

export default function MobileLogin() {
  const router = useRouter();
  const [phone, setPhone] = useState('9000000001');
  const [pin, setPin] = useState('');
  const { busy, error, run } = useAction();
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center bg-navy px-6">
      <Logo light />
      <p className="mt-2 text-sm text-white/70">Counts, receipts, wastage and cash are entered here, never on paper or Excel.</p>
      <form
        className="mt-6 space-y-3 rounded-2xl bg-white p-5"
        onSubmit={async (e) => {
          e.preventDefault();
          const s = await run(() => api<Session>('mobile', '/auth/mobile-login', { body: { phone, pin, deviceId: deviceId() } }));
          if (s) {
            setSession('mobile', s);
            router.replace('/m');
          }
        }}
      >
        <div>
          <label className="label" htmlFor="ph">Phone</label>
          <input id="ph" className="input mt-1 text-base" inputMode="numeric" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="pin">PIN</label>
          <input id="pin" className="input mt-1 text-center text-2xl tracking-[0.6em]" inputMode="numeric" type="password" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value)} />
        </div>
        <ErrorBox message={error} />
        <button type="submit" className="btn btn-primary w-full justify-center py-3 text-base" disabled={busy || pin.length < 4}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  );
}

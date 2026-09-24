'use client';
import { useCallback, useEffect, useState } from 'react';
import { api, ApiError, getSession, type Channel, type Session } from './api';

export function useSession(ch: Channel) {
  const [s, setS] = useState<Session | null | undefined>(undefined);
  useEffect(() => setS(getSession(ch)), [ch]);
  return s;
}

/** Fetch on mount and whenever `path` changes; `reload` refetches. */
export function useApi<T>(ch: Channel, path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!path) return;
    let live = true;
    setLoading(true);
    api<T>(ch, path)
      .then((d) => live && (setData(d), setError(null)))
      .catch((e) => live && setError(e instanceof ApiError ? e : new ApiError(0, 'NETWORK', String(e))))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [ch, path, tick]);
  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, error, loading, reload, setData };
}

/** Wrap a mutation with busy + error state. */
export function useAction() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const run = useCallback(async <T,>(fn: () => Promise<T>): Promise<T | undefined> => {
    setBusy(true);
    setError(null);
    try {
      return await fn();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : String(e));
      return undefined;
    } finally {
      setBusy(false);
    }
  }, []);
  return { busy, error, setError, run };
}

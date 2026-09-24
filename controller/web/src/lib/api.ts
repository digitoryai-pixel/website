// Thin client for the Controller API. Web and mobile keep separate tokens because a
// mobile token is what allows counts, receipts, wastage and cash entries.
export type Channel = 'web' | 'mobile';
const KEY: Record<Channel, string> = { web: 'dc_web', mobile: 'dc_mobile' };

export type Session = {
  token: string;
  user: {
    id: string; name: string; shortName: string; role: string; roleLabel: string; title: string | null;
    org: { id: string; name: string };
    outlets: { id: string; name: string; code: string; kind: string; hasDraught: boolean }[];
  };
};

export function getSession(ch: Channel): Session | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEY[ch]);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}
export function setSession(ch: Channel, s: Session | null) {
  try {
    if (s) localStorage.setItem(KEY[ch], JSON.stringify(s));
    else localStorage.removeItem(KEY[ch]);
  } catch {
    /* storage unavailable */
  }
}

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public details?: unknown) {
    super(message);
  }
}

export async function api<T = unknown>(ch: Channel, path: string, init: { method?: string; body?: unknown; form?: FormData } = {}): Promise<T> {
  const s = getSession(ch);
  const headers: Record<string, string> = {};
  if (s) headers.authorization = `Bearer ${s.token}`;
  if (init.body !== undefined) headers['content-type'] = 'application/json';
  const res = await fetch(`/api${path}`, {
    method: init.method ?? (init.body !== undefined || init.form ? 'POST' : 'GET'),
    headers,
    body: init.form ?? (init.body !== undefined ? JSON.stringify(init.body) : undefined),
  });
  if (res.status === 401 && s) {
    setSession(ch, null);
    if (typeof window !== 'undefined') window.location.href = ch === 'mobile' ? '/m/login' : '/login';
  }
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const e = json?.error ?? {};
    throw new ApiError(res.status, e.code ?? 'ERROR', e.message ?? res.statusText, e.details);
  }
  return json as T;
}

export async function upload(ch: Channel, file: File, kind = 'PHOTO'): Promise<string> {
  const fd = new FormData();
  fd.append('kind', kind);
  fd.append('file', file);
  const r = await api<{ id: string }>(ch, '/attachments', { form: fd });
  return r.id;
}

export function attachmentUrl(ch: Channel, id: string) {
  return `/api/attachments/${id}?token=${encodeURIComponent(getSession(ch)?.token ?? '')}`;
}

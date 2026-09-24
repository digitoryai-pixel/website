'use client';
import { useRef, useState } from 'react';
import { Camera, FileCheck2, Loader2, X } from 'lucide-react';
import { upload, type Channel } from '@/lib/api';

/** Photo / document picker that uploads straight away and returns attachment ids. */
export function EvidencePicker({ ch, ids, onChange, label = 'Add photo or document', capture = false }: { ch: Channel; ids: string[]; onChange: (ids: string[]) => void; label?: string; capture?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {ids.map((id, i) => (
          <span key={id} className="inline-flex items-center gap-1 rounded-md bg-ok-50 px-2 py-1 text-xs text-ok">
            <FileCheck2 className="h-3.5 w-3.5" /> Evidence {i + 1}
            <button type="button" aria-label="Remove" onClick={() => onChange(ids.filter((x) => x !== id))}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <button type="button" className="btn btn-ghost py-1 text-xs" onClick={() => ref.current?.click()} disabled={busy}>
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />} {label}
        </button>
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*,application/pdf"
        {...(capture ? { capture: 'environment' as const } : {})}
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = '';
          if (!f) return;
          setBusy(true);
          setErr(null);
          try {
            onChange([...ids, await upload(ch, f)]);
          } catch (x) {
            setErr((x as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      />
      {err && <div className="mt-1 text-xs text-critical">{err}</div>}
    </div>
  );
}

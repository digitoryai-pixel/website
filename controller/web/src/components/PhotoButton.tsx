'use client';
import { Camera } from 'lucide-react';
import { upload } from '@/lib/api';
import { useAction } from '@/lib/hooks';

/** Camera capture on the phone; uploads immediately and keeps the attachment ids. */
export function PhotoButton({ photos, setPhotos, label = 'Photo' }: { photos: string[]; setPhotos: (p: string[]) => void; label?: string }) {
  const act = useAction();
  return (
    <label className="mt-4 flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-slate-300 px-3.5 py-3 text-sm">
      <span className="flex items-center gap-2"><Camera className="h-4 w-4" />{label}</span>
      <span className={photos.length ? 'font-medium text-ok' : 'text-slate-400'}>{act.busy ? 'Uploading…' : photos.length ? `${photos.length} ✓` : 'Take'}</span>
      <input type="file" accept="image/*" capture="environment" className="hidden" onChange={async (e) => {
        const f = e.target.files?.[0];
        e.target.value = '';
        if (!f) return;
        const id = await act.run(() => upload('mobile', f));
        if (id) setPhotos([...photos, id]);
      }} />
    </label>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="grid h-7 w-7 grid-cols-2 gap-0.5 rounded-md p-1" style={{ background: '#ff5a10' }} aria-hidden>
        <span className="rounded-[2px] bg-white" />
        <span className="rounded-[2px] bg-white/60" />
        <span className="rounded-[2px] bg-white/60" />
        <span className="rounded-[2px] bg-white" />
      </div>
      <span className={`text-sm font-semibold ${light ? 'text-white' : 'text-navy'}`}>Digitory Controller</span>
    </div>
  );
}

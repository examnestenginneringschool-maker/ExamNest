export function StatBox({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="min-w-[88px] rounded-2xl border border-white/80 bg-white/70 px-3 py-4 text-center shadow-[0_8px_25px_rgba(79,70,229,0.06)] backdrop-blur sm:min-w-[110px] sm:px-5">
      <p className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
        {value}
      </p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:text-[11px]">
        {label}
      </p>
    </div>
  );
}

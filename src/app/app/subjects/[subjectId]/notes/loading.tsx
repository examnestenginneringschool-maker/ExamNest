export default function NotesLoading() {
  return (
    <div className="min-h-screen bg-[#f7f7fb] text-slate-950 animate-pulse">
      {/* Top bar skeleton */}
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-44 rounded-xl bg-slate-200" />
          <div className="flex items-center gap-3">
            <div className="h-8 w-20 rounded-full bg-slate-100 hidden sm:block" />
            <div className="h-8 w-28 rounded-xl bg-slate-100" />
            <div className="h-8 w-8 rounded-full bg-slate-200" />
          </div>
        </div>
      </header>

      {/* Main container */}
      <div className="mx-auto max-w-[1500px] px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pt-8">
        {/* Hero skeleton */}
        <section className="relative overflow-hidden rounded-[32px] border border-indigo-100 bg-gradient-to-br from-[#f0efff] via-[#f8f7ff] to-[#eef5ff] p-6 sm:p-8 md:p-10 lg:p-12">
          <div className="flex flex-col justify-between gap-10 xl:flex-row xl:items-end">
            <div className="max-w-4xl space-y-4">
              <div className="flex gap-2">
                <div className="h-7 w-20 rounded-full bg-white/80" />
                <div className="h-7 w-24 rounded-full bg-white/80" />
              </div>
              <div className="h-4 w-40 rounded bg-indigo-200" />
              <div className="h-12 w-3/4 rounded-2xl bg-slate-200" />
              <div className="h-14 w-full max-w-xl rounded-xl bg-white/60" />
            </div>

            {/* 3 stat boxes */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="h-24 min-w-[88px] rounded-2xl bg-white/70 sm:min-w-[110px]" />
              <div className="h-24 min-w-[88px] rounded-2xl bg-white/70 sm:min-w-[110px]" />
              <div className="h-24 min-w-[88px] rounded-2xl bg-white/70 sm:min-w-[110px]" />
            </div>
          </div>
        </section>

        {/* 2-column reader skeleton */}
        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[300px_minmax(0,1fr)] xl:gap-12">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white/60 p-4">
              <div className="h-4 w-28 rounded bg-slate-200" />
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <div className="h-8 w-8 rounded-full bg-slate-200 shrink-0" />
                  <div className="space-y-1 flex-1">
                    <div className="h-4 w-4/5 rounded bg-slate-200" />
                    <div className="h-3 w-1/2 rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Unit content */}
          <div className="min-w-0 space-y-8">
            <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-indigo-100" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-20 rounded bg-indigo-200" />
                  <div className="h-8 w-2/3 rounded-xl bg-slate-200" />
                </div>
              </div>

              {/* Syllabus coverage box */}
              <div className="h-28 rounded-[24px] border border-slate-100 bg-slate-50 p-5" />

              {/* Topic tags */}
              <div className="flex gap-2">
                <div className="h-7 w-24 rounded-full bg-amber-50 border border-amber-100" />
                <div className="h-7 w-32 rounded-full bg-amber-50 border border-amber-100" />
                <div className="h-7 w-20 rounded-full bg-amber-50 border border-amber-100" />
              </div>

              {/* Blocks */}
              <div className="space-y-4 pt-6">
                <div className="h-28 rounded-2xl border border-indigo-100 bg-indigo-50/30" />
                <div className="h-36 rounded-2xl border border-slate-200 bg-white" />
                <div className="h-24 rounded-2xl border border-emerald-100 bg-emerald-50/30" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

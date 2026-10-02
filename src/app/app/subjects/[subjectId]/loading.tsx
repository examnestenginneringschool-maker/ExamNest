export default function SubjectLoading() {
  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-950 animate-pulse">
      <div className="mx-auto max-w-[1500px] px-5 py-7 md:px-8 md:py-9">
        {/* Top bar skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-6 w-36 rounded-xl bg-slate-200" />
          <div className="h-10 w-10 rounded-full bg-slate-200" />
        </div>

        {/* Hero section skeleton */}
        <div className="relative mt-6 overflow-hidden rounded-[30px] border border-indigo-100 bg-gradient-to-br from-[#eef1ff] via-[#f8f9ff] to-[#eef7ff] p-6 md:p-8 lg:p-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
            {/* Left */}
            <div>
              <div className="flex items-center gap-3">
                <div className="h-7 w-20 rounded-xl bg-indigo-200/70" />
                <div className="h-7 w-28 rounded-full bg-white/80" />
              </div>

              <div className="mt-5 h-12 w-2/3 rounded-2xl bg-slate-200" />
              <div className="mt-3 h-6 w-1/3 rounded-lg bg-slate-100" />
              <div className="mt-4 h-16 w-4/5 rounded-xl bg-white/60" />

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="h-9 w-28 rounded-full bg-white/80" />
                <div className="h-9 w-32 rounded-full bg-white/80" />
                <div className="h-9 w-24 rounded-full bg-white/80" />
              </div>

              {/* 3 Stats */}
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="h-24 rounded-[22px] border border-white/70 bg-white/80 p-4" />
                <div className="h-24 rounded-[22px] border border-white/70 bg-white/80 p-4" />
                <div className="h-24 rounded-[22px] border border-white/70 bg-white/80 p-4" />
              </div>
            </div>

            {/* Right card */}
            <div className="flex h-full flex-col justify-between rounded-[28px] border border-white/60 bg-white/70 p-5 min-h-[300px]">
              <div className="h-16 w-16 rounded-2xl bg-indigo-100" />
              <div className="space-y-3">
                <div className="h-4 w-24 rounded bg-indigo-100" />
                <div className="h-8 w-36 rounded-lg bg-slate-200" />
                <div className="h-12 w-full rounded bg-slate-100" />
              </div>
              <div className="h-12 w-full rounded-2xl bg-indigo-50" />
            </div>
          </div>
        </div>

        {/* Workspace cards skeleton */}
        <div className="mt-10">
          <div className="h-4 w-32 rounded bg-indigo-200/70" />
          <div className="mt-2 h-8 w-48 rounded-xl bg-slate-200" />

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-64 rounded-[26px] border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="h-14 w-14 rounded-2xl bg-indigo-50" />
                    <div className="h-6 w-20 rounded-full bg-slate-100" />
                  </div>
                  <div className="mt-6 h-6 w-3/4 rounded-lg bg-slate-200" />
                  <div className="mt-3 h-12 w-full rounded bg-slate-100" />
                </div>
                <div className="h-8 border-t border-slate-100 pt-3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

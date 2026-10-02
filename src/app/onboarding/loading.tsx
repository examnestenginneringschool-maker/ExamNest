export default function OnboardingLoading() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/20 to-slate-100 px-4 py-8 md:py-14 animate-pulse">
      <div className="mx-auto w-full max-w-4xl">
        {/* Header skeleton */}
        <div className="mb-8 text-center space-y-3">
          <div className="mx-auto h-6 w-44 rounded-full bg-indigo-100" />
          <div className="mx-auto h-9 w-80 rounded-xl bg-slate-200" />
          <div className="mx-auto h-4 w-96 rounded-lg bg-slate-100" />
        </div>

        {/* Stepper skeleton */}
        <div className="mb-8 flex items-center justify-between overflow-x-auto pb-2 min-w-[560px]">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className="h-8 w-24 rounded-full bg-slate-200/80" />
              {i < 6 && <div className="mx-2 h-0.5 flex-1 bg-slate-200" />}
            </div>
          ))}
        </div>

        {/* Main container skeleton */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8 md:p-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <div className="h-6 w-48 rounded-lg bg-slate-200" />
              <div className="h-4 w-72 rounded bg-slate-100" />
            </div>
            <div className="h-9 w-64 rounded-xl bg-slate-100" />
          </div>

          {/* Grid of choices skeleton */}
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-28 rounded-2xl border border-slate-200 bg-white p-5 space-y-3"
              >
                <div className="h-5 w-24 rounded bg-slate-200" />
                <div className="h-3 w-4/5 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

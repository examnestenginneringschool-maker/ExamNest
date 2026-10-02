export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-950 animate-pulse">
      {/* Header skeleton */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center justify-between px-5 md:px-8">
          <div className="h-6 w-28 rounded-lg bg-indigo-200/60" />
          <div className="h-10 w-10 rounded-full bg-slate-200" />
        </div>
      </header>

      {/* Main content skeleton */}
      <div className="mx-auto max-w-[1500px] px-5 py-7 md:px-8 md:py-9">
        {/* Hero banner skeleton */}
        <div className="h-72 w-full rounded-[30px] border border-indigo-100 bg-gradient-to-br from-indigo-50/60 via-slate-50 to-indigo-50/40 p-8 sm:p-10">
          <div className="h-4 w-36 rounded-full bg-indigo-200" />
          <div className="mt-4 h-10 w-72 rounded-xl bg-slate-200" />
          <div className="mt-3 h-5 w-96 rounded-lg bg-slate-100" />
          <div className="mt-8 h-20 w-full max-w-xl rounded-2xl bg-white/70" />
        </div>

        {/* Subjects section skeleton */}
        <div className="mt-10">
          <div className="flex items-center justify-between">
            <div className="h-8 w-44 rounded-xl bg-slate-200" />
            <div className="h-10 w-64 rounded-xl bg-slate-200" />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center">
                    <div className="h-5 w-20 rounded-md bg-indigo-100" />
                    <div className="h-5 w-16 rounded-md bg-slate-100" />
                  </div>
                  <div className="mt-4 h-6 w-4/5 rounded-lg bg-slate-200" />
                  <div className="mt-2 h-4 w-3/5 rounded bg-slate-100" />
                </div>
                <div className="h-10 rounded-xl bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { BookOpen, Layers, History } from "lucide-react";

type SubjectStatsRowProps = {
  unitsCount: number;
};

export function SubjectStatsRow({ unitsCount }: SubjectStatsRowProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {/* Stat 1: Notes Units */}
      <div className="rounded-2xl bg-white p-4 sm:p-5 border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(24,24,41,0.04)] hover:shadow-[0_10px_28px_-6px_rgba(24,24,41,0.08)] transition-all flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Notes Units
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {unitsCount}
            </span>
            <span className="text-xs font-semibold text-indigo-600">
              {unitsCount > 0 ? "Available now" : "Coming soon"}
            </span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
          <BookOpen className="h-5 w-5" />
        </div>
      </div>

      {/* Stat 2: Study Modules */}
      <div className="rounded-2xl bg-white p-4 sm:p-5 border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(24,24,41,0.04)] hover:shadow-[0_10px_28px_-6px_rgba(24,24,41,0.08)] transition-all flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Study Modules
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              5
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Curriculum Tracks
            </span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
          <Layers className="h-5 w-5" />
        </div>
      </div>

      {/* Stat 3: Solved PYQs */}
      <div className="rounded-2xl bg-white p-4 sm:p-5 border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(24,24,41,0.04)] hover:shadow-[0_10px_28px_-6px_rgba(24,24,41,0.08)] transition-all flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Solved PYQs
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              7 Years
            </span>
            <span className="text-xs font-semibold text-amber-700">
              2018–2024
            </span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <History className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

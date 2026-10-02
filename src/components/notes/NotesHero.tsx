import { Sparkles } from "lucide-react";
import { StatBox } from "@/components/notes/StatBox";

type NotesHeroProps = {
  code: string;
  name: string;
  semesterName: string;
  category: string | null;
  unitCount: number;
  totalTopics: number;
  totalImportantTopics: number;
};

export function NotesHero({
  code,
  name,
  semesterName,
  category,
  unitCount,
  totalTopics,
  totalImportantTopics,
}: NotesHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-indigo-100 bg-gradient-to-br from-[#f0efff] via-[#f8f7ff] to-[#eef5ff]">
      {/* Decorative glows */}
      <div className="pointer-events-none absolute -right-20 -top-32 h-[360px] w-[360px] rounded-full bg-indigo-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/3 h-[280px] w-[280px] rounded-full bg-violet-300/20 blur-3xl" />

      <div className="relative px-6 py-8 sm:px-8 md:px-10 md:py-10 lg:px-12">
        <div className="flex flex-col justify-between gap-10 xl:flex-row xl:items-end">
          {/* LEFT */}
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-indigo-200/80 bg-white/80 px-3 py-1.5 text-xs font-bold text-indigo-700 shadow-sm">
                {code}
              </span>

              <span className="rounded-full border border-white bg-white/60 px-3 py-1.5 text-xs font-semibold text-slate-600">
                {semesterName}
              </span>

              {category && (
                <span className="rounded-full border border-white bg-white/60 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  {category}
                </span>
              )}
            </div>

            <div className="mt-7 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
              <Sparkles className="h-4 w-4" />
              Complete syllabus notes
            </div>

            <h1 className="mt-4 text-4xl font-black tracking-[-0.035em] text-slate-950 sm:text-5xl lg:text-[58px] lg:leading-[1.05]">
              {name}
            </h1>

            <p className="mt-5 max-w-2xl text-[15px] font-medium leading-7 text-slate-600 sm:text-base">
              Structured chapter-wise notes, important concepts, formulas,
              derivations and exam-focused revision points in one place.
            </p>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <StatBox value={unitCount} label="Units" />
            <StatBox value={totalTopics} label="Topics" />
            <StatBox value={totalImportantTopics} label="Important" />
          </div>
        </div>
      </div>
    </section>
  );
}

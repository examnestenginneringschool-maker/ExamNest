"use client";

import { Calendar } from "lucide-react";
import { useSubjectProgress } from "@/lib/academic/progress-store";

type NoteUnitPreview = {
  id: string;
  unit_number: number;
  title: string;
};

type SubjectHeroProps = {
  subjectId?: string;
  code: string;
  name: string;
  category: string | null;
  subjectType: string;
  description: string | null;
  universityName: string;
  departmentCode: string;
  semesterNumber: number;
  units: NoteUnitPreview[];
};

export function SubjectHero({
  subjectId,
  code,
  name,
  category,
  subjectType,
  description,
  universityName,
  departmentCode,
  semesterNumber,
  units,
}: SubjectHeroProps) {
  const isTheory = subjectType.toLowerCase().includes("theory") || subjectType === "theory";

  // Reactive real-time calculation of student readiness progress for this subject
  const progress = useSubjectProgress(subjectId);

  const completedCount = progress.completedUnits.length;
  const completedPercent =
    units.length > 0 ? Math.min(100, Math.round((completedCount / units.length) * 100)) : 0;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-indigo-50/20 to-violet-50/40 p-6 sm:p-8 lg:p-10 border border-slate-200/80 shadow-[0_12px_36px_-6px_rgba(24,24,41,0.05)] mb-8">
      {/* Ambient Backdrop Accents */}
      <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      <div className="absolute right-1/4 -bottom-20 w-64 h-64 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        {/* Title & Badges Area */}
        <div className="max-w-3xl">
          {/* Tag Cluster */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full bg-indigo-600 text-white font-bold text-xs tracking-wide shadow-xs">
              {code}
            </span>

            <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-900 font-semibold text-xs">
              {isTheory ? "Theory" : "Practical / Lab"}
            </span>

            {category && (
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200/60">
                {category}
              </span>
            )}

            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 font-medium text-xs">
              {universityName} · {departmentCode} Sem {semesterNumber}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-slate-900 tracking-tight leading-tight">
            {name}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 mt-2.5 max-w-2xl leading-relaxed">
            {description ||
              `Comprehensive curriculum hub curated specifically for ${universityName} Semester ${semesterNumber} Engineering curriculum.`}
          </p>

          {/* Core Units: Completely without scrollbars, spacious padding, wrapping naturally */}
          {units.length > 0 && (
            <div className="mt-6 pt-5 pb-1 border-t border-slate-200/60 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                Core Units:
              </span>
              {units.map((unit) => (
                <span
                  key={unit.id}
                  className="px-3 py-1.5 rounded-full bg-white border border-slate-200/80 text-slate-800 text-xs font-semibold shadow-xs transition-all hover:border-indigo-300"
                >
                  {unit.unit_number}. {unit.title}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Compact Exam Countdown & Realistic Readiness Widget */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[280px]">
          {/* Exam Countdown Card */}
          <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-[0_8px_24px_-4px_rgba(24,24,41,0.06)] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center shadow-xs">
                <Calendar className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  University Exam
                </span>
                <span className="text-sm font-bold text-slate-900 leading-tight">
                  In 24 Days
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
              Upcoming
            </span>
          </div>

          {/* Realistic Student Readiness Card */}
          <div className="rounded-2xl bg-slate-900 text-white p-4 shadow-[0_8px_24px_-4px_rgba(24,24,41,0.12)] flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-indigo-300 tracking-wider uppercase">
                Your Readiness
              </span>
              <span className="text-sm font-bold text-white mt-0.5">
                {completedPercent > 0
                  ? `${completedPercent}% Syllabus Read`
                  : units.length > 0
                  ? "Ready to Begin"
                  : "Curriculum Pending"}
              </span>
            </div>
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                />
                <path
                  className="text-indigo-400 transition-all duration-500 ease-out"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray={`${completedPercent}, 100`}
                  strokeLinecap="round"
                  strokeWidth="3.5"
                />
              </svg>
              <span className="absolute text-[11px] font-bold text-indigo-300">
                {completedPercent}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

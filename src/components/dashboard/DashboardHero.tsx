"use client";

import { Sparkles, Layers } from "lucide-react";
import { useOverallProgress } from "@/lib/academic/progress-store";

type SubjectSummary = {
  id: string;
  noteUnitsCount: number;
};

type DashboardHeroProps = {
  firstName: string;
  courseName: string;
  departmentName: string;
  universityName: string;
  semesterNumber: number;
  subjects: SubjectSummary[];
  totalNotesCount: number;
};

export function DashboardHero({
  firstName,
  courseName,
  departmentName,
  universityName,
  semesterNumber,
  subjects,
  totalNotesCount,
}: DashboardHeroProps) {
  // Real dynamic calculation of overall course completion and color levels
  const overall = useOverallProgress(subjects);
  const percentage = overall.percentage;

  // SVG circular ring metrics (r = 19, viewBox = 48 48)
  const circumference = 119.38;
  const strokeDashoffset =
    percentage > 0
      ? Math.max(0, circumference - (circumference * percentage) / 100)
      : circumference;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-50/70 via-indigo-50/40 to-slate-50 p-6 md:p-8 border border-slate-100 shadow-xs mb-8">
      {/* Ambient background glows */}
      <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />
      <div className="absolute left-1/3 -bottom-16 w-48 h-48 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex-1">
          {/* Header pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-slate-200/60 shadow-xs text-[11px] font-semibold text-indigo-600 mb-3">
            <Sparkles className="h-3.5 w-3.5 fill-indigo-600" />
            <span>STUDENT ACADEMIC DASHBOARD</span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back,{" "}
            <span className="text-indigo-600 underline decoration-amber-400 decoration-4 underline-offset-4">
              {firstName}
            </span>{" "}
            👋
          </h1>

          <p className="text-xs text-slate-500 mt-2 max-w-xl leading-relaxed">
            Keep learning, keep growing. Here&apos;s an overview of your academic journey and ongoing semester prep.
          </p>

          {/* Academic Profile Badges */}
          <div className="flex flex-wrap items-center gap-2.5 mt-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/70 shadow-xs text-xs font-semibold text-slate-700">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              <span>
                {courseName} · {departmentName} ({universityName})
              </span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200/70 shadow-xs text-xs font-medium text-slate-600">
              <Layers className="h-3.5 w-3.5 text-amber-500" />
              <span>Semester {semesterNumber}</span>
            </div>
          </div>
        </div>

        {/* Stats Counters on Right of Banner */}
        <div className="grid grid-cols-3 gap-2.5 shrink-0">
          {/* Counter 1: Courses */}
          <div className="bg-white/90 backdrop-blur-sm p-3.5 rounded-2xl border border-slate-100 shadow-xs flex flex-col items-center justify-center text-center min-w-[96px]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Courses
            </span>
            <span className="text-xl font-extrabold text-slate-900 mt-0.5">
              {subjects.length}
            </span>
            <span className="text-[10px] text-indigo-600 font-semibold">
              Active
            </span>
          </div>

          {/* Counter 2: Notes */}
          <div className="bg-white/90 backdrop-blur-sm p-3.5 rounded-2xl border border-slate-100 shadow-xs flex flex-col items-center justify-center text-center min-w-[96px]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Notes
            </span>
            <span className="text-xl font-extrabold text-slate-900 mt-0.5">
              {totalNotesCount}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              Verified Units
            </span>
          </div>

          {/* Counter 3: Progress with Dynamic Color-coded Ring */}
          <div className="bg-white/90 backdrop-blur-sm p-3.5 rounded-2xl border border-slate-100 shadow-xs flex flex-col items-center justify-center text-center min-w-[104px]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Progress
            </span>

            <div className="relative flex items-center justify-center my-1">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                {/* Background Ring */}
                <circle
                  cx="24"
                  cy="24"
                  r="19"
                  fill="none"
                  stroke="#EEF2FF"
                  strokeWidth="4"
                />
                {/* Dynamic Colored Progress Stroke */}
                {percentage > 0 && (
                  <circle
                    cx="24"
                    cy="24"
                    r="19"
                    fill="none"
                    stroke={overall.strokeColor}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-700 ease-out"
                  />
                )}
              </svg>

              <div className="absolute flex items-center justify-center">
                <span
                  className={`text-xs font-extrabold tracking-tight ${
                    percentage === 0 ? "text-slate-400" : overall.colorClass
                  }`}
                >
                  {percentage}%
                </span>
              </div>
            </div>

            <span
              className={`text-[10px] font-semibold ${
                percentage === 0 ? "text-slate-400" : overall.colorClass
              }`}
            >
              {overall.completedSubjectsCount}/{overall.totalSubjectsCount} Subjects
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

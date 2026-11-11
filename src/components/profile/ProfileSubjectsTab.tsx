"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, BookOpen, CheckCircle2 } from "lucide-react";
import {
  useOverallProgress,
  useSubjectProgress,
} from "@/lib/academic/progress-store";
import type { CurriculumSubject } from "@/lib/academic/student-context";
import { useStudentProfile } from "./StudentProfileContext";

function SubjectProgressRow({
  subject,
  onNavigate,
}: {
  subject: CurriculumSubject;
  onNavigate: () => void;
}) {
  const progress = useSubjectProgress(subject.id);
  const totalUnits = subject.noteUnitsCount;
  const completedCount = Math.min(totalUnits, progress.completedUnits.length);
  const percent =
    totalUnits > 0
      ? Math.min(100, Math.round((completedCount / totalUnits) * 100))
      : 0;
  const isDone = totalUnits > 0 && completedCount >= totalUnits;

  return (
    <Link
      href={`/app/subjects/${subject.id}`}
      onClick={onNavigate}
      className="group block rounded-2xl border border-slate-100/90 bg-white p-4 shadow-[0_2px_10px_rgba(23,27,42,0.02)] hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[0_8px_20px_-3px_rgba(23,27,42,0.06)] hover:border-slate-200/90 active:scale-[0.99] transition-all duration-200 ease-out"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px] tracking-wide">
              {subject.code}
            </span>
            {isDone && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                <CheckCircle2 className="h-3 w-3" />
                Done
              </span>
            )}
          </div>
          <h4 className="mt-1.5 text-xs font-bold text-slate-800 group-hover:text-slate-900 transition-colors line-clamp-1">
            {subject.name}
          </h4>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`text-xs font-extrabold ${
              isDone
                ? "text-emerald-600"
                : percent > 0
                ? "text-blue-600"
                : "text-slate-400"
            }`}
          >
            {percent}%
          </span>
          <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2.5">
        <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isDone
                ? "bg-emerald-500"
                : percent > 50
                ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                : "bg-amber-500"
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="text-[10px] font-semibold text-slate-400 shrink-0 tabular-nums">
          {totalUnits > 0
            ? `${completedCount}/${totalUnits} units`
            : "Coming soon"}
        </span>
      </div>
    </Link>
  );
}

export function ProfileSubjectsTab() {
  const { subjects, academic, closeProfile } = useStudentProfile();

  const overall = useOverallProgress(
    subjects.map((s) => ({ id: s.id, noteUnitsCount: s.noteUnitsCount }))
  );

  const percentage = overall.percentage;
  const circumference = 138.23; // 2 * pi * 22
  const strokeDashoffset =
    percentage > 0
      ? Math.max(0, circumference - (circumference * percentage) / 100)
      : circumference;

  return (
    <div className="space-y-4 pb-6">
      {/* Overall Progress Summary Card (Mixed-color Minimalist design) */}
      <section className="relative overflow-hidden rounded-3xl bg-white p-5 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(23,27,42,0.04)]">
        {/* Subtle warm ambient wash */}
        <div className="pointer-events-none absolute -right-6 -top-6 w-32 h-32 rounded-full bg-blue-100/30 blur-2xl" />

        <div className="relative z-10 flex items-center gap-4">
          <div className="relative flex items-center justify-center shrink-0">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 56 56">
              <circle
                cx="28"
                cy="28"
                r="22"
                fill="none"
                stroke="#EEF2FF"
                strokeWidth="5"
              />
              {percentage > 0 && (
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  fill="none"
                  stroke={overall.strokeColor}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-700 ease-out"
                />
              )}
            </svg>
            <span
              className={`absolute text-xs font-extrabold ${
                percentage === 0 ? "text-slate-400" : overall.colorClass
              }`}
            >
              {percentage}%
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Semester {academic.semester.semester_number} Progress
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-50 border border-slate-200/60 ${overall.colorClass}`}
              >
                {overall.statusLabel}
              </span>
            </div>

            <p className="mt-1 text-sm font-extrabold text-slate-900">
              {overall.completedUnits} of {overall.totalUnits} units completed
            </p>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">
              {overall.completedSubjectsCount} of {overall.totalSubjectsCount}{" "}
              subjects finished
            </p>
          </div>
        </div>
      </section>

      {/* Enrolled Subjects List */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-extrabold text-slate-800">
            Curriculum Subjects ({subjects.length})
          </h4>
          <span className="text-[10px] font-semibold text-slate-400">
            Click to continue learning
          </span>
        </div>

        {subjects.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center">
            <div className="mx-auto w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2.5">
              <BookOpen className="h-5 w-5" />
            </div>
            <p className="text-xs font-bold text-slate-800">
              No subjects mapped yet
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Check your semester selection or contact support.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {subjects.map((subject) => (
              <SubjectProgressRow
                key={subject.id}
                subject={subject}
                onNavigate={closeProfile}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

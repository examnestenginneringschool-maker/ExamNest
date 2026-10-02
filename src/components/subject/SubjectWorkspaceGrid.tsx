"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Video,
  History,
  HelpCircle,
  TrendingUp,
  Sigma,
  ArrowRight,
  Download,
  Lock,
  Clock,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { useSubjectProgress } from "@/lib/academic/progress-store";

type SubjectWorkspaceGridProps = {
  subjectId: string;
  unitsCount: number;
};

type FilterCategory = "all" | "notes" | "exams";

export function SubjectWorkspaceGrid({
  subjectId,
  unitsCount,
}: SubjectWorkspaceGridProps) {
  const [filter, setFilter] = useState<FilterCategory>("all");

  // Read real-time reactive progress from central Progress Store
  const progress = useSubjectProgress(subjectId);

  const completedUnitsCount = Math.min(unitsCount, progress.completedUnits.length);
  const notesAvailable = unitsCount > 0;
  const notesProgressPercent =
    unitsCount > 0 ? Math.round((completedUnitsCount / unitsCount) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 mb-8">
      {/* Header & Category Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
              SUBJECT WORKSPACE
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            <span className="text-xs text-slate-400 font-medium">
              Curated study tracks
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Study &amp; Prepare
          </h2>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-full self-start sm:self-auto border border-slate-200/60">
          <button
            onClick={() => setFilter("all")}
            type="button"
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filter === "all"
                ? "bg-white text-indigo-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Modules (6)
          </button>
          <button
            onClick={() => setFilter("notes")}
            type="button"
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filter === "notes"
                ? "bg-white text-indigo-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Syllabus &amp; Notes
          </button>
          <button
            onClick={() => setFilter("exams")}
            type="button"
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filter === "exams"
                ? "bg-white text-indigo-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Exams &amp; Tests
          </button>
        </div>
      </div>

      {/* Grid of 6 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* ======================================================== */}
        {/* CARD 1: Chapter Notes (Primary Active Card)              */}
        {/* ======================================================== */}
        {(filter === "all" || filter === "notes") && (
          <div className="group relative rounded-3xl bg-white p-6 border border-slate-200/80 shadow-[0_10px_28px_-4px_rgba(24,24,41,0.06)] hover:shadow-[0_16px_36px_-6px_rgba(24,24,41,0.12)] transition-all flex flex-col justify-between overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
                  <FileText className="h-6 w-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
                  {notesAvailable ? `${unitsCount} Units Available` : "Drafting Notes"}
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Chapter Notes
              </h3>

              <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                Comprehensive unit-by-unit study material with exam-focused derivations, solved numericals, formula cheat sheets, and lecture summaries.
              </p>

              {/* Feature Meta Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                  <Download className="h-3 w-3 text-slate-400" />
                  PDF Downloads
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                  <Sparkles className="h-3 w-3 text-indigo-500" />
                  Solved Numericals
                </span>
              </div>

              {/* Realistic Progress Indicator */}
              <div className="mt-6">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-400 font-medium">Completed Progress</span>
                  <span className="text-slate-900 font-bold">
                    {notesAvailable
                      ? `${completedUnitsCount} / ${unitsCount} Units (${notesProgressPercent}%)`
                      : "Pending Units"}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                    style={{ width: `${notesProgressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 flex items-center justify-between border-t border-slate-100">
              <span className="text-xs text-indigo-600 font-semibold truncate max-w-[150px]">
                {notesAvailable ? "Updated for Exam" : "Under review"}
              </span>

              {notesAvailable ? (
                <Link
                  href={`/app/subjects/${subjectId}/notes`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
                >
                  <span>Open Notes</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <button
                  disabled
                  type="button"
                  className="px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-400 text-xs font-medium cursor-not-allowed"
                >
                  Coming Soon
                </button>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* CARD 2: Video Lectures (Clean Coming Soon - No Fake Bar) */}
        {/* ======================================================== */}
        {(filter === "all" || filter === "notes") && (
          <div className="group relative rounded-3xl bg-white p-6 border border-slate-200/80 shadow-[0_10px_28px_-4px_rgba(24,24,41,0.06)] hover:shadow-[0_16px_36px_-6px_rgba(24,24,41,0.12)] transition-all flex flex-col justify-between overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center shadow-xs">
                  <Video className="h-6 w-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1">
                  <Clock className="h-3 w-3 text-amber-600" />
                  Coming Soon
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
                Video Lectures
              </h3>

              <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                Comprehensive lecture series, professor walkthroughs, and problem-solving video sessions mapped directly to university modules.
              </p>

              <div className="flex flex-wrap gap-2 mt-4">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                  Conceptual
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                  Topic Wise
                </span>
              </div>

              {/* Clean Status Box instead of fake bar */}
              <div className="mt-6 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                  Course Media Track
                </span>
                <span className="text-xs font-semibold text-slate-700 mt-0.5 block">
                  36 Lectures in syllabus catalog
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 flex items-center justify-between border-t border-slate-100">
              <span className="text-xs text-slate-400 font-medium">
                Video player integration
              </span>
              <button
                disabled
                type="button"
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed"
              >
                <Lock className="h-3 w-3 text-slate-400" />
                <span>Coming Soon</span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* CARD 3: Previous Year Questions (No Fake Progress Bar)   */}
        {/* ======================================================== */}
        {(filter === "all" || filter === "exams") && (
          <div className="group relative rounded-3xl bg-white p-6 border border-slate-200/80 shadow-[0_10px_28px_-4px_rgba(24,24,41,0.06)] hover:shadow-[0_16px_36px_-6px_rgba(24,24,41,0.12)] transition-all flex flex-col justify-between overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs">
                  <History className="h-6 w-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1">
                  <Clock className="h-3 w-3 text-amber-600" />
                  Coming Soon
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                Previous Year Questions
              </h3>

              <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                Practice university question papers organized topic-wise and year-wise with step-by-step marking schemes and professor solutions.
              </p>

              <div className="flex flex-wrap gap-2 mt-4">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                  <CheckCircle2 className="h-3 w-3 text-amber-600" />
                  Verified Keys
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                  Hot Topics Marking
                </span>
              </div>

              {/* Clean Status Box instead of fake bar */}
              <div className="mt-6 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                  Archival Scope
                </span>
                <span className="text-xs font-semibold text-slate-700 mt-0.5 block">
                  7-Year Question Archive (2018–2024)
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 flex items-center justify-between border-t border-slate-100">
              <span className="text-xs text-slate-400 font-medium">
                320+ questions cataloged
              </span>
              <button
                disabled
                type="button"
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed"
              >
                <Lock className="h-3 w-3 text-slate-400" />
                <span>Coming Soon</span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* CARD 4: Mock Tests & Quizzes (Coming Soon - No Fake Bar) */}
        {/* ======================================================== */}
        {(filter === "all" || filter === "exams") && (
          <div className="group relative rounded-3xl bg-white p-6 border border-slate-200/80 shadow-[0_10px_28px_-4px_rgba(24,24,41,0.06)] hover:shadow-[0_16px_36px_-6px_rgba(24,24,41,0.12)] transition-all flex flex-col justify-between overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shadow-xs">
                  <HelpCircle className="h-6 w-6 text-slate-600" />
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1">
                  <Clock className="h-3 w-3 text-amber-600" />
                  Coming Soon
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Mock Tests &amp; Quizzes
              </h3>

              <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                Chapter-wise timed assessments, short rapid quizzes, and full 70-marks semester simulation mocks with instant automated evaluation.
              </p>

              <div className="flex flex-wrap gap-2 mt-4">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                  Real Exam Timer
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                  AI Diagnosis
                </span>
              </div>

              {/* Clean Status Box instead of fake bar */}
              <div className="mt-6 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                  Test Simulation Engine
                </span>
                <span className="text-xs font-semibold text-slate-700 mt-0.5 block">
                  Interactive quizzes in development
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 flex items-center justify-between border-t border-slate-100">
              <span className="text-xs text-slate-400 font-medium">
                Simulation engine
              </span>
              <button
                disabled
                type="button"
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed"
              >
                <Lock className="h-3 w-3 text-slate-400" />
                <span>Coming Soon</span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* CARD 5: Performance Analytics (Coming Soon - No Fake Bar) */}
        {/* ======================================================== */}
        {(filter === "all" || filter === "exams") && (
          <div className="group relative rounded-3xl bg-white p-6 border border-slate-200/80 shadow-[0_10px_28px_-4px_rgba(24,24,41,0.06)] hover:shadow-[0_16px_36px_-6px_rgba(24,24,41,0.12)] transition-all flex flex-col justify-between overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1">
                  <Clock className="h-3 w-3 text-amber-600" />
                  Coming Soon
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Performance Analytics
              </h3>

              <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                Granular insights into your strengths and weaknesses by syllabus module, retention heatmaps, and personalized revision schedules.
              </p>

              {/* Informative Status Box instead of fake telemetry */}
              <div className="mt-6 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                  Telemetry &amp; Retention
                </span>
                <span className="text-xs font-semibold text-slate-700 mt-0.5 block">
                  Unlocks after attempting chapter practice
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 flex items-center justify-between border-t border-slate-100">
              <span className="text-xs text-slate-400 font-medium">
                Live telemetry
              </span>
              <button
                disabled
                type="button"
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed"
              >
                <Lock className="h-3 w-3 text-slate-400" />
                <span>Coming Soon</span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* CARD 6: Master Formula Sheet (Coming Soon)               */}
        {/* ======================================================== */}
        {(filter === "all" || filter === "notes") && (
          <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 shadow-[0_12px_32px_-4px_rgba(24,24,41,0.18)] flex flex-col justify-between overflow-hidden">
            <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 pointer-events-none">
              <Sigma className="w-48 h-48" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 text-amber-400 flex items-center justify-center backdrop-blur-md">
                  <Sigma className="h-6 w-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Coming Soon
                </span>
              </div>

              <h3 className="text-xl font-bold text-white">
                Master Formula Sheet
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                High-yield cheat sheet containing all governing equations, fundamental theorems, and physical constants formatted for rapid exam revision.
              </p>

              {/* Code/Formula Snippets Preview */}
              <div className="mt-4 space-y-1.5 bg-white/5 p-3 rounded-xl font-mono text-[11px] text-slate-300 border border-white/10">
                <div className="flex justify-between">
                  <span>∇ · B = 0</span>
                  <span className="text-amber-400">Magnetic Gauss</span>
                </div>
                <div className="flex justify-between">
                  <span>-ħ²/2m · ∇²ψ + Vψ = Eψ</span>
                  <span className="text-amber-400">Schrodinger Eq</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 flex items-center justify-between border-t border-white/10">
              <span className="text-xs text-slate-400 font-medium">
                Quick printable PDF
              </span>
              <button
                disabled
                type="button"
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-white/10 text-slate-400 text-xs font-semibold cursor-not-allowed"
              >
                <Lock className="h-3 w-3 text-slate-400" />
                <span>Coming Soon</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

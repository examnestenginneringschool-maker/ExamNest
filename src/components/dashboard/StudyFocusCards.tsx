"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Bookmark,
  ChevronDown,
} from "lucide-react";

export function StudyFocusCards() {
  const [filter, setFilter] = useState<"today" | "this-week">("today");

  return (
    <div className="flex flex-col gap-4">
      {/* Header and Filter */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Study Focus &amp; Quick Revision
        </h2>

        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span>Filter:</span>
          <button
            onClick={() => setFilter(filter === "today" ? "this-week" : "today")}
            type="button"
            className="font-semibold text-slate-700 inline-flex items-center gap-0.5 hover:text-indigo-600 transition-colors"
          >
            <span className="capitalize">{filter === "today" ? "Today" : "This Week"}</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* 2-Column Balanced Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Navy High Contrast Card */}
        <div className="bg-[#1E1E2F] text-white rounded-2xl p-6 shadow-[0_4px_20px_-2px_rgba(18,24,40,0.05)] flex flex-col justify-between min-h-[200px] border border-slate-800 transition-transform hover:-translate-y-0.5">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                Differential Equation
              </span>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30 flex items-center gap-1">
                <span>High Priority</span>
                <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>

            <h3 className="text-base font-bold text-white mt-3 tracking-tight">
              Simple Harmonic Motion
            </h3>

            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Mastering 2nd order linear ordinary differential equations of damped &amp; forced harmonic oscillators.
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400">Subject Chapter</span>
              <span className="font-semibold text-slate-200">
                Physics-I · Unit 2
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-300">
              <Calendar className="h-3.5 w-3.5" />
              <span>Exam: 29.10.2026</span>
            </div>
          </div>
        </div>

        {/* Card 2: Warm Amber Accent Card */}
        <div className="bg-[#F6C844] text-slate-950 rounded-2xl p-6 shadow-[0_4px_20px_-2px_rgba(18,24,40,0.05)] flex flex-col justify-between min-h-[200px] border border-amber-300 transition-transform hover:-translate-y-0.5">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-800">
                Formula Cheat Sheet
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-950/10 text-slate-900 text-[10px] font-bold border border-slate-950/15 flex items-center gap-1">
                <span>Quick Review</span>
                <ArrowDownRight className="h-3 w-3" />
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-950 mt-3 tracking-tight">
              Circular Motion &amp; Centripetal Force
            </h3>

            <p className="text-xs text-slate-800 mt-1 leading-relaxed">
              Radial acceleration, banked curves equations, and polar coordinate transformations with sample PYQs.
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-900/15 flex items-center justify-between text-xs">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-700">Subject Chapter</span>
              <span className="font-semibold text-slate-900">
                Engineering Mechanics
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-800 font-medium">
              <Bookmark className="h-3.5 w-3.5" />
              <span>12 Pages · PDF</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

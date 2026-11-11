"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Building2,
  CheckCircle2,
  GraduationCap,
  Layers,
} from "lucide-react";
import { AcademicStreamEditor } from "./AcademicStreamEditor";
import { useStudentProfile } from "./StudentProfileContext";

export function ProfileAcademicView() {
  const { academic, setCurrentView } = useStudentProfile();
  const [savedSuccess, setSavedSuccess] = useState(false);

  return (
    <div className="space-y-4 pb-6">
      {savedSuccess && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200/80 p-3.5 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>Academic stream updated! Your curriculum has refreshed.</span>
        </div>
      )}

      {/* Current Academic Stream Snapshot */}
      <section className="rounded-3xl bg-white p-5 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(23,27,42,0.04)]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <GraduationCap className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-900">
              Active Enrolled Stream
            </h4>
            <p className="text-[11px] text-slate-400 font-medium">
              Curriculum notes are filtered based on this enrollment
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50/70 border border-slate-100 p-4 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-slate-400 font-medium">
              <Building2 className="h-3.5 w-3.5" />
              University
            </span>
            <span className="font-bold text-slate-800 text-right">
              {academic.university.short_name || academic.university.name}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
            <span className="text-slate-400 font-medium">College</span>
            <span className="font-semibold text-slate-700 text-right truncate max-w-[220px]">
              {academic.college.name}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
            <span className="inline-flex items-center gap-1.5 text-slate-400 font-medium">
              <BookOpen className="h-3.5 w-3.5" />
              Course &amp; Branch
            </span>
            <span className="font-bold text-slate-800 text-right">
              {academic.course.short_name || academic.course.name} ·{" "}
              {academic.department.short_name || academic.department.name}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
            <span className="inline-flex items-center gap-1.5 text-slate-400 font-medium">
              <Layers className="h-3.5 w-3.5" />
              Semester
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-extrabold text-[11px]">
              Semester {academic.semester.semester_number}
            </span>
          </div>
        </div>
      </section>

      {/* Switcher Form Card */}
      <section className="rounded-3xl bg-white p-5 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(23,27,42,0.04)]">
        <h4 className="text-xs font-extrabold text-slate-900 mb-1">
          Switch Semester or Branch
        </h4>
        <p className="text-[11px] text-slate-400 font-medium mb-3">
          Select your new semester or department below to instantly update your
          notes
        </p>

        <AcademicStreamEditor
          academic={academic}
          onCancel={() => setCurrentView("main")}
          onSaved={() => {
            setSavedSuccess(true);
            setTimeout(() => {
              setCurrentView("main");
            }, 800);
          }}
        />
      </section>
    </div>
  );
}

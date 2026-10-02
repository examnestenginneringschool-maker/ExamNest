"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Atom,
  Calculator,
  Zap,
  Code2,
  FlaskConical,
  BookOpen,
  ArrowRight,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { useSubjectProgress } from "@/lib/academic/progress-store";
import type { CurriculumSubject } from "@/lib/academic/student-context";

type SubjectVisual = {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  badgeBg: string;
  badgeText: string;
  barColor: string;
};

function getSubjectTheme(subject: CurriculumSubject): SubjectVisual {
  const code = subject.code.toUpperCase();
  const name = subject.name.toLowerCase();

  // Physics / Bio-tech
  if (code.includes("PH") || name.includes("physics")) {
    return {
      icon: Atom,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
      badgeBg: "bg-emerald-50",
      badgeText: "text-emerald-700",
      barColor: "bg-indigo-600",
    };
  }

  // Mathematics
  if (code.includes("-M") || name.includes("math")) {
    return {
      icon: Calculator,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      badgeBg: "bg-blue-50",
      badgeText: "text-blue-700",
      barColor: "bg-amber-500",
    };
  }

  // Electrical
  if (code.includes("EE") || name.includes("electrical")) {
    return {
      icon: Zap,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      badgeBg: "bg-purple-50",
      badgeText: "text-purple-700",
      barColor: "bg-purple-600",
    };
  }

  // Programming / CS
  if (code.includes("CS") || code.includes("IT") || name.includes("programming") || name.includes("computer")) {
    return {
      icon: Code2,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      badgeBg: "bg-indigo-50",
      badgeText: "text-indigo-700",
      barColor: "bg-indigo-600",
    };
  }

  // Chemistry
  if (code.includes("CH") || name.includes("chem")) {
    return {
      icon: FlaskConical,
      iconBg: "bg-rose-50",
      iconColor: "text-rose-600",
      badgeBg: "bg-rose-50",
      badgeText: "text-rose-700",
      barColor: "bg-rose-600",
    };
  }

  return {
    icon: BookOpen,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-700",
    badgeBg: "bg-slate-100",
    badgeText: "text-slate-700",
    barColor: "bg-indigo-600",
  };
}

// Child component for each individual subject card, with reactive useSubjectProgress
function SubjectStudyCard({ subject }: { subject: CurriculumSubject }) {
  const progress = useSubjectProgress(subject.id);
  const theme = getSubjectTheme(subject);
  const Icon = theme.icon;

  const totalUnits = subject.noteUnitsCount;
  const completedCount = progress.completedUnits.length;
  const isAllDone = totalUnits > 0 && completedCount >= totalUnits;
  const percent =
    totalUnits > 0 ? Math.min(100, Math.round((completedCount / totalUnits) * 100)) : 0;

  // Realistic study hours estimate (approx 4 hours per unit)
  const estimatedHours = Math.max(12, totalUnits * 4 + 2);

  return (
    <Link
      href={`/app/subjects/${subject.id}`}
      className="group bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_4px_20px_-2px_rgba(18,24,40,0.05)] hover:shadow-[0_12px_28px_-4px_rgba(18,24,40,0.08)] hover:-translate-y-0.5 transition-all flex flex-col justify-between gap-3 text-left"
    >
      <div className="flex flex-col gap-2.5">
        {/* Top: Icon + Title */}
        <div className="flex items-start gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl ${theme.iconBg} ${theme.iconColor} flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform`}
          >
            <Icon className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h3 className="font-bold text-xs text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-1">
              {subject.name}
            </h3>
            <p className="text-[10px] text-slate-400 truncate mt-0.5">
              {subject.category || "Core Curriculum"}
            </p>
          </div>
        </div>

        {/* Code & Done Badge */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`inline-block px-2 py-0.5 rounded text-[9px] font-semibold ${
              isAllDone
                ? "bg-emerald-50 text-emerald-700"
                : `${theme.badgeBg} ${theme.badgeText}`
            }`}
          >
            {isAllDone
              ? `${subject.code} · Done 🎉`
              : `${subject.code} · ${subject.subject_type === "theory" ? "Theory" : "Practical"}`}
          </span>
        </div>

        {/* Units & Estimated Hours */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-100">
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3 text-slate-400" />
            <span>
              {totalUnits} {totalUnits === 1 ? "Unit" : "Units"}
            </span>
          </span>

          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-slate-400" />
            <span>{estimatedHours} hrs</span>
          </span>
        </div>
      </div>

      {/* Progress Bar & Percentage */}
      <div>
        <div className="flex justify-between items-center text-[11px] mb-1.5">
          <span className="text-slate-400 font-medium">Completed</span>
          <span
            className={`font-bold ${
              isAllDone
                ? "text-emerald-600"
                : percent > 0
                ? "text-indigo-600"
                : "text-slate-400"
            }`}
          >
            {percent}%
          </span>
        </div>

        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isAllDone ? "bg-emerald-500" : theme.barColor
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </Link>
  );
}

type ContinueStudyingSectionProps = {
  subjects: CurriculumSubject[];
};

export function ContinueStudyingSection({ subjects }: ContinueStudyingSectionProps) {
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  const filteredSubjects = useMemo(() => {
    if (filter === "all") return subjects;

    return subjects.filter((subject) => {
      // In client mode, read progress for filtering
      if (typeof window === "undefined") return true;
      try {
        const raw = localStorage.getItem(`examnest_completed_${subject.id}`);
        const parsed = raw ? JSON.parse(raw) : null;
        const units = Array.isArray(parsed)
          ? parsed.filter((i) => typeof i === "number")
          : parsed?.completedUnits || [];
        const isDone = subject.noteUnitsCount > 0 && units.length >= subject.noteUnitsCount;

        if (filter === "completed") return isDone;
        if (filter === "active") return !isDone;
      } catch {
        return filter === "active";
      }
      return true;
    });
  }, [subjects, filter]);

  return (
    <div className="flex flex-col gap-4 mb-8">
      {/* Header and Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Continue Studying
          </h2>

          {/* Filter Tabs */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-full text-xs font-medium">
            <button
              onClick={() => setFilter("all")}
              type="button"
              className={`px-3 py-1 rounded-full transition-all ${
                filter === "all"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("active")}
              type="button"
              className={`px-3 py-1 rounded-full transition-all ${
                filter === "active"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter("completed")}
              type="button"
              className={`px-3 py-1 rounded-full transition-all ${
                filter === "completed"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        <Link
          href="#all-subjects"
          onClick={(e) => {
            e.preventDefault();
            setFilter("all");
          }}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 group"
        >
          <span>See all</span>
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Course Cards Responsive Grid */}
      {filteredSubjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredSubjects.map((subject) => (
            <SubjectStudyCard key={subject.id} subject={subject} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center bg-white/60">
          <p className="text-xs font-medium text-slate-500">
            No subjects match the &ldquo;{filter}&rdquo; filter.
          </p>
          <button
            onClick={() => setFilter("all")}
            type="button"
            className="mt-2 text-xs font-semibold text-indigo-600 hover:underline"
          >
            View all courses
          </button>
        </div>
      )}
    </div>
  );
}

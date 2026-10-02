import Link from "next/link";
import {
  Atom,
  BookOpen,
  Calculator,
  ChevronRight,
  Code2,
  FlaskConical,
  GraduationCap,
  Languages,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { CurriculumSubject } from "@/lib/academic/student-context";

type SubjectVisual = {
  icon: LucideIcon;
  iconBox: string;
  iconColor: string;
};

export function SubjectCard({
  subject,
  noteUnits,
  semesterName,
}: {
  subject: CurriculumSubject;
  noteUnits: number;
  semesterName: string;
}) {
  const visual = getSubjectVisual(subject);
  const Icon = visual.icon;

  return (
    <article className="group relative overflow-hidden rounded-[24px] border border-slate-200/90 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_18px_45px_rgba(79,70,229,0.12)] flex flex-col justify-between">
      <div>
        {/* TOP */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            {/* ICON */}
            <Link
              href={`/app/subjects/${subject.id}`}
              className={`flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-[18px] ${visual.iconBox} transition hover:scale-105`}
            >
              <Icon strokeWidth={1.8} className={`h-8 w-8 ${visual.iconColor}`} />
            </Link>

            {/* TITLE */}
            <div className="min-w-0">
              <span className="inline-flex rounded-lg bg-indigo-50 px-2.5 py-1 text-[11px] font-extrabold text-indigo-600">
                {subject.code}
              </span>

              <Link href={`/app/subjects/${subject.id}`}>
                <h3 className="mt-2 line-clamp-2 text-[18px] font-extrabold leading-snug tracking-tight text-slate-950 transition hover:text-indigo-600">
                  {subject.name}
                </h3>
              </Link>

              {subject.category && (
                <p className="mt-1 text-sm font-medium text-slate-500">
                  {subject.category}
                </p>
              )}
            </div>
          </div>

          {/* TYPE */}
          <span className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold capitalize text-slate-500">
            {formatSubjectType(subject.subject_type)}
          </span>
        </div>

        {/* DESCRIPTION */}
        {subject.description && (
          <p className="mt-5 line-clamp-2 min-h-[48px] text-sm leading-6 text-slate-500">
            {subject.description}
          </p>
        )}
      </div>

      <div>
        {/* PROGRESS LINE */}
        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              noteUnits > 0
                ? "w-[72%] bg-gradient-to-r from-indigo-500 to-violet-500"
                : "w-[18%] bg-slate-300"
            }`}
          />
        </div>

        {/* INFO */}
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-500">
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4 text-slate-400" />
            {noteUnits > 0
              ? `${noteUnits} note ${noteUnits === 1 ? "unit" : "units"}`
              : "Notes coming soon"}
          </div>

          <div className="flex items-center gap-1.5">
            <GraduationCap className="h-4 w-4 text-slate-400" />
            {semesterName}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <Link
            href={`/app/subjects/${subject.id}`}
            className="inline-flex items-center gap-2 text-sm font-extrabold text-indigo-600 transition hover:text-indigo-800"
          >
            View subject
            <span>→</span>
          </Link>

          <Link
            href={`/app/subjects/${subject.id}`}
            aria-label={`View ${subject.name}`}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-indigo-100 bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function getSubjectVisual(subject: CurriculumSubject): SubjectVisual {
  const code = subject.code.toUpperCase();
  const name = subject.name.toLowerCase();

  // Chemistry
  if (code.includes("CH") || name.includes("chemistry")) {
    return {
      icon: FlaskConical,
      iconBox: "bg-gradient-to-br from-violet-50 to-indigo-100",
      iconColor: "text-indigo-500",
    };
  }

  // Physics
  if (code.includes("PH") || name.includes("physics")) {
    return {
      icon: Atom,
      iconBox: "bg-gradient-to-br from-blue-50 to-indigo-100",
      iconColor: "text-blue-500",
    };
  }

  // Mathematics
  if (code.includes("-M") || name.includes("mathematics")) {
    return {
      icon: Calculator,
      iconBox: "bg-gradient-to-br from-indigo-50 to-violet-100",
      iconColor: "text-violet-600",
    };
  }

  // Programming / CS
  if (
    code.includes("CS") ||
    code.includes("IT") ||
    name.includes("programming") ||
    name.includes("computer")
  ) {
    return {
      icon: Code2,
      iconBox: "bg-gradient-to-br from-violet-50 to-purple-100",
      iconColor: "text-violet-600",
    };
  }

  // Electrical
  if (code.includes("EE") || name.includes("electrical")) {
    return {
      icon: Zap,
      iconBox: "bg-gradient-to-br from-emerald-50 to-teal-100",
      iconColor: "text-emerald-600",
    };
  }

  // English
  if (code.includes("HU") || name.includes("english")) {
    return {
      icon: Languages,
      iconBox: "bg-gradient-to-br from-rose-50 to-pink-100",
      iconColor: "text-rose-500",
    };
  }

  return {
    icon: BookOpen,
    iconBox: "bg-gradient-to-br from-slate-50 to-indigo-100",
    iconColor: "text-indigo-500",
  };
}

export function formatSubjectType(value: string) {
  if (!value) return "Subject";
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

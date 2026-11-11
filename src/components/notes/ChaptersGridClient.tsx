"use client";

import type { CSSProperties } from "react";
import Link, { useLinkStatus } from "next/link";
import {
  Activity,
  Aperture,
  ArrowRight,
  Atom,
  BookOpen,
  Bookmark,
  Box,
  Check,
  Code2,
  Compass,
  Cpu,
  FileText,
  Flame,
  FlaskConical,
  Gauge,
  GraduationCap,
  Hexagon,
  Layers,
  Lightbulb,
  Sigma,
  SunMedium,
  Target,
  Waves,
  Zap,
} from "lucide-react";
import { useSubjectProgress } from "@/lib/academic/progress-store";
import { getChapterAccentPalette } from "@/lib/notes/chapter-colors";
import { FloatingNavMenu } from "./FloatingNavMenu";

export type ChapterGridItem = {
  id: string;
  unit_number: number;
  title: string;
  topicsCount: number;
};

type ChaptersGridClientProps = {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  semesterNumber: number;
  chapters: ChapterGridItem[];
};

type IconKey =
  | "activity"
  | "waves"
  | "gauge"
  | "sun"
  | "aperture"
  | "compass"
  | "zap"
  | "box"
  | "atom"
  | "hexagon"
  | "flame"
  | "cpu"
  | "flask"
  | "sigma"
  | "code"
  | "book"
  | "file"
  | "target"
  | "lightbulb"
  | "grad"
  | "bookmark"
  | "layers";

const FALLBACK_ICON_KEYS: IconKey[] = [
  "book",
  "file",
  "compass",
  "target",
  "lightbulb",
  "grad",
  "bookmark",
  "layers",
];

function resolveChapterIconKey(title: string, index: number): IconKey {
  const t = title.toLowerCase();

  if (t.includes("harmonic")) return "activity";
  if (t.includes("damped") || t.includes("wave") || t.includes("acoustic")) return "waves";
  if (t.includes("forced") || t.includes("vibrat") || t.includes("oscillat")) return "gauge";
  if (t.includes("interference")) return "sun";
  if (t.includes("diffraction")) return "aperture";
  if (t.includes("polariz")) return "compass";
  if (t.includes("laser") || t.includes("photonic")) return "zap";
  if (t.includes("hologra") || t.includes("3d")) return "box";
  if (t.includes("quantum") || t.includes("atom") || t.includes("nucle")) return "atom";
  if (t.includes("crystal") || t.includes("lattice") || t.includes("solid")) return "hexagon";
  if (t.includes("thermo") || t.includes("heat") || t.includes("entropy")) return "flame";
  if (t.includes("electro") || t.includes("magnet") || t.includes("circuit")) return "cpu";
  if (t.includes("chem") || t.includes("molec") || t.includes("react")) return "flask";
  if (t.includes("math") || t.includes("calcul") || t.includes("matrix") || t.includes("equat")) {
    return "sigma";
  }
  if (t.includes("program") || t.includes("code") || t.includes("algo") || t.includes("data")) {
    return "code";
  }

  return FALLBACK_ICON_KEYS[index % FALLBACK_ICON_KEYS.length];
}

function ChapterIcon({
  title,
  index,
}: {
  title: string;
  index: number;
}) {
  const iconKey = resolveChapterIconKey(title, index);
  const props = { className: "h-[18px] w-[18px]", strokeWidth: 1.75 };

  switch (iconKey) {
    case "activity":
      return <Activity {...props} />;
    case "waves":
      return <Waves {...props} />;
    case "gauge":
      return <Gauge {...props} />;
    case "sun":
      return <SunMedium {...props} />;
    case "aperture":
      return <Aperture {...props} />;
    case "compass":
      return <Compass {...props} />;
    case "zap":
      return <Zap {...props} />;
    case "box":
      return <Box {...props} />;
    case "atom":
      return <Atom {...props} />;
    case "hexagon":
      return <Hexagon {...props} />;
    case "flame":
      return <Flame {...props} />;
    case "cpu":
      return <Cpu {...props} />;
    case "flask":
      return <FlaskConical {...props} />;
    case "sigma":
      return <Sigma {...props} />;
    case "code":
      return <Code2 {...props} />;
    case "file":
      return <FileText {...props} />;
    case "target":
      return <Target {...props} />;
    case "lightbulb":
      return <Lightbulb {...props} />;
    case "grad":
      return <GraduationCap {...props} />;
    case "bookmark":
      return <Bookmark {...props} />;
    case "layers":
      return <Layers {...props} />;
    case "book":
    default:
      return <BookOpen {...props} />;
  }
}

function ChapterCardBody({
  chapter,
  chapterIndex,
  subjectId,
  isCompleted,
}: {
  chapter: ChapterGridItem;
  chapterIndex: number;
  subjectId: string;
  isCompleted: boolean;
}) {
  const { pending } = useLinkStatus();
  const paddedNumber = String(chapter.unit_number).padStart(2, "0");
  const palette = getChapterAccentPalette(
    chapterIndex,
    chapter.unit_number,
    subjectId
  );

  const colorVars = {
    "--chapter-cap": palette.capHex,
    "--chapter-bar": palette.barHex,
    "--chapter-hover-bg": palette.hoverBgHex,
    "--chapter-hover-border": palette.hoverBorderHex,
    "--chapter-aura": palette.auraHex,
    "--chapter-glow-rgb": palette.glowRgb,
    "--chapter-click-bg": palette.clickBgHex,
    "--chapter-click-border": palette.clickBorderHex,
  } as CSSProperties;

  return (
    <div style={colorVars} className="relative h-full">
      {/* Diffused Backside Aura Light (matches this chapter's color bar) */}
      <span
        aria-hidden
        style={{
          background:
            "radial-gradient(circle at 82% 50%, var(--chapter-aura), var(--chapter-hover-bg) 58%, transparent 82%)",
        }}
        className={`pointer-events-none absolute -inset-2 z-0 rounded-[26px] blur-xl transform-gpu transition-all duration-300 ease-out motion-reduce:hidden ${
          pending
            ? "opacity-65 scale-100"
            : "opacity-0 scale-95 group-hover:opacity-95 group-hover:scale-[1.03] group-active:opacity-65 group-active:scale-100"
        }`}
      />

      <div
        data-pending={pending ? "true" : undefined}
        className={`chapter-card relative z-10 flex h-full min-h-[168px] flex-row items-stretch overflow-hidden rounded-2xl border transform-gpu transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] select-none motion-reduce:transition-none ${
          pending
            ? "scale-[0.985] motion-reduce:scale-100"
            : "group-hover:-translate-y-1.5 group-hover:scale-[1.02] group-active:scale-[0.985] motion-reduce:group-hover:translate-y-0 motion-reduce:group-hover:scale-100 motion-reduce:group-active:scale-100"
        }`}
      >
        {/* Left Main Content Area */}
        <div className="flex flex-1 min-w-0 flex-col justify-between p-5">
          <div>
            {/* Top Icon + Subtle Completion Status */}
            <div className="flex items-center justify-between gap-2">
              <span className="chapter-card-icon inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100/80 text-slate-700 transition-all duration-200 group-hover:scale-105">
                <ChapterIcon title={chapter.title} index={chapterIndex} />
              </span>

              {isCompleted && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/70 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  Done
                </span>
              )}
            </div>

            {/* Chapter Title */}
            <h2 className="chapter-card-title mt-4 mb-4 line-clamp-2 text-[15.5px] sm:text-[16px] font-bold leading-snug tracking-tight text-slate-900 transition-colors duration-200">
              {chapter.title}
            </h2>
          </div>

          {/* Footer Metadata & Action */}
          <div className="flex items-center justify-between border-t border-slate-200/70 pt-3 text-xs transition-colors duration-200">
            <span className="font-medium text-slate-500 transition-colors">
              {chapter.topicsCount} {chapter.topicsCount === 1 ? "Topic" : "Topics"}
            </span>

            <span className="chapter-card-open inline-flex items-center gap-1 font-semibold text-slate-500 transition-colors duration-200">
              <span>Open</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          </div>
        </div>

        {/* Right-Hand Vertical Two-Tone Color Bar (Dynamic per Chapter) */}
        <div className="relative flex w-11 sm:w-12 shrink-0 flex-col self-stretch">
          {/* Subtle fold shadow along seam between card surface & color strip */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-2 bg-gradient-to-r from-black/10 to-transparent"
          />

          {/* Top Darker Cap with Crisp Chapter Number */}
          <div className="flex h-13 sm:h-14 items-center justify-center bg-[var(--chapter-cap)] transition-opacity duration-200 group-active:opacity-90">
            <span className="text-sm font-extrabold tracking-tight text-white tabular-nums">
              {paddedNumber}
            </span>
          </div>

          {/* Companion Lower Color Strip */}
          <div className="flex flex-1 items-end justify-center border-t border-white/15 bg-[var(--chapter-bar)] pb-3.5 transition-opacity duration-200 group-active:opacity-90">
            {isCompleted && (
              <span
                title="Chapter completed"
                className="flex h-5 w-5 items-center justify-center rounded-full bg-white/25 text-white"
              >
                <Check className="h-3 w-3" strokeWidth={2.75} />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ChaptersGridClient({
  subjectId,
  subjectCode,
  subjectName,
  semesterNumber,
  chapters,
}: ChaptersGridClientProps) {
  const progress = useSubjectProgress(subjectId);

  const completedInSubject = chapters.filter((ch) =>
    progress.completedUnits.includes(ch.unit_number)
  ).length;

  return (
    <div className="relative w-full pb-20">
      <FloatingNavMenu subjectId={subjectId} />

      {/* Minimal Header Strip */}
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-indigo-600">
              {subjectCode}
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs font-medium text-slate-500">
              Semester {semesterNumber}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {subjectName} Chapters
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Select a chapter to explore its topics and study notes.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 shadow-xs">
            <span>
              {chapters.length} {chapters.length === 1 ? "Chapter" : "Chapters"}
            </span>
            {completedInSubject > 0 && (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-emerald-600">
                  {completedInSubject} Completed
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 4-Column Responsive Grid of Flex Chapter Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {chapters.map((chapter, index) => {
          const isCompleted = progress.completedUnits.includes(chapter.unit_number);

          return (
            <Link
              key={chapter.id}
              href={`/app/subjects/${subjectId}/notes/${chapter.unit_number}`}
              className="group block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:ring-offset-[#faf8ff]"
            >
              <ChapterCardBody
                chapter={chapter}
                chapterIndex={index}
                subjectId={subjectId}
                isCompleted={isCompleted}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

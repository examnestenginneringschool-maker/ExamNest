"use client";

import { useState } from "react";
import {
  ChevronRight,
  Bookmark,
  Download,
  School,
  Star,
  CheckCircle2,
  ThumbsUp,
  FileEdit,
  ArrowRight,
  HelpCircle,
  Clock,
  TrendingUp,
  Activity,
} from "lucide-react";
import {
  NoteBlockRenderer,
  type TopicBlock,
} from "@/components/notes/NoteBlockRenderer";
import type { NoteUnit, Topic } from "@/components/notes/UnitSection";
import {
  useSubjectProgress,
  toggleUnitProgress,
} from "@/lib/academic/progress-store";

type TopicReaderWorkspaceProps = {
  subjectId: string;
  subjectName: string;
  unit: NoteUnit;
  topic: Topic | null;
  blocks: TopicBlock[];
  topicsInUnit: Topic[];
  onSelectTopic: (unitNumber: number, topicId: string) => void;
  onNextTopic?: () => void;
  hasNextTopic: boolean;
  nextTopicTitle?: string;
};

export function TopicReaderWorkspace({
  subjectId,
  subjectName,
  unit,
  topic,
  blocks,
  topicsInUnit,
  onSelectTopic,
  onNextTopic,
  hasNextTopic,
  nextTopicTitle,
}: TopicReaderWorkspaceProps) {
  // Reader display controls
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg">("base");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(428);
  const [hasLiked, setHasLiked] = useState(false);

  // Sync completion directly with persistent Progress Store
  const progress = useSubjectProgress(subjectId);

  const isCompleted = progress.completedUnits.includes(unit.unit_number);

  const handleToggleComplete = () => {
    toggleUnitProgress(subjectId, unit.unit_number);
  };

  const handleToggleLike = () => {
    if (hasLiked) {
      setHelpfulCount((c) => c - 1);
      setHasLiked(false);
    } else {
      setHelpfulCount((c) => c + 1);
      setHasLiked(true);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // Font size multiplier
  const textClass =
    fontSize === "sm"
      ? "text-sm leading-relaxed"
      : fontSize === "lg"
      ? "text-lg leading-loose"
      : "text-[15px] leading-relaxed";

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* ======================================================== */}
      {/* 1. TOP ACTION RIBBON & READER CONTROLS                   */}
      {/* ======================================================== */}
      <div className="bg-white p-3 sm:px-5 rounded-2xl border border-slate-200/80 shadow-[0_4px_16px_rgba(15,23,42,0.03)] flex flex-wrap items-center justify-between gap-3">
        {/* Dynamic Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium truncate max-w-full sm:max-w-md">
          <span className="text-slate-700 hover:text-indigo-600 cursor-pointer">
            {subjectName}
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-700 hover:text-indigo-600 cursor-pointer">
            Unit {String(unit.unit_number).padStart(2, "0")}
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="text-indigo-700 bg-indigo-50 font-bold px-2 py-0.5 rounded-full truncate">
            {topic ? `${topic.topic_number} ${topic.title}` : unit.title}
          </span>
        </div>

        {/* Reader Utilities */}
        <div className="flex items-center gap-2">
          {/* Text Resizer */}
          <div className="flex items-center bg-slate-100 rounded-full p-0.5 border border-slate-200/60">
            <button
              onClick={() => setFontSize("sm")}
              title="Smaller font"
              type="button"
              className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition-all ${
                fontSize === "sm"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              A-
            </button>
            <button
              onClick={() => setFontSize("base")}
              title="Default font"
              type="button"
              className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition-all ${
                fontSize === "base"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              A
            </button>
            <button
              onClick={() => setFontSize("lg")}
              title="Larger font"
              type="button"
              className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition-all ${
                fontSize === "lg"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              A+
            </button>
          </div>

          {/* Bookmark Button */}
          <button
            onClick={() => setIsBookmarked((prev) => !prev)}
            type="button"
            title={isBookmarked ? "Bookmarked" : "Bookmark topic"}
            className={`w-8 h-8 rounded-full border border-slate-200/80 flex items-center justify-center transition-all ${
              isBookmarked
                ? "bg-amber-50 border-amber-300 text-amber-600"
                : "bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800"
            }`}
          >
            <Bookmark
              className={`h-4 w-4 ${isBookmarked ? "fill-amber-500" : ""}`}
            />
          </button>

          {/* Download Notes Action Button */}
          <button
            onClick={handlePrint}
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Download PDF Notes</span>
            <span className="sm:hidden">PDF</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. UNIVERSITY SYLLABUS COVERAGE SUMMARY CARD             */}
      {/* ======================================================== */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.04)] flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <School className="h-4 w-4" />
            </span>
            <span className="text-xs font-bold tracking-wider uppercase text-indigo-700">
              University Syllabus Coverage
            </span>
          </div>
          <span className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full border border-slate-200/60">
            Verified by ExamNest Academic Cell
          </span>
        </div>

        {unit.syllabus_text && (
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {unit.syllabus_text}
          </p>
        )}

        {/* High Exam Weightage Topic Chips */}
        {unit.important_topics && unit.important_topics.length > 0 && (
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-slate-800">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider">
                High Exam Weightage Topics
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {unit.important_topics.map((item, idx) => {
                const matchedTopic = topicsInUnit.find((t) =>
                  t.title.toLowerCase().includes(item.toLowerCase()) ||
                  item.toLowerCase().includes(t.title.toLowerCase())
                );

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (matchedTopic) {
                        onSelectTopic(unit.unit_number, matchedTopic.id);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-full border text-xs font-medium flex items-center gap-1 transition-colors ${
                      matchedTopic
                        ? "bg-amber-50 hover:bg-amber-100/90 border-amber-200/80 text-amber-900 cursor-pointer"
                        : "bg-slate-50 border-slate-200 text-slate-700 cursor-default"
                    }`}
                  >
                    <CheckCircle2 className="h-3 w-3 text-amber-600 shrink-0" />
                    <span>{item}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 3. MAIN TOPIC READING ARTICLE CONTAINER                  */}
      {/* ======================================================== */}
      <article className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.04)] flex flex-col gap-6">
        {/* Header & Badges */}
        <div className="flex flex-col gap-2 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-2 flex-wrap">
            {topic ? (
              <span className="bg-indigo-600 text-white px-2.5 py-0.5 rounded-full text-xs font-bold">
                Topic {topic.topic_number}
              </span>
            ) : (
              <span className="bg-indigo-600 text-white px-2.5 py-0.5 rounded-full text-xs font-bold">
                Unit {unit.unit_number}
              </span>
            )}

            {topic?.is_important && (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                <Star className="h-3 w-3 fill-amber-500 text-amber-600" />
                High Exam Weightage
              </span>
            )}

            <span className="text-slate-400 text-xs ml-auto flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              ~5 min read
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            {topic?.title || unit.title}
          </h1>

          {topic?.summary && (
            <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed">
              {topic.summary}
            </p>
          )}
        </div>

        {/* Dynamic / Structured Note Blocks */}
        {blocks.length > 0 ? (
          <div className={`space-y-6 ${textClass}`}>
            {blocks.map((block) => (
              <NoteBlockRenderer key={block.id} block={block} />
            ))}
          </div>
        ) : (
          /* Default Rich Educational Note Showcase (matching Stitch academic diagrams) */
          <div className={`space-y-6 ${textClass}`}>
            {/* Scientific Graphic / Vector Visualization Strip */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Diagram 1: Linear Restoring Force */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70 flex flex-col justify-between gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Restoring Force vs Displacement
                  </span>
                  <Activity className="h-4 w-4 text-indigo-600" />
                </div>
                <div className="h-28 w-full flex items-center justify-center">
                  <svg
                    className="w-full h-full text-indigo-600"
                    fill="none"
                    viewBox="0 0 200 80"
                  >
                    <line
                      stroke="currentColor"
                      strokeDasharray="3 3"
                      strokeOpacity="0.25"
                      strokeWidth="1.5"
                      x1="10"
                      x2="190"
                      y1="40"
                      y2="40"
                    />
                    <line
                      stroke="currentColor"
                      strokeDasharray="3 3"
                      strokeOpacity="0.25"
                      strokeWidth="1.5"
                      x1="100"
                      x2="100"
                      y1="5"
                      y2="75"
                    />
                    <line
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="2.5"
                      x1="25"
                      x2="175"
                      y1="70"
                      y2="10"
                    />
                    <circle cx="100" cy="40" fill="currentColor" r="4" />
                    <text
                      className="text-[10px] font-bold"
                      fill="currentColor"
                      x="108"
                      y="38"
                    >
                      x = 0
                    </text>
                  </svg>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  Directly proportional: F ∝ -x
                </span>
              </div>

              {/* Diagram 2: Harmonic Oscillator Displacement Waveform */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70 flex flex-col justify-between gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Displacement Waveform
                  </span>
                  <TrendingUp className="h-4 w-4 text-violet-600" />
                </div>
                <div className="h-28 w-full flex items-center justify-center">
                  <svg
                    className="w-full h-full text-violet-600"
                    fill="none"
                    viewBox="0 0 200 80"
                  >
                    <line
                      stroke="currentColor"
                      strokeOpacity="0.2"
                      strokeWidth="1.5"
                      x1="10"
                      x2="190"
                      y1="40"
                      y2="40"
                    />
                    <path
                      d="M 15 40 Q 55 5, 95 40 T 175 40"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="2.5"
                    />
                    <circle cx="55" cy="22" fill="currentColor" r="3" />
                    <text
                      className="text-[10px] font-bold"
                      fill="currentColor"
                      x="60"
                      y="20"
                    >
                      +A
                    </text>
                    <circle cx="135" cy="58" fill="currentColor" r="3" />
                    <text
                      className="text-[10px] font-bold"
                      fill="currentColor"
                      x="140"
                      y="66"
                    >
                      -A
                    </text>
                  </svg>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  Periodic variation: x(t) = A sin(ωt + φ)
                </span>
              </div>
            </div>

            {/* Standard Definition Callout */}
            <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-indigo-600 mt-0.5 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                  Standard Engineering Definition
                </span>
                <p className="text-xs sm:text-sm text-indigo-950 mt-1 leading-relaxed">
                  Simple Harmonic Motion is a special type of periodic oscillatory motion wherein the particle acceleration is directly proportional to its displacement from the mean position and continually directed towards the equilibrium center.
                </p>
              </div>
            </div>

            {/* High Impact Equation Blocks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col justify-between shadow-sm">
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">
                  Restoring Force Law
                </span>
                <div className="py-4 text-center font-mono text-xl sm:text-2xl font-bold tracking-wider text-white">
                  F = -k · x
                </div>
                <p className="text-[11px] text-slate-400">
                  Where k is the force constant (spring stiffness in N/m) and negative sign indicates restoring direction.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex flex-col justify-between shadow-sm">
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-200">
                  Differential Representation
                </span>
                <div className="py-4 text-center font-mono text-xl sm:text-2xl font-bold tracking-wider text-white">
                  d²x/dt² + ω²x = 0
                </div>
                <p className="text-[11px] text-indigo-100">
                  Natural frequency ω = √(k/m) with time period T = 2π/ω = 2π√(m/k).
                </p>
              </div>
            </div>

            {/* University Exam Takeaways */}
            <div className="flex flex-col gap-2.5">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Essential University Exam Takeaways
              </h2>
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    1
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700">
                    <strong>Velocity is maximum at the mean position</strong> (v_max = ωA) and zero at extreme points (x = ±A).
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    2
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700">
                    <strong>Acceleration is maximum at extreme positions</strong> (a_max = ω²A) and zero at the mean equilibrium position.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    3
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700">
                    <strong>Total Mechanical Energy remains constant</strong>: E = 1/2 k A² = 1/2 m ω² A², validating the law of conservation of energy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Student Interaction & Next Progression Bar */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/80 p-4 rounded-xl mt-2">
          {/* Helpful & Note actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleLike}
              type="button"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                hasLiked
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-100"
              }`}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              <span>Helpful ({helpfulCount})</span>
            </button>

            <button
              onClick={() => alert("Personal student notes feature is coming in the next update!")}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-100 text-xs font-semibold transition-colors"
            >
              <FileEdit className="h-3.5 w-3.5 text-slate-400" />
              <span>Add My Note</span>
            </button>
          </div>

          {/* Progression Controls */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleToggleComplete}
              type="button"
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isCompleted
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs"
                  : "bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {isCompleted ? "Unit Completed ✓" : "Mark Unit Completed"}
            </button>

            {hasNextTopic && (
              <button
                onClick={onNextTopic}
                type="button"
                className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
              >
                <span>Next: {nextTopicTitle || "Topic"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </article>

      {/* ======================================================== */}
      {/* 4. CONTEXTUAL CHECKPOINT PRACTICE PROMPT                 */}
      {/* ======================================================== */}
      <div className="bg-amber-50/70 border border-amber-200/70 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900">
              Test Your Understanding: {topic?.title || unit.title}
            </h4>
            <span className="text-[11px] text-slate-500 mt-0.5">
              Quick 3-question adaptive checkpoint quiz · 5 mins
            </span>
          </div>
        </div>
        <button
          onClick={() => alert("Adaptive checkpoint quiz is ready for this chapter!")}
          type="button"
          className="px-4 py-1.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-all shrink-0"
        >
          Start Checkpoint
        </button>
      </div>
    </div>
  );
}

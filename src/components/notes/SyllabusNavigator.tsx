"use client";

import { useState, useMemo } from "react";
import {
  BookOpen,
  Search,
  ChevronDown,
  ChevronRight,
  Star,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import { useSubjectProgress } from "@/lib/academic/progress-store";

export type NavigatorTopic = {
  id: string;
  topic_number: string;
  title: string;
  is_important?: boolean;
};

export type NavigatorUnit = {
  id: string;
  unit_number: number;
  title: string;
  topics: NavigatorTopic[];
};

type SyllabusNavigatorProps = {
  subjectId?: string;
  subjectName: string;
  semesterNumber: number;
  units: NavigatorUnit[];
  activeUnitNumber: number | null;
  activeTopicId: string | null;
  onSelectTopic: (unitNumber: number, topicId: string) => void;
};

/**
 * Normalizes text to pure lowercase alphanumeric characters, stripping all
 * hyphens, punctuation, and spaces (e.g. "X-Ray Spectrum" -> "xrayspectrum").
 */
function toAlphaNumeric(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/gi, "");
}

/**
 * Splits text into clean word tokens without punctuation.
 */
function toSearchTokens(str: string): string[] {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Checks if target matches query with full special-character and space tolerance.
 */
function isSearchMatch(
  targetText: string,
  query: string,
  targetNumber?: string
): boolean {
  const trimmed = query.trim();
  if (!trimmed) return true;

  const rawTarget = targetText.toLowerCase();
  const rawQuery = trimmed.toLowerCase();

  // 1. Direct standard substring match
  if (rawTarget.includes(rawQuery)) return true;

  const alphaTarget = toAlphaNumeric(targetText);
  const alphaQuery = toAlphaNumeric(trimmed);

  // 2. Pure alphanumeric substring match (e.g. "xray" -> "xrayspectrum")
  if (alphaQuery && alphaTarget.includes(alphaQuery)) return true;

  // 3. Topic or unit number match (e.g. "10.13", "1013", "10-13")
  if (targetNumber) {
    const rawNum = targetNumber.toLowerCase();
    const alphaNum = toAlphaNumeric(targetNumber);
    if (rawNum.includes(rawQuery) || (alphaQuery && alphaNum.includes(alphaQuery))) {
      return true;
    }
    const combinedAlpha = alphaNum + alphaTarget;
    if (alphaQuery && combinedAlpha.includes(alphaQuery)) return true;
  }

  // 4. Token-by-token multi-word matching
  const queryTokens = toSearchTokens(trimmed);
  if (queryTokens.length > 1) {
    const combinedTarget = (targetNumber ? targetNumber + " " : "") + targetText;
    const combinedAlpha = (targetNumber ? toAlphaNumeric(targetNumber) : "") + alphaTarget;

    const allTokensMatch = queryTokens.every((token) => {
      const alphaToken = toAlphaNumeric(token);
      return (
        combinedTarget.toLowerCase().includes(token) ||
        (alphaToken && combinedAlpha.includes(alphaToken))
      );
    });
    if (allTokensMatch) return true;
  }

  return false;
}

export function SyllabusNavigator({
  subjectId,
  subjectName,
  semesterNumber,
  units,
  activeUnitNumber,
  activeTopicId,
  onSelectTopic,
}: SyllabusNavigatorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedUnits, setExpandedUnits] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {};
    if (units.length > 0) {
      initial[units[0].unit_number] = true;
    }
    return initial;
  });

  // Track real completed units from central store
  const progress = useSubjectProgress(subjectId);

  const totalTopics = useMemo(
    () => units.reduce((acc, u) => acc + u.topics.length, 0),
    [units]
  );

  const toggleUnit = (unitNumber: number) => {
    setExpandedUnits((prev) => ({
      ...prev,
      [unitNumber]: !prev[unitNumber],
    }));
  };

  // Robust alphanumeric & special-character tolerant filter
  const filteredUnits = useMemo(() => {
    if (!searchQuery.trim()) return units;

    return units
      .map((unit) => {
        const matchesUnit = isSearchMatch(
          unit.title,
          searchQuery,
          String(unit.unit_number)
        );

        const matchingTopics = unit.topics.filter((t) =>
          isSearchMatch(t.title, searchQuery, t.topic_number)
        );

        if (matchesUnit || matchingTopics.length > 0) {
          return {
            ...unit,
            topics: matchesUnit && matchingTopics.length === 0 ? unit.topics : matchingTopics,
          };
        }
        return null;
      })
      .filter(Boolean) as NavigatorUnit[];
  }, [units, searchQuery]);

  return (
    <aside className="flex flex-col gap-3.5 h-full">
      {/* Course Header & Search Card */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.04)] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="h-9 w-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <BookOpen className="h-4 w-4" />
            </span>
            <div className="flex flex-col">
              <h2 className="text-sm font-bold text-slate-900 leading-tight">
                Course Outline
              </h2>
              <span className="text-[11px] font-medium text-slate-400 mt-0.5">
                {subjectName} · {units.length} units · {totalTopics} topics
              </span>
            </div>
          </div>
          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
            Sem {semesterNumber} Exam
          </span>
        </div>

        {/* Live Topic Search Input */}
        <div className="relative flex items-center w-full">
          <Search className="absolute left-3 text-slate-400 h-3.5 w-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search within ${totalTopics} topics...`}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200/80 text-slate-900 placeholder:text-slate-400 rounded-full text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 text-slate-400 hover:text-slate-600 text-xs"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Units & Topics Accordion List */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.04)] flex flex-col gap-2 flex-1">
        {filteredUnits.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No topics matched &quot;{searchQuery}&quot;
          </div>
        ) : (
          filteredUnits.map((unit) => {
            const isExpanded = !!expandedUnits[unit.unit_number] || !!searchQuery.trim();
            const isActiveUnit = activeUnitNumber === unit.unit_number;
            const isUnitDone = progress.completedUnits.includes(unit.unit_number);

            return (
              <div
                key={unit.id}
                className={`flex flex-col rounded-xl transition-all ${
                  isExpanded ? "bg-slate-50/80 border border-slate-200/80" : "hover:bg-slate-50"
                }`}
              >
                {/* Accordion Header */}
                <button
                  type="button"
                  onClick={() => toggleUnit(unit.unit_number)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left cursor-pointer transition-colors ${
                    isExpanded ? "bg-slate-100/70" : ""
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                        isUnitDone
                          ? "bg-emerald-600 text-white shadow-xs"
                          : isActiveUnit
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {isUnitDone ? "✓" : String(unit.unit_number).padStart(2, "0")}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-slate-900 truncate leading-snug">
                        {unit.title}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-medium text-slate-400">
                          {unit.topics.length} topics
                        </span>
                        {isUnitDone && (
                          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                            <CheckCircle2 className="h-3 w-3" />
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {/* Sub-topics list */}
                {isExpanded && (
                  <div className="p-1.5 flex flex-col gap-1">
                    {unit.topics.length === 0 ? (
                      <span className="px-3 py-2 text-[11px] text-slate-400 italic">
                        Topics coming soon
                      </span>
                    ) : (
                      unit.topics.map((topic) => {
                        const isActive = activeTopicId === topic.id;

                        return (
                          <button
                            key={topic.id}
                            type="button"
                            onClick={() => onSelectTopic(unit.unit_number, topic.id)}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-all ${
                              isActive
                                ? "bg-white shadow-xs border border-indigo-200/80 text-indigo-900 font-semibold"
                                : "hover:bg-slate-200/50 text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                                  isActive
                                    ? "bg-indigo-600 text-white"
                                    : "bg-slate-200/80 text-slate-600"
                                }`}
                              >
                                {topic.topic_number}
                              </span>
                              <span className="text-xs truncate">
                                {topic.title}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0 ml-1">
                              {topic.is_important && (
                                <span title="Important topic" className="flex items-center">
                                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                </span>
                              )}
                              {isActive && (
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 ml-1" />
                              )}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Exam Coverage Index Stat Card */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.04)] flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-900">
              Exam Coverage Index
            </span>
            <span className="text-[10px] font-medium text-slate-400">
              {progress.completedUnits.length > 0
                ? `${progress.completedUnits.length} of ${units.length} Units Completed`
                : "Structured University Notes"}
            </span>
          </div>
        </div>
        <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
          {progress.completedUnits.length > 0
            ? `${Math.round((progress.completedUnits.length / units.length) * 100)}% Done`
            : "A+ Track"}
        </span>
      </div>
    </aside>
  );
}

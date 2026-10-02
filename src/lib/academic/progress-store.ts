"use client";

import { useCallback, useSyncExternalStore } from "react";

export type SubjectProgress = {
  readonly completedUnits: readonly number[];
  readonly completedTopics: readonly string[];
};

export const PROGRESS_EVENT = "examnest:progress-update";

export const EMPTY_PROGRESS: SubjectProgress = Object.freeze({
  completedUnits: Object.freeze([]) as readonly number[],
  completedTopics: Object.freeze([]) as readonly string[],
});

// In-memory cache by subjectId: { raw: string | null; progress: SubjectProgress }
// Crucial: useSyncExternalStore requires getSnapshot to return the exact same object
// reference if data has not changed; otherwise React loops infinitely.
const memoryCache = new Map<string, { raw: string | null; progress: SubjectProgress }>();

/**
 * Reads the progress for a specific subject from localStorage with snapshot caching.
 */
export function getSubjectProgress(subjectId?: string): SubjectProgress {
  if (typeof window === "undefined" || !subjectId) {
    return EMPTY_PROGRESS;
  }

  try {
    const raw = localStorage.getItem(`examnest_completed_${subjectId}`);
    const cached = memoryCache.get(subjectId);

    // If the raw localStorage string has not changed, return cached immutable reference
    if (cached && cached.raw === raw) {
      return cached.progress;
    }

    if (!raw) {
      memoryCache.set(subjectId, { raw: null, progress: EMPTY_PROGRESS });
      return EMPTY_PROGRESS;
    }

    const parsed = JSON.parse(raw);
    let units: number[] = [];
    let topics: string[] = [];

    // Support both legacy array format and object format
    if (Array.isArray(parsed)) {
      units = parsed.filter((item): item is number => typeof item === "number");
      topics = parsed.filter((item): item is string => typeof item === "string");
    } else if (parsed && typeof parsed === "object") {
      units = Array.isArray(parsed.completedUnits) ? parsed.completedUnits : [];
      topics = Array.isArray(parsed.completedTopics) ? parsed.completedTopics : [];
    }

    const nextProgress: SubjectProgress = Object.freeze({
      completedUnits: Object.freeze(units),
      completedTopics: Object.freeze(topics),
    });

    memoryCache.set(subjectId, { raw, progress: nextProgress });
    return nextProgress;
  } catch {
    return EMPTY_PROGRESS;
  }
}

/**
 * Toggles a unit's completion status and fires reactive updates
 */
export function toggleUnitProgress(subjectId: string, unitNumber: number): boolean {
  if (typeof window === "undefined" || !subjectId) return false;

  const current = getSubjectProgress(subjectId);
  const isAlreadyCompleted = current.completedUnits.includes(unitNumber);

  const newCompletedUnits = isAlreadyCompleted
    ? current.completedUnits.filter((u) => u !== unitNumber)
    : [...current.completedUnits, unitNumber];

  const updated: SubjectProgress = Object.freeze({
    completedUnits: Object.freeze(newCompletedUnits),
    completedTopics: current.completedTopics,
  });

  const raw = JSON.stringify(updated);
  try {
    localStorage.setItem(`examnest_completed_${subjectId}`, raw);
  } catch {
    // ignore storage errors
  }

  // Pre-update memory cache immediately
  memoryCache.set(subjectId, { raw, progress: updated });

  // Notify current window and other tabs
  window.dispatchEvent(new Event(PROGRESS_EVENT));
  window.dispatchEvent(new Event("storage"));

  return !isAlreadyCompleted;
}

/**
 * Checks if a specific unit is completed
 */
export function isUnitCompleted(subjectId: string, unitNumber: number): boolean {
  const current = getSubjectProgress(subjectId);
  return current.completedUnits.includes(unitNumber);
}

/**
 * External store subscriber for React 18/19 useSyncExternalStore
 */
export function subscribeProgress(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  window.addEventListener("storage", callback);
  window.addEventListener(PROGRESS_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(PROGRESS_EVENT, callback);
  };
}

function getServerSnapshot(): SubjectProgress {
  return EMPTY_PROGRESS;
}

/**
 * React hook that subscribes to subject progress with guaranteed stable references,
 * preventing any React infinite re-render loops.
 */
export function useSubjectProgress(subjectId?: string): SubjectProgress {
  const getSnapshot = useCallback(() => {
    return getSubjectProgress(subjectId);
  }, [subjectId]);

  return useSyncExternalStore(
    subscribeProgress,
    getSnapshot,
    getServerSnapshot
  );
}

export type OverallProgress = {
  readonly totalUnits: number;
  readonly completedUnits: number;
  readonly percentage: number;
  readonly completedSubjectsCount: number;
  readonly totalSubjectsCount: number;
  readonly statusLabel: string;
  readonly colorClass: string;
  readonly strokeColor: string;
};

export const EMPTY_OVERALL_PROGRESS: OverallProgress = Object.freeze({
  totalUnits: 0,
  completedUnits: 0,
  percentage: 0,
  completedSubjectsCount: 0,
  totalSubjectsCount: 0,
  statusLabel: "Blank",
  colorClass: "text-slate-400",
  strokeColor: "transparent",
});

let overallCache = {
  fingerprint: "",
  progress: EMPTY_OVERALL_PROGRESS,
};

export function getOverallProgress(
  subjects: Array<{ id: string; noteUnitsCount: number }>
): OverallProgress {
  if (typeof window === "undefined" || !subjects || subjects.length === 0) {
    return EMPTY_OVERALL_PROGRESS;
  }

  try {
    const fingerprint = subjects
      .map(
        (s) =>
          `${s.id}:${s.noteUnitsCount}:${localStorage.getItem(
            `examnest_completed_${s.id}`
          ) || ""}`
      )
      .join("|");

    if (overallCache.fingerprint === fingerprint) {
      return overallCache.progress;
    }

    let totalUnits = 0;
    let completedUnits = 0;
    let completedSubjectsCount = 0;

    for (const sub of subjects) {
      const unitsCount = sub.noteUnitsCount;
      totalUnits += unitsCount;

      const subProg = getSubjectProgress(sub.id);
      const subCompletedCount = subProg.completedUnits.length;
      completedUnits += Math.min(unitsCount, subCompletedCount);

      if (unitsCount > 0 && subCompletedCount >= unitsCount) {
        completedSubjectsCount++;
      }
    }

    const percentage =
      totalUnits > 0
        ? Math.min(100, Math.round((completedUnits / totalUnits) * 100))
        : 0;

    let statusLabel = "Blank";
    let colorClass = "text-slate-400";
    let strokeColor = "transparent";

    if (percentage === 0) {
      statusLabel = "Blank";
      colorClass = "text-slate-400";
      strokeColor = "transparent";
    } else if (percentage <= 25) {
      statusLabel = "Low";
      colorClass = "text-rose-500";
      strokeColor = "#f43f5e"; // red
    } else if (percentage <= 50) {
      statusLabel = "Avg";
      colorClass = "text-amber-500";
      strokeColor = "#f59e0b"; // orange
    } else if (percentage <= 75) {
      statusLabel = "Better";
      colorClass = "text-yellow-500";
      strokeColor = "#eab308"; // yellow
    } else {
      statusLabel = "Good";
      colorClass = "text-emerald-500";
      strokeColor = "#10b981"; // green
    }

    const newOverall: OverallProgress = Object.freeze({
      totalUnits,
      completedUnits,
      percentage,
      completedSubjectsCount,
      totalSubjectsCount: subjects.length,
      statusLabel,
      colorClass,
      strokeColor,
    });

    overallCache = {
      fingerprint,
      progress: newOverall,
    };

    return newOverall;
  } catch {
    return EMPTY_OVERALL_PROGRESS;
  }
}

export function useOverallProgress(
  subjects: Array<{ id: string; noteUnitsCount: number }>
): OverallProgress {
  const getSnapshot = useCallback(() => {
    return getOverallProgress(subjects);
  }, [subjects]);

  return useSyncExternalStore(
    subscribeProgress,
    getSnapshot,
    () => EMPTY_OVERALL_PROGRESS
  );
}


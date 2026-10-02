"use client";

import { useSyncExternalStore, useState, useMemo } from "react";
import Link from "next/link";
import { PlayCircle, ArrowRight, X } from "lucide-react";

type ResumeLearningBannerProps = {
  subjectId: string;
};

type StoredSession = {
  subjectId: string;
  unitNumber: number;
  unitTitle: string;
  topicTitle?: string;
  timestamp: number;
  completed?: boolean;
};

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export function ResumeLearningBanner({ subjectId }: ResumeLearningBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  const rawSession = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return localStorage.getItem(`examnest_resume_${subjectId}`);
      } catch {
        return null;
      }
    },
    () => null
  );

  const session = useMemo<StoredSession | null>(() => {
    if (!rawSession) return null;
    try {
      const parsed = JSON.parse(rawSession) as StoredSession;
      if (parsed.subjectId === subjectId && !parsed.completed) {
        return parsed;
      }
    } catch {
      // ignore JSON parse error
    }
    return null;
  }, [rawSession, subjectId]);

  // Only display if the student actually has an unfinished session for this specific subject
  if (!session || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  return (
    <div className="relative rounded-3xl bg-white p-5 sm:p-6 border border-slate-200/80 shadow-[0_8px_30px_-6px_rgba(24,24,41,0.05)] mb-8 transition-all">
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        type="button"
        className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        title="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pr-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-indigo-50 text-indigo-600 flex-shrink-0 flex items-center justify-center shadow-xs">
            <PlayCircle className="h-7 w-7" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold uppercase tracking-wider">
                CONTINUE LEARNING
              </span>
              <span className="text-slate-400 text-xs">
                In-progress topic
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              Unit {session.unitNumber}: {session.unitTitle}
            </h3>

            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 line-clamp-1 max-w-2xl">
              {session.topicTitle
                ? `Pick up where you left off: ${session.topicTitle}`
                : "Resume your reading and derivations."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0 self-end lg:self-center">
          <Link
            href={`/app/subjects/${subjectId}/notes`}
            className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
          >
            Syllabus Index
          </Link>

          <Link
            href={`/app/subjects/${subjectId}/notes`}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all active:scale-95"
          >
            <span>Resume</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

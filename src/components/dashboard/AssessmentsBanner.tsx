"use client";

import { useState } from "react";
import {
  FileText,
  SlidersHorizontal,
  Play,
  Clock,
  X,
  CheckCircle2,
  AlertCircle,
  PartyPopper,
} from "lucide-react";

export interface AssessmentItem {
  id: string;
  subjectName?: string;
  testTitle: string;
  badge?: {
    text: string;
    variant?: "mandatory" | "optional" | "assignment" | "quiz";
  };
  topicsSummary: string;
  scheduledDate: string; // e.g. "28 Oct, 10:00 AM"
  duration: string; // e.g. "01 h 30 m"
  syllabusPoints?: string[];
  totalMarks?: number | string;
  passingScore?: string;
  remainingDaysText?: string;
}

interface AssessmentsBannerProps {
  assessments?: AssessmentItem[];
}

export function AssessmentsBanner({
  assessments = [],
}: AssessmentsBannerProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"syllabus" | "start">("syllabus");
  const [activeAssessment, setActiveAssessment] =
    useState<AssessmentItem | null>(null);

  const openSyllabus = (item: AssessmentItem) => {
    setActiveAssessment(item);
    setModalType("syllabus");
    setModalOpen(true);
  };

  const openStart = (item: AssessmentItem) => {
    setActiveAssessment(item);
    setModalType("start");
    setModalOpen(true);
  };

  return (
    <>
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-[0_4px_20px_-2px_rgba(18,24,40,0.05)] flex flex-col gap-4 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Upcoming Tests &amp; Assessments
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Mid-term preparations &amp; assignment deadlines
            </p>
          </div>

          <button
            type="button"
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            title="Assessment Filters"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>

        {/* Fallback when no tests or assessments are assigned */}
        {assessments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center rounded-xl bg-slate-50/70 border border-dashed border-slate-200/80">
            <div className="w-12 h-12 rounded-2xl bg-amber-100/80 text-amber-700 flex items-center justify-center mb-3 shadow-xs">
              <PartyPopper className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">
              Yay!! No assessments and tests.
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              No upcoming tests, quizzes, or assignments scheduled right now. You&apos;re completely up to date!
            </p>
          </div>
        ) : (
          /* Render assigned assessment cards */
          <div className="flex flex-col gap-3">
            {assessments.map((assessment) => (
              <div
                key={assessment.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100/80 hover:bg-slate-100/50 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 shadow-xs">
                    <FileText className="h-5 w-5 text-amber-700" />
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-900">
                        {assessment.testTitle}
                      </span>
                      {assessment.badge && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            assessment.badge.variant === "mandatory" ||
                            !assessment.badge.variant
                              ? "bg-rose-100 text-rose-700"
                              : assessment.badge.variant === "assignment"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {assessment.badge.text}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 mt-0.5">
                      {assessment.topicsSummary} · {assessment.scheduledDate}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end flex-wrap">
                  {assessment.duration && (
                    <div className="text-right hidden md:block mr-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Duration
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        {assessment.duration}
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => openSyllabus(assessment)}
                    type="button"
                    className="px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 shadow-xs transition-colors cursor-pointer"
                  >
                    View Syllabus
                  </button>

                  <button
                    onClick={() => openStart(assessment)}
                    type="button"
                    className="px-4 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs hover:shadow-sm transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  >
                    <span>Start Test</span>
                    <Play className="h-3 w-3 fill-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Modal for Syllabus / Test Start */}
      {modalOpen && activeAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col gap-4">
            <button
              onClick={() => setModalOpen(false)}
              type="button"
              className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {modalType === "syllabus" ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">
                      {activeAssessment.testTitle} Syllabus
                    </h3>
                    <p className="text-xs text-slate-500">
                      {activeAssessment.subjectName || "Curriculum Assessment"}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-2 border-y border-slate-100 py-3">
                  {activeAssessment.syllabusPoints &&
                  activeAssessment.syllabusPoints.length > 0 ? (
                    activeAssessment.syllabusPoints.map((point, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{activeAssessment.topicsSummary}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>
                    Total Marks: {activeAssessment.totalMarks ?? "30"}
                  </span>
                  <span>
                    Passing Score: {activeAssessment.passingScore ?? "40%"}
                  </span>
                </div>

                <button
                  onClick={() => setModalOpen(false)}
                  type="button"
                  className="w-full py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Understood
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">
                      Assessment Portal Ready
                    </h3>
                    <p className="text-xs text-slate-500">
                      Scheduled for {activeAssessment.scheduledDate}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  The test session opens on the scheduled exam date. Please
                  review your lecture notes and syllabus sheets before
                  attempting.
                </p>

                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span>
                    {activeAssessment.remainingDaysText ||
                      "Scheduled upcoming assessment"}
                  </span>
                </div>

                <button
                  onClick={() => setModalOpen(false)}
                  type="button"
                  className="w-full py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  Close &amp; Continue Prep
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

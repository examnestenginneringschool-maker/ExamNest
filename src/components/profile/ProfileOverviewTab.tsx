"use client";

import React, { useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Building2,
  Camera,
  Check,
  CheckCircle2,
  GraduationCap,
  Layers,
  Loader2,
  Mail,
  MessageSquarePlus,
  Pencil,
  Phone,
  Send,
  Trash2,
} from "lucide-react";
import {
  submitStudentFeedback,
  updateStudentAvatar,
  updateStudentDisplayName,
} from "@/app/app/profile-actions";
import { useOverallProgress } from "@/lib/academic/progress-store";
import {
  deleteAvatarFromStorage,
  processAndUploadAvatar,
} from "@/lib/profile/avatar-upload";
import {
  FEEDBACK_CATEGORIES,
  fullNameSchema,
  type FeedbackCategory,
} from "@/lib/validation/profile";
import { AcademicStreamEditor } from "./AcademicStreamEditor";
import { useStudentProfile } from "./StudentProfileContext";

const CATEGORY_PILLS: Array<{ id: FeedbackCategory; label: string }> = [
  { id: "syllabus", label: "Syllabus / Notes" },
  { id: "bug", label: "Bug" },
  { id: "feature", label: "Idea" },
  { id: "other", label: "Other" },
];

export function ProfileOverviewTab() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    student,
    studentName,
    avatarUrl,
    setOptimisticName,
    setOptimisticAvatar,
    academic,
    subjects,
    setActiveTab,
  } = useStudentProfile();

  const overall = useOverallProgress(
    subjects.map((s) => ({ id: s.id, noteUnitsCount: s.noteUnitsCount }))
  );

  // Avatar state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarStatus, setAvatarStatus] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Name editing state
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState(studentName);
  const [nameSaving, setNameSaving] = useState(false);
  const [nameError, setNameError] = useState("");

  // Academic editor state
  const [editingAcademic, setEditingAcademic] = useState(false);
  const [academicSavedBanner, setAcademicSavedBanner] = useState(false);

  // Feedback widget state
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackCategory, setFeedbackCategory] =
    useState<FeedbackCategory>("syllabus");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackSending, setFeedbackSending] = useState(false);
  const [feedbackResult, setFeedbackResult] = useState<{
    type: "success" | "error";
    text: string;
    fallbackMailto?: string;
  } | null>(null);

  const initials =
    studentName
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "S";

  const handleAvatarFileSelected = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setAvatarStatus(null);
    setAvatarBusy(true);

    try {
      const processed = await processAndUploadAvatar(file, student.id);
      const saved = await updateStudentAvatar(processed.avatarUrl);

      if (!saved.success) {
        setAvatarStatus({
          type: "error",
          text: saved.error || "Could not save profile photo.",
        });
        return;
      }

      setOptimisticAvatar(saved.avatarUrl ?? processed.avatarUrl);
      setAvatarStatus({
        type: "success",
        text: "Profile picture updated.",
      });
      router.refresh();
    } catch (err) {
      setAvatarStatus({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "Could not upload profile picture.",
      });
    } finally {
      setAvatarBusy(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setAvatarStatus(null);
    setAvatarBusy(true);
    try {
      await deleteAvatarFromStorage(student.id);
      const res = await updateStudentAvatar(null);
      if (!res.success) {
        setAvatarStatus({
          type: "error",
          text: res.error || "Could not remove photo.",
        });
        return;
      }
      setOptimisticAvatar(null);
      setAvatarStatus({
        type: "success",
        text: "Profile picture removed and deleted from storage.",
      });
      router.refresh();
    } finally {
      setAvatarBusy(false);
    }
  };

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError("");

    const parsed = fullNameSchema.safeParse(draftName);
    if (!parsed.success) {
      setNameError(parsed.error.issues[0]?.message || "Invalid name.");
      return;
    }

    const normalized = parsed.data.replace(/\s+/g, " ").trim();
    if (normalized === studentName) {
      setEditingName(false);
      return;
    }

    try {
      setNameSaving(true);
      const res = await updateStudentDisplayName(normalized);
      if (!res.success || !res.fullName) {
        setNameError(res.error || "Could not update display name.");
        return;
      }
      setOptimisticName(res.fullName);
      setEditingName(false);
      router.refresh();
    } catch (err) {
      setNameError(
        err instanceof Error ? err.message : "Failed to save display name."
      );
    } finally {
      setNameSaving(false);
    }
  };

  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackResult(null);

    if (!FEEDBACK_CATEGORIES.includes(feedbackCategory)) return;
    if (feedbackMessage.trim().length < 10) {
      setFeedbackResult({
        type: "error",
        text: "Please describe the issue or idea in at least 10 characters.",
      });
      return;
    }

    try {
      setFeedbackSending(true);
      const res = await submitStudentFeedback({
        category: feedbackCategory,
        message: feedbackMessage,
        pagePath: pathname || "/app",
      });

      if (!res.success) {
        setFeedbackResult({
          type: "error",
          text: res.error || "Unable to send feedback.",
          fallbackMailto: res.fallbackMailto,
        });
        return;
      }

      setFeedbackMessage("");
      setFeedbackResult({
        type: "success",
        text: "Thank you! Your note has been sent directly to the ExamNest team.",
      });
    } catch {
      setFeedbackResult({
        type: "error",
        text: "Network error while sending feedback.",
      });
    } finally {
      setFeedbackSending(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Identity & Avatar Card */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-[#5B4DFF] to-[#402ae6] text-white flex items-center justify-center text-lg font-extrabold shadow-sm ring-2 ring-indigo-50">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={studentName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
              {avatarBusy && (
                <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarBusy}
              title="Upload profile picture"
              aria-label="Upload profile picture"
              className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:text-[#5B4DFF] hover:border-[#5B4DFF]/40 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={(e) => void handleAvatarFileSelected(e)}
              className="hidden"
            />
          </div>

          <div className="flex-1 min-w-0">
            {editingName ? (
              <form onSubmit={handleSaveName} className="space-y-2">
                <input
                  type="text"
                  value={draftName}
                  onChange={(e) => {
                    setNameError("");
                    setDraftName(e.target.value);
                  }}
                  maxLength={60}
                  autoFocus
                  placeholder="Your full name"
                  className="w-full rounded-xl border border-[#5B4DFF]/50 bg-slate-50 px-2.5 py-1.5 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none"
                />
                {nameError && (
                  <p className="text-[11px] font-medium text-rose-600">
                    {nameError}
                  </p>
                )}
                <div className="flex items-center gap-1.5">
                  <button
                    type="submit"
                    disabled={nameSaving}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#5B4DFF] text-white text-[11px] font-bold hover:bg-[#4B3DE8] cursor-pointer disabled:opacity-50"
                  >
                    {nameSaving ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Check className="h-3 w-3" />
                    )}
                    <span>Save</span>
                  </button>
                  <button
                    type="button"
                    disabled={nameSaving}
                    onClick={() => {
                      setDraftName(studentName);
                      setNameError("");
                      setEditingName(false);
                    }}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-500 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base font-extrabold text-slate-900 truncate">
                    {studentName}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setDraftName(studentName);
                      setNameError("");
                      setEditingName(true);
                    }}
                    title="Edit name"
                    aria-label="Edit full name"
                    className="p-1 rounded-lg text-slate-400 hover:text-[#5B4DFF] hover:bg-indigo-50/70 transition-colors cursor-pointer"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>

                {student.email && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{student.email}</span>
                  </div>
                )}

                {student.phone && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{student.phone}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarBusy}
                    className="text-[11px] font-semibold text-[#5B4DFF] hover:underline cursor-pointer disabled:opacity-50"
                  >
                    {avatarUrl ? "Change photo" : "Upload photo"}
                  </button>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => void handleRemoveAvatar()}
                      disabled={avatarBusy}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {avatarStatus && (
          <div
            className={`mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-[11px] font-semibold ${
              avatarStatus.type === "success"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/70"
                : "bg-rose-50 text-rose-700 border border-rose-200/70"
            }`}
          >
            {avatarStatus.type === "success" ? (
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            )}
            <span>{avatarStatus.text}</span>
          </div>
        )}
      </section>

      {/* 2. Academic Verification Card */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-indigo-50 text-[#5B4DFF] flex items-center justify-center">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900">
                Academic Affiliation
              </h4>
              <p className="text-[11px] text-slate-400 font-medium">
                Controls your active syllabus &amp; subjects
              </p>
            </div>
          </div>

          {!editingAcademic && (
            <button
              type="button"
              onClick={() => {
                setAcademicSavedBanner(false);
                setEditingAcademic(true);
              }}
              className="px-2.5 py-1 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 hover:text-[#5B4DFF] text-[11px] font-bold text-slate-700 transition-colors cursor-pointer"
            >
              Change
            </button>
          )}
        </div>

        {academicSavedBanner && !editingAcademic && (
          <div className="mb-3 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200/70 px-3 py-2 text-[11px] font-semibold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            <span>Academic stream updated! Your subjects have refreshed.</span>
          </div>
        )}

        <div className="space-y-2 text-xs">
          <div className="flex items-start justify-between gap-3 py-1.5 border-b border-slate-100">
            <span className="inline-flex items-center gap-1.5 text-slate-400 font-medium shrink-0">
              <Building2 className="h-3.5 w-3.5" />
              University
            </span>
            <span className="font-bold text-slate-800 text-right">
              {academic.university.short_name || academic.university.name}
            </span>
          </div>

          <div className="flex items-start justify-between gap-3 py-1.5 border-b border-slate-100">
            <span className="text-slate-400 font-medium shrink-0">College</span>
            <span className="font-semibold text-slate-700 text-right">
              {academic.college.name}
            </span>
          </div>

          <div className="flex items-start justify-between gap-3 py-1.5 border-b border-slate-100">
            <span className="inline-flex items-center gap-1.5 text-slate-400 font-medium shrink-0">
              <BookOpen className="h-3.5 w-3.5" />
              Course &amp; Branch
            </span>
            <span className="font-bold text-slate-800 text-right">
              {academic.course.short_name || academic.course.name} ·{" "}
              {academic.department.short_name || academic.department.name}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <span className="inline-flex items-center gap-1.5 text-slate-400 font-medium shrink-0">
              <Layers className="h-3.5 w-3.5" />
              Active Semester
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#5B4DFF] font-extrabold text-[11px]">
              Semester {academic.semester.semester_number}
            </span>
          </div>
        </div>

        {editingAcademic && (
          <AcademicStreamEditor
            academic={academic}
            onCancel={() => setEditingAcademic(false)}
            onSaved={() => {
              setEditingAcademic(false);
              setAcademicSavedBanner(true);
            }}
          />
        )}
      </section>

      {/* 3. Quick Semester Progress Pulse */}
      <section className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-[#faf8ff] to-indigo-50/40 p-4 shadow-2xs">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Semester Progress
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-extrabold text-slate-900">
                {overall.percentage}%
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {overall.completedUnits} of {overall.totalUnits} units covered
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab("subjects")}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-[11px] font-bold text-[#5B4DFF] hover:border-[#5B4DFF]/40 shadow-2xs transition-colors cursor-pointer shrink-0"
          >
            <span>All Subjects</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="h-2 w-full rounded-full bg-slate-200/70 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#5B4DFF] to-indigo-500 transition-all duration-500"
            style={{ width: `${overall.percentage}%` }}
          />
        </div>
      </section>

      {/* 4. Pre-Launch Direct Feedback & Bug Report */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <MessageSquarePlus className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-extrabold text-slate-900">
                Found a syllabus issue or bug?
              </h4>
              <p className="text-[11px] text-slate-400 font-medium truncate">
                Send a note directly to the ExamNest team
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setFeedbackResult(null);
              setFeedbackOpen((prev) => !prev);
            }}
            className="px-2.5 py-1 rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 text-[11px] font-bold text-slate-700 transition-colors cursor-pointer shrink-0"
          >
            {feedbackOpen ? "Close" : "Report"}
          </button>
        </div>

        {feedbackOpen && (
          <form
            onSubmit={handleSendFeedback}
            className="mt-3 pt-3 border-t border-slate-100 space-y-2.5 animate-auth-fade-in"
          >
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_PILLS.map((pill) => {
                const active = feedbackCategory === pill.id;
                return (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => setFeedbackCategory(pill.id)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
                      active
                        ? "bg-[#5B4DFF] text-white border-[#5B4DFF]"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>

            <textarea
              value={feedbackMessage}
              onChange={(e) => {
                setFeedbackResult(null);
                setFeedbackMessage(e.target.value);
              }}
              rows={3}
              maxLength={1500}
              placeholder="Tell us which subject/unit has an error, what broke, or what feature would help you study..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#5B4DFF] focus:bg-white focus:outline-none resize-none"
            />

            {feedbackResult && (
              <div
                className={`rounded-xl px-3 py-2 text-[11px] font-medium ${
                  feedbackResult.type === "success"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/70"
                    : "bg-rose-50 text-rose-700 border border-rose-200/70"
                }`}
              >
                <p>{feedbackResult.text}</p>
                {feedbackResult.fallbackMailto && (
                  <a
                    href={feedbackResult.fallbackMailto}
                    className="mt-1 inline-block font-bold underline"
                  >
                    Open in email client instead
                  </a>
                )}
              </div>
            )}

            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-medium text-slate-400">
                {feedbackMessage.trim().length}/1500 chars
              </span>
              <button
                type="submit"
                disabled={feedbackSending}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-[#5B4DFF] text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {feedbackSending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>Send Feedback</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

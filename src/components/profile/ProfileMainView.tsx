"use client";

import React, { useRef, useState } from "react";
import {
  BarChart3,
  Camera,
  ChevronRight,
  GraduationCap,
  KeyRound,
  Laptop,
  Loader2,
  LogOut,
  MessageSquarePlus,
  Pencil,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { clearSingleDeviceSession } from "@/app/(auth)/actions";
import { updateStudentAvatar } from "@/app/app/profile-actions";
import { useOverallProgress } from "@/lib/academic/progress-store";
import { processAndUploadAvatar } from "@/lib/profile/avatar-upload";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { useStudentProfile } from "./StudentProfileContext";

export function ProfileMainView() {
  const router = useRouter();
  const {
    student,
    studentName,
    avatarUrl,
    setOptimisticAvatar,
    academic,
    subjects,
    setCurrentView,
    closeProfile,
  } = useStudentProfile();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const overall = useOverallProgress(
    subjects.map((s) => ({ id: s.id, noteUnitsCount: s.noteUnitsCount }))
  );

  const initials =
    studentName
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "S";

  const courseLabel = academic.course.short_name || academic.course.name;
  const deptLabel = academic.department.short_name || academic.department.name;
  const uniLabel = academic.university.short_name || academic.university.name;

  const handleAvatarFileSelected = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setAvatarBusy(true);
    try {
      const processed = await processAndUploadAvatar(file, student.id);
      const saved = await updateStudentAvatar(processed.avatarUrl);
      if (saved.success) {
        setOptimisticAvatar(saved.avatarUrl ?? processed.avatarUrl);
        router.refresh();
      }
    } finally {
      setAvatarBusy(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await clearSingleDeviceSession();
      const supabase = createBrowserSupabaseClient();
      await supabase.auth.signOut({ scope: "local" });
      if (typeof document !== "undefined") {
        document.cookie =
          "examnest_device_token=; path=/; max-age=0; SameSite=Lax";
      }
      closeProfile();
      router.push("/sign-in");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {/* ============================================================== */}
      {/* 1. HERO IDENTITY CARD (Matching Reference Image)               */}
      {/* ============================================================== */}
      <section className="relative overflow-hidden rounded-3xl bg-white p-6 border border-slate-100/90 shadow-[0_4px_25px_-4px_rgba(23,27,42,0.05)] text-center flex flex-col items-center">
        {/* Subtle warm ambient glow behind avatar */}
        <div className="pointer-events-none absolute -top-10 right-1/2 translate-x-1/2 w-40 h-40 rounded-full bg-gradient-to-b from-amber-200/25 via-orange-100/15 to-transparent blur-2xl" />

        {/* Circular Avatar */}
        <div className="relative z-10 shrink-0">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-[#5B4DFF] via-indigo-600 to-[#3d2db8] text-white flex items-center justify-center text-xl font-extrabold shadow-sm ring-4 ring-slate-100/80">
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

          {/* Quick Camera Overlay */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarBusy}
            title="Upload photo"
            aria-label="Upload photo"
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-600 hover:text-amber-600 hover:border-amber-400 transition-all duration-200 ease-out cursor-pointer hover:scale-110 active:scale-95 disabled:opacity-50"
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

        {/* Student Name */}
        <h3 className="relative z-10 text-lg font-extrabold text-slate-900 mt-3.5 tracking-tight">
          {studentName}
        </h3>

        {/* Email Address */}
        <p className="relative z-10 text-xs text-slate-400 font-medium mt-0.5 max-w-[280px] truncate">
          {student.email || "Verified Student"}
        </p>

        {/* Academic Affiliation Subtitle */}
        <div className="relative z-10 text-[11px] font-semibold text-slate-500 mt-1.5 flex items-center justify-center gap-1.5 flex-wrap">
          <span className="text-slate-600">
            {courseLabel} · {deptLabel} · Sem {academic.semester.semester_number}
          </span>
          <span className="text-slate-300">·</span>
          <span className="text-amber-600 font-bold">
            📍 {uniLabel}
          </span>
        </div>

        {/* Edit Profile Pill Action Button (Matching Reference Image with Soft Popup Animation) */}
        <button
          type="button"
          onClick={() => setCurrentView("edit-profile")}
          className="relative z-10 mt-4 px-6 py-2 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-sm inline-flex items-center gap-2 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.04] hover:shadow-md active:scale-95 cursor-pointer"
        >
          <Pencil className="h-3.5 w-3.5" />
          <span>Edit Profile</span>
        </button>
      </section>

      {/* ============================================================== */}
      {/* 2. PROFILE MENU ROWS (Uniform Symmetric Spacing & Padding)     */}
      {/* ============================================================== */}
      <div className="space-y-2.5">
        {/* Row 1: Subject Progression */}
        <button
          type="button"
          onClick={() => setCurrentView("subjects")}
          className="w-full min-h-[64px] bg-white rounded-2xl px-4 py-3 border border-slate-100/90 shadow-[0_2px_8px_rgba(23,27,42,0.03)] hover:-translate-y-0.5 hover:scale-[1.012] hover:shadow-[0_8px_20px_-3px_rgba(23,27,42,0.06)] hover:border-slate-200/90 active:scale-[0.985] active:translate-y-0 transition-all duration-200 ease-out flex items-center justify-between text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-110 transition-transform duration-200">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-slate-800 group-hover:text-slate-900 block truncate leading-tight">
                Subject Progression
              </span>
              <span className="text-[10px] text-slate-400 font-medium block truncate leading-tight mt-0.5">
                {overall.completedUnits} of {overall.totalUnits} units completed
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-3">
            <span className="w-[72px] min-w-[72px] h-[24px] rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-100/70 flex items-center justify-center shrink-0 text-center tracking-tight">
              {overall.percentage}%
            </span>
            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-200 shrink-0" />
          </div>
        </button>

        {/* Row 2: Academic Stream */}
        <button
          type="button"
          onClick={() => setCurrentView("academic")}
          className="w-full min-h-[64px] bg-white rounded-2xl px-4 py-3 border border-slate-100/90 shadow-[0_2px_8px_rgba(23,27,42,0.03)] hover:-translate-y-0.5 hover:scale-[1.012] hover:shadow-[0_8px_20px_-3px_rgba(23,27,42,0.06)] hover:border-slate-200/90 active:scale-[0.985] active:translate-y-0 transition-all duration-200 ease-out flex items-center justify-between text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-110 transition-transform duration-200">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-slate-800 group-hover:text-slate-900 block truncate leading-tight">
                Academic Stream
              </span>
              <span className="text-[10px] text-slate-400 font-medium block truncate leading-tight mt-0.5">
                {courseLabel} · Sem {academic.semester.semester_number}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-3">
            <span className="w-[72px] min-w-[72px] h-[24px] rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-100/70 flex items-center justify-center shrink-0 text-center tracking-tight">
              Sem {academic.semester.semester_number}
            </span>
            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-200 shrink-0" />
          </div>
        </button>

        {/* Row 3: Change Password */}
        <button
          type="button"
          onClick={() => setCurrentView("security")}
          className="w-full min-h-[64px] bg-white rounded-2xl px-4 py-3 border border-slate-100/90 shadow-[0_2px_8px_rgba(23,27,42,0.03)] hover:-translate-y-0.5 hover:scale-[1.012] hover:shadow-[0_8px_20px_-3px_rgba(23,27,42,0.06)] hover:border-slate-200/90 active:scale-[0.985] active:translate-y-0 transition-all duration-200 ease-out flex items-center justify-between text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-110 transition-transform duration-200">
              <KeyRound className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-slate-800 group-hover:text-slate-900 block truncate leading-tight">
                Change Password
              </span>
              <span className="text-[10px] text-slate-400 font-medium block truncate leading-tight mt-0.5">
                {student.hasPasswordAuth
                  ? "Update login credentials"
                  : "Managed by Google Account"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-3">
            <span className="w-[72px] min-w-[72px] h-[24px] rounded-full text-[10px] font-extrabold bg-purple-50 text-purple-700 border border-purple-100/70 flex items-center justify-center shrink-0 text-center tracking-tight">
              {student.hasPasswordAuth ? "Security" : "Google"}
            </span>
            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-200 shrink-0" />
          </div>
        </button>

        {/* Row 4: Manage Devices */}
        <button
          type="button"
          onClick={() => setCurrentView("session")}
          className="w-full min-h-[64px] bg-white rounded-2xl px-4 py-3 border border-slate-100/90 shadow-[0_2px_8px_rgba(23,27,42,0.03)] hover:-translate-y-0.5 hover:scale-[1.012] hover:shadow-[0_8px_20px_-3px_rgba(23,27,42,0.06)] hover:border-slate-200/90 active:scale-[0.985] active:translate-y-0 transition-all duration-200 ease-out flex items-center justify-between text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-110 transition-transform duration-200">
              <Laptop className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-slate-800 group-hover:text-slate-900 block truncate leading-tight">
                Manage Devices
              </span>
              <span className="text-[10px] text-slate-400 font-medium block truncate leading-tight mt-0.5">
                Single-device lock active
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-3">
            <span className="w-[72px] min-w-[72px] h-[24px] rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100/70 flex items-center justify-center shrink-0 text-center tracking-tight">
              Active
            </span>
            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-200 shrink-0" />
          </div>
        </button>

        {/* Row 5: Help & Feedback */}
        <button
          type="button"
          onClick={() => setCurrentView("feedback")}
          className="w-full min-h-[64px] bg-white rounded-2xl px-4 py-3 border border-slate-100/90 shadow-[0_2px_8px_rgba(23,27,42,0.03)] hover:-translate-y-0.5 hover:scale-[1.012] hover:shadow-[0_8px_20px_-3px_rgba(23,27,42,0.06)] hover:border-slate-200/90 active:scale-[0.985] active:translate-y-0 transition-all duration-200 ease-out flex items-center justify-between text-left cursor-pointer group"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-110 transition-transform duration-200">
              <MessageSquarePlus className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-slate-800 group-hover:text-slate-900 block truncate leading-tight">
                Help &amp; Feedback
              </span>
              <span className="text-[10px] text-slate-400 font-medium block truncate leading-tight mt-0.5">
                Report a syllabus issue or suggest an idea
              </span>
            </div>
          </div>

          <div className="flex items-center shrink-0 ml-3">
            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-200 shrink-0" />
          </div>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 5. BOTTOM SIGN OUT BUTTON                                      */}
      {/* ============================================================== */}
      <div className="pt-2">
        <button
          type="button"
          disabled={signingOut}
          onClick={() => void handleSignOut()}
          className="w-full py-2.5 px-4 rounded-2xl bg-white border border-rose-100/90 hover:border-rose-200 hover:bg-rose-50/80 text-rose-600 text-xs font-bold transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-sm active:scale-95 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {signingOut ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <LogOut className="h-3.5 w-3.5" />
          )}
          <span>{signingOut ? "Signing out..." : "Sign Out"}</span>
        </button>
      </div>
    </div>
  );
}

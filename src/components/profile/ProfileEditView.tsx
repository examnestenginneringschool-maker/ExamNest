"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Camera,
  Check,
  CheckCircle2,
  Loader2,
  Trash2,
  User,
} from "lucide-react";
import {
  updateStudentAvatar,
  updateStudentDisplayName,
} from "@/app/app/profile-actions";
import {
  deleteAvatarFromStorage,
  processAndUploadAvatar,
} from "@/lib/profile/avatar-upload";
import { fullNameSchema } from "@/lib/validation/profile";
import { useStudentProfile } from "./StudentProfileContext";

export function ProfileEditView() {
  const router = useRouter();
  const {
    student,
    studentName,
    avatarUrl,
    setOptimisticName,
    setOptimisticAvatar,
    setCurrentView,
  } = useStudentProfile();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draftName, setDraftName] = useState(studentName);
  const [nameSaving, setNameSaving] = useState(false);
  const [nameError, setNameError] = useState("");
  const [nameSavedSuccess, setNameSavedSuccess] = useState(false);

  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarStatus, setAvatarStatus] = useState<{
    type: "success" | "error";
    text: string;
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
          text: saved.error || "Could not save profile picture.",
        });
        return;
      }

      setOptimisticAvatar(saved.avatarUrl ?? processed.avatarUrl);
      setAvatarStatus({
        type: "success",
        text: "Profile photo updated successfully.",
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
        text: "Profile picture removed and deleted from cloud storage.",
      });
      router.refresh();
    } finally {
      setAvatarBusy(false);
    }
  };

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError("");
    setNameSavedSuccess(false);

    const parsed = fullNameSchema.safeParse(draftName);
    if (!parsed.success) {
      setNameError(parsed.error.issues[0]?.message || "Invalid name.");
      return;
    }

    const normalized = parsed.data.replace(/\s+/g, " ").trim();
    if (normalized === studentName) {
      setCurrentView("main");
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
      setNameSavedSuccess(true);
      router.refresh();
      setTimeout(() => {
        setCurrentView("main");
      }, 700);
    } catch (err) {
      setNameError(
        err instanceof Error ? err.message : "Failed to save display name."
      );
    } finally {
      setNameSaving(false);
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Photo Customizer Card */}
      <section className="rounded-3xl bg-white p-6 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(23,27,42,0.04)] text-center flex flex-col items-center">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-[#5B4DFF] via-indigo-600 to-[#3d2db8] text-white flex items-center justify-center text-2xl font-extrabold shadow-sm ring-4 ring-slate-100/90">
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
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarBusy}
            aria-label="Upload photo"
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:text-amber-600 hover:border-amber-400 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Camera className="h-4 w-4" />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={(e) => void handleAvatarFileSelected(e)}
            className="hidden"
          />
        </div>

        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarBusy}
            className="px-4 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {avatarUrl ? "Change Photo" : "Upload Photo"}
          </button>

          {avatarUrl && (
            <button
              type="button"
              onClick={() => void handleRemoveAvatar()}
              disabled={avatarBusy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Remove</span>
            </button>
          )}
        </div>

        {avatarStatus && (
          <div
            className={`mt-3 w-full flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-[11px] font-semibold ${
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

      {/* Name & Basic Info Card */}
      <section className="rounded-3xl bg-white p-5 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(23,27,42,0.04)]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-900">
              Personal Information
            </h4>
            <p className="text-[11px] text-slate-400 font-medium">
              Update how your name appears across the workspace
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveName} className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={draftName}
              onChange={(e) => {
                setNameError("");
                setNameSavedSuccess(false);
                setDraftName(e.target.value);
              }}
              maxLength={60}
              placeholder="Your full name"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-none transition-colors"
            />
            {nameError && (
              <p className="mt-1 text-[11px] font-semibold text-rose-600">
                {nameError}
              </p>
            )}
            {nameSavedSuccess && (
              <p className="mt-1 text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                <Check className="h-3.5 w-3.5" />
                <span>Name updated successfully!</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Verified Email
            </label>
            <input
              type="text"
              disabled
              value={student.email || "Not linked"}
              className="w-full rounded-xl border border-slate-200 bg-slate-100/70 px-3 py-2 text-xs font-medium text-slate-500 cursor-not-allowed"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Primary email identifier managed via account verification.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCurrentView("main")}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={nameSaving || draftName.trim() === studentName}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold shadow-xs transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-md active:scale-95 cursor-pointer disabled:opacity-50 disabled:hover:scale-100 disabled:hover:translate-y-0"
            >
              {nameSaving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getPasswordStrengthInfo } from "@/lib/validation/auth";
import { changePasswordInProfileSchema } from "@/lib/validation/profile";
import { useStudentProfile } from "./StudentProfileContext";

export function ProfileSecurityTab() {
  const { student, setCurrentView } = useStudentProfile();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const pwdStrength = getPasswordStrengthInfo(newPassword);
  const passwordsMatch =
    confirmPassword.length > 0 && newPassword === confirmPassword;
  const passwordsMismatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const parsed = changePasswordInProfileSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (!parsed.success) {
      setError(
        parsed.error.issues[0]?.message ||
          "Please check your password entries."
      );
      return;
    }

    try {
      setSubmitting(true);
      const supabase = createBrowserSupabaseClient();

      if (student.email) {
        const { error: verifyError } = await supabase.auth.signInWithPassword({
          email: student.email,
          password: parsed.data.currentPassword,
        });
        if (verifyError) {
          setError("Your current password is incorrect.");
          return;
        }
      } else if (student.phone) {
        const { error: verifyError } = await supabase.auth.signInWithPassword({
          phone: student.phone,
          password: parsed.data.currentPassword,
        });
        if (verifyError) {
          setError("Your current password is incorrect.");
          return;
        }
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: parsed.data.newPassword,
        data: {
          year: new Date().getFullYear(),
        },
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccessMsg("Your password was updated successfully.");
      setTimeout(() => {
        setCurrentView("main");
      }, 900);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update password right now."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendResetEmail = async () => {
    if (!student.email) {
      setError("No verified email is linked to send a recovery link.");
      return;
    }

    setError("");
    setSuccessMsg("");

    try {
      setSendingReset(true);
      const supabase = createBrowserSupabaseClient();

      if (typeof document !== "undefined") {
        document.cookie =
          "examnest_recovery_flow=1; path=/; max-age=3600; SameSite=Lax";
      }

      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(
        student.email,
        {
          redirectTo: `${origin}/reset-password`,
        }
      );

      if (resetErr) {
        setError(resetErr.message);
        return;
      }

      setSuccessMsg(
        `Password reset link sent to ${student.email}. Check your inbox.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not send password reset link."
      );
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {student.hasPasswordAuth ? (
        <section className="rounded-3xl bg-white p-5 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(23,27,42,0.04)]">
          <div className="flex items-center gap-2 mb-3.5">
            <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <KeyRound className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900">
                Change Password
              </h4>
              <p className="text-[11px] text-slate-400 font-medium">
                Update your credentials in place
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-3">
            {error && (
              <div className="flex items-start gap-2 rounded-2xl bg-rose-50 border border-rose-200/80 p-3 text-[11px] font-semibold text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="flex items-start gap-2 rounded-2xl bg-emerald-50 border border-emerald-200/80 p-3 text-[11px] font-semibold text-emerald-700">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Current Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700">
                  Current Password
                </label>
                {student.email && (
                  <button
                    type="button"
                    onClick={() => void handleSendResetEmail()}
                    disabled={sendingReset || submitting}
                    className="text-[11px] font-semibold text-purple-600 hover:underline cursor-pointer disabled:opacity-50"
                  >
                    {sendingReset ? "Sending..." : "Forgot password?"}
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => {
                    setError("");
                    setSuccessMsg("");
                    setCurrentPassword(e.target.value);
                  }}
                  autoComplete="current-password"
                  placeholder="Enter current password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-3 pr-9 py-2 text-xs font-semibold text-slate-900 focus:border-purple-500 focus:bg-white focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((prev) => !prev)}
                  aria-label={
                    showCurrent
                      ? "Hide current password"
                      : "Show current password"
                  }
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showCurrent ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setError("");
                    setSuccessMsg("");
                    setNewPassword(e.target.value);
                  }}
                  autoComplete="new-password"
                  placeholder="Minimum 8 characters"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-3 pr-9 py-2 text-xs font-semibold text-slate-900 focus:border-purple-500 focus:bg-white focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((prev) => !prev)}
                  aria-label={
                    showNew ? "Hide new password" : "Show new password"
                  }
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showNew ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              {pwdStrength && (
                <div className="mt-1.5 space-y-1">
                  <div className="grid grid-cols-4 gap-1">
                    {[1, 2, 3, 4].map((segment) => (
                      <div
                        key={segment}
                        className={`h-1 rounded-full transition-colors ${
                          segment <= pwdStrength.score
                            ? pwdStrength.barColorClass
                            : "bg-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-[10px] font-semibold ${pwdStrength.colorClass}`}>
                    {pwdStrength.text}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setError("");
                    setSuccessMsg("");
                    setConfirmPassword(e.target.value);
                  }}
                  autoComplete="new-password"
                  placeholder="Re-enter new password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-3 pr-9 py-2 text-xs font-semibold text-slate-900 focus:border-purple-500 focus:bg-white focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  aria-label={
                    showConfirm
                      ? "Hide confirmation password"
                      : "Show confirmation password"
                  }
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showConfirm ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              {passwordsMatch && (
                <p className="mt-1 text-[10px] font-semibold text-emerald-600">
                  Passwords match
                </p>
              )}
              {passwordsMismatch && (
                <p className="mt-1 text-[10px] font-semibold text-rose-500">
                  Passwords do not match
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCurrentView("main")}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-md active:scale-95 cursor-pointer disabled:opacity-50 disabled:hover:scale-100 disabled:hover:translate-y-0"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </div>
          </form>
        </section>
      ) : (
        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_4px_20px_-4px_rgba(23,27,42,0.04)]">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900">
                Google OAuth Protection
              </h4>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                You signed in using Google ({student.email}). Passwords and
                session access keys are authenticated through Google.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

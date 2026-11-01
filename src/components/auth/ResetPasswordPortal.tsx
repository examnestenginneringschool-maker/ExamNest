"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LayoutDashboard,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { registerSingleDeviceLogin } from "@/app/(auth)/actions";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { resetPasswordSchema } from "@/lib/validation/auth";

function getPasswordStrengthInfo(password: string) {
  if (!password) {
    return null;
  }

  const hasMinLen = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumberOrSymbol = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(
    password
  );

  const score = [hasMinLen, hasUpper, hasLower, hasNumberOrSymbol].filter(
    Boolean
  ).length;

  if (!hasMinLen) {
    return {
      score,
      text: "Weak · Must be at least 8 characters",
      colorClass: "text-rose-500",
    };
  }

  if (score <= 2) {
    return {
      score,
      text: "Weak · Add uppercase, number, or symbol",
      colorClass: "text-rose-500",
    };
  }

  if (score === 3) {
    return {
      score,
      text: "Good · Almost strong password",
      colorClass: "text-amber-500",
    };
  }

  return {
    score,
    text: "Strong password",
    colorClass: "text-emerald-600",
  };
}

const CONSUMED_TOKENS_STORAGE_KEY = "examnest_consumed_recovery_tokens";
const ACTIVE_RECOVERY_GRANT_KEY = "examnest_recovery_grant";

// Module-level deduplication so React 19 Strict Mode double-mount in dev does not call verifyOtp twice
const inFlightTokenVerifications = new Map<
  string,
  Promise<{ valid: boolean; errorMessage?: string }>
>();

function isTokenMarkedConsumed(tokenKey: string): boolean {
  if (typeof window === "undefined" || !tokenKey) return false;
  try {
    const raw = window.localStorage.getItem(CONSUMED_TOKENS_STORAGE_KEY);
    if (!raw) return false;
    const list = JSON.parse(raw) as string[];
    return Array.isArray(list) && list.includes(tokenKey);
  } catch {
    return false;
  }
}

function consumeRecoveryGrantPermanently(tokenKey?: string | null) {
  if (typeof window === "undefined") return;
  try {
    const activeGrant =
      tokenKey || window.sessionStorage.getItem(ACTIVE_RECOVERY_GRANT_KEY);
    if (activeGrant) {
      const raw = window.localStorage.getItem(CONSUMED_TOKENS_STORAGE_KEY);
      const list: string[] = raw ? (JSON.parse(raw) as string[]) : [];
      if (!list.includes(activeGrant)) {
        const updated = [...list.slice(-49), activeGrant];
        window.localStorage.setItem(
          CONSUMED_TOKENS_STORAGE_KEY,
          JSON.stringify(updated)
        );
      }
    }
    window.sessionStorage.removeItem(ACTIVE_RECOVERY_GRANT_KEY);
  } catch {
    // Ignore storage errors
  }

  if (typeof document !== "undefined") {
    document.cookie =
      "examnest_recovery_flow=; path=/; max-age=0; SameSite=Lax";
    document.cookie =
      "examnest_recovery_verified=; path=/; max-age=0; SameSite=Lax";
  }
}

export function ResetPasswordPortal() {
  const router = useRouter();
  const [step, setStep] = useState<"choice" | "form">("choice");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isNavigatingDashboard, setIsNavigatingDashboard] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [statusBanner, setStatusBanner] = useState("");
  const [isSessionChecking, setIsSessionChecking] = useState(true);
  const [isSessionInvalid, setIsSessionInvalid] = useState(false);
  const [sessionErrorMessage, setSessionErrorMessage] = useState("");
  const activeTokenKeyRef = useRef<string | null>(null);

  const pwdStrength = getPasswordStrengthInfo(newPassword);
  const passwordsMatch =
    confirmPassword.length > 0 && newPassword === confirmPassword;
  const passwordsMismatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword;

  // Verify recovery session via one-time token_hash / code / recovery cookie
  useEffect(() => {
    let mounted = true;
    const supabase = createBrowserSupabaseClient();

    // Clear the redirect-routing cookie now that the user has reached /reset-password
    if (typeof document !== "undefined") {
      document.cookie =
        "examnest_recovery_flow=; path=/; max-age=0; SameSite=Lax";
    }

    const searchParams =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search)
        : null;
    const urlError =
      searchParams?.get("error_description") ||
      searchParams?.get("error") ||
      null;
    const tokenHash = searchParams?.get("token_hash") || null;
    const otpType = searchParams?.get("type") || null;
    const authCode = searchParams?.get("code") || null;
    const hasHashRecovery =
      typeof window !== "undefined" &&
      window.location.hash.includes("type=recovery");

    // 1. Listen only for genuine PASSWORD_RECOVERY events (e.g. from implicit #access_token hash)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        if (event === "PASSWORD_RECOVERY" && session) {
          const grantKey = `hash_${session.access_token.slice(-16)}`;
          if (!isTokenMarkedConsumed(grantKey)) {
            activeTokenKeyRef.current = grantKey;
            window.sessionStorage.setItem(ACTIVE_RECOVERY_GRANT_KEY, grantKey);
            setIsSessionInvalid(false);
            setIsSessionChecking(false);
          }
        } else if (event === "SIGNED_OUT") {
          setIsSessionInvalid(true);
          setIsSessionChecking(false);
        }
      }
    );

    // 2. Strict one-time verification of the recovery link
    const verifyInitialRecoveryState = async () => {
      if (urlError) {
        setIsSessionInvalid(true);
        setSessionErrorMessage(urlError);
        setIsSessionChecking(false);
        return;
      }

      // Case A: Direct link with ?token_hash=...&type=recovery or ?code=...
      const incomingTokenKey = tokenHash || authCode;
      if (incomingTokenKey) {
        // Reject immediately if this exact token was already used to change a password
        if (isTokenMarkedConsumed(incomingTokenKey)) {
          setIsSessionInvalid(true);
          setSessionErrorMessage(
            "This password reset link has already been used. Please request a new password reset link from the sign-in page."
          );
          setIsSessionChecking(false);
          return;
        }

        let verifyPromise = inFlightTokenVerifications.get(incomingTokenKey);
        if (!verifyPromise) {
          verifyPromise = (async () => {
            if (tokenHash && (!otpType || otpType === "recovery")) {
              const { data, error } = await supabase.auth.verifyOtp({
                token_hash: tokenHash,
                type: "recovery",
              });
              if (error || !data.session) {
                return {
                  valid: false,
                  errorMessage:
                    "This password reset link is invalid, expired, or has already been used. Please request a new password reset link.",
                };
              }
              return { valid: true };
            }

            if (authCode) {
              const { data, error } =
                await supabase.auth.exchangeCodeForSession(authCode);
              if (error || !data.session) {
                return {
                  valid: false,
                  errorMessage:
                    "This password reset link is invalid, expired, or has already been used. Please request a new password reset link.",
                };
              }
              return { valid: true };
            }

            return { valid: false };
          })().finally(() => {
            setTimeout(() => {
              inFlightTokenVerifications.delete(incomingTokenKey);
            }, 2000);
          });

          inFlightTokenVerifications.set(incomingTokenKey, verifyPromise);
        }

        const result = await verifyPromise;
        if (!mounted) return;

        // CRITICAL: Never fall back to getSession() if the one-time token failed verification!
        if (!result.valid) {
          setIsSessionInvalid(true);
          setSessionErrorMessage(
            result.errorMessage ||
              "This password reset link has already been used or has expired."
          );
          setIsSessionChecking(false);
          return;
        }

        // Token verified for the first time: issue one-time grant & scrub token from URL bar
        activeTokenKeyRef.current = incomingTokenKey;
        try {
          window.sessionStorage.setItem(
            ACTIVE_RECOVERY_GRANT_KEY,
            incomingTokenKey
          );
          window.history.replaceState({}, "", "/reset-password");
        } catch {
          // Ignore history/storage errors
        }

        setIsSessionInvalid(false);
        setIsSessionChecking(false);
        return;
      }

      // Case B: Arrived via /auth/callback redirect (cookie) or in-tab refresh with active grant
      const hasVerifiedCookie =
        typeof document !== "undefined" &&
        document.cookie
          .split("; ")
          .some((c) => c === "examnest_recovery_verified=1");
      const existingGrant =
        typeof window !== "undefined"
          ? window.sessionStorage.getItem(ACTIVE_RECOVERY_GRANT_KEY)
          : null;

      if (hasVerifiedCookie) {
        const grantId = existingGrant || `cb_${Date.now()}`;
        activeTokenKeyRef.current = grantId;
        try {
          window.sessionStorage.setItem(ACTIVE_RECOVERY_GRANT_KEY, grantId);
          document.cookie =
            "examnest_recovery_verified=; path=/; max-age=0; SameSite=Lax";
        } catch {
          // Ignore storage errors
        }
      }

      const activeGrant =
        activeTokenKeyRef.current ||
        (existingGrant && !isTokenMarkedConsumed(existingGrant)
          ? existingGrant
          : null);

      if (!activeGrant && !hasHashRecovery) {
        setIsSessionInvalid(true);
        setSessionErrorMessage(
          "This password reset link has already been used or has expired. Please request a new password reset link from the sign-in page."
        );
        setIsSessionChecking(false);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!mounted) return;

      if (session && activeGrant) {
        activeTokenKeyRef.current = activeGrant;
        setIsSessionInvalid(false);
        setIsSessionChecking(false);
      } else {
        // Allow a short grace period for #access_token=...&type=recovery hash parsing
        setTimeout(() => {
          if (!mounted) return;
          supabase.auth
            .getSession()
            .then(({ data: { session: retrySession } }) => {
              if (!mounted) return;
              const grantAfterWait =
                activeTokenKeyRef.current ||
                window.sessionStorage.getItem(ACTIVE_RECOVERY_GRANT_KEY);
              if (!retrySession || !grantAfterWait) {
                setIsSessionInvalid(true);
                setSessionErrorMessage(
                  "This password reset link is invalid or has already been used. Please request a fresh link from the sign-in page."
                );
              } else {
                setIsSessionInvalid(false);
              }
              setIsSessionChecking(false);
            });
        }, 500);
      }
    };

    void verifyInitialRecoveryState();

    return () => {
      mounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleDirectToDashboard = async () => {
    setIsNavigatingDashboard(true);
    // Permanently consume the one-time recovery link so it cannot be reused later
    consumeRecoveryGrantPermanently(activeTokenKeyRef.current);
    await registerSingleDeviceLogin(
      typeof navigator !== "undefined" ? navigator.userAgent : "Web Browser"
    );
    router.push("/app/dashboard");
    router.refresh();
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setStatusBanner("");

    const parsed = resetPasswordSchema.safeParse({
      password: newPassword,
      confirmPassword,
    });

    if (!parsed.success) {
      setFormError(
        parsed.error.issues[0]?.message || "Please check your password entries."
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const supabase = createBrowserSupabaseClient();

      const { error } = await supabase.auth.updateUser({
        password: parsed.data.password,
        data: {
          year: new Date().getFullYear(),
        },
      });

      if (error) {
        setFormError(error.message);
        return;
      }

      // Immediately burn the one-time recovery token & grant upon password update
      consumeRecoveryGrantPermanently(activeTokenKeyRef.current);

      // Register this device as the sole active session & expire any other logged-in devices
      await registerSingleDeviceLogin(
        typeof navigator !== "undefined" ? navigator.userAgent : "Web Browser"
      );

      setStatusBanner(
        "Password successfully updated! Redirecting to your dashboard..."
      );

      setTimeout(() => {
        router.push("/app/dashboard");
        router.refresh();
      }, 900);
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Unable to update password right now."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Checking session state
  if (isSessionChecking) {
    return (
      <div className="w-full py-12 flex flex-col items-center justify-center text-center space-y-3">
        <Loader2 className="h-6 w-6 animate-spin text-[#5B4DFF]" />
        <p className="text-xs font-semibold text-[#717588]">
          Verifying security recovery link...
        </p>
      </div>
    );
  }

  // Invalid or expired recovery link
  if (isSessionInvalid) {
    return (
      <div className="w-full space-y-5 text-center">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-2xs">
          <AlertCircle className="h-6 w-6" />
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#171b2a]">
            Recovery Link Expired
          </h2>
          <p className="text-xs sm:text-sm text-[#717588] mt-2 leading-relaxed max-w-[320px] mx-auto">
            {sessionErrorMessage ||
              "This password reset link is invalid or has already been used. Please request a fresh link from the sign-in page."}
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-5 rounded-full bg-[#5B4DFF] hover:bg-[#402ae6] text-white text-xs sm:text-sm font-bold shadow-[0_10px_25px_rgba(91,77,255,0.32)] transition-all cursor-pointer"
          >
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    );
  }

  // ===================================================================
  // SCREEN 1: CHOICE INTERSTITIAL (DIRECT TO DASHBOARD OR CHANGE PASSWORD)
  // ===================================================================
  if (step === "choice") {
    return (
      <div className="w-full space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold mb-3 shadow-2xs">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            <span>Email Link Verified</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#171b2a]">
            Account Recovery
          </h2>
          <p className="text-xs sm:text-sm text-[#717588] mt-1.5 leading-relaxed">
            You are securely authenticated. How would you like to proceed with
            your ExamNest account?
          </p>
        </div>

        <div className="space-y-3.5">
          {/* Option A: Change Password (Primary Security Action) */}
          <button
            type="button"
            onClick={() => setStep("form")}
            className="w-full text-left p-4 rounded-2xl bg-white border border-[#eceef6] hover:border-[#5B4DFF]/50 shadow-[0_4px_18px_rgba(23,27,42,0.04)] hover:shadow-[0_8px_24px_rgba(91,77,255,0.12)] transition-all group cursor-pointer"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#5B4DFF]/10 text-[#5B4DFF] group-hover:bg-[#5B4DFF] group-hover:text-white transition-colors flex items-center justify-center shrink-0 mt-0.5">
                <KeyRound className="h-5 w-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-[#171b2a] group-hover:text-[#5B4DFF] transition-colors">
                    Change Password
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#5B4DFF]/10 text-[#5B4DFF]">
                    Recommended
                  </span>
                </div>
                <p className="text-xs text-[#717588] mt-1 leading-normal">
                  Create a new, strong password to permanently update your login
                  credentials.
                </p>
              </div>

              <ArrowRight className="h-4 w-4 text-[#a5a9bc] group-hover:text-[#5B4DFF] group-hover:translate-x-0.5 transition-all shrink-0 self-center" />
            </div>
          </button>

          {/* Option B: Direct to Dashboard */}
          <button
            type="button"
            disabled={isNavigatingDashboard}
            onClick={handleDirectToDashboard}
            className="w-full text-left p-4 rounded-2xl bg-white border border-[#eceef6] hover:border-slate-300 shadow-[0_4px_18px_rgba(23,27,42,0.04)] hover:shadow-[0_8px_20px_rgba(23,27,42,0.08)] transition-all group cursor-pointer disabled:opacity-60"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 group-hover:bg-slate-800 group-hover:text-white transition-colors flex items-center justify-center shrink-0 mt-0.5">
                {isNavigatingDashboard ? (
                  <Loader2 className="h-5 w-5 animate-spin text-[#5B4DFF]" />
                ) : (
                  <LayoutDashboard className="h-5 w-5" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-sm font-extrabold text-[#171b2a] group-hover:text-slate-900 transition-colors">
                  Go Direct to Dashboard
                </span>
                <p className="text-xs text-[#717588] mt-1 leading-normal">
                  Keep your current credentials and jump straight into your
                  student workspace.
                </p>
              </div>

              <ArrowRight className="h-4 w-4 text-[#a5a9bc] group-hover:text-slate-800 group-hover:translate-x-0.5 transition-all shrink-0 self-center" />
            </div>
          </button>
        </div>

        <p className="text-[11px] text-[#8c90a4] text-center">
          Security standard: Your session is protected by one-time cryptographic
          verification.
        </p>
      </div>
    );
  }

  // ===================================================================
  // SCREEN 2: PERMANENT PASSWORD CHANGE FORM
  // ===================================================================
  return (
    <div className="w-full space-y-5">
      <button
        type="button"
        onClick={() => {
          setStep("choice");
          setFormError("");
          setStatusBanner("");
        }}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#717588] hover:text-[#171b2a] transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to options</span>
      </button>

      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#171b2a]">
          Change Password
        </h2>
        <p className="text-xs sm:text-sm text-[#717588] mt-1.5 leading-relaxed">
          Set a new, secure password to permanently update your credentials.
        </p>
      </div>

      {statusBanner && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{statusBanner}</span>
        </div>
      )}

      {formError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleUpdatePassword} className="space-y-3.5">
        {/* Field 1: New Password with Dynamic Strength Indicator */}
        <div className="rounded-2xl bg-white px-4 py-2.5 border border-[#f0f2f8] shadow-[0_6px_24px_rgba(23,27,42,0.04)] focus-within:border-[#5B4DFF]/50 focus-within:shadow-[0_8px_28px_rgba(91,77,255,0.10)] transition-all relative">
          <label
            htmlFor="reset-new-password"
            className="flex items-center gap-2 text-[11px] font-semibold text-[#8c90a4]"
          >
            <span>New Password</span>
            {pwdStrength && (
              <span
                className={`text-[11px] font-bold transition-colors duration-200 ${pwdStrength.colorClass}`}
              >
                • {pwdStrength.text}
              </span>
            )}
          </label>

          <div className="flex items-center justify-between gap-2 mt-0.5">
            <input
              id="reset-new-password"
              type={showNewPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••••••••••"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setFormError("");
              }}
              className="w-full bg-transparent text-xs sm:text-sm font-bold text-[#171b2a] placeholder:text-[#c0c4d6] outline-none"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((prev) => !prev)}
              aria-label={showNewPassword ? "Hide password" : "Show password"}
              className="text-[#a5a9bc] hover:text-[#171b2a] transition-colors cursor-pointer shrink-0"
            >
              {showNewPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Field 2: Confirm New Password with Real-Time Match Validation */}
        <div className="rounded-2xl bg-white px-4 py-2.5 border border-[#f0f2f8] shadow-[0_6px_24px_rgba(23,27,42,0.04)] focus-within:border-[#5B4DFF]/50 focus-within:shadow-[0_8px_28px_rgba(91,77,255,0.10)] transition-all relative">
          <label
            htmlFor="reset-confirm-password"
            className="flex items-center justify-between text-[11px] font-semibold text-[#8c90a4]"
          >
            <span>Confirm New Password</span>
            {passwordsMatch && (
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                ✓ Passwords match
              </span>
            )}
            {passwordsMismatch && (
              <span className="text-[11px] font-bold text-rose-500">
                Passwords do not match
              </span>
            )}
          </label>

          <div className="flex items-center justify-between gap-2 mt-0.5">
            <input
              id="reset-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••••••••••"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setFormError("");
              }}
              className="w-full bg-transparent text-xs sm:text-sm font-bold text-[#171b2a] placeholder:text-[#c0c4d6] outline-none"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
              className="text-[#a5a9bc] hover:text-[#171b2a] transition-colors cursor-pointer shrink-0"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting || !!statusBanner}
            className="w-full py-3.5 px-6 rounded-full bg-[#5B4DFF] hover:bg-[#402ae6] text-white font-bold text-xs sm:text-sm shadow-[0_10px_25px_rgba(91,77,255,0.32)] hover:shadow-[0_14px_30px_rgba(91,77,255,0.42)] transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Updating password...</span>
              </>
            ) : (
              "Save New Password & Continue"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

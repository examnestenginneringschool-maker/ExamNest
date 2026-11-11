"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import {
  registerSingleDeviceLogin,
  verifyEmailSecurityOnServer,
} from "@/app/(auth)/actions";
import {
  emailSchema,
  isDisposableEmail,
  isValidPhoneNumber,
  normalizePhoneNumber,
  otpVerifySchema,
  signInSchema,
  signUpSchema,
} from "@/lib/validation/auth";

interface AuthInteractivePortalProps {
  mode: "sign-in" | "sign-up";
}

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

export function AuthInteractivePortal({ mode }: AuthInteractivePortalProps) {
  const router = useRouter();
  const isSignIn = mode === "sign-in";

  const [step, setStep] = useState<"form" | "otp">("form");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [otpDigits, setOtpDigits] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [statusBanner, setStatusBanner] = useState("");

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const pwdStrength = getPasswordStrengthInfo(password);
  const isTempEmailDetected =
    email.includes("@") && isDisposableEmail(email.trim());

  const isSignUpPhoneValid =
    phone.trim().length > 0 && isValidPhoneNumber(phone.trim());

  // Display session replacement or callback error notices from query parameters
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const reason = params.get("reason");
    const urlErr = params.get("error_description") || params.get("error");

    if (reason === "session_replaced") {
      queueMicrotask(() => {
        setFormError(
          "Your session expired because your account was signed in on another device or browser."
        );
      });
    } else if (urlErr) {
      queueMicrotask(() => {
        setFormError(urlErr);
      });
    }
  }, []);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleOtpChange = (index: number, rawValue: string) => {
    setFormError("");
    const digit = rawValue.replace(/\D/g, "").slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;
    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setOtpDigits(next);
    const focusIdx = Math.min(pasted.length, 5);
    otpInputRefs.current[focusIdx]?.focus();
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setStatusBanner("");

    // ===============================================================
    // FLOW A: SIGN UP -> REQUIRE NAME + EMAIL + PHONE + PASSWORD
    // ===============================================================
    if (!isSignIn) {
      const parsed = signUpSchema.safeParse({
        fullName,
        email,
        phone,
        password,
      });

      if (!parsed.success) {
        setFormError(
          parsed.error.issues[0]?.message ||
            "Please check your registration details."
        );
        return;
      }

      const {
        fullName: validName,
        email: validEmail,
        phone: validPhone,
        password: validPassword,
      } = parsed.data;
      const nameParts = validName.split(/\s+/);
      const firstName = nameParts[0] || validName;
      const lastName = nameParts.slice(1).join(" ");

      try {
        setIsSubmitting(true);

        // Server-side multi-layer disposable email & MX record verification
        const emailSecurity = await verifyEmailSecurityOnServer(validEmail);
        if (!emailSecurity.allowed) {
          setFormError(
            emailSecurity.reason ||
              "Temporary or disposable email services are strictly blocked."
          );
          return;
        }

        const supabase = createBrowserSupabaseClient();
        const origin =
          typeof window !== "undefined" ? window.location.origin : "";

        const { data, error } = await supabase.auth.signUp({
          email: validEmail,
          password: validPassword,
          options: {
            emailRedirectTo: `${origin}/auth/callback?next=/onboarding`,
            data: {
              full_name: validName,
              first_name: firstName,
              last_name: lastName,
              phone_number: validPhone,
              year: new Date().getFullYear(),
            },
          },
        });

        if (error) {
          setFormError(error.message);
          return;
        }

        // Supabase returns an empty identities array if the email is already registered
        if (
          data.user &&
          Array.isArray(data.user.identities) &&
          data.user.identities.length === 0
        ) {
          setFormError(
            "An account with this email already exists. Please Sign In instead."
          );
          return;
        }

        // If email confirmation is disabled in Supabase, session is returned immediately
        if (data.session) {
          await registerSingleDeviceLogin(
            typeof navigator !== "undefined"
              ? navigator.userAgent
              : "Web Browser"
          );
          router.push("/onboarding");
          router.refresh();
          return;
        }

        // Transition to the 6-digit OTP verification view
        setStep("otp");
        setResendCooldown(60);
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 100);
      } catch (err) {
        setFormError(
          err instanceof Error
            ? err.message
            : "Unable to create account right now."
        );
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // ===============================================================
    // FLOW B: SIGN IN -> MANUAL EMAIL & PASSWORD AUTHENTICATION
    // ===============================================================
    const parsedEmail = emailSchema.safeParse(email);
    if (!parsedEmail.success) {
      setFormError(
        parsedEmail.error.issues[0]?.message ||
          "Please enter a valid email address."
      );
      return;
    }

    const parsedSignIn = signInSchema.safeParse({
      identifier: parsedEmail.data,
      password,
    });

    if (!parsedSignIn.success) {
      setFormError(
        parsedSignIn.error.issues[0]?.message || "Invalid email or password."
      );
      return;
    }

    try {
      setIsSubmitting(true);

      // Server-side disposable email & MX record check
      const emailSecurity = await verifyEmailSecurityOnServer(parsedEmail.data);
      if (!emailSecurity.allowed) {
        setFormError(
          emailSecurity.reason ||
            "Temporary or disposable email services are strictly blocked."
        );
        return;
      }

      const supabase = createBrowserSupabaseClient();

      const { error } = await supabase.auth.signInWithPassword({
        email: parsedEmail.data,
        password: parsedSignIn.data.password,
      });

      if (error) {
        if (error.message.toLowerCase().includes("email not confirmed")) {
          setStep("otp");
          setResendCooldown(60);
          setStatusBanner(
            "Please verify your 6-digit email code to finish activating your account."
          );
          return;
        }
        setFormError("Invalid email or password.");
        return;
      }

      // Register this device as the sole active session & immediately expire older devices
      await registerSingleDeviceLogin(
        typeof navigator !== "undefined" ? navigator.userAgent : "Web Browser"
      );

      router.push("/app/dashboard");
      router.refresh();
    } catch {
      setFormError("Invalid email or password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setStatusBanner("");

    const parsedOtp = otpVerifySchema.safeParse({
      identifier: email,
      token: otpDigits.join(""),
    });

    if (!parsedOtp.success) {
      setFormError(
        parsedOtp.error.issues[0]?.message ||
          "Please enter the complete 6-digit verification code."
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const validEmail = emailSchema.parse(email);
      const emailSecurity = await verifyEmailSecurityOnServer(validEmail);
      if (!emailSecurity.allowed) {
        setFormError(
          emailSecurity.reason ||
            "Temporary or disposable email services are strictly blocked."
        );
        return;
      }

      const supabase = createBrowserSupabaseClient();

      const { error } = await supabase.auth.verifyOtp({
        email: validEmail,
        token: parsedOtp.data.token,
        type: "signup",
      });

      if (error) {
        setFormError(error.message || "Invalid or expired verification code.");
        return;
      }

      await registerSingleDeviceLogin(
        typeof navigator !== "undefined" ? navigator.userAgent : "Web Browser"
      );

      router.push("/onboarding");
      router.refresh();
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Verification failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    setFormError("");
    setStatusBanner("");

    const parsedEmail = emailSchema.safeParse(email);
    if (!parsedEmail.success) {
      setFormError(
        parsedEmail.error.issues[0]?.message || "Invalid email address."
      );
      return;
    }

    try {
      const emailSecurity = await verifyEmailSecurityOnServer(parsedEmail.data);
      if (!emailSecurity.allowed) {
        setFormError(
          emailSecurity.reason ||
            "Temporary or disposable email services are strictly blocked."
        );
        return;
      }

      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: parsedEmail.data,
      });

      if (error) {
        setFormError(error.message);
        return;
      }

      setResendCooldown(60);
      setOtpDigits(["", "", "", "", "", ""]);
      setStatusBanner("A new 6-digit verification code has been sent.");
      otpInputRefs.current[0]?.focus();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Could not resend code."
      );
    }
  };

  const handleForgotPassword = async () => {
    setFormError("");
    setStatusBanner("");

    const parsedEmail = emailSchema.safeParse(email);
    if (!parsedEmail.success) {
      setFormError(
        parsedEmail.error.issues[0]?.message ||
          "Enter a valid email address above first to reset your password."
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const emailSecurity = await verifyEmailSecurityOnServer(parsedEmail.data);
      if (!emailSecurity.allowed) {
        setFormError(
          emailSecurity.reason ||
            "Temporary or disposable email services are strictly blocked."
        );
        return;
      }

      const supabase = createBrowserSupabaseClient();
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";

      if (typeof document !== "undefined") {
        document.cookie =
          "examnest_recovery_flow=1; path=/; max-age=3600; SameSite=Lax";
      }

      const { error } = await supabase.auth.resetPasswordForEmail(
        parsedEmail.data,
        {
          redirectTo: `${origin}/reset-password`,
        }
      );

      if (error) {
        setFormError(error.message);
        return;
      }

      setStatusBanner(
        "If an account exists for this email, a password reset link has been sent."
      );
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Unable to send password reset email right now."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===================================================================
  // STEP 2: MINIMAL 6-DIGIT OTP VERIFICATION (ONLY AFTER SIGN-UP SUBMIT)
  // ===================================================================
  if (step === "otp") {
    return (
      <div className="w-full animate-auth-fade-in space-y-6">
        <button
          type="button"
          onClick={() => {
            setStep("form");
            setFormError("");
            setStatusBanner("");
          }}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#717588] hover:text-[#171b2a] transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back</span>
        </button>

        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#171b2a]">
            Verify your email
          </h2>
          <p className="text-xs sm:text-sm text-[#717588] mt-1.5">
            Enter the 6-digit code sent to{" "}
            <span className="font-bold text-[#171b2a]">{email.trim()}</span>
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

        <form onSubmit={handleVerifyOtpSubmit} className="space-y-6">
          <div className="grid grid-cols-6 gap-2.5 sm:gap-3">
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  otpInputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                onPaste={handleOtpPaste}
                aria-label={`Digit ${idx + 1}`}
                className={`w-full h-13 sm:h-14 text-center text-lg font-extrabold rounded-2xl border transition-all outline-none ${
                  digit
                    ? "bg-white border-[#5B4DFF] text-[#171b2a] shadow-[0_8px_20px_rgba(91,77,255,0.12)]"
                    : "bg-white border-[#eceef6] text-[#171b2a] shadow-[0_4px_18px_rgba(23,27,42,0.04)] focus:border-[#5B4DFF]"
                }`}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-full bg-[#5B4DFF] hover:bg-[#402ae6] text-white font-bold text-sm shadow-[0_10px_25px_rgba(91,77,255,0.32)] hover:shadow-[0_14px_30px_rgba(91,77,255,0.42)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Verifying code...</span>
              </>
            ) : (
              "Verify & Continue"
            )}
          </button>
        </form>

        <div className="text-center">
          <button
            type="button"
            disabled={resendCooldown > 0}
            onClick={handleResendCode}
            className={`inline-flex items-center gap-1.5 text-xs font-bold transition-colors ${
              resendCooldown > 0
                ? "text-[#717588]/60 cursor-not-allowed"
                : "text-[#5B4DFF] hover:text-[#402ae6] cursor-pointer"
            }`}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>
              {resendCooldown > 0
                ? `Resend code in ${resendCooldown}s`
                : "Resend code"}
            </span>
          </button>
        </div>
      </div>
    );
  }

  // =======================================
  // STEP 1: SIGN IN / CREATE ACCOUNT FORM
  // =======================================
  return (
    <div className="w-full animate-auth-fade-in">
      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#171b2a] mb-6">
        {isSignIn ? "Sign In" : "Create Account"}
      </h2>

      {statusBanner && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{statusBanner}</span>
        </div>
      )}

      {formError && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-3.5">
        {/* Full Name (Only in Create Account) */}
        {!isSignIn && (
          <div className="rounded-2xl bg-white px-4 py-2.5 border border-[#f0f2f8] shadow-[0_6px_24px_rgba(23,27,42,0.04)] focus-within:border-[#5B4DFF]/50 focus-within:shadow-[0_8px_28px_rgba(91,77,255,0.10)] transition-all">
            <label
              htmlFor="auth-fullname"
              className="block text-[11px] font-semibold text-[#8c90a4]"
            >
              Full Name
            </label>
            <input
              id="auth-fullname"
              type="text"
              autoComplete="name"
              placeholder="Tony Stark"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setFormError("");
              }}
              className="w-full mt-0.5 bg-transparent text-xs sm:text-sm font-bold text-[#171b2a] placeholder:text-[#c0c4d6] placeholder:font-medium outline-none"
            />
          </div>
        )}

        {/* Email */}
        <div
          className={`rounded-2xl bg-white px-4 py-2.5 border shadow-[0_6px_24px_rgba(23,27,42,0.04)] transition-all ${
            isTempEmailDetected
              ? "border-rose-400 focus-within:border-rose-500"
              : "border-[#f0f2f8] focus-within:border-[#5B4DFF]/50 focus-within:shadow-[0_8px_28px_rgba(91,77,255,0.10)]"
          }`}
        >
          <label
            htmlFor="auth-email"
            className="flex items-center gap-2 text-[11px] font-semibold text-[#8c90a4]"
          >
            <span>Email</span>
            {isTempEmailDetected && (
              <span className="text-[11px] font-bold text-rose-500">
                • Temporary email blocked
              </span>
            )}
          </label>
          <input
            id="auth-email"
            type="email"
            autoComplete="email"
            placeholder="tonystark@mit.edu / tonystark@gmail.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFormError("");
            }}
            className="w-full mt-0.5 bg-transparent text-xs sm:text-sm font-bold text-[#171b2a] placeholder:text-[#c0c4d6] placeholder:font-medium outline-none"
          />
        </div>

        {/* Phone Number (Only in Create Account) */}
        {!isSignIn && (
          <div className="rounded-2xl bg-white px-4 py-2.5 border border-[#f0f2f8] shadow-[0_6px_24px_rgba(23,27,42,0.04)] focus-within:border-[#5B4DFF]/50 focus-within:shadow-[0_8px_28px_rgba(91,77,255,0.10)] transition-all">
            <label
              htmlFor="auth-phone"
              className="flex items-center gap-2 text-[11px] font-semibold text-[#8c90a4]"
            >
              <span>Phone Number</span>
              {phone.trim().length > 0 && (
                <span
                  className={`text-[11px] font-bold ${
                    isSignUpPhoneValid ? "text-emerald-600" : "text-amber-500"
                  }`}
                >
                  {isSignUpPhoneValid
                    ? `• ${normalizePhoneNumber(phone)}`
                    : "• Enter 10-digit mobile number"}
                </span>
              )}
            </label>
            <input
              id="auth-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+91 XXXXX XXXXX"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setFormError("");
              }}
              className="w-full mt-0.5 bg-transparent text-xs sm:text-sm font-bold text-[#171b2a] placeholder:text-[#c0c4d6] placeholder:font-medium outline-none"
            />
          </div>
        )}

        {/* Password */}
        <div className="rounded-2xl bg-white px-4 py-2.5 border border-[#f0f2f8] shadow-[0_6px_24px_rgba(23,27,42,0.04)] focus-within:border-[#5B4DFF]/50 focus-within:shadow-[0_8px_28px_rgba(91,77,255,0.10)] transition-all relative">
          <label
            htmlFor="auth-password"
            className="flex items-center gap-2 text-[11px] font-semibold text-[#8c90a4]"
          >
            <span>Password</span>
            {!isSignIn && pwdStrength && (
              <span
                className={`text-[11px] font-bold transition-colors duration-200 ${pwdStrength.colorClass}`}
              >
                • {pwdStrength.text}
              </span>
            )}
          </label>

          <div className="flex items-center justify-between gap-2 mt-0.5">
            <input
              id="auth-password"
              type={showPassword ? "text" : "password"}
              autoComplete={isSignIn ? "current-password" : "new-password"}
              placeholder="••••••••••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setFormError("");
              }}
              className="w-full bg-transparent text-xs sm:text-sm font-bold text-[#171b2a] placeholder:text-[#c0c4d6] outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="text-[#a5a9bc] hover:text-[#171b2a] transition-colors cursor-pointer shrink-0"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Remember Me & Forgot Password Row (Sign In Only) */}
        {isSignIn && (
          <div className="flex items-center justify-between pt-1 text-xs">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none text-[#717588] font-medium">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded accent-[#5B4DFF] cursor-pointer"
              />
              <span>Remember me</span>
            </label>

            <button
              type="button"
              onClick={handleForgotPassword}
              className="font-semibold text-[#5B4DFF] hover:text-[#402ae6] transition-colors cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
        )}

        {/* Primary Pill Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-full bg-[#5B4DFF] hover:bg-[#402ae6] text-white font-bold text-xs sm:text-sm shadow-[0_10px_25px_rgba(91,77,255,0.32)] hover:shadow-[0_14px_30px_rgba(91,77,255,0.42)] transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{isSignIn ? "Signing in..." : "Creating account..."}</span>
              </>
            ) : isSignIn ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

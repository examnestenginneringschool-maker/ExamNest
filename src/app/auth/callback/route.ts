import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { type EmailOtpType, type Session, type User } from "@supabase/supabase-js";
import {
  registerSingleDeviceLogin,
  verifyEmailSecurityOnServer,
} from "@/app/(auth)/actions";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getStudentAcademicContext } from "@/lib/academic/student-context";

/**
 * Sanitizes redirect path to prevent Open Redirect vulnerabilities.
 */
function getSafeNextPath(nextParam: string | null): string | null {
  if (!nextParam) return null;
  if (!nextParam.startsWith("/") || nextParam.startsWith("//")) {
    return null;
  }
  return nextParam;
}

/**
 * Detects whether the newly exchanged session originated from a password recovery email link.
 * Checks URL parameters, recovery flow cookie, JWT `amr` claims, and `user.recovery_sent_at`.
 */
function isPasswordRecoverySession(
  type: EmailOtpType | null,
  safeNext: string | null,
  hasRecoveryCookie: boolean,
  user: User,
  session: Session | null
): boolean {
  if (type === "recovery" || safeNext === "/reset-password" || hasRecoveryCookie) {
    return true;
  }

  // Check JWT Authentication Methods References (`amr`) for `{ method: "recovery" }`
  if (session?.access_token) {
    try {
      const payloadBase64 = session.access_token.split(".")[1];
      if (payloadBase64) {
        const decoded = JSON.parse(
          Buffer.from(payloadBase64, "base64url").toString("utf-8")
        ) as { amr?: Array<{ method?: string }> };
        if (
          Array.isArray(decoded.amr) &&
          decoded.amr.some((entry) => entry?.method === "recovery")
        ) {
          return true;
        }
      }
    } catch {
      // Ignore malformed JWT parsing and fall through to recovery_sent_at check
    }
  }

  // Check if Supabase recorded a password recovery email sent within the last 30 minutes
  if (user.recovery_sent_at) {
    const recoverySentMs = new Date(user.recovery_sent_at).getTime();
    if (
      !Number.isNaN(recoverySentMs) &&
      Date.now() - recoverySentMs < 30 * 60 * 1000
    ) {
      return true;
    }
  }

  return false;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const safeNext = getSafeNextPath(searchParams.get("next"));

  const cookieStore = await cookies();
  const hasRecoveryCookie =
    cookieStore.get("examnest_recovery_flow")?.value === "1";

  // Check if Supabase sent an error in query parameters (e.g. otp_expired)
  const errorDescription =
    searchParams.get("error_description") || searchParams.get("error");
  if (errorDescription) {
    if (safeNext === "/reset-password" || type === "recovery" || hasRecoveryCookie) {
      const res = NextResponse.redirect(
        `${origin}/reset-password?error=${encodeURIComponent(errorDescription)}`
      );
      res.cookies.delete("examnest_recovery_flow");
      return res;
    }
    return NextResponse.redirect(
      `${origin}/sign-in?error=${encodeURIComponent(errorDescription)}`
    );
  }

  const supabase = await createServerSupabaseClient();

  // 1. Handle token_hash verification (standard for Supabase email recovery & invite links)
  if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type,
    });

    if (!error && data.user) {
      if (data.user.email) {
        const emailCheck = await verifyEmailSecurityOnServer(data.user.email);
        if (!emailCheck.allowed) {
          await supabase.auth.signOut();
          return NextResponse.redirect(
            `${origin}/sign-in?error=${encodeURIComponent(
              emailCheck.reason ||
                "Temporary or disposable email services are strictly blocked."
            )}`
          );
        }
      }

      // Register this browser as the sole active device & expire older device sessions
      const { deviceToken } = await registerSingleDeviceLogin(
        request.headers.get("user-agent") || "Web Browser"
      );

      if (
        isPasswordRecoverySession(
          type,
          safeNext,
          hasRecoveryCookie,
          data.user,
          data.session
        )
      ) {
        const res = NextResponse.redirect(`${origin}/reset-password`);
        res.cookies.delete("examnest_recovery_flow");
        res.cookies.set("examnest_recovery_verified", "1", {
          path: "/",
          maxAge: 600,
          sameSite: "lax",
        });
        if (deviceToken) {
          res.cookies.set("examnest_device_token", deviceToken, {
            path: "/",
            maxAge: 60 * 60 * 24 * 30,
            sameSite: "lax",
            httpOnly: false,
          });
        }
        return res;
      }

      if (safeNext) {
        const res = NextResponse.redirect(`${origin}${safeNext}`);
        if (deviceToken) {
          res.cookies.set("examnest_device_token", deviceToken, {
            path: "/",
            maxAge: 60 * 60 * 24 * 30,
            sameSite: "lax",
            httpOnly: false,
          });
        }
        return res;
      }

      const context = await getStudentAcademicContext(data.user.id);
      const destination = context ? "/app/dashboard" : "/onboarding";
      const res = NextResponse.redirect(`${origin}${destination}`);
      if (deviceToken) {
        res.cookies.set("examnest_device_token", deviceToken, {
          path: "/",
          maxAge: 60 * 60 * 24 * 30,
          sameSite: "lax",
          httpOnly: false,
        });
      }
      return res;
    }
  }

  // 2. Handle PKCE code exchange
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      if (data.user.email) {
        const emailCheck = await verifyEmailSecurityOnServer(data.user.email);
        if (!emailCheck.allowed) {
          await supabase.auth.signOut();
          return NextResponse.redirect(
            `${origin}/sign-in?error=${encodeURIComponent(
              emailCheck.reason ||
                "Temporary or disposable email services are strictly blocked."
            )}`
          );
        }
      }

      // Register this browser as the sole active device & expire older device sessions
      const { deviceToken } = await registerSingleDeviceLogin(
        request.headers.get("user-agent") || "Web Browser"
      );

      if (
        isPasswordRecoverySession(
          type,
          safeNext,
          hasRecoveryCookie,
          data.user,
          data.session
        )
      ) {
        const res = NextResponse.redirect(`${origin}/reset-password`);
        res.cookies.delete("examnest_recovery_flow");
        res.cookies.set("examnest_recovery_verified", "1", {
          path: "/",
          maxAge: 600,
          sameSite: "lax",
        });
        if (deviceToken) {
          res.cookies.set("examnest_device_token", deviceToken, {
            path: "/",
            maxAge: 60 * 60 * 24 * 30,
            sameSite: "lax",
            httpOnly: false,
          });
        }
        return res;
      }

      if (safeNext) {
        const res = NextResponse.redirect(`${origin}${safeNext}`);
        if (deviceToken) {
          res.cookies.set("examnest_device_token", deviceToken, {
            path: "/",
            maxAge: 60 * 60 * 24 * 30,
            sameSite: "lax",
            httpOnly: false,
          });
        }
        return res;
      }

      // Check if student already completed academic onboarding
      const context = await getStudentAcademicContext(data.user.id);
      const destination = context ? "/app/dashboard" : "/onboarding";
      const res = NextResponse.redirect(`${origin}${destination}`);
      if (deviceToken) {
        res.cookies.set("examnest_device_token", deviceToken, {
          path: "/",
          maxAge: 60 * 60 * 24 * 30,
          sameSite: "lax",
          httpOnly: false,
        });
      }
      return res;
    }
  }

  // 3. Fallback: If navigating to /reset-password, forward with descriptive error
  if (safeNext === "/reset-password" || type === "recovery" || hasRecoveryCookie) {
    const res = NextResponse.redirect(
      `${origin}/reset-password?error=Invalid+or+expired+recovery+link`
    );
    res.cookies.delete("examnest_recovery_flow");
    return res;
  }

  return NextResponse.redirect(
    `${origin}/sign-in?error=Could+not+verify+authentication+code`
  );
}

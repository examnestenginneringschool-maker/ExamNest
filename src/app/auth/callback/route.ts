import { NextResponse } from "next/server";
import { type EmailOtpType } from "@supabase/supabase-js";
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

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const safeNext = getSafeNextPath(searchParams.get("next"));

  // Check if Supabase sent an error in query parameters (e.g. otp_expired)
  const errorDescription =
    searchParams.get("error_description") || searchParams.get("error");
  if (errorDescription) {
    if (safeNext === "/reset-password") {
      return NextResponse.redirect(
        `${origin}/reset-password?error=${encodeURIComponent(errorDescription)}`
      );
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
      if (safeNext) {
        return NextResponse.redirect(`${origin}${safeNext}`);
      }

      const context = await getStudentAcademicContext(data.user.id);
      const destination = context ? "/app/dashboard" : "/onboarding";
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  // 2. Handle PKCE code exchange
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      if (safeNext) {
        return NextResponse.redirect(`${origin}${safeNext}`);
      }

      // Check if student already completed academic onboarding
      const context = await getStudentAcademicContext(data.user.id);
      const destination = context ? "/app/dashboard" : "/onboarding";
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  // 3. Fallback: If navigating to /reset-password, forward with descriptive error
  if (safeNext === "/reset-password") {
    return NextResponse.redirect(
      `${origin}/reset-password?error=Invalid+or+expired+recovery+link`
    );
  }

  return NextResponse.redirect(
    `${origin}/sign-in?error=Could+not+verify+authentication+code`
  );
}

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isDisposableEmail } from "@/lib/validation/auth";

const PROTECTED_PREFIXES = ["/app", "/onboarding"];
const AUTH_PREFIXES = ["/sign-in", "/sign-up"];

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  const { pathname, searchParams } = request.nextUrl;
  const isServerAction =
    request.method !== "GET" || request.headers.has("next-action");

  // Never redirect POST / Server Action RPC requests — let the Server Action execute and return its RSC payload
  if (isServerAction) {
    return supabaseResponse;
  }

  // Intercept Supabase auth codes, token_hash links, or auth errors that fell back to the root Site URL ("/")
  // and forward them to "/auth/callback" so recovery & OAuth sessions are always handled properly.
  if (
    pathname === "/" &&
    (searchParams.has("code") ||
      searchParams.has("token_hash") ||
      searchParams.get("type") === "recovery" ||
      searchParams.has("error_code") ||
      searchParams.has("error_description"))
  ) {
    const callbackUrl = request.nextUrl.clone();
    callbackUrl.pathname = "/auth/callback";
    return NextResponse.redirect(callbackUrl);
  }

  // If a password recovery flow cookie is active and Supabase redirected to "/" or "/app/dashboard",
  // route the user straight to the password recovery portal ("/reset-password").
  const hasRecoveryFlowCookie =
    request.cookies.get("examnest_recovery_flow")?.value === "1";
  if (
    hasRecoveryFlowCookie &&
    (pathname === "/" || pathname.startsWith("/app"))
  ) {
    const resetUrl = request.nextUrl.clone();
    resetUrl.pathname = "/reset-password";
    const res = NextResponse.redirect(resetUrl);
    res.cookies.delete("examnest_recovery_flow");
    return res;
  }

  const isProtectedRoute = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  const isAuthRoute = AUTH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  const allCookies = request.cookies.getAll();
  const hasAuthCookie = allCookies.some(
    (c) => c.name.startsWith("sb-") && c.name.includes("-auth-token")
  );

  // Fast-path for unauthenticated requests: Avoid unnecessary remote round-trips
  if (!hasAuthCookie) {
    if (isProtectedRoute) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/sign-in";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }
    // Auth and public routes for visitors without session cookies can pass through immediately
    return supabaseResponse;
  }

  // Active or pending session detected: cryptographically validate & refresh token
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Always call getUser() when auth cookies are present to validate JWT and refresh tokens
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 0. Block any session associated with a disposable/temporary email address
  if (user?.email && isDisposableEmail(user.email)) {
    await supabase.auth.signOut({ scope: "local" });
    if (isProtectedRoute) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/sign-in";
      redirectUrl.search =
        "?error=Temporary+or+disposable+email+services+are+strictly+blocked";
      return NextResponse.redirect(redirectUrl);
    }
    return supabaseResponse;
  }

  // 0b. Single-Device Session Enforcement on protected routes:
  // If `user.user_metadata.active_device_token` is set and does not match this browser's
  // `examnest_device_token` cookie, another device or browser has signed in with this account.
  const activeDeviceToken =
    typeof user?.user_metadata?.active_device_token === "string"
      ? user.user_metadata.active_device_token
      : null;
  const browserDeviceToken =
    request.cookies.get("examnest_device_token")?.value || null;
  const isDeviceDisplaced = Boolean(
    activeDeviceToken &&
      (!browserDeviceToken || activeDeviceToken !== browserDeviceToken)
  );

  if (user && isProtectedRoute && isDeviceDisplaced) {
    await supabase.auth.signOut({ scope: "local" });
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/sign-in";
    redirectUrl.search = "?reason=session_replaced";
    const res = NextResponse.redirect(redirectUrl);
    res.cookies.delete("examnest_device_token");
    allCookies.forEach((c) => {
      if (c.name.startsWith("sb-")) {
        res.cookies.delete(c.name);
      }
    });
    return res;
  }

  // 1. Intercept invalid session visitors trying to access protected academic routes
  if (isProtectedRoute && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/sign-in";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  // 2. Redirect already-authenticated students away from /sign-in or /sign-up
  // (Only if their device session is valid and not displaced)
  if (
    isAuthRoute &&
    user &&
    !isDeviceDisplaced &&
    searchParams.get("reason") !== "session_replaced"
  ) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/app/dashboard";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

export default proxy;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

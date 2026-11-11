import { cache } from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import { isDisposableEmail } from "@/lib/validation/auth";
import { parseJwtPayload, type ExamNestJwtPayload } from "@/lib/supabase/jwt";

function getSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing Supabase environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) are configured."
    );
  }

  return { supabaseUrl, supabaseKey };
}

/**
 * Cookie-aware Supabase SSR client for Server Components, Server Actions, and Route Handlers.
 */
export async function createServerSupabaseClient() {
  const { supabaseUrl, supabaseKey } = getSupabaseEnv();

  try {
    const cookieStore = await cookies();

    return createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component where setting cookies is ignored
            // (session refresh is handled by src/proxy.ts).
          }
        },
      },
    });
  } catch {
    // Fallback if invoked outside a Next.js request context (e.g. CLI scripts)
    return createClient(supabaseUrl, supabaseKey);
  }
}

export type AuthenticatedStudent = {
  id: string;
  email: string;
  phone: string | null;
  fullName: string;
  firstName: string;
  avatarUrl: string | null;
  emailConfirmedAt: string | null;
  jwt: ExamNestJwtPayload | null;
  accessToken: string | null;
  rawUser: User;
};

/**
 * Cryptographically verifies the current user session against Supabase Auth via getUser()
 * and extracts the RFC 7519 JWT payload (`header.payload.signature`) from the active session.
 * Wrapped in React.cache() so layouts and pages share a single network round-trip per request.
 */
export const getAuthenticatedUser = cache(
  async (): Promise<AuthenticatedStudent | null> => {
    try {
      const cookieStore = await cookies();
      const hasAuthCookie = cookieStore
        .getAll()
        .some((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"));

      if (!hasAuthCookie) {
        return null;
      }

      const supabase = await createServerSupabaseClient();
      const [
        {
          data: { user },
          error,
        },
        {
          data: { session },
        },
      ] = await Promise.all([
        supabase.auth.getUser(),
        supabase.auth.getSession(),
      ]);

      if (error || !user) {
        return null;
      }

      if (!user.email && !user.phone) {
        return null;
      }

      if (user.email && isDisposableEmail(user.email)) {
        return null;
      }

      const activeDeviceToken =
        typeof user.user_metadata?.active_device_token === "string"
          ? user.user_metadata.active_device_token
          : null;
      const browserDeviceToken =
        cookieStore.get("examnest_device_token")?.value || null;

      if (
        activeDeviceToken &&
        (!browserDeviceToken || activeDeviceToken !== browserDeviceToken)
      ) {
        return null;
      }

      const accessToken = session?.access_token ?? null;
      const jwt = parseJwtPayload(accessToken);

      const meta = user.user_metadata ?? {};
      const phone =
        user.phone ||
        (typeof meta.phone_number === "string" ? meta.phone_number : null) ||
        jwt?.phone ||
        null;

      const fullName =
        (
          meta.full_name ||
          meta.name ||
          [meta.first_name, meta.last_name].filter(Boolean).join(" ") ||
          user.email?.split("@")[0] ||
          phone ||
          "Student"
        )
          .toString()
          .trim() || "Student";

      const firstName = fullName.split(/\s+/)[0] || "Student";
      const avatarUrl =
        typeof meta.avatar_url === "string"
          ? meta.avatar_url
          : typeof meta.picture === "string"
          ? meta.picture
          : null;

      return {
        id: user.id,
        email: user.email ?? "",
        phone,
        fullName,
        firstName,
        avatarUrl,
        emailConfirmedAt: user.email_confirmed_at ?? null,
        jwt,
        accessToken,
        rawUser: user,
      };
    } catch {
      return null;
    }
  }
);

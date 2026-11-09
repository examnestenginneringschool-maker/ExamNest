/**
 * RFC 7519 Standard + Supabase Auth JWT Claims Structure for ExamNest.
 */
export interface ExamNestJwtUserMetadata {
  full_name?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  active_device_token?: string | null;
  active_device_info?: string;
  active_login_at?: string;
  year?: number;
  [key: string]: unknown;
}

export interface ExamNestJwtPayload {
  /** Subject (Student's unique UUID in auth.users) */
  sub: string;
  /** Audience (e.g. "authenticated") */
  aud: string | string[];
  /** Expiration timestamp (Unix epoch seconds) */
  exp: number;
  /** Issued-at timestamp (Unix epoch seconds) */
  iat: number;
  /** Issuer URL (Supabase Auth endpoint) */
  iss?: string;
  /** Verified Student Email */
  email?: string;
  /** Verified Student Phone (E.164 format, e.g. +919876543210) */
  phone?: string;
  /** PostgreSQL RLS role ("authenticated") */
  role?: string;
  /** Authenticator Assurance Level ("aal1" | "aal2") */
  aal?: string;
  /** Authentication Methods References (e.g. [{ method: "otp", timestamp: ... }]) */
  amr?: Array<{ method: string; timestamp?: number }>;
  /** Unique Supabase Auth Session ID */
  session_id?: string;
  /** Custom Student Claims embedded inside the JWT */
  user_metadata?: ExamNestJwtUserMetadata;
  /** Provider & role metadata */
  app_metadata?: {
    provider?: string;
    providers?: string[];
    [key: string]: unknown;
  };
}

/**
 * Decodes and validates the structure and expiration (`exp`) of a 3-part RFC 7519 JWT
 * (`header.payload.signature`).
 */
export function parseJwtPayload(
  accessToken: string | null | undefined
): ExamNestJwtPayload | null {
  if (!accessToken || typeof accessToken !== "string") {
    return null;
  }

  const parts = accessToken.split(".");
  if (parts.length !== 3) {
    return null;
  }

  try {
    const payloadBase64Url = parts[1];
    if (!payloadBase64Url) return null;

    const jsonString =
      typeof Buffer !== "undefined"
        ? Buffer.from(payloadBase64Url, "base64url").toString("utf-8")
        : atob(payloadBase64Url.replace(/-/g, "+").replace(/_/g, "/"));

    const payload = JSON.parse(jsonString) as ExamNestJwtPayload;

    if (!payload || typeof payload.sub !== "string" || typeof payload.exp !== "number") {
      return null;
    }

    // Check token expiration (with 5-second clock skew tolerance)
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (payload.exp + 5 < nowSeconds) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}


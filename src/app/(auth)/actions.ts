"use server";

import crypto from "node:crypto";
import dns from "node:dns/promises";
import { cookies } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  DISPOSABLE_EMAIL_DOMAINS,
  DISPOSABLE_MX_PATTERNS,
  HIGH_ABUSE_BURNER_TLDS,
  emailSchema,
  isDisposableEmail,
} from "@/lib/validation/auth";

export type EmailSecurityResult = {
  allowed: boolean;
  reason?: string;
};

/**
 * Trusted major email providers and academic TLDs that do not need slow DNS/API checks.
 */
const TRUSTED_MAJOR_DOMAINS = new Set([
  "gmail.com",
  "google.com",
  "googlemail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "yahoo.com",
  "yahoo.co.in",
  "icloud.com",
  "me.com",
  "microsoft.com",
  "proton.me",
  "protonmail.com",
  "zoho.com",
  "zohomail.in",
  "rediffmail.com",
]);

function isTrustedAcademicDomain(domain: string): boolean {
  return (
    domain.endsWith(".edu") ||
    domain.endsWith(".edu.in") ||
    domain.endsWith(".ac.in") ||
    domain.endsWith(".ac.uk") ||
    domain.endsWith(".edu.au") ||
    domain.endsWith(".org.in")
  );
}

const DOMAIN_CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour TTL
const MAX_DOMAIN_CACHE_SIZE = 5000;

const domainSecurityCache = new Map<
  string,
  { result: EmailSecurityResult; expiresAt: number }
>();

const inFlightDomainChecks = new Map<string, Promise<EmailSecurityResult>>();

function getCachedDomainResult(domain: string): EmailSecurityResult | null {
  const cached = domainSecurityCache.get(domain);
  if (!cached) return null;
  if (Date.now() > cached.expiresAt) {
    domainSecurityCache.delete(domain);
    return null;
  }
  return cached.result;
}

function setCachedDomainResult(domain: string, result: EmailSecurityResult) {
  if (domainSecurityCache.size >= MAX_DOMAIN_CACHE_SIZE) {
    const oldestKey = domainSecurityCache.keys().next().value;
    if (oldestKey) domainSecurityCache.delete(oldestKey);
  }
  domainSecurityCache.set(domain, {
    result,
    expiresAt: Date.now() + DOMAIN_CACHE_TTL_MS,
  });
}

async function inspectCustomDomainOnServer(
  domain: string
): Promise<EmailSecurityResult> {
  // Layer 2: Live DNS MX Record Inspection (MX -> Mail Exchange)
  // Catches brand-new burner domains that point their MX records to temp-mail.org, mail.tm, inboxes.com, etc.
  try {
    const mxRecords = await Promise.race([
      dns.resolveMx(domain),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("DNS timeout")), 2500)
      ),
    ]);

    if (!mxRecords || mxRecords.length === 0) {
      return {
        allowed: false,
        reason:
          "This email domain does not have a valid mail server. Please use a valid email address.",
      };
    }

    for (const record of mxRecords) {
      const exchange = (record.exchange || "").toLowerCase().replace(/\.$/, "");

      if (!exchange) continue;

      // Check if the MX host itself is in the 100k+ disposable domain set
      if (DISPOSABLE_EMAIL_DOMAINS.has(exchange)) {
        return {
          allowed: false,
          reason:
            "Temporary or disposable email services are strictly blocked. Please use a valid personal or university email.",
        };
      }

      // Check parent domain of the MX server (e.g. mx1.temp-mail.org -> temp-mail.org) and MX TLD
      const mxParts = exchange.split(".");
      const mxTld = mxParts[mxParts.length - 1];
      if (mxTld && HIGH_ABUSE_BURNER_TLDS.has(mxTld)) {
        return {
          allowed: false,
          reason:
            "Temporary or disposable email services are strictly blocked. Please use a valid personal or university email.",
        };
      }

      for (let i = 1; i < mxParts.length - 1; i++) {
        const mxParent = mxParts.slice(i).join(".");
        if (DISPOSABLE_EMAIL_DOMAINS.has(mxParent)) {
          return {
            allowed: false,
            reason:
              "Temporary or disposable email services are strictly blocked. Please use a valid personal or university email.",
          };
        }
      }

      // Check against known disposable MX server fingerprints
      for (const pattern of DISPOSABLE_MX_PATTERNS) {
        if (exchange.includes(pattern)) {
          return {
            allowed: false,
            reason:
              "Temporary or disposable email services are strictly blocked. Please use a valid personal or university email.",
          };
        }
      }
    }
  } catch (err) {
    // If domain does not exist or has no mail records, reject immediately
    const code = (err as { code?: string })?.code;
    if (
      code === "ENOTFOUND" ||
      code === "ENODATA" ||
      code === "ESERVFAIL" ||
      code === "ENOTIMP" ||
      code === "EREFUSED"
    ) {
      return {
        allowed: false,
        reason:
          "This email domain cannot receive mail. Please enter a valid personal or university email.",
      };
    }
  }

  // Layer 3: Real-time zero-day disposable domain lookup via DeBounce + MailCheck APIs
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const [debounceRes, mailcheckRes] = await Promise.allSettled([
      fetch(
        `https://disposable.debounce.io/?email=${encodeURIComponent(`check@${domain}`)}`,
        {
          method: "GET",
          headers: { Accept: "application/json" },
          signal: controller.signal,
          cache: "force-cache",
        }
      ),
      fetch(`https://api.mailcheck.ai/domain/${encodeURIComponent(domain)}`, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: controller.signal,
        cache: "force-cache",
      }),
    ]);
    clearTimeout(timeout);

    if (debounceRes.status === "fulfilled" && debounceRes.value.ok) {
      const data = (await debounceRes.value.json()) as { disposable?: string };
      if (data.disposable === "true") {
        return {
          allowed: false,
          reason:
            "Temporary or disposable email services are strictly blocked. Please use a valid personal or university email.",
        };
      }
    }

    if (mailcheckRes.status === "fulfilled" && mailcheckRes.value.ok) {
      const data = (await mailcheckRes.value.json()) as {
        disposable?: boolean;
        mx?: boolean;
      };
      if (data.disposable === true || data.mx === false) {
        return {
          allowed: false,
          reason:
            "Temporary or disposable email services are strictly blocked. Please use a valid personal or university email.",
        };
      }
    }
  } catch {
    // If external API times out, rely on Layer 1 (100k+ list) + Layer 2 (MX server inspection)
  }

  return { allowed: true };
}

/**
 * Multi-layer server-side email security gatekeeper with in-memory TTL caching
 * and concurrent request coalescing (thundering-herd protection):
 * 1. Zod syntax + 100,000+ disposable domain blocklist + subdomain & keyword check (~0.01ms).
 * 2. Fast-path for mainstream & official university domains (~0.01ms).
 * 3. Bounded TTL cache + in-flight request deduplication for custom domains.
 * 4. Live DNS MX Record lookup + DeBounce / MailCheck API verification.
 */
export async function verifyEmailSecurityOnServer(
  rawEmail: string
): Promise<EmailSecurityResult> {
  const parsed = emailSchema.safeParse(rawEmail);
  if (!parsed.success) {
    return {
      allowed: false,
      reason:
        parsed.error.issues[0]?.message ||
        "Temporary or disposable email addresses are not allowed.",
    };
  }

  const email = parsed.data;
  const domain = email.split("@")[1];

  if (!domain || isDisposableEmail(email)) {
    return {
      allowed: false,
      reason:
        "Temporary or disposable email services are strictly blocked. Please use a valid personal or university email.",
    };
  }

  // Fast-path for trusted mainstream & official university domains (0 network calls)
  if (TRUSTED_MAJOR_DOMAINS.has(domain) || isTrustedAcademicDomain(domain)) {
    return { allowed: true };
  }

  // Check in-memory TTL cache first
  const cachedResult = getCachedDomainResult(domain);
  if (cachedResult) {
    return cachedResult;
  }

  // Deduplicate concurrent checks for the same custom domain (thundering-herd protection)
  const existingInFlight = inFlightDomainChecks.get(domain);
  if (existingInFlight) {
    return existingInFlight;
  }

  const checkPromise = inspectCustomDomainOnServer(domain)
    .then((result) => {
      setCachedDomainResult(domain, result);
      return result;
    })
    .finally(() => {
      inFlightDomainChecks.delete(domain);
    });

  inFlightDomainChecks.set(domain, checkPromise);
  return checkPromise;
}

/**
 * Registers the current browser/device as the sole active session for this user:
 * 1. Revokes all other sessions in Supabase (`signOut({ scope: "others" })`).
 * 2. Stamps a fresh cryptographic `active_device_token` into `user_metadata` and the browser cookie.
 * 3. Detects whether an existing session on another device/browser was just displaced.
 */
export async function registerSingleDeviceLogin(deviceInfo?: string): Promise<{
  deviceToken: string | null;
  replacedPreviousDevice: boolean;
}> {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { deviceToken: null, replacedPreviousDevice: false };
    }

    const cookieStore = await cookies();
    const existingDeviceCookie =
      cookieStore.get("examnest_device_token")?.value || null;
    const previousActiveToken =
      typeof user.user_metadata?.active_device_token === "string"
        ? user.user_metadata.active_device_token
        : null;
    const previousDeviceInfo =
      typeof user.user_metadata?.active_device_info === "string"
        ? user.user_metadata.active_device_info
        : "Previous Browser / Device";

    const replacedPreviousDevice = Boolean(
      previousActiveToken && previousActiveToken !== existingDeviceCookie
    );

    const newDeviceToken = crypto.randomUUID();
    const loginTimestamp = new Date().toISOString();

    // 1. Revoke all other device refresh tokens in Supabase Auth
    await supabase.auth.signOut({ scope: "others" }).catch(() => {});

    // 2. Stamp the new active_device_token onto the user's metadata
    await supabase.auth.updateUser({
      data: {
        active_device_token: newDeviceToken,
        active_device_info: deviceInfo || "Web Browser",
        active_login_at: loginTimestamp,
        year: new Date().getFullYear(),
      },
    });

    // 3. Persist the matching token in this browser's cookies
    cookieStore.set("examnest_device_token", newDeviceToken, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
      httpOnly: false,
    });

    // 4. If an existing session on another device was displaced, send security alert email
    if (replacedPreviousDevice && user.email) {
      const studentName =
        (
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email.split("@")[0] ||
          "Student"
        )
          .toString()
          .trim() || "Student";

      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        "https://examnestcollege.vercel.app";

      void import("@/lib/mail/security-alert")
        .then(({ sendSessionReplacedEmail }) =>
          sendSessionReplacedEmail({
            toEmail: user.email!,
            studentName,
            newDeviceRaw: deviceInfo || "Web Browser",
            previousDeviceRaw: previousDeviceInfo,
            loginTimeIso: loginTimestamp,
            siteUrl,
          })
        )
        .catch(() => {});
    }

    return {
      deviceToken: newDeviceToken,
      replacedPreviousDevice,
    };
  } catch {
    return { deviceToken: null, replacedPreviousDevice: false };
  }
}

/**
 * Clears the active device token when the student explicitly signs out.
 */
export async function clearSingleDeviceSession(): Promise<void> {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase.auth
        .updateUser({
          data: {
            active_device_token: null,
          },
        })
        .catch(() => {});
    }

    const cookieStore = await cookies();
    cookieStore.delete("examnest_device_token");
  } catch {
    // Ignore errors during sign-out cleanup
  }
}

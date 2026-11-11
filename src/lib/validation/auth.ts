import { z } from "zod";
import disposableDomainsList from "disposable-email-domains";

/**
 * Comprehensive set of 100,000+ known disposable/temporary email domains,
 * plus rotating temp-mail, mail.tm, temp-mail.org, and burner domains.
 */
export const DISPOSABLE_EMAIL_DOMAINS = new Set<string>([
  ...(disposableDomainsList as string[]),
  "tempmail.com",
  "temp-mail.org",
  "temp-mail.io",
  "tempmailo.com",
  "tempmail.net",
  "tempmail.plus",
  "10minutemail.com",
  "10minutemail.net",
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamailblock.com",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
  "trashmail.com",
  "sharklasers.com",
  "getnada.com",
  "nada.email",
  "throwawaymail.com",
  "fakeinbox.com",
  "maildrop.cc",
  "dispostable.com",
  "mailnesia.com",
  "mohmal.com",
  "mohmal.im",
  "mohmal.in",
  "emailondeck.com",
  "generator.email",
  "internxt.com",
  "inboxkitten.com",
  "burnermail.io",
  "mailsac.com",
  "crazymailing.com",
  "tempmailaddress.com",
  "tmpmail.net",
  "tmpmail.org",
  "moakt.com",
  "moakt.cc",
  "moakt.ws",
  "tmail.ws",
  "dropmail.me",
  "1secmail.com",
  "1secmail.org",
  "1secmail.net",
  "esiix.com",
  "wwjmp.com",
  "oosln.com",
  "vddaz.com",
  "bbitf.com",
  "bbitq.com",
  "bbitj.com",
  "dpptd.com",
  "dcpa.net",
  "cevipsa.com",
  "cpav3.com",
  "nuclene.com",
  "steveix.com",
  "mocvn.com",
  "tenvil.com",
  "tgvis.com",
  "amozix.com",
  "anypsd.com",
  "maxric.com",
]);

/**
 * Known disposable or burner MX mail-server host patterns.
 * Even when a temp-mail service registers a brand-new domain today,
 * its DNS MX records point to these underlying temp-mail servers.
 */
export const DISPOSABLE_MX_PATTERNS = [
  "temp-mail",
  "tempmail",
  "10minutemail",
  "guerrillamail",
  "mailinator",
  "yopmail",
  "maildrop",
  "getnada",
  "trashmail",
  "sharklasers",
  "mohmal",
  "1secmail",
  "dropmail",
  "mailsac",
  "fakeinbox",
  "inboxes.com",
  "mail.tm",
  "mail.gw",
  "erine.eu",
  "one-time.email",
  "emailondeck",
  "secmail",
  "burnermail",
  "forwardemail.net",
  "improvmx.com",
  "mx.cloudflare.net",
  "registrar-servers.com",
  "jellyfish.systems",
  "porkbun.com",
  "simplelogin",
  "anonaddy",
  "addy.io",
  "mozmail.com",
  "duck.com",
  "mailgun.org",
  "Inbound-smtp",
  "parkpage",
  "sedoparking",
  "above.com",
  "bodis.com",
  "wmail.ch",
  "tempmailo",
  "linshiyouxiang",
  "smailpro",
  "emailnator",
].map((p) => p.toLowerCase());

/**
 * High-abuse cheap/free top-level domains overwhelmingly used by rotating
 * zero-day temp-mail generators (temp-mail.org, mail.tm, 1secmail, smailpro).
 */
export const HIGH_ABUSE_BURNER_TLDS = new Set([
  "tk",
  "ml",
  "ga",
  "cf",
  "gq",
  "cfd",
  "sbs",
  "icu",
  "buzz",
  "monster",
  "rest",
  "lol",
  "click",
  "top",
  "xyz",
  "pw",
  "cyou",
  "Quest",
  "quest",
  "hair",
  "beauty",
  "skin",
  "makeup",
  "boats",
  "autos",
  "homes",
  "yachts",
  "mom",
  "bar",
  "uno",
  "cam",
  "fit",
  "lat",
  "vip",
  "work",
  "men",
  "date",
  "loan",
  "download",
  "racing",
  "review",
  "stream",
  "trade",
  "webcam",
  "win",
  "bid",
]);

/**
 * Suspicious keyword patterns in email domain names used by burner services.
 */
const SUSPICIOUS_DOMAIN_KEYWORDS = [
  "tempmail",
  "temp-mail",
  "tmp-mail",
  "tmpmail",
  "10minutemail",
  "minutemail",
  "throwaway",
  "trashmail",
  "fakemail",
  "fakeinbox",
  "burnermail",
  "guerrillamail",
  "mailinator",
  "yopmail",
  "disposable",
  "spambox",
  "dropmail",
  "1secmail",
  "emailnator",
  "gmailnator",
  "smailpro",
  "internxt",
  "mohmal",
  "mailpoof",
  "anonbox",
  "sharklasers",
  "pokemail",
  "grr.la",
  "guerrilla",
  "burner",
  "tempinbox",
  "tempmailo",
  "mailtemp",
  "emailtemp",
];

/**
 * Checks whether an email address belongs to a known disposable domain,
 * subdomain of a disposable domain, burner TLD, subaddressing alias,
 * or dot-stuffed Gmail generator (e.g. Emailnator / Gmailnator).
 */
export function isDisposableEmail(email: string): boolean {
  const parts = email.trim().toLowerCase().split("@");
  if (parts.length !== 2) return false;

  const [localPart, domain] = parts;
  if (!localPart || !domain || !domain.includes(".")) return true;

  // 0. Block '+' subaddressing aliases (e.g. bot+123@gmail.com) and Gmail dot-stuffing generators (e.g. a.b.c.d@gmail.com)
  if (localPart.includes("+")) {
    return true;
  }

  if (domain === "gmail.com" || domain === "googlemail.com") {
    const dotCount = (localPart.match(/\./g) || []).length;
    if (dotCount >= 3) {
      return true;
    }
  }

  // 1. Direct match against 100,000+ disposable domains
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return true;
  }

  // 2. Check parent domains (in case of subdomains like sub.mailinator.com) and TLD
  const labels = domain.split(".");
  const tld = labels[labels.length - 1];
  if (tld && HIGH_ABUSE_BURNER_TLDS.has(tld)) {
    return true;
  }

  for (let i = 1; i < labels.length - 1; i++) {
    const parentDomain = labels.slice(i).join(".");
    if (DISPOSABLE_EMAIL_DOMAINS.has(parentDomain)) {
      return true;
    }
  }

  // 3. Check suspicious burner keywords in the domain
  for (const kw of SUSPICIOUS_DOMAIN_KEYWORDS) {
    if (domain.includes(kw.trim())) {
      return true;
    }
  }

  return false;
}

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Please enter a valid email address.")
  .refine((val) => !isDisposableEmail(val), {
    message:
      "Temporary or disposable email services are strictly blocked. Please use a valid personal or university email.",
  });

/**
 * Normalizes a student phone number into E.164 format (defaulting 10-digit Indian mobile numbers to +91).
 */
export function normalizePhoneNumber(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");

  if (!digits) return "";

  // Standard 10-digit Indian mobile number (starts with 6, 7, 8, or 9)
  if (!hasPlus && digits.length === 10 && /^[6-9]\d{9}$/.test(digits)) {
    return `+91${digits}`;
  }

  // 11-digit number prefixed with 0 (e.g., 09876543210)
  if (!hasPlus && digits.length === 11 && /^0[6-9]\d{9}$/.test(digits)) {
    return `+91${digits.slice(1)}`;
  }

  // 12-digit number prefixed with 91 (e.g., 919876543210)
  if (digits.length === 12 && /^91[6-9]\d{9}$/.test(digits)) {
    return `+${digits}`;
  }

  // E.164 international format
  return `+${digits}`;
}

/**
 * Validates whether a raw string is a valid mobile phone number.
 */
export function isValidPhoneNumber(raw: string): boolean {
  const normalized = normalizePhoneNumber(raw);
  // If +91 (India), enforce valid 10-digit mobile starting with 6-9
  if (normalized.startsWith("+91")) {
    return /^\+91[6-9]\d{9}$/.test(normalized);
  }
  // Standard E.164 international mobile number (10 to 15 digits total)
  return /^\+[1-9]\d{9,14}$/.test(normalized);
}

/**
 * Detects whether a user login identifier is an Email ID or a Phone Number.
 */
export function detectIdentifierType(raw: string): "email" | "phone" {
  const trimmed = raw.trim();
  if (trimmed.includes("@") || /[a-zA-Z]/.test(trimmed)) {
    return "email";
  }
  return "phone";
}

export const phoneSchema = z
  .string()
  .trim()
  .min(10, "Please enter a valid 10-digit mobile number.")
  .refine((val) => isValidPhoneNumber(val), {
    message:
      "Please enter a valid 10-digit mobile number (e.g. +91 98765 43210).",
  })
  .transform((val) => normalizePhoneNumber(val));

export const loginIdentifierSchema = z
  .string()
  .trim()
  .min(1, "Please enter your email address or phone number.")
  .superRefine((val, ctx) => {
    const type = detectIdentifierType(val);
    if (type === "email") {
      const emailRes = emailSchema.safeParse(val);
      if (!emailRes.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            emailRes.error.issues[0]?.message ||
            "Please enter a valid email address.",
        });
      }
    } else {
      if (!isValidPhoneNumber(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Please enter a valid 10-digit mobile number or email address.",
        });
      }
    }
  });

export const passwordSignUpSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(72, "Password must be 72 characters or fewer.")
  .refine((val) => /[A-Z]/.test(val), {
    message: "Password must include at least one uppercase letter.",
  })
  .refine((val) => /[a-z]/.test(val), {
    message: "Password must include at least one lowercase letter.",
  })
  .refine((val) => /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(val), {
    message: "Password must include at least one number or symbol.",
  });

export const signUpSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters.")
    .max(60, "Full name must be 60 characters or fewer.")
    .regex(/^[a-zA-Z\s.'-]+$/, "Full name can only contain letters and spaces."),
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSignUpSchema,
});

export const signInSchema = z.object({
  identifier: loginIdentifierSchema,
  password: z.string().min(6, "Invalid credentials or password."),
});

export const otpVerifySchema = z.object({
  identifier: loginIdentifierSchema,
  token: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Verification code must be 6 digits."),
});

export const resetPasswordSchema = z
  .object({
    password: passwordSignUpSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export interface PasswordStrengthInfo {
  score: number;
  text: string;
  colorClass: string;
  barColorClass: string;
}

export function getPasswordStrengthInfo(
  password: string
): PasswordStrengthInfo | null {
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
      score: 1,
      text: "Weak · Must be at least 8 characters",
      colorClass: "text-rose-500",
      barColorClass: "bg-rose-500",
    };
  }

  if (score <= 2) {
    return {
      score: 2,
      text: "Weak · Add uppercase, number, or symbol",
      colorClass: "text-rose-500",
      barColorClass: "bg-rose-500",
    };
  }

  if (score === 3) {
    return {
      score: 3,
      text: "Good · Almost strong password",
      colorClass: "text-amber-500",
      barColorClass: "bg-amber-500",
    };
  }

  return {
    score: 4,
    text: "Strong password",
    colorClass: "text-emerald-600",
    barColorClass: "bg-emerald-500",
  };
}

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
  password: passwordSignUpSchema,
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, "Invalid email or password."),
});

export const otpVerifySchema = z.object({
  email: emailSchema,
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

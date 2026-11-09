import { describe, expect, it } from "vitest";
import {
  buildSessionReplacedEmailHtml,
  formatDeviceLabel,
} from "@/lib/mail/security-alert";
import { parseJwtPayload } from "@/lib/supabase/jwt";
import {
  detectIdentifierType,
  isDisposableEmail,
  normalizePhoneNumber,
  otpVerifySchema,
  signInSchema,
  signUpSchema,
} from "@/lib/validation/auth";

describe("Authentication Security & Zod Schemas", () => {
  it("blocks disposable, rotating temp-mail, burner TLDs, subaddressing, and dot-stuffed emails", () => {
    // Classic disposable domains
    expect(isDisposableEmail("student@tempmail.com")).toBe(true);
    expect(isDisposableEmail("user@10minutemail.com")).toBe(true);
    expect(isDisposableEmail("bot@yopmail.com")).toBe(true);

    // Rotating temp-mail.org / 1secmail / mail.tm / guerrilla domains from 100k+ registry
    expect(isDisposableEmail("test@sharklasers.com")).toBe(true);
    expect(isDisposableEmail("test@guerrillamailblock.com")).toBe(true);
    expect(isDisposableEmail("test@1secmail.com")).toBe(true);
    expect(isDisposableEmail("test@maildrop.cc")).toBe(true);
    expect(isDisposableEmail("sub.user@sub.mailinator.com")).toBe(true);

    // Zero-day high-abuse burner TLDs (.cfd, .sbs, .icu, .xyz, .top, .click, .tk)
    expect(isDisposableEmail("user@random-domain-2026.cfd")).toBe(true);
    expect(isDisposableEmail("user@newburner.sbs")).toBe(true);
    expect(isDisposableEmail("user@freshmail.icu")).toBe(true);
    expect(isDisposableEmail("user@throwaway123.xyz")).toBe(true);
    expect(isDisposableEmail("user@instantbox.top")).toBe(true);

    // Plus-subaddressing aliases & Emailnator/Gmailnator dot-stuffing tricks
    expect(isDisposableEmail("student+spam1@gmail.com")).toBe(true);
    expect(isDisposableEmail("s.a.y.a.n.t.a.n@gmail.com")).toBe(true);

    // Valid academic and personal domains
    expect(isDisposableEmail("scholar@makaut.ac.in")).toBe(false);
    expect(isDisposableEmail("sayantan@gmail.com")).toBe(false);
    expect(isDisposableEmail("sayantan.das@gmail.com")).toBe(false);
    expect(isDisposableEmail("student@iem.edu.in")).toBe(false);
  });

  it("validates strong sign-up credentials with mandatory phone number and normalizes email & E.164 phone", () => {
    const result = signUpSchema.safeParse({
      fullName: "Sayantan Das",
      email: "  Sayantan.Das@University.edu.in ",
      phone: "98765 43210",
      password: "StrongPassword#2026",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("sayantan.das@university.edu.in");
      expect(result.data.phone).toBe("+919876543210");
      expect(result.data.fullName).toBe("Sayantan Das");
    }

    // Missing or invalid phone number on sign-up must fail
    const missingPhone = signUpSchema.safeParse({
      fullName: "Sayantan Das",
      email: "sayantan@university.edu.in",
      phone: "12345",
      password: "StrongPassword#2026",
    });
    expect(missingPhone.success).toBe(false);
  });

  it("rejects weak passwords or disposable emails on sign-up", () => {
    const weakPwd = signUpSchema.safeParse({
      fullName: "Sayantan Das",
      email: "sayantan@gmail.com",
      phone: "+919876543210",
      password: "weakpassword", // no uppercase or number/symbol
    });
    expect(weakPwd.success).toBe(false);

    const tempEmail = signUpSchema.safeParse({
      fullName: "Sayantan Das",
      email: "bot@mailinator.com",
      phone: "+919876543210",
      password: "StrongPassword#2026",
    });
    expect(tempEmail.success).toBe(false);
  });

  it("validates 6-digit OTP codes for both Email ID and Phone Number identifiers", () => {
    expect(
      otpVerifySchema.safeParse({
        identifier: "student@college.edu",
        token: "482910",
      }).success
    ).toBe(true);

    expect(
      otpVerifySchema.safeParse({
        identifier: "+91 98765 43210",
        token: "482910",
      }).success
    ).toBe(true);

    expect(
      otpVerifySchema.safeParse({
        identifier: "student@college.edu",
        token: "12345",
      }).success
    ).toBe(false);

    expect(
      otpVerifySchema.safeParse({
        identifier: "student@college.edu",
        token: "12ab56",
      }).success
    ).toBe(false);
  });

  it("validates sign-in inputs for both Email ID and Phone Number cleanly", () => {
    expect(detectIdentifierType("student@college.edu")).toBe("email");
    expect(detectIdentifierType("+91 98765 43210")).toBe("phone");
    expect(normalizePhoneNumber("09876543210")).toBe("+919876543210");

    expect(
      signInSchema.safeParse({
        identifier: "student@college.edu",
        password: "secretpassword",
      }).success
    ).toBe(true);

    expect(
      signInSchema.safeParse({
        identifier: "9876543210",
        password: "secretpassword",
      }).success
    ).toBe(true);
  });

  it("decodes and validates RFC 7519 JWT payload structure and expiration", () => {
    const header = Buffer.from(
      JSON.stringify({ alg: "HS256", typ: "JWT" })
    ).toString("base64url");
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    const payload = Buffer.from(
      JSON.stringify({
        sub: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        aud: "authenticated",
        exp: futureExp,
        iat: futureExp - 3600,
        email: "scholar@makaut.ac.in",
        phone: "+919876543210",
        role: "authenticated",
        user_metadata: {
          full_name: "Sayantan Das",
          phone_number: "+919876543210",
        },
      })
    ).toString("base64url");
    const token = `${header}.${payload}.signature_part`;

    const decoded = parseJwtPayload(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.sub).toBe("f47ac10b-58cc-4372-a567-0e02b2c3d479");
    expect(decoded?.email).toBe("scholar@makaut.ac.in");
    expect(decoded?.user_metadata?.phone_number).toBe("+919876543210");

    // Expired JWT must return null
    const expiredPayload = Buffer.from(
      JSON.stringify({
        sub: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        aud: "authenticated",
        exp: Math.floor(Date.now() / 1000) - 600,
        iat: Math.floor(Date.now() / 1000) - 4200,
      })
    ).toString("base64url");
    expect(parseJwtPayload(`${header}.${expiredPayload}.sig`)).toBeNull();
  });

  it("formats device user-agent labels and generates single-device alert email HTML", () => {
    expect(
      formatDeviceLabel(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36"
      )
    ).toBe("Google Chrome on Windows");

    expect(
      formatDeviceLabel(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0"
      )
    ).toBe("Microsoft Edge on Windows");

    const html = buildSessionReplacedEmailHtml({
      toEmail: "scholar@makaut.ac.in",
      studentName: "Sayantan Das",
      newDeviceRaw: "Mozilla/5.0 (Linux; Android 14) Chrome/131.0.0.0",
      previousDeviceRaw: "Mozilla/5.0 (Windows NT 10.0) Edg/131.0.0.0",
      loginTimeIso: "2026-11-01T13:30:00.000Z",
      siteUrl: "https://examnestcollege.vercel.app",
    });

    expect(html).toContain("New device sign-in detected");
    expect(html).toContain("Previous Session Expired");
    expect(html).toContain("Google Chrome on Android");
    expect(html).toContain("Microsoft Edge on Windows");
    expect(html).toContain("https://examnestcollege.vercel.app/logo.png");
  });
});

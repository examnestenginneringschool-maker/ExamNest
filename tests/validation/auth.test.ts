import { describe, expect, it } from "vitest";
import {
  isDisposableEmail,
  otpVerifySchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "@/lib/validation/auth";

describe("Authentication Security & Zod Schemas", () => {
  it("blocks disposable and temporary email domains", () => {
    expect(isDisposableEmail("student@tempmail.com")).toBe(true);
    expect(isDisposableEmail("user@10minutemail.com")).toBe(true);
    expect(isDisposableEmail("scholar@makaut.ac.in")).toBe(false);
    expect(isDisposableEmail("sayantan@gmail.com")).toBe(false);
  });

  it("validates strong sign-up credentials and normalizes email", () => {
    const result = signUpSchema.safeParse({
      fullName: "Sayantan Das",
      email: "  Sayantan.Das@University.edu.in ",
      password: "StrongPassword#2026",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("sayantan.das@university.edu.in");
      expect(result.data.fullName).toBe("Sayantan Das");
    }
  });

  it("rejects weak passwords or disposable emails on sign-up", () => {
    const weakPwd = signUpSchema.safeParse({
      fullName: "Sayantan Das",
      email: "sayantan@gmail.com",
      password: "weakpassword", // no uppercase or number/symbol
    });
    expect(weakPwd.success).toBe(false);

    const tempEmail = signUpSchema.safeParse({
      fullName: "Sayantan Das",
      email: "bot@mailinator.com",
      password: "StrongPassword#2026",
    });
    expect(tempEmail.success).toBe(false);
  });

  it("validates 6-digit OTP codes strictly", () => {
    expect(
      otpVerifySchema.safeParse({
        email: "student@college.edu",
        token: "482910",
      }).success
    ).toBe(true);

    expect(
      otpVerifySchema.safeParse({
        email: "student@college.edu",
        token: "12345",
      }).success
    ).toBe(false);

    expect(
      otpVerifySchema.safeParse({
        email: "student@college.edu",
        token: "12ab56",
      }).success
    ).toBe(false);
  });

  it("validates sign-in inputs cleanly", () => {
    expect(
      signInSchema.safeParse({
        email: "student@college.edu",
        password: "secretpassword",
      }).success
    ).toBe(true);
  });

  it("validates resetPasswordSchema for matching passwords and security criteria", () => {
    // Valid matching strong passwords
    const valid = resetPasswordSchema.safeParse({
      password: "NewStrongPassword#2026",
      confirmPassword: "NewStrongPassword#2026",
    });
    expect(valid.success).toBe(true);

    // Mismatched passwords
    const mismatch = resetPasswordSchema.safeParse({
      password: "NewStrongPassword#2026",
      confirmPassword: "DifferentPassword#2026",
    });
    expect(mismatch.success).toBe(false);

    // Weak password
    const weak = resetPasswordSchema.safeParse({
      password: "weak",
      confirmPassword: "weak",
    });
    expect(weak.success).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { getPasswordStrengthInfo } from "@/lib/validation/auth";
import {
  avatarUrlSchema,
  changePasswordInProfileSchema,
  feedbackSchema,
  fullNameSchema,
} from "@/lib/validation/profile";

describe("Student Profile Validation & Security Helpers", () => {
  it("validates display full names safely", () => {
    expect(fullNameSchema.safeParse("Sayantan Das").success).toBe(true);
    expect(fullNameSchema.safeParse("Dr. A. P. J. Kalam").success).toBe(true);
    expect(fullNameSchema.safeParse("O'Connor").success).toBe(true);

    expect(fullNameSchema.safeParse("A").success).toBe(false);
    expect(fullNameSchema.safeParse("Student123").success).toBe(false);
    expect(fullNameSchema.safeParse("<script>alert(1)</script>").success).toBe(
      false
    );
  });

  it("validates safe avatar URLs and compact inline WebP/JPEG/PNG data URLs", () => {
    expect(avatarUrlSchema.safeParse(null).success).toBe(true);
    expect(avatarUrlSchema.safeParse("").success).toBe(true);
    expect(
      avatarUrlSchema.safeParse(
        "https://abc.supabase.co/storage/v1/object/public/avatars/u1/avatar.webp"
      ).success
    ).toBe(true);
    expect(
      avatarUrlSchema.safeParse("data:image/webp;base64,UklGRh4AAABXRUJQVlA4")
        .success
    ).toBe(true);

    // Reject javascript: / http external / SVG XSS / oversized strings
    expect(avatarUrlSchema.safeParse("javascript:alert(1)").success).toBe(
      false
    );
    expect(
      avatarUrlSchema.safeParse("data:image/svg+xml;base64,PHN2Zz4=").success
    ).toBe(false);
    expect(
      avatarUrlSchema.safeParse("http://insecure.example.com/pic.jpg").success
    ).toBe(false);
    expect(
      avatarUrlSchema.safeParse(
        `data:image/webp;base64,${"A".repeat(7000)}`
      ).success
    ).toBe(false);
  });

  it("enforces strong password rules and rejects reusing current password", () => {
    const valid = changePasswordInProfileSchema.safeParse({
      currentPassword: "OldPassword#1",
      newPassword: "NewStrongPassword#2",
      confirmPassword: "NewStrongPassword#2",
    });
    expect(valid.success).toBe(true);

    const samePassword = changePasswordInProfileSchema.safeParse({
      currentPassword: "OldPassword#1",
      newPassword: "OldPassword#1",
      confirmPassword: "OldPassword#1",
    });
    expect(samePassword.success).toBe(false);

    const mismatch = changePasswordInProfileSchema.safeParse({
      currentPassword: "OldPassword#1",
      newPassword: "NewStrongPassword#2",
      confirmPassword: "DifferentPassword#3",
    });
    expect(mismatch.success).toBe(false);

    const weak = changePasswordInProfileSchema.safeParse({
      currentPassword: "OldPassword#1",
      newPassword: "weak",
      confirmPassword: "weak",
    });
    expect(weak.success).toBe(false);
  });

  it("validates pre-launch student feedback payloads", () => {
    expect(
      feedbackSchema.safeParse({
        category: "syllabus",
        message: "Unit 3 notes in Engineering Maths are missing Laplace examples.",
        pagePath: "/app/subjects/123",
      }).success
    ).toBe(true);

    expect(
      feedbackSchema.safeParse({
        category: "bug",
        message: "too short",
      }).success
    ).toBe(false);
  });

  it("computes password strength tiers accurately", () => {
    expect(getPasswordStrengthInfo("")).toBeNull();
    expect(getPasswordStrengthInfo("abc")?.score).toBe(1);
    expect(getPasswordStrengthInfo("abcdefgh")?.score).toBe(2);
    expect(getPasswordStrengthInfo("Abcdefgh")?.score).toBe(3);
    expect(getPasswordStrengthInfo("Abcdefg1")?.score).toBe(4);
  });
});

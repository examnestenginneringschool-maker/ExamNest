import { describe, expect, it } from "vitest";
import {
  entityIdSchema,
  completeOnboardingSchema,
  fullAcademicProfileSchema,
} from "@/lib/validation/onboarding";

describe("Onboarding Zod Validation Schemas", () => {
  describe("entityIdSchema", () => {
    it("accepts valid non-empty string IDs", () => {
      const result = entityIdSchema.safeParse("uni-12345");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("uni-12345");
      }
    });

    it("trims whitespace from input IDs", () => {
      const result = entityIdSchema.safeParse("   college-uuid-999   ");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("college-uuid-999");
      }
    });

    it("rejects empty strings", () => {
      const result = entityIdSchema.safeParse("");
      expect(result.success).toBe(false);
    });

    it("rejects whitespace-only strings", () => {
      const result = entityIdSchema.safeParse("    ");
      expect(result.success).toBe(false);
    });
  });

  describe("completeOnboardingSchema", () => {
    it("validates valid semester and department IDs", () => {
      const result = completeOnboardingSchema.safeParse({
        semesterId: "sem-1",
        collegeCourseDepartmentId: "ccd-2",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.semesterId).toBe("sem-1");
        expect(result.data.collegeCourseDepartmentId).toBe("ccd-2");
      }
    });

    it("rejects missing fields", () => {
      const result = completeOnboardingSchema.safeParse({
        semesterId: "sem-1",
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty string values", () => {
      const result = completeOnboardingSchema.safeParse({
        semesterId: "sem-1",
        collegeCourseDepartmentId: "   ",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("fullAcademicProfileSchema", () => {
    it("passes when all 5 selections are provided", () => {
      const validProfile = {
        universityId: "uni-1",
        collegeId: "col-2",
        collegeCourseId: "course-3",
        collegeCourseDepartmentId: "dept-4",
        semesterId: "sem-5",
      };

      const result = fullAcademicProfileSchema.safeParse(validProfile);
      expect(result.success).toBe(true);
    });

    it("fails when any selection is missing or empty", () => {
      const incompleteProfile = {
        universityId: "uni-1",
        collegeId: "col-2",
        collegeCourseId: "",
        collegeCourseDepartmentId: "dept-4",
        semesterId: "sem-5",
      };

      const result = fullAcademicProfileSchema.safeParse(incompleteProfile);
      expect(result.success).toBe(false);
    });
  });
});

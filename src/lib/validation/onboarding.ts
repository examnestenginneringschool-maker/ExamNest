import { z } from "zod";

export const entityIdSchema = z
  .string()
  .trim()
  .min(1, "Identifier cannot be empty.");

export const completeOnboardingSchema = z.object({
  semesterId: z.string().trim().min(1, "Please select a valid semester."),
  collegeCourseDepartmentId: z
    .string()
    .trim()
    .min(1, "Please select a valid department."),
});

export const fullAcademicProfileSchema = z.object({
  universityId: z.string().trim().min(1, "Please select a university."),
  collegeId: z.string().trim().min(1, "Please select your college."),
  collegeCourseId: z.string().trim().min(1, "Please select your course or degree."),
  collegeCourseDepartmentId: z
    .string()
    .trim()
    .min(1, "Please select your department / specialization."),
  semesterId: z.string().trim().min(1, "Please select your current semester."),
});

export type CompleteOnboardingInput = z.infer<typeof completeOnboardingSchema>;
export type FullAcademicProfileInput = z.infer<typeof fullAcademicProfileSchema>;

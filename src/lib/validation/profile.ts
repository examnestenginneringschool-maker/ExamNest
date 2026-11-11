import { z } from "zod";
import { passwordSignUpSchema } from "./auth";

export const fullNameSchema = z
  .string()
  .trim()
  .min(2, "Full name must be at least 2 characters.")
  .max(60, "Full name must be 60 characters or fewer.")
  .regex(
    /^[a-zA-Z\s.'-]+$/,
    "Full name can only contain letters, spaces, dots, hyphens, and apostrophes."
  );

const MAX_INLINE_AVATAR_DATA_URL_LENGTH = 6000;

export const avatarUrlSchema = z
  .string()
  .trim()
  .nullable()
  .refine(
    (val) => {
      if (val === null || val === "") return true;
      if (
        /^(https:\/\/|http:\/\/(localhost|127\.0\.0\.1)[:/])[^\s]+$/i.test(
          val
        ) &&
        val.length <= 2048
      ) {
        return true;
      }
      if (
        /^data:image\/(webp|jpeg|png);base64,[A-Za-z0-9+/=]+$/.test(val) &&
        val.length <= MAX_INLINE_AVATAR_DATA_URL_LENGTH
      ) {
        return true;
      }
      return false;
    },
    {
      message: "Invalid or oversized profile image format.",
    }
  );

export const changePasswordInProfileSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Please enter your current password."),
    newPassword: passwordSignUpSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match.",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from your current password.",
    path: ["newPassword"],
  });

export const FEEDBACK_CATEGORIES = [
  "syllabus",
  "bug",
  "feature",
  "other",
] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

export const feedbackSchema = z.object({
  category: z.enum(FEEDBACK_CATEGORIES, {
    message: "Please choose a feedback category.",
  }),
  message: z
    .string()
    .trim()
    .min(10, "Please include at least 10 characters so we can act on this.")
    .max(1500, "Feedback message must be 1,500 characters or fewer."),
  pagePath: z.string().trim().max(256).optional(),
});

export type ChangePasswordInProfileInput = z.infer<
  typeof changePasswordInProfileSchema
>;
export type FeedbackInput = z.infer<typeof feedbackSchema>;

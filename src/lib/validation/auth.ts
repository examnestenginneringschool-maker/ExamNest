import { z } from "zod";

export const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "tempmail.com",
  "10minutemail.com",
  "mailinator.com",
  "guerrillamail.com",
  "yopmail.com",
  "trashmail.com",
  "sharklasers.com",
  "getnada.com",
  "temp-mail.org",
  "throwawaymail.com",
  "fakeinbox.com",
  "maildrop.cc",
  "dispostable.com",
]);

export function isDisposableEmail(email: string): boolean {
  const parts = email.trim().toLowerCase().split("@");
  if (parts.length !== 2) return false;
  return DISPOSABLE_EMAIL_DOMAINS.has(parts[1]);
}

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Please enter a valid email address.")
  .refine((val) => !isDisposableEmail(val), {
    message: "Temporary or disposable email addresses are not allowed.",
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

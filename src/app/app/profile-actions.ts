"use server";

import { revalidatePath } from "next/cache";
import nodemailer from "nodemailer";
import { completeOnboarding } from "@/app/onboarding/actions";
import { getStudentAcademicContext } from "@/lib/academic/student-context";
import { PLATFORM_INFO } from "@/lib/legal/navigation";
import {
  createServerSupabaseClient,
  getAuthenticatedUser,
} from "@/lib/supabase/server";
import {
  avatarUrlSchema,
  feedbackSchema,
  fullNameSchema,
  type FeedbackCategory,
} from "@/lib/validation/profile";

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  syllabus: "Syllabus / Notes Issue",
  bug: "Bug Report",
  feature: "Feature Suggestion",
  other: "General Question / Feedback",
};

export async function updateStudentDisplayName(rawName: string): Promise<{
  success: boolean;
  fullName?: string;
  firstName?: string;
  error?: string;
}> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { success: false, error: "Your session expired. Please sign in again." };
  }

  const parsed = fullNameSchema.safeParse(rawName);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid full name.",
    };
  }

  const fullName = parsed.data.replace(/\s+/g, " ").trim();
  const firstName = fullName.split(/\s+/)[0] || "Student";

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.updateUser({
    data: {
      full_name: fullName,
      first_name: firstName,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/app", "layout");
  return { success: true, fullName, firstName };
}

export async function updateStudentAvatar(rawAvatarUrl: string | null): Promise<{
  success: boolean;
  avatarUrl?: string | null;
  error?: string;
}> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { success: false, error: "Your session expired. Please sign in again." };
  }

  const parsed = avatarUrlSchema.safeParse(rawAvatarUrl);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid avatar image.",
    };
  }

  const nextUrl = parsed.data && parsed.data.length > 0 ? parsed.data : null;

  const supabase = await createServerSupabaseClient();

  if (!nextUrl) {
    // Purge avatar files from Supabase Storage bucket so no orphans remain
    await supabase.storage
      .from("avatars")
      .remove([
        `${user.id}/avatar.webp`,
        `${user.id}/avatar.jpg`,
        `${user.id}/avatar.png`,
      ])
      .catch(() => {});
  }

  const { error } = await supabase.auth.updateUser({
    data: {
      avatar_url: nextUrl ?? "",
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/app", "layout");
  return { success: true, avatarUrl: nextUrl };
}

export async function updateStudentAcademicStream(
  semesterId: string,
  collegeCourseDepartmentId: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await completeOnboarding(semesterId, collegeCourseDepartmentId);
    revalidatePath("/app", "layout");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Could not update academic details.",
    };
  }
}

export async function submitStudentFeedback(input: {
  category: FeedbackCategory;
  message: string;
  pagePath?: string;
}): Promise<{
  success: boolean;
  error?: string;
  fallbackMailto?: string;
}> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { success: false, error: "Your session expired. Please sign in again." };
  }

  const parsed = feedbackSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Please check your feedback input.",
    };
  }

  const { category, message, pagePath } = parsed.data;
  const categoryLabel = CATEGORY_LABELS[category];
  const academic = await getStudentAcademicContext(user.id).catch(() => null);

  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = Number(process.env.SMTP_PORT || "587");
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const recipient = process.env.FEEDBACK_EMAIL || smtpUser;

  const subjectLine = `[ExamNest Beta · ${categoryLabel}] from ${user.fullName}`;
  const fallbackMailto = `mailto:${PLATFORM_INFO.emails.support}?subject=${encodeURIComponent(
    subjectLine
  )}&body=${encodeURIComponent(
    `Student: ${user.fullName} (${user.email})\nAcademic: ${
      academic
        ? `${academic.university.short_name || academic.university.name} · ${academic.college.name} · ${academic.course.short_name || academic.course.name} ${academic.department.short_name} Sem ${academic.semester.semester_number}`
        : "Not set"
    }\nPage: ${pagePath || "/app"}\n\n${message}`
  )}`;

  if (!smtpUser || !smtpPass || !recipient) {
    return {
      success: false,
      error: "Direct mailer is not configured in this environment.",
      fallbackMailto,
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const academicSummary = academic
      ? `${academic.university.short_name || academic.university.name} · ${academic.college.name} · ${academic.course.short_name || academic.course.name} (${academic.department.short_name}) · Semester ${academic.semester.semester_number}`
      : "Not available";

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #faf8ff; border: 1px solid #e2e8f0; border-radius: 16px;">
        <div style="font-size: 11px; font-weight: 800; color: #5B4DFF; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">
          ExamNest Early Student Feedback
        </div>
        <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #171b2a;">${escapeHtml(categoryLabel)}</h2>
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 16px; white-space: pre-wrap; font-size: 14px; color: #1e293b; line-height: 1.6;">${escapeHtml(message)}</div>
        <table style="width: 100%; font-size: 12px; color: #475569; border-collapse: collapse;">
          <tr><td style="padding: 4px 0; font-weight: 600;">Student:</td><td>${escapeHtml(user.fullName)} (${escapeHtml(user.email || user.phone || user.id)})</td></tr>
          <tr><td style="padding: 4px 0; font-weight: 600;">Academic Stream:</td><td>${escapeHtml(academicSummary)}</td></tr>
          <tr><td style="padding: 4px 0; font-weight: 600;">Route:</td><td>${escapeHtml(pagePath || "/app")}</td></tr>
          <tr><td style="padding: 4px 0; font-weight: 600;">Timestamp:</td><td>${escapeHtml(new Date().toISOString())}</td></tr>
        </table>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || `ExamNest Feedback <${smtpUser}>`,
      to: recipient,
      replyTo: user.email || undefined,
      subject: subjectLine,
      html,
    });

    return { success: true };
  } catch (err) {
    console.error(
      "[ExamNest Feedback] Failed to deliver feedback email:",
      err instanceof Error ? err.message : err
    );
    return {
      success: false,
      error: "Unable to send feedback right now.",
      fallbackMailto,
    };
  }
}

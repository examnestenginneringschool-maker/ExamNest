"use server";

import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  completeOnboardingSchema,
  entityIdSchema,
} from "@/lib/validation/onboarding";

export async function getUniversities() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("universities")
    .select("id, name, short_name")
    .eq("is_active", true)
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getColleges(universityId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const validatedId = entityIdSchema.safeParse(universityId);
  if (!validatedId.success) {
    throw new Error("Invalid university identifier");
  }

  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("colleges")
    .select("id, name")
    .eq("university_id", validatedId.data)
    .eq("is_active", true)
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getCourses(collegeId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const validatedId = entityIdSchema.safeParse(collegeId);
  if (!validatedId.success) {
    throw new Error("Invalid college identifier");
  }

  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("college_courses")
    .select(`
      id,
      course:courses (
        id,
        name,
        short_name
      )
    `)
    .eq("college_id", validatedId.data)
    .eq("is_active", true);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((item) => {
    const course = Array.isArray(item.course)
      ? item.course[0] ?? null
      : item.course;

    return {
      id: item.id,
      course,
    };
  });
}

export async function getDepartments(collegeCourseId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const validatedId = entityIdSchema.safeParse(collegeCourseId);
  if (!validatedId.success) {
    throw new Error("Invalid course identifier");
  }

  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("college_course_departments")
    .select(`
      id,
      department:departments (
        id,
        name,
        short_name
      )
    `)
    .eq("college_course_id", validatedId.data)
    .eq("is_active", true);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((item) => {
    const department = Array.isArray(item.department)
      ? item.department[0] ?? null
      : item.department;

    return {
      id: item.id,
      department,
    };
  });
}

export async function getSemesters(collegeCourseId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const validatedId = entityIdSchema.safeParse(collegeCourseId);
  if (!validatedId.success) {
    throw new Error("Invalid course identifier");
  }

  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("semesters")
    .select("id, semester_number, name")
    .eq("college_course_id", validatedId.data)
    .eq("is_active", true)
    .order("semester_number");

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function completeOnboarding(
  semesterId: string,
  collegeCourseDepartmentId: string
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const validation = completeOnboardingSchema.safeParse({
    semesterId,
    collegeCourseDepartmentId,
  });

  if (!validation.success) {
    const message =
      validation.error.issues[0]?.message || "Invalid onboarding academic input.";
    throw new Error(message);
  }

  const validatedData = validation.data;
  const supabase = createServerSupabaseClient();
  const timestamp = new Date().toISOString();

  // 1. Ensure base user profile exists first.
  // Foreign key constraint `student_profiles_user_id_fkey` requires a parent row in `profiles(user_id)`.
  const { error: baseProfileError } = await supabase
    .from("profiles")
    .upsert(
      {
        user_id: userId,
        onboarding_completed: false,
      },
      {
        onConflict: "user_id",
        ignoreDuplicates: true,
      }
    );

  if (baseProfileError) {
    throw new Error(`Profile initialization failed: ${baseProfileError.message}`);
  }

  // 2. Upsert student academic profile
  const { error: studentProfileError } = await supabase
    .from("student_profiles")
    .upsert(
      {
        user_id: userId,
        semester_id: validatedData.semesterId,
        college_course_department_id: validatedData.collegeCourseDepartmentId,
        updated_at: timestamp,
      },
      {
        onConflict: "user_id",
      }
    );

  if (studentProfileError) {
    throw new Error(`Academic profile setup failed: ${studentProfileError.message}`);
  }

  // 3. Mark onboarding as completed only after student academic record is verified
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(
      {
        user_id: userId,
        onboarding_completed: true,
        updated_at: timestamp,
      },
      {
        onConflict: "user_id",
      }
    );

  if (profileError) {
    throw new Error(`Completing onboarding failed: ${profileError.message}`);
  }

  return {
    success: true,
  };
}
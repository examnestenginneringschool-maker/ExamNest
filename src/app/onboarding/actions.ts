"use server";

import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getUniversities() {
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
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("colleges")
    .select("id, name")
    .eq("university_id", universityId)
    .eq("is_active", true)
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getCourses(collegeId: string) {
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
    .eq("college_id", collegeId)
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

export async function getSemesters(collegeCourseId: string) {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("semesters")
    .select("id, semester_number, name")
    .eq("college_course_id", collegeCourseId)
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

  const supabase = createServerSupabaseClient();

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(
      {
        user_id: userId,
      },
      {
        onConflict: "user_id",
        ignoreDuplicates: true,
      }
    );

  if (profileError) {
    throw new Error(profileError.message);
  }

  const { error: studentProfileError } = await supabase
    .from("student_profiles")
    .upsert(
      {
        user_id: userId,
        semester_id: semesterId,
        college_course_department_id:
          collegeCourseDepartmentId,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      }
    );

  if (studentProfileError) {
    throw new Error(studentProfileError.message);
  }

  const { error: onboardingError } = await supabase
    .from("profiles")
    .update({
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (onboardingError) {
    throw new Error(onboardingError.message);
  }

  return {
    success: true,
  };
}

export async function getDepartments(collegeCourseId: string) {
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
    .eq("college_course_id", collegeCourseId)
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
import { cache } from "react";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type StudentAcademicContext = {
  userId: string;
  university: {
    id: string;
    name: string;
    short_name: string;
  };
  college: {
    id: string;
    name: string;
  };
  course: {
    id: string;
    name: string;
    short_name: string | null;
  };
  department: {
    id: string;
    name: string;
    short_name: string;
    slug: string;
  };
  semester: {
    id: string;
    name: string;
    semester_number: number;
    college_course_id: string;
  };
  collegeCourseDepartmentId: string;
};

export type CurriculumSubject = {
  id: string;
  code: string;
  name: string;
  slug: string;
  category: string | null;
  subject_type: string;
  description: string | null;
  noteUnitsCount: number;
};

/**
 * Fetches the student's complete academic profile in a single unified operation,
 * It eliminates the 9+ sequential query waterfall bottleneck.
 */
export const getStudentAcademicContext = cache(
  async function getStudentAcademicContext(
    userId: string
  ): Promise<StudentAcademicContext | null> {
    const supabase = createServerSupabaseClient();

  // Primary attempt: Single relational join across the entire academic hierarchy
  try {
    const { data: profile, error } = await supabase
      .from("student_profiles")
      .select(`
        user_id,
        college_course_department_id,
        semester_id,
        semester:semesters (
          id,
          name,
          semester_number,
          college_course_id,
          college_course:college_courses (
            id,
            college:colleges (
              id,
              name,
              university:universities (
                id,
                name,
                short_name
              )
            ),
            course:courses (
              id,
              name,
              short_name
            )
          )
        ),
        college_course_department:college_course_departments (
          id,
          department:departments (
            id,
            name,
            short_name,
            slug
          )
        )
      `)
      .eq("user_id", userId)
      .maybeSingle();

    if (!error && profile && profile.semester && profile.college_course_department) {
      const sem = Array.isArray(profile.semester) ? profile.semester[0] : profile.semester;
      const ccd = Array.isArray(profile.college_course_department)
        ? profile.college_course_department[0]
        : profile.college_course_department;

      const collegeCourse = sem?.college_course
        ? Array.isArray(sem.college_course)
          ? sem.college_course[0]
          : sem.college_course
        : null;

      const college = collegeCourse?.college
        ? Array.isArray(collegeCourse.college)
          ? collegeCourse.college[0]
          : collegeCourse.college
        : null;

      const university = college?.university
        ? Array.isArray(college?.university)
          ? college.university[0]
          : college.university
        : null;

      const course = collegeCourse?.course
        ? Array.isArray(collegeCourse.course)
          ? collegeCourse.course[0]
          : collegeCourse.course
        : null;

      const department = ccd?.department
        ? Array.isArray(ccd.department)
          ? ccd.department[0]
          : ccd.department
        : null;

      if (sem && collegeCourse && college && university && course && department) {
        return {
          userId,
          university: {
            id: university.id,
            name: university.name,
            short_name: university.short_name,
          },
          college: {
            id: college.id,
            name: college.name,
          },
          course: {
            id: course.id,
            name: course.name,
            short_name: course.short_name ?? null,
          },
          department: {
            id: department.id,
            name: department.name,
            short_name: department.short_name,
            slug: department.slug,
          },
          semester: {
            id: sem.id,
            name: sem.name,
            semester_number: sem.semester_number,
            college_course_id: sem.college_course_id,
          },
          collegeCourseDepartmentId: profile.college_course_department_id,
        };
      }
    }
  } catch {
    // If deep join fails, fall back to parallel batch
  }

  // Resilient fallback: Parallel batch fetch (max 2 network round trips)
  const { data: studentProfile, error: spError } = await supabase
    .from("student_profiles")
    .select("semester_id, college_course_department_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (spError || !studentProfile?.semester_id || !studentProfile?.college_course_department_id) {
    return null;
  }

  const [semesterRes, deptMappingRes] = await Promise.all([
    supabase
      .from("semesters")
      .select(`
        id,
        name,
        semester_number,
        college_course_id,
        college_courses (
          id,
          course:courses (id, name, short_name),
          college:colleges (
            id,
            name,
            university:universities (id, name, short_name)
          )
        )
      `)
      .eq("id", studentProfile.semester_id)
      .single(),
    supabase
      .from("college_course_departments")
      .select(`
        id,
        department:departments (id, name, short_name, slug)
      `)
      .eq("id", studentProfile.college_course_department_id)
      .single(),
  ]);

  if (semesterRes.error || deptMappingRes.error || !semesterRes.data) {
    return null;
  }

  const semData = semesterRes.data;
  const ccData = Array.isArray(semData.college_courses)
    ? semData.college_courses[0]
    : semData.college_courses;

  const collegeData = ccData?.college
    ? Array.isArray(ccData.college)
      ? ccData.college[0]
      : ccData.college
    : null;

  const uniData = collegeData?.university
    ? Array.isArray(collegeData.university)
      ? collegeData.university[0]
      : collegeData.university
    : null;

  const courseData = ccData?.course
    ? Array.isArray(ccData.course)
      ? ccData.course[0]
      : ccData.course
    : null;

  const deptData = deptMappingRes.data?.department
    ? Array.isArray(deptMappingRes.data.department)
      ? deptMappingRes.data.department[0]
      : deptMappingRes.data.department
    : null;

  if (uniData && collegeData && courseData && deptData) {
    return {
      userId,
      university: {
        id: uniData.id,
        name: uniData.name,
        short_name: uniData.short_name,
      },
      college: {
        id: collegeData.id,
        name: collegeData.name,
      },
      course: {
        id: courseData.id,
        name: courseData.name,
        short_name: courseData.short_name ?? null,
      },
      department: {
        id: deptData.id,
        name: deptData.name,
        short_name: deptData.short_name,
        slug: deptData.slug,
      },
      semester: {
        id: semData.id,
        name: semData.name,
        semester_number: semData.semester_number,
        college_course_id: semData.college_course_id,
      },
      collegeCourseDepartmentId: studentProfile.college_course_department_id,
    };
  }

  // Failsafe 3: Direct-by-ID queries without PostgREST relationship embeds
  try {
    const [semRes, ccdRes] = await Promise.all([
      supabase
        .from("semesters")
        .select("id, name, semester_number, college_course_id")
        .eq("id", studentProfile.semester_id)
        .single(),
      supabase
        .from("college_course_departments")
        .select("id, college_course_id, department_id")
        .eq("id", studentProfile.college_course_department_id)
        .single(),
    ]);

    if (semRes.data && ccdRes.data) {
      const sem = semRes.data;
      const [ccRes, deptRes] = await Promise.all([
        supabase
          .from("college_courses")
          .select("id, college_id, course_id")
          .eq("id", sem.college_course_id)
          .single(),
        supabase
          .from("departments")
          .select("id, name, short_name, slug")
          .eq("id", ccdRes.data.department_id)
          .single(),
      ]);

      if (ccRes.data && deptRes.data) {
        const [collegeRes, courseRes] = await Promise.all([
          supabase
            .from("colleges")
            .select("id, name, university_id")
            .eq("id", ccRes.data.college_id)
            .single(),
          supabase
            .from("courses")
            .select("id, name, short_name")
            .eq("id", ccRes.data.course_id)
            .single(),
        ]);

        if (collegeRes.data && courseRes.data) {
          const { data: uniRow } = await supabase
            .from("universities")
            .select("id, name, short_name")
            .eq("id", collegeRes.data.university_id)
            .single();

          if (uniRow) {
            return {
              userId,
              university: {
                id: uniRow.id,
                name: uniRow.name,
                short_name: uniRow.short_name,
              },
              college: {
                id: collegeRes.data.id,
                name: collegeRes.data.name,
              },
              course: {
                id: courseRes.data.id,
                name: courseRes.data.name,
                short_name: courseRes.data.short_name ?? null,
              },
              department: {
                id: deptRes.data.id,
                name: deptRes.data.name,
                short_name: deptRes.data.short_name,
                slug: deptRes.data.slug,
              },
              semester: {
                id: sem.id,
                name: sem.name,
                semester_number: sem.semester_number,
                college_course_id: sem.college_course_id,
              },
              collegeCourseDepartmentId: studentProfile.college_course_department_id,
            };
          }
        }
      }
    }
  } catch {
    // All 3 resolution tiers failed
  }

  return null;
}
);

/**
 * Fetches curriculum subjects and unit note counts in a single/batched operation.
 */
export async function getCurriculumSubjectsWithNotes(
  universityId: string,
  courseId: string,
  semesterNumber: number,
  departmentId: string
): Promise<{ subjects: CurriculumSubject[]; noteUnitCount: Map<string, number> }> {
  const supabase = createServerSupabaseClient();

  const { data: curriculumRows, error: curriculumError } = await supabase
    .from("curriculum_subjects")
    .select(`
      id,
      department_id,
      subject:subjects (
        id,
        code,
        name,
        slug,
        category,
        subject_type,
        description
      )
    `)
    .eq("university_id", universityId)
    .eq("course_id", courseId)
    .eq("semester_number", semesterNumber)
    .eq("is_active", true)
    .or(`department_id.is.null,department_id.eq.${departmentId}`);

  if (curriculumError) {
    throw new Error(curriculumError.message);
  }

  const subjectMap = new Map<string, CurriculumSubject>();
  for (const row of curriculumRows ?? []) {
    const rawSubject = Array.isArray(row.subject) ? row.subject[0] : row.subject;
    if (!rawSubject) continue;

    subjectMap.set(rawSubject.id, {
      id: rawSubject.id,
      code: rawSubject.code,
      name: rawSubject.name,
      slug: rawSubject.slug,
      category: rawSubject.category ?? null,
      subject_type: rawSubject.subject_type,
      description: rawSubject.description ?? null,
      noteUnitsCount: 0,
    });
  }

  const subjects = Array.from(subjectMap.values()).sort((a, b) =>
    a.code.localeCompare(b.code)
  );

  const subjectIds = subjects.map((s) => s.id);
  const noteUnitCount = new Map<string, number>();

  if (subjectIds.length > 0) {
    const { data: noteRows } = await supabase
      .from("subject_note_units")
      .select("subject_id")
      .in("subject_id", subjectIds)
      .eq("is_active", true);

    for (const row of noteRows ?? []) {
      const count = (noteUnitCount.get(row.subject_id) ?? 0) + 1;
      noteUnitCount.set(row.subject_id, count);
    }

    for (const subject of subjects) {
      subject.noteUnitsCount = noteUnitCount.get(subject.id) ?? 0;
    }
  }

  return { subjects, noteUnitCount };
}

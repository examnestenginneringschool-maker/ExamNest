import { notFound, redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getStudentAcademicContext } from "@/lib/academic/student-context";
import { FloatingNavMenu } from "@/components/notes/FloatingNavMenu";
import { SubjectHeader } from "@/components/subject/SubjectHeader";
import { SubjectHero } from "@/components/subject/SubjectHero";
import { SubjectStatsRow } from "@/components/subject/SubjectStatsRow";
import { ResumeLearningBanner } from "@/components/subject/ResumeLearningBanner";
import { SubjectWorkspaceGrid } from "@/components/subject/SubjectWorkspaceGrid";

type PageProps = {
  params: Promise<{
    subjectId: string;
  }>;
};

type Subject = {
  id: string;
  code: string;
  name: string;
  slug: string;
  category: string | null;
  subject_type: string;
  description: string | null;
};

type NoteUnit = {
  id: string;
  unit_number: number;
  title: string;
  syllabus_text: string | null;
  important_topics: string[] | null;
};

export default async function SubjectPage({ params }: PageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { subjectId } = await params;
  const supabase = createServerSupabaseClient();

  const [context, user] = await Promise.all([
    getStudentAcademicContext(userId),
    currentUser(),
  ]);

  if (!context) {
    redirect("/onboarding");
  }

  const { university, college, course, department, semester } = context;

  // Run subject, curriculum authorization, and note units in parallel
  const [subjectRes, curriculumRes, noteUnitsRes] = await Promise.all([
    supabase
      .from("subjects")
      .select("id, code, name, slug, category, subject_type, description")
      .eq("id", subjectId)
      .maybeSingle<Subject>(),
    supabase
      .from("curriculum_subjects")
      .select("id")
      .eq("subject_id", subjectId)
      .eq("university_id", university.id)
      .eq("course_id", course.id)
      .eq("semester_number", semester.semester_number)
      .eq("is_active", true)
      .or(`department_id.is.null,department_id.eq.${department.id}`)
      .maybeSingle(),
    supabase
      .from("subject_note_units")
      .select("id, unit_number, title, syllabus_text, important_topics")
      .eq("subject_id", subjectId)
      .eq("is_active", true)
      .order("unit_number", { ascending: true })
      .returns<NoteUnit[]>(),
  ]);

  if (subjectRes.error) {
    throw new Error(subjectRes.error.message);
  }

  if (!subjectRes.data) {
    notFound();
  }

  const subject = subjectRes.data;

  if (curriculumRes.error) {
    throw new Error(curriculumRes.error.message);
  }

  if (!curriculumRes.data) {
    notFound();
  }

  if (noteUnitsRes.error) {
    throw new Error(noteUnitsRes.error.message);
  }

  const noteUnits = noteUnitsRes.data ?? [];
  const totalUnits = noteUnits.length;

  const studentName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ")
    : undefined;

  return (
    <main className="min-h-screen bg-[#faf8ff] text-slate-900 antialiased selection:bg-indigo-500 selection:text-white pb-24">
      {/* 1. Floating Nav Menu (matching the Notes workspace) */}
      <FloatingNavMenu subjectId={subject.id} />

      {/* 2. Sleek Top Header Bar */}
      <SubjectHeader
        universityName={university.short_name || university.name}
        collegeName={college.name}
        courseName={course.name}
        departmentName={department.short_name || department.name}
        semesterNumber={semester.semester_number}
        studentName={studentName}
      />

      {/* 3. Subject Hub Content */}
      <div className="mx-auto max-w-[1560px] px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-12">
        {/* Hero Subject Overview Banner */}
        <SubjectHero
          subjectId={subject.id}
          code={subject.code}
          name={subject.name}
          category={subject.category}
          subjectType={subject.subject_type}
          description={subject.description}
          universityName={university.short_name || university.name}
          departmentCode={department.short_name || department.name}
          semesterNumber={semester.semester_number}
          units={noteUnits.map((u) => ({
            id: u.id,
            unit_number: u.unit_number,
            title: u.title,
          }))}
        />

        {/* 3 Real Stats Cards (Notes, Modules, PYQs) */}
        <SubjectStatsRow unitsCount={totalUnits} />

        {/* Continue Learning Resume Banner (renders ONLY if an actual in-progress session exists for this subject) */}
        <ResumeLearningBanner subjectId={subject.id} />

        {/* Study & Prepare Workspace Cards */}
        <SubjectWorkspaceGrid
          subjectId={subject.id}
          unitsCount={totalUnits}
        />
      </div>
    </main>
  );
}
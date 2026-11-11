import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, BookOpen } from "lucide-react";

import {
  createServerSupabaseClient,
  getAuthenticatedUser,
} from "@/lib/supabase/server";
import { getStudentAcademicContext } from "@/lib/academic/student-context";
import { WorkspaceHeader } from "@/components/notes/WorkspaceHeader";
import {
  ChaptersGridClient,
  type ChapterGridItem,
} from "@/components/notes/ChaptersGridClient";

type PageProps = {
  params: Promise<{
    subjectId: string;
  }>;
};

type UnitSummaryRow = {
  id: string;
  unit_number: number;
  title: string;
};

export default async function NotesChaptersPage({ params }: PageProps) {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { subjectId } = await params;
  const [supabase, context] = await Promise.all([
    createServerSupabaseClient(),
    getStudentAcademicContext(user.id),
  ]);

  if (!context) {
    redirect("/onboarding");
  }

  const { university, college, course, department, semester } = context;

  // Parallelize subject lookup, curriculum access authorization, and active chapter units
  const [subjectRes, accessRes, unitsRes] = await Promise.all([
    supabase
      .from("subjects")
      .select("id, code, name, category")
      .eq("id", subjectId)
      .eq("is_active", true)
      .maybeSingle(),
    supabase
      .from("curriculum_subjects")
      .select("id")
      .eq("university_id", university.id)
      .eq("course_id", course.id)
      .eq("semester_number", semester.semester_number)
      .eq("subject_id", subjectId)
      .eq("is_active", true)
      .or(`department_id.is.null,department_id.eq.${department.id}`)
      .limit(1)
      .maybeSingle(),
    supabase
      .from("subject_note_units")
      .select("id, unit_number, title")
      .eq("subject_id", subjectId)
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("unit_number", { ascending: true }),
  ]);

  if (subjectRes.error) throw new Error(subjectRes.error.message);
  if (!subjectRes.data) notFound();
  const subject = subjectRes.data;

  if (accessRes.error) throw new Error(accessRes.error.message);
  if (!accessRes.data) notFound();

  if (unitsRes.error) throw new Error(unitsRes.error.message);
  const units = (unitsRes.data ?? []) as UnitSummaryRow[];

  // Lightweight topic count lookup per chapter (avoids loading heavy block JSON here)
  const topicCountsByUnit: Record<string, number> = {};
  if (units.length > 0) {
    const unitIds = units.map((unit) => unit.id);
    const { data: topicRows, error: topicsError } = await supabase
      .from("subject_note_topics")
      .select("id, note_unit_id")
      .in("note_unit_id", unitIds)
      .eq("is_active", true);

    if (topicsError) throw new Error(topicsError.message);

    for (const row of topicRows ?? []) {
      topicCountsByUnit[row.note_unit_id] =
        (topicCountsByUnit[row.note_unit_id] ?? 0) + 1;
    }
  }

  const chapters: ChapterGridItem[] = units.map((unit) => ({
    id: unit.id,
    unit_number: unit.unit_number,
    title: unit.title,
    topicsCount: topicCountsByUnit[unit.id] ?? 0,
  }));

  return (
    <main className="min-h-screen bg-[#faf8ff] text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
      <WorkspaceHeader
        subjectId={subject.id}
        subjectName={subject.name}
        subjectCode={subject.code}
        universityName={university.short_name || university.name}
        collegeName={college.name}
        courseName={course.name}
        departmentCode={department.short_name || department.name}
        semesterNumber={semester.semester_number}
        studentName={user.fullName}
        backHref={`/app/subjects/${subject.id}`}
        backLabel="Back"
        backTitle="Back to Subject Overview"
      />

      <div className="mx-auto max-w-[1560px] px-4 sm:px-6 lg:px-8 pt-7 sm:pt-9">
        {chapters.length === 0 ? (
          <div className="flex min-h-[380px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white">
            <div className="max-w-sm px-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <BookOpen className="h-6 w-6" />
              </div>
              <h2 className="mt-5 text-xl font-bold text-slate-900">
                Notes coming soon
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Study notes and chapters for {subject.name} are currently being
                organized.
              </p>
              <Link
                href={`/app/subjects/${subject.id}`}
                className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:border-slate-300 hover:bg-slate-50"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Subject</span>
              </Link>
            </div>
          </div>
        ) : (
          <ChaptersGridClient
            subjectId={subject.id}
            subjectCode={subject.code}
            subjectName={subject.name}
            semesterNumber={semester.semester_number}
            chapters={chapters}
          />
        )}
      </div>
    </main>
  );
}

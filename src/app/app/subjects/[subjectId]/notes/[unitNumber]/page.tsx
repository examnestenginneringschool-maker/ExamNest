import { notFound, redirect } from "next/navigation";

import {
  createServerSupabaseClient,
  getAuthenticatedUser,
} from "@/lib/supabase/server";
import { getStudentAcademicContext } from "@/lib/academic/student-context";
import { WorkspaceHeader } from "@/components/notes/WorkspaceHeader";
import { NotesWorkspaceClient } from "@/components/notes/NotesWorkspaceClient";
import type { NoteUnit, Topic } from "@/components/notes/UnitSection";
import type { TopicBlock } from "@/components/notes/NoteBlockRenderer";
import { PageTransition } from "@/components/ui/ViewTransitions";

type PageProps = {
  params: Promise<{
    subjectId: string;
    unitNumber: string;
  }>;
  searchParams: Promise<{
    topic?: string;
  }>;
};

export default async function ChapterNotesReaderPage({
  params,
  searchParams,
}: PageProps) {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/sign-in");
  }

  const [{ subjectId, unitNumber }, resolvedSearchParams, supabase, context] =
    await Promise.all([
      params,
      searchParams,
      createServerSupabaseClient(),
      getStudentAcademicContext(user.id),
    ]);

  if (!context) {
    redirect("/onboarding");
  }

  if (!/^\d+$/.test(unitNumber)) {
    notFound();
  }
  const parsedUnitNumber = Number.parseInt(unitNumber, 10);
  if (!Number.isSafeInteger(parsedUnitNumber)) {
    notFound();
  }

  const { university, college, course, department, semester } = context;

  // Parallelize subject lookup, curriculum access authorization, and units metadata
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
      .select("id, unit_number, title, syllabus_text, important_topics")
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
  const allUnits = (unitsRes.data ?? []) as NoteUnit[];

  const unitIndex = allUnits.findIndex(
    (u) => u.unit_number === parsedUnitNumber
  );
  if (unitIndex === -1) {
    notFound();
  }

  const activeUnit = allUnits[unitIndex];
  const nextUnitRow =
    unitIndex + 1 < allUnits.length ? allUnits[unitIndex + 1] : null;
  const nextUnit = nextUnitRow
    ? { unitNumber: nextUnitRow.unit_number, title: nextUnitRow.title }
    : null;

  // Fetch topics ONLY for this selected chapter
  const { data: topicRows, error: topicsError } = await supabase
    .from("subject_note_topics")
    .select(
      "id, note_unit_id, topic_number, title, summary, is_important, sort_order"
    )
    .eq("note_unit_id", activeUnit.id)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (topicsError) throw new Error(topicsError.message);
  const topics = (topicRows ?? []) as Topic[];

  // Fetch note blocks ONLY for topics inside this selected chapter
  const topicIds = topics.map((topic) => topic.id);
  let blocks: TopicBlock[] = [];

  if (topicIds.length > 0) {
    const { data: blockRows, error: blocksError } = await supabase
      .from("subject_note_blocks")
      .select("id, topic_id, block_key, block_type, content, sort_order")
      .in("topic_id", topicIds)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (blocksError) throw new Error(blocksError.message);
    blocks = (blockRows ?? []) as TopicBlock[];
  }

  const topicsByUnitRecord: Record<string, Topic[]> = {
    [activeUnit.id]: topics,
  };

  const blocksByTopicRecord: Record<string, TopicBlock[]> = {};
  for (const block of blocks) {
    if (!blocksByTopicRecord[block.topic_id]) {
      blocksByTopicRecord[block.topic_id] = [];
    }
    blocksByTopicRecord[block.topic_id].push(block);
  }

  return (
    <PageTransition>
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
        backHref={`/app/subjects/${subject.id}/notes`}
        backLabel="Chapters"
        backTitle="Back to All Chapters"
      />

      <div className="mx-auto max-w-[1560px] px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <NotesWorkspaceClient
          key={activeUnit.id}
          subjectId={subject.id}
          subjectName={subject.name}
          semesterNumber={semester.semester_number}
          units={[activeUnit]}
          totalUnitsCount={allUnits.length}
          initialTopicId={resolvedSearchParams.topic ?? null}
          nextUnit={nextUnit}
          topicsByUnit={topicsByUnitRecord}
          blocksByTopic={blocksByTopicRecord}
        />
      </div>
      </main>
    </PageTransition>
  );
}

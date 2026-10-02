import { auth, currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { BookOpen } from "lucide-react";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getStudentAcademicContext } from "@/lib/academic/student-context";
import { WorkspaceHeader } from "@/components/notes/WorkspaceHeader";
import { NotesWorkspaceClient } from "@/components/notes/NotesWorkspaceClient";
import type { NoteUnit, Topic } from "@/components/notes/UnitSection";
import type { TopicBlock } from "@/components/notes/NoteBlockRenderer";

type PageProps = {
  params: Promise<{
    subjectId: string;
  }>;
};

export default async function NotesPage({ params }: PageProps) {
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

  // Parallelize subject lookup, curriculum access authorization, and note units
  const [subjectRes, accessRes, notesRes] = await Promise.all([
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
      .select("id, unit_number, title, syllabus_text, important_topics, notes")
      .eq("subject_id", subjectId)
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  ]);

  if (subjectRes.error) throw new Error(subjectRes.error.message);
  if (!subjectRes.data) notFound();
  const subject = subjectRes.data;

  if (accessRes.error) throw new Error(accessRes.error.message);
  if (!accessRes.data) notFound();

  if (notesRes.error) throw new Error(notesRes.error.message);
  const units = (notesRes.data ?? []) as NoteUnit[];

  // Fetch topics
  const unitIds = units.map((unit) => unit.id);
  let topics: Topic[] = [];

  if (unitIds.length > 0) {
    const { data: topicRows, error: topicsError } = await supabase
      .from("subject_note_topics")
      .select(
        "id, note_unit_id, topic_number, title, summary, is_important, sort_order"
      )
      .in("note_unit_id", unitIds)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (topicsError) throw new Error(topicsError.message);
    topics = (topicRows ?? []) as Topic[];
  }

  // Fetch blocks
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

  // Group topics by unit
  const topicsByUnitRecord: Record<string, Topic[]> = {};
  for (const topic of topics) {
    if (!topicsByUnitRecord[topic.note_unit_id]) {
      topicsByUnitRecord[topic.note_unit_id] = [];
    }
    topicsByUnitRecord[topic.note_unit_id].push(topic);
  }

  // Group blocks by topic
  const blocksByTopicRecord: Record<string, TopicBlock[]> = {};
  for (const block of blocks) {
    if (!blocksByTopicRecord[block.topic_id]) {
      blocksByTopicRecord[block.topic_id] = [];
    }
    blocksByTopicRecord[block.topic_id].push(block);
  }

  const studentName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ")
    : undefined;

  return (
    <main className="min-h-screen bg-[#faf8ff] text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
      {/* 1. Sleek Academic Workspace Header */}
      <WorkspaceHeader
        subjectId={subject.id}
        subjectName={subject.name}
        subjectCode={subject.code}
        universityName={university.short_name || university.name}
        collegeName={college.name}
        courseName={course.name}
        departmentCode={department.short_name || department.name}
        semesterNumber={semester.semester_number}
        studentName={studentName}
      />

      {/* 2. Workspace Body */}
      <div className="mx-auto max-w-[1560px] px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {units.length === 0 ? (
          <div className="flex min-h-[380px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white">
            <div className="max-w-sm px-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <BookOpen className="h-6 w-6" />
              </div>
              <h2 className="mt-5 text-xl font-bold text-slate-900">
                Notes coming soon
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Study notes and unit materials for {subject.name} are currently being organized.
              </p>
            </div>
          </div>
        ) : (
          <NotesWorkspaceClient
            subjectId={subject.id}
            subjectName={subject.name}
            semesterNumber={semester.semester_number}
            units={units}
            topicsByUnit={topicsByUnitRecord}
            blocksByTopic={blocksByTopicRecord}
          />
        )}
      </div>
    </main>
  );
}
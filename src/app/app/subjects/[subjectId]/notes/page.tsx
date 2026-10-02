import { BookOpen } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getStudentAcademicContext } from "@/lib/academic/student-context";
import { NotesHeader } from "@/components/notes/NotesHeader";
import { NotesHero } from "@/components/notes/NotesHero";
import { NotesMobileNav } from "@/components/notes/NotesMobileNav";
import { NotesOutlineSidebar } from "@/components/notes/NotesOutlineSidebar";
import {
  UnitSection,
  type NoteUnit,
  type Topic,
} from "@/components/notes/UnitSection";
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

  const context = await getStudentAcademicContext(userId);
  if (!context) {
    redirect("/onboarding");
  }

  const { semester } = context;

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
      .eq("university_id", context.university.id)
      .eq("course_id", context.course.id)
      .eq("semester_number", context.semester.semester_number)
      .eq("subject_id", subjectId)
      .eq("is_active", true)
      .or(`department_id.is.null,department_id.eq.${context.department.id}`)
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
  const topicsByUnit = new Map<string, Topic[]>();
  for (const topic of topics) {
    const current = topicsByUnit.get(topic.note_unit_id) ?? [];
    current.push(topic);
    topicsByUnit.set(topic.note_unit_id, current);
  }

  // Group blocks by topic
  const blocksByTopic = new Map<string, TopicBlock[]>();
  for (const block of blocks) {
    const current = blocksByTopic.get(block.topic_id) ?? [];
    current.push(block);
    blocksByTopic.set(block.topic_id, current);
  }

  const totalTopics = topics.length;
  const totalImportantTopics = topics.filter((t) => t.is_important).length;

  const unitsWithTopics = units.map((unit) => ({
    id: unit.id,
    unit_number: unit.unit_number,
    title: unit.title,
    topics: (topicsByUnit.get(unit.id) ?? []).map((t) => ({
      id: t.id,
      topic_number: t.topic_number,
      title: t.title,
      is_important: t.is_important,
    })),
  }));

  return (
    <main className="min-h-screen bg-[#f7f7fb] text-slate-950">
      <NotesHeader subjectId={subject.id} subjectName={subject.name} />

      <div className="mx-auto max-w-[1500px] px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pt-8">
        <NotesHero
          code={subject.code}
          name={subject.name}
          semesterName={semester.name}
          category={subject.category}
          unitCount={units.length}
          totalTopics={totalTopics}
          totalImportantTopics={totalImportantTopics}
        />

        <NotesMobileNav units={units} />

        {units.length === 0 ? (
          <div className="mt-8 flex min-h-[340px] items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-white">
            <div className="max-w-sm px-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <BookOpen className="h-6 w-6 text-slate-400" />
              </div>
              <h2 className="mt-5 text-xl font-bold text-slate-950">
                Notes have not been added yet
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                The study material for this subject will appear here when it becomes available.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)] xl:gap-12">
            <NotesOutlineSidebar units={unitsWithTopics} />

            <div className="min-w-0">
              {units.map((unit, unitIndex) => (
                <UnitSection
                  key={unit.id}
                  unit={unit}
                  unitIndex={unitIndex}
                  topics={topicsByUnit.get(unit.id) ?? []}
                  blocksByTopic={blocksByTopic}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
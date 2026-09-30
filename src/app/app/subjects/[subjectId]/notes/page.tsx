import Link from "next/link";

import {
  ArrowLeft,
  BookOpen,
  BookOpenCheck,
  ChevronRight,
  CircleAlert,
  FileText,
  GraduationCap,
  Lightbulb,
  ListChecks,
  Sigma,
  Sparkles,
  Star,
} from "lucide-react";

import { currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";

// =========================================================
// TYPES
// =========================================================

type PageProps = {
  params: Promise<{
    subjectId: string;
  }>;
};

type LegacyNoteBlock = {
  heading?: string;
  body?: string;
  exam_tip?: string;
};

type NoteUnit = {
  id: string;
  unit_number: number;
  title: string;
  syllabus_text: string;
  important_topics: string[];
  notes: LegacyNoteBlock[];
};

type Topic = {
  id: string;
  note_unit_id: string;
  topic_number: string;
  title: string;
  summary: string | null;
  is_important: boolean;
  sort_order: number;
};

type BlockContent = {
  title?: string;
  text?: string;
  formula?: string;
  description?: string;
  items?: string[];
  url?: string;
  alt?: string;
  caption?: string;
};

type TopicBlock = {
  id: string;
  topic_id: string;
  block_key: string | null;
  block_type: string;
  content: BlockContent;
  sort_order: number;
};

// =========================================================
// PAGE
// =========================================================

export default async function NotesPage({ params }: PageProps) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { subjectId } = await params;

  const supabase = createServerSupabaseClient();

  // =====================================================
  // 1. SUBJECT
  // =====================================================

  const { data: subject, error: subjectError } = await supabase
    .from("subjects")
    .select(`
      id,
      code,
      name,
      category
    `)
    .eq("id", subjectId)
    .eq("is_active", true)
    .maybeSingle();

  if (subjectError) {
    throw new Error(subjectError.message);
  }

  if (!subject) {
    notFound();
  }

  // =====================================================
  // 2. STUDENT PROFILE
  // =====================================================

  const { data: studentProfile, error: studentProfileError } =
    await supabase
      .from("student_profiles")
      .select(`
        semester_id,
        college_course_department_id
      `)
      .eq("user_id", user.id)
      .maybeSingle();

  if (studentProfileError) {
    throw new Error(studentProfileError.message);
  }

  if (
    !studentProfile?.semester_id ||
    !studentProfile?.college_course_department_id
  ) {
    redirect("/onboarding");
  }

  // =====================================================
  // 3. SEMESTER
  // =====================================================

  const { data: semester, error: semesterError } = await supabase
    .from("semesters")
    .select(`
      name,
      semester_number,
      college_course_id
    `)
    .eq("id", studentProfile.semester_id)
    .single();

  if (semesterError) {
    throw new Error(semesterError.message);
  }

  // =====================================================
  // 4. COLLEGE COURSE
  // =====================================================

  const { data: collegeCourse, error: collegeCourseError } = await supabase
    .from("college_courses")
    .select(`
      college_id,
      course_id
    `)
    .eq("id", semester.college_course_id)
    .single();

  if (collegeCourseError) {
    throw new Error(collegeCourseError.message);
  }

  // =====================================================
  // 5. COLLEGE
  // =====================================================

  const { data: college, error: collegeError } = await supabase
    .from("colleges")
    .select(`
      university_id
    `)
    .eq("id", collegeCourse.college_id)
    .single();

  if (collegeError) {
    throw new Error(collegeError.message);
  }

  // =====================================================
  // 6. DEPARTMENT
  // =====================================================

  const {
    data: departmentMapping,
    error: departmentMappingError,
  } = await supabase
    .from("college_course_departments")
    .select(`
      department_id
    `)
    .eq(
      "id",
      studentProfile.college_course_department_id
    )
    .single();

  if (departmentMappingError) {
    throw new Error(departmentMappingError.message);
  }

  // =====================================================
  // 7. SECURITY CHECK
  // =====================================================

  const { data: access, error: accessError } = await supabase
    .from("curriculum_subjects")
    .select("id")
    .eq("university_id", college.university_id)
    .eq("course_id", collegeCourse.course_id)
    .eq("semester_number", semester.semester_number)
    .eq("subject_id", subject.id)
    .eq("is_active", true)
    .or(
      `department_id.is.null,department_id.eq.${departmentMapping.department_id}`
    )
    .limit(1)
    .maybeSingle();

  if (accessError) {
    throw new Error(accessError.message);
  }

  if (!access) {
    notFound();
  }

  // =====================================================
  // 8. FETCH NOTE UNITS
  // =====================================================

  const { data: noteRows, error: notesError } = await supabase
    .from("subject_note_units")
    .select(`
      id,
      unit_number,
      title,
      syllabus_text,
      important_topics,
      notes
    `)
    .eq("subject_id", subject.id)
    .eq("is_active", true)
    .order("sort_order", {
      ascending: true,
    });

  if (notesError) {
    throw new Error(notesError.message);
  }

  const units = (noteRows ?? []) as NoteUnit[];

  // =====================================================
  // 9. FETCH TOPICS
  // =====================================================

  const unitIds = units.map((unit) => unit.id);

  let topics: Topic[] = [];

  if (unitIds.length > 0) {
    const { data: topicRows, error: topicsError } =
      await supabase
        .from("subject_note_topics")
        .select(`
          id,
          note_unit_id,
          topic_number,
          title,
          summary,
          is_important,
          sort_order
        `)
        .in("note_unit_id", unitIds)
        .eq("is_active", true)
        .order("sort_order", {
          ascending: true,
        });

    if (topicsError) {
      throw new Error(topicsError.message);
    }

    topics = (topicRows ?? []) as Topic[];
  }

  // =====================================================
  // 10. FETCH BLOCKS
  // =====================================================

  const topicIds = topics.map((topic) => topic.id);

  let blocks: TopicBlock[] = [];

  if (topicIds.length > 0) {
    const { data: blockRows, error: blocksError } =
      await supabase
        .from("subject_note_blocks")
        .select(`
          id,
          topic_id,
          block_key,
          block_type,
          content,
          sort_order
        `)
        .in("topic_id", topicIds)
        .eq("is_active", true)
        .order("sort_order", {
          ascending: true,
        });

    if (blocksError) {
      throw new Error(blocksError.message);
    }

    blocks = (blockRows ?? []) as TopicBlock[];
  }

  // =====================================================
  // 11. GROUP TOPICS BY UNIT
  // =====================================================

  const topicsByUnit = new Map<string, Topic[]>();

  for (const topic of topics) {
    const current =
      topicsByUnit.get(topic.note_unit_id) ?? [];

    current.push(topic);

    topicsByUnit.set(
      topic.note_unit_id,
      current
    );
  }

  // =====================================================
  // 12. GROUP BLOCKS BY TOPIC
  // =====================================================

  const blocksByTopic =
    new Map<string, TopicBlock[]>();

  for (const block of blocks) {
    const current =
      blocksByTopic.get(block.topic_id) ?? [];

    current.push(block);

    blocksByTopic.set(
      block.topic_id,
      current
    );
  }

  // =====================================================
  // STATS
  // =====================================================

  const totalTopics = topics.length;

  const totalImportantTopics =
    topics.filter(
      (topic) => topic.is_important
    ).length;

  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="min-h-screen bg-[#f7f7fb] text-slate-950">

      {/* ================================================= */}
      {/* TOP BAR */}
      {/* ================================================= */}

      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-8">

          <Link
            href={`/app/subjects/${subject.id}`}
            className="group inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white transition group-hover:border-slate-300 group-hover:shadow-sm">
              <ArrowLeft className="h-4 w-4" />
            </span>

            <span className="hidden sm:inline">
              {subject.name}
            </span>
          </Link>

          <div className="flex items-center gap-3">

            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-500 sm:flex">
              <BookOpen className="h-4 w-4 text-indigo-500" />
              Notes
            </div>

            <div className="flex items-center gap-2 text-sm font-bold tracking-tight text-slate-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white">
                E
              </span>

              <span className="hidden sm:block">
                ExamNest
              </span>
            </div>

          </div>
        </div>
      </header>

      {/* ================================================= */}
      {/* PAGE */}
      {/* ================================================= */}

      <div className="mx-auto max-w-[1500px] px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pt-8">

        {/* ================================================= */}
        {/* HERO */}
        {/* ================================================= */}

        <section className="relative overflow-hidden rounded-[32px] border border-indigo-100 bg-gradient-to-br from-[#f0efff] via-[#f8f7ff] to-[#eef5ff]">

          {/* decorative glow */}

          <div className="pointer-events-none absolute -right-20 -top-32 h-[360px] w-[360px] rounded-full bg-indigo-300/20 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-[280px] w-[280px] rounded-full bg-violet-300/20 blur-3xl" />

          <div className="relative px-6 py-8 sm:px-8 md:px-10 md:py-10 lg:px-12">

            <div className="flex flex-col justify-between gap-10 xl:flex-row xl:items-end">

              {/* LEFT */}

              <div className="max-w-4xl">

                <div className="flex flex-wrap items-center gap-2">

                  <span className="rounded-full border border-indigo-200/80 bg-white/80 px-3 py-1.5 text-xs font-bold text-indigo-700 shadow-sm">
                    {subject.code}
                  </span>

                  <span className="rounded-full border border-white bg-white/60 px-3 py-1.5 text-xs font-semibold text-slate-600">
                    {semester.name}
                  </span>

                  {subject.category && (
                    <span className="rounded-full border border-white bg-white/60 px-3 py-1.5 text-xs font-semibold text-slate-600">
                      {subject.category}
                    </span>
                  )}

                </div>

                <div className="mt-7 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
                  <Sparkles className="h-4 w-4" />
                  Complete syllabus notes
                </div>

                <h1 className="mt-4 text-4xl font-black tracking-[-0.035em] text-slate-950 sm:text-5xl lg:text-[58px] lg:leading-[1.05]">
                  {subject.name}
                </h1>

                <p className="mt-5 max-w-2xl text-[15px] font-medium leading-7 text-slate-600 sm:text-base">
                  Structured chapter-wise notes,
                  important concepts, formulas,
                  derivations and exam-focused
                  revision points in one place.
                </p>

              </div>

              {/* STATS */}

              <div className="grid grid-cols-3 gap-2 sm:gap-3">

                <StatBox
                  value={units.length}
                  label="Units"
                />

                <StatBox
                  value={totalTopics}
                  label="Topics"
                />

                <StatBox
                  value={totalImportantTopics}
                  label="Important"
                />

              </div>

            </div>

          </div>

        </section>

        {/* ================================================= */}
        {/* MOBILE UNIT NAV */}
        {/* ================================================= */}

        {units.length > 0 && (
          <div className="sticky top-[68px] z-40 -mx-4 mt-5 border-y border-slate-200/80 bg-[#f7f7fb]/95 px-4 py-3 backdrop-blur lg:hidden sm:-mx-6 sm:px-6">

            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

              {units.map((unit) => (
                <a
                  key={unit.id}
                  href={`#unit-${unit.unit_number}`}
                  className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  {String(
                    unit.unit_number
                  ).padStart(2, "0")}{" "}
                  {unit.title}
                </a>
              ))}

            </div>

          </div>
        )}

        {/* ================================================= */}
        {/* EMPTY */}
        {/* ================================================= */}

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
                The study material for this
                subject will appear here when it
                becomes available.
              </p>

            </div>

          </div>

        ) : (

          /* ================================================= */
          /* READER LAYOUT */
          /* ================================================= */

          <div className="mt-8 grid items-start gap-8 lg:grid-cols-[300px_minmax(0,1fr)] xl:gap-12">

            {/* ================================================= */}
            {/* SIDEBAR */}
            {/* ================================================= */}

            <aside className="hidden lg:block">

              <div className="sticky top-[92px]">

                <div className="mb-4 flex items-center justify-between px-3">

                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                    Course outline
                  </p>

                  <span className="text-xs font-semibold text-slate-400">
                    {units.length} units
                  </span>

                </div>

                <nav className="relative">

                  <div className="absolute bottom-3 left-[23px] top-3 w-px bg-slate-200" />

                  <div className="space-y-1">

                    {units.map((unit) => {

                      const unitTopicCount =
                        topicsByUnit.get(unit.id)
                          ?.length ?? 0;

                      return (
                        <a
                          key={unit.id}
                          href={`#unit-${unit.unit_number}`}
                          className="group relative flex gap-4 rounded-2xl px-3 py-3.5 transition hover:bg-white hover:shadow-sm"
                        >

                          <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-[#f7f7fb] text-[11px] font-black text-slate-500 transition group-hover:border-indigo-200 group-hover:bg-indigo-600 group-hover:text-white">
                            {String(
                              unit.unit_number
                            ).padStart(2, "0")}
                          </span>

                          <span className="min-w-0 flex-1">

                            <span className="block truncate text-sm font-bold leading-5 text-slate-700 transition group-hover:text-indigo-700">
                              {unit.title}
                            </span>

                            <span className="mt-1 block text-[11px] font-medium text-slate-400">
                              {unitTopicCount}{" "}
                              {unitTopicCount === 1
                                ? "topic"
                                : "topics"}
                            </span>

                          </span>

                          <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-indigo-500" />

                        </a>
                      );
                    })}

                  </div>

                </nav>

              </div>

            </aside>

            {/* ================================================= */}
            {/* CONTENT */}
            {/* ================================================= */}

            <div className="min-w-0">

              {units.map((unit, unitIndex) => {

                const unitTopics =
                  topicsByUnit.get(unit.id) ?? [];

                return (

                  <section
                    key={unit.id}
                    id={`unit-${unit.unit_number}`}
                    className={`scroll-mt-36 ${
                      unitIndex > 0
                        ? "mt-20 border-t border-slate-200 pt-16"
                        : ""
                    }`}
                  >

                    {/* ========================================= */}
                    {/* UNIT HEADER */}
                    {/* ========================================= */}

                    <div>

                      <div className="flex items-start gap-5 sm:gap-7">

                        <div className="hidden shrink-0 sm:block">
                          <span className="text-[72px] font-black leading-none tracking-[-0.08em] text-indigo-100">
                            {String(
                              unit.unit_number
                            ).padStart(2, "0")}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em] text-indigo-600">
                            <BookOpenCheck className="h-4 w-4" />

                            Unit{" "}
                            {unit.unit_number}
                          </div>

                          <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl lg:text-[42px] lg:leading-[1.1]">
                            {unit.title}
                          </h2>

                          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">

                            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-slate-200">
                              <ListChecks className="h-3.5 w-3.5 text-indigo-500" />

                              {unitTopics.length}{" "}
                              topics
                            </span>

                            {unit.important_topics
                              ?.length > 0 && (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700 ring-1 ring-amber-100">
                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />

                                {
                                  unit
                                    .important_topics
                                    .length
                                }{" "}
                                focus areas
                              </span>
                            )}

                          </div>

                        </div>

                      </div>

                      {/* SYLLABUS COVERAGE */}

                      {unit.syllabus_text && (
                        <div className="mt-8 rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.04)] sm:p-6">

                          <div className="flex items-center gap-2">

                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50">
                              <GraduationCap className="h-4 w-4 text-indigo-600" />
                            </span>

                            <div>
                              <p className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">
                                Syllabus coverage
                              </p>
                            </div>

                          </div>

                          <p className="mt-4 text-[15px] font-medium leading-8 text-slate-600">
                            {unit.syllabus_text}
                          </p>

                        </div>
                      )}

                      {/* IMPORTANT TOPIC TAGS */}

                      {unit.important_topics
                        ?.length > 0 && (

                        <div className="mt-6">

                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />

                            <p className="text-sm font-bold text-slate-800">
                              Important topics
                            </p>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">

                            {unit.important_topics.map(
                              (importantTopic) => (

                                <span
                                  key={
                                    importantTopic
                                  }
                                  className="rounded-full border border-amber-200/80 bg-amber-50/80 px-3 py-1.5 text-xs font-semibold text-amber-800"
                                >
                                  {
                                    importantTopic
                                  }
                                </span>

                              )
                            )}

                          </div>

                        </div>
                      )}

                      {/* TOPIC QUICK NAV */}

                      {unitTopics.length > 0 && (

                        <div className="mt-8 border-y border-slate-200/70 py-4">

                          <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

                            {unitTopics.map(
                              (topic) => (

                                <a
                                  key={
                                    topic.id
                                  }
                                  href={`#topic-${topic.topic_number}`}
                                  className="shrink-0 rounded-full bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-600 transition hover:bg-indigo-600 hover:text-white"
                                >
                                  {
                                    topic.topic_number
                                  }{" "}
                                  ·{" "}
                                  {
                                    topic.title
                                  }
                                </a>

                              )
                            )}

                          </div>

                        </div>
                      )}

                    </div>

                    {/* ========================================= */}
                    {/* STRUCTURED TOPICS */}
                    {/* ========================================= */}

                    {unitTopics.length > 0 ? (

                      <div className="mt-12">

                        {unitTopics.map(
                          (
                            topic,
                            topicIndex
                          ) => {

                            const topicBlocks =
                              blocksByTopic.get(
                                topic.id
                              ) ?? [];

                            return (

                              <article
                                key={
                                  topic.id
                                }
                                id={`topic-${topic.topic_number}`}
                                className={`scroll-mt-32 ${
                                  topicIndex > 0
                                    ? "mt-16 border-t border-slate-200/80 pt-14"
                                    : ""
                                }`}
                              >

                                {/* TOPIC HEADER */}

                                <div className="max-w-4xl">

                                  <div className="flex flex-wrap items-center gap-2">

                                    <span className="rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-black tracking-wide text-white">
                                      {
                                        topic.topic_number
                                      }
                                    </span>

                                    {topic.is_important && (

                                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-700">
                                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />

                                        Important
                                      </span>

                                    )}

                                  </div>

                                  <h3 className="mt-4 text-2xl font-black tracking-[-0.025em] text-slate-950 sm:text-[30px] sm:leading-[1.2]">
                                    {topic.title}
                                  </h3>

                                  {topic.summary && (

                                    <p className="mt-4 max-w-3xl text-[15px] font-medium leading-8 text-slate-500">
                                      {
                                        topic.summary
                                      }
                                    </p>

                                  )}

                                </div>

                                {/* BLOCKS */}

                                {topicBlocks.length >
                                0 ? (

                                  <div className="mt-8 max-w-4xl space-y-6">

                                    {topicBlocks.map(
                                      (
                                        block
                                      ) => (

                                        <NoteBlockRenderer
                                          key={
                                            block.id
                                          }
                                          block={
                                            block
                                          }
                                        />

                                      )
                                    )}

                                  </div>

                                ) : (

                                  <div className="mt-7 max-w-4xl rounded-2xl border border-dashed border-slate-300 bg-white/60 px-5 py-4">

                                    <p className="text-sm font-medium text-slate-500">
                                      Detailed notes
                                      for this
                                      topic are
                                      being
                                      prepared.
                                    </p>

                                  </div>

                                )}

                              </article>

                            );
                          }
                        )}

                      </div>

                    ) : (

                      /* ===================================== */
                      /* LEGACY DSA SUPPORT */
                      /* ===================================== */

                      Array.isArray(
                        unit.notes
                      ) &&
                      unit.notes.length >
                        0 && (

                        <div className="mt-12 max-w-4xl space-y-10">

                          {unit.notes.map(
                            (
                              note,
                              index
                            ) => (

                              <article
                                key={`${unit.id}-${index}`}
                                className={
                                  index > 0
                                    ? "border-t border-slate-200 pt-10"
                                    : ""
                                }
                              >

                                {note.heading && (
                                  <h3 className="text-2xl font-black tracking-tight text-slate-950">
                                    {
                                      note.heading
                                    }
                                  </h3>
                                )}

                                {note.body && (
                                  <p className="mt-4 whitespace-pre-line text-[16px] leading-8 text-slate-600">
                                    {
                                      note.body
                                    }
                                  </p>
                                )}

                                {note.exam_tip && (

                                  <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5">

                                    <div className="flex gap-3">

                                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                                        <Lightbulb className="h-4 w-4 text-emerald-700" />
                                      </div>

                                      <div>

                                        <p className="text-[11px] font-black uppercase tracking-[0.15em] text-emerald-700">
                                          Exam
                                          focus
                                        </p>

                                        <p className="mt-2 text-sm font-medium leading-7 text-emerald-950">
                                          {
                                            note.exam_tip
                                          }
                                        </p>

                                      </div>

                                    </div>

                                  </div>

                                )}

                              </article>

                            )
                          )}

                        </div>

                      )

                    )}

                  </section>

                );
              })}

            </div>

          </div>

        )}

      </div>

    </main>
  );
}

// =========================================================
// STAT BOX
// =========================================================

function StatBox({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="min-w-[88px] rounded-2xl border border-white/80 bg-white/70 px-3 py-4 text-center shadow-[0_8px_25px_rgba(79,70,229,0.06)] backdrop-blur sm:min-w-[110px] sm:px-5">

      <p className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
        {value}
      </p>

      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:text-[11px]">
        {label}
      </p>

    </div>
  );
}

// =========================================================
// NOTE BLOCK RENDERER
// =========================================================

function NoteBlockRenderer({
  block,
}: {
  block: TopicBlock;
}) {
  const {
    block_type,
    content,
  } = block;

  // =====================================================
  // DEFINITION
  // =====================================================

  if (
    block_type ===
    "definition"
  ) {
    return (

      <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-white px-5 py-5 shadow-[0_8px_28px_rgba(15,23,42,0.035)] sm:px-6">

        <div className="absolute bottom-0 left-0 top-0 w-1 bg-indigo-500" />

        <div className="pl-2">

          <div className="flex items-center gap-2">

            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50">
              <BookOpen className="h-4 w-4 text-indigo-600" />
            </span>

            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-600">
              Definition
            </p>

          </div>

          {content.title && (

            <h4 className="mt-4 text-lg font-black tracking-tight text-slate-950">
              {content.title}
            </h4>

          )}

          {content.text && (

            <p className="mt-2 text-[15.5px] leading-8 text-slate-600">
              {content.text}
            </p>

          )}

        </div>

      </div>

    );
  }

  // =====================================================
  // FORMULA
  // =====================================================

  if (
    block_type ===
    "formula"
  ) {
    return (

      <div className="overflow-hidden rounded-[22px] border border-violet-200/70 bg-gradient-to-br from-violet-50 to-indigo-50/60">

        <div className="flex items-center gap-2 px-5 pb-0 pt-5 sm:px-6">

          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow-sm">
            <Sigma className="h-4 w-4 text-violet-600" />
          </span>

          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-700">
            Formula
          </p>

        </div>

        <div className="px-5 pb-5 pt-4 sm:px-6 sm:pb-6">

          {content.title && (

            <h4 className="text-base font-black text-slate-900">
              {content.title}
            </h4>

          )}

          {content.formula && (

            <div className="mt-4 overflow-x-auto rounded-2xl border border-white/80 bg-white px-5 py-5 shadow-sm">

              <p className="min-w-max text-center font-mono text-[18px] font-semibold tracking-tight text-slate-950 sm:text-xl">
                {content.formula}
              </p>

            </div>

          )}

          {content.description && (

            <p className="mt-4 text-sm font-medium leading-7 text-slate-600">
              {
                content.description
              }
            </p>

          )}

        </div>

      </div>

    );
  }

  // =====================================================
  // BULLET LIST
  // =====================================================

  if (
    block_type ===
    "bullet_list"
  ) {
    return (

      <div className="py-1">

        {content.title && (

          <h4 className="text-lg font-black tracking-tight text-slate-900">
            {content.title}
          </h4>

        )}

        {content.items &&
          content.items.length >
            0 && (

            <ul className="mt-4 space-y-3">

              {content.items.map(
                (
                  item,
                  index
                ) => (

                  <li
                    key={index}
                    className="group flex items-start gap-3 text-[15.5px] leading-7 text-slate-600"
                  >

                    <span className="mt-[9px] flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    </span>

                    <span>
                      {item}
                    </span>

                  </li>

                )
              )}

            </ul>

          )}

      </div>

    );
  }

  // =====================================================
  // NUMBERED LIST
  // =====================================================

  if (
    block_type ===
    "numbered_list"
  ) {
    return (

      <div>

        {content.title && (

          <h4 className="text-lg font-black tracking-tight text-slate-900">
            {content.title}
          </h4>

        )}

        {content.items &&
          content.items.length >
            0 && (

            <ol className="mt-5 space-y-4">

              {content.items.map(
                (
                  item,
                  index
                ) => (

                  <li
                    key={index}
                    className="flex items-start gap-4 text-[15.5px] leading-7 text-slate-600"
                  >

                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-[11px] font-black text-white">
                      {index + 1}
                    </span>

                    <span className="pt-[1px]">
                      {item}
                    </span>

                  </li>

                )
              )}

            </ol>

          )}

      </div>

    );
  }

  // =====================================================
  // IMPORTANT
  // =====================================================

  if (
    block_type ===
    "important"
  ) {
    return (

      <div className="relative overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50/60 p-5 sm:p-6">

        <div className="absolute bottom-0 left-0 top-0 w-1 bg-amber-400" />

        <div className="flex gap-4">

          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
            <CircleAlert className="h-4 w-4 text-amber-600" />
          </span>

          <div className="min-w-0">

            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">
              {content.title ??
                "Important"}
            </p>

            {content.text && (

              <p className="mt-2 text-[15px] font-medium leading-7 text-amber-950">
                {content.text}
              </p>

            )}

          </div>

        </div>

      </div>

    );
  }

  // =====================================================
  // EXAM TIP
  // =====================================================

  if (
    block_type ===
    "exam_tip"
  ) {
    return (

      <div className="relative overflow-hidden rounded-[22px] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50/60 p-5 sm:p-6">

        <div className="absolute bottom-0 left-0 top-0 w-1 bg-emerald-500" />

        <div className="flex gap-4">

          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
            <Lightbulb className="h-4 w-4 text-emerald-600" />
          </span>

          <div className="min-w-0 flex-1">

            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">
              {content.title ??
                "Exam focus"}
            </p>

            {content.text && (

              <p className="mt-2 text-[15px] font-medium leading-7 text-emerald-950">
                {content.text}
              </p>

            )}

            {content.items &&
              content.items.length >
                0 && (

                <ul className="mt-4 space-y-2.5">

                  {content.items.map(
                    (
                      item,
                      index
                    ) => (

                      <li
                        key={
                          index
                        }
                        className="flex items-start gap-2.5 text-sm font-medium leading-6 text-emerald-950"
                      >

                        <span className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />

                        <span>
                          {item}
                        </span>

                      </li>

                    )
                  )}

                </ul>

              )}

          </div>

        </div>

      </div>

    );
  }

  // =====================================================
  // EXAMPLE
  // =====================================================

  if (
    block_type ===
    "example"
  ) {
    return (

      <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-5 sm:p-6">

        <div className="flex items-center gap-2">

          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow-sm">
            <FileText className="h-4 w-4 text-sky-600" />
          </span>

          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-700">
            Example
          </p>

        </div>

        {content.title && (

          <h4 className="mt-4 text-lg font-black text-sky-950">
            {content.title}
          </h4>

        )}

        {content.text && (

          <p className="mt-2 whitespace-pre-line text-[15px] leading-8 text-sky-900">
            {content.text}
          </p>

        )}

      </div>

    );
  }

  // =====================================================
  // HEADING
  // =====================================================

  if (
    block_type ===
      "heading" ||
    block_type ===
      "subheading"
  ) {
    return (

      <div className="pt-2">

        <div className="flex items-center gap-3">

          <span className="h-7 w-1 rounded-full bg-indigo-500" />

          <h4 className="text-xl font-black tracking-tight text-slate-950">
            {content.title}
          </h4>

        </div>

        {content.text && (

          <p className="mt-3 pl-4 text-[15.5px] leading-8 text-slate-600">
            {content.text}
          </p>

        )}

      </div>

    );
  }

  // =====================================================
  // DERIVATION
  // =====================================================

  if (
    block_type ===
    "derivation"
  ) {
    return (

      <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_8px_28px_rgba(15,23,42,0.035)]">

        <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4 sm:px-6">

          <div className="flex items-center gap-2">

            <Sigma className="h-4 w-4 text-slate-500" />

            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
              Derivation
            </p>

          </div>

          {content.title && (

            <h4 className="mt-2 text-base font-black text-slate-950">
              {content.title}
            </h4>

          )}

        </div>

        {content.text && (

          <div className="overflow-x-auto px-5 py-5 sm:px-6">

            <p className="whitespace-pre-line font-mono text-[14px] leading-8 text-slate-700">
              {content.text}
            </p>

          </div>

        )}

      </div>

    );
  }

  // =====================================================
  // IMAGE
  // =====================================================

  if (
    block_type === "image" &&
    content.url
  ) {
    return (

      <figure className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={content.url}
          alt={
            content.alt ??
            content.title ??
            "Study diagram"
          }
          className="h-auto w-full object-contain"
        />

        {(content.caption ||
          content.title) && (

          <figcaption className="border-t border-slate-100 px-5 py-3 text-center text-xs font-medium leading-5 text-slate-500">
            {content.caption ??
              content.title}
          </figcaption>

        )}

      </figure>

    );
  }

  // =====================================================
  // DEFAULT PARAGRAPH
  // =====================================================

  return (

    <div>

      {content.title && (

        <h4 className="text-lg font-black tracking-tight text-slate-900">
          {content.title}
        </h4>

      )}

      {content.text && (

        <p className="mt-3 whitespace-pre-line text-[15.5px] leading-8 text-slate-600">
          {content.text}
        </p>

      )}

    </div>

  );
}
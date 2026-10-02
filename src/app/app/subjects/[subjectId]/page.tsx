import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  ClipboardList,
  FileText,
  GraduationCap,
  NotebookPen,
  Sparkles,
  Trophy,
  type LucideIcon,
} from "lucide-react";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getStudentAcademicContext } from "@/lib/academic/student-context";

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

  // Fast unified academic profile resolution (cached across request)
  const context = await getStudentAcademicContext(userId);

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

  const noteUnits = noteUnitsRes.data;

  const totalUnits = noteUnits?.length ?? 0;
  const firstUnit = noteUnits?.[0] ?? null;
  const notesAvailable = totalUnits > 0;

  return (
    <main className="min-h-screen bg-[#f6f8fc] text-slate-950">
      <div className="mx-auto max-w-[1500px] px-5 py-7 md:px-8 md:py-9">
        {/* TOP BAR */}
        <div className="flex items-center justify-between">
          <Link
            href="/app/dashboard"
            className="inline-flex items-center gap-2 text-base font-semibold text-slate-600 transition hover:text-indigo-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>

          <UserButton />
        </div>

        {/* HERO */}
        <section className="relative mt-6 overflow-hidden rounded-[30px] border border-indigo-100 bg-gradient-to-br from-[#eef1ff] via-[#f8f9ff] to-[#eef7ff] shadow-[0_20px_60px_rgba(79,70,229,0.08)]">
          <div className="pointer-events-none absolute right-10 top-8 h-40 w-40 rounded-full bg-indigo-300/15 blur-3xl" />
          <div className="pointer-events-none absolute right-[20%] top-0 h-56 w-56 rounded-full bg-violet-300/15 blur-3xl" />

          <div className="grid gap-6 p-6 md:p-8 lg:grid-cols-[1fr_280px] lg:p-10">
            {/* LEFT */}
            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex rounded-xl bg-indigo-50 px-3 py-1.5 text-sm font-extrabold text-indigo-600">
                  {subject.code}
                </span>

                <span className="inline-flex rounded-full border border-slate-200 bg-white/90 px-3.5 py-1.5 text-sm font-semibold text-slate-500">
                  {formatSubjectType(subject.subject_type)}
                </span>
              </div>

              <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-950 md:text-5xl">
                {subject.name}
              </h1>

              <p className="mt-3 text-lg font-medium text-slate-500">
                {subject.category ?? "Subject"}
              </p>

              {subject.description && (
                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-500 md:text-base">
                  {subject.description}
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <InfoChip label={university.short_name ?? university.name} />
                <InfoChip label={department.short_name ?? department.name} />
                <InfoChip label={semester.name} />
                <InfoChip label={college.name} />
              </div>

              {/* STATS */}
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <StatCard
                  icon={BookOpen}
                  title="Notes Units"
                  value={String(totalUnits)}
                  hint={notesAvailable ? "Available now" : "Coming soon"}
                />

                <StatCard
                  icon={ClipboardList}
                  title="Study Sections"
                  value="5"
                  hint="Notes, PYQ, Mock test, Live class, Report"
                />

                <StatCard
                  icon={Sparkles}
                  title="Current Track"
                  value={semester.name}
                  hint={`${course.short_name ?? course.name} · ${
                    department.short_name ?? department.name
                  }`}
                />
              </div>
            </div>

            {/* RIGHT */}
            <div className="relative z-10 flex h-full flex-col justify-between rounded-[28px] border border-white/60 bg-white/70 p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] backdrop-blur">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm">
                <GraduationCap className="h-8 w-8" />
              </div>

              <div className="mt-6">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-indigo-600">
                  Current Semester
                </p>

                <h3 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
                  {semester.name}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Continue your preparation with subject-specific notes,
                  study tools and exam resources.
                </p>
              </div>

              <div className="mt-6 rounded-2xl bg-indigo-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-indigo-500">
                  Academic profile
                </p>
                <p className="mt-1 text-sm font-bold text-slate-800">
                  {course.short_name ?? course.name} ·{" "}
                  {department.short_name ?? department.name}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* WORKSPACE */}
        <section className="mt-10">
          <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-indigo-600">
            Subject Workspace
          </p>

          <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-950">
                Study & prepare
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 md:text-base">
                Everything related to this subject is available from one place.
              </p>
            </div>

            <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-500">
              {notesAvailable ? `${totalUnits} note units available` : "Notes are being prepared"}
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <WorkspaceCard
              href={`/app/subjects/${subject.id}/notes`}
              icon={NotebookPen}
              title="Notes"
              description="Complete syllabus-wise notes with highlighted important topics and exam-focused explanations."
              badge={notesAvailable ? "Study Material" : "Coming soon"}
              active={notesAvailable}
              footer={notesAvailable ? `${totalUnits} units available` : "No notes uploaded yet"}
            />

            <WorkspaceCard
              href="#"
              icon={FileText}
              title="Previous Year Questions"
              description="Practice MAKAUT previous year question papers arranged by subject and year."
              badge="Coming soon"
              active={false}
              footer="Feature coming soon"
            />

            <WorkspaceCard
              href="#"
              icon={ClipboardList}
              title="Mock Tests"
              description="Attempt subject-wise mock tests and prepare for university examinations."
              badge="Coming soon"
              active={false}
              footer="Feature coming soon"
            />

            <WorkspaceCard
              href="#"
              icon={GraduationCap}
              title="Live Class"
              description="Attend live sessions, discussions and doubt-clearing classes for this subject."
              badge="Coming soon"
              active={false}
              footer="Feature coming soon"
            />

            <WorkspaceCard
              href="#"
              icon={Trophy}
              title="Progress Report"
              description="Track your learning progress, completed units and performance insights."
              badge="Coming soon"
              active={false}
              footer="Feature coming soon"
            />
          </div>
        </section>

        {/* NOTES PREVIEW */}
        <section className="mt-10">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)] md:p-7">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-indigo-600">
                  Notes Preview
                </p>

                <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">
                  {notesAvailable ? "Start with the available units" : "Notes not added yet"}
                </h3>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  {notesAvailable
                    ? "Students can open the notes section and start studying unit-wise content directly inside the website."
                    : "Once you upload note units to the database, they will appear here automatically."}
                </p>
              </div>

              {notesAvailable && (
                <Link
                  href={`/app/subjects/${subject.id}/notes`}
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-indigo-600 px-5 text-sm font-bold text-white transition hover:bg-indigo-700"
                >
                  Open notes
                </Link>
              )}
            </div>

            {notesAvailable && firstUnit ? (
              <div className="mt-6 rounded-[24px] border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-base font-extrabold text-white">
                    {firstUnit.unit_number}
                  </span>

                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-indigo-600">
                      First Unit
                    </p>
                    <h4 className="text-xl font-extrabold text-slate-950">
                      {firstUnit.title}
                    </h4>
                  </div>
                </div>

                {firstUnit.syllabus_text && (
                  <div className="mt-5 rounded-2xl bg-white/80 p-4">
                    <p className="text-sm leading-7 text-slate-600">
                      {firstUnit.syllabus_text}
                    </p>
                  </div>
                )}

                {firstUnit.important_topics && firstUnit.important_topics.length > 0 && (
                  <div className="mt-5">
                    <p className="mb-3 text-sm font-bold text-slate-800">
                      Important topics
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {firstUnit.important_topics.map((topic) => (
                        <span
                          key={topic}
                          className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-6 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
                  <BookOpen className="h-6 w-6" />
                </div>

                <h4 className="mt-4 text-lg font-bold text-slate-900">
                  No notes available yet
                </h4>

                <p className="mt-2 text-sm text-slate-500">
                  Upload note units in <span className="font-semibold">subject_note_units</span> and
                  they will appear here automatically.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

// =========================================================
// SMALL COMPONENTS
// =========================================================

function InfoChip({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
      {label}
    </span>
  );
}

function StatCard({
  icon: Icon,
  title,
  value,
  hint,
}: {
  icon: LucideIcon;
  title: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-[22px] border border-white/70 bg-white/80 p-4 shadow-[0_10px_25px_rgba(15,23,42,0.05)] backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">
            {value}
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-500">{hint}</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function WorkspaceCard({
  href,
  icon: Icon,
  title,
  description,
  badge,
  active,
  footer,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  badge: string;
  active: boolean;
  footer: string;
}) {
  const cardContent = (
    <article
      className={`group relative overflow-hidden rounded-[26px] border p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition duration-300 ${
        active
          ? "border-slate-200 bg-white hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_18px_45px_rgba(79,70,229,0.12)]"
          : "border-slate-200 bg-white/80 opacity-90"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <Icon className="h-6 w-6" />
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            active
              ? "bg-indigo-50 text-indigo-600"
              : "bg-slate-100 text-slate-400"
          }`}
        >
          {badge}
        </span>
      </div>

      <h3 className="mt-6 text-[20px] font-extrabold tracking-tight text-slate-950">
        {title}
      </h3>

      <p className="mt-3 min-h-[84px] text-sm leading-8 text-slate-500">
        {description}
      </p>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <div className="flex items-center justify-between">
          <span
            className={`text-sm font-semibold ${
              active ? "text-indigo-600" : "text-slate-400"
            }`}
          >
            {footer}
          </span>

          <div
            className={`flex h-9 w-9 items-center justify-center rounded-full ${
              active
                ? "bg-indigo-50 text-indigo-600"
                : "bg-slate-100 text-slate-400"
            }`}
          >
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </article>
  );

  if (!active || href === "#") {
    return <div>{cardContent}</div>;
  }

  return <Link href={href}>{cardContent}</Link>;
}

function formatSubjectType(value: string) {
  if (!value) return "Subject";

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
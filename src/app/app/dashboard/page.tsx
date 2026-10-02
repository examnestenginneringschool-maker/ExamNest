import Link from "next/link";

import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";

import { redirect } from "next/navigation";

import {
  BookOpen,
  ChevronRight,
  GraduationCap,
  Layers3,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

import {
  getStudentAcademicContext,
  getCurriculumSubjectsWithNotes,
} from "@/lib/academic/student-context";
import {
  SubjectCard,
  formatSubjectType,
} from "@/components/dashboard/SubjectCard";

// =========================================================
// TYPES
// =========================================================

type DashboardPageProps = {
  searchParams?: Promise<{
    q?: string;
    type?: string;
  }>;
};

// =========================================================
// PAGE
// =========================================================

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const params = searchParams
    ? await searchParams
    : {};

  const searchQuery =
    params.q?.trim().toLowerCase() ?? "";

  const typeFilter =
    params.type?.trim().toLowerCase() ?? "all";

  // Fast single-pass resolution of academic profile (1 query instead of 9)
  const context = await getStudentAcademicContext(user.id);

  if (!context) {
    redirect("/onboarding");
  }

  const { university, college, course, department, semester } = context;

  // Single-pass resolution of curriculum subjects and note counts
  const { subjects, noteUnitCount } = await getCurriculumSubjectsWithNotes(
    university.id,
    course.id,
    semester.semester_number,
    department.id
  );

  // =====================================================
  // 13. FILTERS
  // =====================================================

  const subjectTypes = Array.from(
    new Set(
      subjects
        .map(
          (subject) =>
            subject.subject_type
        )
        .filter(Boolean)
    )
  ).sort();

  const filteredSubjects =
    subjects.filter((subject) => {
      const matchesSearch =
        !searchQuery ||
        subject.name
          .toLowerCase()
          .includes(searchQuery) ||
        subject.code
          .toLowerCase()
          .includes(searchQuery) ||
        subject.category
          ?.toLowerCase()
          .includes(searchQuery);

      const matchesType =
        typeFilter === "all" ||
        subject.subject_type
          .toLowerCase() ===
          typeFilter;

      return (
        matchesSearch &&
        matchesType
      );
    });

  const subjectsWithNotes =
    subjects.filter(
      (subject) =>
        (
          noteUnitCount.get(
            subject.id
          ) ?? 0
        ) > 0
    ).length;

  const firstName =
    user.firstName || "Student";

  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="min-h-screen bg-[#f6f8fc] text-slate-950">

      {/* ================================================= */}
      {/* TOP NAVBAR */}
      {/* ================================================= */}

      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">

        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center justify-between px-5 md:px-8">

          <Link
            href="/app/dashboard"
            className="text-lg font-extrabold tracking-tight text-indigo-600"
          >
            ExamNest
          </Link>

          <div className="flex items-center gap-3">

            <div className="hidden text-right sm:block">

              <p className="text-xs font-medium text-slate-400">
                Student
              </p>

              <p className="text-sm font-semibold text-slate-700">
                {firstName}
              </p>

            </div>

            <UserButton />

          </div>

        </div>

      </header>

      {/* ================================================= */}
      {/* MAIN */}
      {/* ================================================= */}

      <div className="mx-auto max-w-[1500px] px-5 py-7 md:px-8 md:py-9">

        {/* ================================================= */}
        {/* HERO */}
        {/* ================================================= */}

        <section className="relative overflow-hidden rounded-[30px] border border-indigo-100 bg-gradient-to-br from-[#eef1ff] via-[#f7f8ff] to-[#eef7ff] shadow-[0_20px_60px_rgba(79,70,229,0.08)]">

          {/* Decorative circles */}

          <div className="pointer-events-none absolute right-[30%] top-8 h-24 w-24 rounded-full bg-indigo-300/20 blur-2xl" />

          <div className="pointer-events-none absolute right-20 top-0 h-64 w-64 rounded-full bg-violet-300/20 blur-3xl" />

          <div className="grid min-h-[330px] lg:grid-cols-[1fr_420px]">

            {/* ============================================= */}
            {/* HERO LEFT */}
            {/* ============================================= */}

            <div className="relative z-10 flex flex-col justify-between p-7 md:p-9 lg:p-10">

              <div>

                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-indigo-600">

                  <Sparkles className="h-4 w-4" />

                  Student Dashboard

                </div>

                <h1 className="mt-4 max-w-3xl text-3xl font-extrabold tracking-[-0.04em] text-slate-950 sm:text-4xl lg:text-[46px] lg:leading-[1.05]">

                  Welcome back,{" "}

                  <span className="text-indigo-600">
                    {firstName}
                  </span>

                  <span className="ml-2">
                    👋
                  </span>

                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 md:text-base">
                  Keep learning, keep growing.
                  Here&apos;s an overview of your
                  academic journey.
                </p>

              </div>

              {/* =========================================== */}
              {/* ACADEMIC PROFILE */}
              {/* =========================================== */}

              <div className="mt-8 max-w-[980px] rounded-[24px] border border-white/80 bg-white/90 p-4 shadow-[0_12px_35px_rgba(15,23,42,0.06)] backdrop-blur md:p-5">

                <div className="flex flex-col gap-5 md:flex-row md:items-center">

                  {/* Icon */}

                  <div className="flex h-[74px] w-[74px] shrink-0 items-center justify-center rounded-[20px] bg-indigo-50 text-indigo-600">

                    <GraduationCap className="h-9 w-9" />

                  </div>

                  {/* Profile */}

                  <div className="min-w-0 flex-1">

                    <p className="text-xs font-semibold text-slate-500">
                      Academic profile
                    </p>

                    <h2 className="mt-1.5 text-xl font-extrabold tracking-tight text-slate-950 sm:text-2xl">

                      {course.short_name ??
                        course.name}

                      {" · "}

                      {department.short_name ??
                        department.name}

                      {" · "}

                      {semester.name}

                    </h2>

                    <p className="mt-1.5 truncate text-sm text-slate-500">

                      {university.short_name ??
                        university.name}

                      {" · "}

                      {college.name}

                    </p>

                  </div>

                  {/* Divider */}

                  <div className="hidden h-16 w-px bg-slate-200 md:block" />

                  {/* Current semester */}

                  <div className="flex min-w-[250px] items-center justify-between rounded-[18px] bg-indigo-50 px-5 py-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">

                        <Layers3 className="h-5 w-5" />

                      </div>

                      <div>

                        <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-indigo-600">
                          Current Semester
                        </p>

                        <p className="mt-1 text-lg font-extrabold text-slate-950">
                          {semester.name}
                        </p>

                      </div>

                    </div>

                    <ChevronRight className="h-5 w-5 text-indigo-500" />

                  </div>

                </div>

              </div>

            </div>

            {/* ============================================= */}
            {/* HERO ILLUSTRATION */}
            {/* ============================================= */}

            <div className="relative hidden overflow-hidden lg:block">

              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-indigo-100/30 to-violet-200/40" />

              <div className="absolute right-12 top-7 h-52 w-52 rounded-full border border-indigo-200/60 bg-white/30" />

              <div className="absolute right-[265px] top-[82px] h-5 w-5 rounded-full bg-indigo-300/40" />

              {/* BOOK STACK */}

              <div className="absolute bottom-[72px] right-[115px]">

                <div className="relative">

                  <div className="h-10 w-52 rounded-xl border border-indigo-200 bg-indigo-500 shadow-lg" />

                  <div className="-mt-1 ml-3 h-11 w-48 rounded-xl border border-violet-200 bg-violet-500 shadow-lg" />

                  <div className="-mt-1 ml-7 flex h-12 w-44 items-center justify-center rounded-xl border border-indigo-100 bg-white shadow-lg">

                    <BookOpen className="h-5 w-5 text-indigo-500" />

                  </div>

                  <div className="absolute -top-[92px] left-8 flex h-32 w-32 items-center justify-center text-slate-900">

                    <GraduationCap
                      strokeWidth={1.5}
                      className="h-28 w-28 fill-slate-900 text-slate-900"
                    />

                  </div>

                </div>

              </div>

              {/* Quote */}

              <div className="absolute right-8 top-[78px] w-[130px] rotate-[-4deg]">

                <p className="text-[25px] font-semibold italic leading-[1.25] text-indigo-600">
                  Small
                  <br />
                  Steps
                  <br />
                  Big Results
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* ================================================= */}
        {/* SUBJECTS */}
        {/* ================================================= */}

        <section className="mt-9">

          {/* =============================================== */}
          {/* TITLE + CONTROLS */}
          {/* =============================================== */}

          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">

            <div>

              <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-indigo-600">
                Your Curriculum
              </p>

              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
                My Subjects
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">

                Showing{" "}

                <span className="font-semibold text-slate-700">
                  {department.short_name ??
                    department.name}
                </span>

                {" "}

                {semester.name}

                {" "}subjects from the{" "}

                <span className="font-semibold text-slate-700">
                  {university.short_name ??
                    university.name}
                </span>

                {" "}curriculum.

              </p>

            </div>

            {/* FILTER BAR */}

            <form
              action="/app/dashboard"
              method="GET"
              className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto"
            >

              {/* SEARCH */}

              <div className="relative sm:w-[300px]">

                <Search className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />

                <input
                  type="search"
                  name="q"
                  defaultValue={
                    params.q ?? ""
                  }
                  placeholder="Search subjects..."
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                />

              </div>

              {/* TYPE */}

              <select
                name="type"
                defaultValue={
                  params.type ?? "all"
                }
                className="h-12 min-w-[170px] rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 outline-none focus:border-indigo-300"
              >

                <option value="all">
                  All Subjects
                </option>

                {subjectTypes.map(
                  (type) => (
                    <option
                      key={type}
                      value={type.toLowerCase()}
                    >
                      {formatSubjectType(
                        type
                      )}
                    </option>
                  )
                )}

              </select>

              <button
                type="submit"
                aria-label="Apply filters"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm transition hover:bg-indigo-700"
              >
                <SlidersHorizontal className="h-[18px] w-[18px]" />
              </button>

            </form>

          </div>

          {/* =============================================== */}
          {/* SMALL STATUS BAR */}
          {/* =============================================== */}

          <div className="mt-6 flex flex-wrap items-center gap-2">

            <span className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-500">
              {subjects.length}{" "}
              {subjects.length === 1
                ? "Subject"
                : "Subjects"}
            </span>

            {subjectsWithNotes > 0 && (
              <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3.5 py-2 text-xs font-semibold text-indigo-600">
                {subjectsWithNotes} with notes
              </span>
            )}

            <span className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-500">
              {semester.name}
            </span>

          </div>

          {/* ================================================= */}
          {/* EMPTY */}
          {/* ================================================= */}

          {filteredSubjects.length === 0 ? (

            <div className="mt-6 rounded-[24px] border border-dashed border-slate-300 bg-white p-12 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">

                <BookOpen className="h-6 w-6" />

              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-950">
                No subjects found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Try changing your search or
                subject type filter.
              </p>

            </div>

          ) : (

            // =================================================
            // SUBJECT GRID
            // =================================================

            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">

              {filteredSubjects.map(
                (subject) => (

                  <SubjectCard
                    key={subject.id}
                    subject={subject}
                    noteUnits={
                      noteUnitCount.get(
                        subject.id
                      ) ?? 0
                    }
                    semesterName={
                      semester.name
                    }
                  />

                )
              )}

            </div>

          )}

        </section>

      </div>

    </main>
  );
}

import Link from "next/link";

import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  FileText,
  GraduationCap,
  LayoutDashboard,
  PlayCircle,
  Sparkles,
  Target,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f8f9fc] text-slate-950">
      {/* ===================================================== */}
      {/* NAVBAR */}
      {/* ===================================================== */}

      <header className="relative z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          {/* LOGO */}

          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-[0_10px_30px_rgba(79,70,229,0.25)]">
              <GraduationCap className="h-5 w-5" />
            </div>

            <div>
              <p className="text-lg font-black tracking-[-0.03em] text-slate-950">
                ExamNest
              </p>

              <p className="-mt-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                Student Learning Platform
              </p>
            </div>
          </Link>

          {/* NAV LINKS */}

          <nav className="hidden items-center gap-8 lg:flex">
            <a
              href="#platform"
              className="text-sm font-semibold text-slate-500 transition hover:text-slate-950"
            >
              Platform
            </a>

            <a
              href="#features"
              className="text-sm font-semibold text-slate-500 transition hover:text-slate-950"
            >
              Features
            </a>

            <a
              href="#workflow"
              className="text-sm font-semibold text-slate-500 transition hover:text-slate-950"
            >
              How it works
            </a>
          </nav>

          {/* ACTIONS */}

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/sign-in"
              className="hidden rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 sm:inline-flex"
            >
              Sign In
            </Link>

            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 sm:px-5"
            >
              Get Started

              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* ===================================================== */}
      {/* HERO */}
      {/* ===================================================== */}

      <section className="relative">
        {/* BACKGROUND */}

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[5%] top-24 h-[420px] w-[420px] rounded-full bg-indigo-300/20 blur-[120px]" />

          <div className="absolute right-[5%] top-10 h-[430px] w-[430px] rounded-full bg-violet-300/20 blur-[130px]" />

          <div className="absolute left-1/2 top-[500px] h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-blue-200/20 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-[1440px] px-5 pb-20 pt-16 sm:px-8 md:pt-20 lg:px-12 lg:pb-28 lg:pt-24">
          {/* HERO CONTENT */}

          <div className="mx-auto max-w-5xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-white/80 px-4 py-2 shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4 text-indigo-600" />

              <span className="text-xs font-bold text-indigo-700 sm:text-sm">
                One organized learning space for your entire semester
              </span>
            </div>

            <h1 className="mx-auto mt-7 max-w-5xl text-[44px] font-black leading-[1.04] tracking-[-0.055em] text-slate-950 sm:text-6xl md:text-7xl lg:text-[78px]">
              Study smarter.
              <br />

              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 bg-clip-text text-transparent">
                Stay ahead.
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-2xl text-base font-medium leading-8 text-slate-500 sm:text-lg">
              ExamNest brings your syllabus, subject notes,
              previous year questions, mock tests and academic
              resources into one clear learning workflow.
            </p>

            {/* CTA */}

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/sign-up"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-7 py-4 text-sm font-bold text-white shadow-[0_15px_40px_rgba(79,70,229,0.28)] transition hover:-translate-y-0.5 hover:bg-indigo-700 sm:w-auto"
              >
                Start learning

                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>

              <Link
                href="/sign-in"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-7 py-4 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 sm:w-auto"
              >
                <PlayCircle className="h-4 w-4" />

                Student login
              </Link>
            </div>

            {/* TRUST LINE */}

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Semester-based learning
              </span>

              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Structured curriculum
              </span>

              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Exam-focused resources
              </span>
            </div>
          </div>

          {/* ================================================= */}
          {/* PRODUCT PREVIEW */}
          {/* ================================================= */}

          <div
            id="platform"
            className="relative mx-auto mt-16 max-w-6xl sm:mt-20"
          >
            {/* glow */}

            <div className="absolute inset-x-20 bottom-0 top-12 rounded-[50px] bg-indigo-500/15 blur-[80px]" />

            <div className="relative overflow-hidden rounded-[30px] border border-white/80 bg-white/90 p-2 shadow-[0_35px_100px_rgba(15,23,42,0.14)] backdrop-blur-xl sm:p-3">
              <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-[#f8f9fc]">
                {/* MOCK TOPBAR */}

                <div className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <GraduationCap className="h-4 w-4 text-indigo-600" />
                    ExamNest Dashboard
                  </div>

                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500" />
                </div>

                {/* MOCK DASHBOARD */}

                <div className="grid min-h-[500px] lg:grid-cols-[220px_1fr]">
                  {/* SIDEBAR */}

                  <aside className="hidden border-r border-slate-200 bg-white p-5 lg:block">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                      Workspace
                    </p>

                    <div className="mt-5 space-y-2">
                      <MockNav
                        icon={LayoutDashboard}
                        label="Dashboard"
                        active
                      />

                      <MockNav
                        icon={BookOpen}
                        label="My Subjects"
                      />

                      <MockNav
                        icon={FileText}
                        label="Notes"
                      />

                      <MockNav
                        icon={BrainCircuit}
                        label="Mock Tests"
                      />
                    </div>

                    <div className="mt-8 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 p-4">
                      <Target className="h-5 w-5 text-indigo-600" />

                      <p className="mt-3 text-xs font-bold text-slate-900">
                        Stay focused
                      </p>

                      <p className="mt-1 text-[11px] leading-5 text-slate-500">
                        Everything you need for your semester,
                        organized in one place.
                      </p>
                    </div>
                  </aside>

                  {/* CONTENT */}

                  <div className="p-5 sm:p-8">
                    <div className="rounded-[24px] bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white sm:p-8">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-100">
                        Student dashboard
                      </p>

                      <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
                        Welcome back 👋
                      </h2>

                      <p className="mt-2 max-w-xl text-sm leading-6 text-indigo-100">
                        Continue learning from your semester
                        subjects and academic resources.
                      </p>

                      <div className="mt-6 flex flex-wrap gap-2">
                        <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold">
                          B.Tech
                        </span>

                        <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold">
                          Semester 1
                        </span>

                        <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold">
                          Physics Stream
                        </span>
                      </div>
                    </div>

                    <div className="mt-7 flex items-end justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600">
                          Your curriculum
                        </p>

                        <h3 className="mt-1 text-xl font-black tracking-tight text-slate-950">
                          Current subjects
                        </h3>
                      </div>

                      <span className="hidden text-xs font-semibold text-slate-400 sm:block">
                        Semester 1
                      </span>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      <SubjectPreview
                        icon={BookOpen}
                        code="BS-PH101"
                        title="Physics-I"
                        subtitle="10 study units"
                      />

                      <SubjectPreview
                        icon={Target}
                        code="BS-M101"
                        title="Mathematics"
                        subtitle="Semester syllabus"
                      />

                      <SubjectPreview
                        icon={BrainCircuit}
                        code="ES-EE101"
                        title="Basic Electrical"
                        subtitle="Structured resources"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================== */}
      {/* FEATURES */}
      {/* ===================================================== */}

      <section
        id="features"
        className="border-y border-slate-200 bg-white"
      >
        <div className="mx-auto max-w-[1300px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">
              Built around the student
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl md:text-5xl">
              Everything needed to prepare,
              <br className="hidden sm:block" />
              without the clutter.
            </h2>

            <p className="mt-5 text-base leading-8 text-slate-500">
              ExamNest connects the complete academic structure
              with learning resources designed around each
              student's actual curriculum.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={BookOpen}
              title="Structured Notes"
              description="Chapter-wise and topic-wise notes organized directly from the student's syllabus."
            />

            <FeatureCard
              icon={FileText}
              title="Previous Year Questions"
              description="Subject-specific previous year papers and exam preparation resources."
            />

            <FeatureCard
              icon={BrainCircuit}
              title="Mock Tests"
              description="Practice assessments designed to support semester preparation and revision."
            />

            <FeatureCard
              icon={GraduationCap}
              title="Academic Structure"
              description="University, college, department, course and semester are connected in one academic flow."
            />

            <FeatureCard
              icon={Target}
              title="Exam Focus"
              description="Important concepts, formulas and revision points are highlighted where students need them."
            />

            <FeatureCard
              icon={LayoutDashboard}
              title="Student Dashboard"
              description="A personalized learning dashboard showing only the subjects relevant to the student."
            />
          </div>
        </div>
      </section>

      {/* ===================================================== */}
      {/* WORKFLOW */}
      {/* ===================================================== */}

      <section
        id="workflow"
        className="bg-[#f8f9fc]"
      >
        <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">
                Simple by design
              </p>

              <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
                From university to subject,
                everything is connected.
              </h2>

              <p className="mt-5 max-w-lg text-base leading-8 text-slate-500">
                Students choose their academic profile once.
                ExamNest then builds the learning experience around
                the correct semester and curriculum.
              </p>

              <Link
                href="/sign-up"
                className="mt-7 inline-flex items-center gap-2 text-sm font-black text-indigo-600 transition hover:gap-3"
              >
                Explore ExamNest

                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.07)] sm:p-8">
              <WorkflowItem
                number="01"
                title="Choose your university"
                description="Start with the institution connected to your academic program."
              />

              <WorkflowConnector />

              <WorkflowItem
                number="02"
                title="Select college & course"
                description="ExamNest narrows the curriculum to the correct college and program."
              />

              <WorkflowConnector />

              <WorkflowItem
                number="03"
                title="Choose department & semester"
                description="Students are connected to the right academic track."
              />

              <WorkflowConnector />

              <WorkflowItem
                number="04"
                title="Start learning"
                description="The dashboard automatically shows the relevant subjects and resources."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================== */}
      {/* FINAL CTA */}
      {/* ===================================================== */}

      <section className="px-5 pb-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1200px] overflow-hidden rounded-[32px] bg-slate-950 px-6 py-12 text-center text-white sm:px-10 lg:py-16">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
            <Sparkles className="h-5 w-5 text-indigo-300" />
          </div>

          <h2 className="mt-6 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
            A clearer way to prepare for your semester.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
            Join ExamNest and bring your subjects, syllabus
            and study resources into one organized workspace.
          </p>

          <Link
            href="/sign-up"
            className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-black text-slate-950 transition hover:bg-indigo-50"
          >
            Get Started

            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ===================================================== */}
      {/* FOOTER */}
      {/* ===================================================== */}

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1300px] flex-col gap-4 px-5 py-8 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <div className="flex items-center gap-2 font-bold text-slate-700">
            <GraduationCap className="h-4 w-4 text-indigo-600" />
            ExamNest
          </div>

          <p>
            Built for structured academic learning.
          </p>
        </div>
      </footer>
    </main>
  );
}

/* ========================================================= */
/* MOCK NAV */
/* ========================================================= */

function MockNav({
  icon: Icon,
  label,
  active = false,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold ${
        active
          ? "bg-indigo-50 text-indigo-700"
          : "text-slate-500"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </div>
  );
}

/* ========================================================= */
/* SUBJECT PREVIEW */
/* ========================================================= */

function SubjectPreview({
  icon: Icon,
  code,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  code: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
        <Icon className="h-5 w-5 text-indigo-600" />
      </div>

      <p className="mt-5 text-[10px] font-black uppercase tracking-[0.14em] text-indigo-600">
        {code}
      </p>

      <h4 className="mt-1 text-base font-black text-slate-950">
        {title}
      </h4>

      <p className="mt-1 text-xs font-medium text-slate-400">
        {subtitle}
      </p>
    </div>
  );
}

/* ========================================================= */
/* FEATURE CARD */
/* ========================================================= */

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-[24px] border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
        <Icon className="h-5 w-5" />
      </div>

      <h3 className="mt-5 text-lg font-black tracking-tight text-slate-950">
        {title}
      </h3>

      <p className="mt-2 text-sm font-medium leading-7 text-slate-500">
        {description}
      </p>
    </div>
  );
}

/* ========================================================= */
/* WORKFLOW */
/* ========================================================= */

function WorkflowItem({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-xs font-black text-white shadow-[0_8px_20px_rgba(79,70,229,0.24)]">
        {number}
      </div>

      <div>
        <h3 className="font-black text-slate-950">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function WorkflowConnector() {
  return (
    <div className="ml-5 h-7 border-l border-dashed border-indigo-200" />
  );
}
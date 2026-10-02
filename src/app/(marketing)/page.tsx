import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
  ArrowRight,
  CheckCircle2,
  BadgeCheck,
  Sigma,
  Lock,
  BookOpen,
  Waves,
  Percent,
  Zap,
  Code2,
  FolderX,
  FileSpreadsheet,
  EyeOff,
  Globe2,
} from "lucide-react";
import { DashboardTiltPreview } from "@/components/marketing/DashboardTiltPreview";
import { Logo } from "@/components/brand/Logo";

export default async function HomePage() {
  const { userId } = await auth();
  const isAuthenticated = Boolean(userId);
  const user = isAuthenticated ? await currentUser() : null;

  const studentName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.firstName ||
      "Student"
    : "Student";
  const studentPhoto = user?.imageUrl || null;

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#171b2a] font-sans selection:bg-[#402ae6] selection:text-white">
      {/* ===================================================== */}
      {/* 1. TOP NAVIGATION HEADER (Auth & Sign-Up Aware)        */}
      {/* ===================================================== */}
      <header className="fixed top-0 w-full z-50 bg-[#faf8ff]/85 backdrop-blur-xl border-b border-[#e2e5f0]/80 shadow-[0_1px_8px_rgba(24,24,41,0.03)] transition-all duration-300">
        <div className="h-20 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="group flex items-center">
            <Logo size="md" subtitle="The Engineering School" />
          </Link>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-[#5d5c73]">
            <a
              href="#problem-architecture"
              className="hover:text-[#402ae6] transition-colors py-1 hover:-translate-y-0.5 inline-block"
            >
              Curriculum Architecture
            </a>
            <a
              href="#curriculum-matrix"
              className="hover:text-[#402ae6] transition-colors py-1 hover:-translate-y-0.5 inline-block"
            >
              Syllabus Matrix
            </a>
            <a
              href="#open-charter"
              className="hover:text-[#402ae6] transition-colors py-1 hover:-translate-y-0.5 inline-block"
            >
              Contributors
            </a>
          </nav>

          {/* Auth Aware Action Buttons */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/app/dashboard"
                  className="inline-flex items-center gap-2 rounded-full bg-[#402ae6] hover:bg-[#341ec7] px-4 sm:px-5 py-2.5 text-xs font-bold text-white shadow-[0_4px_14px_rgba(64,42,230,0.25)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>

                <div className="flex items-center gap-2 pl-2 border-l border-[#e2e5f0]">
                  <UserButton />
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-bold text-[#171b2a] leading-tight">
                      {studentName}
                    </div>
                    <div className="text-[10px] text-[#717588]">
                      CSE Student
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  href="/sign-in"
                  className="px-4 py-2 rounded-full text-xs font-bold text-[#171b2a] hover:bg-[#ebedff] transition-colors"
                >
                  Sign In
                </Link>

                <Link
                  href="/sign-up"
                  className="btn-shimmer inline-flex items-center gap-1.5 rounded-full bg-[#f6c844] hover:bg-[#402ae6] text-[#6c5400] hover:text-white px-4 sm:px-5 py-2.5 text-xs font-bold shadow-sm hover:shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>Get Started</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ===================================================== */}
      {/* 2. HERO SECTION & INTERACTIVE 3D PERSPECTIVE PREVIEW   */}
      {/* ===================================================== */}
      <main className="w-full pt-20">
        <section className="relative w-full pt-12 pb-20 px-6 lg:px-12 overflow-hidden bg-[#faf8ff]">
          {/* Atmospheric Ambient Glows with gentle floating animations */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[850px] h-[380px] bg-[#f6c844]/20 rounded-full blur-3xl pointer-events-none -z-10 aura-glow-left" />
          <div className="absolute top-48 right-10 w-[550px] h-[340px] bg-[#e3dfff]/40 rounded-full blur-3xl pointer-events-none -z-10 aura-glow-right" />

          <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
            {/* Grounded Policy Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#e4e7fd]/70 border border-[#dee1f7] shadow-xs mb-6 hover:shadow-sm transition-shadow">
              <span className="w-2 h-2 rounded-full bg-[#402ae6] animate-pulse" />
              <span className="text-xs font-bold text-[#171b2a]">
                Curricular Standard
              </span>
              <span className="text-[#807662]">•</span>
              <span className="text-xs text-[#4e4634]">
                Aligned with State &amp; Central Universities (MAKAUT)
              </span>
            </div>

            {/* Core Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-[54px] lg:leading-[62px] font-black text-[#171b2a] max-w-4xl tracking-tight">
              The <span className="text-[#5B4DFF]">engineering curriculum</span>
              , organized the way{" "}
              <span className="text-[#402ae6] underline decoration-[#f6c844] decoration-4 underline-offset-4">
                universities actually examine
              </span>
              .
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-[#5d5c73] max-w-3xl mt-5 leading-relaxed">
              An academic platform uniting official university syllabus
              blueprints, verified step-by-step mathematical derivations, and
              past exam question archives into one structured workspace.
            </p>

            {/* Action Buttons: Sign-Up vs Signed-In */}
            <div className="flex flex-wrap items-center justify-center gap-3.5 mt-8">
              {isAuthenticated ? (
                <Link
                  href="/app/dashboard"
                  className="btn-shimmer px-8 py-3.5 rounded-full bg-[#f6c844] text-[#6c5400] font-bold text-sm shadow-md hover:shadow-lg hover:bg-[#402ae6] hover:text-white transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                >
                  <span>Go to the Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/sign-up"
                    className="btn-shimmer px-8 py-3.5 rounded-full bg-[#f6c844] text-[#6c5400] font-bold text-sm shadow-md hover:shadow-xl hover:bg-[#402ae6] hover:text-white transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                  >
                    <span>Get Started Free</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    href="/sign-in"
                    className="px-6 py-3.5 rounded-full bg-white border border-[#e2e5f0] text-[#171b2a] font-bold text-sm shadow-xs hover:bg-[#ebedff] transition-all transform hover:-translate-y-0.5"
                  >
                    Student Sign In
                  </Link>
                </>
              )}
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-y-3 gap-x-8 mt-10 text-[#5d5c73] text-xs font-semibold">
              <div className="flex items-center gap-2 group transition-transform hover:-translate-y-0.5 cursor-default">
                <BadgeCheck className="h-4 w-4 text-[#402ae6]" />
                <span>University Board Regulations (MAKAUT)</span>
              </div>
              <div className="flex items-center gap-2 group transition-transform hover:-translate-y-0.5 cursor-default">
                <Sigma className="h-4 w-4 text-[#402ae6]" />
                <span>Verified Mathematical Steps &amp; Schematics</span>
              </div>
              <div className="flex items-center gap-2 group transition-transform hover:-translate-y-0.5 cursor-default">
                <Lock className="h-4 w-4 text-[#755b00]" />
                <span>Secured &amp; Trusted Environment</span>
              </div>
            </div>
          </div>

          {/* Interactive 3D Tilt Showcase Component (Smooth, Low-Sensitivity) */}
          <DashboardTiltPreview
            studentName={studentName}
            studentPhoto={studentPhoto}
            isAuthenticated={isAuthenticated}
          />
        </section>

        {/* ===================================================== */}
        {/* 3. ROOT CAUSE ANALYSIS / PROBLEM ARCHITECTURE        */}
        {/* ===================================================== */}
        <section
          id="problem-architecture"
          className="w-full py-20 px-6 lg:px-12 bg-[#f3f3ff]"
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#402ae6] font-bold">
                  Root Cause Analysis
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171b2a] mt-1 tracking-tight">
                  The Engineering Academic Disconnect
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#5d5c73] max-w-md leading-relaxed">
                Why 70% of first-year engineering students study obsolete
                syllabi, miss critical mark-bearing derivations, and scramble
                through unstructured cloud drives.
              </p>
            </div>

            {/* Problem vs ExamNest Resolution Architecture */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="p-6 rounded-2xl bg-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between border border-transparent hover:border-rose-100">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-6">
                    <FolderX className="h-6 w-6" />
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wide text-rose-600 mb-1">
                    Structural Flaw 01
                  </div>
                  <h3 className="text-lg font-bold text-[#171b2a] mb-2.5">
                    Fragmented Study Drives
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5d5c73] leading-relaxed mb-6">
                    Study material is scattered across random WhatsApp links,
                    corrupt Google Drive folders, and illegible phone scans with
                    missing intermediate steps.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#f7f8fc] border border-[#e8ebf6]">
                  <div className="flex items-center gap-1.5 text-[#402ae6] font-bold text-xs mb-1">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>The ExamNest Solution</span>
                  </div>
                  <p className="text-xs text-[#171b2a] leading-relaxed">
                    Unified subject repositories indexed strictly by official
                    AICTE course codes, checked for OCR clarity and mobile
                    legibility.
                  </p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="p-6 rounded-2xl bg-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between border border-transparent hover:border-rose-100">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-6">
                    <FileSpreadsheet className="h-6 w-6" />
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wide text-rose-600 mb-1">
                    Structural Flaw 02
                  </div>
                  <h3 className="text-lg font-bold text-[#171b2a] mb-2.5">
                    Syllabus Drift &amp; Blind Derivations
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5d5c73] leading-relaxed mb-6">
                    Students prepare from non-curriculum YouTube playlists that
                    skip university-specific derivation notations and diagram
                    conventions.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#f7f8fc] border border-[#e8ebf6]">
                  <div className="flex items-center gap-1.5 text-[#402ae6] font-bold text-xs mb-1">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>The ExamNest Solution</span>
                  </div>
                  <p className="text-xs text-[#171b2a] leading-relaxed">
                    1-to-1 regulation mapping. Every single mathematical formula
                    is followed by step-by-step calculus proofs formatted for
                    university examiners.
                  </p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="p-6 rounded-2xl bg-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between border border-transparent hover:border-rose-100">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-6">
                    <EyeOff className="h-6 w-6" />
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wide text-rose-600 mb-1">
                    Structural Flaw 03
                  </div>
                  <h3 className="text-lg font-bold text-[#171b2a] mb-2.5">
                    Exam Pattern Blindness
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5d5c73] leading-relaxed mb-6">
                    Students spend weeks mastering modules that carry only 5
                    marks, while 15-mark compulsory multi-part questions get
                    neglected until exam eve.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#f7f8fc] border border-[#e8ebf6]">
                  <div className="flex items-center gap-1.5 text-[#402ae6] font-bold text-xs mb-1">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>The ExamNest Solution</span>
                  </div>
                  <p className="text-xs text-[#171b2a] leading-relaxed">
                    10-year question frequency matrix mapping past university
                    question patterns directly to specific syllabus sub-clauses.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================== */}
        {/* 4. FOUNDATION SEMESTER CURRICULUM MATRIX             */}
        {/* ===================================================== */}
        <section
          id="curriculum-matrix"
          className="w-full py-20 px-6 lg:px-12 bg-[#faf8ff]"
        >
          <div className="max-w-7xl mx-auto">
            <div className="max-w-2xl mb-12">
              <span className="text-xs uppercase tracking-wider text-[#402ae6] font-bold">
                Verified Engineering Modules
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#171b2a] mt-1 tracking-tight">
                Foundation Semester Curriculum Matrix
              </h2>
              <p className="text-xs sm:text-sm text-[#5d5c73] mt-2">
                Official AICTE curriculum modules curated with direct step
                derivations, formula sheets, and past 10-year semester exam
                solutions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Subject 1: BS-PH101 */}
              <div className="p-6 rounded-2xl bg-white shadow-xs hover:shadow-md transition-shadow border border-[#e5e8f4] hover:border-[#402ae6]/30">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#e3dfff] flex items-center justify-center text-[#110068]">
                      <Waves className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-[11px] text-[#402ae6] font-bold">
                        BS-PH101 · 4 CREDITS
                      </span>
                      <h3 className="text-base font-bold text-[#171b2a]">
                        Physics-I (Electromagnetism &amp; Optics)
                      </h3>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#ebedff] text-[10px] font-semibold text-[#171b2a]">
                    MAKAUT
                  </span>
                </div>

                <div className="mt-6 space-y-2.5">
                  <div className="p-3 rounded-xl bg-[#faf8ff] border border-[#e8ebf6] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#171b2a]">
                        Module 1: Classical Mechanics &amp; Oscillations
                      </div>
                      <div className="text-[11px] text-[#5d5c73]">
                        Damped and forced harmonic oscillations, Q-factor
                        derivations
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#402ae6] bg-[#edeaff] px-2 py-0.5 rounded">
                      Verified
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#faf8ff] border border-[#e8ebf6] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#171b2a]">
                        Module 2: Electromagnetic Wave Theory
                      </div>
                      <div className="text-[11px] text-[#5d5c73]">
                        Continuity equation, Maxwell’s equations in differential
                        &amp; integral forms
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#402ae6] bg-[#edeaff] px-2 py-0.5 rounded">
                      Verified
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#faf8ff] border border-[#e8ebf6] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#171b2a]">
                        Module 3: Wave Optics &amp; Laser Physics
                      </div>
                      <div className="text-[11px] text-[#5d5c73]">
                        Interference by division of amplitude, Fresnel &amp;
                        Fraunhofer diffraction
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#402ae6] bg-[#edeaff] px-2 py-0.5 rounded">
                      Verified
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#f0f2f8]">
                  <div className="flex items-center gap-1.5 text-xs text-[#717588]">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>18 Detailed Derivations</span>
                  </div>
                  <Link
                    href={isAuthenticated ? "/app/dashboard" : "/sign-up"}
                    className="text-xs font-bold text-[#402ae6] hover:underline flex items-center gap-1 group"
                  >
                    <span>Open Blueprint</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>

              {/* Subject 2: BS-M101 */}
              <div className="p-6 rounded-2xl bg-white shadow-xs hover:shadow-md transition-shadow border border-[#e5e8f4] hover:border-[#f6c844]/50">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#ffdf91] flex items-center justify-center text-[#241a00]">
                      <Percent className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-[11px] text-[#755b00] font-bold">
                        BS-M101 · 4 CREDITS
                      </span>
                      <h3 className="text-base font-bold text-[#171b2a]">
                        Mathematics-IA (Calculus &amp; Algebra)
                      </h3>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#ebedff] text-[10px] font-semibold text-[#171b2a]">
                    AICTE MODEL
                  </span>
                </div>

                <div className="mt-6 space-y-2.5">
                  <div className="p-3 rounded-xl bg-[#faf8ff] border border-[#e8ebf6] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#171b2a]">
                        Module 1: Differential Calculus &amp; Series
                      </div>
                      <div className="text-[11px] text-[#5d5c73]">
                        Rolle&apos;s Theorem, Cauchy MVT, Taylor&apos;s &amp;
                        Maclaurin expansions
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#755b00] bg-[#ffdf91]/40 px-2 py-0.5 rounded">
                      Verified
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#faf8ff] border border-[#e8ebf6] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#171b2a]">
                        Module 2: Multivariable Calculus &amp; Extrema
                      </div>
                      <div className="text-[11px] text-[#5d5c73]">
                        Partial derivatives, Euler&apos;s theorem, Jacobians
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#755b00] bg-[#ffdf91]/40 px-2 py-0.5 rounded">
                      Verified
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#faf8ff] border border-[#e8ebf6] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#171b2a]">
                        Module 3: Matrices &amp; Linear Systems
                      </div>
                      <div className="text-[11px] text-[#5d5c73]">
                        Rank by echelon form, Cayley-Hamilton theorem,
                        Diagonalization
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#755b00] bg-[#ffdf91]/40 px-2 py-0.5 rounded">
                      Verified
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#f0f2f8]">
                  <div className="flex items-center gap-1.5 text-xs text-[#717588]">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>24 Step-by-Step Proofs</span>
                  </div>
                  <Link
                    href={isAuthenticated ? "/app/dashboard" : "/sign-up"}
                    className="text-xs font-bold text-[#755b00] hover:underline flex items-center gap-1 group"
                  >
                    <span>Open Blueprint</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>

              {/* Subject 3: ES-EE101 */}
              <div className="p-6 rounded-2xl bg-white shadow-xs hover:shadow-md transition-shadow border border-[#e5e8f4] hover:border-emerald-500/30">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#e2e0fc] flex items-center justify-center text-[#1a1a2d]">
                      <Zap className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <span className="text-[11px] text-emerald-700 font-bold">
                        ES-EE101 · 4 CREDITS
                      </span>
                      <h3 className="text-base font-bold text-[#171b2a]">
                        Basic Electrical Engineering
                      </h3>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#ebedff] text-[10px] font-semibold text-[#171b2a]">
                    MAKAUT
                  </span>
                </div>

                <div className="mt-6 space-y-2.5">
                  <div className="p-3 rounded-xl bg-[#faf8ff] border border-[#e8ebf6] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#171b2a]">
                        Module 1: DC Circuit Analysis
                      </div>
                      <div className="text-[11px] text-[#5d5c73]">
                        Mesh &amp; nodal analysis, Thevenin, Norton, and Maximum
                        Power theorems
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Verified
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#faf8ff] border border-[#e8ebf6] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#171b2a]">
                        Module 2: AC Fundamentals &amp; Phasors
                      </div>
                      <div className="text-[11px] text-[#5d5c73]">
                        Sinusoidal voltages, RMS &amp; Average values, R-L-C
                        resonance
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Verified
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#faf8ff] border border-[#e8ebf6] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#171b2a]">
                        Module 3: Transformers &amp; Electrical Machines
                      </div>
                      <div className="text-[11px] text-[#5d5c73]">
                        Single phase transformer circuit, OC/SC tests &amp;
                        efficiency
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Verified
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#f0f2f8]">
                  <div className="flex items-center gap-1.5 text-xs text-[#717588]">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>15 Circuit Schematics</span>
                  </div>
                  <Link
                    href={isAuthenticated ? "/app/dashboard" : "/sign-up"}
                    className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 group"
                  >
                    <span>Open Blueprint</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>

              {/* Subject 4: ES-CS101 */}
              <div className="p-6 rounded-2xl bg-white shadow-xs hover:shadow-md transition-shadow border border-[#e5e8f4] hover:border-[#402ae6]/30">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#e4e7fd] flex items-center justify-center text-[#402ae6]">
                      <Code2 className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-[11px] text-[#402ae6] font-bold">
                        ES-CS101 · 3 CREDITS
                      </span>
                      <h3 className="text-base font-bold text-[#171b2a]">
                        Programming for Problem Solving
                      </h3>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#ebedff] text-[10px] font-semibold text-[#171b2a]">
                    AICTE MANDATED
                  </span>
                </div>

                <div className="mt-6 space-y-2.5">
                  <div className="p-3 rounded-xl bg-[#faf8ff] border border-[#e8ebf6] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#171b2a]">
                        Module 1: Memory Layout &amp; Fundamental Syntax
                      </div>
                      <div className="text-[11px] text-[#5d5c73]">
                        Compilation phases, bitwise logic, memory mapping of
                        data types
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#402ae6] bg-[#edeaff] px-2 py-0.5 rounded">
                      Verified
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#faf8ff] border border-[#e8ebf6] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#171b2a]">
                        Module 2: Arrays, Strings &amp; Functions
                      </div>
                      <div className="text-[11px] text-[#5d5c73]">
                        Call by value vs reference, parameter passing, string
                        algorithms
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#402ae6] bg-[#edeaff] px-2 py-0.5 rounded">
                      Verified
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#faf8ff] border border-[#e8ebf6] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#171b2a]">
                        Module 3: Pointers &amp; Dynamic Allocation
                      </div>
                      <div className="text-[11px] text-[#5d5c73]">
                        Pointer arithmetic, malloc/calloc/free, single linked
                        list logic
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#402ae6] bg-[#edeaff] px-2 py-0.5 rounded">
                      Verified
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#f0f2f8]">
                  <div className="flex items-center gap-1.5 text-xs text-[#717588]">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>32 Verified C Algorithms</span>
                  </div>
                  <Link
                    href={isAuthenticated ? "/app/dashboard" : "/sign-up"}
                    className="text-xs font-bold text-[#402ae6] hover:underline flex items-center gap-1 group"
                  >
                    <span>Open Blueprint</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================== */}
        {/* 5. ACADEMIC CHARTER & MANIFESTO                      */}
        {/* ===================================================== */}
        <section
          id="open-charter"
          className="w-full py-20 px-6 lg:px-12 bg-white"
        >
          <div className="max-w-4xl mx-auto rounded-3xl bg-[#171b2a] text-[#eff0ff] p-8 md:p-14 shadow-2xl relative overflow-hidden group">
            {/* Decorative backdrop aura */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-[#5a4cfe]/20 blur-3xl pointer-events-none transition-transform duration-700 group-hover:scale-125" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-[#f6c844] mb-6">
                <Globe2 className="h-4 w-4" />
                <span>Open Academic Charter</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
                Eliminating academic anxiety through curriculum clarity.
              </h2>

              <p className="text-sm sm:text-base text-white/80 leading-relaxed mb-6">
                ExamNest is built by engineering scholars who experienced firsthand
                the friction of out-of-sync syllabi, disjointed resources, and
                unclear examination standards. We believe syllabus transparency
                and quality study materials are essential foundations for every
                student.
              </p>

              <p className="text-xs sm:text-sm text-white/70 leading-relaxed mb-8">
                Every unit and lecture note in our library is carefully organized,
                reviewed, and mapped directly to curriculum requirements. We focus
                on precision and clarity first.
              </p>

              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 text-xs text-white/90">
                  <span className="flex h-2 w-2 rounded-full bg-[#f6c844] animate-pulse" />
                  <span className="font-semibold text-[#f6c844]">
                    Peer Note Review Pipeline:
                  </span>
                  <span>Active &amp; Expanding</span>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {isAuthenticated ? (
                    <Link
                      href="/app/dashboard"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#f6c844] text-[#6c5400] text-xs font-bold shadow-md hover:bg-white hover:text-[#171b2a] transition-all transform hover:-translate-y-0.5"
                    >
                      <span>Continue in Workspace</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : (
                    <Link
                      href="/sign-up"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#f6c844] text-[#6c5400] text-xs font-bold shadow-md hover:bg-white hover:text-[#171b2a] transition-all transform hover:-translate-y-0.5"
                    >
                      <span>Create Free Student Account</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}

                  <a
                    href="#curriculum-matrix"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition-all transform hover:-translate-y-0.5"
                  >
                    <span>View Syllabus Standards</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ===================================================== */}
      {/* 6. CLEAN, STANDARD FOOTER (Zero Clickbait & Authentic) */}
      {/* ===================================================== */}
      <footer className="w-full bg-[#f3f3ff] border-t border-[#e2e5f0]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
            {/* Brand column */}
            <div className="lg:col-span-2 space-y-4">
              <Link href="/" className="inline-flex items-center">
                <Logo size="md" />
              </Link>
              <p className="text-xs sm:text-sm text-[#5d5c73] max-w-sm leading-relaxed">
                An Academic platform engineered to organize university
                syllabus blueprints, verified lecture units, and past exam
                question archives for engineering students.
              </p>
              <p className="text-xs text-[#717588]">
                Curriculum mapped to MAKAUT &amp; AICTE Regulations.
              </p>
            </div>

            {/* Platform links */}
            <div>
              <h4 className="text-xs font-bold text-[#171b2a] uppercase tracking-wider mb-4">
                Platform
              </h4>
              <ul className="space-y-2.5 text-xs text-[#5d5c73]">
                <li>
                  <Link
                    href={isAuthenticated ? "/app/dashboard" : "/sign-in"}
                    className="hover:text-[#402ae6] transition-colors"
                  >
                    Student Dashboard
                  </Link>
                </li>
                <li>
                  <a
                    href="#curriculum-matrix"
                    className="hover:text-[#402ae6] transition-colors"
                  >
                    Subject Matrix
                  </a>
                </li>
                <li>
                  <a
                    href="#problem-architecture"
                    className="hover:text-[#402ae6] transition-colors"
                  >
                    Problem Analysis
                  </a>
                </li>
                <li>
                  <a
                    href="#open-charter"
                    className="hover:text-[#402ae6] transition-colors"
                  >
                    Academic Charter
                  </a>
                </li>
              </ul>
            </div>

            {/* Account & Access */}
            <div>
              <h4 className="text-xs font-bold text-[#171b2a] uppercase tracking-wider mb-4">
                Student Access
              </h4>
              <ul className="space-y-2.5 text-xs text-[#5d5c73]">
                <li>
                  <Link
                    href="/sign-in"
                    className="hover:text-[#402ae6] transition-colors"
                  >
                    Student Sign In
                  </Link>
                </li>
                <li>
                  <Link
                    href="/sign-up"
                    className="hover:text-[#402ae6] transition-colors"
                  >
                    Create Account
                  </Link>
                </li>
                <li>
                  <Link
                    href="/onboarding"
                    className="hover:text-[#402ae6] transition-colors"
                  >
                    Curriculum Onboarding
                  </Link>
                </li>
                <li>
                  <Link
                    href="/app/dashboard"
                    className="hover:text-[#402ae6] transition-colors"
                  >
                    My Workspace
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-[#e2e5f0] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#717588]">
            <p>© {new Date().getFullYear()} ExamNest | All Rights Reserved</p>
            <div className="flex items-center gap-6">
              <span className="hover:text-[#171b2a] transition-colors cursor-pointer">
                Academic Integrity
              </span>
              <span className="hover:text-[#171b2a] transition-colors cursor-pointer">
                Student Privacy
              </span>
              <span className="hover:text-[#171b2a] transition-colors cursor-pointer">
                Terms of Use
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
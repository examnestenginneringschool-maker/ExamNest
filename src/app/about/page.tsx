import type { Metadata } from "next";
import Link from "next/link";
import { LegalHeader } from "@/components/legal/LegalHeader";
import { LegalFooter } from "@/components/legal/LegalFooter";
import {
  LegalTableOfContents,
  type TocItem,
} from "@/components/legal/LegalTableOfContents";
import { PLATFORM_INFO } from "@/lib/legal/navigation";
import { Building2, CheckCircle2, Globe2, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | ExamNest",
  description:
    "Discover ExamNest — The Engineering School. Learn how our independent academic workspace organizes university syllabus blueprints, verified derivations, and exam prep.",
};

const ABOUT_TOC_ITEMS: TocItem[] = [
  { id: "who-we-are", number: "01", label: "Who We Are" },
  { id: "problems-we-solve", number: "02", label: "The Problem We Solve" },
  { id: "track-architecture", number: "03", label: "Track-Based Curriculum" },
  { id: "what-we-offer", number: "04", label: "What We Offer Students" },
  { id: "standards-independence", number: "05", label: "Independence & Privacy" },
  { id: "operating-presence", number: "06", label: "Where We Operate" },
];

export default function AboutUsPage() {
  const lastUpdated = PLATFORM_INFO.lastUpdated;

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-white text-slate-900 font-sans selection:bg-slate-900 selection:text-white flex flex-col">
      <LegalHeader activeTab="about" />

      {/* Independent Split-Containers Layout */}
      <div className="flex-1 lg:overflow-hidden flex flex-col lg:flex-row w-full max-w-[1500px] mx-auto">
        {/* CONTAINER 1 (Left): Independent Table of Contents Container */}
        <aside className="w-full lg:w-[290px] xl:w-[330px] shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200/80 bg-slate-50/50 p-4 sm:p-6 lg:h-full lg:overflow-y-auto">
          <LegalTableOfContents
            items={ABOUT_TOC_ITEMS}
            title="About Sections"
            contactEmail={PLATFORM_INFO.emails.support}
            contactLabel="Want to connect?"
          />
        </aside>

        {/* CONTAINER 2 (Right): Independent Document Scroll Container */}
        <main
          id="legal-content-scroll"
          className="flex-1 lg:h-full lg:overflow-y-auto px-6 sm:px-10 lg:px-14 xl:px-16 py-8 lg:py-12 bg-white"
        >
          <article className="max-w-3xl mx-auto pb-16">
            {/* Document Header */}
            <header className="pb-8 border-b border-slate-200">
              <div className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-slate-700 mb-4">
                <Building2 className="h-3.5 w-3.5 text-slate-600" />
                <span>Company &amp; Support</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
                About ExamNest
              </h1>

              <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
                Eliminating academic anxiety through curriculum clarity. ExamNest is an engineering-focused educational technology platform built to unite official university syllabus blueprints, verified mathematical derivations, and exam preparation in one structured workspace.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-500 font-medium">
                <span>
                  Last Updated:{" "}
                  <strong className="text-slate-700">{lastUpdated}</strong>
                </span>
                <span>•</span>
                <span>
                  Platform:{" "}
                  <strong className="text-slate-700">
                    ExamNest — The Engineering School
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Document Reference:{" "}
                  <strong className="text-slate-700">EN-CMP-ABT-2026</strong>
                </span>
              </div>
            </header>

            {/* Charter Summary Card */}
            <div className="my-8 rounded-xl border border-slate-200 bg-slate-50/70 p-6">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-2">
                <Globe2 className="h-4 w-4 text-slate-700" />
                <span>Our Core Academic Charter</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                ExamNest was founded by engineering scholars who experienced firsthand the friction of out-of-sync syllabi, scattered WhatsApp links, and unclear university exam standards. We focus on precision, legible step-by-step derivations, and strict student privacy first.
              </p>
            </div>

            {/* Body */}
            <div className="space-y-12 text-slate-700 leading-relaxed text-sm sm:text-base">
              {/* Section 1 */}
              <section id="who-we-are" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  1. Who We Are
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    ExamNest (<code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-700">{PLATFORM_INFO.domain}</code>) is an independent educational technology platform engineered specifically for collegiate engineering and technical students across India—with deep curriculum alignment for Maulana Abul Kalam Azad University of Technology (MAKAUT), West Bengal State Council of Technical Education (WBSCTE), and AICTE model frameworks.
                  </p>
                  <p>
                    Rather than offering generic, unindexed video playlists or cluttered PDF dumps, ExamNest organizes the entire semester learning experience around the way university examiners actually structure and evaluate technical papers.
                  </p>
                </div>
              </section>

              {/* Section 2 */}
              <section id="problems-we-solve" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  2. The Engineering Academic Disconnect We Solve
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    Far too many engineering students lose valuable semester hours navigating disorganized study materials. ExamNest targets three structural problems directly:
                  </p>
                  <div className="space-y-3">
                    <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/40">
                      <h3 className="font-semibold text-slate-900">
                        A. Fragmented Study Drives
                      </h3>
                      <p className="mt-1 text-xs sm:text-sm text-slate-600">
                        Instead of hunting through broken Google Drive folders, random messaging links, and blurry phone scans with missing intermediate steps, ExamNest delivers unified subject repositories indexed strictly by official course codes and checked for clarity and mobile legibility.
                      </p>
                    </div>

                    <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/40">
                      <h3 className="font-semibold text-slate-900">
                        B. Syllabus Drift &amp; Blind Derivations
                      </h3>
                      <p className="mt-1 text-xs sm:text-sm text-slate-600">
                        Generic online tutorials often skip university-specific derivation notations and circuit conventions. ExamNest delivers 1-to-1 regulation mapping with step-by-step mathematical proofs, clean diagrams, and concise formula sheets formatted for semester examinations.
                      </p>
                    </div>

                    <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/40">
                      <h3 className="font-semibold text-slate-900">
                        C. Exam Pattern Blindness
                      </h3>
                      <p className="mt-1 text-xs sm:text-sm text-slate-600">
                        Students frequently spend weeks on low-weightage topics while missing high-mark multi-part derivations. Our previous year question (PYQ) archives and structured revision modules map exam trends directly to specific syllabus sub-clauses.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 3 */}
              <section id="track-architecture" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  3. Personalized Academic Track Architecture
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    Every student&apos;s workspace adapts automatically to their enrolled academic track during onboarding:
                  </p>
                  <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 text-center text-xs sm:text-sm font-bold text-slate-800 tracking-wide">
                    University → College → Course → Department → Semester
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Once enrolled, your dashboard filters out irrelevant syllabi and brings your active semester subjects, modules, derivations, and preparation guides into one focused view.
                  </p>
                </div>
              </section>

              {/* Section 4 */}
              <section id="what-we-offer" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  4. What We Offer Students
                </h2>
                <div className="mt-4 space-y-3">
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Curriculum Blueprints &amp; Unit Notes:</strong> Peer-reviewed, syllabus-mapped study units covering core subjects such as Physics, Mathematics, Basic Electrical Engineering, and Programming.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Recorded Video Lectures &amp; Guided Walkthroughs:</strong> Focused digital courses and subject bundles provisioned instantly online.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Previous Year Questions &amp; Online Mock Tests:</strong> Structured practice archives and timed evaluations designed to build examination readiness.
                      </span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Section 5 */}
              <section id="standards-independence" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  5. Independence, Privacy &amp; Student Trust
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    ExamNest operates as a completely independent private educational technology platform and is not affiliated with MAKAUT, WBSCTE, AICTE, or any government examination authority.
                  </p>
                  <p>
                    We uphold strict data stewardship: we never run behavioral advertising trackers, never sell student data, and never share reading activity with college faculty. Review our{" "}
                    <Link
                      href="/privacy"
                      className="font-semibold text-slate-900 underline hover:text-slate-700"
                    >
                      Student Privacy Policy
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/academic-disclaimer"
                      className="font-semibold text-slate-900 underline hover:text-slate-700"
                    >
                      Academic Disclaimer
                    </Link>{" "}
                    for complete details.
                  </p>
                </div>
              </section>

              {/* Section 6 */}
              <section id="operating-presence" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  6. Operating Presence &amp; Student Support
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    ExamNest operates out of Kolkata, West Bengal, India, serving engineering students across campuses with responsive digital support:
                  </p>

                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-5 space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-slate-900">
                      <Mail className="h-4 w-4 text-slate-600" />
                      <span>ExamNest Platform Headquarters</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600">
                      <strong>Operating Address:</strong> {PLATFORM_INFO.address.full}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600">
                      <strong>Support Email:</strong>{" "}
                      <a
                        href={`mailto:${PLATFORM_INFO.emails.support}`}
                        className="font-semibold text-slate-900 underline hover:text-slate-700"
                      >
                        {PLATFORM_INFO.emails.support}
                      </a>{" "}
                      · <strong>Helpline:</strong>{" "}
                      <a
                        href={PLATFORM_INFO.phoneHref}
                        className="font-semibold text-slate-900 underline hover:text-slate-700"
                      >
                        {PLATFORM_INFO.phoneDisplay}
                      </a>
                    </p>
                    <p className="text-xs text-slate-500">
                      Need formal support or grievance escalation? Visit our{" "}
                      <Link
                        href="/contact"
                        className="font-semibold text-slate-800 underline hover:text-slate-950"
                      >
                        Contact Us &amp; Grievance Redressal
                      </Link>{" "}
                      page.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </article>

          <div className="max-w-3xl mx-auto pt-10">
            <LegalFooter currentDoc="about" />
          </div>
        </main>
      </div>
    </div>
  );
}

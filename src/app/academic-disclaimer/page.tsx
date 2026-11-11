import type { Metadata } from "next";
import Link from "next/link";
import { LegalHeader } from "@/components/legal/LegalHeader";
import { LegalFooter } from "@/components/legal/LegalFooter";
import {
  LegalTableOfContents,
  type TocItem,
} from "@/components/legal/LegalTableOfContents";
import { PLATFORM_INFO } from "@/lib/legal/navigation";
import { AlertCircle, BookOpenCheck, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Academic Disclaimer | ExamNest",
  description:
    "Read ExamNest's Academic Disclaimer clarifying non-affiliation with MAKAUT, WBSCTE, AICTE, or universities, and the supplemental role of solved PYQs and study guides.",
};

const DISCLAIMER_TOC_ITEMS: TocItem[] = [
  { id: "non-affiliation", number: "01", label: "Independent Platform Status" },
  { id: "nominative-fair-use", number: "02", label: "Course Codes & Fair Use" },
  { id: "educational-nature", number: "03", label: "Nature of Study Guides" },
  { id: "no-score-guarantee", number: "04", label: "No Exam or Grade Guarantees" },
  { id: "official-cross-check", number: "05", label: "Official Circulars & Syllabi" },
  { id: "errata-reporting", number: "06", label: "Accuracy & Errata Reporting" },
];

export default function AcademicDisclaimerPage() {
  const lastUpdated = PLATFORM_INFO.lastUpdated;

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-white text-slate-900 font-sans selection:bg-slate-900 selection:text-white flex flex-col">
      <LegalHeader activeTab="academic-disclaimer" />

      {/* Independent Split-Containers Layout */}
      <div className="flex-1 lg:overflow-hidden flex flex-col lg:flex-row w-full max-w-[1500px] mx-auto">
        {/* CONTAINER 1 (Left): Independent Table of Contents Container */}
        <aside className="w-full lg:w-[290px] xl:w-[330px] shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200/80 bg-slate-50/50 p-4 sm:p-6 lg:h-full lg:overflow-y-auto">
          <LegalTableOfContents
            items={DISCLAIMER_TOC_ITEMS}
            title="Disclaimer Sections"
            contactEmail={PLATFORM_INFO.emails.support}
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
                <AlertCircle className="h-3.5 w-3.5 text-slate-600" />
                <span>Safety &amp; Integrity</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
                Academic Disclaimer
              </h1>

              <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
                ExamNest is an independent academic preparation platform. This Academic Disclaimer outlines our non-affiliation with official university authorities and defines the educational boundaries of our solved previous year questions, notes, and mock assessments.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-500 font-medium">
                <span>
                  Last Updated:{" "}
                  <strong className="text-slate-700">{lastUpdated}</strong>
                </span>
                <span>•</span>
                <span>
                  Scope:{" "}
                  <strong className="text-slate-700">
                    All Study Materials, PYQs &amp; Mock Tests
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Document Reference:{" "}
                  <strong className="text-slate-700">EN-SAF-DISC-2026</strong>
                </span>
              </div>
            </header>

            {/* Notice Callout Card */}
            <div className="my-8 rounded-xl border border-slate-200 bg-slate-50/70 p-6">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-2">
                <BookOpenCheck className="h-4 w-4 text-slate-700" />
                <span>Institutional Independence Declaration</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                ExamNest is <strong>not affiliated with, associated with, authorized by, endorsed by, or in any way officially connected to</strong> Maulana Abul Kalam Azad University of Technology (MAKAUT), West Bengal State Council of Technical Education (WBSCTE), the All India Council for Technical Education (AICTE), or any state or central university or examination authority.
              </p>
            </div>

            {/* Body */}
            <div className="space-y-12 text-slate-700 leading-relaxed text-sm sm:text-base">
              {/* Section 1 */}
              <section id="non-affiliation" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  1. Independent Educational Platform &amp; Non-Affiliation
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    ExamNest (<code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-700">{PLATFORM_INFO.domain}</code>) is an independent, private educational technology platform built to help engineering students organize and master technical curricula.
                  </p>
                  <p>
                    No part of our website, curriculum matrix, or study workspace should be construed as an official notice, administrative directive, or endorsed publication of any university, college, or regulatory council.
                  </p>
                </div>
              </section>

              {/* Section 2 */}
              <section id="nominative-fair-use" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  2. Course Codes &amp; Nominative Fair Use
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    Any references to official course codes (such as BS-PH101, BS-M101, ES-EE101, or ES-CS101), syllabus names, credit allocations, or semester curricula are strictly utilized for indexing, academic alignment, and nominative fair use so students can accurately identify relevant preparation resources.
                  </p>
                  <p>
                    All official university names, acronyms, and trademarks remain the exclusive property of their respective statutory institutions.
                  </p>
                </div>
              </section>

              {/* Section 3 */}
              <section id="educational-nature" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  3. Supplemental Nature of PYQs &amp; Study Guides
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    Solved previous year questions (PYQs), step-by-step mathematical derivations, circuit schematics, model answers, and study notes on ExamNest are curated strictly as <strong>revision guides and conceptual learning aids</strong>.
                  </p>
                  <p>
                    They are intended to reinforce classroom instruction and prescribed textbooks—not to replace official university lectures, laboratory work, or academic integrity standards.
                  </p>
                </div>
              </section>

              {/* Section 4 */}
              <section id="no-score-guarantee" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  4. No Guarantee of Exam Questions or Academic Grades
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    While every effort is made by our academic reviewers to maintain factual, conceptual, and numerical accuracy, ExamNest makes no representation or guarantee:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600">
                    <li>That specific solved questions, derivations, or mock test items will reappear in university semester examinations.</li>
                    <li>Of any guaranteed letter grade, SGPA, CGPA, rank, or passing outcome.</li>
                  </ul>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Examination results depend on individual effort, syllabus mastery, university evaluation rubrics, and examination performance.
                  </p>
                </div>
              </section>

              {/* Section 5 */}
              <section id="official-cross-check" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  5. Official Circulars &amp; Model Curricula
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    Universities and examination boards may amend syllabus sub-clauses, subject codes, examination schedules, or question paper formats at any time without prior notice.
                  </p>
                  <p>
                    Students are strongly encouraged to cross-reference official university model curricula, recommended reference textbooks, and official notices issued by MAKAUT, WBSCTE, or their respective institutions for administrative deadlines, admit cards, and final syllabus applicability.
                  </p>
                </div>
              </section>

              {/* Section 6 */}
              <section id="errata-reporting" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  6. Reporting Errata &amp; Related Policies
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    All platform materials are provided on an &quot;AS IS&quot; basis as stated in our{" "}
                    <Link
                      href="/terms#disclaimers"
                      className="font-semibold text-slate-900 underline hover:text-slate-700"
                    >
                      Terms &amp; Conditions
                    </Link>. If you spot a typographical slip, equation mismatch, or outdated syllabus topic, please notify our review team so we can verify and update it promptly.
                  </p>

                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-5 space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-slate-900">
                      <Mail className="h-4 w-4 text-slate-600" />
                      <span>Academic Review &amp; Errata Desk</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600">
                      Support Email:{" "}
                      <a
                        href={`mailto:${PLATFORM_INFO.emails.support}`}
                        className="font-semibold text-slate-900 underline hover:text-slate-700"
                      >
                        {PLATFORM_INFO.emails.support}
                      </a>
                    </p>
                    <p className="text-xs text-slate-500">
                      Also review our{" "}
                      <Link
                        href="/copyright-policy"
                        className="font-semibold text-slate-800 underline hover:text-slate-950"
                      >
                        Copyright &amp; IP Policy
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/fair-usage"
                        className="font-semibold text-slate-800 underline hover:text-slate-950"
                      >
                        Fair Usage Policy
                      </Link>.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </article>

          <div className="max-w-3xl mx-auto pt-10">
            <LegalFooter currentDoc="academic-disclaimer" />
          </div>
        </main>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { LegalHeader } from "@/components/legal/LegalHeader";
import { LegalFooter } from "@/components/legal/LegalFooter";
import {
  LegalTableOfContents,
  type TocItem,
} from "@/components/legal/LegalTableOfContents";
import { PLATFORM_INFO } from "@/lib/legal/navigation";
import { Copyright, ShieldAlert, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Copyright & IP Policy | ExamNest",
  description:
    "Learn about ExamNest's intellectual property ownership, university curriculum attribution, digital forensic watermarking, and anti-piracy enforcement under Indian law.",
};

const COPYRIGHT_TOC_ITEMS: TocItem[] = [
  { id: "proprietary-ip", number: "01", label: "Proprietary Platform IP" },
  { id: "third-party-curricula", number: "02", label: "University Curriculum Attribution" },
  { id: "forensic-watermarking", number: "03", label: "Forensic Watermarking" },
  { id: "prohibited-piracy", number: "04", label: "Prohibited Piracy & Copying" },
  { id: "legal-enforcement", number: "05", label: "Civil & Criminal Enforcement" },
  { id: "takedown-notices", number: "06", label: "IP Notices & Takedowns" },
];

export default function CopyrightPolicyPage() {
  const lastUpdated = PLATFORM_INFO.lastUpdated;

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-white text-slate-900 font-sans selection:bg-slate-900 selection:text-white flex flex-col">
      <LegalHeader activeTab="copyright-policy" />

      {/* Independent Split-Containers Layout */}
      <div className="flex-1 lg:overflow-hidden flex flex-col lg:flex-row w-full max-w-[1500px] mx-auto">
        {/* CONTAINER 1 (Left): Independent Table of Contents Container */}
        <aside className="w-full lg:w-[290px] xl:w-[330px] shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200/80 bg-slate-50/50 p-4 sm:p-6 lg:h-full lg:overflow-y-auto">
          <LegalTableOfContents
            items={COPYRIGHT_TOC_ITEMS}
            title="IP Policy Sections"
            contactEmail={PLATFORM_INFO.emails.legal}
            contactLabel="IP or takedown notice?"
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
                <Copyright className="h-3.5 w-3.5 text-slate-600" />
                <span>Safety &amp; Integrity</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
                Copyright &amp; IP Policy
              </h1>

              <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
                This policy defines the intellectual property ownership of ExamNest study assets, respects statutory university syllabus copyrights, and establishes our dynamic watermarking and anti-piracy enforcement framework.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-500 font-medium">
                <span>
                  Last Updated:{" "}
                  <strong className="text-slate-700">{lastUpdated}</strong>
                </span>
                <span>•</span>
                <span>
                  Jurisdiction:{" "}
                  <strong className="text-slate-700">
                    Indian Copyright Act, 1957 &amp; IT Act, 2000
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Document Reference:{" "}
                  <strong className="text-slate-700">EN-SAF-IP-2026</strong>
                </span>
              </div>
            </header>

            {/* Enforcement Callout Card */}
            <div className="my-8 rounded-xl border border-slate-200 bg-slate-50/70 p-6">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-2">
                <ShieldAlert className="h-4 w-4 text-slate-700" />
                <span>Zero-Tolerance Content Protection</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Digital streams and downloadable documents on ExamNest carry dynamic digital forensic watermarking linked to the authenticated student account. Unauthorized re-hosting, screen-recording, or mass sharing leads to immediate permanent termination without refund and legal escalation.
              </p>
            </div>

            {/* Body */}
            <div className="space-y-12 text-slate-700 leading-relaxed text-sm sm:text-base">
              {/* Section 1 */}
              <section id="proprietary-ip" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  1. Ownership of Proprietary Platform Content
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    All original content created, compiled, or published on ExamNest (<code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-700">{PLATFORM_INFO.domain}</code>)—including recorded video lectures, structured explanatory notes, step-by-step mathematical proofs, LaTeX-rendered derivations, circuit schematics, solved PYQ explanations, online mock tests, user interface components, branding, logos, and platform source code—is the exclusive intellectual property of ExamNest and its authorized academic contributors.
                  </p>
                  <p>
                    Purchasing a course bundle or creating an account grants a limited, revocable personal study license and does not transfer any ownership, copyright, or commercial distribution rights.
                  </p>
                </div>
              </section>

              {/* Section 2 */}
              <section id="third-party-curricula" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  2. Statutory Curricula &amp; University Attribution
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    Official university names, college titles, statutory syllabus headings, and standard course codes (e.g., under MAKAUT, WBSCTE, AICTE, or state/central universities) belong to their respective governing boards and examination authorities.
                  </p>
                  <p>
                    ExamNest makes no claim of ownership over official university syllabus blueprints or examination question papers and references them solely for pedagogical indexing, educational alignment, and fair dealing under applicable provisions of the <strong>Indian Copyright Act, 1957</strong>.
                  </p>
                </div>
              </section>

              {/* Section 3 */}
              <section id="forensic-watermarking" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  3. Dynamic Digital Forensic Watermarking
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    To deter content theft and identify leak sources accurately, ExamNest&apos;s digital video streams and downloadable PDF study documents utilize dynamic digital forensic watermarking.
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Protected assets visibly or cryptographically embed session identifiers—displaying the authenticated student&apos;s <strong>email address</strong>, <strong>registered mobile number</strong>, and a <strong>unique user hash</strong>. Attempting to blur, strip, crop, or tamper with forensic watermarks is a strict violation of this policy.
                  </p>
                </div>
              </section>

              {/* Section 4 */}
              <section id="prohibited-piracy" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  4. Prohibited Reproduction &amp; Piracy Activities
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    In alignment with our{" "}
                    <Link
                      href="/fair-usage"
                      className="font-semibold text-slate-900 underline hover:text-slate-700"
                    >
                      Fair Usage Policy
                    </Link>, users are strictly prohibited from:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600">
                    <li>Ripping, capturing, or re-encoding video streams (HLS/WebRTC) via third-party browser extensions, download managers, or packet sniffers.</li>
                    <li>Screen-recording video lectures or live problem-solving walkthroughs using third-party capture software.</li>
                    <li>Extracting, printing in bulk, re-hosting, selling, or distributing watermarked study PDFs and notes on Telegram groups, WhatsApp channels, Google Drive, Discord, or competitor websites.</li>
                    <li>Running automated scrapers, bots, or headless browsers to clone ExamNest&apos;s curriculum database or solution archives.</li>
                  </ul>
                </div>
              </section>

              {/* Section 5 */}
              <section id="legal-enforcement" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  5. Anti-Piracy &amp; Statutory Enforcement
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    Any account detected distributing, leaking, reselling, or unlawfully copying proprietary platform assets will face <strong>immediate permanent termination without refund</strong>.
                  </p>
                  <p>
                    Furthermore, ExamNest reserves the right to pursue civil remedies (including injunctive relief and statutory damages) and initiate criminal prosecution under the <strong>Information Technology Act, 2000</strong> and the <strong>Indian Copyright Act, 1957</strong> against individuals or groups involved in digital piracy.
                  </p>
                </div>
              </section>

              {/* Section 6 */}
              <section id="takedown-notices" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  6. Copyright Inquiries &amp; Takedown Notices
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    If you are a copyright owner, educator, or institutional representative and believe that any third-party material or reference on ExamNest infringes your intellectual property rights, please submit a written notice containing the exact URL, proof of ownership, and your contact details:
                  </p>

                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-5 space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-slate-900">
                      <Mail className="h-4 w-4 text-slate-600" />
                      <span>ExamNest Legal &amp; IP Compliance</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600">
                      Legal / IP Email:{" "}
                      <a
                        href={`mailto:${PLATFORM_INFO.emails.legal}`}
                        className="font-semibold text-slate-900 underline hover:text-slate-700"
                      >
                        {PLATFORM_INFO.emails.legal}
                      </a>{" "}
                      · Grievance Desk:{" "}
                      <a
                        href={`mailto:${PLATFORM_INFO.emails.grievance}`}
                        className="font-semibold text-slate-900 underline hover:text-slate-700"
                      >
                        {PLATFORM_INFO.emails.grievance}
                      </a>
                    </p>
                    <p className="text-xs text-slate-500">
                      Postal Address: {PLATFORM_INFO.address.full} · Full escalation procedures are listed on{" "}
                      <Link
                        href="/contact"
                        className="font-semibold text-slate-800 underline hover:text-slate-950"
                      >
                        Contact Us &amp; Grievance Redressal
                      </Link>.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </article>

          <div className="max-w-3xl mx-auto pt-10">
            <LegalFooter currentDoc="copyright-policy" />
          </div>
        </main>
      </div>
    </div>
  );
}

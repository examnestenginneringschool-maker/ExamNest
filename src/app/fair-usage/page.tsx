import type { Metadata } from "next";
import Link from "next/link";
import { LegalHeader } from "@/components/legal/LegalHeader";
import { LegalFooter } from "@/components/legal/LegalFooter";
import {
  LegalTableOfContents,
  type TocItem,
} from "@/components/legal/LegalTableOfContents";
import { PLATFORM_INFO } from "@/lib/legal/navigation";
import { Lock, ShieldCheck, XCircle, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Fair Usage Policy | ExamNest",
  description:
    "Read ExamNest's Fair Usage Policy covering single-user licensing, single-device active session limits, credential sharing prohibitions, and anti-piracy protections.",
};

const FAIR_USAGE_TOC_ITEMS: TocItem[] = [
  { id: "single-user-license", number: "01", label: "Single-User License" },
  { id: "simultaneous-logins", number: "02", label: "Single-Device & Logins" },
  { id: "strict-prohibitions", number: "03", label: "Strict Prohibitions" },
  { id: "anti-automation", number: "04", label: "Anti-Scraping & Security" },
  { id: "anti-piracy", number: "05", label: "Forensic Watermarking" },
  { id: "compliance-contact", number: "06", label: "Compliance & Appeals" },
];

export default function FairUsagePage() {
  const lastUpdated = PLATFORM_INFO.lastUpdated;

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-white text-slate-900 font-sans selection:bg-slate-900 selection:text-white flex flex-col">
      <LegalHeader activeTab="fair-usage" />

      {/* Independent Split-Containers Layout */}
      <div className="flex-1 lg:overflow-hidden flex flex-col lg:flex-row w-full max-w-[1500px] mx-auto">
        {/* CONTAINER 1 (Left): Independent Table of Contents Container */}
        <aside className="w-full lg:w-[290px] xl:w-[330px] shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200/80 bg-slate-50/50 p-4 sm:p-6 lg:h-full lg:overflow-y-auto">
          <LegalTableOfContents
            items={FAIR_USAGE_TOC_ITEMS}
            title="Fair Usage Sections"
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
                <Lock className="h-3.5 w-3.5 text-slate-600" />
                <span>Safety &amp; Integrity</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
                Fair Usage Policy
              </h1>

              <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
                This Fair Usage Policy establishes responsible account boundaries on ExamNest (<code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-700">{PLATFORM_INFO.domain}</code>) to ensure fast, reliable access for every student and protect academic resources from unauthorized redistribution.
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
                    All Registered Accounts &amp; Subscriptions
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Document Reference:{" "}
                  <strong className="text-slate-700">EN-SAF-FAIR-2026</strong>
                </span>
              </div>
            </header>

            {/* Summary Callout */}
            <div className="my-8 rounded-xl border border-slate-200 bg-slate-50/70 p-6">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-2">
                <ShieldCheck className="h-4 w-4 text-slate-700" />
                <span>Core Account Integrity Principles</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Every ExamNest account and course enrollment is licensed strictly to <strong>one individual student</strong> on <strong>one active browser/device session at a time</strong>. Sharing credentials, stream ripping, screen recording, or redistributing study PDFs triggers automated session protection and permanent account revocation without refund.
              </p>
            </div>

            {/* Body */}
            <div className="space-y-12 text-slate-700 leading-relaxed text-sm sm:text-base">
              {/* Section 1 */}
              <section id="single-user-license" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  1. Single-User License &amp; Account Integrity
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    Every course subscription, subject bundle, and registered student account on ExamNest provides a <strong>non-transferable, revocable, single-user license</strong> strictly intended for individual personal learning.
                  </p>
                  <p>
                    You may access your study workspace from your personal laptop, desktop, or smartphone sequentially, provided the account remains exclusively under your personal control.
                  </p>
                </div>
              </section>

              {/* Section 2 */}
              <section id="simultaneous-logins" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  2. Single-Device Enforcement &amp; Simultaneous Logins
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    ExamNest enforces a real-time Single-Device Active Session engine:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600">
                    <li>
                      Signing in on a new device or browser immediately expires your previous active session and triggers a security alert to your registered email address.
                    </li>
                    <li>
                      Simultaneous active sessions from multiple distinct IP ranges, concurrent geographic locations, or unauthorized devices will trigger automatic session termination and security review.
                    </li>
                    <li>
                      Repeated rapid device switching consistent with group or multi-user account sharing may lead to temporary lockouts or permanent suspension.
                    </li>
                  </ul>
                </div>
              </section>

              {/* Section 3 */}
              <section id="strict-prohibitions" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  3. Strict Prohibitions
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    Under this Fair Usage Policy, the following actions are strictly prohibited across all free and paid offerings:
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                      <span>
                        Sharing login credentials, passwords, or OTP codes across batchmates, hostel rooms, study groups, or peer circles.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                      <span>
                        Ripping, capturing, or re-encoding video streams (HLS/WebRTC) via third-party browser extensions, download tools, or packet sniffers.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                      <span>
                        Screen-recording video lectures or assessment walkthroughs using third-party screen capture or virtual camera software.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                      <span>
                        Extracting, printing for distribution, re-hosting, or circulating watermarked study PDFs and notes on Telegram groups, WhatsApp, Google Drive, or competitor platforms.
                      </span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Section 4 */}
              <section id="anti-automation" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  4. Anti-Scraping, Disposable Emails &amp; Bandwidth Fair Use
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    To keep platform latency low and prevent abuse:
                  </p>
                  <div className="space-y-2 text-xs sm:text-sm text-slate-600">
                    <div className="rounded-lg border border-slate-200 p-3 bg-slate-50/50">
                      <strong>No Automated Crawlers or Scrapers:</strong> Using bots, scripts, or headless browsers to bulk-fetch syllabus modules, derivations, or question banks is blocked and tracked.
                    </div>
                    <div className="rounded-lg border border-slate-200 p-3 bg-slate-50/50">
                      <strong>No Disposable Email Domains:</strong> Registering with temporary or burner email services is automatically rejected by our authentication security gatekeeper.
                    </div>
                    <div className="rounded-lg border border-slate-200 p-3 bg-slate-50/50">
                      <strong>Reasonable Consumption Thresholds:</strong> Streaming or downloading assets at volumes indicative of automated mirroring rather than normal human study may be rate-limited pending verification.
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 5 */}
              <section id="anti-piracy" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  5. Forensic Watermarking &amp; Anti-Piracy Enforcement
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    Our digital video streams and downloadable study documents utilize <strong>dynamic digital forensic watermarking</strong> displaying the authenticated student&apos;s email, registered mobile number, and unique user hash.
                  </p>
                  <p>
                    Any account detected distributing proprietary platform assets or violating this Fair Usage Policy will face <strong>immediate permanent termination without refund</strong> (in accordance with our{" "}
                    <Link
                      href="/refund-policy"
                      className="font-semibold text-slate-900 underline hover:text-slate-700"
                    >
                      Refund &amp; Cancellation Policy
                    </Link>), and ExamNest reserves the right to pursue civil remedies and criminal action under the <strong>Information Technology Act, 2000</strong> and the <strong>Indian Copyright Act, 1957</strong>. See our{" "}
                    <Link
                      href="/copyright-policy"
                      className="font-semibold text-slate-900 underline hover:text-slate-700"
                    >
                      Copyright &amp; IP Policy
                    </Link>{" "}
                    for complete details.
                  </p>
                </div>
              </section>

              {/* Section 6 */}
              <section id="compliance-contact" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  6. Security Alerts &amp; Compliance Review
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    If you received a new-device sign-in alert that you did not authorize, reset your password immediately from the sign-in portal and contact our support desk so we can help secure your account:
                  </p>

                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-5 space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-slate-900">
                      <Mail className="h-4 w-4 text-slate-600" />
                      <span>ExamNest Trust &amp; Fair Usage Team</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600">
                      Support Email:{" "}
                      <a
                        href={`mailto:${PLATFORM_INFO.emails.support}`}
                        className="font-semibold text-slate-900 underline hover:text-slate-700"
                      >
                        {PLATFORM_INFO.emails.support}
                      </a>{" "}
                      · Escalations:{" "}
                      <a
                        href={`mailto:${PLATFORM_INFO.emails.grievance}`}
                        className="font-semibold text-slate-900 underline hover:text-slate-700"
                      >
                        {PLATFORM_INFO.emails.grievance}
                      </a>
                    </p>
                    <p className="text-xs text-slate-500">
                      Helpline: {PLATFORM_INFO.phoneDisplay} ({PLATFORM_INFO.operatingHours}) ·{" "}
                      <Link
                        href="/contact"
                        className="font-semibold text-slate-800 underline hover:text-slate-950"
                      >
                        Contact Us &amp; Grievance Redressal
                      </Link>
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </article>

          <div className="max-w-3xl mx-auto pt-10">
            <LegalFooter currentDoc="fair-usage" />
          </div>
        </main>
      </div>
    </div>
  );
}

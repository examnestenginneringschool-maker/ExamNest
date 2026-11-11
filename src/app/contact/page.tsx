import type { Metadata } from "next";
import Link from "next/link";
import { LegalHeader } from "@/components/legal/LegalHeader";
import { LegalFooter } from "@/components/legal/LegalFooter";
import {
  LegalTableOfContents,
  type TocItem,
} from "@/components/legal/LegalTableOfContents";
import { PLATFORM_INFO } from "@/lib/legal/navigation";
import {
  PhoneCall,
  MapPin,
  Clock,
  ShieldCheck,
  Building2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us & Grievance Redressal | ExamNest",
  description:
    "Reach ExamNest student support, view registered operating details, or escalate issues to our Grievance & Compliance Officer under the IT Act, 2000 and Consumer Protection (E-Commerce) Rules, 2020.",
};

const CONTACT_TOC_ITEMS: TocItem[] = [
  { id: "customer-support", number: "01", label: "General Customer Support" },
  { id: "email-directory", number: "02", label: "Department Email Directory" },
  { id: "operating-details", number: "03", label: "Registered Operating Details" },
  { id: "grievance-redressal", number: "04", label: "Grievance Redressal Officer" },
  { id: "resolution-timelines", number: "05", label: "Escalation & Timelines" },
];

export default function ContactGrievancePage() {
  const lastUpdated = PLATFORM_INFO.lastUpdated;

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-white text-slate-900 font-sans selection:bg-slate-900 selection:text-white flex flex-col">
      <LegalHeader activeTab="contact" />

      {/* Independent Split-Containers Layout */}
      <div className="flex-1 lg:overflow-hidden flex flex-col lg:flex-row w-full max-w-[1500px] mx-auto">
        {/* CONTAINER 1 (Left): Independent Table of Contents Container */}
        <aside className="w-full lg:w-[290px] xl:w-[330px] shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200/80 bg-slate-50/50 p-4 sm:p-6 lg:h-full lg:overflow-y-auto">
          <LegalTableOfContents
            items={CONTACT_TOC_ITEMS}
            title="Support Sections"
            contactEmail={PLATFORM_INFO.emails.grievance}
            contactLabel="Need escalation?"
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
                <PhoneCall className="h-3.5 w-3.5 text-slate-600" />
                <span>Company &amp; Support</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
                Contact Us &amp; Grievance Redressal
              </h1>

              <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
                Have a question about a course, technical trouble with video playback or notes access, a billing inquiry, or a formal grievance? Reach out through any of our official support and compliance channels below.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-500 font-medium">
                <span>
                  Last Updated:{" "}
                  <strong className="text-slate-700">{lastUpdated}</strong>
                </span>
                <span>•</span>
                <span>
                  Statutory Alignment:{" "}
                  <strong className="text-slate-700">
                    IT Act, 2000 &amp; Consumer Protection (E-Commerce) Rules, 2020
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Document Reference:{" "}
                  <strong className="text-slate-700">EN-CMP-GRV-2026</strong>
                </span>
              </div>
            </header>

            {/* Quick Support Snapshot Card */}
            <div className="my-8 rounded-xl border border-slate-200 bg-slate-50/70 p-6">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3">
                <Clock className="h-4 w-4 text-slate-700" />
                <span>Support Desk Quick Summary</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-600">
                <div>
                  <div className="font-semibold text-slate-900">Operating Hours</div>
                  <div className="mt-0.5">{PLATFORM_INFO.operatingHours}</div>
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Average Response Time</div>
                  <div className="mt-0.5">{PLATFORM_INFO.averageResponseTime}</div>
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Support Email</div>
                  <a
                    href={`mailto:${PLATFORM_INFO.emails.support}`}
                    className="mt-0.5 inline-block font-semibold text-slate-900 underline hover:text-slate-700"
                  >
                    {PLATFORM_INFO.emails.support}
                  </a>
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Student Helpline / WhatsApp</div>
                  <a
                    href={PLATFORM_INFO.phoneHref}
                    className="mt-0.5 inline-block font-semibold text-slate-900 underline hover:text-slate-700"
                  >
                    {PLATFORM_INFO.phoneDisplay}
                  </a>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="space-y-12 text-slate-700 leading-relaxed text-sm sm:text-base">
              {/* Section 1 */}
              <section id="customer-support" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  1. General Customer Support
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    For questions regarding syllabus mapping, course enrollment, digital delivery confirmation, playback issues, or wrong-batch replacement requests, please contact our student support desk:
                  </p>
                  <div className="rounded-xl border border-slate-200 p-5 bg-slate-50/40 space-y-2.5 text-xs sm:text-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200/70 pb-2">
                      <span className="font-semibold text-slate-600">Operating Hours</span>
                      <span className="font-semibold text-slate-900">{PLATFORM_INFO.operatingHours}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200/70 pb-2">
                      <span className="font-semibold text-slate-600">Support Email</span>
                      <a
                        href={`mailto:${PLATFORM_INFO.emails.support}`}
                        className="font-semibold text-slate-900 underline hover:text-slate-700"
                      >
                        {PLATFORM_INFO.emails.support}
                      </a>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200/70 pb-2">
                      <span className="font-semibold text-slate-600">Student Helpline / WhatsApp Support</span>
                      <a
                        href={PLATFORM_INFO.phoneHref}
                        className="font-semibold text-slate-900 underline hover:text-slate-700"
                      >
                        {PLATFORM_INFO.phoneDisplay}
                      </a>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="font-semibold text-slate-600">Average Response Time</span>
                      <span className="font-semibold text-slate-900">{PLATFORM_INFO.averageResponseTime}</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 2 */}
              <section id="email-directory" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  2. Dedicated Department Email Channels
                </h2>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/40">
                    <div className="font-semibold text-slate-900">Course, Delivery &amp; Batch Support</div>
                    <a
                      href={`mailto:${PLATFORM_INFO.emails.support}`}
                      className="mt-1 inline-block text-slate-700 font-medium underline hover:text-slate-950 break-all"
                    >
                      {PLATFORM_INFO.emails.support}
                    </a>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/40">
                    <div className="font-semibold text-slate-900">Student Privacy &amp; Account Erasure</div>
                    <a
                      href={`mailto:${PLATFORM_INFO.emails.privacy}`}
                      className="mt-1 inline-block text-slate-700 font-medium underline hover:text-slate-950 break-all"
                    >
                      {PLATFORM_INFO.emails.privacy}
                    </a>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/40">
                    <div className="font-semibold text-slate-900">Terms, Copyright &amp; IP Notices</div>
                    <div className="mt-1 space-y-0.5">
                      <a
                        href={`mailto:${PLATFORM_INFO.emails.terms}`}
                        className="block text-slate-700 font-medium underline hover:text-slate-950 break-all"
                      >
                        {PLATFORM_INFO.emails.terms}
                      </a>
                      <a
                        href={`mailto:${PLATFORM_INFO.emails.legal}`}
                        className="block text-slate-700 font-medium underline hover:text-slate-950 break-all"
                      >
                        {PLATFORM_INFO.emails.legal}
                      </a>
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/40">
                    <div className="font-semibold text-slate-900">Formal Grievance Escalations</div>
                    <a
                      href={`mailto:${PLATFORM_INFO.emails.grievance}`}
                      className="mt-1 inline-block text-slate-700 font-medium underline hover:text-slate-950 break-all"
                    >
                      {PLATFORM_INFO.emails.grievance}
                    </a>
                  </div>
                </div>
              </section>

              {/* Section 3 */}
              <section id="operating-details" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  3. Registered Operating Details
                </h2>
                <div className="mt-4 space-y-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 space-y-3 text-xs sm:text-sm">
                    <div className="flex items-center gap-2 font-semibold text-slate-900 pb-2 border-b border-slate-200/70">
                      <Building2 className="h-4 w-4 text-slate-600" />
                      <span>Platform &amp; Operating Information</span>
                    </div>

                    <dl className="space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <dt className="font-semibold text-slate-600">Platform Name</dt>
                        <dd className="font-semibold text-slate-900 sm:text-right">{PLATFORM_INFO.name}</dd>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <dt className="font-semibold text-slate-600">Founder / Operator</dt>
                        {/* Add Founder / Operator name inside the <dd> below when ready */}
                        <dd className="font-semibold text-slate-900 sm:text-right min-h-[1.25rem]" aria-label="Founder or Operator name"></dd>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <dt className="font-semibold text-slate-600 shrink-0">Operating Address</dt>
                        <dd className="font-medium text-slate-900 sm:text-right max-w-md">
                          {PLATFORM_INFO.address.street}, {PLATFORM_INFO.address.city}, District:{" "}
                          {PLATFORM_INFO.address.district}, PIN Code:{" "}
                          {PLATFORM_INFO.address.pinCode}, {PLATFORM_INFO.address.state},{" "}
                          {PLATFORM_INFO.address.country}
                        </dd>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <dt className="font-semibold text-slate-600">Official Website</dt>
                        <dd className="sm:text-right">
                          <a
                            href={PLATFORM_INFO.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-slate-900 underline hover:text-slate-700"
                          >
                            {PLATFORM_INFO.url}
                          </a>
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </section>

              {/* Section 4 */}
              <section id="grievance-redressal" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  4. Grievance Redressal Mechanism
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    In accordance with the <strong>Information Technology Act, 2000</strong> (and rules thereunder) and the <strong>Consumer Protection (E-Commerce) Rules, 2020</strong>, the details of the designated Grievance &amp; Compliance Officer for consumer complaints, privacy issues, intellectual property notices, and payment escalations are provided below:
                  </p>

                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 space-y-3 text-xs sm:text-sm">
                    <div className="flex items-center gap-2 font-semibold text-slate-900 pb-2 border-b border-slate-200/70">
                      <ShieldCheck className="h-4 w-4 text-slate-600" />
                      <span>Designated Grievance Officer</span>
                    </div>

                    <dl className="space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <dt className="font-semibold text-slate-600">Name of Officer</dt>
                        {/* Add Grievance & Compliance Officer name inside the <dd> below when ready */}
                        <dd className="font-semibold text-slate-900 sm:text-right min-h-[1.25rem]" aria-label="Grievance Officer name"></dd>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <dt className="font-semibold text-slate-600">Designation</dt>
                        <dd className="font-semibold text-slate-900 sm:text-right">
                          Grievance &amp; Compliance Officer
                        </dd>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <dt className="font-semibold text-slate-600">Email for Escalations</dt>
                        <dd className="sm:text-right">
                          <a
                            href={`mailto:${PLATFORM_INFO.emails.grievance}`}
                            className="font-semibold text-slate-900 underline hover:text-slate-700"
                          >
                            {PLATFORM_INFO.emails.grievance}
                          </a>
                        </dd>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <dt className="font-semibold text-slate-600 shrink-0">Postal Address</dt>
                        <dd className="font-medium text-slate-900 sm:text-right max-w-md">
                          {PLATFORM_INFO.address.full}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </section>

              {/* Section 5 */}
              <section id="resolution-timelines" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  5. Complaint Submission &amp; Resolution Timelines
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    To help us investigate and resolve your inquiry or grievance rapidly, please include:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600">
                    <li>Your full name, registered email address, and registered mobile number.</li>
                    <li>Transaction / Order ID and payment screenshot (for payment, delivery, or batch-replacement queries).</li>
                    <li>A clear summary of the issue and any relevant URL or course code.</li>
                  </ul>
                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-5 space-y-2 text-xs sm:text-sm text-slate-600">
                    <div className="flex items-center gap-2 font-semibold text-slate-900">
                      <MapPin className="h-4 w-4 text-slate-600" />
                      <span>Statutory Acknowledgment &amp; Redressal SLA</span>
                    </div>
                    <p>
                      All formal grievances sent to{" "}
                      <a
                        href={`mailto:${PLATFORM_INFO.emails.grievance}`}
                        className="font-semibold text-slate-900 underline hover:text-slate-700"
                      >
                        {PLATFORM_INFO.emails.grievance}
                      </a>{" "}
                      are acknowledged within <strong>48 hours</strong> and resolved within the statutory timeline of <strong>15 to 30 days</strong> in accordance with applicable Indian regulations. For our strict no-refund and wrong-batch replacement terms, see our{" "}
                      <Link
                        href="/refund-policy"
                        className="font-semibold text-slate-900 underline hover:text-slate-700"
                      >
                        Refund &amp; Cancellation Policy
                      </Link>.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </article>

          <div className="max-w-3xl mx-auto pt-10">
            <LegalFooter currentDoc="contact" />
          </div>
        </main>
      </div>
    </div>
  );
}

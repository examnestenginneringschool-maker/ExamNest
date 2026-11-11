import type { Metadata } from "next";
import Link from "next/link";
import { LegalHeader } from "@/components/legal/LegalHeader";
import { LegalFooter } from "@/components/legal/LegalFooter";
import { LegalTableOfContents, type TocItem } from "@/components/legal/LegalTableOfContents";
import { PLATFORM_INFO } from "@/lib/legal/navigation";
import { Scale, AlertCircle, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Conditions | ExamNest",
  description:
    "Review the Terms & Conditions for ExamNest. Learn about student usage guidelines, digital course access, academic integrity, permitted use, and institutional disclaimers.",
};

const TERMS_TOC_ITEMS: TocItem[] = [
  { id: "acceptance", number: "01", label: "Acceptance of Terms" },
  { id: "educational-purpose", number: "02", label: "Educational Purpose & Scope" },
  { id: "account-eligibility", number: "03", label: "Account Eligibility & Email" },
  { id: "permitted-use", number: "04", label: "Permitted Student License" },
  { id: "prohibited-conduct", number: "05", label: "Prohibited Conduct & Scraping" },
  { id: "academic-integrity", number: "06", label: "Academic Integrity & Codes" },
  { id: "intellectual-property", number: "07", label: "Intellectual Property" },
  { id: "disclaimers", number: "08", label: "Accuracy of Material" },
  { id: "liability", number: "09", label: "Limitation of Liability" },
  { id: "termination", number: "10", label: "Account Termination" },
  { id: "amendments", number: "11", label: "Amendments to Terms" },
  { id: "contact", number: "12", label: "Contact & Legal Team" },
];

export default function TermsOfUsePage() {
  const lastUpdated = PLATFORM_INFO.lastUpdated;

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-white text-slate-900 font-sans selection:bg-slate-900 selection:text-white flex flex-col">
      <LegalHeader activeTab="terms" />

      {/* Independent Split-Containers Layout */}
      <div className="flex-1 lg:overflow-hidden flex flex-col lg:flex-row w-full max-w-[1500px] mx-auto">
        {/* CONTAINER 1 (Left): Independent Table of Contents Container */}
        <aside className="w-full lg:w-[290px] xl:w-[330px] shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200/80 bg-slate-50/50 p-4 sm:p-6 lg:h-full lg:overflow-y-auto">
          <LegalTableOfContents
            items={TERMS_TOC_ITEMS}
            title="Terms Sections"
            contactEmail={PLATFORM_INFO.emails.terms}
          />
        </aside>

        {/* CONTAINER 2 (Right): Independent Document / Proforma Scroll Container */}
        <main
          id="legal-content-scroll"
          className="flex-1 lg:h-full lg:overflow-y-auto px-6 sm:px-10 lg:px-14 xl:px-16 py-8 lg:py-12 bg-white"
        >
          <article className="max-w-3xl mx-auto pb-16">
            {/* Document Header */}
            <header className="pb-8 border-b border-slate-200">
              <div className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-slate-700 mb-4">
                <Scale className="h-3.5 w-3.5 text-slate-600" />
                <span>Standard Legal Agreement</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
                Terms &amp; Conditions
              </h1>

              <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
                These Terms &amp; Conditions (also referred to as our Terms of Use) govern your access to and usage of ExamNest (<code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-700">examnestcollege.vercel.app</code>). By creating an account, purchasing a course bundle, or reviewing study material on this platform, you agree to comply with these terms, our Student Privacy Policy, Refund &amp; Cancellation Policy, and Fair Usage Policy.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-500 font-medium">
                <span>Last Updated: <strong className="text-slate-700">{lastUpdated}</strong></span>
                <span>•</span>
                <span>Scope: <strong className="text-slate-700">All Students, Contributors &amp; Visitors</strong></span>
                <span>•</span>
                <span>Document Reference: <strong className="text-slate-700">EN-TOS-2026</strong></span>
              </div>
            </header>

            {/* Institutional & Academic Notice Card (Minimalist & Authoritative) */}
            <div className="my-8 rounded-xl border border-slate-200 bg-slate-50/70 p-6">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-2">
                <AlertCircle className="h-4 w-4 text-slate-700" />
                <span>Important Institutional Notice &amp; Academic Scope</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                ExamNest is an <strong>independent, private educational technology platform</strong>. ExamNest is not affiliated with, associated with, authorized by, endorsed by, or officially connected to Maulana Abul Kalam Azad University of Technology (MAKAUT), West Bengal State Council of Technical Education (WBSCTE), the All India Council for Technical Education (AICTE), or any state or central university administration. Course codes, syllabus outlines, and university guidelines are referenced strictly for academic alignment, indexing, and nominative fair use. See our full{" "}
                <Link href="/academic-disclaimer" className="font-semibold text-slate-900 underline hover:text-slate-700">
                  Academic Disclaimer
                </Link>.
              </p>
            </div>

            {/* Terms Body */}
            <div className="space-y-12 text-slate-700 leading-relaxed text-sm sm:text-base">
              {/* Section 1 */}
              <section id="acceptance" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  1. Acceptance of Terms
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    By accessing, browsing, registering for, purchasing digital content on, or using ExamNest (&quot;the Platform&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), you acknowledge that you have read, understood, and agreed to be legally bound by these Terms &amp; Conditions along with our{" "}
                    <Link href="/privacy" className="font-semibold text-slate-900 underline hover:text-slate-700">Student Privacy Policy</Link>,{" "}
                    <Link href="/refund-policy" className="font-semibold text-slate-900 underline hover:text-slate-700">Refund &amp; Cancellation Policy</Link>,{" "}
                    <Link href="/shipping-delivery" className="font-semibold text-slate-900 underline hover:text-slate-700">Shipping &amp; Delivery Policy</Link>, and{" "}
                    <Link href="/fair-usage" className="font-semibold text-slate-900 underline hover:text-slate-700">Fair Usage Policy</Link>.
                  </p>
                  <p>
                    If you do not accept these Terms in full, you must refrain from registering an account and immediately discontinue your use of the Platform.
                  </p>
                </div>
              </section>

              {/* Section 2 */}
              <section id="educational-purpose" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  2. Educational Purpose &amp; Platform Nature
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    ExamNest is organized as a specialized academic workspace designed to address curriculum friction for collegiate engineering students. The Platform provides digital educational resources and services—including university syllabus blueprints, online recorded video lectures, downloadable notes, step-by-step mathematical proofs, solved previous year questions (PYQs), and online mock tests.
                  </p>
                  <p>
                    <strong>Digital Services, Strict No-Refund Policy &amp; Independent Status:</strong> All purchases on ExamNest represent non-tangible, digital intellectual property provisioned electronically as described in our{" "}
                    <Link href="/shipping-delivery" className="font-semibold text-slate-900 underline hover:text-slate-700">Shipping &amp; Delivery Policy</Link>. Once a batch, course, or subject bundle is activated on your account, all sales are final under a strict <strong>No-Refund and No-Cancellation Policy</strong>; if you accidentally purchase an incorrect batch, ExamNest does not issue monetary refunds but may replace or transfer your enrollment from our side strictly provided you have not downloaded any notes or PDFs from that batch (see our{" "}
                    <Link href="/refund-policy" className="font-semibold text-slate-900 underline hover:text-slate-700">Refund &amp; Cancellation Policy</Link>). While our subject codes and modules are structured in alignment with AICTE guidelines and state technical curricula (such as MAKAUT and WBSCTE), ExamNest is not an official administrative service of any degree-awarding board. For official admit cards, registration numbers, re-evaluation requests, and grade sheets, students must always consult their university portals.
                  </p>
                </div>
              </section>

              {/* Section 3 */}
              <section id="account-eligibility" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  3. Account Eligibility &amp; Email Policy
                </h2>
                <div className="mt-4 space-y-3">
                  <p>To register an account on ExamNest, you must meet the following eligibility requirements:</p>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600">
                    <li>You must be at least 16 years of age or possess parental/guardian consent if required by your jurisdiction.</li>
                    <li>You must provide an authentic, valid email address and valid mobile phone number owned and accessible by you.</li>
                    <li>
                      <strong>Disposable &amp; Burner Email Prohibition:</strong> To safeguard the community, protect platform resources, and prevent abusive scraping, the registration of accounts using temporary or disposable email domains is strictly barred. Our security proxy enforces real-time disposable email verification; accounts registered using temporary domains are blocked from accessing protected student routes.
                    </li>
                    <li>You are solely responsible for maintaining the confidentiality of your session and are accountable for all actions taken under your credentials.</li>
                  </ul>
                </div>
              </section>

              {/* Section 4 */}
              <section id="permitted-use" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  4. Permitted Student License
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    Subject to your compliance with these Terms and our{" "}
                    <Link href="/fair-usage" className="font-semibold text-slate-900 underline hover:text-slate-700">Fair Usage Policy</Link>, ExamNest grants you a revocable, non-exclusive, non-transferable, single-user license strictly intended for your own individual, non-commercial personal learning.
                  </p>
                  <p>
                    ExamNest enforces a strict Single-Device Active Session policy: simultaneous logins across distinct IP ranges or unauthorized devices will trigger automatic session expiration. You may not share login credentials, screen-record or rip video streams, or print, recompile, or redistribute watermarked study PDFs on Telegram, WhatsApp, Google Drive, or third-party platforms.
                  </p>
                </div>
              </section>

              {/* Section 5 */}
              <section id="prohibited-conduct" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  5. Prohibited Conduct &amp; Scraping Restrictions
                </h2>
                <div className="mt-4 space-y-3">
                  <p>When using ExamNest, you agree that you will NOT:</p>
                  <div className="space-y-2 text-xs sm:text-sm text-slate-600">
                    <div className="rounded-lg border border-slate-200 p-3 bg-slate-50/50">
                      <strong>A. Automated Scraping &amp; Extraction:</strong> Deploy automated crawlers, bots, headless browsers, data scrapers, or scripts to harvest notes, question banks, or curriculum trees in bulk.
                    </div>
                    <div className="rounded-lg border border-slate-200 p-3 bg-slate-50/50">
                      <strong>B. Commercial Exploitation:</strong> Resell, sublicense, package, or monetize any compiled notes or ExamNest materials in any format.
                    </div>
                    <div className="rounded-lg border border-slate-200 p-3 bg-slate-50/50">
                      <strong>C. Security Violations:</strong> Probe, scan, or test the vulnerabilities of the application; attempt to bypass Row-Level Security (RLS) policies; intercept authentication tokens; or access data belonging to other students.
                    </div>
                    <div className="rounded-lg border border-slate-200 p-3 bg-slate-50/50">
                      <strong>D. Infrastructure Interference:</strong> Launch Denial of Service (DoS/DDoS) attacks, trigger excessive queries intentionally, or introduce malicious payloads into server action endpoints.
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 6 */}
              <section id="academic-integrity" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  6. Academic Integrity &amp; Honor Codes
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    ExamNest is dedicated to academic honesty and authentic conceptual mastery. Our notes, derivations, and question papers are structured to help students understand difficult technical concepts before entering examination halls.
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600">
                    <li>Students are expected to uphold the honor codes, disciplinary rules, and academic honesty policies of their respective educational institutions.</li>
                    <li>The Platform must never be used to facilitate cheating during live, closed-book university examinations or proctored assessments.</li>
                    <li>Any student discovered attempting to utilize ExamNest to violate exam room regulations is subject to immediate account termination.</li>
                  </ul>
                </div>
              </section>

              {/* Section 7 */}
              <section id="intellectual-property" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  7. Intellectual Property &amp; Attribution
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    <strong>Statutory Curricula:</strong> The names of universities, college affiliations, standard course codes (e.g. BS-PH101, BS-M101), and statutory syllabus guidelines are the intellectual property of their respective governing boards. ExamNest makes no claim of ownership over official university syllabus blueprints and uses them solely for pedagogical identification and educational navigation.
                  </p>
                  <p>
                    <strong>Proprietary Compilations:</strong> The original pedagogical explanations, mathematical proofs, LaTeX-formatted derivations, custom circuit diagrams, recorded lectures, mock test banks, platform source code, and user interface designs are the intellectual property of ExamNest and its academic contributors. All rights not expressly granted are reserved. For full details on forensic watermarking and takedown notices, see our{" "}
                    <Link href="/copyright-policy" className="font-semibold text-slate-900 underline hover:text-slate-700">
                      Copyright &amp; IP Policy
                    </Link>.
                  </p>
                </div>
              </section>

              {/* Section 8 */}
              <section id="disclaimers" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  8. Accuracy of Content &amp; Disclaimers
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    While our contributor collective rigorously peer-reviews every lecture unit, derivation step, and formula sheet for accuracy (please also review our full{" "}
                    <Link href="/academic-disclaimer" className="font-semibold text-slate-900 underline hover:text-slate-700">
                      Academic Disclaimer
                    </Link>):
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600">
                    <li>The Platform and all study materials are provided on an <strong>&quot;AS IS&quot;</strong> and <strong>&quot;AS AVAILABLE&quot;</strong> basis, without warranties of any kind, whether express, statutory, or implied.</li>
                    <li>Universities may revise syllabus sub-clauses, question paper weighting, or credit rules without notice. Students are encouraged to cross-reference official model curricula, textbooks, and circulars issued by their respective universities.</li>
                    <li>ExamNest makes no guarantee that specific solved questions will reappear in university semester examinations or that using our study materials will produce specific letter grades, SGPA/CGPA scores, or passing outcomes.</li>
                  </ul>
                </div>
              </section>

              {/* Section 9 */}
              <section id="liability" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  9. Limitation of Liability
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    To the fullest extent permissible by applicable law, ExamNest, its maintainers, student contributors, and infrastructure providers shall not be held liable for any direct, indirect, incidental, consequential, special, or exemplary damages—including but not limited to loss of academic standing, missed examination deadlines, hardware failure, or service interruptions—arising from your use of or inability to use the Platform.
                  </p>
                </div>
              </section>

              {/* Section 10 */}
              <section id="termination" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  10. Account Termination &amp; Suspension
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    We reserve the right, at our sole discretion, to suspend, disable, or permanently terminate your access to ExamNest without prior notice or refund if:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600">
                    <li>You violate any provision of these Terms &amp; Conditions, our Fair Usage Policy, or our Copyright &amp; IP Policy.</li>
                    <li>You register using a temporary, disposable, or invalid email address.</li>
                    <li>You engage in credential sharing, stream ripping, screen recording, watermarked PDF distribution, or automated web scraping.</li>
                    <li>Your activity places an unreasonable or disproportionately heavy load on our infrastructure.</li>
                  </ul>
                </div>
              </section>

              {/* Section 11 */}
              <section id="amendments" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  11. Amendments to Terms
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    We may revise these Terms &amp; Conditions periodically to reflect changes in our services, applicable legal regulations, or operational requirements. Updated terms become effective immediately upon being published on this page. Your continued access to the Platform following the publication of revised terms constitutes your binding acceptance of the updated terms.
                  </p>
                </div>
              </section>

              {/* Section 12 */}
              <section id="contact" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  12. Contact &amp; Legal Notices
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    For questions regarding these Terms &amp; Conditions, curriculum attribution notices, or intellectual property inquiries, please contact our legal and compliance team:
                  </p>

                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-5 space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-slate-900">
                      <Mail className="h-4 w-4 text-slate-600" />
                      <span>ExamNest Academic &amp; Legal Charter</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600">
                      Legal / Terms Email:{" "}
                      <a href={`mailto:${PLATFORM_INFO.emails.terms}`} className="font-semibold text-slate-900 underline hover:text-slate-700">
                        {PLATFORM_INFO.emails.terms}
                      </a>{" "}
                      · Escalations:{" "}
                      <a href={`mailto:${PLATFORM_INFO.emails.grievance}`} className="font-semibold text-slate-900 underline hover:text-slate-700">
                        {PLATFORM_INFO.emails.grievance}
                      </a>
                    </p>
                    <p className="text-xs text-slate-500">
                      Helpline: {PLATFORM_INFO.phoneDisplay} · Operating Address: {PLATFORM_INFO.address.full} · View full details on{" "}
                      <Link href="/contact" className="font-semibold text-slate-800 underline hover:text-slate-950">
                        Contact Us &amp; Grievance Redressal
                      </Link>.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </article>

          {/* Dedicated Legal Footer inside the scrollable document pane */}
          <div className="max-w-3xl mx-auto pt-10">
            <LegalFooter currentDoc="terms" />
          </div>
        </main>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { LegalHeader } from "@/components/legal/LegalHeader";
import { LegalFooter } from "@/components/legal/LegalFooter";
import { LegalTableOfContents, type TocItem } from "@/components/legal/LegalTableOfContents";
import { ShieldCheck, Lock, CheckCircle2, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Student Privacy Policy | ExamNest",
  description:
    "Learn how ExamNest protects student privacy, academic curriculum data, and account security. We do not sell student data or use third-party advertising trackers.",
};

const PRIVACY_TOC_ITEMS: TocItem[] = [
  { id: "core-philosophy", number: "01", label: "Core Privacy Philosophy" },
  { id: "information-we-collect", number: "02", label: "Information We Collect" },
  { id: "information-we-do-not-collect", number: "03", label: "What We Do Not Collect" },
  { id: "how-we-use-information", number: "04", label: "How We Use Information" },
  { id: "data-storage-security", number: "05", label: "Storage & Encryption" },
  { id: "third-party-providers", number: "06", label: "Third-Party Infrastructure" },
  { id: "academic-confidentiality", number: "07", label: "Academic Confidentiality" },
  { id: "student-rights", number: "08", label: "Student Rights & Erasure" },
  { id: "cookies-and-storage", number: "09", label: "Cookies & Local Storage" },
  { id: "age-limitations", number: "10", label: "Eligibility & Age Scope" },
  { id: "policy-changes", number: "11", label: "Updates to This Policy" },
  { id: "contact", number: "12", label: "Contact & Privacy Team" },
];

export default function StudentPrivacyPage() {
  const lastUpdated = "October 2026";

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-white text-slate-900 font-sans selection:bg-slate-900 selection:text-white flex flex-col">
      <LegalHeader activeTab="privacy" />

      {/* Independent Split-Containers Layout */}
      <div className="flex-1 lg:overflow-hidden flex flex-col lg:flex-row w-full max-w-[1500px] mx-auto">
        {/* CONTAINER 1 (Left): Independent Table of Contents Container */}
        <aside className="w-full lg:w-[290px] xl:w-[330px] shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200/80 bg-slate-50/50 p-4 sm:p-6 lg:h-full lg:overflow-y-auto">
          <LegalTableOfContents
            items={PRIVACY_TOC_ITEMS}
            title="Privacy Sections"
            contactEmail="privacy@examnest.com"
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
                <ShieldCheck className="h-3.5 w-3.5 text-slate-600" />
                <span>Official Policy</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
                Student Privacy Policy
              </h1>

              <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
                This policy outlines how ExamNest collects, handles, and protects your personal and academic information. Our platform is built on an absolute principle: your education belongs to you, and your study data will never be commercialized.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-500 font-medium">
                <span>Last Updated: <strong className="text-slate-700">{lastUpdated}</strong></span>
                <span>•</span>
                <span>Scope: <strong className="text-slate-700">All Registered Students &amp; Visitors</strong></span>
                <span>•</span>
                <span>Document Reference: <strong className="text-slate-700">EN-POL-PRIV-2026</strong></span>
              </div>
            </header>

            {/* Guiding Principles Card */}
            <div className="my-8 rounded-xl border border-slate-200 bg-slate-50/70 p-6">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-2">
                <Lock className="h-4 w-4 text-slate-700" />
                <span>Our Non-Negotiable Student Privacy Guarantees</span>
              </div>
              <ul className="mt-3 space-y-2 text-xs sm:text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Zero Data Monetization:</strong> We never sell, rent, or trade student names, emails, or study habits to advertisers, data brokers, or recruiters.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>No Behavioral Ad Tracking:</strong> We run no advertising networks and do not deploy cross-site tracking pixels or biometric tracking.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Full Account &amp; Data Control:</strong> You can delete your account and all associated academic data at any time with complete data purging.</span>
                </li>
              </ul>
            </div>

            {/* Policy Body */}
            <div className="space-y-12 text-slate-700 leading-relaxed text-sm sm:text-base">
              {/* Section 1 */}
              <section id="core-philosophy" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  1. Core Privacy Philosophy
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    ExamNest is an independent educational initiative created to solve academic confusion for engineering students. We believe educational software should be clean, fast, and transparent. We operate under the standard that your personal data is held in strict stewardship, solely to provide you with syllabus blueprints, verified notes, and exam patterns.
                  </p>
                  <p>
                    We do not sell student attention or profile data. We do not participate in ad exchanges or sell lead lists to private tuition companies, test-prep coaching centers, or corporate recruiters.
                  </p>
                </div>
              </section>

              {/* Section 2 */}
              <section id="information-we-collect" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  2. Information We Collect
                </h2>
                <div className="mt-4 space-y-4">
                  <p>
                    We only collect information directly necessary to provide your curriculum roadmap and study material:
                  </p>

                  <div className="space-y-3">
                    <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/40">
                      <h3 className="font-semibold text-slate-900">A. Authentication &amp; Identity Credentials</h3>
                      <p className="mt-1 text-xs sm:text-sm text-slate-600">
                        When you create an account, we collect your name and email address. Authentication is securely managed through Supabase Authentication. Passwords are never stored in plaintext and are securely hashed using industry-standard cryptographic algorithms (bcrypt).
                      </p>
                    </div>

                    <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/40">
                      <h3 className="font-semibold text-slate-900">B. Academic Placement Profile</h3>
                      <p className="mt-1 text-xs sm:text-sm text-slate-600">
                        During the onboarding process, you select your university affiliation (e.g. MAKAUT, State or Central University), college, degree program (e.g. B.Tech Computer Science), department, and active semester. This information is saved to your <code className="text-xs bg-slate-200 px-1 py-0.5 rounded font-mono">student_profiles</code> record so the system can filter and present your exact curriculum subjects.
                      </p>
                    </div>

                    <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/40">
                      <h3 className="font-semibold text-slate-900">C. Study Progress &amp; Workspace State</h3>
                      <p className="mt-1 text-xs sm:text-sm text-slate-600">
                        We record your onboarding completion status and basic bookmarking preferences so that when you sign in, you are returned directly to your relevant semester dashboard and subject notes.
                      </p>
                    </div>

                    <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/40">
                      <h3 className="font-semibold text-slate-900">D. Technical &amp; Operational Telemetry</h3>
                      <p className="mt-1 text-xs sm:text-sm text-slate-600">
                        When you access ExamNest, our servers record standard HTTP request data including your IP address, browser user-agent, operating system, and request timestamps. This information is utilized strictly for rate limiting, DDoS defense, preventing unauthorized database scraping, and investigating runtime server errors.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 3 */}
              <section id="information-we-do-not-collect" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  3. What We Explicitly Do Not Collect
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    To maintain standard boundaries and eliminate intrusive surveillance, ExamNest intentionally does not collect:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600">
                    <li>Financial, payment card, or banking details (the academic companion is provided free for students).</li>
                    <li>Biometric identifiers or facial geometry.</li>
                    <li>Microphone, camera, or contact list data from your mobile or desktop device.</li>
                    <li>Precise GPS location coordinates.</li>
                    <li>Third-party web browsing history or social media tracking beacons.</li>
                  </ul>
                </div>
              </section>

              {/* Section 4 */}
              <section id="how-we-use-information" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  4. How We Use Student Information
                </h2>
                <div className="mt-4 space-y-3">
                  <p>We process your data exclusively for legitimate educational purposes:</p>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600">
                    <li><strong>Curriculum Resolution:</strong> Mapping your selected university, degree, and semester to the correct subject syllabi, derivation steps, and study modules.</li>
                    <li><strong>Authentication &amp; Session Management:</strong> Verifying your identity across authenticated sessions and preventing unauthorized account takeover.</li>
                    <li><strong>System Reliability:</strong> Benchmarking database query latency, identifying slow API routes, and optimizing serverless edge execution times.</li>
                    <li><strong>Security &amp; Abuse Prevention:</strong> Enforcing rate limits, detecting bot scrapers, and blocking disposable email domains that compromise system integrity.</li>
                  </ul>
                </div>
              </section>

              {/* Section 5 */}
              <section id="data-storage-security" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  5. Storage, Encryption &amp; Security Architecture
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    We implement comprehensive technical and organizational safeguards designed to protect student data against unauthorized access, loss, or alteration:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-600">
                    <li><strong>Encryption in Transit:</strong> All communications between your browser, Vercel edge nodes, and database servers are protected using Transport Layer Security (TLS 1.3).</li>
                    <li><strong>Encryption at Rest:</strong> Database volumes and student tables are stored in PostgreSQL instances hosted by Supabase with AES-256 storage encryption.</li>
                    <li><strong>Row-Level Security (RLS):</strong> Our database employs granular PostgreSQL Row-Level Security policies. This ensures that student records are isolated so no user can view or modify another student&apos;s academic configuration.</li>
                    <li><strong>Principle of Least Privilege:</strong> Server actions and database connections use scoped keys, preventing public exposure of privileged service keys.</li>
                  </ul>
                </div>
              </section>

              {/* Section 6 */}
              <section id="third-party-providers" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  6. Third-Party Infrastructure
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    To provide high availability and fast page delivery, we work with trusted cloud infrastructure providers bound by strict data processing and confidentiality agreements:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm mt-3">
                    <div className="rounded-lg border border-slate-200 p-3 bg-slate-50/50">
                      <div className="font-semibold text-slate-900">Supabase Inc.</div>
                      <div className="text-slate-500 mt-1">Managed PostgreSQL database, identity authentication, and row-level access control.</div>
                    </div>
                    <div className="rounded-lg border border-slate-200 p-3 bg-slate-50/50">
                      <div className="font-semibold text-slate-900">Vercel Inc.</div>
                      <div className="text-slate-500 mt-1">Global serverless compute, Next.js application hosting, and CDN edge asset distribution.</div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    We do not transfer data to any other third parties unless legally required by a valid judicial subpoena or law enforcement warrant under applicable national laws.
                  </p>
                </div>
              </section>

              {/* Section 7 */}
              <section id="academic-confidentiality" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  7. Academic Confidentiality (No Faculty Surveillance)
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    Many academic tools monitor students and report surveillance data back to universities or colleges. ExamNest does not do this:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600">
                    <li>We do not generate student surveillance dossiers or report your reading activity to your college professors or university administrations.</li>
                    <li>How many times you view a derivation, when you study, or which past year questions you review remains completely private to your account.</li>
                    <li>ExamNest is your private companion for self-directed engineering preparation.</li>
                  </ul>
                </div>
              </section>

              {/* Section 8 */}
              <section id="student-rights" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  8. Student Rights &amp; Account Deletion
                </h2>
                <div className="mt-4 space-y-3">
                  <p>Every student using ExamNest possesses standard rights regarding their personal data:</p>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600">
                    <li><strong>Right of Access &amp; Portability:</strong> You can review your enrolled academic choices and account details from your workspace profile at any time.</li>
                    <li><strong>Right of Rectification:</strong> If you change your semester, branch, or college, you can update your track directly through your profile settings.</li>
                    <li><strong>Right to Erasure (Account Deletion):</strong> You may request the complete deletion of your account at any time. Upon your email request to <code className="text-xs bg-slate-200 px-1 py-0.5 rounded font-mono">privacy@examnest.com</code>, all records in <code className="text-xs bg-slate-200 px-1 py-0.5 rounded font-mono">profiles</code> and <code className="text-xs bg-slate-200 px-1 py-0.5 rounded font-mono">student_profiles</code> are irrevocably purged from active databases within 30 calendar days.</li>
                  </ul>
                </div>
              </section>

              {/* Section 9 */}
              <section id="cookies-and-storage" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  9. Cookies &amp; Local Storage
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    We maintain an ultra-minimal cookie footprint. We use cookies exclusively for essential technical functions:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600">
                    <li><strong>Essential Authentication Cookies:</strong> Secure, HTTP-only authentication tokens created by Supabase Auth to keep your session active across page navigations.</li>
                    <li><strong>Security &amp; CSRF Tokens:</strong> Temporary tokens used to prevent Cross-Site Request Forgery during server action dispatches.</li>
                  </ul>
                  <p className="text-xs text-slate-500">
                    We do not use advertising cookies, marketing pixels, or third-party behavioral profiling trackers.
                  </p>
                </div>
              </section>

              {/* Section 10 */}
              <section id="age-limitations" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  10. Eligibility &amp; Age Limitations
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    ExamNest is intended for engineering, collegiate, and secondary school students preparing for university-level technical curricula (typically aged 16 and older). We do not knowingly solicit or collect personal information from individuals under the age of 13. If we become aware that personal information of a child under 13 has been collected without parental consent, we will promptly delete that information from our records.
                  </p>
                </div>
              </section>

              {/* Section 11 */}
              <section id="policy-changes" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  11. Updates to This Policy
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    We may periodically update this Student Privacy Policy to reflect enhancements to our academic platform, regulatory changes, or security improvements. Whenever changes are made, the revised date at the top of this document will be updated. In the event of substantial changes affecting student rights, we will provide a prominent notice on the platform home.
                  </p>
                </div>
              </section>

              {/* Section 12 */}
              <section id="contact" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  12. Contact &amp; Privacy Inquiries
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    If you have questions regarding this Student Privacy Policy, wish to request account deletion, or require clarification regarding your academic data, you can reach our privacy team directly:
                  </p>

                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-5 space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-slate-900">
                      <Mail className="h-4 w-4 text-slate-600" />
                      <span>ExamNest Privacy &amp; Data Stewardship</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600">
                      Email: <a href="mailto:privacy@examnest.com" className="font-semibold text-slate-900 underline hover:text-slate-700">privacy@examnest.com</a>
                    </p>
                    <p className="text-xs text-slate-500">
                      Response SLA: Standard inquiries and account deletion requests are reviewed within 48 business hours.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </article>

          {/* Dedicated Legal Footer inside the scrollable document pane */}
          <div className="max-w-3xl mx-auto pt-10">
            <LegalFooter currentDoc="privacy" />
          </div>
        </main>
      </div>
    </div>
  );
}

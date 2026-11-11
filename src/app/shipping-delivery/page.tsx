import type { Metadata } from "next";
import Link from "next/link";
import { LegalHeader } from "@/components/legal/LegalHeader";
import { LegalFooter } from "@/components/legal/LegalFooter";
import {
  LegalTableOfContents,
  type TocItem,
} from "@/components/legal/LegalTableOfContents";
import { PLATFORM_INFO } from "@/lib/legal/navigation";
import { Zap, CheckCircle2, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy | ExamNest",
  description:
    "Learn how ExamNest provisions instant digital delivery for online courses, study notes, PYQ solutions, and mock test series with zero physical shipping fees.",
};

const DELIVERY_TOC_ITEMS: TocItem[] = [
  { id: "digital-only-scope", number: "01", label: "Zero Physical Shipping" },
  { id: "access-timeline", number: "02", label: "Digital Delivery Timeline" },
  { id: "receipt-confirmation", number: "03", label: "Receipts & Confirmation" },
  { id: "access-portal", number: "04", label: "Accessing Your Material" },
  { id: "access-issues", number: "05", label: "Delayed Access & Debits" },
  { id: "delivery-support", number: "06", label: "Delivery Support Channels" },
];

export default function ShippingDeliveryPage() {
  const lastUpdated = PLATFORM_INFO.lastUpdated;

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-white text-slate-900 font-sans selection:bg-slate-900 selection:text-white flex flex-col">
      <LegalHeader activeTab="shipping-delivery" />

      {/* Independent Split-Containers Layout */}
      <div className="flex-1 lg:overflow-hidden flex flex-col lg:flex-row w-full max-w-[1500px] mx-auto">
        {/* CONTAINER 1 (Left): Independent Table of Contents Container */}
        <aside className="w-full lg:w-[290px] xl:w-[330px] shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200/80 bg-slate-50/50 p-4 sm:p-6 lg:h-full lg:overflow-y-auto">
          <LegalTableOfContents
            items={DELIVERY_TOC_ITEMS}
            title="Delivery Sections"
            contactEmail={PLATFORM_INFO.emails.support}
            contactLabel="Access not showing?"
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
                <Zap className="h-3.5 w-3.5 text-slate-600" />
                <span>Digital Fulfillment</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
                Shipping &amp; Delivery Policy
              </h1>

              <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
                ExamNest delivers all educational products electronically through your online student workspace. This policy outlines our digital provisioning timelines, confirmation receipts, and access troubleshooting steps.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-500 font-medium">
                <span>
                  Last Updated:{" "}
                  <strong className="text-slate-700">{lastUpdated}</strong>
                </span>
                <span>•</span>
                <span>
                  Fulfillment Mode:{" "}
                  <strong className="text-slate-700">100% Instant Digital Delivery</strong>
                </span>
                <span>•</span>
                <span>
                  Document Reference:{" "}
                  <strong className="text-slate-700">EN-POL-DEL-2026</strong>
                </span>
              </div>
            </header>

            {/* Quick Summary Card */}
            <div className="my-8 rounded-xl border border-slate-200 bg-slate-50/70 p-6">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-2">
                <Zap className="h-4 w-4 text-slate-700" />
                <span>Digital Provisioning Snapshot</span>
              </div>
              <ul className="mt-3 space-y-2 text-xs sm:text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Instant Dashboard Unlock:</strong> Courses, notes, and mock test bundles are activated immediately after payment gateway confirmation.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Receipt Delivery:</strong> Electronic payment receipt and access confirmation email sent within <strong>5 to 15 minutes</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Zero Courier Fees:</strong> No physical books or parcels are shipped, so zero shipping or handling charges apply.
                  </span>
                </li>
              </ul>
            </div>

            {/* Policy Body */}
            <div className="space-y-12 text-slate-700 leading-relaxed text-sm sm:text-base">
              {/* Section 1 */}
              <section id="digital-only-scope" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  1. Scope &amp; Zero Physical Shipping
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    ExamNest provides digital educational services, including online recorded video lectures, downloadable notes, previous year question solutions, and online mock tests. All purchases made on ExamNest (<code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-700">{PLATFORM_INFO.domain}</code>) represent non-tangible, digital intellectual property.
                  </p>
                  <p>
                    Because ExamNest does not sell or dispatch printed books, physical kits, or hardware items, there is <strong>no physical shipping, courier tracking, or postal delivery charge</strong> on any transaction.
                  </p>
                </div>
              </section>

              {/* Section 2 */}
              <section id="access-timeline" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  2. Digital Delivery &amp; Access Timeline
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    Upon successful payment processing through our authorized payment gateways (UPI, debit/credit cards, or net banking), access to the purchased course, subject bundle, or test series is provisioned <strong>instantly</strong> to your registered ExamNest account.
                  </p>
                  <p>
                    For scheduled upcoming batches, your enrollment status appears in your account upon checkout, and course modules unlock automatically on the announced batch start date and time. Please note that once batch access is activated, all orders are strictly non-refundable under our{" "}
                    <Link
                      href="/refund-policy"
                      className="font-semibold text-slate-900 underline hover:text-slate-700"
                    >
                      Refund &amp; Cancellation Policy
                    </Link>.
                  </p>
                </div>
              </section>

              {/* Section 3 */}
              <section id="receipt-confirmation" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  3. Electronic Receipt &amp; Confirmation
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    An electronic payment receipt and access confirmation email will be delivered to your registered email address within <strong>5 to 15 minutes</strong> of transaction completion.
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600">
                    If you do not see the confirmation email in your primary inbox, please inspect your Promotions or Spam folder before contacting support.
                  </p>
                </div>
              </section>

              {/* Section 4 */}
              <section id="access-portal" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  4. Accessing Your Enrolled Material
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    All unlocked curriculum modules, derivations, notes, and assessments are hosted securely inside your authenticated workspace at{" "}
                    <Link
                      href="/app/dashboard"
                      className="font-semibold text-slate-900 underline hover:text-slate-700"
                    >
                      {PLATFORM_INFO.domain}/app/dashboard
                    </Link>.
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Ensure you sign in using the exact email address used during checkout. Account access is governed by our single-active-device policy described in the{" "}
                    <Link
                      href="/fair-usage"
                      className="font-semibold text-slate-900 underline hover:text-slate-700"
                    >
                      Fair Usage Policy
                    </Link>.
                  </p>
                </div>
              </section>

              {/* Section 5 */}
              <section id="access-issues" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  5. Delayed Provisioning &amp; Failed Payment Debits
                </h2>
                <div className="mt-4 space-y-3">
                  <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/40">
                    <h3 className="font-semibold text-slate-900">
                      Access Issues After Successful Payment
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-slate-600">
                      If your transaction succeeds and funds are debited, but your dashboard does not reflect the purchased course within <strong>1 hour</strong>, please email support at{" "}
                      <a
                        href={`mailto:${PLATFORM_INFO.emails.support}`}
                        className="font-semibold text-slate-900 underline hover:text-slate-700"
                      >
                        {PLATFORM_INFO.emails.support}
                      </a>{" "}
                      with your <strong>Transaction ID</strong>, <strong>Registered Email</strong>, and <strong>Registered Mobile Number</strong>.
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/40">
                    <h3 className="font-semibold text-slate-900">
                      Pending / Timed-Out Bank Debits
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-slate-600">
                      If a transaction fails or times out due to bank/UPI connectivity while money was temporarily debited—and <strong>no batch was activated</strong>—the payment gateway automatically reconciles and reverses the unfulfilled debit back to your original payment method within <strong>5 to 7 business days</strong>. Please note that activated batch purchases are strictly non-refundable (with wrong-batch replacement available only before downloading notes); see our{" "}
                      <Link
                        href="/refund-policy"
                        className="font-semibold text-slate-900 underline hover:text-slate-700"
                      >
                        Refund &amp; Cancellation Policy
                      </Link>{" "}
                      for details.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 6 */}
              <section id="delivery-support" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  6. Delivery Support Channels
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    For prompt assistance with course activation, confirmation emails, or account enrollment verification, reach out to our student support desk:
                  </p>

                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-5 space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-slate-900">
                      <Mail className="h-4 w-4 text-slate-600" />
                      <span>ExamNest Digital Delivery Desk</span>
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
                    <p className="text-xs sm:text-sm text-slate-600">
                      Helpline / WhatsApp:{" "}
                      <a
                        href={PLATFORM_INFO.phoneHref}
                        className="font-semibold text-slate-900 underline hover:text-slate-700"
                      >
                        {PLATFORM_INFO.phoneDisplay}
                      </a>{" "}
                      ({PLATFORM_INFO.operatingHours})
                    </p>
                    <p className="text-xs text-slate-500">
                      Average Response Time: {PLATFORM_INFO.averageResponseTime} · Full contact &amp; grievance details available on{" "}
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
            <LegalFooter currentDoc="shipping-delivery" />
          </div>
        </main>
      </div>
    </div>
  );
}

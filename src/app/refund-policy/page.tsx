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
  ReceiptText,
  ShieldAlert,
  ArrowLeftRight,
  XCircle,
  Mail,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | ExamNest",
  description:
    "Review ExamNest's strict No-Refund and No-Cancellation policy once a batch is activated, along with our one-time wrong-batch replacement guidelines and gateway debit reconciliation.",
};

const REFUND_TOC_ITEMS: TocItem[] = [
  { id: "nature-of-services", number: "01", label: "Nature of Digital Services" },
  { id: "no-refund-policy", number: "02", label: "Strict No-Refund Policy" },
  { id: "batch-replacement", number: "03", label: "Wrong Batch Replacement" },
  { id: "non-eligible", number: "04", label: "Non-Eligible Cases" },
  { id: "gateway-reconciliation", number: "05", label: "Gateway Debits & Reversals" },
  { id: "request-process", number: "06", label: "How to Request Replacement" },
];

export default function RefundPolicyPage() {
  const lastUpdated = PLATFORM_INFO.lastUpdated;

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-white text-slate-900 font-sans selection:bg-slate-900 selection:text-white flex flex-col">
      <LegalHeader activeTab="refund-policy" />

      {/* Independent Split-Containers Layout */}
      <div className="flex-1 lg:overflow-hidden flex flex-col lg:flex-row w-full max-w-[1500px] mx-auto">
        {/* CONTAINER 1 (Left): Independent Table of Contents Container */}
        <aside className="w-full lg:w-[290px] xl:w-[330px] shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200/80 bg-slate-50/50 p-4 sm:p-6 lg:h-full lg:overflow-y-auto">
          <LegalTableOfContents
            items={REFUND_TOC_ITEMS}
            title="Policy Sections"
            contactEmail={PLATFORM_INFO.emails.support}
            contactLabel="Bought the wrong batch?"
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
                <ReceiptText className="h-3.5 w-3.5 text-slate-600" />
                <span>Billing &amp; Compliance</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
                Refund &amp; Cancellation Policy
              </h1>

              <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
                ExamNest operates a strict <strong>No-Refund and No-Cancellation Policy</strong> once a batch or digital course bundle is activated. Please verify your university, semester, and batch selection carefully prior to completing payment on{" "}
                <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-700">
                  {PLATFORM_INFO.domain}
                </code>.
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
                    All Paid Batches, Bundles &amp; Test Series
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Document Reference:{" "}
                  <strong className="text-slate-700">EN-POL-REF-2026</strong>
                </span>
              </div>
            </header>

            {/* Key Policy Summary Card */}
            <div className="my-8 rounded-xl border border-slate-200 bg-slate-50/70 p-6">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-2">
                <ShieldAlert className="h-4 w-4 text-slate-700" />
                <span>Mandatory Purchase &amp; Batch Replacement Notice</span>
              </div>
              <ul className="mt-3 space-y-2 text-xs sm:text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Strict No Monetary Refunds:</strong> Once a batch is activated on your account, all sales are final. No cash or original-source monetary refunds are issued under any circumstance.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowLeftRight className="h-4 w-4 text-slate-700 shrink-0 mt-0.5" />
                  <span>
                    <strong>Wrong Batch Replacement Only:</strong> If you accidentally enrolled in the wrong batch, our team can replace it with your intended batch <strong>only if you have not downloaded any notes or PDFs</strong> from that batch.
                  </span>
                </li>
              </ul>
            </div>

            {/* Policy Body */}
            <div className="space-y-12 text-slate-700 leading-relaxed text-sm sm:text-base">
              {/* Section 1 */}
              <section id="nature-of-services" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  1. Nature of Digital Educational Services
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    ExamNest provides digital educational services, including online recorded video lectures, downloadable notes, previous year question (PYQ) solutions, and online mock tests. All purchases made on ExamNest (<code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-700">{PLATFORM_INFO.domain}</code>) represent non-tangible, digital intellectual property provisioned electronically.
                  </p>
                  <p>
                    Because digital materials are unlocked immediately upon transaction confirmation, students are advised to review course codes, university affiliations, and semester specifications carefully before checkout. See our{" "}
                    <Link
                      href="/shipping-delivery"
                      className="font-semibold text-slate-900 underline hover:text-slate-700"
                    >
                      Shipping &amp; Delivery Policy
                    </Link>{" "}
                    for instant digital provisioning details.
                  </p>
                </div>
              </section>

              {/* Section 2 */}
              <section id="no-refund-policy" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  2. Strict No-Refund &amp; No-Cancellation Policy
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    Once a purchased batch, course, subject bundle, or test series is activated on your registered ExamNest account:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-600">
                    <li>
                      <strong>All Sales Are Final:</strong> Orders cannot be cancelled, revoked, or reversed once digital batch access has been activated.
                    </li>
                    <li>
                      <strong>Zero Monetary Refunds:</strong> ExamNest strictly does <strong>not</strong> provide monetary refunds (to UPI, bank accounts, cards, or wallets) after batch activation, regardless of whether the request is submitted immediately after purchase or later.
                    </li>
                    <li>
                      <strong>No Partial or Pro-Rata Refunds:</strong> Unused portions of a semester subscription, exam date changes, or incomplete course consumption do not qualify for partial or full fee refunds.
                    </li>
                  </ul>
                </div>
              </section>

              {/* Section 3 */}
              <section id="batch-replacement" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  3. Inadvertent Wrong Batch Purchase — Batch Replacement Policy
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    While monetary refunds are strictly unavailable once a batch is activated, we understand that students may occasionally select an incorrect semester, branch, or subject batch during checkout. In such cases, ExamNest may <strong>replace or transfer your enrollment from our end to the intended batch</strong>—without issuing any monetary refund—strictly subject to <strong>all</strong> of the following conditions:
                  </p>

                  <div className="space-y-3">
                    <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/40">
                      <h3 className="font-semibold text-slate-900">
                        A. Zero Notes Downloaded (Mandatory Condition)
                      </h3>
                      <p className="mt-1 text-xs sm:text-sm text-slate-600">
                        You must <strong>not have downloaded any study notes, PDFs, formula sheets, or digital assets</strong> from the wrongly purchased batch. If any note or downloadable asset has been downloaded, batch replacement will be automatically declined.
                      </p>
                    </div>

                    <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/40">
                      <h3 className="font-semibold text-slate-900">
                        B. No Material Consumption &amp; Audit Verification
                      </h3>
                      <p className="mt-1 text-xs sm:text-sm text-slate-600">
                        You must not have streamed recorded lectures or attempted mock tests in the wrongly purchased batch. Our support team will audit server download logs and activity telemetry prior to approving any batch transfer.
                      </p>
                    </div>

                    <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/40">
                      <h3 className="font-semibold text-slate-900">
                        C. Equivalent Value &amp; One-Time Replacement Limit
                      </h3>
                      <p className="mt-1 text-xs sm:text-sm text-slate-600">
                        Replacement is permitted toward an active batch of equal value (or a higher-value batch upon payment of the applicable price difference; no balance is refunded if switching to a lower-priced batch). Batch replacement is strictly a <strong>one-time courtesy per order</strong> and cannot be repeated once processed.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 4 */}
              <section id="non-eligible" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  4. Non-Eligible Circumstances
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    Neither monetary refunds nor batch replacements will be granted in any of the following scenarios:
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                      <span>
                        Any request demanding monetary reimbursement after a batch has been activated (including requests sent shortly after payment).
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                      <span>
                        Accounts that have downloaded any notes, PDFs, or study documents, or consumed lectures/tests from the wrongly purchased batch.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                      <span>
                        Change of mind, academic stream transfers after accessing content, personal device/internet issues, or university exam rescheduling.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                      <span>
                        Account suspension or permanent termination resulting from violations of our{" "}
                        <Link
                          href="/terms"
                          className="font-semibold text-slate-900 underline hover:text-slate-700"
                        >
                          Terms &amp; Conditions
                        </Link>,{" "}
                        <Link
                          href="/fair-usage"
                          className="font-semibold text-slate-900 underline hover:text-slate-700"
                        >
                          Fair Usage Policy
                        </Link>, or{" "}
                        <Link
                          href="/copyright-policy"
                          className="font-semibold text-slate-900 underline hover:text-slate-700"
                        >
                          Copyright &amp; IP Policy
                        </Link>.
                      </span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Section 5 */}
              <section id="gateway-reconciliation" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  5. Failed Payment Debits &amp; Duplicate Gateway Charges
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    Distinct from activated product purchases, if your bank account, card, or UPI is debited during a <strong>failed/timed-out transaction where no batch was activated</strong>, or if a payment gateway error produces an <strong>accidental duplicate debit</strong> for a single order:
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600">
                    The unfulfilled or excess duplicate charge is automatically reconciled through our authorized payment gateway and reversed directly to your original payment source within <strong>5 to 7 business days</strong>, subject to RBI/NPCI and your issuing bank&apos;s settlement cycles.
                  </p>
                </div>
              </section>

              {/* Section 6 */}
              <section id="request-process" className="scroll-mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pb-2 border-b border-slate-100">
                  6. How to Request a Wrong-Batch Replacement
                </h2>
                <div className="mt-4 space-y-3">
                  <p>
                    If you mistakenly enrolled in the wrong batch and have not downloaded any notes from it, contact our support team immediately from your registered email address with your <strong>Transaction / Order ID</strong>, <strong>Registered Mobile Number</strong>, <strong>Wrong Batch Name</strong>, and <strong>Intended Batch Name</strong>:
                  </p>

                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-5 space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-slate-900">
                      <Mail className="h-4 w-4 text-slate-600" />
                      <span>ExamNest Enrollment &amp; Billing Support</span>
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
                      Formal escalations may be addressed to our Grievance Officer at{" "}
                      <a
                        href={`mailto:${PLATFORM_INFO.emails.grievance}`}
                        className="font-semibold text-slate-800 underline hover:text-slate-950"
                      >
                        {PLATFORM_INFO.emails.grievance}
                      </a>{" "}
                      or via{" "}
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
            <LegalFooter currentDoc="refund-policy" />
          </div>
        </main>
      </div>
    </div>
  );
}

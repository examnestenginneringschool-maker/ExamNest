"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  MessageSquarePlus,
  Send,
} from "lucide-react";
import { submitStudentFeedback } from "@/app/app/profile-actions";
import { type FeedbackCategory } from "@/lib/validation/profile";
import { useStudentProfile } from "./StudentProfileContext";

const CATEGORY_PILLS: Array<{ id: FeedbackCategory; label: string }> = [
  { id: "syllabus", label: "Syllabus / Notes" },
  { id: "bug", label: "Bug Report" },
  { id: "feature", label: "Idea / Feature" },
  { id: "other", label: "General Question" },
];

export function ProfileFeedbackView() {
  const pathname = usePathname();
  const { setCurrentView } = useStudentProfile();

  const [category, setCategory] = useState<FeedbackCategory>("syllabus");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{
    type: "success" | "error";
    text: string;
    fallbackMailto?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);

    if (message.trim().length < 10) {
      setResult({
        type: "error",
        text: "Please provide at least 10 characters so the team can help.",
      });
      return;
    }

    try {
      setSending(true);
      const res = await submitStudentFeedback({
        category,
        message,
        pagePath: pathname || "/app",
      });

      if (!res.success) {
        setResult({
          type: "error",
          text: res.error || "Unable to send feedback.",
          fallbackMailto: res.fallbackMailto,
        });
        return;
      }

      setMessage("");
      setResult({
        type: "success",
        text: "Thank you! Your feedback has been sent directly to the ExamNest team.",
      });
    } catch {
      setResult({
        type: "error",
        text: "Network error while sending feedback.",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4 pb-6">
      <section className="rounded-3xl bg-white p-5 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(23,27,42,0.04)]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <MessageSquarePlus className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-slate-900">
              Direct Student Support &amp; Feedback
            </h4>
            <p className="text-[11px] text-slate-400 font-medium">
              Report typos, missing syllabus units, or suggest new tools
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {CATEGORY_PILLS.map((pill) => {
                const active = category === pill.id;
                return (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => setCategory(pill.id)}
                    className={`py-1.5 px-2.5 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer text-center ${
                      active
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100"
                    }`}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Your Message
            </label>
            <textarea
              value={message}
              onChange={(e) => {
                setResult(null);
                setMessage(e.target.value);
              }}
              rows={4}
              maxLength={1500}
              placeholder="Tell us what happened, which subject/unit has an issue, or how we can improve..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-slate-800 focus:bg-white focus:outline-none resize-none"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
              <span>Detailed reports help us fix issues quickly</span>
              <span>{message.trim().length}/1500</span>
            </div>
          </div>

          {result && (
            <div
              className={`rounded-2xl p-3 text-[11px] font-medium ${
                result.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/70"
                  : "bg-rose-50 text-rose-700 border border-rose-200/70"
              }`}
            >
              <div className="flex items-start gap-2">
                {result.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                )}
                <div>
                  <p>{result.text}</p>
                  {result.fallbackMailto && (
                    <a
                      href={result.fallbackMailto}
                      className="mt-1.5 inline-block font-bold underline"
                    >
                      Click here to send via email client
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setCurrentView("main")}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={sending || message.trim().length < 10}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-md active:scale-95 cursor-pointer disabled:opacity-50 disabled:hover:scale-100 disabled:hover:translate-y-0"
            >
              {sending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Submit Note</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

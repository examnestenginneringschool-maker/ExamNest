"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, RotateCcw } from "lucide-react";

export default function StudentAppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Student Portal Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-sm ring-1 ring-amber-100">
        <AlertCircle className="h-7 w-7" />
      </div>

      <h2 className="mt-5 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
        Unable to load academic resources
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
        {error.message ||
          "There was a problem communicating with the academic database. Please try again."}
      </p>

      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Retry
        </button>

        <Link
          href="/app/dashboard"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}

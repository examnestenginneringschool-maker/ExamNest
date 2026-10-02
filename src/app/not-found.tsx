import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { LogoImage } from "@/components/brand/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8f9fc] px-4 py-16 text-center">
      <LogoImage size="xl" />

      <p className="mt-6 text-sm font-bold uppercase tracking-widest text-indigo-600">
        404 — Page Not Found
      </p>

      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
        Curriculum path not found
      </h1>

      <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-slate-600">
        The page or resource you are looking for might have been moved, updated, or is outside your current registered semester curriculum.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/app/dashboard"
          className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-700"
        >
          <Home className="h-4 w-4" />
          Go to Dashboard
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}

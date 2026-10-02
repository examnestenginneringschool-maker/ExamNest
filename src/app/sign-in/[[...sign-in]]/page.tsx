import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#f8f9fc] px-4 py-12">
      {/* Background ambient gradient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[350px] w-[400px] rounded-full bg-violet-500/10 blur-[100px]" />
      </div>

      {/* Top brand header */}
      <Link
        href="/"
        className="relative z-10 mb-8 flex items-center gap-3 transition hover:opacity-80"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-[0_10px_25px_rgba(79,70,229,0.3)]">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xl font-black tracking-tight text-slate-950">
            ExamNest
          </p>
          <p className="-mt-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Student Learning Platform
          </p>
        </div>
      </Link>

      {/* Clerk SignIn Component */}
      <div className="relative z-10 w-full max-w-md flex justify-center">
        <SignIn fallbackRedirectUrl="/app/dashboard" />
      </div>
    </div>
  );
}

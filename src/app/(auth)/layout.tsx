"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isSignIn = pathname?.includes("sign-in");

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-[#FAF8FF] px-4 py-10 sm:py-14 overflow-hidden selection:bg-[#5B4DFF] selection:text-white">
      {/* 1. Atmospheric Ambient Glows (Smooth floating keyframes) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[360px] bg-[#F6C844]/20 rounded-full blur-3xl aura-glow-left" />
        <div className="absolute top-1/3 -right-20 w-[500px] h-[400px] bg-[#5B4DFF]/15 rounded-full blur-3xl aura-glow-right" />
        <div className="absolute -bottom-20 -left-20 w-[450px] h-[350px] bg-[#5B4DFF]/10 rounded-full blur-3xl" />
      </div>

      {/* 2. Top Navigation Bar: Back to Home */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-[#e2e5f0] text-xs font-bold text-[#1B1B2F] shadow-xs backdrop-blur-md hover:bg-white hover:border-[#5B4DFF]/40 hover:-translate-x-0.5 transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-[#5B4DFF]" />
          <span>Back to ExamNest</span>
        </Link>
      </div>

      {/* 3. Main Centered Auth Container with Persistent Layout */}
      <div className="relative z-10 w-full max-w-[460px] flex flex-col items-center">
        {/* Animated Sliding Pill Switcher (Persists across route changes) */}
        <div className="relative w-full max-w-sm mb-6 p-1 rounded-2xl bg-[#ebedff]/90 border border-[#dee1f7] backdrop-blur-sm shadow-xs flex items-center select-none">
          {/* Active Sliding Background Pill with Silky Spring/Ease Interpolation */}
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl bg-white shadow-sm transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isSignIn ? "left-1" : "left-[calc(50%+2px)]"
            }`}
          />
          <Link
            href="/sign-in"
            prefetch={true}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold text-center transition-colors duration-200 relative z-10 cursor-pointer ${
              isSignIn
                ? "text-[#5B4DFF]"
                : "text-[#717588] hover:text-[#1B1B2F]"
            }`}
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            prefetch={true}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold text-center transition-colors duration-200 relative z-10 cursor-pointer ${
              !isSignIn
                ? "text-[#5B4DFF]"
                : "text-[#717588] hover:text-[#1B1B2F]"
            }`}
          >
            Create Account
          </Link>
        </div>

        {/* The Auth Card Slot with Smooth In-Page Fade & Glide Transition */}
        <div
          key={isSignIn ? "sign-in" : "sign-up"}
          className="w-full flex justify-center animate-auth-fade-in"
        >
          {children}
        </div>

        {/* Bottom Trust Badge */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs font-semibold text-[#717588]">
          <ShieldCheck className="h-4 w-4 text-[#5B4DFF]" />
          <span>Curriculum Aligned · Secured Academic Workspace</span>
        </div>
      </div>
    </div>
  );
}

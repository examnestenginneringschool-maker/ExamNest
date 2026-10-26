"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { LogoImage } from "@/components/brand/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isSignIn = pathname?.includes("sign-in") ?? false;
  const isResetPassword = pathname?.includes("reset-password") ?? false;

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-[#FAF8FF] px-4 py-8 sm:px-6 lg:px-10 overflow-hidden selection:bg-[#5B4DFF] selection:text-white">
      {/* 1. Ambient Background Glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[780px] h-[380px] bg-[#F6C844]/18 rounded-full blur-3xl aura-glow-left" />
        <div className="absolute top-1/3 -right-20 w-[550px] h-[420px] bg-[#5B4DFF]/15 rounded-full blur-3xl aura-glow-right" />
        <div className="absolute -bottom-24 -left-20 w-[500px] h-[380px] bg-[#5B4DFF]/12 rounded-full blur-3xl" />
      </div>

      {/* 2. Top-Left Back Navigation Only (No Top-Right Badge) */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/85 border border-[#e2e5f0] text-xs font-bold text-[#1B1B2F] shadow-2xs backdrop-blur-md hover:bg-white hover:border-[#5B4DFF]/40 hover:-translate-x-0.5 transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-[#5B4DFF]" />
          <span>Back to ExamNest</span>
        </Link>
      </div>

      {/* 3. Framed Split-Card Container (Inspired by Minimalist Reference) */}
      <div className="relative z-10 w-full max-w-[960px] mt-8 sm:mt-0 p-2.5 sm:p-3.5 rounded-[36px] bg-white/45 border border-white/80 shadow-[0_32px_90px_-20px_rgba(27,27,47,0.14)] backdrop-blur-xl">
        <div className="w-full rounded-[28px] bg-white overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px] shadow-xs">
          {/* Left Panel (5 cols): Clean Indigo Visual Hero Panel */}
          <div className="hidden lg:flex lg:col-span-5 bg-[#5856FF] text-white p-9 flex-col justify-between relative overflow-hidden select-none">
            {/* Brand Header */}
            <div className="relative z-10 flex items-center gap-3">
              <LogoImage size="sm" className="ring-2 ring-white/25 rounded-xl" />
              <span className="text-lg font-extrabold tracking-tight text-white">
                ExamNest
              </span>
            </div>

            {/* Minimal Headline & Subtitle */}
            <div className="relative z-10 mt-6 space-y-2.5">
              <h1 className="text-2xl xl:text-[28px] font-extrabold leading-[1.22] tracking-tight text-white">
                Your semester, organized the best way
              </h1>
              <p className="text-xs text-white/80 leading-relaxed max-w-[260px]">
                One clean workspace for your university syllabus, verified
                notes, and exam preparation.
              </p>
            </div>

            {/* 3D Academic Folder Illustration */}
            <div className="relative z-10 mt-auto pt-4 flex items-center justify-center">
              <Image
                src="/auth-hero.jpg"
                alt="ExamNest Study Organizer"
                width={300}
                height={300}
                priority
                className="w-56 xl:w-64 h-auto object-contain rounded-2xl pointer-events-none"
              />
            </div>
          </div>

          {/* Right Panel (7 cols): Sliding Pill Switcher + Minimal Auth Form */}
          <div className="lg:col-span-7 bg-[#FAF8FF]/60 p-6 sm:p-10 lg:px-14 lg:py-10 flex flex-col justify-center">
            <div className="w-full max-w-[380px] mx-auto">
              {/* Persistent Sliding Pill Switcher (Hidden on Reset Password) */}
              {!isResetPassword && (
                <div className="relative w-full mb-7 p-1 rounded-2xl bg-[#ebedff]/90 border border-[#dee1f7] backdrop-blur-sm shadow-2xs flex items-center select-none">
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
              )}

              {/* Form Slot */}
              <div
                key={
                  isResetPassword
                    ? "reset-password"
                    : isSignIn
                    ? "sign-in"
                    : "sign-up"
                }
                className="w-full animate-auth-fade-in"
              >
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

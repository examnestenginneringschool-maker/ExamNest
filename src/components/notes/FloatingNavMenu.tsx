"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  History,
  FileQuestion,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";

type FloatingNavMenuProps = {
  subjectId: string;
};

export function FloatingNavMenu({ subjectId }: FloatingNavMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      ref={menuRef}
      className="fixed left-0 top-1/2 -translate-y-1/2 z-50 flex items-center"
    >
      {/* Edge Switch Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        type="button"
        title={isOpen ? "Close Navigation" : "Open Navigation"}
        className="group flex flex-col items-center justify-center w-9 py-3 bg-white/95 backdrop-blur-xl border border-l-0 border-slate-200/90 rounded-r-2xl shadow-[0_8px_24px_-4px_rgba(24,24,41,0.12)] text-slate-700 hover:text-indigo-600 hover:bg-white transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
      >
        {isOpen ? (
          <X className="h-4 w-4 text-slate-600 group-hover:text-indigo-600 transition-transform" />
        ) : (
          <Menu className="h-4 w-4 text-slate-600 group-hover:text-indigo-600 transition-transform" />
        )}
        <span className="text-[9px] uppercase tracking-widest text-slate-400 mt-1.5 font-bold [writing-mode:vertical-rl] rotate-180 group-hover:text-indigo-600 transition-colors">
          Menu
        </span>
      </button>

      {/* Floating Popup Navigation Menu */}
      <div
        className={`absolute left-11 top-1/2 -translate-y-1/2 w-64 bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-2xl shadow-[0_20px_45px_-8px_rgba(15,23,42,0.18)] p-3.5 flex flex-col gap-2.5 transition-all duration-200 ease-out origin-left ${
          isOpen
            ? "opacity-100 scale-100 pointer-events-auto translate-x-0"
            : "opacity-0 scale-95 pointer-events-none -translate-x-3"
        }`}
      >
        {/* Branding */}
        <div className="px-2 pb-2.5 border-b border-slate-100">
          <Logo size="sm" subtitle="Ed-Tech Portal" />
        </div>

        {/* Compact Nav Items */}
        <nav className="flex flex-col gap-1 text-xs">
          <Link
            href="/app/dashboard"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium transition-colors"
          >
            <LayoutDashboard className="h-4 w-4 text-slate-400" />
            <span>Dashboard</span>
          </Link>

          <Link
            href={`/app/subjects/${subjectId}`}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium transition-colors"
          >
            <BookOpen className="h-4 w-4 text-slate-400" />
            <span>Subject Overview</span>
          </Link>

          {/* Active notes item */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-amber-50 text-amber-900 font-bold border border-amber-200/60 shadow-xs">
            <div className="flex items-center gap-2.5">
              <FileText className="h-4 w-4 text-amber-600" />
              <span>Notes &amp; Units</span>
            </div>
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          </div>

          <Link
            href={`/app/subjects/${subjectId}`}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium transition-colors"
          >
            <History className="h-4 w-4 text-slate-400" />
            <span>Previous Year Qs</span>
          </Link>

          <Link
            href={`/app/subjects/${subjectId}`}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium transition-colors"
          >
            <FileQuestion className="h-4 w-4 text-slate-400" />
            <span>Mock Tests</span>
          </Link>

          <div className="my-1 border-t border-slate-100" />

          <Link
            href="/app/dashboard"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium transition-colors"
          >
            <Settings className="h-4 w-4 text-slate-400" />
            <span>Settings</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}

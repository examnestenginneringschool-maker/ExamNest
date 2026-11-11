"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import {
  POLICY_BRANCHES,
  type LegalDocKey,
  type PolicyBranch,
} from "@/lib/legal/navigation";

interface LegalHeaderProps {
  activeTab: LegalDocKey;
}

const LEGAL_NAV_TAB_CLASS =
  "h-9 inline-flex items-center gap-1 rounded-md px-2.5 xl:px-3 text-[13px] leading-none whitespace-nowrap transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400";

export function LegalHeader({ activeTab }: LegalHeaderProps) {
  const [openBranch, setOpenBranch] = useState<PolicyBranch["id"] | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        setOpenBranch(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenBranch(null);
        setMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        {/* Left: Logo & Home Backlink */}
        <div className="flex items-center gap-4 shrink-0">
          <Link href="/" className="flex items-center gap-2 group">
            <Logo size="sm" withText={true} />
          </Link>
          <span className="hidden sm:inline-block h-4 w-px bg-slate-200" />
          <Link
            href="/"
            className="hidden sm:inline-flex h-9 items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors whitespace-nowrap"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Platform</span>
          </Link>
        </div>

        {/* Right: 3 Uniform Branch Tabs + Sign In */}
        <div className="flex items-center gap-1.5">
          <nav
            aria-label="Policy and company navigation"
            className="hidden lg:flex items-center gap-0.5"
          >
            {POLICY_BRANCHES.map((branch) => {
              const hasActiveItem = branch.items.some(
                (item) => item.key === activeTab
              );
              const isOpen = openBranch === branch.id;
              const alignClass =
                branch.id === "company" ? "right-0" : "left-0";

              return (
                <div
                  key={branch.id}
                  className="relative flex items-center"
                  onMouseEnter={() => setOpenBranch(branch.id)}
                  onMouseLeave={() =>
                    setOpenBranch((prev) => (prev === branch.id ? null : prev))
                  }
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-haspopup="menu"
                    onClick={() =>
                      setOpenBranch((prev) =>
                        prev === branch.id ? null : branch.id
                      )
                    }
                    className={`${LEGAL_NAV_TAB_CLASS} ${
                      hasActiveItem
                        ? "bg-slate-100 text-slate-950 font-semibold"
                        : isOpen
                        ? "bg-slate-100/80 text-slate-950 font-medium"
                        : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-950 font-medium"
                    }`}
                  >
                    <span>{branch.label}</span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform duration-150 ${
                        isOpen
                          ? "rotate-180 text-slate-900"
                          : "text-slate-400"
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div
                      className={`absolute ${alignClass} top-full pt-2 z-50`}
                    >
                      <div
                        role="menu"
                        aria-label={branch.label}
                        className="w-68 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-900/5"
                      >
                        <div className="space-y-0.5">
                          {branch.items.map((item) => {
                            const isActive = item.key === activeTab;
                            return (
                              <Link
                                key={item.key}
                                href={item.href}
                                role="menuitem"
                                onClick={() => setOpenBranch(null)}
                                className={`block rounded-lg px-3 py-2.5 transition-colors ${
                                  isActive
                                    ? "bg-slate-900 text-white"
                                    : "text-slate-700 hover:bg-slate-100/80 hover:text-slate-950"
                                }`}
                              >
                                <span className="block text-[13px] font-semibold leading-snug">
                                  {item.label}
                                </span>
                                <span
                                  className={`block text-[11.5px] mt-0.5 leading-snug ${
                                    isActive
                                      ? "text-slate-300"
                                      : "text-slate-500"
                                  }`}
                                >
                                  {item.description}
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <span
            className="hidden lg:inline-block h-4 w-px bg-slate-200 mx-1.5"
            aria-hidden="true"
          />

          <Link
            href="/sign-in"
            className="hidden md:inline-flex h-9 items-center rounded-md border border-slate-200 px-3.5 text-[13px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-950 transition-colors whitespace-nowrap"
          >
            Sign In
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={
              mobileOpen
                ? "Close policy navigation"
                : "Open policy navigation"
            }
            className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {mobileOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (< lg) */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white max-h-[calc(100vh-4rem)] overflow-y-auto px-4 py-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {POLICY_BRANCHES.map((branch) => (
              <div
                key={branch.id}
                className="rounded-xl border border-slate-200 bg-slate-50/60 p-3"
              >
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2 px-1">
                  {branch.label}
                </div>
                <div className="space-y-1">
                  {branch.items.map((item) => {
                    const isActive = item.key === activeTab;
                    return (
                      <Link
                        key={item.key}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`block rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors ${
                          isActive
                            ? "bg-slate-900 text-white font-semibold"
                            : "text-slate-700 hover:bg-white hover:text-slate-950"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Platform</span>
            </Link>
            <Link
              href="/sign-in"
              onClick={() => setMobileOpen(false)}
              className="inline-flex h-9 items-center rounded-md border border-slate-200 px-3.5 text-[13px] font-medium text-slate-700 hover:bg-slate-50"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

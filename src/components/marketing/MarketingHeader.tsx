"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { POLICY_BRANCHES, type PolicyBranch } from "@/lib/legal/navigation";

const SECTION_LINKS = [
  { href: "#problem-architecture", label: "Curriculum Architecture" },
  { href: "#curriculum-matrix", label: "Syllabus Matrix" },
  { href: "#open-charter", label: "Contributors" },
];

const NAV_TAB_CLASS =
  "h-9 inline-flex items-center gap-1 rounded-md px-2 xl:px-2.5 text-[12.5px] xl:text-[13px] font-medium leading-none whitespace-nowrap transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#402ae6]/35";

export function MarketingHeader() {
  const [openBranch, setOpenBranch] = useState<PolicyBranch["id"] | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMobileBranch, setExpandedMobileBranch] =
    useState<PolicyBranch["id"] | null>("legal");
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
        setMobileMenuOpen(false);
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
      className="fixed top-0 inset-x-0 z-50 bg-[#faf8ff]/90 backdrop-blur-md border-b border-[#e4e6f2]"
    >
      <div className="h-20 max-w-7xl mx-auto px-6 lg:px-8 xl:px-12 flex items-center justify-between gap-6">
        {/* Left: Brand Identity */}
        <Link
          href="/"
          className="flex items-center shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#402ae6]/35"
        >
          <Logo size="md" subtitle="The Engineering School" />
        </Link>

        {/* Right: Single Aligned Navigation Row */}
        <div className="flex items-center gap-3 shrink-0">
          <nav
            aria-label="Primary navigation"
            className="hidden min-[1160px]:flex items-center gap-0.5 xl:gap-1"
          >
            {SECTION_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`${NAV_TAB_CLASS} text-[#4b4e68] hover:text-[#171b2a] hover:bg-[#171b2a]/[0.04]`}
              >
                {link.label}
              </a>
            ))}

            <span
              className="h-4 w-px bg-[#dcdfea] mx-1.5 xl:mx-2 shrink-0"
              aria-hidden="true"
            />

            {POLICY_BRANCHES.map((branch) => {
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
                    className={`${NAV_TAB_CLASS} cursor-pointer ${
                      isOpen
                        ? "text-[#171b2a] bg-[#171b2a]/[0.05]"
                        : "text-[#4b4e68] hover:text-[#171b2a] hover:bg-[#171b2a]/[0.04]"
                    }`}
                  >
                    <span>{branch.label}</span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform duration-150 ${
                        isOpen
                          ? "rotate-180 text-[#171b2a]"
                          : "text-[#80849c]"
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
                        className="w-[272px] rounded-xl border border-[#e3e5ef] bg-white p-1.5 shadow-[0_12px_32px_-8px_rgba(23,27,42,0.12),0_2px_6px_-1px_rgba(23,27,42,0.04)]"
                      >
                        {branch.items.map((item) => (
                          <Link
                            key={item.key}
                            href={item.href}
                            role="menuitem"
                            onClick={() => setOpenBranch(null)}
                            className="group/item block rounded-lg px-3 py-2.5 transition-colors hover:bg-[#f4f5fa] focus-visible:outline-none focus-visible:bg-[#f4f5fa]"
                          >
                            <span className="block text-[13px] font-semibold text-[#171b2a] group-hover/item:text-[#402ae6] transition-colors leading-snug">
                              {item.label}
                            </span>
                            <span className="block text-[11.5px] text-[#6b6f84] leading-snug mt-0.5">
                              {item.description}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={
              mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            className="min-[1160px]:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#e3e5ef] bg-white/90 text-[#171b2a] hover:bg-[#f4f5fa] transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Responsive Drawer (< 1160px) */}
      {mobileMenuOpen && (
        <div className="min-[1160px]:hidden border-t border-[#e4e6f2] bg-white max-h-[calc(100vh-5rem)] overflow-y-auto shadow-[0_16px_40px_rgba(23,27,42,0.08)]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 space-y-5">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7a7e96] mb-2">
                Platform
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                {SECTION_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-[13px] font-medium text-[#171b2a] bg-[#f8f8fc] hover:bg-[#f0f1f8] hover:text-[#402ae6] transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="border-t border-[#eceef6] pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {POLICY_BRANCHES.map((branch) => {
                  const isExpanded = expandedMobileBranch === branch.id;
                  return (
                    <div
                      key={branch.id}
                      className="rounded-xl border border-[#e6e8f2] bg-[#fafbff] overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedMobileBranch((prev) =>
                            prev === branch.id ? null : branch.id
                          )
                        }
                        aria-expanded={isExpanded}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 text-left text-[13px] font-semibold text-[#171b2a] hover:bg-[#f2f3fa] transition-colors cursor-pointer md:cursor-default"
                      >
                        <span>{branch.label}</span>
                        <ChevronDown
                          className={`h-4 w-4 text-[#7a7e96] transition-transform duration-150 md:hidden ${
                            isExpanded ? "rotate-180 text-[#171b2a]" : ""
                          }`}
                        />
                      </button>

                      <div
                        className={`border-t border-[#eceef6] bg-white p-1.5 space-y-0.5 ${
                          isExpanded ? "block" : "hidden md:block"
                        }`}
                      >
                        {branch.items.map((item) => (
                          <Link
                            key={item.key}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="block rounded-lg px-2.5 py-2 transition-colors hover:bg-[#f4f5fa]"
                          >
                            <span className="block text-[13px] font-medium text-[#171b2a]">
                              {item.label}
                            </span>
                            <span className="block text-[11px] text-[#6b6f84] leading-snug mt-0.5">
                              {item.description}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

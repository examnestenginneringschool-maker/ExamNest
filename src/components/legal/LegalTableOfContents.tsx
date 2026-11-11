"use client";

import { useEffect, useState } from "react";
import { ListOrdered, ChevronDown } from "lucide-react";

export interface TocItem {
  id: string;
  number: string;
  label: string;
}

interface LegalTableOfContentsProps {
  items: TocItem[];
  title?: string;
  contactEmail?: string;
  contactLabel?: string;
}

export function LegalTableOfContents({
  items,
  title = "Table of Contents",
  contactEmail = "support@examnestcollege.vercel.app",
  contactLabel = "Need clarification?",
}: LegalTableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id || "");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || items.length === 0) return;

    const scrollContainer = document.getElementById("legal-content-scroll");
    const isDesktop = window.innerWidth >= 1024;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        root: isDesktop && scrollContainer ? scrollContainer : null,
        rootMargin: "-40px 0px -65% 0px",
        threshold: 0,
      }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  const handleScrollTo = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    const scrollContainer = document.getElementById("legal-content-scroll");

    if (el) {
      if (scrollContainer && window.innerWidth >= 1024) {
        // Calculate relative position within the independent right container
        const containerRect = scrollContainer.getBoundingClientRect();
        const elementRect = el.getBoundingClientRect();
        const targetScrollTop =
          elementRect.top - containerRect.top + scrollContainer.scrollTop - 24;

        scrollContainer.scrollTo({
          top: targetScrollTop,
          behavior: "smooth",
        });
      } else {
        // Fallback for mobile / normal document flow
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      window.history.replaceState(null, "", `#${id}`);
      setActiveId(id);
      setIsMobileOpen(false);
    }
  };

  const activeItem = items.find((i) => i.id === activeId) || items[0];

  return (
    <>
      {/* Mobile Drawer (Visible on < lg screens) */}
      <div className="lg:hidden mb-6 rounded-xl border border-slate-200 bg-white shadow-xs">
        <button
          type="button"
          onClick={() => setIsMobileOpen((prev) => !prev)}
          className="flex w-full items-center justify-between p-3.5 text-left transition-colors hover:bg-slate-50/70"
          aria-expanded={isMobileOpen}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <ListOrdered className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Table of Contents ({items.length} Sections)
              </span>
              <span className="block truncate text-xs font-semibold text-slate-800">
                {activeItem?.number}. {activeItem?.label}
              </span>
            </div>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-slate-500 shrink-0 transition-transform duration-200 ${
              isMobileOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isMobileOpen && (
          <div className="border-t border-slate-100 p-2.5 max-h-72 overflow-y-auto space-y-1">
            {items.map((item) => {
              const isActive = activeId === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => handleScrollTo(item.id, e)}
                  className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                    isActive
                      ? "bg-slate-900 text-white font-bold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium"
                  }`}
                >
                  <span
                    className={`shrink-0 text-[10px] font-mono ${
                      isActive ? "text-slate-300" : "text-slate-400"
                    }`}
                  >
                    {item.number}
                  </span>
                  <span className="truncate">{item.label}</span>
                </a>
              );
            })}
          </div>
        )}
      </div>

      {/* Desktop Dedicated Container Content (Stationary & Separate from Document Scroll) */}
      <div className="hidden lg:flex lg:flex-col h-full justify-between">
        <div>
          {/* Header */}
          <div className="mb-3 pb-3 border-b border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListOrdered className="h-4 w-4 text-slate-600" />
              <h2 className="text-xs font-black uppercase tracking-[0.16em] text-slate-700">
                {title}
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              {items.length} Sections
            </span>
          </div>

          {/* Row-wise Navigation List */}
          <nav aria-label="Table of contents" className="space-y-1">
            {items.map((item) => {
              const isActive = activeId === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => handleScrollTo(item.id, e)}
                  className={`group relative flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs transition-all duration-150 ${
                    isActive
                      ? "bg-slate-900 text-white font-bold shadow-xs"
                      : "text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-xs font-medium"
                  }`}
                >
                  {/* Left accent marker on active */}
                  {isActive && (
                    <span className="absolute left-1 h-3.5 w-1 rounded-full bg-slate-400" />
                  )}

                  {/* Section Number */}
                  <span
                    className={`shrink-0 text-[11px] font-mono transition-colors ${
                      isActive
                        ? "text-slate-300 pl-1.5"
                        : "text-slate-400 group-hover:text-slate-700"
                    }`}
                  >
                    {item.number}
                  </span>

                  {/* Section Label */}
                  <span className="truncate leading-tight">
                    {item.label}
                  </span>
                </a>
              );
            })}
          </nav>
        </div>

        {/* Bottom Support Callout in Left Container */}
        <div className="mt-8 pt-4 border-t border-slate-200/80 text-[11px] text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700">{contactLabel}</p>
          <p className="leading-relaxed">
            Contact our team at{" "}
            <a
              href={`mailto:${contactEmail}`}
              className="text-slate-900 font-semibold underline hover:text-slate-700 break-all"
            >
              {contactEmail}
            </a>
          </p>
        </div>
      </div>
    </>
  );
}

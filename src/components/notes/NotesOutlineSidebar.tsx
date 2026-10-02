"use client";

import { useEffect, useState, useMemo } from "react";
import { ChevronRight, Star } from "lucide-react";

export type SidebarTopic = {
  id: string;
  topic_number: string;
  title: string;
  is_important?: boolean;
};

export type SidebarUnit = {
  id: string;
  unit_number: number;
  title: string;
  topics: SidebarTopic[];
};

type NotesOutlineSidebarProps = {
  units: SidebarUnit[];
};

export function NotesOutlineSidebar({ units }: NotesOutlineSidebarProps) {
  // Exclusively track a single expanded unit (accordion pattern).
  // Initially null: units stay collapsed and never auto-expand without manual student interaction.
  const [expandedUnitNumber, setExpandedUnitNumber] = useState<number | null>(null);

  const [activeUnitNumber, setActiveUnitNumber] = useState<number | null>(
    units[0]?.unit_number ?? null
  );
  const [activeTopicNumber, setActiveTopicNumber] = useState<string | null>(null);

  // Total topics count across all units
  const totalTopics = useMemo(
    () => units.reduce((acc, u) => acc + u.topics.length, 0),
    [units]
  );

  // Toggle dropdown menu beside a unit: opens ONLY that unit's sub-topics, closing any other
  const toggleUnitExpand = (unitNumber: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedUnitNumber((prev) => (prev === unitNumber ? null : unitNumber));
  };

  const handleUnitClick = (unitNumber: number, e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(`unit-${unitNumber}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", `#unit-${unitNumber}`);
    }
    // Only open this unit's sub-topics, closing any other open unit
    setExpandedUnitNumber((prev) => (prev === unitNumber ? null : unitNumber));
    setActiveUnitNumber(unitNumber);
  };

  const handleTopicClick = (
    unitNumber: number,
    topicNumber: string,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    const el = document.getElementById(`topic-${topicNumber}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", `#topic-${topicNumber}`);
    }
    setActiveUnitNumber(unitNumber);
    setActiveTopicNumber(topicNumber);
  };

  // ScrollSpy: ONLY updates active highlight indicators as the user scrolls.
  // It NEVER opens or expands any units automatically.
  useEffect(() => {
    if (typeof window === "undefined" || units.length === 0) return;

    const elementsToObserve: HTMLElement[] = [];

    units.forEach((unit) => {
      const unitEl = document.getElementById(`unit-${unit.unit_number}`);
      if (unitEl) elementsToObserve.push(unitEl);

      unit.topics.forEach((topic) => {
        const topicEl = document.getElementById(`topic-${topic.topic_number}`);
        if (topicEl) elementsToObserve.push(topicEl);
      });
    });

    if (elementsToObserve.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            if (id.startsWith("topic-")) {
              const topicNum = id.replace("topic-", "");
              setActiveTopicNumber(topicNum);

              const parentUnit = units.find((u) =>
                u.topics.some((t) => t.topic_number === topicNum)
              );
              if (parentUnit) {
                setActiveUnitNumber(parentUnit.unit_number);
              }
            } else if (id.startsWith("unit-")) {
              const unitNum = parseInt(id.replace("unit-", ""), 10);
              if (!isNaN(unitNum)) {
                setActiveUnitNumber(unitNum);
              }
            }
          }
        });
      },
      {
        rootMargin: "-80px 0px -65% 0px",
        threshold: 0,
      }
    );

    elementsToObserve.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [units]);

  return (
    <aside className="hidden lg:block lg:self-stretch">
      <div className="sticky top-[84px] max-h-[calc(100vh-104px)] overflow-y-auto pr-2 pb-8 [scrollbar-width:thin] scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
        <div className="mb-4 flex items-center justify-between px-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
              Course outline
            </p>
            <span className="text-xs font-semibold text-slate-400">
              {units.length} {units.length === 1 ? "unit" : "units"} · {totalTopics} topics
            </span>
          </div>
        </div>

        <nav className="relative">
          <div className="absolute bottom-3 left-[23px] top-3 w-px bg-slate-200" />
          <div className="space-y-1">
            {units.map((unit) => {
              const isExpanded = expandedUnitNumber === unit.unit_number;
              const isActiveUnit = activeUnitNumber === unit.unit_number;
              const hasTopics = unit.topics.length > 0;

              return (
                <div key={unit.id} className="relative">
                  <div
                    className={`group relative flex items-center gap-3.5 rounded-2xl px-3 py-3 transition cursor-pointer ${
                      isActiveUnit && !activeTopicNumber
                        ? "bg-white shadow-xs ring-1 ring-slate-200/80"
                        : "hover:bg-white/80 hover:shadow-xs"
                    }`}
                    onClick={(e) => handleUnitClick(unit.unit_number, e)}
                  >
                    <span
                      className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[11px] font-black transition ${
                        isActiveUnit
                          ? "border-indigo-600 bg-indigo-600 text-white shadow-xs shadow-indigo-300"
                          : "border-slate-200 bg-[#f7f7fb] text-slate-500 group-hover:border-indigo-200 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                      }`}
                    >
                      {String(unit.unit_number).padStart(2, "0")}
                    </span>

                    <div className="min-w-0 flex-1">
                      <span
                        className={`block truncate text-sm leading-5 transition ${
                          isActiveUnit
                            ? "font-extrabold text-indigo-950"
                            : "font-bold text-slate-700 group-hover:text-indigo-700"
                        }`}
                      >
                        {unit.title}
                      </span>
                      <span className="mt-0.5 block text-[11px] font-medium text-slate-400">
                        {unit.topics.length}{" "}
                        {unit.topics.length === 1 ? "topic" : "topics"}
                      </span>
                    </div>

                    {hasTopics && (
                      <button
                        type="button"
                        aria-label={isExpanded ? "Collapse subtopics" : "Expand subtopics"}
                        onClick={(e) => toggleUnitExpand(unit.unit_number, e)}
                        className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition cursor-pointer"
                      >
                        <ChevronRight
                          className={`h-4 w-4 transition-transform duration-200 ${
                            isExpanded
                              ? "rotate-90 text-indigo-600"
                              : "text-slate-300 group-hover:translate-x-0.5 group-hover:text-indigo-500"
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  {/* NESTED TOPICS LIST - EXCLUSIVELY SHOWN FOR ONLY THIS ACTIVE EXPANDED UNIT */}
                  {isExpanded && hasTopics && (
                    <div className="relative ml-[23px] pl-4 pt-1 pb-2 border-l border-slate-200 space-y-1">
                      {unit.topics.map((topic) => {
                        const isTopicActive =
                          activeTopicNumber === topic.topic_number;

                        return (
                          <a
                            key={topic.id}
                            href={`#topic-${topic.topic_number}`}
                            onClick={(e) =>
                              handleTopicClick(unit.unit_number, topic.topic_number, e)
                            }
                            className={`group flex items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 text-xs transition ${
                              isTopicActive
                                ? "bg-indigo-50/90 text-indigo-950 font-bold ring-1 ring-indigo-200/80 shadow-xs"
                                : "text-slate-600 hover:bg-white hover:text-slate-900 font-medium"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-black transition ${
                                  isTopicActive
                                    ? "bg-indigo-600 text-white"
                                    : "bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-700"
                                }`}
                              >
                                {topic.topic_number}
                              </span>
                              <span className="truncate">{topic.title}</span>
                            </div>

                            {topic.is_important && (
                              <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" />
                            )}
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>
      </div>
    </aside>
  );
}

"use client";

import Link from "next/link";
import {
  Clock,
  PlayCircle,
  Download,
  Eye,
  ExternalLink,
  Inbox,
} from "lucide-react";
import {
  useRealtimeSubjectUpdates,
  type SubjectUpdateItem,
} from "@/lib/academic/feed-store";

export type { SubjectUpdateItem };

type SubjectUpdatesFeedProps = {
  subjectIds: string[];
  initialUpdates?: SubjectUpdateItem[];
};

const TYPE_CONFIG = {
  video: {
    label: "Video",
    accentBorder: "#5B4DFF",
    badgeBg: "bg-indigo-600 text-white",
    btnColor: "text-indigo-600",
    icon: PlayCircle,
    btnLabel: "Watch",
  },
  pyq: {
    label: "PYQ",
    accentBorder: "#F6C844",
    badgeBg: "bg-[#F6C844] text-slate-950",
    btnColor: "text-amber-800",
    icon: Download,
    btnLabel: "Download",
  },
  syllabus: {
    label: "Syllabus",
    accentBorder: "#1B1B2F",
    badgeBg: "bg-[#1B1B2F] text-white",
    btnColor: "text-slate-800",
    icon: Eye,
    btnLabel: "Review",
  },
  notes: {
    label: "Notes",
    accentBorder: "#717588",
    badgeBg: "bg-[#717588] text-white",
    btnColor: "text-slate-600",
    icon: ExternalLink,
    btnLabel: "Open",
  },
};

export function SubjectUpdatesFeed({
  subjectIds,
  initialUpdates = [],
}: SubjectUpdatesFeedProps) {
  // Read generic real-time updates reactively from feed store
  const realtimeUpdates = useRealtimeSubjectUpdates(subjectIds);

  // Combine any real server updates with real-time pushed updates (max 5 items)
  const combined = realtimeUpdates.length > 0 ? realtimeUpdates : initialUpdates;
  const visibleUpdates = combined.slice(0, 5);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_-2px_rgba(18,24,40,0.05)] flex flex-col gap-3.5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-slate-900 leading-snug">
              Subject Updates &amp; Feed
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            New notes, video lectures, PYQs &amp; syllabus
          </p>
        </div>

        {visibleUpdates.length > 0 && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 shrink-0">
            {visibleUpdates.length} New
          </span>
        )}
      </div>

      {/* Feed List or Clean Empty State */}
      {visibleUpdates.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          {visibleUpdates.map((item) => {
            const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.notes;
            const Icon = config.icon;

            return (
              <div
                key={item.id}
                className="group relative rounded-xl p-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-200/60 transition-all flex flex-col gap-1.5"
                style={{ borderLeft: `3px solid ${config.accentBorder}` }}
              >
                {/* Item Top: Subject Name + Type Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {item.subjectName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      ({item.subjectCode})
                    </span>
                  </div>

                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0 ${config.badgeBg}`}
                  >
                    {config.label}
                  </span>
                </div>

                {/* Description */}
                <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                  {item.title}
                </p>

                {/* Item Footer: Timestamp & Action */}
                <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-200/60">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{item.timestamp}</span>
                  </span>

                  <Link
                    href={item.href}
                    className={`inline-flex items-center gap-1 font-semibold hover:underline ${config.btnColor}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{config.btnLabel}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 p-6 flex flex-col items-center justify-center text-center">
          <Inbox className="h-7 w-7 text-slate-300 mb-1.5" />
          <p className="text-xs font-semibold text-slate-700">No updates yet</p>
          <p className="text-[11px] text-slate-400 mt-1 max-w-[240px] leading-relaxed">
            All caught up! When a lecture, note, or PYQ is uploaded for your subjects, real-time updates will appear here.
          </p>
        </div>
      )}
    </div>
  );
}

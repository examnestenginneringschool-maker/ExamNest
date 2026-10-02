import {
  BookOpenCheck,
  GraduationCap,
  Lightbulb,
  ListChecks,
  Star,
} from "lucide-react";
import {
  NoteBlockRenderer,
  type TopicBlock,
} from "@/components/notes/NoteBlockRenderer";

export type LegacyNoteBlock = {
  heading?: string;
  body?: string;
  exam_tip?: string;
};

export type NoteUnit = {
  id: string;
  unit_number: number;
  title: string;
  syllabus_text: string | null;
  important_topics: string[] | null;
  notes?: LegacyNoteBlock[];
};

export type Topic = {
  id: string;
  note_unit_id: string;
  topic_number: string;
  title: string;
  summary: string | null;
  is_important: boolean;
  sort_order: number;
};

type UnitSectionProps = {
  unit: NoteUnit;
  unitIndex: number;
  topics: Topic[];
  blocksByTopic: Map<string, TopicBlock[]>;
};

export function UnitSection({
  unit,
  unitIndex,
  topics,
  blocksByTopic,
}: UnitSectionProps) {
  return (
    <section
      id={`unit-${unit.unit_number}`}
      className={`scroll-mt-36 ${
        unitIndex > 0 ? "mt-20 border-t border-slate-200 pt-16" : ""
      }`}
    >
      {/* ========================================= */}
      {/* UNIT HEADER */}
      {/* ========================================= */}
      <div>
        <div className="flex items-start gap-5 sm:gap-7">
          <div className="hidden shrink-0 sm:block">
            <span className="text-[72px] font-black leading-none tracking-[-0.08em] text-indigo-100">
              {String(unit.unit_number).padStart(2, "0")}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em] text-indigo-600">
              <BookOpenCheck className="h-4 w-4" />
              Unit {unit.unit_number}
            </div>

            <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl lg:text-[42px] lg:leading-[1.1]">
              {unit.title}
            </h2>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-slate-200">
                <ListChecks className="h-3.5 w-3.5 text-indigo-500" />
                {topics.length} {topics.length === 1 ? "topic" : "topics"}
              </span>

              {unit.important_topics && unit.important_topics.length > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700 ring-1 ring-amber-100">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {unit.important_topics.length} focus areas
                </span>
              )}
            </div>
          </div>
        </div>

        {/* SYLLABUS COVERAGE */}
        {unit.syllabus_text && (
          <div className="mt-8 rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.04)] sm:p-6">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50">
                <GraduationCap className="h-4 w-4 text-indigo-600" />
              </span>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">
                  Syllabus coverage
                </p>
              </div>
            </div>

            <p className="mt-4 text-[15px] font-medium leading-8 text-slate-600">
              {unit.syllabus_text}
            </p>
          </div>
        )}

        {/* IMPORTANT TOPIC TAGS */}
        {unit.important_topics && unit.important_topics.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <p className="text-sm font-bold text-slate-800">
                Important topics
              </p>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {unit.important_topics.map((importantTopic) => (
                <span
                  key={importantTopic}
                  className="rounded-full border border-amber-200/80 bg-amber-50/80 px-3 py-1.5 text-xs font-semibold text-amber-800"
                >
                  {importantTopic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* TOPIC QUICK NAV */}
        {topics.length > 0 && (
          <div className="mt-8 border-y border-slate-200/70 py-4">
            <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {topics.map((topic) => (
                <a
                  key={topic.id}
                  href={`#topic-${topic.topic_number}`}
                  className="shrink-0 rounded-full bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-600 transition hover:bg-indigo-600 hover:text-white"
                >
                  {topic.topic_number} · {topic.title}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========================================= */}
      {/* STRUCTURED TOPICS */}
      {/* ========================================= */}
      {topics.length > 0 ? (
        <div className="mt-12">
          {topics.map((topic, topicIndex) => {
            const topicBlocks = blocksByTopic.get(topic.id) ?? [];

            return (
              <article
                key={topic.id}
                id={`topic-${topic.topic_number}`}
                className={`scroll-mt-32 ${
                  topicIndex > 0 ? "mt-16 border-t border-slate-200/80 pt-14" : ""
                }`}
              >
                {/* TOPIC HEADER */}
                <div className="max-w-4xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-black tracking-wide text-white">
                      {topic.topic_number}
                    </span>

                    {topic.is_important && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-700">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        Important
                      </span>
                    )}
                  </div>

                  <h3 className="mt-4 text-2xl font-black tracking-[-0.025em] text-slate-950 sm:text-[30px] sm:leading-[1.2]">
                    {topic.title}
                  </h3>

                  {topic.summary && (
                    <p className="mt-4 max-w-3xl text-[15px] font-medium leading-8 text-slate-500">
                      {topic.summary}
                    </p>
                  )}
                </div>

                {/* BLOCKS */}
                {topicBlocks.length > 0 ? (
                  <div className="mt-8 max-w-4xl space-y-6">
                    {topicBlocks.map((block) => (
                      <NoteBlockRenderer key={block.id} block={block} />
                    ))}
                  </div>
                ) : (
                  <div className="mt-7 max-w-4xl rounded-2xl border border-dashed border-slate-300 bg-white/60 px-5 py-4">
                    <p className="text-sm font-medium text-slate-500">
                      Detailed notes for this topic are being prepared.
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        /* ===================================== */
        /* LEGACY DSA SUPPORT */
        /* ===================================== */
        Array.isArray(unit.notes) &&
        unit.notes.length > 0 && (
          <div className="mt-12 max-w-4xl space-y-10">
            {unit.notes.map((note, index) => (
              <article
                key={`${unit.id}-${index}`}
                className={index > 0 ? "border-t border-slate-200 pt-10" : ""}
              >
                {note.heading && (
                  <h3 className="text-2xl font-black tracking-tight text-slate-950">
                    {note.heading}
                  </h3>
                )}

                {note.body && (
                  <p className="mt-4 whitespace-pre-line text-[16px] leading-8 text-slate-600">
                    {note.body}
                  </p>
                )}

                {note.exam_tip && (
                  <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5">
                    <div className="flex gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                        <Lightbulb className="h-4 w-4 text-emerald-700" />
                      </div>

                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.15em] text-emerald-700">
                          Exam focus
                        </p>
                        <p className="mt-2 text-sm font-medium leading-7 text-emerald-950">
                          {note.exam_tip}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        )
      )}
    </section>
  );
}

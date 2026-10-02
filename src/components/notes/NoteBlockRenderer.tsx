import {
  BookOpen,
  CircleAlert,
  FileText,
  Lightbulb,
  Sigma,
} from "lucide-react";

export type BlockContent = {
  title?: string;
  text?: string;
  formula?: string;
  description?: string;
  items?: string[];
  url?: string;
  alt?: string;
  caption?: string;
};

export type TopicBlock = {
  id: string;
  topic_id: string;
  block_key: string | null;
  block_type: string;
  content: BlockContent;
  sort_order: number;
};

export function NoteBlockRenderer({ block }: { block: TopicBlock }) {
  const { block_type, content } = block;

  // DEFINITION
  if (block_type === "definition") {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-white px-5 py-5 shadow-[0_8px_28px_rgba(15,23,42,0.035)] sm:px-6">
        <div className="absolute bottom-0 left-0 top-0 w-1 bg-indigo-500" />
        <div className="pl-2">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50">
              <BookOpen className="h-4 w-4 text-indigo-600" />
            </span>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-600">
              Definition
            </p>
          </div>
          {content.title && (
            <h4 className="mt-4 text-lg font-black tracking-tight text-slate-950">
              {content.title}
            </h4>
          )}
          {content.text && (
            <p className="mt-2 text-[15.5px] leading-8 text-slate-600">
              {content.text}
            </p>
          )}
        </div>
      </div>
    );
  }

  // FORMULA
  if (block_type === "formula") {
    return (
      <div className="overflow-hidden rounded-[22px] border border-violet-200/70 bg-gradient-to-br from-violet-50 to-indigo-50/60">
        <div className="flex items-center gap-2 px-5 pb-0 pt-5 sm:px-6">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow-sm">
            <Sigma className="h-4 w-4 text-violet-600" />
          </span>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-700">
            Formula
          </p>
        </div>
        <div className="px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
          {content.title && (
            <h4 className="text-base font-black text-slate-900">
              {content.title}
            </h4>
          )}
          {content.formula && (
            <div className="mt-4 overflow-x-auto rounded-2xl border border-white/80 bg-white px-5 py-5 shadow-sm">
              <p className="min-w-max text-center font-mono text-[18px] font-semibold tracking-tight text-slate-950 sm:text-xl">
                {content.formula}
              </p>
            </div>
          )}
          {content.description && (
            <p className="mt-4 text-sm font-medium leading-7 text-slate-600">
              {content.description}
            </p>
          )}
        </div>
      </div>
    );
  }

  // BULLET LIST
  if (block_type === "bullet_list") {
    return (
      <div className="py-1">
        {content.title && (
          <h4 className="text-lg font-black tracking-tight text-slate-900">
            {content.title}
          </h4>
        )}
        {content.items && content.items.length > 0 && (
          <ul className="mt-4 space-y-3">
            {content.items.map((item, index) => (
              <li
                key={index}
                className="group flex items-start gap-3 text-[15.5px] leading-7 text-slate-600"
              >
                <span className="mt-[9px] flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // NUMBERED LIST
  if (block_type === "numbered_list") {
    return (
      <div>
        {content.title && (
          <h4 className="text-lg font-black tracking-tight text-slate-900">
            {content.title}
          </h4>
        )}
        {content.items && content.items.length > 0 && (
          <ol className="mt-5 space-y-4">
            {content.items.map((item, index) => (
              <li
                key={index}
                className="flex items-start gap-4 text-[15.5px] leading-7 text-slate-600"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-[11px] font-black text-white">
                  {index + 1}
                </span>
                <span className="pt-[1px]">{item}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    );
  }

  // IMPORTANT
  if (block_type === "important") {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50/60 p-5 sm:p-6">
        <div className="absolute bottom-0 left-0 top-0 w-1 bg-amber-400" />
        <div className="flex gap-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
            <CircleAlert className="h-4 w-4 text-amber-600" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">
              {content.title ?? "Important"}
            </p>
            {content.text && (
              <p className="mt-2 text-[15px] font-medium leading-7 text-amber-950">
                {content.text}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // EXAM TIP
  if (block_type === "exam_tip") {
    return (
      <div className="relative overflow-hidden rounded-[22px] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50/60 p-5 sm:p-6">
        <div className="absolute bottom-0 left-0 top-0 w-1 bg-emerald-500" />
        <div className="flex gap-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
            <Lightbulb className="h-4 w-4 text-emerald-600" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">
              {content.title ?? "Exam focus"}
            </p>
            {content.text && (
              <p className="mt-2 text-[15px] font-medium leading-7 text-emerald-950">
                {content.text}
              </p>
            )}
            {content.items && content.items.length > 0 && (
              <ul className="mt-4 space-y-2.5">
                {content.items.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2.5 text-sm font-medium leading-6 text-emerald-950"
                  >
                    <span className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  }

  // EXAMPLE
  if (block_type === "example") {
    return (
      <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow-sm">
            <FileText className="h-4 w-4 text-sky-600" />
          </span>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-700">
            Example
          </p>
        </div>
        {content.title && (
          <h4 className="mt-4 text-lg font-black text-sky-950">
            {content.title}
          </h4>
        )}
        {content.text && (
          <p className="mt-2 whitespace-pre-line text-[15px] leading-8 text-sky-900">
            {content.text}
          </p>
        )}
      </div>
    );
  }

  // HEADING / SUBHEADING
  if (block_type === "heading" || block_type === "subheading") {
    return (
      <div className="pt-2">
        <div className="flex items-center gap-3">
          <span className="h-7 w-1 rounded-full bg-indigo-500" />
          <h4 className="text-xl font-black tracking-tight text-slate-950">
            {content.title}
          </h4>
        </div>
        {content.text && (
          <p className="mt-3 pl-4 text-[15.5px] leading-8 text-slate-600">
            {content.text}
          </p>
        )}
      </div>
    );
  }

  // DERIVATION
  if (block_type === "derivation") {
    return (
      <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_8px_28px_rgba(15,23,42,0.035)]">
        <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Sigma className="h-4 w-4 text-slate-500" />
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
              Derivation
            </p>
          </div>
          {content.title && (
            <h4 className="mt-2 text-base font-black text-slate-950">
              {content.title}
            </h4>
          )}
        </div>
        {content.text && (
          <div className="overflow-x-auto px-5 py-5 sm:px-6">
            <p className="whitespace-pre-line font-mono text-[14px] leading-8 text-slate-700">
              {content.text}
            </p>
          </div>
        )}
      </div>
    );
  }

  // IMAGE
  if (block_type === "image" && content.url) {
    return (
      <figure className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={content.url}
          alt={content.alt ?? content.title ?? "Study diagram"}
          className="h-auto w-full object-contain"
        />
        {(content.caption || content.title) && (
          <figcaption className="border-t border-slate-100 px-5 py-3 text-center text-xs font-medium leading-5 text-slate-500">
            {content.caption ?? content.title}
          </figcaption>
        )}
      </figure>
    );
  }

  // DEFAULT PARAGRAPH
  return (
    <div>
      {content.title && (
        <h4 className="text-lg font-black tracking-tight text-slate-900">
          {content.title}
        </h4>
      )}
      {content.text && (
        <p className="mt-3 whitespace-pre-line text-[15.5px] leading-8 text-slate-600">
          {content.text}
        </p>
      )}
    </div>
  );
}

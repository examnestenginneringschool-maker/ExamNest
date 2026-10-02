import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

type NotesHeaderProps = {
  subjectId: string;
  subjectName: string;
};

export function NotesHeader({ subjectId, subjectName }: NotesHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href={`/app/subjects/${subjectId}`}
          className="group inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white transition group-hover:border-slate-300 group-hover:shadow-sm">
            <ArrowLeft className="h-4 w-4" />
          </span>
          <span className="hidden sm:inline">{subjectName}</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-500 sm:flex">
            <BookOpen className="h-4 w-4 text-indigo-500" />
            Notes
          </div>

          <div className="flex items-center gap-2 text-sm font-bold tracking-tight text-slate-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white">
              E
            </span>
            <span className="hidden sm:block">ExamNest</span>
          </div>

          <UserButton />
        </div>
      </div>
    </header>
  );
}

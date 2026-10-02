import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Logo } from "@/components/brand/Logo";

type NotesHeaderProps = {
  subjectId: string;
  subjectName: string;
};

export function NotesHeader({ subjectId, subjectName }: NotesHeaderProps) {
  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 transition-all">
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
        <Link
          href={`/app/subjects/${subjectId}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:shadow-sm hover:border-slate-300 text-slate-700 text-xs font-semibold transition-all active:scale-95 shrink-0"
          title="Back to Subject"
        >
          <ArrowLeft className="h-4 w-4 text-slate-500" />
          <span className="hidden sm:inline">Back</span>
        </Link>

        <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/80 border border-slate-200/60 text-slate-700 text-xs font-semibold truncate max-w-md">
          <BookOpen className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
          <span className="truncate">{subjectName}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <Link
          href="/app/dashboard"
          className="hover:opacity-85 transition-opacity"
          title="Back to Dashboard"
        >
          <Logo size="xs" withText={true} />
        </Link>

        <div className="pl-3 border-l border-slate-200">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-9 h-9 ring-2 ring-slate-100 rounded-full",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}

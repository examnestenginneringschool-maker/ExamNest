import Link from "next/link";
import { ArrowLeft, Building2, School, ChevronDown } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

type WorkspaceHeaderProps = {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  universityName: string;
  collegeName: string;
  courseName: string;
  departmentCode: string;
  semesterNumber: number;
  studentName?: string;
};

export function WorkspaceHeader({
  subjectId,
  subjectName,
  subjectCode,
  universityName,
  collegeName,
  courseName,
  departmentCode,
  semesterNumber,
  studentName,
}: WorkspaceHeaderProps) {
  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 transition-all">
      {/* Left side: Back Button & Academic Subject Breadcrumb */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
        <Link
          href={`/app/subjects/${subjectId}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:shadow-sm hover:border-slate-300 text-slate-700 text-xs font-semibold transition-all active:scale-95 shrink-0"
          title="Back to Subject Overview"
        >
          <ArrowLeft className="h-4 w-4 text-slate-500" />
          <span className="hidden sm:inline">Back</span>
        </Link>

        {/* University, College, Subject Chip */}
        <div className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/80 border border-slate-200/60 text-slate-600 text-xs font-medium truncate max-w-xl">
          <Building2 className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-semibold text-slate-900 truncate">
              {universityName}
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500 truncate hidden lg:inline max-w-[160px]">
              {collegeName}
            </span>
            <span className="text-slate-300 hidden lg:inline">·</span>
            <span className="text-indigo-600 font-bold truncate max-w-[200px]">
              {subjectName}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-extrabold text-[10px] shrink-0">
              {subjectCode}
            </span>
          </div>
        </div>
      </div>

      {/* Right side: Academic Pill & Student Profile */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-medium transition-colors">
          <School className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
          <span className="font-semibold text-slate-800">
            {courseName} · {departmentCode} · Sem {semesterNumber}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        </div>

        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-9 h-9 ring-2 ring-slate-100 rounded-full",
              },
            }}
          />
          {studentName && (
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 leading-tight">
                {studentName}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {departmentCode} Student
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

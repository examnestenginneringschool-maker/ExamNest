import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import {
  getStudentAcademicContext,
  getCurriculumSubjectsWithNotes,
} from "@/lib/academic/student-context";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { ContinueStudyingSection } from "@/components/dashboard/ContinueStudyingSection";
import { AssessmentsBanner } from "@/components/dashboard/AssessmentsBanner";
import { StudyFocusCards } from "@/components/dashboard/StudyFocusCards";
import { DashboardCalendar } from "@/components/dashboard/DashboardCalendar";
import { SubjectUpdatesFeed } from "@/components/dashboard/SubjectUpdatesFeed";
import { RemindersTasksWidget } from "@/components/dashboard/RemindersTasksWidget";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // 1. Resolve student academic profile context
  const context = await getStudentAcademicContext(user.id);

  if (!context) {
    redirect("/onboarding");
  }

  const { university, college, course, department, semester } = context;

  // 2. Resolve curriculum subjects and note unit counts
  const { subjects } = await getCurriculumSubjectsWithNotes(
    university.id,
    course.id,
    semester.semester_number,
    department.id
  );

  const studentName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || "Student";
  const firstName = user.firstName || "Student";
  const universityName = university.short_name || university.name;
  const collegeName = college.name;
  const courseName = course.short_name || course.name;
  const departmentName = department.name;
  const departmentCode = department.short_name || department.name;
  const semesterNumber = semester.semester_number;

  const totalNotesCount = subjects.reduce(
    (acc, s) => acc + s.noteUnitsCount,
    0
  );

  const subjectIds = subjects.map((s) => s.id);

  return (
    <main className="min-h-screen bg-[#F8FAFD] text-slate-800 flex flex-col font-sans">
      {/* 1. Sticky Navigation Header */}
      <DashboardHeader
        universityName={universityName}
        collegeName={collegeName}
        courseName={courseName}
        departmentCode={departmentCode}
        semesterNumber={semesterNumber}
        studentName={studentName}
      />

      {/* 2. Main Workspace: Asymmetric 2-Column Responsive Layout */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 grid grid-cols-1 xl:grid-cols-12 gap-8 items-start max-w-[1600px] w-full mx-auto">
        {/* Central Workspace (Col 8) */}
        <section className="xl:col-span-8 flex flex-col gap-6 sm:gap-8">
          {/* Welcome Banner with Dynamic Progress Ring */}
          <DashboardHero
            firstName={firstName}
            courseName={courseName}
            departmentName={departmentName}
            universityName={universityName}
            semesterNumber={semesterNumber}
            subjects={subjects.map((s) => ({
              id: s.id,
              noteUnitsCount: s.noteUnitsCount,
            }))}
            totalNotesCount={totalNotesCount}
          />

          {/* Continue Studying with Individual Subject Progress Bars */}
          <ContinueStudyingSection subjects={subjects} />

          {/* Upcoming Tests & Assessments */}
          <AssessmentsBanner />

          {/* Study Focus & Quick Revision Cards */}
          <StudyFocusCards />
        </section>

        {/* Right Column: Contextual Side Panel (Col 4) */}
        <aside className="xl:col-span-4 flex flex-col gap-6">
          {/* Dynamic Interactive Mini Calendar */}
          <DashboardCalendar />

          {/* Subject Updates & Feed (Max 5 or Clean Empty State) */}
          <SubjectUpdatesFeed subjectIds={subjectIds} />

          {/* Reminders & Tasks To-Do List with Wipe-out Animations */}
          <RemindersTasksWidget />
        </aside>
      </div>
    </main>
  );
}
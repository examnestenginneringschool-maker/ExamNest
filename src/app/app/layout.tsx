import { redirect } from "next/navigation";
import { SingleSessionGuard } from "@/components/auth/SingleSessionGuard";
import { StudentProfileProvider } from "@/components/profile/StudentProfileContext";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import {
  getCurriculumSubjectsWithNotes,
  getStudentAcademicContext,
} from "@/lib/academic/student-context";
import { formatDeviceLabel } from "@/lib/utils/device";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Ensure student has completed academic onboarding before accessing student routes.
  // React.cache() in getStudentAcademicContext ensures child pages reuse the result with 0 extra queries.
  const context = await getStudentAcademicContext(user.id);
  if (!context) {
    redirect("/onboarding");
  }

  const { subjects } = await getCurriculumSubjectsWithNotes(
    context.university.id,
    context.course.id,
    context.semester.semester_number,
    context.department.id
  );

  return (
    <StudentProfileProvider
      student={{
        id: user.id,
        fullName: user.fullName,
        firstName: user.firstName,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        emailConfirmedAt: user.emailConfirmedAt,
        authProviders: user.authProviders,
        hasPasswordAuth: user.hasPasswordAuth,
        activeDeviceLabel: formatDeviceLabel(user.activeDeviceInfo),
        activeLoginAt: user.activeLoginAt,
      }}
      academic={context}
      subjects={subjects}
    >
      <SingleSessionGuard />
      {children}
    </StudentProfileProvider>
  );
}

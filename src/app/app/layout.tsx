import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { getStudentAcademicContext } from "@/lib/academic/student-context";

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

  return <>{children}</>;
}

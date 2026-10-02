import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getStudentAcademicContext } from "@/lib/academic/student-context";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Ensure student has completed academic onboarding before accessing student routes.
  // React.cache() in getStudentAcademicContext ensures child pages reuse the result with 0 extra queries.
  const context = await getStudentAcademicContext(userId);
  if (!context) {
    redirect("/onboarding");
  }

  return <>{children}</>;
}
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import StudentOnboarding from "@/components/auth/StudentOnboarding";
import { getStudentAcademicContext } from "@/lib/academic/student-context";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getUniversities } from "./actions";

export default async function OnboardingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const supabase = createServerSupabaseClient();

  // Ensure base profile exists in Supabase for the authenticated student
  await supabase
    .from("profiles")
    .upsert(
      {
        user_id: userId,
      },
      {
        onConflict: "user_id",
        ignoreDuplicates: true,
      }
    )
    .then(({ error }) => {
      if (error) {
        console.error("Base profile initialization on onboarding page:", error.message);
      }
    });

  // Check if academic profile is already fully configured, and prefetch universities in parallel
  const [academicContext, initialUniversities] = await Promise.all([
    getStudentAcademicContext(userId),
    getUniversities().catch(() => []),
  ]);

  // If already onboarded with valid academic data, redirect straight to dashboard
  if (academicContext) {
    redirect("/app/dashboard");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/20 to-slate-100 px-4 py-8 md:py-14">
      <StudentOnboarding initialUniversities={initialUniversities} />
    </main>
  );
}
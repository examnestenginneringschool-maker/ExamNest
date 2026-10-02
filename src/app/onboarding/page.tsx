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
    <main className="relative min-h-screen bg-[#FAF8FF] px-4 py-8 md:py-14 overflow-hidden selection:bg-[#5B4DFF] selection:text-white">
      {/* Ambient Atmospheric Glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[850px] h-[380px] bg-[#F6C844]/20 rounded-full blur-3xl aura-glow-left" />
        <div className="absolute top-1/3 -right-24 w-[600px] h-[400px] bg-[#5B4DFF]/18 rounded-full blur-3xl aura-glow-right" />
        <div className="absolute -bottom-24 -left-20 w-[500px] h-[350px] bg-[#5B4DFF]/12 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 animate-in fade-in zoom-in-[0.99] duration-500 ease-out">
        <StudentOnboarding initialUniversities={initialUniversities} />
      </div>
    </main>
  );
}
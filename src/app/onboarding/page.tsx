import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import StudentOnboarding from "@/components/auth/StudentOnboarding";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function OnboardingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const supabase = createServerSupabaseClient();

  // Make sure the ExamNest profile exists
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(
      {
        user_id: userId,
      },
      {
        onConflict: "user_id",
        ignoreDuplicates: true,
      }
    );

  if (profileError) {
    throw new Error(profileError.message);
  }

  // Check onboarding status
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("user_id", userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Already completed onboarding
  if (profile?.onboarding_completed) {
    redirect("/app/dashboard");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <StudentOnboarding />
    </main>
  );
}
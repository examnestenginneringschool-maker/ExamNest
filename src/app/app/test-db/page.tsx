import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function TestDbPage() {
  const { userId } = await auth();

  if (!userId) {
    return <div>Not authenticated</div>;
  }

  const supabase = createServerSupabaseClient();

  const { data: existingProfile, error: selectError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (selectError) {
    return (
      <pre>
        {JSON.stringify(
          { stage: "select", error: selectError },
          null,
          2
        )}
      </pre>
    );
  }

  let profile = existingProfile;

  if (!profile) {
    const { data, error } = await supabase
      .from("profiles")
      .insert({ user_id: userId })
      .select()
      .single();

    if (error) {
      return (
        <pre>
          {JSON.stringify(
            { stage: "insert", error },
            null,
            2
          )}
        </pre>
      );
    }

    profile = data;
  }

  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold">
        Supabase connected successfully
      </h1>

      <pre className="mt-6 rounded-lg bg-slate-100 p-5">
        {JSON.stringify(profile, null, 2)}
      </pre>
    </main>
  );
}
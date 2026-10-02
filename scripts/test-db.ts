/**
 * Database connectivity verification script for developer CLI usage.
 * Usage: npx tsx scripts/test-db.ts
 */
import { createClient } from "@supabase/supabase-js";

async function testDatabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or Supabase Key.");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("Checking Supabase connection to:", supabaseUrl);
  const { data, error } = await supabase
    .from("universities")
    .select("id, name, short_name")
    .limit(3);

  if (error) {
    console.error("Connection failed:", error.message);
    process.exit(1);
  }

  console.log("Connection successful! Sample data:", data);
}

testDatabase().catch(console.error);

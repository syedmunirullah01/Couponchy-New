import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  const { data, error } = await supabase
    .from("settings")
    .select("data")
    .eq("id", 1)
    .single();

  if (error) {
    console.error("Error loading settings:", error);
    return;
  }

  console.log("=== settings.data.general ===");
  console.log(JSON.stringify(data.data?.general || {}, null, 2));
}

main().catch(console.error);

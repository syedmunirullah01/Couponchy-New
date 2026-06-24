/**
 * Reset script to delete all offers, scraper jobs, scraper logs, and reset store counts.
 * Run with: node scripts/clear-offers.cjs
 */
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Load .env.local
const envPath = path.join(__dirname, "../.env.local");
if (!fs.existsSync(envPath)) {
  console.error("Error: .env.local file not found at", envPath);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, "utf8");
const envVars = {};
envContent.split("\n").forEach((line) => {
  const parts = line.split("=");
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const value = parts.slice(1).join("=").trim();
    envVars[key] = value;
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log("=== RESETTING CATALOG DATABASE ===");

  // 1. Delete all offers
  console.log("1. Deleting all offers/coupons...");
  const { error: offersError, count: offersCount } = await supabase
    .from("offers")
    .delete({ count: "exact" })
    .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all rows

  if (offersError) {
    console.error("Error deleting offers:", offersError.message);
  } else {
    console.log(`✓ Deleted ${offersCount || 0} offers.`);
  }

  // 2. Reset stores offers_count to 0
  console.log("2. Resetting store offer counts to 0...");
  const { error: storesError } = await supabase
    .from("stores")
    .update({ offers_count: 0 })
    .neq("id", "00000000-0000-0000-0000-000000000000"); // Update all rows

  if (storesError) {
    console.error("Error resetting store counts:", storesError.message);
  } else {
    console.log("✓ Reset all store offer counts to 0.");
  }

  // 3. Clear scraper jobs & logs
  console.log("3. Clearing scraper jobs and logs...");
  const { error: logsError } = await supabase
    .from("scraper_logs")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  const { error: jobsError } = await supabase
    .from("scraper_jobs")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (logsError || jobsError) {
    console.error("Error clearing scraper data:", logsError?.message || jobsError?.message);
  } else {
    console.log("✓ Cleared all scraper jobs and logs.");
  }

  console.log("=== DATABASE RESET COMPLETE ===");
}

run();

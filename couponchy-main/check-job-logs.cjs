const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, ".env.local");
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

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const jobId = "471a4437-b45e-4832-8c4b-66ba4e12950f";
  const { data: job, error: jobErr } = await supabase
    .from("scraper_jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  console.log("Job status/error:", job, jobErr);

  const { data: logs, error: logErr } = await supabase
    .from("scraper_logs")
    .select("*")
    .eq("job_id", jobId);

  console.log("Job logs count:", logs ? logs.length : 0);
  console.log("Job logs:", logs);

  const { data: offers } = await supabase
    .from("offers")
    .select("*")
    .eq("code", "SUMMER");
  console.log("SUMMER coupon:", offers);
}

run();

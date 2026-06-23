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
  console.log("Triggering validation job (forceAll = false)...");
  const secret = envVars.SCRAPER_INTERNAL_SECRET || "csc_9xKm2pL8qN4vR7wJ3cB5hT1dE6fG";
  const res = await fetch("http://localhost:4000/trigger", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-scraper-secret": secret
    },
    body: JSON.stringify({
      job_type: "validate",
      forceAll: false
    })
  });

  const payload = await res.json();
  console.log("Response:", payload);

  if (!res.ok) {
    console.error("Failed to trigger job");
    return;
  }

  const jobId = payload.job_id;
  console.log("Waiting for job to complete...");

  for (let i = 0; i < 40; i++) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const { data: job, error } = await supabase
      .from("scraper_jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (error) {
      console.error("Error fetching job status:", error);
      break;
    }

    console.log(`Job status: ${job.status}`);
    if (job.status === "completed" || job.status === "failed") {
      break;
    }
  }

  console.log("Fetching scraper logs for SUMMER...");
  const { data: logs, error: logError } = await supabase
    .from("scraper_logs")
    .select("*")
    .eq("offer_code", "SUMMER")
    .order("created_at", { ascending: false });

  if (logError) {
    console.error("Log error:", logError);
  } else {
    console.log("Scraper logs for SUMMER:", logs);
  }

  console.log("Fetching SUMMER coupon fields...");
  const { data: offers } = await supabase
    .from("offers")
    .select("*")
    .eq("code", "SUMMER");
  console.log("SUMMER coupon after validation:", offers);
}

run();

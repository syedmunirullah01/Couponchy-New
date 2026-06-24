const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const envContent = fs.readFileSync(path.join(__dirname, "../.env.local"), "utf8");
const envVars = {};
envContent.split("\n").forEach((line) => {
  const parts = line.split("=");
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const value = parts.slice(1).join("=").trim().replace(/^['"]|['"]$/g, "");
    envVars[key] = value;
  }
});

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data: offer, error } = await supabase
    .from("offers")
    .select("*")
    .eq("id", "d8c4c51d-68c5-43e6-9792-bb55aef0c9a5")
    .single();

  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Offer state in DB:", {
      id: offer.id,
      title: offer.title,
      is_exclusive: offer.is_exclusive,
      is_featured: offer.is_featured
    });
  }
}

run();

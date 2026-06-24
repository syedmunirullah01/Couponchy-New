import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data", "database");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrateCategories() {
  console.log("\n── Migrating categories only ──");
  let categories;
  try {
    const content = await readFile(path.join(DATA_DIR, "categories.json"), "utf8");
    categories = JSON.parse(content);
  } catch (err) {
    console.log("  Failed to read categories.json:", err.message);
    return;
  }

  if (!categories.length) { 
    console.log("  Nothing to migrate"); 
    return; 
  }

  const rows = categories.map((c) => ({
    name:        c.name,
    slug:        c.slug,
    description: c.description || "",
    created_at:  c.createdAt || new Date().toISOString(),
    updated_at:  c.updatedAt || new Date().toISOString(),
  }));

  const { error } = await supabase.from("categories").upsert(rows, { onConflict: "slug" });
  if (error) {
    console.error("  ERROR:", error.message);
  } else {
    console.log(`  ✓ ${rows.length} categories successfully migrated to Supabase`);
  }
}

migrateCategories().catch(console.error);

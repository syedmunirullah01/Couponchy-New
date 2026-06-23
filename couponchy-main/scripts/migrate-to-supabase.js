/**
 * One-time migration: reads all existing JSON flat files and inserts into Supabase.
 * Run once with: node scripts/migrate-to-supabase.js
 *
 * Requires .env.local to have SUPABASE_SERVICE_ROLE_KEY filled in.
 */

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

async function readJson(fileName) {
  try {
    const content = await readFile(path.join(DATA_DIR, fileName), "utf8");
    return JSON.parse(content);
  } catch {
    console.log(`  [skip] ${fileName} not found or empty`);
    return [];
  }
}

async function migrateStores() {
  console.log("\n── Migrating stores ──");
  const stores = await readJson("stores.json");
  if (!stores.length) { console.log("  Nothing to migrate"); return; }

  const rows = stores.map((s) => ({
    name:                     s.name,
    slug:                     s.slug,
    category:                 s.category,
    category_slug:            s.categorySlug || "",
    country_code:             s.countryCode || "US",
    logo_image:               s.logoImage || "",
    logo_text:                s.logoText || s.name,
    affiliate_link:           s.affiliateLink || "",
    logo_class_name:          s.logoClassName || "",
    description:              s.description || "",
    content_intro_title:      s.contentIntroTitle || "",
    content_intro_paragraph1: s.contentIntroParagraph1 || "",
    content_intro_paragraph2: s.contentIntroParagraph2 || "",
    content_why_items_text:   s.contentWhyItemsText || "",
    content_outro:            s.contentOutro || "",
    faq1_question:            s.faq1Question || "",
    faq1_answer:              s.faq1Answer || "",
    faq2_question:            s.faq2Question || "",
    faq2_answer:              s.faq2Answer || "",
    faq3_question:            s.faq3Question || "",
    faq3_answer:              s.faq3Answer || "",
    trust_status:             s.trustStatus || "Active",
    is_featured:              Boolean(s.isFeatured),
    hero_image:               s.heroImage || "",
    rating:                   s.rating || "4.7 (0 reviews)",
    offers_count:             Number(s.offersCount ?? 0),
    created_at:               s.createdAt || new Date().toISOString(),
    updated_at:               s.updatedAt || new Date().toISOString(),
  }));

  const { error } = await supabase.from("stores").upsert(rows, { onConflict: "slug" });
  if (error) console.error("  ERROR:", error.message);
  else console.log(`  ✓ ${rows.length} stores migrated`);
}

async function migrateOffers() {
  console.log("\n── Migrating offers ──");
  const offers = await readJson("offers.json");
  if (!offers.length) { console.log("  Nothing to migrate (offers.json is empty)"); return; }

  const rows = offers.map((o) => ({
    title:          o.title,
    description:    o.description || "",
    type:           o.type || "Coupon",
    store_slug:     o.storeSlug,
    store_name:     o.storeName,
    source:         o.source || "Manual",
    expiry_date:    o.expiryDate || "",
    status:         o.status || "Active",
    code:           o.code || "",
    affiliate_link: o.affiliateLink || "",
    cta_label:      o.ctaLabel || "",
    created_at:     o.createdAt || new Date().toISOString(),
    updated_at:     o.updatedAt || new Date().toISOString(),
  }));

  const { error } = await supabase.from("offers").insert(rows);
  if (error) console.error("  ERROR:", error.message);
  else console.log(`  ✓ ${rows.length} offers migrated`);
}

async function migrateCategories() {
  console.log("\n── Migrating categories ──");
  const categories = await readJson("categories.json");
  if (!categories.length) { console.log("  Nothing to migrate"); return; }

  const rows = categories.map((c) => ({
    name:        c.name,
    slug:        c.slug,
    description: c.description || "",
    created_at:  c.createdAt || new Date().toISOString(),
    updated_at:  c.updatedAt || new Date().toISOString(),
  }));

  const { error } = await supabase.from("categories").upsert(rows, { onConflict: "slug" });
  if (error) console.error("  ERROR:", error.message);
  else console.log(`  ✓ ${rows.length} categories migrated`);
}

async function migrateEvents() {
  console.log("\n── Migrating events ──");
  const events = await readJson("events.json");
  if (!events.length) { console.log("  Nothing to migrate"); return; }

  const rows = events.map((e) => ({
    name:        e.name,
    slug:        e.slug,
    description: e.description || "",
    start_date:  e.startDate || "",
    end_date:    e.endDate || "",
    is_active:   e.isActive !== false,
    image:       e.image || "",
    created_at:  e.createdAt || new Date().toISOString(),
    updated_at:  e.updatedAt || new Date().toISOString(),
  }));

  const { error } = await supabase.from("events").upsert(rows, { onConflict: "slug" });
  if (error) console.error("  ERROR:", error.message);
  else console.log(`  ✓ ${rows.length} events migrated`);
}

async function migrateProducts() {
  console.log("\n── Migrating products ──");
  const products = await readJson("products.json");
  if (!products.length) { console.log("  Nothing to migrate"); return; }

  const rows = products.map((p) => ({
    title:          p.title,
    slug:           p.slug || "",
    description:    p.description || "",
    image:          p.image || "",
    price:          p.price || "",
    original_price: p.originalPrice || "",
    cta_label:      p.ctaLabel || "Shop Now",
    product_url:    p.productUrl || "",
    store_slug:     p.storeSlug || "",
    store_name:     p.storeName || "",
    status:         p.status || "Active",
    created_at:     p.createdAt || new Date().toISOString(),
    updated_at:     p.updatedAt || new Date().toISOString(),
  }));

  const { error } = await supabase.from("products").insert(rows);
  if (error) console.error("  ERROR:", error.message);
  else console.log(`  ✓ ${rows.length} products migrated`);
}

async function migrateSettings() {
  console.log("\n── Migrating settings ──");
  let settings;
  try {
    const content = await readFile(path.join(DATA_DIR, "settings.json"), "utf8");
    settings = JSON.parse(content);
  } catch {
    console.log("  Nothing to migrate");
    return;
  }

  const { error } = await supabase
    .from("settings")
    .upsert({ id: 1, data: settings }, { onConflict: "id" });

  if (error) console.error("  ERROR:", error.message);
  else console.log("  ✓ Settings migrated");
}

async function main() {
  console.log("=== Couponchy → Supabase Migration ===");
  console.log(`URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);

  await migrateStores();
  await migrateOffers();
  await migrateCategories();
  await migrateEvents();
  await migrateProducts();
  await migrateSettings();

  console.log("\n✅ Migration complete!\n");
}

main().catch(console.error);

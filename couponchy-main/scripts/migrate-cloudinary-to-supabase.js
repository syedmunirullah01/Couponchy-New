/**
 * Standalone Node script to migrate Cloudinary images to Supabase Storage.
 * Run with: node scripts/migrate-cloudinary-to-supabase.js
 * 
 * Requirements: .env.local must have:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ ERROR: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const BUCKET_NAME = "couponchy";

/**
 * Ensures the public storage bucket exists in Supabase.
 */
async function ensureBucketExists() {
  console.log(`Checking if bucket "${BUCKET_NAME}" exists...`);
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    throw new Error(`Failed to list buckets: ${listError.message}`);
  }

  const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);
  if (!bucketExists) {
    console.log(`Bucket "${BUCKET_NAME}" not found. Creating it...`);
    const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/svg+xml"],
      fileSizeLimit: 5242880, // 5MB
    });

    if (createError) {
      throw new Error(`Failed to create bucket: ${createError.message}`);
    }
    console.log(`✓ Bucket "${BUCKET_NAME}" created successfully as PUBLIC.`);
  } else {
    console.log(`✓ Bucket "${BUCKET_NAME}" already exists.`);
  }
}

/**
 * Downloads a file from a URL and uploads it to Supabase Storage.
 * Returns the public URL on success.
 */
async function migrateImage(imageUrl, targetPath) {
  try {
    console.log(`  Downloading: ${imageUrl}`);
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type") || "image/png";
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`  Uploading to storage: ${targetPath}`);
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(targetPath, buffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(targetPath);
    console.log(`  ✓ Migrated: ${data.publicUrl}`);
    return data.publicUrl;
  } catch (error) {
    console.error(`  ❌ Failed to migrate image: ${imageUrl}. Error: ${error.message}`);
    return null;
  }
}

function getFilenameAndExt(url) {
  try {
    const parsed = new URL(url);
    const filename = parsed.pathname.split("/").pop();
    return filename || "image.png";
  } catch {
    return "image.png";
  }
}

function isCloudinaryUrl(url) {
  return typeof url === "string" && url.includes("res.cloudinary.com");
}

async function migrateStores() {
  console.log("\n--- Migrating Store Images ---");
  const { data: stores, error } = await supabase.from("stores").select("id, name, slug, logo_image, hero_image");
  if (error) {
    console.error("Error fetching stores:", error.message);
    return;
  }

  let count = 0;
  for (const store of stores) {
    let updatedLogo = null;
    let updatedHero = null;

    if (isCloudinaryUrl(store.logo_image)) {
      const filename = getFilenameAndExt(store.logo_image);
      updatedLogo = await migrateImage(store.logo_image, `stores/${store.slug}-logo-${filename}`);
    }

    if (isCloudinaryUrl(store.hero_image)) {
      const filename = getFilenameAndExt(store.hero_image);
      updatedHero = await migrateImage(store.hero_image, `stores/${store.slug}-hero-${filename}`);
    }

    if (updatedLogo || updatedHero) {
      const updates = {};
      if (updatedLogo) updates.logo_image = updatedLogo;
      if (updatedHero) updates.hero_image = updatedHero;

      const { error: updateError } = await supabase
        .from("stores")
        .update(updates)
        .eq("id", store.id);

      if (updateError) {
        console.error(`  Error updating store ${store.name}:`, updateError.message);
      } else {
        console.log(`  ✓ Updated database fields for ${store.name}`);
        count++;
      }
    }
  }
  console.log(`Stores updated: ${count}`);
}

async function migrateProducts() {
  console.log("\n--- Migrating Product Images ---");
  const { data: products, error } = await supabase.from("products").select("id, title, slug, image");
  if (error) {
    console.error("Error fetching products:", error.message);
    return;
  }

  let count = 0;
  for (const product of products) {
    if (isCloudinaryUrl(product.image)) {
      const filename = getFilenameAndExt(product.image);
      const uniquePrefix = product.id.slice(0, 8);
      const updatedImage = await migrateImage(product.image, `products/${product.slug || "product"}-${uniquePrefix}-${filename}`);

      if (updatedImage) {
        const { error: updateError } = await supabase
          .from("products")
          .update({ image: updatedImage })
          .eq("id", product.id);

        if (updateError) {
          console.error(`  Error updating product ${product.title}:`, updateError.message);
        } else {
          console.log(`  ✓ Updated database field for product ${product.title}`);
          count++;
        }
      }
    }
  }
  console.log(`Products updated: ${count}`);
}

async function migrateEvents() {
  console.log("\n--- Migrating Event Images ---");
  const { data: events, error } = await supabase.from("events").select("id, name, slug, image");
  if (error) {
    console.error("Error fetching events:", error.message);
    return;
  }

  let count = 0;
  for (const event of events) {
    if (isCloudinaryUrl(event.image)) {
      const filename = getFilenameAndExt(event.image);
      const updatedImage = await migrateImage(event.image, `events/${event.slug}-event-${filename}`);

      if (updatedImage) {
        const { error: updateError } = await supabase
          .from("events")
          .update({ image: updatedImage })
          .eq("id", event.id);

        if (updateError) {
          console.error(`  Error updating event ${event.name}:`, updateError.message);
        } else {
          console.log(`  ✓ Updated database field for event ${event.name}`);
          count++;
        }
      }
    }
  }
  console.log(`Events updated: ${count}`);
}

async function migrateBlogs() {
  console.log("\n--- Migrating Blog Images ---");
  const { data: blogs, error } = await supabase.from("blogs").select("id, title, slug, image");
  if (error) {
    console.error("Error fetching blogs:", error.message);
    return;
  }

  let count = 0;
  for (const blog of blogs) {
    if (isCloudinaryUrl(blog.image)) {
      const filename = getFilenameAndExt(blog.image);
      const updatedImage = await migrateImage(blog.image, `blogs/${blog.slug}-blog-${filename}`);

      if (updatedImage) {
        const { error: updateError } = await supabase
          .from("blogs")
          .update({ image: updatedImage })
          .eq("id", blog.id);

        if (updateError) {
          console.error(`  Error updating blog ${blog.title}:`, updateError.message);
        } else {
          console.log(`  ✓ Updated database field for blog ${blog.title}`);
          count++;
        }
      }
    }
  }
  console.log(`Blogs updated: ${count}`);
}

async function migrateSettings() {
  console.log("\n--- Migrating Settings Banners/Slides ---");
  const { data: settingsRow, error } = await supabase
    .from("settings")
    .select("id, data")
    .eq("id", 1)
    .single();

  if (error) {
    console.error("Error fetching settings:", error.message);
    return;
  }

  const settings = settingsRow.data || {};
  let modified = false;

  // 1. Middle Banner
  const middleBanner = settings.homepage?.hero?.middleBanner;
  if (middleBanner && isCloudinaryUrl(middleBanner.imageUrl)) {
    const filename = getFilenameAndExt(middleBanner.imageUrl);
    const updatedUrl = await migrateImage(middleBanner.imageUrl, `settings/middle-banner-${filename}`);
    if (updatedUrl) {
      settings.homepage.hero.middleBanner.imageUrl = updatedUrl;
      modified = true;
    }
  }

  // 2. Bottom Banner
  const bottomBanner = settings.homepage?.hero?.bottomBanner;
  if (bottomBanner && isCloudinaryUrl(bottomBanner.imageUrl)) {
    const filename = getFilenameAndExt(bottomBanner.imageUrl);
    const updatedUrl = await migrateImage(bottomBanner.imageUrl, `settings/bottom-banner-${filename}`);
    if (updatedUrl) {
      settings.homepage.hero.bottomBanner.imageUrl = updatedUrl;
      modified = true;
    }
  }

  // 3. Slides
  const slides = settings.homepage?.hero?.slides || [];
  for (const slide of slides) {
    if (slide && isCloudinaryUrl(slide.image)) {
      const filename = getFilenameAndExt(slide.image);
      const updatedUrl = await migrateImage(slide.image, `settings/slides/${slide.id}-${filename}`);
      if (updatedUrl) {
        slide.image = updatedUrl;
        modified = true;
      }
    }
  }

  if (modified) {
    const { error: updateError } = await supabase
      .from("settings")
      .update({ data: settings })
      .eq("id", 1);

    if (updateError) {
      console.error("Error updating settings database:", updateError.message);
    } else {
      console.log("  ✓ Updated database fields for settings banners/slides");
    }
  } else {
    console.log("No Cloudinary images found in settings.");
  }
}

async function main() {
  console.log("====================================================");
  console.log("Starting Image Migration: Cloudinary -> Supabase");
  console.log("====================================================");
  
  await ensureBucketExists();
  await migrateStores();
  await migrateProducts();
  await migrateEvents();
  await migrateBlogs();
  await migrateSettings();

  console.log("\n====================================================");
  console.log("Migration Script Completed.");
  console.log("====================================================");
}

main().catch((err) => {
  console.error("Migration script crashed:", err);
  process.exit(1);
});

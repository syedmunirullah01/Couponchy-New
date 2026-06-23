import "server-only";
import { supabase } from "@/lib/supabase";
import { normalizeCountryCode } from "@/lib/countries";

// ─── Serializer ───────────────────────────────────────────────────────────────
function serializeStore(row) {
  if (!row) return null;
  return {
    id:                       row.id,
    name:                     row.name,
    slug:                     row.slug,
    category:                 row.category,
    categorySlug:             row.category_slug || "",
    countryCode:              normalizeCountryCode(row.country_code || "US"),
    logoImage:                row.logo_image || "",
    logoText:                 row.logo_text || row.name || "",
    affiliateLink:            row.affiliate_link || "",
    logoClassName:            row.logo_class_name || "border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text)] text-[12px] font-black",
    description:              row.description || "",
    contentIntroTitle:        row.content_intro_title || "",
    contentIntroParagraph1:   row.content_intro_paragraph1 || "",
    contentIntroParagraph2:   row.content_intro_paragraph2 || "",
    contentWhyItemsText:      row.content_why_items_text || "",
    contentOutro:             row.content_outro || "",
    faq1Question:             row.faq1_question || "",
    faq1Answer:               row.faq1_answer || "",
    faq2Question:             row.faq2_question || "",
    faq2Answer:               row.faq2_answer || "",
    faq3Question:             row.faq3_question || "",
    faq3Answer:               row.faq3_answer || "",
    trustStatus:              row.trust_status || "Active",
    isFeatured:               Boolean(row.is_featured),
    heroImage:                row.hero_image || "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=900&q=80",
    rating:                   row.rating || "4.7 (0 reviews)",
    offersCount:              Number(row.offers_count ?? 0),
    createdAt:                row.created_at || new Date().toISOString(),
    updatedAt:                row.updated_at || new Date().toISOString(),
  };
}

// ─── Payload builder (camelCase → snake_case for Supabase) ───────────────────
function buildInsertPayload(input) {
  const now = new Date().toISOString();
  const slug = input.slug.trim().toLowerCase();
  const category = input.category.trim();
  const categorySlug =
    input.categorySlug?.trim().toLowerCase() ||
    category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  return {
    name:                     input.name.trim(),
    slug,
    category,
    category_slug:            categorySlug,
    country_code:             normalizeCountryCode(input.countryCode || "US"),
    logo_image:               input.logoImage?.trim() || "",
    logo_text:                input.logoText?.trim() || input.name.trim(),
    affiliate_link:           input.affiliateLink?.trim() || "",
    logo_class_name:          input.logoClassName?.trim() || "border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text)] text-[12px] font-black",
    description:              input.description?.trim() || `${input.name.trim()} deals and coupons updated by Couponchy.`,
    content_intro_title:      input.contentIntroTitle?.trim() || "",
    content_intro_paragraph1: input.contentIntroParagraph1?.trim() || "",
    content_intro_paragraph2: input.contentIntroParagraph2?.trim() || "",
    content_why_items_text:   input.contentWhyItemsText?.trim() || "",
    content_outro:            input.contentOutro?.trim() || "",
    faq1_question:            input.faq1Question?.trim() || "",
    faq1_answer:              input.faq1Answer?.trim() || "",
    faq2_question:            input.faq2Question?.trim() || "",
    faq2_answer:              input.faq2Answer?.trim() || "",
    faq3_question:            input.faq3Question?.trim() || "",
    faq3_answer:              input.faq3Answer?.trim() || "",
    trust_status:             input.trustStatus?.trim() || "Active",
    is_featured:              Boolean(input.isFeatured),
    hero_image:               input.heroImage?.trim() || "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=900&q=80",
    rating:                   input.rating?.trim() || "4.7 (0 reviews)",
    offers_count:             Number(input.offersCount ?? 0),
    updated_at:               now,
  };
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getAllStores() {
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`getAllStores failed: ${error.message}`);
  return (data || []).map(serializeStore);
}

export async function getStoreBySlug(slug) {
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // not found
    throw new Error(`getStoreBySlug failed: ${error.message}`);
  }
  return serializeStore(data);
}

export async function createStore(payload) {
  const existing = await getStoreBySlug(payload.slug?.trim().toLowerCase());
  if (existing) throw new Error("A store with this slug already exists.");

  const { data, error } = await supabase
    .from("stores")
    .insert(buildInsertPayload(payload))
    .select()
    .single();

  if (error) throw new Error(`createStore failed: ${error.message}`);
  return serializeStore(data);
}

export async function createStoresBulk(payloads) {
  const rows = payloads.map(buildInsertPayload);
  const { data, error } = await supabase
    .from("stores")
    .insert(rows)
    .select();

  if (error) throw new Error(`createStoresBulk failed: ${error.message}`);
  return (data || []).map(serializeStore);
}

export async function updateStore(slug, payload) {
  const current = await getStoreBySlug(slug);
  if (!current) return null;

  const updatePayload = buildInsertPayload({ ...current, ...payload });

  // Check new slug isn't taken by another store
  if (updatePayload.slug !== slug) {
    const conflict = await getStoreBySlug(updatePayload.slug);
    if (conflict) throw new Error("Another store already uses this slug.");
  }

  const { data, error } = await supabase
    .from("stores")
    .update(updatePayload)
    .eq("slug", slug)
    .select()
    .single();

  if (error) throw new Error(`updateStore failed: ${error.message}`);
  return serializeStore(data);
}

export async function deleteStore(slug) {
  const { error, count } = await supabase
    .from("stores")
    .delete({ count: "exact" })
    .eq("slug", slug);

  if (error) throw new Error(`deleteStore failed: ${error.message}`);
  return count > 0;
}

export async function syncStoreOfferCount(slug, offersCount) {
  const { data, error } = await supabase
    .from("stores")
    .update({ offers_count: offersCount, updated_at: new Date().toISOString() })
    .eq("slug", slug)
    .select()
    .single();

  if (error) throw new Error(`syncStoreOfferCount failed: ${error.message}`);
  return serializeStore(data);
}

export async function syncStoresForCategoryChange({ previousName, previousSlug, nextName, nextSlug }) {
  const { error } = await supabase
    .from("stores")
    .update({ category: nextName, category_slug: nextSlug, updated_at: new Date().toISOString() })
    .or(`category_slug.eq.${previousSlug},category.eq.${previousName}`);

  if (error) throw new Error(`syncStoresForCategoryChange failed: ${error.message}`);
}

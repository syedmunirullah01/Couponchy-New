import "server-only";
import { supabase } from "@/lib/supabase";

// ─── Serializer ───────────────────────────────────────────────────────────────
function serializeOffer(row) {
  if (!row) return null;
  const rawType = row.type || "Coupon";
  const code = row.code || "";
  const type = (rawType === "Coupon" && (!code || code.trim() === "")) ? "Deal" : rawType;
  return {
    id:               row.id,
    title:            row.title,
    description:      row.description || "Fresh offer imported into Couponchy.",
    type,
    storeSlug:        row.store_slug,
    storeName:        row.store_name,
    source:           row.source || "Manual",
    expiryDate:       row.expiry_date || "",
    status:           row.status || "Active",
    code,
    affiliateLink:    row.affiliate_link || "",
    ctaLabel:         row.cta_label || (type === "Deal" ? "Get Deal" : "Get Coupon"),
    // Scraper fields
    validatedAt:      row.validated_at || null,
    validationStatus: row.validation_status || "unchecked",
    scrapedAt:        row.scraped_at || null,
    sourceUrl:        row.source_url || "",
    isSitewide:       row.is_sitewide || false,
    isExclusive:      row.is_exclusive || false,
    isFeatured:       row.is_featured || false,
    // Community feedback fields
    successCount:     row.success_count || 0,
    failureCount:     row.failure_count || 0,
    successRate:      row.success_rate || 0,
    lastWorkedAt:     row.last_worked_at || null,
    lastFailedAt:     row.last_failed_at || null,
    lastVerifiedAt:   row.last_verified_at || null,
    storeVerified:    row.store_verified || false,
    checkoutVerified: row.checkout_verified || false,
    createdAt:        row.created_at || new Date().toISOString(),
    updatedAt:        row.updated_at || new Date().toISOString(),
  };
}

// ─── Payload builder ─────────────────────────────────────────────────────────
function buildInsertPayload(input) {
  const storeSlug = input.storeSlug.trim().toLowerCase();
  const type = input.type?.trim() || "Coupon";
  return {
    title:             input.title.trim(),
    description:       input.description?.trim() || "Fresh offer imported into Couponchy.",
    type,
    store_slug:        storeSlug,
    store_name:        input.storeName.trim(),
    source:            input.source?.trim() || "Manual",
    expiry_date:       input.expiryDate || "",
    status:            input.status?.trim() || "Active",
    code:              input.code?.trim() || "",
    affiliate_link:    input.affiliateLink?.trim() || "",
    cta_label:         input.ctaLabel?.trim() || (type === "Deal" ? "Get Deal" : "Get Code"),
    is_sitewide:       input.isSitewide || false,
    is_exclusive:      input.isExclusive || false,
    is_featured:       input.isFeatured || false,
    source_url:        input.sourceUrl?.trim() || "",
    updated_at:        new Date().toISOString(),
  };
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getAllOffers() {
  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`getAllOffers failed: ${error.message}`);
  return (data || []).map(serializeOffer);
}

export async function getOfferById(id) {
  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`getOfferById failed: ${error.message}`);
  }
  return serializeOffer(data);
}

export async function getOffersByStoreSlug(storeSlug) {
  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .eq("store_slug", storeSlug)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`getOffersByStoreSlug failed: ${error.message}`);
  return (data || []).map(serializeOffer);
}

export async function createOffer(payload) {
  const { data, error } = await supabase
    .from("offers")
    .insert(buildInsertPayload(payload))
    .select()
    .single();

  if (error) throw new Error(`createOffer failed: ${error.message}`);
  return serializeOffer(data);
}

export async function createOffersBulk(payloads) {
  const rows = payloads.map(buildInsertPayload);
  const { data, error } = await supabase
    .from("offers")
    .insert(rows)
    .select();

  if (error) throw new Error(`createOffersBulk failed: ${error.message}`);
  return (data || []).map(serializeOffer);
}

export async function updateOffer(id, payload) {
  const current = await getOfferById(id);
  if (!current) return null;

  const merged = buildInsertPayload({ ...current, ...payload });

  const { data, error } = await supabase
    .from("offers")
    .update(merged)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`updateOffer failed: ${error.message}`);
  return serializeOffer(data);
}

export async function deleteOffer(id) {
  const { error, count } = await supabase
    .from("offers")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) throw new Error(`deleteOffer failed: ${error.message}`);
  return count > 0;
}

export async function deleteOffersByStoreSlug(storeSlug) {
  const { error } = await supabase
    .from("offers")
    .delete()
    .eq("store_slug", storeSlug);

  if (error) throw new Error(`deleteOffersByStoreSlug failed: ${error.message}`);
  return true;
}

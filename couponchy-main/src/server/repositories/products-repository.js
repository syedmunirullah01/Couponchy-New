import "server-only";
import { supabase } from "@/lib/supabase";

// ─── Serializer ───────────────────────────────────────────────────────────────
function serializeProduct(row) {
  if (!row) return null;
  return {
    id:            row.id,
    title:         row.title,
    slug:          row.slug || "",
    description:   row.description || "",
    image:         row.image || "",
    price:         row.price || "",
    originalPrice: row.original_price || "",
    ctaLabel:      row.cta_label || "Shop Now",
    productUrl:    row.product_url || "",
    storeSlug:     row.store_slug || "",
    storeName:     row.store_name || "",
    status:        row.status || "Active",
    createdAt:     row.created_at || new Date().toISOString(),
    updatedAt:     row.updated_at || new Date().toISOString(),
  };
}

function slugifyProduct(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getAllProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`getAllProducts failed: ${error.message}`);
  return (data || []).map(serializeProduct);
}

export async function getProductById(id) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`getProductById failed: ${error.message}`);
  }
  return serializeProduct(data);
}

export async function getProductsByStoreSlug(storeSlug) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("store_slug", storeSlug)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`getProductsByStoreSlug failed: ${error.message}`);
  return (data || []).map(serializeProduct);
}

export async function getProductByStoreAndSlug(storeSlug, productSlug) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("store_slug", storeSlug)
    .eq("slug", productSlug)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`getProductByStoreAndSlug failed: ${error.message}`);
  }
  return serializeProduct(data);
}

export async function createProduct(payload) {
  const title = payload.title.trim();
  const slug = payload.slug?.trim() ? slugifyProduct(payload.slug) : slugifyProduct(title);

  const { data, error } = await supabase
    .from("products")
    .insert({
      title,
      slug,
      description:    payload.description?.trim() || "",
      image:          payload.image?.trim() || "",
      price:          payload.price?.trim() || "",
      original_price: payload.originalPrice?.trim() || "",
      cta_label:      payload.ctaLabel?.trim() || "Shop Now",
      product_url:    payload.productUrl?.trim() || "",
      store_slug:     payload.storeSlug?.trim().toLowerCase() || "",
      store_name:     payload.storeName?.trim() || "",
      status:         payload.status?.trim() || "Active",
      updated_at:     new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(`createProduct failed: ${error.message}`);
  return serializeProduct(data);
}

export async function updateProduct(id, payload) {
  const current = await getProductById(id);
  if (!current) return null;

  const { data, error } = await supabase
    .from("products")
    .update({
      title:          payload.title?.trim() || current.title,
      slug:           payload.slug?.trim() ? slugifyProduct(payload.slug) : current.slug,
      description:    payload.description?.trim() ?? current.description,
      image:          payload.image?.trim() ?? current.image,
      price:          payload.price?.trim() ?? current.price,
      original_price: payload.originalPrice?.trim() ?? current.originalPrice,
      cta_label:      payload.ctaLabel?.trim() ?? current.ctaLabel,
      product_url:    payload.productUrl?.trim() ?? current.productUrl,
      store_slug:     payload.storeSlug?.trim().toLowerCase() ?? current.storeSlug,
      store_name:     payload.storeName?.trim() ?? current.storeName,
      status:         payload.status?.trim() ?? current.status,
      updated_at:     new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`updateProduct failed: ${error.message}`);
  return serializeProduct(data);
}

export async function deleteProduct(id) {
  const { error, count } = await supabase
    .from("products")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) throw new Error(`deleteProduct failed: ${error.message}`);
  return count > 0;
}

import "server-only";
import { supabase } from "@/lib/supabase";

// ─── Serializer ───────────────────────────────────────────────────────────────
function serializeCategory(row) {
  if (!row) return null;
  return {
    id:          row.id,
    name:        row.name,
    slug:        row.slug,
    description: row.description || "",
    createdAt:   row.created_at || new Date().toISOString(),
    updatedAt:   row.updated_at || new Date().toISOString(),
  };
}

function slugifyCategory(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getAllCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw new Error(`getAllCategories failed: ${error.message}`);
  return (data || []).map(serializeCategory);
}

export async function getCategoryBySlug(slug) {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`getCategoryBySlug failed: ${error.message}`);
  }
  return serializeCategory(data);
}

export async function createCategory(payload) {
  const name = payload.name.trim();
  const slug = payload.slug?.trim() ? slugifyCategory(payload.slug) : slugifyCategory(name);

  const existing = await getCategoryBySlug(slug);
  if (existing) throw new Error("A category with this slug already exists.");

  const { data, error } = await supabase
    .from("categories")
    .insert({ name, slug, description: payload.description?.trim() || "", updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) throw new Error(`createCategory failed: ${error.message}`);
  return serializeCategory(data);
}

export async function updateCategory(slug, payload) {
  const current = await getCategoryBySlug(slug);
  if (!current) return null;

  const newName = payload.name?.trim() || current.name;
  const newSlug = payload.slug?.trim() ? slugifyCategory(payload.slug) : slugifyCategory(newName);

  if (newSlug !== slug) {
    const conflict = await getCategoryBySlug(newSlug);
    if (conflict) throw new Error("Another category already uses this slug.");
  }

  const { data, error } = await supabase
    .from("categories")
    .update({ name: newName, slug: newSlug, description: payload.description?.trim() ?? current.description, updated_at: new Date().toISOString() })
    .eq("slug", slug)
    .select()
    .single();

  if (error) throw new Error(`updateCategory failed: ${error.message}`);

  // If name/slug changed, sync stores
  if (current.name !== newName || slug !== newSlug) {
    const { syncStoresForCategoryChange } = await import("@/server/repositories/stores-repository");
    await syncStoresForCategoryChange({ previousName: current.name, previousSlug: slug, nextName: newName, nextSlug: newSlug });
  }

  return serializeCategory(data);
}

export async function deleteCategory(slug) {
  const category = await getCategoryBySlug(slug);
  if (!category) return { deleted: false, linkedStores: 0 };

  // Check for linked stores
  const { count } = await supabase
    .from("stores")
    .select("id", { count: "exact", head: true })
    .or(`category_slug.eq.${slug},category.eq.${category.name}`);

  if (count > 0) throw new Error(`Cannot delete category with ${count} linked store${count === 1 ? "" : "s"}.`);

  const { error } = await supabase.from("categories").delete().eq("slug", slug);
  if (error) throw new Error(`deleteCategory failed: ${error.message}`);

  return { deleted: true, linkedStores: 0 };
}

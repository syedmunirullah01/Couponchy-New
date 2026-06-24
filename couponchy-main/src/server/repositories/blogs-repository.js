import "server-only";
import { supabase } from "@/lib/supabase";

// ─── Serializer ───────────────────────────────────────────────────────────────
function serializeBlog(row) {
  if (!row) return null;
  return {
    id:           row.id,
    slug:         row.slug,
    title:        row.title,
    excerpt:      row.excerpt || "",
    content:      row.content || "",
    image:        row.image || "",
    category:     row.category,
    readTime:     row.read_time || "5 min read",
    isFeatured:   Boolean(row.is_featured),
    authorName:   row.author_name || "Couponchy Team",
    authorRole:   row.author_role || "Savings Experts",
    authorAvatar: row.author_avatar || "C",
    authorBio:    row.author_bio || "",
    createdAt:    row.created_at || new Date().toISOString(),
    updatedAt:    row.updated_at || new Date().toISOString(),
  };
}

// ─── Payload builder (camelCase → snake_case for Supabase) ───────────────────
function buildInsertPayload(input) {
  const now = new Date().toISOString();
  const slug = input.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  return {
    slug,
    title:         input.title.trim(),
    excerpt:       input.excerpt?.trim() || "",
    content:       input.content?.trim() || "",
    image:         input.image?.trim() || "",
    category:      input.category.trim(),
    read_time:     input.readTime?.trim() || "5 min read",
    is_featured:   Boolean(input.isFeatured),
    author_name:   input.authorName?.trim() || "Couponchy Team",
    author_role:   input.authorRole?.trim() || "Savings Experts",
    author_avatar: input.authorAvatar?.trim() || "C",
    author_bio:    input.authorBio?.trim() || "The Couponchy Team is dedicated to automated coupon verification, checkout optimizations, and sharing the best savings strategies to help you get the lowest price.",
    updated_at:    now,
  };
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getAllBlogs() {
  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`getAllBlogs failed: ${error.message}`);
  return (data || []).map(serializeBlog);
}

export async function getBlogById(id) {
  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`getBlogById failed: ${error.message}`);
  }
  return serializeBlog(data);
}

export async function getBlogBySlug(slug) {
  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("slug", slug.trim().toLowerCase())
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`getBlogBySlug failed: ${error.message}`);
  }
  return serializeBlog(data);
}

export async function createBlog(payload) {
  const cleanSlug = payload.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const existing = await getBlogBySlug(cleanSlug);
  if (existing) throw new Error("A blog post with this slug already exists.");

  const { data, error } = await supabase
    .from("blogs")
    .insert(buildInsertPayload(payload))
    .select()
    .single();

  if (error) throw new Error(`createBlog failed: ${error.message}`);
  return serializeBlog(data);
}

export async function updateBlog(id, payload) {
  const current = await getBlogById(id);
  if (!current) return null;

  const updatePayload = buildInsertPayload({ ...current, ...payload });

  // Check if new slug conflicts with another post
  if (updatePayload.slug !== current.slug) {
    const conflict = await getBlogBySlug(updatePayload.slug);
    if (conflict) throw new Error("Another blog post already uses this slug.");
  }

  const { data, error } = await supabase
    .from("blogs")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`updateBlog failed: ${error.message}`);
  return serializeBlog(data);
}

export async function deleteBlog(id) {
  const { error, count } = await supabase
    .from("blogs")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) throw new Error(`deleteBlog failed: ${error.message}`);
  return count > 0;
}

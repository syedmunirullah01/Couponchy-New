import "server-only";
import { supabase } from "@/lib/supabase";

// ─── Serializer ───────────────────────────────────────────────────────────────
function serializeEvent(row) {
  if (!row) return null;
  return {
    id:          row.id,
    name:        row.name,
    slug:        row.slug,
    description: row.description || "",
    startDate:   row.start_date || "",
    endDate:     row.end_date || "",
    isActive:    Boolean(row.is_active),
    image:       row.image || "",
    createdAt:   row.created_at || new Date().toISOString(),
    updatedAt:   row.updated_at || new Date().toISOString(),
  };
}

function slugifyEvent(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getAllEvents() {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`getAllEvents failed: ${error.message}`);
  return (data || []).map(serializeEvent);
}

export async function getEventBySlug(slug) {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`getEventBySlug failed: ${error.message}`);
  }
  return serializeEvent(data);
}

export async function getActiveEvents() {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`getActiveEvents failed: ${error.message}`);
  return (data || []).map(serializeEvent);
}

export async function createEvent(payload) {
  const name = payload.name.trim();
  const slug = payload.slug?.trim() ? slugifyEvent(payload.slug) : slugifyEvent(name);

  const existing = await getEventBySlug(slug);
  if (existing) throw new Error("An event with this slug already exists.");

  const { data, error } = await supabase
    .from("events")
    .insert({
      name,
      slug,
      description: payload.description?.trim() || "",
      start_date:  payload.startDate || "",
      end_date:    payload.endDate || "",
      is_active:   payload.isActive !== false,
      image:       payload.image?.trim() || "",
      updated_at:  new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(`createEvent failed: ${error.message}`);
  return serializeEvent(data);
}

export async function updateEvent(slug, payload) {
  const current = await getEventBySlug(slug);
  if (!current) return null;

  const { data, error } = await supabase
    .from("events")
    .update({
      name:        payload.name?.trim() || current.name,
      slug:        payload.slug?.trim() ? slugifyEvent(payload.slug) : slug,
      description: payload.description?.trim() ?? current.description,
      start_date:  payload.startDate ?? current.startDate,
      end_date:    payload.endDate ?? current.endDate,
      is_active:   payload.isActive ?? current.isActive,
      image:       payload.image?.trim() ?? current.image,
      updated_at:  new Date().toISOString(),
    })
    .eq("slug", slug)
    .select()
    .single();

  if (error) throw new Error(`updateEvent failed: ${error.message}`);
  return serializeEvent(data);
}

export async function deleteEvent(slug) {
  const { error, count } = await supabase
    .from("events")
    .delete({ count: "exact" })
    .eq("slug", slug);

  if (error) throw new Error(`deleteEvent failed: ${error.message}`);
  return count > 0;
}

export async function getEnabledEvents() {
  return getActiveEvents();
}

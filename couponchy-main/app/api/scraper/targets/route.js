import { NextResponse } from "next/server";
import { requirePermission } from "@/server/auth";
import { supabase } from "@/lib/supabase";
import { getDiscoverySources, normalizeStoreDomain } from "@/server/services/discovery-sources";

/**
 * Determines the merchant's own official target URL for a store.
 * Checks for a direct, non-redirecting affiliate link first.
 * Otherwise, resolves from the store slug.
 *
 * @param {object} store - Store database record
 * @returns {string} Official store URL
 */
export function determineTargetUrl(store) {
  if (store.affiliate_link && store.affiliate_link.trim() !== "") {
    const link = store.affiliate_link.trim();
    const isRedirect =
      link.includes("click.") ||
      link.includes("awin.") ||
      link.includes("shareasale.") ||
      link.includes("cj.com") ||
      link.includes("linksynergy") ||
      link.includes("anrdoezrs.net");
    if (!isRedirect) {
      return link;
    }
  }

  const { domain } = normalizeStoreDomain(store.slug, store.affiliate_link || "");
  return `https://www.${domain}`;
}

/**
 * GET /api/scraper/targets
 * Returns all scraper targets dynamically resolved from active stores,
 * including both official merchant pages and all multi-source aggregator URLs.
 */
export async function GET(request) {
  const access = await requirePermission("scraper");
  if (access.error) return access.error;

  const { data: stores, error } = await supabase
    .from("stores")
    .select("id, name, slug, affiliate_link, updated_at")
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const targets = [];

  for (const store of stores || []) {
    // Official merchant page (priority 1)
    targets.push({
      id: store.id,
      store_slug: store.slug,
      store_name: store.name,
      target_url: determineTargetUrl(store),
      source_name: "Official Store Page",
      source_priority: 1,
      is_official: true,
      is_enabled: true,
      use_ai: true,
      last_scraped_at: store.updated_at,
    });

    // Multi-source aggregator pages (priority 2 & 3)
    const discoverySources = getDiscoverySources(
      store.slug,
      store.name,
      store.affiliate_link || ""
    );

    for (const source of discoverySources) {
      targets.push({
        id: store.id,
        store_slug: store.slug,
        store_name: store.name,
        target_url: source.sourceUrl,
        source_name: source.sourceName,
        source_priority: source.sourcePriority,
        is_official: false,
        is_enabled: true,
        use_ai: true,
        last_scraped_at: store.updated_at,
      });
    }
  }

  return NextResponse.json({ data: targets });
}

/**
 * POST /api/scraper/targets
 * Deprecated. Scraper targets are now automatically synced from stores table.
 */
export async function POST(request) {
  const access = await requirePermission("scraper");
  if (access.error) return access.error;

  return NextResponse.json(
    {
      error:
        "Manual target creation is deprecated. Scraper targets are loaded automatically from the stores database. Please manage stores at /admin/stores instead.",
    },
    { status: 400 }
  );
}

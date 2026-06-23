import { supabase } from '../config/supabase.js';
import { normalizeStoreDomain, getDiscoverySources } from '../scraper/sources.js';

/**
 * Determines the merchant's own official target URL for a store.
 * Priority: direct affiliate link → merchant homepage derived from slug.
 *
 * @param {object} store - Store database record
 * @returns {string|null} Official store URL or null
 */
export function determineOfficialUrl(store) {
  if (store.affiliate_link && store.affiliate_link.trim() !== '') {
    const link = store.affiliate_link.trim();
    const isRedirect =
      link.includes('click.') ||
      link.includes('awin.') ||
      link.includes('shareasale.') ||
      link.includes('cj.com') ||
      link.includes('linksynergy') ||
      link.includes('anrdoezrs.net');
    if (!isRedirect) {
      return link;
    }
  }

  const { domain } = normalizeStoreDomain(store.slug, store.affiliate_link);
  return `https://www.${domain}`;
}

/**
 * Deprecated alias — kept for backwards compatibility with any code that calls
 * determineTargetUrl(). Now returns the official merchant URL directly.
 *
 * @param {object} store - Store database record
 * @returns {string} Target URL for the store
 */
export function determineTargetUrl(store) {
  return determineOfficialUrl(store);
}

/**
 * Loads all active stores from Supabase and resolves them into a flat list
 * of scraper targets. Each target includes:
 *   - target_url: The specific page to scrape for this source entry
 *   - source_name: Human-readable name of the discovery source
 *   - source_priority: 1 = official, 2 = major aggregator, 3 = community
 *   - is_official: true only for the merchant's own page
 *
 * For each store we generate:
 *   - 1 entry for the merchant's official page (priority 1)
 *   - N entries for competitor aggregator sources (priority 2 & 3)
 *
 * @returns {Promise<Array>} Flat list of resolved scraper target objects
 */
export async function loadTargets() {
  try {
    const { data: stores, error } = await supabase
      .from('stores')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('[Targets Loader] Error loading stores from Supabase:', error.message);
      return [];
    }

    if (!stores || stores.length === 0) {
      console.log('[Targets Loader] No stores found in the database.');
      return [];
    }

    const targets = [];

    for (const store of stores) {
      // Priority 1 — Merchant's own official page
      const officialUrl = determineOfficialUrl(store);
      targets.push({
        id: store.id,
        store_slug: store.slug,
        store_name: store.name,
        affiliate_link: store.affiliate_link || '',
        target_url: officialUrl,
        source_name: 'Official Store Page',
        source_priority: 1,
        is_official: true,
        is_enabled: true,
        use_ai: true,
        last_scraped_at: store.updated_at,
      });

      // Priority 2 & 3 — Multi-source aggregator discovery entries
      const discoverySources = getDiscoverySources(
        store.slug,
        store.name,
        store.affiliate_link || ''
      );

      for (const source of discoverySources) {
        targets.push({
          id: store.id,
          store_slug: store.slug,
          store_name: store.name,
          affiliate_link: store.affiliate_link || '',
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

    const officialCount = targets.filter(t => t.is_official).length;
    const aggregatorCount = targets.filter(t => !t.is_official).length;
    console.log(
      `[Targets Loader] Resolved ${targets.length} total targets across ${stores.length} stores ` +
      `(${officialCount} official + ${aggregatorCount} aggregator sources).`
    );

    return targets;
  } catch (error) {
    console.error('[Targets Loader] Unexpected error in loader:', error.message);
    return [];
  }
}

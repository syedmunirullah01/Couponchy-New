/**
 * Product URL Cache
 *
 * Stores a discovered product page URL per store so that the checkout
 * validator can jump straight to the product page without navigating from
 * the store homepage each time.
 *
 * Configuration (env vars):
 *   PRODUCT_CACHE_TTL_HOURS — cache entry lifetime in hours (default: 6)
 */

const TTL_MS = parseInt(process.env.PRODUCT_CACHE_TTL_HOURS || '6', 10) * 60 * 60 * 1000;

/**
 * @type {Map<string, { productUrl: string, cachedAt: number }>}
 */
const cache = new Map();

/**
 * Returns a cached product URL for the given store slug, or null if the entry
 * is absent or has expired.
 *
 * @param {string} storeSlug
 * @returns {string | null}
 */
export function getCachedProductUrl(storeSlug) {
  const entry = cache.get(storeSlug);
  if (!entry) return null;

  const age = Date.now() - entry.cachedAt;
  if (age > TTL_MS) {
    cache.delete(storeSlug);
    console.log(`[ProductCache] Entry for "${storeSlug}" expired after ${Math.round(age / 60000)}min.`);
    return null;
  }

  console.log(`[ProductCache] Cache HIT for "${storeSlug}" — using ${entry.productUrl}`);
  return entry.productUrl;
}

/**
 * Stores a product URL for the given store slug.
 *
 * @param {string} storeSlug
 * @param {string} productUrl
 */
export function setCachedProductUrl(storeSlug, productUrl) {
  cache.set(storeSlug, { productUrl, cachedAt: Date.now() });
  console.log(`[ProductCache] Cached product URL for "${storeSlug}": ${productUrl}`);
}

/**
 * Removes all expired entries. Can be called periodically to free memory.
 *
 * @returns {number} Number of entries pruned
 */
export function pruneProductCache() {
  const now = Date.now();
  let pruned = 0;
  for (const [slug, entry] of cache) {
    if (now - entry.cachedAt > TTL_MS) {
      cache.delete(slug);
      pruned++;
    }
  }
  if (pruned > 0) {
    console.log(`[ProductCache] Pruned ${pruned} expired entries. Remaining: ${cache.size}`);
  }
  return pruned;
}

/**
 * Returns cache statistics (useful for metrics / health endpoint).
 *
 * @returns {{ size: number, ttlHours: number }}
 */
export function getProductCacheStats() {
  return { size: cache.size, ttlHours: TTL_MS / 3600000 };
}

/**
 * Multi-Source Coupon Discovery — Source Definitions
 *
 * Defines URL patterns for 10 major coupon aggregator platforms.
 * These are used for DISCOVERY only. The merchant's official website
 * and our validation pipeline remain the final authority on whether
 * a coupon appears on the frontend.
 *
 * Source priority levels (lower = higher priority):
 *   1 — Merchant official page (primary)
 *   2 — Major established aggregators (RetailMeNot, CouponFollow, etc.)
 *   3 — Community/deal forums (Slickdeals, Dealspotr)
 */

/**
 * Normalizes a store slug into a clean domain for use in aggregator URLs.
 * Strips generic suffixes and fixes known misspellings.
 *
 * @param {string} slug - Store slug from the database
 * @param {string} affiliateLink - Store affiliate link (optional)
 * @returns {{ domain: string, baseDomain: string }} Normalized domain info
 */
export function normalizeStoreDomain(slug, affiliateLink = '') {
  // Try to extract a clean hostname from a non-redirect affiliate link
  if (affiliateLink && affiliateLink.trim()) {
    const link = affiliateLink.trim();
    const isRedirect =
      link.includes('click.') ||
      link.includes('awin.') ||
      link.includes('shareasale.') ||
      link.includes('cj.com') ||
      link.includes('linksynergy') ||
      link.includes('anrdoezrs.net');

    if (!isRedirect) {
      try {
        const url = new URL(link.startsWith('http') ? link : `https://${link}`);
        const hostname = url.hostname.replace(/^www\./, '');
        if (hostname && hostname.includes('.')) {
          return { domain: hostname, baseDomain: hostname.split('.')[0] };
        }
      } catch {
        // Fallback to slug-based resolution below
      }
    }
  }

  // Derive domain from slug
  let domain = slug
    .toLowerCase()
    .replace(/-store$/, '')
    .replace(/-outlet$/, '')
    .replace(/-coupons?$/, '')
    .replace(/-deals?$/, '')
    .replace(/-official$/, '')
    .trim();

  // Fix known misspellings
  const corrections = {
    addidas: 'adidas',
    addidas: 'adidas',
    niike: 'nike',
    amazom: 'amazon',
  };
  domain = corrections[domain] || domain;

  const baseDomain = domain;

  if (!domain.includes('.')) {
    domain = `${domain}.com`;
  }

  return { domain, baseDomain };
}

/**
 * Generates a list of discovery source entries for a given store.
 * Each entry represents one external aggregator page to scrape.
 *
 * Priority 1 = highest trust (official merchant pages added separately by loader).
 * Priority 2 = major aggregators.
 * Priority 3 = community/forum sources.
 *
 * @param {string} slug - Store slug
 * @param {string} storeName - Human-readable store name
 * @param {string} affiliateLink - Store affiliate link (used for domain resolution)
 * @returns {Array<{ sourceUrl: string, sourceName: string, sourcePriority: number }>}
 */
export function getDiscoverySources(slug, storeName, affiliateLink = '') {
  const { domain, baseDomain } = normalizeStoreDomain(slug, affiliateLink);

  // Each source: { sourceUrl, sourceName, sourcePriority }
  const sources = [
    // ── Priority 2: Major Established Aggregators ──────────────────────────
    {
      sourceName: 'RetailMeNot',
      sourcePriority: 2,
      sourceUrl: `https://www.retailmenot.com/view/${domain}`,
    },
    {
      sourceName: 'CouponFollow',
      sourcePriority: 2,
      sourceUrl: `https://couponfollow.com/site/${domain}`,
    },
    {
      sourceName: 'SimplyCodes',
      sourcePriority: 2,
      sourceUrl: `https://simply.codes/${baseDomain}`,
    },
    {
      sourceName: 'Coupons.com',
      sourcePriority: 2,
      sourceUrl: `https://www.coupons.com/coupon-codes/${baseDomain}/`,
    },
    {
      sourceName: 'Groupon Coupons',
      sourcePriority: 2,
      sourceUrl: `https://www.groupon.com/coupons/${baseDomain}`,
    },
    {
      sourceName: 'CouponCabin',
      sourcePriority: 2,
      sourceUrl: `https://www.couponcabin.com/coupons/${baseDomain}/`,
    },
    {
      sourceName: 'Knoji',
      sourcePriority: 2,
      sourceUrl: `https://www.knoji.com/coupons/${baseDomain}/`,
    },
    {
      sourceName: 'DontPayFull',
      sourcePriority: 2,
      sourceUrl: `https://www.dontpayfull.com/at/${domain}`,
    },
    // ── Priority 3: Community / Deal Forums ────────────────────────────────
    {
      sourceName: 'Slickdeals',
      sourcePriority: 3,
      sourceUrl: `https://slickdeals.net/coupons/${baseDomain}-promo-codes/`,
    },
    {
      sourceName: 'Dealspotr',
      sourcePriority: 3,
      sourceUrl: `https://dealspotr.com/${baseDomain}`,
    },
  ];

  return sources;
}

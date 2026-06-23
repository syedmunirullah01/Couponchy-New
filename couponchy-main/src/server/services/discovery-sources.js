/**
 * Multi-Source Coupon Discovery — Shared Source Definitions
 * (Next.js server-side version — mirrors couponchy-scraper/src/scraper/sources.js)
 *
 * Defines URL patterns for 10 major coupon aggregator platforms.
 * Used by the admin targets API to preview all source URLs per store.
 */

/**
 * Normalizes a store slug into a clean domain.
 *
 * @param {string} slug - Store slug from the database
 * @param {string} affiliateLink - Store affiliate link (optional)
 * @returns {{ domain: string, baseDomain: string }}
 */
export function normalizeStoreDomain(slug, affiliateLink = "") {
  if (affiliateLink && affiliateLink.trim()) {
    const link = affiliateLink.trim();
    const isRedirect =
      link.includes("click.") ||
      link.includes("awin.") ||
      link.includes("shareasale.") ||
      link.includes("cj.com") ||
      link.includes("linksynergy") ||
      link.includes("anrdoezrs.net");

    if (!isRedirect) {
      try {
        const url = new URL(link.startsWith("http") ? link : `https://${link}`);
        const hostname = url.hostname.replace(/^www\./, "");
        if (hostname && hostname.includes(".")) {
          return { domain: hostname, baseDomain: hostname.split(".")[0] };
        }
      } catch {
        // fallback to slug below
      }
    }
  }

  const corrections = { addidas: "adidas", niike: "nike", amazom: "amazon" };

  let domain = slug
    .toLowerCase()
    .replace(/-store$/, "")
    .replace(/-outlet$/, "")
    .replace(/-coupons?$/, "")
    .replace(/-deals?$/, "")
    .replace(/-official$/, "")
    .trim();

  domain = corrections[domain] || domain;
  const baseDomain = domain;

  if (!domain.includes(".")) {
    domain = `${domain}.com`;
  }

  return { domain, baseDomain };
}

/**
 * Returns the list of aggregator discovery source entries for a store.
 *
 * @param {string} slug - Store slug
 * @param {string} storeName - Store name
 * @param {string} affiliateLink - Store affiliate link
 * @returns {Array<{ sourceUrl: string, sourceName: string, sourcePriority: number }>}
 */
export function getDiscoverySources(slug, storeName, affiliateLink = "") {
  const { domain, baseDomain } = normalizeStoreDomain(slug, affiliateLink);

  return [
    // Priority 2 — Major established aggregators
    { sourceName: "RetailMeNot",    sourcePriority: 2, sourceUrl: `https://www.retailmenot.com/view/${domain}` },
    { sourceName: "CouponFollow",   sourcePriority: 2, sourceUrl: `https://couponfollow.com/site/${domain}` },
    { sourceName: "SimplyCodes",    sourcePriority: 2, sourceUrl: `https://simply.codes/${baseDomain}` },
    { sourceName: "Coupons.com",    sourcePriority: 2, sourceUrl: `https://www.coupons.com/coupon-codes/${baseDomain}/` },
    { sourceName: "Groupon Coupons",sourcePriority: 2, sourceUrl: `https://www.groupon.com/coupons/${baseDomain}` },
    { sourceName: "CouponCabin",    sourcePriority: 2, sourceUrl: `https://www.couponcabin.com/coupons/${baseDomain}/` },
    { sourceName: "Knoji",          sourcePriority: 2, sourceUrl: `https://www.knoji.com/coupons/${baseDomain}/` },
    { sourceName: "DontPayFull",    sourcePriority: 2, sourceUrl: `https://www.dontpayfull.com/at/${domain}` },
    // Priority 3 — Community / deal forums
    { sourceName: "Slickdeals",     sourcePriority: 3, sourceUrl: `https://slickdeals.net/coupons/${baseDomain}-promo-codes/` },
    { sourceName: "Dealspotr",      sourcePriority: 3, sourceUrl: `https://dealspotr.com/${baseDomain}` },
  ];
}

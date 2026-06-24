import "server-only";

import { getAllOffers, getOffersByStoreSlug } from "@/server/repositories/offers-repository";
import { getAllProducts, getProductByStoreAndSlug, getProductsByStoreSlug } from "@/server/repositories/products-repository";
import { getSettings } from "@/server/repositories/settings-repository";
import { getAllStores, getStoreBySlug } from "@/server/repositories/stores-repository";
import { normalizeCountryCode } from "@/lib/countries";

function buildStoreDirectoryRecord(store) {
  const label = `${store.offersCount} ${store.offersCount === 1 ? "Active Offer" : "Active Offers"}`;

  return {
    ...store,
    count: label,
  };
}

function orderItemsBySelection(items, selectedIds, getId) {
  const itemMap = new Map(items.map((item) => [getId(item), item]));
  return selectedIds.map((id) => itemMap.get(id)).filter(Boolean);
}

// ─── Offer Quality Filtering Helpers ──────────────────────────────────────────

function parseOfferDiscount(offer) {
  const source = [offer.title, offer.description, offer.code].filter(Boolean).join(" ").toLowerCase();
  
  // 1. Try to find percentage
  const percentMatch = source.match(/(\d{1,3})\s*%/);
  if (percentMatch) {
    return Number(percentMatch[1]);
  }
  
  // 2. Try to find dollar amount
  const amountMatch = source.match(/\$\s*(\d+)/);
  if (amountMatch) {
    return Number(amountMatch[1]);
  }
  
  // 3. Keywords
  if (source.includes("free shipping") || source.includes("free delivery")) {
    return 10;
  }
  if (source.includes("free") || source.includes("bogo") || source.includes("buy one get one")) {
    return 8;
  }
  
  return 0;
}

function calculateConfidenceScore(offer) {
  // Final trust score combines AI status, community report counts, and recency of use
  let score = 40; // Default for unchecked/pending

  if (offer.validationStatus === "valid") {
    score = 70;
  } else if (offer.validationStatus === "invalid") {
    score = 0;
  }

  // 1. Manual source boost
  if (offer.source === "Manual") {
    score += 10;
  }

  // 2. Unchecked validation penalty
  const uncheckedCount = Number(offer.uncheckedCount || offer.unchecked_count || 0);
  score -= uncheckedCount * 10;

  // 3. Community success rate contribution (up to 30 points)
  const rate = Number(offer.successRate || offer.success_rate || 0);
  score += Math.round(rate * 0.3);

  // 4. Positive community report volume boost (up to 10 points)
  const successCount = Number(offer.successCount || offer.success_count || 0);
  score += Math.min(successCount, 5) * 2;

  // 5. Recent successful use boost (up to 10 points)
  if (offer.lastWorkedAt) {
    const hoursSinceWorked = (Date.now() - new Date(offer.lastWorkedAt).getTime()) / (60 * 60 * 1000);
    if (hoursSinceWorked <= 24) {
      score += 10; // Worked today
    } else if (hoursSinceWorked <= 24 * 7) {
      score += 5;  // Worked recently
    }
  }

  // 6. Spam/Failure penalty
  const failureCount = Number(offer.failureCount || offer.failure_count || 0);
  score -= Math.min(failureCount * 5, 20);

  return Math.min(100, Math.max(0, score));
}

function isOfficialOffer(offer) {
  if (offer.source === "Manual") {
    return true;
  }
  if (offer.sourceUrl) {
    const url = offer.sourceUrl.toLowerCase();
    if (url.includes("retailmenot.com")) {
      return false;
    }
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return true;
    }
  }
  return false;
}

function getCouponTier(offer) {
  const isSitewide = Boolean(offer.isSitewide);
  const isOfficial = isOfficialOffer(offer);
  const isValid = offer.validationStatus === "valid";
  
  if (isSitewide && isValid) {
    return isOfficial ? 8 : 7;
  }
  if (!isSitewide && isValid) {
    return isOfficial ? 6 : 5;
  }
  if (isSitewide && !isValid) {
    return isOfficial ? 4 : 3;
  }
  // !isSitewide && !isValid
  return isOfficial ? 2 : 1;
}

function normalizeOfferTitle(offer) {
  if (offer.isSitewide && offer.type === "Coupon") {
    const discount = parseOfferDiscount(offer);
    if (discount > 0) {
      const source = [offer.title, offer.description].filter(Boolean).join(" ");
      if (source.includes("$")) {
        return `$${discount} Off Sitewide`;
      } else {
        return `${discount}% Off Sitewide`;
      }
    }
    return "Sitewide Coupon";
  }
  return offer.title;
}

function getSourcePriority(offer) {
  const isOfficial = isOfficialOffer(offer);
  const isAffiliate = offer.source?.toLowerCase() === 'affiliate';
  const hasUserFeedback = Number(offer.successCount || 0) > 0;

  if (isOfficial && !isAffiliate) return 4;
  if (isAffiliate) return 3;
  if (hasUserFeedback) return 2;
  return 1; // AI-discovered
}

function sortCouponsByQuality(a, b) {
  // 1. Verified Sitewide Coupons first
  const valA = (a.isSitewide && a.validationStatus === "valid") ? 1 : 0;
  const valB = (b.isSitewide && b.validationStatus === "valid") ? 1 : 0;
  if (valB !== valA) {
    return valB - valA;
  }

  // 2. Source Priority (Official > Affiliate > User verified > AI discovered)
  const prioA = getSourcePriority(a);
  const prioB = getSourcePriority(b);
  if (prioB !== prioA) {
    return prioB - prioA;
  }

  // 3. Highest Success Rate descending
  const rateA = Number(a.successRate || 0);
  const rateB = Number(b.successRate || 0);
  if (rateB !== rateA) {
    return rateB - rateA;
  }

  // 4. Most Recently Working Coupons descending
  const timeA = a.lastWorkedAt ? new Date(a.lastWorkedAt).getTime() : 0;
  const timeB = b.lastWorkedAt ? new Date(b.lastWorkedAt).getTime() : 0;
  if (timeB !== timeA) {
    return timeB - timeA;
  }

  // 5. Remaining Coupons fallback: discount, trust score, creation date
  const discountA = parseOfferDiscount(a);
  const discountB = parseOfferDiscount(b);
  if (discountB !== discountA) {
    return discountB - discountA;
  }

  const trustA = calculateConfidenceScore(a);
  const trustB = calculateConfidenceScore(b);
  if (trustB !== trustA) {
    return trustB - trustA;
  }

  return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
}

function sortDealsByQuality(a, b) {
  // 1. Official Deals first
  const officialA = isOfficialOffer(a) ? 1 : 0;
  const officialB = isOfficialOffer(b) ? 1 : 0;
  if (officialB !== officialA) {
    return officialB - officialA;
  }

  // 2. Sort by discount value (descending)
  const discountA = parseOfferDiscount(a);
  const discountB = parseOfferDiscount(b);
  if (discountB !== discountA) {
    return discountB - discountA;
  }

  // 3. Sort by trust score (descending)
  const trustA = calculateConfidenceScore(a);
  const trustB = calculateConfidenceScore(b);
  if (trustB !== trustA) {
    return trustB - trustA;
  }

  // 4. Sort by creation date (newest first)
  return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
}

export function filterAndLimitOffers(offers) {
  // 1. Filter out expired/invalid offers and apply strict publishing rules
  const activeOffers = (offers || []).filter(offer => {
    const isExpired = offer.status?.toLowerCase() === "expired";
    const isInvalid = offer.validationStatus?.toLowerCase() === "invalid";
    if (isExpired || isInvalid) return false;

    const isOfficial = isOfficialOffer(offer);

    // Strict publishing rule for Coupons
    if (offer.type === "Coupon") {
      const isVerified = offer.storeVerified === true || offer.checkoutVerified === true || offer.validationStatus === "valid";
      const isManual = offer.source === "Manual";
      return isVerified || isManual;
    }

    // Strict publishing rule for Deals
    if (offer.type === "Deal") {
      const isVerified = offer.storeVerified === true || offer.validationStatus === "valid";
      const isManual = offer.source === "Manual";
      return isVerified || isManual;
    }

    return true;
  });

  // 2. Normalize, identify official offers, and calculate trust scores
  const normalizedOffers = activeOffers.map(offer => {
    const isOfficial = isOfficialOffer(offer);
    const trustScore = calculateConfidenceScore(offer);
    return {
      ...offer,
      title: normalizeOfferTitle(offer),
      isOfficial,
      trustScore
    };
  });

  // 3. Separate into Coupons and Deals
  const coupons = normalizedOffers.filter(offer => offer.type === "Coupon");
  const deals = normalizedOffers.filter(offer => offer.type === "Deal");

  // 4. Sort each category separately by quality rules
  coupons.sort(sortCouponsByQuality);
  deals.sort(sortDealsByQuality);

  // 5. Limit to max 4 coupons and 2 deals
  const topCoupons = coupons.slice(0, 4);
  const topDeals = deals.slice(0, 2);

  // 6. Combine: Coupons first, then Deals
  return [...topCoupons, ...topDeals];
}


function getDynamicRatingText(storeId, storeName) {
  const now = new Date();
  const year = now.getFullYear();
  const dayOfYear = Math.floor((now - new Date(year, 0, 1)) / 86400000);
  const bucket = Math.floor(dayOfYear / 15);
  const seedStr = `${storeId || storeName || "store"}-${year}-${bucket}`;
  
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  
  const lcg = (seed) => {
    const m = 0x80000000;
    const a = 1103515245;
    const c = 12345;
    return (a * seed + c) % m;
  };
  
  const r1 = Math.abs(lcg(hash));
  const r2 = Math.abs(lcg(r1));
  
  const rating = (4.6 + (r1 % 4) * 0.1).toFixed(1);
  const reviewsCount = 25 + (r2 % 266);
  
  return `${rating} (${reviewsCount} reviews)`;
}

function buildStoreDetail(store, offers, allStores) {
  const activeCoupons = offers.filter((offer) => offer.type === "Coupon").length;
  const activeDeals = offers.filter((offer) => offer.type === "Deal").length;
  const dynamicRating = getDynamicRatingText(store.id, store.name);
  const fallbackWhyItems = [
    `Track verified ${store.name} promotions in one place`,
    `Separate coupon codes from direct deal links`,
    `Surface fresh savings as new offers are added from admin`,
  ];
  const customWhyItems = String(store.contentWhyItemsText || "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
  const fallbackFaqs = [
    {
      question: `How often are ${store.name} offers updated?`,
      answer: "Offers update whenever admins create, edit, or remove records from the shared Couponchy catalog.",
    },
    {
      question: `Are ${store.name} coupons verified?`,
      answer: "Couponchy shows trust status for the store and keeps manual plus network offers in one moderation flow.",
    },
    {
      question: `Can I find both coupons and deals here?`,
      answer: "Yes. This page mixes code-based coupons and direct deal links from the same backend source.",
    },
  ];
  const customFaqs = [
    { question: store.faq1Question, answer: store.faq1Answer },
    { question: store.faq2Question, answer: store.faq2Answer },
    { question: store.faq3Question, answer: store.faq3Answer },
  ].filter((item) => item.question?.trim() && item.answer?.trim());

  const partnerStatus = store.trustStatus === "Verified" ? "Official" : (store.trustStatus || "Active");

  return {
    singleStore: {
      ...store,
      rating: dynamicRating,
      title: `${store.name} Coupons, Deals & Promo Codes`,
      partnerText: `${partnerStatus} and verified source for ${store.name} discount codes`,
      validatedText: `${offers.length} active offer${offers.length === 1 ? "" : "s"} currently available`,
      activeCoupons,
      activeDeals,
      introTitle: store.contentIntroTitle?.trim() || `More Information On ${store.name} Deals`,
      introParagraphs: [
        store.contentIntroParagraph1?.trim() || `${store.name} is listed on Couponchy with curated savings and regularly reviewed offer coverage.`,
        store.contentIntroParagraph2?.trim() || store.description,
      ],
      whyItems: customWhyItems.length ? customWhyItems : fallbackWhyItems,
      outro: store.contentOutro?.trim() || `Couponchy keeps ${store.name} inventory synced from the same source used by the admin dashboard.`,
    },
    storeTabs: ["Coupons", "Store Info", "FAQs"],
    offerTabs: [
      `All (${offers.length})`,
      `Coupons (${activeCoupons})`,
      `Deals (${activeDeals})`,
    ],
    offers: offers.map((offer) => ({
      ...offer,
      views: `${Math.max(0, 10 + activeCoupons + activeDeals)} views`,
      date: new Date(offer.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    })),
    faqs: customFaqs.length ? customFaqs : fallbackFaqs,
    relatedStores: allStores
      .filter((item) => item.slug !== store.slug)
      .slice(0, 6)
      .map((item) => ({
        name: item.name,
        slug: item.slug,
        categorySlug: item.categorySlug,
        logoText: item.logoText,
        logoClassName: item.logoClassName,
        logoImage: item.logoImage,
      })),
  };
}

function extractHighestDiscountOffer(offers) {
  return offers.reduce((bestMatch, offer) => {
    const source = [offer.title, offer.description, offer.code].filter(Boolean).join(" ");
    const matches = [...source.matchAll(/(\d{1,3})\s*%/g)];

    if (matches.length === 0) {
      return bestMatch;
    }

    const highestInOffer = Math.max(...matches.map((match) => Number(match[1])));

    if (!bestMatch || highestInOffer > bestMatch.discount) {
      return {
        offer,
        discount: highestInOffer,
      };
    }

    return bestMatch;
  }, null);
}

function normalizeMetadataText(value) {
  return value.replace(/\s+/g, " ").replace(/\s+([&|,.\-])/g, "$1").trim();
}

function doesStoreMatchSearch(store, query) {
  const haystack = [store.name, store.slug, store.category, store.categorySlug, store.description].filter(Boolean).join(" ").toLowerCase();
  return haystack.includes(query);
}

function doesOfferMatchSearch(offer, query) {
  const haystack = [
    offer.title,
    offer.description,
    offer.code,
    offer.type,
    offer.storeName,
    offer.ctaLabel,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

function buildStoreMetadataFallback(store, offers, counts, year) {
  const title = `${store.name} Coupon Codes & Deals ${year}`;
  const description = `Save with ${offers.length} verified ${store.name} coupon codes and deals on Couponchy. Browse ${counts.coupons} coupons and ${counts.deals} deals updated for ${year}.`;

  return { title, description };
}

function buildAutoStoreMetadata(settings, store, offers) {
  const year = new Date().getFullYear();
  const counts = {
    offers: offers.length,
    coupons: offers.filter((offer) => offer.type === "Coupon").length,
    deals: offers.filter((offer) => offer.type === "Deal").length,
  };
  const bestDiscountMatch = extractHighestDiscountOffer(offers);

  if (!bestDiscountMatch) {
    return buildStoreMetadataFallback(store, offers, counts, year);
  }

  const replacements = {
    "%store%": store.name,
    "%best_discount%": String(bestDiscountMatch.discount),
    "%best_offer%": bestDiscountMatch.offer.title || `${bestDiscountMatch.discount}% off`,
    "%offers_count%": String(counts.offers),
    "%coupons_count%": String(counts.coupons),
    "%deals_count%": String(counts.deals),
    "%year%": String(year),
  };

  const applyTemplate = (template, fallback) => {
    const result = Object.entries(replacements).reduce(
      (output, [token, replacement]) => output.replaceAll(token, replacement),
      template
    );

    return normalizeMetadataText(result || fallback);
  };

  return {
    title: applyTemplate(
      settings.seo.storeMetaTitleTemplate,
      `${store.name} ${bestDiscountMatch.discount}% Off Discount & Coupon Codes ${year}`
    ),
    description: applyTemplate(
      settings.seo.storeMetaDescriptionTemplate,
      `Save with ${counts.offers} verified ${store.name} coupon codes and deals on Couponchy. Best current offer: ${bestDiscountMatch.offer.title}. Updated for ${year}.`
    ),
  };
}

function filterStoresByCountry(stores, countryCode) {
  const normalizedCountry = normalizeCountryCode(countryCode);
  return stores.filter((store) => normalizeCountryCode(store.countryCode) === normalizedCountry);
}

export async function getStoreDirectoryData(search = "", countryCode) {
  const [stores, offers] = await Promise.all([getAllStores(), getAllOffers()]);
  const scopedStores = filterStoresByCountry(stores, countryCode);
  const allowedStoreSlugs = new Set(scopedStores.map((store) => store.slug));
  const scopedOffers = offers.filter((offer) => allowedStoreSlugs.has(offer.storeSlug));
  const normalizedSearch = String(search || "").trim().toLowerCase();
  const matchingStoreSlugsFromOffers = normalizedSearch
    ? new Set(
        scopedOffers
          .filter((offer) => offer.status?.toLowerCase() !== "expired")
          .filter((offer) => doesOfferMatchSearch(offer, normalizedSearch))
          .map((offer) => offer.storeSlug)
      )
    : new Set();
  const filteredStores = normalizedSearch
    ? scopedStores.filter((store) => {
        return doesStoreMatchSearch(store, normalizedSearch) || matchingStoreSlugsFromOffers.has(store.slug);
      })
    : scopedStores;

  const categories = [...new Set(filteredStores.map((store) => store.category))].map((category, index) => ({
    name: category,
    active: index === 0,
  }));

  return {
    breadcrumbItems: normalizedSearch
      ? ["Home", "Stores", `Search: ${search}`]
      : ["Home", "Stores", categories[0]?.name || "All Stores"],
    categories,
    stores: filteredStores.map(buildStoreDirectoryRecord),
    searchValue: search,
  };
}

export async function getHomePageData(countryCode) {
  const [stores, offers, products, settings] = await Promise.all([getAllStores(), getAllOffers(), getAllProducts(), getSettings()]);
  const scopedStores = filterStoresByCountry(stores, countryCode);
  const allowedStoreSlugs = new Set(scopedStores.map((store) => store.slug));
  const scopedOffers = offers.filter((offer) => allowedStoreSlugs.has(offer.storeSlug));
  const scopedProducts = products.filter((product) => allowedStoreSlugs.has(product.storeSlug));
  const homepageSections = settings.homepage.sections;

  const storeMap = new Map(scopedStores.map((store) => [store.slug, store]));

  const latestStoresSource =
    homepageSections.latestStores.selectedStoreSlugs?.length
      ? orderItemsBySelection(scopedStores, homepageSections.latestStores.selectedStoreSlugs, (store) => store.slug)
      : scopedStores;

  const trendingStoresSource =
    homepageSections.trendingStores.selectedStoreSlugs?.length
      ? orderItemsBySelection(scopedStores, homepageSections.trendingStores.selectedStoreSlugs, (store) => store.slug)
      : scopedStores;

  const featuredOffersSource =
    homepageSections.featuredCoupons.selectedOfferIds?.length
      ? orderItemsBySelection(scopedOffers, homepageSections.featuredCoupons.selectedOfferIds, (offer) => offer.id)
      : scopedOffers;

  const featuredProductsSource =
    homepageSections.featuredProducts.selectedProductIds?.length
      ? orderItemsBySelection(scopedProducts, homepageSections.featuredProducts.selectedProductIds, (product) => product.id)
      : scopedProducts;

  return {
    hero: settings.homepage.hero,
    latestStoresTitle: homepageSections.latestStores.title,
    latestStores: latestStoresSource.slice(0, homepageSections.latestStores.limit).map((store) => ({
      name: store.name,
      code: store.name.slice(0, 1).toUpperCase(),
      href: `/stores/${store.categorySlug}/${store.slug}`,
      offersCount: store.offersCount,
      category: store.category,
      categorySlug: store.categorySlug,
      logoImage: store.logoImage,
    })),
    trendingStoresTitle: homepageSections.trendingStores.title,
    trendingStores: trendingStoresSource.slice(0, homepageSections.trendingStores.limit).map((store) => ({
      name: store.name,
      href: `/stores/${store.categorySlug}/${store.slug}`,
      offer: `${store.offersCount} ACTIVE OFFERS`,
      cta: store.logoText,
      image: store.heroImage,
      logoImage: store.logoImage,
      logoText: store.logoText,
      trustStatus: store.trustStatus,
    })),
    featuredCouponsTitle: homepageSections.featuredCoupons.title,
    featuredCoupons: featuredOffersSource.slice(0, homepageSections.featuredCoupons.limit).map((offer, index) => {
      const offerStore = storeMap.get(offer.storeSlug);
      return {
        id: offer.id,
        brand: offer.storeName,
        brandSlug: offer.storeSlug,
        categorySlug: offerStore ? offerStore.categorySlug : "all",
        tag: offer.status,
        type: offer.type,
        code: offer.code,
        title: normalizeOfferTitle(offer),
        value: offer.type === "Deal" ? "GET DEAL" : offer.code || "SAVE NOW",
        description: offer.description,
        highlight: index === 1,
        affiliateLink: offer.affiliateLink || null,
        storeAffiliateLink: offerStore?.affiliateLink || null,
        countryCode: offerStore?.countryCode || null,
      };
    }),
    featuredProductsTitle: homepageSections.featuredProducts.title,
    featuredProducts: featuredProductsSource.slice(0, homepageSections.featuredProducts.limit).map((product) => ({
      id: product.id,
      title: product.title,
      description: product.description,
      image: product.image,
      price: product.price,
      originalPrice: product.originalPrice,
      ctaLabel: product.ctaLabel,
      productUrl: product.productUrl,
      storeName: product.storeName,
      status: product.status,
    })),
  };
}

export async function getStorePageData(slug, countryCode) {
  const [store, offers, products, allStores] = await Promise.all([
    getStoreBySlug(slug),
    getOffersByStoreSlug(slug),
    getProductsByStoreSlug(slug),
    getAllStores(),
  ]);

  if (!store) {
    return null;
  }

  if (countryCode && normalizeCountryCode(store.countryCode) !== normalizeCountryCode(countryCode)) {
    return null;
  }

  const countryMatchedStores = allStores.filter(
    (item) => normalizeCountryCode(item.countryCode) === normalizeCountryCode(store.countryCode)
  );

  const filteredOffers = filterAndLimitOffers(offers);

  return {
    ...buildStoreDetail(store, filteredOffers, countryMatchedStores),
    products: products.map((product) => ({
      ...product,
      productUrl: `/stores/${store.categorySlug}/${store.slug}/products/${product.slug}`,
    })),
  };
}

export async function getProductPageData(storeSlug, productSlug, countryCode) {
  const [store, product] = await Promise.all([
    getStoreBySlug(storeSlug),
    getProductByStoreAndSlug(storeSlug, productSlug),
  ]);

  if (!store || !product) {
    return null;
  }

  if (countryCode && normalizeCountryCode(store.countryCode) !== normalizeCountryCode(countryCode)) {
    return null;
  }

  return {
    singleStore: store,
    productItem: {
      ...product,
      productUrl: `/stores/${store.categorySlug}/${store.slug}/products/${product.slug}`,
    },
  };
}

export async function getProductPageMetadata(storeSlug, productSlug, countryCode) {
  const data = await getProductPageData(storeSlug, productSlug, countryCode);

  if (!data) {
    return null;
  }

  return {
    title: `${data.productItem.title} | ${data.singleStore.name}`,
    description: data.productItem.description,
  };
}

export async function getStorePageMetadata(slug) {
  const [store, offers, settings] = await Promise.all([
    getStoreBySlug(slug),
    getOffersByStoreSlug(slug),
    getSettings(),
  ]);

  if (!store) {
    return null;
  }

  const filteredOffers = filterAndLimitOffers(offers);

  if (!settings.seo.autoGenerateStoreMetadata) {
    const year = new Date().getFullYear();
    return buildStoreMetadataFallback(
      store,
      filteredOffers,
      {
        offers: filteredOffers.length,
        coupons: filteredOffers.filter((offer) => offer.type === "Coupon").length,
        deals: filteredOffers.filter((offer) => offer.type === "Deal").length,
      },
      year
    );
  }

  return buildAutoStoreMetadata(settings, store, filteredOffers);
}

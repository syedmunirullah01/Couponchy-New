import "server-only";
import { supabase } from "@/lib/supabase";
import { sanitizeCountryList, SUPPORTED_COUNTRIES } from "@/lib/countries";

// ─── Default settings (same as before) ───────────────────────────────────────
export const defaultSettings = {
  general: {
    siteName: "Couponchy",
    tagline: "Smart shopping, better saving.",
    supportEmail: "support@couponchy.com",
    countries: SUPPORTED_COUNTRIES,
    customHeadScript: "",
    customBodyStartScript: "",
    customBodyEndScript: "",
  },
  affiliate: {
    cjEnabled: true,
    cjAccount: "",
    rakutenEnabled: true,
    rakutenAccount: "",
    impactEnabled: true,
    impactAccount: "",
    syncFrequency: "Every 6 hours",
  },
  social: {
    facebook: "",
    instagram: "",
    x: "",
    tiktok: "",
    youtube: "",
    defaultShareText: "Verified coupons and deals from Couponchy.",
  },
  seo: {
    titleTemplate: "%s | Couponchy",
    metaDescription: "Verified coupons, deals, and store offers updated daily.",
    ogTitle: "Couponchy",
    ogDescription: "Discover verified coupons and deals for top stores.",
    robots: "index,follow",
    autoGenerateStoreMetadata: true,
    storeMetaTitleTemplate: "%store% %best_discount%% Off Discount & Coupon Codes %year%",
    storeMetaDescriptionTemplate:
      "Save with %offers_count% verified %store% coupon codes and deals on Couponchy. Best current offer: %best_offer%. Updated for %year%.",
  },
  homepage: {
    hero: {
      eyebrow: "Exclusive Daily Deals",
      titleLineOne: "Smart Shopping,",
      titleAccent: "Better Saving",
      description: "Unlock verified discounts from the world's leading brands. The smarter way to checkout.",
      searchPlaceholder: "Search stores, coupons, deals",
      searchButtonLabel: "Search Offers",
      memberCountText: "Join 126k+ members saving daily",
      slides: [
        {
          id: "hero-slide-1",
          image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
          badge: "Curated Deal Pick",
          kicker: "Live Now",
          title: "Flash Sale: Nike Air",
          description: "Fresh markdowns on sneakers, apparel, and accessories.",
          discount: "-40%",
          accent: "linear-gradient(140deg, rgba(255,72,48,0.24), transparent 48%)",
        },
        {
          id: "hero-slide-2",
          image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
          badge: "Tech Spotlight",
          kicker: "Just Dropped",
          title: "Luxury Smartwatch Week",
          description: "Fast-moving discounts on statement watches and premium wearables.",
          discount: "-32%",
          accent: "linear-gradient(140deg, rgba(41,196,255,0.24), transparent 48%)",
        },
        {
          id: "hero-slide-3",
          image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
          badge: "Color Burst Edit",
          kicker: "Trending",
          title: "Streetwear Heat Check",
          description: "Graphic essentials, bold fits, and limited-run fashion savings.",
          discount: "-28%",
          accent: "linear-gradient(140deg, rgba(255,175,37,0.22), transparent 48%)",
        },
        {
          id: "hero-slide-4",
          image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80",
          badge: "Travel Moodboard",
          kicker: "Weekend Escape",
          title: "Resort Style Deals",
          description: "High-color luggage, vacation fashion, and getaway-ready accessories.",
          discount: "-35%",
          accent: "linear-gradient(140deg, rgba(255,80,174,0.22), transparent 48%)",
        },
      ],
      middleBanner: {
        imageUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80",
        targetUrl: "/coupons",
      },
      bottomBanner: {
        imageUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80",
        targetUrl: "/coupons",
      },
    },
    sections: {
      trendingStores: { title: "Trending Stores", selectedStoreSlugs: [], limit: 5 },
      featuredCoupons: { title: "Featured Coupons", selectedOfferIds: [], limit: 4 },
      featuredProducts: { title: "Featured Products", selectedProductIds: [], limit: 4 },
      latestStores: { title: "Latest Stores", selectedStoreSlugs: [], limit: 10 },
    },
  },
  pages: {
    about: { title: "About Us", content: "<h2>About Us</h2><p>Welcome to Couponchy! We are dedicated to providing the best verified coupons and discount codes for your favorite online stores.</p>" },
    contact: { title: "Contact Us", content: "<h2>Contact Us</h2><p>Have questions or feedback? Reach out to us at support@couponchy.com. We would love to hear from you!</p>" },
    privacy: { title: "Privacy Policy", content: "<h2>Privacy Policy</h2><p>Your privacy is important to us. This policy details how we handle and protect your personal information on our platform.</p>" },
    terms: { title: "Terms Of Service", content: "<h2>Terms Of Service</h2><p>Please read these Terms of Service carefully before accessing or using our coupon listings and automated services.</p>" },
    sitemap: { title: "Sitemap", content: "<h2>Sitemap</h2><p>Browse through all available stores, categories, products, and blogs on our site using the listings below.</p>" }
  }
};

function mergeSettings(saved) {
  return {
    ...defaultSettings,
    ...saved,
    general: {
      ...defaultSettings.general,
      ...saved.general,
      countries: sanitizeCountryList(saved.general?.countries || defaultSettings.general.countries),
    },
    affiliate: { ...defaultSettings.affiliate, ...saved.affiliate },
    social: { ...defaultSettings.social, ...saved.social },
    seo: { ...defaultSettings.seo, ...saved.seo },
    homepage: {
      ...defaultSettings.homepage,
      ...saved.homepage,
      hero: {
        ...defaultSettings.homepage.hero,
        ...saved.homepage?.hero,
        middleBanner: {
          ...defaultSettings.homepage.hero.middleBanner,
          ...saved.homepage?.hero?.middleBanner,
        },
        bottomBanner: {
          ...defaultSettings.homepage.hero.bottomBanner,
          ...saved.homepage?.hero?.bottomBanner,
        },
        slides: saved.homepage?.hero?.slides?.length ? saved.homepage.hero.slides : defaultSettings.homepage.hero.slides,
      },
      sections: {
        ...defaultSettings.homepage.sections,
        ...saved.homepage?.sections,
        trendingStores: { ...defaultSettings.homepage.sections.trendingStores, ...saved.homepage?.sections?.trendingStores },
        featuredCoupons: { ...defaultSettings.homepage.sections.featuredCoupons, ...saved.homepage?.sections?.featuredCoupons },
        featuredProducts: { ...defaultSettings.homepage.sections.featuredProducts, ...saved.homepage?.sections?.featuredProducts },
        latestStores: { ...defaultSettings.homepage.sections.latestStores, ...saved.homepage?.sections?.latestStores },
      },
    },
    pages: {
      ...defaultSettings.pages,
      ...saved.pages,
      about: { ...defaultSettings.pages?.about, ...saved.pages?.about },
      contact: { ...defaultSettings.pages?.contact, ...saved.pages?.contact },
      privacy: { ...defaultSettings.pages?.privacy, ...saved.pages?.privacy },
      terms: { ...defaultSettings.pages?.terms, ...saved.pages?.terms },
      sitemap: { ...defaultSettings.pages?.sitemap, ...saved.pages?.sitemap },
    },
  };
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getSettings() {
  const { data, error } = await supabase
    .from("settings")
    .select("data")
    .eq("id", 1)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No settings row yet — return defaults (will be saved on first update)
      return defaultSettings;
    }
    throw new Error(`getSettings failed: ${error.message}`);
  }

  return mergeSettings(data?.data || {});
}

export async function updateSettings(payload) {
  const current = await getSettings();
  const next = mergeSettings({ ...current, ...payload });

  const { error } = await supabase
    .from("settings")
    .upsert({ id: 1, data: next }, { onConflict: "id" });

  if (error) throw new Error(`updateSettings failed: ${error.message}`);
  return next;
}

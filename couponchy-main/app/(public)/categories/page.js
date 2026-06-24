import Link from "next/link";
import { getMetadataDefaults } from "@/server/services/settings-service";
import { getAllCategories } from "@/server/repositories/categories-repository";
import { getAllStores } from "@/server/repositories/stores-repository";

export async function generateMetadata() {
  return getMetadataDefaults("Browse Categories");
}

export const dynamic = "force-dynamic";

/* Helper to map category slugs to custom SVG icons */
function getCategoryIcon(slug) {
  const iconClasses = "h-6 w-6 text-[var(--color-primary)] transition-transform duration-300 group-hover:scale-110";
  
  switch (slug) {
    case "business-finance":
      return (
        <svg viewBox="0 0 24 24" className={iconClasses} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      );
    case "books-media":
      return (
        <svg viewBox="0 0 24 24" className={iconClasses} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      );
    case "computers-softwares":
      return (
        <svg viewBox="0 0 24 24" className={iconClasses} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      );
    case "events-entertainment":
      return (
        <svg viewBox="0 0 24 24" className={iconClasses} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
          <line x1="12" y1="5" x2="12" y2="19" strokeDasharray="3 3" />
        </svg>
      );
    case "home-garden":
      return (
        <svg viewBox="0 0 24 24" className={iconClasses} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case "food-drinks":
      return (
        <svg viewBox="0 0 24 24" className={iconClasses} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
          <line x1="6" y1="2" x2="6" y2="4" />
          <line x1="10" y1="2" x2="10" y2="4" />
          <line x1="14" y1="2" x2="14" y2="4" />
        </svg>
      );
    case "babies-kids":
      return (
        <svg viewBox="0 0 24 24" className={iconClasses} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <circle cx="9" cy="9" r="1" fill="currentColor" />
          <circle cx="15" cy="9" r="1" fill="currentColor" />
        </svg>
      );
    case "sports-outdoors":
      return (
        <svg viewBox="0 0 24 24" className={iconClasses} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="6" y1="18" x2="18" y2="6" />
          <circle cx="18" cy="18" r="3" />
          <circle cx="6" cy="6" r="3" />
        </svg>
      );
    case "appliances-electronics":
      return (
        <svg viewBox="0 0 24 24" className={iconClasses} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="2" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <circle cx="12" cy="17" r="2" />
        </svg>
      );
    case "tools-parts":
      return (
        <svg viewBox="0 0 24 24" className={iconClasses} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      );
    case "travel-vacations":
      return (
        <svg viewBox="0 0 24 24" className={iconClasses} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 2 11 13" />
          <path d="M22 2l-7 20-4-9-9-4 20-7z" />
        </svg>
      );
    case "service":
      return (
        <svg viewBox="0 0 24 24" className={iconClasses} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "internet":
      return (
        <svg viewBox="0 0 24 24" className={iconClasses} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    case "gifts-flowers":
      return (
        <svg viewBox="0 0 24 24" className={iconClasses} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 12 20 22 4 22 4 12" />
          <rect x="2" y="7" width="20" height="5" />
          <line x1="12" y1="22" x2="12" y2="7" />
          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
        </svg>
      );
    case "health-beauty":
      return (
        <svg viewBox="0 0 24 24" className={iconClasses} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      );
    case "automotive":
      return (
        <svg viewBox="0 0 24 24" className={iconClasses} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="3" width="15" height="13" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      );
    case "arts-crafts":
      return (
        <svg viewBox="0 0 24 24" className={iconClasses} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="6" r="1" />
          <circle cx="12" cy="18" r="1" />
          <circle cx="6" cy="12" r="1" />
          <circle cx="18" cy="12" r="1" />
        </svg>
      );
    case "apparel-clothing":
      return (
        <svg viewBox="0 0 24 24" className={iconClasses} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.38 3.46 16 7.83V20a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V7.83L3.62 3.46a2 2 0 1 1 2.76-2.9L10 4.17V2h4v2.17l3.62-3.61a2 2 0 1 1 2.76 2.9z" />
        </svg>
      );
    case "eyewear":
      return (
        <svg viewBox="0 0 24 24" className={iconClasses} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="12" r="3" />
          <path d="M9 12h6" />
          <path d="M3 10V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2" />
        </svg>
      );
    case "games-toys":
      return (
        <svg viewBox="0 0 24 24" className={iconClasses} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="6" width="20" height="12" rx="3" />
          <path d="M6 12h4" />
          <path d="M8 10v4" />
          <circle cx="15.5" cy="12" r="1" fill="currentColor" />
          <circle cx="18.5" cy="12" r="1" fill="currentColor" />
        </svg>
      );
    case "communication-wireless":
      return (
        <svg viewBox="0 0 24 24" className={iconClasses} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" />
          <path d="M12 6a6 6 0 0 1 6 6m-6-3a3 3 0 0 1 3 3" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className={iconClasses} fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      );
  }
}

/* Static fallback examples mapping if the database categories have no stores linked */
const categoryFallbackStores = {
  "business-finance": "Staples, UPS, Western Union",
  "books-media": "Amazon, Barnes & Noble, Audible",
  "computers-softwares": "Apple, Dell, Microsoft",
  "events-entertainment": "Ticketmaster, StubHub, AMC",
  "home-garden": "Home Depot, Lowe's, IKEA",
  "food-drinks": "DoorDash, Starbucks, Subway",
  "babies-kids": "Carter's, OshKosh, Disney",
  "sports-outdoors": "Nike, Under Armour, REI",
  "appliances-electronics": "Best Buy, Samsung, Dyson",
  "tools-parts": "AutoZone, Harbor Freight, Pep Boys",
  "travel-vacations": "Expedia, Booking.com, Airbnb",
  "service": "TaskRabbit, Fiverr, FedEx",
  "internet": "GoDaddy, Namecheap, Bluehost",
  "gifts-flowers": "1-800-Flowers, Etsy, Sephora",
  "health-beauty": "Sephora, ULTA, CVS",
  "automotive": "Tesla, Goodyear, Carparts",
  "arts-crafts": "Michaels, Joann, Hobby Lobby",
  "apparel-clothing": "Nike, Adidas, Zara",
  "eyewear": "Warby Parker, Sunglass Hut, Oakley",
  "games-toys": "LEGO, Nintendo, GameStop",
  "communication-wireless": "Verizon, AT&T, T-Mobile",
};

export default async function CategoriesPage() {
  let categories = [];
  let stores = [];

  try {
    categories = await getAllCategories();
    stores = await getAllStores();
  } catch (err) {
    console.error("Failed to load data for categories page:", err);
  }

  // Compile stores for each category
  const categoriesWithStores = categories.map((category) => {
    const linkedStores = stores.filter(
      (s) => s.categorySlug === category.slug || s.category?.toLowerCase() === category.name?.toLowerCase()
    );
    
    // Format list of store names
    let storeListStr = "";
    if (linkedStores.length > 0) {
      storeListStr = linkedStores.slice(0, 3).map((s) => s.name).join(", ");
    } else {
      storeListStr = categoryFallbackStores[category.slug] || "Browse coupons & promo codes";
    }

    return {
      ...category,
      storeListStr,
    };
  });

  return (
    <div className="mx-auto w-full max-w-[1240px] px-6 py-12 md:py-16 lg:px-8">
      {/* Eyebrow & Page Header */}
      <div className="mb-12">
        <div className="mb-3 flex items-center gap-2.5">
          <span className="h-px w-8 bg-[var(--color-primary)]" />
          <span className="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--color-primary)]">
            ✦ BROWSE BY CATEGORY
          </span>
        </div>
        <h1 className="text-[36px] font-black tracking-[-0.05em] text-white sm:text-[46px] md:text-[54px] leading-[1.1]">
          Find stores by type.
        </h1>
      </div>

      {/* Grid List */}
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {categoriesWithStores.map((category) => (
          <Link
            key={category.id || category.slug}
            href={`/stores?search=${encodeURIComponent(category.name)}`}
            className="group relative flex flex-col items-start rounded-[20px] border border-white/5 bg-[#0d0d0d] p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-[var(--color-primary)]/20 hover:shadow-[0_15px_30px_rgba(163,230,53,0.08)]"
          >
            {/* Ambient subtle glow inside the card on hover */}
            <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-[var(--color-primary)]/0 to-[var(--color-primary)]/[0.015] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            
            {/* Category Icon Container */}
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.03] border border-white/5 mb-5 transition-colors duration-300 group-hover:bg-[var(--color-primary)]/10 group-hover:border-[var(--color-primary)]/20">
              {getCategoryIcon(category.slug)}
            </div>

            {/* Category Title */}
            <h3 className="text-[17px] font-extrabold text-white group-hover:text-[var(--color-primary)] transition-colors duration-300 leading-snug">
              {category.name}
            </h3>

            {/* Category Subtext (stores list) */}
            <p className="mt-2 text-xs leading-relaxed text-white/40 group-hover:text-white/50 transition-colors duration-300">
              {category.storeListStr}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

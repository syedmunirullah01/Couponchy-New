import Link from "next/link";
import { cn } from "@/lib/utils";
import StoreSpotlightCard from "./StoreSpotlightCard";

function TrendingIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14m-7-7 7 7-7 7" />
    </svg>
  );
}

function toTitleCase(str) {
  if (!str) return "";
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function TrendingStoresSection({ trendingStores, title = "Trending Stores" }) {
  if (!trendingStores.length) {
    return (
      <section className="relative">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2.5">
              <span className="h-px w-8 bg-[var(--accent)]" />
              <span className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--accent)]">
                Popular Destinations
              </span>
            </div>
            <h2 className="text-[32px] font-black uppercase tracking-[-0.04em] text-white sm:text-[42px]">
              {toTitleCase(title)}
            </h2>
            <div className="mt-3 h-1 w-20 rounded-full bg-[var(--accent)]" />
          </div>
        </div>
        <div className="rounded-[28px] border border-white/5 bg-[#0a0a0a] p-8 text-center">
          <p className="text-lg font-semibold text-white">No stores yet</p>
          <p className="mt-2 text-sm text-white/40">Add stores from admin and they will appear here automatically.</p>
        </div>
      </section>
    );
  }

  const storeGridClassName =
    trendingStores.length === 1
      ? "max-w-[240px] mx-auto"
      : trendingStores.length === 2
        ? "grid-cols-2 max-w-[500px] mx-auto"
        : trendingStores.length === 3
          ? "grid-cols-2 lg:grid-cols-3 max-w-[760px] mx-auto"
          : trendingStores.length === 4
            ? "grid-cols-2 lg:grid-cols-4"
            : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5";

  return (
    <section className="relative pt-2">
      {/* Section Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="mb-3 flex items-center gap-2.5">
            <span className="h-px w-8 bg-[var(--accent)]" />
            <span className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--accent)] flex items-center gap-1.5">
              <TrendingIcon />
              Popular Destinations
            </span>
          </div>
          <h2 className="text-[32px] font-black uppercase tracking-[-0.04em] text-white sm:text-[42px]">
            {toTitleCase(title)}
          </h2>
          <p className="mt-2 text-xs text-white/40 max-w-xl">
            Discover the most popular brands with verified active offers, exclusive deals, and discount coupons updated daily by our team.
          </p>
          <div className="mt-4 h-1 w-20 rounded-full bg-[var(--accent)]" />
        </div>
      </div>

      {/* Grid containing store spotlight cards */}
      <div className={cn("grid gap-5 items-start", storeGridClassName)}>
        {trendingStores.map((store, index) => (
          <StoreSpotlightCard key={store.name} store={store} index={index} />
        ))}
      </div>

      {/* View All Stores premium button at bottom center */}
      <div className="mt-12 text-center">
        <Link
          href="/stores"
          className="group inline-flex items-center gap-2.5 rounded-2xl border px-8 py-3.5 text-[11px] font-black uppercase tracking-[0.18em] transition-all duration-300 hover:bg-[var(--accent)] hover:text-black hover:border-[var(--accent)] hover:scale-105"
          style={{
            borderColor: "rgba(163,230,53,0.25)",
            color: "var(--accent)",
            background: "rgba(163,230,53,0.03)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          }}
        >
          View All Stores
          <ArrowIcon />
        </Link>
      </div>

      {/* Bottom glowing background orb */}
      <div
        className="pointer-events-none absolute -bottom-20 left-1/2 h-40 w-[600px] -translate-x-1/2 blur-[90px] opacity-40"
        style={{ background: "radial-gradient(ellipse, rgba(163,230,53,0.06), transparent 70%)" }}
      />
    </section>
  );
}


"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

const defaultSitemapData = {
  title: "Sitemap",
  heroTitle: "Sitemap",
  heroSubtitle: "Explore our complete store directory, shopping categories, and company links to start saving.",
  generalTitle: "Essential Pages",
  categoriesTitle: "Browse by Category",
  storesTitle: "Brand Directory A-Z"
};

function getSitemapData(pageObj) {
  if (!pageObj || typeof pageObj === "string" || !pageObj.heroTitle) {
    return { ...defaultSitemapData };
  }
  return { ...defaultSitemapData, ...pageObj };
}

export default function SitemapClientPage({ pageData, stores = [], categories = [] }) {
  const sitemapData = getSitemapData(pageData);
  const [selectedLetter, setSelectedLetter] = useState("");

  // Group stores alphabetically A-Z
  const groupedStores = useMemo(() => {
    const groups = {};
    
    // Initialize empty arrays for A-Z and #
    for (let i = 65; i <= 90; i++) {
      groups[String.fromCharCode(i)] = [];
    }
    groups["#"] = [];

    (stores || []).forEach((store) => {
      if (!store || !store.name) return;
      const firstChar = store.name.trim().charAt(0).toUpperCase();
      if (/[A-Z]/.test(firstChar)) {
        groups[firstChar].push(store);
      } else {
        groups["#"].push(store);
      }
    });

    // Remove empty groups to keep the sitemap clean
    return Object.keys(groups)
      .filter((key) => groups[key].length > 0)
      .reduce((obj, key) => {
        obj[key] = groups[key].sort((a, b) => a.name.localeCompare(b.name));
        return obj;
      }, {});
  }, [stores]);

  const alphabet = Object.keys(groupedStores);

  const handleLetterClick = (letter) => {
    setSelectedLetter(letter);
    const element = document.getElementById(`letter-${letter}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const essentialLinks = [
    { label: "Home Page", path: "/" },
    { label: "About Us", path: "/about" },
    { label: "Contact Us", path: "/contact" },
    { label: "Privacy Policy", path: "/privacy" },
    { label: "Terms of Service", path: "/terms" },
    { label: "Exclusive Offers", path: "/exclusive" },
    { label: "Blog & Savings Tips", path: "/blog" }
  ];

  return (
    <div className="relative w-full overflow-hidden bg-black text-white selection:bg-[var(--color-primary)]/20 selection:text-white pb-24">
      {/* ─── Ambient Glow Blobs ─────────────────────────────────────────── */}
      <div
        className="pointer-events-none absolute -left-20 -top-40 h-[500px] w-[500px] rounded-full blur-[140px] opacity-40"
        style={{
          background: "radial-gradient(circle, rgba(163,230,53,0.15) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute right-10 top-1/3 h-[600px] w-[600px] rounded-full blur-[160px] opacity-35"
        style={{
          background: "radial-gradient(circle, rgba(147,51,234,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-[1040px] px-4 sm:px-6 lg:px-8">
        {/* ════════════════════════════════════════════════════════════════════════
            SECTION 1: HERO HEADER
        ════════════════════════════════════════════════════════════════════════ */}
        <section className="pt-20 pb-12 sm:pt-28 sm:pb-16 max-w-4xl text-center flex flex-col items-center">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--color-primary)]">
            — DIRECTORY INDEX
          </p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl leading-[1.08] uppercase">
            {sitemapData.heroTitle}
          </h1>
          <p className="mt-6 text-[15px] leading-[1.7] text-white/50 max-w-2xl font-medium">
            {sitemapData.heroSubtitle}
          </p>
        </section>

        {/* ════════════════════════════════════════════════════════════════════════
            SECTION 2: ESSENTIAL LINKS & CATEGORIES
        ════════════════════════════════════════════════════════════════════════ */}
        <section className="py-10 border-t border-white/5 grid gap-8 md:grid-cols-12">
          {/* Essential pages list */}
          <div className="md:col-span-4 bg-[#0a0a0a]/60 border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-widest text-[var(--color-primary)] mb-4">
                {sitemapData.generalTitle}
              </h2>
              <ul className="space-y-3.5">
                {essentialLinks.map((link, idx) => (
                  <li key={idx}>
                    <Link
                      href={link.path}
                      className="text-xs font-bold text-white/70 hover:text-white transition-colors flex items-center gap-2 group"
                    >
                      <span className="text-[var(--color-primary)] opacity-40 group-hover:opacity-100 transition-opacity">→</span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Categories index */}
          <div className="md:col-span-8 bg-[#0a0a0a]/60 border border-white/5 p-6 rounded-2xl">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-[var(--color-primary)] mb-4">
              {sitemapData.categoriesTitle}
            </h2>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
              {(categories || []).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/stores#cat-${cat.slug}`}
                  className="bg-white/[0.01] border border-white/5 hover:border-white/12 hover:bg-white/[0.03] p-3 rounded-xl transition text-left group"
                >
                  <span className="text-xs font-extrabold text-white/80 group-hover:text-white transition-colors block truncate">
                    {cat.name}
                  </span>
                  <span className="text-[9px] text-white/40 block mt-1">Explore deals</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════════
            SECTION 3: BRAND DIRECTORY A-Z
        ════════════════════════════════════════════════════════════════════════ */}
        <section className="py-12 border-t border-white/5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-widest text-[var(--color-primary)]">
                STORES DIRECTORY
              </h2>
              <h3 className="mt-2 text-2xl font-extrabold text-white uppercase tracking-tight">
                {sitemapData.storesTitle}
              </h3>
            </div>

            {/* Quick jump navigation index bar */}
            <div className="flex flex-wrap gap-1 border border-white/5 bg-[#0a0a0a]/50 p-1.5 rounded-xl">
              {alphabet.map((letter) => (
                <button
                  key={letter}
                  type="button"
                  onClick={() => handleLetterClick(letter)}
                  className={`h-7 w-7 rounded-lg text-[10px] font-black transition-all flex items-center justify-center cursor-pointer ${
                    selectedLetter === letter
                      ? "bg-[var(--color-primary)] text-black font-extrabold"
                      : "text-white/40 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>

          {/* Letter list groups grid */}
          <div className="space-y-8">
            {alphabet.map((letter) => (
              <div
                key={letter}
                id={`letter-${letter}`}
                className="bg-[#070707]/30 border border-white/5 rounded-2xl p-6 transition-all"
              >
                <div className="flex items-center gap-3 border-b border-white/5 pb-3 mb-4">
                  <span className="h-8 w-8 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center text-sm font-black border border-[var(--color-primary)]/20">
                    {letter}
                  </span>
                  <span className="text-xs font-bold text-white/50 uppercase">
                    {(groupedStores[letter] || []).length} Brand{(groupedStores[letter] || []).length === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                  {(groupedStores[letter] || []).map((store) => (
                    <Link
                      key={store.id}
                      href={`/stores/${store.categorySlug || "all"}/${store.slug}`}
                      className="text-xs font-medium text-white/40 hover:text-[var(--color-primary)] transition-colors py-1 truncate"
                    >
                      {store.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

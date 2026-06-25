import { getCompanyPageContent, getMetadataDefaults } from "@/server/services/settings-service";
import { getAllStores } from "@/server/repositories/stores-repository";
import { getAllOffers } from "@/server/repositories/offers-repository";
import Link from "next/link";

export async function generateMetadata() {
  const page = await getCompanyPageContent("about");
  return getMetadataDefaults(page?.title || "About Us");
}

export const dynamic = "force-dynamic";

const defaultAboutData = {
  title: "About Us",
  heroKicker: "ABOUT",
  heroTitle: "We built a verification engine because coupon sites are broken.",
  heroSubtitle: "Couponchy exists for one simple reason: most coupon codes on the internet don't work, and nobody was willing to fix it. So we built a system that tests and verifies every single code before you use it.",
  problemKicker: "THE PROBLEM",
  problemTitle: "The coupon industry has a trust problem.",
  problemDesc1: "Coupons often take money from click-to-reveal redirects. If they're expired, it wastes your time. Traditional coupon directories rely on unchecked aggregator feeds, leading to a frustrating experience where 60-80% of promo codes are broken.",
  problemDesc2: "We decided to build a different kind of system where every code is tested, verified, and backed by a transparent validation log of when it last worked. One source of truth for ecommerce discounts.",
  milestones: [
    { year: "2018", title: "Founded in Santa Monica", desc: "Target tracking and building blocks for e-commerce promotion databases." },
    { year: "2020", title: "SimplyCodes Initial Launch", desc: "Launched a lightweight extension based on the premise that validation should come before display." },
    { year: "2021", title: "$10M+ in Verified GMV", desc: "Crossed major milestones in actual gross merchandise value processed through verified offers." },
    { year: "2022", title: "Focus Layer Engine Operational", desc: "Automated testing system starts using scraper modules and checkout validation checks." },
    { year: "2024", title: "Dashboard & Directory Launch", desc: "Launched Web Dashboard with live status metrics, store categorization, and real-time coupon lists." },
    { year: "2026", title: "Couponchy Verification v2", desc: "Completed direct database synchronization and modern user submission moderations." }
  ],
  principles: [
    { title: "Verification over aggregation", desc: "Aggregation is easy, validation is hard. We do not dump thousands of untested coupons into our index just for search volume." },
    { title: "Transparency over trust", desc: "Don't just take our word for it. We display exact status codes, verification dates, and community confirmation feedback." },
    { title: "Conflict-free incentives", desc: "Traditional coupon sites earn by driving user clicks, even on broken codes. We only win when we actually save you money." },
    { title: "Privacy by architecture", desc: "We do not track your browsing histories, record search terms, or sell your shopping patterns. Your data remains yours." },
    { title: "Aligned structures", desc: "Our checkout test systems integrate seamlessly with the admin dashboard, keeping public code lists in absolute sync." },
    { title: "Sovereign independence", desc: "We are an independent platform, free from affiliate networks' pressure to list unverified or low-value promotions." }
  ],
  methodologyKicker: "PROCESS & METHODOLOGY",
  methodologyTitle: "The same methodology. A bigger mission.",
  methodologySubtitle: "We verify promo codes using a multi-step checkout simulation. When a coupon is processed, our pipeline records screen checkpoints, monitors total cart discounts, and calculates exact exclusion terms.",
  methodologyLinkText: "Explore store directory",
  methodologyCard1Title: "Active Coupon Review",
  methodologyCard1Desc: "Coupons checked dynamically in real-time across multiple e-commerce cart platforms and search scripts.",
  methodologyCard2Title: "Verified Product Status",
  methodologyCard2Desc: "Testing exclusions directly and verifying minimum order rules before adding them to search directories.",
  teamKicker: "THE TEAM",
  teamTitle: "Small team. Big verification engine.",
  teamSubtitle: "Couponchy is built by a focused team of software engineers, designers, and deal hunters who believe getting online promo codes should be transparent, easy, and accurate.",
  teamCards: [
    { title: "Open Roles", desc: "Engineers, designers, and product builders who want to fix checkout experiences.", cta: "View Careers", url: "/contact" },
    { title: "Our Publications", desc: "Read studies, news updates, and stats analyses on online shopping trends.", cta: "Read Blog", url: "/blog" },
    { title: "Media Inquiries", desc: "Looking for coupon validation statistics or data insights? Let's connect.", cta: "Get in touch", url: "/contact" }
  ],
  ctaTitle: "See what we built.",
  ctaSubtitle: "Browse our list of verified store coupons, discover hot promotions, or submit an offer to share with the saving community.",
  ctaButton1Text: "Browse Stores",
  ctaButton2Text: "Read Methodology"
};

function getAboutData(pageObj) {
  if (!pageObj || typeof pageObj === "string" || !pageObj.heroTitle) {
    return { ...defaultAboutData };
  }
  return { ...defaultAboutData, ...pageObj };
}

export default async function AboutPage() {
  const page = await getCompanyPageContent("about");
  const aboutData = getAboutData(page);

  // Fetch live statistics from the database with safety checks
  let storeCount = 520;
  let offerCount = 2450;
  try {
    const allStores = await getAllStores();
    if (allStores && allStores.length > 0) {
      storeCount = allStores.length;
    }
    const allOffers = await getAllOffers();
    if (allOffers && allOffers.length > 0) {
      offerCount = allOffers.length;
    }
  } catch (error) {
    console.error("Failed to query live counts for about page stats:", error);
  }

  // Format stats nicely
  const displayStores = storeCount > 1000 ? `${(storeCount / 1000).toFixed(1)}k+` : `${storeCount}+`;
  const displayOffers = offerCount > 1000 ? `${(offerCount / 1000).toFixed(1)}k+` : `${offerCount}+`;

  return (
    <div className="relative w-full overflow-hidden bg-black text-white selection:bg-[var(--color-primary)]/20 selection:text-white pb-24">
      {/* ─── Ambient Glow Blobs ─────────────────────────────────────────── */}
      <div
        className="pointer-events-none absolute -left-20 -top-40 h-[500px] w-[500px] rounded-full blur-[140px] opacity-40"
        style={{
          background: "radial-gradient(circle, rgba(163,230,53,0.18) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute right-10 top-1/3 h-[600px] w-[600px] rounded-full blur-[160px] opacity-30"
        style={{
          background: "radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute left-1/3 bottom-10 h-[500px] w-[500px] rounded-full blur-[150px] opacity-25"
        style={{
          background: "radial-gradient(circle, rgba(163,230,53,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-[1140px] px-4 sm:px-6 lg:px-8">
        {/* ════════════════════════════════════════════════════════════════════════
            SECTION 1: HERO HEADER
        ════════════════════════════════════════════════════════════════════════ */}
        <section className="pt-20 pb-16 sm:pt-28 sm:pb-24 max-w-4xl">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--color-primary)]">
            — {aboutData.heroKicker}
          </p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl leading-[1.08] uppercase">
            {aboutData.heroTitle}
          </h1>
          <p className="mt-6 text-[15px] sm:text-[17px] leading-[1.7] text-white/50 max-w-2xl font-medium">
            {aboutData.heroSubtitle}
          </p>
        </section>

        {/* ════════════════════════════════════════════════════════════════════════
            SECTION 2: PROBLEM & TIMELINE
        ════════════════════════════════════════════════════════════════════════ */}
        <section className="py-12 border-t border-white/5 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6 max-w-xl">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--color-primary)]">
              — {aboutData.problemKicker}
            </p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white uppercase">
              {aboutData.problemTitle}
            </h2>
            <div className="mt-6 space-y-5 text-[14px] leading-[1.75] text-white/40 font-medium">
              <p>{aboutData.problemDesc1}</p>
              <p>{aboutData.problemDesc2}</p>
            </div>
          </div>

          <div className="lg:col-span-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/60 mb-6 flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-[var(--color-primary)]"></span> Our Milestones
            </h3>
            {/* Timeline Wrapper */}
            <div className="relative pl-6 border-l border-white/5 space-y-8">
              {aboutData.milestones.map((milestone, idx) => (
                <div key={idx} className="relative group">
                  {/* Marker Dot */}
                  <div className="absolute -left-[30px] top-1.5 h-2 w-2 rounded-full border border-black bg-white/20 group-hover:bg-[var(--color-primary)] group-hover:scale-125 transition-all duration-300 shadow-[0_0_8px_rgba(255,255,255,0.2)] group-hover:shadow-[0_0_12px_#a3e635]" />
                  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                    <span className="text-[12px] font-black font-mono text-[var(--color-primary)] shrink-0 w-12">
                      {milestone.year}
                    </span>
                    <div>
                      <h4 className="text-[13px] font-black text-white/90 group-hover:text-white transition-colors">
                        {milestone.title}
                      </h4>
                      <p className="mt-1 text-[11px] leading-[1.6] text-white/40 font-medium">
                        {milestone.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════════
            SECTION 3: LIVE STATS GRID
        ════════════════════════════════════════════════════════════════════════ */}
        <section className="py-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
            {[
              { val: displayStores, sub: "STORES TRACKED", note: "Active merchants" },
              { val: "$18M+", sub: "USER SAVINGS", note: "Estimated value" },
              { val: displayOffers, sub: "ACTIVE OFFERS", note: "Verified promo codes" },
              { val: "98.6%", sub: "ACCURACY RATE", note: "Tested continuously" },
              { val: "$0.00", sub: "USER COST", note: "Free to browse" }
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-[#0b0b0b]/60 border border-white/5 rounded-2xl p-5 md:p-6 flex flex-col justify-between hover:border-[var(--color-primary)]/20 hover:bg-[#0c0c0c]/80 transition-all duration-300"
              >
                <div>
                  <p className="text-2xl md:text-3xl font-black text-white tracking-tight font-mono">
                    {stat.val}
                  </p>
                  <p className="mt-2 text-[10px] font-bold tracking-wider text-white/80 uppercase">
                    {stat.sub}
                  </p>
                </div>
                <p className="mt-3 text-[9px] text-white/30 font-medium">
                  {stat.note}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════════
            SECTION 4: CORE PRINCIPLES GRID
        ════════════════════════════════════════════════════════════════════════ */}
        <section className="py-16 border-t border-white/5">
          <div className="max-w-2xl">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--color-primary)]">
              — HOW WE BUILD
            </p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white uppercase">
              The principles behind how we build.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {aboutData.principles.map((principle, index) => (
              <div
                key={index}
                className="group relative bg-[#0a0a0a]/50 border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col justify-between hover:border-[var(--color-primary)]/20 hover:bg-[#0c0c0c]/70 transition-all duration-300 hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
                    <h3 className="text-[13px] font-black text-white uppercase tracking-tight">
                      {principle.title}
                    </h3>
                  </div>
                  <p className="mt-4 text-[11px] leading-[1.6] text-white/40 group-hover:text-white/50 transition-colors font-medium">
                    {principle.desc}
                  </p>
                </div>
                <div className="mt-6 flex justify-end">
                  <span className="text-[var(--color-primary)] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════════
            SECTION 5: METHODOLOGY & PROCESS
        ════════════════════════════════════════════════════════════════════════ */}
        <section className="py-12">
          <div className="bg-gradient-to-br from-[#0c0b0f] via-[#09090c] to-[#040405] border border-white/5 rounded-[32px] p-6 sm:p-10 lg:p-12 grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-6 flex flex-col justify-between h-full max-w-md">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-violet-400">
                  — {aboutData.methodologyKicker}
                </p>
                <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white uppercase leading-none">
                  {aboutData.methodologyTitle}
                </h2>
                <p className="mt-6 text-[12px] leading-[1.7] text-white/40 font-medium">
                  {aboutData.methodologySubtitle}
                </p>
              </div>
              <div className="mt-8">
                <Link
                  href="/stores"
                  className="inline-flex items-center gap-2 text-[12px] font-black uppercase tracking-wider text-violet-400 hover:text-violet-300 transition-colors group"
                >
                  {aboutData.methodologyLinkText}
                  <span className="group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-4">
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] transition-all">
                <div className="flex items-center gap-3">
                  <span className="h-5 w-5 rounded-md bg-violet-500/10 flex items-center justify-center text-violet-400">
                    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </span>
                  <h4 className="text-[12px] font-black text-white uppercase tracking-wider">
                    {aboutData.methodologyCard1Title}
                  </h4>
                </div>
                <p className="mt-2 text-[11px] leading-[1.65] text-white/40 font-medium">
                  {aboutData.methodologyCard1Desc}
                </p>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] transition-all">
                <div className="flex items-center gap-3">
                  <span className="h-5 w-5 rounded-md bg-violet-500/10 flex items-center justify-center text-violet-400">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                      <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                      <line x1="6" y1="6" x2="6.01" y2="6" />
                      <line x1="6" y1="18" x2="6.01" y2="18" />
                    </svg>
                  </span>
                  <h4 className="text-[12px] font-black text-white uppercase tracking-wider">
                    {aboutData.methodologyCard2Title}
                  </h4>
                </div>
                <p className="mt-2 text-[11px] leading-[1.65] text-white/40 font-medium">
                  {aboutData.methodologyCard2Desc}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════════
            SECTION 6: TEAM & OUTREACH GRID
        ════════════════════════════════════════════════════════════════════════ */}
        <section className="py-16 border-t border-white/5">
          <div className="max-w-2xl">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--color-primary)]">
              — {aboutData.teamKicker}
            </p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white uppercase">
              {aboutData.teamTitle}
            </h2>
            <p className="mt-4 text-[12px] leading-[1.7] text-white/40 font-medium">
              {aboutData.teamSubtitle}
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {aboutData.teamCards.map((box, i) => (
              <div
                key={i}
                className="bg-[#0b0b0b] border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:border-white/15 transition-all duration-300"
              >
                <div>
                  <h3 className="text-[12px] font-black text-white uppercase tracking-wider">
                    {box.title}
                  </h3>
                  <p className="mt-3 text-[11px] leading-[1.65] text-white/40 font-medium">
                    {box.desc}
                  </p>
                </div>
                <div className="mt-6">
                  <Link
                    href={box.url}
                    className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
                  >
                    {box.cta}
                    <span>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════════
            SECTION 7: BOTTOM CTA
        ════════════════════════════════════════════════════════════════════════ */}
        <section className="py-16 border-t border-white/5 text-center flex flex-col items-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-white uppercase max-w-xl leading-tight">
            {aboutData.ctaTitle}
          </h2>
          <p className="mt-4 text-[12px] text-white/40 max-w-md font-medium leading-[1.7]">
            {aboutData.ctaSubtitle}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/stores"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[var(--color-primary)] text-black text-[12px] font-black uppercase tracking-wider hover:bg-[var(--color-primary-hover)] transition-colors text-center shadow-[0_4px_20px_rgba(163,230,53,0.2)]"
            >
              {aboutData.ctaButton1Text}
            </Link>
            <Link
              href="/blog"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-[12px] font-black uppercase tracking-wider hover:bg-white/[0.08] transition-colors text-center"
            >
              {aboutData.ctaButton2Text}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

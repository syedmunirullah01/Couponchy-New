import Image from "next/image";
import Link from "next/link";
import NoTranslateText from "@/components/shared/NoTranslateText";

function StoreLogo({ size = "large", logoText, logoClassName, logoImage, name }) {
  const dim = 
    size === "large" ? "h-36 w-36" : 
    size === "medium" ? "h-[80px] w-[80px]" : 
    "h-16 w-16";
  return (
    <div className={`${dim} shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white shadow-md`}>
      {logoImage ? (
        <div className="relative h-full w-full bg-white">
          <Image src={logoImage} alt={`${name} logo`} fill className="object-contain p-0" unoptimized />
        </div>
      ) : (
        <div className={`flex h-full w-full items-center justify-center rounded-2xl text-center ${logoClassName} notranslate`}>
          <span>{logoText}</span>
        </div>
      )}
    </div>
  );
}

export function BrandMark(props) {
  return <StoreLogo {...props} />;
}

export default function StoreHeader({ singleStore, storeTabs, offerTabs }) {
  const storeTabTargets = {
    Coupons: "#coupons",
    "Store Info": "#store-info",
    FAQs: "#faqs",
  };

  const totalOffers = singleStore.activeCoupons + singleStore.activeDeals;
  const date = new Date();
  const currentMonth = date.toLocaleString("en-US", { month: "long" });
  const currentYear = date.getFullYear();

  return (
    <section className="mb-10 overflow-hidden rounded-[32px] relative" style={{
      background: "linear-gradient(135deg, #090f05 0%, #0c1507 50%, #050804 100%)",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
    }}>
      {/* Crisp Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_80%,transparent_100%)] pointer-events-none z-0" />

      <div className="relative px-5 pt-6 pb-0 sm:px-10 sm:pt-10 z-10">

        {/* ── Top status bar ── */}
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md">
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#a3e635]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a3e635]">
              {totalOffers} Active {totalOffers === 1 ? "Offer" : "Offers"} Live Now
            </span>
          </div>
        </div>

        {/* ── Store identity row ── */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
          {/* Logo + Visit Button Column — centered on mobile, left-aligned on desktop */}
          <div className="flex flex-col items-center gap-3 shrink-0">
            <div className="h-24 w-24 sm:h-36 sm:w-36">
              <StoreLogo
                size="large"
                logoText={singleStore.logoText}
                logoClassName={singleStore.logoClassName}
                logoImage={singleStore.logoImage}
                name={singleStore.name}
              />
            </div>

            {/* Visit Store Button */}
            <a
              href={singleStore.affiliateLink || "#"}
              target={singleStore.affiliateLink ? "_blank" : undefined}
              rel={singleStore.affiliateLink ? "noreferrer noopener" : undefined}
              className="group relative flex items-center justify-center gap-2 rounded-xl py-2.5 px-5 text-[11px] font-black uppercase tracking-wider text-black transition-all duration-300 hover:-translate-y-0.5 w-36 sm:py-3 sm:text-[12px]"
              style={{
                background: "linear-gradient(135deg, #a3e635 0%, #84cc16 100%)",
                boxShadow: "0 4px 14px rgba(0, 0, 0, 0.25)",
              }}
            >
              <span className="relative">Visit Store</span>
              <svg className="relative h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          {/* Store name + meta — center-aligned on mobile */}
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <h1 className="text-xl font-black leading-[1.2] tracking-tight sm:text-4xl lg:text-6xl text-white" suppressHydrationWarning>
              <span className="notranslate">{singleStore.name} </span>Coupon And Discount Codes {currentMonth} {currentYear}
            </h1>

            {/* Stars */}
            <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <div className="flex gap-0.5 bg-white/5 px-2 py-0.5 rounded-lg border border-white/10">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} viewBox="0 0 20 20" fill="#fbbf24" className="h-4 w-4">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm font-black text-[#fbbf24]" suppressHydrationWarning>{singleStore.rating}</span>
              <span className="hidden sm:inline text-white/20">·</span>
              <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider text-white/40">
                <NoTranslateText text={singleStore.partnerText} storeName={singleStore.name} />
              </span>
            </div>

            {/* Trust chips */}
            <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
              {[
                { icon: "✓", label: "Verified Codes", color: "text-[#a3e635]" },
                { icon: "🔥", label: "Community Verified", color: "text-orange-300" },
                { icon: "🔒", label: "100% Free", color: "text-sky-300" },
                { icon: "⚡", label: "Instant Savings", color: "text-purple-300" },
              ].map(({ icon, label, color }) => (
                <span
                  key={label}
                  className={`inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] sm:text-[11px] font-bold transition-all duration-200 hover:bg-white/10 hover:border-white/20 cursor-default ${color}`}
                >
                  <span className="text-xs">{icon}</span> {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Navigation tabs ── */}
        <div className="mt-8 flex items-end gap-1 border-t border-white/10 overflow-x-auto scrollbar-none">
          {storeTabs.map((tab, index) => (
            <Link
              key={tab}
              href={storeTabTargets[tab] || "#"}
              className={`relative -mb-px shrink-0 rounded-t-xl px-5 py-3 text-[10px] sm:px-7 sm:py-3.5 sm:text-xs font-black uppercase tracking-[0.15em] sm:tracking-[0.18em] transition-all duration-200 ${
                index === 0
                  ? "border border-b-transparent border-white/15 bg-white/5 text-[#a3e635]"
                  : "border border-transparent text-white/40 hover:bg-white/5 hover:text-white/70"
              }`}
            >
              {index === 0 && (
                <span className="absolute inset-x-0 top-0 h-0.5 rounded-full bg-[#a3e635]" />
              )}
              {tab}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

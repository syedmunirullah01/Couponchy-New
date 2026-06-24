import Link from "next/link";
import Image from "next/image";

function ShieldCheckIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 11 2 2 4-4" />
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

export default function StoreSpotlightCard({ store, index = 0 }) {
  const offerCount = Number(store.offer?.split(" ")[0] ?? 0);
  const offerLabel = offerCount > 0 ? `${offerCount} Active Offers` : "New Merchant";
  
  const shortMark = (store.logoText || store.name)
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Deterministic color palette for avatar fallback
  const charCode = (store.name || "A").charCodeAt(0);
  const hueRotate = ((charCode * 43) % 80) - 40; // shift green from -40 to +40 deg

  return (
    <Link
      href={store.href ?? "#"}
      className="trending-store-card group relative block overflow-hidden rounded-[32px] border bg-[#080808]/90 transition-all duration-500 hover:-translate-y-2 hover:border-[var(--accent)]/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6),0_0_20px_rgba(163,230,53,0.03)]"
      style={{
        borderColor: "rgba(255, 255, 255, 0.04)",
        animationDelay: `${index * 75}ms`,
      }}
    >
      {/* Background Animated Gradient Mesh */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
        style={{
          background: `radial-gradient(ellipse at top left, rgba(163, 230, 53, 0.08), transparent 60%), radial-gradient(ellipse at bottom right, rgba(163, 230, 53, 0.03), transparent 60%)`
        }}
      />

      {/* Decorative ambient glowing circle inside the card */}
      <div className="pointer-events-none absolute -top-12 -left-12 h-32 w-32 rounded-full bg-[var(--accent)]/3 blur-[35px] transition-all duration-500 group-hover:bg-[var(--accent)]/6 group-hover:scale-125" />

      {/* Outer Border Glow on Hover */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-[var(--accent)]/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative flex min-h-[360px] flex-col items-center p-7 text-center z-10">
        {/* Top Header Row (Badge + Pulse Dot) */}
        <div className="mb-6 flex w-full items-center justify-between">
          <span 
            className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.15em]"
            style={{
              borderColor: "rgba(255, 255, 255, 0.06)",
              background: "rgba(255, 255, 255, 0.02)",
              color: "rgba(255, 255, 255, 0.5)",
            }}
          >
            <ShieldCheckIcon />
            {toTitleCase(store.trustStatus ?? "Verified")}
          </span>
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)]/40 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]"></span>
          </div>
        </div>

        {/* Store Logo Emblem */}
        <div className="relative mb-7">
          {/* Rotating halo background */}
          <div className="absolute -inset-2 rounded-[36px] bg-gradient-to-tr from-[var(--accent)]/15 via-transparent to-[var(--accent)]/5 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100" />
          
          {store.logoImage ? (
            <div 
              className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-[26px] border bg-[#111111]/85 transition-all duration-500 group-hover:scale-105"
              style={{
                borderColor: "rgba(255, 255, 255, 0.08)",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
              }}
            >
              <Image 
                src={store.logoImage} 
                alt={`${store.name} logo`} 
                fill 
                className="object-cover transition-transform duration-500 group-hover:scale-105" 
                unoptimized 
              />
            </div>
          ) : (
            <div 
              className="relative flex h-20 w-20 items-center justify-center rounded-[26px] border text-xl font-black transition-all duration-500 group-hover:scale-105 notranslate"
              style={{
                background: `linear-gradient(135deg, rgba(163, 230, 53, 0.15), rgba(10, 10, 10, 0.8))`,
                borderColor: "rgba(163, 230, 53, 0.2)",
                color: `hsl(${83 + hueRotate}, 85%, 65%)`,
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
              }}
            >
              {shortMark}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex flex-1 flex-col justify-between w-full">
          <div>
            <h3 className="text-lg font-black italic tracking-tight text-white transition-colors duration-300 group-hover:text-[var(--accent)] notranslate">
              {toTitleCase(store.name)}
            </h3>
            
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.15em] bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/15">
              {toTitleCase(offerLabel)}
            </div>
          </div>

          {/* Action Button at bottom */}
          <div className="pt-6">
            <div 
              className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] transition-all duration-300 group-hover:bg-[var(--accent)] group-hover:text-black group-hover:shadow-[0_0_15px_rgba(163,230,53,0.25)]"
              style={{
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                color: "rgba(255, 255, 255, 0.4)",
              }}
            >
              <span>View Store</span>
              <ArrowIcon />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

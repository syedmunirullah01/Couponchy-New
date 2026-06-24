"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

function SparkIcon() {
  return (
    <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </svg>
  );
}

function FireIcon() {
  return (
    <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}

function ScissorsIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="9.8" y1="8.2" x2="22" y2="20" />
      <line x1="9.8" y1="15.8" x2="22" y2="4" />
    </svg>
  );
}

function MicroBarcode({ className }) {
  return (
    <svg className={className} viewBox="0 0 100 20" fill="currentColor">
      <rect x="0" y="0" width="3" height="20" />
      <rect x="5" y="0" width="1" height="20" />
      <rect x="8" y="0" width="4" height="20" />
      <rect x="14" y="0" width="2" height="20" />
      <rect x="18" y="0" width="1" height="20" />
      <rect x="21" y="0" width="3" height="20" />
      <rect x="26" y="0" width="2" height="20" />
      <rect x="30" y="0" width="1" height="20" />
      <rect x="33" y="0" width="5" height="20" />
      <rect x="40" y="0" width="2" height="20" />
      <rect x="44" y="0" width="1" height="20" />
      <rect x="47" y="0" width="3" height="20" />
      <rect x="52" y="0" width="4" height="20" />
      <rect x="58" y="0" width="1" height="20" />
      <rect x="61" y="0" width="2" height="20" />
      <rect x="65" y="0" width="3" height="20" />
      <rect x="70" y="0" width="1" height="20" />
      <rect x="73" y="0" width="5" height="20" />
      <rect x="80" y="0" width="2" height="20" />
      <rect x="84" y="0" width="1" height="20" />
      <rect x="87" y="0" width="4" height="20" />
      <rect x="93" y="0" width="2" height="20" />
      <rect x="97" y="0" width="3" height="20" />
    </svg>
  );
}

function toTitleCase(str) {
  if (!str) return "";
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function FeaturedCouponCard({ coupon, index = 0 }) {
  const isHighlight = coupon.highlight;
  const [copied, setCopied] = useState(false);

  // Extract uses counts dynamically for a cleaner card layout
  const usesMatch = coupon.description?.match(/(\d+,?\d*)\s+uses/i);
  const usesCount = usesMatch ? usesMatch[1] : null;
  const cleanDescription = coupon.description
    ? coupon.description.replace(/\.?\s*\d+,?\d*\s+uses\.?/i, "").trim()
    : "";

  const handleCtaClick = (e) => {
    if (coupon.type === "Coupon" && coupon.code) {
      navigator.clipboard.writeText(coupon.code).catch((err) => {
        console.error("Failed to copy coupon code:", err);
      });
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const offerHref = coupon.affiliateLink || coupon.storeAffiliateLink || `/stores/${coupon.categorySlug || "all"}/${coupon.brandSlug}`;
  const isExternal = Boolean(coupon.affiliateLink || coupon.storeAffiliateLink);

  return (
    <article
      className={cn(
        "featured-coupon-card group relative flex flex-col overflow-hidden rounded-3xl border transition-all duration-500 hover:-translate-y-1.5",
        isHighlight
          ? "border-white/20 bg-gradient-to-br from-white via-white to-gray-200 text-black shadow-[0_15px_35px_rgba(163,230,53,0.15)] hover:shadow-[0_25px_50px_rgba(163,230,53,0.22)]"
          : "border-white/5 bg-[#080808]/95 text-white hover:border-[var(--accent)]/30 hover:shadow-[0_15px_35px_rgba(0,0,0,0.6)]"
      )}
      style={{
        animationDelay: `${index * 80}ms`,
      }}
    >
      {/* Glow Blob for Regular Dark Cards */}
      {!isHighlight && (
        <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-[var(--accent)]/4 blur-[40px] transition-all duration-700 group-hover:scale-125 group-hover:bg-[var(--accent)]/8" />
      )}

      {/* Top Section */}
      <div className="relative flex flex-col p-6 pb-5">
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em]",
              isHighlight
                ? "bg-black/5 border-black/10 text-black/75"
                : "bg-white/5 border-white/10 text-white/75"
            )}
          >
            {toTitleCase(coupon.tag || "Active")}
          </span>

          {usesCount && (
            <div
              className={cn(
                "flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em]",
                isHighlight
                  ? "bg-black/10 text-black"
                  : "bg-[var(--accent)]/10 text-[var(--accent)]"
              )}
            >
              <FireIcon />
              <span>{usesCount} Verified Uses</span>
            </div>
          )}
        </div>

        <div className="mt-7 flex flex-col relative">
          <p
            className={cn(
              "text-[9px] font-black uppercase tracking-[0.22em]",
              isHighlight ? "text-black/40" : "text-white/40"
            )}
          >
            Exclusive {coupon.type || "Deal"}
          </p>
          
          <Link
            href={offerHref}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noreferrer" : undefined}
            onClick={handleCtaClick}
            className="group/title block mt-1.5"
          >
            <h3
              className={cn(
                "text-xl sm:text-2xl font-black tracking-tight italic leading-tight transition-colors duration-300 line-clamp-2 min-h-[3.25rem] flex items-center group-hover/title:opacity-85",
                isHighlight 
                  ? "text-black hover:text-black/80" 
                  : "text-[var(--accent)] hover:text-[var(--accent)]/80"
              )}
            >
              {coupon.title || coupon.value}
            </h3>
          </Link>

          <Link
            href={`/stores/${coupon.categorySlug || "all"}/${coupon.brandSlug}`}
            className="block mt-2 self-start animate-none"
          >
            <p
              className={cn(
                "text-[11px] font-bold tracking-tight hover:underline transition-colors",
                isHighlight ? "text-black/60 hover:text-black" : "text-white/60 hover:text-[var(--accent)]"
              )}
            >
              At <span className="notranslate">{toTitleCase(coupon.brand)}</span>
            </p>
          </Link>
        </div>
      </div>

      {/* Separator with Cut-outs & Dashed separator line */}
      <div className="relative flex items-center px-0">
        <div
          className={cn(
            "absolute -left-3 h-6 w-6 rounded-full border-r z-10",
            isHighlight ? "bg-[#020202] border-white/5" : "bg-black border-white/5"
          )}
          style={{
            boxShadow: isHighlight 
              ? "inset -3px 0 5px rgba(0,0,0,0.1)" 
              : "inset -3px 0 5px rgba(0,0,0,0.4)"
          }}
        />
        <div
          className={cn(
            "w-full border-t border-dashed",
            isHighlight ? "border-black/20" : "border-white/10"
          )}
        />
        <div
          className={cn(
            "absolute -right-3 h-6 w-6 rounded-full border-l z-10",
            isHighlight ? "bg-[#020202] border-white/5" : "bg-black border-white/5"
          )}
          style={{
            boxShadow: isHighlight 
              ? "inset 3px 0 5px rgba(0,0,0,0.1)" 
              : "inset 3px 0 5px rgba(0,0,0,0.4)"
          }}
        />
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col p-6 pt-5">
        <p
          className={cn(
            "mb-6 text-xs leading-relaxed line-clamp-2 min-h-[2.5rem]",
            isHighlight ? "text-black/70" : "text-white/50"
          )}
        >
          {cleanDescription}
        </p>

        {/* Barcode Watermark */}
        <div className="mb-4 flex items-center justify-between opacity-25 group-hover:opacity-40 transition-opacity duration-300">
          <MicroBarcode className={isHighlight ? "h-4 text-black" : "h-4 text-white"} />
          <span
            className={cn(
              "text-[8px] font-mono tracking-widest",
              isHighlight ? "text-black" : "text-white"
            )}
          >
            #EP-{coupon.id ? coupon.id.slice(0, 5).toUpperCase() : `${index}99X`}
          </span>
        </div>

        {/* Ticket Style Button */}
        <Link
          href={offerHref}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noreferrer" : undefined}
          onClick={handleCtaClick}
          className={cn(
            "group/btn relative flex w-full items-center overflow-hidden rounded-2xl transition-all duration-300 active:scale-[0.98] cursor-pointer",
            isHighlight
              ? "bg-[#0c0c0c] text-white hover:bg-black"
              : "bg-[var(--accent)] text-black hover:bg-[#b8f15c] hover:shadow-[0_0_15px_rgba(163,230,53,0.35)]"
          )}
        >
          <div className="flex-1 py-3.5 px-4 text-center text-[10px] font-black uppercase tracking-[0.18em] flex items-center justify-center gap-2">
            {coupon.type === "Coupon" && coupon.code ? <ScissorsIcon /> : null}
            <span>
              {copied 
                ? "Copied!" 
                : coupon.type === "Coupon" && coupon.code 
                  ? "Copy Code" 
                  : "Get Deal"}
            </span>
          </div>
          <div
            className={cn(
              "relative flex h-full items-center justify-center px-4 py-3.5 border-l border-dashed",
              isHighlight ? "bg-white/10 border-white/20" : "bg-black/10 border-black/20"
            )}
          >
            <span
              className={cn(
                "text-[9px] font-black uppercase tracking-wider",
                isHighlight ? "text-white/70" : "text-black/70"
              )}
            >
              {coupon.type === "Coupon" ? "Code" : "Deal"}
            </span>
          </div>

          {/* Shimmer Overlay on hover */}
          <div className="absolute inset-0 bg-white/0 transition-colors group-hover/btn:bg-white/5" />
        </Link>
      </div>
    </article>
  );
}


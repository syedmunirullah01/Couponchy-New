"use client";

import { useState } from "react";
import Link from "next/link";
import { buildCountryPath } from "@/lib/countries";
import { BrandMark } from "./StoreHeader";

const TRUST_POINTS = [
  { icon: "✓", label: "Manually verified codes from official stores" },
  { icon: "🔄", label: "Updated regularly — expired codes removed" },
  { icon: "👥", label: "Community success ratings on every code" },
  { icon: "🔒", label: "Zero fees, no account needed to save" },
  { icon: "🎯", label: "Best codes always shown first" },
];

export default function StoreSidebar({ singleStore, relatedStores }) {
  const storeVisitHref = singleStore.affiliateLink || "#";
  const [feedback, setFeedback] = useState("");

  return (
    <aside className="w-full space-y-4 lg:w-[290px] lg:shrink-0">

      {/* ═══ About Brand Card ════════════════════════════════ */}
      <div className="rounded-[22px] border border-white/8 bg-[#0c0e09] p-5">
        <div className="mb-3.5 flex items-center gap-2">
          <span className="text-base">🏪</span>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">About {singleStore.name}</p>
        </div>
        <p className="text-xs leading-6 text-white/55 font-medium">
          {singleStore.description || `${singleStore.name} is a popular online retailer in the ${singleStore.category} category. Save today with verified promo codes, discount coupons, and hot deals hand-picked by Couponchy.`}
        </p>
      </div>


      {/* ═══ Helpful? ═════════════════════════════════════════== */}
      <div className="rounded-[22px] border border-white/8 bg-[#0c0e09] p-5">
        <p className="text-center text-sm font-black text-white">These deals helpful? 🙏</p>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {[
            { val: "yes", icon: "👍", label: "Yes!", active: "border-[#a3e635]/40 bg-[#a3e635]/15 text-[#a3e635]" },
            { val: "no", icon: "👎", label: "Not really", active: "border-rose-400/40 bg-rose-400/12 text-rose-400" },
          ].map(({ val, icon, label, active }) => (
            <button
              key={val}
              type="button"
              onClick={() => setFeedback(val)}
              className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-bold transition-all duration-200 ${
                feedback === val
                  ? active
                  : "border-white/10 bg-white/3 text-white/40 hover:bg-white/6 hover:text-white/60"
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>
        {feedback && (
          <p className="mt-3 text-center text-xs font-black text-[#a3e635]">✓ Thanks for the feedback!</p>
        )}
      </div>

      {/* ═══ Trust Section ═════════════════════════════════════ */}
      <div className="rounded-[22px] border border-white/8 bg-[#0c0e09] p-5">
        <p className="mb-4 text-[11px] font-black uppercase tracking-[0.18em] text-white/35">Why Trust Couponchy?</p>
        <div className="space-y-3">
          {TRUST_POINTS.map(({ icon, label }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-xl bg-[#a3e635]/12 text-[11px]">
                {icon}
              </div>
              <span className="text-xs leading-5 text-white/50">{label}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 border-t border-white/5 pt-3 text-[10px] text-white/20">
          Last updated: {singleStore.updatedAt}
        </p>
      </div>

      {/* ═══ Similar Stores ════════════════════════════════════ */}
      {relatedStores?.length > 0 && (
        <div className="rounded-[22px] border border-white/8 bg-[#0c0e09] p-5">
          <p className="mb-4 text-[11px] font-black uppercase tracking-[0.18em] text-white/35">Similar Stores</p>
          <div className="grid grid-cols-2 gap-3">
            {relatedStores.map((store) => (
              <Link
                key={store.name}
                href={buildCountryPath(`/stores/${store.categorySlug}/${store.slug}`, singleStore.countryCode)}
                className="group flex flex-col items-center gap-2.5 rounded-2xl border border-white/5 bg-white/2 p-4 text-center transition-all hover:border-[#a3e635]/25 hover:bg-[#a3e635]/6 hover:-translate-y-0.5"
              >
                <BrandMark size="medium" logoText={store.logoText} logoClassName={store.logoClassName} logoImage={store.logoImage} name={store.name} />
                <p className="w-full truncate text-xs font-semibold text-white/35 group-hover:text-white/65 transition-colors notranslate">{store.name}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

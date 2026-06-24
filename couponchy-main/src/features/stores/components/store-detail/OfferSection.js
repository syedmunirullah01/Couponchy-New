"use client";

import { useMemo, useState } from "react";
import OfferList from "./OfferList";

const TAB_KEYS = ["all", "coupon", "deal"];

const TAB_ICONS = {
  all: "🏷️",
  coupon: "🎫",
  deal: "⚡",
};

export default function OfferSection({ offerTabs, offers, store }) {
  const [activeTab, setActiveTab] = useState("all");

  const filteredOffers = useMemo(() => {
    if (activeTab === "all") return offers;
    return offers.filter((offer) => offer.type?.toLowerCase() === activeTab);
  }, [activeTab, offers]);

  return (
    <>
      {/* Section heading */}
      <div id="coupons" className="scroll-mt-28 mb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-black text-white sm:text-2xl tracking-tight">
              Today's Active <span className="notranslate">{store.name} </span>Promo &amp; Discount Codes
            </h2>
            <p className="mt-1 text-sm text-white/45">
              {offers.length} verified {offers.length === 1 ? "offer" : "offers"} available · Click to reveal codes
            </p>
          </div>

          {/* Sort/filter note */}
          <div className="inline-flex items-center gap-1.5 rounded-xl border border-[#a3e635]/20 bg-[#a3e635]/8 px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#a3e635] animate-pulse" />
            <span className="text-[11px] font-bold text-[#a3e635]">Best codes first</span>
          </div>
        </div>

        {/* Tab bar */}
        <div className="mt-4 flex gap-2">
          {offerTabs.map((tab, index) => {
            const key = TAB_KEYS[index] || "all";
            const isActive = activeTab === key;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-bold transition-all ${
                  isActive
                    ? "border-[#a3e635]/35 bg-[#a3e635]/15 text-[#a3e635] shadow-sm"
                    : "border-white/8 bg-white/3 text-white/45 hover:border-white/15 hover:bg-white/6 hover:text-white/65"
                }`}
              >
                <span>{TAB_ICONS[key]}</span>
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Offer list */}
      <div className="space-y-4">
        <OfferList offers={filteredOffers} store={store} />
        {filteredOffers.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-[22px] border border-white/8 bg-white/2 py-16 text-center">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-bold text-white">No offers in this category</p>
            <p className="mt-1 text-sm text-white/40">Try switching to "All" to see all available offers</p>
          </div>
        )}
      </div>
    </>
  );
}

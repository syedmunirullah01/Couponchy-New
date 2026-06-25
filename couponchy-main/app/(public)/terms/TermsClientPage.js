"use client";

import { useState } from "react";
import Link from "next/link";

const defaultTermsData = {
  title: "Terms Of Service",
  heroTitle: "Terms of Service",
  heroSubtitle: "Clear guidelines for a transparent saving experience. Please read these terms carefully before using Couponchy.",
  disclaimerTitle: "Important Disclaimer",
  disclaimerText: "Couponchy is a coupon sharing directory and is not affiliated with or endorsed by the brands listed on our platform. Coupon codes are submitted by users and gathered from public sources; we do not guarantee that any code will work, and we are not liable for any issues during merchant checkouts.",
  highlights: [
    { title: "Acceptable Use", desc: "Use Couponchy for personal, non-commercial coupon hunting. Do not scrape our verified promo code indexes." },
    { title: "Community Voting", desc: "Be honest. Upvote working coupons and downvote expired ones to help keep Couponchy clean." },
    { title: "No Warranty on Deals", desc: "Merchants control their discounts. We cannot guarantee that any promo code will save you money." },
    { title: "Account Security", desc: "Keep your login details confidential. You are responsible for all coupon submissions under your profile." }
  ],
  clauses: [
    {
      id: "services",
      title: "1. Description of Services & Eligibility",
      content: "Couponchy provides a directory of verified coupon codes, sales, and promo links for retail brands. You must be at least 13 years of age to register an account or submit coupon codes. By accessing our website, you warrant that you meet this requirement and agree to abide by these Terms of Service."
    },
    {
      id: "submissions",
      title: "2. User Submissions & Content",
      content: "When you submit a coupon code or vote on active promotions, you grant Couponchy a perpetual, worldwide, royalty-free license to display, modify, and publish this content. You agree that you will not submit false, misleading, spammy, or duplicate promotional offers."
    },
    {
      id: "conduct",
      title: "3. Prohibited Conduct",
      content: "You agree not to use automated crawlers, bots, or scrapers to copy coupon codes or store information from Couponchy. You may not attempt to disrupt the performance of our verification checkout test servers or exploit community voting metrics."
    },
    {
      id: "disclaimer",
      title: "4. Disclaimer of Warranties",
      content: "Couponchy is provided on an 'as-is' and 'as-available' basis. We make no representations or warranties of any kind regarding the validity, accuracy, or availability of any coupon code, merchant listing, or discount percentage. All coupon redemptions are subject to merchant approval at checkout."
    },
    {
      id: "liability",
      title: "5. Limitation of Liability",
      content: "In no event shall Couponchy, its engineers, partners, or owners be liable for any direct, indirect, incidental, or consequential damages resulting from your use or inability to use our website, including checkout errors, cart order failures, or merchant billing disputes."
    },
    {
      id: "disputes",
      title: "6. Governing Law & Dispute Resolution",
      content: "These terms and your use of Couponchy shall be governed by and construed in accordance with local regulations, without regard to its conflict of law principles. Any dispute arising under these terms shall be subject to the exclusive jurisdiction of the regional courts."
    }
  ]
};

function getTermsData(pageObj) {
  if (!pageObj || typeof pageObj === "string" || !pageObj.heroTitle) {
    return { ...defaultTermsData };
  }
  return { ...defaultTermsData, ...pageObj };
}

export default function TermsClientPage({ pageData }) {
  const termsData = getTermsData(pageData);
  const [expandedClauses, setExpandedClauses] = useState([]);

  const toggleClause = (id) => {
    setExpandedClauses((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

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
        className="pointer-events-none absolute right-10 top-1/3 h-[600px] w-[600px] rounded-full blur-[160px] opacity-35"
        style={{
          background: "radial-gradient(circle, rgba(147,51,234,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-[960px] px-4 sm:px-6 lg:px-8">
        {/* ════════════════════════════════════════════════════════════════════════
            SECTION 1: HERO HEADER
        ════════════════════════════════════════════════════════════════════════ */}
        <section className="pt-20 pb-12 sm:pt-28 sm:pb-16 max-w-4xl text-center flex flex-col items-center">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--color-primary)]">
            — TERMS OF SERVICE
          </p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl leading-[1.08] uppercase">
            {termsData.heroTitle}
          </h1>
          <p className="mt-6 text-[15px] leading-[1.7] text-white/50 max-w-2xl font-medium">
            {termsData.heroSubtitle}
          </p>
        </section>

        {/* ════════════════════════════════════════════════════════════════════════
            SECTION 2: CORE HIGHLIGHTS GRID
        ════════════════════════════════════════════════════════════════════════ */}
        <section className="py-10 border-t border-white/5">
          <div className="grid gap-4 sm:grid-cols-2">
            {(termsData.highlights || []).map((highlight, index) => (
              <div
                key={index}
                className="bg-[#0b0b0b]/60 border border-white/5 rounded-2xl p-5 hover:border-[var(--color-primary)]/20 hover:bg-[#0d0d0d]/80 transition-all duration-300 flex items-start gap-4"
              >
                <span className="text-[var(--color-primary)] shrink-0 mt-0.5 text-xs">✓</span>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    {highlight.title}
                  </h3>
                  <p className="mt-2 text-[11px] leading-[1.65] text-white/40 font-medium">
                    {highlight.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════════
            SECTION 3: LIABILITY DISCLAIMER BANNER
        ════════════════════════════════════════════════════════════════════════ */}
        <section className="py-8">
          <div className="bg-[#0d0505]/40 border border-red-500/10 rounded-2xl p-6 flex flex-col sm:flex-row gap-4 items-start shadow-[0_0_20px_rgba(239,68,68,0.01)]">
            <span className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center text-xs font-black text-red-400 border border-red-500/20 shrink-0 mt-0.5">
              ⚠
            </span>
            <div>
              <h4 className="text-xs font-extrabold text-red-400 uppercase tracking-wider">
                {termsData.disclaimerTitle}
              </h4>
              <p className="mt-2 text-[11px] leading-[1.65] text-white/45 font-medium">
                {termsData.disclaimerText}
              </p>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════════
            SECTION 4: LEGAL CLAUSES ACCORDION
        ════════════════════════════════════════════════════════════════════════ */}
        <section className="py-12 border-t border-white/5 mt-6 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-white uppercase tracking-tight">
              Detailed Conditions
            </h2>
            <p className="mt-2 text-xs text-white/40 font-medium">
              Click any section below to expand and read the full legal clauses.
            </p>
          </div>

          <div className="space-y-3">
            {(termsData.clauses || []).map((clause) => {
              const isOpen = expandedClauses.includes(clause.id);
              return (
                <div
                  key={clause.id}
                  className="bg-[#090909]/60 border border-white/5 rounded-xl overflow-hidden transition-all duration-300"
                >
                  <button
                    type="button"
                    onClick={() => toggleClause(clause.id)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 cursor-pointer text-xs font-bold text-white/80 hover:text-white hover:bg-white/[0.01] transition-all"
                  >
                    <span>{clause.title}</span>
                    <span className={`text-white/30 transform transition-transform duration-300 shrink-0 ${isOpen ? "rotate-90 text-[var(--color-primary)]" : ""}`}>
                      ▶
                    </span>
                  </button>

                  <div
                    className={`transition-all duration-300 ease-in-out ${
                      isOpen ? "max-h-[350px] border-t border-white/5 py-4 px-5 opacity-100" : "max-h-0 opacity-0 pointer-events-none overflow-hidden"
                    }`}
                  >
                    <p className="text-[11px] leading-[1.7] text-white/40 font-medium font-sans">
                      {clause.content}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

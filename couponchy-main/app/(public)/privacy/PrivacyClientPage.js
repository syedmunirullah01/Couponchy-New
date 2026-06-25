"use client";

import { useState } from "react";
import Link from "next/link";

const defaultPrivacyData = {
  title: "Privacy Policy",
  heroTitle: "Your privacy is our baseline, not a feature.",
  heroSubtitle: "Most coupon websites track your clicks and sell your shopping profiles. Couponchy is different. We believe savings shouldn't cost you your personal data, so we've engineered our directory to be private by design.",
  
  aggregatorTitle: "Aggregator Tracking Model",
  aggregatorNote: "Reduces browser speeds and monetizes your private actions.",
  aggregatorItems: [
    { title: "Browser History Profiling", desc: "Monitors other open tabs and records your general search behavior across the web." },
    { title: "Behavioral Ad Pixels", desc: "Injects Facebook, Google, and marketing cookies to retarget ads based on store visits." },
    { title: "Database Sharing", desc: "Shares or rents email databases and cart categories to external retail networks." },
    { title: "Hidden Popups & Redirects", desc: "Fires popups and click-to-reveal redirects that execute tracking redirects behind your active browser." }
  ],
  
  couponchyTitle: "Couponchy Privacy Model",
  couponchyNote: "Protects browser integrity and puts privacy first.",
  couponchyItems: [
    { title: "Anonymized Search Queries", desc: "Search terms look up store coupons on our server without tracking who sent the request." },
    { title: "Zero Marketing Trackers", desc: "We never drop Facebook Pixels, AdWords remarketing pixels, or third-party behavioral trackers." },
    { title: "Secure Account Vault", desc: "Your name and email address are encrypted and never sold, leased, or shared." },
    { title: "Clean User Experience", desc: "We only display codes and success indicators on-page. No popups, extensions, or background redirects." }
  ],

  commitmentsTitle: "Six things we will never do.",
  commitments: [
    { title: "No browser monitoring", desc: "We never check other active browser tabs, search queries, or general shopping websites." },
    { title: "No behavioral ad profiling", desc: "We never show targeted remarketing ads or build individual interest categories." },
    { title: "No database selling", desc: "Your profile details, email address, and bookmarks will never be shared with marketers." },
    { title: "No hidden background scripts", desc: "We never inject background scripts, tracking pixels, or execute redirect tags." },
    { title: "No review manipulation", desc: "We never change coupon success rates, store ratings, or reviews in exchange for payments." },
    { title: "No browser access triggers", desc: "We never request browser access privileges, tab contexts, or file access rights." }
  ],

  revenueTitle: "How we actually make money.",
  revenueSubtitle: "We earn commission fees from retail merchants, not by exploiting your digital profile. Our interests are aligned directly with your savings.",
  revenueSteps: [
    { step: "1", title: "Copy Promo Code", desc: "You find and copy a verified coupon code on Couponchy for a store." },
    { step: "2", title: "Checkout & Save", desc: "You checkout at the brand's store. The merchant tracks that you came from us." },
    { step: "3", title: "Merchant Commission", desc: "The merchant credits us a small referral fee for driving the sale. We keep the platform free." }
  ],

  metricsTitle: "Exactly one type of data. Anonymized.",
  metricsSubtitle: "To keep Couponchy clean and optimized, we only log aggregate actions. We record total search counts and copy button clicks. These are captured anonymously and cannot be associated with any specific email or visitor.",
  metricsItems: [
    { label: "Coupon Copied status", desc: "Log click event to monitor code success rates." },
    { label: "Merchant search count", desc: "Count lookups per store slug to track search trends." },
    { label: "No personal profiling", desc: "No IP addresses or location details linked to transactions." }
  ],

  legalTitle: "The Legal Essentials",
  legalSubtitle: "Collapsible legal declarations for official regulatory compliance.",
  legalClauses: [
    {
      id: "info",
      title: "1. Information We Collect",
      content: "When you browse Couponchy, we collect basic, non-personally identifiable usage data. This includes store page visit counts, search terms entered, and clicks on coupon buttons to copy promo codes. If you register an account, we store your profile details (name, email) securely. We do not track your browsing history outside our website, collect payment credentials, or log purchase categories."
    },
    {
      id: "cookies",
      title: "2. Cookies & Tracker Pixels",
      content: "Couponchy uses essential functional cookies to keep you signed in, remember your store bookmarks, and analyze general website traffic. We do not use cross-site tracking cookies, behavioral ad pixels (such as Meta pixel or Google remarketing tags), or behavioral advertising algorithms. You can configure your browser to block cookies, but some features (like bookmarking) may require them."
    },
    {
      id: "sharing",
      title: "3. Sharing of Information",
      content: "We never sell, rent, or trade your email address, search keywords, or profile data with advertisers, data brokers, or marketing aggregates. We only pass basic campaign codes to affiliate networks when you click our links to complete a purchase, which enables merchants to credit us a commission. No personal profile details are passed during this transaction."
    },
    {
      id: "rights",
      title: "4. Your Data Rights & Choices",
      content: "You are in complete control of your data. You can delete your search cookies at any time, browse all coupon directory stores anonymously, or delete your registered Couponchy account permanently from your profile dashboard. Doing so permanently purges all email addresses, logs, and bookmarks from our server database."
    }
  ]
};

function getPrivacyData(pageObj) {
  if (!pageObj || typeof pageObj === "string" || !pageObj.heroTitle) {
    return { ...defaultPrivacyData };
  }
  return { ...defaultPrivacyData, ...pageObj };
}

export default function PrivacyClientPage({ pageData }) {
  const privacyData = getPrivacyData(pageData);
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
          background: "radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-[1040px] px-4 sm:px-6 lg:px-8">
        {/* ════════════════════════════════════════════════════════════════════════
            SECTION 1: HERO HEADER
        ════════════════════════════════════════════════════════════════════════ */}
        <section className="pt-20 pb-12 sm:pt-28 sm:pb-16 max-w-4xl">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--color-primary)]">
            — PRIVACY &amp; TRANSPARENCY
          </p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl leading-[1.08] uppercase">
            {privacyData.heroTitle}
          </h1>
          <p className="mt-6 text-[15px] leading-[1.7] text-white/50 max-w-2xl font-medium">
            {privacyData.heroSubtitle}
          </p>
        </section>

        {/* ════════════════════════════════════════════════════════════════════════
            SECTION 2: PRIVACY COMPARISON BOARD
        ════════════════════════════════════════════════════════════════════════ */}
        <section className="py-12 border-t border-white/5">
          <div className="text-center max-w-lg mx-auto">
            <h2 className="text-xs font-black uppercase text-white/50 tracking-[0.2em]">
              Two Business Models
            </h2>
            <h3 className="mt-2 text-2xl font-extrabold uppercase text-white tracking-tight">
              One is funded by your personal data.
            </h3>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {/* The Trackers Column */}
            <div className="bg-[#0b0b0b]/60 border border-red-500/10 rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-black text-red-400 uppercase tracking-widest block mb-4 border border-red-500/20 bg-red-500/5 px-2.5 py-1 rounded-lg w-max">
                  {privacyData.aggregatorTitle}
                </span>
                <ul className="space-y-4">
                  {(privacyData.aggregatorItems || []).map((item, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="text-red-400 text-xs shrink-0 mt-0.5">✕</span>
                      <div>
                        <h4 className="text-xs font-bold text-white/80">{item.title}</h4>
                        <p className="mt-1 text-[11px] text-white/40 leading-relaxed font-medium">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-8 text-[10px] text-white/30 font-medium italic border-t border-white/5 pt-4">
                {privacyData.aggregatorNote}
              </p>
            </div>

            {/* The Couponchy Column */}
            <div className="bg-[#0b0b0b]/60 border border-[var(--color-border)] rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-[0_0_30px_rgba(163,230,53,0.02)]">
              <div>
                <span className="text-[9px] font-black text-[var(--color-primary)] uppercase tracking-widest block mb-4 border border-[var(--color-border)] bg-[var(--color-primary)]/5 px-2.5 py-1 rounded-lg w-max">
                  {privacyData.couponchyTitle}
                </span>
                <ul className="space-y-4">
                  {(privacyData.couponchyItems || []).map((item, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="text-[var(--color-primary)] text-xs shrink-0 mt-0.5">✓</span>
                      <div>
                        <h4 className="text-xs font-bold text-white/80">{item.title}</h4>
                        <p className="mt-1 text-[11px] text-white/40 leading-relaxed font-medium">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-8 text-[10px] text-[var(--color-primary)]/70 font-medium italic border-t border-white/5 pt-4">
                {privacyData.couponchyNote}
              </p>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════════
            SECTION 3: HOW WE FUND THE SITE
        ════════════════════════════════════════════════════════════════════════ */}
        <section className="py-12">
          <div className="bg-gradient-to-br from-[#0c0b0f] via-[#09090c] to-[#040405] border border-white/5 rounded-[32px] p-6 sm:p-10 lg:p-12 text-center max-w-4xl mx-auto">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-violet-400">
              — REVENUE SYSTEM
            </p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white uppercase leading-none">
              {privacyData.revenueTitle}
            </h2>
            <p className="mt-4 text-[12px] leading-[1.7] text-white/40 max-w-2xl mx-auto font-medium">
              {privacyData.revenueSubtitle}
            </p>

            {/* Workflow steps */}
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {(privacyData.revenueSteps || []).map((flow, index) => (
                <div key={index} className="bg-white/[0.01] border border-white/5 rounded-2xl p-6 flex flex-col items-center">
                  <span className="h-8 w-8 rounded-full bg-violet-500/10 flex items-center justify-center text-xs font-black text-violet-400 border border-violet-500/20">
                    {flow.step}
                  </span>
                  <h4 className="mt-4 text-xs font-bold text-white uppercase">{flow.title}</h4>
                  <p className="mt-2 text-[11px] leading-relaxed text-white/40 font-medium">{flow.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════════
            SECTION 4: COMMITMENTS GRID
        ════════════════════════════════════════════════════════════════════════ */}
        <section className="py-16 border-t border-white/5">
          <div className="max-w-2xl">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--color-primary)]">
              — PRIVACY COMMITMENTS
            </p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white uppercase">
              {privacyData.commitmentsTitle}
            </h2>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(privacyData.commitments || []).map((principle, index) => (
              <div
                key={index}
                className="bg-[#0a0a0a]/50 border border-white/5 rounded-2xl p-6 md:p-8 hover:border-[var(--color-primary)]/20 hover:bg-[#0c0c0c]/70 transition-all duration-300 flex items-start gap-4"
              >
                <span className="text-[var(--color-primary)] shrink-0 mt-0.5 text-xs">✓</span>
                <div>
                  <h3 className="text-[12px] font-black text-white uppercase tracking-wider">
                    {principle.title}
                  </h3>
                  <p className="mt-2 text-[11px] leading-[1.6] text-white/45 font-medium">
                    {principle.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════════
            SECTION 5: DATA COLLECTED (JSON CODE VIEWER)
        ════════════════════════════════════════════════════════════════════════ */}
        <section className="py-12">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16 items-center">
            <div className="lg:col-span-6 max-w-xl">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--color-primary)]">
                — DATA METRICS
              </p>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white uppercase leading-none">
                {privacyData.metricsTitle}
              </h2>
              <p className="mt-6 text-[12px] leading-[1.75] text-white/40 font-medium">
                {privacyData.metricsSubtitle}
              </p>

              <ul className="mt-6 space-y-3.5 pl-4 border-l border-white/5">
                {(privacyData.metricsItems || []).map((item, idx) => (
                  <li key={idx} className="text-xs">
                    <span className="font-bold text-white/80 block">{item.label}</span>
                    <span className="text-white/40 block mt-0.5">{item.desc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* JSON Code frame editor mockup */}
            <div className="lg:col-span-6">
              <div className="bg-[#050506] border border-white/10 rounded-2xl overflow-hidden font-mono text-[11px] text-white/70 shadow-2xl">
                {/* Header bar */}
                <div className="bg-[#0c0c0e] px-4 py-3 border-b border-white/5 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/50" />
                    <span className="h-2.5 w-2.5 rounded-full bg-green-500/50" />
                  </div>
                  <span className="text-[10px] text-white/30 uppercase tracking-widest font-black">
                    anonymous-event.json
                  </span>
                </div>
                {/* Editor Content */}
                <pre className="p-5 overflow-x-auto leading-relaxed text-cyan-400">
{`{
  "event": "coupon_copied",
  "timestamp": "${new Date().toISOString().split("T")[0]}T12:00:00Z",
  "store_slug": "nike-store",
  "coupon_id": "f582-841c-b2ee",
  "success_vote": null,
  "user_ip": "MASKED_ANONYMOUS",
  "browser_fingerprint": "NONE",
  "marketing_tracking_cookies": []
}`}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════════
            SECTION 6: LEGAL ESSENTIALS ACCORDION
        ════════════════════════════════════════════════════════════════════════ */}
        <section className="py-12 border-t border-white/5 mt-12 max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-extrabold text-white uppercase tracking-tight">
              {privacyData.legalTitle}
            </h2>
            <p className="mt-2 text-xs text-white/40 font-medium">
              {privacyData.legalSubtitle}
            </p>
          </div>

          <div className="space-y-3">
            {(privacyData.legalClauses || []).map((clause) => {
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
                      isOpen ? "max-h-[300px] border-t border-white/5 py-4 px-5 opacity-100" : "max-h-0 opacity-0 pointer-events-none overflow-hidden"
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

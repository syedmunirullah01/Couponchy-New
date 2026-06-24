"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { buildCountryPath } from "@/lib/countries";
import { BrandMark } from "./StoreHeader";
import NoTranslateText from "@/components/shared/NoTranslateText";

function getOfferValue(offer) {
  const source = [offer.title, offer.description, offer.code].filter(Boolean).join(" ");
  const percentMatch = source.match(/(\d{1,3})\s*%/);
  if (percentMatch) return `${percentMatch[1]}%`;
  const amountMatch = source.match(/\$ ?(\d[\d,]*)/);
  if (amountMatch) return `$${amountMatch[1]}`;
  return offer.type === "Deal" ? "Deal" : "Code";
}

// Deterministic "expiry" derived from offer id so it's stable across renders
function getExpiryHours(offer) {
  // Use offer.id to generate a stable pseudo-random hours value between 1–72
  const seed = String(offer.id || "default").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return 2 + (seed % 70); // 2h – 72h
}

function CountdownTimer({ offer, theme }) {
  const getRemainingSeconds = useCallback(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const date = now.getDate();

    let expiry;
    if (date <= 15) {
      expiry = new Date(year, month, 15, 23, 59, 59, 999);
    } else {
      expiry = new Date(year, month + 1, 0, 23, 59, 59, 999);
    }

    const diffMs = expiry.getTime() - now.getTime();
    return Math.max(0, Math.floor(diffMs / 1000));
  }, []);

  const [mounted, setMounted] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    setMounted(true);
    setSeconds(getRemainingSeconds());
    const interval = setInterval(() => {
      setSeconds(getRemainingSeconds());
    }, 1000);
    return () => clearInterval(interval);
  }, [getRemainingSeconds]);

  const totalSecs = mounted ? seconds : 0;
  const d = Math.floor(totalSecs / (24 * 3600));
  const h = Math.floor((totalSecs % (24 * 3600)) / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div className="flex items-center gap-2 text-white/50 text-sm font-semibold">
      <svg className="h-[18px] w-[18px] text-white/35 shrink-0 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      <span className="text-white/40 text-[13px] tracking-tight select-none">Expires in:</span>
      <div className="flex items-center gap-1.5 ml-1">
        <div className={`flex flex-col items-center justify-center bg-gradient-to-br ${theme.badge} text-black rounded-xl min-w-[52px] px-1.5 py-1.5 select-none`}>
          <span className="text-[15px] font-black leading-none">{pad(d)}</span>
          <span className="text-[8.5px] font-black uppercase tracking-wider text-black/80 mt-0.5">Days</span>
        </div>
        <div className={`flex flex-col items-center justify-center bg-gradient-to-br ${theme.badge} text-black rounded-xl min-w-[40px] px-1.5 py-1.5 select-none`}>
          <span className="text-[15px] font-black leading-none">{pad(h)}</span>
          <span className="text-[8.5px] font-black uppercase tracking-wider text-black/80 mt-0.5">Hrs</span>
        </div>
        <div className={`flex flex-col items-center justify-center bg-gradient-to-br ${theme.badge} text-black rounded-xl min-w-[40px] px-1.5 py-1.5 select-none`}>
          <span className="text-[15px] font-black leading-none">{pad(m)}</span>
          <span className="text-[8.5px] font-black uppercase tracking-wider text-black/80 mt-0.5">Min</span>
        </div>
        <div className={`flex flex-col items-center justify-center bg-gradient-to-br ${theme.badge} text-black rounded-xl min-w-[40px] px-1.5 py-1.5 select-none`}>
          <span className="text-[15px] font-black leading-none">{pad(s)}</span>
          <span className="text-[8.5px] font-black uppercase tracking-wider text-black/80 mt-0.5">Sec</span>
        </div>
      </div>
    </div>
  );
}

// Color scheme based on discount
function getDiscountTheme(offerValue, type) {
  if (type === "Deal") return {
    gradient: "from-[#a3e635]/25 via-lime-600/15 to-transparent",
    badge: "from-[#a3e635] to-lime-500",
    text: "text-[#a3e635]",
    glow: "",
    border: "border-[#a3e635]/30",
    cta: "from-[#a3e635] to-lime-400 shadow-sm",
    ctaHover: "hover:shadow-md",
  };
  const n = parseInt(offerValue);
  if (n >= 50) return {
    gradient: "from-rose-500/30 via-pink-600/20 to-transparent",
    badge: "from-rose-400 to-pink-600",
    text: "text-rose-300",
    glow: "",
    border: "border-rose-500/30",
    cta: "from-rose-400 to-pink-600 shadow-sm",
    ctaHover: "hover:shadow-md",
  };
  if (n >= 25) return {
    gradient: "from-orange-500/30 via-amber-600/20 to-transparent",
    badge: "from-orange-400 to-amber-500",
    text: "text-orange-300",
    glow: "",
    border: "border-orange-500/30",
    cta: "from-orange-400 to-amber-500 shadow-sm",
    ctaHover: "hover:shadow-md",
  };
  return {
    gradient: "from-[#a3e635]/25 via-lime-600/15 to-transparent",
    badge: "from-[#a3e635] to-lime-500",
    text: "text-[#a3e635]",
    glow: "",
    border: "border-[#a3e635]/30",
    cta: "from-[#a3e635] to-lime-400 shadow-sm",
    ctaHover: "hover:shadow-md",
  };
}

export default function OfferCard({ offer, store, showTimer }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [voteSuccessCount, setVoteSuccessCount] = useState(offer.successCount || 0);
  const [voteFailureCount, setVoteFailureCount] = useState(offer.failureCount || 0);
  const [successRate, setSuccessRate] = useState(offer.successRate || 0);
  const [voted, setVoted] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedVote = localStorage.getItem(`voted_${offer.id}`);
      if (storedVote) {
        const voteTime = Number(storedVote);
        if (Date.now() - voteTime < 24 * 60 * 60 * 1000) setVoted(true);
        else localStorage.removeItem(`voted_${offer.id}`);
      }
    }
  }, [offer.id]);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const offerHref = offer.affiliateLink || store.affiliateLink || "#";
  const isExternal = Boolean(offer.affiliateLink || store.affiliateLink);
  const actionHref = isExternal || offerHref === "#" ? offerHref : buildCountryPath(offerHref, store.countryCode);
  const offerValue = getOfferValue(offer);
  const isCoupon = offer.type === "Coupon";
  const hasCode = isCoupon && offer.code;
  const theme = getDiscountTheme(offerValue, offer.type);

  const workedToday = offer.lastWorkedAt &&
    (Date.now() - new Date(offer.lastWorkedAt).getTime()) <= 24 * 60 * 60 * 1000;
  const workedRecently = offer.lastWorkedAt &&
    (Date.now() - new Date(offer.lastWorkedAt).getTime()) <= 7 * 24 * 60 * 60 * 1000;
  const hasStats = (voteSuccessCount + voteFailureCount) > 0;

  const handleRevealCopy = () => {
    if (hasCode) {
      setRevealed(true);
      navigator.clipboard.writeText(offer.code).catch(() => { });
      setCopied(true);
      setTimeout(() => setCopied(false), 4000);
    }
  };

  const handleCTAClick = (e) => {
    if (isExternal) {
      e.preventDefault();
      
      // 1. Reveal and copy if coupon code exists
      if (hasCode) {
        setRevealed(true);
        navigator.clipboard.writeText(offer.code).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 4000);
      }

      // 2. Open the modal
      setIsModalOpen(true);

      // 3. Construct redirect URL to /out page with full visual styles and logo details
      const outUrl = `/out?url=${encodeURIComponent(actionHref)}` +
        `&code=${encodeURIComponent(offer.code || "")}` +
        `&title=${encodeURIComponent(offer.title || "")}` +
        `&store=${encodeURIComponent(store.name || "")}` +
        `&storeUrl=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}` +
        `&logoText=${encodeURIComponent(store.logoText || "")}` +
        `&logoClassName=${encodeURIComponent(store.logoClassName || "")}` +
        `&logoImage=${encodeURIComponent(store.logoImage || "")}` +
        `&badge=${encodeURIComponent(theme.badge || "")}` +
        `&cta=${encodeURIComponent(theme.cta || "")}` +
        `&textClass=${encodeURIComponent(theme.text || "")}` +
        `&isCoupon=${offer.type === "Coupon"}`;

      // 4. Open in new tab
      window.open(outUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleCopyShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href).catch(() => { });
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 3000);
    }
  };

  const submitFeedback = async (voteType) => {
    if (voted) return;
    try {
      const response = await fetch(`/api/offers/${offer.id}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voteType }),
      });
      const data = await response.json();
      if (response.ok) {
        setVoted(true);
        if (typeof window !== "undefined") localStorage.setItem(`voted_${offer.id}`, String(Date.now()));
        setVoteSuccessCount(data.successCount);
        setVoteFailureCount(data.failureCount);
        setSuccessRate(data.successRate);
        setFeedbackMsg("Thanks! 🙌");
        setTimeout(() => setFeedbackMsg(""), 2500);
      } else {
        setFeedbackMsg(data.error || "Failed.");
        setTimeout(() => setFeedbackMsg(""), 2500);
      }
    } catch {
      setFeedbackMsg("Error. Try again.");
      setTimeout(() => setFeedbackMsg(""), 2500);
    }
  };

  return (
    <>
      <article className={`offer-card relative rounded-3xl border bg-[#0a0c08] transition-all duration-300 hover:-translate-y-1 ${theme.border}`}
        style={{ background: "linear-gradient(145deg, #0e110b 0%, #0a0c08 100%)" }}
      >
        {/* Top gradient accent line */}
        <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${theme.text.replace("text-", "via-")} to-transparent opacity-30`} />

        {/* Top left floating badges (overlapping top border) */}
        <div className="absolute -top-3.5 left-6 z-20 flex gap-1.5">
          {offer.isExclusive && (
            <span className="inline-flex items-center gap-1 rounded-md bg-[#a3e635] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-black shadow-[0_4px_12px_rgba(163,230,53,0.3)]">
              💎 Exclusive
            </span>
          )}
          {offer.isFeatured && (
            <span className="inline-flex items-center gap-1 rounded-md bg-[#a3e635] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-black shadow-[0_4px_12px_rgba(163,230,53,0.3)]">
              ⭐ Featured
            </span>
          )}
        </div>

        {/* Top right badges */}
        <div className="absolute right-4 top-4 z-10 flex flex-wrap gap-1.5 justify-end">
          {offer.isOfficial && !offer.isExclusive && !offer.isFeatured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-black shadow-sm">
              ⭐ Official
            </span>
          )}
        </div>

        <div className="relative flex flex-col sm:flex-row">
          {/* ─── LEFT: Discount ───────────────────────────────────── */}
          <div className="flex shrink-0 flex-col items-center justify-center px-5 py-6 text-center sm:w-[140px] sm:border-r sm:border-white/6">
            {/* Type label */}
            <span className={`mb-2 inline-flex items-center rounded-full bg-gradient-to-r ${theme.badge} px-3 py-0.5 text-[10px] font-black uppercase tracking-widest text-black`}>
              {isCoupon ? "Coupon" : "Deal"}
            </span>

            {/* Big discount number */}
            <div className={`notranslate ${offerValue.length <= 4 ? "text-[52px]" : "text-[32px]"} font-black leading-none tracking-[-0.06em] ${theme.text}`}>
              {offerValue}
            </div>

            {offerValue !== "Code" && offerValue !== "Deal" && (
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.25em] text-white/30">OFF</p>
            )}

            {/* Worked recently badge */}
            {workedToday && (
              <div className="mt-3 flex items-center gap-1 rounded-xl border border-emerald-500/30 bg-emerald-500/12 px-2.5 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400">Worked Today</span>
              </div>
            )}
            {!workedToday && workedRecently && (
              <div className="mt-3 flex items-center gap-1 rounded-xl border border-teal-500/30 bg-teal-500/12 px-2.5 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-wider text-teal-400">Used Recently</span>
              </div>
            )}
          </div>

          {/* ─── CENTER: Content ──────────────────────────────────── */}
          <div className="flex min-w-0 flex-1 flex-col px-5 py-5">
            {/* Countdown timer */}
            {showTimer && (
              <div className="mb-3">
                <CountdownTimer offer={offer} theme={theme} />
              </div>
            )}

            {/* Status badges */}
            <div className="flex flex-wrap items-center gap-1.5 mb-3">
              {offer.validationStatus === "valid" && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/12 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-400">
                  ✓ Verified
                </span>
              )}
              {offer.isSitewide && (
                <span className="inline-flex items-center gap-1 rounded-full border border-sky-400/30 bg-sky-400/12 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-sky-400">
                  🌐 Sitewide
                </span>
              )}
              {hasStats && (
                <span className="inline-flex items-center gap-1 rounded-full border border-white/12 bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold text-white/60">
                  👍 {successRate}% success rate
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-lg font-black leading-tight text-white sm:text-xl">
              <NoTranslateText text={offer.title} storeName={store.name} />
            </h3>
            {offer.description && (
              <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-white/45">
                <NoTranslateText text={offer.description} storeName={store.name} />
              </p>
            )}



            {/* Feedback */}
            {isCoupon && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-3">
                {voteSuccessCount > 0 && (
                  <span className="text-[11px] text-white/35">
                    👥 {voteSuccessCount} verified this code
                  </span>
                )}
                {feedbackMsg && (
                  <span className="text-[11px] font-bold text-emerald-400">{feedbackMsg}</span>
                )}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/25">Work?</span>
                  {["success", "failure"].map((type) => (
                    <button
                      key={type}
                      onClick={() => submitFeedback(type)}
                      disabled={voted}
                      className={`rounded-xl border px-3 py-1 text-xs font-bold transition ${voted
                          ? "cursor-not-allowed border-transparent bg-white/3 text-white/15"
                          : type === "success"
                            ? "border-white/10 bg-white/5 text-white/50 hover:border-emerald-500/40 hover:bg-emerald-500/15 hover:text-emerald-400"
                            : "border-white/10 bg-white/5 text-white/50 hover:border-rose-500/40 hover:bg-rose-500/15 hover:text-rose-400"
                        }`}
                    >
                      {type === "success" ? `👍 ${voteSuccessCount}` : `👎 ${voteFailureCount}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="mt-2 text-[11px] text-white/25">Added {offer.date}</p>
          </div>

          {/* ─── RIGHT: CTA ───────────────────────────────────────── */}
          <div className="flex shrink-0 flex-col items-center justify-center border-t border-white/5 px-5 py-5 sm:w-[190px] sm:border-l sm:border-t-0">
            {/* Main CTA */}
            <Link
              href={actionHref}
              onClick={handleCTAClick}
              className={`group/btn relative flex w-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ${theme.cta} ${theme.ctaHover} py-4 text-center transition-all duration-300 hover:-translate-y-0.5`}
            >
              {/* Shimmer */}
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
              <span className="relative text-sm font-black uppercase tracking-wider text-black">
                {isCoupon && hasCode
                  ? (revealed ? <span className="notranslate">{offer.code}</span> : "Get Code")
                  : (offer.ctaLabel || (isCoupon ? "Get Coupon" : "Get Deal"))}
              </span>
              {isCoupon && hasCode && (
                <span className="relative mt-0.5 text-[10px] font-semibold text-black/50 normal-case tracking-normal">
                  {revealed ? (copied ? "✓ Copied!" : "Click to copy") : "Click to reveal"}
                </span>
              )}
            </Link>

            {/* Visit store */}
            {store.affiliateLink && (
              <Link
                href={store.affiliateLink}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/8 bg-white/3 py-2.5 text-[11px] font-bold text-white/40 transition hover:bg-white/8 hover:text-white/65"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                Visit Store
              </Link>
            )}

            <p className="mt-2 text-center text-[10px] text-white/20">
              🔒 Free · No signup
            </p>
          </div>
        </div>
      </article>

      {/* ─── MODAL OVERLAY ─────────────────────────────────────── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-modalFadeIn"
          style={{
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          }}
        >
          {/* Modal Container */}
          <div
            className="relative w-full max-w-lg bg-[#0a0c08] rounded-[28px] border border-white/10 shadow-[0_24px_50px_rgba(0,0,0,0.8)] overflow-hidden animate-modalScaleIn flex flex-col text-center"
            style={{
              boxShadow: `0 0 40px rgba(0, 0, 0, 0.6), 0 0 2px 1px rgba(255, 255, 255, 0.05)`,
            }}
          >
            {/* Top accent color bar */}
            <div className={`h-[6px] w-full bg-gradient-to-r ${theme.badge}`} />

            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition duration-200"
            >
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Body */}
            <div className="px-6 py-8 sm:px-8 flex flex-col items-center">
              {/* Brand Logo / Mark */}
              <div className="mb-4 flex items-center justify-center p-1 rounded-2xl bg-white/5 border border-white/10">
                <BrandMark size="medium" logoText={store.logoText} logoClassName={store.logoClassName} logoImage={store.logoImage} name={store.name} />
              </div>

              {/* Title & Description */}
              <h2 className="text-xl sm:text-2xl font-black text-white leading-snug tracking-tight px-2">
                <NoTranslateText text={offer.title} storeName={store.name} />
              </h2>
              <p className="mt-2 text-xs sm:text-sm font-semibold text-white/40 max-w-[340px]">
                {hasCode
                  ? "Copy the code below and paste it at checkout."
                  : "No code needed. Your discount will be applied automatically!"}
              </p>

              {/* Code Box Container (if coupon and has code) */}
              {hasCode && (
                <div className="w-full my-6 border border-dashed border-white/12 hover:border-[#a3e635]/30 rounded-2xl flex items-stretch overflow-hidden bg-white/3 transition duration-200">
                  <span className="notranslate flex-1 py-4 text-lg sm:text-xl font-black tracking-widest text-white flex items-center justify-center select-all pl-4">
                    {offer.code}
                  </span>
                  <button
                    onClick={handleRevealCopy}
                    className={`px-6 sm:px-8 font-black uppercase text-xs tracking-wider flex items-center justify-center transition gap-1.5 ${copied
                        ? "bg-emerald-500 text-white"
                        : `bg-gradient-to-r ${theme.badge} text-black hover:opacity-90`
                      }`}
                  >
                    {copied ? (
                      <>
                        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002-2h2a2 2 0 002-2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Primary Go-To-Store Button */}
              <a
                href={actionHref}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-4 rounded-2xl bg-gradient-to-r ${theme.badge} text-black font-black uppercase text-sm tracking-wider flex items-center justify-center gap-2 transition hover:scale-[1.01] active:scale-[0.99] ${hasCode ? "" : "mt-6"}`}
              >
                <span>Go to <span className="notranslate">{store.name} </span>Store</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>

              {/* Auto Redirect Info */}
              <div className="mt-4 flex flex-col items-center gap-1.5 w-full">
                <span className="text-[11px] font-bold text-white/30 uppercase tracking-widest">
                  Store opened in a new tab!
                </span>
              </div>

              {/* Did it work voting */}
              <div className="w-full border-t border-white/5 mt-6 pt-5 flex flex-col items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-3.5">
                  Did this {isCoupon ? "coupon" : "deal"} work?
                </span>
                <div className="flex gap-2 w-full">
                  <button
                    onClick={() => {
                      submitFeedback("success");
                    }}
                    disabled={voted}
                    className={`flex items-center gap-2 rounded-2xl border px-4 py-3.5 text-xs font-bold transition flex-1 justify-center ${voted
                        ? "cursor-not-allowed border-transparent bg-white/3 text-white/15"
                        : "border-white/10 bg-white/5 text-white/60 hover:border-emerald-500/40 hover:bg-emerald-500/15 hover:text-emerald-400"
                      }`}
                  >
                    <span>👍 Yes, it worked!</span>
                  </button>
                  <button
                    onClick={() => {
                      submitFeedback("failure");
                    }}
                    disabled={voted}
                    className={`flex items-center gap-2 rounded-2xl border px-4 py-3.5 text-xs font-bold transition flex-1 justify-center ${voted
                        ? "cursor-not-allowed border-transparent bg-white/3 text-white/15"
                        : "border-white/10 bg-white/5 text-white/60 hover:border-rose-500/40 hover:bg-rose-500/15 hover:text-rose-400"
                      }`}
                  >
                    <span>👎 Didn't work</span>
                  </button>
                </div>
                {feedbackMsg && (
                  <span className="mt-2 text-[11px] font-bold text-emerald-400">{feedbackMsg}</span>
                )}
              </div>

              {/* Follow Us / Social Follow */}
              <div className="w-full border-t border-white/5 mt-5 pt-4 flex flex-col items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-3">
                  Follow us for more deals
                </span>
                <div className="flex gap-3">
                  {/* Facebook */}
                  <a href="https://facebook.com" target="_blank" rel="noreferrer" className="h-8 w-8 rounded-full bg-[#1877f2] flex items-center justify-center text-white hover:scale-105 transition">
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                    </svg>
                  </a>
                  {/* Instagram */}
                  <a href="https://instagram.com" target="_blank" rel="noreferrer" className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center text-white hover:scale-105 transition">
                    <svg className="h-4.5 w-4.5 fill-none stroke-current" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  </a>
                  {/* TikTok */}
                  <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white hover:scale-105 transition">
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.24-.11-.47-.25-.69-.39v5.04c.03 2.44-.94 4.88-2.79 6.46-1.92 1.66-4.66 2.37-7.14 1.83-2.73-.55-5.18-2.52-6.23-5.11-.99-2.39-.75-5.26.7-7.39C3.76 7.42 6.03 6.02 8.7 5.79v4.09c-1.3.17-2.6 1.02-3.13 2.22-.64 1.34-.35 3.07.75 4.07 1 1 2.61 1.25 3.79.6 1.14-.59 1.82-1.87 1.81-3.17V.02z" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Share This Deal */}
              <div className="w-full border-t border-white/5 mt-4 pt-4 flex flex-col items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-3">
                  Share this deal
                </span>
                <div className="flex gap-3">
                  {/* WhatsApp */}
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(offer.title + ' ' + (typeof window !== "undefined" ? window.location.href : ""))}`}
                    target="_blank"
                    rel="noreferrer"
                    className="h-8 w-8 rounded-full bg-[#25d366] flex items-center justify-center text-white hover:scale-105 transition"
                  >
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.333 4.993L2 22l5.13-1.347a9.936 9.936 0 0 0 4.877 1.277h.005c5.505 0 9.989-4.478 9.99-9.985A9.994 9.994 0 0 0 12.012 2zm5.718 13.962c-.243.686-1.24 1.258-1.71 1.304-.47.045-.94.228-3.018-.63-2.518-1.04-4.14-3.606-4.266-3.774-.127-.168-1.03-1.372-1.03-2.617 0-1.246.654-1.854.887-2.1.233-.247.513-.31.684-.31h.487c.154 0 .363-.058.564.442.205.507.703 1.722.763 1.848.06.127.1.273.015.443-.085.17-.128.273-.257.423-.127.15-.268.337-.383.463-.127.136-.26.284-.11.545.15.26 1.01 1.671 2.164 2.7 1.488 1.325 2.73 1.729 3.115 1.92.385.192.61.168.835-.078.225-.246.963-1.121 1.22-1.505.257-.385.513-.322.863-.192.35.13 2.222 1.05 2.6 1.238.378.188.63.28.723.439.093.16.093.926-.15 1.612z" />
                    </svg>
                  </a>
                  {/* Twitter */}
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(offer.title)}&url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="h-8 w-8 rounded-full bg-[#1da1f2] flex items-center justify-center text-white hover:scale-105 transition"
                  >
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </a>
                  {/* Copy Link */}
                  <button
                    onClick={handleCopyShareLink}
                    className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white hover:scale-105 transition relative"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002-2h2a2 2 0 002-2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    {shareCopied && (
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-md whitespace-nowrap">
                        Copied!
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

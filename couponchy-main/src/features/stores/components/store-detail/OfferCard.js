"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { buildCountryPath } from "@/lib/countries";

function getOfferValue(offer) {
  const source = [offer.title, offer.description, offer.code].filter(Boolean).join(" ");
  const percentMatch = source.match(/(\d{1,3})\s*%/);

  if (percentMatch) {
    return `${percentMatch[1]}%`;
  }

  const amountMatch = source.match(/\$ ?(\d[\d,]*)/);
  if (amountMatch) {
    return `$${amountMatch[1]}`;
  }

  return offer.type === "Deal" ? "Deal" : "Code";
}

export default function OfferCard({ offer, store }) {
  const [copied, setCopied] = useState(false);
  
  // Community Feedback State
  const [voteSuccessCount, setVoteSuccessCount] = useState(offer.successCount || 0);
  const [voteFailureCount, setVoteFailureCount] = useState(offer.failureCount || 0);
  const [successRate, setSuccessRate] = useState(offer.successRate || 0);
  const [voted, setVoted] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedVote = localStorage.getItem(`voted_${offer.id}`);
      if (storedVote) {
        const voteTime = Number(storedVote);
        if (Date.now() - voteTime < 24 * 60 * 60 * 1000) {
          setVoted(true);
        } else {
          localStorage.removeItem(`voted_${offer.id}`);
        }
      }
    }
  }, [offer.id]);

  const offerHref = offer.affiliateLink || store.affiliateLink || "#";
  const isExternal = Boolean(offer.affiliateLink || store.affiliateLink);
  const actionHref = isExternal || offerHref === "#" ? offerHref : buildCountryPath(offerHref, store.countryCode);
  const offerValue = getOfferValue(offer);
  const actionLabel = offer.ctaLabel || (offer.type === "Coupon" ? "Get Coupon" : "Get Deal");

  const handleCtaClick = () => {
    if (offer.type === "Coupon" && offer.code) {
      navigator.clipboard.writeText(offer.code).catch((err) => {
        console.error("Failed to copy coupon code:", err);
      });
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const submitFeedback = async (voteType) => {
    if (voted) return;

    try {
      const response = await fetch(`/api/offers/${offer.id}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ voteType }),
      });

      const data = await response.json();

      if (response.ok) {
        setVoted(true);
        if (typeof window !== "undefined") {
          localStorage.setItem(`voted_${offer.id}`, String(Date.now()));
        }
        
        setVoteSuccessCount(data.successCount);
        setVoteFailureCount(data.failureCount);
        setSuccessRate(data.successRate);
        setFeedbackMsg("Thank you for your feedback!");
        setTimeout(() => setFeedbackMsg(""), 3000);
      } else {
        setFeedbackMsg(data.error || "Failed to submit feedback.");
        setTimeout(() => setFeedbackMsg(""), 3000);
      }
    } catch (err) {
      console.error("Feedback submission error:", err);
      setFeedbackMsg("Network error. Please try again.");
      setTimeout(() => setFeedbackMsg(""), 3000);
    }
  };

  const buttonText = copied ? `Copied: ${offer.code}` : actionLabel;

  // Compute recency signals
  const workedToday = offer.lastWorkedAt && 
    (Date.now() - new Date(offer.lastWorkedAt).getTime()) <= 24 * 60 * 60 * 1000;

  const workedRecently = offer.lastWorkedAt && 
    (Date.now() - new Date(offer.lastWorkedAt).getTime()) <= 7 * 24 * 60 * 60 * 1000;

  const hasStats = (voteSuccessCount + voteFailureCount) > 0;

  return (
    <article className="group overflow-hidden rounded-[24px] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_65%),#10110d] transition hover:border-[var(--accent)]/28 hover:shadow-[0_18px_36px_rgba(0,0,0,0.24)]">
      <div className="grid items-stretch md:grid-cols-[144px_minmax(0,1fr)_210px]">
        <div className="flex flex-col items-center justify-center border-b border-[var(--border)] bg-[rgba(255,255,255,0.02)] px-6 py-6 text-center md:border-b-0 md:border-r">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-primary)]">Top offer</p>
          <p className="mt-3 text-[44px] font-black leading-none tracking-[-0.08em] text-white">{offerValue}</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/52">
            {offer.type === "Coupon" && offerValue !== "Code" ? "off code" : offer.type}
          </p>
        </div>

        <div className="border-b border-[var(--border)] px-6 py-6 md:border-b-0 md:border-r">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-semibold text-white">
              {offer.type}
            </span>
            {offer.isOfficial && (
              <span className="rounded-full border border-purple-500/22 bg-purple-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-purple-400">
                {offer.type === "Coupon" ? "Official Store Coupon" : "Official Store Deal"}
              </span>
            )}
            {offer.isSitewide && offer.validationStatus !== "valid" && (
              <span className="rounded-full border border-sky-500/22 bg-sky-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-400">
                Sitewide
              </span>
            )}
            {offer.type === "Coupon" && offer.validationStatus === "valid" && (
              <span className="rounded-full border border-[var(--color-primary)]/22 bg-[var(--color-primary)]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                {offer.isSitewide ? "Verified Sitewide ✓" : "Verified ✓"}
              </span>
            )}
          </div>
          <h3 className="mt-4 text-[28px] font-black leading-[1.05] tracking-[-0.05em] text-white">{offer.title}</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/62">{offer.description}</p>

          {/* Trust Signals & Feedback Area */}
          {offer.type === "Coupon" && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-4">
              {/* Trust Signals */}
              <div className="flex flex-wrap items-center gap-2">
                {workedToday && (
                  <span className="rounded-md bg-emerald-500/10 border border-emerald-500/22 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    🔥 Worked Today
                  </span>
                )}
                {!workedToday && workedRecently && (
                  <span className="rounded-md bg-teal-500/10 border border-teal-500/22 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-400">
                    ⚡ Worked Recently
                  </span>
                )}
                {hasStats && (
                  <span className="rounded-md bg-white/[0.04] border border-white/10 px-2 py-0.5 text-[10px] font-bold text-white/80">
                    👍 {successRate}% Success
                  </span>
                )}
                {voteSuccessCount > 0 && (
                  <span className="rounded-md bg-white/[0.04] border border-white/10 px-2 py-0.5 text-[10px] font-medium text-white/60">
                    👥 {voteSuccessCount} verified
                  </span>
                )}
                {offer.trustScore !== undefined && (
                  <span className="rounded-md bg-purple-500/10 border border-purple-500/22 px-2 py-0.5 text-[10px] font-bold text-purple-400">
                    🛡️ Trust Score: {offer.trustScore}%
                  </span>
                )}
              </div>

              {/* Feedback Buttons */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/40">Did it work?</span>
                <button
                  onClick={() => submitFeedback("success")}
                  disabled={voted}
                  className={`flex items-center gap-1 rounded-md border border-white/10 px-2.5 py-1 text-xs font-semibold transition ${
                    voted
                      ? "bg-white/[0.02] text-white/20 cursor-not-allowed border-transparent"
                      : "bg-white/[0.04] text-white/80 hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/30"
                  }`}
                >
                  👍 {voteSuccessCount}
                </button>
                <button
                  onClick={() => submitFeedback("failure")}
                  disabled={voted}
                  className={`flex items-center gap-1 rounded-md border border-white/10 px-2.5 py-1 text-xs font-semibold transition ${
                    voted
                      ? "bg-white/[0.02] text-white/20 cursor-not-allowed border-transparent"
                      : "bg-white/[0.04] text-white/80 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30"
                  }`}
                >
                  👎 {voteFailureCount}
                </button>
              </div>
            </div>
          )}

          {feedbackMsg && (
            <div className="mt-2 text-xs font-semibold text-emerald-400 transition-opacity duration-200">
              {feedbackMsg}
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
            <span>{offer.views}</span>
            <span>{offer.date}</span>
            <span>{store.name}</span>
          </div>
        </div>

        <div className="flex items-center justify-center px-5 py-5">
          <Link
            href={actionHref}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noreferrer" : undefined}
            onClick={handleCtaClick}
            className="group/cta flex w-full max-w-[320px] items-center justify-between overflow-hidden rounded-[16px] border border-[var(--color-primary)]/30 bg-[var(--color-primary)] shadow-[0_18px_34px_rgba(0,0,0,0.24)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_42px_rgba(0,0,0,0.32)]"
          >
            <span className="flex min-w-0 flex-1 items-center px-8 py-2 text-left">
              <span className="block text-[14px] font-black uppercase tracking-[0.2em] text-black">{buttonText}</span>
            </span>
            <span className="flex h-full w-[68px] items-center justify-center border-l border-black/12 bg-black/10 text-black transition group-hover/cta:bg-black/14">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 12h14" />
                <path d="m13 6 6 6-6 6" />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}

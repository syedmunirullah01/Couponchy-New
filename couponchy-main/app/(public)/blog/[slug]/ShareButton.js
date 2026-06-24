"use client";

import { useState } from "react";

export default function SocialShare({ title, excerpt }) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(42);

  const getShareUrl = () => {
    return typeof window !== "undefined" ? window.location.href : "";
  };

  const handleShare = (platform) => {
    const url = encodeURIComponent(getShareUrl());
    const text = encodeURIComponent(title);
    
    let shareLink = "";
    switch (platform) {
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        break;
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case "whatsapp":
        shareLink = `https://api.whatsapp.com/send?text=${text}%20${url}`;
        break;
      case "linkedin":
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      default:
        break;
    }

    if (shareLink) {
      window.open(shareLink, "_blank", "noopener,noreferrer");
    }
  };

  const copyToClipboard = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLike = () => {
    if (liked) {
      setLiked(false);
      setLikesCount((prev) => prev - 1);
    } else {
      setLiked(true);
      setLikesCount((prev) => prev + 1);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Dynamic Interaction: Like Button */}
      <div className="flex flex-col gap-2.5 pb-4 border-b border-white/5">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
          Support Article
        </p>
        <button
          type="button"
          onClick={handleLike}
          className={`group flex items-center justify-between w-full h-11 rounded-xl border px-4 transition-all duration-300 ${
            liked
              ? "border-red-500/30 bg-red-500/10 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
              : "border-white/8 bg-white/[0.02] text-white/60 hover:border-white/20 hover:text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            <svg
              className={`h-4.5 w-4.5 transition-transform duration-300 group-hover:scale-125 ${
                liked ? "fill-red-500 stroke-none text-red-500" : "fill-none"
              }`}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
              />
            </svg>
            <span className="text-xs font-bold leading-none">{liked ? "Liked!" : "Like Post"}</span>
          </div>
          <span className={`text-xs font-black px-2 py-0.5 rounded ${liked ? "bg-red-500/20 text-red-400" : "bg-white/5 text-white/40"}`}>
            {likesCount}
          </span>
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
          Share this article
        </p>
        
        <div className="flex flex-col gap-3">
          {/* Social Icons row */}
          <div className="flex items-center justify-between gap-1.5">
            {/* Twitter / X */}
            <div className="relative group">
              <button
                type="button"
                onClick={() => handleShare("twitter")}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/8 bg-white/[0.02] text-white/60 transition-all duration-300 hover:scale-105 hover:border-sky-500/30 hover:bg-sky-500/10 hover:text-sky-400 hover:shadow-[0_0_15px_rgba(56,189,248,0.15)]"
                aria-label="Share on X"
              >
                <svg className="h-4.5 w-4.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </button>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-neutral-900 border border-white/10 text-white text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
                Share on X
              </span>
            </div>

            {/* Facebook */}
            <div className="relative group">
              <button
                type="button"
                onClick={() => handleShare("facebook")}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/8 bg-white/[0.02] text-white/60 transition-all duration-300 hover:scale-105 hover:border-blue-600/30 hover:bg-blue-600/10 hover:text-blue-500 hover:shadow-[0_0_15px_rgba(37,99,235,0.15)]"
                aria-label="Share on Facebook"
              >
                <svg className="h-4.5 w-4.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </button>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-neutral-900 border border-white/10 text-white text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
                Share on Facebook
              </span>
            </div>

            {/* WhatsApp */}
            <div className="relative group">
              <button
                type="button"
                onClick={() => handleShare("whatsapp")}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/8 bg-white/[0.02] text-white/60 transition-all duration-300 hover:scale-105 hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                aria-label="Share on WhatsApp"
              >
                <svg className="h-4.5 w-4.5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 2.01.593 3.882 1.625 5.447L2.05 22.05l4.707-1.233A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm1.09 14.542c-.225.044-.457.06-.69.046a4.425 4.425 0 01-3.155-1.745c-.569-.747-.933-1.636-1.054-2.576a4.4 4.4 0 01.378-2.697 1.488 1.488 0 011.082-.821.56.56 0 01.558.261l1.045 2.106a.56.56 0 01-.06.634l-.62.748a1.996 1.996 0 001.077 1.603c.3.163.636.248.977.248.169 0 .337-.02.503-.06a.56.56 0 01.624.237l1.066 2.096a.56.56 0 01-.347.67z" clipRule="evenodd" />
                </svg>
              </button>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-neutral-900 border border-white/10 text-white text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
                Share on WhatsApp
              </span>
            </div>

            {/* LinkedIn */}
            <div className="relative group">
              <button
                type="button"
                onClick={() => handleShare("linkedin")}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/8 bg-white/[0.02] text-white/60 transition-all duration-300 hover:scale-105 hover:border-indigo-600/30 hover:bg-indigo-600/10 hover:text-indigo-500 hover:shadow-[0_0_15px_rgba(79,70,229,0.15)]"
                aria-label="Share on LinkedIn"
              >
                <svg className="h-4.5 w-4.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </button>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-neutral-900 border border-white/10 text-white text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
                Share on LinkedIn
              </span>
            </div>
          </div>

          {/* Copy Link Button */}
          <button
            type="button"
            onClick={copyToClipboard}
            className={`group flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-xs font-bold transition-all duration-300 hover:scale-[1.02] ${
              copied
                ? "border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 text-[var(--color-primary)] shadow-[0_0_15px_rgba(163,230,53,0.1)]"
                : "border-white/8 bg-white/[0.02] text-white/60 hover:border-white/20 hover:text-white"
            }`}
            aria-label="Copy link"
          >
            {copied ? (
              <>
                <svg className="h-4 w-4 text-[var(--color-primary)] shrink-0 animate-bounce" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <span className="text-[var(--color-primary)]">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <svg className="h-4 w-4 text-white/40 group-hover:text-white transition-colors shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                </svg>
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

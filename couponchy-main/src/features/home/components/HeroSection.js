"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useRef, useState } from "react";
import { buildCountryPath, COUNTRY_COOKIE_KEY, DEFAULT_COUNTRY_CODE, normalizeCountryCode } from "@/lib/countries";

// ─── Icons ────────────────────────────────────────────────────────────────────
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
    </svg>
  );
}
function BoltIcon({ size = "h-3.5 w-3.5" }) {
  return (
    <svg viewBox="0 0 24 24" className={size} fill="currentColor">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function TagIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" strokeLinecap="round" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
function FireIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
      <path d="M12 23c-4.97 0-9-4.03-9-9 0-4.17 2.79-7.67 6.63-8.73L12 5l2.37-.73C18.21 5.33 21 8.83 21 13c0 4.97-4.03 10-9 10z"/>
      <path d="M12 17.5c-1.93 0-3.5-1.57-3.5-3.5 0-1.6 1.07-2.95 2.55-3.35L12 10.5l.95-.35C14.43 10.55 15.5 11.9 15.5 13.5c0 1.93-1.57 3.5-3.5 3.5z"/>
    </svg>
  );
}
function StoresIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const avatars = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=80",
];

const TICKER_WORDS = ["Fashion", "Electronics", "Travel", "Beauty", "Sports", "Home & Living", "Accessories"];
const STATS = [
  { value: 2400, suffix: "+", label: "Live Deals" },
  { value: 38,   suffix: "%", label: "Avg. Discount" },
  { value: 126,  suffix: "k+", label: "Happy Members" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isExactStoreMatch(store, query) {
  return [store.name, store.slug].filter(Boolean).some((v) => v.trim().toLowerCase() === query);
}

// Animated counter hook
function useCounter(target, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

// ─── Word-reveal animated headline ───────────────────────────────────────────
function AnimatedWord({ word, delay, color }) {
  return (
    <span
      className="inline-block hero-word"
      style={{ animationDelay: `${delay}ms`, color: color || "inherit" }}
    >
      {word}&nbsp;
    </span>
  );
}

// ─── Typewriter ticker ────────────────────────────────────────────────────────
function TickerText({ words }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % words.length);
        setVisible(true);
      }, 350);
    }, 2200);
    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <span
      className="ticker-word"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-8px)",
        transition: "opacity 0.35s ease, transform 0.35s ease",
        display: "inline-block",
        color: "rgba(163,230,53,1)",
        fontWeight: "900",
      }}
    >
      {words[index]}
    </span>
  );
}

// ─── Animated stat counter ────────────────────────────────────────────────────
function StatCounter({ value, suffix, label, started }) {
  const count = useCounter(value, 1600, started);
  return (
    <div className="text-center">
      <div className="text-[22px] font-black leading-none text-white">
        <span style={{
          background: "linear-gradient(90deg, rgba(163,230,53,1), rgba(200,255,100,0.8))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          {count.toLocaleString()}{suffix}
        </span>
      </div>
      <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>
        {label}
      </div>
    </div>
  );
}

// ─── Floating badge ───────────────────────────────────────────────────────────
function FloatingBadge({ icon, label, value, sub, floatAnim }) {
  return (
    <div
      className="flex items-center gap-2.5 rounded-2xl px-4 py-3"
      style={{
        background: "linear-gradient(145deg, rgba(18,18,18,0.95), rgba(10,10,10,0.95))",
        border: "1px solid rgba(255,255,255,0.1)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)",
        animation: `${floatAnim} ease-in-out infinite`,
      }}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        style={{ background: "linear-gradient(135deg, rgba(163,230,53,0.2), rgba(163,230,53,0.08))", color: "rgba(163,230,53,1)" }}>
        {icon}
      </div>
      <div>
        <p className="text-[14px] font-black text-white leading-tight">{value}</p>
        <p className="text-[10px] font-medium leading-tight" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</p>
      </div>
    </div>
  );
}

// ─── Slide dots ───────────────────────────────────────────────────────────────
function SlideDots({ slides, activeSlide, onSlideChange }) {
  return (
    <div className="flex items-center gap-1.5">
      {slides.map((slide, i) => (
        <button
          key={slide.id || i}
          type="button"
          aria-label={`Slide ${i + 1}`}
          onClick={() => onSlideChange(i)}
          style={{
            height: "3px",
            width: i === activeSlide ? "28px" : "8px",
            borderRadius: "999px",
            background: i === activeSlide
              ? "linear-gradient(90deg, rgba(163,230,53,1), rgba(200,255,80,1))"
              : "rgba(255,255,255,0.22)",
            transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
          }}
        />
      ))}
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function HeroSection({ hero }) {
  const router = useRouter();
  const heroSlides = hero?.slides?.length ? hero.slides : [];
  const [activeSlide, setActiveSlide] = useState(0);
  const [previousSlide, setPreviousSlide] = useState(null);
  const [direction, setDirection] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [stores, setStores] = useState([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [statsStarted, setStatsStarted] = useState(false);
  const statsRef = useRef(null);

  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY_CODE);

  useEffect(() => {
    const cookie = document.cookie.split("; ").find((e) => e.startsWith(`${COUNTRY_COOKIE_KEY}=`))?.split("=")[1];
    if (cookie) {
      setCountryCode(normalizeCountryCode(decodeURIComponent(cookie)));
    }
  }, []);

  // Start counter when stats row is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsStarted(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  // Auto-advance slides
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const id = window.setInterval(() => {
      startTransition(() => {
        setActiveSlide((s) => { setPreviousSlide(s); return (s + 1) % heroSlides.length; });
        setDirection(1);
      });
    }, 3400);
    return () => window.clearInterval(id);
  }, [heroSlides.length]);

  useEffect(() => {
    if (previousSlide === null) return;
    const id = window.setTimeout(() => setPreviousSlide(null), 1000);
    return () => window.clearTimeout(id);
  }, [previousSlide]);

  // Load stores
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/stores?country=${countryCode}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setStores(Array.isArray(d.data) ? d.data : []); })
      .catch(() => { if (!cancelled) setStores([]); });
    return () => { cancelled = true; };
  }, [countryCode]);

  const currentSlide = heroSlides[activeSlide];
  const btnLabel = hero?.searchButtonLabel?.trim().toLowerCase() !== "search deals" ? hero?.searchButtonLabel : "Search Offers";
  const placeholder = hero?.searchPlaceholder?.trim().toLowerCase() !== "search for nike, dyson, apple" ? hero?.searchPlaceholder : "Search stores, coupons, deals…";

  if (!currentSlide) return null;

  function handleSlideChange(i) {
    if (i === activeSlide) return;
    setDirection(i > activeSlide ? 1 : -1);
    setPreviousSlide(activeSlide);
    setActiveSlide(i);
  }

  function handleSearch(e) {
    e.preventDefault();
    const raw = searchValue.trim();
    const q = raw.toLowerCase();
    if (!q) { router.push(buildCountryPath("/stores", countryCode)); return; }
    const match = stores.find((s) => isExactStoreMatch(s, q));
    if (match) { router.push(buildCountryPath(`/stores/${match.categorySlug}/${match.slug}`, countryCode)); return; }
    router.push(`${buildCountryPath("/stores", countryCode)}?search=${encodeURIComponent(raw)}`);
  }

  const line1Words = (hero?.titleLineOne || "Smart Shopping,").trim().split(" ");
  const line2Words = (hero?.titleAccent  || "Better Saving").trim().split(" ");

  return (
    <section className="relative grid gap-8 overflow-visible lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-16">

      {/* ── Ambient background glows ─────────────────────────────── */}
      <div className="pointer-events-none absolute -left-40 -top-32 h-96 w-96 rounded-full blur-[160px]"
        style={{ background: "radial-gradient(circle, rgba(163,230,53,0.13), transparent 65%)", animation: "ambientPulse 6s ease-in-out infinite" }} />
      <div className="pointer-events-none absolute -right-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full blur-[130px]"
        style={{ background: "radial-gradient(circle, rgba(56,189,248,0.07), transparent 65%)", animation: "ambientPulse 8s ease-in-out infinite 2s" }} />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-48 w-48 rounded-full blur-[100px]"
        style={{ background: "radial-gradient(circle, rgba(251,146,60,0.05), transparent 65%)" }} />

      {/* ══════════════════════════════════════════════════════════
          LEFT COLUMN
      ═══════════════════════════════════════════════════════════ */}
      <div className="order-2 lg:order-1">

        {/* ── Eyebrow pill with ticker ─────────────────────────── */}
        <div className="hero-eyebrow mb-6 flex flex-wrap items-center gap-3">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-2"
            style={{
              background: "linear-gradient(90deg, rgba(163,230,53,0.14), rgba(163,230,53,0.05))",
              border: "1px solid rgba(163,230,53,0.3)",
            }}
          >
            <BoltIcon size="h-3 w-3" />
            <span className="text-[10px] font-black uppercase tracking-[0.24em]" style={{ color: "rgba(163,230,53,1)" }}>
              {hero?.eyebrow || "Exclusive Daily Deals"}
            </span>
            <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: "rgba(163,230,53,1)" }} />
          </div>

          {/* Ticker */}
          <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-bold"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)" }}>
            <FireIcon />
            <span>Hot in</span>
            <TickerText words={TICKER_WORDS} />
          </div>
        </div>

        {/* ── Animated word-reveal headline ────────────────────── */}
        <h1
          className="max-w-2xl font-black uppercase leading-[0.88] tracking-[-0.05em]"
          style={{ fontSize: "clamp(44px, 7.5vw, 84px)" }}
        >
          {/* Line 1 — white words */}
          <span className="block">
            {line1Words.map((word, i) => (
              <AnimatedWord key={i} word={word} delay={80 + i * 70} />
            ))}
          </span>

          {/* Line 2 — gradient shimmer words */}
          <span className="block mt-1">
            {line2Words.map((word, i) => (
              <span
                key={i}
                className="inline-block hero-word hero-gradient-word"
                style={{ animationDelay: `${200 + i * 80}ms` }}
              >
                {word}&nbsp;
              </span>
            ))}
          </span>
        </h1>

        {/* ── Description with highlight ───────────────────────── */}
        <p className="hero-desc mt-6 max-w-lg text-[15px] leading-[1.8]" style={{ color: "rgba(255,255,255,0.48)" }}>
          Unlock{" "}
          <span className="hero-highlight font-semibold" style={{ color: "rgba(255,255,255,0.75)" }}>
            verified discounts
          </span>{" "}
          from the world&apos;s{" "}
          <span className="font-semibold" style={{ color: "rgba(255,255,255,0.75)" }}>leading brands</span>.
          The smarter way to checkout.
        </p>

        {/* ── Search bar ──────────────────────────────────────── */}
        <form
          onSubmit={handleSearch}
          className="hero-search mt-8 flex max-w-[560px] flex-col gap-3 sm:flex-row sm:items-center"
          style={{
            background: searchFocused ? "rgba(16,16,16,1)" : "rgba(11,11,11,1)",
            border: searchFocused ? "1px solid rgba(163,230,53,0.4)" : "1px solid rgba(255,255,255,0.08)",
            borderRadius: "20px",
            padding: "8px",
            boxShadow: searchFocused
              ? "0 0 0 5px rgba(163,230,53,0.07), 0 0 60px rgba(163,230,53,0.1), 0 24px 60px rgba(0,0,0,0.4)"
              : "0 20px 56px rgba(0,0,0,0.35)",
            transition: "all 0.35s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <label className="flex flex-1 items-center gap-3 px-3.5 py-1">
            <span style={{ color: searchFocused ? "rgba(163,230,53,0.9)" : "rgba(255,255,255,0.2)", transition: "color 0.3s" }}>
              <SearchIcon />
            </span>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder={placeholder}
              className="w-full bg-transparent text-[15px] font-medium text-white outline-none hero-search-input"
            />
          </label>
          <button
            type="submit"
            className="group flex shrink-0 items-center justify-center gap-2.5 rounded-[13px] px-6 py-3.5 text-[13px] font-black uppercase tracking-[0.08em] text-black transition-all duration-300 hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #a3e635 0%, #c8ff50 50%, #a3e635 100%)",
              backgroundSize: "200% 100%",
              animation: "searchBtnShimmer 3s linear infinite",
              boxShadow: "0 4px 20px rgba(163,230,53,0.3)",
            }}
          >
            <SearchIcon />
            <span>{btnLabel || "Search Offers"}</span>
          </button>
        </form>

        {/* ── Trust / social proof ─────────────────────────────── */}
        <div className="hero-trust mt-7 flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2.5">
              {avatars.map((src, i) => (
                <div key={i} className="h-9 w-9 overflow-hidden rounded-full"
                  style={{ border: "2px solid rgba(0,0,0,0.9)", position: "relative", zIndex: 10 - i }}>
                  <Image src={src} alt="" width={36} height={36} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{ color: "rgba(163,230,53,0.95)" }}><StarIcon /></span>
                ))}
              </div>
              <p className="mt-0.5 text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.42)" }}>
                {hero?.memberCountText || "Join 126k+ members saving daily"}
              </p>
            </div>
          </div>

          <div className="h-6 w-px hidden sm:block" style={{ background: "rgba(255,255,255,0.07)" }} />

          {[{ icon: <ShieldIcon />, text: "100% Verified" }, { icon: <TagIcon />, text: "Free To Use" }].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: "rgba(255,255,255,0.38)" }}>
              <span style={{ color: "rgba(163,230,53,0.7)" }}>{icon}</span>
              {text}
            </div>
          ))}
        </div>

        {/* ── Animated stats bar ───────────────────────────────── */}
        <div ref={statsRef} className="hero-stats mt-8 flex items-center gap-6">
          {STATS.map((stat, i) => (
            <div key={i} className="flex items-center gap-4">
              {i > 0 && <div className="h-6 w-px" style={{ background: "rgba(255,255,255,0.07)" }} />}
              <StatCounter {...stat} started={statsStarted} />
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          RIGHT COLUMN — Cinematic card
      ═══════════════════════════════════════════════════════════ */}
      <div className="order-1 lg:order-2">
        <div className="relative mx-auto max-w-[500px]">

          {/* Floating badges */}
          <div style={{ position: "absolute", top: "-22px", left: "-18px", zIndex: 20 }}>
            <FloatingBadge icon={<StoresIcon />} label="Top Brands" value="500+ Stores" floatAnim="heroFloat1 4.2s" />
          </div>
          <div style={{ position: "absolute", bottom: "130px", right: "-20px", zIndex: 20 }}>
            <FloatingBadge icon={<RefreshIcon />} label="Fresh Every Day" value="Updated Daily" floatAnim="heroFloat2 5s 0.7s" />
          </div>

          {/* Rotating glow ring behind card */}
          <div
            className="pointer-events-none absolute inset-[-12px] rounded-[40px]"
            style={{
              background: "conic-gradient(from 0deg, rgba(163,230,53,0.15), transparent 25%, rgba(56,189,248,0.1), transparent 50%, rgba(163,230,53,0.15), transparent 75%, rgba(251,146,60,0.1), transparent 100%)",
              animation: "cardRingRotate 8s linear infinite",
              filter: "blur(8px)",
            }}
          />

          {/* Main image card */}
          <div
            className="relative overflow-hidden hero-card"
            style={{
              borderRadius: "28px",
              background: "linear-gradient(145deg, rgba(28,28,28,1), rgba(10,10,10,1))",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 48px 120px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.07)",
              transform: "rotate(-1deg)",
            }}
          >
            {/* Scanline overlay for premium feel */}
            <div
              className="pointer-events-none absolute inset-0 z-10"
              style={{
                backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)",
                mixBlendMode: "overlay",
              }}
            />

            <div className="relative overflow-hidden" style={{ aspectRatio: "4/5" }}>
              {/* Slides */}
              {heroSlides.map((slide, index) => {
                const isActive = index === activeSlide;
                const isPrev = index === previousSlide;
                const enterT = direction === 1 ? "translate3d(14%, 3%, 0) scale(1.1)" : "translate3d(-14%, -3%, 0) scale(1.1)";
                const exitT  = direction === 1 ? "translate3d(-12%, -3%, 0) scale(0.93)" : "translate3d(12%, 3%, 0) scale(0.93)";
                let st = { opacity: 0, transform: enterT };
                if (isActive) st = { opacity: 1, transform: "translate3d(0,0,0) scale(1)" };
                if (isPrev)   st = { opacity: 0, transform: exitT };

                return (
                  <div key={slide.image}
                    className="absolute inset-0 transition-[transform,opacity] duration-[950ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={st}
                  >
                    <Image src={slide.image} alt={slide.title} fill priority={index === 0}
                      sizes="(max-width: 1024px) 100vw, 44vw"
                      className={`object-cover transition-transform duration-[1300ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${isActive ? "scale-100" : "scale-110"}`}
                    />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)" }} />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(145deg, rgba(163,230,53,0.09) 0%, transparent 40%)" }} />
                    <div className="absolute inset-0 transition-opacity duration-[950ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                      style={{ opacity: isActive ? 1 : 0, background: slide.accent }} />
                  </div>
                );
              })}

              {/* Badge top-left */}
              <div key={`badge-${currentSlide.badge}`}
                className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-full px-3.5 py-1.5"
                style={{
                  background: "rgba(0,0,0,0.72)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  backdropFilter: "blur(16px)",
                  animation: "heroBadge 650ms cubic-bezier(0.22,1,0.36,1)",
                }}
              >
                <span className="h-2 w-2 animate-pulse rounded-full" style={{ background: "rgba(163,230,53,1)", boxShadow: "0 0 6px rgba(163,230,53,0.8)" }} />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">{currentSlide.badge}</span>
              </div>

              {/* Slide dots bottom-right */}
              <div className="absolute bottom-[132px] right-4 z-20">
                <SlideDots slides={heroSlides} activeSlide={activeSlide} onSlideChange={handleSlideChange} />
              </div>

              {/* Info panel */}
              <div key={`panel-${currentSlide.title}`}
                className="absolute inset-x-4 bottom-4 z-20"
                style={{ animation: "heroPanel 820ms cubic-bezier(0.22,1,0.36,1)" }}
              >
                <div className="rounded-[18px] p-4"
                  style={{
                    background: "linear-gradient(145deg, rgba(8,8,8,0.92), rgba(5,5,5,0.88))",
                    border: "1px solid rgba(255,255,255,0.09)",
                    backdropFilter: "blur(24px)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
                  }}
                >
                  <div className="flex items-end justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] font-black uppercase tracking-[0.28em]" style={{ color: "rgba(163,230,53,0.7)" }}>
                        {currentSlide.kicker}
                      </p>
                      <p className="mt-1 truncate text-[17px] font-black leading-tight text-white">
                        {currentSlide.title}
                      </p>
                      <p className="mt-1.5 line-clamp-2 text-[11px] leading-[1.6]" style={{ color: "rgba(255,255,255,0.42)" }}>
                        {currentSlide.description}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <div className="rounded-[12px] px-3.5 py-2.5 text-center"
                        style={{
                          background: "linear-gradient(135deg, #a3e635, #c8ff50)",
                          boxShadow: "0 4px 18px rgba(163,230,53,0.4)",
                        }}
                      >
                        <span className="text-[22px] font-black leading-none text-black">{currentSlide.discount}</span>
                      </div>
                      <p className="mt-1.5 text-center text-[8px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
                        Verified
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card ambient glow */}
          <div className="pointer-events-none absolute inset-0 rounded-[28px]"
            style={{
              boxShadow: "0 0 80px rgba(163,230,53,0.1), 0 0 160px rgba(163,230,53,0.05)",
              transform: "rotate(-1deg)",
            }}
          />
        </div>
      </div>

      {/* ── All keyframes ─────────────────────────────────────────── */}
      <style jsx>{`
        /* ── Word reveal animation ── */
        @keyframes wordReveal {
          0%   { opacity: 0; transform: translateY(28px) skewX(-4deg); filter: blur(4px); }
          60%  { filter: blur(0); }
          100% { opacity: 1; transform: translateY(0) skewX(0deg); }
        }
        .hero-word {
          opacity: 0;
          animation: wordReveal 0.65s cubic-bezier(0.22,1,0.36,1) both;
        }

        /* ── Gradient shimmer on accent line ── */
        @keyframes gradientShimmer {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .hero-gradient-word {
          background: linear-gradient(90deg,
            rgba(163,230,53,1) 0%,
            rgba(220,255,100,1) 30%,
            rgba(255,255,255,0.9) 50%,
            rgba(163,230,53,1) 70%,
            rgba(200,255,80,0.8) 100%
          );
          background-size: 300% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: wordReveal 0.65s cubic-bezier(0.22,1,0.36,1) both,
                     gradientShimmer 4s ease-in-out infinite;
        }

        /* ── Staggered fade-up for sections ── */
        @keyframes heroFadeUp {
          0%   { opacity: 0; transform: translateY(22px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .hero-eyebrow { animation: heroFadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both; }
        .hero-desc    { animation: heroFadeUp 0.8s cubic-bezier(0.22,1,0.36,1) 0.22s both; }
        .hero-search  { animation: heroFadeUp 0.8s cubic-bezier(0.22,1,0.36,1) 0.32s both; }
        .hero-trust   { animation: heroFadeUp 0.8s cubic-bezier(0.22,1,0.36,1) 0.40s both; }
        .hero-stats   { animation: heroFadeUp 0.8s cubic-bezier(0.22,1,0.36,1) 0.50s both; }
        .hero-card    { animation: heroFadeUp 1s cubic-bezier(0.22,1,0.36,1) 0.1s both; }

        /* ── Slide panel ── */
        @keyframes heroPanel {
          0%   { opacity: 0; transform: translate3d(0,24px,0) scale(0.96); filter: blur(6px); }
          100% { opacity: 1; transform: translate3d(0,0,0) scale(1); filter: blur(0); }
        }
        @keyframes heroBadge {
          0%   { opacity: 0; transform: translate3d(0,-16px,0) scale(0.9); }
          100% { opacity: 1; transform: translate3d(0,0,0) scale(1); }
        }

        /* ── Floating badges ── */
        @keyframes heroFloat1 {
          0%,100% { transform: translateY(0) rotate(0.5deg); }
          50%     { transform: translateY(-11px) rotate(-0.5deg); }
        }
        @keyframes heroFloat2 {
          0%,100% { transform: translateY(0) rotate(-0.8deg); }
          50%     { transform: translateY(-13px) rotate(0.8deg); }
        }

        /* ── Rotating conic glow ring ── */
        @keyframes cardRingRotate {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* ── Ambient blobs ── */
        @keyframes ambientPulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50%     { opacity: 0.65; transform: scale(1.12); }
        }

        /* ── Search button shimmer ── */
        @keyframes searchBtnShimmer {
          0%   { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        /* ── Search input placeholder ── */
        .hero-search-input::placeholder {
          color: rgba(255,255,255,0.28);
          font-weight: 400;
        }
      `}</style>
    </section>
  );
}

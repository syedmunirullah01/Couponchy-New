"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { buildCountryPath, COUNTRY_COOKIE_KEY, DEFAULT_COUNTRY_CODE, normalizeCountryCode } from "@/lib/countries";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 8h12l-1 11H7L6 8Z" />
      <path d="M9 8a3 3 0 1 1 6 0" />
    </svg>
  );
}

const avatars = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=80",
];

function isExactStoreMatch(store, query) {
  return [store.name, store.slug].filter(Boolean).some((value) => value.trim().toLowerCase() === query);
}

export default function HeroSection({ hero }) {
  const router = useRouter();
  const heroSlides = hero?.slides?.length ? hero.slides : [];
  const [activeSlide, setActiveSlide] = useState(0);
  const [previousSlide, setPreviousSlide] = useState(null);
  const [direction, setDirection] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [stores, setStores] = useState([]);
  const [countryCode] = useState(() => {
    if (typeof document === "undefined") {
      return DEFAULT_COUNTRY_CODE;
    }

    const matchedCookie = document.cookie
      .split("; ")
      .find((entry) => entry.startsWith(`${COUNTRY_COOKIE_KEY}=`))
      ?.split("=")[1];

    return normalizeCountryCode(decodeURIComponent(matchedCookie || DEFAULT_COUNTRY_CODE));
  });

  useEffect(() => {
    if (heroSlides.length <= 1) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      startTransition(() => {
        setDirection(1);
        setPreviousSlide(activeSlide);
        setActiveSlide((activeSlide + 1) % heroSlides.length);
      });
    }, 2600);

    return () => window.clearInterval(intervalId);
  }, [activeSlide, heroSlides.length]);

  useEffect(() => {
    if (previousSlide === null) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setPreviousSlide(null);
    }, 900);

    return () => window.clearTimeout(timeoutId);
  }, [previousSlide]);

  useEffect(() => {
    let cancelled = false;

    async function loadStores() {
      try {
        const storesResponse = await fetch(`/api/stores?country=${countryCode}`, { cache: "no-store" });
        const storesPayload = await storesResponse.json();

        if (!cancelled) {
          setStores(Array.isArray(storesPayload.data) ? storesPayload.data : []);
        }
      } catch {
        if (!cancelled) {
          setStores([]);
        }
      }
    }

    loadStores();

    return () => {
      cancelled = true;
    };
  }, [countryCode]);

  const currentSlide = heroSlides[activeSlide];
  const searchButtonLabel =
    hero?.searchButtonLabel && hero.searchButtonLabel.trim().toLowerCase() !== "search deals"
      ? hero.searchButtonLabel
      : "Search Offers";
  const searchPlaceholder =
    hero?.searchPlaceholder && hero.searchPlaceholder.trim().toLowerCase() !== "search for nike, dyson, apple"
      ? hero.searchPlaceholder
      : "Search stores, coupons, deals";

  if (!currentSlide) {
    return null;
  }

  function handleSlideChange(nextIndex) {
    if (nextIndex === activeSlide) {
      return;
    }

    setDirection(nextIndex > activeSlide ? 1 : -1);
    setPreviousSlide(activeSlide);
    setActiveSlide(nextIndex);
  }

  function handleSearchSubmit(event) {
    event.preventDefault();

    const rawQuery = searchValue.trim();
    const query = rawQuery.toLowerCase();

    if (!query) {
      router.push(buildCountryPath("/stores", countryCode));
      return;
    }

    const matchedStore = stores.find((store) => isExactStoreMatch(store, query));

    if (matchedStore) {
      router.push(buildCountryPath(`/stores/${matchedStore.categorySlug}/${matchedStore.slug}`, countryCode));
      return;
    }

    router.push(`${buildCountryPath("/stores", countryCode)}?search=${encodeURIComponent(rawQuery)}`);
  }

  return (
    <section className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
      <div className="order-2 lg:order-1">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[var(--color-primary)]">
          {hero?.eyebrow}
        </p>

        <h1 className="mt-6 max-w-xl text-5xl font-black uppercase leading-[0.94] tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
          {hero?.titleLineOne}
          <br />
          <span className="text-[var(--color-primary)]">{hero?.titleAccent}</span>
        </h1>

        <p className="mt-5 max-w-lg text-lg leading-8 text-[var(--color-muted)]">
          {hero?.description}
        </p>

        <form
          onSubmit={handleSearchSubmit}
          className="mt-10 flex max-w-xl flex-col gap-3 rounded-[26px] bg-[var(--color-secondary)] p-3 shadow-[0_22px_60px_rgba(0,0,0,0.38)] sm:flex-row sm:items-center"
        >
          <label className="flex min-h-14 flex-1 items-center gap-3 rounded-full bg-black px-4 text-[var(--color-muted)]">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--color-secondary)] text-[var(--color-muted)]">
              <BagIcon />
            </span>
            <input
              type="text"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[var(--color-muted)] sm:text-base"
            />
          </label>

          <Button type="submit" variant="primary" size="lg" className="sm:min-w-[220px]" leadingIcon={<SearchIcon />}>
            {searchButtonLabel}
          </Button>
        </form>

        <div className="mt-8 flex items-center gap-4">
          <div className="flex -space-x-2">
            {avatars.map((avatar) => (
              <Image
                key={avatar}
                src={avatar}
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 rounded-full border-2 border-[var(--page-bg)] object-cover"
              />
            ))}
          </div>
          <p className="text-sm text-[var(--color-muted)]">
            {hero?.memberCountText}
          </p>
        </div>
      </div>

      <div className="order-1 lg:order-2 lg:pt-1">
        <div className="mx-auto max-w-[560px] bg-[var(--color-secondary)] p-4 shadow-[0_35px_90px_rgba(0,0,0,0.42)]">
          <div className="rotate-[1.5deg] overflow-hidden rounded-[26px] bg-black">
            <div className="relative aspect-[4/5] overflow-hidden">
              {heroSlides.map((slide, index) => {
                const isActive = index === activeSlide;
                const isPrevious = index === previousSlide;
                const enterTransform =
                  direction === 1 ? "translate3d(18%, 4%, 0) scale(1.14) rotate(1.4deg)" : "translate3d(-18%, -3%, 0) scale(1.14) rotate(-1.4deg)";
                const exitTransform =
                  direction === 1 ? "translate3d(-14%, -3%, 0) scale(0.9) rotate(-1.1deg)" : "translate3d(14%, 3%, 0) scale(0.9) rotate(1.1deg)";

                let style = {
                  opacity: 0,
                  transform: enterTransform,
                };

                if (isActive) {
                  style = {
                    opacity: 1,
                    transform: "translate3d(0,0,0) scale(1) rotate(0deg)",
                  };
                } else if (isPrevious) {
                  style = {
                    opacity: 0,
                    transform: exitTransform,
                  };
                }

                return (
                  <div
                    key={slide.image}
                    className="absolute inset-0 transition-[transform,opacity] duration-[820ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={style}
                  >
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      fill
                      priority={index === 0}
                      sizes="(max-width: 1024px) 100vw, 42vw"
                      className={`object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        isActive ? "scale-100" : "scale-[1.1]"
                      }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/16 to-transparent" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(163,230,53,0.14),transparent_28%)]" />
                    <div
                      className="absolute inset-0 transition-opacity duration-[820ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                      style={{
                        opacity: isActive ? 1 : 0,
                        background: slide.accent,
                      }}
                    />
                  </div>
                );
              })}

              <div
                key={currentSlide.badge}
                className="absolute left-5 top-5 rounded-full bg-[var(--color-secondary)]/90 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/76 animate-[heroBadge_780ms_cubic-bezier(0.22,1,0.36,1)]"
              >
                {currentSlide.badge}
              </div>

              <div className="absolute bottom-5 right-5 flex gap-2">
                {heroSlides.map((slide, index) => (
                  <button
                    key={slide.title}
                    type="button"
                    aria-label={`Show slide ${index + 1}`}
                    className={`h-2.5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      index === activeSlide ? "w-10 bg-[var(--color-primary)]" : "w-2.5 bg-white/40"
                    }`}
                    onClick={() => handleSlideChange(index)}
                  />
                ))}
              </div>

              <div
                key={currentSlide.title}
                className="absolute inset-x-5 bottom-5 rounded-[22px] bg-[rgba(17,17,17,0.88)] p-5 animate-[heroPanel_820ms_cubic-bezier(0.22,1,0.36,1)]"
              >
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/52">{currentSlide.kicker}</p>
                    <p className="mt-2 text-2xl font-bold text-white">{currentSlide.title}</p>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--color-muted)]">{currentSlide.description}</p>
                  </div>
                  <span className="rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-extrabold text-black">
                    {currentSlide.discount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes heroPanel {
          0% {
            opacity: 0;
            transform: translate3d(0, 28px, 0) scale(0.95);
            filter: blur(8px);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes heroBadge {
          0% {
            opacity: 0;
            transform: translate3d(0, -18px, 0) scale(0.94);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }
      `}</style>
    </section>
  );
}

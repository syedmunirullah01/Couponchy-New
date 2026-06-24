"use client";

import Image from "next/image";
import Link from "next/link";

const TESTIMONIALS = [
  {
    id: 1,
    name: "Marcus V.",
    role: "Deal Stacker",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80",
    rating: 5,
    quote: "Couponchy is a game changer. I managed to combine a clearance discount with a sitewide code and PayPal cashback to save $65 on Adidas sneakers. The verification badge actually means it works!",
    date: "June 20, 2026",
    verified: true,
  },
  {
    id: 2,
    name: "Elena Rostova",
    role: "Savvy Shopper",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80",
    rating: 5,
    quote: "I used to waste 10 minutes copying dead codes. Here, every code I clicked applied instantly. The automated verification system they have is pure genius. Saved over $200 this month alone.",
    date: "June 22, 2026",
    verified: true,
  },
  {
    id: 3,
    name: "Jordan P.",
    role: "Tech Professional",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80",
    rating: 5,
    quote: "Excellent layout and fast loading. I love reading their blog guides on ecommerce stacking logic. Applied their four-layer method during a tech drop and checked out with a sweet 20% discount.",
    date: "June 23, 2026",
    verified: false,
  },
];

export default function TestimonialsSection() {
  return (
    <section className="relative mt-12 overflow-visible">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute -right-20 top-1/4 h-[350px] w-[350px] rounded-full blur-[140px]"
        style={{ background: "radial-gradient(circle, rgba(163,230,53,0.06), transparent 70%)" }} />
      <div className="pointer-events-none absolute -left-20 bottom-1/4 h-[350px] w-[350px] rounded-full blur-[140px]"
        style={{ background: "radial-gradient(circle, rgba(56,189,248,0.04), transparent 70%)" }} />

      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="mb-3.5 flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--color-primary)]">
              ✦ COMMUNITY LOVE
            </span>
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-primary)]" />
          </div>
          <h2 className="text-[28px] font-black uppercase tracking-tight text-white sm:text-[38px] leading-tight">
            Loved by smart <span className="bg-gradient-to-r from-[var(--color-primary)] to-emerald-400 bg-clip-text text-transparent">shoppers.</span>
          </h2>
          <p className="mt-3 max-w-lg text-[13px] font-medium leading-relaxed text-white/45">
            Discover how real members optimize checkout workflows, stack store discounts, and unlock verified promotions.
          </p>
        </div>
      </div>

      {/* Testimonials Expanded Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {TESTIMONIALS.map((t) => (
          <div
            key={t.id}
            className="group relative flex flex-col rounded-3xl border border-white/5 bg-white/[0.01] p-6 transition-all duration-300 hover:border-white/10 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(0,0,0,0.5)]"
          >
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-full border border-white/10">
                <Image
                  src={t.avatar}
                  alt={t.name}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-white">{t.name}</span>
                  {t.verified && (
                    <span className="rounded bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wide text-[var(--color-primary)]">
                      ✓ Verified
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-white/30 font-semibold">{t.role}</p>
              </div>
              <div className="ml-auto flex items-center gap-0.5">
                {[...Array(t.rating)].map((_, i) => (
                  <svg
                    key={i}
                    viewBox="0 0 24 24"
                    className="h-3 w-3 text-[var(--color-primary)] fill-[var(--color-primary)] drop-shadow-[0_0_4px_rgba(163,230,53,0.3)]"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
            </div>

            <blockquote className="mt-4 flex-1 text-[13px] leading-relaxed text-white/60 font-medium italic">
              "{t.quote}"
            </blockquote>

            <div className="mt-4 text-[9px] text-white/20 font-semibold">
              {t.date}
            </div>
          </div>
        ))}

        {/* Stacking Counter Card */}
        <div className="relative flex flex-col justify-center items-center rounded-3xl border border-[rgba(163,230,53,0.15)] bg-gradient-to-br from-[var(--color-primary)]/[0.04] to-transparent p-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 text-2xl text-[var(--color-primary)] mb-4 shadow-[0_4px_15px_rgba(163,230,53,0.15)]">
            ★
          </div>
          <h4 className="text-sm font-black uppercase tracking-wider text-white">
            Over $1.2M Saved
          </h4>
          <p className="mt-2 text-xs leading-relaxed text-white/50 max-w-[220px]">
            By verifying checkout codes, we secure cash for our community every day.
          </p>
        </div>
      </div>
    </section>
  );
}

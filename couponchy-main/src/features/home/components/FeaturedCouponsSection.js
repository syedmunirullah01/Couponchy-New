import Link from "next/link";
import { cn } from "@/lib/utils";
import FeaturedCouponCard from "./FeaturedCouponCard";

function SparkIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14m-7-7 7 7-7 7" />
    </svg>
  );
}

function toTitleCase(str) {
  if (!str) return "";
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function FeaturedCouponsSection({ featuredCoupons, title = "Featured Coupons" }) {
  if (!featuredCoupons.length) {
    return (
      <section className="relative">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2.5">
              <span className="h-px w-8 bg-[var(--accent)]" />
              <span className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--accent)]">
                Exclusive Savings
              </span>
            </div>
            <h2 className="text-[32px] font-black uppercase tracking-[-0.04em] text-white sm:text-[42px]">
              {toTitleCase(title)}
            </h2>
            <div className="mt-3 h-1 w-20 rounded-full bg-[var(--accent)]" />
          </div>
        </div>
        <div className="rounded-[28px] border border-white/5 bg-[#0a0a0a] p-8 text-center">
          <p className="text-lg font-semibold text-white">No coupons or deals yet</p>
          <p className="mt-2 text-sm text-white/40">Create coupons or deals from admin to populate this section.</p>
        </div>
      </section>
    );
  }

  const couponGridClassName =
    featuredCoupons.length === 1
      ? "max-w-[360px] mx-auto"
      : featuredCoupons.length === 2
        ? "sm:grid-cols-2 max-w-[760px] mx-auto"
        : featuredCoupons.length === 3
          ? "sm:grid-cols-2 lg:grid-cols-3 max-w-[1100px] mx-auto"
          : "sm:grid-cols-2 lg:grid-cols-4";

  return (
    <section className="relative">
      {/* Section Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4 z-10 relative">
        <div>
          <div className="mb-3 flex items-center gap-2.5">
            <span className="h-px w-8 bg-[var(--accent)]" />
            <span className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--accent)] flex items-center gap-1.5">
              <SparkIcon />
              Exclusive Savings
            </span>
          </div>
          <h2 className="text-[32px] font-black uppercase tracking-[-0.04em] text-white sm:text-[42px]">
            {toTitleCase(title)}
          </h2>
          <p className="mt-2 text-xs text-white/40 max-w-xl">
            Grab hand-picked, verified promo codes and exclusive discount vouchers. Copied to your clipboard instantly for checkout.
          </p>
          <div className="mt-4 h-1 w-20 rounded-full bg-[var(--accent)]" />
        </div>

        {/* View All top-right link button */}
        <Link
          href="/coupons"
          className="group inline-flex items-center gap-2 rounded-2xl border px-5 py-3 text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 hover:bg-[var(--accent)] hover:text-black hover:border-[var(--accent)] hover:scale-105 self-start md:self-auto"
          style={{
            borderColor: "rgba(163,230,53,0.25)",
            color: "var(--accent)",
            background: "rgba(163,230,53,0.03)",
          }}
        >
          View All
          <ArrowIcon />
        </Link>
      </div>

      {/* Cards Grid */}
      <div className={cn("grid gap-6 items-start", couponGridClassName)}>
        {featuredCoupons.map((coupon, index) => (
          <FeaturedCouponCard key={coupon.id || `${coupon.brand}-${index}`} coupon={coupon} index={index} />
        ))}
      </div>

      {/* Floor Glow */}
      <div
        className="pointer-events-none absolute -bottom-24 left-1/2 h-36 w-[600px] -translate-x-1/2 blur-[100px] opacity-35"
        style={{ background: "radial-gradient(ellipse, rgba(163,230,53,0.06), transparent 70%)" }}
      />
    </section>
  );
}


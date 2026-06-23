import { cn } from "@/lib/utils";
import SectionHeader from "@/components/shared/SectionHeader";
import FeaturedCouponCard from "./FeaturedCouponCard";

export default function FeaturedCouponsSection({ featuredCoupons, title = "Featured Coupons" }) {
  if (!featuredCoupons.length) {
    return (
      <section>
        <SectionHeader title={title} href="#" />
        <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
          <p className="text-lg font-semibold text-[var(--text)]">No coupons or deals yet</p>
          <p className="mt-2 text-sm text-[var(--muted)]">Create coupons or deals from admin to populate this section.</p>
        </div>
      </section>
    );
  }

  const couponGridClassName =
    featuredCoupons.length === 1
      ? "max-w-[360px]"
      : featuredCoupons.length === 2
        ? "sm:grid-cols-2"
        : featuredCoupons.length === 3
          ? "sm:grid-cols-2 xl:grid-cols-3"
          : "sm:grid-cols-2 xl:grid-cols-4";

  return (
    <section>
      <SectionHeader title={title} href="#" />
      <div className={cn("grid gap-4 items-start", couponGridClassName)}>
        {featuredCoupons.map((coupon, index) => (
          <FeaturedCouponCard key={coupon.id || `${coupon.brand}-${index}`} coupon={coupon} />
        ))}
      </div>
    </section>
  );
}


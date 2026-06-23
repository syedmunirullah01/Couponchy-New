import Link from "next/link";
import { Button } from "@/components/ui/Button";
import SectionHeader from "@/components/shared/SectionHeader";
import { cn } from "@/lib/utils";
import StoreSpotlightCard from "./StoreSpotlightCard";

export default function TrendingStoresSection({ trendingStores, title = "Trending Stores" }) {
  if (!trendingStores.length) {
    return (
      <section className="pt-2">
        <SectionHeader title={title} centered />
        <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
          <p className="text-lg font-semibold text-[var(--text)]">No stores yet</p>
          <p className="mt-2 text-sm text-[var(--muted)]">Add stores from admin and they will appear here automatically.</p>
        </div>
      </section>
    );
  }

  const storeGridClassName =
    trendingStores.length === 1
      ? "max-w-[220px] mx-auto"
      : trendingStores.length === 2
        ? "sm:grid-cols-2"
        : trendingStores.length === 3
          ? "sm:grid-cols-2 xl:grid-cols-3"
          : trendingStores.length === 4
            ? "sm:grid-cols-2 xl:grid-cols-4"
            : "sm:grid-cols-2 xl:grid-cols-5";

  return (
    <section className="pt-2">
      <SectionHeader title={title} centered />
      <div className={cn("grid gap-5 items-start", storeGridClassName)}>
        {trendingStores.map((store) => (
          <StoreSpotlightCard key={store.name} store={store} />
        ))}
      </div>
      <div className="mt-7 text-center">
        <Button asChild variant="primary" size="club" trailingIcon="↗" className="min-w-[220px]">
          <Link href="/stores">View All Stores</Link>
        </Button>
      </div>
    </section>
  );
}


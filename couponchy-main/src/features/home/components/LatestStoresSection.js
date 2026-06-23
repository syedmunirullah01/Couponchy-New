import Link from "next/link";
import SectionHeader from "@/components/shared/SectionHeader";

export default function LatestStoresSection({ latestStores, title = "Latest Stores" }) {
  if (!latestStores.length) {
    return (
      <section>
        <SectionHeader title={title} />
        <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
          <p className="text-lg font-semibold text-[var(--text)]">No stores available</p>
          <p className="mt-2 text-sm text-[var(--muted)]">Your newly created stores will show up here.</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <SectionHeader title={title} />
      <div className="flex flex-wrap gap-5">
        {latestStores.slice(0, 10).map((store) => (
          <Link
            key={store.name}
            href={store.href ?? "#"}
            className="group relative flex items-center gap-6 overflow-hidden rounded-[24px] border border-white/5 bg-white/[0.03] px-7 py-5 transition-all duration-500 hover:-translate-y-1 hover:border-[var(--color-primary)]/20 hover:bg-white/[0.06] hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
          >
            {/* Hover Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            {/* Logo Mark */}
            <div className="relative grid h-16 w-16 place-items-center rounded-2xl border border-white/5 bg-white/[0.04] text-[20px] font-black transition-transform duration-500 group-hover:scale-110 group-hover:border-[var(--color-primary)]/20">
              <span className="bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">
                {store.code}
              </span>
            </div>

            {/* Labels */}
            <div className="relative">
              <p className="text-lg font-black italic tracking-tight text-white transition-colors duration-300 group-hover:text-[var(--color-primary)]">
                {store.name}
              </p>
              <div className="mt-1.5 flex items-center gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]/40" />
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/30">
                  {store.offersCount} Offers
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

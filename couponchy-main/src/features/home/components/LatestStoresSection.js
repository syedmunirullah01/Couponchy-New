import Link from "next/link";
import Image from "next/image";

function SparkIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M5 12h14m-7-7 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function toTitleCase(str) {
  if (!str) return "";
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

function StoreCard({ store }) {
  const initial = (store.name || "?").charAt(0).toUpperCase();
  const offersCount = store.offersCount ?? 0;

  // Generate a deterministic hue from store name for subtle accent variety
  const charCode = (store.name || "A").charCodeAt(0);
  const hueRotate = ((charCode * 37) % 60) - 30; // between -30 and +30 deg shift of the base green

  return (
    <Link
      href={store.href ?? "#"}
      className="latest-store-card group relative flex flex-col overflow-hidden rounded-[24px] border transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_24px_48px_rgba(0,0,0,0.5)]"
      style={{
        borderColor: "rgba(255,255,255,0.06)",
        background: "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0) 100%)",
        backgroundColor: "#0a0a0a",
      }}
    >
      {/* Hover glow overlay */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[24px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(ellipse at top left, rgba(163,230,53,0.07), transparent 65%)`,
        }}
      />

      {/* Top border glow on hover */}
      <div
        className="absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: "linear-gradient(90deg, transparent, rgba(163,230,53,0.5), transparent)" }}
      />

      <div className="relative flex flex-col gap-4 p-5">
        {/* Header row: logo mark + NEW badge */}
        <div className="flex items-start justify-between">
          {/* Logo mark */}
          <div
            className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-xl font-black transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(163,230,53,0.25)]"
            style={{
              background: `linear-gradient(135deg, rgba(163,230,53,0.12), rgba(163,230,53,0.03))`,
              border: "1px solid rgba(163,230,53,0.18)",
              color: `hsl(${83 + hueRotate}, 80%, 70%)`,
            }}
          >
            {store.logoImage ? (
              <Image
                src={store.logoImage}
                alt={`${store.name} logo`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                unoptimized
              />
            ) : (
              initial
            )}
          </div>

          {/* NEW badge */}
          <span
            className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.15em]"
            style={{
              background: "rgba(163,230,53,0.1)",
              border: "1px solid rgba(163,230,53,0.25)",
              color: "var(--accent)",
            }}
          >
            <SparkIcon />
            New
          </span>
        </div>

        {/* Store name */}
        <div>
          <p
            className="text-[15px] font-black tracking-tight transition-colors duration-300 group-hover:text-[var(--accent)]"
            style={{ color: "rgba(255,255,255,0.92)" }}
          >
            {store.name}
          </p>

          {/* Offers pill */}
          <div className="mt-2.5 flex items-center gap-2">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{
                background: offersCount > 0 ? "var(--accent)" : "rgba(255,255,255,0.2)",
              }}
            />
            <p
              className="text-[11px] font-bold uppercase tracking-[0.18em]"
              style={{ color: offersCount > 0 ? "rgba(163,230,53,0.7)" : "rgba(255,255,255,0.25)" }}
            >
              {offersCount} {offersCount === 1 ? "Offer" : "Offers"}
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div
          className="mt-1 flex items-center justify-between rounded-xl px-3.5 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] transition-all duration-300 group-hover:bg-[var(--accent)] group-hover:text-black"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            color: "rgba(255,255,255,0.4)",
          }}
        >
          <span>View Store</span>
          <ArrowIcon />
        </div>
      </div>
    </Link>
  );
}

export default function LatestStoresSection({ latestStores, title = "Latest Stores" }) {
  if (!latestStores.length) {
    return (
      <section className="relative">
        <div
          className="rounded-[28px] border p-8 text-center"
          style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
        >
          <p className="text-lg font-semibold text-white">No Stores Available</p>
          <p className="mt-2 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            Your Newly Created Stores Will Show Up Here.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative">
      {/* Section header */}
      <div className="mb-10 flex items-center justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2.5">
            <span
              className="h-px w-8"
              style={{ background: "var(--accent)" }}
            />
            <span
              className="text-[11px] font-black uppercase tracking-[0.22em]"
              style={{ color: "var(--accent)" }}
            >
              Fresh Arrivals
            </span>
          </div>
          <h2
            className="text-[32px] font-black uppercase tracking-[-0.04em] text-white sm:text-[42px]"
          >
            {title}
          </h2>
          <div
            className="mt-3 h-1 w-20 rounded-full"
            style={{ background: "var(--accent)" }}
          />
        </div>

        {/* View All pill button */}
        <Link
          href="/stores"
          className="group flex items-center gap-2 rounded-2xl border px-5 py-3 text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 hover:bg-[var(--accent)] hover:text-black hover:border-[var(--accent)] hover:scale-105"
          style={{
            borderColor: "rgba(163,230,53,0.25)",
            color: "var(--accent)",
            background: "rgba(163,230,53,0.05)",
          }}
        >
          View All
          <ArrowIcon />
        </Link>
      </div>

      {/* Store cards grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {latestStores.slice(0, 10).map((store) => (
          <StoreCard key={store.name} store={store} />
        ))}
      </div>

      {/* Bottom subtle gradient fade */}
      <div
        className="pointer-events-none absolute -bottom-16 left-1/2 h-32 w-[600px] -translate-x-1/2 blur-[80px]"
        style={{ background: "radial-gradient(ellipse, rgba(163,230,53,0.04), transparent 70%)" }}
      />
    </section>
  );
}

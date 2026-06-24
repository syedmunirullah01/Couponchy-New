import Image from "next/image";
import Link from "next/link";

function ShoppingBagIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
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

export default function FeaturedProductsSection({ featuredProducts, title = "Featured Products" }) {
  if (!featuredProducts?.length) {
    return (
      <section className="relative">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2.5">
              <span className="h-px w-8 bg-[var(--accent)]" />
              <span className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--accent)] flex items-center gap-1.5">
                <ShoppingBagIcon />
                Featured Picks
              </span>
            </div>
            <h2 className="text-[32px] font-black uppercase tracking-[-0.04em] text-white sm:text-[42px]">
              {toTitleCase(title)}
            </h2>
            <div className="mt-3 h-1 w-20 rounded-full bg-[var(--accent)]" />
          </div>
        </div>
        <div className="rounded-[28px] border border-white/5 bg-[#0a0a0a] p-8 text-center">
          <p className="text-lg font-semibold text-white">No products available</p>
          <p className="mt-2 text-sm text-white/40">Add products from admin and feature them here to create a richer homepage mix.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative pt-2">
      {/* Section Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="mb-3 flex items-center gap-2.5">
            <span className="h-px w-8 bg-[var(--accent)]" />
            <span className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--accent)] flex items-center gap-1.5">
              <ShoppingBagIcon />
              Featured Picks
            </span>
          </div>
          <h2 className="text-[32px] font-black uppercase tracking-[-0.04em] text-white sm:text-[42px]">
            {toTitleCase(title)}
          </h2>
          <p className="mt-2 text-xs text-white/40 max-w-xl">
            Explore curated, high-quality products from our top stores. Compare discount prices and checkout directly at the merchants.
          </p>
          <div className="mt-4 h-1 w-20 rounded-full bg-[var(--accent)]" />
        </div>

        {/* View All top-right link button */}
        <Link
          href="/stores"
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

      {/* Grid container with both products in one line */}
      <div className="grid gap-6 md:grid-cols-2">
        {featuredProducts.map((product, index) => {
          const discount = product.originalPrice && product.originalPrice > product.price
            ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
            : null;

          return (
            <article
              key={product.id}
              className="featured-coupon-card group relative overflow-hidden rounded-[32px] border bg-[#080808]/90 transition-all duration-500 hover:-translate-y-1.5 hover:border-[var(--accent)]/30 hover:shadow-[0_20px_45px_rgba(0,0,0,0.6)]"
              style={{
                borderColor: "rgba(255, 255, 255, 0.04)",
                animationDelay: `${index * 80}ms`,
              }}
            >
              {/* Radial overlay glow */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(163,230,53,0.06),transparent_36%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <div className="grid h-full sm:grid-cols-[1.05fr_0.95fr]">
                {/* Product Image Frame */}
                <div className="relative overflow-hidden bg-[#111] z-10 aspect-[4/3] sm:aspect-auto sm:h-full min-h-[250px]">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-white/30">No Image Available</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Badges on Image */}
                  <div className="absolute left-4 top-4 flex items-center gap-2">
                    <div className="rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-[var(--accent)] backdrop-blur">
                      {toTitleCase(product.status || "Active")}
                    </div>
                    {discount && (
                      <div className="rounded-full bg-[var(--accent)] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-black">
                        -{discount}% Off
                      </div>
                    )}
                  </div>
                </div>

                {/* Content Panel */}
                <div className="relative flex flex-col justify-between gap-5 p-6 sm:p-7 z-20">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/30 notranslate">{toTitleCase(product.storeName)}</p>
                      <h3 className="text-xl font-black tracking-tight text-white transition-colors duration-300 group-hover:text-[var(--accent)]">{toTitleCase(product.title)}</h3>
                      <p className="line-clamp-3 text-xs leading-relaxed text-white/50">{product.description || "Featured product curated from the store catalog."}</p>
                    </div>

                    <div className="flex items-end gap-2.5">
                      <span className="text-2xl font-black text-white">${product.price}</span>
                      {product.originalPrice ? (
                        <span className="text-xs text-white/30 line-through mb-1">${product.originalPrice}</span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-2">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--accent)]">Ready To Explore</p>
                    <Link
                      href={product.productUrl}
                      className="inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 bg-white/5 border-white/5 text-white/60 group-hover:bg-[var(--accent)] group-hover:text-black group-hover:border-[var(--accent)] group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(163,230,53,0.25)]"
                    >
                      {toTitleCase(product.ctaLabel || "View Product")}
                      <ArrowIcon />
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Floor Glow */}
      <div
        className="pointer-events-none absolute -bottom-24 left-1/2 h-36 w-[600px] -translate-x-1/2 blur-[100px] opacity-35"
        style={{ background: "radial-gradient(ellipse, rgba(163,230,53,0.06), transparent 70%)" }}
      />
    </section>
  );
}

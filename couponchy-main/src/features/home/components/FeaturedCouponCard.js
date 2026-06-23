import { cn } from "@/lib/utils";

export default function FeaturedCouponCard({ coupon }) {
  const isHighlight = coupon.highlight;

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-[0_0_40px_rgba(163,230,53,0.05)]",
        isHighlight
          ? "border-white/20 bg-white text-black hover:border-black/10"
          : "border-white/5 bg-[#0a0a0a] text-white hover:border-[var(--accent)]/30"
      )}
    >
      {/* Top Section */}
      <div className="relative flex flex-col p-5 pb-6">
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
              isHighlight
                ? "bg-black/5 border-black/10 text-black/70"
                : "bg-white/5 border-white/10 text-white/70"
            )}
          >
            {coupon.tag}
          </span>
          <div className={cn(
            "h-2 w-2 rounded-full animate-pulse",
            isHighlight ? "bg-black/20" : "bg-[var(--accent)]/40"
          )} />
        </div>

        <div className="mt-6 flex flex-col">
          <p className={cn(
            "text-[10px] font-bold uppercase tracking-[0.2em]",
            isHighlight ? "text-black/30" : "text-white/30"
          )}>Exclusive Deal</p>
          <h3 className={cn(
            "mt-1 text-4xl font-black tracking-tight italic leading-none",
            isHighlight ? "text-black" : "text-[var(--accent)]"
          )}>
            {coupon.value}
          </h3>
        </div>
      </div>

      {/* Separator with Cut-outs */}
      <div className="relative flex items-center px-0">
        <div className={cn(
          "absolute -left-3 h-6 w-6 rounded-full border-r",
          isHighlight ? "bg-[#f5f5f5] border-black/5" : "bg-black border-white/5"
        )} />
        <div className={cn(
          "w-full border-t border-dashed",
          isHighlight ? "border-black/10" : "border-white/10"
        )} />
        <div className={cn(
          "absolute -right-3 h-6 w-6 rounded-full border-l",
          isHighlight ? "bg-[#f5f5f5] border-black/5" : "bg-black border-white/5"
        )} />
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col p-5 pt-6">
        <p className={cn(
          "mb-6 text-xs leading-relaxed line-clamp-2 min-h-[2.5rem]",
          isHighlight ? "text-black/60" : "text-white/50"
        )}>
          {coupon.description}
        </p>

        {/* Ticket Style Button */}
        <button
          type="button"
          className={cn(
            "group/btn relative flex w-full items-center overflow-hidden rounded-xl transition-transform active:scale-[0.98]",
            isHighlight
              ? "bg-black text-white"
              : "bg-[var(--accent)] text-black"
          )}
        >
          <div className="flex-1 py-3.5 px-4 text-center text-[11px] font-black uppercase tracking-[0.15em]">
            Copy Code
          </div>
          <div className={cn(
            "relative flex h-full items-center justify-center px-4 py-3.5 border-l border-dashed",
            isHighlight ? "bg-white/10 border-white/20" : "bg-black/10 border-black/20"
          )}>
            <span className={cn(
              "text-[10px] font-black",
              isHighlight ? "text-white/80" : "text-black/80"
            )}>
              CODE
            </span>
          </div>

          <div className="absolute inset-0 bg-white/0 transition-colors group-hover/btn:bg-white/10" />
        </button>
      </div>
    </article>
  );
}


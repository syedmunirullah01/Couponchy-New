import NoTranslateText from "@/components/shared/NoTranslateText";

export default function StoreContent({ singleStore, faqs }) {
  return (
    <>
      {/* ─── About Store Section ─────────────────────────────────── */}
      <section
        id="store-info"
        className="mt-12 scroll-mt-28 overflow-hidden rounded-[24px] border border-white/8 bg-[#0c0e09]"
      >
        <div className="border-b border-white/6 bg-gradient-to-r from-[#a3e635]/8 to-transparent px-7 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#a3e635]/15 text-lg">
              🏪
            </div>
            <div>
              <h2 className="text-lg font-black text-white">
                <NoTranslateText text={singleStore.introTitle} storeName={singleStore.name} />
              </h2>
              <p className="text-xs text-white/40 font-medium">About <span className="notranslate">{singleStore.name}</span></p>
            </div>
          </div>
        </div>

        <div className="px-7 py-6 space-y-4 text-sm leading-7 text-white/55">
          {singleStore.introParagraphs.map((paragraph, index) => (
            <p key={index}>
              <NoTranslateText text={paragraph} storeName={singleStore.name} />
            </p>
          ))}

          {/* Why use coupons section */}
          <div className="mt-2 rounded-2xl border border-[#a3e635]/15 bg-[#a3e635]/5 p-5">
            <h3 className="text-base font-black text-white mb-3">
              Why Use <span className="notranslate">{singleStore.name}</span> Coupons from <span className="notranslate">Couponchy</span>
            </h3>
            <ul className="space-y-2.5">
              {singleStore.whyItems.map((item, index) => (
                <li key={index} className="flex items-start gap-2.5">
                  <span className="mt-1 h-4 w-4 shrink-0 rounded-full bg-[#a3e635]/20 flex items-center justify-center text-[10px] text-[#a3e635]">✓</span>
                  <span>
                    <NoTranslateText text={item} storeName={singleStore.name} />
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <p>
            <NoTranslateText text={singleStore.outro} storeName={singleStore.name} />
          </p>
        </div>
      </section>

      {/* ─── FAQ Section ─────────────────────────────────────────── */}
      <section id="faqs" className="mt-8 scroll-mt-28">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/8 text-lg">
            ❓
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Frequently Asked Questions</h2>
            <p className="text-xs text-white/40">About <span className="notranslate">{singleStore.name}</span> Coupons &amp; Deals</p>
          </div>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <details
              key={faq.question}
              className="group overflow-hidden rounded-[18px] border border-white/8 bg-[#0c0e09] transition-all open:border-[#a3e635]/20"
              open={index === 0}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between p-5 text-sm font-bold text-white transition hover:text-[#a3e635]">
                <span className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/5 text-[11px] font-black text-white/40">
                    {index + 1}
                  </span>
                  <NoTranslateText text={faq.question} storeName={singleStore.name} />
                </span>
                <span className="ml-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/40 transition group-open:border-[#a3e635]/30 group-open:text-[#a3e635]">
                  <svg className="h-3 w-3 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <div className="border-t border-white/5 px-5 pb-5 pt-4 text-sm leading-7 text-white/50">
                <NoTranslateText text={faq.answer} storeName={singleStore.name} />
              </div>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}

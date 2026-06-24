import OfferSection from "./OfferSection";
import ProductsSection from "./ProductsSection";
import StoreContent from "./StoreContent";
import StoreHeader from "./StoreHeader";
import StoreSidebar from "./StoreSidebar";
import HowItWorks from "./HowItWorks";

export default function SingleStorePage({ singleStore, storeTabs, offerTabs, offers, products, faqs, relatedStores }) {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
      <StoreHeader singleStore={singleStore} storeTabs={storeTabs} offerTabs={offerTabs} />
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Sidebar — sticky on desktop */}
        <div className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
          <StoreSidebar singleStore={singleStore} relatedStores={relatedStores} />
        </div>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          <OfferSection offerTabs={offerTabs} offers={offers} store={singleStore} />
          <ProductsSection products={products} />
          <HowItWorks storeName={singleStore.name} />
          <StoreContent singleStore={singleStore} faqs={faqs} />

          {/* Bottom CTA strip */}
          {singleStore.affiliateLink && (
            <div className="mt-10 overflow-hidden rounded-[24px] border border-[#a3e635]/20 bg-gradient-to-r from-[#0f1a0a] to-[#0c0e09] p-6 sm:p-8">
              <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
                <div className="flex-1">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#a3e635]">Ready to Save?</p>
                  <p className="mt-1 text-lg font-bold text-white">
                    Visit <span className="notranslate">{singleStore.name} </span>and apply your coupon at checkout
                  </p>
                  <p className="mt-1 text-sm text-white/45">All coupons above are free to use — no account required</p>
                </div>
                <a
                  href={singleStore.affiliateLink}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-[#a3e635] px-7 py-4 text-sm font-black uppercase tracking-wider text-black shadow-md transition hover:bg-[#bef264] hover:-translate-y-0.5"
                >
                  Shop Now →
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

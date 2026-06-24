import React from "react";

export default function HowItWorks({ storeName }) {
  const steps = [
    {
      step: "01",
      title: "Choose an Offer",
      description: (
        <>
          Browse the active coupons or deals for{" "}
          <span className="notranslate">{storeName}</span> and click the button of
          the discount you want to use.
        </>
      ),
      icon: (
        <svg className="h-6 w-6 text-[#a3e635]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      step: "02",
      title: "Copy the Code",
      description: "If it's a coupon, the code is copied automatically to your clipboard. For deals, the discount is activated instantly.",
      icon: (
        <svg className="h-6 w-6 text-[#a3e635]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002-2h2a2 2 0 002-2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
        </svg>
      )
    },
    {
      step: "03",
      title: "Shop & Apply",
      description: (
        <>
          Shop on <span className="notranslate">{storeName}</span> as usual. At
          checkout, paste the copied promo code into the discount box to claim
          your savings.
        </>
      ),
      icon: (
        <svg className="h-6 w-6 text-[#a3e635]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      )
    }
  ];

  return (
    <section className="mt-10 rounded-[28px] border border-white/8 bg-[#0c0e09] p-6 sm:p-8 relative overflow-hidden"
      style={{ background: "linear-gradient(145deg, #0e110b 0%, #050704 100%)" }}
    >
      {/* Top gradient accent line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#a3e635]/30 to-transparent" />
      
      <div className="relative z-10">
        {/* Section Header */}
        <div className="mb-8 text-center sm:text-left">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#a3e635]">Save Smartly</p>
          <h2 className="mt-1.5 text-2xl font-black text-white sm:text-3xl">How to Save at <span className="notranslate">{storeName}</span></h2>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map(({ step, title, description, icon }) => (
            <div 
              key={step} 
              className="group relative rounded-2xl border border-white/5 bg-white/2 p-6 transition-all duration-300 hover:border-[#a3e635]/25 hover:bg-[#a3e635]/5"
            >
              {/* Top Row: Icon + Step number */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:border-[#a3e635]/20 group-hover:bg-[#a3e635]/10 transition-colors">
                  {icon}
                </div>
                <span className="text-[13px] font-black uppercase tracking-wider text-white/15 group-hover:text-[#a3e635]/30 transition-colors">
                  Step {step}
                </span>
              </div>

              {/* Title & Desc */}
              <h3 className="text-md font-black text-white group-hover:text-[#a3e635] transition-colors">{title}</h3>
              <p className="mt-2 text-xs leading-5 text-white/45 group-hover:text-white/60 transition-colors font-medium">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

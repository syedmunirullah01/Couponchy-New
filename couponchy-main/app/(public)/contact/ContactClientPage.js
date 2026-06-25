"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { toast } from "sonner";

const FAQ_GROUPS = [
  {
    id: "platform",
    title: "Using the Platform",
    items: [
      {
        id: "plat-apply",
        q: "Why isn't a verified coupon code applying at checkout?",
        a: "Verified codes can sometimes fail if your cart contents don't meet the merchant's requirements. Double-check the store's minimum purchase threshold, check for brand exclusions (e.g. sale items), or verify if the code is country-specific."
      },
      {
        id: "plat-status",
        q: "How can I tell if a promo code is verified on Couponchy?",
        a: "Look for the green 'Verified' status badge or check the community success rates on the coupon widgets. We run daily validations on active store pages to prune expired deals."
      },
      {
        id: "plat-app",
        q: "Does Couponchy have a mobile app or browser extension?",
        a: "Currently, Couponchy is a fully responsive web-based directory. You can browse, copy, and claim deals directly on any desktop or mobile browser without installing third-party plugins."
      }
    ]
  },
  {
    id: "contributions",
    title: "Contributions & Stores",
    items: [
      {
        id: "con-suggest",
        q: "How do I suggest a brand or store to be added to Couponchy?",
        a: "If your favorite store is missing, click 'Report an issue' at the bottom of this page and enter the store's name or website. Our curation team will review and add it to our directory."
      },
      {
        id: "con-submit",
        q: "How do I submit a working discount code to the directory?",
        a: "Registered Couponchy members can click the 'Submit Coupon' button visible on any store page. Once our moderators verify the deal, it will go live for the community."
      },
      {
        id: "con-broken",
        q: "How do I report a broken or expired discount code?",
        a: "Simply click the 'Thumbs Down' button next to the code. This updates its success rate in real-time and alerts our moderator team to verify the offer's validity."
      }
    ]
  },
  {
    id: "account",
    title: "Account & General FAQ",
    items: [
      {
        id: "acc-free",
        q: "Is Couponchy free to browse and use?",
        a: "Yes, Couponchy is 100% free. You can view, search, and copy discount codes without paying any subscription fees or sign-up charges."
      },
      {
        id: "acc-register",
        q: "Do I need to create a Couponchy account to save?",
        a: "No account is required to browse or copy discount codes. However, registering lets you save favorite brand stores and participate in coupon voting."
      },
      {
        id: "acc-contact",
        q: "How can I reach the Couponchy support team directly?",
        a: "You can submit general inquiries using the forms below, or reach out to our team via email at support@couponchy.com."
      }
    ]
  },
  {
    id: "privacy",
    title: "Privacy & Data Security",
    items: [
      {
        id: "priv-policy",
        q: "What is Couponchy's privacy policy?",
        a: "We respect your data. Couponchy does not track your online search history, record payment information, or sell shopping activities to third-party marketing networks."
      },
      {
        id: "priv-secure",
        q: "Does Couponchy store my credit card details?",
        a: "No. Couponchy is strictly a coupon discovery directory. We do not handle checkout processes or store any billing details."
      },
      {
        id: "priv-delete",
        q: "How can I delete my Couponchy account permanently?",
        a: "You can delete your profile directly from your Account Dashboard under settings, or submit a request via our support forms to remove your data."
      }
    ]
  }
];

export default function ContactClientPage({ pageTitle, pageContent }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState([]);
  
  // Modals Visibility
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  
  // Forms loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackEmail, setFeedbackEmail] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedbackType, setFeedbackType] = useState("suggestion");

  const [issueEmail, setIssueEmail] = useState("");
  const [issueSubject, setIssueSubject] = useState("");
  const [issueDetails, setIssueDetails] = useState("");

  // Toggle Accordion open state
  const toggleAccordion = (id) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Scroll to and auto expand FAQ
  const handleQuickClick = (id) => {
    setExpandedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setTimeout(() => {
      const element = document.getElementById(`faq-${id}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  // Filter FAQs based on query
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return FAQ_GROUPS;
    const query = searchQuery.toLowerCase();

    return FAQ_GROUPS.map((group) => {
      const items = group.items.filter(
        (item) =>
          item.q.toLowerCase().includes(query) ||
          item.a.toLowerCase().includes(query)
      );
      return { ...group, items };
    }).filter((group) => group.items.length > 0);
  }, [searchQuery]);

  // Form submission handlers
  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!feedbackEmail.trim() || !feedbackMsg.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success("Feedback submitted successfully! Thank you.");
      setFeedbackEmail("");
      setFeedbackMsg("");
      setFeedbackOpen(false);
      setIsSubmitting(false);
    }, 1200);
  };

  const handleIssueSubmit = (e) => {
    e.preventDefault();
    if (!issueEmail.trim() || !issueSubject.trim() || !issueDetails.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success("Support ticket submitted! We will email you back shortly.");
      setIssueEmail("");
      setIssueSubject("");
      setIssueDetails("");
      setIssueOpen(false);
      setIsSubmitting(false);
    }, 1200);
  };

  return (
    <div className="relative w-full overflow-hidden bg-black text-white selection:bg-[var(--color-primary)]/20 selection:text-white pb-24">
      {/* ─── Ambient Glows ────────────────────────────────────────────── */}
      <div
        className="pointer-events-none absolute -left-20 -top-40 h-[500px] w-[500px] rounded-full blur-[140px] opacity-40"
        style={{
          background: "radial-gradient(circle, rgba(163,230,53,0.15) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute right-10 top-1/3 h-[600px] w-[600px] rounded-full blur-[160px] opacity-35"
        style={{
          background: "radial-gradient(circle, rgba(147,51,234,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-[960px] px-4 sm:px-6 lg:px-8">
        {/* ════════════════════════════════════════════════════════════════════════
            SECTION 1: HERO & SEARCH HEADER
        ════════════════════════════════════════════════════════════════════════ */}
        <section className="pt-20 pb-12 sm:pt-28 sm:pb-16 text-center max-w-2xl mx-auto flex flex-col items-center">
          <h1 className="text-4xl font-extrabold tracking-[-0.04em] text-white sm:text-5xl uppercase leading-tight">
            Hi, how can we help?
          </h1>
          <p className="mt-4 text-[13px] leading-relaxed text-white/50 font-medium">
            Get instant answers for any problem. Looking for detailed guides? Check our{" "}
            <Link href="/blog" className="text-[var(--color-primary)] underline hover:text-[var(--color-primary-hover)] transition-colors">
              learning center
            </Link>
            .
          </p>

          {/* Search bar */}
          <div className="w-full max-w-[560px] mt-8 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ask us anything..."
              className="w-full bg-[#0d0d0d] border border-white/8 hover:border-white/15 focus:border-[var(--color-primary)] rounded-2xl pl-11 pr-5 py-4 text-sm text-white placeholder-white/30 outline-none transition shadow-[0_4px_30px_rgba(0,0,0,0.5)] focus:shadow-[0_0_20px_rgba(163,230,53,0.06)]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-white/40 hover:text-white transition cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════════
            SECTION 2: QUICK FAQ GRID
        ════════════════════════════════════════════════════════════════════════ */}
        <section className="py-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                id: "plat-apply",
                q: "Why isn't a verified coupon code applying at checkout?",
                sub: "Promo Code Troubleshooting"
              },
              {
                id: "con-broken",
                q: "How do I report a broken or expired discount code?",
                sub: "Report Invalid Coupon"
              },
              {
                id: "con-suggest",
                q: "How do I suggest a brand or store to be added to Couponchy?",
                sub: "Suggest Store Directory"
              },
              {
                id: "con-submit",
                q: "How do I submit a working discount code to Couponchy?",
                sub: "Share Savings Deals"
              }
            ].map((card) => (
              <button
                key={card.id}
                type="button"
                onClick={() => handleQuickClick(card.id)}
                className="text-left bg-[#0b0b0b] border border-white/5 hover:border-white/12 hover:bg-[#0d0d0d]/90 rounded-2xl p-5 transition-all duration-300 flex items-start gap-4 group cursor-pointer"
              >
                <div className="flex-1">
                  <span className="text-[9px] font-bold text-[var(--color-primary)] uppercase tracking-wider block mb-1">
                    {card.sub}
                  </span>
                  <span className="text-xs font-bold text-white/80 group-hover:text-white transition-colors block font-sans">
                    {card.q}
                  </span>
                </div>
                <span className="text-white/20 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all shrink-0">
                  →
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════════
            SECTION 3: TOPICS DIRECTORY
        ════════════════════════════════════════════════════════════════════════ */}
        <section className="py-12 border-t border-white/5 mt-10">
          <div className="text-center">
            <h2 className="text-xs font-black tracking-[0.2em] text-white/50 uppercase">
              Chat with us about...
            </h2>
          </div>

          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            {FAQ_GROUPS.filter((g) => g.id !== "privacy").map((group) => (
              <div key={group.id} className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-primary)]">
                  {group.title}
                </span>
                <ul className="space-y-3">
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => handleQuickClick(item.id)}
                        className="text-left text-[11px] leading-[1.5] text-white/40 hover:text-white transition-colors cursor-pointer group flex items-start gap-1"
                      >
                        <span className="group-hover:translate-x-0.5 transition-transform shrink-0">›</span>
                        <span className="font-sans">{item.q}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════════
            SECTION 4: CORE ESSENTIALS (ACCORDIONS)
        ════════════════════════════════════════════════════════════════════════ */}
        <section className="py-12 border-t border-white/5 mt-6">
          <div className="text-center max-w-lg mx-auto">
            <h2 className="text-2xl font-extrabold text-white uppercase tracking-tight">
              Quick Answers: The Essentials
            </h2>
            <p className="mt-2 text-xs text-white/40 font-medium">
              The official, no-fluff answers to what our community asks most.
            </p>
          </div>

          <div className="mt-12 space-y-10">
            {filteredGroups.length > 0 ? (
              filteredGroups.map((group) => (
                <div key={group.id} className="space-y-4">
                  <h3 className="text-xs font-black uppercase text-white/60 tracking-wider flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
                    {group.title}
                  </h3>
                  <div className="space-y-2">
                    {group.items.map((item) => {
                      const isOpen = expandedIds.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          id={`faq-${item.id}`}
                          className="bg-[#090909]/60 border border-white/5 rounded-xl overflow-hidden transition-all duration-300"
                        >
                          <button
                            type="button"
                            onClick={() => toggleAccordion(item.id)}
                            className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 cursor-pointer text-xs font-bold text-white/80 hover:text-white hover:bg-white/[0.01] transition-all"
                          >
                            <span className="font-sans">{item.q}</span>
                            <span className={`text-white/30 transform transition-transform duration-300 shrink-0 ${isOpen ? "rotate-90 text-[var(--color-primary)]" : ""}`}>
                              ▶
                            </span>
                          </button>
                          
                          {/* Answer block with height collapse animation simulation */}
                          <div
                            className={`transition-all duration-300 ease-in-out ${
                              isOpen ? "max-h-[200px] border-t border-white/5 py-4 px-5 opacity-100" : "max-h-0 opacity-0 pointer-events-none overflow-hidden"
                            }`}
                          >
                            <p className="text-[11px] leading-[1.65] text-white/40 font-medium font-sans">
                              {item.a}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-[#090909]/30 rounded-2xl border border-white/5">
                <p className="text-sm italic text-white/30">No matching questions found.</p>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mt-3 text-xs font-black uppercase text-[var(--color-primary)] hover:underline cursor-pointer"
                >
                  Reset Search
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════════
            SECTION 5: BOTTOM SUPPORT CTA
        ════════════════════════════════════════════════════════════════════════ */}
        <section className="py-16 border-t border-white/5 mt-10 text-center flex flex-col items-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white uppercase leading-none">
            How are we doing?
          </h2>
          <p className="mt-4 text-[12px] text-white/40 max-w-md font-medium leading-[1.7]">
            We're obsessed with improving the Couponchy saving experience. Let us know what's working
            and how we can do better.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
            <button
              type="button"
              onClick={() => setFeedbackOpen(true)}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-white/15 text-white text-[12px] font-black uppercase tracking-wider transition text-center cursor-pointer flex items-center justify-center gap-2"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-[var(--color-primary)]" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-14h.8" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Give product feedback
            </button>
            
            <button
              type="button"
              onClick={() => setIssueOpen(true)}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-white/15 text-white text-[12px] font-black uppercase tracking-wider transition text-center cursor-pointer flex items-center justify-center gap-2"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Report an issue
            </button>
          </div>
        </section>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          MODAL 1: PRODUCT FEEDBACK FORM
      ════════════════════════════════════════════════════════════════════════ */}
      {feedbackOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl animate-modalScaleIn">
            {/* Close */}
            <button
              type="button"
              onClick={() => setFeedbackOpen(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white text-lg transition cursor-pointer"
            >
              ✕
            </button>

            <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
              Give product feedback
            </h3>
            <p className="mt-1.5 text-[11px] text-white/40 leading-relaxed font-medium">
              Share suggestions, requests, or comment on your experience with us.
            </p>

            <form onSubmit={handleFeedbackSubmit} className="mt-6 space-y-4">
              <label className="grid gap-1 text-[10px] text-white/50 uppercase font-bold">
                Email Address
                <input
                  type="email"
                  required
                  value={feedbackEmail}
                  onChange={(e) => setFeedbackEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="w-full bg-[#121212] border border-white/5 focus:border-[var(--color-primary)] rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 outline-none mt-1 transition"
                />
              </label>

              <label className="grid gap-1 text-[10px] text-white/50 uppercase font-bold">
                Feedback Type
                <select
                  value={feedbackType}
                  onChange={(e) => setFeedbackType(e.target.value)}
                  className="w-full bg-[#121212] border border-white/5 focus:border-[var(--color-primary)] rounded-xl px-3 py-2.5 text-xs text-white outline-none mt-1 transition"
                >
                  <option value="suggestion">Feature Suggestion</option>
                  <option value="praise">General Praise</option>
                  <option value="complaint">Usability Issue</option>
                  <option value="other">Other Topic</option>
                </select>
              </label>

              <label className="grid gap-1 text-[10px] text-white/50 uppercase font-bold">
                Message &amp; Detail
                <textarea
                  required
                  value={feedbackMsg}
                  onChange={(e) => setFeedbackMsg(e.target.value)}
                  rows={4}
                  placeholder="I would love to see a feature that..."
                  className="w-full bg-[#121212] border border-white/5 focus:border-[var(--color-primary)] rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 outline-none mt-1 transition resize-none font-sans"
                />
              </label>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setFeedbackOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/5 text-[11px] font-bold uppercase tracking-wider hover:bg-white/[0.02] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-black text-[11px] font-black uppercase tracking-wider hover:bg-[var(--color-primary-hover)] transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Send Feedback"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          MODAL 2: REPORT AN ISSUE FORM
      ════════════════════════════════════════════════════════════════════════ */}
      {issueOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl animate-modalScaleIn">
            {/* Close */}
            <button
              type="button"
              onClick={() => setIssueOpen(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white text-lg transition cursor-pointer"
            >
              ✕
            </button>

            <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-purple-400" />
              Report an issue
            </h3>
            <p className="mt-1.5 text-[11px] text-white/40 leading-relaxed font-medium">
              Submit a technical ticket or let us know about coupon accuracy concerns.
            </p>

            <form onSubmit={handleIssueSubmit} className="mt-6 space-y-4">
              <label className="grid gap-1 text-[10px] text-white/50 uppercase font-bold">
                Email Address
                <input
                  type="email"
                  required
                  value={issueEmail}
                  onChange={(e) => setIssueEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="w-full bg-[#121212] border border-white/5 focus:border-[var(--color-primary)] rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 outline-none mt-1 transition"
                />
              </label>

              <label className="grid gap-1 text-[10px] text-white/50 uppercase font-bold">
                Issue Subject Summary
                <input
                  type="text"
                  required
                  value={issueSubject}
                  onChange={(e) => setIssueSubject(e.target.value)}
                  placeholder="e.g. Coupon validation bug on Nike store"
                  className="w-full bg-[#121212] border border-white/5 focus:border-[var(--color-primary)] rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 outline-none mt-1 transition"
                />
              </label>

              <label className="grid gap-1 text-[10px] text-white/50 uppercase font-bold">
                Details &amp; Description
                <textarea
                  required
                  value={issueDetails}
                  onChange={(e) => setIssueDetails(e.target.value)}
                  rows={4}
                  placeholder="Describe what occurred, including the store page or code copy actions if relevant..."
                  className="w-full bg-[#121212] border border-white/5 focus:border-[var(--color-primary)] rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 outline-none mt-1 transition resize-none font-sans"
                />
              </label>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIssueOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/5 text-[11px] font-bold uppercase tracking-wider hover:bg-white/[0.02] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-purple-500 text-black text-[11px] font-black uppercase tracking-wider hover:bg-purple-400 transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

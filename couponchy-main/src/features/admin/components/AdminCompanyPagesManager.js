"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 animate-spin" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" className="stroke-current opacity-25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" className="stroke-current" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function cleanHTMLContent(rawHtml) {
  if (typeof window === "undefined" || !rawHtml) return "";
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, "text/html");

  function cleanNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return "";
    }

    const tagName = node.tagName.toUpperCase();

    // Disallowed tags
    if (["SCRIPT", "STYLE", "META", "LINK", "HEAD", "TITLE", "SVG", "IMG"].includes(tagName)) {
      return "";
    }

    // Recursively clean children
    let childContent = "";
    for (let i = 0; i < node.childNodes.length; i++) {
      childContent += cleanNode(node.childNodes[i]);
    }

    const tag = tagName.toLowerCase();

    // Standard styling & structure tags
    if (["P", "H2", "H3", "H4", "STRONG", "B", "EM", "I", "UL", "OL", "LI", "BLOCKQUOTE", "PRE", "CODE"].includes(tagName)) {
      const finalTag = (tag === "b" ? "strong" : tag === "i" ? "em" : tag);
      if (finalTag === "p" && node.classList.contains("lead")) {
        return `<p class="lead">${childContent}</p>`;
      }
      return `<${finalTag}>${childContent}</${finalTag}>`;
    }

    if (tagName === "A") {
      const href = node.getAttribute("href");
      if (href) {
        return `<a href="${href}" target="_blank" rel="noopener noreferrer">${childContent}</a>`;
      }
      return childContent;
    }

    if (tagName === "BR") {
      return "<br />";
    }

    if (tagName === "H1") {
      return `<h2>${childContent}</h2>`;
    }
    if (["H5", "H6"].includes(tagName)) {
      return `<h3>${childContent}</h3>`;
    }

    // Unwrap divs, spans, tables etc.
    return childContent;
  }

  let result = "";
  for (let i = 0; i < doc.body.childNodes.length; i++) {
    result += cleanNode(doc.body.childNodes[i]);
  }

  return result
    .replace(/\r\n/g, "\n")
    .replace(/\n\s*\n/g, "\n")
    .trim();
}

const PAGE_KEYS = [
  { slug: "about", label: "About Us", path: "/about" },
  { slug: "contact", label: "Contact Us", path: "/contact" },
  { slug: "privacy", label: "Privacy Policy", path: "/privacy" },
  { slug: "terms", label: "Terms Of Service", path: "/terms" },
  { slug: "sitemap", label: "Sitemap", path: "/sitemap" },
];

const defaultAboutData = {
  title: "About Us",
  heroKicker: "ABOUT",
  heroTitle: "We built a verification engine because coupon sites are broken.",
  heroSubtitle: "Couponchy exists for one simple reason: most coupon codes on the internet don't work, and nobody was willing to fix it. So we built a system that tests and verifies every single code before you use it.",
  problemKicker: "THE PROBLEM",
  problemTitle: "The coupon industry has a trust problem.",
  problemDesc1: "Coupons often take money from click-to-reveal redirects. If they're expired, it wastes your time. Traditional coupon directories rely on unchecked aggregator feeds, leading to a frustrating experience where 60-80% of promo codes are broken.",
  problemDesc2: "We decided to build a different kind of system where every code is tested, verified, and backed by a transparent validation log of when it last worked. One source of truth for ecommerce discounts.",
  milestones: [
    { year: "2018", title: "Founded in Santa Monica", desc: "Target tracking and building blocks for e-commerce promotion databases." },
    { year: "2020", title: "SimplyCodes Initial Launch", desc: "Launched a lightweight extension based on the premise that validation should come before display." },
    { year: "2021", title: "$10M+ in Verified GMV", desc: "Crossed major milestones in actual gross merchandise value processed through verified offers." },
    { year: "2022", title: "Focus Layer Engine Operational", desc: "Automated testing system starts using scraper modules and checkout validation checks." },
    { year: "2024", title: "Dashboard & Directory Launch", desc: "Launched Web Dashboard with live status metrics, store categorization, and real-time coupon lists." },
    { year: "2026", title: "Couponchy Verification v2", desc: "Completed direct database synchronization and modern user submission moderations." }
  ],
  principles: [
    { title: "Verification over aggregation", desc: "Aggregation is easy, validation is hard. We do not dump thousands of untested coupons into our index just for search volume." },
    { title: "Transparency over trust", desc: "Don't just take our word for it. We display exact status codes, verification dates, and community confirmation feedback." },
    { title: "Conflict-free incentives", desc: "Traditional coupon sites earn by driving user clicks, even on broken codes. We only win when we actually save you money." },
    { title: "Privacy by architecture", desc: "We do not track your browsing histories, record search terms, or sell your shopping patterns. Your data remains yours." },
    { title: "Aligned structures", desc: "Our checkout test systems integrate seamlessly with the admin dashboard, keeping public code lists in absolute sync." },
    { title: "Sovereign independence", desc: "We are an independent platform, free from affiliate networks' pressure to list unverified or low-value promotions." }
  ],
  methodologyKicker: "PROCESS & METHODOLOGY",
  methodologyTitle: "The same methodology. A bigger mission.",
  methodologySubtitle: "We verify promo codes using a multi-step checkout simulation. When a coupon is processed, our pipeline records screen checkpoints, monitors total cart discounts, and calculates exact exclusion terms.",
  methodologyLinkText: "Explore store directory",
  methodologyCard1Title: "Active Coupon Review",
  methodologyCard1Desc: "Coupons checked dynamically in real-time across multiple e-commerce cart platforms and search scripts.",
  methodologyCard2Title: "Verified Product Status",
  methodologyCard2Desc: "Testing exclusions directly and verifying minimum order rules before adding them to search directories.",
  teamKicker: "THE TEAM",
  teamTitle: "Small team. Big verification engine.",
  teamSubtitle: "Couponchy is built by a focused team of software engineers, designers, and deal hunters who believe getting online promo codes should be transparent, easy, and accurate.",
  teamCards: [
    { title: "Open Roles", desc: "Engineers, designers, and product builders who want to fix checkout experiences.", cta: "View Careers", url: "/contact" },
    { title: "Our Publications", desc: "Read studies, news updates, and stats analyses on online shopping trends.", cta: "Read Blog", url: "/blog" },
    { title: "Media Inquiries", desc: "Looking for coupon validation statistics or data insights? Let's connect.", cta: "Get in touch", url: "/contact" }
  ],
  ctaTitle: "See what we built.",
  ctaSubtitle: "Browse our list of verified store coupons, discover hot promotions, or submit an offer to share with the saving community.",
  ctaButton1Text: "Browse Stores",
  ctaButton2Text: "Read Methodology"
};

const defaultContactData = {
  title: "Contact Us",
  heroTitle: "Hi, how can we help?",
  heroSubtitle: "Get instant answers for any problem. Looking for detailed guides? Check our learning center.",
  searchPlaceholder: "Ask us anything...",
  faqGroups: [
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
  ],
  feedbackLabel: "Give product feedback",
  issueLabel: "Report an issue",
  feedbackTitle: "Give product feedback",
  feedbackSubtitle: "Share suggestions, requests, or comment on your experience with us.",
  issueTitle: "Report an issue",
  issueSubtitle: "Submit a technical ticket or let us know about coupon accuracy concerns."
};

const defaultPrivacyData = {
  title: "Privacy Policy",
  heroTitle: "Your privacy is our baseline, not a feature.",
  heroSubtitle: "Most coupon websites track your clicks and sell your shopping profiles. Couponchy is different. We believe savings shouldn't cost you your personal data, so we've engineered our directory to be private by design.",
  
  aggregatorTitle: "Aggregator Tracking Model",
  aggregatorNote: "Reduces browser speeds and monetizes your private actions.",
  aggregatorItems: [
    { title: "Browser History Profiling", desc: "Monitors other open tabs and records your general search behavior across the web." },
    { title: "Behavioral Ad Pixels", desc: "Injects Facebook, Google, and marketing cookies to retarget ads based on store visits." },
    { title: "Database Sharing", desc: "Shares or rents email databases and cart categories to external retail networks." },
    { title: "Hidden Popups & Redirects", desc: "Fires popups and click-to-reveal redirects that execute tracking redirects behind your active browser." }
  ],
  
  couponchyTitle: "Couponchy Privacy Model",
  couponchyNote: "Protects browser integrity and puts privacy first.",
  couponchyItems: [
    { title: "Anonymized Search Queries", desc: "Search terms look up store coupons on our server without tracking who sent the request." },
    { title: "Zero Marketing Trackers", desc: "We never drop Facebook Pixels, AdWords remarketing pixels, or third-party behavioral trackers." },
    { title: "Secure Account Vault", desc: "Your name and email address are encrypted and never sold, leased, or shared." },
    { title: "Clean User Experience", desc: "We only display codes and success indicators on-page. No popups, extensions, or background redirects." }
  ],

  commitmentsTitle: "Six things we will never do.",
  commitments: [
    { title: "No browser monitoring", desc: "We never check other active browser tabs, search queries, or general shopping websites." },
    { title: "No behavioral ad profiling", desc: "We never show targeted remarketing ads or build individual interest categories." },
    { title: "No database selling", desc: "Your profile details, email address, and bookmarks will never be shared with marketers." },
    { title: "No hidden background scripts", desc: "We never inject background scripts, tracking pixels, or execute redirect tags." },
    { title: "No review manipulation", desc: "We never change coupon success rates, store ratings, or reviews in exchange for payments." },
    { title: "No browser access triggers", desc: "We never request browser access privileges, tab contexts, or file access rights." }
  ],

  revenueTitle: "How we actually make money.",
  revenueSubtitle: "We earn commission fees from retail merchants, not by exploiting your digital profile. Our interests are aligned directly with your savings.",
  revenueSteps: [
    { step: "1", title: "Copy Promo Code", desc: "You find and copy a verified coupon code on Couponchy for a store." },
    { step: "2", title: "Checkout & Save", desc: "You checkout at the brand's store. The merchant tracks that you came from us." },
    { step: "3", title: "Merchant Commission", desc: "The merchant credits us a small referral fee for driving the sale. We keep the platform free." }
  ],

  metricsTitle: "Exactly one type of data. Anonymized.",
  metricsSubtitle: "To keep Couponchy clean and optimized, we only log aggregate actions. We record total search counts and copy button clicks. These are captured anonymously and cannot be associated with any specific email or visitor.",
  metricsItems: [
    { label: "Coupon Copied status", desc: "Log click event to monitor code success rates." },
    { label: "Merchant search count", desc: "Count lookups per store slug to track search trends." },
    { label: "No personal profiling", desc: "No IP addresses or location details linked to transactions." }
  ],

  legalTitle: "The Legal Essentials",
  legalSubtitle: "Collapsible legal declarations for official regulatory compliance.",
  legalClauses: [
    {
      id: "info",
      title: "1. Information We Collect",
      content: "When you browse Couponchy, we collect basic, non-personally identifiable usage data. This includes store page visit counts, search terms entered, and clicks on coupon buttons to copy promo codes. If you register an account, we store your profile details (name, email) securely. We do not track your browsing history outside our website, collect payment credentials, or log purchase categories."
    },
    {
      id: "cookies",
      title: "2. Cookies & Tracker Pixels",
      content: "Couponchy uses essential functional cookies to keep you signed in, remember your store bookmarks, and analyze general website traffic. We do not use cross-site tracking cookies, behavioral ad pixels (such as Meta pixel or Google remarketing tags), or behavioral advertising algorithms. You can configure your browser to block cookies, but some features (like bookmarking) may require them."
    },
    {
      id: "sharing",
      title: "3. Sharing of Information",
      content: "We never sell, rent, or trade your email address, search keywords, or profile data with advertisers, data brokers, or marketing aggregates. We only pass basic campaign codes to affiliate networks when you click our links to complete a purchase, which enables merchants to credit us a commission. No personal profile details are passed during this transaction."
    },
    {
      id: "rights",
      title: "4. Your Data Rights & Choices",
      content: "You are in complete control of your data. You can delete your search cookies at any time, browse all coupon directory stores anonymously, or delete your registered Couponchy account permanently from your profile dashboard. Doing so permanently purges all email addresses, logs, and bookmarks from our server database."
    }
  ]
};

function getAboutData(pageObj) {
  if (!pageObj || typeof pageObj === "string" || !pageObj.heroTitle) {
    return { ...defaultAboutData };
  }
  return { ...defaultAboutData, ...pageObj };
}

function getContactData(pageObj) {
  if (!pageObj || typeof pageObj === "string" || !pageObj.heroTitle) {
    return { ...defaultContactData };
  }
  return { ...defaultContactData, ...pageObj };
}

function getPrivacyData(pageObj) {
  if (!pageObj || typeof pageObj === "string" || !pageObj.heroTitle) {
    return { ...defaultPrivacyData };
  }
  return { ...defaultPrivacyData, ...pageObj };
}

const defaultTermsData = {
  title: "Terms Of Service",
  heroTitle: "Terms of Service",
  heroSubtitle: "Clear guidelines for a transparent saving experience. Please read these terms carefully before using Couponchy.",
  disclaimerTitle: "Important Disclaimer",
  disclaimerText: "Couponchy is a coupon sharing directory and is not affiliated with or endorsed by the brands listed on our platform. Coupon codes are submitted by users and gathered from public sources; we do not guarantee that any code will work, and we are not liable for any issues during merchant checkouts.",
  highlights: [
    { title: "Acceptable Use", desc: "Use Couponchy for personal, non-commercial coupon hunting. Do not scrape our verified promo code indexes." },
    { title: "Community Voting", desc: "Be honest. Upvote working coupons and downvote expired ones to help keep Couponchy clean." },
    { title: "No Warranty on Deals", desc: "Merchants control their discounts. We cannot guarantee that any promo code will save you money." },
    { title: "Account Security", desc: "Keep your login details confidential. You are responsible for all coupon submissions under your profile." }
  ],
  clauses: [
    {
      id: "services",
      title: "1. Description of Services & Eligibility",
      content: "Couponchy provides a directory of verified coupon codes, sales, and promo links for retail brands. You must be at least 13 years of age to register an account or submit coupon codes. By accessing our website, you warrant that you meet this requirement and agree to abide by these Terms of Service."
    },
    {
      id: "submissions",
      title: "2. User Submissions & Content",
      content: "When you submit a coupon code or vote on active promotions, you grant Couponchy a perpetual, worldwide, royalty-free license to display, modify, and publish this content. You agree that you will not submit false, misleading, spammy, or duplicate promotional offers."
    },
    {
      id: "conduct",
      title: "3. Prohibited Conduct",
      content: "You agree not to use automated crawlers, bots, or scrapers to copy coupon codes or store information from Couponchy. You may not attempt to disrupt the performance of our verification checkout test servers or exploit community voting metrics."
    },
    {
      id: "disclaimer",
      title: "4. Disclaimer of Warranties",
      content: "Couponchy is provided on an 'as-is' and 'as-available' basis. We make no representations or warranties of any kind regarding the validity, accuracy, or availability of any coupon code, merchant listing, or discount percentage. All coupon redemptions are subject to merchant approval at checkout."
    },
    {
      id: "liability",
      title: "5. Limitation of Liability",
      content: "In no event shall Couponchy, its engineers, partners, or owners be liable for any direct, indirect, incidental, or consequential damages resulting from your use or inability to use our website, including checkout errors, cart order failures, or merchant billing disputes."
    },
    {
      id: "disputes",
      title: "6. Governing Law & Dispute Resolution",
      content: "These terms and your use of Couponchy shall be governed by and construed in accordance with local regulations, without regard to its conflict of law principles. Any dispute arising under these terms shall be subject to the exclusive jurisdiction of the regional courts."
    }
  ]
};

function getTermsData(pageObj) {
  if (!pageObj || typeof pageObj === "string" || !pageObj.heroTitle) {
    return { ...defaultTermsData };
  }
  return { ...defaultTermsData, ...pageObj };
}

const defaultSitemapData = {
  title: "Sitemap",
  heroTitle: "Sitemap",
  heroSubtitle: "Explore our complete store directory, shopping categories, and company links to start saving.",
  generalTitle: "Essential Pages",
  categoriesTitle: "Browse by Category",
  storesTitle: "Brand Directory A-Z"
};

function getSitemapData(pageObj) {
  if (!pageObj || typeof pageObj === "string" || !pageObj.heroTitle) {
    return { ...defaultSitemapData };
  }
  return { ...defaultSitemapData, ...pageObj };
}

export default function AdminCompanyPagesManager() {
  const [pages, setPages] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("about");
  const [editorTab, setEditorTab] = useState("write"); // 'write' | 'preview'
  const [aboutSubTab, setAboutSubTab] = useState("hero");
  const [contactSubTab, setContactSubTab] = useState("hero");
  const [privacySubTab, setPrivacySubTab] = useState("hero");
  const [termsSubTab, setTermsSubTab] = useState("hero");
  const [editorDragActive, setEditorDragActive] = useState(false);
  
  const textareaRef = useRef(null);

  useEffect(() => {
    async function loadPages() {
      try {
        const response = await fetch("/api/pages");
        if (!response.ok) throw new Error("Failed to fetch page configurations.");
        const payload = await response.json();
        setPages(payload.data || {});
      } catch (err) {
        toast.error("Failed to load company pages.");
      } finally {
        setIsLoading(false);
      }
    }
    loadPages();
  }, []);

  const activePage = pages[activeTab] || { title: PAGE_KEYS.find(p => p.slug === activeTab)?.label || "", content: "" };
  const isAbout = activeTab === "about";
  const isContact = activeTab === "contact";
  const isPrivacy = activeTab === "privacy";
  const isTerms = activeTab === "terms";
  const isSitemap = activeTab === "sitemap";
  const aboutData = isAbout ? getAboutData(activePage) : null;
  const contactData = isContact ? getContactData(activePage) : null;
  const privacyData = isPrivacy ? getPrivacyData(activePage) : null;
  const termsData = isTerms ? getTermsData(activePage) : null;
  const sitemapData = isSitemap ? getSitemapData(activePage) : null;

  const handleFieldChange = (field, value) => {
    setPages((prev) => ({
      ...prev,
      [activeTab]: {
        ...activePage,
        [field]: value,
      },
    }));
  };

  const handleAboutFieldChange = (field, value) => {
    setPages((prev) => ({
      ...prev,
      about: {
        ...aboutData,
        [field]: value,
      },
    }));
  };

  const handleContactFieldChange = (field, value) => {
    setPages((prev) => ({
      ...prev,
      contact: {
        ...contactData,
        [field]: value,
      },
    }));
  };

  const handlePrivacyFieldChange = (field, value) => {
    setPages((prev) => ({
      ...prev,
      privacy: {
        ...privacyData,
        [field]: value,
      },
    }));
  };

  const handleTermsFieldChange = (field, value) => {
    setPages((prev) => ({
      ...prev,
      terms: {
        ...termsData,
        [field]: value,
      },
    }));
  };

  const handleSitemapFieldChange = (field, value) => {
    setPages((prev) => ({
      ...prev,
      sitemap: {
        ...sitemapData,
        [field]: value,
      },
    }));
  };

  const handleTermsArrayChange = (arrayKey, index, field, value) => {
    const updated = [...termsData[arrayKey]];
    updated[index] = { ...updated[index], [field]: value };
    handleTermsFieldChange(arrayKey, updated);
  };

  // Milestone Actions
  const handleMilestoneChange = (index, field, value) => {
    const updated = [...aboutData.milestones];
    updated[index] = { ...updated[index], [field]: value };
    handleAboutFieldChange("milestones", updated);
  };

  const addMilestone = () => {
    const updated = [...aboutData.milestones, { year: "", title: "", desc: "" }];
    handleAboutFieldChange("milestones", updated);
  };

  const removeMilestone = (index) => {
    const updated = aboutData.milestones.filter((_, i) => i !== index);
    handleAboutFieldChange("milestones", updated);
  };

  // Principles Actions
  const handlePrincipleChange = (index, field, value) => {
    const updated = [...aboutData.principles];
    updated[index] = { ...updated[index], [field]: value };
    handleAboutFieldChange("principles", updated);
  };

  // Team Actions
  const handleTeamCardChange = (index, field, value) => {
    const updated = [...aboutData.teamCards];
    updated[index] = { ...updated[index], [field]: value };
    handleAboutFieldChange("teamCards", updated);
  };

  // Contact FAQ Group Actions
  const handleFAQGroupChange = (groupIndex, field, value) => {
    const updated = [...contactData.faqGroups];
    updated[groupIndex] = { ...updated[groupIndex], [field]: value };
    handleContactFieldChange("faqGroups", updated);
  };

  const addFAQGroup = () => {
    const updated = [...contactData.faqGroups, { id: `grp-${Date.now()}`, title: "New FAQ Category", items: [] }];
    handleContactFieldChange("faqGroups", updated);
  };

  const removeFAQGroup = (index) => {
    const updated = contactData.faqGroups.filter((_, i) => i !== index);
    handleContactFieldChange("faqGroups", updated);
  };

  const handleFAQItemChange = (groupIndex, itemIndex, field, value) => {
    const updatedGroups = [...contactData.faqGroups];
    const updatedItems = [...updatedGroups[groupIndex].items];
    updatedItems[itemIndex] = { ...updatedItems[itemIndex], [field]: value };
    updatedGroups[groupIndex] = { ...updatedGroups[groupIndex], items: updatedItems };
    handleContactFieldChange("faqGroups", updatedGroups);
  };

  const addFAQItem = (groupIndex) => {
    const updatedGroups = [...contactData.faqGroups];
    const updatedItems = [...updatedGroups[groupIndex].items, { id: `faq-${Date.now()}`, q: "New Question", a: "New Answer" }];
    updatedGroups[groupIndex] = { ...updatedGroups[groupIndex], items: updatedItems };
    handleContactFieldChange("faqGroups", updatedGroups);
  };

  const removeFAQItem = (groupIndex, itemIndex) => {
    const updatedGroups = [...contactData.faqGroups];
    const updatedItems = updatedGroups[groupIndex].items.filter((_, i) => i !== itemIndex);
    updatedGroups[groupIndex] = { ...updatedGroups[groupIndex], items: updatedItems };
    handleContactFieldChange("faqGroups", updatedGroups);
  };

  // Privacy Array Actions
  const handlePrivacyArrayChange = (arrayKey, index, field, value) => {
    const updated = [...privacyData[arrayKey]];
    updated[index] = { ...updated[index], [field]: value };
    handlePrivacyFieldChange(arrayKey, updated);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await fetch("/api/pages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pages),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Failed to update configurations.");
      setPages(payload.data || {});
      toast.success("Company pages updated successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to save configurations.");
    } finally {
      setIsSaving(false);
    }
  };

  const insertHTMLTag = (tagOpen, tagClose = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    const replacement = tagOpen + selectedText + tagClose;
    const newContent = text.substring(0, start) + replacement + text.substring(end);

    handleFieldChange("content", newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tagOpen.length, start + tagOpen.length + selectedText.length);
    }, 50);
  };

  const insertHTMLContent = (html) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      const text = activePage.content || "";
      handleFieldChange("content", text + html);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const replacement = html;
    const newContent = text.substring(0, start) + replacement + text.substring(end);

    handleFieldChange("content", newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 50);
  };

  const handleEditorDragOver = (e) => {
    e.preventDefault();
    setEditorDragActive(true);
  };

  const handleEditorDragLeave = (e) => {
    e.preventDefault();
    setEditorDragActive(false);
  };

  const handleEditorDrop = (e) => {
    e.preventDefault();
    setEditorDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.name.toLowerCase().endsWith(".html") || file.type === "text/html") {
        const reader = new FileReader();
        reader.onload = (event) => {
          const fileContent = event.target.result;
          const cleaned = cleanHTMLContent(fileContent);
          insertHTMLContent(cleaned);
          toast.success("HTML file content cleaned and inserted!");
        };
        reader.readAsText(file);
      } else {
        toast.error("Please drop a valid .html file.");
      }
    }
  };

  const handleEditorPaste = (e) => {
    const html = e.clipboardData?.getData("text/html");
    if (html && html.trim()) {
      e.preventDefault();
      const cleaned = cleanHTMLContent(html);
      if (cleaned.trim()) {
        insertHTMLContent(cleaned);
        toast.success("Rich text parsed, cleaned, and inserted!");
      } else {
        const text = e.clipboardData.getData("text/plain");
        if (text) {
          insertHTMLContent(text);
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner />
        <span className="ml-2 text-sm text-[var(--muted)]">Loading company pages...</span>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
      {/* Navigation List */}
      <div className="flex flex-row overflow-x-auto gap-2 lg:flex-col lg:overflow-x-visible">
        {PAGE_KEYS.map((item) => {
          const isActive = activeTab === item.slug;
          return (
            <button
              key={item.slug}
              type="button"
              onClick={() => {
                setActiveTab(item.slug);
                setEditorTab("write");
              }}
              className={`whitespace-nowrap rounded-xl border px-4 py-3 text-left text-sm font-medium transition cursor-pointer ${
                isActive
                  ? "border-[var(--color-primary)] bg-[var(--surface-soft)] text-white"
                  : "border-transparent text-[var(--muted)] hover:border-[var(--border)] hover:bg-[var(--surface-soft)] hover:text-white"
              }`}
            >
              <div className="font-semibold">{item.label}</div>
              <div className="text-[10px] opacity-75 font-mono hidden lg:block">{item.path}</div>
            </button>
          );
        })}
      </div>

      {/* Editor Content Area */}
      <form onSubmit={handleSave} className="space-y-6">
        <Card className="border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-white">
                Edit Page: {PAGE_KEYS.find((p) => p.slug === activeTab)?.label}
              </CardTitle>
              <CardDescription className="text-sm text-[var(--muted)]">
                {isAbout && "Configure custom sections, timeline milestones, and principles for the premium About page."}
                {isContact && "Configure help queries, dynamic category groupings, FAQ accordions, and support forms."}
                {isPrivacy && "Configure business comparison models, commitments grid, referral streams, and legal clauses."}
                {isTerms && "Configure user eligibility, community guidelines, key highlights, and disclaimer clauses."}
                {isSitemap && "Configure titles and layout sections for dynamic stores and categories directories."}
                {!isAbout && !isContact && !isPrivacy && !isTerms && !isSitemap && "Modify title, URL path, and insert HTML content for the public page."}
              </CardDescription>
            </div>
            <div className="flex rounded-lg bg-[var(--surface-soft)] p-0.5 border border-[var(--border)]">
              <button
                type="button"
                onClick={() => setEditorTab("write")}
                className={`rounded-md px-3.5 py-1 text-xs font-bold transition cursor-pointer ${
                  editorTab === "write" ? "bg-[var(--surface)] text-white shadow-sm" : "text-[var(--muted)] hover:text-white"
                }`}
              >
                Settings Form
              </button>
              <button
                type="button"
                onClick={() => setEditorTab("preview")}
                className={`rounded-md px-3.5 py-1 text-xs font-bold transition cursor-pointer ${
                  editorTab === "preview" ? "bg-[var(--surface)] text-white shadow-sm" : "text-[var(--muted)] hover:text-white"
                }`}
              >
                Live Preview
              </button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Page Title & URL banner */}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-xs text-[var(--muted)]">
                <span className="font-semibold text-white font-mono">Page Document Title</span>
                <Input
                  value={isAbout ? aboutData.title : isContact ? contactData.title : isPrivacy ? privacyData.title : isTerms ? termsData.title : isSitemap ? sitemapData.title : activePage.title}
                  onChange={(e) => {
                    if (isAbout) handleAboutFieldChange("title", e.target.value);
                    else if (isContact) handleContactFieldChange("title", e.target.value);
                    else if (isPrivacy) handlePrivacyFieldChange("title", e.target.value);
                    else if (isTerms) handleTermsFieldChange("title", e.target.value);
                    else if (isSitemap) handleSitemapFieldChange("title", e.target.value);
                    else handleFieldChange("title", e.target.value);
                  }}
                  placeholder="e.g. About Us"
                  required
                  className="bg-[var(--surface-soft)] text-white"
                />
              </label>

              <label className="grid gap-1.5 text-xs text-[var(--muted)]">
                <span className="font-semibold text-white font-mono">URL Path (Read-Only)</span>
                <Input
                  value={PAGE_KEYS.find((p) => p.slug === activeTab)?.path}
                  disabled
                  className="bg-black/40 text-[var(--muted)] border-[var(--border)] opacity-60 font-mono"
                />
              </label>
            </div>

            {/* Custom About Page Settings Form */}
            {isAbout && editorTab === "write" && (
              <div className="space-y-6 border-t border-[var(--border)] pt-6">
                <div className="flex flex-wrap gap-2 border-b border-[var(--border)] pb-3">
                  {[
                    { id: "hero", label: "Hero & Problem" },
                    { id: "milestones", label: "Milestones Timeline" },
                    { id: "principles", label: "Core Principles" },
                    { id: "methodology", label: "Methodology Flow" },
                    { id: "team", label: "Team & Outreach" }
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setAboutSubTab(sub.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        aboutSubTab === sub.id 
                          ? "bg-[var(--color-primary)] text-black font-extrabold" 
                          : "bg-[var(--surface-soft)] text-[var(--muted)] hover:text-white border border-[var(--border)]"
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>

                {aboutSubTab === "hero" && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-extrabold text-white">Hero &amp; Problem Statements</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input label="Hero Section Kicker" value={aboutData.heroKicker} onChange={(e) => handleAboutFieldChange("heroKicker", e.target.value)} className="bg-[var(--surface-soft)] text-white" />
                      <Input label="Hero Title Heading" value={aboutData.heroTitle} onChange={(e) => handleAboutFieldChange("heroTitle", e.target.value)} className="bg-[var(--surface-soft)] text-white" />
                    </div>
                    <textarea value={aboutData.heroSubtitle} onChange={(e) => handleAboutFieldChange("heroSubtitle", e.target.value)} rows={3} className="w-full bg-[var(--surface-soft)] border border-[var(--border)] rounded-xl p-3 text-white text-xs resize-y" />
                    <div className="grid gap-4 sm:grid-cols-2 mt-4 border-t border-[var(--border)] pt-4">
                      <Input label="Problem Kicker" value={aboutData.problemKicker} onChange={(e) => handleAboutFieldChange("problemKicker", e.target.value)} className="bg-[var(--surface-soft)] text-white" />
                      <Input label="Problem Title Heading" value={aboutData.problemTitle} onChange={(e) => handleAboutFieldChange("problemTitle", e.target.value)} className="bg-[var(--surface-soft)] text-white" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <textarea value={aboutData.problemDesc1} onChange={(e) => handleAboutFieldChange("problemDesc1", e.target.value)} rows={4} className="w-full bg-[var(--surface-soft)] border border-[var(--border)] rounded-xl p-3 text-white text-xs resize-y" />
                      <textarea value={aboutData.problemDesc2} onChange={(e) => handleAboutFieldChange("problemDesc2", e.target.value)} rows={4} className="w-full bg-[var(--surface-soft)] border border-[var(--border)] rounded-xl p-3 text-white text-xs resize-y" />
                    </div>
                  </div>
                )}

                {aboutSubTab === "milestones" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-extrabold text-white">Milestones Timeline</h3>
                      <Button type="button" onClick={addMilestone} className="bg-[var(--color-primary)] text-black font-extrabold text-xs px-3 py-1.5 rounded-md hover:bg-[var(--color-primary-hover)]">+ Add Milestone</Button>
                    </div>
                    {aboutData.milestones.map((item, index) => (
                      <div key={index} className="bg-[var(--surface-soft)] p-4 rounded-xl border border-[var(--border)] space-y-2 relative">
                        <Input value={item.year} onChange={(e) => handleMilestoneChange(index, "year", e.target.value)} className="w-24 bg-[var(--surface)] text-white text-xs" />
                        <Input value={item.title} onChange={(e) => handleMilestoneChange(index, "title", e.target.value)} className="bg-[var(--surface)] text-white text-xs" />
                        <textarea value={item.desc} onChange={(e) => handleMilestoneChange(index, "desc", e.target.value)} rows={2} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded p-2 text-white text-xs resize-y" />
                        <button type="button" onClick={() => removeMilestone(index)} className="absolute top-4 right-4 text-xs font-bold text-red-400 hover:text-red-300">Remove</button>
                      </div>
                    ))}
                  </div>
                )}

                {aboutSubTab === "principles" && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {aboutData.principles.map((item, index) => (
                      <div key={index} className="bg-[var(--surface-soft)] p-4 rounded-xl border border-[var(--border)] space-y-3">
                        <Input value={item.title} onChange={(e) => handlePrincipleChange(index, "title", e.target.value)} className="bg-[var(--surface)] text-white text-xs" />
                        <textarea value={item.desc} onChange={(e) => handlePrincipleChange(index, "desc", e.target.value)} rows={3} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded p-2 text-white text-xs" />
                      </div>
                    ))}
                  </div>
                )}

                {aboutSubTab === "methodology" && (
                  <div className="space-y-4">
                    <Input value={aboutData.methodologyTitle} onChange={(e) => handleAboutFieldChange("methodologyTitle", e.target.value)} className="bg-[var(--surface-soft)] text-white" />
                    <textarea value={aboutData.methodologySubtitle} onChange={(e) => handleAboutFieldChange("methodologySubtitle", e.target.value)} rows={3} className="w-full bg-[var(--surface-soft)] border border-[var(--border)] rounded p-3 text-white text-xs" />
                  </div>
                )}

                {aboutSubTab === "team" && (
                  <div className="space-y-4">
                    <Input value={aboutData.teamTitle} onChange={(e) => handleAboutFieldChange("teamTitle", e.target.value)} className="bg-[var(--surface-soft)] text-white" />
                    <textarea value={aboutData.teamSubtitle} onChange={(e) => handleAboutFieldChange("teamSubtitle", e.target.value)} rows={3} className="w-full bg-[var(--surface-soft)] border border-[var(--border)] rounded p-3 text-white text-xs" />
                  </div>
                )}
              </div>
            )}

            {/* Custom Contact Page Settings Form */}
            {isContact && editorTab === "write" && (
              <div className="space-y-6 border-t border-[var(--border)] pt-6">
                <div className="flex flex-wrap gap-2 border-b border-[var(--border)] pb-3">
                  {[
                    { id: "hero", label: "Hero & Support Labels" },
                    { id: "faqs", label: "FAQ Categories Hub" }
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setContactSubTab(sub.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        contactSubTab === sub.id 
                          ? "bg-[var(--color-primary)] text-black font-extrabold" 
                          : "bg-[var(--surface-soft)] text-[var(--muted)] hover:text-white border border-[var(--border)]"
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>

                {contactSubTab === "hero" && (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input value={contactData.heroTitle} onChange={(e) => handleContactFieldChange("heroTitle", e.target.value)} className="bg-[var(--surface-soft)] text-white" />
                      <Input value={contactData.searchPlaceholder} onChange={(e) => handleContactFieldChange("searchPlaceholder", e.target.value)} className="bg-[var(--surface-soft)] text-white" />
                    </div>
                    <textarea value={contactData.heroSubtitle} onChange={(e) => handleContactFieldChange("heroSubtitle", e.target.value)} rows={3} className="w-full bg-[var(--surface-soft)] border border-[var(--border)] rounded p-3 text-white text-xs" />
                    <div className="grid gap-4 sm:grid-cols-2 mt-4 border-t border-[var(--border)] pt-4">
                      <div className="bg-[var(--surface-soft)] p-4 rounded-xl border border-[var(--border)] space-y-2">
                        <Input value={contactData.feedbackLabel} onChange={(e) => handleContactFieldChange("feedbackLabel", e.target.value)} className="bg-[var(--surface)] text-white text-xs" />
                        <Input value={contactData.feedbackTitle} onChange={(e) => handleContactFieldChange("feedbackTitle", e.target.value)} className="bg-[var(--surface)] text-white text-xs" />
                        <textarea value={contactData.feedbackSubtitle} onChange={(e) => handleContactFieldChange("feedbackSubtitle", e.target.value)} rows={2} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded p-2 text-white text-xs" />
                      </div>
                      <div className="bg-[var(--surface-soft)] p-4 rounded-xl border border-[var(--border)] space-y-2">
                        <Input value={contactData.issueLabel} onChange={(e) => handleContactFieldChange("issueLabel", e.target.value)} className="bg-[var(--surface)] text-white text-xs" />
                        <Input value={contactData.issueTitle} onChange={(e) => handleContactFieldChange("issueTitle", e.target.value)} className="bg-[var(--surface)] text-white text-xs" />
                        <textarea value={contactData.issueSubtitle} onChange={(e) => handleContactFieldChange("issueSubtitle", e.target.value)} rows={2} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded p-2 text-white text-xs" />
                      </div>
                    </div>
                  </div>
                )}

                {contactSubTab === "faqs" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-extrabold text-white">FAQ Category Groups</h3>
                      <Button type="button" onClick={addFAQGroup} className="bg-[var(--color-primary)] text-black font-extrabold text-xs px-3 py-1.5 rounded-md hover:bg-[var(--color-primary-hover)]">+ Add Category</Button>
                    </div>
                    {contactData.faqGroups.map((group, groupIdx) => (
                      <div key={groupIdx} className="bg-[var(--surface-soft)] p-5 rounded-2xl border border-[var(--border)] space-y-4 relative">
                        <div className="flex items-center justify-between">
                          <Input value={group.title} onChange={(e) => handleFAQGroupChange(groupIdx, "title", e.target.value)} className="bg-[var(--surface)] text-white text-xs max-w-sm" />
                          <div className="flex gap-2">
                            <Button type="button" onClick={() => addFAQItem(groupIdx)} className="bg-white/10 text-white font-bold text-xs px-2.5 py-1 rounded hover:bg-white/15">+ Add Question</Button>
                            <button type="button" onClick={() => removeFAQGroup(groupIdx)} className="text-xs font-bold text-red-400 hover:text-red-300">Delete Category</button>
                          </div>
                        </div>
                        <div className="space-y-3 pl-4 border-l border-white/5">
                          {group.items?.map((item, itemIdx) => (
                            <div key={itemIdx} className="bg-[var(--surface)] p-3 rounded-lg border border-[var(--border)] space-y-2 relative">
                              <Input value={item.q} onChange={(e) => handleFAQItemChange(groupIdx, itemIdx, "q", e.target.value)} className="bg-[var(--surface-soft)] text-white text-[11px] h-8" />
                              <textarea value={item.a} onChange={(e) => handleFAQItemChange(groupIdx, itemIdx, "a", e.target.value)} rows={2} className="w-full bg-[var(--surface-soft)] border border-[var(--border)] rounded p-1 text-white text-[10px]" />
                              <button type="button" onClick={() => removeFAQItem(groupIdx, itemIdx)} className="absolute top-2 right-2 text-[10px] font-bold text-red-400 hover:text-red-300">✕ Remove FAQ</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Custom Privacy Page Settings Form */}
            {isPrivacy && editorTab === "write" && (
              <div className="space-y-6 border-t border-[var(--border)] pt-6">
                <div className="flex flex-wrap gap-2 border-b border-[var(--border)] pb-3">
                  {[
                    { id: "hero", label: "Hero & Revenue" },
                    { id: "comparisons", label: "Model Comparisons" },
                    { id: "commitments", label: "Commitments & Metrics" },
                    { id: "clauses", label: "Legal Clauses FAQ" }
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setPrivacySubTab(sub.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        privacySubTab === sub.id 
                          ? "bg-[var(--color-primary)] text-black font-extrabold" 
                          : "bg-[var(--surface-soft)] text-[var(--muted)] hover:text-white border border-[var(--border)]"
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>

                {privacySubTab === "hero" && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-extrabold text-white">Hero Headers &amp; Revenue Settings</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="grid gap-1.5 text-xs text-[var(--muted)]">
                        <span className="font-semibold text-white">Hero Heading Title</span>
                        <Input value={privacyData.heroTitle} onChange={(e) => handlePrivacyFieldChange("heroTitle", e.target.value)} className="bg-[var(--surface-soft)] text-white" />
                      </label>
                      <label className="grid gap-1.5 text-xs text-[var(--muted)]">
                        <span className="font-semibold text-white">Revenue Heading Title</span>
                        <Input value={privacyData.revenueTitle} onChange={(e) => handlePrivacyFieldChange("revenueTitle", e.target.value)} className="bg-[var(--surface-soft)] text-white" />
                      </label>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="grid gap-1.5 text-xs text-[var(--muted)]">
                        <span className="font-semibold text-white">Hero Subtitle Paragraph</span>
                        <textarea value={privacyData.heroSubtitle} onChange={(e) => handlePrivacyFieldChange("heroSubtitle", e.target.value)} rows={3} className="w-full bg-[var(--surface-soft)] border border-[var(--border)] rounded-xl p-3 text-white text-xs resize-y" />
                      </label>
                      <label className="grid gap-1.5 text-xs text-[var(--muted)]">
                        <span className="font-semibold text-white">Revenue Subtitle Paragraph</span>
                        <textarea value={privacyData.revenueSubtitle} onChange={(e) => handlePrivacyFieldChange("revenueSubtitle", e.target.value)} rows={3} className="w-full bg-[var(--surface-soft)] border border-[var(--border)] rounded-xl p-3 text-white text-xs resize-y" />
                      </label>
                    </div>

                    <div className="mt-4 border-t border-[var(--border)] pt-4 space-y-4">
                      <h4 className="text-xs font-bold text-white uppercase">How We Fund Couponchy (Revenue Workflow Steps)</h4>
                      <div className="grid gap-4 sm:grid-cols-3">
                        {privacyData.revenueSteps.map((item, index) => (
                          <div key={index} className="bg-[var(--surface-soft)] p-4 rounded-xl border border-[var(--border)] space-y-2">
                            <span className="text-[10px] text-[var(--color-primary)] font-bold">Step {item.step}</span>
                            <label className="grid gap-0.5 text-[10px] text-[var(--muted)]">
                              <span className="font-semibold text-white">Title</span>
                              <Input value={item.title} onChange={(e) => handlePrivacyArrayChange("revenueSteps", index, "title", e.target.value)} className="bg-[var(--surface)] text-white text-[11px] h-8" />
                            </label>
                            <label className="grid gap-0.5 text-[10px] text-[var(--muted)]">
                              <span className="font-semibold text-white">Short Description</span>
                              <textarea value={item.desc} onChange={(e) => handlePrivacyArrayChange("revenueSteps", index, "desc", e.target.value)} rows={3} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded p-1 text-white text-[10px] resize-none" />
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {privacySubTab === "comparisons" && (
                  <div className="space-y-6">
                    <h3 className="text-sm font-extrabold text-white">Privacy Model Comparisons</h3>
                    
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Aggregators */}
                      <div className="bg-[var(--surface-soft)] p-5 rounded-2xl border border-[var(--border)] space-y-4">
                        <h4 className="text-xs font-bold text-red-400 uppercase">Aggregators Side Settings</h4>
                        <label className="grid gap-1 text-xs text-[var(--muted)]">
                          <span className="font-semibold text-white">Model Kicker Title</span>
                          <Input value={privacyData.aggregatorTitle} onChange={(e) => handlePrivacyFieldChange("aggregatorTitle", e.target.value)} className="bg-[var(--surface)] text-white text-xs" />
                        </label>
                        <label className="grid gap-1 text-xs text-[var(--muted)]">
                          <span className="font-semibold text-white">Model Footnote Summary</span>
                          <Input value={privacyData.aggregatorNote} onChange={(e) => handlePrivacyFieldChange("aggregatorNote", e.target.value)} className="bg-[var(--surface)] text-white text-xs" />
                        </label>
                        <div className="space-y-3 pt-3 border-t border-white/5">
                          {privacyData.aggregatorItems.map((item, idx) => (
                            <div key={idx} className="bg-[var(--surface)] p-3 rounded-lg border border-[var(--border)] space-y-2">
                              <Input value={item.title} onChange={(e) => handlePrivacyArrayChange("aggregatorItems", idx, "title", e.target.value)} className="bg-[var(--surface-soft)] text-white text-[11px] h-8" />
                              <textarea value={item.desc} onChange={(e) => handlePrivacyArrayChange("aggregatorItems", idx, "desc", e.target.value)} rows={2} className="w-full bg-[var(--surface-soft)] border border-[var(--border)] rounded p-1 text-white text-[10px]" />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Couponchy */}
                      <div className="bg-[var(--surface-soft)] p-5 rounded-2xl border border-[var(--border)] space-y-4">
                        <h4 className="text-xs font-bold text-[var(--color-primary)] uppercase">Couponchy Side Settings</h4>
                        <label className="grid gap-1 text-xs text-[var(--muted)]">
                          <span className="font-semibold text-white">Model Kicker Title</span>
                          <Input value={privacyData.couponchyTitle} onChange={(e) => handlePrivacyFieldChange("couponchyTitle", e.target.value)} className="bg-[var(--surface)] text-white text-xs" />
                        </label>
                        <label className="grid gap-1 text-xs text-[var(--muted)]">
                          <span className="font-semibold text-white">Model Footnote Summary</span>
                          <Input value={privacyData.couponchyNote} onChange={(e) => handlePrivacyFieldChange("couponchyNote", e.target.value)} className="bg-[var(--surface)] text-white text-xs" />
                        </label>
                        <div className="space-y-3 pt-3 border-t border-white/5">
                          {privacyData.couponchyItems.map((item, idx) => (
                            <div key={idx} className="bg-[var(--surface)] p-3 rounded-lg border border-[var(--border)] space-y-2">
                              <Input value={item.title} onChange={(e) => handlePrivacyArrayChange("couponchyItems", idx, "title", e.target.value)} className="bg-[var(--surface-soft)] text-white text-[11px] h-8" />
                              <textarea value={item.desc} onChange={(e) => handlePrivacyArrayChange("couponchyItems", idx, "desc", e.target.value)} rows={2} className="w-full bg-[var(--surface-soft)] border border-[var(--border)] rounded p-1 text-white text-[10px]" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {privacySubTab === "commitments" && (
                  <div className="space-y-6">
                    <h3 className="text-sm font-extrabold text-white">Commitments &amp; Aggregate Metrics</h3>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="grid gap-1.5 text-xs text-[var(--muted)]">
                        <span className="font-semibold text-white">Commitments Title</span>
                        <Input value={privacyData.commitmentsTitle} onChange={(e) => handlePrivacyFieldChange("commitmentsTitle", e.target.value)} className="bg-[var(--surface-soft)] text-white" />
                      </label>
                      <label className="grid gap-1.5 text-xs text-[var(--muted)]">
                        <span className="font-semibold text-white">Anonymized Metrics Title</span>
                        <Input value={privacyData.metricsTitle} onChange={(e) => handlePrivacyFieldChange("metricsTitle", e.target.value)} className="bg-[var(--surface-soft)] text-white" />
                      </label>
                    </div>

                    <label className="grid gap-1.5 text-xs text-[var(--muted)]">
                      <span className="font-semibold text-white">Metrics Subtitle Description</span>
                      <textarea value={privacyData.metricsSubtitle} onChange={(e) => handlePrivacyFieldChange("metricsSubtitle", e.target.value)} rows={3} className="w-full bg-[var(--surface-soft)] border border-[var(--border)] rounded-xl p-3 text-white text-xs" />
                    </label>

                    <div className="grid gap-4 sm:grid-cols-2 mt-4 border-t border-[var(--border)] pt-4">
                      {/* Commitments */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-white uppercase">Six Commitments List</h4>
                        <div className="grid gap-3">
                          {privacyData.commitments.map((item, idx) => (
                            <div key={idx} className="bg-[var(--surface-soft)] p-4 rounded-xl border border-[var(--border)] space-y-2">
                              <Input value={item.title} onChange={(e) => handlePrivacyArrayChange("commitments", idx, "title", e.target.value)} className="bg-[var(--surface)] text-white text-xs" />
                              <textarea value={item.desc} onChange={(e) => handlePrivacyArrayChange("commitments", idx, "desc", e.target.value)} rows={2} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded p-1.5 text-white text-[10px] resize-none" />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-white uppercase">Anonymized Log Metrics</h4>
                        <div className="grid gap-3">
                          {privacyData.metricsItems.map((item, idx) => (
                            <div key={idx} className="bg-[var(--surface-soft)] p-4 rounded-xl border border-[var(--border)] space-y-2">
                              <Input value={item.label} onChange={(e) => handlePrivacyArrayChange("metricsItems", idx, "label", e.target.value)} className="bg-[var(--surface)] text-white text-xs" />
                              <textarea value={item.desc} onChange={(e) => handlePrivacyArrayChange("metricsItems", idx, "desc", e.target.value)} rows={2} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded p-1.5 text-white text-[10px] resize-none" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {privacySubTab === "clauses" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-extrabold text-white">Collapsible Legal Clauses FAQ</h3>
                      <label className="grid gap-1 text-xs text-[var(--muted)] flex-1 max-w-sm">
                        <span className="font-semibold text-white">Legal Accordion Title</span>
                        <Input value={privacyData.legalTitle} onChange={(e) => handlePrivacyFieldChange("legalTitle", e.target.value)} className="bg-[var(--surface-soft)] text-white" />
                      </label>
                    </div>
                    <label className="grid gap-1.5 text-xs text-[var(--muted)]">
                      <span className="font-semibold text-white">Legal Accordion Subtitle Description</span>
                      <textarea value={privacyData.legalSubtitle} onChange={(e) => handlePrivacyFieldChange("legalSubtitle", e.target.value)} rows={2} className="w-full bg-[var(--surface-soft)] border border-[var(--border)] rounded-xl p-3 text-white text-xs" />
                    </label>

                    <div className="space-y-4 border-t border-[var(--border)] pt-4">
                      {privacyData.legalClauses.map((clause, idx) => (
                        <div key={idx} className="bg-[var(--surface-soft)] p-4 rounded-xl border border-[var(--border)] space-y-2">
                          <label className="grid gap-0.5 text-[10px] text-[var(--muted)]">
                            <span className="font-semibold text-white">Clause Title Header</span>
                            <Input value={clause.title} onChange={(e) => handlePrivacyArrayChange("legalClauses", idx, "title", e.target.value)} className="bg-[var(--surface)] text-white text-xs h-8" />
                          </label>
                          <label className="grid gap-0.5 text-[10px] text-[var(--muted)]">
                            <span className="font-semibold text-white">Clause Paragraph Details</span>
                            <textarea value={clause.content} onChange={(e) => handlePrivacyArrayChange("legalClauses", idx, "content", e.target.value)} rows={4} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded p-2 text-white text-xs resize-y" />
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Custom Terms Page Settings Form */}
            {isTerms && editorTab === "write" && (
              <div className="space-y-6 border-t border-[var(--border)] pt-6">
                <div className="flex flex-wrap gap-2 border-b border-[var(--border)] pb-3">
                  {[
                    { id: "hero", label: "Hero & Disclaimer" },
                    { id: "highlights", label: "Core Highlights" },
                    { id: "clauses", label: "Terms Accordion Clauses" }
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setTermsSubTab(sub.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        termsSubTab === sub.id 
                          ? "bg-[var(--color-primary)] text-black font-extrabold" 
                          : "bg-[var(--surface-soft)] text-[var(--muted)] hover:text-white border border-[var(--border)]"
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>

                {termsSubTab === "hero" && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-extrabold text-white">Hero Header &amp; General Disclaimer</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="grid gap-1.5 text-xs text-[var(--muted)]">
                        <span className="font-semibold text-white">Hero Title Heading</span>
                        <Input value={termsData.heroTitle} onChange={(e) => handleTermsFieldChange("heroTitle", e.target.value)} className="bg-[var(--surface-soft)] text-white" />
                      </label>
                      <label className="grid gap-1.5 text-xs text-[var(--muted)]">
                        <span className="font-semibold text-white">Disclaimer Title</span>
                        <Input value={termsData.disclaimerTitle} onChange={(e) => handleTermsFieldChange("disclaimerTitle", e.target.value)} className="bg-[var(--surface-soft)] text-white" />
                      </label>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="grid gap-1.5 text-xs text-[var(--muted)]">
                        <span className="font-semibold text-white">Hero Subtitle Paragraph</span>
                        <textarea value={termsData.heroSubtitle} onChange={(e) => handleTermsFieldChange("heroSubtitle", e.target.value)} rows={3} className="w-full bg-[var(--surface-soft)] border border-[var(--border)] rounded-xl p-3 text-white text-xs resize-y" />
                      </label>
                      <label className="grid gap-1.5 text-xs text-[var(--muted)]">
                        <span className="font-semibold text-white">Disclaimer Warning Content</span>
                        <textarea value={termsData.disclaimerText} onChange={(e) => handleTermsFieldChange("disclaimerText", e.target.value)} rows={3} className="w-full bg-[var(--surface-soft)] border border-[var(--border)] rounded-xl p-3 text-white text-xs resize-y" />
                      </label>
                    </div>
                  </div>
                )}

                {termsSubTab === "highlights" && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-extrabold text-white">Core Highlights Cards</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {termsData.highlights.map((item, idx) => (
                        <div key={idx} className="bg-[var(--surface-soft)] p-4 rounded-xl border border-[var(--border)] space-y-2">
                          <span className="text-[10px] text-[var(--color-primary)] font-bold">Highlight Card {idx + 1}</span>
                          <label className="grid gap-0.5 text-[10px] text-[var(--muted)]">
                            <span className="font-semibold text-white">Card Title</span>
                            <Input value={item.title} onChange={(e) => handleTermsArrayChange("highlights", idx, "title", e.target.value)} className="bg-[var(--surface)] text-white text-[11px] h-8" />
                          </label>
                          <label className="grid gap-0.5 text-[10px] text-[var(--muted)]">
                            <span className="font-semibold text-white">Description</span>
                            <textarea value={item.desc} onChange={(e) => handleTermsArrayChange("highlights", idx, "desc", e.target.value)} rows={3} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded p-1 text-white text-[10px] resize-none" />
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {termsSubTab === "clauses" && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-extrabold text-white">Terms Accordion Clauses</h3>
                    <div className="space-y-4">
                      {termsData.clauses.map((clause, idx) => (
                        <div key={idx} className="bg-[var(--surface-soft)] p-4 rounded-xl border border-[var(--border)] space-y-2">
                          <label className="grid gap-0.5 text-[10px] text-[var(--muted)]">
                            <span className="font-semibold text-white">Clause Title Header</span>
                            <Input value={clause.title} onChange={(e) => handleTermsArrayChange("clauses", idx, "title", e.target.value)} className="bg-[var(--surface)] text-white text-xs h-8" />
                          </label>
                          <label className="grid gap-0.5 text-[10px] text-[var(--muted)]">
                            <span className="font-semibold text-white">Clause Paragraph Details</span>
                            <textarea value={clause.content} onChange={(e) => handleTermsArrayChange("clauses", idx, "content", e.target.value)} rows={4} className="w-full bg-[var(--surface)] border border-[var(--border)] rounded p-2 text-white text-xs resize-y" />
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Custom Sitemap Page Settings Form */}
            {isSitemap && editorTab === "write" && (
              <div className="space-y-6 border-t border-[var(--border)] pt-6">
                <h3 className="text-sm font-extrabold text-white">Sitemap Heading &amp; Sections</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-1.5 text-xs text-[var(--muted)]">
                    <span className="font-semibold text-white">Hero Title Heading</span>
                    <Input value={sitemapData.heroTitle} onChange={(e) => handleSitemapFieldChange("heroTitle", e.target.value)} className="bg-[var(--surface-soft)] text-white" />
                  </label>
                  <label className="grid gap-1.5 text-xs text-[var(--muted)]">
                    <span className="font-semibold text-white">Essential Pages Kicker</span>
                    <Input value={sitemapData.generalTitle} onChange={(e) => handleSitemapFieldChange("generalTitle", e.target.value)} className="bg-[var(--surface-soft)] text-white" />
                  </label>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-1.5 text-xs text-[var(--muted)]">
                    <span className="font-semibold text-white">Hero Subtitle Paragraph</span>
                    <textarea value={sitemapData.heroSubtitle} onChange={(e) => handleSitemapFieldChange("heroSubtitle", e.target.value)} rows={3} className="w-full bg-[var(--surface-soft)] border border-[var(--border)] rounded-xl p-3 text-white text-xs resize-y" />
                  </label>
                  <div className="space-y-4">
                    <label className="grid gap-1.5 text-xs text-[var(--muted)]">
                      <span className="font-semibold text-white">Categories Section Title</span>
                      <Input value={sitemapData.categoriesTitle} onChange={(e) => handleSitemapFieldChange("categoriesTitle", e.target.value)} className="bg-[var(--surface-soft)] text-white" />
                    </label>
                    <label className="grid gap-1.5 text-xs text-[var(--muted)]">
                      <span className="font-semibold text-white">Brand Directory Section Title</span>
                      <Input value={sitemapData.storesTitle} onChange={(e) => handleSitemapFieldChange("storesTitle", e.target.value)} className="bg-[var(--surface-soft)] text-white" />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Standard HTML pages settings form */}
            {!isAbout && !isContact && !isPrivacy && !isTerms && !isSitemap && editorTab === "write" && (
              <div className="space-y-2 border-t border-[var(--border)] pt-6">
                <span className="font-semibold text-white text-xs">Page Content (HTML layout support)</span>
                
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] p-0.5">
                      <button type="button" onClick={() => insertHTMLTag("<p class=\"lead\">", "</p>")} className="rounded px-2.5 py-1.5 text-xs font-bold text-[var(--color-primary)] hover:bg-[var(--surface-soft)] transition cursor-pointer">Lead</button>
                      <button type="button" onClick={() => insertHTMLTag("<p>", "</p>")} className="rounded px-2.5 py-1.5 text-xs font-bold text-white hover:bg-[var(--surface-soft)] transition cursor-pointer">P</button>
                      <button type="button" onClick={() => insertHTMLTag("<h2>", "</h2>")} className="rounded px-2.5 py-1.5 text-xs font-bold text-white hover:bg-[var(--surface-soft)] transition cursor-pointer">H2</button>
                      <button type="button" onClick={() => insertHTMLTag("<h3>", "</h3>")} className="rounded px-2.5 py-1.5 text-xs font-bold text-white hover:bg-[var(--surface-soft)] transition cursor-pointer">H3</button>
                    </div>
                    <div className="flex items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] p-0.5">
                      <button type="button" onClick={() => insertHTMLTag("<strong>", "</strong>")} className="rounded px-2.5 py-1.5 text-xs font-bold text-white hover:bg-[var(--surface-soft)] transition cursor-pointer">B</button>
                      <button type="button" onClick={() => insertHTMLTag("<em>", "</em>")} className="rounded px-2.5 py-1.5 text-xs italic font-bold text-white hover:bg-[var(--surface-soft)] transition cursor-pointer">I</button>
                    </div>
                    <div className="flex items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] p-0.5">
                      <button type="button" onClick={() => insertHTMLTag("<blockquote>\n  \"", "\"\n</blockquote>")} className="rounded px-2.5 py-1.5 text-xs font-bold text-white hover:bg-[var(--surface-soft)] transition cursor-pointer">Quote</button>
                      <button type="button" onClick={() => insertHTMLTag("<div class=\"my-8 rounded-2xl border border-white/8 bg-white/[0.02] p-6\">\n  <h4 class=\"text-white font-extrabold mb-3\">Title</h4>\n  <ol class=\"space-y-2 text-white/70 pl-5 list-decimal\">\n    <li>Item 1</li>\n  </ol>\n</div>")} className="rounded px-2.5 py-1.5 text-xs font-bold text-white hover:bg-[var(--surface-soft)] transition cursor-pointer">Box</button>
                      <button type="button" onClick={() => insertHTMLTag("<div class=\"my-8 rounded-2xl border border-white/8 bg-[#070707] p-6 font-mono text-[13px] leading-relaxed text-white/80 overflow-x-auto\">\n  ", "\n</div>")} className="rounded px-2.5 py-1.5 text-xs font-bold text-cyan-400 hover:bg-[var(--surface-soft)] transition cursor-pointer">Code</button>
                      <button type="button" onClick={() => insertHTMLTag("<ul>\n  <li>", "</li>\n</ul>")} className="rounded px-2.5 py-1.5 text-xs font-bold text-white hover:bg-[var(--surface-soft)] transition cursor-pointer">List</button>
                    </div>
                  </div>
                </div>

                <textarea
                  ref={textareaRef}
                  value={activePage.content}
                  onChange={(e) => handleFieldChange("content", e.target.value)}
                  rows={16}
                  className={`w-full resize-y rounded-xl border px-4 py-3 font-mono text-xs text-white outline-none transition-all ${
                    editorDragActive
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                      : "border-[var(--border)] bg-[var(--surface-soft)] focus:border-[var(--color-primary)]"
                  }`}
                  placeholder="Write page content in HTML..."
                  onPaste={handleEditorPaste}
                  onDragOver={handleEditorDragOver}
                  onDragLeave={handleEditorDragLeave}
                  onDrop={handleEditorDrop}
                />
              </div>
            )}

            {/* Live Preview tab panel */}
            {editorTab === "preview" && (
              <div className="min-h-[300px] max-h-[600px] overflow-y-auto rounded-xl border border-[var(--border)] bg-black p-6 md:p-8">
                {isAbout && (
                  <div className="space-y-12 text-left">
                    <div>
                      <p className="text-[10px] font-black uppercase text-[var(--color-primary)] tracking-widest">{aboutData.heroKicker}</p>
                      <h1 className="mt-2 text-2xl font-black text-white leading-tight uppercase">{aboutData.heroTitle}</h1>
                      <p className="mt-3 text-xs leading-relaxed text-white/50">{aboutData.heroSubtitle}</p>
                    </div>
                    <div className="border-t border-white/5 pt-6 grid gap-6 sm:grid-cols-2">
                      <div>
                        <p className="text-[10px] font-black uppercase text-[var(--color-primary)] tracking-widest">{aboutData.problemKicker}</p>
                        <h2 className="mt-1 text-lg font-black text-white uppercase">{aboutData.problemTitle}</h2>
                        <p className="mt-3 text-xs leading-relaxed text-white/40">{aboutData.problemDesc1}</p>
                        <p className="mt-2 text-xs leading-relaxed text-white/40">{aboutData.problemDesc2}</p>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-3">Timeline Milestones</h4>
                        <div className="border-l border-white/5 pl-4 space-y-4">
                          {aboutData.milestones.map((item, idx) => (
                            <div key={idx} className="text-xs">
                              <span className="font-bold text-[var(--color-primary)] text-[10px] block">{item.year}</span>
                              <span className="font-bold text-white/80 block">{item.title}</span>
                              <span className="text-[10px] text-white/40">{item.desc}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {isContact && (
                  <div className="space-y-12 text-left">
                    <div className="text-center max-w-md mx-auto">
                      <h1 className="text-2xl font-black text-white uppercase tracking-tight">{contactData.heroTitle}</h1>
                      <p className="mt-2 text-xs text-white/50">{contactData.heroSubtitle}</p>
                      <div className="mt-4 border border-white/10 bg-white/[0.01] rounded-xl py-2 px-3 text-xs text-white/30 font-mono text-left">
                        {contactData.searchPlaceholder}
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-6 space-y-6">
                      {(contactData.faqGroups || []).map((group, groupIdx) => (
                        <div key={groupIdx} className="space-y-2.5">
                          <h3 className="text-xs font-black uppercase text-white/60 tracking-wider flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
                            {group.title}
                          </h3>
                          <div className="space-y-2">
                            {group.items?.map((item, itemIdx) => (
                              <div key={itemIdx} className="bg-[#090909] border border-white/5 p-4 rounded-xl">
                                <h4 className="text-xs font-bold text-white/80">{item.q}</h4>
                                <p className="mt-2 text-[11px] leading-relaxed text-white/40">{item.a}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-white/5 pt-6 flex flex-wrap gap-3 justify-center">
                      <div className="border border-white/10 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase text-white bg-white/[0.02]">
                        {contactData.feedbackLabel}
                      </div>
                      <div className="border border-white/10 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase text-white bg-white/[0.02]">
                        {contactData.issueLabel}
                      </div>
                    </div>
                  </div>
                )}

                {isPrivacy && (
                  <div className="space-y-12 text-left">
                    <div className="max-w-md">
                      <h1 className="text-2xl font-black text-white uppercase tracking-tight">{privacyData.heroTitle}</h1>
                      <p className="mt-2 text-xs text-white/50">{privacyData.heroSubtitle}</p>
                    </div>

                    <div className="border-t border-white/5 pt-6 grid gap-6 sm:grid-cols-2">
                      <div className="bg-[#0b0b0b] p-4 rounded-xl border border-red-500/10">
                        <span className="text-[10px] font-bold text-red-400 block mb-2">{privacyData.aggregatorTitle}</span>
                        <ul className="space-y-2 text-[11px] text-white/40">
                          {privacyData.aggregatorItems.map((item, idx) => (
                            <li key={idx}>✕ <strong className="text-white/80">{item.title}</strong>: {item.desc}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-[#0b0b0b] p-4 rounded-xl border border-[var(--color-border)]">
                        <span className="text-[10px] font-bold text-[var(--color-primary)] block mb-2">{privacyData.couponchyTitle}</span>
                        <ul className="space-y-2 text-[11px] text-white/40">
                          {privacyData.couponchyItems.map((item, idx) => (
                            <li key={idx}>✓ <strong className="text-white/80">{item.title}</strong>: {item.desc}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-6">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">{privacyData.commitmentsTitle}</h3>
                      <div className="grid gap-3 sm:grid-cols-3">
                        {privacyData.commitments.map((item, idx) => (
                          <div key={idx} className="bg-[#0a0a0a] border border-white/5 p-3 rounded-lg text-[11px]">
                            <strong className="text-white">{item.title}</strong>
                            <p className="mt-1 text-white/40 text-[10px]">{item.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {isTerms && (
                  <div className="space-y-12 text-left">
                    <div>
                      <p className="text-[10px] font-black uppercase text-[var(--color-primary)] tracking-widest">— TERMS OF SERVICE</p>
                      <h1 className="mt-2 text-2xl font-black text-white leading-tight uppercase">{termsData.heroTitle}</h1>
                      <p className="mt-3 text-xs leading-relaxed text-white/50">{termsData.heroSubtitle}</p>
                    </div>

                    <div className="border-t border-white/5 pt-6">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Core Guidelines</h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {termsData.highlights.map((item, idx) => (
                          <div key={idx} className="bg-[#0a0a0a] border border-white/5 p-3 rounded-lg text-[11px]">
                            <strong className="text-white">{item.title}</strong>
                            <p className="mt-1 text-white/40 text-[10px]">{item.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-[#0c0505]/40 border border-red-500/10 p-4 rounded-xl">
                      <strong className="text-xs text-red-400 block mb-1">{termsData.disclaimerTitle}</strong>
                      <p className="text-[10px] text-white/50 leading-relaxed">{termsData.disclaimerText}</p>
                    </div>
                  </div>
                )}

                {isSitemap && (
                  <div className="space-y-12 text-left">
                    <div>
                      <p className="text-[10px] font-black uppercase text-[var(--color-primary)] tracking-widest">— SITEMAP DIRECTORY</p>
                      <h1 className="mt-2 text-2xl font-black text-white leading-tight uppercase">{sitemapData.heroTitle}</h1>
                      <p className="mt-3 text-xs leading-relaxed text-white/50">{sitemapData.heroSubtitle}</p>
                    </div>

                    <div className="border-t border-white/5 pt-6 grid gap-6 sm:grid-cols-2">
                      <div className="bg-[#0a0a0a] border border-white/5 p-4 rounded-xl">
                        <strong className="text-xs text-white block mb-2">{sitemapData.generalTitle}</strong>
                        <ul className="space-y-1.5 text-[10px] text-white/40">
                          <li>• Home Page</li>
                          <li>• About Us</li>
                          <li>• Contact Us</li>
                          <li>• Privacy Policy</li>
                          <li>• Terms Of Service</li>
                        </ul>
                      </div>
                      <div className="bg-[#0a0a0a] border border-white/5 p-4 rounded-xl">
                        <strong className="text-xs text-white block mb-2">{sitemapData.categoriesTitle}</strong>
                        <ul className="space-y-1.5 text-[10px] text-[var(--color-primary)]">
                          <li>• Fashion Deals</li>
                          <li>• Electronics Coupons</li>
                          <li>• Travel Discounts</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {!isAbout && !isContact && !isPrivacy && !isTerms && !isSitemap && activePage.content && (
                  <article
                    className="prose prose-invert prose-custom max-w-none text-white/80 leading-[1.8] text-[0.98rem] space-y-5
                      prose-headings:text-white prose-headings:font-black prose-headings:tracking-tight prose-headings:mt-6 prose-headings:mb-3
                      prose-h2:text-[22px] prose-h2:border-b prose-h2:border-white/5 prose-h2:pb-2
                      prose-strong:text-white prose-strong:font-black
                      prose-a:text-[var(--color-primary)] prose-a:underline
                      prose-li:text-white/75"
                    dangerouslySetInnerHTML={{ __html: activePage.content }}
                  />
                )}
                {!isAbout && !isContact && !isPrivacy && !isTerms && !isSitemap && !activePage.content && (
                  <p className="text-sm italic text-[var(--muted)] text-center mt-12">Nothing to preview. Enter some HTML content first.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Controls */}
        <div className="flex justify-end gap-3 rounded-2xl border border-[var(--border)] p-4 bg-[var(--surface-soft)]">
          <Button
            type="submit"
            disabled={isSaving}
            className="rounded-lg bg-[var(--color-primary)] text-black hover:bg-[var(--color-primary-hover)] font-bold px-6 cursor-pointer"
          >
            {isSaving ? (
              <div className="flex items-center gap-2">
                <Spinner />
                <span>Saving Configuration...</span>
              </div>
            ) : (
              "Save Page Settings"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

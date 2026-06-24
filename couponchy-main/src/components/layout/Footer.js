import Link from "next/link";
import Logo from "@/components/shared/Logo";
import { Button } from "@/components/ui/Button";
import { getPublicSiteSettings } from "@/server/services/settings-service";
import { getAllCategories } from "@/server/repositories/categories-repository";
import { getAllStores } from "@/server/repositories/stores-repository";

/* ─────────────────────────── SVG Icons ─────────────────────────── */
function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.01 3.752.054 2.668.12 3.883 1.347 4.003 4.003.044.968.054 1.32.054 3.752 0 2.43-.01 2.784-.054 3.752-.12 2.668-1.347 3.883-4.003 4.003-.968.044-1.32.054-3.752.054-2.43 0-2.784-.01-3.752-.054-2.668-.12-3.883-1.347-4.003-4.003-.044-.968-.054-1.32-.054-3.752 0-2.43.01-2.784.054-3.752.12-2.668 1.347-3.883 4.003-4.003.968-.044 1.32-.054 3.752-.054L12.315 2zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" clipRule="evenodd" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.99-1.72-.04-.03-.07-.06-.11-.09-.03 2.12-.04 4.24-.05 6.36a9.02 9.02 0 01-1.51 4.97 8.96 8.96 0 01-8.15 3.96c-2.61-.17-5.07-1.42-6.52-3.62A8.99 8.99 0 014 9.47c1.07-2.45 3.17-4.32 5.73-4.88a9.06 9.06 0 014.29.3v4.11a5.06 5.06 0 00-2.52.88c-1.39.99-2.07 2.76-1.71 4.45.33 1.55 1.57 2.78 3.12 3.11 1.7.35 3.49-.33 4.46-1.72.39-.55.59-1.22.59-1.9-.01-2.91 0-5.82 0-8.73.91-.07 1.83-.02 2.75-.02z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" d="M23.498 6.163a3.003 3.003 0 00-2.11-2.108C19.524 3.545 12 3.545 12 3.545s-7.525 0-9.388.51a3.003 3.003 0 00-2.11 2.108C0 8.029 0 12 0 12s0 3.972.502 5.837a3.003 3.003 0 002.11 2.108c1.863.51 9.388.51 9.388.51s7.525 0 9.388-.51a3.003 3.003 0 002.11-2.108c.502-1.865.502-5.837.502-5.837s0-3.971-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" clipRule="evenodd" />
    </svg>
  );
}

function CheckShieldIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

/* ─────────────────────────── Helpers ─────────────────────────── */
function toTitleCase(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function SectionHeading({ children }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <span
        className="inline-block h-px flex-1 max-w-[28px]"
        style={{ background: "linear-gradient(90deg, var(--accent), transparent)" }}
      />
      <h4
        className="text-[11px] font-black uppercase tracking-[0.18em]"
        style={{ color: "var(--accent)" }}
      >
        {children}
      </h4>
    </div>
  );
}

/* ─────────────────────────── Data ─────────────────────────── */
const verifySteps = [
  {
    icon: "🔍",
    title: "Automatic Discovery",
    desc: "Scan 10+ community and aggregator networks daily.",
  },
  {
    icon: "✅",
    title: "Official Presence",
    desc: "Confirm validity directly against merchant promo pages.",
  },
  {
    icon: "🤖",
    title: "Simulated Checkout",
    desc: "Deploy headless Playwright agents to verify discount application.",
  },
  {
    icon: "🏅",
    title: "Badge Approval",
    desc: "Publish and prioritize coupons that pass checkout validation.",
  },
];

const companyLinks = [
  { name: "About Us", href: "/about" },
  { name: "Contact Us", href: "/contact" },
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Terms Of Service", href: "/terms" },
  { name: "Sitemap", href: "/sitemap" },
];

/* ─────────────────────────── Footer ─────────────────────────── */
export default async function Footer() {
  const settings = await getPublicSiteSettings();

  let allStores = [];
  let allCategories = [];
  try {
    allStores = await getAllStores();
  } catch (err) {
    console.error("Failed to fetch stores for footer:", err);
  }
  try {
    allCategories = await getAllCategories();
  } catch (err) {
    console.error("Failed to fetch categories for footer:", err);
  }

  const getSocialHref = (platform, configUrl) => {
    if (configUrl && configUrl.trim()) return configUrl;
    return `https://${platform.toLowerCase()}.com`;
  };

  const socialLinks = [
    { label: "Facebook", href: getSocialHref("Facebook", settings.social.facebook), icon: <FacebookIcon />, color: "#1877F2" },
    { label: "Instagram", href: getSocialHref("Instagram", settings.social.instagram), icon: <InstagramIcon />, color: "#E1306C" },
    { label: "X (Twitter)", href: getSocialHref("X", settings.social.x), icon: <XIcon />, color: "#FFFFFF" },
    { label: "TikTok", href: getSocialHref("TikTok", settings.social.tiktok), icon: <TikTokIcon />, color: "#69C9D0" },
    { label: "YouTube", href: getSocialHref("YouTube", settings.social.youtube), icon: <YouTubeIcon />, color: "#FF0000" },
  ];

  const validStores = allStores.filter((s) => s && s.name && s.slug);
  const validCategories = allCategories.filter((c) => c && c.name && c.slug);

  const categoriesList =
    validCategories.length > 0
      ? validCategories
          .slice(0, 8)
          .map((c) => ({ name: toTitleCase(c.name), href: `/stores?search=${encodeURIComponent(c.name)}` }))
      : [
          { name: "Fashion", href: "/stores?search=Fashion" },
          { name: "Food & Dining", href: "/stores?search=Food" },
          { name: "Footwear", href: "/stores?search=Footwear" },
          { name: "Travel & Hotels", href: "/stores?search=Travel" },
          { name: "Beauty & Wellness", href: "/stores?search=Beauty" },
          { name: "Furniture & Home", href: "/stores?search=Furniture" },
          { name: "Electronics", href: "/stores?search=Electronics" },
          { name: "Sports & Outdoor", href: "/stores?search=Sports" },
        ];

  const storesList =
    validStores.length > 0
      ? [...validStores]
          .sort((a, b) => (b.offersCount || 0) - (a.offersCount || 0))
          .slice(0, 8)
          .map((s) => ({
            name: toTitleCase(s.name),
            href: `/stores/${s.categorySlug || "all"}/${s.slug}`,
          }))
      : [
          { name: "Nike", href: "/stores" },
          { name: "Adidas", href: "/stores" },
          { name: "Amazon", href: "/stores" },
          { name: "Zalando", href: "/stores" },
          { name: "Asos", href: "/stores" },
          { name: "Ecoflow", href: "/stores" },
          { name: "Vitality Health", href: "/stores" },
          { name: "Gousto Uk", href: "/stores" },
        ];

  return (
    <footer
      className="relative mt-32 overflow-hidden pb-0"
      style={{ backgroundImage: "linear-gradient(180deg, #070707 0%, #020202 100%)" }}
    >
      {/* Top glow bar */}
      <div
        className="absolute top-0 inset-x-0 h-px"
        style={{ backgroundImage: "linear-gradient(90deg, transparent, var(--accent), transparent)" }}
      />
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[900px] -translate-x-1/2 rounded-full blur-[140px]"
        style={{ backgroundImage: "radial-gradient(ellipse, rgba(163,230,53,0.07), transparent 70%)" }}
      />

      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">

        {/* ── Big Site Name Watermark ── */}
        <div className="relative mb-20 mt-16 flex flex-col items-center text-center">
          <h2
            className="select-none text-[13vw] font-black leading-none tracking-tighter"
            style={{ color: "rgba(255,255,255,0.03)" }}
          >
            {toTitleCase(settings.siteName)}
          </h2>
          <div className="mt-6 flex flex-col items-center gap-5 z-10">
            {/* Social Row */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              {socialLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="footer-social-link group flex items-center gap-2.5 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  style={{
                    borderColor: "rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.03)",
                    color: "rgba(255,255,255,0.55)",
                  }}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Divider ── */}
        <div
          className="mb-20 h-px w-full"
          style={{ backgroundImage: "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)" }}
        />

        {/* ── Main Grid ── */}
        <div className="grid gap-14 pb-20 lg:grid-cols-[1.4fr_1fr_1fr] xl:grid-cols-[1.6fr_1.1fr_1.1fr_1.4fr]">

          {/* Col 1 – How We Verify */}
          <div>
            <SectionHeading>How We Verify</SectionHeading>
            <div className="flex flex-col gap-5">
              {verifySteps.map((step, idx) => (
                <div
                  key={idx}
                  className="footer-verify-card group flex items-start gap-4 rounded-2xl border p-4 transition-all duration-300 border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)]"
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base bg-[rgba(163,230,53,0.1)] border border-[rgba(163,230,53,0.2)]"
                  >
                    {step.icon}
                  </div>
                  <div>
                    <p className="text-[13px] font-bold" style={{ color: "rgba(255,255,255,0.88)" }}>
                      {step.title}
                    </p>
                    <p className="mt-1 text-[12px] leading-snug" style={{ color: "rgba(255,255,255,0.38)" }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Col 2 – Top Stores */}
          <div>
            <SectionHeading>Top Stores</SectionHeading>
            <nav className="flex flex-col gap-1">
              {storesList.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200 hover:bg-white/[0.04]"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full transition-all duration-200 group-hover:scale-150 bg-[var(--accent)] opacity-60"
                  />
                  <span className="transition-colors duration-200 group-hover:text-white">
                    {link.name}
                  </span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Col 3 – Company */}
          <div>
            <SectionHeading>Company</SectionHeading>
            <nav className="flex flex-col gap-1">
              {companyLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200 hover:bg-white/[0.04]"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full transition-all duration-200 group-hover:scale-150 bg-[var(--accent)] opacity-60"
                  />
                  <span className="transition-colors duration-200 group-hover:text-white">
                    {link.name}
                  </span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Col 4 – Newsletter */}
          <div className="lg:col-span-3 xl:col-span-1">
            <SectionHeading>Stay In The Loop</SectionHeading>
            <div
              className="rounded-3xl border p-7 border-[rgba(163,230,53,0.12)]"
              style={{
                backgroundImage: "linear-gradient(135deg, rgba(163,230,53,0.05) 0%, rgba(0,0,0,0) 100%)",
              }}
            >
              <h3 className="text-xl font-black tracking-tight text-white">
                Join The{" "}
                <span style={{ color: "var(--accent)" }}>Elite</span>
              </h3>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
                Subscribe For Updates, Featured Drops, And Store Highlights. Never Miss A Deal.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Your Email Address"
                    className="h-13 w-full rounded-2xl border px-5 text-sm text-white outline-none transition-all placeholder:text-white/20"
                    className="h-13 w-full rounded-2xl border px-5 text-sm text-white outline-none transition-all placeholder:text-white/20 border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)]"
                  />
                </div>
                <Button
                  type="button"
                  className="group h-13 w-full gap-3 rounded-2xl text-[12px] font-black tracking-[0.08em] text-black transition-all hover:scale-105 active:scale-95 bg-[var(--accent)]"
                >
                  Subscribe Now
                  <ArrowIcon />
                </Button>
              </div>
              <p className="mt-4 text-center text-[11px]" style={{ color: "rgba(255,255,255,0.2)" }}>
                No Spam. Unsubscribe Anytime.
              </p>
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div
          className="flex flex-col items-center gap-4 border-t py-8 sm:flex-row sm:justify-between"
          style={{ borderColor: "rgba(255,255,255,0.05)" }}
        >
          <div className="flex items-center gap-3">
            <CheckShieldIcon />
            <p className="text-[12px] font-semibold" style={{ color: "rgba(255,255,255,0.3)" }}>
              All Coupons Verified By Our Automated System
            </p>
          </div>

          <p className="text-[12px] font-medium" style={{ color: "rgba(255,255,255,0.25)" }}>
            © {new Date().getFullYear()} {toTitleCase(settings.siteName)}. All Rights Reserved.
          </p>

          <p className="text-[12px] font-medium" style={{ color: "rgba(255,255,255,0.25)" }}>
            {settings.supportEmail
              ? settings.supportEmail.charAt(0).toUpperCase() + settings.supportEmail.slice(1)
              : ""}
          </p>
        </div>
      </div>

      {/* Accent bottom strip */}
      <div
        className="h-1 w-full"
        style={{
          backgroundImage: "linear-gradient(90deg, transparent 0%, var(--accent) 30%, rgba(163,230,53,0.4) 50%, var(--accent) 70%, transparent 100%)",
        }}
      />
    </footer>
  );
}

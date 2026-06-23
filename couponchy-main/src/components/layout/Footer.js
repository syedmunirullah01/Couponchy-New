import Link from "next/link";
import Logo from "@/components/shared/Logo";
import { Button } from "@/components/ui/Button";
import { getPublicSiteSettings } from "@/server/services/settings-service";

const topCategories = ["Fashion", "Food", "Footwear", "Travel", "Beauty", "Furniture", "Home & Garden", "E-Bike"];
const topStores = ["Waterdrop", "Dorothy Perkins", "Debenhams", "Gousto UK", "EcoFlow", "FlexShopper", "Vitality", "Beginning Boutique AU"];
const usefulLinks = ["Home", "Stores", "Categories", "Contact Us", "About Us", "Imprint", "Sitemap"];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export default async function Footer() {
  const settings = await getPublicSiteSettings();
  const socialLinks = [
    { label: "Facebook", href: settings.social.facebook },
    { label: "Instagram", href: settings.social.instagram },
    { label: "X", href: settings.social.x },
    { label: "TikTok", href: settings.social.tiktok },
    { label: "YouTube", href: settings.social.youtube },
  ].filter((item) => item.href);

  return (
    <footer className="relative mt-32 overflow-hidden bg-[#050505] pt-24 pb-12">
      <div className="absolute top-0 left-1/4 h-px w-1/2 bg-gradient-to-r from-transparent via-[var(--accent)]/20 to-transparent" />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[800px] -translate-x-1/2 rounded-full bg-[var(--accent)]/5 blur-[120px]" />

      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="mb-24 flex flex-col items-center text-center">
          <h2 className="text-[12vw] font-black uppercase leading-none tracking-tighter text-white/5 select-none">{settings.siteName}</h2>
          <div className="-mt-[6vw] flex flex-col items-center">
            <Logo className="mb-8 scale-150" />
            <p className="max-w-xl text-lg font-medium leading-relaxed text-white/50">{settings.tagline}</p>
          </div>
        </div>

        <div className="grid gap-16 border-b border-white/5 pb-20 lg:grid-cols-[1.45fr_0.95fr] lg:items-start">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30">Top Categories</h4>
              <nav className="flex flex-col gap-3">
                {topCategories.map((link) => (
                  <Link key={link} href="#" className="text-sm font-bold text-white/80 transition-colors hover:text-[var(--accent)]">
                    {link}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30">Top Stores</h4>
              <nav className="flex flex-col gap-3">
                {topStores.map((link) => (
                  <Link key={link} href="#" className="text-sm font-bold text-white/80 transition-colors hover:text-[var(--accent)]">
                    {link}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30">Useful Links</h4>
              <nav className="flex flex-col gap-3">
                {usefulLinks.map((link) => (
                  <Link key={link} href="#" className="text-sm font-bold text-white/80 transition-colors hover:text-[var(--accent)]">
                    {link}
                  </Link>
                ))}
              </nav>
            </div>

            {socialLinks.length ? (
              <div className="flex flex-col gap-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30">Social</h4>
                <nav className="flex flex-col gap-3">
                  {socialLinks.map((link) => (
                    <Link key={link.label} href={link.href} target="_blank" className="text-sm font-bold text-white/80 transition-colors hover:text-[var(--accent)]">
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col lg:items-end">
            <h3 className="text-2xl font-black uppercase tracking-tight text-white italic">
              Join the <span className="text-[var(--accent)] not-italic">Elite</span>
            </h3>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/40 lg:text-right">
              Subscribe for updates, featured drops, and store highlights.
            </p>
            <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:items-center">
              <div className="group relative flex-1">
                <input
                  type="email"
                  placeholder="name@couponchy.com"
                  className="h-14 w-full rounded-xl border border-white/10 bg-white/[0.03] px-5 text-sm text-white outline-none transition-all placeholder:text-white/20 focus:border-[var(--accent)]/50 focus:bg-white/[0.06]"
                />
                <div className="absolute inset-0 rounded-xl bg-[var(--accent)]/0 transition-all group-focus-within:bg-[var(--accent)]/[0.02]" />
              </div>
              <Button type="button" className="group h-14 gap-3 bg-[var(--accent)] px-8 text-[11px] font-black uppercase tracking-[0.2em] text-black transition-all hover:scale-105 active:scale-95">
                Join Now
                <ArrowIcon />
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/20 sm:flex-row sm:items-center sm:justify-between">
          <p>{`© 2026 ${settings.siteName}`}</p>
          <p>{settings.supportEmail}</p>
        </div>
      </div>
    </footer>
  );
}

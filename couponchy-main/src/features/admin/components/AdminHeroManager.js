"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

const initialHeroState = {
  eyebrow: "Exclusive Daily Deals",
  titleLineOne: "Smart Shopping,",
  titleAccent: "Better Saving",
  description: "Unlock verified discounts from the world's leading brands. The smarter way to checkout.",
  searchPlaceholder: "Search stores, coupons, deals",
  searchButtonLabel: "Search Offers",
  memberCountText: "Join 126k+ members saving daily",
  slides: [],
};

function SectionField({ label, children, hint }) {
  return (
    <label className="grid gap-2 text-sm text-[var(--muted)]">
      <span className="font-medium text-[var(--text)]">{label}</span>
      {children}
      {hint ? <span className="text-xs text-[var(--muted)]">{hint}</span> : null}
    </label>
  );
}

function SettingsSection({ title, description, children }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)]/35 p-4 sm:p-5">
      <div className="mb-4">
        <p className="text-sm font-semibold text-[var(--text)]">{title}</p>
        {description ? <p className="mt-1 text-xs text-[var(--muted)]">{description}</p> : null}
      </div>
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 animate-spin" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" className="stroke-current opacity-25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" className="stroke-current" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function AdminHeroManager() {
  const [hero, setHero] = useState(initialHeroState);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadHero() {
      try {
        const response = await fetch("/api/homepage/hero", { cache: "no-store" });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Unable to load hero settings.");
        }

        if (active) {
          setHero(payload.data);
        }
      } catch (error) {
        toast.error(error.message);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadHero();

    return () => {
      active = false;
    };
  }, []);

  function updateHeroField(field, value) {
    setHero((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateHeroSlide(index, field, value) {
    setHero((current) => ({
      ...current,
      slides: current.slides.map((slide, slideIndex) => (slideIndex === index ? { ...slide, [field]: value } : slide)),
    }));
  }

  function addHeroSlide() {
    setHero((current) => ({
      ...current,
      slides: [
        ...current.slides,
        {
          id: `hero-slide-${Date.now()}`,
          image: "",
          badge: "New Slide",
          kicker: "Live Now",
          title: "New hero campaign",
          description: "Add a supporting description for this homepage slide.",
          discount: "-20%",
          accent: "linear-gradient(140deg, rgba(163,230,53,0.22), transparent 48%)",
        },
      ],
    }));
  }

  function removeHeroSlide(index) {
    setHero((current) => ({
      ...current,
      slides: current.slides.filter((_, slideIndex) => slideIndex !== index),
    }));
  }

  function moveHeroSlide(index, direction) {
    setHero((current) => {
      const nextIndex = index + direction;

      if (nextIndex < 0 || nextIndex >= current.slides.length) {
        return current;
      }

      const nextSlides = [...current.slides];
      const [movedSlide] = nextSlides.splice(index, 1);
      nextSlides.splice(nextIndex, 0, movedSlide);

      return {
        ...current,
        slides: nextSlides,
      };
    });
  }

  async function saveHero() {
    try {
      setIsSaving(true);
      const response = await fetch("/api/homepage/hero", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hero }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Unable to save hero settings.");
      }

      setHero(payload.data);
      toast.success("Hero settings saved.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-sm text-[var(--muted)]">Loading hero settings...</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <CardTitle>Homepage Hero</CardTitle>
          <CardDescription>Keep the left-side content fixed and manage the right-side hero slides properly from admin.</CardDescription>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={saveHero} disabled={isSaving} leadingIcon={isSaving ? <Spinner /> : null}>
          {isSaving ? "Saving Hero..." : "Save Hero"}
        </Button>
      </CardHeader>
      <CardContent className="grid gap-5">
        <SettingsSection
          title="Left Side Content"
          description="Yeh homepage hero ka fixed content hai. Is section ka text ek hi bar show hota hai aur right-side slides change hone par bhi same rehta hai."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <SectionField label="Eyebrow">
              <Input value={hero.eyebrow} onChange={(event) => updateHeroField("eyebrow", event.target.value)} />
            </SectionField>
            <SectionField label="Search Placeholder">
              <Input value={hero.searchPlaceholder} onChange={(event) => updateHeroField("searchPlaceholder", event.target.value)} />
            </SectionField>
            <SectionField label="Main Title Line">
              <Input value={hero.titleLineOne} onChange={(event) => updateHeroField("titleLineOne", event.target.value)} />
            </SectionField>
            <SectionField label="Highlighted Title">
              <Input value={hero.titleAccent} onChange={(event) => updateHeroField("titleAccent", event.target.value)} />
            </SectionField>
            <SectionField label="Search Button Label">
              <Input value={hero.searchButtonLabel} onChange={(event) => updateHeroField("searchButtonLabel", event.target.value)} />
            </SectionField>
            <SectionField label="Member Count Text">
              <Input value={hero.memberCountText} onChange={(event) => updateHeroField("memberCountText", event.target.value)} />
            </SectionField>
            <div className="md:col-span-2">
              <SectionField label="Hero Description" hint="Main supporting paragraph under the hero heading.">
                <textarea
                  rows={4}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] outline-none"
                  value={hero.description}
                  onChange={(event) => updateHeroField("description", event.target.value)}
                />
              </SectionField>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Right Side Slides"
          description="Yahan sirf right-side card ki image aur overlay content manage hoga. Slides ki ordering bhi yahin control karo."
        >
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[var(--text)]">Hero Slides</p>
              <p className="text-xs text-[var(--muted)]">Image, badge, small label, title, description, discount, aur accent ko slide-wise manage karo.</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addHeroSlide}>
              Add Slide
            </Button>
          </div>

          <div className="space-y-4">
            {hero.slides.map((slide, index) => (
              <Card key={slide.id || index} className="border-[var(--border)] bg-[var(--surface)] shadow-none">
                <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <CardTitle className="text-base">Right Slide {index + 1}</CardTitle>
                    <CardDescription>{slide.title || "Untitled slide"}</CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => moveHeroSlide(index, -1)} disabled={index === 0}>
                      Move Up
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => moveHeroSlide(index, 1)}
                      disabled={index === hero.slides.length - 1}
                    >
                      Move Down
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="border border-[var(--border)]" onClick={() => removeHeroSlide(index)}>
                      Remove
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">Slide Preview</p>
                      <div className="mt-4 overflow-hidden rounded-[22px] border border-[var(--border)] bg-black">
                        <div className="relative aspect-[4/5]">
                          {slide.image ? (
                            <div
                              className="absolute inset-0 bg-cover bg-center"
                              style={{ backgroundImage: `url(${slide.image})` }}
                            />
                          ) : (
                            <div className="absolute inset-0 bg-[var(--surface)]" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/16 to-transparent" />
                          <div
                            className="absolute inset-0"
                            style={{
                              background: slide.accent || "linear-gradient(140deg, rgba(163,230,53,0.22), transparent 48%)",
                            }}
                          />
                          <div className="absolute left-4 top-4 rounded-full bg-[var(--color-secondary)]/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/76">
                            {slide.badge || "Badge"}
                          </div>
                          <div className="absolute inset-x-4 bottom-4 rounded-[20px] bg-[rgba(17,17,17,0.88)] p-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/52">{slide.kicker || "Kicker"}</p>
                            <p className="mt-2 text-xl font-bold text-white">{slide.title || "Slide title"}</p>
                            <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">{slide.description || "Slide description"}</p>
                            <div className="mt-4">
                              <span className="rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-extrabold text-black">
                                {slide.discount || "-20%"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <SectionField label="Image URL" hint="Right-side hero image for this slide.">
                      <Input value={slide.image || ""} onChange={(event) => updateHeroSlide(index, "image", event.target.value)} />
                    </SectionField>
                    <SectionField label="Top Badge" hint="Small pill shown on top-left of the image.">
                      <Input value={slide.badge || ""} onChange={(event) => updateHeroSlide(index, "badge", event.target.value)} />
                    </SectionField>
                    <SectionField label="Small Label" hint="Small uppercase text above the slide title.">
                      <Input value={slide.kicker || ""} onChange={(event) => updateHeroSlide(index, "kicker", event.target.value)} />
                    </SectionField>
                    <SectionField label="Discount Tag" hint="Example: -35% or 20% OFF.">
                      <Input value={slide.discount || ""} onChange={(event) => updateHeroSlide(index, "discount", event.target.value)} />
                    </SectionField>
                    <div className="md:col-span-2">
                      <SectionField label="Slide Title">
                        <Input value={slide.title || ""} onChange={(event) => updateHeroSlide(index, "title", event.target.value)} />
                      </SectionField>
                    </div>
                    <div className="md:col-span-2">
                      <SectionField label="Slide Description" hint="Short supporting text shown inside the right-side card.">
                        <textarea
                          rows={4}
                          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text)] outline-none"
                          value={slide.description || ""}
                          onChange={(event) => updateHeroSlide(index, "description", event.target.value)}
                        />
                      </SectionField>
                    </div>
                    <div className="md:col-span-2">
                      <SectionField label="Accent Gradient" hint="Example: linear-gradient(140deg, rgba(255,72,48,0.24), transparent 48%)">
                        <Input value={slide.accent || ""} onChange={(event) => updateHeroSlide(index, "accent", event.target.value)} />
                      </SectionField>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </SettingsSection>
      </CardContent>
    </Card>
  );
}

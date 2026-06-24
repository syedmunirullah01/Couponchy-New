"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";

export default function BlogClientPage({ initialBlogs = [] }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const postsToUse = useMemo(() => {
    const list = initialBlogs.length > 0 ? initialBlogs : [];
    return list.map((blog) => ({
      slug: blog.slug,
      title: blog.title,
      excerpt: blog.excerpt,
      date: blog.createdAt
        ? new Date(blog.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : (blog.date || ""),
      readTime: blog.readTime || "5 min read",
      category: blog.category,
      author: {
        name: blog.authorName || "Couponchy Team",
        role: blog.authorRole || "Savings Experts",
        avatar: blog.authorAvatar || "C",
      },
      image: blog.image,
      featured: Boolean(blog.isFeatured),
    }));
  }, [initialBlogs]);

  const categories = useMemo(() => {
    const uniqCats = Array.from(new Set(postsToUse.map((p) => p.category)));
    return ["All", ...uniqCats.filter(Boolean)];
  }, [postsToUse]);

  const filteredPosts = useMemo(() => {
    return postsToUse.filter((post) => {
      const matchesCategory =
        selectedCategory === "All" || post.category === selectedCategory;
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [postsToUse, selectedCategory, searchQuery]);

  // Find the featured post if available in the filtered list, or default to first matching
  const featuredPost = useMemo(() => {
    return filteredPosts.find((p) => p.featured) || filteredPosts[0] || null;
  }, [filteredPosts]);

  const regularPosts = useMemo(() => {
    if (!featuredPost) return filteredPosts;
    return filteredPosts.filter((p) => p.slug !== featuredPost.slug);
  }, [filteredPosts, featuredPost]);

  return (
    <div className="mx-auto w-full max-w-[1240px] px-6 py-12 md:py-16 lg:px-8">
      
      {/* ── Page Header ── */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <div className="mb-3 flex items-center gap-2.5">
            <span className="h-px w-8 bg-[var(--color-primary)]" />
            <span className="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--color-primary)]">
              ✦ SAVING INSIGHTS
            </span>
          </div>
          <h1 className="text-[36px] font-black tracking-[-0.05em] text-white sm:text-[46px] md:text-[54px] leading-[1.1]">
            Couponchy Blog.
          </h1>
          <p className="mt-4 max-w-lg text-[0.95rem] leading-relaxed text-white/55">
            Expert guides, system architecture stories, and hacks to maximize your checkout discounts.
          </p>
        </div>

        {/* Live Search Input */}
        <div className="relative w-full max-w-sm shrink-0">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35">
            <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles, guides, hacks..."
            className="h-12 w-full rounded-2xl border border-white/8 bg-[#0a0a0a] pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-[var(--color-primary)]/45 focus:ring-1 focus:ring-[var(--color-primary)]/20"
          />
        </div>
      </div>

      {/* ── Category Navigation Tabs ── */}
      <div className="mb-12 flex flex-wrap gap-2.5 border-b border-white/5 pb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-full px-5 py-2 text-xs font-bold transition-all duration-200 ${
              selectedCategory === cat
                ? "bg-[var(--color-primary)] text-black"
                : "border border-white/8 bg-white/[0.02] text-white/60 hover:border-white/18 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Main content area ── */}
      {filteredPosts.length > 0 ? (
        <div className="space-y-12">
          
          {/* Featured Post Card */}
          {featuredPost && (
            <Link
              href={`/blog/${featuredPost.slug}`}
              className="group block relative overflow-hidden rounded-[28px] border border-white/5 bg-[#0d0d0d] p-6 md:p-8 lg:p-10 transition-all duration-300 hover:border-[var(--color-primary)]/20 hover:shadow-[0_20px_50px_rgba(163,230,53,0.06)]"
            >
              <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-[var(--color-primary)]/0 to-[var(--color-primary)]/[0.012] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              
              <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
                {/* Image Container */}
                <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-white/5 lg:col-span-7">
                  <Image
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 700px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                  />
                  <div className="absolute left-4 top-4 rounded-full bg-black/70 backdrop-blur-md border border-white/10 px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-primary)]">
                    Featured
                  </div>
                </div>

                {/* Text Details */}
                <div className="flex flex-col justify-center lg:col-span-5">
                  <span className="inline-flex text-[10px] font-extrabold uppercase tracking-widest text-[var(--color-primary)]">
                    {featuredPost.category}
                  </span>
                  <h2 className="mt-4 text-[24px] font-black text-white group-hover:text-[var(--color-primary)] transition-colors duration-300 sm:text-[28px] lg:text-[32px] leading-tight">
                    {featuredPost.title}
                  </h2>
                  <p className="mt-4 text-[0.92rem] leading-relaxed text-white/45">
                    {featuredPost.excerpt}
                  </p>

                  {/* Author Row */}
                  <div className="mt-8 flex items-center gap-3.5 border-t border-white/5 pt-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-xs font-bold text-[var(--color-primary)]">
                      {featuredPost.author.avatar}
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-white">{featuredPost.author.name}</p>
                      <p className="text-[10px] text-white/40">{featuredPost.author.role}</p>
                    </div>
                    <div className="ml-auto text-right text-[10px] text-white/30">
                      <p>{featuredPost.date}</p>
                      <p className="mt-0.5 font-semibold text-[var(--color-primary)]">{featuredPost.readTime}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Regular Posts Grid */}
          {regularPosts.length > 0 && (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {regularPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group relative flex flex-col overflow-hidden rounded-[24px] border border-white/5 bg-[#0d0d0d] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-primary)]/20 hover:shadow-[0_15px_35px_rgba(163,230,53,0.05)]"
                >
                  <div className="absolute inset-0 rounded-[24px] bg-gradient-to-br from-[var(--color-primary)]/0 to-[var(--color-primary)]/[0.012] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  {/* Image wrapper */}
                  <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-white/5 mb-5">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 360px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Category */}
                  <span className="inline-flex text-[9px] font-extrabold uppercase tracking-widest text-[var(--color-primary)]">
                    {post.category}
                  </span>

                  {/* Title */}
                  <h3 className="mt-3 text-[17px] font-black text-white group-hover:text-[var(--color-primary)] transition-colors duration-300 leading-snug">
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="mt-3.5 text-xs leading-relaxed text-white/40 flex-1">
                    {post.excerpt}
                  </p>

                  {/* Footer Meta */}
                  <div className="mt-6 flex items-center gap-3 border-t border-white/5 pt-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.03] border border-white/5 text-[10px] font-bold text-white/60">
                      {post.author.avatar}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white/80">{post.author.name}</p>
                      <p className="text-[9px] text-white/35">{post.date}</p>
                    </div>
                    <span className="ml-auto text-[10px] font-bold text-[var(--color-primary)]">
                      {post.readTime}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

        </div>
      ) : (
        <div className="rounded-[28px] border border-white/5 bg-[#0d0d0d] p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.02] border border-white/5 mb-5 text-[var(--color-primary)]">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </div>
          <h3 className="text-lg font-black text-white">No articles matched your search</h3>
          <p className="mt-2 text-sm text-white/40 max-w-sm mx-auto">
            Try checking another category tab or searching for different keywords (like "stacking", "verification").
          </p>
          <button
            onClick={() => {
              setSelectedCategory("All");
              setSearchQuery("");
            }}
            className="mt-6 rounded-xl bg-white/[0.04] border border-white/10 px-5 py-2.5 text-xs font-bold text-white hover:bg-white/8 transition"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* ── Blog Subscription Panel ── */}
      <div className="mt-20 rounded-[28px] border border-[rgba(163,230,53,0.12)] p-8 md:p-12 relative overflow-hidden"
        style={{ backgroundImage: "linear-gradient(135deg, rgba(163,230,53,0.04) 0%, rgba(0,0,0,0) 100%)" }}
      >
        <div className="relative z-10 grid gap-8 md:grid-cols-12 md:items-center">
          <div className="md:col-span-7">
            <span className="inline-flex text-[9px] font-extrabold uppercase tracking-widest text-[var(--color-primary)] mb-3">
              ✦ NEWSLETTER
            </span>
            <h3 className="text-[26px] font-black tracking-tight text-white md:text-[32px] leading-tight">
              Get discount strategy guides <br />
              <span className="text-[var(--color-primary)]">direct to your inbox.</span>
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-white/40 max-w-md">
              No spam. Just actionable tips on coupon stacking, cashback layers, and shopping hacks from our founder.
            </p>
          </div>
          
          <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-3 md:col-span-5">
            <input
              type="email"
              required
              placeholder="Your Email Address"
              className="h-12 w-full rounded-xl border border-white/8 bg-black/40 px-4 text-sm text-white outline-none placeholder:text-white/20 focus:border-[var(--color-primary)]/45"
            />
            <button
              type="submit"
              className="h-12 shrink-0 rounded-xl bg-[var(--color-primary)] px-6 text-xs font-black tracking-wider text-black uppercase transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}

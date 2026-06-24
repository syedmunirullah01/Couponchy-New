import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMetadataDefaults } from "@/server/services/settings-service";
import { getBlogBySlug, getAllBlogs } from "@/server/repositories/blogs-repository";
import ShareButton from "./ShareButton";
import ReviewSection from "./ReviewSection";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  try {
    const post = await getBlogBySlug(resolvedParams.slug);
    if (!post) {
      return getMetadataDefaults("Article Not Found");
    }
    return getMetadataDefaults(`${post.title} | Blog`);
  } catch (error) {
    return getMetadataDefaults("Article | Blog");
  }
}

export const dynamic = "force-dynamic";

export default async function BlogPostDetailPage({ params }) {
  const resolvedParams = await params;
  
  let dbPost = null;
  let allBlogs = [];
  try {
    [dbPost, allBlogs] = await Promise.all([
      getBlogBySlug(resolvedParams.slug),
      getAllBlogs()
    ]);
  } catch (error) {
    console.error("Error loading blog details from database:", error);
  }

  if (!dbPost) {
    return notFound();
  }

  const post = {
    slug: dbPost.slug,
    title: dbPost.title,
    excerpt: dbPost.excerpt,
    content: dbPost.content,
    image: dbPost.image,
    category: dbPost.category,
    readTime: dbPost.readTime,
    date: dbPost.createdAt ? new Date(dbPost.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    }) : "",
    isoDate: dbPost.createdAt || new Date().toISOString(),
    author: {
      name: dbPost.authorName || "Couponchy Team",
      role: dbPost.authorRole || "Savings Experts",
      avatar: dbPost.authorAvatar || "C",
      bio: dbPost.authorBio || "The Couponchy Team is dedicated to automated coupon verification, checkout optimizations, and sharing the best savings strategies to help you get the lowest price.",
    }
  };

  // Find 2 related articles matching different posts
  const relatedPosts = allBlogs
    .filter((p) => p.slug !== post.slug)
    .slice(0, 2)
    .map(blog => ({
      slug: blog.slug,
      title: blog.title,
      excerpt: blog.excerpt,
      category: blog.category,
      image: blog.image,
      readTime: blog.readTime,
      date: blog.createdAt ? new Date(blog.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      }) : ""
    }));

  // Structured schema JSON-LD data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "image": [post.image],
    "datePublished": new Date(post.isoDate).toISOString().split('T')[0],
    "dateModified": new Date(post.isoDate).toISOString().split('T')[0],
    "author": [{
      "@type": "Person",
      "name": post.author.name,
      "jobTitle": post.author.role
    }],
    "description": post.excerpt,
    "publisher": {
      "@type": "Organization",
      "name": "Couponchy",
      "logo": {
        "@type": "ImageObject",
        "url": "https://couponchy.com/logo.png"
      }
    }
  };

  return (
    <>
      {/* Structured Schema.org SEO Data Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Lightweight Browser Scroll Reading Progress Bar (Vanilla JS injection for maximum runtime speed) */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('scroll', () => {
              const progressEl = document.getElementById('reading-progress');
              if (!progressEl) return;
              const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
              const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
              const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
              progressEl.style.width = scrolled + '%';
            });
          `
        }}
      />

      {/* Custom Styles for typography and layouts inside Server Component */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .blog-grid-bg {
              background-image: 
                radial-gradient(rgba(163, 230, 53, 0.12) 1px, transparent 1px), 
                radial-gradient(rgba(56, 189, 248, 0.08) 1px, transparent 1px);
              background-size: 40px 40px;
              background-position: 0 0, 20px 20px;
            }
            .title-gradient {
              background: linear-gradient(135deg, #ffffff 10%, #a3e635 60%, #38bdf8 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            }
            /* Custom list styles for prose */
            .prose-custom ul {
              list-style: none;
              padding-left: 0;
            }
            .prose-custom ul li {
              position: relative;
              padding-left: 1.75rem;
              margin-bottom: 0.75rem;
              color: rgba(255,255,255,0.75);
            }
            .prose-custom ul li::before {
              content: "✦";
              position: absolute;
              left: 0.25rem;
              color: var(--color-primary);
              font-weight: bold;
              text-shadow: 0 0 8px rgba(163,230,53,0.5);
            }
            /* Custom quote styles */
            .prose-custom blockquote {
              border-left: 4px solid var(--color-primary);
              background: linear-gradient(90deg, rgba(163,230,53,0.03) 0%, transparent 100%);
              padding: 1.25rem 1.5rem;
              border-radius: 0 16px 16px 0;
              font-style: italic;
              color: rgba(255,255,255,0.9);
              box-shadow: inset 1px 0 0 rgba(255,255,255,0.02);
            }
          `
        }}
      />

      {/* Scroll indicator strip fixed on top viewport */}
      <div suppressHydrationWarning={true} className="fixed top-0 left-0 z-[9999] h-[3.5px] w-0 bg-gradient-to-r from-[var(--color-primary)] to-cyan-400 transition-all duration-75 shadow-[0_0_12px_rgba(163,230,53,0.6)]" id="reading-progress" />

      {/* Grid and Glow Background Overlays */}
      <div className="absolute inset-0 blog-grid-bg opacity-[0.15] pointer-events-none" />
      
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -left-40 -top-32 h-[600px] w-[600px] rounded-full blur-[200px]"
        style={{ background: "radial-gradient(circle, rgba(163,230,53,0.08), transparent 70%)" }} />
      <div className="pointer-events-none absolute right-10 top-1/3 h-[500px] w-[500px] rounded-full blur-[200px]"
        style={{ background: "radial-gradient(circle, rgba(56,189,248,0.06), transparent 70%)" }} />
      <div className="pointer-events-none absolute left-1/3 bottom-1/4 h-[400px] w-[400px] rounded-full blur-[180px]"
        style={{ background: "radial-gradient(circle, rgba(236,72,153,0.02), transparent 70%)" }} />

      <div className="mx-auto w-full max-w-[1080px] px-6 py-10 md:py-16 relative z-10">
        
        {/* Breadcrumb Trail */}
        <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2.5 text-xs text-white/45">
          <Link href="/" className="hover:text-[var(--color-primary)] hover:translate-x-[-2px] transition-all flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            <span>Home</span>
          </Link>
          <span className="opacity-30">/</span>
          <Link href="/blog" className="hover:text-[var(--color-primary)] transition-all">Blog</Link>
          <span className="opacity-30">/</span>
          <span className="truncate max-w-[180px] text-white/70 font-semibold" aria-current="page">
            {post.title}
          </span>
        </nav>

        {/* Article Metadata Header */}
        <header className="mb-12">
          <div className="flex flex-wrap items-center gap-4 text-xs font-black tracking-wider mb-6">
            <span className="rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 px-4 py-1.5 text-[var(--color-primary)] uppercase shadow-[0_0_15px_rgba(163,230,53,0.08)]">
              {post.category}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
            <time dateTime={new Date(post.date).toISOString().split('T')[0]} className="text-white/50 font-medium">
              {post.date}
            </time>
            <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
            <span className="text-white/50 font-medium flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-[var(--color-primary)]/70" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              {post.readTime}
            </span>
          </div>

          <h1 className="text-[34px] font-black tracking-tight text-white sm:text-[46px] lg:text-[56px] leading-[1.08] mb-6 title-gradient">
            {post.title}
          </h1>

          <p className="text-lg leading-relaxed text-white/55 mb-8 max-w-3xl italic font-medium pl-4 border-l-2 border-white/10">
            "{post.excerpt}"
          </p>

          {/* Author info row */}
          <div className="flex items-center gap-4 border-t border-white/5 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/5 border border-[var(--color-primary)]/30 text-md font-black text-[var(--color-primary)] shadow-[0_4px_16px_rgba(163,230,53,0.1)]">
              {post.author.avatar}
            </div>
            <div>
              <p className="text-sm font-black text-white">{post.author.name}</p>
              <p className="text-xs text-white/40 font-medium">{post.author.role}</p>
            </div>
          </div>
        </header>

        {/* Featured Cover Image with Beveled Frame and Double-Glowing Border */}
        <div className="relative aspect-[21/9] w-full overflow-hidden rounded-[32px] border border-white/10 bg-neutral-950 mb-16 shadow-[0_30px_60px_rgba(0,0,0,0.8),0_0_80px_rgba(163,230,53,0.04)] group">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10" />
          <Image
            src={post.image}
            alt={post.title}
            fill
            priority
            sizes="(max-width: 1080px) 100vw, 1080px"
            className="object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-103"
          />
        </div>

        {/* Main Grid Layout: Left Column Social & Stats, Right Column Content */}
        <div className="grid gap-12 lg:grid-cols-12">
          
          {/* Sticky left sidebar for social links & article stats */}
          <aside className="lg:col-span-3 lg:sticky lg:top-28 self-start space-y-6">
            <div className="rounded-[24px] border border-white/8 bg-black/40 backdrop-blur-md p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <ShareButton title={post.title} excerpt={post.excerpt} />
            </div>

            {/* Quick Article Stats Widget */}
            <div className="rounded-[24px] border border-white/5 bg-white/[0.01] p-5">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-4">
                Article Information
              </h4>
              <div className="space-y-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/45">Verification</span>
                  <span className="font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2 py-0.5 rounded border border-[var(--color-primary)]/20">100% Tested</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/45">Views</span>
                  <span className="font-extrabold text-white">12.4k reads</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/45">Category</span>
                  <span className="font-bold text-white/80">{post.category}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Column: Long-Form Content & Discussions */}
          <main className="lg:col-span-9">
            <article
              className="prose prose-invert prose-custom max-w-none text-white/80 leading-[1.85] text-[1.03rem] space-y-7 
                prose-headings:text-white prose-headings:font-black prose-headings:tracking-tight prose-headings:mt-12 prose-headings:mb-5
                prose-h2:text-[28px] prose-h2:border-b prose-h2:border-white/5 prose-h2:pb-4 prose-h2:mb-6
                prose-h3:text-[20px]
                prose-strong:text-white prose-strong:font-black
                prose-a:text-[var(--color-primary)] prose-a:underline hover:prose-a:text-white prose-a:transition-all prose-a:font-semibold
                prose-li:text-white/75
                prose-hr:border-white/5 prose-hr:my-14"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Author Profile Bio Box */}
            <footer className="mt-16 rounded-[30px] border border-white/5 bg-[#0b0b0b] p-6 md:p-8 relative overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)]">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/0 to-[var(--color-primary)]/[0.012] pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row items-start gap-6">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/5 border border-[var(--color-primary)]/30 text-2xl font-black text-[var(--color-primary)]">
                  {post.author.avatar}
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2.5 py-0.5 rounded border border-[var(--color-primary)]/20">
                    Author Profile
                  </span>
                  <h3 className="text-xl font-black text-white mt-2.5">
                    {post.author.name}
                  </h3>
                  <p className="mt-2.5 text-[0.92rem] leading-relaxed text-white/50 font-medium">
                    {post.author.bio}
                  </p>
                </div>
              </div>
            </footer>

            {/* Interactive Comment / Review Section */}
            <ReviewSection />

            {/* ── Related Articles Section ── */}
            <div className="mt-20 border-t border-white/5 pt-12">
              <div className="mb-8 flex items-center justify-between">
                <h3 className="text-[22px] font-black tracking-tight text-white">
                  Related Saving Insights
                </h3>
                <Link href="/blog" className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1">
                  View all posts
                  <span>→</span>
                </Link>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/blog/${related.slug}`}
                    className="group relative flex flex-col rounded-2xl border border-white/5 bg-[#0a0a0a] p-5 transition hover:border-[var(--color-primary)]/20 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.5)]"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-white/5 mb-4 bg-neutral-900">
                      <Image
                        src={related.image}
                        alt={related.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 380px"
                        className="object-cover transition group-hover:scale-103"
                      />
                    </div>
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-[var(--color-primary)]">
                      {related.category}
                    </span>
                    <h4 className="mt-2 text-[15px] font-black leading-snug text-white group-hover:text-[var(--color-primary)] transition-colors">
                      {related.title}
                    </h4>
                    <div className="mt-4 flex items-center justify-between text-[10px] text-white/40">
                      <span>{related.date}</span>
                      <span className="font-bold text-[var(--color-primary)]">{related.readTime}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </main>
        </div>

      </div>
    </>
  );
}

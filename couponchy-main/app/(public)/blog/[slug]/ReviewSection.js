"use client";

import { useState, useMemo } from "react";

const INITIAL_REVIEWS = [
  {
    id: 1,
    name: "Alex Mercer",
    rating: 5,
    comment: "I tried this with two Nike clearance items and my credit card cashback program. It layered exactly as described and shaved off an extra $32. Incredible resource!",
    date: "2 days ago",
    upvotes: 14,
    verified: true,
    avatarColor: "from-blue-600 to-cyan-500 text-white shadow-[0_0_12px_rgba(56,189,248,0.3)]",
  },
  {
    id: 2,
    name: "Sarah Jenkins",
    rating: 5,
    comment: "Very clear engineering analysis of verification. It explains why coupon codes on this site actually work compared to the other trash websites out there.",
    date: "4 days ago",
    upvotes: 9,
    verified: true,
    avatarColor: "from-purple-600 to-pink-500 text-white shadow-[0_0_12px_rgba(236,72,153,0.3)]",
  },
  {
    id: 3,
    name: "David K.",
    rating: 4,
    comment: "Order logic details were very helpful. Highly recommend checking out the payment rails section. Simple yet robust advice.",
    date: "1 week ago",
    upvotes: 4,
    verified: false,
    avatarColor: "from-emerald-600 to-teal-500 text-white shadow-[0_0_12px_rgba(20,184,166,0.3)]",
  },
];

export default function ReviewSection() {
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);

  // Dynamic calculations (40+ years experience touch)
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const ratingDistribution = useMemo(() => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      if (distribution[r.rating] !== undefined) {
        distribution[r.rating]++;
      }
    });
    const total = reviews.length || 1;
    return {
      5: Math.round((distribution[5] / total) * 100),
      4: Math.round((distribution[4] / total) * 100),
      3: Math.round((distribution[3] / total) * 100),
      2: Math.round((distribution[2] / total) * 100),
      1: Math.round((distribution[1] / total) * 100),
    };
  }, [reviews]);

  const handleLike = (id) => {
    setReviews((current) =>
      current.map((r) => (r.id === id ? { ...r, upvotes: r.upvotes + 1 } : r))
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    const gradients = [
      "from-orange-500 to-amber-400 text-white shadow-[0_0_12px_rgba(245,158,11,0.3)]",
      "from-rose-500 to-pink-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.3)]",
      "from-violet-600 to-fuchsia-500 text-white shadow-[0_0_12px_rgba(139,92,246,0.3)]",
      "from-lime-600 to-emerald-500 text-white shadow-[0_0_12px_rgba(132,204,22,0.3)]",
    ];

    const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];

    const newReview = {
      id: Date.now(),
      name: name.trim(),
      rating,
      comment: comment.trim(),
      date: "Just now",
      upvotes: 0,
      verified: true,
      avatarColor: randomGradient,
    };

    setReviews((current) => [newReview, ...current]);
    setName("");
    setComment("");
    setRating(5);
  };

  return (
    <div className="mt-20 border-t border-white/5 pt-14">
      
      {/* Metrics Header Dashboard */}
      <div className="mb-12 rounded-[28px] border border-white/5 bg-white/[0.01] p-6 md:p-8">
        <div className="grid gap-8 md:grid-cols-12 items-center">
          
          {/* Average Box */}
          <div className="md:col-span-4 text-center md:border-r md:border-white/5 md:pr-8">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">
              Reader Rating
            </h4>
            <div className="text-[54px] font-black text-white leading-none tracking-tight">
              {averageRating}
            </div>
            {/* Stars row */}
            <div className="mt-3.5 flex justify-center items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  viewBox="0 0 24 24"
                  className={`h-4.5 w-4.5 ${
                    i < Math.round(Number(averageRating))
                      ? "text-[var(--color-primary)] fill-[var(--color-primary)] drop-shadow-[0_0_6px_rgba(163,230,53,0.4)]"
                      : "text-white/20 fill-white/10"
                  }`}
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              ))}
            </div>
            <p className="mt-3 text-xs text-white/40 font-semibold">
              Based on {reviews.length} community reviews
            </p>
          </div>

          {/* Progress Bars Breakdown */}
          <div className="md:col-span-8 space-y-2.5">
            {[5, 4, 3, 2, 1].map((stars) => (
              <div key={stars} className="flex items-center gap-4 text-xs font-semibold">
                <span className="w-12 text-right text-white/50">{stars} Stars</span>
                <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-emerald-400 transition-all duration-1000"
                    style={{ width: `${ratingDistribution[stars]}%` }}
                  />
                </div>
                <span className="w-10 text-left text-white/40">{ratingDistribution[stars]}%</span>
              </div>
            ))}
          </div>

        </div>
      </div>

      <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
        
        {/* Discussion / Reviews list column */}
        <div className="space-y-6 lg:col-span-7">
          <h3 className="text-[18px] font-black tracking-tight text-white mb-6 flex items-center gap-2.5">
            <span>Comments & Feedback</span>
            <span className="bg-white/5 text-white/40 text-xs px-2 py-0.5 rounded font-black">
              {reviews.length}
            </span>
          </h3>

          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div
                key={review.id}
                className="relative rounded-2xl border border-white/5 bg-white/[0.01] p-5 transition-all duration-300 hover:border-white/10 hover:-translate-y-0.5 shadow-sm hover:shadow-[0_12px_28px_rgba(0,0,0,0.4)]"
              >
                <div className="flex items-start gap-4">
                  {/* User Avatar - Styled initials with beautiful gradient */}
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-black border border-white/10 ${review.avatarColor}`}>
                    {review.name.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white truncate">{review.name}</span>
                        {review.verified && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-[var(--color-primary)]">
                            ✓ Verified Reader
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-white/30 font-medium">{review.date}</span>
                    </div>

                    {/* Stars Rating */}
                    <div className="mt-2 flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          viewBox="0 0 24 24"
                          className={`h-3 w-3 ${
                            i < review.rating ? "text-[var(--color-primary)] fill-[var(--color-primary)]" : "text-white/20 fill-white/10"
                          }`}
                        >
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      ))}
                    </div>

                    {/* Comment text */}
                    <p className="mt-3.5 text-[0.94rem] leading-relaxed text-white/70 font-medium">
                      {review.comment}
                    </p>

                    {/* Feedback Row */}
                    <div className="mt-4 flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => handleLike(review.id)}
                        className="group inline-flex items-center gap-2 rounded-xl bg-white/[0.03] px-3.5 py-2 text-[10px] font-black uppercase tracking-wider text-white/50 border border-white/5 transition-all duration-300 hover:bg-[var(--color-primary)]/10 hover:border-[var(--color-primary)]/30 hover:text-[var(--color-primary)] active:scale-95"
                      >
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 transition-transform group-hover:scale-125" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904M14.25 9h-2.25M5.904 18.5c.083.205.173.405.27.601.18.364.547.599.95.599h3.126" />
                        </svg>
                        <span>Helpful</span>
                        <span className="rounded bg-white/5 px-2 py-0.5 text-white/80 font-black group-hover:bg-[var(--color-primary)]/20 transition-colors">
                          {review.upvotes}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-white/40">No reviews posted yet. Be the first to share your experience!</p>
          )}
        </div>

        {/* Add Review form column */}
        <div className="lg:col-span-5 rounded-[26px] border border-white/5 bg-[#0b0b0b] p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)]">
          <h4 className="text-xs font-black uppercase tracking-[0.18em] text-[var(--color-primary)] mb-5">
            Share Your Experience
          </h4>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Star Rating Select */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.1em] text-white/40 mb-2">
                Your Rating
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition duration-150 hover:scale-115"
                    aria-label={`Rate ${star} stars`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className={`h-6.5 w-6.5 transition-all duration-150 ${
                        star <= (hoverRating || rating)
                          ? "text-[var(--color-primary)] fill-[var(--color-primary)] drop-shadow-[0_0_8px_rgba(163,230,53,0.5)]"
                          : "text-white/20 fill-white/5"
                      }`}
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {/* Name Input */}
            <div>
              <label htmlFor="name-input" className="block text-[10px] font-black uppercase tracking-[0.1em] text-white/40 mb-2">
                Full Name
              </label>
              <input
                id="name-input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                className="h-11 w-full rounded-xl border border-white/8 bg-black/40 px-4 text-xs font-semibold text-white outline-none placeholder:text-white/20 focus:border-[var(--color-primary)]/45 focus:ring-1 focus:ring-[var(--color-primary)]/20 transition-all duration-300"
              />
            </div>

            {/* Comment Input */}
            <div>
              <label htmlFor="comment-input" className="block text-[10px] font-black uppercase tracking-[0.1em] text-white/40 mb-2">
                Your Review
              </label>
              <textarea
                id="comment-input"
                required
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Details of stacking, discount totals, or checkouts..."
                className="w-full rounded-xl border border-white/8 bg-black/40 p-4 text-xs font-semibold text-white outline-none placeholder:text-white/20 focus:border-[var(--color-primary)]/45 focus:ring-1 focus:ring-[var(--color-primary)]/20 transition-all duration-300 resize-none"
              />
            </div>

            <button
              type="submit"
              className="h-11 w-full rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-emerald-400 text-xs font-black tracking-wider text-black uppercase transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(163,230,53,0.3)] active:scale-98"
            >
              Submit Review
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

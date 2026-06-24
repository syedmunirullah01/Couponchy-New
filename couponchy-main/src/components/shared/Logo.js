import Link from "next/link";

export default function Logo({ noLink = false, className = "" }) {
  const content = (
    <>
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--color-primary)] text-[15px] font-black text-black shadow-[0_18px_40px_rgba(163,230,53,0.18)]">
        C
      </span>
      <span className="notranslate text-[15px] font-extrabold tracking-tight text-white">
        Coupon<span className="text-[var(--color-primary)]">chy</span>
      </span>
    </>
  );

  if (noLink) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {content}
      </div>
    );
  }

  return (
    <Link href="/" className={`flex items-center gap-3 ${className}`}>
      {content}
    </Link>
  );
}

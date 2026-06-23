import Link from "next/link";

export default function SectionHeader({ title, centered = false, href = "#" }) {
  return (
    <div
      className={`mb-10 flex items-end gap-4 ${centered ? "flex-col items-center text-center" : "justify-between"}`}
    >
      <div>
        <h2 className="font-sans text-[32px] font-black uppercase tracking-[-0.05em] text-white sm:text-[42px]">
          {title}
        </h2>
        <div className={`mt-3 h-1 w-24 rounded-full bg-[var(--color-primary)] ${centered ? "mx-auto" : ""}`} />
      </div>
      {!centered ? (
        <Link
          href={href}
          className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)] transition hover:text-white"
        >
          View All
        </Link>
      ) : null}
    </div>
  );
}

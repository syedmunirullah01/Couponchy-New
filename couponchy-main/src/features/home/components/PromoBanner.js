import Link from "next/link";

export default function PromoBanner({ promoBanner }) {
  if (!promoBanner || !promoBanner.imageUrl) return null;

  const { imageUrl, targetUrl = "/coupons" } = promoBanner;

  return (
    <div className="w-full">
      <Link 
        href={targetUrl}
        className="group relative block w-full overflow-hidden rounded-[24px] border border-white/10 shadow-[0_12px_30px_rgba(0,0,0,0.15)] transition-all duration-500 hover:-translate-y-1 hover:scale-[1.008] hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:border-white/20"
      >
        {/* Glow effect on hover */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="Promotional Banner"
          className="w-full h-auto object-cover min-h-[70px] max-h-[160px] select-none pointer-events-none transition-transform duration-700 group-hover:scale-[1.01]"
        />
      </Link>
    </div>
  );
}

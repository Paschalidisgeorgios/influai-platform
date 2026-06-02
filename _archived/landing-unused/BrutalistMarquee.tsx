"use client";

import type { LandingLanguage } from "./magnificContent";
import { magnificContent } from "./magnificContent";

export default function BrutalistMarquee({
  currentLanguage,
}: {
  currentLanguage: LandingLanguage;
}) {
  const text = magnificContent[currentLanguage].marquee;
  const loop = `${text}${text}`;

  return (
    <div className="relative flex overflow-hidden whitespace-nowrap border-y border-neutral-800 bg-black py-4 font-mono text-white shadow-2xl">
      <div className="magnific-marquee flex will-change-transform">
        <span className="px-6 text-xs font-black uppercase tracking-widest">
          {loop}
        </span>
        <span className="px-6 text-xs font-black uppercase tracking-widest">
          {loop}
        </span>
      </div>
      <style jsx>{`
        .magnific-marquee {
          animation: magnific-marquee 18s linear infinite;
        }
        @keyframes magnific-marquee {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
      `}</style>
    </div>
  );
}

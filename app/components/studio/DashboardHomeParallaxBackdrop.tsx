"use client";

import type { UseSubtleParallaxResult } from "@/lib/motion/use-subtle-parallax";

const NOISE_SVG =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

type Props = {
  getLayerStyle: UseSubtleParallaxResult["getLayerStyle"];
  enabled: boolean;
};

/**
 * Decorative depth behind dashboard home content only.
 * Parent must attach `useSubtleParallax().containerRef` for mouse tracking.
 */
export default function DashboardHomeParallaxBackdrop({
  getLayerStyle,
  enabled,
}: Props) {
  const parallax = (maxPx: number) =>
    enabled ? getLayerStyle({ depth: 1, maxPx }) : undefined;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_85%_at_50%_42%,#121820_0%,#070A12_48%,#030508_100%)]" />

      <div style={parallax(8)}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_58%_44%_at_50%_38%,rgba(245,158,11,0.14),transparent_70%)]" />
        <div className="absolute left-1/2 top-[32%] h-48 w-48 -translate-x-1/2 rounded-full bg-amber-500/[0.07] blur-3xl" />
      </div>

      <div style={parallax(4)}>
        <div
          className="absolute inset-0 opacity-[0.22] mix-blend-soft-light"
          style={{
            backgroundImage: NOISE_SVG,
            backgroundSize: "180px 180px",
          }}
        />
      </div>

      <div style={parallax(12)}>
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(245,158,11,0.45) 1px, transparent 0)",
            backgroundSize: "36px 36px",
          }}
        />
        <svg
          className="absolute inset-0 h-full w-full text-amber-500/10"
          preserveAspectRatio="none"
          aria-hidden
        >
          <line x1="8%" y1="22%" x2="42%" y2="68%" stroke="currentColor" strokeWidth="1" />
          <line x1="58%" y1="18%" x2="92%" y2="52%" stroke="currentColor" strokeWidth="1" />
          <line x1="72%" y1="78%" x2="28%" y2="88%" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>
    </div>
  );
}

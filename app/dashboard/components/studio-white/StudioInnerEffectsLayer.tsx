"use client";

import { motion } from "framer-motion";
import type { UseSubtleParallaxResult } from "@/lib/motion/use-subtle-parallax";

type Props = {
  /** Generation / render in progress — intensify center glow + progress line */
  isGenerating?: boolean;
  getLayerStyle: UseSubtleParallaxResult["getLayerStyle"];
  enabled: boolean;
};

/**
 * Decorative layer only — absolute, no layout impact.
 * Parent shell owns `useSubtleParallax().containerRef` for mouse tracking.
 */
export default function StudioInnerEffectsLayer({
  isGenerating = false,
  getLayerStyle,
  enabled,
}: Props) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#8B5CF6]/8 via-[#22D3EE]/4 to-transparent" />

      <div style={enabled ? getLayerStyle({ depth: 0.65, maxPx: 10 }) : undefined}>
        <motion.div
          className="absolute left-[18%] top-12 h-44 w-44 rounded-full bg-[#8B5CF6]/18 blur-3xl"
          animate={{ opacity: [0.35, 0.6, 0.35], scale: [1, 1.08, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <div style={enabled ? getLayerStyle({ depth: 0.85, maxPx: 12 }) : undefined}>
        <motion.div
          className="absolute right-[14%] top-28 h-36 w-36 rounded-full bg-[#22D3EE]/12 blur-3xl"
          animate={{ opacity: [0.25, 0.5, 0.25], scale: [1, 1.06, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        />
      </div>

      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {isGenerating ? (
        <>
          <div style={enabled ? getLayerStyle({ depth: 0.4, maxPx: 6 }) : undefined}>
            <motion.div
              className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_38%,rgba(139,92,246,0.16),transparent_72%)]"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          <motion.div
            className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#8B5CF6]/80 to-transparent"
            animate={{ opacity: [0.35, 1, 0.35], scaleX: [0.85, 1, 0.85] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "center" }}
          />
        </>
      ) : null}
    </div>
  );
}

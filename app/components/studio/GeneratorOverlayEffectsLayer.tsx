"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ParallaxDepthLayers } from "@/app/components/motion/ParallaxDepthBackdrop";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { useSubtleParallax } from "@/lib/motion/use-subtle-parallax";

type Props = {
  isGenerating?: boolean;
};

/**
 * Decorative Lava-Amber ambience inside the generator overlay only.
 * Absolute positioning — no layout shift on open/animate.
 */
export default function GeneratorOverlayEffectsLayer({
  isGenerating = false,
}: Props) {
  const reduceMotion = useReducedMotion();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const { containerRef, getLayerStyle, enabled } = useSubtleParallax<HTMLDivElement>({
    maxPx: 8,
    strength: 0.75,
    disabled: isMobile || Boolean(reduceMotion),
  });

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <ParallaxDepthLayers
        variant="agent-panel"
        getLayerStyle={getLayerStyle}
        enabled={enabled}
      />

      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-amber-500/[0.07] via-amber-500/[0.02] to-transparent" />

      {!reduceMotion ? (
        <>
          <motion.div
            className="absolute left-[12%] top-10 h-36 w-36 rounded-full bg-amber-500/14 blur-3xl"
            animate={{ opacity: [0.35, 0.55, 0.35], scale: [1, 1.06, 1] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute right-[10%] top-24 h-28 w-28 rounded-full bg-amber-400/10 blur-3xl"
            animate={{ opacity: [0.25, 0.45, 0.25], scale: [1, 1.05, 1] }}
            transition={{
              duration: 6.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.35,
            }}
          />
        </>
      ) : null}

      {isGenerating && !reduceMotion ? (
        <>
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(ellipse_55%_42%_at_50%_32%,rgba(245,158,11,0.14),transparent_70%)]"
            animate={{ opacity: [0.5, 0.85, 0.5] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-x-8 top-0 h-px origin-center bg-gradient-to-r from-transparent via-amber-400/80 to-transparent"
            animate={{ opacity: [0.3, 1, 0.3], scaleX: [0.88, 1, 0.88] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      ) : null}
    </div>
  );
}

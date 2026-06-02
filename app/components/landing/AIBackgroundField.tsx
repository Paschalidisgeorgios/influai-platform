"use client";

import { useReducedMotion } from "framer-motion";
import {
  AI_BG_AMBER_PRIMARY,
  AI_BG_AMBER_SECONDARY,
  AI_BG_AURORA_A,
  AI_BG_AURORA_B,
  AI_BG_AURORA_C,
  AI_BG_CYAN_FLOW,
  AI_BG_CYAN_NODE,
  AI_BG_FIELD_ROOT,
  AI_BG_GRAIN_DATA_URL,
  AI_BG_GRAIN_LAYER,
  AI_BG_GRID_LAYER,
  AI_BG_MOTION,
  AI_BG_READABILITY_VIGNETTE,
  AI_BG_SCANLINE_LAYER,
} from "@/lib/landing/ai-background-tokens";
import "./ai-background-field.css";

type Props = {
  className?: string;
};

/**
 * Fixed landing backdrop — cinematic AI color motion (landing only).
 * Does not affect layout; content should sit in a sibling with `relative z-10`.
 */
export default function AIBackgroundField({ className = "" }: Props) {
  const reduceMotion = useReducedMotion();
  const motion = !reduceMotion;

  return (
    <div
      className={`${AI_BG_FIELD_ROOT} ${className}`}
      aria-hidden
      data-landing-ai-background=""
    >
      {/* Layer 2 — Lava-Amber glow (hero CTA + product theatre) */}
      <div
        className={`${AI_BG_AMBER_PRIMARY} ${motion ? AI_BG_MOTION.amberPrimary : "opacity-50"}`}
      />
      <div
        className={`${AI_BG_AMBER_SECONDARY} ${motion ? AI_BG_MOTION.amberSecondary : "opacity-35"}`}
      />

      {/* Layer 3 — purple / indigo aurora */}
      <div
        className={`${AI_BG_AURORA_A} ${motion ? AI_BG_MOTION.auroraA : "opacity-60"}`}
      />
      <div
        className={`${AI_BG_AURORA_B} ${motion ? AI_BG_MOTION.auroraB : "opacity-55"}`}
      />
      <div
        className={`${AI_BG_AURORA_C} ${motion ? AI_BG_MOTION.auroraC : "opacity-45"}`}
      />

      {/* Layer 4 — cyan data-flow accent */}
      <div
        className={`${AI_BG_CYAN_FLOW} ${motion ? AI_BG_MOTION.cyanFlow : "opacity-70"}`}
      />
      <div
        className={`${AI_BG_CYAN_NODE} ${motion ? AI_BG_MOTION.cyanNode : "opacity-40"}`}
      />

      {/* Layer 5 — grain */}
      <div
        className={AI_BG_GRAIN_LAYER}
        style={{ backgroundImage: AI_BG_GRAIN_DATA_URL }}
      />

      {/* Layer 6 — grid + scanlines */}
      <div className={AI_BG_GRID_LAYER} />
      <div className={AI_BG_SCANLINE_LAYER} />

      {/* Readability — always on top of glows */}
      <div className={AI_BG_READABILITY_VIGNETTE} />
    </div>
  );
}

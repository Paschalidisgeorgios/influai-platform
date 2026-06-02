"use client";

import { useReducedMotion } from "framer-motion";
import { useAgentVisualEffectsEnabled } from "@/lib/studio/agent-visual-effects-context";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const STATIC_REVEAL = {
  initial: false as const,
  animate: { opacity: 1, scale: 1 },
};

export function usePackMotion() {
  const agentEffectsEnabled = useAgentVisualEffectsEnabled();
  const prefersReducedMotion = useReducedMotion();
  const reduceMotion = Boolean(prefersReducedMotion || !agentEffectsEnabled);

  return {
    reduceMotion,
    agentEffectsEnabled,
    spring: reduceMotion
      ? { type: "tween" as const, duration: 0.01 }
      : { type: "spring" as const, stiffness: 380, damping: 32 },
    /** Opacity-only — avoids vertical layout shift on reveal. */
    fadeIn: reduceMotion
      ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
      : { initial: { opacity: 0 }, animate: { opacity: 1 } },
    stagger: reduceMotion ? 0 : 0.09,
    pulse: reduceMotion
      ? {}
      : {
          animate: { scale: [1, 1.03, 1] as [number, number, number] },
          transition: {
            duration: 2.4,
            repeat: Infinity,
            ease: "easeInOut" as const,
          },
        },
    /** Staggered card/chip reveal — transform only, fixed outer size. */
    revealAt: (index: number) =>
      reduceMotion
        ? STATIC_REVEAL
        : {
            initial: { opacity: 0, scale: 0.94 },
            animate: { opacity: 1, scale: 1 },
            transition: {
              delay: index * 0.09,
              duration: 0.38,
              ease: EASE_OUT,
            },
          },
    hoverDepth: reduceMotion
      ? {}
      : {
          whileHover: { scale: 1.03 },
          transition: { duration: 0.22, ease: EASE_OUT },
        },
    /** Lava glow pulse for ready export CTAs */
    exportGlow: reduceMotion
      ? {}
      : {
          animate: {
            boxShadow: [
              "0 0 20px rgba(245,158,11,0.22)",
              "0 0 36px rgba(245,158,11,0.42)",
              "0 0 20px rgba(245,158,11,0.22)",
            ],
          },
          transition: {
            duration: 2.4,
            repeat: Infinity,
            ease: "easeInOut" as const,
          },
        },
    scoreGlow: reduceMotion
      ? {}
      : {
          animate: {
            opacity: [0.45, 0.85, 0.45],
            scale: [1, 1.06, 1],
          },
          transition: {
            duration: 2.8,
            repeat: Infinity,
            ease: "easeInOut" as const,
          },
        },
  };
}

/** Shared showcase surface classes (depth without layout shift). */
export const PACK_SHOWCASE_STYLES = {
  variationCard:
    "group relative aspect-[4/5] min-w-0 overflow-hidden rounded-lg border border-white/[0.08] bg-neutral-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-[box-shadow,border-color] duration-300 hover:border-amber-500/35 hover:shadow-[0_8px_28px_rgba(0,0,0,0.45),0_0_24px_rgba(245,158,11,0.12)]",
  variationShine:
    "pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-[#8B5CF6]/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100",
  motionCard:
    "group relative mx-auto aspect-[9/16] w-full overflow-hidden rounded-lg border border-white/[0.08] bg-gradient-to-br from-neutral-900 to-neutral-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-[box-shadow,border-color] duration-300 hover:border-amber-500/30 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4),0_0_20px_rgba(245,158,11,0.1)]",
  motionGlow:
    "pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_85%,rgba(245,158,11,0.22),transparent_62%)]",
  copyChip:
    "inline-flex max-w-full items-center gap-1.5 rounded-lg border border-white/[0.08] bg-[#111827]/70 px-2 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition-[border-color,box-shadow,transform] duration-200 hover:border-amber-500/30 hover:bg-[#111827]/90 hover:shadow-[0_0_16px_rgba(245,158,11,0.1)]",
  hookPill:
    "inline-flex max-w-full items-center rounded-full border border-white/[0.08] bg-neutral-900/50 px-2 py-0.5 text-[10px] font-medium text-neutral-300 transition-[border-color,box-shadow] duration-200 hover:border-amber-500/25 hover:shadow-[0_0_12px_rgba(245,158,11,0.08)]",
  scoreShell:
    "relative min-w-0 overflow-hidden rounded-xl border border-white/[0.08] bg-neutral-950/55 p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_32px_rgba(245,158,11,0.06)] sm:p-3",
  exportShell:
    "relative min-w-0 overflow-hidden rounded-xl border border-white/[0.08] bg-neutral-950/55 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-4",
} as const;

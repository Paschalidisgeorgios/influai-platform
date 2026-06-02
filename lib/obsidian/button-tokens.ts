/**
 * InfluExAI — Hyper-Kinetic Obsidian button system (5 variants).
 * Lava-Amber glow is reserved for primary CTAs only; success uses green.
 */

import { cn } from "@/lib/utils";

export type ObsidianButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  /** Preview / request access — neutral glass, amber hover only */
  | "preview"
  | "locked"
  | "success";

export type ObsidianButtonSize = "sm" | "md" | "lg";

export type ObsidianButtonSurface = "dashboard" | "landing";

const FOCUS_DASHBOARD =
  "outline-none focus-visible:ring-2 focus-visible:ring-amber-400/85 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070A12]";

const FOCUS_LANDING =
  "outline-none focus-visible:ring-2 focus-visible:ring-amber-300/90 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]";

export const OBS_BTN = {
  base: "inline-flex items-center justify-center gap-2 rounded-xl whitespace-nowrap transition-all duration-200 select-none",

  disabled:
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:saturate-[0.85]",

  /** Lava-Amber + glow — one main action per surface */
  primary:
    "bg-amber-500 font-bold text-neutral-950 shadow-[0_0_24px_rgba(245,158,11,0.32)] hover:bg-amber-400 hover:shadow-[0_0_32px_rgba(245,158,11,0.42)] active:translate-y-px active:shadow-[0_0_18px_rgba(245,158,11,0.28)]",

  /** Dark glass — secondary actions, alternate paths */
  secondary:
    "border border-white/[0.12] bg-[#111827]/55 font-semibold text-neutral-200 backdrop-blur-md hover:border-amber-500/38 hover:bg-[#111827]/75 hover:text-amber-50 active:translate-y-px",

  /** Low emphasis — tertiary / inline navigation */
  ghost:
    "border border-transparent bg-transparent font-medium text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-100 active:bg-white/[0.06]",

  /** Preview / request access — neutral glass; no Lava glow (main CTA stays primary) */
  preview:
    "border border-white/[0.12] bg-[#111827]/65 font-semibold text-neutral-200 backdrop-blur-md hover:border-amber-500/38 hover:bg-[#111827]/80 hover:text-amber-50 active:translate-y-px",

  /** Disabled / unavailable — non-interactive */
  locked:
    "border border-white/[0.08] bg-[#0E1220]/90 font-semibold text-neutral-500 cursor-not-allowed",

  /** Confirmed success only — never for primary conversion */
  success:
    "border border-emerald-500/35 bg-emerald-500/12 font-bold text-emerald-200 hover:border-emerald-400/45 hover:bg-emerald-500/18 active:translate-y-px",

  size: {
    sm: "min-h-[40px] px-3 py-2 text-xs",
    md: "min-h-[44px] px-4 py-2.5 text-sm",
    lg: "min-h-[48px] px-6 py-3.5 text-sm sm:px-8 sm:py-4",
  },

  /** Status chip colors (pair with `rounded-full border px-2 py-0.5` in UI) */
  badgeLockedColors:
    "border-white/[0.1] bg-[#111827]/90 text-neutral-400",

  badgePreviewColors:
    "border-white/[0.12] bg-white/[0.04] text-neutral-300",

  /** Live workflow — Lava-Amber (not success green) */
  badgeLiveColors:
    "border-amber-500/40 bg-amber-500/12 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.1)]",

  badgePreparingColors:
    "border-sky-500/28 bg-sky-500/10 text-sky-200/90",

  /** Standalone status pill (full class string) */
  badgePreview:
    "inline-flex items-center rounded-full border border-white/[0.12] bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold text-neutral-300",
} as const;

export function obsidianButtonClass(
  variant: ObsidianButtonVariant = "primary",
  options?: {
    size?: ObsidianButtonSize;
    surface?: ObsidianButtonSurface;
    fullWidth?: boolean;
    className?: string;
  }
): string {
  const size = options?.size ?? "md";
  const surface = options?.surface ?? "dashboard";

  return cn(
    OBS_BTN.base,
    OBS_BTN.size[size],
    OBS_BTN[variant],
    OBS_BTN.disabled,
    surface === "landing" ? FOCUS_LANDING : FOCUS_DASHBOARD,
    options?.fullWidth && "w-full",
    options?.className
  );
}

/** @deprecated Use obsidianButtonClass("primary") — kept for gradual migration */
export const OBSIDIAN_PRIMARY_CTA = obsidianButtonClass("primary", {
  size: "md",
});

export const OBSIDIAN_SECONDARY_CTA = obsidianButtonClass("secondary", {
  size: "md",
});

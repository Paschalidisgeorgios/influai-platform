/**
 * Accessibility & contrast utilities — dark premium UI.
 * Use on labels, CTAs, disabled controls, and keyboard focus.
 */

import {
  OBS_BTN,
  obsidianButtonClass,
} from "@/lib/obsidian/button-tokens";

export const A11Y = {
  /** Keyboard-only focus ring (pair with outline-none on the element) */
  focusRing:
    "outline-none focus-visible:ring-2 focus-visible:ring-amber-400/90 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070A12]",
  focusRingLight:
    "outline-none focus-visible:ring-2 focus-visible:ring-amber-400/90 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]",
  focusRingInset:
    "outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-400/80",

  /** Small labels — bumped from neutral-500 for WCAG-ish contrast on dark bg */
  mutedLabel:
    "text-[11px] font-semibold uppercase tracking-wider text-neutral-400",
  mutedCaption: "text-[11px] leading-relaxed text-neutral-400",
  mutedBody: "text-xs leading-relaxed text-neutral-400",

  /** Disabled but still readable */
  disabled:
    "disabled:cursor-not-allowed disabled:opacity-70 disabled:saturate-75 disabled:brightness-95",

  /** Minimum touch target (WCAG 2.5.5 advisory) */
  touchTarget: "min-h-[44px]",
  touchTargetSm: "min-h-[40px]",

  /** @see lib/obsidian/button-tokens — Lava-Amber primary */
  primaryCta: obsidianButtonClass("primary", { size: "md" }),

  /** @see lib/obsidian/button-tokens — same as primary (glow included) */
  lavaPrimaryCta: obsidianButtonClass("primary", {
    size: "md",
    surface: "landing",
  }),

  secondaryCta: obsidianButtonClass("secondary", { size: "md" }),

  ghostCta: obsidianButtonClass("ghost", { size: "md" }),

  previewCta: obsidianButtonClass("preview", { size: "md" }),

  lockedCta: obsidianButtonClass("locked", { size: "md" }),

  successCta: obsidianButtonClass("success", { size: "md" }),

  /** Credit cost badge — readable at small sizes */
  creditBadge:
    "inline-flex items-center rounded-full border border-amber-500/35 bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-300",

  /** Tool / feature status badges */
  badgeAvailable: OBS_BTN.badgeLiveColors,
  badgeCreditGated:
    "border-amber-500/30 bg-amber-500/10 text-amber-300",
  badgePreview: OBS_BTN.badgePreviewColors,
  badgeLocked: OBS_BTN.badgeLockedColors,
  badgeRequestAccess:
    "border-white/[0.12] bg-[#111827]/80 text-neutral-300 ring-1 ring-amber-500/18",
  badgePreparing: OBS_BTN.badgePreparingColors,
  badgePro:
    "border-[#8B5CF6]/35 bg-[#8B5CF6]/10 text-[#C4B5FD]",
  badgeMuted:
    "border-white/10 bg-white/[0.04] text-neutral-400",
  badgeAi:
    "border-[#8B5CF6]/40 bg-[#8B5CF6]/10 text-[#C4B5FD]",

  inputFocus:
    "outline-none focus-visible:border-amber-500/50 focus-visible:ring-2 focus-visible:ring-amber-500/35",
} as const;

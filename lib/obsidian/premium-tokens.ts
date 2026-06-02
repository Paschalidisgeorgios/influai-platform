/** Premium creator studio — dark glass, purple/cyan accents */

export const PREMIUM = {
  bg: "#070A12",
  surface: "#0E1220",
  card: "#111827",
  border: "rgba(255,255,255,0.08)",
  muted: "#9CA3AF",
  text: "#F9FAFB",
  purple: "#8B5CF6",
  cyan: "#22D3EE",
  success: "#22C55E",
  warning: "#F59E0B",
  error: "#EF4444",
} as const;

export const PREMIUM_CLASSES = {
  page: "bg-[#070A12] text-[#F9FAFB] antialiased",
  glass:
    "rounded-2xl border border-white/[0.08] bg-[#0E1220]/80 backdrop-blur-xl",
  glassCard:
    "rounded-2xl border border-white/[0.08] bg-[#111827]/90 backdrop-blur-xl",
  gradientBorder:
    "relative before:pointer-events-none before:absolute before:-inset-px before:rounded-2xl before:bg-gradient-to-br before:from-[#8B5CF6]/50 before:via-transparent before:to-[#22D3EE]/40 before:opacity-0 before:transition-opacity hover:before:opacity-100",
  gradientBorderActive:
    "relative before:pointer-events-none before:absolute before:-inset-px before:rounded-2xl before:bg-gradient-to-br before:from-[#8B5CF6]/70 before:via-[#8B5CF6]/20 before:to-[#22D3EE]/50 before:opacity-100",
  glowPurple: "shadow-[0_0_40px_rgba(139,92,246,0.15)]",
  glowCyan: "shadow-[0_0_40px_rgba(34,211,238,0.12)]",
  /** Same 1px border always — selection via ring/shadow only */
  cardBase:
    "border border-white/[0.08] transition-[box-shadow,transform,opacity] duration-200",
  cardSelected:
    "ring-2 ring-amber-500/45 shadow-[0_0_28px_rgba(245,158,11,0.18)]",
  cardHoverLift:
    "hover:-translate-y-0.5 hover:ring-1 hover:ring-amber-500/30 hover:shadow-[0_0_18px_rgba(245,158,11,0.12)]",
  /** Hero primary action — Social Asset Pack */
  primaryHeroCard:
    "border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.09] via-[#111827]/95 to-[#0E1220]/90 shadow-[0_0_40px_rgba(245,158,11,0.08)]",
  primaryHeroSelected:
    "ring-2 ring-amber-500/55 shadow-[0_0_36px_rgba(245,158,11,0.22)]",
  chipActive:
    "border border-white/[0.08] bg-[#8B5CF6]/10 text-white ring-2 ring-[#8B5CF6]/45 shadow-[0_0_20px_rgba(139,92,246,0.15)]",
  chipIdle:
    "border border-white/[0.08] bg-[#111827]/60 text-neutral-300 hover:text-white hover:-translate-y-px hover:ring-1 hover:ring-[#8B5CF6]/25 hover:shadow-[0_0_14px_rgba(139,92,246,0.1)] outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070A12]",
  mono: "font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-400",
} as const;

/** Landing page vertical rhythm — tighter desktop gaps, readable mobile */
export const LANDING_LAYOUT = {
  section: "py-10 sm:py-12 lg:py-14",
  sectionCompact: "py-9 sm:py-10 lg:py-12",
  afterHeader: "mt-7 sm:mt-8",
  afterHeaderLg: "mt-8 sm:mt-9",
  grid: "gap-6 lg:gap-8",
  gridWide: "gap-7 lg:gap-9",
  heroWrap: "py-14 sm:py-16 lg:py-20",
  heroGrid: "gap-8 lg:gap-10",
} as const;

export const PREMIUM_SPRING = {
  type: "spring" as const,
  stiffness: 260,
  damping: 28,
};

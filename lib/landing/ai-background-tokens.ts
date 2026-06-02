/**
 * Landing AI background field — Hyper-Kinetic Obsidian palette.
 * Import only from landing components (not dashboard).
 */

/** Fixed backdrop shell — never affects document flow */
export const AI_BG_FIELD_ROOT =
  "pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#050505]";

/** Edge darkening — keeps body copy readable over glows */
export const AI_BG_READABILITY_VIGNETTE =
  "absolute inset-0 bg-[radial-gradient(ellipse_88%_72%_at_50%_40%,transparent_0%,rgba(5,5,5,0.62)_68%,#050505_100%)]";

/** Slow amber radial — hero CTA / primary stage (transform + opacity only) */
export const AI_BG_AMBER_PRIMARY =
  "absolute left-[18%] top-[22%] h-[min(52vw,28rem)] w-[min(52vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.14)_0%,rgba(245,158,11,0.04)_42%,transparent_68%)] blur-2xl";

export const AI_BG_AMBER_SECONDARY =
  "absolute left-[62%] top-[38%] h-[min(44vw,22rem)] w-[min(44vw,22rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.09)_0%,transparent_62%)] blur-3xl";

/** Purple / indigo aurora blobs */
export const AI_BG_AURORA_A =
  "absolute -left-[12%] top-[8%] h-[55vh] w-[55vw] max-h-[32rem] max-w-[32rem] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.16)_0%,rgba(79,70,229,0.06)_45%,transparent_70%)] blur-3xl";

export const AI_BG_AURORA_B =
  "absolute -right-[8%] top-[32%] h-[48vh] w-[48vw] max-h-[28rem] max-w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.12)_0%,rgba(139,92,246,0.05)_50%,transparent_72%)] blur-3xl";

export const AI_BG_AURORA_C =
  "absolute bottom-[18%] left-[28%] h-[40vh] w-[40vw] max-h-96 max-w-md rounded-full bg-[radial-gradient(circle,rgba(67,56,202,0.1)_0%,transparent_65%)] blur-3xl";

/** Subtle cyan data-flow accent */
export const AI_BG_CYAN_FLOW =
  "absolute inset-0 bg-[linear-gradient(105deg,transparent_0%,transparent_38%,rgba(34,211,238,0.04)_48%,rgba(34,211,238,0.07)_50%,rgba(34,211,238,0.03)_52%,transparent_62%,transparent_100%)]";

export const AI_BG_CYAN_NODE =
  "absolute right-[12%] bottom-[28%] h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.08)_0%,transparent_70%)] blur-2xl";

/** Fine grain — SVG data URL applied via style in component */
export const AI_BG_GRAIN_LAYER =
  "absolute inset-0 opacity-[0.045] mix-blend-overlay";

/** Faint grid */
export const AI_BG_GRID_LAYER =
  "absolute inset-0 opacity-[0.028] [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:64px_64px]";

/** Optional scanlines */
export const AI_BG_SCANLINE_LAYER =
  "absolute inset-0 opacity-[0.022] [background-image:repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.03)_2px,rgba(255,255,255,0.03)_3px)]";

/** Motion-enabled layer classes (paired with ai-background-field.css) */
export const AI_BG_MOTION = {
  amberPrimary: "ai-bg-amber-primary",
  amberSecondary: "ai-bg-amber-secondary",
  auroraA: "ai-bg-aurora-a",
  auroraB: "ai-bg-aurora-b",
  auroraC: "ai-bg-aurora-c",
  cyanFlow: "ai-bg-cyan-flow",
  cyanNode: "ai-bg-cyan-node",
} as const;

/** Inline SVG noise — no external asset */
export const AI_BG_GRAIN_DATA_URL = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`;

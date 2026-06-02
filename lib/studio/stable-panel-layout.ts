/**
 * Stable studio / agent window layout — fixed outer size, motion inside only.
 * Do not animate height, margin, or top on these shells.
 */

export const AGENT_STUDIO_WINDOW_HEIGHT_PX = 560;

/** Dashboard pack agent window (workflow header + scroll body). */
export const AGENT_STUDIO_WINDOW_CLASS =
  "mt-4 flex h-[560px] max-h-[560px] min-h-[560px] flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-[#0A0F1A]/90";

export const AGENT_STUDIO_SCROLL_CLASS =
  "min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] p-3 sm:p-4";

export const PACK_STATUS_BANNER_SLOT_CLASS =
  "flex min-h-[3rem] shrink-0 items-stretch border-b border-white/[0.06] px-3 py-2 sm:px-4";

/** Showcase embedded in agent scroll region — fills available height, scrolls internally. */
export const SHOWCASE_EMBEDDED_CLASS =
  "relative isolate flex h-full min-h-[320px] w-full min-w-0 flex-col overflow-hidden rounded-xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-2xl";

export const SHOWCASE_EMBEDDED_SCROLL_CLASS =
  "min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-3 pb-3 pt-2 sm:px-5 sm:pb-5 sm:pt-3";

/** Landing / hero showcase — fixed outer min-height, capped max, internal scroll. */
export const SHOWCASE_LANDING_CLASS =
  "relative isolate flex max-h-[min(85vh,720px)] min-h-[520px] w-full min-w-0 max-w-full flex-col overflow-hidden rounded-2xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-2xl";

export const SHOWCASE_LANDING_SCROLL_CLASS =
  "min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain p-3 sm:p-5";

/** Product theatre — dominant pack proof column */
export const SHOWCASE_THEATRE_CLASS =
  "relative isolate flex max-h-[min(88vh,760px)] min-h-[540px] w-full min-w-0 max-w-full flex-col overflow-hidden rounded-2xl border border-amber-500/20 bg-neutral-900/40 shadow-[0_0_60px_rgba(245,158,11,0.12)] backdrop-blur-2xl ring-1 ring-amber-500/10";

export const MOTION_SAFE_CLASS =
  "transform-gpu will-change-[opacity,transform] [backface-visibility:hidden]";

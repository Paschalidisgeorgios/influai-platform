/**
 * Context action bar — stable layout, Lava-Amber live, glass secondary, muted locked.
 */

/** Outer section — height owned by STUDIO_CONTEXT_ACTION_SLOT parent */
export const CONTEXT_ACTION_BAR =
  "flex h-full min-h-0 flex-col overflow-hidden border-b border-white/[0.06] bg-[#070A12]/85 px-3 py-2 backdrop-blur-md sm:px-5 sm:py-3";

export const CONTEXT_ACTION_HEADER =
  "mb-1.5 flex min-h-[2.5rem] shrink-0 items-end justify-between gap-2 md:mb-2 md:min-h-[3.25rem]";

export const CONTEXT_ACTION_HEADER_COPY =
  "min-w-0 flex-1";

export const CONTEXT_ACTION_DESCRIPTION =
  "mt-0.5 line-clamp-1 max-w-2xl text-xs leading-relaxed text-neutral-500 md:line-clamp-2";

/** Tool grid viewport — scroll when rows exceed 2 (lg) or 3 (sm) */
export const CONTEXT_ACTION_TOOLS_VIEWPORT =
  "relative min-h-0 flex-1 overflow-hidden";

/** Mobile: horizontal chip strip; md+: vertical grid scroll */
export const CONTEXT_ACTION_TOOLS_LAYER =
  "absolute inset-0 overflow-x-auto overflow-y-hidden overscroll-x-contain [-webkit-overflow-scrolling:touch] md:overflow-x-hidden md:overflow-y-auto";

export const CONTEXT_ACTION_GRID =
  "flex w-max min-w-full snap-x snap-proximity gap-2 pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] md:grid md:w-full md:snap-none md:grid-cols-2 md:gap-2 md:pb-0 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden";

export const CONTEXT_ACTION_LIST_ITEM =
  "shrink-0 snap-start md:shrink md:snap-align-none";

/** Shared 1px border — selection uses ring/shadow only */
export const CONTEXT_ACTION_BUTTON_BASE = [
  "group relative w-[11rem] shrink-0 overflow-hidden rounded-xl text-left",
  "border border-neutral-800/80",
  "transition-[box-shadow,background-color,color,opacity] duration-200 ease-out",
  "min-h-[4rem] p-2.5 md:w-full md:shrink md:min-h-[4.25rem] md:p-3",
].join(" ");

export const CONTEXT_ACTION_SCROLL_FADE =
  "pointer-events-none absolute inset-y-0 right-0 z-[1] w-8 bg-gradient-to-l from-[#070A12] to-transparent md:hidden";

export const CONTEXT_ACTION_BUTTON_LIVE = [
  "cursor-pointer bg-gradient-to-br from-amber-500/[0.11] via-neutral-900/50 to-neutral-900/40",
  "text-amber-50",
  "shadow-[0_0_24px_rgba(245,158,11,0.14)]",
  "hover:shadow-[0_0_32px_rgba(245,158,11,0.2)]",
  "ring-1 ring-amber-500/35",
].join(" ");

export const CONTEXT_ACTION_BUTTON_LIVE_SELECTED = [
  "ring-2 ring-amber-500/55",
  "shadow-[0_0_36px_rgba(245,158,11,0.22)]",
].join(" ");

export const CONTEXT_ACTION_BUTTON_GLASS = [
  "cursor-pointer bg-neutral-900/40 backdrop-blur-2xl text-neutral-100",
  "hover:border-amber-500/28 hover:bg-neutral-900/55 hover:shadow-[0_0_18px_rgba(245,158,11,0.06)]",
].join(" ");

export const CONTEXT_ACTION_BUTTON_MUTED = [
  "cursor-not-allowed bg-neutral-900/25 text-neutral-500",
  "opacity-[0.42] saturate-[0.55]",
].join(" ");

export const CONTEXT_ACTION_ICON_LIVE =
  "border-amber-500/40 bg-amber-500/12 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.15)]";

export const CONTEXT_ACTION_ICON_GLASS =
  "border-neutral-800/80 bg-[#0a0a0a]/70 text-neutral-400 group-hover:text-neutral-200";

export const CONTEXT_ACTION_ICON_MUTED =
  "border-neutral-800/60 bg-[#0a0a0a]/50 text-neutral-600";

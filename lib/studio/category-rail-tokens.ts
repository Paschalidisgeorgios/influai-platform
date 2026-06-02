/**
 * Category rail — Hyper-Kinetic Obsidian (stable dimensions, no layout shift).
 */

/** Shell — fixed width on desktop, full-width strip on mobile */
export const CATEGORY_RAIL_SHELL =
  "flex w-full shrink-0 flex-col overflow-x-hidden border-b border-neutral-800/80 bg-[#050505] md:h-full md:w-[11.75rem] md:min-h-0 md:border-b-0 md:border-r";

export const CATEGORY_RAIL_HEADER =
  "hidden px-4 pb-2 pt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 md:block";

export const CATEGORY_RAIL_HEADER_MOBILE =
  "px-3 pb-1 pt-2 text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-500 md:hidden";

export const CATEGORY_RAIL_LIST =
  "flex snap-x snap-proximity gap-1.5 overflow-x-auto overscroll-x-contain px-2 py-2 [-ms-overflow-style:none] [scrollbar-width:none] md:snap-none md:flex-col md:gap-1 md:overflow-visible md:px-2 md:py-3 md:pb-4 [&::-webkit-scrollbar]:hidden";

/** Item — 1px border always; active/hover change shadow/opacity only */
export const CATEGORY_RAIL_ITEM_BASE = [
  "group relative flex min-h-[44px] min-w-[6.75rem] shrink-0 snap-start items-center gap-2 rounded-xl",
  "border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-2xl",
  "px-2.5 py-2 text-left",
  "transition-[box-shadow,background-color,color,opacity] duration-200 ease-out",
  "md:min-w-0 md:w-full",
].join(" ");

export const CATEGORY_RAIL_ITEM_INACTIVE = [
  "text-neutral-400 opacity-90",
  "hover:bg-neutral-900/55 hover:text-neutral-200 hover:opacity-100",
  "hover:shadow-[0_0_20px_rgba(245,158,11,0.07)]",
].join(" ");

export const CATEGORY_RAIL_ITEM_ACTIVE = [
  "border-amber-500/50 bg-amber-500/[0.09] text-amber-50 opacity-100",
  "shadow-[0_0_28px_rgba(245,158,11,0.16),inset_3px_0_0_0_rgba(245,158,11,0.92)]",
].join(" ");

export const CATEGORY_RAIL_LAVA_BAR =
  "pointer-events-none absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-amber-500 opacity-0 shadow-[0_0_12px_rgba(245,158,11,0.65)] transition-opacity duration-200 group-aria-[current=true]:opacity-100 md:bottom-2.5 md:top-2.5";

export const CATEGORY_RAIL_ICON =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-800/80 bg-[#0a0a0a]/70 text-neutral-500 transition-[box-shadow,color,background-color,border-color] duration-200";

export const CATEGORY_RAIL_ICON_ACTIVE =
  "border-amber-500/45 bg-amber-500/12 text-amber-400 shadow-[0_0_14px_rgba(245,158,11,0.2)]";

export const CATEGORY_RAIL_LABEL = "truncate text-xs font-semibold leading-tight";

export const CATEGORY_RAIL_META =
  "hidden truncate text-[10px] font-medium text-neutral-500 md:block";

export const CATEGORY_RAIL_META_ACTIVE = "text-amber-500/55";

import {
  normalizePublicToolStatus,
  type PublicToolStatus,
  type ToolStatus,
} from "@/app/lib/tools/tool-status";
import { OBS_BTN } from "@/lib/obsidian/button-tokens";

/** Shared pill chrome for tool / workflow status chips */
export const STATUS_BADGE_PILL_BASE =
  "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider";

const DASHBOARD_STATUS_BADGE: Record<PublicToolStatus, string> = {
  live: OBS_BTN.badgeLiveColors,
  preview: OBS_BTN.badgePreviewColors,
  request_access:
    "border-white/[0.12] bg-[#111827]/80 text-neutral-300 ring-1 ring-amber-500/18",
  coming_soon: OBS_BTN.badgeLockedColors,
  pro_locked: "border-[#8B5CF6]/35 bg-[#8B5CF6]/10 text-[#C4B5FD]",
  disabled: OBS_BTN.badgeLockedColors,
  blocked: OBS_BTN.badgePreparingColors,
};

/**
 * Category dashboard status pills — Live, Preview, Zugang anfragen, Demnächst, Pro-Workflow, Wird vorbereitet.
 * Lava-Amber = live; green is reserved for success states elsewhere.
 */
export function studioDashboardStatusBadgeClass(
  publicStatus: PublicToolStatus
): string {
  return `${STATUS_BADGE_PILL_BASE} ${DASHBOARD_STATUS_BADGE[publicStatus]}`;
}

/** Full class string for legacy `ToolStatus` call sites */
export function studioToolStatusBadgeClass(status: ToolStatus): string {
  return studioDashboardStatusBadgeClass(normalizePublicToolStatus(status));
}

/** Runnable / live workflow badge */
export function studioToolReadyBadgeClass(): string {
  return studioDashboardStatusBadgeClass("live");
}

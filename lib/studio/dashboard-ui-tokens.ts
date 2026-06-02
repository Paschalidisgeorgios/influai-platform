/**
 * InfluExAI category dashboard — premium buttons & status pills.
 * @see lib/obsidian/button-tokens (5 CTA variants)
 * @see lib/obsidian/status-badge-classes (workflow status chips)
 */

export {
  OBS_BTN,
  obsidianButtonClass,
  type ObsidianButtonSize,
  type ObsidianButtonSurface,
  type ObsidianButtonVariant,
} from "@/lib/obsidian/button-tokens";

export {
  STATUS_BADGE_PILL_BASE,
  studioDashboardStatusBadgeClass,
  studioToolReadyBadgeClass,
  studioToolStatusBadgeClass,
} from "@/lib/obsidian/status-badge-classes";

import { obsidianButtonClass } from "@/lib/obsidian/button-tokens";

/** Map tool-detail CTA variant → Obsidian button system */
export function dashboardCtaButtonClass(
  variant: "primary" | "secondary" | "preview" | "ghost" | "success",
  options?: { size?: "sm" | "md" | "lg"; className?: string }
): string {
  return obsidianButtonClass(variant, {
    size: options?.size ?? "md",
    className: options?.className,
  });
}

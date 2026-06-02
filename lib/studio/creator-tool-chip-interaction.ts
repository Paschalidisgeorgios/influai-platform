import { isToolDetailPanelStatus } from "@/app/lib/tools/creator-tools";
import type { ResolvedCreatorTool } from "@/app/lib/tools/resolve-tool";
import type { PublicToolStatus } from "@/app/lib/tools/tool-status";

export type CreatorToolChipView = {
  canRun: boolean;
  status: PublicToolStatus;
  resolved: ResolvedCreatorTool;
};

/** Glass = visible non-live (preview, request access, coming soon, blocked). */
export type CreatorToolChipVisualVariant = "live" | "glass" | "muted";

export function resolveCreatorToolChipVisualVariant(
  view: CreatorToolChipView
): CreatorToolChipVisualVariant {
  if (view.status === "disabled" || view.resolved.status === "disabled") {
    return "muted";
  }
  if (view.canRun && view.status === "live") {
    return "live";
  }
  return "glass";
}

/** Live tools run workflows; non-live tools open ToolDetailPanel. */
export function isCreatorToolChipInteractive(
  view: CreatorToolChipView
): boolean {
  if (view.status === "disabled" || view.resolved.status === "disabled") {
    return false;
  }
  if (view.canRun) return true;
  return view.resolved.canShowToUser;
}

export function shouldRouteCreatorToolToDetailPanel(
  resolved: ResolvedCreatorTool
): boolean {
  return resolved.canShowToUser && !resolved.canRun;
}

export function isCreatorToolDetailPanelStatus(
  resolved: ResolvedCreatorTool
): boolean {
  return isToolDetailPanelStatus(resolved.status);
}

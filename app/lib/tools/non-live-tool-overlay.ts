/**
 * Non-live creator tools — detail overlay routing (no generation).
 */

import type { ResolvedCreatorTool } from "./resolve-tool";

/** Open the informational detail overlay instead of generator or navigation. */
export function shouldOpenNonLiveToolDetailOverlay(
  resolved: ResolvedCreatorTool
): boolean {
  return resolved.canShowToUser && !resolved.canRun;
}

export { shouldRouteCreatorToolToDetailPanel } from "@/lib/studio/creator-tool-chip-interaction";

/**
 * Launch module / feature gates for creator tools — UI + route safety only.
 */

import {
  isLaunchFeatureEnabled,
  isLaunchModuleEnabled,
} from "@/app/lib/config/launch";
import type { CreatorToolDefinition } from "./creator-tools";

export function isCreatorToolLaunchGateOpen(
  tool: CreatorToolDefinition
): boolean {
  if (tool.launchFeature && !isLaunchFeatureEnabled(tool.launchFeature)) {
    return false;
  }
  if (tool.launchModule && !isLaunchModuleEnabled(tool.launchModule)) {
    return false;
  }
  return true;
}

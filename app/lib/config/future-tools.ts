/**
 * Locked / coming-soon tools — metadata only (no generation, no credit charge).
 * User UI shows labels and Coming soon; never provider or model IDs.
 */

export const LOCKED_FUTURE_TOOL_ACTION_IDS = [
  "animate_image",
  "lipsync_creator",
  "ai_avatar",
  "enhance_asset",
  "background_remove",
  "upscale_image",
  "object_3d",
  "motion_transfer",
  "audio_sound_design",
] as const;

export type LockedFutureToolActionId =
  (typeof LOCKED_FUTURE_TOOL_ACTION_IDS)[number];

export const LOCKED_FUTURE_TOOL_MODE_IDS = [
  "animate_image",
  "lipsync_creator",
  "ai_avatar",
  "enhance_asset",
  "background_remove",
  "upscale_image",
  "object_3d",
  "motion_transfer",
  "audio_sound_design",
] as const;

export type LockedFutureToolModeId =
  (typeof LOCKED_FUTURE_TOOL_MODE_IDS)[number];

const FUTURE_TOOL_ACTION_SET = new Set<string>(LOCKED_FUTURE_TOOL_ACTION_IDS);
const FUTURE_TOOL_MODE_SET = new Set<string>(LOCKED_FUTURE_TOOL_MODE_IDS);

export function isLockedFutureToolAction(actionId: string): boolean {
  return FUTURE_TOOL_ACTION_SET.has(actionId.trim());
}

export function isLockedFutureToolMode(modeId: string): boolean {
  return FUTURE_TOOL_MODE_SET.has(modeId.trim());
}

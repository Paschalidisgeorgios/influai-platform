/**
 * InfluExAi platform architecture: Krea-only active generation.
 */

import type { ActiveTool } from "@/lib/dashboard/creative-tool-matrix";

/** Tools with real Krea generate flows in the new dashboard. */
export const KREA_PLATFORM_ACTIVE_TOOLS = new Set<ActiveTool>([
  "image",
  "video",
  "enhancer",
  "realtime",
  "edit",
  "3d_objects",
  "video_restyle",
  "product_photography",
  "brand_assets",
]);

/** Archived — no sidebar entry, API rejects generation. */
export const KREA_PLATFORM_ARCHIVED_TOOLS = new Set<ActiveTool>([
  "lipsync",
  "motion_transfer",
  "audio",
  "apps",
  "campaign_builder",
  "style_profiles",
  "batch_generator",
  "moodboards",
  "train_lora",
  "node_editor",
]);

/** Workflows processed exclusively via krea-worker. */
export const KREA_PLATFORM_WORKFLOWS = new Set([
  "standard",
  "fast_draft",
  "ugc_look",
  "premium_image",
  "brand_assets",
  "reference_edit",
  "enhance_asset",
  "video_image_to_video",
  "krea_premium_image",
]);

/** Legacy generate modes blocked at API boundary. */
export const KREA_PLATFORM_BLOCKED_IMAGE_MODES = new Set([
  "lip_sync",
  "talking_creator",
  "creator_video",
]);

export function isKreaOnlyPlatform(): boolean {
  return process.env.INFLUEXAI_KREA_ONLY !== "false";
}

export function isKreaPlatformToolEnabled(key: ActiveTool): boolean {
  if (!key) return true;
  if (!isKreaOnlyPlatform()) return true;
  return KREA_PLATFORM_ACTIVE_TOOLS.has(key);
}

export function isKreaPlatformWorkflowEnabled(workflow: string): boolean {
  if (!isKreaOnlyPlatform()) return true;
  const normalized = workflow.trim().toLowerCase();
  if (KREA_PLATFORM_BLOCKED_IMAGE_MODES.has(normalized)) return false;
  if (normalized === "live_avatar" || normalized === "lip_sync") return false;
  if (normalized === "talking_creator" || normalized === "creator_video") {
    return false;
  }
  return KREA_PLATFORM_WORKFLOWS.has(normalized);
}

export function isLegacyProviderEnabled(): boolean {
  return false;
}

export function isLegacyOpenAiEnabled(): boolean {
  return false;
}

export function isLegacyFalLipSyncEnabled(): boolean {
  return false;
}

export function isLegacyFalMotionEnabled(): boolean {
  return false;
}

export function resolveKreaOnlyProcessProvider(
  workflow: string,
  _currentProvider: string
): "krea" | "blocked" {
  if (!isKreaPlatformWorkflowEnabled(workflow)) return "blocked";
  return "krea";
}

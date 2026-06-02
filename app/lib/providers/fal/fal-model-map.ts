/**
 * fal.ai endpoint + legacy registry mapping — server-side only.
 */

import { getFalStudioEngineById } from "@/app/lib/engines/fal-catalog";

export type FalModelMapEntry = {
  studioEngineId: string;
  /** Legacy lib/ai/fal-model-registry id when a runtime adapter exists */
  legacyRegistryId: string | null;
  /** fal.ai endpoint path — never expose to clients */
  endpoint: string | null;
  group: string;
};

/** Studio catalog id → runtime mapping */
export const FAL_MODEL_MAP: Record<string, FalModelMapEntry> = {
  fal_kling_v3_t2v: {
    studioEngineId: "fal_kling_v3_t2v",
    legacyRegistryId: "fal_kling_v3_t2v",
    endpoint: "fal-ai/kling-video/v3/pro/text-to-video",
    group: "video_text_to_video",
  },
  fal_kling_v3_i2v: {
    studioEngineId: "fal_kling_v3_i2v",
    legacyRegistryId: "fal_kling_v3_i2v",
    endpoint: "fal-ai/kling-video/v3/pro/image-to-video",
    group: "video_image_to_video",
  },
  fal_lipsync_sync_v2_pro: {
    studioEngineId: "fal_lipsync_sync_v2_pro",
    legacyRegistryId: "fal_sync_lipsync_v2",
    endpoint: "fal-ai/sync-lipsync/v2/pro",
    group: "lipsync",
  },
  fal_avatar_single_text: {
    studioEngineId: "fal_avatar_single_text",
    legacyRegistryId: "fal_ai_avatar",
    endpoint: "fal-ai/ai-avatar/single-text",
    group: "avatar",
  },
  fal_motion_transfer: {
    studioEngineId: "fal_motion_transfer",
    legacyRegistryId: "fal_kling_v3_motion_control",
    endpoint: "fal-ai/kling-video/v3/standard/motion-control",
    group: "motion",
  },
  fal_background_removal: {
    studioEngineId: "fal_background_removal",
    legacyRegistryId: null,
    endpoint: "fal-ai/bria/background/remove",
    group: "enhancer",
  },
  fal_image_upscale: {
    studioEngineId: "fal_image_upscale",
    legacyRegistryId: "fal_topaz_image_upscale",
    endpoint: "fal-ai/topaz/upscale/image",
    group: "enhancer",
  },
  fal_reference_edit: {
    studioEngineId: "fal_reference_edit",
    legacyRegistryId: null,
    endpoint: null,
    group: "edit",
  },
  fal_style_transfer: {
    studioEngineId: "fal_style_transfer",
    legacyRegistryId: null,
    endpoint: null,
    group: "edit",
  },
  fal_lora_training: {
    studioEngineId: "fal_lora_training",
    legacyRegistryId: null,
    endpoint: null,
    group: "training",
  },
  fal_object_3d: {
    studioEngineId: "fal_object_3d",
    legacyRegistryId: "fal_object_3d",
    endpoint: null,
    group: "three_d",
  },
  fal_flux_schnell_image: {
    studioEngineId: "fal_flux_schnell_image",
    legacyRegistryId: "fal_flux_schnell",
    endpoint: "fal-ai/flux/schnell",
    group: "image",
  },
};

const LEGACY_TO_STUDIO: Record<string, string> = Object.fromEntries(
  Object.values(FAL_MODEL_MAP)
    .filter((entry) => entry.legacyRegistryId)
    .map((entry) => [entry.legacyRegistryId!, entry.studioEngineId])
);

/** Legacy launch registry ids → studio catalog ids */
export const LEGACY_LAUNCH_ENGINE_TO_STUDIO: Record<string, string> = {
  fal_lipsync: "fal_lipsync_sync_v2_pro",
  fal_avatar: "fal_avatar_single_text",
  fal_enhancer: "fal_image_upscale",
  fal_3d: "fal_object_3d",
  fal_training: "fal_lora_training",
  fal_edit: "fal_reference_edit",
};

export function resolveFalStudioEngineId(rawId: string): string {
  const trimmed = rawId.trim();
  if (FAL_MODEL_MAP[trimmed]) return trimmed;
  if (LEGACY_LAUNCH_ENGINE_TO_STUDIO[trimmed]) {
    return LEGACY_LAUNCH_ENGINE_TO_STUDIO[trimmed];
  }
  return LEGACY_TO_STUDIO[trimmed] ?? trimmed;
}

export function getFalModelMapEntry(studioEngineId: string): FalModelMapEntry | null {
  return FAL_MODEL_MAP[studioEngineId.trim()] ?? null;
}

export function getLegacyRegistryIdForFalStudio(studioEngineId: string): string | null {
  const catalog = getFalStudioEngineById(studioEngineId);
  if (catalog?.falRegistryId) return catalog.falRegistryId;
  return getFalModelMapEntry(studioEngineId)?.legacyRegistryId ?? null;
}

export function getFalEndpointForStudio(studioEngineId: string): string | null {
  const catalog = getFalStudioEngineById(studioEngineId);
  if (catalog?.model) return catalog.model;
  return getFalModelMapEntry(studioEngineId)?.endpoint ?? null;
}

/**
 * fal.ai Studio Catalog — expansion provider mapping layer.
 * Server-side only. Never expose FAL_KEY or raw endpoint IDs to clients.
 */

import type {
  EngineStatus,
  EngineValidationMeta,
  EngineValidationStatus,
  FalStudioCatalogEntry,
} from "./types";

function accessFlags(status: EngineStatus): Pick<
  EngineValidationMeta,
  "canShowToUser" | "canRunGeneration"
> {
  if (status === "active") {
    return { canShowToUser: true, canRunGeneration: true };
  }
  return { canShowToUser: false, canRunGeneration: false };
}

function falEntry(
  entry: Omit<
    FalStudioCatalogEntry,
    "provider" | "validation" | "canShowToUser" | "canRunGeneration" | "userFacing"
  > & {
    validationStatus: EngineValidationStatus;
    validationReason?: string;
    lastValidatedAt?: string;
  }
): FalStudioCatalogEntry {
  const access = accessFlags(entry.status);
  const validation: EngineValidationMeta = {
    validationStatus: entry.validationStatus,
    validationReason: entry.validationReason,
    lastValidatedAt: entry.lastValidatedAt,
    ...access,
  };
  return {
    ...entry,
    provider: "fal",
    model: entry.model ?? null,
    requiresServerEnv: entry.requiresServerEnv ?? ["FAL_KEY"],
    validation,
    canShowToUser: access.canShowToUser,
    canRunGeneration: access.canRunGeneration,
    userFacing: access.canShowToUser,
  };
}

export const FAL_STUDIO_CATALOG: readonly FalStudioCatalogEntry[] = [
  falEntry({
    id: "fal_kling_v3_t2v",
    label: "Social Video",
    group: "video_text_to_video",
    outputType: "video",
    status: "active",
    credits: 25,
    model: "fal-ai/kling-video/v3/pro/text-to-video",
    falRegistryId: "fal_kling_v3_t2v",
    replacesKreaRegistryIds: ["kling-3", "kling-26", "kling-25"],
    validationStatus: "passed",
    validationReason: "Live test passed",
    lastValidatedAt: "2026-05-31T00:00:00.000Z",
  }),
  falEntry({
    id: "fal_kling_v3_i2v",
    label: "Image to Video",
    group: "video_image_to_video",
    outputType: "video",
    status: "validation_blocked_insufficient_balance",
    credits: 25,
    model: "fal-ai/kling-video/v3/pro/image-to-video",
    falRegistryId: "fal_kling_v3_i2v",
    unavailableReason:
      "Balance exhausted during validation — not a technical model failure.",
    validationStatus: "blocked",
    validationReason:
      "Balance exhausted during validation, not a technical model failure.",
    lastValidatedAt: "2026-05-31T00:00:00.000Z",
  }),
  falEntry({
    id: "fal_lipsync_sync_v2_pro",
    label: "Lip Sync",
    group: "lipsync",
    outputType: "video",
    status: "mapped_but_unvalidated",
    credits: 30,
    model: "fal-ai/sync-lipsync/v2/pro",
    falRegistryId: "fal_sync_lipsync_v2",
    note: "Awaiting validation fixtures (audio + video URLs).",
    validationStatus: "not_tested",
    validationReason: "Missing validation fixtures",
  }),
  falEntry({
    id: "fal_avatar_single_text",
    label: "AI Avatar",
    group: "avatar",
    outputType: "video",
    status: "mapped_but_unvalidated",
    credits: 40,
    model: "fal-ai/ai-avatar/single-text",
    note: "Mapped — validate before activation.",
    validationStatus: "not_tested",
  }),
  falEntry({
    id: "fal_motion_transfer",
    label: "Motion Transfer",
    group: "motion",
    outputType: "video",
    status: "mapped_but_unvalidated",
    credits: 30,
    model: "fal-ai/kling-video/v3/standard/motion-control",
    falRegistryId: "fal_kling_v3_motion_control",
    note: "Prior validation returned 422 — re-test before activation.",
    validationStatus: "failed",
    validationReason: "Schema validation failed during prior test (422).",
    lastValidatedAt: "2026-05-31T00:00:00.000Z",
  }),
  falEntry({
    id: "fal_background_removal",
    label: "Background Removal",
    group: "enhancer",
    outputType: "image",
    status: "mapped_but_unvalidated",
    credits: 1,
    model: "fal-ai/bria/background/remove",
    note: "Candidate endpoint — validate before activation.",
    validationStatus: "not_tested",
  }),
  falEntry({
    id: "fal_image_upscale",
    label: "Image Upscale",
    group: "enhancer",
    outputType: "image",
    status: "mapped_but_unvalidated",
    credits: 3,
    model: "fal-ai/topaz/upscale/image",
    falRegistryId: "fal_topaz_image_upscale",
    note: "Live test passed in legacy registry — pending studio catalog promotion.",
    validationStatus: "passed",
    validationReason: "Legacy admin validation passed — not promoted to active MVP.",
    lastValidatedAt: "2026-05-31T00:00:00.000Z",
  }),
  falEntry({
    id: "fal_reference_edit",
    label: "Reference Edit",
    group: "edit",
    outputType: "image",
    status: "mapped_but_unvalidated",
    credits: 5,
    model: null,
    note: "Model ID must be validated before activation.",
    validationStatus: "not_tested",
  }),
  falEntry({
    id: "fal_style_transfer",
    label: "Style Transfer",
    group: "edit",
    outputType: "image",
    status: "mapped_but_unvalidated",
    credits: 3,
    model: null,
    note: "Model ID must be validated before activation.",
    validationStatus: "not_tested",
  }),
  falEntry({
    id: "fal_lora_training",
    label: "LoRA Training",
    group: "training",
    outputType: "model",
    status: "mapped_but_unvalidated",
    credits: 100,
    model: null,
    note: "Model ID must be validated before activation.",
    validationStatus: "not_tested",
  }),
  falEntry({
    id: "fal_object_3d",
    label: "3D Object",
    group: "three_d",
    outputType: "three_d",
    status: "mapped_but_unvalidated",
    credits: 30,
    model: null,
    note: "Model ID must be validated before activation.",
    validationStatus: "not_tested",
  }),
  falEntry({
    id: "fal_flux_schnell_image",
    label: "Fast Draft Image",
    group: "image",
    outputType: "image",
    status: "mapped_but_unvalidated",
    credits: 1,
    model: "fal-ai/flux/schnell",
    falRegistryId: "fal_flux_schnell",
    note: "Krea image engines remain primary — fal backup not active in MVP.",
    validationStatus: "passed",
    validationReason: "Legacy validation passed — not active while Krea image is primary.",
    lastValidatedAt: "2026-05-31T00:00:00.000Z",
  }),
  falEntry({
    id: "fal_realtime_placeholder",
    label: "Realtime Generation",
    group: "realtime",
    outputType: "image",
    status: "mapped_but_unvalidated",
    credits: 1,
    model: null,
    note: "Model ID must be validated before activation.",
    validationStatus: "not_tested",
  }),
  falEntry({
    id: "fal_audio_placeholder",
    label: "Audio Generation",
    group: "audio",
    outputType: "audio",
    status: "mapped_but_unvalidated",
    credits: 5,
    model: null,
    note: "Model ID must be validated before activation.",
    validationStatus: "not_tested",
  }),
  falEntry({
    id: "fal_utility_placeholder",
    label: "Utility Pipeline",
    group: "utility",
    outputType: "text",
    status: "mapped_but_unvalidated",
    credits: 0,
    model: null,
    note: "Model ID must be validated before activation.",
    validationStatus: "not_tested",
  }),
] as const;

const FAL_BY_ID = new Map<string, FalStudioCatalogEntry>(
  FAL_STUDIO_CATALOG.map((entry) => [entry.id, entry])
);

export function getFalStudioEngineById(id: string): FalStudioCatalogEntry | null {
  return FAL_BY_ID.get(id.trim()) ?? null;
}

export function getAllFalStudioEngines(): readonly FalStudioCatalogEntry[] {
  return FAL_STUDIO_CATALOG;
}

export function getActiveFalStudioEngines(): FalStudioCatalogEntry[] {
  return FAL_STUDIO_CATALOG.filter(
    (entry) => entry.status === "active" && entry.canRunGeneration
  );
}

export function getUserFacingFalStudioEngines(): FalStudioCatalogEntry[] {
  return FAL_STUDIO_CATALOG.filter((entry) => entry.canShowToUser);
}

/** Only fal_kling_v3_t2v has a working generation handler in MVP. */
export const FAL_MVP_GENERATION_HANDLERS = new Set<string>(["fal_kling_v3_t2v"]);

export function falStudioToEngineCatalogEntry(
  entry: FalStudioCatalogEntry
): import("./types").EngineCatalogEntry {
  return { ...entry };
}

/**
 * fal.ai model catalog — InfluExAi white-label engines.
 * Server-side only; never expose FAL_KEY to the client.
 */

import type { EngineModelConfig } from "./model-registry";

type FalEntryInput = Omit<
  EngineModelConfig,
  "provider" | "descriptionEn" | "descriptionDe"
> & {
  descriptionEn?: string;
  descriptionDe?: string;
};

function f(entry: FalEntryInput): EngineModelConfig {
  return {
    ...entry,
    provider: "fal",
    descriptionEn: entry.descriptionEn ?? entry.label,
    descriptionDe: entry.descriptionDe ?? entry.descriptionEn ?? entry.label,
  };
}

export const FAL_MODEL_REGISTRY_ENTRIES: EngineModelConfig[] = [
  f({
    id: "fal_kling_v3_t2v",
    label: "Kling 3.0 Video",
    providerModel: "fal-ai/kling-video/v3/pro/text-to-video",
    category: "video",
    tools: ["video"],
    capabilities: ["text_to_video"],
    requiredInputs: ["prompt"],
    outputType: "video",
    credits: 25,
    availability: "active",
    isRecommended: true,
    descriptionDe: "Cinematic Text-to-Video Engine für Social Clips.",
    descriptionEn: "Cinematic text-to-video engine for social clips.",
    replacesBlockedKreaModelIds: ["kling-3"],
    validation: {
      lastStatus: "passed",
      notes: "Live validation passed with fal.ai.",
    },
  }),
  f({
    id: "fal_kling_v3_i2v",
    label: "Kling Image Motion",
    providerModel: "fal-ai/kling-video/v3/pro/image-to-video",
    category: "video",
    tools: ["video", "motion_transfer"],
    capabilities: ["image_to_video"],
    requiredInputs: ["prompt", "sourceImageUrl"],
    outputType: "video",
    credits: 25,
    availability: "experimental",
    descriptionDe: "Animiert ein Bild zu einem hochwertigen Video.",
    descriptionEn: "Animates an image into a high-quality video.",
    replacesBlockedKreaModelIds: ["kling-3", "runway-motion-pro", "runway-aleph"],
    validation: {
      lastStatus: "skipped",
      lastErrorCode: "FAL_BALANCE_EXHAUSTED",
      notes: "Balance exhausted during validation — not a technical failure.",
    },
  }),
  f({
    id: "fal_kling_v3_motion_control",
    label: "Motion Control",
    providerModel: "fal-ai/kling-video/v3/standard/motion-control",
    category: "motion_transfer",
    tools: ["motion_transfer"],
    capabilities: ["motion_control", "image_to_video"],
    requiredInputs: ["sourceImageUrl", "sourceVideoUrl"],
    outputType: "video",
    credits: 35,
    availability: "failed_validation",
    isRecommended: true,
    descriptionDe: "Überträgt Bewegungsreferenzen auf ein Character-Bild.",
    descriptionEn: "Transfers motion references onto a character image.",
    replacesBlockedKreaModelIds: ["runway-motion-pro", "runway-aleph"],
    validation: {
      lastStatus: "failed",
      lastErrorCode: "PROVIDER_FAILED",
      lastCheckedAt: "2026-05-31T00:00:00.000Z",
      notes: "fal.ai returned 422 Unprocessable Entity — verify motion-control schema.",
    },
  }),
  f({
    id: "fal_seedance_2_i2v",
    label: "Seedance Image-to-Video",
    providerModel: "bytedance/seedance-2.0/image-to-video",
    category: "video",
    tools: ["video", "motion_transfer"],
    capabilities: ["image_to_video"],
    requiredInputs: ["prompt", "sourceImageUrl"],
    outputType: "video",
    credits: 25,
    availability: "active",
    descriptionDe: "Schnelle Image-to-Video Engine für Social Clips.",
    descriptionEn: "Fast image-to-video engine for social clips.",
    validation: {
      lastStatus: "passed",
      lastCheckedAt: "2026-05-31T00:00:00.000Z",
      notes: "fal.ai live validation passed.",
    },
  }),
  f({
    id: "fal_seedance_2_t2v",
    label: "Seedance Text-to-Video",
    providerModel: "bytedance/seedance-2.0/text-to-video",
    category: "video",
    tools: ["video"],
    capabilities: ["text_to_video"],
    requiredInputs: ["prompt"],
    outputType: "video",
    credits: 25,
    availability: "experimental",
    descriptionDe: "Text-to-Video Engine mit Social-First Output.",
    descriptionEn: "Text-to-video engine with social-first output.",
  }),
  f({
    id: "fal_topaz_image_upscale",
    label: "Topaz Image Enhance",
    providerModel: "fal-ai/topaz/upscale/image",
    category: "enhancer",
    tools: ["enhancer"],
    capabilities: ["upscale", "enhance"],
    requiredInputs: ["sourceImageUrl"],
    outputType: "image",
    credits: 6,
    availability: "active",
    isRecommended: true,
    descriptionDe: "Verbessert und skaliert Bilder hochwertig.",
    descriptionEn: "Enhances and upscales images in high quality.",
    replacesBlockedKreaModelIds: ["topaz-standard", "topaz-bloom"],
    validation: {
      lastStatus: "passed",
      lastCheckedAt: "2026-05-31T00:00:00.000Z",
      notes: "fal.ai live validation passed.",
    },
  }),
  f({
    id: "fal_topaz_video_upscale",
    label: "Topaz Video Enhance",
    providerModel: "fal-ai/topaz/upscale/video",
    category: "enhancer",
    tools: ["enhancer", "video"],
    capabilities: ["video_upscale"],
    requiredInputs: ["sourceVideoUrl"],
    outputType: "video",
    credits: 30,
    availability: "experimental",
    descriptionDe: "Verbessert und skaliert Videos hochwertig.",
    descriptionEn: "Enhances and upscales videos in high quality.",
  }),
  f({
    id: "fal_sync_lipsync_v2",
    label: "AI Lip-Sync",
    providerModel: "fal-ai/sync-lipsync/v2",
    category: "lipsync",
    tools: ["lipsync"],
    capabilities: ["lipsync"],
    requiredInputs: ["sourceVideoUrl", "sourceAudioUrl"],
    outputType: "video",
    credits: 30,
    availability: "experimental",
    isRecommended: true,
    descriptionDe: "Synchronisiert Mundbewegungen mit Audio.",
    descriptionEn: "Synchronizes mouth movement with audio.",
    validation: {
      lastStatus: "skipped",
      lastErrorCode: "MISSING_VALIDATION_FIXTURE",
      lastCheckedAt: "2026-05-31T00:00:00.000Z",
      notes: "Set FAL_VALIDATION_AUDIO_URL to live-test lipsync.",
    },
  }),
  f({
    id: "fal_sync_lipsync_v3",
    label: "AI Lip-Sync Pro",
    providerModel: "fal-ai/sync-lipsync/v3",
    category: "lipsync",
    tools: ["lipsync"],
    capabilities: ["lipsync"],
    requiredInputs: ["sourceVideoUrl", "sourceAudioUrl"],
    outputType: "video",
    credits: 40,
    availability: "experimental",
    descriptionDe: "Hochwertige Lip-Sync Engine für Creator-Videos.",
    descriptionEn: "High-quality lip-sync engine for creator videos.",
  }),
  f({
    id: "fal_flux_schnell",
    label: "Fast Draft Image",
    providerModel: "fal-ai/flux/schnell",
    category: "image",
    tools: ["image"],
    capabilities: ["text_to_image"],
    requiredInputs: ["prompt"],
    outputType: "image",
    credits: 1,
    availability: "experimental",
    descriptionDe: "Schnelle Bildentwürfe als Backup Engine.",
    descriptionEn: "Fast image drafts as backup engine.",
    validation: {
      lastStatus: "passed",
      lastCheckedAt: "2026-05-31T00:00:00.000Z",
      notes: "fal.ai live validation passed — kept experimental as Krea image backup.",
    },
  }),
];

export const FAL_TOOL_DEFAULT_MODEL_ID: Partial<
  Record<EngineModelConfig["tools"][number], string>
> = {
  video: "fal_kling_v3_t2v",
  motion_transfer: "fal_seedance_2_i2v",
  enhancer: "fal_topaz_image_upscale",
  lipsync: "fal_sync_lipsync_v2",
};

/** Krea registry ids replaced by an active fal engine when fal provider is on. */
export function getFalReplacementIdsForKrea(kreaModelId: string): string[] {
  return FAL_MODEL_REGISTRY_ENTRIES.filter((entry) =>
    entry.replacesBlockedKreaModelIds?.includes(kreaModelId)
  ).map((entry) => entry.id);
}

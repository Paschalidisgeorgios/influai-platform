/**
 * InfluExAi — launch engine registry + legacy product-mode catalog.
 * Credits and availability for MVP live here — not duplicated in UI.
 */

import {
  FAL_STUDIO_CATALOG,
  falStudioToEngineCatalogEntry,
} from "./fal-catalog";
import type {
  EngineCatalogEntry,
  EngineDefinition,
  EngineKey,
  EngineValidationMeta,
} from "./types";

const KREA_ACTIVE_VALIDATION: EngineValidationMeta = {
  validationStatus: "passed",
  canShowToUser: true,
  canRunGeneration: true,
};

const KREA_LAUNCH_ENGINES: EngineCatalogEntry[] = [
  {
    id: "krea_flux_11_pro_ultra",
    label: "Flux 1.1 Pro Ultra",
    provider: "krea",
    group: "image",
    outputType: "image",
    status: "active",
    credits: 3,
    kreaStudioId: "flux_1_1_pro_ultra",
    kreaRegistryId: "krea-2-large",
    userFacing: true,
    canShowToUser: true,
    canRunGeneration: true,
    validation: KREA_ACTIVE_VALIDATION,
  },
  {
    id: "krea_flux_fast_draft",
    label: "Flux Fast Draft",
    provider: "krea",
    group: "image",
    outputType: "image",
    status: "active",
    credits: 1,
    kreaStudioId: "flux_fast_draft",
    kreaRegistryId: "krea-2-medium",
    userFacing: true,
    canShowToUser: true,
    canRunGeneration: true,
    validation: KREA_ACTIVE_VALIDATION,
  },
  {
    id: "krea_nano_realtime",
    label: "Nano Realtime Render",
    provider: "krea",
    group: "image",
    outputType: "image",
    status: "active",
    credits: 1,
    kreaStudioId: "nano_realtime_render",
    kreaRegistryId: "nano-banana",
    userFacing: true,
    canShowToUser: true,
    canRunGeneration: true,
    validation: KREA_ACTIVE_VALIDATION,
  },
  {
    id: "smart_auto_pilot",
    label: "Smart Auto-Pilot",
    provider: "internal",
    group: "image",
    outputType: "image",
    status: "active",
    credits: 1,
    kreaStudioId: "smart_auto_pilot",
    purpose: "Choose best active Krea image engine automatically",
    userFacing: true,
    canShowToUser: true,
    canRunGeneration: true,
    validation: KREA_ACTIVE_VALIDATION,
  },
];

const KREA_PLAN_LIMITED: EngineCatalogEntry[] = [
  {
    id: "krea_runway_motion_pro",
    label: "Motion Pro",
    provider: "krea",
    group: "motion",
    outputType: "video",
    status: "unavailable_plan_limited",
    credits: 25,
    kreaRegistryId: "runway-motion-pro",
    unavailableReason: "Krea API plan limit",
    userFacing: false,
    canShowToUser: false,
    canRunGeneration: false,
    validation: {
      validationStatus: "blocked",
      validationReason: "Krea API plan limit",
      canShowToUser: false,
      canRunGeneration: false,
    },
  },
  {
    id: "krea_kling_3",
    label: "Kling 3",
    provider: "krea",
    group: "video_text_to_video",
    outputType: "video",
    status: "unavailable_plan_limited",
    credits: 25,
    kreaRegistryId: "kling-3",
    unavailableReason: "Krea API plan limit",
    userFacing: false,
    canShowToUser: false,
    canRunGeneration: false,
    validation: {
      validationStatus: "blocked",
      validationReason: "Krea API plan limit",
      canShowToUser: false,
      canRunGeneration: false,
    },
  },
  {
    id: "krea_kling_26",
    label: "Kling 2.6",
    provider: "krea",
    group: "video_text_to_video",
    outputType: "video",
    status: "unavailable_plan_limited",
    credits: 25,
    kreaRegistryId: "kling-26",
    unavailableReason: "Krea API plan limit",
    userFacing: false,
    canShowToUser: false,
    canRunGeneration: false,
    validation: {
      validationStatus: "blocked",
      validationReason: "Krea API plan limit",
      canShowToUser: false,
      canRunGeneration: false,
    },
  },
  {
    id: "krea_kling_25",
    label: "Kling 2.5",
    provider: "krea",
    group: "video_text_to_video",
    outputType: "video",
    status: "unavailable_plan_limited",
    credits: 25,
    kreaRegistryId: "kling-25",
    unavailableReason: "Krea API plan limit",
    userFacing: false,
    canShowToUser: false,
    canRunGeneration: false,
    validation: {
      validationStatus: "blocked",
      validationReason: "Krea API plan limit",
      canShowToUser: false,
      canRunGeneration: false,
    },
  },
  {
    id: "krea_topaz_standard",
    label: "Topaz Enhance",
    provider: "krea",
    group: "enhancer",
    outputType: "image",
    status: "unavailable_plan_limited",
    credits: 4,
    kreaRegistryId: "topaz-standard",
    unavailableReason: "Krea API plan limit",
    userFacing: false,
    canShowToUser: false,
    canRunGeneration: false,
    validation: {
      validationStatus: "blocked",
      validationReason: "Krea API plan limit",
      canShowToUser: false,
      canRunGeneration: false,
    },
  },
];

/** Launch MVP engine registry — single source of truth for action → engine routing. */
export const ENGINE_REGISTRY: readonly EngineCatalogEntry[] = [
  ...KREA_LAUNCH_ENGINES,
  ...FAL_STUDIO_CATALOG.map(falStudioToEngineCatalogEntry),
  ...KREA_PLAN_LIMITED,
] as const;

const ENGINE_BY_ID = new Map<string, EngineCatalogEntry>(
  ENGINE_REGISTRY.map((entry) => [entry.id, entry])
);

/** Krea registry id → launch engine id */
export const KREA_REGISTRY_TO_ENGINE_ID: Record<string, string> = {
  "krea-2-large": "krea_flux_11_pro_ultra",
  "krea-2-medium": "krea_flux_fast_draft",
  "nano-banana": "krea_nano_realtime",
  "flux-11-pro": "krea_flux_11_pro_ultra",
};

export function getEngineById(engineId: string): EngineCatalogEntry | null {
  const id = engineId.trim();
  if (!id) return null;
  return ENGINE_BY_ID.get(id) ?? null;
}

/** Map request model/engine ids to launch registry ids. */
export function normalizeToLaunchEngineId(rawId: string): string {
  const trimmed = rawId.trim();
  if (!trimmed) return trimmed;

  const direct = getEngineById(trimmed);
  if (direct) return direct.id;

  const legacyAlias = LEGACY_MODEL_TO_ENGINE_ID[trimmed];
  if (legacyAlias) return legacyAlias;

  const byStudio = ENGINE_REGISTRY.find((e) => e.kreaStudioId === trimmed);
  if (byStudio) return byStudio.id;

  const byKreaRegistry = ENGINE_REGISTRY.find(
    (e) => e.kreaRegistryId === trimmed
  );
  if (byKreaRegistry) return byKreaRegistry.id;

  return trimmed;
}

export function getAllEngines(): readonly EngineCatalogEntry[] {
  return ENGINE_REGISTRY;
}

export function isEngineActive(entry: EngineCatalogEntry): boolean {
  return (
    entry.status === "active" &&
    entry.canRunGeneration !== false &&
    entry.validation?.canRunGeneration !== false
  );
}

/** MVP engines validated for paid generation today — see docs/MODEL_ACTIVATION_STATUS.md */
export const LAUNCH_ACTIVE_ENGINE_IDS = [
  "smart_auto_pilot",
  "krea_flux_fast_draft",
  "krea_flux_11_pro_ultra",
  "krea_nano_realtime",
  "fal_kling_v3_t2v",
] as const;

export type LaunchActiveEngineId = (typeof LAUNCH_ACTIVE_ENGINE_IDS)[number];

export type EngineActivationBlocker =
  | "none"
  | "blocked_missing_env"
  | "blocked_provider_failed"
  | "blocked_missing_handler";

/**
 * Why an engine is not runnable today (server audit only — safe for logs, not user UI).
 * Does not read process.env; caller passes envPresent flags from provider flags.
 */
export function getEngineActivationBlocker(
  engineId: string,
  options: { falEnvPresent?: boolean; kreaEnvPresent?: boolean } = {}
): {
  canRun: boolean;
  blocker: EngineActivationBlocker;
  reason: string;
} {
  const entry = getEngineById(engineId);
  if (!entry) {
    return {
      canRun: false,
      blocker: "blocked_missing_handler",
      reason: "Engine not registered in launch catalog",
    };
  }

  if (entry.provider === "krea" && options.kreaEnvPresent === false) {
    return {
      canRun: false,
      blocker: "blocked_missing_env",
      reason: "Krea API key missing",
    };
  }

  if (entry.provider === "fal" && options.falEnvPresent === false) {
    return {
      canRun: false,
      blocker: "blocked_missing_env",
      reason: "Fal API key missing",
    };
  }

  if (!isEngineActive(entry)) {
    const validationReason =
      entry.validation?.validationReason ??
      entry.unavailableReason ??
      entry.note ??
      "Engine not active in catalog";
    return {
      canRun: false,
      blocker: "blocked_provider_failed",
      reason: validationReason,
    };
  }

  return { canRun: true, blocker: "none", reason: "Active and validated" };
}

export function isEngineUserFacing(entry: EngineCatalogEntry): boolean {
  return (
    entry.canShowToUser === true ||
    (entry.userFacing === true && entry.status === "active")
  );
}

export function getActiveEngines(): EngineCatalogEntry[] {
  return ENGINE_REGISTRY.filter(isEngineActive);
}

export function getUserFacingEngines(): EngineCatalogEntry[] {
  return ENGINE_REGISTRY.filter(isEngineUserFacing);
}

export function getEngineCreditsForId(engineId: string): number {
  return getEngineById(engineId)?.credits ?? 0;
}

/** Legacy fal / action ids → credits from launch registry */
export function getEngineCreditsByLegacyModelId(modelId: string): number | undefined {
  const trimmed = modelId.trim();
  const direct = getEngineById(trimmed);
  if (direct) return direct.credits;

  const alias = LEGACY_MODEL_TO_ENGINE_ID[trimmed];
  if (alias) return getEngineCreditsForId(alias);

  const legacyKey = FAL_REGISTRY_TO_ENGINE_KEY[trimmed];
  if (legacyKey) return getEngineCredits(legacyKey);

  return undefined;
}

const LEGACY_MODEL_TO_ENGINE_ID: Record<string, string> = {
  fal_sync_lipsync_v2: "fal_lipsync_sync_v2_pro",
  fal_sync_lipsync_v3: "fal_lipsync_sync_v2_pro",
  fal_ai_avatar: "fal_avatar_single_text",
  fal_topaz_image_upscale: "fal_image_upscale",
  fal_object_3d: "fal_object_3d",
  fal_kling_v3_motion_control: "fal_motion_transfer",
  fal_lipsync: "fal_lipsync_sync_v2_pro",
  fal_avatar: "fal_avatar_single_text",
  fal_enhancer: "fal_image_upscale",
  fal_3d: "fal_object_3d",
  fal_training: "fal_lora_training",
  fal_edit: "fal_reference_edit",
  "kling-3": "krea_kling_3",
  "kling-26": "krea_kling_26",
  "kling-25": "krea_kling_25",
  "runway-motion-pro": "krea_runway_motion_pro",
  "topaz-standard": "krea_topaz_standard",
};

/* ── Legacy product-mode catalog (unchanged for routing.ts) ── */

export const ENGINE_CATALOG: readonly EngineDefinition[] = [
  {
    key: "standard_image",
    label: "Standard Image",
    group: "image",
    status: "live",
    credits: 1,
    workflow: "standard",
    provider: "openai",
    model: "gpt-image-1",
    userFacing: true,
    isDefault: true,
    runtime: {
      route: "krea_image",
      legacyImageMode: "standard",
      legacyWorkflow: "standard",
      runtimeProvider: "router",
      runtimeModel: "krea/flux-1-dev",
    },
    adminNotes:
      "Product catalog lists OpenAI gpt-image-1. MVP runtime uses Krea image route when ENABLE_KREA_PROVIDER is on.",
  },
  {
    key: "fast_draft",
    label: "Fast Draft",
    group: "image",
    status: "beta_flagged",
    credits: 1,
    workflow: "fast_draft",
    provider: "fal",
    model: "fal-ai/flux/schnell",
    userFacing: true,
    flags: {
      server: ["ENABLE_FAL_FAST_DRAFT", "ENABLE_FAL_PROVIDER"],
      public: ["NEXT_PUBLIC_ENABLE_FAL_FAST_DRAFT"],
    },
    runtime: {
      route: "legacy_generate",
      legacyImageMode: "fast_draft",
      legacyWorkflow: "fast_draft",
      falRegistryModelId: "fal_flux_schnell",
      runtimeProvider: "fal",
      runtimeModel: "fal-ai/flux/schnell",
    },
  },
  {
    key: "lip_sync_audio_upload",
    label: "Lip Sync — Upload Audio",
    group: "lipsync",
    status: "beta_flagged",
    credits: 30,
    workflow: "lip_sync",
    provider: "fal",
    model: "fal-ai/sync-lipsync/v2/pro",
    userFacing: true,
    flags: {
      server: ["ENABLE_FAL_LIP_SYNC", "ENABLE_FAL_PROVIDER"],
      public: ["NEXT_PUBLIC_ENABLE_FAL_LIP_SYNC"],
    },
    runtime: {
      route: "engine_generate",
      legacyImageMode: "lip_sync",
      legacyWorkflow: "lip_sync",
      falRegistryModelId: "fal_sync_lipsync_v2",
      runtimeProvider: "fal",
      runtimeModel: "fal-ai/sync-lipsync/v2",
    },
  },
  {
    key: "lip_sync_system_voice",
    label: "Lip Sync — System Voice",
    group: "lipsync",
    status: "beta_flagged",
    credits: 35,
    workflow: "lip_sync",
    provider: "router",
    providerChain: [
      { provider: "elevenlabs", model: "eleven_multilingual_v2", role: "tts" },
      { provider: "fal", model: "fal-ai/sync-lipsync/v2/pro", role: "lipsync" },
    ],
    userFacing: true,
    flags: {
      server: [
        "ENABLE_FAL_LIP_SYNC",
        "ENABLE_FAL_PROVIDER",
        "ENABLE_ELEVENLABS_TTS",
      ],
      public: [
        "NEXT_PUBLIC_ENABLE_FAL_LIP_SYNC",
        "NEXT_PUBLIC_ENABLE_ELEVENLABS_TTS",
      ],
    },
    runtime: {
      route: "legacy_generate",
      legacyImageMode: "lip_sync",
      legacyWorkflow: "lip_sync",
      runtimeProvider: "router",
    },
  },
  {
    key: "ugc_look",
    label: "UGC Look",
    group: "image",
    status: "spec_conflict",
    credits: 2,
    workflow: "ugc_look",
    provider: "openai",
    model: "gpt-image-1",
    userFacing: false,
    runtime: {
      route: "legacy_generate",
      legacyImageMode: "ugc_look",
      legacyWorkflow: "ugc_look",
    },
    adminNotes: "Do not activate until existing backend implementation is verified.",
  },
  {
    key: "premium_image",
    label: "Premium Image",
    group: "image",
    status: "spec_conflict",
    credits: 3,
    workflow: "premium_image",
    provider: "fal",
    userFacing: false,
    runtime: {
      route: "legacy_generate",
      legacyImageMode: "premium_image",
      legacyWorkflow: "premium_image",
    },
    adminNotes: "Do not activate until existing backend implementation is verified.",
  },
  {
    key: "brand_assets",
    label: "Brand Assets",
    group: "image",
    status: "spec_conflict",
    credits: 4,
    workflow: "brand_assets",
    provider: "fal",
    userFacing: false,
    runtime: {
      route: "legacy_generate",
      legacyImageMode: "brand_assets",
      legacyWorkflow: "brand_assets",
    },
    adminNotes: "Do not activate until existing backend implementation is verified.",
  },
  {
    key: "reference_edit",
    label: "Reference Edit",
    group: "image",
    status: "spec_conflict",
    credits: 5,
    workflow: "reference_edit",
    provider: "fal",
    userFacing: false,
    runtime: {
      route: "legacy_generate",
      legacyImageMode: "reference_edit",
      legacyWorkflow: "reference_edit",
    },
    adminNotes: "Do not activate until existing backend implementation is verified.",
  },
  {
    key: "video_engine",
    label: "Video Engine",
    group: "video",
    status: "internal_ready",
    credits: 25,
    workflow: "video_text_to_video",
    provider: "fal",
    model: "fal-ai/kling-video/v3/pro/text-to-video",
    userFacing: true,
    flags: {
      server: ["ENABLE_FAL_PROVIDER"],
      public: ["NEXT_PUBLIC_ENABLE_FAL_PROVIDER"],
    },
    runtime: {
      route: "engine_generate",
      legacyImageMode: "video_image_to_video",
      legacyWorkflow: "video_image_to_video",
      falRegistryModelId: "fal_kling_v3_t2v",
      runtimeProvider: "fal",
      runtimeModel: "fal-ai/kling-video/v3/pro/text-to-video",
    },
    adminNotes: "Text-to-video via fal_kling_v3_t2v in launch registry.",
  },
  {
    key: "image_to_video",
    label: "Image to Video",
    group: "video",
    status: "planned",
    credits: 25,
    workflow: "video_image_to_video",
    provider: "fal",
    userFacing: false,
    runtime: {
      route: "engine_generate",
      falRegistryModelId: "fal_kling_v3_i2v",
      runtimeProvider: "fal",
      runtimeModel: "fal-ai/kling-video/v3/pro/image-to-video",
    },
  },
  {
    key: "motion_transfer",
    label: "Motion Transfer",
    group: "motion",
    status: "planned",
    credits: 25,
    creditsMax: 50,
    workflow: "motion_transfer",
    provider: "fal",
    userFacing: false,
    runtime: {
      route: "engine_generate",
      falRegistryModelId: "fal_kling_v3_motion_control",
      runtimeProvider: "fal",
    },
  },
  {
    key: "ai_avatar",
    label: "AI Avatar",
    group: "avatar",
    status: "planned",
    credits: 30,
    creditsMax: 50,
    workflow: "ai_avatar",
    provider: "fal",
    userFacing: false,
    runtime: {
      route: "legacy_generate",
      legacyWorkflow: "creator_video",
    },
  },
  {
    key: "background_removal",
    label: "Background Remover",
    group: "asset_enhancer",
    status: "planned",
    credits: 1,
    creditsMax: 2,
    workflow: "background_removal",
    provider: "fal",
    userFacing: false,
    runtime: { route: "engine_generate" },
  },
  {
    key: "object_3d",
    label: "3D Object Render",
    group: "three_d",
    status: "planned",
    credits: 10,
    creditsMax: 30,
    workflow: "object_3d",
    provider: "fal",
    userFacing: false,
    runtime: { route: "engine_generate" },
  },
  {
    key: "campaign_planner",
    label: "Campaign Planner",
    group: "campaign",
    status: "planned",
    credits: 0,
    creditsMax: 3,
    workflow: "campaign_planner",
    provider: "internal",
    purpose: "Prompts, captions, campaign structure, visual planning",
    userFacing: false,
    runtime: {
      route: "internal",
      legacyWorkflow: "campaign_builder",
    },
  },
] as const;

const LEGACY_ENGINE_BY_KEY = new Map<EngineKey, EngineDefinition>(
  ENGINE_CATALOG.map((entry) => [entry.key, entry])
);

export const FAL_REGISTRY_TO_ENGINE_KEY: Record<string, EngineKey> = {
  fal_flux_schnell: "fast_draft",
  fal_kling_v3_t2v: "video_engine",
  fal_kling_v3_i2v: "image_to_video",
  fal_kling_v3_motion_control: "motion_transfer",
  fal_sync_lipsync_v2: "lip_sync_audio_upload",
  fal_sync_lipsync_v3: "lip_sync_audio_upload",
  fal_topaz_image_upscale: "background_removal",
  fal_seedance_2_i2v: "image_to_video",
  fal_seedance_2_t2v: "video_engine",
};

export const LEGACY_MODE_TO_ENGINE_KEY: Record<string, EngineKey> = {
  standard: "standard_image",
  fast_draft: "fast_draft",
  ugc_look: "ugc_look",
  premium_image: "premium_image",
  brand_assets: "brand_assets",
  reference_edit: "reference_edit",
  enhance_asset: "background_removal",
  video_image_to_video: "video_engine",
  lip_sync: "lip_sync_audio_upload",
  talking_creator: "ai_avatar",
  creator_video: "ai_avatar",
};

export function getEngineDefinition(key: EngineKey): EngineDefinition | undefined {
  return LEGACY_ENGINE_BY_KEY.get(key);
}

export function getAllEngineDefinitions(): readonly EngineDefinition[] {
  return ENGINE_CATALOG;
}

export function getDefaultEngineKey(): EngineKey {
  return "standard_image";
}

export function resolveEngineKeyFromLegacy(input: {
  engineKey?: string;
  imageMode?: string;
  workflow?: string;
  lipSyncInputMode?: "audio_upload" | "system_voice";
  engineModelId?: string;
}): EngineKey | undefined {
  const explicit = input.engineKey?.trim();
  if (explicit && LEGACY_ENGINE_BY_KEY.has(explicit as EngineKey)) {
    return explicit as EngineKey;
  }

  if (input.engineModelId?.trim()) {
    const launch = getEngineById(input.engineModelId.trim());
    if (launch?.falRegistryId) {
      const fromRegistry = FAL_REGISTRY_TO_ENGINE_KEY[launch.falRegistryId];
      if (fromRegistry) return fromRegistry;
    }
    const fromRegistry = FAL_REGISTRY_TO_ENGINE_KEY[input.engineModelId.trim()];
    if (fromRegistry) return fromRegistry;
  }

  const mode = (input.imageMode ?? input.workflow ?? "").trim().toLowerCase();
  if (mode === "lip_sync" && input.lipSyncInputMode === "system_voice") {
    return "lip_sync_system_voice";
  }
  if (mode && LEGACY_MODE_TO_ENGINE_KEY[mode]) {
    return LEGACY_MODE_TO_ENGINE_KEY[mode];
  }

  return undefined;
}

export function getEngineCredits(key: EngineKey): number {
  return LEGACY_ENGINE_BY_KEY.get(key)?.credits ?? 0;
}

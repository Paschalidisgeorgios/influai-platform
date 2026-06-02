/**
 * InfluExAI — complete internal model inventory (server/admin only).
 * Normal users see model modes and actions — never raw inventory rows.
 *
 * Activation status per tool: docs/MODEL_ACTIVATION_STATUS.md
 */

import { LOCKED_FUTURE_TOOL_MODE_IDS } from "@/app/lib/config/future-tools";
import { getAllModelModes } from "@/app/lib/model-modes/model-modes";
import { getAllEngines, getEngineById, isEngineActive } from "./catalog";
import type { EngineCatalogEntry } from "./types";
import {
  capabilityFromEngineGroup,
  type InventoryOutputType,
  type UserFacingCapability,
} from "./model-groups";
import {
  deriveInventoryAccessFlags,
  enforceInventoryEntryInvariants,
  inventoryStatusFromEngineStatus,
  isInventoryLocked,
  isPlaceholderInventoryEntry,
  type ModelInventoryEntryShape,
  type ModelInventoryProvider,
  type ModelInventoryProviderName,
  type ModelInventoryStatus,
  type ModelValidationStatus,
} from "./model-status";

/** Internal inventory row — satisfies ModelInventoryEntryShape with typed capability/output. */
export type ModelInventoryEntry = Omit<
  ModelInventoryEntryShape,
  "userFacingCapability" | "outputType"
> & {
  userFacingCapability: UserFacingCapability;
  outputType: InventoryOutputType;
};

export type {
  ModelInventoryEntryShape,
  ModelInventoryProvider,
  ModelInventoryProviderName,
  ModelInventoryStatus,
  ModelValidationStatus,
} from "./model-status";

/** Primary model mode per launch engine id */
const ENGINE_TO_MODEL_MODE: Record<string, string> = {
  smart_auto_pilot: "auto_image",
  krea_flux_fast_draft: "fast_draft_image",
  krea_flux_11_pro_ultra: "premium_image",
  krea_nano_realtime: "realtime_image",
  fal_kling_v3_t2v: "auto_video",
  fal_kling_v3_i2v: "animate_image",
  fal_lipsync_sync_v2_pro: "lipsync_creator",
  fal_avatar_single_text: "ai_avatar",
  fal_image_upscale: "enhance_asset",
  fal_background_removal: "background_remove",
  fal_object_3d: "object_3d",
  fal_motion_transfer: "motion_transfer",
};

const ENGINE_MODE_NOTES: Record<string, string> = {
  smart_auto_pilot:
    "MVP launch — validated. Auto-routes to the best active Krea image engine.",
  krea_flux_fast_draft:
    "MVP launch — validated. Primary engine for fast_draft_image mode.",
  krea_flux_11_pro_ultra:
    "MVP launch — validated. Primary engine for premium_image mode.",
  krea_nano_realtime:
    "MVP launch — validated. Primary engine for realtime_image mode.",
  fal_kling_v3_t2v:
    "MVP launch — validated. Text-to-video for auto_video and cinematic_text_video modes.",
};

/**
 * Launch MVP engines — active in ENGINE_REGISTRY with validationStatus passed.
 * Stable ids; do not rename without updating catalog + model modes.
 */
export const MVP_ACTIVE_ENGINE_IDS = [
  "krea_flux_11_pro_ultra",
  "krea_flux_fast_draft",
  "krea_nano_realtime",
  "smart_auto_pilot",
  "fal_kling_v3_t2v",
] as const;

export type MvpActiveEngineId = (typeof MVP_ACTIVE_ENGINE_IDS)[number];

const MVP_ACTIVE_MODEL_MODE_IDS: Record<MvpActiveEngineId, string> = {
  smart_auto_pilot: "auto_image",
  krea_flux_fast_draft: "fast_draft_image",
  krea_flux_11_pro_ultra: "premium_image",
  krea_nano_realtime: "realtime_image",
  fal_kling_v3_t2v: "auto_video",
};

/** Ensures MVP rows stay active + runnable in internal inventory (admin/validators only). */
function applyMvpActiveInventoryPolicy(
  entries: ModelInventoryEntry[]
): ModelInventoryEntry[] {
  const mvpSet = new Set<string>(MVP_ACTIVE_ENGINE_IDS);

  return entries.map((entry) => {
    if (!mvpSet.has(entry.inventoryId)) return entry;

    const engineId = entry.inventoryId as MvpActiveEngineId;
    const engine = getEngineById(engineId);
    if (!engine) return entry;

    const capability = capabilityFromEngineGroup({
      engineId: engine.id,
      group: engine.group,
    });

    return enforceInventoryEntryInvariants({
      ...entry,
      inventoryId: engineId,
      provider: (engine.provider as ModelInventoryProviderName) ?? null,
      providerModelId:
        engine.provider === "internal"
          ? engine.kreaStudioId ?? engine.id
          : engine.model ?? engine.kreaRegistryId ?? engine.falRegistryId ?? null,
      userFacingCapability: capability,
      inputTypes: [...getCapabilityInputTypes(capability)],
      outputType: mapOutputType(engine.outputType),
      status: "active",
      mappedEngineId: engineId,
      mappedModelModeId:
        ENGINE_TO_MODEL_MODE[engineId] ?? MVP_ACTIVE_MODEL_MODE_IDS[engineId],
      creditsEstimate: engine.credits,
      validationStatus: "passed",
      validationReason:
        engine.validation?.validationReason ?? "MVP launch validation passed",
      canShowToUser: engine.canShowToUser !== false,
      canRunGeneration: true,
      notes: ENGINE_MODE_NOTES[engineId] ?? entry.notes,
    }) as ModelInventoryEntry;
  });
}

function mapOutputType(raw: string): InventoryOutputType {
  if (raw === "mesh") return "three_d";
  if (raw === "text") return "analysis";
  if (
    raw === "image" ||
    raw === "video" ||
    raw === "audio" ||
    raw === "three_d" ||
    raw === "model" ||
    raw === "analysis"
  ) {
    return raw;
  }
  return "image";
}

function resolveProviderModelId(entry: EngineCatalogEntry): string | null {
  if (entry.provider === "internal") {
    return entry.kreaStudioId ?? entry.id;
  }
  return entry.model ?? entry.kreaRegistryId ?? entry.falRegistryId ?? null;
}

function entryFromEngine(engine: EngineCatalogEntry): ModelInventoryEntry {
  const status = inventoryStatusFromEngineStatus(engine.status);
  const access = deriveInventoryAccessFlags(status);
  const validationStatus =
    engine.validation?.validationStatus ?? "not_tested";
  const providerModelId = resolveProviderModelId(engine);
  const isPlaceholder = isPlaceholderInventoryEntry(providerModelId);
  const mappedModeId = ENGINE_TO_MODEL_MODE[engine.id];
  const isFutureToolEngine =
    mappedModeId != null &&
    (LOCKED_FUTURE_TOOL_MODE_IDS as readonly string[]).includes(mappedModeId);

  let canRunGeneration = access.canRunGeneration && engine.canRunGeneration !== false;
  let canShowToUser = access.canShowToUser && engine.canShowToUser !== false;
  let resolvedStatus = status;

  if (isFutureToolEngine) {
    canRunGeneration = false;
    canShowToUser = false;
    if (resolvedStatus === "active") {
      resolvedStatus = "mapped_but_unvalidated";
    }
  }

  if (isPlaceholder && status === "active") {
    resolvedStatus = "mapped_but_unvalidated";
    canRunGeneration = false;
    canShowToUser = false;
  }

  if (validationStatus !== "passed" && status === "active") {
    canRunGeneration = false;
  }

  const capability = capabilityFromEngineGroup({
    engineId: engine.id,
    group: engine.group,
  });

  return enforceInventoryEntryInvariants({
    inventoryId: engine.id,
    provider: (engine.provider as ModelInventoryProviderName) ?? null,
    providerModelId,
    userFacingCapability: capability,
    inputTypes: [...getCapabilityInputTypes(capability)],
    outputType: mapOutputType(engine.outputType),
    status: resolvedStatus,
    mappedEngineId: engine.id,
    mappedModelModeId: mappedModeId,
    creditsEstimate: engine.credits,
    validationStatus,
    validationReason:
      engine.validation?.validationReason ??
      engine.unavailableReason ??
      engine.note,
    canShowToUser,
    canRunGeneration,
    notes: ENGINE_MODE_NOTES[engine.id] ?? engine.note ?? engine.purpose,
  }) as ModelInventoryEntry;
}

function getCapabilityInputTypes(
  capability: UserFacingCapability
): readonly string[] {
  const defaults: Record<UserFacingCapability, readonly string[]> = {
    image_generation: ["text"],
    video_generation: ["text"],
    image_to_video: ["image", "text"],
    realtime_image: ["text"],
    image_edit: ["image", "text"],
    enhance: ["image"],
    background_remove: ["image"],
    lipsync: ["video", "audio"],
    avatar: ["text", "image"],
    motion_transfer: ["video", "image"],
    training: ["image"],
    three_d: ["image", "text"],
    audio: ["text"],
    analysis: ["text", "image", "video"],
  };
  return defaults[capability];
}

function internalEntry(
  partial: Omit<
    ModelInventoryEntry,
    "inputTypes" | "canShowToUser" | "canRunGeneration"
  > & {
    inputTypes?: string[];
    canShowToUser?: boolean;
    canRunGeneration?: boolean;
  }
): ModelInventoryEntry {
  const access = deriveInventoryAccessFlags(partial.status);
  const active = partial.status === "active";
  const locked = isInventoryLocked(partial.status);
  return enforceInventoryEntryInvariants({
    ...partial,
    inputTypes:
      partial.inputTypes ??
      [...getCapabilityInputTypes(partial.userFacingCapability)],
    canShowToUser: locked
      ? (partial.canShowToUser ?? access.canShowToUser)
      : active
        ? (partial.canShowToUser ?? access.canShowToUser)
        : false,
    canRunGeneration: locked
      ? false
      : active
        ? (partial.canRunGeneration ?? access.canRunGeneration)
        : false,
  }) as ModelInventoryEntry;
}

/** Locked launch tools — visible Coming soon metadata; no provider endpoint mapped. */
export const LOCKED_REFERENCE_EDIT_INVENTORY_IDS = [
  "use_reference_image",
  "edit_image",
  "match_style",
] as const;

/** Locked launch tools — visible Coming soon metadata; no provider endpoint mapped. */
function lockedToolInventoryEntry(
  partial: Pick<
    ModelInventoryEntry,
    | "inventoryId"
    | "userFacingCapability"
    | "outputType"
    | "mappedModelModeId"
    | "notes"
  > & {
    creditsEstimate?: number;
  }
): ModelInventoryEntry {
  return internalEntry({
    inventoryId: partial.inventoryId,
    provider: null,
    providerModelId: null,
    userFacingCapability: partial.userFacingCapability,
    outputType: partial.outputType,
    status: "locked",
    mappedModelModeId: partial.mappedModelModeId,
    creditsEstimate: partial.creditsEstimate ?? 4,
    validationStatus: "not_tested",
    validationReason: "Coming soon — no training job or provider mapped.",
    canShowToUser: true,
    canRunGeneration: false,
    notes: partial.notes,
  });
}

export const LOCKED_TRAINING_INVENTORY_IDS = [
  "train_creator_style",
  "train_brand_kit",
  "train_product_model",
  "train_creator_identity",
] as const;

export { LOCKED_FUTURE_TOOL_MODE_IDS } from "@/app/lib/config/future-tools";

const INTERNAL_INVENTORY: ModelInventoryEntry[] = [
  internalEntry({
    inventoryId: "openai_creative_score",
    provider: "openai",
    providerModelId: "gpt-4o-mini",
    userFacingCapability: "analysis",
    outputType: "analysis",
    status: "active",
    creditsEstimate: 0,
    validationStatus: "passed",
    validationReason: "Internal analysis — Creative Score API",
    canShowToUser: false,
    canRunGeneration: true,
    notes: "Maps to check_creative_score action (free for users).",
  }),
  internalEntry({
    inventoryId: "openai_prompt_assist",
    provider: "openai",
    providerModelId: "gpt-4o-mini",
    userFacingCapability: "analysis",
    outputType: "analysis",
    status: "active",
    creditsEstimate: 0,
    validationStatus: "passed",
    validationReason: "Internal prompt enhancement — Prompt Assist API",
    canShowToUser: false,
    canRunGeneration: true,
    notes: "Maps to improve_prompt action (free for users).",
  }),
  internalEntry({
    inventoryId: "elevenlabs_tts_multilingual",
    provider: "elevenlabs",
    providerModelId: "eleven_multilingual_v2",
    userFacingCapability: "audio",
    outputType: "audio",
    status: "mapped_but_unvalidated",
    creditsEstimate: 5,
    validationStatus: "not_tested",
    validationReason: "Planned LipSync system-voice chain — not active in MVP.",
    notes: "Used with fal lipsync in legacy lip_sync_system_voice engine definition.",
  }),
  internalEntry({
    inventoryId: "fal_sync_lipsync_v3",
    provider: "fal",
    providerModelId: "fal-ai/sync-lipsync/v3",
    userFacingCapability: "lipsync",
    outputType: "video",
    status: "mapped_but_unvalidated",
    mappedEngineId: "fal_lipsync_sync_v2_pro",
    mappedModelModeId: "lipsync_creator",
    creditsEstimate: 30,
    validationStatus: "not_tested",
    validationReason: "Legacy alias — validate v3 before promotion.",
    notes: "v3 endpoint candidate; MVP maps to fal_lipsync_sync_v2_pro engine row.",
  }),
  internalEntry({
    inventoryId: "fal_seedance_2_t2v",
    provider: "fal",
    providerModelId: null,
    userFacingCapability: "video_generation",
    outputType: "video",
    status: "mapped_but_unvalidated",
    creditsEstimate: 25,
    validationStatus: "not_tested",
    validationReason: "Placeholder — Seedance 2 text-to-video not mapped.",
  }),
  internalEntry({
    inventoryId: "fal_seedance_2_i2v",
    provider: "fal",
    providerModelId: null,
    userFacingCapability: "image_to_video",
    outputType: "video",
    status: "mapped_but_unvalidated",
    creditsEstimate: 25,
    validationStatus: "not_tested",
    validationReason: "Placeholder — Seedance 2 image-to-video not mapped.",
  }),
  lockedToolInventoryEntry({
    inventoryId: "use_reference_image",
    userFacingCapability: "image_edit",
    outputType: "image",
    mappedModelModeId: "use_reference_image",
    creditsEstimate: 4,
    notes: "Maps to use_reference_image action — preview until reference engine validates.",
  }),
  lockedToolInventoryEntry({
    inventoryId: "edit_image",
    userFacingCapability: "image_edit",
    outputType: "image",
    mappedModelModeId: "edit_image",
    creditsEstimate: 4,
    notes: "Maps to edit_image action — preview until image-edit engine validates.",
  }),
  lockedToolInventoryEntry({
    inventoryId: "match_style",
    userFacingCapability: "image_edit",
    outputType: "image",
    mappedModelModeId: "match_style",
    creditsEstimate: 4,
    notes: "Maps to match_style action — preview until style engine validates.",
  }),
  lockedToolInventoryEntry({
    inventoryId: "animate_image",
    userFacingCapability: "image_to_video",
    outputType: "video",
    mappedModelModeId: "animate_image",
    creditsEstimate: 25,
    notes: "Maps to animate_image action — request access until image-to-video engine validates.",
  }),
  lockedToolInventoryEntry({
    inventoryId: "lipsync_creator",
    userFacingCapability: "lipsync",
    outputType: "video",
    mappedModelModeId: "lipsync_creator",
    creditsEstimate: 30,
    notes: "Maps to lipsync_creator action — request access until lipsync engine validates.",
  }),
  lockedToolInventoryEntry({
    inventoryId: "ai_avatar",
    userFacingCapability: "avatar",
    outputType: "video",
    mappedModelModeId: "ai_avatar",
    creditsEstimate: 40,
    notes: "Maps to ai_avatar action — request access until avatar engine validates.",
  }),
  lockedToolInventoryEntry({
    inventoryId: "enhance_asset",
    userFacingCapability: "enhance",
    outputType: "image",
    mappedModelModeId: "enhance_asset",
    creditsEstimate: 3,
    notes: "Maps to enhance_asset action — preview until enhancer engine validates.",
  }),
  lockedToolInventoryEntry({
    inventoryId: "background_remove",
    userFacingCapability: "background_remove",
    outputType: "image",
    mappedModelModeId: "background_remove",
    creditsEstimate: 2,
    notes: "Maps to background_remove action — preview until removal engine validates.",
  }),
  lockedToolInventoryEntry({
    inventoryId: "upscale_image",
    userFacingCapability: "enhance",
    outputType: "image",
    mappedModelModeId: "upscale_image",
    creditsEstimate: 3,
    notes: "Maps to upscale_image action — preview until upscale engine validates.",
  }),
  lockedToolInventoryEntry({
    inventoryId: "object_3d",
    userFacingCapability: "three_d",
    outputType: "three_d",
    mappedModelModeId: "object_3d",
    creditsEstimate: 30,
    notes: "Maps to object_3d action — request access until 3D engine validates.",
  }),
  lockedToolInventoryEntry({
    inventoryId: "motion_transfer",
    userFacingCapability: "motion_transfer",
    outputType: "video",
    mappedModelModeId: "motion_transfer",
    creditsEstimate: 30,
    notes: "Maps to motion_transfer action — request access until motion engine validates.",
  }),
  lockedToolInventoryEntry({
    inventoryId: "audio_sound_design",
    userFacingCapability: "audio",
    outputType: "audio",
    mappedModelModeId: "audio_sound_design",
    creditsEstimate: 10,
    notes: "Maps to audio_sound_design action — request access until audio engine validates.",
  }),
  lockedToolInventoryEntry({
    inventoryId: "train_creator_style",
    userFacingCapability: "training",
    outputType: "model",
    mappedModelModeId: "train_creator_style",
    creditsEstimate: 200,
    notes: "Maps to train_creator_style action — request access until training infrastructure validates.",
  }),
  lockedToolInventoryEntry({
    inventoryId: "train_brand_kit",
    userFacingCapability: "training",
    outputType: "model",
    mappedModelModeId: "train_brand_kit",
    creditsEstimate: 225,
    notes: "Maps to train_brand_kit action — request access until training infrastructure validates.",
  }),
  lockedToolInventoryEntry({
    inventoryId: "train_product_model",
    userFacingCapability: "training",
    outputType: "model",
    mappedModelModeId: "train_product_model",
    creditsEstimate: 225,
    notes: "Maps to train_product_model action — request access until training infrastructure validates.",
  }),
  lockedToolInventoryEntry({
    inventoryId: "train_creator_identity",
    userFacingCapability: "training",
    outputType: "model",
    mappedModelModeId: "train_creator_identity",
    creditsEstimate: 225,
    notes: "Maps to train_creator_identity action — request access until training infrastructure validates.",
  }),
];

function buildEngineInventory(): ModelInventoryEntry[] {
  return applyMvpActiveInventoryPolicy(
    getAllEngines().map(entryFromEngine)
  );
}

export const MODEL_INVENTORY: readonly ModelInventoryEntry[] = [
  ...buildEngineInventory(),
  ...INTERNAL_INVENTORY,
] as const;

const INVENTORY_BY_ID = new Map<string, ModelInventoryEntry>(
  MODEL_INVENTORY.map((entry) => [entry.inventoryId, entry])
);

export function getModelInventoryEntry(
  inventoryId: string
): ModelInventoryEntry | null {
  return INVENTORY_BY_ID.get(inventoryId.trim()) ?? null;
}

export function getAllModelInventoryEntries(): readonly ModelInventoryEntry[] {
  return MODEL_INVENTORY;
}

export function getActiveModelInventoryEntries(): ModelInventoryEntry[] {
  const mvp = getMvpActiveModelInventoryEntries();
  const mvpIds = new Set(MVP_ACTIVE_ENGINE_IDS);
  const internalActive = MODEL_INVENTORY.filter(
    (entry) =>
      entry.status === "active" &&
      entry.canRunGeneration &&
      !mvpIds.has(entry.inventoryId as MvpActiveEngineId)
  );
  return [...mvp, ...internalActive];
}

export function getInventoryByCapability(
  capability: UserFacingCapability
): ModelInventoryEntry[] {
  return MODEL_INVENTORY.filter(
    (entry) => entry.userFacingCapability === capability
  );
}

export function getInventoryForEngine(engineId: string): ModelInventoryEntry[] {
  return MODEL_INVENTORY.filter((entry) => entry.mappedEngineId === engineId);
}

export function getInventoryForModelMode(
  modelModeId: string
): ModelInventoryEntry[] {
  return MODEL_INVENTORY.filter(
    (entry) => entry.mappedModelModeId === modelModeId
  );
}

/** Required launch active inventory ids — used by validator */
export const REQUIRED_ACTIVE_INVENTORY_IDS = MVP_ACTIVE_ENGINE_IDS;

/** Active MVP inventory rows (validated generation engines only). */
export function getMvpActiveModelInventoryEntries(): ModelInventoryEntry[] {
  return MVP_ACTIVE_ENGINE_IDS.map((id) => getModelInventoryEntry(id)).filter(
    (entry): entry is ModelInventoryEntry => entry != null
  );
}

/** Sync check: active model modes must reference active engines present in inventory */
export function getActiveModelModeEngineIds(): string[] {
  return getAllModelModes()
    .filter((mode) => mode.status === "active" && mode.canRunGeneration)
    .map((mode) => mode.engineId)
    .filter((id): id is string => Boolean(id));
}

export function isEngineRepresentedInInventory(engineId: string): boolean {
  return MODEL_INVENTORY.some(
    (entry) =>
      entry.inventoryId === engineId || entry.mappedEngineId === engineId
  );
}

export function assertInventoryMatchesActiveEngines(): boolean {
  for (const engine of getAllEngines().filter(isEngineActive)) {
    if (!isEngineRepresentedInInventory(engine.id)) return false;
  }
  return true;
}

/** User-facing capability label for activation audits (docs/MODEL_ACTIVATION_STATUS.md). */
export type ModelCapabilityAuditStatus =
  | "live"
  | "preview"
  | "request_access"
  | "coming_soon"
  | "blocked_missing_env"
  | "blocked_provider_failed"
  | "blocked_missing_handler"
  | "blocked_storage_missing"
  | "blocked_missing_infrastructure";

export type ModelCapabilityAuditRow = {
  /** Display name in product copy */
  label: string;
  group:
    | "image"
    | "video"
    | "pack"
    | "optimize"
    | "edit"
    | "animate"
    | "training"
    | "advanced";
  toolId?: string;
  modelModeId?: string;
  engineId?: string;
  /** Resolved status with current launch flags + catalog validation (2026-06-01). */
  status: ModelCapabilityAuditStatus;
  /** Plain-language blocker — no secrets or provider model ids. */
  blockerReason: string;
  credits: string;
  envRequired: readonly string[];
  handlerRoutes: readonly string[];
  gallery: boolean;
  refundOnFailure: boolean;
};

/**
 * Canonical activation matrix for audits and docs.
 * Update when launch flags, catalog validation, or handlers change.
 */
export const MODEL_CAPABILITY_AUDIT: readonly ModelCapabilityAuditRow[] = [
  // ── Image modes (Create Image tool) ──
  {
    label: "Auto Image",
    group: "image",
    toolId: "create_image",
    modelModeId: "auto_image",
    engineId: "smart_auto_pilot",
    status: "live",
    blockerReason: "MVP validated — routes via Krea image generate.",
    credits: "1",
    envRequired: ["KREA_API_KEY"],
    handlerRoutes: ["/api/krea/image/generate", "/api/generate"],
    gallery: true,
    refundOnFailure: true,
  },
  {
    label: "Fast Draft",
    group: "image",
    toolId: "create_image",
    modelModeId: "fast_draft_image",
    engineId: "krea_flux_fast_draft",
    status: "live",
    blockerReason: "MVP validated.",
    credits: "1",
    envRequired: ["KREA_API_KEY"],
    handlerRoutes: ["/api/krea/image/generate", "/api/generate"],
    gallery: true,
    refundOnFailure: true,
  },
  {
    label: "Premium Image",
    group: "image",
    toolId: "create_image",
    modelModeId: "premium_image",
    engineId: "krea_flux_11_pro_ultra",
    status: "live",
    blockerReason: "MVP validated.",
    credits: "3",
    envRequired: ["KREA_API_KEY"],
    handlerRoutes: ["/api/krea/image/generate", "/api/generate"],
    gallery: true,
    refundOnFailure: true,
  },
  {
    label: "Realtime Render",
    group: "image",
    toolId: "create_image",
    modelModeId: "realtime_image",
    engineId: "krea_nano_realtime",
    status: "live",
    blockerReason: "MVP validated.",
    credits: "1",
    envRequired: ["KREA_API_KEY"],
    handlerRoutes: ["/api/krea/image/generate", "/api/generate"],
    gallery: true,
    refundOnFailure: true,
  },
  // ── Video ──
  {
    label: "Text-to-Video / Motion Video",
    group: "video",
    toolId: "create_video",
    modelModeId: "auto_video",
    engineId: "fal_kling_v3_t2v",
    status: "live",
    blockerReason: "Fal Kling v3 T2V passed live validation.",
    credits: "25",
    envRequired: ["FAL_KEY"],
    handlerRoutes: ["/api/engine/generate", "/api/generate"],
    gallery: true,
    refundOnFailure: true,
  },
  {
    label: "Image-to-Video / Animate Image",
    group: "video",
    toolId: "animate_image",
    modelModeId: "animate_image",
    engineId: "fal_kling_v3_i2v",
    status: "coming_soon",
    blockerReason:
      "Launch module enableImageToVideo is off; engine validation blocked (insufficient Fal balance during test).",
    credits: "25",
    envRequired: ["FAL_KEY"],
    handlerRoutes: ["/api/engine/generate"],
    gallery: true,
    refundOnFailure: true,
  },
  // ── Pack ──
  {
    label: "Social Asset Pack Preview",
    group: "pack",
    toolId: "social_asset_pack",
    engineId: "smart_auto_pilot",
    status: "live",
    blockerReason:
      "Free planning preview — no provider charge; uses pack preview route.",
    credits: "0 (preview)",
    envRequired: [],
    handlerRoutes: ["/api/packs/social-asset-preview"],
    gallery: false,
    refundOnFailure: false,
  },
  {
    label: "Social Asset Pack Render",
    group: "pack",
    toolId: "social_asset_pack",
    engineId: "smart_auto_pilot",
    status: "live",
    blockerReason:
      "Requires validated Krea image + Fal video engines; charges 45 credits before providers.",
    credits: "45",
    envRequired: ["KREA_API_KEY", "FAL_KEY"],
    handlerRoutes: ["/api/packs/social-asset-render"],
    gallery: true,
    refundOnFailure: true,
  },
  // ── Optimize ──
  {
    label: "Creative Score",
    group: "optimize",
    toolId: "check_creative_score",
    status: "live",
    blockerReason: "Internal analysis — no provider generation.",
    credits: "0",
    envRequired: [],
    handlerRoutes: ["/api/creative-score"],
    gallery: false,
    refundOnFailure: false,
  },
  {
    label: "Hooks & Captions",
    group: "optimize",
    toolId: "hooks_captions",
    status: "live",
    blockerReason: "Internal copy generation — no provider charge.",
    credits: "0",
    envRequired: [],
    handlerRoutes: ["/api/hooks-captions/generate"],
    gallery: false,
    refundOnFailure: false,
  },
  {
    label: "Export Pack",
    group: "optimize",
    toolId: "export_pack",
    status: "live",
    blockerReason: "Client-side export planning — preview route only.",
    credits: "0",
    envRequired: [],
    handlerRoutes: ["/api/export-pack/preview"],
    gallery: false,
    refundOnFailure: false,
  },
  // ── Edit ──
  {
    label: "Use Reference Image",
    group: "edit",
    toolId: "use_reference_image",
    modelModeId: "use_reference_image",
    engineId: "fal_reference_edit",
    status: "preview",
    blockerReason:
      "Reference engine mapped but not validated; model id not set in catalog.",
    credits: "5",
    envRequired: ["FAL_KEY"],
    handlerRoutes: ["/api/reference-sources/upload", "/api/engine/generate"],
    gallery: true,
    refundOnFailure: true,
  },
  {
    label: "Edit Image",
    group: "edit",
    toolId: "edit_image",
    modelModeId: "edit_image",
    engineId: "fal_reference_edit",
    status: "preview",
    blockerReason: "Same as reference edit — provider not validated.",
    credits: "5",
    envRequired: ["FAL_KEY"],
    handlerRoutes: ["/api/engine/generate"],
    gallery: true,
    refundOnFailure: true,
  },
  {
    label: "Match Style",
    group: "edit",
    toolId: "match_style",
    modelModeId: "match_style",
    engineId: "fal_style_transfer",
    status: "preview",
    blockerReason:
      "Style transfer engine mapped; model id missing — not validated.",
    credits: "5",
    envRequired: ["FAL_KEY"],
    handlerRoutes: ["/api/engine/generate"],
    gallery: true,
    refundOnFailure: true,
  },
  {
    label: "Enhance Asset",
    group: "edit",
    toolId: "enhance_asset",
    modelModeId: "enhance_asset",
    engineId: "fal_image_upscale",
    status: "coming_soon",
    blockerReason: "Launch module enableEnhancer is off; upscale not promoted to active.",
    credits: "3",
    envRequired: ["FAL_KEY"],
    handlerRoutes: ["/api/engine/generate"],
    gallery: true,
    refundOnFailure: true,
  },
  {
    label: "Background Remove",
    group: "edit",
    toolId: "background_remove",
    modelModeId: "background_remove",
    engineId: "fal_background_removal",
    status: "coming_soon",
    blockerReason: "Launch module enableEnhancer is off; removal not validated.",
    credits: "2",
    envRequired: ["FAL_KEY"],
    handlerRoutes: ["/api/engine/generate"],
    gallery: true,
    refundOnFailure: true,
  },
  {
    label: "Upscale",
    group: "edit",
    toolId: "upscale_image",
    modelModeId: "upscale_image",
    engineId: "fal_image_upscale",
    status: "coming_soon",
    blockerReason: "Launch module enableEnhancer is off.",
    credits: "3",
    envRequired: ["FAL_KEY"],
    handlerRoutes: ["/api/engine/generate"],
    gallery: true,
    refundOnFailure: true,
  },
  // ── Animate ──
  {
    label: "Animate Image",
    group: "animate",
    toolId: "animate_image",
    modelModeId: "animate_image",
    engineId: "fal_kling_v3_i2v",
    status: "coming_soon",
    blockerReason: "enableImageToVideo off; I2V engine not active.",
    credits: "25",
    envRequired: ["FAL_KEY"],
    handlerRoutes: ["/api/engine/generate"],
    gallery: true,
    refundOnFailure: true,
  },
  {
    label: "Motion Transfer",
    group: "animate",
    toolId: "motion_transfer",
    modelModeId: "motion_transfer",
    engineId: "fal_motion_transfer",
    status: "coming_soon",
    blockerReason:
      "enableMotionTransfer off; prior validation failed (422 schema).",
    credits: "30–50",
    envRequired: ["FAL_KEY"],
    handlerRoutes: ["/api/live-avatar/generate"],
    gallery: true,
    refundOnFailure: true,
  },
  {
    label: "LipSync Creator",
    group: "animate",
    toolId: "lipsync_creator",
    modelModeId: "lipsync_creator",
    engineId: "fal_lipsync_sync_v2_pro",
    status: "coming_soon",
    blockerReason: "enableLipSync off; awaiting validation fixtures.",
    credits: "30–35",
    envRequired: ["FAL_KEY"],
    handlerRoutes: ["/api/lip-sync/upload", "/api/live-avatar/generate"],
    gallery: true,
    refundOnFailure: true,
  },
  {
    label: "AI Avatar",
    group: "animate",
    toolId: "ai_avatar",
    modelModeId: "ai_avatar",
    engineId: "fal_avatar_single_text",
    status: "coming_soon",
    blockerReason: "enableAvatar off; engine not validated.",
    credits: "40–50",
    envRequired: ["FAL_KEY"],
    handlerRoutes: ["/api/live-avatar/generate"],
    gallery: true,
    refundOnFailure: true,
  },
  // ── Training ──
  {
    label: "Train Creator Style",
    group: "training",
    toolId: "train_creator_style",
    modelModeId: "train_creator_style",
    engineId: "fal_lora_training",
    status: "coming_soon",
    blockerReason:
      "enableTraining off; LoRA training engine not validated; no production job queue.",
    credits: "150–300",
    envRequired: ["KREA_API_KEY"],
    handlerRoutes: ["/api/krea/train-lora", "/api/characters/train"],
    gallery: true,
    refundOnFailure: true,
  },
  {
    label: "Train Brand Kit",
    group: "training",
    toolId: "train_brand_kit",
    modelModeId: "train_brand_kit",
    engineId: "fal_lora_training",
    status: "coming_soon",
    blockerReason: "Same as Train Creator Style.",
    credits: "150–300",
    envRequired: ["KREA_API_KEY"],
    handlerRoutes: ["/api/krea/train-lora", "/api/characters/train"],
    gallery: true,
    refundOnFailure: true,
  },
  {
    label: "Train Product Model",
    group: "training",
    toolId: "train_product_model",
    modelModeId: "train_product_model",
    engineId: "fal_lora_training",
    status: "coming_soon",
    blockerReason: "Same as Train Creator Style.",
    credits: "150–300",
    envRequired: ["KREA_API_KEY"],
    handlerRoutes: ["/api/krea/train-lora", "/api/characters/train"],
    gallery: true,
    refundOnFailure: true,
  },
  {
    label: "Train Creator Identity",
    group: "training",
    toolId: "train_creator_identity",
    modelModeId: "train_creator_identity",
    engineId: "fal_lora_training",
    status: "coming_soon",
    blockerReason:
      "enableTraining off; character upload routes exist but training not validated.",
    credits: "150–300",
    envRequired: ["KREA_API_KEY"],
    handlerRoutes: [
      "/api/characters/train",
      "/api/characters/upload-reference",
    ],
    gallery: true,
    refundOnFailure: true,
  },
  // ── Advanced ──
  {
    label: "3D Object",
    group: "advanced",
    toolId: "object_3d",
    modelModeId: "object_3d",
    engineId: "fal_object_3d",
    status: "coming_soon",
    blockerReason: "enable3D off; no validated endpoint or model id.",
    credits: "30–60",
    envRequired: ["FAL_KEY"],
    handlerRoutes: ["/api/engine/generate"],
    gallery: true,
    refundOnFailure: true,
  },
  {
    label: "Audio Sound Design",
    group: "advanced",
    toolId: "audio_sound_design",
    modelModeId: "audio_sound_design",
    engineId: "fal_audio_placeholder",
    status: "coming_soon",
    blockerReason: "enableAudio off; placeholder engine — model id not mapped.",
    credits: "5–15",
    envRequired: ["FAL_KEY"],
    handlerRoutes: ["/api/engine/generate"],
    gallery: true,
    refundOnFailure: true,
  },
] as const;

export function getModelCapabilityAuditRows(
  group?: ModelCapabilityAuditRow["group"]
): readonly ModelCapabilityAuditRow[] {
  if (!group) return MODEL_CAPABILITY_AUDIT;
  return MODEL_CAPABILITY_AUDIT.filter((row) => row.group === group);
}

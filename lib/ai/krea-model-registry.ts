/**
 * InfluExAi — central Krea Model Registry
 *
 * Single source of truth for Krea-backed models (image, video, enhance, edit).
 * UI and server pipelines must read from here — never hardcode model lists in components.
 *
 * @see https://docs.krea.ai/developers/introduction
 * @see lib/ai/krea-model-registry-data.ts — add new models there
 */

import { KREA_MODEL_REGISTRY_ENTRIES } from "./krea-model-registry-data";
import {
  getDefaultKreaImageStudioModel,
  getKreaImageStudioModel,
  resolveKreaImageStudioTargetRegistryId,
  resolveSmartAutoPilotRegistryId,
  SMART_AUTO_PILOT_STUDIO_ID,
  isSmartAutoPilotStudioId,
  KREA_IMAGE_MODELS,
} from "./krea-image-studio-models";

export { KREA_IMAGE_MODELS, SMART_AUTO_PILOT_STUDIO_ID } from "./krea-image-studio-models";

export type KreaToolKey =
  | "image"
  | "video"
  | "enhancer"
  | "realtime"
  | "edit"
  | "lipsync"
  | "motion_transfer"
  | "video_restyle"
  | "3d_objects"
  | "audio"
  | "apps"
  | "product_photography"
  | "brand_assets"
  | "campaign_builder"
  | "style_profiles"
  | "batch_generator"
  | "train_lora"
  | "style_training";

/** @deprecated Use KreaToolKey */
export type InfluExAiToolKey = KreaToolKey;

export type KreaModelCategory =
  | "image"
  | "video"
  | "edit"
  | "enhancer"
  | "realtime"
  | "lipsync"
  | "motion_transfer"
  | "video_restyle"
  | "3d"
  | "audio"
  | "workflow"
  | "training"
  | "style_training";

export type KreaModelCapability =
  | "text_to_image"
  | "image_to_image"
  | "edit"
  | "upscale"
  | "enhance"
  | "text_to_video"
  | "image_to_video"
  | "video_to_video"
  | "audio_to_video"
  | "video_restyle"
  | "lipsync"
  | "motion_transfer"
  | "3d_object"
  | "text_to_audio"
  | "workflow"
  | "planning"
  | "train_lora"
  | "train_style"
  | "train_character"
  | "train_object"
  | "train_product"
  | "custom_style";

export type ModelAvailability =
  | "active"
  | "experimental"
  | "not_configured"
  | "hidden";

export type KreaModelConfig = {
  id: string;
  label: string;
  provider: "krea";
  /** Krea API path segment, e.g. `bfl/flux-1-dev` or `google/nano-banana-pro` */
  internalModel: string;
  category: KreaModelCategory;
  tools: KreaToolKey[];
  capabilities: KreaModelCapability[];
  descriptionEn: string;
  descriptionDe: string;
  credits: number;
  outputType: "image" | "video" | "audio" | "text" | "mesh" | "style" | "model";
  availability: ModelAvailability;
  isRecommended?: boolean;
  isPremium?: boolean;
  /** API route kind — derived from category when omitted */
  endpointKind?: "image" | "video" | "enhance" | "training";
  /** InfluExAi workflow keys that default to this model */
  workflowKeys?: string[];
  /** Env var that can override `internalModel` path (server-only) */
  envOverride?: string;
  /** Required input fields before generation can run */
  requires?: string[];
  /** @deprecated Use internalModel */
  model?: string;
  /** @deprecated Use descriptionEn */
  description?: string;
};

/** Default model id per InfluExAi tool workspace */
export const TOOL_DEFAULT_KREA_MODEL_ID: Partial<Record<KreaToolKey, string>> = {
  image: "krea-2-large",
  video: "kling-3",
  enhancer: "topaz-standard",
  realtime: "flux-1-dev",
  edit: "nano-banana-pro",
  product_photography: "imagen-4",
  brand_assets: "flux-11-pro",
  "3d_objects": "krea-3d-render",
  video_restyle: "runway-gen-45",
  batch_generator: "flux-1-dev",
  campaign_builder: "krea-2-large",
  train_lora: "style_lora_training",
  style_training: "style_lora_training",
};

/** Default model id per generation workflow key */
export const WORKFLOW_DEFAULT_KREA_MODEL_ID: Record<string, string> = {
  standard: "flux-1-dev",
  fast_draft: "flux-1-dev",
  ugc_look: "flux-1-dev",
  premium_image: "flux-11-pro",
  brand_assets: "flux-11-pro",
  reference_edit: "nano-banana-pro",
  enhance_asset: "topaz-standard",
  video_image_to_video: "kling-3",
};

const REGISTRY_BY_ID = new Map<string, KreaModelConfig>(
  KREA_MODEL_REGISTRY_ENTRIES.map((entry) => [entry.id, entry])
);

const REGISTRY_BY_PATH = new Map<string, KreaModelConfig>(
  KREA_MODEL_REGISTRY_ENTRIES.map((entry) => [
    normalizeModelPath(getKreaInternalModel(entry)),
    entry,
  ])
);

function normalizeModelPath(path: string): string {
  return path.replace(/^\/+/, "");
}

/** DB `generations.model` — keeps legacy `krea/{vendor}/…` shape without double prefix. */
function toStoredModelPath(apiPath: string): string {
  const path = normalizeModelPath(apiPath);
  if (path.startsWith("krea/krea/")) return path;
  if (
    path.startsWith("bfl/") ||
    path.startsWith("google/") ||
    path.startsWith("kling/") ||
    path.startsWith("enhance/")
  ) {
    return `krea/${path}`;
  }
  return path;
}

/** Resolved Krea API path for a registry entry. */
export function getKreaInternalModel(entry: KreaModelConfig): string {
  return entry.internalModel ?? entry.model ?? "";
}

/** True when the registry entry is a LoRA / style training workflow (not image generate). */
export function isKreaTrainingModel(entry: KreaModelConfig): boolean {
  return entry.category === "training" || entry.category === "style_training";
}

/** Krea training API path segment (e.g. styles/train). */
export function isKreaTrainingApiPath(modelPath: string): boolean {
  return modelPath.trim().startsWith("styles/");
}

/** True when internalModel is a real Krea API path segment (not a placeholder). */
export function isExecutableModelPath(modelPath: string): boolean {
  const path = modelPath.trim();
  return (
    path.length > 0 &&
    !path.startsWith("pending/") &&
    !path.startsWith("resolver/")
  );
}

/** Image generate picker / /api/krea/image/generate must exclude training workflows. */
export function isKreaImageGenerationModel(entry: KreaModelConfig): boolean {
  if (isKreaTrainingModel(entry)) return false;
  if (entry.endpointKind === "training") return false;
  return entry.category === "image" || entry.category === "edit";
}

/**
 * Resolves the Krea API model path for a studio id or registry id.
 * Smart Auto-Pilot routes to verified fallbacks — never sends "auto" to the API.
 */
export function resolveKreaInternalModel(
  modelId: string,
  tool?: KreaToolKey
): string {
  const studio = getKreaImageStudioModel(modelId);
  if (studio) {
    if (
      studio.availability === "not_configured" ||
      studio.availability === "hidden"
    ) {
      throw new Error("MODEL_NOT_CONFIGURED");
    }
    const registryId = resolveKreaImageStudioTargetRegistryId(studio);
    return resolveKreaInternalModel(registryId, tool ?? "image");
  }

  if (isSmartAutoPilotStudioId(modelId) || modelId === "smart-auto-pilot") {
    return resolveKreaInternalModel(resolveSmartAutoPilotRegistryId(), tool ?? "image");
  }

  const entry = getKreaModelById(modelId.trim());
  if (!entry) {
    throw new Error("MODEL_NOT_CONFIGURED");
  }
  if (entry.provider !== "krea") {
    throw new Error("MODEL_NOT_CONFIGURED");
  }
  if (isKreaTrainingModel(entry)) {
    if (tool !== "train_lora" && tool !== "style_training") {
      throw new Error("MODEL_NOT_CONFIGURED");
    }
    const trainingPath = getKreaInternalModel(entry);
    if (!trainingPath || !isKreaTrainingApiPath(trainingPath)) {
      throw new Error("MODEL_NOT_CONFIGURED");
    }
    return trainingPath;
  }
  if (tool && !entry.tools.includes(tool)) {
    throw new Error("MODEL_NOT_CONFIGURED");
  }
  if (!isKreaModelExecutable(entry)) {
    throw new Error("MODEL_NOT_CONFIGURED");
  }

  const workflow = entry.workflowKeys?.[0] ?? "standard";
  const path = resolveKreaModelPath(entry.id, { workflow });
  if (!path || !isExecutableModelPath(path)) {
    throw new Error("MODEL_NOT_CONFIGURED");
  }
  return path;
}

export function getKreaModelDescription(
  entry: KreaModelConfig,
  language: "en" | "de" = "en"
): string {
  if (language === "de") {
    return entry.descriptionDe || entry.descriptionEn || entry.description || entry.label;
  }
  return entry.descriptionEn || entry.description || entry.label;
}

export function isKreaModelExecutable(entry: KreaModelConfig): boolean {
  return (
    entry.availability === "active" || entry.availability === "experimental"
  );
}

export function isKreaModelConfigured(entry: KreaModelConfig): boolean {
  return entry.availability !== "not_configured";
}

export function assertKreaModelExecutable(modelId: string): KreaModelConfig {
  const entry = getKreaModelById(modelId.trim());
  if (!entry) {
    throw new Error(`Unknown model: ${modelId}`);
  }
  if (!isKreaModelExecutable(entry)) {
    if (entry.availability === "not_configured") {
      throw new Error(
        `Model "${entry.label}" is not configured yet — generation is disabled.`
      );
    }
    throw new Error(`Model "${entry.label}" is not available for generation.`);
  }
  return entry;
}

export function assertKreaModelPathExecutable(modelPath: string): KreaModelConfig {
  const entry = getKreaModelByPath(modelPath);
  if (!entry) {
    throw new Error(`Unknown Krea model path: ${modelPath}`);
  }
  if (!isKreaModelExecutable(entry)) {
    throw new Error(
      `Model path "${modelPath}" is not configured for generation.`
    );
  }
  return entry;
}

export function getKreaModelRegistry(): readonly KreaModelConfig[] {
  return KREA_MODEL_REGISTRY_ENTRIES;
}

export function getKreaModelById(id: string): KreaModelConfig | undefined {
  return REGISTRY_BY_ID.get(id);
}

export function getKreaModelByPath(modelPath: string): KreaModelConfig | undefined {
  return REGISTRY_BY_PATH.get(normalizeModelPath(modelPath));
}

export type GetModelsForToolOptions = {
  /** Include hidden / not_configured entries */
  includeUnavailable?: boolean;
  /** Only active + experimental (selectable in UI) */
  selectableOnly?: boolean;
};

export function getKreaModelsForTool(
  tool: KreaToolKey,
  options: GetModelsForToolOptions = {}
): KreaModelConfig[] {
  const { includeUnavailable = false, selectableOnly = true } = options;

  return KREA_MODEL_REGISTRY_ENTRIES.filter((entry) => {
    if (
      getKreaInternalModel(entry).toLowerCase().startsWith("fal/")
    ) {
      return false;
    }
    if (!entry.tools.includes(tool)) return false;
    if (entry.availability === "hidden") return false;
    if (selectableOnly && !includeUnavailable) {
      return isKreaModelExecutable(entry);
    }
    if (!includeUnavailable && entry.availability === "not_configured") {
      return false;
    }
    return true;
  }).sort(sortModelsForDisplay);
}

/** Full catalog including not_configured models (for settings / admin UI). */
export function getKreaModelCatalogForTool(tool: KreaToolKey): KreaModelConfig[] {
  return getKreaModelsForTool(tool, {
    includeUnavailable: true,
    selectableOnly: false,
  });
}

export function getDefaultKreaModelForTool(
  tool: KreaToolKey
): KreaModelConfig | undefined {
  const preferredId = TOOL_DEFAULT_KREA_MODEL_ID[tool];
  if (preferredId) {
    const preferred = getKreaModelById(preferredId);
    if (
      preferred &&
      preferred.tools.includes(tool) &&
      isKreaModelExecutable(preferred)
    ) {
      return preferred;
    }
  }

  const models = getKreaModelsForTool(tool);
  return (
    models.find((m) => m.isRecommended) ??
    models.find((m) => m.availability === "active") ??
    models[0]
  );
}

export function getDefaultKreaModelForWorkflow(
  workflow: string
): KreaModelConfig | undefined {
  const id = WORKFLOW_DEFAULT_KREA_MODEL_ID[workflow];
  if (id) {
    const entry = getKreaModelById(id);
    if (entry && isKreaModelExecutable(entry)) return entry;
  }
  return undefined;
}

/**
 * Resolves the Krea API model path for a registry id, with optional env override.
 * Server-only when envOverride is used.
 */
export function resolveKreaModelPath(
  modelId: string,
  options?: { workflow?: string; allowNotConfigured?: boolean }
): string | null {
  const entry = getKreaModelById(modelId);
  if (entry) {
    if (!options?.allowNotConfigured && !isKreaModelExecutable(entry)) {
      return null;
    }
    const fromEnv = readEnvOverride(entry.envOverride);
    if (fromEnv) return normalizeModelPath(fromEnv);
    return normalizeModelPath(getKreaInternalModel(entry));
  }

  if (options?.workflow) {
    const workflowDefault = getDefaultKreaModelForWorkflow(options.workflow);
    if (workflowDefault) {
      const fromEnv = readEnvOverride(workflowDefault.envOverride);
      if (fromEnv) return normalizeModelPath(fromEnv);
      return normalizeModelPath(getKreaInternalModel(workflowDefault));
    }
  }

  return null;
}

/** Stored in DB as `krea/{path}` */
export function resolveKreaStoredModelId(modelId: string, workflow?: string): string {
  const path = resolveKreaModelPath(modelId, { workflow });
  if (!path) return `krea/unknown/${modelId}`;
  return toStoredModelPath(path);
}

export function resolveKreaModelPathForWorkflow(
  workflow: string,
  modelId?: string
): string {
  if (modelId) {
    const fromId = resolveKreaModelPath(modelId, { workflow });
    if (fromId) return fromId;
    assertKreaModelExecutable(modelId);
  }

  const workflowEntry = getDefaultKreaModelForWorkflow(workflow);
  if (workflowEntry) {
    const fromEnv = readEnvOverride(workflowEntry.envOverride);
    if (fromEnv) return normalizeModelPath(fromEnv);
    return normalizeModelPath(getKreaInternalModel(workflowEntry));
  }

  return resolveLegacyEnvModelPath(workflow);
}

export function resolveKreaStoredModelForWorkflow(
  workflow: string,
  modelId?: string
): string {
  const path = resolveKreaModelPathForWorkflow(workflow, modelId);
  return `krea/${path.replace(/^\/+/, "")}`;
}

export function isKreaModelSelectable(entry: KreaModelConfig): boolean {
  return isKreaModelExecutable(entry);
}

export type KreaModelSelectOption = {
  value: string;
  label: string;
  note?: string;
  noteEn?: string;
  noteDe?: string;
  credits?: number;
  isPremium?: boolean;
  isRecommended?: boolean;
  availability: ModelAvailability;
};

export function toKreaModelSelectOptions(
  models: readonly KreaModelConfig[],
  language: "en" | "de" = "en"
): KreaModelSelectOption[] {
  return models.map((entry) => ({
    value: entry.id,
    label: entry.label,
    note: getKreaModelDescription(entry, language),
    noteEn: getKreaModelDescription(entry, "en"),
    noteDe: getKreaModelDescription(entry, "de"),
    credits: entry.credits,
    isPremium: entry.isPremium,
    isRecommended: entry.isRecommended,
    availability: entry.availability,
  }));
}

export function getKreaModelSelectOptionsForTool(
  tool: KreaToolKey,
  language: "en" | "de" = "en"
): KreaModelSelectOption[] {
  return toKreaModelSelectOptions(getKreaModelsForTool(tool), language);
}

export type KreaImageModelResolution =
  | {
      ok: true;
      entry: KreaModelConfig;
      modelPath: string;
      storedModel: string;
      credits: number;
      workflow: string;
      /** White-label studio id when request used KREA_IMAGE_MODELS */
      studioModelId?: string;
    }
  | {
      ok: false;
      error: string;
      reason: "unknown_model" | "model_not_configured" | "invalid_tool" | "no_models";
      status: number;
    };

/** Server-side resolution for POST /api/krea/image/generate */
export function resolveKreaImageGenerationModel(
  kreaModelId?: string
): KreaImageModelResolution {
  const studioModel = kreaModelId?.trim()
    ? getKreaImageStudioModel(kreaModelId)
    : undefined;
  const defaultStudio = getDefaultKreaImageStudioModel();
  const fallbackRegistry = getDefaultKreaModelForTool("image");

  let registryId: string | undefined;
  let billingCredits: number | undefined;
  let studioEntryId: string | undefined;

  if (studioModel) {
    if (
      studioModel.availability === "not_configured" ||
      studioModel.availability === "hidden"
    ) {
      return {
        ok: false,
        error: `Model "${studioModel.label}" is not configured yet — generation is disabled.`,
        reason: "model_not_configured",
        status: 400,
      };
    }

    registryId = resolveKreaImageStudioTargetRegistryId(studioModel);
    billingCredits = studioModel.credits;
    studioEntryId = studioModel.id;
  } else if (kreaModelId?.trim()) {
    registryId = kreaModelId.trim();
  } else {
    registryId = resolveKreaImageStudioTargetRegistryId(defaultStudio);
    billingCredits = defaultStudio.credits;
    studioEntryId = defaultStudio.id;
  }

  if (!registryId) {
    return {
      ok: false,
      error: "No image model is configured.",
      reason: "no_models",
      status: 503,
    };
  }

  const entry = getKreaModelById(registryId);
  if (!entry) {
    return {
      ok: false,
      error: `Unknown model: ${kreaModelId ?? registryId}`,
      reason: "unknown_model",
      status: 400,
    };
  }

  if (isKreaTrainingModel(entry)) {
    return {
      ok: false,
      error: `Model "${entry.label}" is a training workflow — use Style Training, not Image Generate.`,
      reason: "invalid_tool",
      status: 400,
    };
  }

  if (!entry.tools.includes("image")) {
    return {
      ok: false,
      error: `Model "${entry.label}" is not available for image generation.`,
      reason: "invalid_tool",
      status: 400,
    };
  }

  if (!isKreaModelExecutable(entry)) {
    return {
      ok: false,
      error: `Model "${entry.label}" is not configured yet — generation is disabled.`,
      reason: "model_not_configured",
      status: 400,
    };
  }

  if (entry.provider !== "krea") {
    return {
      ok: false,
      error: `Model "${entry.label}" is not available on the processing engine.`,
      reason: "model_not_configured",
      status: 400,
    };
  }

  const workflow = entry.workflowKeys?.[0] ?? "standard";

  const resolveId = studioEntryId ?? kreaModelId?.trim() ?? registryId;
  let modelPath: string;
  try {
    modelPath = resolveKreaInternalModel(resolveId, "image");
  } catch {
    return {
      ok: false,
      error: `Model "${entry.label}" could not be resolved.`,
      reason: "model_not_configured",
      status: 400,
    };
  }

  if (!isExecutableModelPath(modelPath)) {
    return {
      ok: false,
      error: `Model "${entry.label}" could not be resolved.`,
      reason: "model_not_configured",
      status: 400,
    };
  }

  return {
    ok: true,
    entry,
    modelPath,
    storedModel: resolveKreaStoredModelId(registryId, workflow),
    credits: billingCredits ?? entry.credits,
    workflow,
    studioModelId: studioEntryId,
  };
}

function sortModelsForDisplay(a: KreaModelConfig, b: KreaModelConfig): number {
  if (a.isRecommended !== b.isRecommended) {
    return a.isRecommended ? -1 : 1;
  }
  if (a.availability !== b.availability) {
    const order: ModelAvailability[] = [
      "active",
      "experimental",
      "not_configured",
      "hidden",
    ];
    return order.indexOf(a.availability) - order.indexOf(b.availability);
  }
  return a.label.localeCompare(b.label);
}

function readEnvOverride(key?: string): string | null {
  if (!key || typeof process === "undefined") return null;
  const value = process.env[key]?.trim();
  return value ? value : null;
}

/** @deprecated Use registry — retained for env-only overrides not yet in catalog */
function resolveLegacyEnvModelPath(workflow: string): string {
  const fallback =
    process.env.KREA_IMAGE_MODEL_PATH?.trim() || "bfl/flux-1-dev";

  switch (workflow) {
    case "fast_draft":
      return (
        process.env.KREA_MODEL_FAST_DRAFT?.trim() ||
        process.env.KREA_FAST_DRAFT_MODEL_PATH?.trim() ||
        fallback
      );
    case "premium_image":
    case "krea_premium_image":
      return (
        process.env.KREA_MODEL_PREMIUM?.trim() ||
        process.env.KREA_PREMIUM_MODEL_PATH?.trim() ||
        fallback
      );
    case "brand_assets":
      return (
        process.env.KREA_MODEL_BRAND?.trim() ||
        process.env.KREA_BRAND_MODEL_PATH?.trim() ||
        fallback
      );
    case "ugc_look":
      return (
        process.env.KREA_MODEL_UGC?.trim() ||
        process.env.KREA_UGC_MODEL_PATH?.trim() ||
        fallback
      );
    case "reference_edit":
      return (
        process.env.KREA_MODEL_REFERENCE_EDIT?.trim() || "google/nano-banana-pro"
      );
    case "video_image_to_video":
      return (
        process.env.KREA_MODEL_VIDEO?.trim() ||
        process.env.KREA_VIDEO_MODEL_PATH?.trim() ||
        "kling/kling-2.5"
      );
    case "enhance_asset":
      return (
        process.env.KREA_MODEL_ENHANCE?.trim() || "topaz/standard-enhance"
      );
    case "standard":
    default:
      return (
        process.env.KREA_MODEL_STANDARD?.trim() ||
        process.env.KREA_STANDARD_MODEL_PATH?.trim() ||
        fallback
      );
  }
}

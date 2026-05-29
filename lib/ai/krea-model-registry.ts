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
  | "workflow";

export type InfluExAiToolKey =
  | "image"
  | "video"
  | "enhancer"
  | "realtime"
  | "edit"
  | "lipsync"
  | "motion_transfer"
  | "3d_objects"
  | "video_restyle"
  | "audio"
  | "apps"
  | "product_photography"
  | "brand_assets"
  | "campaign_builder"
  | "style_profiles"
  | "batch_generator";

export type ModelAvailability =
  | "active"
  | "experimental"
  | "not_configured"
  | "hidden";

export type KreaModelCapability =
  | "text_to_image"
  | "image_to_image"
  | "edit"
  | "upscale"
  | "enhance"
  | "text_to_video"
  | "image_to_video"
  | "video_to_video"
  | "video_restyle"
  | "lipsync"
  | "motion_transfer"
  | "3d_object"
  | "audio"
  | "workflow";

export type KreaModelConfig = {
  id: string;
  label: string;
  provider: "krea";
  /** Krea API path segment, e.g. `bfl/flux-1-dev` or `google/nano-banana-pro` */
  model: string;
  category: KreaModelCategory;
  tools: InfluExAiToolKey[];
  capabilities: KreaModelCapability[];
  description?: string;
  credits: number;
  availability: ModelAvailability;
  outputType: "image" | "video" | "audio" | "text" | "mesh";
  requires?: string[];
  isPremium?: boolean;
  isRecommended?: boolean;
  /** API route kind — derived from category when omitted */
  endpointKind?: "image" | "video" | "enhance";
  /** InfluExAi workflow keys that default to this model */
  workflowKeys?: string[];
  /** Env var that can override `model` path (server-only) */
  envOverride?: string;
};

/** Default model id per InfluExAi tool workspace */
export const TOOL_DEFAULT_KREA_MODEL_ID: Partial<Record<InfluExAiToolKey, string>> = {
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
  video_image_to_video: "kling-25",
};

const REGISTRY_BY_ID = new Map<string, KreaModelConfig>(
  KREA_MODEL_REGISTRY_ENTRIES.map((entry) => [entry.id, entry])
);

const REGISTRY_BY_PATH = new Map<string, KreaModelConfig>(
  KREA_MODEL_REGISTRY_ENTRIES.map((entry) => [normalizeModelPath(entry.model), entry])
);

function normalizeModelPath(path: string): string {
  return path.replace(/^\/+/, "").replace(/^krea\//, "");
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
  tool: InfluExAiToolKey,
  options: GetModelsForToolOptions = {}
): KreaModelConfig[] {
  const { includeUnavailable = false, selectableOnly = true } = options;

  return KREA_MODEL_REGISTRY_ENTRIES.filter((entry) => {
    if (!entry.tools.includes(tool)) return false;
    if (entry.availability === "hidden") return false;
    if (selectableOnly && !includeUnavailable) {
      return entry.availability === "active" || entry.availability === "experimental";
    }
    if (!includeUnavailable && entry.availability === "not_configured") {
      return false;
    }
    return true;
  }).sort(sortModelsForDisplay);
}

export function getDefaultKreaModelForTool(
  tool: InfluExAiToolKey
): KreaModelConfig | undefined {
  const preferredId = TOOL_DEFAULT_KREA_MODEL_ID[tool];
  if (preferredId) {
    const preferred = getKreaModelById(preferredId);
    if (preferred && preferred.tools.includes(tool)) return preferred;
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
  if (id) return getKreaModelById(id);
  return undefined;
}

/**
 * Resolves the Krea API model path for a registry id, with optional env override.
 * Server-only when envOverride is used.
 */
export function resolveKreaModelPath(
  modelId: string,
  options?: { workflow?: string }
): string | null {
  const entry = getKreaModelById(modelId);
  if (entry) {
    const fromEnv = readEnvOverride(entry.envOverride);
    if (fromEnv) return normalizeModelPath(fromEnv);
    return normalizeModelPath(entry.model);
  }

  if (options?.workflow) {
    const workflowDefault = getDefaultKreaModelForWorkflow(options.workflow);
    if (workflowDefault) {
      const fromEnv = readEnvOverride(workflowDefault.envOverride);
      if (fromEnv) return normalizeModelPath(fromEnv);
      return normalizeModelPath(workflowDefault.model);
    }
  }

  return null;
}

/** Stored in DB as `krea/{path}` */
export function resolveKreaStoredModelId(modelId: string, workflow?: string): string {
  const path = resolveKreaModelPath(modelId, { workflow });
  if (!path) return `krea/unknown/${modelId}`;
  return `krea/${path}`;
}

export function resolveKreaModelPathForWorkflow(
  workflow: string,
  modelId?: string
): string {
  if (modelId) {
    const fromId = resolveKreaModelPath(modelId, { workflow });
    if (fromId) return fromId;
  }

  const workflowEntry = getDefaultKreaModelForWorkflow(workflow);
  if (workflowEntry) {
    const fromEnv = readEnvOverride(workflowEntry.envOverride);
    if (fromEnv) return normalizeModelPath(fromEnv);
    return normalizeModelPath(workflowEntry.model);
  }

  // Legacy env fallbacks (kept for backwards compatibility)
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
  return entry.availability === "active" || entry.availability === "experimental";
}

export type KreaModelSelectOption = {
  value: string;
  label: string;
  note?: string;
  credits?: number;
  isPremium?: boolean;
  isRecommended?: boolean;
  availability: ModelAvailability;
};

export function toKreaModelSelectOptions(
  models: readonly KreaModelConfig[]
): KreaModelSelectOption[] {
  return models.map((entry) => ({
    value: entry.id,
    label: entry.label,
    note: entry.description,
    credits: entry.credits,
    isPremium: entry.isPremium,
    isRecommended: entry.isRecommended,
    availability: entry.availability,
  }));
}

export function getKreaModelSelectOptionsForTool(
  tool: InfluExAiToolKey
): KreaModelSelectOption[] {
  return toKreaModelSelectOptions(getKreaModelsForTool(tool));
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

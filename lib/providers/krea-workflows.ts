import {
  resolveKreaModelPathForWorkflow as resolveRegistryModelPath,
  resolveKreaStoredModelForWorkflow as resolveRegistryStoredModel,
} from "@/lib/ai/krea-model-registry";

/** Server-only feature gate (ENABLE_KREA_PROVIDER). */
export function isKreaEnabled(): boolean {
  return process.env.ENABLE_KREA_PROVIDER === "true";
}

/** Image workflows routed through Krea when enabled (workflow keys preserved). */
export const KREA_IMAGE_WORKFLOWS = [
  "standard",
  "fast_draft",
  "ugc_look",
  "premium_image",
  "brand_assets",
  "reference_edit",
  "krea_premium_image",
] as const;

export type KreaImageWorkflow = (typeof KREA_IMAGE_WORKFLOWS)[number];

export function isLegacyOpenAiEnabled(): boolean {
  return process.env.ENABLE_LEGACY_OPENAI === "true";
}

export function isLegacyFalEnabled(): boolean {
  return process.env.ENABLE_LEGACY_FAL === "true";
}

export function isKreaImageWorkflow(workflow: string): boolean {
  return (KREA_IMAGE_WORKFLOWS as readonly string[]).includes(workflow);
}

export function shouldUseKreaForImageWorkflow(workflow: string): boolean {
  if (!isKreaEnabled()) return false;
  if (!isKreaImageWorkflow(workflow)) return false;

  if (workflow === "standard" || workflow === "ugc_look") {
    return !isLegacyOpenAiEnabled();
  }

  return !isLegacyFalEnabled();
}

export function shouldUseKreaForVideoWorkflow(workflow: string): boolean {
  if (!isKreaEnabled()) return false;
  if (workflow !== "video_image_to_video") return false;
  return !isLegacyFalEnabled();
}

export function isKreaEnhanceEnabled(): boolean {
  if (process.env.ENABLE_KREA_ENHANCE === "false") return false;
  if (process.env.ENABLE_KREA_ENHANCE === "true") return isKreaEnabled();
  return isKreaEnabled();
}

export function shouldUseKreaForEnhanceWorkflow(workflow: string): boolean {
  if (!isKreaEnhanceEnabled()) return false;
  return workflow === "enhance_asset";
}

/** Krea API model path segment (not the stored `krea/...` id). */
export function resolveKreaModelPathForWorkflow(
  workflow: string,
  modelId?: string
): string {
  return resolveRegistryModelPath(workflow, modelId);
}

export function resolveKreaStoredModelForWorkflow(
  workflow: string,
  modelId?: string
): string {
  return resolveRegistryStoredModel(workflow, modelId);
}

export function normalizeKreaWorkflowKey(workflow: string): string {
  if (workflow === "krea_premium_image") return "premium_image";
  return workflow;
}

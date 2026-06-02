import {
  resolveKreaModelPathForWorkflow as resolveRegistryModelPath,
  resolveKreaStoredModelForWorkflow as resolveRegistryStoredModel,
} from "@/lib/ai/krea-model-registry";

/** Server-only feature gate — Krea-first when API key is present unless disabled. */
export function isKreaEnabled(): boolean {
  if (process.env.ENABLE_KREA_PROVIDER === "false") return false;
  if (process.env.ENABLE_KREA_PROVIDER === "true") return true;
  return Boolean(process.env.KREA_API_KEY?.trim());
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

/** @deprecated Legacy providers removed — always false. */
export function isLegacyOpenAiEnabled(): boolean {
  return false;
}

/** @deprecated Legacy fal image modes — use isFalProviderEnabled() for engine registry. */
export function isLegacyFalEnabled(): boolean {
  if (process.env.ENABLE_FAL_PROVIDER === "false") return false;
  return Boolean(process.env.FAL_KEY?.trim());
}

export function isKreaImageWorkflow(workflow: string): boolean {
  return (KREA_IMAGE_WORKFLOWS as readonly string[]).includes(workflow);
}

export function shouldUseKreaForImageWorkflow(workflow: string): boolean {
  if (!isKreaEnabled()) return false;
  return isKreaImageWorkflow(workflow);
}

export function shouldUseKreaForVideoWorkflow(
  workflow: string,
  modelId?: string
): boolean {
  if (!isKreaEnabled()) return false;
  if (workflow !== "video_image_to_video") return false;
  if (modelId?.trim()) {
    const path = resolveKreaModelPathForWorkflow(workflow, modelId);
    if (path?.toLowerCase().startsWith("fal/")) return false;
  }
  return true;
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
  const key = workflow.trim().toLowerCase();
  if (key === "krea_premium_image") return "premium_image";
  return key;
}

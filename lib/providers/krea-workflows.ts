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
export function resolveKreaModelPathForWorkflow(workflow: string): string {
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
        process.env.KREA_MODEL_REFERENCE_EDIT?.trim() ||
        "google/nano-banana-pro"
      );
    case "video_image_to_video":
      return (
        process.env.KREA_MODEL_VIDEO?.trim() ||
        process.env.KREA_VIDEO_MODEL_PATH?.trim() ||
        "kling/kling-2.5"
      );
    case "enhance_asset":
      return (
        process.env.KREA_MODEL_ENHANCE?.trim() ||
        "enhance/topaz/standard-enhance"
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

export function resolveKreaStoredModelForWorkflow(workflow: string): string {
  const path = resolveKreaModelPathForWorkflow(workflow).replace(/^\/+/, "");
  return `krea/${path}`;
}

export function normalizeKreaWorkflowKey(workflow: string): string {
  if (workflow === "krea_premium_image") return "premium_image";
  return workflow;
}

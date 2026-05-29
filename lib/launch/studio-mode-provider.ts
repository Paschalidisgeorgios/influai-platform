import { publicLaunchFlags } from "./public-flags";

/** Client-safe provider name for studio debug (mirrors server routing flags). */
export type StudioModeProviderName = "krea" | "openai" | "fal" | "disabled";

const IMAGE_WORKFLOWS = new Set([
  "standard",
  "fast_draft",
  "ugc_look",
  "premium_image",
  "brand_assets",
  "reference_edit",
  "enhance_asset",
  "krea_premium_image",
]);

/**
 * Resolves which provider backs a workflow given NEXT_PUBLIC_* flags.
 * Mirrors `lib/providers/krea-workflows.ts` without server env access.
 */
export function resolvePublicStudioProvider(
  workflow: string
): StudioModeProviderName {
  const normalized =
    workflow === "krea_premium_image" ? "premium_image" : workflow;

  if (normalized === "enhance_asset") {
    if (!publicLaunchFlags.kreaProvider) return "disabled";
    return publicLaunchFlags.legacyFal ? "fal" : "krea";
  }

  if (!IMAGE_WORKFLOWS.has(normalized) && normalized !== "video_image_to_video") {
    if (!publicLaunchFlags.kreaProvider) return "fal";
    return "fal";
  }

  if (!publicLaunchFlags.kreaProvider) {
    if (normalized === "standard" || normalized === "ugc_look") {
      return "openai";
    }
    return "fal";
  }

  if (normalized === "standard" || normalized === "ugc_look") {
    return publicLaunchFlags.legacyOpenAi ? "openai" : "krea";
  }

  if (normalized === "video_image_to_video") {
    return publicLaunchFlags.legacyFal ? "fal" : "krea";
  }

  return publicLaunchFlags.legacyFal ? "fal" : "krea";
}

export function resolveWorkflowForImageMode(imageMode: string): string {
  if (imageMode === "enhance_asset") return "enhance_asset";
  return imageMode;
}

export function getPublicImageModeCredits(workflow: string): number {
  const key = workflow === "krea_premium_image" ? "premium_image" : workflow;

  switch (key) {
    case "ugc_look":
      return 2;
    case "premium_image":
      return 3;
    case "enhance_asset":
      return 4;
    case "brand_assets":
      return 4;
    case "reference_edit":
      return 5;
    case "fast_draft":
    case "standard":
    default:
      return 1;
  }
}

export function formatStudioProviderDebugLine(
  imageMode: string,
  studioTab?: string
): string {
  const workflow =
    studioTab === "video"
      ? "video_image_to_video"
      : resolveWorkflowForImageMode(imageMode);
  const provider = resolvePublicStudioProvider(workflow);
  const credits =
    studioTab === "video"
      ? 25
      : studioTab === "lip_sync"
        ? 30
        : getPublicImageModeCredits(workflow);

  return `provider: ${provider} · workflow: ${workflow} · credits: ${credits}`;
}

export function isImageModeKreaBacked(imageMode: string): boolean {
  const workflow = resolveWorkflowForImageMode(imageMode);
  return resolvePublicStudioProvider(workflow) === "krea";
}

/**
 * Central launch configuration — gates MVP vs experimental modules.
 * Server and client code may import; never expose provider secrets here.
 *
 * Strategic lock: docs/LAUNCH_PRIORITY_LOCK.md
 */

/** Bump when launch priority rules or MVP matrix change. */
export const LAUNCH_PRIORITY_LOCK_VERSION = 1;

/**
 * Primary Create-page actions in display order.
 * Social Asset Pack first — primary differentiator (see LAUNCH_PRIORITY_LOCK.md).
 */
export const LAUNCH_PRIMARY_DASHBOARD_ACTIONS = [
  "social-asset-pack",
  "create-image",
  "create-video",
] as const;

export type LaunchPrimaryDashboardActionId =
  (typeof LAUNCH_PRIMARY_DASHBOARD_ACTIONS)[number];

/** North-star creator workflow — documentation and UX alignment. */
export const LAUNCH_CREATOR_WORKFLOW_CHAIN = [
  "idea",
  "prompt_assist",
  "social_asset_pack",
  "creative_score",
  "improve",
  "export",
  "gallery",
  "reuse",
] as const;

export type LaunchCreatorWorkflowStep =
  (typeof LAUNCH_CREATOR_WORKFLOW_CHAIN)[number];

/**
 * Primary dashboard create actions (home cards). Other categories still list all tools;
 * each tool resolves to live only when validated (`resolve-tool` + `tool-activation`).
 */
export const LAUNCH_ACTIVE_CREATOR_TOOL_IDS = [
  "social_asset_pack",
  "create_image",
  "create_video",
  "check_creative_score",
  "hooks_captions",
  "export_pack",
] as const;

export type LaunchActiveCreatorToolId =
  (typeof LAUNCH_ACTIVE_CREATOR_TOOL_IDS)[number];

/** Runnable model modes for MVP (image + text-to-video only). */
export const LAUNCH_ACTIVE_MODEL_MODE_IDS = [
  "auto_image",
  "fast_draft_image",
  "premium_image",
  "realtime_image",
  "auto_video",
  "cinematic_text_video",
] as const;

export type LaunchActiveModelModeId =
  (typeof LAUNCH_ACTIVE_MODEL_MODE_IDS)[number];

export const LAUNCH_CONFIG = {
  launchMode: true,
  launchPriorityLock: true,
  showOnlyActiveActions: true,
  showProviderNamesToUsers: false,
  showUnvalidatedFeatures: false,
  /** Admin /internal surfaces — never linked from user nav. */
  hideInternalSurfacesFromUsers: true,
  enableImageGeneration: true,
  enableTextToVideo: true,
  enablePromptAssist: true,
  enableCreativeScore: true,
  enableSocialAssetPack: true,
  enableHooksCaptions: true,
  enableExportPack: true,
  enableGallery: true,
  enableCredits: true,
  enableExperimentalCanvasActions: false,
  /** Module routes below: preview/request-access tools stay in toolbox; pages stay off until validated. */
  enableImageToVideo: false,
  enableReferenceImage: true,
  enableReferenceEdit: true,
  enableTraining: false,
  enableLoRA: false,
  enableLipSync: false,
  enableAvatar: false,
  enable3D: false,
  enableEnhancer: false,
  enableMotionTransfer: false,
  enableAudio: false,
} as const;

/** Server-side activation matrix — see docs/MODEL_ACTIVATION_STATUS.md */
export const LAUNCH_ACTIVATION_DOC = "docs/MODEL_ACTIVATION_STATUS.md";

export type LaunchConfig = typeof LAUNCH_CONFIG;

/** Experimental / unvalidated dashboard modules (see launch-page-guard). */
export type LaunchModuleKey =
  | "imageToVideo"
  | "referenceImage"
  | "referenceEdit"
  | "training"
  | "lora"
  | "lipSync"
  | "avatar"
  | "threeD"
  | "enhancer"
  | "motionTransfer"
  | "audio";

const LAUNCH_MODULE_FLAGS: Record<LaunchModuleKey, boolean> = {
  imageToVideo: LAUNCH_CONFIG.enableImageToVideo,
  referenceImage: LAUNCH_CONFIG.enableReferenceImage,
  referenceEdit: LAUNCH_CONFIG.enableReferenceEdit,
  training: LAUNCH_CONFIG.enableTraining,
  lora: LAUNCH_CONFIG.enableLoRA,
  lipSync: LAUNCH_CONFIG.enableLipSync,
  avatar: LAUNCH_CONFIG.enableAvatar,
  threeD: LAUNCH_CONFIG.enable3D,
  enhancer: LAUNCH_CONFIG.enableEnhancer,
  motionTransfer: LAUNCH_CONFIG.enableMotionTransfer,
  audio: LAUNCH_CONFIG.enableAudio,
};

export function isLaunchFeatureEnabled(key: keyof LaunchConfig): boolean {
  return LAUNCH_CONFIG[key] === true;
}

export function isLaunchModuleEnabled(module: LaunchModuleKey): boolean {
  return LAUNCH_MODULE_FLAGS[module];
}

/** Default engine when opening Create — Social Asset Pack first. */
export function getLaunchDefaultDashboardAction(): LaunchPrimaryDashboardActionId {
  return LAUNCH_PRIMARY_DASHBOARD_ACTIONS[0];
}

/** Sort engine cards to match launch priority order. */
export function sortEnginesByLaunchPriority<
  T extends { id: string },
>(engines: readonly T[]): T[] {
  const order = LAUNCH_PRIMARY_DASHBOARD_ACTIONS;
  return [...engines].sort(
    (a, b) =>
      order.indexOf(a.id as LaunchPrimaryDashboardActionId) -
      order.indexOf(b.id as LaunchPrimaryDashboardActionId)
  );
}

/** Any experimental module route enabled (should be false at MVP launch). */
export function hasUnvalidatedModulesEnabled(): boolean {
  return (Object.values(LAUNCH_MODULE_FLAGS) as boolean[]).some(Boolean);
}

/** MVP paid render paths that must stay credit-gated. */
export function isLaunchPaidRenderFeatureEnabled(
  key:
    | "enableImageGeneration"
    | "enableTextToVideo"
    | "enableSocialAssetPack"
): boolean {
  return LAUNCH_CONFIG[key] === true;
}

export function isLaunchActiveCreatorTool(
  toolId: string
): toolId is LaunchActiveCreatorToolId {
  return (LAUNCH_ACTIVE_CREATOR_TOOL_IDS as readonly string[]).includes(
    toolId.trim()
  );
}

export function isLaunchActiveModelMode(
  modelModeId: string
): modelModeId is LaunchActiveModelModeId {
  return (LAUNCH_ACTIVE_MODEL_MODE_IDS as readonly string[]).includes(
    modelModeId.trim()
  );
}

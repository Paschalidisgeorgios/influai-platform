import { LAUNCH_CONFIG } from "@/app/lib/config/launch";

const kreaPublic = process.env.NEXT_PUBLIC_ENABLE_KREA_PROVIDER !== "false";

/** Client-safe feature flags (NEXT_PUBLIC_* only). */
export const publicLaunchFlags = {
  fastDraft: LAUNCH_CONFIG.enableImageGeneration && kreaPublic,
  premiumImage: LAUNCH_CONFIG.enableImageGeneration && kreaPublic,
  referenceEdit: LAUNCH_CONFIG.enableReferenceEdit && kreaPublic,
  brandAssets: LAUNCH_CONFIG.enableImageGeneration && kreaPublic,
  ugcLook: LAUNCH_CONFIG.enableImageGeneration && kreaPublic,
  videoStudio: LAUNCH_CONFIG.enableTextToVideo,
  enhance: LAUNCH_CONFIG.enableEnhancer,
  lipSync: LAUNCH_CONFIG.enableLipSync,
  talkingCreator: LAUNCH_CONFIG.enableAvatar,
  creatorVideo: LAUNCH_CONFIG.enableImageToVideo,
  elevenLabsTts: false,
  cinemaAgent: false,
  omniCampaignAgent: false,
  socialPlanner: false,
  watermarkedPromo: false,
  motionTransfer: false,
  /** @deprecated alias — use motionTransfer */
  liveAvatar: false,
  kreaProvider: kreaPublic,
  legacyOpenAi: false,
  legacyFal: false,
  creatifyProvider: false,
} as const;

export function isKreaPrimaryStudio(): boolean {
  return publicLaunchFlags.kreaProvider;
}

export type PublicStudioWorkspace =
  | "image"
  | "video"
  | "creator_video"
  | "lip_sync"
  | "talking_creator";

export function isPublicStudioWorkspaceEnabled(
  workspace: PublicStudioWorkspace
): boolean {
  switch (workspace) {
    case "image":
      return true;
    case "video":
      return publicLaunchFlags.videoStudio;
    case "lip_sync":
    case "creator_video":
    case "talking_creator":
      return false;
    default:
      return false;
  }
}

export type CreateStudioTab = "image" | "video" | "lip_sync";

export function resolveCreateStudioTab(
  tab: CreateStudioTab,
  options: {
    videoStudioEnabled?: boolean;
    lipSyncEnabled?: boolean;
  } = {}
): CreateStudioTab {
  const videoEnabled =
    options.videoStudioEnabled ?? publicLaunchFlags.videoStudio;
  const lipSyncEnabled = options.lipSyncEnabled ?? publicLaunchFlags.lipSync;

  if (tab === "video" && !videoEnabled) return "image";
  if (tab === "lip_sync" && !lipSyncEnabled) return "image";
  return tab;
}

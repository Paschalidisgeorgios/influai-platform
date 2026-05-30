const kreaPublic = process.env.NEXT_PUBLIC_ENABLE_KREA_PROVIDER === "true";
const enhancePublic =
  process.env.NEXT_PUBLIC_ENABLE_KREA_ENHANCE === "true" || kreaPublic;

/** Client-safe feature flags (NEXT_PUBLIC_* only). */
export const publicLaunchFlags = {
  fastDraft: kreaPublic,
  premiumImage: kreaPublic,
  referenceEdit: kreaPublic,
  brandAssets: kreaPublic,
  ugcLook: kreaPublic,
  videoStudio: kreaPublic,
  enhance: enhancePublic,
  lipSync: false,
  talkingCreator: false,
  creatorVideo: false,
  elevenLabsTts: false,
  cinemaAgent: process.env.NEXT_PUBLIC_ENABLE_CINEMA_AGENT === "true",
  omniCampaignAgent:
    process.env.NEXT_PUBLIC_ENABLE_OMNI_CAMPAIGN_AGENT === "true",
  socialPlanner: process.env.NEXT_PUBLIC_ENABLE_SOCIAL_PLANNER === "true",
  watermarkedPromo: process.env.NEXT_PUBLIC_ENABLE_WATERMARKED_PROMO === "true",
  liveAvatar: false,
  kreaProvider: kreaPublic,
  legacyOpenAi: false,
  legacyFal: false,
  creatifyProvider: process.env.NEXT_PUBLIC_ENABLE_CREATIFY_PROVIDER === "true",
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

const kreaPublic = process.env.NEXT_PUBLIC_ENABLE_KREA_PROVIDER === "true";
const legacyOpenAiPublic =
  process.env.NEXT_PUBLIC_ENABLE_LEGACY_OPENAI === "true";
const legacyFalPublic = process.env.NEXT_PUBLIC_ENABLE_LEGACY_FAL === "true";
const enhancePublic =
  process.env.NEXT_PUBLIC_ENABLE_KREA_ENHANCE === "true" || kreaPublic;

/** Client-safe feature flags (NEXT_PUBLIC_* only). */
export const publicLaunchFlags = {
  fastDraft:
    process.env.NEXT_PUBLIC_ENABLE_FAL_FAST_DRAFT === "true" || kreaPublic,
  premiumImage:
    process.env.NEXT_PUBLIC_ENABLE_FAL_PREMIUM_IMAGE === "true" || kreaPublic,
  referenceEdit:
    process.env.NEXT_PUBLIC_ENABLE_FAL_REFERENCE_EDIT === "true" || kreaPublic,
  brandAssets:
    process.env.NEXT_PUBLIC_ENABLE_FAL_BRAND_ASSETS === "true" || kreaPublic,
  ugcLook: process.env.NEXT_PUBLIC_ENABLE_UGC_LOOK === "true" || kreaPublic,
  videoStudio:
    process.env.NEXT_PUBLIC_ENABLE_FAL_VIDEO_STUDIO === "true" || kreaPublic,
  enhance: enhancePublic,
  lipSync: process.env.NEXT_PUBLIC_ENABLE_FAL_LIP_SYNC === "true",
  talkingCreator: process.env.NEXT_PUBLIC_ENABLE_TALKING_CREATOR === "true",
  creatorVideo: process.env.NEXT_PUBLIC_ENABLE_CREATOR_VIDEO === "true",
  elevenLabsTts: process.env.NEXT_PUBLIC_ENABLE_ELEVENLABS_TTS === "true",
  cinemaAgent: process.env.NEXT_PUBLIC_ENABLE_CINEMA_AGENT === "true",
  omniCampaignAgent:
    process.env.NEXT_PUBLIC_ENABLE_OMNI_CAMPAIGN_AGENT === "true",
  socialPlanner: process.env.NEXT_PUBLIC_ENABLE_SOCIAL_PLANNER === "true",
  watermarkedPromo: process.env.NEXT_PUBLIC_ENABLE_WATERMARKED_PROMO === "true",
  liveAvatar: process.env.NEXT_PUBLIC_ENABLE_LIVE_AVATAR === "true",
  kreaProvider: kreaPublic,
  legacyOpenAi: legacyOpenAiPublic,
  legacyFal: legacyFalPublic,
  creatifyProvider: process.env.NEXT_PUBLIC_ENABLE_CREATIFY_PROVIDER === "true",
} as const;

/** True when Krea is the primary image/video provider (legacy fal/openai flags off). */
export function isKreaPrimaryStudio(): boolean {
  return (
    publicLaunchFlags.kreaProvider &&
    !publicLaunchFlags.legacyOpenAi &&
    !publicLaunchFlags.legacyFal
  );
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
      return publicLaunchFlags.lipSync;
    case "creator_video":
      return publicLaunchFlags.creatorVideo;
    case "talking_creator":
      return publicLaunchFlags.talkingCreator;
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

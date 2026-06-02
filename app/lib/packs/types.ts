/**
 * Social Asset Pack — preview & render types (preview is credit-free).
 */

export type SocialAssetFormatSuggestion =
  | "TikTok"
  | "Reels"
  | "Story"
  | "Feed";

export type SocialAssetPackIncludedOutputs = {
  imageVariations: number;
  motionClips: number;
  hooks: number;
  captions: number;
  hashtags: boolean;
  creativeScore: boolean;
  exportPackage: boolean;
};

export type SocialAssetPlanItem = {
  id: string;
  label: string;
  detail?: string;
};

export type SocialAssetPackPreviewResponse = {
  packName: string;
  /** Planned outputs — text/planning only, no media generated. */
  assetPlan: SocialAssetPlanItem[];
  improvedPrompt: string;
  hooks: string[];
  captions: string[];
  hashtags: string[];
  formatSuggestions: SocialAssetFormatSuggestion[];
  includedOutputs: SocialAssetPackIncludedOutputs;
  estimatedCredits: number;
  /** Rule-based readiness hint — no asset generation in preview. */
  creativeScorePreview: {
    score: number;
    rating: "low" | "medium" | "high";
    note: string;
    positives: string[];
    improvements: string[];
    dimensions: Array<{
      id: string;
      score: number;
    }>;
  };
  exportPackageSummary: string;
};

export type SocialAssetPackPreviewRequest = {
  prompt?: string;
  language?: "en" | "de";
};

export type SocialAssetPackCopy = {
  title: string;
  description: string;
  previewCta: string;
  costNote: string;
  includedTitle: string;
  contentPlanLabel: string;
  contentPlanReady: string;
  contentPlanProgress: (ready: number, total: number) => string;
  improvedPromptLabel: string;
  hooksLabel: string;
  captionsLabel: string;
  hashtagsLabel: string;
  formatsLabel: string;
  creativeScorePreviewLabel: string;
  creativeScoreAdvisory: string;
  estimatedCostLabel: string;
  exportSummaryLabel: string;
  renderLaterCta: string;
  renderCta: string;
  renderingLabel: string;
  /** Shown near Preview Pack — no credits consumed. */
  previewFreeNote: string;
  chargeWhenRenderNote: string;
  partialRefundNote: string;
  partialVideoFailMessage: string;
  fullFailMessage: string;
  completedMessage: string;
  previewBeforeRenderNote: string;
};

export type SocialAssetPackRenderStatus =
  | "completed"
  | "partial"
  | "failed";

export type SocialAssetPackRenderRequest = {
  prompt?: string;
  language?: "en" | "de";
  improvedPrompt?: string;
};

export type SocialAssetPackAssetRef = {
  generationId: string;
  assetUrl: string;
  outputType: "image" | "video";
  slot: string;
};

export type SocialAssetPackRenderResponse = {
  success: boolean;
  packJobId: string;
  packName: string;
  status: SocialAssetPackRenderStatus;
  creditsCharged: number;
  creditsRefunded: number;
  message?: string;
  improvedPrompt: string;
  hooks: string[];
  captions: string[];
  hashtags: string[];
  formatSuggestions: SocialAssetFormatSuggestion[];
  includedOutputs: SocialAssetPackIncludedOutputs;
  estimatedCredits: number;
  creativeScore?: {
    score: number;
    rating: "low" | "medium" | "high";
    positives: string[];
    improvements: string[];
  } | null;
  assets: {
    images: SocialAssetPackAssetRef[];
    videos: SocialAssetPackAssetRef[];
  };
  creditsAfter?: number | null;
  code?: string;
};

export type SocialAssetPackRenderConfig = {
  packId: string;
  totalCredits: number;
  limits: {
    maxImageVariants: number;
    maxVideoClips: number;
    maxRetries: number;
  };
  videoDurationSeconds: 5 | 10;
  imageModelModeIds: readonly string[];
  videoModelModeId: string;
  creditAllocation: {
    perImageVariant: number;
    videoClip: number;
    copyBundle: number;
  };
  imageOutputFormats: readonly string[];
};

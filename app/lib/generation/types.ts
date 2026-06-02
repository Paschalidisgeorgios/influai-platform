/**
 * Unified generation API types — provider-neutral user responses.
 */

export type GenerateFormat = "9:16" | "1:1" | "16:9";

export type GenerateOptions = {
  preset?: string;
  format?: GenerateFormat;
  motionStyle?: string;
  duration?: number;
  sourceAssetId?: string;
  sourceAssetUrl?: string;
};

export type UnifiedGenerateRequest = {
  actionId: string;
  modelModeId?: string;
  prompt: string;
  options?: GenerateOptions;
  /** @deprecated Legacy studio format keys (square, tiktok, …) */
  outputFormat?: string;
  currentLanguage?: "en" | "de";
};

export type UserFacingSourceLabel = "Image Studio" | "Video Studio";

export type UnifiedGenerateSuccessResponse = {
  success: true;
  generationId: string;
  outputType: "image" | "video";
  assetUrl: string;
  creditsCharged: number;
  userFacingSourceLabel: UserFacingSourceLabel;
  prompt: string;
  creditsAfter?: number | null;
  campaignExpansion?: unknown;
  campaignExpansionWarning?: string;
};

export type UnifiedGenerateErrorResponse = {
  success: false;
  error: string;
  creditsCharged: number;
  refunded?: boolean;
  code?: string;
};

export type GenerationRunContext = {
  requestId: string;
  userId: string;
  generationId: string | null;
  creditsCharged: number;
  creditsRefunded: boolean;
  language: "en" | "de";
};

export const MVP_GENERATION_ACTIONS = new Set([
  "create_image",
  "create_video",
  "create_style_variant",
]);

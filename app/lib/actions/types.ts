/**
 * InfluExAi — user action layer (product modes above engine registry).
 */

export type ActionStatus =
  | "active"
  | "locked"
  | "mapped_but_unvalidated"
  | "unavailable"
  | "disabled";

export type ActionOutputType =
  | "image"
  | "video"
  | "audio"
  | "prompt"
  | "analysis"
  | "three_d"
  | "model";

export type ActionId =
  | "create_image"
  | "create_video"
  | "improve_prompt"
  | "check_creative_score"
  | "create_style_variant"
  | "animate_image"
  | "lipsync_creator"
  | "ai_avatar"
  | "enhance_asset"
  | "background_remove"
  | "upscale_image"
  | "object_3d"
  | "motion_transfer"
  | "audio_sound_design"
  | "export_asset"
  | "use_reference_image"
  | "edit_image"
  | "match_style"
  | "train_creator_style"
  | "train_brand_kit"
  | "train_product_model"
  | "train_creator_identity";

/** @deprecated Launch aliases — kept for internal callers */
export type LegacyActionId =
  | "create_campaign_image"
  | "create_video_from_text"
  | "avatar_video";

export type ActionDefinition = {
  id: ActionId;
  label: string;
  outputType: ActionOutputType;
  status: ActionStatus;
  /** Runtime engine ids (launch registry) */
  allowedEngines?: string[];
  defaultEngine?: string;
  /** Fixed action cost when no engine is involved */
  cost?: number;
  unavailableReason?: string;
  description?: string;
};

export type ClientActionView = {
  id: ActionId;
  label: string;
  outputType: ActionOutputType;
  minCredits: number;
  defaultEngineId?: string;
};

export type ResolvedActionGeneration = {
  action: ActionDefinition;
  selectedEngineId: string | null;
  provider: string;
  model: string | null;
  credits: number;
  outputType: ActionOutputType;
  runtime: {
    route?: string;
    kreaRegistryId?: string;
    falRegistryModelId?: string;
    resolvedEngineId?: string;
  };
};

export type ActionResolutionErrorCode =
  | "ACTION_UNKNOWN"
  | "ACTION_UNAVAILABLE"
  | "ACTION_NOT_ACTIVE"
  | "ENGINE_NOT_ALLOWED"
  | "ENGINE_UNAVAILABLE"
  | "ENGINE_UNKNOWN";

export class ActionResolutionError extends Error {
  constructor(
    message: string,
    public readonly code: ActionResolutionErrorCode,
    public readonly status: number = 400
  ) {
    super(message);
    this.name = "ActionResolutionError";
  }
}

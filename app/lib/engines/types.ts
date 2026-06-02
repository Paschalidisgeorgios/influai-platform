/**
 * InfluExAi — launch engine catalog types (provider-neutral registry).
 */

export type EngineStatus =
  | "active"
  | "mapped_but_unvalidated"
  | "validation_blocked_insufficient_balance"
  | "unavailable_plan_limited"
  | "failed_validation"
  | "disabled";

export type EngineProvider = "krea" | "fal" | "internal";

/** fal.ai Studio Catalog groups */
export type FalCatalogGroup =
  | "image"
  | "video_text_to_video"
  | "video_image_to_video"
  | "realtime"
  | "enhancer"
  | "edit"
  | "lipsync"
  | "avatar"
  | "motion"
  | "training"
  | "three_d"
  | "audio"
  | "utility";

export type EngineValidationStatus =
  | "passed"
  | "not_tested"
  | "blocked"
  | "failed";

export type EngineValidationMeta = {
  validationStatus: EngineValidationStatus;
  validationReason?: string;
  lastValidatedAt?: string;
  canShowToUser: boolean;
  canRunGeneration: boolean;
};

export type EngineOutputType =
  | "image"
  | "video"
  | "audio"
  | "text"
  | "mesh"
  | "three_d"
  | "model";

export type EngineCatalogEntry = {
  id: string;
  label: string;
  provider: EngineProvider;
  group?: FalCatalogGroup;
  outputType: EngineOutputType;
  status: EngineStatus;
  credits: number;
  /** fal.ai endpoint id — server only */
  model?: string | null;
  /** Env vars required on server (e.g. FAL_KEY) */
  requiresServerEnv?: string[];
  /** Image Studio picker id */
  kreaStudioId?: string;
  /** Krea registry model id for generation */
  kreaRegistryId?: string;
  /** lib/ai/model-registry fal id (legacy runtime adapter) */
  falRegistryId?: string;
  /** Blocked Krea registry ids this engine replaces */
  replacesKreaRegistryIds?: string[];
  unavailableReason?: string;
  purpose?: string;
  note?: string;
  userFacing?: boolean;
  validation?: EngineValidationMeta;
  canShowToUser?: boolean;
  canRunGeneration?: boolean;
};

/** fal.ai studio catalog row — server-side source of truth for expansion engines */
export type FalStudioCatalogEntry = EngineCatalogEntry & {
  provider: "fal";
  group: FalCatalogGroup;
  validation: EngineValidationMeta;
  canShowToUser: boolean;
  canRunGeneration: boolean;
};

export type ClientEngineView = {
  id: string;
  label: string;
  outputType: EngineOutputType;
  credits: number;
};

export type ResolvedEngineForGeneration = {
  engine: EngineCatalogEntry;
  /** Resolved target when engine is smart_auto_pilot */
  resolvedEngineId: string;
  provider: EngineProvider;
  model: string | null;
  credits: number;
  outputType: EngineOutputType;
  kreaRegistryId?: string;
  falRegistryId?: string;
  kreaStudioId?: string;
  route: "krea_image" | "engine_generate" | "internal";
};

export type EngineResolutionErrorCode =
  | "ENGINE_UNKNOWN"
  | "ENGINE_DISABLED"
  | "ENGINE_NOT_ACTIVE"
  | "ENGINE_PLAN_LIMITED"
  | "ENGINE_VALIDATION_BLOCKED"
  | "ENGINE_NOT_VALIDATED"
  | "ENGINE_FAILED_VALIDATION"
  | "ENGINE_FLAGS_MISSING";

export class EngineResolutionError extends Error {
  constructor(
    message: string,
    public readonly code: EngineResolutionErrorCode,
    public readonly status: number = 400
  ) {
    super(message);
    this.name = "EngineResolutionError";
  }
}

/** Legacy product-mode catalog resolution errors (routing.ts) */
export type LegacyEngineResolutionErrorCode =
  | "ENGINE_UNKNOWN"
  | "ENGINE_DISABLED"
  | "ENGINE_SPEC_CONFLICT"
  | "ENGINE_PLANNED"
  | "ENGINE_FLAGS_MISSING"
  | "ENGINE_NOT_READY";

export class LegacyEngineResolutionError extends Error {
  constructor(
    message: string,
    public readonly code: LegacyEngineResolutionErrorCode,
    public readonly status: number = 400
  ) {
    super(message);
    this.name = "LegacyEngineResolutionError";
  }
}

/* ── Legacy product-mode catalog (EngineKey) — kept for routing.ts ── */

export type LegacyEngineStatus =
  | "live"
  | "beta_flagged"
  | "internal_ready"
  | "planned"
  | "disabled"
  | "spec_conflict";

export type LegacyEngineProvider =
  | "openai"
  | "fal"
  | "elevenlabs"
  | "internal"
  | "supabase"
  | "stripe"
  | "router";

export type EngineGroup =
  | "image"
  | "video"
  | "lipsync"
  | "audio"
  | "asset_enhancer"
  | "motion"
  | "avatar"
  | "three_d"
  | "campaign"
  | "utility";

export type EngineKey =
  | "standard_image"
  | "fast_draft"
  | "lip_sync_audio_upload"
  | "lip_sync_system_voice"
  | "ugc_look"
  | "premium_image"
  | "brand_assets"
  | "reference_edit"
  | "video_engine"
  | "image_to_video"
  | "motion_transfer"
  | "ai_avatar"
  | "background_removal"
  | "object_3d"
  | "campaign_planner";

export type ProviderChainStep = {
  provider: LegacyEngineProvider;
  model: string;
  role: "primary" | "tts" | "lipsync" | "video" | "image" | "utility";
};

export type EngineFeatureFlags = {
  server?: string[];
  public?: string[];
};

export type EngineRuntimeBinding = {
  route?: "krea_image" | "engine_generate" | "legacy_generate" | "internal";
  legacyImageMode?: string;
  legacyWorkflow?: string;
  falRegistryModelId?: string;
  runtimeProvider?: LegacyEngineProvider;
  runtimeModel?: string;
};

export type EngineDefinition = {
  key: EngineKey;
  label: string;
  group: EngineGroup;
  status: LegacyEngineStatus;
  credits: number;
  creditsMax?: number;
  workflow: string;
  provider: LegacyEngineProvider;
  model?: string;
  providerChain?: ProviderChainStep[];
  candidateModels?: string[];
  candidateCategories?: string[];
  purpose?: string;
  userFacing: boolean;
  isDefault?: boolean;
  flags?: EngineFeatureFlags;
  runtime: EngineRuntimeBinding;
  adminNotes?: string;
};

export type LegacyClientEngineView = {
  key: EngineKey;
  label: string;
  group: EngineGroup;
  status: Extract<LegacyEngineStatus, "live" | "beta_flagged">;
  credits: number;
  creditsMax?: number;
  workflow: string;
  isDefault?: boolean;
};

export type GenerationRequestInput = {
  engineKey?: string;
  imageMode?: string;
  workflow?: string;
  lipSyncInputMode?: "audio_upload" | "system_voice";
  engineModelId?: string;
};

export type ResolvedEngine = {
  key: EngineKey;
  label: string;
  group: EngineGroup;
  status: LegacyEngineStatus;
  credits: number;
  workflow: string;
  provider: LegacyEngineProvider;
  model?: string;
  providerChain?: ProviderChainStep[];
  runtime: EngineRuntimeBinding;
  serverReady: boolean;
  clientVisible: boolean;
};

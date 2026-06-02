/**
 * Shared types for engine/action smoke validation — server-only.
 */

export type SmokeTestStatus = "passed" | "failed" | "skipped";

/** Tool-level smoke outcome — includes blocked for launch gates and provider balance. */
export type ToolSmokeTestStatus = "passed" | "failed" | "blocked" | "skipped";

export type EngineSmokeTestResult = {
  engineId: string;
  provider: string;
  outputType: string;
  status: SmokeTestStatus;
  reason?: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
};

export type ActionSmokeTestResult = {
  actionId: string;
  outputType: string;
  status: SmokeTestStatus;
  reason?: string;
  selectedEngineId?: string;
  estimatedCredits?: number;
};

export type SmokeValidationMode = "dry" | "live";

export type EngineSmokeTestOptions = {
  includeInactive?: boolean;
  /** When true, run provider live tests (also set RUN_REAL_PROVIDER_SMOKE_TESTS=true). */
  runRealProviderTests?: boolean;
};

export type ActionSmokeTestOptions = {
  includeInactive?: boolean;
};

export type EngineSmokeTestSummary = {
  success: boolean;
  ok: boolean;
  mode: SmokeValidationMode;
  includeInactive: boolean;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  results: EngineSmokeTestResult[];
  catalogOk?: boolean;
  catalogIssueCount?: number;
};

export type ActionSmokeTestSummary = {
  success: boolean;
  ok: boolean;
  includeInactive: boolean;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  results: ActionSmokeTestResult[];
};

export type ToolSmokeTestResult = {
  toolId: string;
  status: ToolSmokeTestStatus;
  reason: string;
  envOk: boolean;
  handlerOk: boolean;
  creditsOk: boolean;
  providerOk: boolean;
  storageOk: boolean;
  canLaunch: boolean;
  /** Resolved creator tool id when applicable */
  creatorToolId?: string;
  resolvedLaunchStatus?: string;
  mode: SmokeValidationMode;
  testedAt: string;
};

export type ToolSmokeTestOptions = {
  /** When true, run provider live tests (also set RUN_REAL_PROVIDER_SMOKE_TESTS=true). */
  runRealProviderTests?: boolean;
  /** Include tools that are intentionally blocked in the registry. */
  includeBlocked?: boolean;
  /** Allow training provider smoke tests (also set ALLOW_TRAINING_SMOKE_TESTS=true). */
  allowTrainingTests?: boolean;
  /** Optional subset of tool ids to run */
  toolIds?: string[];
};

export type ToolSmokeTestSummary = {
  success: boolean;
  ok: boolean;
  mode: SmokeValidationMode;
  runRealProviderTests: boolean;
  total: number;
  passed: number;
  failed: number;
  blocked: number;
  skipped: number;
  launchReady: number;
  results: ToolSmokeTestResult[];
};

/** Canonical tool ids exercised by the launch smoke harness. */
export const TOOL_SMOKE_TEST_IDS = [
  "create_image",
  "create_motion_video",
  "social_asset_pack_preview",
  "social_asset_pack_render",
  "reference_image",
  "edit_image",
  "match_style",
  "enhance_asset",
  "background_remove",
  "upscale",
  "animate_image",
  "lipsync_creator",
  "ai_avatar",
  "motion_transfer",
  "train_creator_style",
  "train_brand_kit",
  "train_product_model",
  "train_creator_identity",
  "object_3d",
  "audio_sound_design",
  "creative_score",
  "hooks_captions",
  "export_pack",
] as const;

export type ToolSmokeTestId = (typeof TOOL_SMOKE_TEST_IDS)[number];

/** Launch MVP engines that must remain active after smoke validation. */
export const MVP_ACTIVE_ENGINE_IDS = [
  "krea_flux_11_pro_ultra",
  "krea_flux_fast_draft",
  "krea_nano_realtime",
  "smart_auto_pilot",
  "fal_kling_v3_t2v",
] as const;

/** Launch MVP actions validated before release. */
export const MVP_ACTIVE_ACTION_IDS = [
  "create_image",
  "create_video",
  "improve_prompt",
  "check_creative_score",
  "create_style_variant",
] as const;

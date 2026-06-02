/**
 * Creator tool activation metadata — env, handlers, provider validation, credits, storage.
 * Used by resolve-tool and docs/MODEL_ACTIVATION_STATUS.md generation.
 */

import { getActionById } from "@/app/lib/actions/action-registry";
import { getCreatorToolCreditCost } from "@/app/lib/billing/tool-credit-costs";
import { getEngineById, isEngineActive } from "@/app/lib/engines/catalog";
import {
  isFalProviderEnabled,
  isKreaProviderEnabled,
} from "@/lib/providers/flags";
import {
  getCreatorToolById,
  isCreatorToolProviderValidated,
  isSocialAssetPackDeploymentReady,
  isSocialAssetPackForceLive,
  type CreatorToolDefinition,
  type CreatorToolId,
} from "./creator-tools";
import { isCreatorToolLaunchGateOpen } from "./launch-tool-gate";
import type { ToolStatus } from "./tool-status";

export type ToolActivationBlocker =
  | "blocked_missing_env"
  | "blocked_provider_failed"
  | "blocked_missing_handler"
  | "blocked_missing_credits"
  | "blocked_storage_missing"
  | "blocked_missing_infrastructure";

export type ToolActivationCheckId =
  | "launch_gate"
  | "env_vars"
  | "api_handler"
  | "provider_validated"
  | "credit_cost"
  | "gallery_storage";

export type ToolActivationCheck = {
  id: ToolActivationCheckId;
  passed: boolean;
  detail: string;
};

export type ToolActivationMeta = {
  /** Server routes that execute this workflow (empty = client-only). */
  apiHandlers: readonly string[];
  /** Required server env vars (never exposed to users). */
  requiredEnvVars: readonly string[];
  /** Primary engine id for provider validation. */
  primaryEngineId?: string;
  /** Whether outputs persist to Supabase generations / gallery. */
  usesGalleryStorage: boolean;
  /** Tool can run without a paid provider (planning / analysis only). */
  providerOptional?: boolean;
};

export const CREATOR_TOOL_ACTIVATION: Record<CreatorToolId, ToolActivationMeta> = {
  create_image: {
    apiHandlers: ["/api/krea/image/generate", "/api/generate", "/api/engine/generate"],
    requiredEnvVars: ["KREA_API_KEY"],
    primaryEngineId: "smart_auto_pilot",
    usesGalleryStorage: true,
  },
  create_video: {
    apiHandlers: ["/api/engine/generate", "/api/generate"],
    requiredEnvVars: ["FAL_KEY"],
    primaryEngineId: "fal_kling_v3_t2v",
    usesGalleryStorage: true,
  },
  social_asset_pack: {
    apiHandlers: [
      "/api/packs/social-asset-preview",
      "/api/packs/social-asset-render",
    ],
    requiredEnvVars: ["KREA_API_KEY", "FAL_KEY"],
    primaryEngineId: "smart_auto_pilot",
    usesGalleryStorage: true,
  },
  create_style_variant: {
    apiHandlers: ["/api/krea/image/generate", "/api/generate"],
    requiredEnvVars: ["KREA_API_KEY"],
    primaryEngineId: "krea_flux_fast_draft",
    usesGalleryStorage: true,
  },
  improve_prompt: {
    apiHandlers: ["/api/prompt-assist", "/api/enhance-prompt"],
    requiredEnvVars: [],
    usesGalleryStorage: false,
    providerOptional: true,
  },
  check_creative_score: {
    apiHandlers: ["/api/creative-score"],
    requiredEnvVars: [],
    usesGalleryStorage: false,
    providerOptional: true,
  },
  hooks_captions: {
    apiHandlers: ["/api/hooks-captions/generate", "/api/packs/social-asset-preview"],
    requiredEnvVars: [],
    usesGalleryStorage: false,
    providerOptional: true,
  },
  export_pack: {
    apiHandlers: ["/api/export-pack/preview"],
    requiredEnvVars: [],
    usesGalleryStorage: false,
    providerOptional: true,
  },
  export_asset: {
    apiHandlers: [],
    requiredEnvVars: [],
    usesGalleryStorage: false,
    providerOptional: true,
  },
  use_reference_image: {
    apiHandlers: ["/api/reference-sources/upload", "/api/engine/generate"],
    requiredEnvVars: ["FAL_KEY"],
    primaryEngineId: "fal_reference_edit",
    usesGalleryStorage: true,
  },
  edit_image: {
    apiHandlers: ["/api/engine/generate"],
    requiredEnvVars: ["FAL_KEY"],
    primaryEngineId: "fal_reference_edit",
    usesGalleryStorage: true,
  },
  match_style: {
    apiHandlers: ["/api/engine/generate"],
    requiredEnvVars: ["FAL_KEY"],
    primaryEngineId: "fal_style_transfer",
    usesGalleryStorage: true,
  },
  enhance_asset: {
    apiHandlers: ["/api/engine/generate"],
    requiredEnvVars: ["FAL_KEY"],
    primaryEngineId: "fal_image_upscale",
    usesGalleryStorage: true,
  },
  background_remove: {
    apiHandlers: ["/api/engine/generate"],
    requiredEnvVars: ["FAL_KEY"],
    primaryEngineId: "fal_background_removal",
    usesGalleryStorage: true,
  },
  upscale_image: {
    apiHandlers: ["/api/engine/generate"],
    requiredEnvVars: ["FAL_KEY"],
    primaryEngineId: "fal_image_upscale",
    usesGalleryStorage: true,
  },
  animate_image: {
    apiHandlers: ["/api/engine/generate"],
    requiredEnvVars: ["FAL_KEY"],
    primaryEngineId: "fal_kling_v3_i2v",
    usesGalleryStorage: true,
  },
  lipsync_creator: {
    apiHandlers: [
      "/api/lip-sync/upload",
      "/api/lip-sync/audio-upload",
      "/api/live-avatar/generate",
    ],
    requiredEnvVars: ["FAL_KEY"],
    primaryEngineId: "fal_lipsync_sync_v2_pro",
    usesGalleryStorage: true,
  },
  ai_avatar: {
    apiHandlers: ["/api/live-avatar/generate", "/api/live-avatar/upload"],
    requiredEnvVars: ["FAL_KEY"],
    primaryEngineId: "fal_avatar_single_text",
    usesGalleryStorage: true,
  },
  motion_transfer: {
    apiHandlers: ["/api/live-avatar/generate", "/api/live-avatar/upload"],
    requiredEnvVars: ["FAL_KEY"],
    primaryEngineId: "fal_motion_transfer",
    usesGalleryStorage: true,
  },
  train_creator_style: {
    apiHandlers: ["/api/krea/train-lora", "/api/characters/train"],
    requiredEnvVars: ["KREA_API_KEY"],
    primaryEngineId: "fal_lora_training",
    usesGalleryStorage: true,
  },
  train_brand_kit: {
    apiHandlers: ["/api/krea/train-lora", "/api/characters/train"],
    requiredEnvVars: ["KREA_API_KEY"],
    primaryEngineId: "fal_lora_training",
    usesGalleryStorage: true,
  },
  train_product_model: {
    apiHandlers: ["/api/krea/train-lora", "/api/characters/train"],
    requiredEnvVars: ["KREA_API_KEY"],
    primaryEngineId: "fal_lora_training",
    usesGalleryStorage: true,
  },
  train_creator_identity: {
    apiHandlers: [
      "/api/characters/train",
      "/api/characters/upload-reference",
      "/api/characters/reference-images",
    ],
    requiredEnvVars: ["KREA_API_KEY"],
    primaryEngineId: "fal_lora_training",
    usesGalleryStorage: true,
  },
  object_3d: {
    apiHandlers: ["/api/engine/generate"],
    requiredEnvVars: ["FAL_KEY"],
    primaryEngineId: "fal_object_3d",
    usesGalleryStorage: true,
  },
  audio_sound_design: {
    apiHandlers: ["/api/engine/generate"],
    requiredEnvVars: ["FAL_KEY"],
    primaryEngineId: "fal_audio_placeholder",
    usesGalleryStorage: true,
  },
};

function envVarPresent(key: string): boolean {
  if (key === "KREA_API_KEY") return isKreaProviderEnabled();
  if (key === "FAL_KEY") return isFalProviderEnabled();
  return Boolean(process.env[key]?.trim());
}

function checkEnvVars(meta: ToolActivationMeta): ToolActivationCheck {
  const missing = meta.requiredEnvVars.filter((key) => !envVarPresent(key));
  return {
    id: "env_vars",
    passed: missing.length === 0,
    detail:
      missing.length === 0
        ? "Required env vars present"
        : `Missing: ${missing.join(", ")}`,
  };
}

function checkHandler(meta: ToolActivationMeta): ToolActivationCheck {
  const hasHandler =
    meta.providerOptional === true ||
    meta.apiHandlers.length > 0;
  return {
    id: "api_handler",
    passed: hasHandler,
    detail: hasHandler
      ? meta.apiHandlers.join(", ") || "client-only workflow"
      : "No server handler registered",
  };
}

function checkProvider(tool: CreatorToolDefinition): ToolActivationCheck {
  if (!tool.callsProvider || tool.id === "social_asset_pack") {
    const validated = isCreatorToolProviderValidated(tool);
    return {
      id: "provider_validated",
      passed: validated,
      detail: validated ? "Provider path validated" : "Provider path not validated",
    };
  }

  const meta = CREATOR_TOOL_ACTIVATION[tool.id];
  const engineId =
    meta.primaryEngineId ??
    tool.primaryEngineId ??
    (tool.actionId ? getActionById(tool.actionId)?.defaultEngine : undefined);

  if (!engineId) {
    return {
      id: "provider_validated",
      passed: false,
      detail: "No primary engine mapped",
    };
  }

  const engine = getEngineById(engineId);
  const active = Boolean(engine && isEngineActive(engine));
  return {
    id: "provider_validated",
    passed: active && isCreatorToolProviderValidated(tool),
    detail: active
      ? engine!.validation?.validationReason ?? "Engine active"
      : engine?.unavailableReason ?? engine?.validation?.validationReason ?? "Engine not active",
  };
}

function checkCredits(tool: CreatorToolDefinition): ToolActivationCheck {
  const cost = getCreatorToolCreditCost(tool.id);
  if (!tool.chargesCredits && !tool.callsProvider) {
    return { id: "credit_cost", passed: true, detail: "Free workflow" };
  }
  if (tool.chargesCredits && cost <= 0) {
    return {
      id: "credit_cost",
      passed: false,
      detail: "Credit cost not configured",
    };
  }
  return {
    id: "credit_cost",
    passed: true,
    detail: cost > 0 ? `${cost} credits minimum` : "No charge",
  };
}

function checkStorage(meta: ToolActivationMeta): ToolActivationCheck {
  if (!meta.usesGalleryStorage) {
    return { id: "gallery_storage", passed: true, detail: "No gallery persistence required" };
  }
  const hasSupabase =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()) &&
    Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
  return {
    id: "gallery_storage",
    passed: hasSupabase,
    detail: hasSupabase ? "Supabase generations storage configured" : "Supabase storage env missing",
  };
}

export type ToolActivationEvaluation = {
  checks: ToolActivationCheck[];
  blocker: ToolActivationBlocker | null;
  blockerDetail: string | null;
  isLiveCapable: boolean;
  meta: ToolActivationMeta;
};

export function evaluateToolActivation(
  tool: CreatorToolDefinition
): ToolActivationEvaluation {
  const meta = CREATOR_TOOL_ACTIVATION[tool.id];
  const launchCheck: ToolActivationCheck = {
    id: "launch_gate",
    passed: isCreatorToolLaunchGateOpen(tool),
    detail: isCreatorToolLaunchGateOpen(tool)
      ? "Launch gate open"
      : "Launch feature or module disabled",
  };

  const checks: ToolActivationCheck[] = [
    launchCheck,
    checkEnvVars(meta),
    checkHandler(meta),
  ];

  if (tool.callsProvider) {
    checks.push(checkProvider(tool));
  } else {
    checks.push({
      id: "provider_validated",
      passed: true,
      detail: "No provider calls",
    });
  }

  checks.push(checkCredits(tool));

  if (meta.usesGalleryStorage) {
    checks.push(checkStorage(meta));
  }

  if (isSocialAssetPackForceLive(tool)) {
    return {
      checks: checks.map((check) => ({
        ...check,
        passed: true,
        detail:
          check.id === "launch_gate"
            ? check.detail
            : "Social Asset Pack deployment ready",
      })),
      blocker: null,
      blockerDetail: null,
      isLiveCapable: true,
      meta,
    };
  }

  let blocker: ToolActivationBlocker | null = null;
  let blockerDetail: string | null = null;

  if (!launchCheck.passed) {
    blocker = null;
  } else if (!checks.find((c) => c.id === "env_vars")!.passed) {
    blocker = "blocked_missing_env";
    blockerDetail = checks.find((c) => c.id === "env_vars")!.detail;
  } else if (!checks.find((c) => c.id === "api_handler")!.passed) {
    blocker = "blocked_missing_handler";
    blockerDetail = checks.find((c) => c.id === "api_handler")!.detail;
  } else if (
    tool.callsProvider &&
    !checks.find((c) => c.id === "provider_validated")!.passed
  ) {
    blocker = "blocked_provider_failed";
    blockerDetail = checks.find((c) => c.id === "provider_validated")!.detail;
  } else if (!checks.find((c) => c.id === "credit_cost")!.passed) {
    blocker = "blocked_missing_credits";
    blockerDetail = checks.find((c) => c.id === "credit_cost")!.detail;
  } else if (
    meta.usesGalleryStorage &&
    checks.some((c) => c.id === "gallery_storage" && !c.passed)
  ) {
    blocker = "blocked_storage_missing";
    blockerDetail = checks.find((c) => c.id === "gallery_storage")!.detail;
  }

  const isLiveCapable =
    launchCheck.passed &&
    blocker === null &&
    (!tool.callsProvider || isCreatorToolProviderValidated(tool));

  return {
    checks,
    blocker,
    blockerDetail,
    isLiveCapable,
    meta,
  };
}

/** Map activation evaluation to user-facing tool status. */
export function activationToToolStatus(
  tool: CreatorToolDefinition,
  evaluation: ToolActivationEvaluation,
  options: {
    providerValidated: boolean;
    planBlocked: boolean;
  }
): ToolStatus {
  if (!evaluation.checks.find((c) => c.id === "launch_gate")!.passed) {
    return tool.hideWhenLaunchDisabled ? "disabled" : "coming_soon";
  }

  if (options.planBlocked) {
    return "pro_locked";
  }

  if (
    tool.id === "social_asset_pack" &&
    isSocialAssetPackDeploymentReady() &&
    evaluation.checks.find((c) => c.id === "launch_gate")?.passed
  ) {
    return "live";
  }

  if (evaluation.isLiveCapable && options.providerValidated) {
    return "live";
  }

  if (evaluation.blocker === "blocked_missing_env") {
    return "blocked_missing_env";
  }
  if (evaluation.blocker === "blocked_missing_handler") {
    return "blocked_missing_handler";
  }
  if (evaluation.blocker === "blocked_missing_credits") {
    return "blocked_missing_credits";
  }
  if (evaluation.blocker === "blocked_storage_missing") {
    return "blocked_storage_missing";
  }
  if (evaluation.blocker === "blocked_provider_failed") {
    if (tool.allowsPreview) return "preview";
    if (tool.allowsRequestAccess || tool.audience === "training") {
      return "request_access";
    }
    return "blocked_provider_failed";
  }

  if (tool.allowsPreview) return "preview";
  if (tool.allowsRequestAccess || tool.audience === "training") {
    return "request_access";
  }
  return "coming_soon";
}

export function getToolActivationMeta(toolId: string): ToolActivationMeta | null {
  const tool = getCreatorToolById(toolId);
  if (!tool) return null;
  return CREATOR_TOOL_ACTIVATION[tool.id];
}

export function evaluateCreatorToolActivation(
  toolId: string
): ToolActivationEvaluation | null {
  const tool = getCreatorToolById(toolId);
  if (!tool) return null;
  return evaluateToolActivation(tool);
}

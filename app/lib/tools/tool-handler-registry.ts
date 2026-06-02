/**
 * Creator tool → server handler mapping.
 * Only tools with a registered runnable handler may go live.
 */

import type { ActionId } from "@/app/lib/actions/types";
import { FAL_MVP_GENERATION_HANDLERS } from "@/app/lib/engines/fal-catalog";
import {
  getFalEndpointForStudio,
  getLegacyRegistryIdForFalStudio,
} from "@/app/lib/providers/fal/fal-model-map";
import { isKreaGenerationHandlerRegistered } from "@/app/lib/providers/krea/krea-router";
import { CREATOR_TOOL_ACTIVATION } from "./tool-activation";
import { getCreatorToolById, type CreatorToolId } from "./creator-tools";
import type { ToolStatus } from "./tool-status";

export type ToolHandlerKind =
  | "unified_generate"
  | "pack_preview"
  | "pack_render"
  | "hooks_captions"
  | "prompt_assist"
  | "creative_score"
  | "export_pack_preview"
  | "client_only"
  | "blocked";

export type ToolHandlerDefinition = {
  kind: ToolHandlerKind;
  /** Product action routed through runUnifiedGeneration */
  actionId?: ActionId;
  /** Default model mode when client omits modelModeId */
  defaultModelModeId?: string;
  /** Internal blocker — never expose provider names to users */
  blockedReason?: string;
  blockerStatus?: Extract<
    ToolStatus,
    | "blocked_missing_handler"
    | "blocked_provider_failed"
    | "blocked_missing_infrastructure"
  >;
  apiRoute?: string;
};

function falHandlerReady(studioEngineId: string): boolean {
  if (!FAL_MVP_GENERATION_HANDLERS.has(studioEngineId)) return false;
  const endpoint = getFalEndpointForStudio(studioEngineId);
  const legacy = getLegacyRegistryIdForFalStudio(studioEngineId);
  return Boolean(endpoint?.trim() && legacy?.trim());
}

function blockedFalTool(
  toolLabel: string,
  studioEngineId: string,
  reason: string
): ToolHandlerDefinition {
  const endpoint = getFalEndpointForStudio(studioEngineId);
  const legacy = getLegacyRegistryIdForFalStudio(studioEngineId);
  let blockedReason = reason;
  let blockerStatus: ToolHandlerDefinition["blockerStatus"] =
    "blocked_provider_failed";

  if (!endpoint) {
    blockedReason = `${toolLabel}: fal endpoint not mapped in registry`;
    blockerStatus = "blocked_missing_handler";
  } else if (!legacy) {
    blockedReason = `${toolLabel}: runtime adapter not registered`;
    blockerStatus = "blocked_missing_handler";
  } else if (!falHandlerReady(studioEngineId)) {
    blockedReason = `${toolLabel}: ${reason}`;
  }

  return {
    kind: "blocked",
    blockedReason,
    blockerStatus,
    apiRoute: "/api/tools/[toolId]",
  };
}

/** Static handler registry — update when promoting engines to active. */
export const TOOL_HANDLER_REGISTRY: Record<CreatorToolId, ToolHandlerDefinition> = {
  create_image: {
    kind: "unified_generate",
    actionId: "create_image",
    defaultModelModeId: "auto_image",
    apiRoute: "/api/generate",
  },
  create_video: {
    kind: "unified_generate",
    actionId: "create_video",
    defaultModelModeId: "auto_video",
    apiRoute: "/api/generate",
  },
  social_asset_pack: {
    kind: "pack_render",
    apiRoute: "/api/packs/social-asset-render",
  },
  create_style_variant: {
    kind: "unified_generate",
    actionId: "create_style_variant",
    apiRoute: "/api/generate",
  },
  improve_prompt: {
    kind: "prompt_assist",
    apiRoute: "/api/prompt-assist",
  },
  check_creative_score: {
    kind: "creative_score",
    apiRoute: "/api/creative-score",
  },
  hooks_captions: {
    kind: "hooks_captions",
    apiRoute: "/api/hooks-captions/generate",
  },
  export_pack: {
    kind: "export_pack_preview",
    apiRoute: "/api/export-pack/preview",
  },
  export_asset: {
    kind: "client_only",
    apiRoute: "/dashboard/assets",
  },
  use_reference_image: blockedFalTool(
    "Use Reference Image",
    "fal_reference_edit",
    "Engine not validated; launch module on"
  ),
  edit_image: blockedFalTool(
    "Edit Image",
    "fal_reference_edit",
    "Engine not validated; enableReferenceEdit module on"
  ),
  match_style: blockedFalTool(
    "Match Style",
    "fal_style_transfer",
    "No endpoint mapped; engine not validated"
  ),
  enhance_asset: blockedFalTool(
    "Enhance Asset",
    "fal_image_upscale",
    "enableEnhancer module off; engine not promoted to active"
  ),
  background_remove: blockedFalTool(
    "Background Remove",
    "fal_background_removal",
    "No legacy runtime adapter; enableEnhancer module off"
  ),
  upscale_image: blockedFalTool(
    "Upscale",
    "fal_image_upscale",
    "enableEnhancer module off; engine not promoted to active"
  ),
  animate_image: blockedFalTool(
    "Animate Image",
    "fal_kling_v3_i2v",
    "enableImageToVideo off; validation blocked (balance)"
  ),
  lipsync_creator: blockedFalTool(
    "LipSync Creator",
    "fal_lipsync_sync_v2_pro",
    "enableLipSync off; validation not tested"
  ),
  ai_avatar: blockedFalTool(
    "AI Avatar",
    "fal_avatar_single_text",
    "enableAvatar off; validation not tested"
  ),
  motion_transfer: blockedFalTool(
    "Motion Transfer",
    "fal_motion_transfer",
    "enableMotionTransfer off; prior validation failed (422)"
  ),
  train_creator_style: {
    kind: "blocked",
    blockedReason:
      "Training: upload exists but /api/characters/train disabled; no job queue reuse path",
    blockerStatus: "blocked_missing_infrastructure",
    apiRoute: "/api/characters/train",
  },
  train_brand_kit: {
    kind: "blocked",
    blockedReason: "Training infrastructure incomplete — same as train_creator_style",
    blockerStatus: "blocked_missing_infrastructure",
  },
  train_product_model: {
    kind: "blocked",
    blockedReason: "Training infrastructure incomplete — same as train_creator_style",
    blockerStatus: "blocked_missing_infrastructure",
  },
  train_creator_identity: {
    kind: "blocked",
    blockedReason:
      "Training upload routes exist but train handler disabled; no validated provider smoke test",
    blockerStatus: "blocked_missing_infrastructure",
    apiRoute: "/api/characters/train",
  },
  object_3d: blockedFalTool(
    "3D Object",
    "fal_object_3d",
    "enable3D off; endpoint not validated"
  ),
  audio_sound_design: blockedFalTool(
    "Audio Sound Design",
    "fal_audio_placeholder",
    "enableAudio off; placeholder endpoint only"
  ),
};

export function getToolHandlerDefinition(
  toolId: CreatorToolId
): ToolHandlerDefinition {
  return TOOL_HANDLER_REGISTRY[toolId];
}

export function toolHasRunnableHandler(toolId: CreatorToolId): boolean {
  const kind = TOOL_HANDLER_REGISTRY[toolId]?.kind;
  return kind !== "blocked" && kind !== undefined;
}

export function getToolHandlerApiRoute(toolId: CreatorToolId): string | undefined {
  const def = TOOL_HANDLER_REGISTRY[toolId];
  if (def.kind === "blocked") return def.apiRoute;
  if (def.kind === "unified_generate") return "/api/generate";
  if (def.kind === "pack_render") return "/api/packs/social-asset-render";
  if (def.kind === "pack_preview") return "/api/packs/social-asset-preview";
  return def.apiRoute;
}

/** Validates Krea/Fal engine handler wiring for activation audits. */
export function validateProviderHandlerWiring(toolId: CreatorToolId): {
  ready: boolean;
  detail: string;
} {
  const meta = CREATOR_TOOL_ACTIVATION[toolId];
  const def = TOOL_HANDLER_REGISTRY[toolId];
  const tool = getCreatorToolById(toolId);

  if (def.kind === "blocked") {
    return { ready: false, detail: def.blockedReason ?? "Handler blocked" };
  }

  if (!tool?.callsProvider) {
    return { ready: true, detail: "No provider handler required" };
  }

  const engineId = meta.primaryEngineId ?? def.actionId;
  if (!engineId) {
    return { ready: false, detail: "No engine mapped" };
  }

  if (toolId === "social_asset_pack") {
    const imageOk = isKreaGenerationHandlerRegistered("smart_auto_pilot");
    const videoOk = falHandlerReady("fal_kling_v3_t2v");
    if (imageOk && videoOk) {
      return { ready: true, detail: "Pack image + video handlers ready" };
    }
    return {
      ready: false,
      detail: `Pack handlers incomplete (image=${imageOk}, video=${videoOk})`,
    };
  }

  if (meta.requiredEnvVars.includes("KREA_API_KEY")) {
    if (isKreaGenerationHandlerRegistered(engineId)) {
      return { ready: true, detail: "Krea handler ready" };
    }
  }

  if (meta.requiredEnvVars.includes("FAL_KEY")) {
    if (falHandlerReady(engineId)) {
      return { ready: true, detail: "fal handler ready" };
    }
  }

  return { ready: false, detail: "Provider handler not registered for live run" };
}

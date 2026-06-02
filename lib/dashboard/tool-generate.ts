import { resolveCreatorTool } from "@/app/lib/tools/resolve-tool";
import {
  getToolRunBlockedUserMessage,
  resolveCreatorToolIdFromRequest,
} from "@/app/lib/tools/assert-tool-can-run";
import type { ActionId } from "@/app/lib/actions/types";
import type { CreatorToolId } from "@/app/lib/tools/creator-tools";
import {
  formatGenerationErrorFromApi,
  type GenerationLanguage,
} from "@/lib/generation/generation-errors";
import { getDefaultModelIdForActiveTool } from "@/lib/ai/krea-model-ui";
import { getEngineModelById } from "@/lib/ai/model-registry";
import { getMatrixEntry, type ActiveTool } from "./creative-tool-matrix";
import type { CampaignExpansionData } from "./workspace-types";
import { getVideoStudioCreditCost } from "./video-studio-credits";
import {
  getApiModelIdForModelMode,
  getDefaultModelModeIdForAction,
} from "@/app/lib/model-modes/get-visible-model-modes";
import { getModelModeById } from "@/app/lib/model-modes/model-modes";
import { resolveCreditCostForModelMode } from "@/app/lib/billing/credit-costs";

const TOOL_KEY_TO_CREATOR_TOOL: Partial<
  Record<Exclude<ActiveTool, null>, CreatorToolId>
> = {
  enhancer: "enhance_asset",
  edit: "edit_image",
  lipsync: "lipsync_creator",
  motion_transfer: "motion_transfer",
  train_lora: "train_creator_style",
  "3d_objects": "object_3d",
  audio: "audio_sound_design",
};

function resolveCreatorToolIdForGenerate(
  input: ToolGenerateInput
): CreatorToolId | null {
  const fromRequest = resolveCreatorToolIdFromRequest({
    actionId: input.actionId,
    modelModeId: input.modelModeId,
  });
  if (fromRequest) return fromRequest;
  if (!input.toolKey) return null;
  return TOOL_KEY_TO_CREATOR_TOOL[input.toolKey] ?? null;
}

export type ToolGenerateResult =
  | {
      success: true;
      generationId?: string;
      imageUrl?: string;
      videoUrl?: string;
      queued?: boolean;
      plan?: Record<string, unknown>;
      creditsAfter?: number | null;
      campaignExpansion?: CampaignExpansionData | null;
      campaignExpansionWarning?: string;
    }
  | {
      success: false;
      error: string;
      reason?: string;
      code?: string;
      status?: number;
    };

export type ToolGenerateInput = {
  toolKey: ActiveTool;
  token: string;
  /** Standard image / video generation */
  prompt?: string;
  outputFormat?: string;
  sourceImageUrl?: string;
  sourceVideoUrl?: string;
  editInstruction?: string;
  motionInstruction?: string;
  consentAccepted?: boolean;
  /** Lip sync */
  lipSyncInputMode?: "system_voice" | "audio_upload";
  audioUrl?: string;
  scriptText?: string;
  voiceKey?: string;
  /** MVP planner payloads */
  plannerPayload?: Record<string, unknown>;
  /** Registry model id (Krea or fal engine id) */
  kreaModelId?: string;
  /** Alias for kreaModelId */
  modelId?: string;
  /** User-facing model mode (preferred over raw model ids) */
  modelModeId?: string;
  /** Product action id paired with modelModeId */
  actionId?: ActionId | string;
  /** Video engine duration in seconds (5 or 10) */
  durationSeconds?: 5 | 10;
  /** Video motion / style preset id */
  presetId?: string;
  motionStyle?: string;
  /** UI language for campaign expansion */
  currentLanguage?: "de" | "en";
};

function outputFormatToGenerateFormat(
  outputFormat: string
): "9:16" | "1:1" | "16:9" {
  if (
    outputFormat === "tiktok" ||
    outputFormat === "instagram_story" ||
    outputFormat === "youtube_shorts"
  ) {
    return "9:16";
  }
  if (outputFormat === "youtube_thumbnail") return "16:9";
  return "1:1";
}

async function postUnifiedGenerate(
  input: ToolGenerateInput
): Promise<ToolGenerateResult> {
  const actionId =
    input.actionId?.trim() ||
    (input.toolKey === "video" ? "create_video" : "create_image");
  const modelModeId =
    input.modelModeId?.trim() ||
    getDefaultModelModeForTool(input.toolKey === "video" ? "video" : "image");

  const prompt =
    input.prompt?.trim() ||
    input.motionInstruction?.trim() ||
    "";

  if (!prompt) {
    return { success: false, error: "Prompt is required." };
  }

  const body: Record<string, unknown> = {
    actionId,
    prompt,
    currentLanguage: input.currentLanguage ?? "de",
    outputFormat: input.outputFormat ?? "square",
  };

  if (actionId !== "create_style_variant" && modelModeId) {
    body.modelModeId = modelModeId;
  }

  const options: Record<string, unknown> = {
    format: outputFormatToGenerateFormat(input.outputFormat ?? "square"),
  };
  if (input.durationSeconds) options.duration = input.durationSeconds;
  if (input.sourceImageUrl) options.sourceAssetUrl = input.sourceImageUrl;
  if (input.presetId) options.preset = input.presetId;
  if (input.motionStyle) options.motionStyle = input.motionStyle;
  body.options = options;

  const res = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${input.token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    return {
      success: false,
      error: typeof data.error === "string" ? data.error : "Generation failed.",
      code: typeof data.code === "string" ? data.code : undefined,
      status: res.status,
      reason: data.refunded ? "refunded" : undefined,
    };
  }

  const assetUrl =
    typeof data.assetUrl === "string" ? data.assetUrl : undefined;

  return {
    success: true,
    generationId: data.generationId,
    imageUrl:
      data.outputType === "image" ? assetUrl : undefined,
    videoUrl:
      data.outputType === "video" ? assetUrl : undefined,
    creditsAfter:
      typeof data.creditsAfter === "number" ? data.creditsAfter : null,
    campaignExpansion: parseCampaignExpansion(data.campaignExpansion),
    campaignExpansionWarning:
      typeof data.campaignExpansionWarning === "string"
        ? data.campaignExpansionWarning
        : undefined,
  };
}

async function postEngineGenerate(
  token: string,
  body: Record<string, unknown>
): Promise<ToolGenerateResult> {
  const res = await fetch("/api/engine/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();

  if (!res.ok || !data.success) {
    return {
      success: false,
      error: typeof data.error === "string" ? data.error : "Generation failed.",
      reason: typeof data.reason === "string" ? data.reason : undefined,
      code: typeof data.code === "string" ? data.code : undefined,
      status: res.status,
    };
  }

  return {
    success: true,
    generationId: data.generationId,
    imageUrl: typeof data.imageUrl === "string" ? data.imageUrl : undefined,
    videoUrl: typeof data.videoUrl === "string" ? data.videoUrl : undefined,
    creditsAfter: typeof data.creditsAfter === "number" ? data.creditsAfter : null,
    campaignExpansion: parseCampaignExpansion(data.campaignExpansion),
  };
}

function resolveModelId(input: ToolGenerateInput): string {
  const fromMode = resolveApiModelIdFromMode(input);
  if (fromMode) return fromMode;

  const explicit = input.modelId?.trim() || input.kreaModelId?.trim();
  if (explicit) return explicit;
  return getDefaultModelIdForActiveTool(input.toolKey) || "";
}

function resolveApiModelIdFromMode(input: ToolGenerateInput): string | null {
  const modeId = input.modelModeId?.trim();
  const actionId = input.actionId?.trim();
  if (!modeId || !actionId) return null;

  const mode = getModelModeById(modeId);
  if (!mode || mode.actionId !== actionId || !mode.canRunGeneration) {
    return null;
  }

  return getApiModelIdForModelMode(modeId);
}

export function resolveToolCreditCostFromInput(input: {
  toolKey: ActiveTool;
  modelModeId?: string;
  actionId?: string;
  modelId?: string;
  kreaModelId?: string;
  durationSeconds?: 5 | 10;
}): number {
  const modeId = input.modelModeId?.trim();
  const actionId = input.actionId?.trim();
  if (modeId && actionId) {
    const cost = resolveCreditCostForModelMode(modeId);
    if (cost > 0) return cost;
  }

  const modelId =
    input.modelId?.trim() ||
    input.kreaModelId?.trim() ||
    (modeId && actionId ? getApiModelIdForModelMode(modeId) : null) ||
    getDefaultModelIdForActiveTool(input.toolKey) ||
    "";

  if (input.toolKey === "video" && modelId) {
    return getVideoStudioCreditCost(modelId);
  }

  const entry = getEngineModelById(modelId);
  if (entry?.credits) return entry.credits;

  return getMatrixEntry(input.toolKey)?.creditCost ?? 0;
}

export function getDefaultModelModeForTool(toolKey: ActiveTool): string {
  if (toolKey === "image") return getDefaultModelModeIdForAction("create_image");
  if (toolKey === "video") return getDefaultModelModeIdForAction("create_video");
  return "";
}

function shouldUseEngineRoute(modelId: string): boolean {
  const entry = getEngineModelById(modelId);
  if (!entry) return false;
  if (entry.provider === "fal") return true;
  return (
    entry.category === "video" ||
    entry.category === "enhancer" ||
    entry.category === "lipsync" ||
    entry.category === "motion_transfer"
  );
}

function blockIfCreatorToolLocked(input: ToolGenerateInput): ToolGenerateResult | null {
  const language = input.currentLanguage === "de" ? "de" : "en";
  const toolId = resolveCreatorToolIdForGenerate(input);

  if (!toolId) return null;

  const resolved = resolveCreatorTool(toolId, { language });
  if (!resolved || !resolved.canRun) {
    return {
      success: false,
      error: getToolRunBlockedUserMessage(language),
      code: "TOOL_NOT_RUNNABLE",
      status: 403,
    };
  }

  return null;
}

/**
 * Central dispatcher for tool generation.
 * Routes to existing API handlers; does not expose secrets.
 */
export async function handleGenerateForTool(
  input: ToolGenerateInput
): Promise<ToolGenerateResult> {
  const blocked = blockIfCreatorToolLocked(input);
  if (blocked) return blocked;

  const tool = getMatrixEntry(input.toolKey);
  if (!tool) {
    return { success: false, error: "Unknown tool." };
  }

  if (tool.workspaceKind === "mvp_planner" && tool.creditCost === 0) {
    return {
      success: true,
      plan: {
        tool: tool.key,
        workflow: tool.workflow,
        createdAt: new Date().toISOString(),
        ...(input.plannerPayload ?? {}),
      },
    };
  }

  if (
    tool.key === "image" ||
    tool.key === "video" ||
    input.actionId === "create_style_variant"
  ) {
    return postUnifiedGenerate(input);
  }

  if (tool.generateRoute === "/api/live-avatar/generate") {
    if (!input.sourceImageUrl || !input.sourceVideoUrl) {
      return { success: false, error: "Portrait and driving video are required." };
    }
    if (!input.consentAccepted) {
      return { success: false, error: "Consent is required." };
    }

    const res = await fetch("/api/live-avatar/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${input.token}`,
      },
      body: JSON.stringify({
        sourceImageUrl: input.sourceImageUrl,
        sourceVideoUrl: input.sourceVideoUrl,
        consentAccepted: true,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || "Generation failed.",
        reason: typeof data.reason === "string" ? data.reason : undefined,
        code: typeof data.code === "string" ? data.code : undefined,
        status: res.status,
      };
    }
    return {
      success: true,
      generationId: data.generationId,
      videoUrl: data.videoUrl,
    };
  }

  if (tool.generateRoute === "/api/krea/image/generate") {
    if (!input.prompt?.trim()) {
      return { success: false, error: "Prompt is required." };
    }

    const body: Record<string, unknown> = {
      prompt: input.prompt.trim(),
      outputFormat: input.outputFormat ?? "square",
      currentLanguage: input.currentLanguage ?? "de",
    };

    const apiModelId = resolveApiModelIdFromMode(input);
    if (apiModelId) {
      body.kreaModelId = apiModelId;
    } else if (input.kreaModelId?.trim()) {
      body.kreaModelId = input.kreaModelId.trim();
    }

    if (input.modelModeId?.trim() && input.actionId?.trim()) {
      body.modelModeId = input.modelModeId.trim();
      body.actionId = input.actionId.trim();
    }

    const res = await fetch("/api/krea/image/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${input.token}`,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      return {
        success: false,
        error: typeof data.error === "string" ? data.error : "Generation failed.",
        reason: typeof data.reason === "string" ? data.reason : undefined,
        code: typeof data.code === "string" ? data.code : undefined,
        status: res.status,
      };
    }

    return {
      success: true,
      generationId: data.generationId,
      imageUrl: typeof data.imageUrl === "string" ? data.imageUrl : undefined,
      creditsAfter:
        typeof data.creditsAfter === "number" ? data.creditsAfter : null,
      campaignExpansion: parseCampaignExpansion(data.campaignExpansion),
      campaignExpansionWarning:
        typeof data.campaignExpansionWarning === "string"
          ? data.campaignExpansionWarning
          : undefined,
    };
  }

  if (tool.generateRoute === "/api/generate") {
    const imageMode = tool.imageMode ?? "standard";
    const modelId = resolveModelId(input);

    if (modelId && shouldUseEngineRoute(modelId)) {
      const engineBody: Record<string, unknown> = {
        modelId,
        selectedFormat: input.outputFormat ?? "square",
        currentLanguage: input.currentLanguage ?? "de",
      };
      if (input.actionId?.trim()) {
        engineBody.actionId = input.actionId.trim();
      }
      if (input.modelModeId?.trim()) {
        engineBody.modelModeId = input.modelModeId.trim();
      }
      const inputs: Record<string, unknown> = {};

      if (imageMode === "video_image_to_video") {
        const engineModel = getEngineModelById(modelId);
        const needsSourceImage =
          engineModel?.requiredInputs.includes("sourceImageUrl") ?? true;

        if (needsSourceImage) {
          if (!input.sourceImageUrl) {
            return {
              success: false,
              error:
                "Please upload a source image before generating a video. / Bitte lade zuerst ein Quellbild hoch, um ein Video zu generieren.",
              reason: "missing_source_image",
            };
          }
          if (input.sourceImageUrl.startsWith("blob:")) {
            return {
              success: false,
              error:
                "Invalid source image. Please upload again. / Ungültiges Quellbild — bitte erneut hochladen.",
              reason: "blob_source_image",
            };
          }
        }
        if (!input.motionInstruction?.trim() && !input.prompt?.trim()) {
          return { success: false, error: "Prompt is required." };
        }
        engineBody.prompt = (input.motionInstruction ?? input.prompt ?? "").trim();
        if (needsSourceImage && input.sourceImageUrl) {
          inputs.sourceImageUrl = input.sourceImageUrl;
        }
        inputs.duration = input.durationSeconds ?? 5;
      } else if (imageMode === "lip_sync") {
        if (!input.sourceVideoUrl) {
          return { success: false, error: "Source video is required." };
        }
        inputs.sourceVideoUrl = input.sourceVideoUrl;
        if (input.lipSyncInputMode === "audio_upload") {
          if (!input.audioUrl) {
            return { success: false, error: "Audio URL is required." };
          }
          inputs.sourceAudioUrl = input.audioUrl;
        } else if (input.scriptText?.trim()) {
          inputs.sourceImageUrl = input.sourceVideoUrl;
          inputs.scriptText = input.scriptText.trim();
          engineBody.prompt = input.scriptText.trim();
        }
      } else if (imageMode === "enhance_asset") {
        if (!input.sourceImageUrl) {
          return { success: false, error: "Source image is required." };
        }
        inputs.sourceImageUrl = input.sourceImageUrl;
        engineBody.prompt =
          input.prompt?.trim() ||
          "Enhance image quality, clarity and resolution.";
      } else {
        if (!input.prompt?.trim()) {
          return { success: false, error: "Prompt is required." };
        }
        engineBody.prompt = input.prompt.trim();
      }

      if (Object.keys(inputs).length > 0) {
        engineBody.inputs = inputs;
      }

      return postEngineGenerate(input.token, engineBody);
    }

    const body: Record<string, unknown> = {
      imageMode,
      outputFormat: input.outputFormat ?? "square",
    };

    if (input.kreaModelId?.trim()) {
      body.kreaModelId = input.kreaModelId.trim();
    }

    if (imageMode === "video_image_to_video") {
      if (!input.sourceImageUrl) {
        return {
          success: false,
          error:
            "Please upload a source image before generating a video. / Bitte lade zuerst ein Quellbild hoch, um ein Video zu generieren.",
          reason: "missing_source_image",
        };
      }
      if (input.sourceImageUrl.startsWith("blob:")) {
        return {
          success: false,
          error:
            "Invalid source image. Please upload again. / Ungültiges Quellbild — bitte erneut hochladen.",
          reason: "blob_source_image",
        };
      }
      if (!input.motionInstruction?.trim()) {
        return { success: false, error: "Motion prompt is required." };
      }
      body.sourceImageUrl = input.sourceImageUrl;
      body.motionInstruction = input.motionInstruction.trim();
      body.durationSeconds = input.durationSeconds ?? 5;
    } else if (imageMode === "lip_sync") {
      const videoUrl = input.sourceVideoUrl;
      if (!videoUrl) {
        return { success: false, error: "Source video is required." };
      }
      body.sourceVideoUrl = videoUrl;
      body.lipSyncInputMode = input.lipSyncInputMode ?? "audio_upload";
      if (body.lipSyncInputMode === "audio_upload") {
        if (!input.audioUrl) {
          return { success: false, error: "Audio URL is required." };
        }
        body.audioUrl = input.audioUrl;
      } else {
        if (!input.scriptText?.trim()) {
          return { success: false, error: "Script is required for system voice." };
        }
        body.scriptText = input.scriptText.trim();
        body.voiceKey = input.voiceKey;
      }
    } else if (imageMode === "reference_edit") {
      if (!input.sourceImageUrl) {
        return { success: false, error: "Source image is required." };
      }
      if (!input.editInstruction?.trim() && !input.prompt?.trim()) {
        return { success: false, error: "Edit instructions are required." };
      }
      body.sourceImageUrl = input.sourceImageUrl;
      body.editInstruction = (input.editInstruction ?? input.prompt ?? "").trim();
    } else if (imageMode === "enhance_asset") {
      if (!input.sourceImageUrl) {
        return { success: false, error: "Source image is required." };
      }
      body.sourceImageUrl = input.sourceImageUrl;
      body.prompt = input.prompt?.trim() || "Enhance image quality, clarity and resolution.";
    } else {
      if (!input.prompt?.trim()) {
        return { success: false, error: "Prompt is required." };
      }
      body.prompt = input.prompt.trim();
    }

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${input.token}`,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (!res.ok) {
      const systemFault =
        data.status === "SYSTEM_FAULT" || data.reason === "system_fault";
      return {
        success: false,
        error:
          typeof data.error === "string"
            ? data.error
            : systemFault
              ? "System fault — engine temporarily unavailable."
              : "Generation failed.",
        reason: typeof data.reason === "string" ? data.reason : undefined,
        code: typeof data.code === "string" ? data.code : undefined,
        status: res.status,
      };
    }

    return {
      success: true,
      generationId: data.generationId,
      queued: data.queued === true,
    };
  }

  return { success: false, error: "This tool has no generation route configured." };
}

export function getCreditCostForTool(key: ActiveTool): number {
  return getMatrixEntry(key)?.creditCost ?? 0;
}

function parseCampaignExpansion(raw: unknown): CampaignExpansionData | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const viral_hooks = Array.isArray(obj.viral_hooks)
    ? obj.viral_hooks.filter((h): h is string => typeof h === "string")
    : [];
  const video_script =
    typeof obj.video_script === "string" ? obj.video_script : "";
  const hashtags = Array.isArray(obj.hashtags)
    ? obj.hashtags.filter((h): h is string => typeof h === "string")
    : [];
  if (!viral_hooks.length || !video_script || !hashtags.length) return null;
  return { viral_hooks, video_script, hashtags };
}

/** White-label API / poll errors for studio tool panels. */
export function formatToolGenerateError(
  result: { error: string; reason?: string; code?: string },
  language: GenerationLanguage
): string {
  return formatGenerationErrorFromApi(result, language);
}

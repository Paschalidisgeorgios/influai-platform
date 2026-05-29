import { getMatrixEntry, type ActiveTool } from "./creative-tool-matrix";

export type ToolGenerateResult =
  | {
      success: true;
      generationId?: string;
      imageUrl?: string;
      videoUrl?: string;
      queued?: boolean;
      plan?: Record<string, unknown>;
    }
  | {
      success: false;
      error: string;
      reason?: string;
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
};

/**
 * Central dispatcher for tool generation.
 * Routes to existing API handlers; does not expose secrets.
 */
export async function handleGenerateForTool(
  input: ToolGenerateInput
): Promise<ToolGenerateResult> {
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
      return { success: false, error: data.error || "Generation failed." };
    }
    return {
      success: true,
      generationId: data.generationId,
      videoUrl: data.videoUrl,
    };
  }

  if (tool.generateRoute === "/api/generate") {
    const imageMode = tool.imageMode ?? "standard";
    const body: Record<string, unknown> = {
      imageMode,
      outputFormat: input.outputFormat ?? "square",
    };

    if (imageMode === "video_image_to_video") {
      if (!input.sourceImageUrl) {
        return { success: false, error: "Source image is required." };
      }
      if (!input.motionInstruction?.trim()) {
        return { success: false, error: "Motion prompt is required." };
      }
      body.sourceImageUrl = input.sourceImageUrl;
      body.motionInstruction = input.motionInstruction.trim();
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
      return {
        success: false,
        error: data.error || "Generation failed.",
        reason: data.reason,
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

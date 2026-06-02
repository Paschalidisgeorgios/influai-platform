/**
 * Universal Krea model router — server-side only.
 */

import type { KreaModelConfig } from "@/lib/ai/krea-model-registry";
import {
  runKrea3DAdapter,
  runKreaAudioAdapter,
  runKreaEditAdapter,
  runKreaEnhancerAdapter,
  runKreaImageAdapter,
  runKreaLipsyncAdapter,
  runKreaMotionTransferAdapter,
  runKreaRealtimeAdapter,
  runKreaTrainingAdapter,
  runKreaVideoAdapter,
  runKreaVideoRestyleAdapter,
  runKreaWorkflowAdapter,
  type KreaAdapterInput,
  type KreaAdapterOutput,
} from "./krea-adapters";
import { KreaGenerationError, throwNotImplemented } from "./krea-errors";

export type { KreaAdapterInput, KreaAdapterOutput };

export async function runKreaModel(
  params: KreaAdapterInput
): Promise<KreaAdapterOutput> {
  const category = params.model.category;

  try {
    switch (category) {
      case "image":
        return runKreaImageAdapter(params);
      case "realtime":
        return runKreaRealtimeAdapter(params);
      case "video":
        return runKreaVideoAdapter(params);
      case "edit":
        return runKreaEditAdapter(params);
      case "enhancer":
        return runKreaEnhancerAdapter(params);
      case "lipsync":
        return runKreaLipsyncAdapter(params);
      case "motion_transfer":
        return runKreaMotionTransferAdapter(params);
      case "video_restyle":
        return runKreaVideoRestyleAdapter(params);
      case "3d":
        return runKrea3DAdapter(params);
      case "audio":
        return runKreaAudioAdapter(params);
      case "training":
      case "style_training":
        return runKreaTrainingAdapter(params);
      case "workflow":
        return runKreaWorkflowAdapter(params);
      default:
        throwNotImplemented();
    }
  } catch (error) {
    if (error instanceof KreaGenerationError) throw error;
    if (error instanceof Error && error.message.includes("KREA_TOOL_NOT_IMPLEMENTED")) {
      throwNotImplemented();
    }
    throw error;
  }
}

export function assertModelRunnable(model: KreaModelConfig): void {
  if (
    model.availability === "not_configured" ||
    model.availability === "failed_validation" ||
    model.availability === "hidden"
  ) {
    throw new KreaGenerationError(
      `Model "${model.label}" is not configured.`,
      "MODEL_NOT_CONFIGURED",
      400
    );
  }
}

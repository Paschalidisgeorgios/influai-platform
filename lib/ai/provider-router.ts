/**
 * Universal provider router — server-side only.
 */

import type { EngineModelConfig } from "@/lib/ai/model-registry";
import { getKreaModelById } from "@/lib/ai/krea-model-registry";
import { runKreaModel } from "@/lib/krea/krea-generation-router";
import { runFalModel } from "@/lib/fal/fal-adapters";

export type EngineRunInput = {
  model: EngineModelConfig;
  prompt?: string;
  selectedFormat?: string;
  inputs?: {
    sourceImageUrl?: string;
    sourceVideoUrl?: string;
    sourceAudioUrl?: string;
    referenceImageUrl?: string;
    scriptText?: string;
    trainingImages?: string[];
    duration?: number;
    resolution?: string;
  };
};

export type EngineRunOutput = {
  outputType: EngineModelConfig["outputType"];
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  textOutput?: string;
  meshUrl?: string;
  styleId?: string;
  raw?: unknown;
  providerJobId?: string;
};

export async function runEngineModel(
  params: EngineRunInput
): Promise<EngineRunOutput> {
  const { model } = params;

  if (model.provider === "krea") {
    const kreaModel = getKreaModelById(model.id);
    if (!kreaModel) {
      throw new Error("MODEL_NOT_CONFIGURED");
    }
    const result = await runKreaModel({
      model: kreaModel,
      prompt: params.prompt,
      selectedFormat: params.selectedFormat,
      inputs: params.inputs,
    });
    return {
      outputType: result.outputType as EngineRunOutput["outputType"],
      imageUrl: result.imageUrl,
      videoUrl: result.videoUrl,
      audioUrl: result.audioUrl,
      textOutput: result.textOutput,
      meshUrl: result.meshUrl,
      styleId: result.styleId,
      raw: result.raw,
      providerJobId: result.providerJobId,
    };
  }

  if (model.provider === "fal") {
    const result = await runFalModel({
      model,
      prompt: params.prompt,
      selectedFormat: params.selectedFormat,
      inputs: params.inputs,
    });
    return {
      outputType: result.outputType,
      imageUrl: result.imageUrl,
      videoUrl: result.videoUrl,
      audioUrl: result.audioUrl,
      textOutput: result.textOutput,
      raw: result.raw,
      providerJobId: result.providerJobId,
    };
  }

  throw new Error("PROVIDER_NOT_SUPPORTED");
}

export function assertEngineModelRunnable(model: EngineModelConfig): void {
  if (
    model.availability === "not_configured" ||
    model.availability === "failed_validation" ||
    model.availability === "hidden"
  ) {
    throw new Error(`Model "${model.label}" is not configured.`);
  }
}

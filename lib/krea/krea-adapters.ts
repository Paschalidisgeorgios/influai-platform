/**
 * Krea category adapters — server-side only.
 * All generation uses official SDK subscribe() + OpenAPI-derived paths.
 */

import type { KreaModelConfig } from "@/lib/ai/krea-model-registry";
import {
  getKreaInternalModel,
  isExecutableModelPath,
  resolveKreaInternalModel,
} from "@/lib/ai/krea-model-registry";
import { kreaAspectRatioFromFormatKey } from "@/lib/providers";
import { throwNotImplemented } from "./krea-errors";
import type { KreaOutputType } from "@/lib/ai/krea-model-registry";
import { generateViaKreaSubscribe } from "./krea-subscribe-generation";
import { assertOfficialKreaModelPath } from "./krea-official-catalog";

export type KreaAdapterInput = {
  model: KreaModelConfig;
  prompt?: string;
  selectedFormat?: string;
  inputs?: {
    sourceImageUrl?: string;
    sourceVideoUrl?: string;
    sourceAudioUrl?: string;
    referenceImageUrl?: string;
    scriptText?: string;
    trainingImages?: string[];
  };
};

export type KreaAdapterOutput = {
  outputType: KreaOutputType;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  textOutput?: string;
  meshUrl?: string;
  styleId?: string;
  raw?: unknown;
  providerJobId?: string;
};

function modelPathFor(model: KreaModelConfig, tool?: string): string {
  try {
    const path = resolveKreaInternalModel(model.id, tool as never);
    if (!isExecutableModelPath(path)) throwNotImplemented();
    assertOfficialKreaModelPath(path);
    return path;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith("OFFICIAL_MODEL_NOT_FOUND")
    ) {
      throwNotImplemented();
    }
    throwNotImplemented();
  }
}

function aspectFromFormat(selectedFormat?: string): string | undefined {
  return selectedFormat
    ? kreaAspectRatioFromFormatKey(selectedFormat)
    : undefined;
}

function toAdapterOutput(
  result: Awaited<ReturnType<typeof generateViaKreaSubscribe>>,
  outputType: KreaOutputType
): KreaAdapterOutput {
  if (outputType === "video" && result.videoUrl) {
    return {
      outputType: "video",
      videoUrl: result.videoUrl,
      raw: result.raw,
      providerJobId: result.providerJobId,
    };
  }

  if (result.imageUrl) {
    return {
      outputType: outputType === "mesh" ? "mesh" : "image",
      imageUrl: result.imageUrl,
      raw: result.raw,
      providerJobId: result.providerJobId,
    };
  }

  throw new Error("NO_OUTPUT_URL");
}

export async function runKreaImageAdapter(
  params: KreaAdapterInput
): Promise<KreaAdapterOutput> {
  const prompt = params.prompt?.trim();
  if (!prompt) throw new Error("MISSING_PROMPT");

  const modelPath = modelPathFor(params.model, "image");
  const result = await generateViaKreaSubscribe({
    modelPath,
    prompt,
    aspectRatio: aspectFromFormat(params.selectedFormat),
    sourceImageUrl: params.inputs?.sourceImageUrl,
    referenceImageUrl: params.inputs?.referenceImageUrl,
    expect: "image",
  });

  return toAdapterOutput(result, "image");
}

export async function runKreaRealtimeAdapter(
  params: KreaAdapterInput
): Promise<KreaAdapterOutput> {
  return runKreaImageAdapter(params);
}

export async function runKreaVideoAdapter(
  params: KreaAdapterInput
): Promise<KreaAdapterOutput> {
  const modelPath = modelPathFor(params.model, "video");
  const endpoint = assertOfficialKreaModelPath(modelPath);

  const prompt = params.prompt?.trim() ?? "";
  const startImage =
    params.inputs?.sourceImageUrl?.trim() ??
    params.inputs?.referenceImageUrl?.trim();

  if (!prompt && endpoint.requiredFields.includes("prompt")) {
    throw new Error("MISSING_PROMPT");
  }

  const result = await generateViaKreaSubscribe({
    modelPath,
    prompt: prompt || "Cinematic motion",
    aspectRatio: aspectFromFormat(params.selectedFormat),
    sourceImageUrl: startImage,
    sourceVideoUrl: params.inputs?.sourceVideoUrl,
    duration: 5,
    expect: "video",
  });

  return toAdapterOutput(result, "video");
}

export async function runKreaEditAdapter(
  params: KreaAdapterInput
): Promise<KreaAdapterOutput> {
  const prompt = params.prompt?.trim();
  const source =
    params.inputs?.sourceImageUrl?.trim() ??
    params.inputs?.referenceImageUrl?.trim();
  if (!prompt) throw new Error("MISSING_PROMPT");
  if (!source) throw new Error("MISSING_SOURCE_IMAGE");

  const modelPath = modelPathFor(params.model, "edit");
  const result = await generateViaKreaSubscribe({
    modelPath,
    prompt,
    sourceImageUrl: source,
    referenceImageUrl: source,
    expect: "image",
  });

  return toAdapterOutput(result, "image");
}

export async function runKreaEnhancerAdapter(
  params: KreaAdapterInput
): Promise<KreaAdapterOutput> {
  const source = params.inputs?.sourceImageUrl?.trim();
  if (!source) throw new Error("MISSING_SOURCE_IMAGE");

  const modelPath = modelPathFor(params.model, "enhancer");
  const endpoint = assertOfficialKreaModelPath(modelPath);

  const topazModel =
    endpoint.modelPath === "topaz/bloom-enhance"
      ? "Bloom"
      : endpoint.modelPath === "topaz/generative-enhance"
        ? "Generative"
        : "Standard V2";

  const result = await generateViaKreaSubscribe({
    modelPath,
    sourceImageUrl: source,
    prompt: params.prompt?.trim(),
    scalingFactor: 2,
    topazModel,
    expect: "image",
  });

  return toAdapterOutput(result, "image");
}

export async function runKreaLipsyncAdapter(_params: KreaAdapterInput): Promise<KreaAdapterOutput> {
  throwNotImplemented();
}

export async function runKreaMotionTransferAdapter(
  params: KreaAdapterInput
): Promise<KreaAdapterOutput> {
  const modelPath = modelPathFor(params.model, "motion_transfer");
  const endpoint = assertOfficialKreaModelPath(modelPath);

  const sourceImage = params.inputs?.sourceImageUrl?.trim();
  const sourceVideo = params.inputs?.sourceVideoUrl?.trim();
  if (!sourceImage) throw new Error("MISSING_SOURCE_IMAGE");
  if (!sourceVideo) throw new Error("MISSING_SOURCE_VIDEO");

  const prompt =
    params.prompt?.trim() ||
    "Apply the driving motion to the portrait while preserving identity and likeness.";

  if (endpoint.modelPath === "runway/aleph") {
    const result = await generateViaKreaSubscribe({
      modelPath,
      prompt,
      sourceImageUrl: sourceImage,
      sourceVideoUrl: sourceVideo,
      motionTransfer: true,
      expect: "video",
    });
    return toAdapterOutput(result, "video");
  }

  throwNotImplemented();
}

export async function runKreaVideoRestyleAdapter(
  params: KreaAdapterInput
): Promise<KreaAdapterOutput> {
  const modelPath = modelPathFor(params.model, "video_restyle");
  const endpoint = assertOfficialKreaModelPath(modelPath);

  if (endpoint.modelPath === "runway/aleph") {
    const prompt = params.prompt?.trim();
    const sourceVideo = params.inputs?.sourceVideoUrl?.trim();
    if (!prompt) throw new Error("MISSING_PROMPT");
    if (!sourceVideo) throw new Error("MISSING_SOURCE_VIDEO");

    const result = await generateViaKreaSubscribe({
      modelPath,
      prompt,
      sourceVideoUrl: sourceVideo,
      expect: "video",
    });
    return toAdapterOutput(result, "video");
  }

  return runKreaEditAdapter(params);
}

export async function runKrea3DAdapter(params: KreaAdapterInput): Promise<KreaAdapterOutput> {
  const result = await runKreaImageAdapter(params);
  return { ...result, outputType: params.model.outputType === "mesh" ? "mesh" : "image" };
}

export async function runKreaAudioAdapter(_params: KreaAdapterInput): Promise<KreaAdapterOutput> {
  throwNotImplemented();
}

export async function runKreaTrainingAdapter(_params: KreaAdapterInput): Promise<KreaAdapterOutput> {
  throwNotImplemented();
}

export async function runKreaWorkflowAdapter(
  params: KreaAdapterInput
): Promise<KreaAdapterOutput> {
  return {
    outputType: "text",
    textOutput: params.prompt?.trim()
      ? `Workflow plan for: ${params.prompt.trim()}`
      : "Workflow plan generated locally.",
  };
}

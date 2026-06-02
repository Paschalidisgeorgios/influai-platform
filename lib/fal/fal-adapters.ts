import { getFalClient } from "@/lib/fal/fal-client";
import { throwMappedFalError } from "@/lib/fal/fal-errors";
import type { EngineModelConfig } from "@/lib/ai/model-registry";
import { buildFalInput } from "@/lib/fal/fal-input-builders";
import { extractFalImageUrl, extractFalVideoUrl } from "@/lib/fal/fal-response-extractors";

export type FalAdapterInput = {
  model: EngineModelConfig;
  prompt?: string;
  selectedFormat?: string;
  inputs?: {
    sourceImageUrl?: string;
    sourceVideoUrl?: string;
    sourceAudioUrl?: string;
    scriptText?: string;
    duration?: number;
    resolution?: string;
  };
};

export type FalAdapterOutput = {
  outputType: "image" | "video" | "audio" | "text" | "mesh" | "style";
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  textOutput?: string;
  raw?: unknown;
  providerJobId?: string;
};

export async function runFalModel(
  params: FalAdapterInput
): Promise<FalAdapterOutput> {
  const fal = getFalClient();
  const input = buildFalInput(params);

  let result;
  try {
    result = await fal.subscribe(params.model.providerModel as `${string}/${string}`, {
      input,
      logs: true,
    });
  } catch (error) {
    throwMappedFalError(error);
  }

  const requestId =
    result && typeof result === "object" && "requestId" in result
      ? String((result as { requestId?: string }).requestId ?? "")
      : undefined;

  if (params.model.outputType === "image") {
    const imageUrl = extractFalImageUrl(result);
    if (!imageUrl) throw new Error("NO_OUTPUT_URL");
    return {
      outputType: "image",
      imageUrl,
      raw: result,
      providerJobId: requestId,
    };
  }

  if (params.model.outputType === "video") {
    const videoUrl = extractFalVideoUrl(result);
    if (!videoUrl) throw new Error("NO_OUTPUT_URL");
    return {
      outputType: "video",
      videoUrl,
      raw: result,
      providerJobId: requestId,
    };
  }

  return { outputType: params.model.outputType, raw: result, providerJobId: requestId };
}

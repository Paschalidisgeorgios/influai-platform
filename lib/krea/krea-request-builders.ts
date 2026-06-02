/**
 * Build Krea API request bodies from InfluExAi studio params + official OpenAPI schemas.
 */

import {
  assertOfficialKreaModelPath,
  type KreaOfficialEndpoint,
} from "./krea-official-catalog";
import {
  kreaApiAspectRatio,
  kreaDimensionsFromAspectRatio,
} from "@/lib/providers/krea";

export type KreaGenerationParams = {
  prompt?: string;
  aspectRatio?: string;
  width?: number;
  height?: number;
  sourceImageUrl?: string;
  sourceVideoUrl?: string;
  referenceImageUrl?: string;
  duration?: number;
  generateAudio?: boolean;
  topazModel?: string;
  scalingFactor?: number;
  /** Portrait + driving-video motion transfer (Runway Aleph). */
  motionTransfer?: boolean;
};

function dimsFromAspect(aspectRatio?: string): { width: number; height: number } {
  const ratio = kreaApiAspectRatio(aspectRatio);
  return kreaDimensionsFromAspectRatio(ratio);
}

function isKrea2Path(modelPath: string): boolean {
  return modelPath.startsWith("krea/krea-2/");
}

function isBflPath(modelPath: string): boolean {
  return modelPath.startsWith("bfl/");
}

function isZImagePath(modelPath: string): boolean {
  return modelPath.startsWith("z-image/");
}

function usesImageUrlsArray(modelPath: string): boolean {
  return (
    modelPath.startsWith("google/nano-banana") ||
    modelPath.startsWith("openai/gpt-image")
  );
}

function usesSingleImageUrl(modelPath: string): boolean {
  return (
    modelPath.includes("seededit") ||
    modelPath.includes("kontext") ||
    modelPath.startsWith("bfl/flux-1-dev")
  );
}

function buildImageBody(
  endpoint: KreaOfficialEndpoint,
  params: KreaGenerationParams
): Record<string, unknown> {
  const prompt = params.prompt?.trim();
  if (!prompt) throw new Error("MISSING_PROMPT");

  const modelPath = endpoint.modelPath;
  const aspectRatio = kreaApiAspectRatio(params.aspectRatio);
  const { width, height } = dimsFromAspect(params.aspectRatio);

  if (isKrea2Path(modelPath) || isZImagePath(modelPath)) {
    return {
      prompt,
      aspect_ratio: aspectRatio,
      resolution: "1K",
    };
  }

  if (isBflPath(modelPath)) {
    const body: Record<string, unknown> = { prompt, width, height };
    if (params.sourceImageUrl && endpoint.optionalFields.includes("image_url")) {
      body.image_url = params.sourceImageUrl;
    }
    return body;
  }

  const body: Record<string, unknown> = { prompt };

  if (endpoint.optionalFields.includes("aspect_ratio")) {
    body.aspect_ratio = aspectRatio;
  }
  if (endpoint.optionalFields.includes("resolution")) {
    body.resolution = "1K";
  }
  if (endpoint.optionalFields.includes("width")) {
    body.width = params.width ?? width;
  }
  if (endpoint.optionalFields.includes("height")) {
    body.height = params.height ?? height;
  }

  const imageRef =
    params.sourceImageUrl?.trim() ?? params.referenceImageUrl?.trim();
  if (imageRef) {
    if (usesImageUrlsArray(modelPath)) {
      body.image_urls = [imageRef];
    } else if (usesSingleImageUrl(modelPath)) {
      body.image_url = imageRef;
    } else if (endpoint.optionalFields.includes("image_urls")) {
      body.image_urls = [imageRef];
    } else if (endpoint.optionalFields.includes("image_url")) {
      body.image_url = imageRef;
    }
  }

  return body;
}

function buildRunwayAlephMotionBody(
  params: KreaGenerationParams
): Record<string, unknown> {
  const prompt =
    params.prompt?.trim() ||
    "Apply the driving motion to the portrait while preserving identity and likeness.";
  const initVideo = params.sourceVideoUrl?.trim();
  const startImage =
    params.sourceImageUrl?.trim() ?? params.referenceImageUrl?.trim();

  if (!initVideo) throw new Error("MISSING_SOURCE_VIDEO");
  if (!startImage) throw new Error("MISSING_SOURCE_IMAGE");

  return {
    prompt,
    init_video: initVideo,
    init_image_url: startImage,
  };
}

function buildVideoBody(
  endpoint: KreaOfficialEndpoint,
  params: KreaGenerationParams
): Record<string, unknown> {
  if (endpoint.modelPath === "runway/aleph" && params.motionTransfer) {
    return buildRunwayAlephMotionBody(params);
  }

  const prompt = params.prompt?.trim() ?? "";
  if (!prompt && endpoint.requiredFields.includes("prompt")) {
    throw new Error("MISSING_PROMPT");
  }

  const aspectRatio = kreaApiAspectRatio(params.aspectRatio);
  const body: Record<string, unknown> = {};

  if (prompt) body.prompt = prompt;

  const startImage =
    params.sourceImageUrl?.trim() ?? params.referenceImageUrl?.trim();
  if (startImage) {
    body.start_image = startImage;
  }

  if (params.sourceVideoUrl?.trim()) {
    body.start_video = params.sourceVideoUrl.trim();
  }

  if (endpoint.optionalFields.includes("aspect_ratio")) {
    body.aspect_ratio = aspectRatio;
  }

  if (endpoint.optionalFields.includes("duration")) {
    body.duration = params.duration ?? 5;
  }

  if (
    endpoint.optionalFields.includes("generate_audio") &&
    params.generateAudio !== undefined
  ) {
    body.generate_audio = params.generateAudio;
  }

  if (endpoint.requiredFields.includes("width")) {
    const { width, height } = dimsFromAspect(params.aspectRatio);
    body.width = params.width ?? width;
    body.height = params.height ?? height;
  }

  // Runway Aleph requires init_video for video-to-video
  if (
    endpoint.modelPath === "runway/aleph" &&
    params.sourceVideoUrl?.trim()
  ) {
    body.init_video = params.sourceVideoUrl.trim();
  }

  return body;
}

function buildEnhanceBody(
  endpoint: KreaOfficialEndpoint,
  params: KreaGenerationParams
): Record<string, unknown> {
  const source = params.sourceImageUrl?.trim();
  if (!source) throw new Error("MISSING_SOURCE_IMAGE");

  const { width, height } = dimsFromAspect(params.aspectRatio);

  const body: Record<string, unknown> = {
    image_url: source,
    width: params.width ?? width,
    height: params.height ?? height,
    prompt: params.prompt?.trim() ?? "",
    upscaling_activated: true,
    image_scaling_factor: params.scalingFactor ?? 2,
  };

  if (endpoint.requiredFields.includes("model")) {
    body.model = params.topazModel ?? "Standard V2";
  }

  return body;
}

/** Build SDK `input` object for a known official model path. */
export function buildOfficialKreaInput(
  modelPath: string,
  params: KreaGenerationParams
): { subscribePath: string; input: Record<string, unknown> } {
  const endpoint = assertOfficialKreaModelPath(modelPath);

  let input: Record<string, unknown>;
  switch (endpoint.kind) {
    case "image":
      input = buildImageBody(endpoint, params);
      break;
    case "video":
      input = buildVideoBody(endpoint, params);
      break;
    case "enhance":
      input = buildEnhanceBody(endpoint, params);
      break;
    default:
      throw new Error(`UNSUPPORTED_ENDPOINT_KIND:${endpoint.kind}`);
  }

  return {
    subscribePath: endpoint.subscribePath,
    input,
  };
}

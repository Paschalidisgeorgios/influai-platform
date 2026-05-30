import type {
  ProviderGenerationResult,
  ProviderJobPollResult,
} from "./provider-types";
import {
  extractImageUrl,
  extractProviderJobId,
  extractVideoUrl,
  responseShapeKeys,
} from "@/lib/krea/response-extract";
import { resolveKreaModelPathForWorkflow } from "./krea-workflows";

const KREA_API_BASE =
  process.env.KREA_API_BASE_URL?.trim() || "https://api.krea.ai";

/** POC default — override via KREA_IMAGE_MODEL_PATH env if needed. */
const DEFAULT_KREA_IMAGE_MODEL_PATH = "bfl/flux-1-dev";

export type KreaCreateImageJobInput = {
  prompt: string;
  width?: number;
  height?: number;
  aspectRatio?: string;
  modelPath?: string;
  workflow?: string;
};

export type KreaCreateEditJobInput = {
  prompt: string;
  imageUrls: string[];
  modelPath?: string;
  workflow?: string;
};

export type KreaCreateVideoJobInput = {
  prompt: string;
  imageUrl: string;
  modelPath?: string;
  duration?: number;
  workflow?: string;
};

export type KreaCreateEnhanceJobInput = {
  imageUrl: string;
  width: number;
  height: number;
  prompt?: string;
  /** Topaz model name, e.g. "Standard V2" */
  topazModel?: string;
  scalingFactor?: number;
  workflow?: string;
  modelPath?: string;
};

export type KreaGenerationResult = ProviderGenerationResult;

/** Maps studio output format keys to Krea aspect ratio strings. */
export function kreaAspectRatioFromFormatKey(formatKey: string): string {
  switch (formatKey) {
    case "tiktok":
    case "instagram_story":
    case "youtube_shorts":
      return "9:16";
    case "instagram_post":
      return "4:5";
    case "youtube_thumbnail":
      return "16:9";
    case "square":
    default:
      return "1:1";
  }
}

/** Maps common aspect ratios to Krea width/height (defaults 1:1). */
export function kreaDimensionsFromAspectRatio(aspectRatio?: string): {
  width: number;
  height: number;
} {
  switch (aspectRatio?.trim()) {
    case "16:9":
      return { width: 1344, height: 768 };
    case "9:16":
      return { width: 768, height: 1344 };
    case "4:5":
      return { width: 1024, height: 1280 };
    case "3:4":
      return { width: 960, height: 1280 };
    case "1:1":
    default:
      return { width: 1024, height: 1024 };
  }
}

type KreaJobResponse = {
  job_id?: string;
  status?: string;
  result?: {
    urls?: string[];
    url?: string;
    video_url?: string;
  };
  error?: string;
};

function extractKreaImageUrl(data: KreaJobResponse): string | undefined {
  return (
    extractImageUrl(data) ??
    (Array.isArray(data.result?.urls) && typeof data.result.urls[0] === "string"
      ? data.result.urls[0]
      : undefined) ??
    (typeof data.result?.url === "string" ? data.result.url : undefined)
  );
}

function extractKreaVideoUrl(data: KreaJobResponse): string | undefined {
  return (
    extractVideoUrl(data) ??
    (typeof data.result?.video_url === "string" ? data.result.video_url : undefined)
  );
}

function normalizeKreaPollStatus(statusRaw: string): ProviderJobPollResult["status"] {
  const s = statusRaw.toLowerCase();
  if (
    s === "completed" ||
    s === "succeeded" ||
    s === "success" ||
    s === "done"
  ) {
    return "completed";
  }
  if (s === "failed" || s === "error") return "failed";
  if (s === "cancelled" || s === "canceled") return "cancelled";
  if (s === "queued" || s === "backlog" || s === "pending") return "queued";
  if (s === "running" || s === "processing" || s === "in_progress") {
    return "processing";
  }
  return "processing";
}

import { isKreaEnabled } from "./krea-workflows";

export { isKreaEnabled };

/** Server-only — never expose to the client. */
export function getKreaApiKey(): string {
  const apiKey = process.env.KREA_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("KREA_API_KEY is not configured");
  }
  return apiKey;
}

function resolveKreaPath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

/** Authenticated JSON request to the Krea API. */
export async function kreaRequest<T = unknown>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(`${KREA_API_BASE}${resolveKreaPath(path)}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getKreaApiKey()}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Krea API request failed: ${response.status} ${text}`);
  }

  return response.json() as Promise<T>;
}

function resolveModelPath(modelPath?: string): string {
  const fromEnv = process.env.KREA_IMAGE_MODEL_PATH?.trim();
  const path = modelPath || fromEnv || DEFAULT_KREA_IMAGE_MODEL_PATH;
  return path.replace(/^\/+/, "");
}

export function resolveKreaModelId(modelPath?: string): string {
  return `krea/${resolveModelPath(modelPath)}`;
}

function resolveModelPathForInput(
  input: { modelPath?: string; workflow?: string }
): string {
  if (input.modelPath?.trim()) {
    return resolveModelPath(input.modelPath);
  }
  if (input.workflow) {
    return resolveKreaModelPathForWorkflow(input.workflow);
  }
  return resolveModelPath();
}

/** Maps studio aspect ratios to Krea API `aspect_ratio` enum values. */
export function kreaApiAspectRatio(aspectRatio?: string): string {
  switch (aspectRatio?.trim()) {
    case "16:9":
      return "16:9";
    case "9:16":
      return "9:16";
    case "4:5":
      return "4:5";
    case "4:3":
      return "4:3";
    case "3:2":
      return "3:2";
    case "2:3":
      return "2:3";
    case "2.35:1":
      return "2.35:1";
    case "3:4":
      return "2:3";
    case "1:1":
    default:
      return "1:1";
  }
}

function buildKreaImageJobBody(
  input: KreaCreateImageJobInput,
  modelPath: string
): Record<string, unknown> {
  const aspectRatio = kreaApiAspectRatio(input.aspectRatio);
  const fromAspect = kreaDimensionsFromAspectRatio(aspectRatio);
  const width = input.width ?? fromAspect.width;
  const height = input.height ?? fromAspect.height;

  // Krea proprietary models require aspect_ratio (+ resolution), not width/height alone.
  if (modelPath.startsWith("krea/krea-")) {
    return {
      prompt: input.prompt,
      aspect_ratio: aspectRatio,
      resolution: "1K",
    };
  }

  // BFL Flux endpoints accept width/height only — aspect_ratio causes 422.
  if (modelPath.startsWith("bfl/")) {
    return {
      prompt: input.prompt,
      width,
      height,
    };
  }

  return {
    prompt: input.prompt,
    width,
    height,
    aspect_ratio: aspectRatio,
  };
}

export async function createKreaImageJob(
  input: KreaCreateImageJobInput
): Promise<ProviderGenerationResult> {
  const modelPath = resolveModelPathForInput(input);
  const model = resolveKreaModelId(modelPath);

  let data: KreaJobResponse;

  try {
    data = await kreaRequest<KreaJobResponse>(`/generate/image/${modelPath}`, {
      method: "POST",
      body: JSON.stringify(buildKreaImageJobBody(input, modelPath)),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Krea image job failed.";
    throw new Error(message);
  }

  const providerJobId =
    extractProviderJobId(data) ??
    (typeof data.job_id === "string" && data.job_id.trim().length > 0
      ? data.job_id.trim()
      : null);

  if (!providerJobId) {
    throw new Error("Krea did not return a job_id.");
  }

  return {
    provider: "krea",
    model,
    providerJobId,
    raw: data,
  };
}

export async function pollKreaJob(jobId: string): Promise<ProviderJobPollResult> {
  try {
    const data = await kreaRequest<KreaJobResponse>(
      `/jobs/${encodeURIComponent(jobId)}`,
      { method: "GET" }
    );

    const statusRaw = (data.status || "processing").toLowerCase();
    const status = normalizeKreaPollStatus(statusRaw);

    const imageUrl = extractKreaImageUrl(data);
    const videoUrl = extractKreaVideoUrl(data);

    if (status === "completed" && !imageUrl && !videoUrl) {
      console.info(
        "[krea-poll] completed without url",
        JSON.stringify({ jobId, keys: responseShapeKeys(data) })
      );
    }

    return {
      status,
      providerJobId: jobId,
      imageUrl,
      videoUrl,
      raw: data,
      errorMessage:
        status === "failed" ? data.error || "Krea job failed." : undefined,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Krea job poll failed.";
    return {
      status: "failed",
      providerJobId: jobId,
      errorMessage: message,
    };
  }
}

export async function createKreaEditJob(
  input: KreaCreateEditJobInput
): Promise<ProviderGenerationResult> {
  const modelPath = resolveModelPathForInput({
    modelPath: input.modelPath,
    workflow: input.workflow ?? "reference_edit",
  });
  const model = resolveKreaModelId(modelPath);

  const data = await kreaRequest<KreaJobResponse>(
    `/generate/image/${modelPath}`,
    {
      method: "POST",
      body: JSON.stringify({
        prompt: input.prompt,
        imageUrls: input.imageUrls,
      }),
    }
  );

  const providerJobId =
    typeof data.job_id === "string" && data.job_id.trim().length > 0
      ? data.job_id.trim()
      : null;

  if (!providerJobId) {
    throw new Error("Krea did not return a job_id.");
  }

  return {
    provider: "krea",
    model,
    providerJobId,
    raw: data,
  };
}

const DEFAULT_KREA_ENHANCE_PATH = "topaz/standard-enhance";

function resolveKreaEnhanceApiPath(input?: { modelPath?: string; workflow?: string }): string {
  const fromEnv = process.env.KREA_ENHANCE_API_PATH?.trim();
  if (fromEnv) {
    return fromEnv.replace(/^\/+/, "");
  }
  const modelPath = input?.modelPath?.trim()
    ? input.modelPath.trim().replace(/^enhance\//, "")
    : resolveKreaModelPathForWorkflow(input?.workflow ?? "enhance_asset");
  if (modelPath.startsWith("enhance/")) {
    return modelPath.replace(/^enhance\//, "");
  }
  if (modelPath.includes("/")) {
    return modelPath;
  }
  return modelPath || DEFAULT_KREA_ENHANCE_PATH;
}

export async function createKreaEnhanceJob(
  input: KreaCreateEnhanceJobInput
): Promise<ProviderGenerationResult> {
  const enhancePath = resolveKreaEnhanceApiPath(input);
  const model = `krea/enhance/${enhancePath}`;

  const data = await kreaRequest<KreaJobResponse>(
    `/generate/enhance/${enhancePath}`,
    {
      method: "POST",
      body: JSON.stringify({
        image_url: input.imageUrl,
        width: input.width,
        height: input.height,
        model: input.topazModel ?? "Standard V2",
        prompt: input.prompt ?? "",
        upscaling_activated: true,
        image_scaling_factor: input.scalingFactor ?? 2,
      }),
    }
  );

  const providerJobId =
    typeof data.job_id === "string" && data.job_id.trim().length > 0
      ? data.job_id.trim()
      : null;

  if (!providerJobId) {
    throw new Error("Krea did not return a job_id.");
  }

  return {
    provider: "krea",
    model,
    providerJobId,
    raw: data,
  };
}

export async function createKreaVideoJob(
  input: KreaCreateVideoJobInput
): Promise<ProviderGenerationResult> {
  const modelPath = resolveModelPathForInput({
    modelPath: input.modelPath,
    workflow: input.workflow ?? "video_image_to_video",
  });
  const model = resolveKreaModelId(modelPath);

  const data = await kreaRequest<KreaJobResponse>(
    `/generate/video/${modelPath}`,
    {
      method: "POST",
      body: JSON.stringify({
        prompt: input.prompt,
        image_url: input.imageUrl,
        duration: input.duration ?? 5,
      }),
    }
  );

  const providerJobId =
    typeof data.job_id === "string" && data.job_id.trim().length > 0
      ? data.job_id.trim()
      : null;

  if (!providerJobId) {
    throw new Error("Krea did not return a job_id.");
  }

  return {
    provider: "krea",
    model,
    providerJobId,
    raw: data,
  };
}

export async function waitForKreaJob(
  jobId: string,
  options?: {
    maxAttempts?: number;
    intervalMs?: number;
    modelPath?: string;
    workflow?: string;
    expect?: "image" | "video";
  }
): Promise<ProviderGenerationResult> {
  const maxAttempts = options?.maxAttempts ?? 60;
  const intervalMs = options?.intervalMs ?? 2000;
  const expect = options?.expect ?? "image";
  const model = resolveKreaModelId(
    options?.modelPath ??
      (options?.workflow
        ? resolveKreaModelPathForWorkflow(options.workflow)
        : undefined)
  );

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const poll = await pollKreaJob(jobId);

    if (poll.status === "completed") {
      if (expect === "video") {
        if (!poll.videoUrl) {
          throw new Error("Krea completed but did not return a video URL.");
        }
        return {
          provider: "krea",
          model,
          videoUrl: poll.videoUrl,
          imageUrl: poll.imageUrl,
          providerJobId: jobId,
          raw: poll.raw,
        };
      }

      if (!poll.imageUrl) {
        throw new Error("Krea completed but did not return an image URL.");
      }

      return {
        provider: "krea",
        model,
        imageUrl: poll.imageUrl,
        providerJobId: jobId,
        raw: poll.raw,
      };
    }

    if (poll.status === "failed" || poll.status === "cancelled") {
      throw new Error(poll.errorMessage || "Krea job failed.");
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(
    "Krea job timed out while polling (max wait exceeded). Credits will be refunded."
  );
}

/** @deprecated Use waitForKreaJob */
export async function waitForKreaImageJob(
  jobId: string,
  options?: { maxAttempts?: number; intervalMs?: number; workflow?: string }
): Promise<ProviderGenerationResult> {
  return waitForKreaJob(jobId, { ...options, expect: "image" });
}

export async function generateKreaImage(
  input: KreaCreateImageJobInput
): Promise<KreaGenerationResult> {
  const job = await createKreaImageJob(input);
  if (!job.providerJobId) {
    throw new Error("Krea did not return a job_id.");
  }
  return waitForKreaJob(job.providerJobId, {
    workflow: input.workflow,
    modelPath: resolveModelPathForInput(input),
    expect: "image",
  });
}

export async function generateKreaEdit(
  input: KreaCreateEditJobInput
): Promise<KreaGenerationResult> {
  const job = await createKreaEditJob(input);
  if (!job.providerJobId) {
    throw new Error("Krea did not return a job_id.");
  }
  return waitForKreaJob(job.providerJobId, {
    workflow: input.workflow ?? "reference_edit",
    expect: "image",
    maxAttempts: 90,
    intervalMs: 2000,
  });
}

export async function generateKreaVideo(
  input: KreaCreateVideoJobInput
): Promise<KreaGenerationResult> {
  const job = await createKreaVideoJob(input);
  if (!job.providerJobId) {
    throw new Error("Krea did not return a job_id.");
  }
  return waitForKreaJob(job.providerJobId, {
    workflow: input.workflow ?? "video_image_to_video",
    expect: "video",
    maxAttempts: 18,
    intervalMs: 5000,
  });
}

export async function generateKreaEnhance(
  input: KreaCreateEnhanceJobInput
): Promise<KreaGenerationResult> {
  const job = await createKreaEnhanceJob(input);
  if (!job.providerJobId) {
    throw new Error("Krea did not return a job_id.");
  }
  return waitForKreaJob(job.providerJobId, {
    workflow: input.workflow ?? "enhance_asset",
    modelPath: input.modelPath,
    expect: "image",
    maxAttempts: 90,
    intervalMs: 2000,
  });
}

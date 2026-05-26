import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fal } from "@fal-ai/client";
import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 300;

const OPENAI_IMAGE_WORKFLOWS = new Set(["standard", "ugc_look"]);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const STORAGE_BUCKET = "generations";
const VIDEO_STORAGE_BUCKET = "generation-videos";
const FAL_FLUX_SCHNELL_MODEL = "fal-ai/flux/schnell";
const FAL_FLUX_DEV_MODEL = "fal-ai/flux/dev";
const FAL_NANO_BANANA_PRO_EDIT_MODEL = "fal-ai/nano-banana-pro/edit";
/** Brand Assets — FLUX Dev via fal.ai (Recraft v3 input rejected with 422) */
const FAL_BRAND_ASSETS_MODEL = FAL_FLUX_DEV_MODEL;
const FAL_REQUEST_TIMEOUT_MS = 120_000;
const FAL_PREMIUM_REQUEST_TIMEOUT_MS = 180_000;
const FAL_REFERENCE_EDIT_TIMEOUT_MS = 180_000;
const FAL_BRAND_ASSETS_TIMEOUT_MS = 180_000;
const FAL_KLING_I2V_MODEL = "fal-ai/kling-video/v2.1/standard/image-to-video";
const FAL_VIDEO_REQUEST_TIMEOUT_MS = 300_000;
/** Image + audio → talking video — see docs/LIP_SYNC_IMPLEMENTATION_PLAN.md */
const FAL_LIP_SYNC_IMAGE_MODEL = "fal-ai/ai-avatar";
/** Video + audio → lip-synced output — see docs/LIP_SYNC_IMPLEMENTATION_PLAN.md */
const FAL_LIP_SYNC_VIDEO_MODEL = "fal-ai/sync-lipsync/v2/pro";
const FAL_LIP_SYNC_REQUEST_TIMEOUT_MS = 600_000;

const ERR_PROVIDER_NO_IMAGE_URL = "Provider did not return an image URL.";
const ERR_OPENAI_NO_IMAGE_DATA = "OpenAI did not return image data.";
const OPENAI_IMAGE_MODEL = "gpt-image-1";
const ERR_PROVIDER_NO_VIDEO_URL = "Provider did not return a video URL.";
const REFUND_TRANSACTION_SOURCE = "generation_worker_failure";

type ImageSize = "1024x1024" | "1024x1536" | "1536x1024";

type FalImageSizeInput =
  | "square_hd"
  | "square"
  | "portrait_4_3"
  | "portrait_16_9"
  | "landscape_4_3"
  | "landscape_16_9"
  | { width: number; height: number };

function base64ToBuffer(base64: string) {
  return Buffer.from(base64, "base64");
}

function resolveFalImageSize({
  imageSize,
  outputWidth,
  outputHeight,
}: {
  imageSize: unknown;
  outputWidth: unknown;
  outputHeight: unknown;
}): FalImageSizeInput {
  const width =
    typeof outputWidth === "number" && outputWidth > 0 ? outputWidth : null;
  const height =
    typeof outputHeight === "number" && outputHeight > 0 ? outputHeight : null;

  if (width && height) {
    return { width, height };
  }

  if (imageSize === "1024x1024") {
    return "square_hd";
  }

  if (imageSize === "1024x1536") {
    return "portrait_16_9";
  }

  if (imageSize === "1536x1024") {
    return "landscape_16_9";
  }

  return "square_hd";
}

function normalizeImageSize(value: unknown): ImageSize {
  if (
    value === "1024x1024" ||
    value === "1024x1536" ||
    value === "1536x1024"
  ) {
    return value;
  }

  return "1024x1024";
}

function normalizeWorkflow(value: unknown): string {
  if (typeof value !== "string") return "standard";

  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  if (!normalized) return "standard";
  if (normalized === "ugclook") return "ugc_look";

  return normalized;
}

function normalizeProvider(value: unknown): string {
  if (typeof value !== "string") return "openai";

  const normalized = value.trim().toLowerCase();
  return normalized || "openai";
}

function isOpenAiImageWorkflow(workflow: string, provider: string) {
  return provider === "openai" && OPENAI_IMAGE_WORKFLOWS.has(workflow);
}

function isMissingColumnError(error: { message?: string; code?: string } | null) {
  if (!error?.message) return false;

  return (
    error.code === "PGRST204" ||
    /column.*does not exist|Could not find the .* column/i.test(error.message)
  );
}

type GenerationWorkerRow = {
  id: string;
  user_id: string;
  prompt: string | null;
  final_prompt: string | null;
  status: string;
  provider: string | null;
  model: string | null;
  workflow: string | null;
  credits_used: number | null;
  image_size: unknown;
  output_width: unknown;
  output_height: unknown;
  reference_image_url: string | null;
  source_image_url: string | null;
  source_video_url: string | null;
  audio_url: string | null;
};

function normalizeGenerationRow(data: Record<string, unknown>): GenerationWorkerRow {
  return {
    id: String(data.id),
    user_id: String(data.user_id),
    prompt: typeof data.prompt === "string" ? data.prompt : null,
    final_prompt:
      typeof data.final_prompt === "string" ? data.final_prompt : null,
    status: typeof data.status === "string" ? data.status : "processing",
    provider: typeof data.provider === "string" ? data.provider : null,
    model: typeof data.model === "string" ? data.model : null,
    workflow: typeof data.workflow === "string" ? data.workflow : null,
    credits_used:
      typeof data.credits_used === "number" ? data.credits_used : null,
    image_size: data.image_size ?? null,
    output_width: data.output_width ?? null,
    output_height: data.output_height ?? null,
    reference_image_url:
      typeof data.reference_image_url === "string"
        ? data.reference_image_url
        : null,
    source_image_url:
      typeof data.source_image_url === "string" ? data.source_image_url : null,
    source_video_url:
      typeof data.source_video_url === "string" ? data.source_video_url : null,
    audio_url: typeof data.audio_url === "string" ? data.audio_url : null,
  };
}

async function fetchGenerationForProcessing(generationId: string): Promise<{
  generation: GenerationWorkerRow | null;
  fetchError: string | null;
}> {
  const { data, error } = await supabaseAdmin
    .from("generations")
    .select("*")
    .eq("id", generationId)
    .maybeSingle();

  if (error) {
    console.error("Generation worker fetch error:", { generationId, error });
    return { generation: null, fetchError: error.message };
  }

  if (!data) {
    return { generation: null, fetchError: "Generation not found" };
  }

  return {
    generation: normalizeGenerationRow(
      data as unknown as Record<string, unknown>
    ),
    fetchError: null,
  };
}

async function refundCredits(userId: string, creditsToRefund: number) {
  if (creditsToRefund <= 0) return;

  const { error } = await supabaseAdmin.rpc("refund_user_credits", {
    target_user_id: userId,
    credits_to_refund: creditsToRefund,
  });

  if (error) {
    console.error("Worker credit refund error:", error);
    throw new Error("Credit refund failed.");
  }

  const { error: transactionError } = await supabaseAdmin
    .from("credit_transactions")
    .insert({
      user_id: userId,
      amount: creditsToRefund,
      type: "refund",
      source: REFUND_TRANSACTION_SOURCE,
    });

  if (transactionError) {
    console.error("Worker refund transaction log error:", transactionError);
  }
}

type MarkFailedResult = {
  markedFailed: boolean;
  refunded: boolean;
  skipped: boolean;
};

async function markFailedAndRefund({
  generationId,
  userId,
  creditsUsed,
  errorMessage,
}: {
  generationId: string;
  userId: string;
  creditsUsed: number;
  errorMessage: string;
}): Promise<MarkFailedResult> {
  console.error("Generation failed", {
    generationId,
    errorMessage: errorMessage?.slice(0, 400),
  });

  const { data: current, error: fetchError } = await supabaseAdmin
    .from("generations")
    .select("id, status, credits_used, user_id")
    .eq("id", generationId)
    .maybeSingle();

  if (fetchError) {
    console.error("Worker failed generation fetch error:", fetchError);
    return { markedFailed: false, refunded: false, skipped: true };
  }

  if (!current || current.status !== "processing") {
    return { markedFailed: false, refunded: false, skipped: true };
  }

  const refundTargetUserId =
    typeof current.user_id === "string" ? current.user_id : userId;

  const storedCredits =
    typeof current.credits_used === "number" ? current.credits_used : creditsUsed;

  const refundAmount = storedCredits > 0 ? storedCredits : 0;

  const updatePayload = {
    status: "failed" as const,
    error_message: errorMessage.trim() || "Generation failed.",
    credits_used: 0,
    failed_at: new Date().toISOString(),
  };

  const { data: updated, error: updateError } = await supabaseAdmin
    .from("generations")
    .update(updatePayload)
    .eq("id", generationId)
    .eq("status", "processing")
    .select("id")
    .maybeSingle();

  if (updateError && isMissingColumnError(updateError)) {
    const { data: fallbackUpdated, error: fallbackError } = await supabaseAdmin
      .from("generations")
      .update({
        status: "failed",
        error_message: errorMessage.trim() || "Generation failed.",
        credits_used: 0,
      })
      .eq("id", generationId)
      .eq("status", "processing")
      .select("id")
      .maybeSingle();

    if (fallbackError) {
      console.error("Worker failed generation update error:", fallbackError);
      return { markedFailed: false, refunded: false, skipped: true };
    }

    if (!fallbackUpdated) {
      return { markedFailed: false, refunded: false, skipped: true };
    }

    if (refundAmount <= 0) {
      return { markedFailed: true, refunded: false, skipped: false };
    }

    try {
      await refundCredits(refundTargetUserId, refundAmount);
      return { markedFailed: true, refunded: true, skipped: false };
    } catch (refundError) {
      console.error("Worker refund after failed mark error:", refundError);
      return { markedFailed: true, refunded: false, skipped: false };
    }
  }

  if (updateError) {
    console.error("Worker failed generation update error:", updateError);
    return { markedFailed: false, refunded: false, skipped: true };
  }

  if (!updated) {
    return { markedFailed: false, refunded: false, skipped: true };
  }

  if (refundAmount <= 0) {
    return { markedFailed: true, refunded: false, skipped: false };
  }

  try {
    await refundCredits(refundTargetUserId, refundAmount);
    return { markedFailed: true, refunded: true, skipped: false };
  } catch (refundError) {
    console.error("Worker refund after failed mark error:", refundError);
    return { markedFailed: true, refunded: false, skipped: false };
  }
}

async function uploadImageBuffer({
  userId,
  imageBuffer,
  contentType = "image/png",
}: {
  userId: string;
  imageBuffer: Buffer;
  contentType?: string;
}) {
  const filePath = `${userId}/${crypto.randomUUID()}.png`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, imageBuffer, {
      contentType,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);

  return publicUrl;
}

async function completeGeneration({
  generationId,
  publicUrl,
}: {
  generationId: string;
  publicUrl: string;
}) {
  const completedPayload = {
    image_url: publicUrl,
    status: "completed" as const,
    error_message: null,
    completed_at: new Date().toISOString(),
  };

  const { data: updated, error: updateError } = await supabaseAdmin
    .from("generations")
    .update(completedPayload)
    .eq("id", generationId)
    .eq("status", "processing")
    .select("id")
    .maybeSingle();

  if (updateError && isMissingColumnError(updateError)) {
    const { data: fallbackUpdated, error: fallbackError } = await supabaseAdmin
      .from("generations")
      .update({
        image_url: publicUrl,
        status: "completed",
        error_message: null,
      })
      .eq("id", generationId)
      .eq("status", "processing")
      .select("id")
      .maybeSingle();

    if (fallbackError) {
      throw new Error(fallbackError.message);
    }

    if (!fallbackUpdated) {
      throw new Error("Generation is no longer processing.");
    }

    return;
  }

  if (updateError) {
    throw new Error(updateError.message);
  }

  if (!updated) {
    throw new Error("Generation is no longer processing.");
  }
}

async function completeVideoGeneration({
  generationId,
  publicUrl,
  durationSeconds = 5,
}: {
  generationId: string;
  publicUrl: string;
  durationSeconds?: number;
}) {
  const updatePayload: Record<string, unknown> = {
    video_url: publicUrl,
    status: "completed",
    error_message: null,
    completed_at: new Date().toISOString(),
    duration_seconds: durationSeconds,
  };

  const { data: updated, error: updateError } = await supabaseAdmin
    .from("generations")
    .update(updatePayload)
    .eq("id", generationId)
    .eq("status", "processing")
    .select("id")
    .maybeSingle();

  if (updateError && isMissingColumnError(updateError)) {
    const { data: fallbackUpdated, error: fallbackError } = await supabaseAdmin
      .from("generations")
      .update({
        status: "completed",
        error_message: null,
        completed_at: new Date().toISOString(),
        image_url: publicUrl,
      })
      .eq("id", generationId)
      .eq("status", "processing")
      .select("id")
      .maybeSingle();

    if (fallbackError) {
      throw new Error(fallbackError.message);
    }

    if (!fallbackUpdated) {
      throw new Error("Generation is no longer processing.");
    }

    return;
  }

  if (updateError) {
    throw new Error(updateError.message);
  }

  if (!updated) {
    throw new Error("Generation is no longer processing.");
  }
}

function getFalResultImageUrl(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;

  const images = (data as { images?: unknown }).images;

  if (!Array.isArray(images) || images.length === 0) return null;

  const first = images[0];

  if (typeof first === "string") return first;

  if (
    first &&
    typeof first === "object" &&
    "url" in first &&
    typeof first.url === "string"
  ) {
    return first.url;
  }

  return null;
}

function getFalResultVideoUrl(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;

  const record = data as Record<string, unknown>;

  const video = record.video;
  if (video && typeof video === "object" && video !== null) {
    const url = (video as { url?: unknown }).url;
    if (typeof url === "string" && url.trim()) return url.trim();
  }

  const videos = record.videos;
  if (Array.isArray(videos) && videos.length > 0) {
    const first = videos[0];
    if (typeof first === "string" && first.trim()) return first.trim();
    if (
      first &&
      typeof first === "object" &&
      "url" in first &&
      typeof (first as { url?: unknown }).url === "string"
    ) {
      return (first as { url: string }).url.trim();
    }
  }

  return null;
}

function resolveVideoAspectRatio({
  imageSize,
  outputWidth,
  outputHeight,
}: {
  imageSize: unknown;
  outputWidth: unknown;
  outputHeight: unknown;
}): "16:9" | "9:16" | "1:1" {
  if (imageSize === "1536x1024") return "16:9";
  if (imageSize === "1024x1536") return "9:16";

  const width =
    typeof outputWidth === "number" && outputWidth > 0 ? outputWidth : null;
  const height =
    typeof outputHeight === "number" && outputHeight > 0 ? outputHeight : null;

  if (width && height) {
    if (width > height) return "16:9";
    if (height > width) return "9:16";
  }

  return "1:1";
}

async function downloadImageFromUrl(imageUrl: string) {
  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(`Failed to download generated image (${response.status}).`);
  }

  const contentType = response.headers.get("content-type") || "image/png";
  const imageBuffer = Buffer.from(await response.arrayBuffer());

  return { imageBuffer, contentType };
}

async function downloadVideoFromUrl(videoUrl: string) {
  const response = await fetch(videoUrl);

  if (!response.ok) {
    throw new Error(`Failed to download generated video (${response.status}).`);
  }

  const contentType = response.headers.get("content-type") || "video/mp4";
  const videoBuffer = Buffer.from(await response.arrayBuffer());

  return { videoBuffer, contentType };
}

async function uploadVideoBuffer({
  userId,
  videoBuffer,
  contentType = "video/mp4",
}: {
  userId: string;
  videoBuffer: Buffer;
  contentType?: string;
}) {
  const extension = contentType.includes("webm") ? "webm" : "mp4";
  const filePath = `${userId}/${crypto.randomUUID()}.${extension}`;

  const tryBuckets = [VIDEO_STORAGE_BUCKET, STORAGE_BUCKET];

  for (const bucket of tryBuckets) {
    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, videoBuffer, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      // If the optional video bucket doesn't exist yet, fall back to `generations`.
      if (
        bucket === VIDEO_STORAGE_BUCKET &&
        /bucket.*not found|does not exist/i.test(uploadError.message)
      ) {
        continue;
      }

      throw new Error(uploadError.message);
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath);

    return publicUrl;
  }

  throw new Error("Video upload failed.");
}

type FalFluxJobOptions = {
  generationId: string;
  userId: string;
  finalPrompt: string;
  creditsUsed: number;
  imageSize: unknown;
  outputWidth: unknown;
  outputHeight: unknown;
  falModel: string;
  numInferenceSteps: number;
  timeoutMs: number;
  workflow: string;
  modeLabel: string;
  serverFlagEnv: string;
};

async function processFalFluxImage({
  generationId,
  userId,
  finalPrompt,
  creditsUsed,
  imageSize,
  outputWidth,
  outputHeight,
  falModel,
  numInferenceSteps,
  timeoutMs,
  workflow,
  modeLabel,
  serverFlagEnv,
}: FalFluxJobOptions) {
  if (process.env[serverFlagEnv] !== "true") {
    await markFailedAndRefund({
      generationId,
      userId,
      creditsUsed,
      errorMessage: `${modeLabel} is not enabled on the server.`,
    });

    return NextResponse.json(
      { error: `${modeLabel} is not enabled. Credits refunded.` },
      { status: 400 }
    );
  }

  if (!process.env.FAL_KEY) {
    await markFailedAndRefund({
      generationId,
      userId,
      creditsUsed,
      errorMessage: "FAL_KEY is not configured.",
    });

    return NextResponse.json(
      { error: "Image provider is not configured. Credits refunded." },
      { status: 500 }
    );
  }

  fal.config({
    credentials: process.env.FAL_KEY,
  });

  const falImageSize = resolveFalImageSize({
    imageSize,
    outputWidth,
    outputHeight,
  });

  try {
    const result = await Promise.race([
      fal.subscribe(falModel, {
        input: {
          prompt: finalPrompt,
          image_size: falImageSize,
          num_images: 1,
          num_inference_steps: numInferenceSteps,
          output_format: "png",
        },
        logs: false,
      }),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`${modeLabel} provider timed out.`));
        }, timeoutMs);
      }),
    ]);

    const remoteImageUrl = getFalResultImageUrl(result.data);

    if (!remoteImageUrl) {
      await markFailedAndRefund({
        generationId,
        userId,
        creditsUsed,
        errorMessage: ERR_PROVIDER_NO_IMAGE_URL,
      });

      return NextResponse.json(
        { error: "Image generation failed. Credits refunded." },
        { status: 500 }
      );
    }

    const { imageBuffer, contentType } = await downloadImageFromUrl(remoteImageUrl);

    const publicUrl = await uploadImageBuffer({
      userId,
      imageBuffer,
      contentType,
    });

    await completeGeneration({
      generationId,
      publicUrl,
    });

    return NextResponse.json({
      success: true,
      generationId,
      image: publicUrl,
      workflow,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : `${modeLabel} generation failed.`;

    await markFailedAndRefund({
      generationId,
      userId,
      creditsUsed,
      errorMessage,
    });

    return NextResponse.json(
      { error: "Image generation failed. Credits refunded." },
      { status: 500 }
    );
  }
}

async function processFastDraftImage(args: {
  generationId: string;
  userId: string;
  finalPrompt: string;
  creditsUsed: number;
  imageSize: unknown;
  outputWidth: unknown;
  outputHeight: unknown;
}) {
  return processFalFluxImage({
    ...args,
    falModel: FAL_FLUX_SCHNELL_MODEL,
    numInferenceSteps: 4,
    timeoutMs: FAL_REQUEST_TIMEOUT_MS,
    workflow: "fast_draft",
    modeLabel: "Fast Draft",
    serverFlagEnv: "ENABLE_FAL_FAST_DRAFT",
  });
}

async function processPremiumImage(args: {
  generationId: string;
  userId: string;
  finalPrompt: string;
  creditsUsed: number;
  imageSize: unknown;
  outputWidth: unknown;
  outputHeight: unknown;
}) {
  return processFalFluxImage({
    ...args,
    falModel: FAL_FLUX_DEV_MODEL,
    numInferenceSteps: 28,
    timeoutMs: FAL_PREMIUM_REQUEST_TIMEOUT_MS,
    workflow: "premium_image",
    modeLabel: "Premium Image",
    serverFlagEnv: "ENABLE_FAL_PREMIUM_IMAGE",
  });
}

async function processReferenceEditImage({
  generationId,
  userId,
  finalPrompt,
  creditsUsed,
  sourceImageUrl,
}: {
  generationId: string;
  userId: string;
  finalPrompt: string;
  creditsUsed: number;
  sourceImageUrl: string | null;
}) {
  if (process.env.ENABLE_FAL_REFERENCE_EDIT !== "true") {
    await markFailedAndRefund({
      generationId,
      userId,
      creditsUsed,
      errorMessage: "Reference Edit is not enabled on the server.",
    });

    return NextResponse.json(
      { error: "Reference Edit is not enabled. Credits refunded." },
      { status: 400 }
    );
  }

  if (!process.env.FAL_KEY) {
    await markFailedAndRefund({
      generationId,
      userId,
      creditsUsed,
      errorMessage: "FAL_KEY is not configured.",
    });

    return NextResponse.json(
      { error: "Image provider is not configured. Credits refunded." },
      { status: 500 }
    );
  }

  if (!sourceImageUrl) {
    await markFailedAndRefund({
      generationId,
      userId,
      creditsUsed,
      errorMessage: "Reference Edit source image is missing.",
    });

    return NextResponse.json(
      { error: "Reference Edit source image is missing. Credits refunded." },
      { status: 400 }
    );
  }

  fal.config({
    credentials: process.env.FAL_KEY,
  });

  try {
    const result = await Promise.race([
      fal.subscribe(FAL_NANO_BANANA_PRO_EDIT_MODEL, {
        input: {
          prompt: finalPrompt,
          image_urls: [sourceImageUrl],
          num_images: 1,
          output_format: "png",
          resolution: "1K",
        },
        logs: false,
      }),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error("Reference Edit provider timed out."));
        }, FAL_REFERENCE_EDIT_TIMEOUT_MS);
      }),
    ]);

    const remoteImageUrl = getFalResultImageUrl(result.data);

    if (!remoteImageUrl) {
      await markFailedAndRefund({
        generationId,
        userId,
        creditsUsed,
        errorMessage: ERR_PROVIDER_NO_IMAGE_URL,
      });

      return NextResponse.json(
        { error: "Image generation failed. Credits refunded." },
        { status: 500 }
      );
    }

    const { imageBuffer, contentType } =
      await downloadImageFromUrl(remoteImageUrl);

    const publicUrl = await uploadImageBuffer({
      userId,
      imageBuffer,
      contentType,
    });

    await completeGeneration({
      generationId,
      publicUrl,
    });

    return NextResponse.json({
      success: true,
      generationId,
      image: publicUrl,
      workflow: "reference_edit",
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Reference Edit generation failed.";

    await markFailedAndRefund({
      generationId,
      userId,
      creditsUsed,
      errorMessage,
    });

    return NextResponse.json(
      { error: "Image generation failed. Credits refunded." },
      { status: 500 }
    );
  }
}

async function processBrandAssetsImage(args: {
  generationId: string;
  userId: string;
  finalPrompt: string;
  creditsUsed: number;
  imageSize: unknown;
  outputWidth: unknown;
  outputHeight: unknown;
}) {
  return processFalFluxImage({
    ...args,
    falModel: FAL_BRAND_ASSETS_MODEL,
    numInferenceSteps: 28,
    timeoutMs: FAL_BRAND_ASSETS_TIMEOUT_MS,
    workflow: "brand_assets",
    modeLabel: "Brand Assets",
    serverFlagEnv: "ENABLE_FAL_BRAND_ASSETS",
  });
}

async function processVideoImageToVideo({
  generationId,
  userId,
  finalPrompt,
  creditsUsed,
  sourceImageUrl,
  imageSize,
  outputWidth,
  outputHeight,
}: {
  generationId: string;
  userId: string;
  finalPrompt: string;
  creditsUsed: number;
  sourceImageUrl: string | null;
  imageSize: unknown;
  outputWidth: unknown;
  outputHeight: unknown;
}) {
  if (process.env.ENABLE_FAL_VIDEO_STUDIO !== "true") {
    await markFailedAndRefund({
      generationId,
      userId,
      creditsUsed,
      errorMessage: "Video Studio is not enabled on the server.",
    });

    return NextResponse.json(
      { error: "Video Studio is not enabled. Credits refunded." },
      { status: 400 }
    );
  }

  if (!process.env.FAL_KEY) {
    await markFailedAndRefund({
      generationId,
      userId,
      creditsUsed,
      errorMessage: "FAL_KEY is not configured.",
    });

    return NextResponse.json(
      { error: "Video provider is not configured. Credits refunded." },
      { status: 500 }
    );
  }

  if (!sourceImageUrl) {
    await markFailedAndRefund({
      generationId,
      userId,
      creditsUsed,
      errorMessage: "Video Studio source image is missing.",
    });

    return NextResponse.json(
      { error: "Video Studio source image is missing. Credits refunded." },
      { status: 400 }
    );
  }

  fal.config({
    credentials: process.env.FAL_KEY,
  });

  const aspectRatio = resolveVideoAspectRatio({
    imageSize,
    outputWidth,
    outputHeight,
  });

  try {
    const result = await Promise.race([
      fal.subscribe(FAL_KLING_I2V_MODEL, {
        input: {
          prompt: finalPrompt,
          image_url: sourceImageUrl,
          duration: "5",
          aspect_ratio: aspectRatio,
          negative_prompt: "blur, distort, and low quality",
          cfg_scale: 0.5,
        } as {
          prompt: string;
          image_url: string;
          duration: "5" | "10";
          aspect_ratio?: "16:9" | "9:16" | "1:1";
          negative_prompt?: string;
          cfg_scale?: number;
        },
        logs: false,
      }),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error("Video Studio provider timed out."));
        }, FAL_VIDEO_REQUEST_TIMEOUT_MS);
      }),
    ]);

    const remoteVideoUrl =
      getFalResultVideoUrl(result.data) ??
      getFalResultVideoUrl(result);

    if (!remoteVideoUrl) {
      await markFailedAndRefund({
        generationId,
        userId,
        creditsUsed,
        errorMessage: ERR_PROVIDER_NO_VIDEO_URL,
      });

      return NextResponse.json(
        { error: "Video generation failed. Credits refunded." },
        { status: 500 }
      );
    }

    const { videoBuffer, contentType } =
      await downloadVideoFromUrl(remoteVideoUrl);

    const publicUrl = await uploadVideoBuffer({
      userId,
      videoBuffer,
      contentType,
    });

    await completeVideoGeneration({
      generationId,
      publicUrl,
      durationSeconds: 5,
    });

    return NextResponse.json({
      success: true,
      generationId,
      video: publicUrl,
      workflow: "video_image_to_video",
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Video Studio generation failed.";

    await markFailedAndRefund({
      generationId,
      userId,
      creditsUsed,
      errorMessage,
    });

    return NextResponse.json(
      { error: "Video generation failed. Credits refunded." },
      { status: 500 }
    );
  }
}

async function processLipSyncImage({
  generationId,
  userId,
  finalPrompt,
  creditsUsed,
  sourceImageUrl,
  audioUrl,
}: {
  generationId: string;
  userId: string;
  finalPrompt: string;
  creditsUsed: number;
  sourceImageUrl: string;
  audioUrl: string;
}) {
  if (process.env.ENABLE_FAL_LIP_SYNC !== "true") {
    await markFailedAndRefund({
      generationId,
      userId,
      creditsUsed,
      errorMessage: "Lip Sync Studio is not enabled on the server.",
    });

    return NextResponse.json(
      { error: "Lip Sync Studio is not enabled. Credits refunded." },
      { status: 400 }
    );
  }

  if (!process.env.FAL_KEY) {
    await markFailedAndRefund({
      generationId,
      userId,
      creditsUsed,
      errorMessage: "FAL_KEY is not configured.",
    });

    return NextResponse.json(
      { error: "Lip sync provider is not configured. Credits refunded." },
      { status: 500 }
    );
  }

  fal.config({ credentials: process.env.FAL_KEY });

  try {
    const result = await Promise.race([
      fal.subscribe(FAL_LIP_SYNC_IMAGE_MODEL, {
        input: {
          image_url: sourceImageUrl,
          audio_url: audioUrl,
          prompt: finalPrompt,
        },
        logs: false,
      }),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error("Lip Sync provider timed out."));
        }, FAL_LIP_SYNC_REQUEST_TIMEOUT_MS);
      }),
    ]);

    const remoteVideoUrl =
      getFalResultVideoUrl(result.data) ?? getFalResultVideoUrl(result);

    if (!remoteVideoUrl) {
      await markFailedAndRefund({
        generationId,
        userId,
        creditsUsed,
        errorMessage: ERR_PROVIDER_NO_VIDEO_URL,
      });

      return NextResponse.json(
        { error: "Lip sync generation failed. Credits refunded." },
        { status: 500 }
      );
    }

    const { videoBuffer, contentType } =
      await downloadVideoFromUrl(remoteVideoUrl);

    const publicUrl = await uploadVideoBuffer({
      userId,
      videoBuffer,
      contentType,
    });

    await completeVideoGeneration({
      generationId,
      publicUrl,
    });

    return NextResponse.json({
      success: true,
      generationId,
      video: publicUrl,
      workflow: "lip_sync",
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Lip sync generation failed.";

    await markFailedAndRefund({
      generationId,
      userId,
      creditsUsed,
      errorMessage,
    });

    return NextResponse.json(
      { error: "Lip sync generation failed. Credits refunded." },
      { status: 500 }
    );
  }
}

async function processLipSyncVideo({
  generationId,
  userId,
  creditsUsed,
  sourceVideoUrl,
  audioUrl,
}: {
  generationId: string;
  userId: string;
  creditsUsed: number;
  sourceVideoUrl: string;
  audioUrl: string;
}) {
  if (process.env.ENABLE_FAL_LIP_SYNC !== "true") {
    await markFailedAndRefund({
      generationId,
      userId,
      creditsUsed,
      errorMessage: "Lip Sync Studio is not enabled on the server.",
    });

    return NextResponse.json(
      { error: "Lip Sync Studio is not enabled. Credits refunded." },
      { status: 400 }
    );
  }

  if (!process.env.FAL_KEY) {
    await markFailedAndRefund({
      generationId,
      userId,
      creditsUsed,
      errorMessage: "FAL_KEY is not configured.",
    });

    return NextResponse.json(
      { error: "Lip sync provider is not configured. Credits refunded." },
      { status: 500 }
    );
  }

  fal.config({ credentials: process.env.FAL_KEY });

  try {
    const result = await Promise.race([
      fal.subscribe(FAL_LIP_SYNC_VIDEO_MODEL, {
        input: {
          video_url: sourceVideoUrl,
          audio_url: audioUrl,
          sync_mode: "cut_off",
        },
        logs: false,
      }),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error("Lip Sync provider timed out."));
        }, FAL_LIP_SYNC_REQUEST_TIMEOUT_MS);
      }),
    ]);

    const remoteVideoUrl =
      getFalResultVideoUrl(result.data) ?? getFalResultVideoUrl(result);

    if (!remoteVideoUrl) {
      await markFailedAndRefund({
        generationId,
        userId,
        creditsUsed,
        errorMessage: ERR_PROVIDER_NO_VIDEO_URL,
      });

      return NextResponse.json(
        { error: "Lip sync generation failed. Credits refunded." },
        { status: 500 }
      );
    }

    const { videoBuffer, contentType } =
      await downloadVideoFromUrl(remoteVideoUrl);

    const publicUrl = await uploadVideoBuffer({
      userId,
      videoBuffer,
      contentType,
    });

    await completeVideoGeneration({
      generationId,
      publicUrl,
    });

    return NextResponse.json({
      success: true,
      generationId,
      video: publicUrl,
      workflow: "lip_sync",
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Lip sync generation failed.";

    await markFailedAndRefund({
      generationId,
      userId,
      creditsUsed,
      errorMessage,
    });

    return NextResponse.json(
      { error: "Lip sync generation failed. Credits refunded." },
      { status: 500 }
    );
  }
}

async function resolveOpenAIImageBuffer(result: {
  data?: Array<{ b64_json?: string | null; url?: string | null }>;
}): Promise<{ imageBuffer: Buffer; contentType: string } | null> {
  const first = result.data?.[0];
  if (!first) return null;

  if (typeof first.b64_json === "string" && first.b64_json.length > 0) {
    return {
      imageBuffer: base64ToBuffer(first.b64_json),
      contentType: "image/png",
    };
  }

  if (typeof first.url === "string" && first.url.trim().length > 0) {
    const { imageBuffer, contentType } = await downloadImageFromUrl(first.url);
    return { imageBuffer, contentType };
  }

  return null;
}

async function processOpenAIImage({
  generationId,
  userId,
  finalPrompt,
  creditsUsed,
  imageSize,
  workflow,
}: {
  generationId: string;
  userId: string;
  finalPrompt: string;
  creditsUsed: number;
  imageSize: ImageSize;
  workflow: string;
}) {
  try {
    console.log("OpenAI workflow processing", { generationId, workflow });
    const result = await openai.images.generate({
      model: OPENAI_IMAGE_MODEL,
      prompt: finalPrompt,
      size: imageSize,
      n: 1,
    });

    const resolvedImage = await resolveOpenAIImageBuffer(result);

    if (!resolvedImage) {
      await markFailedAndRefund({
        generationId,
        userId,
        creditsUsed,
        errorMessage: ERR_OPENAI_NO_IMAGE_DATA,
      });

      return NextResponse.json(
        { error: "Image generation failed. Credits refunded." },
        { status: 500 }
      );
    }

    const publicUrl = await uploadImageBuffer({
      userId,
      imageBuffer: resolvedImage.imageBuffer,
      contentType: resolvedImage.contentType,
    });

    await completeGeneration({
      generationId,
      publicUrl,
    });

    console.log("Generation completed", { generationId });
    return NextResponse.json({
      success: true,
      generationId,
      image: publicUrl,
      workflow,
      provider: "openai",
      model: OPENAI_IMAGE_MODEL,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "OpenAI generation failed.";

    console.error("Generation failed", { generationId, error: errorMessage });
    await markFailedAndRefund({
      generationId,
      userId,
      creditsUsed,
      errorMessage,
    });

    return NextResponse.json(
      { error: "Image generation failed. Credits refunded." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  let generationId: string | undefined;
  let workerUserId: string | undefined;
  let workerCreditsUsed = 1;

  try {
    const workerSecret = req.headers.get("x-worker-secret");

    if (workerSecret !== process.env.GENERATION_WORKER_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    generationId = body.generationId;

    if (!generationId || typeof generationId !== "string") {
      return NextResponse.json(
        { error: "generationId is required" },
        { status: 400 }
      );
    }

    const { generation, fetchError } =
      await fetchGenerationForProcessing(generationId);

    if (!generation) {
      console.error("Generation worker could not load row:", {
        generationId,
        fetchError,
      });

      return NextResponse.json(
        { error: "Generation not found" },
        { status: 404 }
      );
    }

    if (generation.status !== "processing") {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: "Generation is not processing",
      });
    }

    workerUserId = generation.user_id;

    const creditsUsed =
      typeof generation.credits_used === "number"
        ? generation.credits_used
        : 1;

    workerCreditsUsed = creditsUsed;

    const workflow = normalizeWorkflow(generation.workflow);
    const provider =
      workflow === "ugc_look"
        ? "openai"
        : normalizeProvider(generation.provider);

    console.log("Processing generation", {
      generationId,
      workflow,
      provider,
    });

    const finalPrompt = (
      generation.final_prompt?.trim() ||
      generation.prompt?.trim() ||
      ""
    ).trim();

    if (!finalPrompt) {
      await markFailedAndRefund({
        generationId,
        userId: generation.user_id,
        creditsUsed,
        errorMessage: "Prompt is missing.",
      });

      return NextResponse.json(
        { error: "Prompt is missing. Credits refunded." },
        { status: 400 }
      );
    }

    if (isOpenAiImageWorkflow(workflow, provider)) {
      const imageSize = normalizeImageSize(generation.image_size);

      return processOpenAIImage({
        generationId,
        userId: generation.user_id,
        finalPrompt,
        creditsUsed,
        imageSize,
        workflow,
      });
    }

    if (workflow === "fast_draft" && provider === "fal") {
      return processFastDraftImage({
        generationId,
        userId: generation.user_id,
        finalPrompt,
        creditsUsed,
        imageSize: generation.image_size,
        outputWidth: generation.output_width,
        outputHeight: generation.output_height,
      });
    }

    if (workflow === "premium_image" && provider === "fal") {
      return processPremiumImage({
        generationId,
        userId: generation.user_id,
        finalPrompt,
        creditsUsed,
        imageSize: generation.image_size,
        outputWidth: generation.output_width,
        outputHeight: generation.output_height,
      });
    }

    if (workflow === "reference_edit" && provider === "fal") {
      const sourceImageUrl =
        typeof generation.reference_image_url === "string" &&
        generation.reference_image_url.trim().length > 0
          ? generation.reference_image_url.trim()
          : null;

      return processReferenceEditImage({
        generationId,
        userId: generation.user_id,
        finalPrompt,
        creditsUsed,
        sourceImageUrl,
      });
    }

    if (workflow === "brand_assets" && provider === "fal") {
      return processBrandAssetsImage({
        generationId,
        userId: generation.user_id,
        finalPrompt,
        creditsUsed,
        imageSize: generation.image_size,
        outputWidth: generation.output_width,
        outputHeight: generation.output_height,
      });
    }

    if (workflow === "video_image_to_video" && provider === "fal") {
      const sourceImageUrl =
        typeof generation.source_image_url === "string" &&
        generation.source_image_url.trim().length > 0
          ? generation.source_image_url.trim()
          : typeof generation.reference_image_url === "string" &&
              generation.reference_image_url.trim().length > 0
            ? generation.reference_image_url.trim()
            : null;

      return processVideoImageToVideo({
        generationId,
        userId: generation.user_id,
        finalPrompt,
        creditsUsed,
        sourceImageUrl,
        imageSize: generation.image_size,
        outputWidth: generation.output_width,
        outputHeight: generation.output_height,
      });
    }

    if (workflow === "lip_sync" && provider === "fal") {
      const audioUrl =
        typeof generation.audio_url === "string" &&
        generation.audio_url.trim().length > 0
          ? generation.audio_url.trim()
          : null;

      const sourceVideoUrl =
        typeof generation.source_video_url === "string" &&
        generation.source_video_url.trim().length > 0
          ? generation.source_video_url.trim()
          : null;

      const sourceImageUrl =
        typeof generation.source_image_url === "string" &&
        generation.source_image_url.trim().length > 0
          ? generation.source_image_url.trim()
          : typeof generation.reference_image_url === "string" &&
              generation.reference_image_url.trim().length > 0
            ? generation.reference_image_url.trim()
            : null;

      if (!audioUrl) {
        await markFailedAndRefund({
          generationId,
          userId: generation.user_id,
          creditsUsed,
          errorMessage: "Lip Sync audio is missing.",
        });

        return NextResponse.json(
          { error: "Lip Sync audio is missing. Credits refunded." },
          { status: 400 }
        );
      }

      if (sourceVideoUrl) {
        return processLipSyncVideo({
          generationId,
          userId: generation.user_id,
          creditsUsed,
          sourceVideoUrl,
          audioUrl,
        });
      }

      if (sourceImageUrl) {
        return processLipSyncImage({
          generationId,
          userId: generation.user_id,
          finalPrompt,
          creditsUsed,
          sourceImageUrl,
          audioUrl,
        });
      }

      await markFailedAndRefund({
        generationId,
        userId: generation.user_id,
        creditsUsed,
        errorMessage: "Lip Sync source media is missing.",
      });

      return NextResponse.json(
        { error: "Lip Sync source media is missing. Credits refunded." },
        { status: 400 }
      );
    }

    await markFailedAndRefund({
      generationId,
      userId: generation.user_id,
      creditsUsed,
      errorMessage: `Unsupported workflow "${workflow}" with provider "${provider}". Credits refunded.`,
    });

    return NextResponse.json(
      {
        error: "This workflow is not supported. Credits refunded.",
        workflow,
        provider,
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Generation worker error:", error);

    if (generationId && workerUserId) {
      const errorMessage =
        error instanceof Error ? error.message : "Generation worker failed.";

      await markFailedAndRefund({
        generationId,
        userId: workerUserId,
        creditsUsed: workerCreditsUsed,
        errorMessage,
      });
    }

    return NextResponse.json(
      { error: "Generation worker failed" },
      { status: 500 }
    );
  }
}
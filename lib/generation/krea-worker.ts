import { NextResponse } from "next/server";
import {
  markGenerationCompleted,
  markGenerationFailed,
  refundUserCredits,
  uploadImageFromRemoteUrl,
  uploadVideoFromRemoteUrl,
} from "@/lib/generation/poc-shared";
import {
  buildGenerationErrorFromCause,
  buildGenerationErrorPayload,
  encodeStoredGenerationError,
  type GenerationErrorPayload,
} from "@/lib/generation/generation-errors";
import { assertKreaConfigured } from "@/lib/providers/flags";
import {
  generateKreaEdit,
  generateKreaEnhance,
  generateKreaImage,
  generateKreaVideo,
} from "@/lib/providers/krea";
import {
  normalizeKreaWorkflowKey,
  resolveKreaModelPathForWorkflow,
  resolveKreaStoredModelForWorkflow,
} from "@/lib/providers/krea-workflows";
import {
  getKreaModelByPath,
  isKreaModelExecutable,
} from "@/lib/ai/krea-model-registry";
import { logKreaWorkerEvent } from "@/lib/krea/worker-log";

type KreaWorkerBaseArgs = {
  generationId: string;
  userId: string;
  finalPrompt: string;
  creditsUsed: number;
  workflow: string;
  /** Parsed from generations.model (`krea/{path}`) when user picked a registry model */
  modelPath?: string;
};

export function kreaModelPathFromStoredModel(
  storedModel?: string | null
): string | undefined {
  if (!storedModel || typeof storedModel !== "string") return undefined;
  const trimmed = storedModel.trim();
  if (!trimmed.startsWith("krea/")) return undefined;
  const path = trimmed.slice("krea/".length).replace(/^\/+/, "");
  return path.length > 0 ? path : undefined;
}

async function refundAndMarkFailed(
  generationId: string,
  userId: string,
  creditsUsed: number,
  payload: GenerationErrorPayload
) {
  await markGenerationFailed({
    generationId,
    errorMessage: encodeStoredGenerationError(payload),
  });
  await refundUserCredits({
    userId,
    creditsToRefund: creditsUsed,
    source: "krea_worker_failure",
  });
}

async function handleKreaWorkerFailure(args: {
  generationId: string;
  userId: string;
  creditsUsed: number;
  cause: unknown;
  workflow: string;
  phase: string;
}): Promise<GenerationErrorPayload> {
  const internalMessage =
    args.cause instanceof Error ? args.cause.message : String(args.cause);
  const payload = buildGenerationErrorFromCause(args.cause, {
    refunded: true,
    requestId: args.generationId,
  });

  console.error("[krea-worker] failure", {
    generationId: args.generationId,
    workflow: args.workflow,
    phase: args.phase,
    code: payload.code,
    internal: internalMessage.slice(0, 300),
  });

  await refundAndMarkFailed(
    args.generationId,
    args.userId,
    args.creditsUsed,
    payload
  );

  return payload;
}

function errorResponse(payload: GenerationErrorPayload, status = 500) {
  return NextResponse.json(payload, { status });
}

function resolveDimensions(
  outputWidth: unknown,
  outputHeight: unknown
): { width: number; height: number } {
  const width =
    typeof outputWidth === "number" && outputWidth > 0 ? outputWidth : 1024;
  const height =
    typeof outputHeight === "number" && outputHeight > 0 ? outputHeight : 1024;
  return { width, height };
}

function assertExecutableModelPath(modelPath?: string): void {
  if (!modelPath?.trim()) return;
  const entry = getKreaModelByPath(modelPath);
  if (entry && !isKreaModelExecutable(entry)) {
    throw new Error(
      `Model "${entry.label}" is not configured for generation.`
    );
  }
  if (modelPath.trim().startsWith("pending/")) {
    throw new Error("Selected model endpoint is not configured yet.");
  }
}

export async function processKreaImageWorkflow(
  args: KreaWorkerBaseArgs & {
    outputWidth: unknown;
    outputHeight: unknown;
  }
) {
  const workflow = normalizeKreaWorkflowKey(args.workflow);

  try {
    assertKreaConfigured();
    assertExecutableModelPath(args.modelPath);
  } catch (error) {
    const payload = await handleKreaWorkerFailure({
      generationId: args.generationId,
      userId: args.userId,
      creditsUsed: args.creditsUsed,
      cause: error,
      workflow,
      phase: "image_config",
    });
    return errorResponse(payload);
  }

  const { width, height } = resolveDimensions(
    args.outputWidth,
    args.outputHeight
  );

  logKreaWorkerEvent({
    generationId: args.generationId,
    userId: args.userId,
    workflow,
    selectedModelId: args.modelPath,
    provider: "krea",
    promptLength: args.finalPrompt.length,
    cost: args.creditsUsed,
    phase: "image_start",
  });

  try {
    const result = await generateKreaImage({
      prompt: args.finalPrompt,
      width,
      height,
      workflow,
      modelPath: args.modelPath,
    });

    if (!result.imageUrl) {
      throw new Error("Provider completed but did not return an image URL.");
    }

    logKreaWorkerEvent({
      generationId: args.generationId,
      userId: args.userId,
      workflow,
      providerJobId: result.providerJobId,
      imageUrl: result.imageUrl ? "[present]" : null,
      phase: "image_provider_done",
    });

    const publicUrl = await uploadImageFromRemoteUrl({
      userId: args.userId,
      remoteUrl: result.imageUrl,
    });

    await markGenerationCompleted({
      generationId: args.generationId,
      imageUrl: publicUrl,
      providerJobId: result.providerJobId,
    });

    return NextResponse.json({
      success: true,
      generationId: args.generationId,
      image: publicUrl,
      workflow,
      provider: "krea",
      model: result.model ?? resolveKreaStoredModelForWorkflow(workflow),
    });
  } catch (error) {
    const payload = await handleKreaWorkerFailure({
      generationId: args.generationId,
      userId: args.userId,
      creditsUsed: args.creditsUsed,
      cause: error,
      workflow,
      phase: "image_run",
    });
    return errorResponse(payload);
  }
}

export async function processKreaReferenceEditWorkflow(
  args: KreaWorkerBaseArgs & {
    sourceImageUrl: string | null;
  }
) {
  const workflow = "reference_edit";

  if (!args.sourceImageUrl) {
    const payload: GenerationErrorPayload = {
      ...buildGenerationErrorPayload("GENERATION_FAILED"),
      reason: "Reason: Source image is required.",
      requestId: args.generationId,
      refunded: true,
    };
    await refundAndMarkFailed(
      args.generationId,
      args.userId,
      args.creditsUsed,
      payload
    );
    return errorResponse(payload, 400);
  }

  try {
    assertKreaConfigured();
    assertExecutableModelPath(args.modelPath);
  } catch (error) {
    const payload = await handleKreaWorkerFailure({
      generationId: args.generationId,
      userId: args.userId,
      creditsUsed: args.creditsUsed,
      cause: error,
      workflow,
      phase: "edit_config",
    });
    return errorResponse(payload);
  }

  try {
    const result = await generateKreaEdit({
      prompt: args.finalPrompt,
      imageUrls: [args.sourceImageUrl],
      workflow,
      modelPath: args.modelPath,
    });

    if (!result.imageUrl) {
      throw new Error("Provider completed but did not return an image URL.");
    }

    const publicUrl = await uploadImageFromRemoteUrl({
      userId: args.userId,
      remoteUrl: result.imageUrl,
    });

    await markGenerationCompleted({
      generationId: args.generationId,
      imageUrl: publicUrl,
      providerJobId: result.providerJobId,
    });

    return NextResponse.json({
      success: true,
      generationId: args.generationId,
      image: publicUrl,
      workflow,
      provider: "krea",
      model: result.model ?? resolveKreaStoredModelForWorkflow(workflow),
    });
  } catch (error) {
    const payload = await handleKreaWorkerFailure({
      generationId: args.generationId,
      userId: args.userId,
      creditsUsed: args.creditsUsed,
      cause: error,
      workflow,
      phase: "edit_run",
    });
    return errorResponse(payload);
  }
}

export async function processKreaEnhanceWorkflow(
  args: KreaWorkerBaseArgs & {
    sourceImageUrl: string | null;
    outputWidth: unknown;
    outputHeight: unknown;
  }
) {
  const workflow = "enhance_asset";

  if (!args.sourceImageUrl) {
    const payload: GenerationErrorPayload = {
      ...buildGenerationErrorPayload("GENERATION_FAILED"),
      reason: "Reason: Source image is required.",
      requestId: args.generationId,
      refunded: true,
    };
    await refundAndMarkFailed(args.generationId, args.userId, args.creditsUsed, payload);
    return errorResponse(payload, 400);
  }

  try {
    assertKreaConfigured();
    assertExecutableModelPath(args.modelPath);
  } catch (error) {
    const payload = await handleKreaWorkerFailure({
      generationId: args.generationId,
      userId: args.userId,
      creditsUsed: args.creditsUsed,
      cause: error,
      workflow,
      phase: "enhance_config",
    });
    return errorResponse(payload);
  }

  const { width, height } = resolveDimensions(
    args.outputWidth,
    args.outputHeight
  );

  try {
    const result = await generateKreaEnhance({
      imageUrl: args.sourceImageUrl,
      width,
      height,
      prompt: args.finalPrompt,
      workflow,
      modelPath: args.modelPath,
    });

    if (!result.imageUrl) {
      throw new Error("Provider completed but did not return an image URL.");
    }

    const publicUrl = await uploadImageFromRemoteUrl({
      userId: args.userId,
      remoteUrl: result.imageUrl,
    });

    await markGenerationCompleted({
      generationId: args.generationId,
      imageUrl: publicUrl,
      providerJobId: result.providerJobId,
    });

    return NextResponse.json({
      success: true,
      generationId: args.generationId,
      image: publicUrl,
      workflow,
      provider: "krea",
      model: result.model ?? resolveKreaStoredModelForWorkflow(workflow),
    });
  } catch (error) {
    const payload = await handleKreaWorkerFailure({
      generationId: args.generationId,
      userId: args.userId,
      creditsUsed: args.creditsUsed,
      cause: error,
      workflow,
      phase: "enhance_run",
    });
    return errorResponse(payload);
  }
}

export async function processKreaVideoWorkflow(
  args: KreaWorkerBaseArgs & {
    sourceImageUrl: string | null;
  }
) {
  const workflow = "video_image_to_video";

  if (!args.sourceImageUrl) {
    const payload: GenerationErrorPayload = {
      ...buildGenerationErrorPayload("GENERATION_FAILED"),
      reason: "Reason: Source image is required.",
      requestId: args.generationId,
      refunded: true,
    };
    await refundAndMarkFailed(args.generationId, args.userId, args.creditsUsed, payload);
    return errorResponse(payload, 400);
  }

  try {
    assertKreaConfigured();
    assertExecutableModelPath(args.modelPath);
  } catch (error) {
    const payload = await handleKreaWorkerFailure({
      generationId: args.generationId,
      userId: args.userId,
      creditsUsed: args.creditsUsed,
      cause: error,
      workflow,
      phase: "video_config",
    });
    return errorResponse(payload);
  }

  logKreaWorkerEvent({
    generationId: args.generationId,
    userId: args.userId,
    workflow,
    selectedModelId: args.modelPath,
    provider: "krea",
    promptLength: args.finalPrompt.length,
    cost: args.creditsUsed,
    phase: "video_start",
  });

  try {
    const result = await generateKreaVideo({
      prompt: args.finalPrompt,
      imageUrl: args.sourceImageUrl,
      workflow,
      duration: 5,
      modelPath: args.modelPath,
    });

    if (!result.videoUrl) {
      throw new Error("Provider completed but did not return a video URL.");
    }

    logKreaWorkerEvent({
      generationId: args.generationId,
      userId: args.userId,
      workflow,
      providerJobId: result.providerJobId,
      videoUrl: result.videoUrl ? "[present]" : null,
      phase: "video_provider_done",
    });

    const publicUrl = await uploadVideoFromRemoteUrl({
      userId: args.userId,
      remoteUrl: result.videoUrl,
    });

    await markGenerationCompleted({
      generationId: args.generationId,
      videoUrl: publicUrl,
      providerJobId: result.providerJobId,
    });

    return NextResponse.json({
      success: true,
      generationId: args.generationId,
      video: publicUrl,
      workflow,
      provider: "krea",
      model: result.model ?? resolveKreaStoredModelForWorkflow(workflow),
    });
  } catch (error) {
    const payload = await handleKreaWorkerFailure({
      generationId: args.generationId,
      userId: args.userId,
      creditsUsed: args.creditsUsed,
      cause: error,
      workflow,
      phase: "video_run",
    });
    return errorResponse(payload);
  }
}

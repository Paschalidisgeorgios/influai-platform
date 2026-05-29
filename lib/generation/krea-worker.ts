import { NextResponse } from "next/server";
import {
  markGenerationCompleted,
  markGenerationFailed,
  refundUserCredits,
  uploadImageFromRemoteUrl,
  uploadVideoFromRemoteUrl,
} from "@/lib/generation/poc-shared";
import { assertKreaConfigured } from "@/lib/providers/flags";
import { KREA_REFUND_ERROR_MESSAGE } from "@/lib/providers/krea-capabilities";
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
import { logKreaWorkerEvent } from "@/lib/krea/worker-log";

const REFUND_ERROR = KREA_REFUND_ERROR_MESSAGE;

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

async function failAndRefund(args: {
  generationId: string;
  userId: string;
  creditsUsed: number;
  errorMessage: string;
}) {
  await markGenerationFailed({
    generationId: args.generationId,
    errorMessage: args.errorMessage.slice(0, 500),
  });
  await refundUserCredits({
    userId: args.userId,
    creditsToRefund: args.creditsUsed,
    source: "krea_worker_failure",
  });
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

export async function processKreaImageWorkflow(
  args: KreaWorkerBaseArgs & {
    outputWidth: unknown;
    outputHeight: unknown;
  }
) {
  const workflow = normalizeKreaWorkflowKey(args.workflow);

  try {
    assertKreaConfigured();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Krea is not configured.";
    await failAndRefund({
      generationId: args.generationId,
      userId: args.userId,
      creditsUsed: args.creditsUsed,
      errorMessage: message,
    });
    return NextResponse.json(
      { error: `${message} Credits refunded.` },
      { status: 500 }
    );
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
      throw new Error("Krea did not return an image URL.");
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
    const message =
      error instanceof Error ? error.message : "Krea image generation failed.";
    console.error("Krea image worker error:", message);
    await failAndRefund({
      generationId: args.generationId,
      userId: args.userId,
      creditsUsed: args.creditsUsed,
      errorMessage: REFUND_ERROR,
    });
    return NextResponse.json(
      { error: REFUND_ERROR, refunded: true },
      { status: 500 }
    );
  }
}

export async function processKreaReferenceEditWorkflow(
  args: KreaWorkerBaseArgs & {
    sourceImageUrl: string | null;
  }
) {
  const workflow = "reference_edit";

  if (!args.sourceImageUrl) {
    await failAndRefund({
      generationId: args.generationId,
      userId: args.userId,
      creditsUsed: args.creditsUsed,
      errorMessage: "Reference Edit source image is missing.",
    });
    return NextResponse.json(
      { error: "Reference Edit source image is missing. Credits refunded." },
      { status: 400 }
    );
  }

  try {
    assertKreaConfigured();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Krea is not configured.";
    await failAndRefund({
      generationId: args.generationId,
      userId: args.userId,
      creditsUsed: args.creditsUsed,
      errorMessage: message,
    });
    return NextResponse.json(
      { error: `${message} Credits refunded.` },
      { status: 500 }
    );
  }

  try {
    const result = await generateKreaEdit({
      prompt: args.finalPrompt,
      imageUrls: [args.sourceImageUrl],
      workflow,
      modelPath: args.modelPath,
    });

    if (!result.imageUrl) {
      throw new Error("Krea did not return an image URL.");
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
    const message =
      error instanceof Error ? error.message : "Krea reference edit failed.";
    console.error("Krea reference edit worker error:", message);
    await failAndRefund({
      generationId: args.generationId,
      userId: args.userId,
      creditsUsed: args.creditsUsed,
      errorMessage: REFUND_ERROR,
    });
    return NextResponse.json(
      { error: REFUND_ERROR, refunded: true },
      { status: 500 }
    );
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
    await failAndRefund({
      generationId: args.generationId,
      userId: args.userId,
      creditsUsed: args.creditsUsed,
      errorMessage: "Enhance source image is missing.",
    });
    return NextResponse.json(
      { error: "Enhance source image is missing. Credits refunded." },
      { status: 400 }
    );
  }

  try {
    assertKreaConfigured();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Krea is not configured.";
    await failAndRefund({
      generationId: args.generationId,
      userId: args.userId,
      creditsUsed: args.creditsUsed,
      errorMessage: message,
    });
    return NextResponse.json(
      { error: `${message} Credits refunded.` },
      { status: 500 }
    );
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
      throw new Error("Krea did not return an image URL.");
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
    const message =
      error instanceof Error ? error.message : "Krea enhance failed.";
    console.error("Krea enhance worker error:", message);
    await failAndRefund({
      generationId: args.generationId,
      userId: args.userId,
      creditsUsed: args.creditsUsed,
      errorMessage: REFUND_ERROR,
    });
    return NextResponse.json(
      { error: REFUND_ERROR, refunded: true },
      { status: 500 }
    );
  }
}

export async function processKreaVideoWorkflow(
  args: KreaWorkerBaseArgs & {
    sourceImageUrl: string | null;
  }
) {
  const workflow = "video_image_to_video";

  if (!args.sourceImageUrl) {
    await failAndRefund({
      generationId: args.generationId,
      userId: args.userId,
      creditsUsed: args.creditsUsed,
      errorMessage: "Video Studio source image is missing.",
    });
    return NextResponse.json(
      { error: "Video Studio source image is missing. Credits refunded." },
      { status: 400 }
    );
  }

  try {
    assertKreaConfigured();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Krea is not configured.";
    await failAndRefund({
      generationId: args.generationId,
      userId: args.userId,
      creditsUsed: args.creditsUsed,
      errorMessage: message,
    });
    return NextResponse.json(
      { error: `${message} Credits refunded.` },
      { status: 500 }
    );
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
      throw new Error("Krea did not return a video URL.");
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
    const message =
      error instanceof Error ? error.message : "Krea video generation failed.";
    console.error("Krea video worker error:", message);
    await failAndRefund({
      generationId: args.generationId,
      userId: args.userId,
      creditsUsed: args.creditsUsed,
      errorMessage: REFUND_ERROR,
    });
    return NextResponse.json(
      { error: REFUND_ERROR, refunded: true },
      { status: 500 }
    );
  }
}

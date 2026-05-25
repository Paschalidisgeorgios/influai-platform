import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fal } from "@fal-ai/client";
import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const STORAGE_BUCKET = "generations";
const FAL_FLUX_SCHNELL_MODEL = "fal-ai/flux/schnell";
const FAL_REQUEST_TIMEOUT_MS = 120_000;

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

async function refundCredits(userId: string, creditsToRefund: number) {
  if (creditsToRefund <= 0) return;

  const { error } = await supabaseAdmin.rpc("refund_user_credits", {
    target_user_id: userId,
    credits_to_refund: creditsToRefund,
  });

  if (error) {
    console.error("Worker credit refund error:", error);
  }

  const { error: transactionError } = await supabaseAdmin
    .from("credit_transactions")
    .insert({
      user_id: userId,
      amount: creditsToRefund,
      type: "refund",
      source: "generation_worker_failure",
    });

  if (transactionError) {
    console.error("Worker refund transaction log error:", transactionError);
  }
}

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
}) {
  await refundCredits(userId, creditsUsed);

  const { error } = await supabaseAdmin
    .from("generations")
    .update({
      status: "failed",
      error_message: errorMessage,
      credits_used: 0,
      failed_at: new Date().toISOString(),
    })
    .eq("id", generationId);

  if (error) {
    console.error("Worker failed generation update error:", error);
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
  const { error: updateError } = await supabaseAdmin
    .from("generations")
    .update({
      image_url: publicUrl,
      status: "completed",
      error_message: null,
      completed_at: new Date().toISOString(),
    })
    .eq("id", generationId);

  if (updateError) {
    throw new Error(updateError.message);
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

async function downloadImageFromUrl(imageUrl: string) {
  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(`Failed to download generated image (${response.status}).`);
  }

  const contentType = response.headers.get("content-type") || "image/png";
  const imageBuffer = Buffer.from(await response.arrayBuffer());

  return { imageBuffer, contentType };
}

async function processFastDraftImage({
  generationId,
  userId,
  finalPrompt,
  creditsUsed,
  imageSize,
  outputWidth,
  outputHeight,
}: {
  generationId: string;
  userId: string;
  finalPrompt: string;
  creditsUsed: number;
  imageSize: unknown;
  outputWidth: unknown;
  outputHeight: unknown;
}) {
  if (process.env.ENABLE_FAL_FAST_DRAFT !== "true") {
    await markFailedAndRefund({
      generationId,
      userId,
      creditsUsed,
      errorMessage: "Fast Draft is not enabled on the server.",
    });

    return NextResponse.json(
      { error: "Fast Draft is not enabled. Credits refunded." },
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
      { error: "Fast Draft provider is not configured. Credits refunded." },
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
      fal.subscribe(FAL_FLUX_SCHNELL_MODEL, {
        input: {
          prompt: finalPrompt,
          image_size: falImageSize,
          num_images: 1,
          num_inference_steps: 4,
          output_format: "png",
        },
        logs: false,
      }),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error("Fast Draft provider timed out."));
        }, FAL_REQUEST_TIMEOUT_MS);
      }),
    ]);

    const remoteImageUrl = getFalResultImageUrl(result.data);

    if (!remoteImageUrl) {
      await markFailedAndRefund({
        generationId,
        userId,
        creditsUsed,
        errorMessage: "Fast Draft did not return image data.",
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
      workflow: "fast_draft",
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Fast Draft generation failed.";

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

async function processOpenAIImage({
  generationId,
  userId,
  finalPrompt,
  model,
  creditsUsed,
  imageSize,
}: {
  generationId: string;
  userId: string;
  finalPrompt: string;
  model: string;
  creditsUsed: number;
  imageSize: ImageSize;
}) {
  try {
    const result = await openai.images.generate({
      model,
      prompt: finalPrompt,
      size: imageSize,
      n: 1,
    });

    const imageBase64 = result.data?.[0]?.b64_json;

    if (!imageBase64) {
      await markFailedAndRefund({
        generationId,
        userId,
        creditsUsed,
        errorMessage: "OpenAI did not return image data.",
      });

      return NextResponse.json(
        { error: "Image generation failed. Credits refunded." },
        { status: 500 }
      );
    }

    const imageBuffer = base64ToBuffer(imageBase64);

    const publicUrl = await uploadImageBuffer({
      userId,
      imageBuffer,
      contentType: "image/png",
    });

    await completeGeneration({
      generationId,
      publicUrl,
    });

    return NextResponse.json({
      success: true,
      generationId,
      image: publicUrl,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "OpenAI generation failed.";

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
  try {
    const workerSecret = req.headers.get("x-worker-secret");

    if (workerSecret !== process.env.GENERATION_WORKER_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const generationId = body.generationId;

    if (!generationId || typeof generationId !== "string") {
      return NextResponse.json(
        { error: "generationId is required" },
        { status: 400 }
      );
    }

    const { data: generation, error: fetchError } = await supabaseAdmin
      .from("generations")
      .select(
        `
        id,
        user_id,
        prompt,
        final_prompt,
        status,
        provider,
        model,
        workflow,
        credits_used,
        image_size,
        output_width,
        output_height
      `
      )
      .eq("id", generationId)
      .single();

    if (fetchError || !generation) {
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

    const creditsUsed =
      typeof generation.credits_used === "number"
        ? generation.credits_used
        : 1;

    const workflow = generation.workflow || "standard";
    const provider = generation.provider || "openai";

    const finalPrompt = generation.final_prompt || generation.prompt;

    if (workflow === "standard" && provider === "openai") {
      const imageSize = normalizeImageSize(generation.image_size);

      return processOpenAIImage({
        generationId,
        userId: generation.user_id,
        finalPrompt,
        model: generation.model || "gpt-image-1",
        creditsUsed,
        imageSize,
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

    await markFailedAndRefund({
      generationId,
      userId: generation.user_id,
      creditsUsed,
      errorMessage:
        "This workflow is not supported. Credits refunded.",
    });

    return NextResponse.json(
      {
        error: "This workflow is not supported. Credits refunded.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Generation worker error:", error);

    return NextResponse.json(
      { error: "Generation worker failed" },
      { status: 500 }
    );
  }
}
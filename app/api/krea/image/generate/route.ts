import { NextResponse } from "next/server";
import { authenticateBearerUser } from "@/app/lib/supabase-admin";
import {
  markGenerationCompleted,
  markGenerationFailed,
  refundUserCredits,
  uploadImageFromRemoteUrl,
} from "@/lib/generation/poc-shared";
import {
  assertKreaConfigured,
  createKreaImageJob,
  isKreaProviderEnabled,
  kreaDimensionsFromAspectRatio,
  resolveKreaModelId,
  waitForKreaImageJob,
} from "@/lib/providers";

export const runtime = "nodejs";
export const maxDuration = 300;

const WORKFLOW = "krea_premium_image";
const PROVIDER = "krea";
const CREDITS_USED = 3;
const ACTIVE_GENERATION_LIMIT = 2;
const KREA_FAILED_REFUNDED_MESSAGE =
  "Krea generation failed. Your credits were refunded.";

export async function POST(req: Request) {
  let generationId: string | null = null;
  let userId: string | null = null;

  try {
    if (!isKreaProviderEnabled()) {
      return NextResponse.json(
        {
          success: false,
          error: "Krea provider is disabled",
        },
        { status: 403 }
      );
    }

    try {
      assertKreaConfigured();
    } catch (configError) {
      return NextResponse.json(
        {
          success: false,
          error:
            configError instanceof Error
              ? configError.message
              : "Krea is not configured.",
        },
        { status: 500 }
      );
    }

    const { supabase, user, error: authError } = await authenticateBearerUser(req);

    if (!user) {
      return NextResponse.json(
        { success: false, error: authError || "Unauthorized" },
        { status: 401 }
      );
    }

    userId = user.id;

    const body = await req.json();
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    const aspectRatio =
      typeof body.aspectRatio === "string" ? body.aspectRatio.trim() : undefined;
    const fromAspect = aspectRatio
      ? kreaDimensionsFromAspectRatio(aspectRatio)
      : kreaDimensionsFromAspectRatio();
    const width =
      typeof body.width === "number" && body.width > 0
        ? body.width
        : fromAspect.width;
    const height =
      typeof body.height === "number" && body.height > 0
        ? body.height
        : fromAspect.height;
    const model = resolveKreaModelId();

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "prompt is required." },
        { status: 400 }
      );
    }

    const { count: activeCount, error: activeError } = await supabase
      .from("generations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "processing");

    if (activeError) {
      return NextResponse.json(
        { success: false, error: "Could not verify active generations." },
        { status: 500 }
      );
    }

    if ((activeCount ?? 0) >= ACTIVE_GENERATION_LIMIT) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many active generations",
          reason: "active_generation_limit",
        },
        { status: 429 }
      );
    }

    const { data: creditSuccess, error: creditError } = await supabase.rpc(
      "consume_user_credits",
      {
        target_user_id: user.id,
        credits_to_consume: CREDITS_USED,
      }
    );

    if (creditError) {
      return NextResponse.json(
        { success: false, error: "Credit check failed." },
        { status: 500 }
      );
    }

    if (!creditSuccess) {
      return NextResponse.json(
        {
          success: false,
          error: "Not enough credits",
          requiredCredits: CREDITS_USED,
          reason: "insufficient_credits",
        },
        { status: 402 }
      );
    }

    const { data: generation, error: insertError } = await supabase
      .from("generations")
      .insert({
        user_id: user.id,
        prompt,
        final_prompt: prompt,
        image_url: null,
        status: "processing",
        provider: PROVIDER,
        model,
        workflow: WORKFLOW,
        credits_used: CREDITS_USED,
        output_width: width,
        output_height: height,
        error_message: null,
        started_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (insertError || !generation) {
      await refundUserCredits({
        userId: user.id,
        creditsToRefund: CREDITS_USED,
        source: "krea_poc_create_failure",
      });

      return NextResponse.json(
        {
          success: false,
          error: "Failed to create generation row. Credits refunded.",
        },
        { status: 500 }
      );
    }

    generationId = generation.id;

    await supabase.from("credit_transactions").insert({
      user_id: user.id,
      amount: -CREDITS_USED,
      type: "usage",
      source: "krea_premium_image_generation_job",
    });

    const job = await createKreaImageJob({
      prompt,
      width,
      height,
      aspectRatio,
    });
    const result = await waitForKreaImageJob(job.providerJobId!);

    if (!result.imageUrl) {
      throw new Error("Krea did not return an image URL.");
    }

    const publicUrl = await uploadImageFromRemoteUrl({
      userId: user.id,
      remoteUrl: result.imageUrl,
    });

    const resolvedModel = result.model ?? model;

    await markGenerationCompleted({
      generationId: generation.id,
      imageUrl: publicUrl,
      providerJobId: result.providerJobId,
    });

    await supabase
      .from("generations")
      .update({ model: resolvedModel })
      .eq("id", generation.id);

    return NextResponse.json({
      success: true,
      generationId: generation.id,
      workflow: WORKFLOW,
      provider: PROVIDER,
      model: resolvedModel,
      creditsUsed: CREDITS_USED,
      imageUrl: publicUrl,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Krea image generation failed.";

    console.error("Krea POC route error:", message);

    if (userId) {
      await refundUserCredits({
        userId,
        creditsToRefund: CREDITS_USED,
        source: "krea_premium_image_failure",
      });
    }

    if (userId && generationId) {
      await markGenerationFailed({
        generationId,
        errorMessage: KREA_FAILED_REFUNDED_MESSAGE,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: userId ? KREA_FAILED_REFUNDED_MESSAGE : message,
        refunded: Boolean(userId),
      },
      { status: 500 }
    );
  }
}

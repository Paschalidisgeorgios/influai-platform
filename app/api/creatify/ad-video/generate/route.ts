import { NextResponse } from "next/server";
import { authenticateBearerUser } from "@/app/lib/supabase-admin";
import { refundUserCredits } from "@/lib/generation/poc-shared";
import {
  assertCreatifyConfigured,
  createCreatifyAdVideoJob,
  isCreatifyProviderEnabled,
} from "@/lib/providers";

export const runtime = "nodejs";

const WORKFLOW = "creatify_ad_video";
const PROVIDER = "creatify";
const CREDITS_USED = 40;
const ACTIVE_GENERATION_LIMIT = 2;

export async function POST(req: Request) {
  try {
    if (!isCreatifyProviderEnabled()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Coming soon.",
          comingSoon: true,
        },
        { status: 400 }
      );
    }

    try {
      assertCreatifyConfigured();
    } catch (configError) {
      return NextResponse.json(
        {
          success: false,
          error:
            configError instanceof Error
              ? configError.message
              : "Creatify is not configured.",
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

    const body = await req.json();
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    const aspectRatio =
      typeof body.aspectRatio === "string" ? body.aspectRatio.trim() : "9:16";

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
        video_url: null,
        status: "processing",
        provider: PROVIDER,
        model: process.env.CREATIFY_AD_VIDEO_MODEL || "creatify/asset_generator",
        workflow: WORKFLOW,
        credits_used: CREDITS_USED,
        error_message: null,
        started_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (insertError || !generation) {
      await refundUserCredits({
        userId: user.id,
        creditsToRefund: CREDITS_USED,
        source: "creatify_poc_create_failure",
      });

      return NextResponse.json(
        {
          success: false,
          error: "Failed to create generation row. Credits refunded.",
        },
        { status: 500 }
      );
    }

    await supabase.from("credit_transactions").insert({
      user_id: user.id,
      amount: -CREDITS_USED,
      type: "usage",
      source: "creatify_ad_video_generation_job",
    });

    let providerJob;

    try {
      providerJob = await createCreatifyAdVideoJob({ prompt, aspectRatio });
    } catch (providerError) {
      await supabase
        .from("generations")
        .update({
          status: "failed",
          error_message:
            providerError instanceof Error
              ? providerError.message.slice(0, 500)
              : "Creatify job failed.",
          credits_used: 0,
        })
        .eq("id", generation.id);

      await refundUserCredits({
        userId: user.id,
        creditsToRefund: CREDITS_USED,
        source: "creatify_poc_provider_failure",
      });

      return NextResponse.json(
        {
          success: false,
          error:
            providerError instanceof Error
              ? providerError.message
              : "Creatify job failed. Credits refunded.",
        },
        { status: 500 }
      );
    }

    await supabase
      .from("generations")
      .update({ provider_job_id: providerJob.providerJobId })
      .eq("id", generation.id);

    return NextResponse.json({
      success: true,
      queued: true,
      generationId: generation.id,
      workflow: WORKFLOW,
      provider: PROVIDER,
      providerJobId: providerJob.providerJobId,
      creditsUsed: CREDITS_USED,
      pollHint:
        "Call GET /api/creatify/ad-video/status?generationId=<id> to poll and finalize the video.",
    });
  } catch (error) {
    console.error("Creatify POC generate error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to queue Creatify ad video.",
      },
      { status: 500 }
    );
  }
}

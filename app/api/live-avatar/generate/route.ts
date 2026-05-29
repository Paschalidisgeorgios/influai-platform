import { NextResponse } from "next/server";
import { authenticateBearerUser } from "@/app/lib/supabase-admin";
import { refundUserCredits, uploadVideoFromRemoteUrl } from "@/lib/generation/poc-shared";
import {
  LIVE_AVATAR_CREDITS,
  LIVE_AVATAR_WORKFLOW,
  assertLiveAvatarProviderConfigured,
  generateLiveAvatarVideo,
  isLiveAvatarEnabled,
  resolveLiveAvatarProvider,
} from "@/lib/providers/live-avatar";

export const runtime = "nodejs";
export const maxDuration = 300;

const ACTIVE_GENERATION_LIMIT = 2;
const REFUND_SOURCE = "live_avatar_failure";

function isMissingColumnError(error: { message?: string; code?: string } | null) {
  if (!error?.message) return false;
  return (
    error.code === "PGRST204" ||
    /column.*does not exist|Could not find the .* column/i.test(error.message)
  );
}

export async function POST(req: Request) {
  try {
    if (!isLiveAvatarEnabled()) {
      return NextResponse.json(
        { success: false, error: "Live Avatar Studio is currently disabled.", comingSoon: true },
        { status: 400 }
      );
    }

    const { supabase, user, error: authError } = await authenticateBearerUser(req);

    if (!user) {
      return NextResponse.json(
        { success: false, error: authError || "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));

    const sourceImageUrl =
      typeof body.sourceImageUrl === "string" ? body.sourceImageUrl.trim() : "";
    const sourceVideoUrl =
      typeof body.sourceVideoUrl === "string" ? body.sourceVideoUrl.trim() : "";
    const consentAccepted = body.consentAccepted === true;

    if (!sourceImageUrl) {
      return NextResponse.json(
        { success: false, error: "A creator portrait image is required." },
        { status: 400 }
      );
    }

    if (!sourceVideoUrl) {
      return NextResponse.json(
        { success: false, error: "A driving motion video is required." },
        { status: 400 }
      );
    }

    if (sourceImageUrl.startsWith("blob:") || sourceVideoUrl.startsWith("blob:")) {
      return NextResponse.json(
        { success: false, error: "Please wait until the uploads are complete." },
        { status: 400 }
      );
    }

    if (!consentAccepted) {
      return NextResponse.json(
        { success: false, error: "Consent is required to generate a live avatar." },
        { status: 400 }
      );
    }

    try {
      assertLiveAvatarProviderConfigured();
    } catch (configError) {
      return NextResponse.json(
        {
          success: false,
          error:
            configError instanceof Error
              ? configError.message
              : "Live Avatar provider is not configured.",
        },
        { status: 500 }
      );
    }

    const provider = resolveLiveAvatarProvider();

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
          limit: ACTIVE_GENERATION_LIMIT,
        },
        { status: 429 }
      );
    }

    const { data: creditSuccess, error: creditError } = await supabase.rpc(
      "consume_user_credits",
      {
        target_user_id: user.id,
        credits_to_consume: LIVE_AVATAR_CREDITS,
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
          requiredCredits: LIVE_AVATAR_CREDITS,
          reason: "insufficient_credits",
        },
        { status: 402 }
      );
    }

    const tentativeModel =
      provider === "krea"
        ? `krea/${process.env.KREA_MOTION_TRANSFER_MODEL_PATH?.trim() ?? "motion-transfer"}`
        : process.env.FAL_MOTION_TRANSFER_MODEL?.trim() || "fal-ai/live-portrait";

    const insertBase = {
      user_id: user.id,
      prompt: "Live Avatar",
      final_prompt:
        "Animate the provided creator portrait using motion, expression and head movement from the driving video.",
      image_url: null,
      video_url: null,
      status: "processing",
      provider,
      model: tentativeModel,
      workflow: LIVE_AVATAR_WORKFLOW,
      credits_used: LIVE_AVATAR_CREDITS,
      error_message: null,
      started_at: new Date().toISOString(),
    };

    const insertExtended = {
      ...insertBase,
      reference_image_url: sourceImageUrl,
      source_image_url: sourceImageUrl,
      source_video_url: sourceVideoUrl,
      compliance_status: "consent_confirmed",
    };

    let generation: { id: string } | null = null;
    let insertError: { message?: string; code?: string } | null = null;

    const extendedAttempt = await supabase
      .from("generations")
      .insert(insertExtended)
      .select("id")
      .single();

    if (extendedAttempt.error && isMissingColumnError(extendedAttempt.error)) {
      const fallback = await supabase
        .from("generations")
        .insert(insertBase)
        .select("id")
        .single();
      generation = fallback.data;
      insertError = fallback.error;
    } else {
      generation = extendedAttempt.data;
      insertError = extendedAttempt.error;
    }

    if (insertError || !generation) {
      console.error("Live Avatar insert error:", insertError);
      await refundUserCredits({
        userId: user.id,
        creditsToRefund: LIVE_AVATAR_CREDITS,
        source: REFUND_SOURCE,
      });
      return NextResponse.json(
        { success: false, error: "Failed to queue Live Avatar generation. Credits refunded." },
        { status: 500 }
      );
    }

    await supabase.from("credit_transactions").insert({
      user_id: user.id,
      amount: -LIVE_AVATAR_CREDITS,
      type: "usage",
      source: "live_avatar_generation_job",
    });

    let result;

    try {
      result = await generateLiveAvatarVideo({ sourceImageUrl, sourceVideoUrl });
    } catch (providerError) {
      const message =
        providerError instanceof Error
          ? providerError.message
          : "Live Avatar generation failed.";

      await supabase
        .from("generations")
        .update({
          status: "failed",
          error_message: message.slice(0, 500),
          credits_used: 0,
          failed_at: new Date().toISOString(),
        })
        .eq("id", generation.id);

      await refundUserCredits({
        userId: user.id,
        creditsToRefund: LIVE_AVATAR_CREDITS,
        source: REFUND_SOURCE,
      });

      return NextResponse.json(
        { success: false, error: `${message} Credits refunded.` },
        { status: 500 }
      );
    }

    let storedVideoUrl: string;

    try {
      storedVideoUrl = await uploadVideoFromRemoteUrl({
        userId: user.id,
        remoteUrl: result.videoUrl,
      });
    } catch (storageError) {
      console.error("Live Avatar storage error:", storageError);
      // Fall back to the provider URL so the user still receives a result.
      storedVideoUrl = result.videoUrl;
    }

    const completionPayload: Record<string, unknown> = {
      status: "completed",
      video_url: storedVideoUrl,
      model: result.model,
      error_message: null,
      completed_at: new Date().toISOString(),
    };

    if (result.providerJobId) {
      completionPayload.provider_job_id = result.providerJobId;
    }

    const completeAttempt = await supabase
      .from("generations")
      .update(completionPayload)
      .eq("id", generation.id);

    if (completeAttempt.error && isMissingColumnError(completeAttempt.error)) {
      await supabase
        .from("generations")
        .update({
          status: "completed",
          video_url: storedVideoUrl,
          model: result.model,
          error_message: null,
          completed_at: new Date().toISOString(),
        })
        .eq("id", generation.id);
    } else if (completeAttempt.error) {
      console.error("Live Avatar completion update error:", completeAttempt.error);
      await refundUserCredits({
        userId: user.id,
        creditsToRefund: LIVE_AVATAR_CREDITS,
        source: REFUND_SOURCE,
      });
      return NextResponse.json(
        { success: false, error: "Failed to save Live Avatar result. Credits refunded." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      generationId: generation.id,
      videoUrl: storedVideoUrl,
      provider: result.provider,
      model: result.model,
      workflow: LIVE_AVATAR_WORKFLOW,
      creditsUsed: LIVE_AVATAR_CREDITS,
    });
  } catch (error) {
    console.error("Live Avatar generate route error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate Live Avatar." },
      { status: 500 }
    );
  }
}

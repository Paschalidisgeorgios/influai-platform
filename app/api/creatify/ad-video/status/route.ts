import { NextResponse } from "next/server";
import { authenticateBearerUser } from "@/app/lib/supabase-admin";
import {
  markGenerationCompleted,
  markGenerationFailed,
  refundUserCredits,
} from "@/lib/generation/poc-shared";
import {
  assertCreatifyConfigured,
  isCreatifyProviderEnabled,
  pollCreatifyJob,
} from "@/lib/providers";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    if (!isCreatifyProviderEnabled()) {
      return NextResponse.json(
        { success: false, error: "Creatify provider is not enabled." },
        { status: 400 }
      );
    }

    assertCreatifyConfigured();

    const { supabase, user, error: authError } = await authenticateBearerUser(req);

    if (!user) {
      return NextResponse.json(
        { success: false, error: authError || "Unauthorized" },
        { status: 401 }
      );
    }

    const generationId = new URL(req.url).searchParams.get("generationId");

    if (!generationId) {
      return NextResponse.json(
        { success: false, error: "generationId query param is required." },
        { status: 400 }
      );
    }

    const { data: generation, error: fetchError } = await supabase
      .from("generations")
      .select(
        "id, user_id, status, workflow, provider, provider_job_id, credits_used, video_url"
      )
      .eq("id", generationId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchError || !generation) {
      return NextResponse.json(
        { success: false, error: "Generation not found." },
        { status: 404 }
      );
    }

    if (generation.status === "completed" && generation.video_url) {
      return NextResponse.json({
        success: true,
        status: "completed",
        generationId,
        videoUrl: generation.video_url,
      });
    }

    if (generation.status !== "processing") {
      return NextResponse.json({
        success: true,
        status: generation.status,
        generationId,
      });
    }

    const providerJobId =
      typeof generation.provider_job_id === "string"
        ? generation.provider_job_id.trim()
        : "";

    if (!providerJobId) {
      return NextResponse.json(
        { success: false, error: "Missing provider_job_id on generation." },
        { status: 400 }
      );
    }

    const poll = await pollCreatifyJob(providerJobId);

    if (poll.status === "queued" || poll.status === "processing") {
      return NextResponse.json({
        success: true,
        status: poll.status,
        generationId,
        providerJobId,
      });
    }

    if (poll.status === "failed" || poll.status === "cancelled") {
      const errorMessage = poll.errorMessage || "Creatify video job failed.";

      await markGenerationFailed({ generationId, errorMessage });

      const creditsUsed =
        typeof generation.credits_used === "number" ? generation.credits_used : 0;

      if (creditsUsed > 0) {
        await refundUserCredits({
          userId: user.id,
          creditsToRefund: creditsUsed,
          source: "creatify_poc_poll_failure",
        });
      }

      return NextResponse.json(
        {
          success: false,
          status: "failed",
          error: `${errorMessage} Credits refunded.`,
        },
        { status: 500 }
      );
    }

    if (!poll.videoUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "Creatify completed but no video URL was returned.",
        },
        { status: 500 }
      );
    }

    await markGenerationCompleted({
      generationId,
      videoUrl: poll.videoUrl,
      providerJobId,
    });

    return NextResponse.json({
      success: true,
      status: "completed",
      generationId,
      videoUrl: poll.videoUrl,
    });
  } catch (error) {
    console.error("Creatify POC status error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to poll Creatify job.",
      },
      { status: 500 }
    );
  }
}

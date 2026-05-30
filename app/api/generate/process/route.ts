/**
 * Krea-only generation worker.
 * LEGACY: fal.ai / OpenAI / ElevenLabs processing removed — use /api/krea/image/generate for sync POC.
 */
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  buildGenerationErrorPayload,
  encodeStoredGenerationError,
} from "@/lib/generation/generation-errors";
import {
  kreaModelPathFromStoredModel,
  processKreaEnhanceWorkflow,
  processKreaImageWorkflow,
  processKreaReferenceEditWorkflow,
  processKreaVideoWorkflow,
} from "@/lib/generation/krea-worker";
import { normalizeKreaWorkflowKey } from "@/lib/providers/krea-workflows";
import { isKreaPlatformWorkflowEnabled } from "@/lib/platform/krea-only-platform";

export const runtime = "nodejs";
export const maxDuration = 300;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const REFUND_TRANSACTION_SOURCE = "generation_worker_refund";

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
  output_width: unknown;
  output_height: unknown;
  reference_image_url: string | null;
  source_image_url: string | null;
};

function normalizeWorkflow(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return "standard";
  return value.trim().toLowerCase();
}

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
    output_width: data.output_width ?? null,
    output_height: data.output_height ?? null,
    reference_image_url:
      typeof data.reference_image_url === "string"
        ? data.reference_image_url
        : null,
    source_image_url:
      typeof data.source_image_url === "string" ? data.source_image_url : null,
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

  await supabaseAdmin.from("credit_transactions").insert({
    user_id: userId,
    amount: creditsToRefund,
    type: "refund",
    source: REFUND_TRANSACTION_SOURCE,
  });
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
  const { data: current } = await supabaseAdmin
    .from("generations")
    .select("id, status, credits_used, user_id")
    .eq("id", generationId)
    .maybeSingle();

  if (!current || current.status !== "processing") return;

  const refundTargetUserId =
    typeof current.user_id === "string" ? current.user_id : userId;
  const storedCredits =
    typeof current.credits_used === "number" ? current.credits_used : creditsUsed;
  const refundAmount = storedCredits > 0 ? storedCredits : 0;

  await supabaseAdmin
    .from("generations")
    .update({
      status: "failed",
      error_message: errorMessage.trim() || "Generation failed.",
      credits_used: 0,
      failed_at: new Date().toISOString(),
    })
    .eq("id", generationId)
    .eq("status", "processing");

  if (refundAmount > 0) {
    await refundCredits(refundTargetUserId, refundAmount);
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
      return NextResponse.json(
        { error: fetchError || "Generation not found" },
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
      typeof generation.credits_used === "number" ? generation.credits_used : 1;

    workerCreditsUsed = creditsUsed;

    const workflow = normalizeKreaWorkflowKey(
      normalizeWorkflow(generation.workflow)
    );

    if (!isKreaPlatformWorkflowEnabled(workflow)) {
      const payload = buildGenerationErrorPayload("GENERATION_FAILED", {
        refunded: true,
      });
      await markFailedAndRefund({
        generationId,
        userId: generation.user_id,
        creditsUsed,
        errorMessage: encodeStoredGenerationError(payload),
      });
      return NextResponse.json(payload, { status: 410 });
    }

    const finalPrompt = (
      generation.final_prompt?.trim() ||
      generation.prompt?.trim() ||
      ""
    ).trim();

    if (!finalPrompt && workflow !== "enhance_asset") {
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

    const kreaModelPath = kreaModelPathFromStoredModel(generation.model);

    if (workflow === "enhance_asset") {
      const sourceImageUrl =
        generation.source_image_url?.trim() ||
        generation.reference_image_url?.trim() ||
        null;

      return processKreaEnhanceWorkflow({
        generationId,
        userId: generation.user_id,
        finalPrompt:
          finalPrompt || "Enhance image quality, clarity and resolution.",
        creditsUsed,
        workflow,
        modelPath: kreaModelPath,
        sourceImageUrl,
        outputWidth: generation.output_width,
        outputHeight: generation.output_height,
      });
    }

    if (workflow === "reference_edit") {
      const sourceImageUrl = generation.reference_image_url?.trim() || null;

      return processKreaReferenceEditWorkflow({
        generationId,
        userId: generation.user_id,
        finalPrompt,
        creditsUsed,
        workflow,
        modelPath: kreaModelPath,
        sourceImageUrl,
      });
    }

    if (workflow === "video_image_to_video") {
      const sourceImageUrl =
        generation.source_image_url?.trim() ||
        generation.reference_image_url?.trim() ||
        null;

      return processKreaVideoWorkflow({
        generationId,
        userId: generation.user_id,
        finalPrompt,
        creditsUsed,
        workflow,
        modelPath: kreaModelPath,
        sourceImageUrl,
      });
    }

    return processKreaImageWorkflow({
      generationId,
      userId: generation.user_id,
      finalPrompt,
      creditsUsed,
      workflow,
      modelPath: kreaModelPath,
      outputWidth: generation.output_width,
      outputHeight: generation.output_height,
    });
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

/**
 * Motion Transfer generate handler — POST /api/live-avatar/generate
 * Credits charged only after validation; refunded on provider failure.
 */

import { authenticateBearerUser } from "@/app/lib/supabase-admin";
import { validateKreaInputs } from "@/lib/ai/krea-input-validation";
import {
  getKreaModelById,
  isKreaModelExecutable,
  resolveKreaStoredModelId,
} from "@/lib/ai/krea-model-registry";
import { buildGenerationErrorPayload } from "@/lib/generation/generation-errors";
import {
  markGenerationCompleted,
  markGenerationFailed,
  refundUserCredits,
  uploadVideoFromRemoteUrl,
} from "@/lib/generation/poc-shared";
import { isMotionTransferServerEnabled } from "@/lib/launch/server-flags";
import {
  assertKreaConfigured,
  isKreaProviderEnabled,
} from "@/lib/providers";
import { isKreaToolNotImplemented } from "@/lib/krea/krea-errors";
import { runKreaModel } from "@/lib/krea/krea-generation-router";
import {
  assertToolCanRun,
  isToolRunBlockedError,
  isToolRunInsufficientCreditsError,
} from "@/app/lib/tools/assert-tool-can-run";

const PROVIDER = "krea";
const LOG_PREFIX = "[motion-transfer-generate]";

export type MotionTransferGenerateBody = {
  sourceImageUrl?: string;
  sourceVideoUrl?: string;
  consentAccepted?: boolean;
  orientation?: string;
  kreaModelId?: string;
  prompt?: string;
};

export async function handleMotionTransferGenerate(req: Request) {
  const requestId = crypto.randomUUID();
  let generationId: string | null = null;
  let userId: string | null = null;
  let creditsUsed = 0;

  try {
    if (!isMotionTransferServerEnabled()) {
      return Response.json(
        buildGenerationErrorPayload("KREA_MOTION_NOT_IMPLEMENTED", {
          refunded: false,
        }),
        { status: 503 }
      );
    }

    if (!isKreaProviderEnabled() || !process.env.KREA_API_KEY?.trim()) {
      return Response.json(
        buildGenerationErrorPayload("ENGINE_NOT_CONFIGURED", { refunded: false }),
        { status: 503 }
      );
    }

    try {
      assertKreaConfigured();
    } catch {
      return Response.json(
        buildGenerationErrorPayload("ENGINE_NOT_CONFIGURED", { refunded: false }),
        { status: 503 }
      );
    }

    const { supabase, user, error: authError } = await authenticateBearerUser(req);
    if (!user) {
      return Response.json({ success: false, error: authError ?? "Unauthorized" }, {
        status: 401,
      });
    }
    userId = user.id;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return Response.json(
        buildGenerationErrorPayload("GENERATION_FAILED", { refunded: false }),
        { status: 400 }
      );
    }

    const record = (body ?? {}) as MotionTransferGenerateBody;
    const sourceImageUrl =
      typeof record.sourceImageUrl === "string" ? record.sourceImageUrl.trim() : "";
    const sourceVideoUrl =
      typeof record.sourceVideoUrl === "string" ? record.sourceVideoUrl.trim() : "";
    const kreaModelId =
      typeof record.kreaModelId === "string" ? record.kreaModelId.trim() : "";

    if (!sourceImageUrl) {
      return Response.json(
        buildGenerationErrorPayload("MISSING_SOURCE_IMAGE", { refunded: false }),
        { status: 400 }
      );
    }

    if (!sourceVideoUrl) {
      return Response.json(
        buildGenerationErrorPayload("GENERATION_FAILED", { refunded: false }),
        { status: 400 }
      );
    }

    if (record.consentAccepted !== true) {
      return Response.json(
        buildGenerationErrorPayload("GENERATION_FAILED", { refunded: false }),
        { status: 400 }
      );
    }

    if (!kreaModelId) {
      return Response.json(
        buildGenerationErrorPayload("ENGINE_NOT_CONFIGURED", { refunded: false }),
        { status: 400 }
      );
    }

    const model = getKreaModelById(kreaModelId);
    if (!model || model.category !== "motion_transfer") {
      return Response.json(
        buildGenerationErrorPayload("ENGINE_NOT_CONFIGURED", { refunded: false }),
        { status: 400 }
      );
    }

    if (!isKreaModelExecutable(model)) {
      return Response.json(
        buildGenerationErrorPayload("KREA_MOTION_NOT_IMPLEMENTED", {
          refunded: false,
        }),
        { status: 410 }
      );
    }

    const inputCheck = validateKreaInputs({
      model,
      prompt: record.prompt,
      inputs: {
        sourceImageUrl,
        sourceVideoUrl,
      },
    });
    if (!inputCheck.ok) {
      return Response.json(
        buildGenerationErrorPayload("MISSING_SOURCE_IMAGE", { refunded: false }),
        { status: 400 }
      );
    }

    creditsUsed = model.credits;

    const { data: creditRow } = await supabase
      .from("user_credits")
      .select("credits")
      .eq("user_id", user.id)
      .maybeSingle();

    const creditsAvailable = creditRow?.credits ?? 0;

    try {
      assertToolCanRun({
        toolId: "motion_transfer",
        actionId: "motion_transfer",
        userCreditBalance: creditsAvailable,
        language: "en",
      });
    } catch (gateError) {
      if (isToolRunBlockedError(gateError)) {
        return Response.json(
          {
            success: false,
            code: gateError.code,
            error: gateError.userMessage,
            refunded: false,
          },
          { status: gateError.status }
        );
      }
      if (isToolRunInsufficientCreditsError(gateError)) {
        return Response.json(
          {
            success: false,
            code: "INSUFFICIENT_CREDITS",
            error: gateError.userMessage,
            requiredCredits: creditsUsed,
            creditsAvailable,
            refunded: false,
          },
          { status: gateError.status }
        );
      }
      throw gateError;
    }

    if (creditsAvailable < creditsUsed) {
      return Response.json(
        {
          success: false,
          code: "INSUFFICIENT_CREDITS",
          error: "Not enough credits.",
          requiredCredits: creditsUsed,
          creditsAvailable,
          refunded: false,
        },
        { status: 402 }
      );
    }

    const { data: creditSuccess, error: creditError } = await supabase.rpc(
      "consume_user_credits",
      { target_user_id: user.id, credits_to_consume: creditsUsed }
    );

    if (creditError || !creditSuccess) {
      return Response.json(
        {
          success: false,
          code: "INSUFFICIENT_CREDITS",
          error: "Not enough credits.",
          requiredCredits: creditsUsed,
          creditsAvailable,
          refunded: false,
        },
        { status: 402 }
      );
    }

    const workflow = "motion_transfer";
    const storedModel = resolveKreaStoredModelId(model.id, workflow);

    const { data: generation, error: insertError } = await supabase
      .from("generations")
      .insert({
        user_id: user.id,
        prompt: record.prompt?.trim() ?? "Motion transfer",
        final_prompt: record.prompt?.trim() ?? "Motion transfer",
        image_url: sourceImageUrl,
        video_url: null,
        status: "processing",
        provider: PROVIDER,
        model: storedModel,
        workflow,
        credits_used: creditsUsed,
        error_message: null,
        started_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (insertError || !generation) {
      await refundUserCredits({
        userId: user.id,
        creditsToRefund: creditsUsed,
        source: "motion_transfer_insert_failure",
      });
      return Response.json(
        buildGenerationErrorPayload("GENERATION_FAILED", { refunded: true }),
        { status: 500 }
      );
    }

    generationId = generation.id;

    let adapterResult;
    try {
      adapterResult = await runKreaModel({
        model,
        prompt: record.prompt,
        inputs: {
          sourceImageUrl,
          sourceVideoUrl,
        },
      });
    } catch (adapterError) {
      await refundUserCredits({
        userId: user.id,
        creditsToRefund: creditsUsed,
        source: "motion_transfer_adapter_failure",
      });
      await markGenerationFailed({
        generationId: generation.id,
        errorMessage:
          adapterError instanceof Error
            ? adapterError.message
            : "Motion transfer failed.",
      });

      if (isKreaToolNotImplemented(adapterError)) {
        return Response.json(
          buildGenerationErrorPayload("KREA_MOTION_NOT_IMPLEMENTED", {
            refunded: true,
          }),
          { status: 410 }
        );
      }

      console.error(LOG_PREFIX, {
        requestId,
        generationId,
        error:
          adapterError instanceof Error ? adapterError.message : adapterError,
      });

      return Response.json(
        buildGenerationErrorPayload("PROVIDER_ERROR", { refunded: true }),
        { status: 502 }
      );
    }

    if (!adapterResult.videoUrl) {
      await refundUserCredits({
        userId: user.id,
        creditsToRefund: creditsUsed,
        source: "motion_transfer_no_output",
      });
      await markGenerationFailed({
        generationId: generation.id,
        errorMessage: "NO_OUTPUT_URL",
      });
      return Response.json(
        buildGenerationErrorPayload("NO_OUTPUT_URL", { refunded: true }),
        { status: 502 }
      );
    }

    const publicVideoUrl = await uploadVideoFromRemoteUrl({
      userId: user.id,
      remoteUrl: adapterResult.videoUrl,
    });

    await markGenerationCompleted({
      generationId: generation.id,
      videoUrl: publicVideoUrl,
      providerJobId: adapterResult.providerJobId,
    });

    const { data: creditsAfterRow } = await supabase
      .from("user_credits")
      .select("credits")
      .eq("user_id", user.id)
      .maybeSingle();

    console.info(LOG_PREFIX, {
      requestId,
      generationId,
      kreaModelId,
      success: true,
    });

    return Response.json({
      success: true,
      requestId,
      generationId: generation.id,
      videoUrl: publicVideoUrl,
      creditsUsed,
      creditsAfter: creditsAfterRow?.credits ?? null,
      provider: PROVIDER,
      model: storedModel,
      kreaModelId: model.id,
    });
  } catch (error) {
    console.error(LOG_PREFIX, {
      requestId,
      generationId,
      error: error instanceof Error ? error.message : error,
    });

    if (userId && creditsUsed > 0) {
      try {
        await refundUserCredits({
          userId,
          creditsToRefund: creditsUsed,
          source: "motion_transfer_failure",
        });
      } catch {
        /* log only */
      }
    }

    if (userId && generationId) {
      await markGenerationFailed({
        generationId,
        errorMessage:
          error instanceof Error ? error.message : "Motion transfer failed.",
      });
    }

    return Response.json(
      buildGenerationErrorPayload("GENERATION_FAILED", {
        refunded: creditsUsed > 0,
      }),
      { status: 500 }
    );
  }
}

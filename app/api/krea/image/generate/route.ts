/** Active image route — used by the new dashboard Image Studio (`/dashboard/image`). */
import { NextResponse } from "next/server";
import { authenticateBearerUser } from "@/app/lib/supabase-admin";
import { resolveKreaImageGenerationModel } from "@/lib/ai/krea-model-registry";
import { encodeStoredGenerationError } from "@/lib/generation/generation-errors";
import {
  buildKreaImageRouteError,
  classifyProviderFailure,
  httpStatusForKreaImageError,
  truncateDebugReason,
  type KreaImageRouteErrorCode,
} from "@/lib/generation/krea-image-route-errors";
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
  kreaAspectRatioFromFormatKey,
  kreaDimensionsFromAspectRatio,
  waitForKreaJob,
} from "@/lib/providers";

export const runtime = "nodejs";
export const maxDuration = 300;

const PROVIDER = "krea";
const ACTIVE_GENERATION_LIMIT = 2;
const LOG_PREFIX = "[krea-image-generate]";

function logStep(
  requestId: string,
  step: string,
  extra?: Record<string, unknown>
) {
  console.info(LOG_PREFIX, { requestId, step, ...extra });
}

function errorResponse(
  code: KreaImageRouteErrorCode,
  options: {
    requestId: string;
    step: string;
    debugReason?: string;
    refunded?: boolean;
    requiredCredits?: number;
    status?: number;
  }
) {
  const body = buildKreaImageRouteError(code, options);
  const status = options.status ?? httpStatusForKreaImageError(code);
  logStep(options.requestId, "error_response", {
    code,
    step: options.step,
    status,
    debugReason: options.debugReason
      ? truncateDebugReason(options.debugReason)
      : undefined,
  });
  return NextResponse.json(body, { status });
}

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  let generationId: string | null = null;
  let userId: string | null = null;
  let creditsUsed = 0;
  let requestModelId: string | undefined;
  let currentStep = "route_hit";
  let resolvedModelDebug: Record<string, unknown> | null = null;

  logStep(requestId, "route_hit");

  try {
    currentStep = "provider_enabled_check";
    if (!isKreaProviderEnabled()) {
      return errorResponse("MISSING_KREA_API_KEY", {
        requestId,
        step: currentStep,
        debugReason: "ENABLE_KREA_PROVIDER is false",
        status: 503,
      });
    }

    currentStep = "env_check";
    const hasKreaKey = Boolean(process.env.KREA_API_KEY?.trim());
    logStep(requestId, "env_check", { hasKreaKey, kreaProviderEnabled: true });

    if (!hasKreaKey) {
      return errorResponse("MISSING_KREA_API_KEY", {
        requestId,
        step: currentStep,
        debugReason: "KREA_API_KEY is not set",
      });
    }

    try {
      assertKreaConfigured();
    } catch (configError) {
      return errorResponse("MISSING_KREA_API_KEY", {
        requestId,
        step: currentStep,
        debugReason:
          configError instanceof Error ? configError.message : "Krea not configured",
      });
    }

    currentStep = "auth_check";
    const { supabase, user, error: authError } = await authenticateBearerUser(req);

    logStep(requestId, "auth_check", {
      hasUser: Boolean(user?.id),
      userId: user?.id ?? null,
      authError: authError ?? null,
    });

    if (!user) {
      return errorResponse("UNAUTHENTICATED", {
        requestId,
        step: currentStep,
        debugReason: authError ?? "No bearer user",
      });
    }

    userId = user.id;

    currentStep = "body_parse";
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return errorResponse("BODY_INVALID", {
        requestId,
        step: currentStep,
        debugReason: "req.json() failed",
      });
    }

    if (!body || typeof body !== "object") {
      return errorResponse("BODY_INVALID", {
        requestId,
        step: currentStep,
        debugReason: "Body is not an object",
      });
    }

    const record = body as Record<string, unknown>;
    const prompt = typeof record.prompt === "string" ? record.prompt.trim() : "";
    requestModelId =
      typeof record.kreaModelId === "string" ? record.kreaModelId.trim() : undefined;
    const outputFormat =
      typeof record.outputFormat === "string" ? record.outputFormat.trim() : undefined;

    logStep(requestId, "body_received", {
      promptLength: prompt.length,
      kreaModelId: requestModelId ?? null,
      outputFormat: outputFormat ?? null,
    });

    const aspectRatio =
      typeof record.aspectRatio === "string"
        ? record.aspectRatio.trim()
        : outputFormat
          ? kreaAspectRatioFromFormatKey(outputFormat)
          : "1:1";
    const fromAspect = kreaDimensionsFromAspectRatio(aspectRatio);
    const width =
      typeof record.width === "number" && record.width > 0
        ? record.width
        : fromAspect.width;
    const height =
      typeof record.height === "number" && record.height > 0
        ? record.height
        : fromAspect.height;

    if (!prompt) {
      return errorResponse("MISSING_PROMPT", {
        requestId,
        step: "validation",
        debugReason: "prompt empty or missing",
      });
    }

    currentStep = "model_resolve";
    const modelResolution = resolveKreaImageGenerationModel(requestModelId);
    if (!modelResolution.ok) {
      return errorResponse("MODEL_NOT_CONFIGURED", {
        requestId,
        step: currentStep,
        debugReason: `${modelResolution.reason}: ${modelResolution.error}`,
        status: modelResolution.status,
      });
    }

    const { entry, modelPath, storedModel, credits, workflow, studioModelId } =
      modelResolution;
    creditsUsed = credits;

    resolvedModelDebug = {
      requestModelId: requestModelId ?? null,
      studioModelId: studioModelId ?? null,
      registryId: entry.id,
      internalModel: modelPath,
      kreaEndpoint: `/generate/image/${modelPath}`,
      workflow,
      storedModel,
    };

    logStep(requestId, "model_resolved", {
      ...resolvedModelDebug,
      creditCost: credits,
      aspectRatio,
      width,
      height,
    });

    currentStep = "active_generations_check";
    const { count: activeCount, error: activeError } = await supabase
      .from("generations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "processing");

    if (activeError) {
      return errorResponse("UNKNOWN_SERVER_ERROR", {
        requestId,
        step: currentStep,
        debugReason: `active generations query: ${activeError.message}`,
      });
    }

    if ((activeCount ?? 0) >= ACTIVE_GENERATION_LIMIT) {
      return errorResponse("UNKNOWN_SERVER_ERROR", {
        requestId,
        step: currentStep,
        debugReason: `active_generation_limit: ${activeCount}`,
        status: 429,
      });
    }

    currentStep = "credits_check";
    const { data: creditRow, error: creditReadError } = await supabase
      .from("user_credits")
      .select("credits")
      .eq("user_id", user.id)
      .maybeSingle();

    logStep(requestId, "credits_check", {
      credits: creditRow?.credits ?? null,
      creditCost: creditsUsed,
      creditReadError: creditReadError?.message ?? null,
    });

    if (creditReadError) {
      return errorResponse("CREDIT_QUERY_FAILED", {
        requestId,
        step: currentStep,
        debugReason: creditReadError.message,
      });
    }

    const { data: creditSuccess, error: creditError } = await supabase.rpc(
      "consume_user_credits",
      {
        target_user_id: user.id,
        credits_to_consume: creditsUsed,
      }
    );

    if (creditError) {
      return errorResponse("CREDIT_QUERY_FAILED", {
        requestId,
        step: "credits_consume",
        debugReason: creditError.message,
      });
    }

    if (!creditSuccess) {
      return errorResponse("INSUFFICIENT_CREDITS", {
        requestId,
        step: "credits_consume",
        debugReason: `balance=${creditRow?.credits ?? 0}, cost=${creditsUsed}`,
        requiredCredits: creditsUsed,
      });
    }

    logStep(requestId, "credits_consumed", { creditCost: creditsUsed });

    currentStep = "db_insert";
    logStep(requestId, "db_insert_start");

    const { data: generation, error: insertError } = await supabase
      .from("generations")
      .insert({
        user_id: user.id,
        prompt,
        final_prompt: prompt,
        image_url: null,
        status: "processing",
        provider: PROVIDER,
        model: storedModel,
        workflow,
        credits_used: creditsUsed,
        output_width: width,
        output_height: height,
        error_message: null,
        started_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (insertError || !generation) {
      logStep(requestId, "db_insert_failed", {
        dbError: insertError?.message ?? "missing_generation_row",
      });

      try {
        await refundUserCredits({
          userId: user.id,
          creditsToRefund: creditsUsed,
          source: "krea_image_create_failure",
        });
      } catch (refundError) {
        return errorResponse("CREDIT_REFUND_FAILED", {
          requestId,
          step: currentStep,
          debugReason:
            refundError instanceof Error ? refundError.message : "refund failed",
          refunded: false,
        });
      }

      return errorResponse("GENERATION_INSERT_FAILED", {
        requestId,
        step: currentStep,
        debugReason: insertError?.message ?? "missing generation row",
        refunded: true,
      });
    }

    generationId = generation.id;
    logStep(requestId, "db_insert_ok", { generationId });

    await supabase.from("credit_transactions").insert({
      user_id: user.id,
      amount: -creditsUsed,
      type: "usage",
      source: `krea_image_${entry.id}`,
    });

    currentStep = "provider_request_start";
    logStep(requestId, "provider_request_start", {
      internalModel: modelPath,
      kreaEndpoint: `/generate/image/${modelPath}`,
      aspectRatio,
    });

    const job = await createKreaImageJob({
      prompt,
      width,
      height,
      aspectRatio,
      modelPath,
      workflow,
    });

    logStep(requestId, "provider_job_created", {
      providerJobId: job.providerJobId ?? null,
      hasProviderJobId: Boolean(job.providerJobId),
    });

    if (!job.providerJobId) {
      throw new Error("Krea did not return a job_id.");
    }

    currentStep = "provider_poll";
    const result = await waitForKreaJob(job.providerJobId, {
      modelPath,
      workflow,
      expect: "image",
    });

    logStep(requestId, "provider_response", {
      hasImageUrl: Boolean(result.imageUrl),
      providerJobId: result.providerJobId ?? null,
      responseKeys:
        result.raw && typeof result.raw === "object"
          ? Object.keys(result.raw as Record<string, unknown>)
          : [],
    });

    if (!result.imageUrl) {
      throw new Error("Krea did not return an image URL.");
    }

    logStep(requestId, "image_url_extracted", { hasImageUrl: true });

    currentStep = "storage_upload";
    const publicUrl = await uploadImageFromRemoteUrl({
      userId: user.id,
      remoteUrl: result.imageUrl,
    });

    logStep(requestId, "storage_upload_ok", { hasPublicUrl: Boolean(publicUrl) });

    const resolvedModel = result.model ?? storedModel;

    currentStep = "db_complete";
    await markGenerationCompleted({
      generationId: generation.id,
      imageUrl: publicUrl,
      providerJobId: result.providerJobId,
    });

    await supabase
      .from("generations")
      .update({ model: resolvedModel })
      .eq("id", generation.id);

    logStep(requestId, "success", { generationId: generation.id, creditsUsed });

    return NextResponse.json({
      success: true,
      requestId,
      generationId: generation.id,
      workflow,
      provider: PROVIDER,
      model: resolvedModel,
      kreaModelId: studioModelId ?? entry.id,
      creditsUsed,
      imageUrl: publicUrl,
    });
  } catch (error) {
    const internalMessage =
      error instanceof Error ? error.message : "Image generation failed.";
    const code = classifyProviderFailure(internalMessage);

    logStep(requestId, "failure", {
      failedAt: currentStep,
      code,
      internal: truncateDebugReason(internalMessage),
      generationId,
      ...resolvedModelDebug,
      creditsRefunded: creditsUsed,
    });

    let refunded = false;
    if (userId && creditsUsed > 0) {
      try {
        await refundUserCredits({
          userId,
          creditsToRefund: creditsUsed,
          source: "krea_image_failure",
        });
        refunded = true;
      } catch (refundError) {
        logStep(requestId, "credit_refund_failed", {
          message:
            refundError instanceof Error ? refundError.message : "refund failed",
        });
      }
    }

    if (userId && generationId) {
      const storedPayload = buildKreaImageRouteError(code, {
        requestId,
        step: currentStep,
        debugReason: internalMessage,
        refunded,
      });
      await markGenerationFailed({
        generationId,
        errorMessage: encodeStoredGenerationError({
          success: false,
          code:
            code === "PROVIDER_REQUEST_FAILED" || code === "PROVIDER_BAD_RESPONSE"
              ? "PROVIDER_ERROR"
              : code === "NO_OUTPUT_URL"
                ? "NO_OUTPUT_URL"
                : "GENERATION_FAILED",
          error: storedPayload.error,
        }),
      });
    }

    return errorResponse(code, {
      requestId,
      step: currentStep,
      debugReason: internalMessage,
      refunded,
    });
  }
}

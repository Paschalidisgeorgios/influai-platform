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
import { refundChargedGenerationOnce } from "@/app/lib/generation/refund-generation";
import {
  markGenerationCompleted,
  markGenerationFailed,
  uploadImageFromRemoteUrl,
} from "@/lib/generation/poc-shared";
import {
  assertKreaConfigured,
  isKreaProviderEnabled,
  kreaAspectRatioFromFormatKey,
  kreaDimensionsFromAspectRatio,
} from "@/lib/providers";
import { generateViaKreaSubscribe } from "@/lib/krea/krea-subscribe-generation";
import { generateCampaignExpansion } from "@/lib/intelligence/campaign-expansion-engine";
import {
  ModelModeResolutionError,
  resolveModelModeForGeneration,
} from "@/app/lib/model-modes/resolve-model-mode";
import {
  assertToolCanRun,
  isToolRunBlockedError,
  isToolRunInsufficientCreditsError,
} from "@/app/lib/tools/assert-tool-can-run";
import { checkPromptSafety } from "@/lib/safety/prompt-safety-filter";

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
    creditsAvailable?: number;
    language?: "de" | "en";
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
    logStep(requestId, "env_check", {
      hasKreaKey,
      kreaProviderEnabled: isKreaProviderEnabled(),
      nodeEnv: process.env.NODE_ENV ?? null,
      vercelEnv: process.env.VERCEL_ENV ?? null,
    });

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
    const modelModeId =
      typeof record.modelModeId === "string" ? record.modelModeId.trim() : "";
    const actionId =
      typeof record.actionId === "string" ? record.actionId.trim() : "";
    const currentLanguage: "de" | "en" =
      record.currentLanguage === "en" ? "en" : "de";

    let modelModeCreditOverride: number | undefined;

    if (modelModeId && actionId) {
      try {
        const modeResolved = resolveModelModeForGeneration(
          modelModeId,
          actionId,
          { language: currentLanguage }
        );
        requestModelId = modeResolved.apiModelId;
        modelModeCreditOverride = modeResolved.credits;
      } catch (modeError) {
        if (modeError instanceof ModelModeResolutionError) {
          return errorResponse("MODEL_NOT_CONFIGURED", {
            requestId,
            step: "model_mode_resolve",
            debugReason: modeError.message,
            status: modeError.status,
            language: currentLanguage,
          });
        }
        return errorResponse("MODEL_NOT_CONFIGURED", {
          requestId,
          step: "model_mode_resolve",
          debugReason: "model mode resolution failed",
          language: currentLanguage,
        });
      }
    } else {
      requestModelId =
        typeof record.kreaModelId === "string"
          ? record.kreaModelId.trim()
          : typeof record.selectedModelId === "string"
            ? record.selectedModelId.trim()
            : undefined;
    }

    const outputFormat =
      typeof record.outputFormat === "string"
        ? record.outputFormat.trim()
        : typeof record.selectedFormat === "string"
          ? record.selectedFormat.trim()
          : undefined;

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

    const safetyResult = checkPromptSafety(prompt);
    if (!safetyResult.safe) {
      return NextResponse.json(
        {
          error: safetyResult.userMessage.en,
          safetyBlock: true,
        },
        { status: 422 }
      );
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
    creditsUsed =
      modelModeCreditOverride !== undefined ? modelModeCreditOverride : credits;

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
        language: currentLanguage,
      });
    }

    const creditsAvailable = creditRow?.credits ?? 0;

    currentStep = "tool_gate";
    try {
      assertToolCanRun({
        actionId: actionId || "create_image",
        modelModeId: modelModeId || undefined,
        engineId: entry.id,
        userCreditBalance: creditsAvailable,
        language: currentLanguage,
      });
    } catch (gateError) {
      if (isToolRunBlockedError(gateError)) {
        return errorResponse("MODEL_NOT_CONFIGURED", {
          requestId,
          step: currentStep,
          debugReason: gateError.internalReason ?? gateError.code,
          status: gateError.status,
          language: currentLanguage,
        });
      }
      if (isToolRunInsufficientCreditsError(gateError)) {
        return errorResponse("INSUFFICIENT_CREDITS", {
          requestId,
          step: currentStep,
          debugReason: `balance=${creditsAvailable}, cost=${creditsUsed}`,
          requiredCredits: creditsUsed,
          creditsAvailable,
          language: currentLanguage,
        });
      }
      throw gateError;
    }

    if (creditsAvailable < creditsUsed) {
      return errorResponse("INSUFFICIENT_CREDITS", {
        requestId,
        step: currentStep,
        debugReason: `balance=${creditsAvailable}, cost=${creditsUsed}`,
        requiredCredits: creditsUsed,
        creditsAvailable,
        language: currentLanguage,
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
        debugReason: `balance=${creditsAvailable}, cost=${creditsUsed}`,
        requiredCredits: creditsUsed,
        creditsAvailable,
        language: currentLanguage,
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
        ...(outputFormat ? { output_format: outputFormat } : {}),
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
        await refundChargedGenerationOnce({
          userId: user.id,
          creditsToRefund: creditsUsed,
          fallbackSource: `krea_image_create_failure:${requestId}`,
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

    const expansionPromise = generateCampaignExpansion({
      prompt,
      language: currentLanguage,
    });

    const kreaPipelinePromise = (async () => {
      const result = await generateViaKreaSubscribe({
        modelPath,
        prompt,
        width,
        height,
        aspectRatio,
        expect: "image",
      });

      logStep(requestId, "provider_response", {
        hasImageUrl: Boolean(result.imageUrl),
        providerJobId: result.providerJobId ?? null,
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
      try {
        await markGenerationCompleted({
          generationId: generation.id,
          imageUrl: publicUrl,
          providerJobId: result.providerJobId,
        });
      } catch (saveError) {
        throw new Error(
          `DB_SAVE_FAILED: ${saveError instanceof Error ? saveError.message : "save failed"}`
        );
      }

      await supabase
        .from("generations")
        .update({ model: resolvedModel })
        .eq("id", generation.id);

      return {
        publicUrl,
        resolvedModel,
        providerJobId: result.providerJobId,
      };
    })();

    const [imageResult, expansionResult] = await Promise.allSettled([
      kreaPipelinePromise,
      expansionPromise,
    ]);

    if (imageResult.status === "rejected") {
      throw imageResult.reason;
    }

    const { publicUrl } = imageResult.value;

    let campaignExpansion: Awaited<ReturnType<typeof generateCampaignExpansion>> | null =
      null;
    let campaignExpansionWarning: string | undefined;

    if (expansionResult.status === "fulfilled") {
      campaignExpansion = expansionResult.value;
    } else {
      campaignExpansionWarning =
        currentLanguage === "de"
          ? "Kampagnentexte konnten nicht erstellt werden."
          : "Campaign text could not be generated.";
      logStep(requestId, "campaign_expansion_failed", {
        reason:
          expansionResult.reason instanceof Error
            ? expansionResult.reason.message
            : "unknown",
      });
    }

    const { data: creditsAfterRow } = await supabase
      .from("user_credits")
      .select("credits")
      .eq("user_id", user.id)
      .maybeSingle();

    logStep(requestId, "success", { generationId: generation.id, creditsUsed });

    return NextResponse.json({
      success: true,
      outputType: "image",
      requestId,
      generationId: generation.id,
      workflow,
      provider: PROVIDER,
      model: imageResult.value.resolvedModel,
      kreaModelId: studioModelId ?? entry.id,
      creditsUsed,
      creditsAfter: creditsAfterRow?.credits ?? null,
      imageUrl: publicUrl,
      campaignExpansion,
      ...(campaignExpansionWarning ? { campaignExpansionWarning } : {}),
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
        refunded = await refundChargedGenerationOnce({
          userId,
          creditsToRefund: creditsUsed,
          generationId,
          fallbackSource: `krea_image_failure:${requestId}`,
        });
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

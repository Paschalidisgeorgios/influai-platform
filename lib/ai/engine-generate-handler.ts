/**
 * Universal engine generate handler — Krea + fal.ai via provider router.
 */

import { authenticateBearerUser } from "@/app/lib/supabase-admin";
import { validateEngineInputs } from "@/lib/ai/engine-input-validation";
import {
  getEngineModelById,
  isEngineModelExecutable,
  resolveEngineStoredModelId,
} from "@/lib/ai/model-registry";
import { EngineResolutionError } from "@/app/lib/engines/types";
import {
  resolveProviderGenerationContext,
} from "@/app/lib/providers/provider-router";
import { runEngineModel } from "@/lib/ai/provider-router";
import { refundChargedGenerationOnce } from "@/app/lib/generation/refund-generation";
import {
  markGenerationCompleted,
  markGenerationFailed,
  uploadImageFromRemoteUrl,
  uploadVideoFromRemoteUrl,
} from "@/lib/generation/poc-shared";
import { generateCampaignExpansion } from "@/lib/intelligence/campaign-expansion-engine";
import {
  assertFalConfigured,
  assertKreaConfigured,
  isFalProviderEnabled,
  isKreaProviderEnabled,
} from "@/lib/providers/flags";
import {
  isKreaToolNotImplemented,
  KreaGenerationError,
} from "@/lib/krea/krea-errors";
import {
  buildGenerationErrorPayload,
  encodeStoredGenerationError,
} from "@/lib/generation/generation-errors";
import {
  FalGenerationError,
  FAL_BALANCE_EXHAUSTED_CODE,
  getFalBalanceUserMessage,
  isFalBalanceExhaustedError,
} from "@/lib/fal/fal-errors";
import {
  ModelModeResolutionError,
  resolveModelModeForGeneration,
} from "@/app/lib/model-modes/resolve-model-mode";
import {
  assertToolCanRun,
  getToolRunBlockedUserMessage,
  isToolRunBlockedError,
  isToolRunInsufficientCreditsError,
} from "@/app/lib/tools/assert-tool-can-run";
import { buildPublicErrorJson, buildPublicJson } from "@/lib/env/runtime-ui";

const LOG_PREFIX = "[engine-generate]";

export type EngineGenerateRequestBody = {
  modelId: string;
  /** @deprecated Use modelId */
  kreaModelId?: string;
  /** User-facing model mode id */
  modelModeId?: string;
  /** Product action id */
  actionId?: string;
  prompt?: string;
  selectedFormat?: string;
  currentLanguage?: "de" | "en";
  inputs?: {
    sourceImageUrl?: string;
    sourceVideoUrl?: string;
    sourceAudioUrl?: string;
    referenceImageUrl?: string;
    scriptText?: string;
    trainingImages?: string[];
    duration?: number;
    resolution?: string;
  };
};

function errorJson(
  code: string,
  error: string,
  status: number,
  extra?: Record<string, unknown>
) {
  return buildPublicErrorJson(
    { success: false, code, error, ...extra },
    { status }
  );
}

async function respondProviderBalanceExhausted(params: {
  userId: string;
  generationId: string | null;
  creditsCharged: boolean;
  creditsUsed: number;
  language: "de" | "en";
  requestId: string;
}): Promise<Response> {
  if (params.creditsCharged && params.creditsUsed > 0) {
    await refundChargedGenerationOnce({
      userId: params.userId,
      creditsToRefund: params.creditsUsed,
      generationId: params.generationId,
      fallbackSource: `engine_fal_balance_exhausted:${params.requestId}`,
    });
  }

  if (params.generationId) {
    const payload = buildGenerationErrorPayload(FAL_BALANCE_EXHAUSTED_CODE, {
      language: params.language,
      refunded: params.creditsCharged,
      includeReason: false,
      requestId: params.requestId,
    });
    await markGenerationFailed({
      generationId: params.generationId,
      errorMessage: encodeStoredGenerationError(payload),
    });
  }

  const userMessage = getFalBalanceUserMessage(params.language);
  return errorJson(FAL_BALANCE_EXHAUSTED_CODE, userMessage, 503, {
    requestId: params.requestId,
    refunded: params.creditsCharged,
  });
}

function assertProviderConfigured(provider: "krea" | "fal"): void {
  if (provider === "krea") {
    if (!isKreaProviderEnabled()) {
      throw new Error("MISSING_KREA_API_KEY");
    }
    assertKreaConfigured();
    return;
  }
  if (!isFalProviderEnabled()) {
    throw new Error("MISSING_FAL_KEY");
  }
  assertFalConfigured();
}

export async function handleEngineGenerate(req: Request): Promise<Response> {
  const requestId = crypto.randomUUID();
  let generationId: string | null = null;
  let userId: string | null = null;
  let creditsUsed = 0;
  let creditsCharged = false;
  let language: "de" | "en" = "de";

  try {
    const { supabase, user, error: authError } = await authenticateBearerUser(req);
    if (!user) {
      return errorJson("UNAUTHENTICATED", authError ?? "Unauthorized.", 401);
    }
    userId = user.id;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return errorJson("BODY_INVALID", "Invalid request body.", 400);
    }

    if (!body || typeof body !== "object") {
      return errorJson("BODY_INVALID", "Invalid request body.", 400);
    }

    const record = body as EngineGenerateRequestBody;
    language = record.currentLanguage === "en" ? "en" : "de";

    const modelModeId =
      typeof record.modelModeId === "string" ? record.modelModeId.trim() : "";
    const actionId =
      typeof record.actionId === "string" ? record.actionId.trim() : "";

    let resolvedModelId = (
      typeof record.modelId === "string"
        ? record.modelId
        : typeof record.kreaModelId === "string"
          ? record.kreaModelId
          : ""
    ).trim();

    let modelModeCreditOverride: number | undefined;

    if (modelModeId && actionId) {
      try {
        const modeResolved = resolveModelModeForGeneration(
          modelModeId,
          actionId,
          { language }
        );
        resolvedModelId = modeResolved.apiModelId;
        modelModeCreditOverride = modeResolved.credits;
      } catch (modeError) {
        if (modeError instanceof ModelModeResolutionError) {
          return errorJson(modeError.code, modeError.message, modeError.status);
        }
        return errorJson(
          "MODEL_MODE_INVALID",
          "This creation mode is not available.",
          400
        );
      }
    }

    if (!resolvedModelId) {
      return errorJson("BODY_INVALID", "modelId is required.", 400);
    }

    const modelId = resolvedModelId;

    let providerContext;
    try {
      providerContext = resolveProviderGenerationContext(modelId, { language });
    } catch (resolutionError) {
      if (resolutionError instanceof EngineResolutionError) {
        return errorJson(
          resolutionError.code,
          resolutionError.message,
          resolutionError.status
        );
      }
      const message =
        resolutionError instanceof Error
          ? resolutionError.message
          : "Engine not available.";
      const code = message.includes("FAL")
        ? "MISSING_FAL_KEY"
        : message.includes("KREA")
          ? "MISSING_KREA_API_KEY"
          : "MODEL_NOT_CONFIGURED";
      return errorJson(code, "Engine not available.", 503);
    }

    const model = getEngineModelById(providerContext.modelRegistryId);
    if (!model) {
      return errorJson("MODEL_NOT_CONFIGURED", "Unknown model.", 400);
    }

    try {
      assertProviderConfigured(model.provider);
    } catch (providerError) {
      const message =
        providerError instanceof Error ? providerError.message : "Engine not configured.";
      const code = message.includes("FAL") ? "MISSING_FAL_KEY" : "MISSING_KREA_API_KEY";
      return errorJson(code, "Engine not configured.", 503);
    }

    if (!isEngineModelExecutable(model)) {
      return errorJson(
        "MODEL_NOT_CONFIGURED",
        "This creation mode is temporarily unavailable.",
        400
      );
    }

    const { data: creditRow } = await supabase
      .from("user_credits")
      .select("credits")
      .eq("user_id", user.id)
      .maybeSingle();

    const creditsAvailable = creditRow?.credits ?? 0;

    if (!actionId && !modelModeId) {
      return errorJson(
        "TOOL_NOT_RUNNABLE",
        getToolRunBlockedUserMessage(language),
        403
      );
    }

    try {
      assertToolCanRun({
        actionId: actionId || undefined,
        modelModeId: modelModeId || undefined,
        engineId: providerContext.resolved.resolvedEngineId,
        userCreditBalance: creditsAvailable,
        language,
      });
    } catch (gateError) {
      if (isToolRunBlockedError(gateError)) {
        return errorJson(gateError.code, gateError.userMessage, gateError.status);
      }
      if (isToolRunInsufficientCreditsError(gateError)) {
        return errorJson("INSUFFICIENT_CREDITS", gateError.userMessage, gateError.status);
      }
      throw gateError;
    }

    const inputCheck = validateEngineInputs({
      model,
      prompt: record.prompt,
      inputs: record.inputs as Record<string, unknown> | undefined,
    });
    if (!inputCheck.ok) {
      return errorJson(
        inputCheck.code ?? "MISSING_INPUT",
        "Required inputs missing.",
        400,
        { missing: inputCheck.missing }
      );
    }

    creditsUsed =
      modelModeCreditOverride ?? providerContext.resolved.credits;

    if (creditsAvailable < creditsUsed) {
      return errorJson("INSUFFICIENT_CREDITS", "Not enough credits.", 402, {
        requiredCredits: creditsUsed,
        creditsAvailable,
      });
    }

    const workflow = model.category;
    const storedModel = resolveEngineStoredModelId(model);

    const { data: creditSuccess, error: creditError } = await supabase.rpc(
      "consume_user_credits",
      { target_user_id: user.id, credits_to_consume: creditsUsed }
    );

    if (creditError || !creditSuccess) {
      return errorJson("INSUFFICIENT_CREDITS", "Not enough credits.", 402, {
        requiredCredits: creditsUsed,
        creditsAvailable,
      });
    }

    creditsCharged = true;

    const { data: generation, error: insertError } = await supabase
      .from("generations")
      .insert({
        user_id: user.id,
        prompt: record.prompt ?? "",
        final_prompt: record.prompt ?? "",
        image_url: null,
        video_url: null,
        status: "processing",
        provider: model.provider,
        model: storedModel,
        workflow,
        credits_used: creditsUsed,
        error_message: null,
        started_at: new Date().toISOString(),
        ...(record.selectedFormat ? { output_format: record.selectedFormat } : {}),
      })
      .select("id")
      .single();

    if (insertError || !generation) {
      await refundChargedGenerationOnce({
        userId: user.id,
        creditsToRefund: creditsUsed,
        fallbackSource: `engine_generate_insert_failure:${requestId}`,
      });
      creditsCharged = false;
      return errorJson("DB_SAVE_FAILED", "Failed to create generation.", 500);
    }

    generationId = generation.id;

    const expansionPromise =
      model.category === "image" && record.prompt?.trim()
        ? generateCampaignExpansion({ prompt: record.prompt.trim(), language })
        : Promise.resolve(null);

    let adapterResult;
    try {
      adapterResult = await runEngineModel({
        model,
        prompt: record.prompt,
        selectedFormat: record.selectedFormat,
        inputs: record.inputs,
      });
    } catch (adapterError) {
      if (isKreaToolNotImplemented(adapterError)) {
        if (creditsCharged && creditsUsed > 0) {
          await refundChargedGenerationOnce({
            userId: user.id,
            creditsToRefund: creditsUsed,
            generationId: generation.id,
            fallbackSource: `engine_tool_not_implemented:${requestId}`,
          });
          creditsCharged = false;
        }
        await markGenerationFailed({
          generationId: generation.id,
          errorMessage: "ENGINE_TOOL_NOT_IMPLEMENTED",
        });
        return errorJson(
          "ENGINE_TOOL_NOT_IMPLEMENTED",
          language === "de"
            ? "Dieses Tool wird gerade angebunden. Deine Credits wurden erstattet."
            : "This engine is being connected. Your credits were refunded.",
          503,
          { refunded: true }
        );
      }
      if (
        adapterError instanceof FalGenerationError &&
        adapterError.code === FAL_BALANCE_EXHAUSTED_CODE
      ) {
        return respondProviderBalanceExhausted({
          userId: user.id,
          generationId: generation.id,
          creditsCharged,
          creditsUsed,
          language,
          requestId,
        });
      }
      if (isFalBalanceExhaustedError(adapterError)) {
        return respondProviderBalanceExhausted({
          userId: user.id,
          generationId: generation.id,
          creditsCharged,
          creditsUsed,
          language,
          requestId,
        });
      }
      throw adapterError;
    }

    let publicImageUrl: string | undefined;
    let publicVideoUrl: string | undefined;

    if (adapterResult.imageUrl) {
      publicImageUrl = await uploadImageFromRemoteUrl({
        userId: user.id,
        remoteUrl: adapterResult.imageUrl,
      });
    } else if (adapterResult.videoUrl) {
      publicVideoUrl = await uploadVideoFromRemoteUrl({
        userId: user.id,
        remoteUrl: adapterResult.videoUrl,
      });
    }

    if (
      !publicImageUrl &&
      !publicVideoUrl &&
      !adapterResult.textOutput &&
      !adapterResult.styleId
    ) {
      throw new Error("NO_OUTPUT_URL");
    }

    try {
      await markGenerationCompleted({
        generationId: generation.id,
        imageUrl: publicImageUrl ?? null,
        videoUrl: publicVideoUrl ?? null,
        providerJobId: adapterResult.providerJobId,
      });
    } catch (saveError) {
      if (creditsCharged) {
        await refundChargedGenerationOnce({
          userId: user.id,
          creditsToRefund: creditsUsed,
          generationId: generation.id,
          fallbackSource: `engine_generate_save_failure:${requestId}`,
        });
        creditsCharged = false;
      }
      await markGenerationFailed({
        generationId: generation.id,
        errorMessage:
          saveError instanceof Error ? saveError.message : "Failed to save generation.",
      });
      return errorJson("DB_SAVE_FAILED", "Failed to save generation.", 500, {
        debugReason:
          saveError instanceof Error ? saveError.message : "save failed",
      });
    }

    const { data: creditsAfterRow } = await supabase
      .from("user_credits")
      .select("credits")
      .eq("user_id", user.id)
      .maybeSingle();

    let campaignExpansion = null;
    try {
      campaignExpansion = await expansionPromise;
    } catch {
      /* optional */
    }

    console.info(LOG_PREFIX, {
      requestId,
      generationId,
      modelId,
      provider: model.provider,
      success: true,
    });

    return buildPublicJson({
      success: true,
      requestId,
      generationId: generation.id,
      outputType: adapterResult.outputType,
      imageUrl: publicImageUrl,
      videoUrl: publicVideoUrl,
      audioUrl: adapterResult.audioUrl,
      textOutput: adapterResult.textOutput,
      styleId: adapterResult.styleId,
      meshUrl: adapterResult.meshUrl,
      creditsUsed,
      creditsAfter: creditsAfterRow?.credits ?? null,
      campaignExpansion,
      provider: model.provider,
      model: storedModel,
      modelId: model.id,
      kreaModelId: model.id,
    });
  } catch (error) {
    console.error(LOG_PREFIX, {
      requestId,
      error: error instanceof Error ? error.message.slice(0, 200) : "unknown",
      generationId,
    });

    if (
      userId &&
      (isFalBalanceExhaustedError(error) ||
        (error instanceof FalGenerationError &&
          error.code === FAL_BALANCE_EXHAUSTED_CODE))
    ) {
      return respondProviderBalanceExhausted({
        userId,
        generationId,
        creditsCharged,
        creditsUsed,
        language,
        requestId,
      });
    }

    if (userId && creditsCharged && creditsUsed > 0) {
      try {
        await refundChargedGenerationOnce({
          userId,
          creditsToRefund: creditsUsed,
          generationId,
          fallbackSource: `engine_generate_failure:${requestId}`,
        });
      } catch {
        /* log only */
      }
      creditsCharged = false;
    }

    if (userId && generationId) {
      await markGenerationFailed({
        generationId,
        errorMessage:
          error instanceof Error ? error.message : "Generation failed.",
      });
    }

    if (error instanceof KreaGenerationError) {
      return errorJson(error.code, error.message, error.status);
    }

    const message = error instanceof Error ? error.message : "Generation failed.";
    const code = message.includes("NO_OUTPUT")
      ? "NO_OUTPUT_URL"
      : message.includes("PROVIDER") || message.includes("FAL")
        ? "PROVIDER_FAILED"
        : "UNKNOWN_SERVER_ERROR";

    return errorJson(code, message, 500);
  }
}

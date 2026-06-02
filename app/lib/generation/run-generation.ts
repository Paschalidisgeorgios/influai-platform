/**
 * Unified generation orchestrator — action → model mode → engine → provider.
 */

import { authenticateBearerUser } from "@/app/lib/supabase-admin";
import {
  resolveActionForGeneration,
  ActionResolutionError,
} from "@/app/lib/actions/resolve-action";
import {
  ModelModeResolutionError,
  resolveModelModeForGeneration,
} from "@/app/lib/model-modes/resolve-model-mode";
import { resolveProviderGenerationContext, runProviderGeneration } from "@/app/lib/providers/provider-router";
import { EngineResolutionError } from "@/app/lib/engines/types";
import { generateCampaignExpansion } from "@/lib/intelligence/campaign-expansion-engine";
import { createGenerationJob } from "./create-generation-job";
import { saveGenerationResult } from "./save-generation-result";
import { refundGenerationOnce } from "./refund-generation";
import {
  assertToolCanRun,
  isToolRunBlockedError,
  isToolRunInsufficientCreditsError,
} from "@/app/lib/tools/assert-tool-can-run";
import {
  applyBrandKitToPrompt,
  type BrandKit,
} from "@/lib/brand/brandKit";
import {
  MVP_GENERATION_ACTIONS,
  type GenerateOptions,
  type GenerationRunContext,
  type UnifiedGenerateErrorResponse,
  type UnifiedGenerateRequest,
  type UnifiedGenerateSuccessResponse,
  type UserFacingSourceLabel,
} from "./types";

const LOG_PREFIX = "[unified-generate]";

export type ResolvedGenerationPlan = {
  actionId: string;
  modelModeId?: string;
  engineId: string;
  modelRegistryId: string;
  provider: string;
  workflow: string;
  credits: number;
  outputType: "image" | "video";
  userFacingSourceLabel: UserFacingSourceLabel;
};

function resolveOutputFormatKey(
  options?: GenerateOptions,
  legacy?: string
): string {
  if (legacy?.trim()) return legacy.trim();
  switch (options?.format) {
    case "9:16":
      return "tiktok";
    case "16:9":
      return "youtube_thumbnail";
    case "1:1":
    default:
      return "square";
  }
}

function userFacingLabel(outputType: "image" | "video"): UserFacingSourceLabel {
  return outputType === "video" ? "Video Studio" : "Image Studio";
}

function userErrorMessage(
  code: string,
  language: "en" | "de"
): string {
  const isDe = language === "de";
  switch (code) {
    case "INSUFFICIENT_CREDITS":
      return isDe ? "Nicht genug Credits." : "Not enough credits.";
    case "MISSING_PROMPT":
      return isDe ? "Bitte gib einen Prompt ein." : "Please enter a prompt.";
    case "ACTION_UNKNOWN":
    case "ACTION_UNAVAILABLE":
    case "ACTION_NOT_ACTIVE":
      return isDe
        ? "Diese Aktion ist nicht verfügbar."
        : "This action is not available.";
    case "MODE_LOCKED":
    case "MODE_UNAVAILABLE":
    case "ENGINE_UNAVAILABLE":
    case "ENGINE_NOT_ACTIVE":
      return isDe
        ? "Dieser Erstellungsmodus ist noch nicht aktiv. Es wurden keine Credits abgebucht."
        : "This creation mode is not active yet. No credits were charged.";
    case "ACTION_MISMATCH":
      return isDe
        ? "Dieser Modus passt nicht zur gewählten Aktion."
        : "This mode does not match the selected action.";
    case "ACTIVE_GENERATION_LIMIT":
      return isDe
        ? "Bitte warte, bis laufende Generierungen abgeschlossen sind."
        : "Please wait for in-progress generations to finish.";
    default:
      return isDe
        ? "Generierung fehlgeschlagen. Bitte versuche es erneut."
        : "Generation failed. Please try again.";
  }
}

export function resolveGenerationPlan(input: {
  actionId: string;
  modelModeId?: string;
  language?: "en" | "de";
}): ResolvedGenerationPlan {
  const actionId = input.actionId.trim();
  const language = input.language === "en" ? "en" : "de";

  if (!MVP_GENERATION_ACTIONS.has(actionId)) {
    throw new ActionResolutionError(
      userErrorMessage("ACTION_UNAVAILABLE", language),
      "ACTION_UNAVAILABLE",
      403
    );
  }

  if (actionId === "create_style_variant") {
    const actionResolved = resolveActionForGeneration(actionId, undefined, {
      language,
    });
    const engineId = actionResolved.selectedEngineId;
    if (!engineId) {
      throw new ActionResolutionError(
        userErrorMessage("ACTION_UNAVAILABLE", language),
        "ACTION_NOT_ACTIVE",
        503
      );
    }

    const providerContext = resolveProviderGenerationContext(engineId, {
      language,
    });

    return {
      actionId,
      modelModeId: input.modelModeId?.trim() || undefined,
      engineId,
      modelRegistryId: providerContext.modelRegistryId,
      provider: providerContext.resolved.provider,
      workflow: "create_style_variant",
      credits: actionResolved.credits,
      outputType: "image",
      userFacingSourceLabel: "Image Studio",
    };
  }

  const modelModeId = input.modelModeId?.trim();
  if (!modelModeId) {
    throw new ModelModeResolutionError(
      userErrorMessage("MODE_UNAVAILABLE", language),
      "MODE_UNKNOWN",
      400
    );
  }

  const modeResolved = resolveModelModeForGeneration(
    modelModeId,
    actionId,
    { language }
  );

  const providerContext = resolveProviderGenerationContext(
    modeResolved.engineId,
    { language }
  );

  const outputType =
    modeResolved.outputType === "video" ? "video" : "image";

  return {
    actionId,
    modelModeId,
    engineId: modeResolved.engineId,
    modelRegistryId: providerContext.modelRegistryId,
    provider: providerContext.resolved.provider,
    workflow: modeResolved.modelMode.group,
    credits: modeResolved.credits,
    outputType,
    userFacingSourceLabel: userFacingLabel(outputType),
  };
}

function errorResponse(
  error: string,
  status: number,
  extra?: Partial<UnifiedGenerateErrorResponse>
): Response {
  return Response.json(
    {
      success: false,
      error,
      creditsCharged: extra?.creditsCharged ?? 0,
      refunded: extra?.refunded,
      code: extra?.code,
    } satisfies UnifiedGenerateErrorResponse,
    { status }
  );
}

export async function runUnifiedGeneration(
  req: Request
): Promise<Response> {
  const requestId = crypto.randomUUID();
  const ctx: GenerationRunContext = {
    requestId,
    userId: "",
    generationId: null,
    creditsCharged: 0,
    creditsRefunded: false,
    language: "de",
  };

  try {
    const { supabase, user, error: authError } = await authenticateBearerUser(req);
    if (!user) {
      return errorResponse(authError ?? "Unauthorized.", 401, {
        code: "UNAUTHENTICATED",
      });
    }
    ctx.userId = user.id;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return errorResponse("Invalid request body.", 400, { code: "BODY_INVALID" });
    }

    if (!body || typeof body !== "object") {
      return errorResponse("Invalid request body.", 400, { code: "BODY_INVALID" });
    }

    const record = body as UnifiedGenerateRequest & Record<string, unknown>;
    ctx.language = record.currentLanguage === "en" ? "en" : "de";

    const actionId =
      typeof record.actionId === "string" ? record.actionId.trim() : "";
    const modelModeId =
      typeof record.modelModeId === "string"
        ? record.modelModeId.trim()
        : undefined;
    const rawPrompt = typeof record.prompt === "string" ? record.prompt.trim() : "";

    if (!actionId) {
      return errorResponse("actionId is required.", 400, { code: "BODY_INVALID" });
    }

    if (!rawPrompt) {
      return errorResponse(
        userErrorMessage("MISSING_PROMPT", ctx.language),
        400,
        { code: "MISSING_PROMPT" }
      );
    }

    const { data: brandKitData } = await supabase
      .from("brand_kits")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    const prompt = applyBrandKitToPrompt(
      rawPrompt,
      brandKitData ? (brandKitData as BrandKit) : null
    );

    const options =
      record.options && typeof record.options === "object"
        ? (record.options as GenerateOptions)
        : undefined;

    const outputFormat = resolveOutputFormatKey(
      options,
      typeof record.outputFormat === "string" ? record.outputFormat : undefined
    );

    const plan = resolveGenerationPlan({
      actionId,
      modelModeId,
      language: ctx.language,
    });

    const { data: creditRowBeforeCharge } = await supabase
      .from("user_credits")
      .select("credits")
      .eq("user_id", user.id)
      .maybeSingle();

    try {
      assertToolCanRun({
        actionId: plan.actionId,
        modelModeId: plan.modelModeId,
        engineId: plan.engineId,
        userCreditBalance: creditRowBeforeCharge?.credits ?? 0,
        language: ctx.language,
      });
    } catch (gateError) {
      if (isToolRunBlockedError(gateError)) {
        return errorResponse(gateError.userMessage, gateError.status, {
          code: gateError.code,
          creditsCharged: 0,
        });
      }
      if (isToolRunInsufficientCreditsError(gateError)) {
        return errorResponse(gateError.userMessage, gateError.status, {
          code: "INSUFFICIENT_CREDITS",
          creditsCharged: 0,
        });
      }
      throw gateError;
    }

    const providerInputs: NonNullable<
      Parameters<typeof runProviderGeneration>[0]["inputs"]
    > = {};

    const sourceUrl =
      options?.sourceAssetUrl?.trim() ||
      (typeof record.sourceImageUrl === "string"
        ? record.sourceImageUrl.trim()
        : undefined);

    if (plan.outputType === "video") {
      if (sourceUrl) {
        providerInputs.sourceImageUrl = sourceUrl;
      }
      providerInputs.duration = options?.duration ?? 5;
    }

    const { generationId, creditsCharged } = await createGenerationJob({
      supabase,
      userId: user.id,
      prompt,
      actionId: plan.actionId,
      modelModeId: plan.modelModeId,
      engineId: plan.engineId,
      modelRegistryId: plan.modelRegistryId,
      provider: plan.provider,
      workflow: plan.workflow,
      creditsToCharge: plan.credits,
      outputFormat,
      sourceImageUrl: sourceUrl,
    });

    ctx.generationId = generationId;
    ctx.creditsCharged = creditsCharged;

    const expansionPromise =
      plan.outputType === "image" && plan.actionId === "create_image"
        ? generateCampaignExpansion({ prompt, language: ctx.language })
        : Promise.resolve(null);

    const providerResult = await runProviderGeneration({
      engineId: plan.engineId,
      prompt,
      selectedFormat: outputFormat,
      language: ctx.language,
      inputs: Object.keys(providerInputs).length ? providerInputs : undefined,
    });

    const saved = await saveGenerationResult({
      userId: user.id,
      generationId,
      providerResult,
    });

    let campaignExpansion: unknown = null;
    let campaignExpansionWarning: string | undefined;

    try {
      campaignExpansion = await expansionPromise;
    } catch {
      campaignExpansionWarning =
        ctx.language === "de"
          ? "Kampagnentexte konnten nicht erstellt werden."
          : "Campaign text could not be generated.";
    }

    const { data: creditsAfterRow } = await supabase
      .from("user_credits")
      .select("credits")
      .eq("user_id", user.id)
      .maybeSingle();

    console.info(LOG_PREFIX, {
      requestId,
      generationId,
      actionId: plan.actionId,
      modelModeId: plan.modelModeId,
      outputType: saved.outputType,
      success: true,
    });

    const successBody: UnifiedGenerateSuccessResponse = {
      success: true,
      generationId,
      outputType: saved.outputType,
      assetUrl: saved.assetUrl,
      creditsCharged,
      userFacingSourceLabel: plan.userFacingSourceLabel,
      prompt,
      creditsAfter: creditsAfterRow?.credits ?? null,
      ...(campaignExpansion ? { campaignExpansion } : {}),
      ...(campaignExpansionWarning ? { campaignExpansionWarning } : {}),
    };

    return Response.json(successBody);
  } catch (error) {
    let status = 500;
    let code = "GENERATION_FAILED";
    let message =
      ctx.language === "de"
        ? "Generierung fehlgeschlagen. Bitte versuche es erneut."
        : "Generation failed. Please try again.";
    let refunded = false;

    if (error instanceof ModelModeResolutionError) {
      status = error.status;
      code = error.code;
      message = error.message;
    } else if (error instanceof ActionResolutionError) {
      status = error.status;
      code = error.code;
      message = error.message;
    } else if (error instanceof EngineResolutionError) {
      status = error.status;
      code = error.code;
      message = error.message;
    } else if (error instanceof Error) {
      if (error.message === "INSUFFICIENT_CREDITS") {
        status = 402;
        code = "INSUFFICIENT_CREDITS";
        message = userErrorMessage("INSUFFICIENT_CREDITS", ctx.language);
      } else if (error.message === "ACTIVE_GENERATION_LIMIT") {
        status = 429;
        code = "ACTIVE_GENERATION_LIMIT";
        message = userErrorMessage("ACTIVE_GENERATION_LIMIT", ctx.language);
      } else if (error.message === "NO_OUTPUT_URL") {
        status = 502;
        code = "NO_OUTPUT_URL";
      } else if (error.message.includes("MISSING_")) {
        status = 503;
        code = error.message;
        message = userErrorMessage("ENGINE_UNAVAILABLE", ctx.language);
      }
    }

    if (ctx.creditsCharged > 0 && !ctx.creditsRefunded) {
      refunded = await refundGenerationOnce(
        ctx,
        "unified_generate_failure",
        message
      );
    }

    console.error(LOG_PREFIX, {
      requestId: ctx.requestId,
      generationId: ctx.generationId,
      code,
      message: error instanceof Error ? error.message.slice(0, 200) : code,
      refunded,
    });

    return errorResponse(message, status, {
      creditsCharged: ctx.creditsRefunded ? 0 : ctx.creditsCharged,
      refunded,
      code,
    });
  }
}

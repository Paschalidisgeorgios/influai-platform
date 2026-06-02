/**
 * Universal Krea generate handler — shared by POST /api/krea/generate.
 */

import { authenticateBearerUser } from "@/app/lib/supabase-admin";
import { validateKreaInputs } from "@/lib/ai/krea-input-validation";
import {
  getKreaModelById,
  isKreaModelExecutable,
  resolveKreaStoredModelId,
} from "@/lib/ai/krea-model-registry";
import {
  markGenerationCompleted,
  markGenerationFailed,
  refundUserCredits,
  uploadImageFromRemoteUrl,
  uploadVideoFromRemoteUrl,
} from "@/lib/generation/poc-shared";
import { generateCampaignExpansion } from "@/lib/intelligence/campaign-expansion-engine";
import {
  assertKreaConfigured,
  isKreaProviderEnabled,
} from "@/lib/providers";
import {
  isKreaToolNotImplemented,
  KreaGenerationError,
} from "@/lib/krea/krea-errors";
import { runKreaModel } from "@/lib/krea/krea-generation-router";
import { buildPublicErrorJson, buildPublicJson } from "@/lib/env/runtime-ui";
import { sanitizeUserFacingApiError } from "@/lib/env/user-facing-errors";

const PROVIDER = "krea";
const LOG_PREFIX = "[krea-generate]";

export type KreaGenerateRequestBody = {
  tool?: string;
  kreaModelId: string;
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
  };
};

function errorJson(
  code: string,
  error: string,
  status: number,
  extra?: Record<string, unknown>
) {
  return buildPublicErrorJson({ success: false, code, error, ...extra }, { status });
}

export async function handleKreaGenerate(req: Request): Promise<Response> {
  const requestId = crypto.randomUUID();
  let generationId: string | null = null;
  let userId: string | null = null;
  let creditsUsed = 0;

  try {
    const hasKreaKey = Boolean(process.env.KREA_API_KEY?.trim());
    console.info(LOG_PREFIX, {
      requestId,
      step: "env_check",
      hasKreaKey,
      kreaProviderEnabled: isKreaProviderEnabled(),
      nodeEnv: process.env.NODE_ENV ?? null,
      vercelEnv: process.env.VERCEL_ENV ?? null,
    });

    if (!isKreaProviderEnabled()) {
      return errorJson("MISSING_KREA_API_KEY", "Engine not configured.", 503);
    }

    if (!hasKreaKey) {
      return errorJson("MISSING_KREA_API_KEY", "Engine not configured.", 503);
    }

    try {
      assertKreaConfigured();
    } catch (error) {
      console.error(
        "[PROVIDER ERROR]",
        error instanceof Error ? error.message : error
      );
      return errorJson("MISSING_KREA_API_KEY", "Engine not configured.", 503);
    }

    const { supabase, user, error: authError } = await authenticateBearerUser(req);
    if (!user) {
      return errorJson("UNAUTHENTICATED", authError ?? "Unauthorized.", 401);
    }
    userId = user.id;

    let body: unknown;
    try {
      body = await req.json();
    } catch (error) {
      console.error(
        "[PROVIDER ERROR]",
        error instanceof Error ? error.message : error
      );
      return errorJson("BODY_INVALID", "Invalid request body.", 400);
    }

    if (!body || typeof body !== "object") {
      return errorJson("BODY_INVALID", "Invalid request body.", 400);
    }

    const record = body as KreaGenerateRequestBody;
    const kreaModelId =
      typeof record.kreaModelId === "string" ? record.kreaModelId.trim() : "";
    if (!kreaModelId) {
      return errorJson("BODY_INVALID", "Model is required.", 400);
    }

    const model = getKreaModelById(kreaModelId);
    if (!model) {
      return errorJson("MODEL_NOT_CONFIGURED", "Unknown model.", 400);
    }

    if (!isKreaModelExecutable(model)) {
      return errorJson(
        "MODEL_NOT_CONFIGURED",
        `Model "${model.label}" is not available.`,
        400
      );
    }

    const inputCheck = validateKreaInputs({
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

    creditsUsed = model.credits;

    const { data: creditRow } = await supabase
      .from("user_credits")
      .select("credits")
      .eq("user_id", user.id)
      .maybeSingle();

    const creditsAvailable = creditRow?.credits ?? 0;
    if (creditsAvailable < creditsUsed) {
      return errorJson("INSUFFICIENT_CREDITS", "Not enough credits.", 402, {
        requiredCredits: creditsUsed,
        creditsAvailable,
      });
    }

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

    const workflow = model.workflowKeys?.[0] ?? model.category;
    const storedModel = resolveKreaStoredModelId(model.id, workflow);

    const { data: generation, error: insertError } = await supabase
      .from("generations")
      .insert({
        user_id: user.id,
        prompt: record.prompt ?? "",
        final_prompt: record.prompt ?? "",
        image_url: null,
        video_url: null,
        status: "processing",
        provider: PROVIDER,
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
      await refundUserCredits({
        userId: user.id,
        creditsToRefund: creditsUsed,
        source: "krea_generate_insert_failure",
      });
      return errorJson("DB_SAVE_FAILED", "Failed to create generation.", 500);
    }

    generationId = generation.id;

    const language = record.currentLanguage === "en" ? "en" : "de";
    const expansionPromise =
      model.category === "image" && record.prompt?.trim()
        ? generateCampaignExpansion({ prompt: record.prompt.trim(), language })
        : Promise.resolve(null);

    console.error(
      "[PROVIDER] engineId:",
      kreaModelId,
      "inputs:",
      JSON.stringify(record.inputs ?? {})
    );

    let adapterResult;
    try {
      adapterResult = await runKreaModel({
        model,
        prompt: record.prompt,
        selectedFormat: record.selectedFormat,
        inputs: record.inputs,
      });
    } catch (adapterError) {
      console.error(
        "[PROVIDER ERROR]",
        adapterError instanceof Error ? adapterError.message : adapterError
      );
      if (isKreaToolNotImplemented(adapterError)) {
        await refundUserCredits({
          userId: user.id,
          creditsToRefund: creditsUsed,
          source: "krea_tool_not_implemented",
        });
        await markGenerationFailed({
          generationId: generation.id,
          errorMessage: "KREA_TOOL_NOT_IMPLEMENTED",
        });
        return errorJson(
          "KREA_TOOL_NOT_IMPLEMENTED",
          "This engine is being connected. No credits were charged.",
          503
        );
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

    if (!publicImageUrl && !publicVideoUrl && !adapterResult.textOutput && !adapterResult.styleId) {
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
      console.error(
        "[PROVIDER ERROR]",
        saveError instanceof Error ? saveError.message : saveError
      );
      await refundUserCredits({
        userId: user.id,
        creditsToRefund: creditsUsed,
        source: "krea_generate_save_failure",
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
    } catch (error) {
      console.error(
        "[PROVIDER ERROR]",
        error instanceof Error ? error.message : error
      );
    }

    console.info(LOG_PREFIX, { requestId, generationId, kreaModelId, success: true });

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
      provider: PROVIDER,
      model: storedModel,
      kreaModelId: model.id,
    });
  } catch (error) {
    console.error(
      "[PROVIDER ERROR]",
      error instanceof Error ? error.message : error
    );
    console.error(LOG_PREFIX, {
      requestId,
      error: error instanceof Error ? error.message : error,
      generationId,
    });

    if (userId && creditsUsed > 0) {
      try {
        await refundUserCredits({
          userId,
          creditsToRefund: creditsUsed,
          source: "krea_generate_failure",
        });
      } catch (refundError) {
        console.error(
          "[PROVIDER ERROR]",
          refundError instanceof Error ? refundError.message : refundError
        );
      }
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
      : message.includes("PROVIDER")
        ? "PROVIDER_FAILED"
        : "UNKNOWN_SERVER_ERROR";

    return errorJson(
      code,
      sanitizeUserFacingApiError(message, "Generation failed.", "en"),
      500
    );
  }
}

/**
 * Social Asset Pack — paid render orchestrator.
 *
 * Economic order (must not change):
 * 1. Local preview copy (hooks/captions/score estimate) — no provider calls
 * 2. Engine validation — local routing only
 * 3. Credit balance check (assertToolCanRun)
 * 4. Credit deduction (chargePackCredits)
 * 5. Provider image/video generation — only after step 4
 * 6. Partial refunds via refundPackPortionOnce (one ledger entry per portion)
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveEngineStoredModelId } from "@/lib/ai/model-registry";
import { getEngineModelById } from "@/lib/ai/model-registry";
import {
  assertSufficientCredits,
} from "@/app/lib/generation/create-generation-job";
import { saveGenerationResult } from "@/app/lib/generation/save-generation-result";
import { resolveModelModeForGeneration } from "@/app/lib/model-modes/resolve-model-mode";
import {
  resolveProviderGenerationContext,
  runProviderGeneration,
} from "@/app/lib/providers/provider-router";
import { buildRuleBasedCreativeScore } from "@/lib/intelligence/creative-score-engine";
import { markGenerationFailed } from "@/lib/generation/poc-shared";
import {
  assertSocialAssetPackCreditTotals,
  buildSocialAssetPackPreview,
  getSocialAssetPackTotalCredits,
  packWorkflowKey,
  SOCIAL_ASSET_PACK_FORMAT_SUGGESTIONS,
  SOCIAL_ASSET_PACK_INCLUDED_OUTPUTS,
  SOCIAL_ASSET_PACK_NAME,
  SOCIAL_ASSET_PACK_RENDER_CONFIG,
} from "./social-asset-pack";
import {
  refundPackFullOnce,
  refundPackPortionOnce,
} from "./refund-pack-job";
import {
  assertToolCanRun,
  isToolRunBlockedError,
  isToolRunInsufficientCreditsError,
} from "@/app/lib/tools/assert-tool-can-run";
import type {
  SocialAssetPackAssetRef,
  SocialAssetPackRenderResponse,
  SocialAssetPackRenderStatus,
} from "./types";

export class SocialAssetPackRenderError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status: number = 400
  ) {
    super(message);
    this.name = "SocialAssetPackRenderError";
  }
}

function variantPrompt(base: string, index: number, language: "en" | "de"): string {
  if (index === 0) return base;
  if (index === 1) {
    return language === "de"
      ? `${base}, alternative Komposition für Reels und TikTok, vertikales Social-Format`
      : `${base}, alternate composition for Reels and TikTok, vertical social format`;
  }
  return language === "de"
    ? `${base}, Feed- und Story-taugliche Variante, klares Motiv im Zentrum`
    : `${base}, feed and story friendly variant, clear subject centered`;
}

async function insertPackAssetGeneration(params: {
  supabase: SupabaseClient;
  userId: string;
  packJobId: string;
  slot: string;
  prompt: string;
  provider: string;
  modelRegistryId: string;
  outputFormat?: string;
  socialPlatform?: string;
}): Promise<string> {
  const registryModel = getEngineModelById(params.modelRegistryId);
  const storedModel = registryModel
    ? resolveEngineStoredModelId(registryModel)
    : params.modelRegistryId;

  const { data, error } = await params.supabase
    .from("generations")
    .insert({
      user_id: params.userId,
      prompt: params.prompt,
      final_prompt: params.prompt,
      image_url: null,
      video_url: null,
      status: "processing",
      provider: params.provider,
      model: storedModel,
      workflow: packWorkflowKey(params.packJobId, params.slot),
      credits_used: 0,
      error_message: null,
      started_at: new Date().toISOString(),
      ...(params.outputFormat ? { output_format: params.outputFormat } : {}),
      ...(params.socialPlatform ? { social_platform: params.socialPlatform } : {}),
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    throw new SocialAssetPackRenderError(
      "Could not create pack asset job.",
      "PACK_JOB_INSERT_FAILED",
      500
    );
  }

  return data.id as string;
}

async function chargePackCredits(params: {
  supabase: SupabaseClient;
  userId: string;
  packJobId: string;
  amount: number;
}): Promise<void> {
  await assertSufficientCredits(params.supabase, params.userId, params.amount);

  const { data: success, error } = await params.supabase.rpc(
    "consume_user_credits",
    {
      target_user_id: params.userId,
      credits_to_consume: params.amount,
    }
  );

  if (error || !success) {
    throw new SocialAssetPackRenderError(
      "Not enough credits.",
      "INSUFFICIENT_CREDITS",
      402
    );
  }

  await params.supabase.from("credit_transactions").insert({
    user_id: params.userId,
    amount: -params.amount,
    type: "usage",
    source: `social_asset_pack_render:${params.packJobId}`,
  });
}

type ResolvedPackEngines = {
  imagePlans: Array<{
    modelModeId: string;
    engineId: string;
    provider: string;
    modelRegistryId: string;
    outputFormat: string;
    slot: string;
  }>;
  videoPlan: {
    modelModeId: string;
    engineId: string;
    provider: string;
    modelRegistryId: string;
    slot: string;
  };
};

function validatePackEngines(language: "en" | "de"): ResolvedPackEngines {
  const config = SOCIAL_ASSET_PACK_RENDER_CONFIG;

  if (config.packId !== "social_asset_pack") {
    throw new SocialAssetPackRenderError(
      "Pack is not available.",
      "PACK_NOT_FOUND",
      404
    );
  }

  const imagePlans = config.imageModelModeIds
    .slice(0, config.limits.maxImageVariants)
    .map((modelModeId, index) => {
      const resolved = resolveModelModeForGeneration(
        modelModeId,
        "create_image",
        { language }
      );
      const providerContext = resolveProviderGenerationContext(
        resolved.engineId,
        { language }
      );
      return {
        modelModeId,
        engineId: resolved.engineId,
        provider: providerContext.resolved.provider,
        modelRegistryId: providerContext.modelRegistryId,
        outputFormat:
          config.imageOutputFormats[index] ??
          config.imageOutputFormats[0] ??
          "square",
        slot: `image:${index}`,
      };
    });

  const videoResolved = resolveModelModeForGeneration(
    config.videoModelModeId,
    "create_video",
    { language }
  );
  const videoContext = resolveProviderGenerationContext(
    videoResolved.engineId,
    { language }
  );

  return {
    imagePlans,
    videoPlan: {
      modelModeId: config.videoModelModeId,
      engineId: videoResolved.engineId,
      provider: videoContext.resolved.provider,
      modelRegistryId: videoContext.modelRegistryId,
      slot: "video:0",
    },
  };
}

async function renderImageVariant(params: {
  supabase: SupabaseClient;
  userId: string;
  packJobId: string;
  prompt: string;
  plan: ResolvedPackEngines["imagePlans"][number];
  language: "en" | "de";
  creditsCharged: boolean;
}): Promise<SocialAssetPackAssetRef | null> {
  if (!params.creditsCharged) {
    throw new SocialAssetPackRenderError(
      "Pack credits were not charged before rendering.",
      "CREDITS_NOT_CHARGED",
      500
    );
  }

  const config = SOCIAL_ASSET_PACK_RENDER_CONFIG;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= config.limits.maxRetries; attempt++) {
    let generationId: string | null = null;
    try {
      resolveProviderGenerationContext(params.plan.engineId, {
        language: params.language,
      });

      generationId = await insertPackAssetGeneration({
        supabase: params.supabase,
        userId: params.userId,
        packJobId: params.packJobId,
        slot: params.plan.slot,
        prompt: params.prompt,
        provider: params.plan.provider,
        modelRegistryId: params.plan.modelRegistryId,
        outputFormat: params.plan.outputFormat,
        socialPlatform: params.plan.outputFormat === "tiktok" ? "tiktok" : "instagram",
      });

      const providerResult = await runProviderGeneration({
        engineId: params.plan.engineId,
        prompt: params.prompt,
        selectedFormat: params.plan.outputFormat,
        language: params.language,
      });

      const saved = await saveGenerationResult({
        userId: params.userId,
        generationId,
        providerResult,
      });

      return {
        generationId,
        assetUrl: saved.assetUrl,
        outputType: "image",
        slot: params.plan.slot,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Image render failed");
      if (generationId) {
        await markGenerationFailed({
          generationId,
          errorMessage: lastError.message,
        });
      }
    }
  }

  console.error("[social-asset-pack] image variant failed:", lastError?.message);
  return null;
}

async function renderVideoClip(params: {
  supabase: SupabaseClient;
  userId: string;
  packJobId: string;
  prompt: string;
  plan: ResolvedPackEngines["videoPlan"];
  language: "en" | "de";
  creditsCharged: boolean;
}): Promise<SocialAssetPackAssetRef | null> {
  if (!params.creditsCharged) {
    throw new SocialAssetPackRenderError(
      "Pack credits were not charged before rendering.",
      "CREDITS_NOT_CHARGED",
      500
    );
  }

  const config = SOCIAL_ASSET_PACK_RENDER_CONFIG;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= config.limits.maxRetries; attempt++) {
    let generationId: string | null = null;
    try {
      resolveProviderGenerationContext(params.plan.engineId, {
        language: params.language,
      });

      generationId = await insertPackAssetGeneration({
        supabase: params.supabase,
        userId: params.userId,
        packJobId: params.packJobId,
        slot: params.plan.slot,
        prompt: params.prompt,
        provider: params.plan.provider,
        modelRegistryId: params.plan.modelRegistryId,
        outputFormat: "tiktok",
        socialPlatform: "tiktok",
      });

      const providerResult = await runProviderGeneration({
        engineId: params.plan.engineId,
        prompt: params.prompt,
        selectedFormat: "tiktok",
        language: params.language,
        inputs: { duration: config.videoDurationSeconds },
      });

      const saved = await saveGenerationResult({
        userId: params.userId,
        generationId,
        providerResult,
      });

      return {
        generationId,
        assetUrl: saved.assetUrl,
        outputType: "video",
        slot: params.plan.slot,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Video render failed");
      if (generationId) {
        await markGenerationFailed({
          generationId,
          errorMessage: lastError.message,
        });
      }
    }
  }

  console.error("[social-asset-pack] video clip failed:", lastError?.message);
  return null;
}

export async function renderSocialAssetPack(input: {
  supabase: SupabaseClient;
  userId: string;
  prompt: string;
  language?: "en" | "de";
  improvedPrompt?: string;
}): Promise<SocialAssetPackRenderResponse> {
  const language = input.language === "de" ? "de" : "en";
  const config = SOCIAL_ASSET_PACK_RENDER_CONFIG;
  assertSocialAssetPackCreditTotals();
  const packJobId = crypto.randomUUID();
  const totalCredits = getSocialAssetPackTotalCredits();

  const preview = buildSocialAssetPackPreview({
    prompt: input.prompt,
    language,
  });
  const renderPrompt =
    input.improvedPrompt?.trim() || preview.improvedPrompt;

  const engines = validatePackEngines(language);

  const { data: creditRow } = await input.supabase
    .from("user_credits")
    .select("credits")
    .eq("user_id", input.userId)
    .maybeSingle();

  try {
    assertToolCanRun({
      toolId: "social_asset_pack",
      userCreditBalance: creditRow?.credits ?? 0,
      language,
    });
  } catch (gateError) {
    if (isToolRunBlockedError(gateError)) {
      throw new SocialAssetPackRenderError(
        gateError.userMessage,
        gateError.code,
        gateError.status
      );
    }
    if (isToolRunInsufficientCreditsError(gateError)) {
      throw new SocialAssetPackRenderError(
        gateError.userMessage,
        "INSUFFICIENT_CREDITS",
        gateError.status
      );
    }
    throw gateError;
  }

  await chargePackCredits({
    supabase: input.supabase,
    userId: input.userId,
    packJobId,
    amount: totalCredits,
  });

  /** Provider calls must never run unless credits were validated and deducted. */
  let creditsCharged = true;

  let creditsRefunded = 0;
  const images: SocialAssetPackAssetRef[] = [];
  const videos: SocialAssetPackAssetRef[] = [];
  const failedImageSlots: string[] = [];

  for (const [index, plan] of engines.imagePlans.entries()) {
    const prompt = variantPrompt(renderPrompt, index, language);
    const asset = await renderImageVariant({
      supabase: input.supabase,
      userId: input.userId,
      packJobId,
      prompt,
      plan,
      language,
      creditsCharged,
    });

    if (asset) {
      images.push(asset);
    } else {
      failedImageSlots.push(plan.slot);
      const refunded = await refundPackPortionOnce({
        userId: input.userId,
        packJobId,
        portionKey: plan.slot,
        amount: config.creditAllocation.perImageVariant,
      });
      if (refunded) {
        creditsRefunded += config.creditAllocation.perImageVariant;
      }
    }
  }

  let creativeScore: SocialAssetPackRenderResponse["creativeScore"] = null;
  if (images[0]) {
    const score = buildRuleBasedCreativeScore({
      assetUrl: images[0].assetUrl,
      prompt: renderPrompt,
      outputType: "image",
      language,
    });
    creativeScore = {
      score: score.score,
      rating: score.rating,
      positives: score.positives,
      improvements: score.improvements,
    };
  }

  let videoAsset: SocialAssetPackAssetRef | null = null;
  if (images.length > 0) {
    videoAsset = await renderVideoClip({
      supabase: input.supabase,
      userId: input.userId,
      packJobId,
      prompt: renderPrompt,
      plan: engines.videoPlan,
      language,
      creditsCharged,
    });

    if (videoAsset) {
      videos.push(videoAsset);
    } else {
      const refunded = await refundPackPortionOnce({
        userId: input.userId,
        packJobId,
        portionKey: engines.videoPlan.slot,
        amount: config.creditAllocation.videoClip,
      });
      if (refunded) {
        creditsRefunded += config.creditAllocation.videoClip;
      }
    }
  }

  let status: SocialAssetPackRenderStatus = "completed";
  let message: string | undefined;
  let success = true;

  if (images.length === 0 && videos.length === 0) {
    status = "failed";
    success = false;
    const remaining = totalCredits - creditsRefunded;
    if (remaining > 0) {
      const refunded = await refundPackFullOnce({
        userId: input.userId,
        packJobId,
        amount: remaining,
      });
      if (refunded) creditsRefunded += remaining;
    }
    message =
      language === "de"
        ? "Pack-Rendering fehlgeschlagen. Deine Credits wurden erstattet."
        : "Pack rendering failed. Your credits were refunded.";
  } else if (images.length > 0 && videos.length === 0) {
    status = "partial";
    message =
      language === "de"
        ? "Deine Bilder wurden erstellt. Video-Rendering ist fehlgeschlagen — Video-Credits wurden erstattet."
        : "Your images were created. Video rendering failed and video credits were refunded.";
  } else if (failedImageSlots.length > 0) {
    status = "partial";
    message =
      language === "de"
        ? "Pack teilweise erstellt. Fehlgeschlagene Bild-Varianten wurden erstattet."
        : "Pack partially created. Failed image variants were refunded.";
  } else {
    message =
      language === "de"
        ? "Social Asset Pack in deiner Creator Gallery gespeichert."
        : "Social Asset Pack saved to your Creator Gallery.";
  }

  const { data: creditsRow } = await input.supabase
    .from("user_credits")
    .select("credits")
    .eq("user_id", input.userId)
    .maybeSingle();

  return {
    success,
    packJobId,
    packName: SOCIAL_ASSET_PACK_NAME,
    status,
    creditsCharged: totalCredits,
    creditsRefunded,
    message,
    improvedPrompt: renderPrompt,
    hooks: preview.hooks,
    captions: preview.captions,
    hashtags: preview.hashtags,
    formatSuggestions: [...SOCIAL_ASSET_PACK_FORMAT_SUGGESTIONS],
    includedOutputs: { ...SOCIAL_ASSET_PACK_INCLUDED_OUTPUTS },
    estimatedCredits: totalCredits,
    creativeScore,
    assets: { images, videos },
    creditsAfter: creditsRow?.credits ?? null,
  };
}

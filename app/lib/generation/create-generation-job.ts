/**
 * Create a generation row and consume credits after validation.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveEngineStoredModelId } from "@/lib/ai/model-registry";
import { getEngineModelById } from "@/lib/ai/model-registry";

export type CreateGenerationJobInput = {
  supabase: SupabaseClient;
  userId: string;
  prompt: string;
  actionId: string;
  modelModeId?: string;
  engineId: string;
  modelRegistryId: string;
  provider: string;
  workflow: string;
  creditsToCharge: number;
  outputFormat?: string;
  sourceImageUrl?: string;
};

export type CreateGenerationJobResult = {
  generationId: string;
  creditsCharged: number;
};

const ACTIVE_GENERATION_LIMIT = 2;

export async function assertGenerationCapacity(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  const { count, error } = await supabase
    .from("generations")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "processing");

  if (error) {
    throw new Error("GENERATION_CAPACITY_CHECK_FAILED");
  }

  if ((count ?? 0) >= ACTIVE_GENERATION_LIMIT) {
    throw new Error("ACTIVE_GENERATION_LIMIT");
  }
}

export async function assertSufficientCredits(
  supabase: SupabaseClient,
  userId: string,
  requiredCredits: number
): Promise<number> {
  const { data, error } = await supabase
    .from("user_credits")
    .select("credits")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error("CREDIT_QUERY_FAILED");
  }

  const balance = data?.credits ?? 0;
  if (balance < requiredCredits) {
    throw new Error("INSUFFICIENT_CREDITS");
  }

  return balance;
}

export async function createGenerationJob(
  input: CreateGenerationJobInput
): Promise<CreateGenerationJobResult> {
  const {
    supabase,
    userId,
    prompt,
    actionId,
    modelModeId,
    engineId,
    modelRegistryId,
    provider,
    workflow,
    creditsToCharge,
    outputFormat,
    sourceImageUrl,
  } = input;

  await assertGenerationCapacity(supabase, userId);
  await assertSufficientCredits(supabase, userId, creditsToCharge);

  const { data: creditSuccess, error: creditError } = await supabase.rpc(
    "consume_user_credits",
    {
      target_user_id: userId,
      credits_to_consume: creditsToCharge,
    }
  );

  if (creditError || !creditSuccess) {
    throw new Error("INSUFFICIENT_CREDITS");
  }

  const registryModel = getEngineModelById(modelRegistryId);
  const storedModel = registryModel
    ? resolveEngineStoredModelId(registryModel)
    : engineId;

  const workflowKey = modelModeId
    ? `${actionId}:${modelModeId}`
    : actionId;

  const { data: generation, error: insertError } = await supabase
    .from("generations")
    .insert({
      user_id: userId,
      prompt,
      final_prompt: prompt,
      image_url: null,
      video_url: null,
      status: "processing",
      provider,
      model: storedModel,
      workflow: workflowKey,
      credits_used: creditsToCharge,
      error_message: null,
      started_at: new Date().toISOString(),
      ...(outputFormat ? { output_format: outputFormat } : {}),
      ...(sourceImageUrl ? { source_image_url: sourceImageUrl } : {}),
    })
    .select("id")
    .single();

  if (insertError || !generation) {
    await supabase.rpc("refund_user_credits", {
      target_user_id: userId,
      credits_to_refund: creditsToCharge,
    });
    throw new Error("GENERATION_INSERT_FAILED");
  }

  await supabase.from("credit_transactions").insert({
    user_id: userId,
    amount: -creditsToCharge,
    type: "usage",
    source: `unified_generate_${actionId}`,
  });

  return {
    generationId: generation.id,
    creditsCharged: creditsToCharge,
  };
}

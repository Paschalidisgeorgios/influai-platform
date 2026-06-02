/**
 * Provider-neutral generation router — server-side only.
 * Action Registry → Engine Registry → Krea or fal.ai.
 */

import { normalizeToLaunchEngineId } from "@/app/lib/engines/catalog";
import { resolveEngineForGeneration } from "@/app/lib/engines/resolve-engine";
import type { ResolvedEngineForGeneration } from "@/app/lib/engines/types";
import {
  assertFalEngineRunnable,
  FalRouterError,
  runFalProviderGeneration,
} from "@/app/lib/providers/fal/fal-router";
import { getEngineModelById, isEngineModelExecutable } from "@/lib/ai/model-registry";
import {
  runEngineModel,
  type EngineRunInput,
  type EngineRunOutput,
} from "@/lib/ai/provider-router";
import {
  KreaRouterError,
  runKreaProviderGeneration,
} from "@/app/lib/providers/krea/krea-router";
import {
  assertFalConfigured,
  assertKreaConfigured,
  isFalProviderEnabled,
  isKreaProviderEnabled,
} from "@/lib/providers/flags";

export type { EngineRunOutput } from "@/lib/ai/provider-router";

export type ProviderGenerationInput = {
  engineId: string;
  prompt?: string;
  selectedFormat?: string;
  language?: "en" | "de";
  inputs?: EngineRunInput["inputs"];
};

export type ProviderGenerationContext = {
  resolved: ResolvedEngineForGeneration;
  modelRegistryId: string;
};

function assertProviderReady(
  provider: ResolvedEngineForGeneration["provider"]
): void {
  if (provider === "krea") {
    if (!isKreaProviderEnabled()) throw new Error("MISSING_KREA_API_KEY");
    assertKreaConfigured();
    return;
  }
  if (provider === "fal") {
    if (!isFalProviderEnabled()) throw new Error("MISSING_FAL_KEY");
    assertFalConfigured();
  }
}

/**
 * Validates engine availability and returns routing context — no provider calls.
 */
export function resolveProviderGenerationContext(
  engineId: string,
  options?: { language?: "en" | "de" }
): ProviderGenerationContext {
  const launchId = normalizeToLaunchEngineId(engineId);
  const resolved = resolveEngineForGeneration(launchId, options);
  assertProviderReady(resolved.provider);

  if (resolved.provider === "krea") {
    const registryId = resolved.kreaRegistryId;
    if (!registryId) {
      throw new Error("ENGINE_NOT_CONFIGURED");
    }
    const kreaModel = getEngineModelById(registryId);
    if (!kreaModel || !isEngineModelExecutable(kreaModel)) {
      throw new Error("ENGINE_NOT_CONFIGURED");
    }
    return { resolved, modelRegistryId: registryId };
  }

  if (resolved.provider === "fal") {
    assertFalEngineRunnable(launchId);
    const falId = resolved.falRegistryId ?? launchId;
    const falModel = getEngineModelById(falId);
    if (!falModel || !isEngineModelExecutable(falModel)) {
      throw new Error("ENGINE_NOT_CONFIGURED");
    }
    return { resolved, modelRegistryId: falId };
  }

  throw new Error("PROVIDER_NOT_SUPPORTED");
}

/**
 * Runs generation through the validated provider path.
 * Image modes → Krea via internal router; active video → fal (server-side only).
 * Caller must charge credits only after validation and refund once on failure.
 */
export async function runProviderGeneration(
  input: ProviderGenerationInput
): Promise<EngineRunOutput & { context: ProviderGenerationContext }> {
  const context = resolveProviderGenerationContext(input.engineId, {
    language: input.language,
  });

  const model = getEngineModelById(context.modelRegistryId);
  if (!model) {
    throw new Error("ENGINE_NOT_CONFIGURED");
  }

  let result: EngineRunOutput;
  if (context.resolved.provider === "fal") {
    try {
      result = await runFalProviderGeneration({
        engineId: input.engineId,
        prompt: input.prompt,
        selectedFormat: input.selectedFormat,
        inputs: input.inputs,
      });
    } catch (error) {
      if (error instanceof FalRouterError) {
        throw new Error(error.message);
      }
      throw error;
    }
  } else if (context.resolved.provider === "krea" || context.resolved.provider === "internal") {
    try {
      result = await runKreaProviderGeneration({
        engineId: input.engineId,
        prompt: input.prompt,
        selectedFormat: input.selectedFormat,
        inputs: input.inputs,
      });
    } catch (error) {
      if (error instanceof KreaRouterError) {
        throw new Error(error.message);
      }
      throw error;
    }
  } else {
    result = await runEngineModel({
      model,
      prompt: input.prompt,
      selectedFormat: input.selectedFormat,
      inputs: input.inputs,
    });
  }

  return { ...result, context };
}

export function getResolvedEngineCredits(engineId: string): number {
  const launchId = normalizeToLaunchEngineId(engineId);
  return resolveEngineForGeneration(launchId).credits;
}

export function getResolvedEngineRoute(
  engineId: string
): ResolvedEngineForGeneration["route"] {
  const launchId = normalizeToLaunchEngineId(engineId);
  return resolveEngineForGeneration(launchId).route;
}

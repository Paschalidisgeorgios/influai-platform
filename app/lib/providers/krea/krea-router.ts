/**
 * Krea provider router — routes only validated Krea launch engines.
 * Server-side only; never expose API keys or model paths to clients.
 */

import { normalizeToLaunchEngineId, isEngineActive } from "@/app/lib/engines/catalog";
import { resolveEngineForGeneration } from "@/app/lib/engines/resolve-engine";
import { getEngineModelById, isEngineModelExecutable } from "@/lib/ai/model-registry";
import {
  runEngineModel,
  type EngineRunInput,
  type EngineRunOutput,
} from "@/lib/ai/provider-router";
import {
  assertKreaConfigured,
  isKreaProviderEnabled,
} from "@/lib/providers/flags";

export class KreaRouterError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "KREA_PROVIDER_DISABLED"
      | "KREA_ENGINE_UNAVAILABLE"
      | "KREA_ENGINE_NOT_CONFIGURED"
  ) {
    super(message);
    this.name = "KreaRouterError";
  }
}

const USER_UNAVAILABLE =
  "This creation mode is not available yet. No credits were charged.";

export function assertKreaEngineRunnable(engineId: string): void {
  if (!isKreaProviderEnabled()) {
    throw new KreaRouterError(
      "Engine is not configured on the server.",
      "KREA_PROVIDER_DISABLED"
    );
  }

  try {
    assertKreaConfigured();
  } catch {
    throw new KreaRouterError(
      "Engine is not configured on the server.",
      "KREA_PROVIDER_DISABLED"
    );
  }

  const launchId = normalizeToLaunchEngineId(engineId);
  const resolved = resolveEngineForGeneration(launchId);

  if (resolved.provider !== "krea" && resolved.provider !== "internal") {
    throw new KreaRouterError(USER_UNAVAILABLE, "KREA_ENGINE_UNAVAILABLE");
  }

  if (!isEngineActive(resolved.engine)) {
    throw new KreaRouterError(USER_UNAVAILABLE, "KREA_ENGINE_UNAVAILABLE");
  }

  const registryId = resolved.kreaRegistryId;
  if (!registryId) {
    throw new KreaRouterError(USER_UNAVAILABLE, "KREA_ENGINE_NOT_CONFIGURED");
  }

  const model = getEngineModelById(registryId);
  if (!model || !isEngineModelExecutable(model)) {
    throw new KreaRouterError(USER_UNAVAILABLE, "KREA_ENGINE_NOT_CONFIGURED");
  }
}

export function resolveKreaLegacyModelId(engineId: string): string {
  assertKreaEngineRunnable(engineId);
  const launchId = normalizeToLaunchEngineId(engineId);
  const resolved = resolveEngineForGeneration(launchId);
  const registryId = resolved.kreaRegistryId;
  if (!registryId) {
    throw new KreaRouterError(USER_UNAVAILABLE, "KREA_ENGINE_NOT_CONFIGURED");
  }
  return registryId;
}

export type KreaProviderGenerationInput = Omit<EngineRunInput, "model"> & {
  engineId: string;
};

export async function runKreaProviderGeneration(
  input: KreaProviderGenerationInput
): Promise<EngineRunOutput> {
  const legacyId = resolveKreaLegacyModelId(input.engineId);
  const model = getEngineModelById(legacyId);
  if (!model) {
    throw new KreaRouterError(USER_UNAVAILABLE, "KREA_ENGINE_NOT_CONFIGURED");
  }

  return runEngineModel({
    model,
    prompt: input.prompt,
    selectedFormat: input.selectedFormat,
    inputs: input.inputs,
  });
}

export function isKreaGenerationHandlerRegistered(engineId: string): boolean {
  try {
    assertKreaEngineRunnable(engineId);
    return true;
  } catch {
    return false;
  }
}

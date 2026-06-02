/**
 * fal.ai provider router — routes only active, validated studio engines.
 * Never consumes credits for inactive engines.
 */

import {
  FAL_MVP_GENERATION_HANDLERS,
  getFalStudioEngineById,
} from "@/app/lib/engines/fal-catalog";
import { resolveFalStudioEngineId } from "@/app/lib/providers/fal/fal-model-map";
import { getEngineModelById } from "@/lib/ai/model-registry";
import {
  runEngineModel,
  type EngineRunInput,
  type EngineRunOutput,
} from "@/lib/ai/provider-router";
import {
  assertFalConfigured,
  isFalProviderEnabled,
} from "@/lib/providers/flags";

export class FalRouterError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "FAL_ENGINE_UNAVAILABLE"
      | "FAL_ENGINE_NOT_CONFIGURED"
      | "FAL_PROVIDER_DISABLED"
      | "FAL_NO_HANDLER"
  ) {
    super(message);
    this.name = "FalRouterError";
  }
}

const USER_UNAVAILABLE =
  "This creation mode is not available yet. No credits were charged.";

export function assertFalEngineRunnable(studioEngineId: string): void {
  if (!isFalProviderEnabled()) {
    throw new FalRouterError(
      "Engine is not configured on the server.",
      "FAL_PROVIDER_DISABLED"
    );
  }

  try {
    assertFalConfigured();
  } catch {
    throw new FalRouterError(
      "Engine is not configured on the server.",
      "FAL_PROVIDER_DISABLED"
    );
  }

  const id = resolveFalStudioEngineId(studioEngineId);
  const entry = getFalStudioEngineById(id);

  if (!entry) {
    throw new FalRouterError(USER_UNAVAILABLE, "FAL_ENGINE_UNAVAILABLE");
  }

  if (!entry.canRunGeneration || entry.status !== "active") {
    throw new FalRouterError(USER_UNAVAILABLE, "FAL_ENGINE_UNAVAILABLE");
  }

  if (!FAL_MVP_GENERATION_HANDLERS.has(entry.id)) {
    throw new FalRouterError(USER_UNAVAILABLE, "FAL_NO_HANDLER");
  }

  const legacyId = entry.falRegistryId;
  if (!legacyId) {
    throw new FalRouterError(USER_UNAVAILABLE, "FAL_ENGINE_NOT_CONFIGURED");
  }

  const model = getEngineModelById(legacyId);
  if (!model || model.provider !== "fal") {
    throw new FalRouterError(USER_UNAVAILABLE, "FAL_ENGINE_NOT_CONFIGURED");
  }
}

export function resolveFalLegacyModelId(studioEngineId: string): string {
  assertFalEngineRunnable(studioEngineId);
  const entry = getFalStudioEngineById(resolveFalStudioEngineId(studioEngineId));
  const legacyId = entry?.falRegistryId;
  if (!legacyId) {
    throw new FalRouterError(USER_UNAVAILABLE, "FAL_ENGINE_NOT_CONFIGURED");
  }
  return legacyId;
}

export type FalProviderGenerationInput = Omit<EngineRunInput, "model"> & {
  engineId: string;
};

export async function runFalProviderGeneration(
  input: FalProviderGenerationInput
): Promise<EngineRunOutput> {
  const studioId = resolveFalStudioEngineId(input.engineId);
  assertFalEngineRunnable(studioId);

  const legacyId = resolveFalLegacyModelId(studioId);
  const model = getEngineModelById(legacyId);
  if (!model) {
    throw new FalRouterError(USER_UNAVAILABLE, "FAL_ENGINE_NOT_CONFIGURED");
  }

  return runEngineModel({
    model,
    prompt: input.prompt,
    selectedFormat: input.selectedFormat,
    inputs: input.inputs,
  });
}

export function isFalGenerationHandlerRegistered(studioEngineId: string): boolean {
  const id = resolveFalStudioEngineId(studioEngineId);
  return FAL_MVP_GENERATION_HANDLERS.has(id);
}

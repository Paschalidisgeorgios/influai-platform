/**
 * Central credit cost resolution for model modes and engines.
 */

import { resolveEngineCredits } from "@/app/lib/engines/resolve-engine";
import { getModelModeById } from "@/app/lib/model-modes/model-modes";
import type { ModelMode } from "@/app/lib/model-modes/types";

export function resolveCreditCostForModelMode(modelModeId: string): number {
  const mode = getModelModeById(modelModeId);
  if (!mode) return 0;
  return resolveCreditCostFromMode(mode);
}

export function resolveCreditCostFromMode(mode: ModelMode): number {
  if (typeof mode.creditCost === "number") return mode.creditCost;
  if (mode.resolveCreditsFromEngine && mode.engineId) {
    return resolveEngineCredits(mode.engineId);
  }
  return 0;
}

export function resolveCreditCostForEngine(engineId: string): number {
  return resolveEngineCredits(engineId);
}

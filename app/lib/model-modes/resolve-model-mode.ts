/**
 * Server-side model mode resolution — validates before credits are consumed.
 */

import { getActionById } from "@/app/lib/actions/action-registry";
import type { ActionDefinition } from "@/app/lib/actions/types";
import { resolveCreditCostFromMode } from "@/app/lib/billing/credit-costs";
import { getEngineById } from "@/app/lib/engines/catalog";
import type { EngineCatalogEntry } from "@/app/lib/engines/types";
import { resolveEngineForGeneration } from "@/app/lib/engines/resolve-engine";
import {
  getModelModeById,
} from "@/app/lib/model-modes/model-modes";
import { getApiModelIdForEngine } from "@/app/lib/model-modes/get-visible-model-modes";
import type {
  AccessTier,
  ModelMode,
  ModelModeOutputType,
  ModelModeResolutionErrorCode,
  ResolvedModelModeGeneration,
  UserModelModeContext,
} from "./types";
import { ModelModeResolutionError } from "./types";

export { ModelModeResolutionError } from "./types";

function userMessage(
  code: ModelModeResolutionErrorCode,
  language: "en" | "de" = "en"
): string {
  const isDe = language === "de";
  switch (code) {
    case "MODE_UNKNOWN":
      return isDe
        ? "Dieser Erstellungsmodus ist nicht verfügbar."
        : "This creation mode is not available.";
    case "MODE_HIDDEN":
      return isDe
        ? "Dieser Modus ist nicht sichtbar."
        : "This mode is not visible.";
    case "MODE_LOCKED":
      return isDe ? "Demnächst verfügbar." : "Coming soon.";
    case "MODE_UNAVAILABLE":
      return isDe
        ? "Dieser Modus ist vorübergehend nicht verfügbar."
        : "This mode is temporarily unavailable.";
    case "ACTION_MISMATCH":
      return isDe
        ? "Dieser Modus passt nicht zur gewählten Aktion."
        : "This mode does not match the selected action.";
    case "ENGINE_MISSING":
      return isDe
        ? "Dieser Modus ist noch nicht verfügbar."
        : "This mode is not available yet.";
    case "ENGINE_UNAVAILABLE":
      return isDe
        ? "Dieser Erstellungsmodus ist vorübergehend nicht verfügbar. Es wurden keine Credits abgebucht."
        : "This creation mode is temporarily unavailable. No credits were charged.";
    default:
      return isDe ? "Generierung nicht möglich." : "Generation is not possible.";
  }
}

export function resolveModelModeForGeneration(
  modelModeId: string,
  actionId: string,
  userContext?: UserModelModeContext
): ResolvedModelModeGeneration {
  const language = userContext?.language === "de" ? "de" : "en";
  const mode = getModelModeById(modelModeId);

  if (!mode) {
    throw new ModelModeResolutionError(
      userMessage("MODE_UNKNOWN", language),
      "MODE_UNKNOWN",
      400
    );
  }

  if (!mode.canShowToUser) {
    throw new ModelModeResolutionError(
      userMessage("MODE_HIDDEN", language),
      "MODE_HIDDEN",
      403
    );
  }

  if (mode.status === "locked" || !mode.canRunGeneration) {
    throw new ModelModeResolutionError(
      mode.comingSoonReason ??
        userMessage("MODE_LOCKED", language),
      "MODE_LOCKED",
      403
    );
  }

  if (mode.status === "unavailable") {
    throw new ModelModeResolutionError(
      userMessage("MODE_UNAVAILABLE", language),
      "MODE_UNAVAILABLE",
      503
    );
  }

  if (mode.status !== "active") {
    throw new ModelModeResolutionError(
      userMessage("MODE_UNAVAILABLE", language),
      "MODE_UNAVAILABLE",
      503
    );
  }

  if (mode.actionId !== actionId.trim()) {
    throw new ModelModeResolutionError(
      userMessage("ACTION_MISMATCH", language),
      "ACTION_MISMATCH",
      400
    );
  }

  const action = getActionById(actionId);
  if (!action) {
    throw new ModelModeResolutionError(
      userMessage("ACTION_MISMATCH", language),
      "ACTION_MISMATCH",
      400
    );
  }

  if (!mode.engineId?.trim()) {
    throw new ModelModeResolutionError(
      userMessage("ENGINE_MISSING", language),
      "ENGINE_MISSING",
      503
    );
  }

  const engineCatalog = getEngineById(mode.engineId);
  if (!engineCatalog) {
    throw new ModelModeResolutionError(
      userMessage("ENGINE_MISSING", language),
      "ENGINE_MISSING",
      503
    );
  }

  let engineResolved;
  try {
    engineResolved = resolveEngineForGeneration(mode.engineId, { language });
  } catch {
    throw new ModelModeResolutionError(
      userMessage("ENGINE_UNAVAILABLE", language),
      "ENGINE_UNAVAILABLE",
      503
    );
  }

  const credits = resolveCreditCostFromMode(mode);
  const apiModelId = getApiModelIdForEngine(engineResolved.resolvedEngineId);

  return {
    modelMode: mode,
    action,
    engine: engineCatalog,
    actionId: action.id,
    engineId: engineResolved.resolvedEngineId,
    apiModelId,
    credits,
    outputType: mode.outputType,
    accessTier: mode.accessTier,
    isPremium: mode.isPremium,
  };
}

/** Client-safe preview — no env checks; for UI cost labels only. */
export function previewModelModeCredits(
  modelModeId: string,
  actionId: string
): number | null {
  const mode = getModelModeById(modelModeId);
  if (!mode || mode.actionId !== actionId || !mode.canRunGeneration) return null;
  return resolveCreditCostFromMode(mode);
}

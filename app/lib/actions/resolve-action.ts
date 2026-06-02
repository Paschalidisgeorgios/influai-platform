/**
 * Action resolution for generation — validates action + engine before credits.
 */

import {
  getActionById,
  getAllActions,
  isActionActive,
} from "./action-registry";
import type {
  ActionDefinition,
  ActionId,
  ClientActionView,
  ResolvedActionGeneration,
} from "./types";
import { ActionResolutionError as ActionResolutionErrorClass } from "./types";
import {
  getMinCreditsForEngineIds,
  resolveEngineCredits,
  resolveEngineForGeneration,
} from "@/app/lib/engines/resolve-engine";

export { ActionResolutionError } from "./types";

import { MVP_GENERATION_ACTIONS } from "@/app/lib/generation/types";

/** MVP actions routed through POST /api/generate */
export function isUnifiedMvpGenerationAction(actionId: string): boolean {
  return MVP_GENERATION_ACTIONS.has(actionId.trim());
}

function resolveActionMinCredits(action: ActionDefinition): number {
  if (!isActionActive(action)) return 0;
  if (typeof action.cost === "number") return action.cost;
  if (action.defaultEngine) return resolveEngineCredits(action.defaultEngine);
  if (action.allowedEngines?.length) {
    return getMinCreditsForEngineIds(action.allowedEngines);
  }
  return 0;
}

function toClientView(action: ActionDefinition): ClientActionView {
  return {
    id: action.id,
    label: action.label,
    outputType: action.outputType,
    minCredits: resolveActionMinCredits(action),
    defaultEngineId: action.defaultEngine,
  };
}

export function getActiveUserActions(): ClientActionView[] {
  return getAllActions()
    .filter(isActionActive)
    .map(toClientView);
}

export function getActionByIdPublic(actionId: string): ActionDefinition | null {
  return getActionById(actionId);
}

function pickEngineId(
  action: ActionDefinition,
  optionalEngineId?: string
): string | null {
  if (
    typeof action.cost === "number" &&
    !action.defaultEngine &&
    !action.allowedEngines
  ) {
    return null;
  }

  const requested = optionalEngineId?.trim();
  if (requested) {
    if (action.allowedEngines && !action.allowedEngines.includes(requested)) {
      throw new ActionResolutionErrorClass(
        `Engine is not allowed for "${action.label}".`,
        "ENGINE_NOT_ALLOWED"
      );
    }
    return requested;
  }

  if (action.defaultEngine) return action.defaultEngine;
  if (action.allowedEngines?.length === 1) return action.allowedEngines[0];
  return null;
}

export function resolveActionForGeneration(
  actionId: string,
  optionalEngineId?: string,
  options?: { language?: "en" | "de" }
): ResolvedActionGeneration {
  const language = options?.language === "de" ? "de" : "en";
  const isDe = language === "de";
  const action = getActionById(actionId);
  if (!action) {
    throw new ActionResolutionErrorClass(
      "Unknown action.",
      "ACTION_UNKNOWN",
      400
    );
  }

  if (action.status === "disabled" || action.status === "unavailable") {
    throw new ActionResolutionErrorClass(
      `"${action.label}" is not available.`,
      "ACTION_UNAVAILABLE",
      403
    );
  }

  if (action.status === "locked") {
    throw new ActionResolutionErrorClass(
      isDe ? "Demnächst verfügbar." : "Coming soon.",
      "ACTION_NOT_ACTIVE",
      403
    );
  }

  if (action.status === "mapped_but_unvalidated") {
    throw new ActionResolutionErrorClass(
      isDe ? "Demnächst verfügbar." : "Coming soon.",
      "ACTION_NOT_ACTIVE",
      403
    );
  }

  if (!isActionActive(action)) {
    throw new ActionResolutionErrorClass(
      isDe ? "Dieser Modus ist nicht verfügbar." : "This mode is not available.",
      "ACTION_NOT_ACTIVE",
      403
    );
  }

  const selectedEngineId = pickEngineId(action, optionalEngineId);

  if (typeof action.cost === "number" && selectedEngineId === null) {
    return {
      action,
      selectedEngineId: null,
      provider: "internal",
      model: null,
      credits: action.cost,
      outputType: action.outputType,
      runtime: { route: "internal" },
    };
  }

  if (!selectedEngineId) {
    throw new ActionResolutionErrorClass(
      isDe ? "Bitte wähle einen Render-Modus." : "Please select a render mode.",
      "ENGINE_NOT_ALLOWED",
      400
    );
  }

  let engineResolved;
  try {
    engineResolved = resolveEngineForGeneration(selectedEngineId, options);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : `"${action.label}" is temporarily unavailable.`;
    throw new ActionResolutionErrorClass(message, "ENGINE_UNAVAILABLE", 503);
  }

  return {
    action,
    selectedEngineId,
    provider: engineResolved.provider,
    model: engineResolved.model,
    credits: engineResolved.credits,
    outputType: action.outputType,
    runtime: {
      route: engineResolved.route,
      kreaRegistryId: engineResolved.kreaRegistryId,
      falRegistryModelId: engineResolved.falRegistryId,
      resolvedEngineId: engineResolved.resolvedEngineId,
    },
  };
}

export function getAdminActionMetadata(): Array<
  ActionDefinition & { minCredits: number; clientVisible: boolean }
> {
  return getAllActions().map((action) => ({
    ...action,
    minCredits: resolveActionMinCredits(action),
    clientVisible: isActionActive(action),
  }));
}

export type { ActionId };

/** User-facing canvas action labels — no provider or model names */
const CANVAS_ACTION_LABELS: Record<string, { en: string; de: string }> = {
  check_creative_score: {
    en: "Check Creative Score",
    de: "Creative Score prüfen",
  },
  create_style_variant: {
    en: "Create Variant",
    de: "Variante erstellen",
  },
  export_asset: {
    en: "Export",
    de: "Export",
  },
};

const IMAGE_CANVAS_ACTION_IDS: ActionId[] = [
  "check_creative_score",
  "create_style_variant",
  "export_asset",
];

const VIDEO_CANVAS_ACTION_IDS: ActionId[] = [
  "check_creative_score",
  "export_asset",
];

export type ClientCanvasActionView = {
  id: ActionId;
  label: string;
  creditCost: number;
};

export function getCanvasActionLabel(
  actionId: ActionId,
  language: "en" | "de" = "en"
): string {
  const entry = CANVAS_ACTION_LABELS[actionId];
  if (!entry) return actionId;
  return language === "de" ? entry.de : entry.en;
}

/** Client-safe list of active canvas actions for an asset type — never includes inactive actions */
export function getCanvasActionsForAsset(
  outputType: "image" | "video",
  language: "en" | "de" = "en"
): ClientCanvasActionView[] {
  const ids =
    outputType === "image" ? IMAGE_CANVAS_ACTION_IDS : VIDEO_CANVAS_ACTION_IDS;

  return ids
    .map((id) => getActionById(id))
    .filter((action): action is ActionDefinition => !!action && isActionActive(action))
    .map((action) => ({
      id: action.id,
      label: getCanvasActionLabel(action.id, language),
      creditCost: resolveActionMinCredits(action),
    }));
}

export const DEFAULT_STYLE_VARIANT_INSTRUCTION =
  "clean premium social ad style, stronger lighting, clearer subject focus";

/**
 * Runtime engine resolution — validates catalog entries before credits are consumed.
 */

import {
  getEngineById,
  KREA_REGISTRY_TO_ENGINE_ID,
  normalizeToLaunchEngineId,
} from "./catalog";
import type {
  EngineCatalogEntry,
  EngineResolutionErrorCode,
  ResolvedEngineForGeneration,
} from "./types";
import { EngineResolutionError } from "./types";
import { resolveSmartAutoPilotRegistryId } from "@/lib/ai/krea-image-studio-models";
import {
  areServerFlagsSatisfied,
  getEngineForServerGeneration,
} from "./routing";
import { isFalProviderEnabled, isKreaProviderEnabled } from "@/lib/providers/flags";

export { EngineResolutionError } from "./types";

export type RuntimeEngineId = string;

/** @deprecated Use ResolvedEngineForGeneration */
export type ResolvedRuntimeEngine = {
  engineId: string;
  label: string;
  provider: "krea" | "fal" | "internal" | "openai" | "router";
  model: string | null;
  credits: number;
  available: boolean;
  unavailableReason?: string;
  kreaRegistryId?: string;
  falRegistryModelId?: string;
  catalogEngineKey?: string;
  route?: string;
};

const USER_UNAVAILABLE_EN =
  "This creation mode is temporarily unavailable. No credits were charged.";
const USER_UNAVAILABLE_DE =
  "Dieser Erstellungsmodus ist vorübergehend nicht verfügbar. Es wurden keine Credits abgebucht.";

function envConfigured(name: string): boolean {
  if (name === "FAL_KEY") {
    return Boolean(process.env.FAL_KEY?.trim()) && isFalProviderEnabled();
  }
  if (name === "KREA_API_KEY" || name === "ENABLE_KREA_PROVIDER") {
    return isKreaProviderEnabled();
  }
  return Boolean(process.env[name]?.trim());
}

function serverEnvReady(entry: EngineCatalogEntry): boolean {
  const required = entry.requiresServerEnv ?? [];
  if (required.length === 0) {
    if (entry.provider === "krea") return isKreaProviderEnabled();
    if (entry.provider === "fal") {
      return Boolean(process.env.FAL_KEY?.trim()) && isFalProviderEnabled();
    }
    return true;
  }
  return required.every(envConfigured);
}

function userMessageForStatus(
  status: EngineCatalogEntry["status"],
  language: "en" | "de" = "en"
): string {
  const isDe = language === "de";
  switch (status) {
    case "unavailable_plan_limited":
      return isDe
        ? "Dieser Modus ist mit deinem aktuellen Plan nicht verfügbar."
        : "This mode is not available on your current plan.";
    case "validation_blocked_insufficient_balance":
      return isDe
        ? "Dieser Modus ist vorübergehend nicht verfügbar. Es wurden keine Credits abgebucht."
        : "This mode is temporarily unavailable. No credits were charged.";
    case "mapped_but_unvalidated":
    case "failed_validation":
    case "disabled":
      return isDe ? USER_UNAVAILABLE_DE : USER_UNAVAILABLE_EN;
    default:
      return isDe ? USER_UNAVAILABLE_DE : USER_UNAVAILABLE_EN;
  }
}

function resolveSmartAutoPilotTarget(): EngineCatalogEntry {
  const registryId = resolveSmartAutoPilotRegistryId();
  const engineId =
    KREA_REGISTRY_TO_ENGINE_ID[registryId] ?? "krea_flux_fast_draft";
  const target = getEngineById(engineId);
  if (!target || target.status !== "active") {
    return getEngineById("krea_flux_fast_draft")!;
  }
  return target;
}

function inferRoute(
  entry: EngineCatalogEntry,
  resolved: EngineCatalogEntry
): ResolvedEngineForGeneration["route"] {
  if (resolved.provider === "krea" && resolved.outputType === "image") {
    return "krea_image";
  }
  if (resolved.provider === "fal") return "engine_generate";
  return "internal";
}

function buildResolved(
  entry: EngineCatalogEntry,
  resolvedTarget: EngineCatalogEntry,
  resolvedEngineId: string
): ResolvedEngineForGeneration {
  const model =
    resolvedTarget.model ??
    resolvedTarget.falRegistryId ??
    resolvedTarget.kreaRegistryId ??
    null;

  return {
    engine: entry,
    resolvedEngineId,
    provider: resolvedTarget.provider,
    model,
    credits: resolvedTarget.credits,
    outputType: resolvedTarget.outputType,
    kreaRegistryId: resolvedTarget.kreaRegistryId,
    falRegistryId: resolvedTarget.falRegistryId,
    kreaStudioId: resolvedTarget.kreaStudioId ?? entry.kreaStudioId,
    route: inferRoute(entry, resolvedTarget),
  };
}

export function resolveEngineForGeneration(
  engineId: string,
  options?: { language?: "en" | "de" }
): ResolvedEngineForGeneration {
  const language = options?.language ?? "en";
  const id = normalizeToLaunchEngineId(engineId);
  if (!id) {
    throw new EngineResolutionError(
      "An engine must be selected.",
      "ENGINE_UNKNOWN",
      400
    );
  }

  const entry = getEngineById(id);
  if (!entry) {
    throw new EngineResolutionError("Unknown engine.", "ENGINE_UNKNOWN", 400);
  }

  if (entry.status === "disabled") {
    throw new EngineResolutionError(
      userMessageForStatus("disabled", language),
      "ENGINE_DISABLED",
      403
    );
  }

  if (entry.status === "unavailable_plan_limited") {
    throw new EngineResolutionError(
      userMessageForStatus("unavailable_plan_limited", language),
      "ENGINE_PLAN_LIMITED",
      403
    );
  }

  if (entry.status === "validation_blocked_insufficient_balance") {
    throw new EngineResolutionError(
      userMessageForStatus("validation_blocked_insufficient_balance", language),
      "ENGINE_VALIDATION_BLOCKED",
      503
    );
  }

  if (entry.status === "mapped_but_unvalidated") {
    throw new EngineResolutionError(
      userMessageForStatus("mapped_but_unvalidated", language),
      "ENGINE_NOT_VALIDATED",
      403
    );
  }

  if (entry.status === "failed_validation") {
    throw new EngineResolutionError(
      userMessageForStatus("failed_validation", language),
      "ENGINE_FAILED_VALIDATION",
      403
    );
  }

  if (entry.status !== "active") {
    throw new EngineResolutionError(
      userMessageForStatus(entry.status, language),
      "ENGINE_NOT_ACTIVE",
      403
    );
  }

  if (entry.canRunGeneration === false || entry.validation?.canRunGeneration === false) {
    throw new EngineResolutionError(
      userMessageForStatus("mapped_but_unvalidated", language),
      "ENGINE_NOT_VALIDATED",
      403
    );
  }

  if (!serverEnvReady(entry)) {
    throw new EngineResolutionError(
      language === "de"
        ? "Engine ist auf dem Server nicht konfiguriert."
        : "Engine is not configured on the server.",
      "ENGINE_FLAGS_MISSING",
      503
    );
  }

  if (entry.id === "smart_auto_pilot") {
    const target = resolveSmartAutoPilotTarget();
    return buildResolved(entry, target, target.id);
  }

  if (entry.provider === "fal" && entry.falRegistryId) {
    try {
      getEngineForServerGeneration({ engineModelId: entry.falRegistryId });
    } catch {
      throw new EngineResolutionError(
        userMessageForStatus("mapped_but_unvalidated", language),
        "ENGINE_FLAGS_MISSING",
        503
      );
    }
  }

  return buildResolved(entry, entry, entry.id);
}

/** @deprecated Use resolveEngineForGeneration */
export function resolveEngineById(engineId: string): ResolvedRuntimeEngine {
  try {
    const resolved = resolveEngineForGeneration(engineId);
    return {
      engineId: resolved.resolvedEngineId,
      label: resolved.engine.label,
      provider: resolved.provider,
      model: resolved.model,
      credits: resolved.credits,
      available: true,
      kreaRegistryId: resolved.kreaRegistryId,
      falRegistryModelId: resolved.falRegistryId,
      route: resolved.route,
    };
  } catch (error) {
    const entry = getEngineById(engineId.trim());
    const code =
      error instanceof EngineResolutionError
        ? error.code
        : ("ENGINE_NOT_ACTIVE" as EngineResolutionErrorCode);

    return {
      engineId: engineId.trim(),
      label: entry?.label ?? "Unknown",
      provider: entry?.provider ?? "internal",
      model: entry?.model ?? null,
      credits: entry?.credits ?? 0,
      available: false,
      unavailableReason: code,
      kreaRegistryId: entry?.kreaRegistryId,
      falRegistryModelId: entry?.falRegistryId,
      route: entry?.provider === "fal" ? "engine_generate" : "krea_image",
    };
  }
}

/** @deprecated Use resolveEngineForGeneration */
export function assertEngineAvailableForGeneration(
  engineId: string,
  options?: { language?: "en" | "de" }
): ResolvedRuntimeEngine {
  const resolved = resolveEngineForGeneration(engineId, options);
  return {
    engineId: resolved.resolvedEngineId,
    label: resolved.engine.label,
    provider: resolved.provider,
    model: resolved.model,
    credits: resolved.credits,
    available: true,
    kreaRegistryId: resolved.kreaRegistryId,
    falRegistryModelId: resolved.falRegistryId,
    route: resolved.route,
  };
}

export function resolveEngineCredits(engineId: string): number {
  const entry = getEngineById(engineId.trim());
  if (!entry) return 0;
  if (entry.id === "smart_auto_pilot") {
    return resolveSmartAutoPilotTarget().credits;
  }
  return entry.credits;
}

export function getMinCreditsForEngineIds(engineIds: string[]): number {
  if (!engineIds.length) return 0;
  return Math.min(...engineIds.map((id) => resolveEngineCredits(id)));
}

export function isEngineGeneratable(engineId: string): boolean {
  try {
    resolveEngineForGeneration(engineId);
    return true;
  } catch {
    return false;
  }
}

/**
 * InfluExAi — engine routing and feature-flag gates.
 * Server-safe: never exposes FAL_KEY or raw secrets to the client.
 */

import {
  getAllEngineDefinitions,
  getDefaultEngineKey,
  getEngineCredits,
  getEngineDefinition,
  resolveEngineKeyFromLegacy,
} from "./catalog";
import type {
  EngineDefinition,
  GenerationRequestInput,
  LegacyClientEngineView,
  ResolvedEngine,
} from "./types";
import { LegacyEngineResolutionError } from "./types";

export { LegacyEngineResolutionError as EngineResolutionError } from "./types";

function envTrue(name: string): boolean {
  return process.env[name] === "true";
}

function hasFalKeyConfigured(): boolean {
  return Boolean(process.env.FAL_KEY?.trim());
}

function requiresFalProvider(entry: EngineDefinition): boolean {
  if (entry.provider === "fal") return true;
  if (entry.providerChain?.some((step) => step.provider === "fal")) return true;
  if (entry.runtime.runtimeProvider === "fal") return true;
  return entry.flags?.server?.includes("ENABLE_FAL_PROVIDER") ?? false;
}

function requiresElevenLabs(entry: EngineDefinition): boolean {
  if (entry.provider === "elevenlabs") return true;
  return entry.providerChain?.some((step) => step.provider === "elevenlabs") ?? false;
}

export function areServerFlagsSatisfied(entry: EngineDefinition): boolean {
  const serverFlags = entry.flags?.server ?? [];
  for (const flag of serverFlags) {
    if (flag === "ENABLE_FAL_PROVIDER") {
      if (!envTrue(flag) || !hasFalKeyConfigured()) return false;
      continue;
    }
    if (!envTrue(flag)) return false;
  }

  if (requiresFalProvider(entry) && !serverFlags.includes("ENABLE_FAL_PROVIDER")) {
    if (!envTrue("ENABLE_FAL_PROVIDER") || !hasFalKeyConfigured()) return false;
  }

  if (requiresElevenLabs(entry)) {
    if (!envTrue("ENABLE_ELEVENLABS_TTS")) return false;
    if (!process.env.ELEVENLABS_API_KEY?.trim()) return false;
  }

  if (entry.key === "standard_image") {
    const kreaOk =
      envTrue("ENABLE_KREA_PROVIDER") && Boolean(process.env.KREA_API_KEY?.trim());
    const openaiOk = Boolean(process.env.OPENAI_API_KEY?.trim());
    return kreaOk || openaiOk;
  }

  return true;
}

export function arePublicFlagsSatisfied(entry: EngineDefinition): boolean {
  const publicFlags = entry.flags?.public ?? [];
  for (const flag of publicFlags) {
    if (!envTrue(flag)) return false;
  }
  return true;
}

export function isEngineSelectableOnClient(entry: EngineDefinition): boolean {
  if (!entry.userFacing) return false;
  if (entry.status === "disabled" || entry.status === "spec_conflict") return false;
  if (entry.status === "planned") return false;
  if (entry.status === "internal_ready" || entry.status === "beta_flagged") {
    return arePublicFlagsSatisfied(entry);
  }
  if (entry.status === "live") {
    return entry.flags?.public ? arePublicFlagsSatisfied(entry) : true;
  }
  return false;
}

export function getAvailableEnginesForClient(): LegacyClientEngineView[] {
  return getAllEngineDefinitions()
    .filter(isEngineSelectableOnClient)
    .map((entry) => ({
      key: entry.key,
      label: entry.label,
      group: entry.group,
      status: (entry.status === "live" ? "live" : "beta_flagged") as LegacyClientEngineView["status"],
      credits: entry.credits,
      creditsMax: entry.creditsMax,
      workflow: entry.workflow,
      isDefault: entry.isDefault === true,
    }));
}

function assertEngineResolvable(entry: EngineDefinition): void {
  if (entry.status === "disabled") {
    throw new LegacyEngineResolutionError(
      `Engine "${entry.label}" is disabled.`,
      "ENGINE_DISABLED"
    );
  }
  if (entry.status === "spec_conflict") {
    throw new LegacyEngineResolutionError(
      `Engine "${entry.label}" is not available yet.`,
      "ENGINE_SPEC_CONFLICT"
    );
  }
  if (entry.status === "planned") {
    throw new LegacyEngineResolutionError(
      `Engine "${entry.label}" is not available yet.`,
      "ENGINE_PLANNED"
    );
  }
}

export function getEngineForServerGeneration(
  input: GenerationRequestInput
): ResolvedEngine {
  const engineKey = resolveEngineKeyFromLegacy(input) ?? getDefaultEngineKey();
  const entry = getEngineDefinition(engineKey);

  if (!entry) {
    throw new LegacyEngineResolutionError("Unknown generation engine.", "ENGINE_UNKNOWN");
  }

  assertEngineResolvable(entry);

  if (!areServerFlagsSatisfied(entry)) {
    throw new LegacyEngineResolutionError(
      `Engine "${entry.label}" is not configured on the server.`,
      "ENGINE_FLAGS_MISSING",
      503
    );
  }

  let credits = entry.credits;
  if (
    engineKey === "lip_sync_system_voice" ||
    (input.imageMode === "lip_sync" && input.lipSyncInputMode === "system_voice")
  ) {
    credits = getEngineCredits("lip_sync_system_voice");
  } else if (
    engineKey === "lip_sync_audio_upload" ||
    input.imageMode === "lip_sync"
  ) {
    credits = getEngineCredits("lip_sync_audio_upload");
  }

  return {
    key: entry.key,
    label: entry.label,
    group: entry.group,
    status: entry.status,
    credits,
    workflow: entry.workflow,
    provider: entry.provider,
    model: entry.model,
    providerChain: entry.providerChain,
    runtime: entry.runtime,
    serverReady: true,
    clientVisible: isEngineSelectableOnClient(entry),
  };
}

export function getEngineForGenerationRequest(
  input: GenerationRequestInput
): ResolvedEngine {
  const resolved = getEngineForServerGeneration(input);
  const entry = getEngineDefinition(resolved.key);
  if (!entry) {
    throw new LegacyEngineResolutionError("Unknown generation engine.", "ENGINE_UNKNOWN");
  }

  if (
    (entry.status === "internal_ready" || entry.status === "beta_flagged") &&
    !arePublicFlagsSatisfied(entry)
  ) {
    throw new LegacyEngineResolutionError(
      `Engine "${entry.label}" is not enabled.`,
      "ENGINE_FLAGS_MISSING",
      403
    );
  }

  return resolved;
}

export function resolveCatalogCredits(input: GenerationRequestInput): number {
  return getEngineForServerGeneration(input).credits;
}

export function resolveCatalogCreditsForClient(input: GenerationRequestInput): number {
  return getEngineForGenerationRequest(input).credits;
}

export function getAdminEngineMetadata(): Array<
  EngineDefinition & {
    serverFlagsOk: boolean;
    publicFlagsOk: boolean;
    clientVisible: boolean;
  }
> {
  return getAllEngineDefinitions().map((entry) => ({
    ...entry,
    serverFlagsOk: areServerFlagsSatisfied(entry),
    publicFlagsOk: arePublicFlagsSatisfied(entry),
    clientVisible: isEngineSelectableOnClient(entry),
  }));
}

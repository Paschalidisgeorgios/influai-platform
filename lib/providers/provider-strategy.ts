/**
 * Krea-first provider routing (server-only).
 */

import { getKreaInternalModel, getKreaModelById } from "@/lib/ai/krea-model-registry";
import { isFalProviderEnabled } from "./flags";
import { isKreaEnabled } from "./krea-workflows";

export type GenerationProvider = "krea" | "fal";

export type AvailableProvider = "krea" | "fal" | null;

export function hasKreaApiKey(): boolean {
  return Boolean(process.env.KREA_API_KEY?.trim());
}

export function hasFalApiKey(): boolean {
  return Boolean(process.env.FAL_KEY?.trim());
}

/** Primary provider when keys are present — Krea first, then fal. */
export function getAvailableProvider(): AvailableProvider {
  if (hasKreaApiKey() && isKreaEnabled()) return "krea";
  if (hasFalApiKey() && isFalProviderEnabled()) return "fal";
  return null;
}

/** Secondary provider for fallback routing (fal when Krea is primary). */
export function getFallbackProvider(
  primary: AvailableProvider
): AvailableProvider {
  if (primary === "krea" && hasFalApiKey() && isFalProviderEnabled()) {
    return "fal";
  }
  if (primary === "fal" && hasKreaApiKey() && isKreaEnabled()) {
    return "krea";
  }
  return null;
}

export function assertAnyProviderConfigured(): void {
  if (!getAvailableProvider()) {
    throw new Error(
      "No generation provider configured. Set KREA_API_KEY (recommended) or FAL_KEY."
    );
  }
}

/** @deprecated Legacy fal registry entries are filtered out of active UI. */
export function isExplicitFalRegistryModel(modelId?: string | null): boolean {
  if (!modelId?.trim()) return false;
  const entry = getKreaModelById(modelId.trim());
  if (!entry) {
    return modelId.includes("fal/");
  }
  const path = getKreaInternalModel(entry).toLowerCase();
  return path.startsWith("fal/") || path.includes("/fal-");
}

export function resolveVideoStudioProvider(
  _modelId?: string
): GenerationProvider | "not_implemented" {
  const primary = getAvailableProvider();
  if (primary === "krea") return "krea";
  if (primary === "fal") return "fal";
  return "not_implemented";
}

export function resolveLipSyncProvider(_modelId?: string): "not_implemented" {
  return "not_implemented";
}

export type LiveAvatarProviderState = "krea" | "not_implemented";

export function resolveLiveAvatarProviderState(): LiveAvatarProviderState {
  if (!isKreaEnabled()) return "not_implemented";
  const path = process.env.KREA_MOTION_TRANSFER_MODEL_PATH?.trim();
  return path ? "krea" : "not_implemented";
}

export function getKreaMotionTransferModelPath(): string | null {
  const path = process.env.KREA_MOTION_TRANSFER_MODEL_PATH?.trim();
  return path ? path.replace(/^\/+/, "") : null;
}

export function getKreaLipSyncModelPath(): string | null {
  const path = process.env.KREA_LIPSYNC_MODEL_PATH?.trim();
  return path ? path.replace(/^\/+/, "") : null;
}

/** @deprecated ElevenLabs not used on Krea-only platform. */
export function isExplicitElevenLabsVoiceEnabled(): boolean {
  return false;
}

export function hasElevenLabsApiKey(): boolean {
  return Boolean(process.env.ELEVENLABS_API_KEY?.trim());
}

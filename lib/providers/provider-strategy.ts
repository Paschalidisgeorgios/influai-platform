/**

 * Krea-only provider routing (server-only).

 */



import { getKreaInternalModel, getKreaModelById } from "@/lib/ai/krea-model-registry";

import { isKreaEnabled } from "./krea-workflows";



export type GenerationProvider = "krea";



export function hasKreaApiKey(): boolean {

  return Boolean(process.env.KREA_API_KEY?.trim());

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

  return isKreaEnabled() ? "krea" : "not_implemented";

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


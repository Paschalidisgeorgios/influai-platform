/**
 * InfluExAI — user-facing model modes (quality/speed presets above engines).
 */

import type { ActionDefinition } from "@/app/lib/actions/types";
import type { EngineCatalogEntry } from "@/app/lib/engines/types";

export type ModelModeStatus = "active" | "locked" | "unavailable" | "hidden";

export type AccessTier = "free" | "creator" | "pro" | "enterprise";

export type ModelModeGroup =
  | "image"
  | "video"
  | "animate"
  | "lipsync"
  | "avatar"
  | "enhance"
  | "edit"
  | "motion"
  | "audio"
  | "three_d"
  | "training";

export type ModelModeOutputType =
  | "image"
  | "video"
  | "audio"
  | "three_d"
  | "analysis"
  | "model";

export type ModelMode = {
  id: string;
  label: string;
  description: string;
  group: ModelModeGroup;
  actionId: string;
  engineId?: string;
  status: ModelModeStatus;
  accessTier: AccessTier;
  isPremium: boolean;
  outputType: ModelModeOutputType;
  creditCost?: number;
  resolveCreditsFromEngine?: boolean;
  requiresAsset?: boolean;
  requiresImageAsset?: boolean;
  requiresVideoAsset?: boolean;
  comingSoonReason?: string;
  canShowToUser: boolean;
  canRunGeneration: boolean;
};

export type UserModelModeContext = {
  userPlan?: AccessTier | string | null;
  language?: "en" | "de";
};

export type ResolvedModelModeGeneration = {
  modelMode: ModelMode;
  action: ActionDefinition;
  engine: EngineCatalogEntry;
  actionId: string;
  engineId: string;
  /** Value passed to generation APIs (krea studio id or launch engine id) */
  apiModelId: string;
  credits: number;
  outputType: ModelModeOutputType;
  accessTier: AccessTier;
  isPremium: boolean;
};

export type ModelModeResolutionErrorCode =
  | "MODE_UNKNOWN"
  | "MODE_HIDDEN"
  | "MODE_LOCKED"
  | "MODE_UNAVAILABLE"
  | "ACTION_MISMATCH"
  | "ENGINE_MISSING"
  | "ENGINE_UNAVAILABLE";

export class ModelModeResolutionError extends Error {
  constructor(
    message: string,
    public readonly code: ModelModeResolutionErrorCode,
    public readonly status: number = 400
  ) {
    super(message);
    this.name = "ModelModeResolutionError";
  }
}

/**
 * Launch monetization rules — free vs paid value, credit costs, export policy.
 */

import { resolveCreditCostForModelMode } from "./credit-costs";
import { MONETIZATION_COPY } from "./pricing-config";
import { CREDITS_LOW, CREDITS_PAGE } from "@/lib/copy/launch-user-copy";

export type FreeFeatureId =
  | "prompt_assist"
  | "creative_score_basic"
  | "hooks_captions_copy"
  | "gallery_browse"
  | "mode_browse"
  | "preset_selection";

export type PaidActionId =
  | "create_image"
  | "create_video"
  | "create_style_variant"
  | "premium_image"
  | "realtime_image"
  | "animate_image"
  | "lipsync_creator"
  | "ai_avatar"
  | "enhance_asset"
  | "background_remove"
  | "upscale_image"
  | "object_3d"
  | "motion_transfer"
  | "audio_sound_design"
  | "hd_upscale";

const FREE_FEATURES = new Set<FreeFeatureId>([
  "prompt_assist",
  "creative_score_basic",
  "hooks_captions_copy",
  "gallery_browse",
  "mode_browse",
  "preset_selection",
]);

/** Expected credit costs for locked/future modes (UI hints only). */
export const FUTURE_ACTION_CREDIT_HINTS: Partial<Record<PaidActionId, number>> =
  {
    animate_image: 25,
    lipsync_creator: 30,
    ai_avatar: 40,
    enhance_asset: 3,
    background_remove: 2,
    upscale_image: 3,
    object_3d: 30,
    motion_transfer: 30,
    audio_sound_design: 10,
  };

export function isFreeFeature(featureId: FreeFeatureId): boolean {
  return FREE_FEATURES.has(featureId);
}

export function isPaidGenerationAction(actionId: string): boolean {
  return [
    "create_image",
    "create_video",
    "create_style_variant",
    "animate_image",
    "lipsync_creator",
    "ai_avatar",
    "enhance_asset",
    "object_3d",
  ].includes(actionId);
}

export function resolveMonetizationCreditCost(input: {
  modelModeId?: string;
  actionId?: string;
  fallback?: number;
}): number {
  const { modelModeId, actionId, fallback = 0 } = input;
  if (modelModeId) {
    const cost = resolveCreditCostForModelMode(modelModeId);
    if (cost > 0) return cost;
  }
  if (actionId && actionId in FUTURE_ACTION_CREDIT_HINTS) {
    return FUTURE_ACTION_CREDIT_HINTS[actionId as PaidActionId] ?? fallback;
  }
  return fallback;
}

export function getMissingCredits(
  required: number,
  balance: number
): number {
  return Math.max(0, required - balance);
}

export function canAffordGeneration(
  required: number,
  balance: number
): boolean {
  return balance >= required && required > 0;
}

/**
 * Export/download of an asset already paid for at generation time is free.
 * Separate HD upscale / re-render actions may charge again.
 */
export function isExportFreeForGeneratedAsset(options: {
  creditsAlreadyCharged: boolean;
  isHdUpscaleOrRerender?: boolean;
}): boolean {
  if (options.isHdUpscaleOrRerender) return false;
  return options.creditsAlreadyCharged;
}

export function getInsufficientCreditsCopy(
  required: number,
  balance: number,
  language: "en" | "de"
): {
  headline: string;
  detail: string;
  missing: number;
} {
  const missing = getMissingCredits(required, balance);
  const isDe = language === "de";
  const balanceLabel = isDe ? CREDITS_PAGE.balance.de : CREDITS_PAGE.balance.en;
  const missingLabel = isDe ? CREDITS_PAGE.missingCredits.de : CREDITS_PAGE.missingCredits.en;
  return {
    missing,
    headline: isDe ? CREDITS_LOW.de : CREDITS_LOW.en,
    detail: isDe
      ? `${balanceLabel}: ${balance} · ${missingLabel} ${missing} Credits.`
      : `${balanceLabel}: ${balance} · ${missingLabel} ${missing} credits.`,
  };
}

export function getGenerateButtonLabel(input: {
  creditCost: number;
  creditsAvailable: number;
  language: "en" | "de";
  outputType?: "image" | "video";
}): { label: string; canGenerate: boolean; insufficient: boolean } {
  const { creditCost, creditsAvailable, language, outputType = "image" } =
    input;
  const isDe = language === "de";
  const cost = creditCost.toLocaleString(isDe ? "de-DE" : "en-US");

  if (creditsAvailable < creditCost) {
    return {
      label: isDe ? "Credits kaufen" : "Buy Credits",
      canGenerate: false,
      insufficient: true,
    };
  }

  if (outputType === "video") {
    return {
      label: isDe
        ? `Motion-Video rendern · ${cost} Credits`
        : `Render Motion Video · ${cost} Credits`,
      canGenerate: true,
      insufficient: false,
    };
  }

  return {
    label: isDe
      ? `Bild generieren · ${cost} Credits`
      : `Generate Image · ${cost} Credits`,
    canGenerate: true,
    insufficient: false,
  };
}

export { MONETIZATION_COPY };

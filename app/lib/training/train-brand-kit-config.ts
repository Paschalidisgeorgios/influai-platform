/**
 * Train Brand Kit — Pro training workflow (request access until infrastructure validates).
 * No training jobs, dataset uploads, or provider calls until explicitly cleared.
 */

export const TRAIN_BRAND_KIT_ID = "train_brand_kit";

/** Internal engine id — never shown in user-facing copy. */
export const TRAIN_BRAND_KIT_ENGINE_ID = "fal_lora_training";

export const TRAIN_BRAND_KIT_CREDITS_MIN = 150;

export const TRAIN_BRAND_KIT_CREDITS_MAX = 300;

export const TRAIN_BRAND_KIT_CONFIG = {
  actionId: TRAIN_BRAND_KIT_ID,
  engineId: TRAIN_BRAND_KIT_ENGINE_ID,
  creditsMin: TRAIN_BRAND_KIT_CREDITS_MIN,
  creditsMax: TRAIN_BRAND_KIT_CREDITS_MAX,
  limits: {
    maxRetries: 1,
  },
} as const;

export function getTrainBrandKitMinimumCredits(): number {
  return TRAIN_BRAND_KIT_CREDITS_MIN;
}

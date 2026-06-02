/**
 * Train Product Model — Pro training workflow (request access until infrastructure validates).
 * No training jobs, dataset uploads, or provider calls until explicitly cleared.
 */

export const TRAIN_PRODUCT_MODEL_ID = "train_product_model";

/** Internal engine id — never shown in user-facing copy. */
export const TRAIN_PRODUCT_MODEL_ENGINE_ID = "fal_lora_training";

export const TRAIN_PRODUCT_MODEL_CREDITS_MIN = 150;

export const TRAIN_PRODUCT_MODEL_CREDITS_MAX = 300;

export const TRAIN_PRODUCT_MODEL_CONFIG = {
  actionId: TRAIN_PRODUCT_MODEL_ID,
  engineId: TRAIN_PRODUCT_MODEL_ENGINE_ID,
  creditsMin: TRAIN_PRODUCT_MODEL_CREDITS_MIN,
  creditsMax: TRAIN_PRODUCT_MODEL_CREDITS_MAX,
  limits: {
    maxRetries: 1,
  },
} as const;

export function getTrainProductModelMinimumCredits(): number {
  return TRAIN_PRODUCT_MODEL_CREDITS_MIN;
}

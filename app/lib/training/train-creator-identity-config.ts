/**
 * Train Creator Identity — Pro training workflow (request access until infrastructure validates).
 * No training jobs, dataset uploads, or provider calls until explicitly cleared.
 */

export const TRAIN_CREATOR_IDENTITY_ID = "train_creator_identity";

/** Internal engine id — never shown in user-facing copy. */
export const TRAIN_CREATOR_IDENTITY_ENGINE_ID = "fal_lora_training";

export const TRAIN_CREATOR_IDENTITY_CREDITS_MIN = 150;

export const TRAIN_CREATOR_IDENTITY_CREDITS_MAX = 300;

export const TRAIN_CREATOR_IDENTITY_CONFIG = {
  actionId: TRAIN_CREATOR_IDENTITY_ID,
  engineId: TRAIN_CREATOR_IDENTITY_ENGINE_ID,
  creditsMin: TRAIN_CREATOR_IDENTITY_CREDITS_MIN,
  creditsMax: TRAIN_CREATOR_IDENTITY_CREDITS_MAX,
  limits: {
    maxRetries: 1,
  },
} as const;

export function getTrainCreatorIdentityMinimumCredits(): number {
  return TRAIN_CREATOR_IDENTITY_CREDITS_MIN;
}

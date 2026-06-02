/**
 * Motion Transfer — credit-gated motion workflow limits.
 * Provider calls only when engine is validated and credits are charged upfront.
 */

export const MOTION_TRANSFER_ID = "motion_transfer";

export const MOTION_TRANSFER_ENGINE_ID = "fal_motion_transfer";

export const MOTION_TRANSFER_CREDITS_MIN = 30;

export const MOTION_TRANSFER_CREDITS_MAX = 50;

export const MOTION_TRANSFER_RENDER_CONFIG = {
  actionId: MOTION_TRANSFER_ID,
  engineId: MOTION_TRANSFER_ENGINE_ID,
  creditsMin: MOTION_TRANSFER_CREDITS_MIN,
  creditsMax: MOTION_TRANSFER_CREDITS_MAX,
  limits: {
    maxRetries: 1,
  },
} as const;

export function getMotionTransferMinimumCredits(): number {
  return MOTION_TRANSFER_CREDITS_MIN;
}

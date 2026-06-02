/**
 * Animate Image — credit-gated image-to-video workflow limits.
 * Provider calls only when engine is validated and credits are charged upfront.
 */

export const ANIMATE_IMAGE_ID = "animate_image";

export const ANIMATE_IMAGE_ENGINE_ID = "fal_kling_v3_i2v";

export const ANIMATE_IMAGE_CREDITS = 25;

export const ANIMATE_IMAGE_RENDER_CONFIG = {
  actionId: ANIMATE_IMAGE_ID,
  engineId: ANIMATE_IMAGE_ENGINE_ID,
  totalCredits: ANIMATE_IMAGE_CREDITS,
  limits: {
    maxVideoClips: 1,
    maxRetries: 1,
  },
} as const;

export function getAnimateImageCredits(): number {
  return ANIMATE_IMAGE_RENDER_CONFIG.totalCredits;
}

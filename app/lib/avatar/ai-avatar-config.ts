/**
 * AI Avatar — credit-gated avatar video workflow limits.
 * Provider calls only when engine is validated and credits are charged upfront.
 */

export const AI_AVATAR_ID = "ai_avatar";

export const AI_AVATAR_ENGINE_ID = "fal_avatar_single_text";

export const AI_AVATAR_CREDITS_MIN = 40;

export const AI_AVATAR_CREDITS_MAX = 50;

export const AI_AVATAR_RENDER_CONFIG = {
  actionId: AI_AVATAR_ID,
  engineId: AI_AVATAR_ENGINE_ID,
  creditsMin: AI_AVATAR_CREDITS_MIN,
  creditsMax: AI_AVATAR_CREDITS_MAX,
  limits: {
    maxRetries: 1,
  },
} as const;

export function getAiAvatarMinimumCredits(): number {
  return AI_AVATAR_CREDITS_MIN;
}

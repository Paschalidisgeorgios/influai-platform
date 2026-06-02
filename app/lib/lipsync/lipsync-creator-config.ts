/**
 * LipSync Creator — credit-gated lipsync workflow limits.
 * Provider calls only when engine is validated and credits are charged upfront.
 */

export const LIPSYNC_CREATOR_ID = "lipsync_creator";

export const LIPSYNC_CREATOR_ENGINE_ID = "fal_lipsync_sync_v2_pro";

export const LIPSYNC_CREATOR_CREDITS_UPLOAD_AUDIO = 30;

export const LIPSYNC_CREATOR_CREDITS_SYSTEM_VOICE = 35;

export const LIPSYNC_CREATOR_RENDER_CONFIG = {
  actionId: LIPSYNC_CREATOR_ID,
  engineId: LIPSYNC_CREATOR_ENGINE_ID,
  limits: {
    maxRetries: 1,
  },
  modes: {
    upload_audio: {
      credits: LIPSYNC_CREATOR_CREDITS_UPLOAD_AUDIO,
    },
    system_voice: {
      credits: LIPSYNC_CREATOR_CREDITS_SYSTEM_VOICE,
    },
  },
} as const;

export function getLipsyncCreatorMinimumCredits(): number {
  return LIPSYNC_CREATOR_CREDITS_UPLOAD_AUDIO;
}

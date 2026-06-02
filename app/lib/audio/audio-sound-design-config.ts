/**
 * Audio Sound Design — credit-gated sound workflow limits.
 * Provider calls only when engine is validated and credits are charged upfront.
 */

export const AUDIO_SOUND_DESIGN_ID = "audio_sound_design";

/** Internal engine id — never shown in user-facing copy. */
export const AUDIO_SOUND_DESIGN_ENGINE_ID = "fal_audio_placeholder";

export const AUDIO_SOUND_DESIGN_CREDITS_MIN = 5;

export const AUDIO_SOUND_DESIGN_CREDITS_MAX = 15;

export const AUDIO_SOUND_DESIGN_RENDER_CONFIG = {
  actionId: AUDIO_SOUND_DESIGN_ID,
  engineId: AUDIO_SOUND_DESIGN_ENGINE_ID,
  creditsMin: AUDIO_SOUND_DESIGN_CREDITS_MIN,
  creditsMax: AUDIO_SOUND_DESIGN_CREDITS_MAX,
  limits: {
    maxRetries: 1,
    savesToGallery: true,
  },
} as const;

export function getAudioSoundDesignMinimumCredits(): number {
  return AUDIO_SOUND_DESIGN_CREDITS_MIN;
}

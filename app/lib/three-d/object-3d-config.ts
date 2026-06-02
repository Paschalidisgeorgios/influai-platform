/**
 * 3D Object — credit-gated text/image-to-3D-style workflow limits.
 * Provider calls only when engine is validated and credits are charged upfront.
 */

export const OBJECT_3D_ID = "object_3d";

/** Internal engine id — never shown in user-facing copy. */
export const OBJECT_3D_ENGINE_ID = "fal_object_3d";

export const OBJECT_3D_CREDITS_MIN = 30;

export const OBJECT_3D_CREDITS_MAX = 60;

export const OBJECT_3D_RENDER_CONFIG = {
  actionId: OBJECT_3D_ID,
  engineId: OBJECT_3D_ENGINE_ID,
  creditsMin: OBJECT_3D_CREDITS_MIN,
  creditsMax: OBJECT_3D_CREDITS_MAX,
  limits: {
    maxRetries: 1,
    requiresPromptOrImage: true,
    savesToGallery: true,
  },
} as const;

export function getObject3dMinimumCredits(): number {
  return OBJECT_3D_CREDITS_MIN;
}

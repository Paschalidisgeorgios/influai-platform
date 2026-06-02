/**
 * fal.ai Model Registry — Creator Studio
 * Endpoint-IDs für Server-Routing; nie im Client-UI anzeigen.
 */

export type FalModelCategory = "image" | "video" | "utility";

export type FalModelDefinition = {
  id: string;
  label: string;
  endpoint: string;
  category: FalModelCategory;
  credits: number;
  description: string;
  /** MVP: nur validated models aktiv */
  enabled: boolean;
};

export const FAL_MODELS = {
  image: {
    fluxProUltra: {
      id: "flux-pro-ultra",
      label: "Flux Pro Ultra",
      endpoint: "fal-ai/flux-pro/v1.1-ultra",
      category: "image",
      credits: 3,
      description: "Highest quality campaign visuals",
      enabled: true,
    },
    fluxDev: {
      id: "flux-dev",
      label: "Flux Dev",
      endpoint: "fal-ai/flux/dev",
      category: "image",
      credits: 2,
      description: "Balanced quality and speed",
      enabled: true,
    },
    fluxSchnell: {
      id: "flux-schnell",
      label: "Flux Schnell",
      endpoint: "fal-ai/flux/schnell",
      category: "image",
      credits: 1,
      description: "Fast drafts and iterations",
      enabled: true,
    },
    fluxRedux: {
      id: "flux-redux",
      label: "Flux Redux",
      endpoint: "fal-ai/flux-pro/v1/redux",
      category: "image",
      credits: 2,
      description: "Style-guided variations",
      enabled: false,
    },
    fluxFill: {
      id: "flux-fill",
      label: "Flux Fill",
      endpoint: "fal-ai/flux-pro/v1/fill",
      category: "image",
      credits: 2,
      description: "Inpainting and fill",
      enabled: false,
    },
  },
  video: {
    klingPro: {
      id: "kling-v15-pro",
      label: "Kling Pro",
      endpoint: "fal-ai/kling-video/v1.5/pro",
      category: "video",
      credits: 25,
      description: "Cinematic text-to-video",
      enabled: true,
    },
    minimax: {
      id: "minimax-video",
      label: "Minimax Video",
      endpoint: "fal-ai/minimax-video",
      category: "video",
      credits: 20,
      description: "Short-form social video",
      enabled: false,
    },
    luma: {
      id: "luma-dream",
      label: "Luma Dream Machine",
      endpoint: "fal-ai/luma-dream-machine",
      category: "video",
      credits: 22,
      description: "Dream-like motion clips",
      enabled: false,
    },
    runway: {
      id: "runway-gen3",
      label: "Runway Gen3 Turbo",
      endpoint: "fal-ai/runway-gen3/turbo",
      category: "video",
      credits: 30,
      description: "High-motion video generation",
      enabled: false,
    },
  },
  utility: {
    clarityUpscaler: {
      id: "clarity-upscaler",
      label: "Clarity Upscaler",
      endpoint: "fal-ai/clarity-upscaler",
      category: "utility",
      credits: 2,
      description: "HD upscale for export",
      enabled: false,
    },
    realEsrgan: {
      id: "real-esrgan",
      label: "Real-ESRGAN",
      endpoint: "fal-ai/real-esrgan",
      category: "utility",
      credits: 1,
      description: "Fast upscale",
      enabled: false,
    },
    birefnet: {
      id: "birefnet",
      label: "BiRefNet",
      endpoint: "fal-ai/birefnet",
      category: "utility",
      credits: 1,
      description: "Background removal",
      enabled: false,
    },
    faceSwap: {
      id: "face-swap",
      label: "Face Swap",
      endpoint: "fal-ai/face-swap",
      category: "utility",
      credits: 3,
      description: "Face swap utility",
      enabled: false,
    },
    pulid: {
      id: "pulid",
      label: "PuLID",
      endpoint: "fal-ai/pulid",
      category: "utility",
      credits: 2,
      description: "Identity-preserving edit",
      enabled: false,
    },
  },
} as const satisfies Record<string, Record<string, FalModelDefinition>>;

export function getAllFalModels(): FalModelDefinition[] {
  return Object.values(FAL_MODELS).flatMap((group) => Object.values(group));
}

export function getEnabledFalModels(): FalModelDefinition[] {
  return getAllFalModels().filter((m) => m.enabled);
}

export function getFalModelById(id: string): FalModelDefinition | undefined {
  return getAllFalModels().find((m) => m.id === id);
}

export function getFalModelsByCategory(
  category: FalModelCategory
): FalModelDefinition[] {
  return getAllFalModels().filter((m) => m.category === category);
}

/** Default image engine for studio */
export const DEFAULT_IMAGE_MODEL_ID = FAL_MODELS.image.fluxSchnell.id;

/** Default video engine for studio */
export const DEFAULT_VIDEO_MODEL_ID = FAL_MODELS.video.klingPro.id;

/** HD export uses utility upscaler when enabled */
export const HD_EXPORT_MODEL_ID = FAL_MODELS.utility.clarityUpscaler.id;

export const HD_EXPORT_CREDIT_COST = FAL_MODELS.utility.clarityUpscaler.credits;

/**
 * Modell-Empfehlungen basierend auf User-Intent und Use Case.
 * Hilft dem System das beste Modell automatisch zu wählen.
 */

export type UserType = "creator" | "brand" | "agency" | "personal";
export type ContentType = "ugc" | "product" | "editorial" | "lifestyle" | "video";

export type ModelRecommendation = {
  imageModel: string;
  videoModel: string;
  rationale: string;
  suggestedMode: string;
};

export function getModelRecommendation(
  userType: UserType,
  contentType: ContentType
): ModelRecommendation {
  if (contentType === "ugc" || userType === "creator") {
    return {
      imageModel: "bfl/flux-1-dev",
      videoModel: "kling/kling-3.0",
      rationale:
        "FLUX Dev für authentische, natürliche UGC-Optik. Kling 3.0 für flüssige Motion.",
      suggestedMode: "ugc_look",
    };
  }
  if (contentType === "product" || userType === "brand") {
    return {
      imageModel: "google/nano-banana-pro",
      videoModel: "kling/kling-3.0",
      rationale:
        "Nano Banana Pro für scharfe Produkt-Details und präzise Farben.",
      suggestedMode: "brand_assets",
    };
  }
  if (contentType === "editorial") {
    return {
      imageModel: "bfl/flux-1-dev",
      videoModel: "kling/kling-3.0",
      rationale: "FLUX Dev für hochwertige editorial Qualität.",
      suggestedMode: "premium_image",
    };
  }
  return {
    imageModel: "bfl/flux-1-dev",
    videoModel: "kling/kling-3.0",
    rationale: "FLUX Dev als universelles Qualitäts-Modell.",
    suggestedMode: "standard",
  };
}

export const MODEL_DISPLAY_NAMES: Record<string, string> = {
  "bfl/flux-1-dev": "FLUX",
  "google/nano-banana-pro": "Nano Banana Pro",
  "kling/kling-3.0": "Kling 3.0",
  "kling/kling-2.5": "Kling 2.5",
  "enhance/topaz/standard-enhance": "Topaz Enhance",
};

export const MODEL_DESCRIPTIONS: Record<string, { en: string; de: string }> = {
  "bfl/flux-1-dev": {
    en: "Best for: Portraits, lifestyle, UGC content, editorial",
    de: "Ideal für: Portraits, Lifestyle, UGC Content, Editorial",
  },
  "google/nano-banana-pro": {
    en: "Best for: Product photography, precise details, brand assets",
    de: "Ideal für: Produktfotografie, präzise Details, Brand Assets",
  },
  "kling/kling-3.0": {
    en: "Best for: Motion video, image-to-video, social reels",
    de: "Ideal für: Motion Video, Image-to-Video, Social Reels",
  },
};

const MODEL_MODE_TO_RECOMMENDATION: Record<string, ModelRecommendation> = {
  auto_image: getModelRecommendation("personal", "lifestyle"),
  fast_draft_image: getModelRecommendation("creator", "ugc"),
  premium_image: getModelRecommendation("brand", "editorial"),
  realtime_image: getModelRecommendation("creator", "ugc"),
  auto_video: getModelRecommendation("creator", "video"),
  cinematic_text_video: getModelRecommendation("brand", "video"),
  ugc_look: getModelRecommendation("creator", "ugc"),
  brand_assets: getModelRecommendation("brand", "product"),
  reference_edit: getModelRecommendation("brand", "product"),
  premium_image_mode: getModelRecommendation("brand", "editorial"),
};

/** Maps dashboard model mode id → underlying Krea model paths for UI hints. */
export function resolveModelsForModelMode(modelModeId: string): ModelRecommendation & {
  activeModel: string;
} {
  const key = modelModeId.trim();
  const rec =
    MODEL_MODE_TO_RECOMMENDATION[key] ??
    (key.includes("video")
      ? getModelRecommendation("creator", "video")
      : getModelRecommendation("creator", "lifestyle"));

  const activeModel = key.includes("video") ? rec.videoModel : rec.imageModel;
  return { ...rec, activeModel };
}

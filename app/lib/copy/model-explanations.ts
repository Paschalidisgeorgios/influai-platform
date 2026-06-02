/**
 * Canonical one-line model/workflow explanations — landing + dashboard.
 * Benefit-focused copy only; no provider or model IDs.
 */

import type { CreatorToolId } from "@/app/lib/tools/creator-tools";

export type ModelExplanationLanguage = "en" | "de";

export type ModelExplanationCopy = {
  en: string;
  de: string;
};

/** Tools with curated explanations (studio toolbox + landing explorer). */
export const MODEL_EXPLANATION_TOOL_IDS = [
  "social_asset_pack",
  "create_image",
  "create_video",
  "use_reference_image",
  "edit_image",
  "match_style",
  "enhance_asset",
  "background_remove",
  "upscale_image",
  "animate_image",
  "motion_transfer",
  "lipsync_creator",
  "ai_avatar",
  "train_creator_style",
  "train_brand_kit",
  "train_product_model",
  "train_creator_identity",
  "check_creative_score",
  "hooks_captions",
  "export_pack",
  "object_3d",
  "audio_sound_design",
] as const satisfies readonly CreatorToolId[];

export type ModelExplanationToolId = (typeof MODEL_EXPLANATION_TOOL_IDS)[number];

export const MODEL_EXPLANATIONS: Record<
  ModelExplanationToolId,
  ModelExplanationCopy
> = {
  social_asset_pack: {
    en: "Turn one idea into image variations, a motion clip, hooks, captions, hashtags and export-ready formats.",
    de: "Verwandle eine Idee in Bildvarianten, einen Motion-Clip, Hooks, Captions, Hashtags und exportfertige Formate.",
  },
  create_image: {
    en: "Create high-quality creator visuals, product shots and social assets from a simple idea.",
    de: "Erstelle hochwertige Creator-Visuals, Produktshots und Social Assets aus einer einfachen Idee.",
  },
  create_video: {
    en: "Turn an idea into a short creator-ready motion clip for Reels, TikTok and social ads.",
    de: "Verwandle eine Idee in einen kurzen, creator-ready Motion-Clip für Reels, TikTok und Social Ads.",
  },
  use_reference_image: {
    en: "Guide a new asset with a reference image to control mood, composition or style.",
    de: "Leite ein neues Asset mit einem Referenzbild — für Stimmung, Komposition oder Stil.",
  },
  edit_image: {
    en: "Change background, lighting, style or details without starting over.",
    de: "Ändere Hintergrund, Licht, Stil oder Details, ohne von vorn zu starten.",
  },
  match_style: {
    en: "Apply a consistent visual direction across new assets.",
    de: "Wende eine konsistente visuelle Richtung auf neue Assets an.",
  },
  enhance_asset: {
    en: "Improve clarity, sharpness and export quality.",
    de: "Verbessere Klarheit, Schärfe und Export-Qualität.",
  },
  background_remove: {
    en: "Remove backgrounds from product or creator assets.",
    de: "Entferne Hintergründe bei Produkt- oder Creator-Assets.",
  },
  upscale_image: {
    en: "Prepare assets for higher-quality export.",
    de: "Bereite Assets für Export in höherer Qualität vor.",
  },
  animate_image: {
    en: "Turn a still image into a motion-ready clip.",
    de: "Verwandle ein Standbild in einen motion-ready Clip.",
  },
  motion_transfer: {
    en: "Apply a movement style or reference motion to an asset.",
    de: "Wende einen Bewegungsstil oder Referenz-Motion auf ein Asset an.",
  },
  lipsync_creator: {
    en: "Create talking creator videos with synchronized speech.",
    de: "Erstelle sprechende Creator-Videos mit synchronisierter Sprache.",
  },
  ai_avatar: {
    en: "Generate avatar-style creator videos from text or script.",
    de: "Erzeuge Avatar-Videos im Creator-Stil aus Text oder Skript.",
  },
  train_creator_style: {
    en: "Build a reusable creator look from your own approved assets.",
    de: "Baue einen wiederverwendbaren Creator-Look aus deinen freigegebenen Assets.",
  },
  train_brand_kit: {
    en: "Keep brand colors, style and visual language consistent across assets.",
    de: "Halte Markenfarben, Stil und visuelle Sprache über Assets hinweg konsistent.",
  },
  train_product_model: {
    en: "Create consistent product visuals from a reusable product model.",
    de: "Erstelle konsistente Produktvisuals aus einem wiederverwendbaren Produktmodell.",
  },
  train_creator_identity: {
    en: "Improve consistency for approved creator-style visuals.",
    de: "Verbessere die Konsistenz für freigegebene Creator-Style-Visuals.",
  },
  check_creative_score: {
    en: "Analyze clarity, hook strength, mobile readability and social readiness.",
    de: "Analysiere Klarheit, Hook-Stärke, mobile Lesbarkeit und Social-Tauglichkeit.",
  },
  hooks_captions: {
    en: "Generate hooks, captions and hashtags for platform-ready posts.",
    de: "Generiere Hooks, Captions und Hashtags für plattformfertige Posts.",
  },
  export_pack: {
    en: "Prepare your assets for TikTok, Reels, Story and Feed.",
    de: "Bereite deine Assets für TikTok, Reels, Story und Feed vor.",
  },
  object_3d: {
    en: "Create 3D-style product assets for advanced workflows.",
    de: "Erstelle Produkt-Assets im 3D-Stil für erweiterte Workflows.",
  },
  audio_sound_design: {
    en: "Create audio ideas and sound directions for creator videos.",
    de: "Erstelle Audio-Ideen und Sound-Richtungen für Creator-Videos.",
  },
};

function isModelExplanationToolId(
  toolId: CreatorToolId
): toolId is ModelExplanationToolId {
  return toolId in MODEL_EXPLANATIONS;
}

/** Curated one-line explanation, or null if this tool has no entry yet. */
export function getModelExplanation(
  toolId: CreatorToolId,
  language: ModelExplanationLanguage = "en"
): string | null {
  if (!isModelExplanationToolId(toolId)) {
    return null;
  }
  const row = MODEL_EXPLANATIONS[toolId];
  return language === "de" ? row.de : row.en;
}

export function getModelExplanationOrFallback(
  toolId: CreatorToolId,
  language: ModelExplanationLanguage,
  fallback: string
): string {
  return getModelExplanation(toolId, language) ?? fallback;
}

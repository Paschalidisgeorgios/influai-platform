/**
 * White-label engine cards for the creative workspace UI.
 * Internal registry IDs map to backend; never show "Krea" in user-facing copy.
 */

export type WhiteLabelEngineCard = {
  id: string;
  labelEn: string;
  labelDe: string;
  descriptionEn: string;
  descriptionDe: string;
  badgeEn?: string;
  badgeDe?: string;
};

export const IMAGE_STUDIO_ENGINES: WhiteLabelEngineCard[] = [
  {
    id: "krea-2-large",
    labelEn: "Premium Image",
    labelDe: "Premium Image",
    descriptionEn:
      "Highest detail for campaign-ready visuals and polished creator assets.",
    descriptionDe:
      "Höchste Detailtiefe für kampagnenreife Visuals und polierte Creator-Assets.",
    badgeEn: "Recommended",
    badgeDe: "Empfohlen",
  },
  {
    id: "krea-2-medium",
    labelEn: "Fast Draft",
    labelDe: "Fast Draft",
    descriptionEn: "Quick iterations and low-cost drafts for testing ideas.",
    descriptionDe:
      "Schnelle Iterationen und günstige Entwürfe zum Testen von Ideen.",
  },
  {
    id: "nano-banana",
    labelEn: "Realtime Render",
    labelDe: "Realtime Render",
    descriptionEn: "Fast render for rapid creative exploration.",
    descriptionDe: "Schnelles Rendern für schnelle kreative Exploration.",
  },
  {
    id: "flux-11-pro",
    labelEn: "Smart Auto-Pilot",
    labelDe: "Smart Auto-Pilot",
    descriptionEn:
      "Intelligent routing layer that selects the optimal engine for your prompt.",
    descriptionDe:
      "Intelligente Routing-Ebene, die automatisch das beste Modell für deinen Prompt wählt.",
  },
];

export const VIDEO_ENGINE_ENGINES: WhiteLabelEngineCard[] = [
  {
    id: "kling-3",
    labelEn: "Social Video",
    labelDe: "Social Video",
    descriptionEn:
      "Cinematic motion for ultra-realistic short-form social clips.",
    descriptionDe:
      "Kinematische Bewegung für ultra-realistische Social-Clips.",
    badgeEn: "Recommended",
    badgeDe: "Empfohlen",
  },
  {
    id: "runway-gen-45",
    labelEn: "Cinematic Motion",
    labelDe: "Cinematic Motion",
    descriptionEn:
      "Cinematic transitions and dynamic lighting for premium clips.",
    descriptionDe:
      "Cinematische Übergänge und dynamisches Licht für Premium-Clips.",
  },
  {
    id: "hailuo-23",
    labelEn: "Fast Social Clip",
    labelDe: "Fast Social Clip",
    descriptionEn:
      "Fast generation for social ads and rapid concept tests.",
    descriptionDe:
      "Schnelle Generierung für Social Ads und schnelle Konzept-Tests.",
  },
  {
    id: "seedance-pro",
    labelEn: "Character Motion",
    labelDe: "Character Motion",
    descriptionEn:
      "Preserves subject identity across dynamic motion.",
    descriptionDe:
      "Erhält die Identität des Motivs bei dynamischer Bewegung.",
  },
];

/** @deprecated Use getMotionTransferModelCatalog() from lib/ai/krea-model-ui.ts */
export const MOTION_TRANSFER_ENGINES: WhiteLabelEngineCard[] = [];

export const ENHANCER_ENGINES: WhiteLabelEngineCard[] = [
  {
    id: "topaz-standard",
    labelEn: "Standard Smart Enhance",
    labelDe: "Standard Smart-Verbesserung",
    descriptionEn: "Balanced clarity and detail for everyday creator assets.",
    descriptionDe: "Ausgewogene Klarheit und Details für tägliche Creator-Assets.",
  },
  {
    id: "topaz-bloom",
    labelEn: "Pro Detail Innovation",
    labelDe: "Pro Detail-Innovation",
    descriptionEn: "Advanced detail recovery for premium export quality.",
    descriptionDe: "Erweiterte Detail-Wiederherstellung für Premium-Exportqualität.",
  },
  {
    id: "topaz-generative",
    labelEn: "Max Reality 22K",
    labelDe: "Max Realität 22K",
    descriptionEn: "Maximum realism upscale for hero creator visuals.",
    descriptionDe: "Maximale Realitäts-Skalierung für Hero-Creator-Visuals.",
  },
];

export function whiteLabelCardToModelOption(
  card: WhiteLabelEngineCard,
  language: "de" | "en",
  credits?: number
) {
  return {
    value: card.id,
    label: language === "de" ? card.labelDe : card.labelEn,
    note: language === "de" ? card.descriptionDe : card.descriptionEn,
    badge: language === "de" ? card.badgeDe : card.badgeEn,
    credits,
  };
}

export function getWhiteLabelEnginesForTool(
  tool: "image" | "video" | "enhancer"
): WhiteLabelEngineCard[] {
  if (tool === "video") return VIDEO_ENGINE_ENGINES;
  if (tool === "enhancer") return ENHANCER_ENGINES;
  return IMAGE_STUDIO_ENGINES;
}

/** Strip provider branding and raw registry ids from user-facing strings. */
export function sanitizeUserFacingEngineText(text: string): string {
  return text
    .replace(/\bfal[_\-\.]?ai\b/gi, "")
    .replace(/\bfal_[a-z0-9_]+\b/gi, "")
    .replace(/\bkrea\s*ai\b/gi, "InfluExAI")
    .replace(/\bkrea\b/gi, "")
    .replace(/\bflux[\s\d.]*(?:pro|ultra|fast|draft)?[\w-]*/gi, "Premium Image")
    .replace(/\bnano[\s\w-]*/gi, "Realtime Render")
    .replace(/\bkling[\s\d.]+/gi, "Social Video")
    .replace(/\brunway[\s\w-]*/gi, "Cinematic Motion")
    .replace(/\bhailuo[\s\w-]*/gi, "Fast Social Clip")
    .replace(/\bseedance[\s\w-]*/gi, "Character Motion")
    .replace(/\btopaz[\s\w-]*/gi, "Enhance")
    .replace(/\s{2,}/g, " ")
    .trim();
}

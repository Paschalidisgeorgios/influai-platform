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
    labelEn: "Flux 1.1 Pro Ultra",
    labelDe: "Flux 1.1 Pro Ultra",
    descriptionEn:
      "Our flagship engine for ultra-realistic studio lighting and photography.",
    descriptionDe:
      "Unser Flaggschiff-Modell für ultra-realistisches Studiolicht und Fotografie.",
    badgeEn: "Recommended",
    badgeDe: "Empfohlen",
  },
  {
    id: "krea-2-medium",
    labelEn: "Flux Fast Draft",
    labelDe: "Flux Fast Draft",
    descriptionEn:
      "Optimized for fast iterations, clean graphics, and layouts.",
    descriptionDe:
      "Optimiert für blitzschnelle Entwürfe, saubere Grafiken und Layouts.",
  },
  {
    id: "nano-banana",
    labelEn: "Nano Realtime Render",
    labelDe: "Nano Realtime Render",
    descriptionEn:
      "Millisecond processing pipeline built for instant concept generation.",
    descriptionDe:
      "Millisekunden-Rechen-Pipeline für sofortige Konzept-Generierung in Echtzeit.",
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
    labelEn: "Kling 3.0 Cinematic",
    labelDe: "Kling 3.0 Cinematic",
    descriptionEn:
      "Hollywood-grade physics engine for ultra-realistic camera movements.",
    descriptionDe:
      "Hollywood-reife Physik-Engine für ultra-realistische Kamerabewegungen.",
    badgeEn: "Recommended",
    badgeDe: "Empfohlen",
  },
  {
    id: "runway-gen-45",
    labelEn: "Runway Motion Pro",
    labelDe: "Runway Motion Pro",
    descriptionEn:
      "Advanced visual effects engine for cinematic transitions and dynamic lighting.",
    descriptionDe:
      "Fortschrittliche Visual-Effects-Engine für cineastische Übergänge und dynamisches Licht.",
  },
  {
    id: "hailuo-23",
    labelEn: "Hailuo Fast Engine",
    labelDe: "Hailuo Fast Engine",
    descriptionEn:
      "Blazing fast generation pipeline optimized for social media ads and rapid concepts.",
    descriptionDe:
      "Blitzschnelle Generierungs-Pipeline für Social-Media-Ads und schnelle Konzepte.",
  },
  {
    id: "seedance-pro",
    labelEn: "Seedance Character Retain",
    labelDe: "Seedance Character Retain",
    descriptionEn:
      "Specialized pipeline that preserves human facial features across dynamic motion.",
    descriptionDe:
      "Spezialisierte Pipeline, die menschliche Gesichtszüge bei dynamischer Bewegung erhält.",
  },
];

export const MOTION_TRANSFER_ENGINES: WhiteLabelEngineCard[] = [
  {
    id: "runway-motion-pro",
    labelEn: "Runway Motion Pro",
    labelDe: "Runway Motion Pro",
    descriptionEn:
      "Anatomical movement vector skeleton mapping for live motion transfer.",
    descriptionDe:
      "Anatomisches Bewegungs-Vektor-Skelett-Mapping für Live Motion Transfer.",
    badgeEn: "Recommended",
    badgeDe: "Empfohlen",
  },
  {
    id: "kling-motion",
    labelEn: "Kling 3.0 Cinematic",
    labelDe: "Kling 3.0 Cinematic",
    descriptionEn: "Temporal physics engine for cinematic body dynamics.",
    descriptionDe: "Temporale Physik-Engine für cineastische Körperdynamik.",
  },
  {
    id: "flux-motion-draft",
    labelEn: "Flux Fast Draft",
    labelDe: "Flux Fast Draft",
    descriptionEn: "Rapid motion preview pipeline for iteration cycles.",
    descriptionDe: "Schnelle Motion-Preview-Pipeline für Iterationszyklen.",
  },
  {
    id: "nano-motion",
    labelEn: "Nano Realtime Render",
    labelDe: "Nano Realtime Render",
    descriptionEn: "Low-latency motion retargeting for social formats.",
    descriptionDe: "Niedriglatente Motion-Retargeting-Pipeline für Social Formate.",
  },
];

export const ENHANCER_ENGINES: WhiteLabelEngineCard[] = [
  {
    id: "topaz-standard",
    labelEn: "Standard Smart Enhance",
    labelDe: "Standard Smart-Verbesserung",
    descriptionEn: "Balanced clarity and detail for everyday campaign assets.",
    descriptionDe: "Ausgewogene Klarheit und Details für tägliche Kampagnen-Assets.",
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
    descriptionEn: "Maximum realism upscale for hero campaign visuals.",
    descriptionDe: "Maximale Realitäts-Skalierung für Hero-Kampagnenvisuals.",
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

/** Strip provider branding from registry-generated strings (fallback). */
export function sanitizeUserFacingEngineText(text: string): string {
  return text
    .replace(/\bkrea\s*ai\b/gi, "InfluExAi Engine")
    .replace(/\bkrea\b/gi, "Flux")
    .replace(/\s{2,}/g, " ")
    .trim();
}

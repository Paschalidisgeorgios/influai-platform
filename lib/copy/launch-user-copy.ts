/**
 * Launch-facing user copy — provider-neutral, no fake performance claims.
 */

import { getGenerateButtonLabel } from "@/app/lib/billing/monetization-rules";

export const LAUNCH_TAGLINE = {
  en: "One idea → complete content pack. Ready to post.",
  de: "Eine Idee → komplettes Content-Pack. Bereit zum Posten.",
} as const;

export const LANDING_TRUST_LINE = {
  en: "From idea to image, video and export — all in one creator workflow.",
  de: "Von der Idee bis zu Bild, Video und Export — in einem Creator-Workflow.",
} as const;

export const CREATE_PAGE = {
  headline: {
    en: "What's your idea?",
    de: "Was ist deine Idee?",
  },
  subtitle: {
    en: "Describe it in one sentence. We'll build the full pack.",
    de: "Beschreibe sie in einem Satz. Wir bauen das komplette Pack.",
  },
  promptPlaceholder: {
    en: "Describe an image, motion video or creator asset…",
    de: "Beschreibe ein Bild, Motion-Video oder Creator-Asset …",
  },
  promptEmptyHelper: {
    en: "Try: 'Wireless earbuds on marble, soft light, Instagram square'",
    de: "Versuch: 'Kabellose Kopfhörer auf Marmor, weiches Licht, Instagram quadratisch'",
  },
  canvasEmpty: {
    en: "Your result will appear here after rendering.",
    de: "Dein Ergebnis erscheint hier nach dem Rendern.",
  },
} as const;

export const PROMPT_ASSIST = {
  tagline: {
    en: "Prompt improved",
    de: "Prompt verbessert",
  },
  useImproved: {
    en: "Use improved version",
    de: "Verbesserte Version nutzen",
  },
  improvedNoteImage: {
    en: "Prompt improved for clearer lighting, composition and subject focus.",
    de: "Prompt verbessert für klareres Licht, Komposition und Motiv-Fokus.",
  },
  improvedNoteVideo: {
    en: "Prompt improved for clearer motion, pacing and scene focus.",
    de: "Prompt verbessert für klarere Bewegung, Pacing und Szenen-Fokus.",
  },
  improveCta: {
    en: "Improve prompt",
    de: "Prompt verbessern",
  },
  improving: {
    en: "Improving…",
    de: "Verbessere…",
  },
  failure: {
    en: "Prompt assist is temporarily unavailable.",
    de: "Prompt Assist ist vorübergehend nicht verfügbar.",
  },
  originalIntact: {
    en: "Your original prompt stays intact until you apply the improvement.",
    de: "Dein ursprünglicher Prompt bleibt erhalten, bis du die Verbesserung übernimmst.",
  },
} as const;

export type CreateOnboardingGoalId =
  | "beauty_product"
  | "fitness_creator"
  | "streetwear_drop"
  | "food_visual"
  | "ecommerce_product"
  | "automotive"
  | "real_estate"
  | "ugc_creator"
  | "saas_b2b"
  | "agency_client_pack";

export const CREATE_ONBOARDING = {
  firstRunQuestion: {
    en: "What do you want to create first?",
    de: "Was möchtest du zuerst erstellen?",
  },
  helperCopy: {
    en: "Write your goal in one sentence. InfluExAI turns it into a creator-ready plan.",
    de: "Schreib dein Ziel in einem Satz. InfluExAI macht daraus einen creator-fertigen Plan.",
  },
  afterSelectionHint: {
    en: "Social Asset Pack is recommended — preview your content plan for free before rendering.",
    de: "Social Asset Pack empfohlen — Vorschau deines Content-Plans kostenlos, bevor du renderst.",
  },
  recommendedLabel: {
    en: "Recommended",
    de: "Empfohlen",
  },
  goals: [
    {
      id: "beauty_product" as const,
      labelEn: "Beauty product",
      labelDe: "Beauty-Produkt",
      promptEn:
        "Premium serum bottle flat lay on marble, soft studio light, clean label space for social",
      promptDe:
        "Premium-Serum-Flasche als Flat Lay auf Marmor, weiches Studiolicht, Platz für cleane Typografie",
    },
    {
      id: "fitness_creator" as const,
      labelEn: "Fitness creator",
      labelDe: "Fitness-Creator",
      promptEn:
        "Bold fitness creator promo with energetic gym lighting for a supplement or activewear brand",
      promptDe:
        "Bold Fitness-Creator-Promo mit energetischem Gym-Licht für Supplement- oder Activewear-Marke",
    },
    {
      id: "streetwear_drop" as const,
      labelEn: "Streetwear drop",
      labelDe: "Streetwear-Drop",
      promptEn:
        "Streetwear drop teaser with urban backdrop, bold typography and hype sneaker focus",
      promptDe:
        "Streetwear-Drop-Teaser mit urbanem Backdrop, bold Typografie und Hype-Sneaker-Fokus",
    },
    {
      id: "food_visual" as const,
      labelEn: "Food visual",
      labelDe: "Food-Visual",
      promptEn:
        "Restaurant dish hero shot with natural window light, steam detail and menu-ready composition",
      promptDe:
        "Restaurant-Gericht als Hero-Shot mit natürlichem Fensterlicht, Dampf-Detail und menü-tauglicher Komposition",
    },
    {
      id: "ecommerce_product" as const,
      labelEn: "E-commerce product",
      labelDe: "E-Commerce-Produkt",
      promptEn:
        "Clean catalog hero for wireless earbuds on matte stone, soft side light, white-label ready",
      promptDe:
        "Cleanes Katalog-Hero für Wireless Earbuds auf mattem Stein, weiches Seitenlicht, white-label-ready",
    },
    {
      id: "automotive" as const,
      labelEn: "Automotive",
      labelDe: "Automotive",
      promptEn:
        "Automotive social teaser with dynamic angle on a sedan, golden hour light and dealership-ready crop",
      promptDe:
        "Automotive-Social-Teaser mit dynamischem Winkel auf Limousine, Golden-Hour-Licht und dealership-ready Crop",
    },
    {
      id: "real_estate" as const,
      labelEn: "Real estate",
      labelDe: "Immobilien",
      promptEn:
        "Bright real-estate listing visual with wide interior shot, natural light and space for price overlay",
      promptDe:
        "Helles Immobilien-Listing-Visual mit Weitwinkel-Innenaufnahme, Tageslicht und Platz für Preis-Overlay",
    },
    {
      id: "ugc_creator" as const,
      labelEn: "UGC creator",
      labelDe: "UGC-Creator",
      promptEn:
        "Authentic UGC reel concept showing a creator unboxing and reviewing a everyday lifestyle product",
      promptDe:
        "Authentisches UGC-Reel-Konzept: Creator packt ein Alltags-Lifestyle-Produkt aus und reviewt es",
    },
    {
      id: "saas_b2b" as const,
      labelEn: "SaaS / B2B visual",
      labelDe: "SaaS / B2B-Visual",
      promptEn:
        "SaaS product social visual with dashboard mock on laptop, clean desk setup and LinkedIn-ready framing",
      promptDe:
        "SaaS-Produkt-Social-Visual mit Dashboard-Mock auf Laptop, cleanes Desk-Setup und LinkedIn-ready Framing",
    },
    {
      id: "agency_client_pack" as const,
      labelEn: "Agency client pack",
      labelDe: "Agentur-Kunden-Pack",
      promptEn:
        "Polished multi-format client pack for a DTC brand launch with on-brand colors and clear product focus",
      promptDe:
        "Poliertes Multi-Format-Kunden-Pack für einen DTC-Brand-Launch mit Markenfarben und klarem Produktfokus",
    },
  ],
} as const;

/** Dashboard create page — three-zone hierarchy labels */
export const DASHBOARD_ZONES = {
  commandBar: {
    en: "Start here",
    de: "Hier starten",
  },
  primaryActions: {
    en: "Primary actions",
    de: "Hauptaktionen",
  },
  workflow: {
    en: "Workflow options",
    de: "Workflow-Optionen",
  },
  toolbox: {
    en: "Creator Toolbox",
    de: "Creator Toolbox",
  },
  toolboxHint: {
    en: "All creator workflows — grouped by Create, Edit, Animate, Train, Optimize, and Advanced.",
    de: "Alle Creator-Workflows — gruppiert nach Erstellen, Bearbeiten, Animieren, Trainieren, Optimieren und Erweitert.",
  },
  toolboxSecondaryHint: {
    en: "Edit, animate, train, optimize, and advanced tools — Create lives in Primary Actions above.",
    de: "Bearbeiten, Animieren, Trainieren, Optimieren und Erweitert — Erstellen findest du oben bei den Hauptaktionen.",
  },
} as const;

export const CREDITS_LOW = {
  en: "You need more credits to render this.",
  de: "Du brauchst mehr Credits, um das zu rendern.",
} as const;

export const CREDITS_PAGE = {
  title: { en: "Your Credits", de: "Deine Credits" },
  subtitle: {
    en: "Credits are used for image generation, video rendering and premium creator tools.",
    de: "Credits werden für Bildgenerierung, Video-Rendering und Premium-Creator-Tools verwendet.",
  },
  balance: { en: "Available Credits", de: "Verfügbare Credits" },
  estimatedCost: { en: "Estimated cost", de: "Geschätzte Kosten" },
  afterRender: { en: "After render", de: "Nach dem Rendern" },
  buyCredits: { en: "Buy Credits", de: "Credits kaufen" },
  upgradePlan: { en: "Upgrade Plan", de: "Plan upgraden" },
  mostPopular: { en: "Most Popular", de: "Am beliebtesten" },
  creditPacks: { en: "Credit packs", de: "Credit-Pakete" },
  footerNote: {
    en: "You always see the credit cost before generating.",
    de: "Du siehst die Credit-Kosten immer vor dem Generieren.",
  },
  missingCredits: { en: "Missing", de: "Es fehlen" },
} as const;

export const CREDITS_LOAD_STATE = {
  loadFailed: {
    en: "Could not load credits",
    de: "Credits konnten nicht geladen werden",
  },
  retry: {
    en: "Try again",
    de: "Erneut versuchen",
  },
} as const;

export const REFUND_REASSURANCE = {
  en: "If generation fails, credits are refunded automatically.",
  de: "Schlägt die Generierung fehl, werden Credits automatisch erstattet.",
} as const;

export const STICKY_CREDIT_BAR = {
  mode: { en: "Mode", de: "Modus" },
  available: { en: "Available", de: "Verfügbar" },
  renderImage: { en: "Render image", de: "Bild rendern" },
  renderVideo: { en: "Render video", de: "Video rendern" },
  openPack: { en: "Open pack", de: "Pack öffnen" },
  openCopy: { en: "Open copy tools", de: "Copy-Tools öffnen" },
  openExport: { en: "Open export", de: "Export öffnen" },
} as const;

export const GALLERY_EMPTY = {
  en: "Your Creator Gallery is empty. Create your first asset to get started.",
  de: "Deine Creator Gallery ist leer. Erstelle dein erstes Asset, um loszulegen.",
} as const;

export const IMAGE_LOADING_MESSAGES = {
  en: [
    "Creating your image…",
    "Refining lighting and composition…",
    "Almost ready…",
  ],
  de: [
    "Erstelle dein Bild…",
    "Verfeinere Licht und Komposition…",
    "Fast fertig…",
  ],
} as const;

export const VIDEO_LOADING_MESSAGES = {
  en: [
    "Creating your video…",
    "Building motion and pacing…",
    "Almost ready…",
  ],
  de: [
    "Erstelle dein Video…",
    "Baue Bewegung und Pacing…",
    "Fast fertig…",
  ],
} as const;

export function getEstimatedCostLabel(credits: number, isDe: boolean): string {
  const formatted = credits.toLocaleString(isDe ? "de-DE" : "en-US");
  return isDe
    ? `${CREDITS_PAGE.estimatedCost.de}: ${formatted} Credits`
    : `${CREDITS_PAGE.estimatedCost.en}: ${formatted} credits`;
}

export function getInsufficientCreditsMessage(
  requiredCredits: number,
  isDe: boolean
): string {
  const formatted = requiredCredits.toLocaleString(isDe ? "de-DE" : "en-US");
  return isDe
    ? `${CREDITS_LOW.de} (${formatted} Credits benötigt)`
    : `${CREDITS_LOW.en} (${formatted} credits required)`;
}

export function getNeedMoreCreditsMessage(
  missing: number,
  language: "en" | "de"
): string {
  const isDe = language === "de";
  const formatted = missing.toLocaleString(isDe ? "de-DE" : "en-US");
  const missingLabel = isDe
    ? CREDITS_PAGE.missingCredits.de
    : CREDITS_PAGE.missingCredits.en;
  return isDe
    ? `${missingLabel} ${formatted} Credits.`
    : `${missingLabel} ${formatted} credits.`;
}

export function getGenerateButtonState(input: {
  creditCost: number;
  creditsAvailable: number;
  isDe: boolean;
  isVideo?: boolean;
}) {
  return getGenerateButtonLabel({
    creditCost: input.creditCost,
    creditsAvailable: input.creditsAvailable,
    language: input.isDe ? "de" : "en",
    outputType: input.isVideo ? "video" : "image",
  });
}

export function getStickyRenderCtaLabel(input: {
  creditCost: number;
  language: "en" | "de";
  workflow: "image" | "video" | "pack" | "copy" | "export";
  packCtaLabel?: string;
}): string {
  const { creditCost, language, workflow, packCtaLabel } = input;
  const isDe = language === "de";
  const formatted = creditCost.toLocaleString(isDe ? "de-DE" : "en-US");

  switch (workflow) {
    case "pack":
      return packCtaLabel ?? STICKY_CREDIT_BAR.openPack[language];
    case "copy":
      return STICKY_CREDIT_BAR.openCopy[language];
    case "export":
      return STICKY_CREDIT_BAR.openExport[language];
    case "video":
      return isDe
        ? `${STICKY_CREDIT_BAR.renderVideo.de} · ${formatted} Credits`
        : `${STICKY_CREDIT_BAR.renderVideo.en} · ${formatted} credits`;
    default:
      return isDe
        ? `${STICKY_CREDIT_BAR.renderImage.de} · ${formatted} Credits`
        : `${STICKY_CREDIT_BAR.renderImage.en} · ${formatted} credits`;
  }
}

export function formatCreatePageError(
  payload: {
    error?: string;
    code?: string;
    status?: number;
    refunded?: boolean;
  },
  language: "en" | "de"
): string {
  const isDe = language === "de";
  if (payload.error?.trim()) return payload.error.trim();
  if (payload.refunded) {
    return isDe
      ? "Generierung fehlgeschlagen. Deine Credits wurden erstattet."
      : "Generation failed. Your credits were refunded.";
  }
  return isDe
    ? "Generierung fehlgeschlagen. Bitte versuche es erneut."
    : "Generation failed. Please try again.";
}

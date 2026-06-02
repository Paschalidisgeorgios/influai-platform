/**
 * User-facing model mode guidance — no provider or raw model IDs.
 */

import {
  getModeTagline,
  getModeCreditTitle,
  getModeMarketingDescription,
  getSocialAssetPackMarketingDescription,
  formatModeCreditTitle,
  formatCreditLabel,
  getSocialAssetPackCreditTitle,
  getMotionVideoCreditTitle,
} from "./mode-marketing-copy";

export type ModeCopyEntry = {
  summary: { en: string; de: string };
  bestFor: { en: readonly string[]; de: readonly string[] };
  promptHint: { en: string; de: string };
  outputType: "image" | "video";
};

export {
  getModeTagline,
  getModeCreditTitle,
  getModeMarketingDescription,
  getSocialAssetPackMarketingDescription,
  formatModeCreditTitle,
  formatCreditLabel,
  getSocialAssetPackCreditTitle,
  getMotionVideoCreditTitle,
} from "./mode-marketing-copy";

export const MODE_COPY: Record<string, ModeCopyEntry> = {
  auto_image: {
    summary: {
      en: "Best when you want InfluExAI to choose the right image style automatically.",
      de: "Ideal, wenn InfluExAI automatisch den passenden Bildstil wählen soll.",
    },
    bestFor: {
      en: ["creator visuals", "product shots", "social assets", "quick ideas"],
      de: [
        "Creator-Visuals",
        "Produktshots",
        "Social Assets",
        "schnelle Ideen",
      ],
    },
    promptHint: {
      en: "Describe the subject, setting and mood.",
      de: "Beschreibe Motiv, Setting und Stimmung.",
    },
    outputType: "image",
  },
  fast_draft_image: {
    summary: {
      en: "Quick drafts for testing ideas.",
      de: "Schnelle Entwürfe zum Testen von Ideen.",
    },
    bestFor: {
      en: ["prompt testing", "quick concept exploration", "first drafts"],
      de: ["Prompt-Tests", "schnelle Konzept-Exploration", "Erstentwürfe"],
    },
    promptHint: {
      en: "Keep it short and test different directions.",
      de: "Halte es kurz und teste verschiedene Richtungen.",
    },
    outputType: "image",
  },
  premium_image: {
    summary: {
      en: "More polished visuals with stronger detail for final assets.",
      de: "Poliertere Visuals mit stärkeren Details für finale Assets.",
    },
    bestFor: {
      en: [
        "product visuals",
        "brand-style posts",
        "polished social assets",
        "final images",
      ],
      de: [
        "Produktvisuals",
        "Brand-Posts",
        "polierte Social Assets",
        "Finale Bilder",
      ],
    },
    promptHint: {
      en: "Add details about lighting, surface, camera angle and mood.",
      de: "Ergänze Licht, Oberfläche, Kamerawinkel und Stimmung.",
    },
    outputType: "image",
  },
  realtime_image: {
    summary: {
      en: "Explore visual directions quickly.",
      de: "Visuelle Richtungen schnell erkunden.",
    },
    bestFor: {
      en: ["brainstorming", "early compositions", "quick style checks"],
      de: ["Brainstorming", "frühe Kompositionen", "schnelle Stil-Checks"],
    },
    promptHint: {
      en: "Use simple visual ideas and iterate quickly.",
      de: "Nutze einfache visuelle Ideen und iteriere schnell.",
    },
    outputType: "image",
  },
  auto_video: {
    summary: {
      en: "Render a short motion clip for social content.",
      de: "Kurzen Motion-Clip für Social Content rendern.",
    },
    bestFor: {
      en: [
        "creator reels",
        "product motion",
        "lifestyle clips",
        "social video ideas",
      ],
      de: [
        "Creator Reels",
        "Produkt-Motion",
        "Lifestyle-Clips",
        "Social-Video-Ideen",
      ],
    },
    promptHint: {
      en: "Describe the movement, camera style and visual mood.",
      de: "Beschreibe Bewegung, Kamerastil und visuelle Stimmung.",
    },
    outputType: "video",
  },
  cinematic_text_video: {
    summary: {
      en: "Best for cinematic social videos with motion, lighting and atmosphere.",
      de: "Ideal für cinematic Social-Videos mit Bewegung, Licht und Atmosphäre.",
    },
    bestFor: {
      en: [
        "premium product video",
        "fashion/lifestyle video",
        "cinematic creator clips",
        "social ads",
      ],
      de: [
        "Premium-Produktvideo",
        "Fashion/Lifestyle-Video",
        "cinematic Creator-Clips",
        "Social Ads",
      ],
    },
    promptHint: {
      en: "Add camera movement, subject movement, lighting and format.",
      de: "Ergänze Kamerabewegung, Motivbewegung, Licht und Format.",
    },
    outputType: "video",
  },
};

/** Short hover tooltips for compact mode chips — no provider names. */
export const MODE_HOVER_HINT: Record<string, { en: string; de: string }> = {
  auto_image: { en: "Best all-round choice", de: "Beste Allround-Wahl" },
  fast_draft_image: {
    en: "Quick drafts for testing ideas",
    de: "Schnelle Entwürfe zum Testen von Ideen",
  },
  premium_image: {
    en: "Stronger detail for final assets",
    de: "Stärkere Details für finale Assets",
  },
  realtime_image: {
    en: "Explore directions quickly",
    de: "Richtungen schnell erkunden",
  },
  auto_video: { en: "Short motion for social", de: "Kurzer Motion für Social" },
  cinematic_text_video: {
    en: "Premium cinematic motion",
    de: "Premium cinematic Motion",
  },
};

export function getModeHoverHint(
  modelModeId: string,
  language: "en" | "de" = "en"
): string {
  const entry = MODE_HOVER_HINT[modelModeId];
  if (!entry) return getModeSummary(modelModeId, language);
  return language === "de" ? entry.de : entry.en;
}

export function getModeCopy(
  modelModeId: string,
  language: "en" | "de" = "en"
): ModeCopyEntry | null {
  return MODE_COPY[modelModeId] ?? null;
}

export function getModeSummary(
  modelModeId: string,
  language: "en" | "de" = "en"
): string {
  const tagline = getModeTagline(modelModeId, language);
  if (tagline) return tagline;
  const entry = MODE_COPY[modelModeId];
  if (!entry) return "";
  return language === "de" ? entry.summary.de : entry.summary.en;
}

export function getModeBestFor(
  modelModeId: string,
  language: "en" | "de" = "en"
): string[] {
  const entry = MODE_COPY[modelModeId];
  if (!entry) return [];
  return [...(language === "de" ? entry.bestFor.de : entry.bestFor.en)];
}

export function getModePromptHint(
  modelModeId: string,
  language: "en" | "de" = "en"
): string {
  const entry = MODE_COPY[modelModeId];
  if (!entry) return "";
  return language === "de" ? entry.promptHint.de : entry.promptHint.en;
}

export function getModeOutputType(
  modelModeId: string
): "image" | "video" | null {
  return MODE_COPY[modelModeId]?.outputType ?? null;
}

export function formatBestForLine(
  modelModeId: string,
  language: "en" | "de" = "en"
): string {
  const items = getModeBestFor(modelModeId, language);
  if (!items.length) return "";
  const prefix = language === "de" ? "Ideal für" : "Best for";
  return `${prefix}: ${items.join(" · ")}`;
}

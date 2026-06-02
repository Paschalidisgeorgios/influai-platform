/**
 * User-facing render mode copy — taglines + credit labels from centralized costs.
 */

import { resolveCreditCostForModelMode } from "@/app/lib/billing/credit-costs";
import { getSocialAssetPackTotalCredits } from "@/app/lib/packs/social-asset-pack";
import { getModelModeById } from "./model-modes";

export type ModeTagline = { en: string; de: string };

/** Value-focused taglines — no provider names, no overpromising. */
export const MODE_TAGLINES: Record<string, ModeTagline> = {
  auto_image: {
    en: "Best balance of quality and speed for your prompt.",
    de: "Beste Balance aus Qualität und Geschwindigkeit für deinen Prompt.",
  },
  fast_draft_image: {
    en: "Quick drafts for testing ideas.",
    de: "Schnelle Entwürfe zum Testen von Ideen.",
  },
  premium_image: {
    en: "More polished visuals with stronger detail for final assets.",
    de: "Poliertere Visuals mit stärkeren Details für finale Assets.",
  },
  realtime_image: {
    en: "Explore visual directions quickly.",
    de: "Visuelle Richtungen schnell erkunden.",
  },
  auto_video: {
    en: "Render a short motion clip for social content.",
    de: "Kurzen Motion-Clip für Social Content rendern.",
  },
  cinematic_text_video: {
    en: "Cinematic motion, lighting and atmosphere for premium clips.",
    de: "Cinematic Motion, Licht und Atmosphäre für Premium-Clips.",
  },
};

export const SOCIAL_ASSET_PACK_TAGLINE: ModeTagline = {
  en: "Create images, a motion clip, hooks, captions, hashtags and export-ready formats.",
  de: "Erstelle Bilder, einen Motion-Clip, Hooks, Captions, Hashtags und export-fertige Formate.",
};

export function formatCreditLabel(
  credits: number,
  language: "en" | "de"
): string {
  const formatted = credits.toLocaleString(
    language === "de" ? "de-DE" : "en-US"
  );
  if (language === "de") {
    return credits === 1 ? "1 Credit" : `${formatted} Credits`;
  }
  return credits === 1 ? "1 Credit" : `${formatted} Credits`;
}

export function formatModeCreditTitle(
  label: string,
  credits: number,
  language: "en" | "de"
): string {
  return `${label} — ${formatCreditLabel(credits, language)}`;
}

export function getModeTagline(
  modelModeId: string,
  language: "en" | "de"
): string {
  const entry = MODE_TAGLINES[modelModeId];
  if (entry) return language === "de" ? entry.de : entry.en;
  const mode = getModelModeById(modelModeId);
  return mode?.description ?? "";
}

export function getModeCreditTitle(
  modelModeId: string,
  language: "en" | "de"
): string {
  const mode = getModelModeById(modelModeId);
  if (!mode) return "";
  const credits = resolveCreditCostForModelMode(modelModeId);
  return formatModeCreditTitle(mode.label, credits, language);
}

export function getSocialAssetPackCreditTitle(
  language: "en" | "de"
): string {
  return formatModeCreditTitle(
    "Social Asset Pack",
    getSocialAssetPackTotalCredits(),
    language
  );
}

export function getMotionVideoCreditTitle(
  language: "en" | "de"
): string {
  return getModeCreditTitle("auto_video", language);
}

/** Tooltip / drawer: credit line + tagline. */
export function getModeMarketingDescription(
  modelModeId: string,
  language: "en" | "de"
): { creditTitle: string; tagline: string } {
  return {
    creditTitle: getModeCreditTitle(modelModeId, language),
    tagline: getModeTagline(modelModeId, language),
  };
}

export function getSocialAssetPackMarketingDescription(
  language: "en" | "de"
): { creditTitle: string; tagline: string } {
  return {
    creditTitle: getSocialAssetPackCreditTitle(language),
    tagline:
      language === "de"
        ? SOCIAL_ASSET_PACK_TAGLINE.de
        : SOCIAL_ASSET_PACK_TAGLINE.en,
  };
}

/** Sync registry `description` fields from taglines (EN). */
export function getModeRegistryDescription(modelModeId: string): string {
  return MODE_TAGLINES[modelModeId]?.en ?? "";
}

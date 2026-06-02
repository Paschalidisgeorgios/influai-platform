import { getModelExplanation } from "@/app/lib/copy/model-explanations";
import {
  CREATOR_TOOL_DETAILS,
  type CreatorToolOutputType,
} from "@/app/lib/tools/creator-tools";
import {
  STUDIO_CATEGORIES,
  STUDIO_CATEGORY_ORDER,
  resolveStudioCategoryTools,
  type StudioCategoryId,
  type StudioCategoryToolView,
} from "@/app/lib/studio/studio-categories";
import { getPublicToolStatusLabel } from "@/app/lib/tools/tool-status";

export type LandingLanguage = "en" | "de";

export type ModelExplorerCategory = {
  id: StudioCategoryId;
  label: string;
  description: string;
  tools: StudioCategoryToolView[];
};

const OUTPUT_TYPE_LABELS: Record<
  CreatorToolOutputType,
  { en: string; de: string }
> = {
  image: { en: "Image", de: "Bild" },
  video: { en: "Video", de: "Video" },
  pack: { en: "Pack", de: "Pack" },
  prompt: { en: "Copy", de: "Text" },
  analysis: { en: "Score", de: "Score" },
  three_d: { en: "3D asset", de: "3D-Asset" },
  audio: { en: "Audio", de: "Audio" },
  model: { en: "Reusable style", de: "Wiederverwendbarer Stil" },
};

export function getOutputTypeLabel(
  outputType: CreatorToolOutputType,
  language: LandingLanguage
): string {
  const row = OUTPUT_TYPE_LABELS[outputType];
  return language === "de" ? row.de : row.en;
}

/** One-line benefit for landing cards — canonical copy from model-explanations. */
export function getLandingToolBenefit(
  view: StudioCategoryToolView,
  language: LandingLanguage
): string {
  const curated = getModelExplanation(view.id, language);
  if (curated) return curated;
  return view.description;
}

export function formatLandingCreditsLine(
  view: StudioCategoryToolView,
  language: LandingLanguage
): string | null {
  const isDe = language === "de";
  const locale = isDe ? "de-DE" : "en-US";
  const detail = CREATOR_TOOL_DETAILS[view.id];

  if (view.canRun && view.status === "live") {
    if (view.estimatedCredits != null && view.estimatedCredits > 0) {
      const n = view.estimatedCredits.toLocaleString(locale);
      return view.estimatedCredits === 1
        ? isDe
          ? "1 Credit"
          : "1 credit"
        : isDe
          ? `${n} Credits`
          : `${n} credits`;
    }
    if (view.estimatedCredits === 0) {
      return isDe ? "Kostenlos" : "Free";
    }
    return null;
  }

  const estimateLabel = isDe
    ? detail?.creditsEstimateDe
    : detail?.creditsEstimateEn;

  if (estimateLabel?.trim()) {
    return estimateLabel.trim();
  }

  if (view.estimatedCredits != null && view.estimatedCredits > 0) {
    const prefix = isDe ? "ca." : "est.";
    const n = view.estimatedCredits.toLocaleString(locale);
    return `${prefix} ${n} ${isDe ? "Credits" : "credits"}`;
  }

  if (
    view.status === "preview" ||
    view.status === "request_access" ||
    view.status === "coming_soon" ||
    view.status === "blocked"
  ) {
    if (detail?.estimatedCredits === 0) {
      return isDe ? "Keine Credits in der Vorschau" : "No credits in preview";
    }
    return isDe ? "Keine Credits bis Freischaltung" : "No credits until live";
  }

  return null;
}

export function getLandingToolStatusLabel(
  view: StudioCategoryToolView,
  language: LandingLanguage
): string {
  return getPublicToolStatusLabel(view.status, language);
}

export function resolveModelExplorerCategories(
  language: LandingLanguage
): ModelExplorerCategory[] {
  const ctx = { language };
  return STUDIO_CATEGORY_ORDER.map((categoryId) => {
    const def = STUDIO_CATEGORIES.find((c) => c.id === categoryId)!;
    return {
      id: categoryId,
      label: language === "de" ? def.labelDe : def.labelEn,
      description:
        language === "de" ? def.descriptionDe : def.descriptionEn,
      tools: resolveStudioCategoryTools(categoryId, ctx),
    };
  }).filter((category) => category.tools.length > 0);
}

/**
 * Maps API preview/render payloads → showcase UI data (no provider fields).
 */

import {
  SHOWCASE_VARIATION_IMAGES,
  SOCIAL_ASSET_PACK_SHOWCASE_DEMO,
} from "@/app/lib/showcase/social-asset-pack-showcase-demo";
import type {
  SocialAssetPackPreviewResponse,
  SocialAssetPackRenderResponse,
} from "@/app/lib/packs/types";
import { CREATIVE_SCORE_DIMENSION_LABELS } from "@/lib/copy/creative-score-copy";
import type { PackScoreDimension, PackShowcaseData } from "./pack-showcase-types";

const PACK_SCORE_DIMENSION_IDS = [
  "hook_clarity",
  "subject_focus",
  "format_fit",
  "mobile_readability",
] as const;

function labelsFromLanguage(language: "en" | "de") {
  const demo = SOCIAL_ASSET_PACK_SHOWCASE_DEMO[language];
  return {
    ideaLabel: demo.ideaLabel,
    proofLine: demo.proofLine,
    outputs: demo.outputs,
    variationLabels: demo.variationLabels,
    motionClipHint: demo.motionClipHint,
    progressLabel: demo.progressLabel,
  };
}

function mapScoreDimensions(
  dimensions: readonly { id: string; score: number }[],
  language: "en" | "de"
): PackScoreDimension[] {
  return PACK_SCORE_DIMENSION_IDS.map((id) => {
    const match = dimensions.find((d) => d.id === id);
    const labels = CREATIVE_SCORE_DIMENSION_LABELS[id];
    return {
      id,
      label: labels[language],
      score: match?.score ?? 0,
    };
  }).filter((d) => d.score > 0);
}

function findWeakestId(dimensions: readonly PackScoreDimension[]): string | undefined {
  if (!dimensions.length) return undefined;
  return dimensions.reduce((weakest, current) =>
    current.score < weakest.score ? current : weakest
  ).id;
}

function demoScoreDimensions(language: "en" | "de"): PackScoreDimension[] {
  const demo = SOCIAL_ASSET_PACK_SHOWCASE_DEMO[language];
  return mapScoreDimensions(demo.scoreDimensions, language);
}

export function demoShowcaseData(language: "en" | "de"): PackShowcaseData {
  const demo = SOCIAL_ASSET_PACK_SHOWCASE_DEMO[language];
  const scoreDimensions = demoScoreDimensions(language);
  return {
    title: demo.title,
    subtitle: demo.subtitle,
    badgeLabel: demo.label,
    idea: demo.idea,
    improvedPrompt: demo.improvedPrompt,
    hooks: demo.hooks,
    captions: demo.captions,
    hashtags: demo.hashtags,
    scoreValue: demo.scoreValue,
    scoreHint: demo.scoreHint,
    scoreDimensions,
    weakestDimensionId: demo.weakestDimensionId,
    scorePreview: false,
    formatSuggestions: ["TikTok", "Reels", "Story", "Feed"],
    labels: labelsFromLanguage(language),
    imageUrls: [...SHOWCASE_VARIATION_IMAGES],
    showMotionPlaceholder: true,
  };
}

export function previewToShowcaseData(
  preview: SocialAssetPackPreviewResponse,
  prompt: string,
  language: "en" | "de"
): PackShowcaseData {
  const demo = SOCIAL_ASSET_PACK_SHOWCASE_DEMO[language];
  const hashtagLine = preview.hashtags.join(" ");
  const scoreDimensions = mapScoreDimensions(
    preview.creativeScorePreview.dimensions,
    language
  );
  const weakestId = findWeakestId(scoreDimensions);
  const scoreHint =
    preview.creativeScorePreview.positives[0] ??
    (language === "de"
      ? "Starke Hook-Klarheit und visueller Fokus."
      : "Strong hook clarity and visual focus.");

  return {
    title: preview.packName,
    subtitle: demo.subtitle,
    badgeLabel: language === "de" ? "Workflow-Vorschau" : "Workflow Preview",
    idea: prompt.trim(),
    improvedPrompt: preview.improvedPrompt,
    hooks: preview.hooks,
    captions: preview.captions,
    hashtags: hashtagLine,
    scoreValue: preview.creativeScorePreview.score,
    scoreHint,
    scoreDimensions,
    weakestDimensionId: weakestId,
    scorePreview: true,
    formatSuggestions: preview.formatSuggestions,
    estimatedCredits: preview.estimatedCredits,
    labels: labelsFromLanguage(language),
    imageUrls: [null, null, null],
    showMotionPlaceholder: true,
  };
}

export function renderToShowcaseData(
  result: SocialAssetPackRenderResponse,
  language: "en" | "de"
): PackShowcaseData {
  const demo = SOCIAL_ASSET_PACK_SHOWCASE_DEMO[language];
  const imageUrls: (string | null)[] = result.assets.images.map((a) => a.assetUrl);
  while (imageUrls.length < 3) imageUrls.push(null);

  const hasRealScore = Boolean(result.creativeScore);
  const scoreValue = result.creativeScore?.score ?? 0;

  return {
    title: result.packName,
    subtitle: demo.subtitle,
    badgeLabel:
      result.status === "completed"
        ? language === "de"
          ? "Pack fertig"
          : "Pack ready"
        : result.status === "partial"
          ? language === "de"
            ? "Pack teilweise fertig"
            : "Pack partially ready"
          : language === "de"
            ? "Rendering fehlgeschlagen"
            : "Rendering failed",
    idea: result.improvedPrompt,
    improvedPrompt: result.improvedPrompt,
    hooks: result.hooks,
    captions: result.captions,
    hashtags: result.hashtags.join(" "),
    scoreValue: hasRealScore ? scoreValue : demo.scoreValue,
    scoreHint: hasRealScore
      ? result.creativeScore!.positives?.[0] ??
        (language === "de"
          ? "Starke Hook-Klarheit und visueller Fokus."
          : "Strong hook clarity and visual focus.")
      : language === "de"
        ? "Score-Vorschau — finaler Score folgt nach dem Rendern."
        : "Score preview — final score runs after rendering.",
    scoreDimensions: undefined,
    weakestDimensionId: undefined,
    scorePreview: !hasRealScore,
    formatSuggestions: result.formatSuggestions,
    estimatedCredits: result.estimatedCredits,
    labels: labelsFromLanguage(language),
    imageUrls: imageUrls.slice(0, 3),
    videoUrl: result.assets.videos[0]?.assetUrl ?? null,
    showMotionPlaceholder: result.assets.videos.length === 0,
  };
}

export function renderingShowcaseData(
  prompt: string,
  improvedPrompt: string | undefined,
  language: "en" | "de"
): PackShowcaseData {
  const demo = SOCIAL_ASSET_PACK_SHOWCASE_DEMO[language];
  return {
    title: demo.title,
    subtitle: demo.subtitle,
    badgeLabel: language === "de" ? "Pack wird gerendert…" : "Rendering pack…",
    idea: prompt.trim(),
    improvedPrompt: improvedPrompt?.trim(),
    hooks: [],
    captions: [],
    hashtags: "",
    scoreValue: 0,
    scoreHint: "",
    labels: labelsFromLanguage(language),
    imageUrls: [null, null, null],
    showMotionPlaceholder: true,
  };
}

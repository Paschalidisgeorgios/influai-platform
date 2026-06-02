import {
  CREATIVE_SCORE_DIMENSION_LABELS,
  type CreativeScoreDimensionId,
} from "@/lib/copy/creative-score-copy";

export type CreativeScoreDimensionRow = {
  id: CreativeScoreDimensionId;
  score: number;
};

export function clampCreativeScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

const LEGACY_DIMENSION_MAP: Record<string, CreativeScoreDimensionId> = {
  format_readiness: "format_fit",
  thumbnail_strength: "scroll_stop_potential",
  ad_readiness: "brand_consistency",
  contrast: "brand_consistency",
  caption_potential: "hook_clarity",
};

export function normalizeCreativeScoreDimensionId(
  id: string
): CreativeScoreDimensionId | null {
  if (id in CREATIVE_SCORE_DIMENSION_LABELS) {
    return id as CreativeScoreDimensionId;
  }
  return LEGACY_DIMENSION_MAP[id] ?? null;
}

export function findWeakestDimension(
  dimensions: CreativeScoreDimensionRow[]
): CreativeScoreDimensionRow | null {
  if (!dimensions.length) return null;
  return dimensions.reduce((weakest, current) =>
    current.score < weakest.score ? current : weakest
  );
}

export function getDimensionLabel(
  id: CreativeScoreDimensionId,
  language: "en" | "de"
): string {
  return CREATIVE_SCORE_DIMENSION_LABELS[id][language];
}

export function getRecommendedFixForDimension(
  id: CreativeScoreDimensionId,
  language: "en" | "de"
): string {
  const fixes: Record<CreativeScoreDimensionId, { en: string; de: string }> = {
    hook_clarity: {
      en: "Sharpen the opening line and lead with the payoff in the first second.",
      de: "Opening schärfen und den Payoff in der ersten Sekunde zeigen.",
    },
    subject_focus: {
      en: "Make the hero subject larger and remove competing elements.",
      de: "Hauptmotiv vergrößern und konkurrierende Elemente entfernen.",
    },
    mobile_readability: {
      en: "Make the subject larger, reduce background noise and shorten the hook.",
      de: "Motiv vergrößern, Hintergrund reduzieren und Hook kürzen.",
    },
    format_fit: {
      en: "Crop for the target platform (9:16 Reels or 4:5 Feed) and center the subject.",
      de: "Für das Zielformat (9:16 Reels oder 4:5 Feed) croppen und Motiv zentrieren.",
    },
    scroll_stop_potential: {
      en: "Add stronger contrast, a tighter crop, and a clear focal point in the first frame.",
      de: "Mehr Kontrast, engerer Crop und klaren Fokuspunkt im ersten Frame setzen.",
    },
    brand_consistency: {
      en: "Align colors, lighting, and styling with your brand palette.",
      de: "Farben, Licht und Stil an deine Brand-Palette angleichen.",
    },
  };

  return fixes[id][language];
}

/** Advisory estimate only — not a guaranteed future score. */
export function estimatePotentialScoreAfterFix(
  currentScore: number,
  weakestScore: number
): number {
  const headroom = 100 - weakestScore;
  const lift = Math.round(headroom * 0.45);
  return clampCreativeScore(currentScore + Math.max(4, Math.min(18, lift)));
}

export function formatWeakestPointLine(
  dimension: CreativeScoreDimensionRow,
  language: "en" | "de"
): string {
  const label = getDimensionLabel(dimension.id, language);
  return language === "de"
    ? `Schwächster Punkt: ${label} — ${dimension.score}/100`
    : `Weakest point: ${label} — ${dimension.score}/100`;
}

/** Summarize dimension lifts for before/after — approximate, not guaranteed. */
export function buildWhatChangedSummary(
  before: CreativeScoreDimensionRow[],
  after: CreativeScoreDimensionRow[],
  language: "en" | "de",
  appliedFix?: string
): string[] {
  const lines: string[] = [];
  const afterById = new Map(after.map((d) => [d.id, d.score]));

  for (const dim of before) {
    const next = afterById.get(dim.id);
    if (next === undefined || next <= dim.score) continue;
    const delta = next - dim.score;
    const label = getDimensionLabel(dim.id, language);
    lines.push(
      language === "de"
        ? `${label} ~+${delta} (geschätzt)`
        : `${label} ~+${delta} (estimated)`
    );
  }

  if (appliedFix?.trim()) {
    lines.unshift(appliedFix.trim());
  }

  if (lines.length === 0) {
    lines.push(
      language === "de"
        ? "Verbesserter Prompt und Fokus auf den schwächsten Punkt angewendet."
        : "Applied improved prompt targeting the weakest subscore."
    );
  }

  return lines.slice(0, 6);
}

export function pickBestExportUrl(
  originalUrl: string,
  improvedUrl: string,
  originalScore: number,
  improvedScore: number | null
): string {
  if (improvedScore !== null && improvedScore >= originalScore) {
    return improvedUrl;
  }
  return originalUrl;
}

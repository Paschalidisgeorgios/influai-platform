/** Creative Score UI copy — advisory only, no virality claims. */

export const CREATIVE_SCORE_DIMENSION_LABELS = {
  hook_clarity: { en: "Hook Clarity", de: "Hook-Klarheit" },
  subject_focus: { en: "Subject Focus", de: "Motivfokus" },
  mobile_readability: { en: "Mobile Readability", de: "Mobile-Lesbarkeit" },
  format_fit: { en: "Format Fit", de: "Format-Passung" },
  scroll_stop_potential: {
    en: "Scroll-Stop Potential",
    de: "Scroll-Stop-Potenzial",
  },
  brand_consistency: { en: "Brand Consistency", de: "Brand-Konsistenz" },
} as const;

export type CreativeScoreDimensionId =
  keyof typeof CREATIVE_SCORE_DIMENSION_LABELS;

export const CREATIVE_SCORE_PANEL_COPY = {
  en: {
    advisory: "Advisory feedback only — not a performance guarantee.",
    calculating: "Analyzing asset …",
    scoreLabel: "Creative Score",
    scoreFormat: (score: number) => `Creative Score: ${score}/100`,
    subscoresLabel: "Subscores",
    weakestPointLabel: "Weakest point",
    recommendedFixLabel: "Recommended fix",
    estimatedImprovementLabel: "Estimated improvement",
    potentialScoreLabel: "Potential score after fix",
    potentialScoreNote: "Approximate — not a guaranteed future score.",
    improvedPromptLabel: "Improved prompt",
    improveAssetCta: (credits: number) =>
      credits === 1
        ? `Improve this asset · ${credits} Credit`
        : `Improve this asset · ${credits} Credits`,
    previewImprovementCta: "Preview improvement",
    improveCost: (credits: number) =>
      credits === 1
        ? `${credits} credit charged when rendering starts.`
        : `${credits} credits charged when rendering starts.`,
    improvePromptOnly:
      "Shows an improved prompt preview — no credits until you choose to render.",
    improvedPromptNote:
      "Apply this to your next render when no validated variant workflow is available.",
    useImprovedPrompt: "Copy improved prompt",
    insufficientCredits: "Not enough credits for an improved variant.",
    runAgain: "Run again",
    beforeAfterTitle: "Before & after",
    originalLabel: "Original",
    improvedLabel: "Improved version",
    savedToGallery:
      "Improved version saved to Creator Gallery — original preserved.",
    comparisonTitle: "Before & after",
    comparisonSubtitle:
      "Both versions are in your Gallery — compare scores and pick what to export.",
    originalScoreLabel: "Original score",
    improvedScoreLabel: "Improved score",
    scoringImproved: "Scoring improved version…",
    scoreDeltaApprox: (delta: number) =>
      delta > 0
        ? `~+${delta} estimated vs original (not a performance guarantee).`
        : delta < 0
          ? `~${delta} vs original — advisory only.`
          : "Similar advisory score — review visually before exporting.",
    whatChangedLabel: "What changed",
    exportBestCta: "Export best version",
    createAnotherCta: "Create another improvement",
    newHookLabel: "New hook",
    newCaptionLabel: "New caption",
    whatWorks: "What works",
    whatToImprove: "What to improve",
    suggestedHook: "Suggested hook",
    suggestedCaption: "Suggested caption",
    hashtags: "Hashtags",
  },
  de: {
    advisory: "Nur beratendes Feedback — keine Leistungsgarantie.",
    calculating: "Asset wird analysiert …",
    scoreLabel: "Creative Score",
    scoreFormat: (score: number) => `Creative Score: ${score}/100`,
    subscoresLabel: "Teilwerte",
    weakestPointLabel: "Schwächster Punkt",
    recommendedFixLabel: "Empfohlener Fix",
    estimatedImprovementLabel: "Geschätzte Verbesserung",
    potentialScoreLabel: "Potenzial nach Fix",
    potentialScoreNote:
      "Ungefähre Schätzung — keine garantierte Zukunftsbewertung.",
    improvedPromptLabel: "Verbesserter Prompt",
    improveAssetCta: (credits: number) =>
      credits === 1
        ? `Asset verbessern · ${credits} Credit`
        : `Asset verbessern · ${credits} Credits`,
    previewImprovementCta: "Verbesserung ansehen",
    improveCost: (credits: number) =>
      credits === 1
        ? `${credits} Credit wird beim Rendern abgebucht.`
        : `${credits} Credits werden beim Rendern abgebucht.`,
    improvePromptOnly:
      "Zeigt eine verbesserte Prompt-Vorschau — keine Credits, bis du renderst.",
    improvedPromptNote:
      "Für den nächsten Render nutzen, wenn kein validierter Varianten-Workflow verfügbar ist.",
    useImprovedPrompt: "Verbesserten Prompt kopieren",
    insufficientCredits: "Nicht genug Credits für eine verbesserte Variante.",
    runAgain: "Erneut prüfen",
    beforeAfterTitle: "Vorher & Nachher",
    originalLabel: "Original",
    improvedLabel: "Verbesserte Version",
    savedToGallery:
      "Verbesserte Version in der Creator Gallery gespeichert — Original bleibt erhalten.",
    comparisonTitle: "Vorher & Nachher",
    comparisonSubtitle:
      "Beide Versionen sind in deiner Gallery — vergleiche Scores und wähle, was du exportierst.",
    originalScoreLabel: "Original-Score",
    improvedScoreLabel: "Verbesserter Score",
    scoringImproved: "Verbesserte Version wird bewertet…",
    scoreDeltaApprox: (delta: number) =>
      delta > 0
        ? `~+${delta} geschätzt vs. Original (keine Leistungsgarantie).`
        : delta < 0
          ? `~${delta} vs. Original — nur beratend.`
          : "Ähnlicher Score — visuell prüfen vor dem Export.",
    whatChangedLabel: "Was sich geändert hat",
    exportBestCta: "Beste Version exportieren",
    createAnotherCta: "Weitere Verbesserung",
    newHookLabel: "Neuer Hook",
    newCaptionLabel: "Neue Caption",
    whatWorks: "Was funktioniert",
    whatToImprove: "Was verbessern",
    suggestedHook: "Vorgeschlagener Hook",
    suggestedCaption: "Vorgeschlagene Caption",
    hashtags: "Hashtags",
  },
} as const;

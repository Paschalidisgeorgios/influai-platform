/**
 * Social Asset Pack — preview builder (local only, no image/video provider calls).
 */

import type {
  SocialAssetFormatSuggestion,
  SocialAssetPackCopy,
  SocialAssetPackIncludedOutputs,
  SocialAssetPackPreviewResponse,
  SocialAssetPlanItem,
  SocialAssetPackRenderConfig,
} from "./types";
import { buildRuleBasedCreativeScore } from "@/lib/intelligence/creative-score-engine";
import {
  buildCaptionsFromScript,
  buildHashtags,
  buildHooks,
  extractProductLabel,
  HOOKS_CAPTIONS_CAPTION_COUNT,
  HOOKS_CAPTIONS_HOOK_COUNT,
} from "@/app/lib/copy/hooks-captions";
import { generateCampaignExpansion } from "@/lib/intelligence/campaign-expansion-engine";

export const SOCIAL_ASSET_PACK_ID = "social_asset_pack";

export const SOCIAL_ASSET_PACK_NAME = "Social Asset Pack";

/** Estimated credits when the full pack is rendered (not charged during preview). */
export const SOCIAL_ASSET_PACK_ESTIMATED_CREDITS = 45;

/** Active model modes only — validated at render time before provider calls. */
export const SOCIAL_ASSET_PACK_RENDER_CONFIG: SocialAssetPackRenderConfig = {
  packId: SOCIAL_ASSET_PACK_ID,
  totalCredits: SOCIAL_ASSET_PACK_ESTIMATED_CREDITS,
  limits: {
    maxImageVariants: 3,
    maxVideoClips: 1,
    maxRetries: 1,
  },
  videoDurationSeconds: 5,
  imageModelModeIds: [
    "fast_draft_image",
    "premium_image",
    "auto_image",
  ],
  videoModelModeId: "auto_video",
  creditAllocation: {
    perImageVariant: 5,
    videoClip: 25,
    copyBundle: 5,
  },
  imageOutputFormats: ["square", "tiktok", "square"],
};

export function getSocialAssetPackTotalCredits(): number {
  return SOCIAL_ASSET_PACK_RENDER_CONFIG.totalCredits;
}

/** Throws if pack credit allocation does not match the advertised total. */
export function assertSocialAssetPackCreditTotals(): void {
  const config = SOCIAL_ASSET_PACK_RENDER_CONFIG;
  const expected =
    config.limits.maxImageVariants * config.creditAllocation.perImageVariant +
    config.limits.maxVideoClips * config.creditAllocation.videoClip +
    config.creditAllocation.copyBundle;

  if (expected !== config.totalCredits) {
    throw new Error(
      `Social Asset Pack credit total mismatch: expected ${expected}, configured ${config.totalCredits}`
    );
  }
}

/** Launch workflow metadata — credit-gated render with free preview. */
export const SOCIAL_ASSET_PACK_TOOL = {
  id: SOCIAL_ASSET_PACK_ID,
  labelEn: "Social Asset Pack",
  labelDe: "Social Asset Pack",
  status: "credit_gated" as const,
  allowsFreePreview: true,
  creditCost: SOCIAL_ASSET_PACK_ESTIMATED_CREDITS,
  descriptionEn:
    "Turn one idea into images, a motion clip, hooks, captions, hashtags and export-ready formats.",
  descriptionDe:
    "Verwandle eine Idee in Bilder, einen Motion-Clip, Hooks, Captions, Hashtags und export-fertige Formate.",
} as const;

export function getSocialAssetPackToolCopy(language: "en" | "de" = "en") {
  const isDe = language === "de";
  return {
    label: isDe
      ? SOCIAL_ASSET_PACK_TOOL.labelDe
      : SOCIAL_ASSET_PACK_TOOL.labelEn,
    description: isDe
      ? SOCIAL_ASSET_PACK_TOOL.descriptionDe
      : SOCIAL_ASSET_PACK_TOOL.descriptionEn,
    creditCost: SOCIAL_ASSET_PACK_TOOL.creditCost,
    allowsFreePreview: SOCIAL_ASSET_PACK_TOOL.allowsFreePreview,
  };
}

export function formatPackRenderCta(
  credits: number,
  language: "en" | "de"
): string {
  const formatted = credits.toLocaleString(
    language === "de" ? "de-DE" : "en-US"
  );
  return language === "de"
    ? `Social Asset Pack rendern · ${formatted} Credits`
    : `Render Social Asset Pack · ${formatted} Credits`;
}

/** User-facing cost breakdown for the full pack render. */
export function getSocialAssetPackCostNote(language: "en" | "de"): string {
  const credits = getSocialAssetPackTotalCredits();
  const formatted = credits.toLocaleString(
    language === "de" ? "de-DE" : "en-US"
  );
  return language === "de"
    ? `${formatted} Credits enthalten 3 Bildvarianten, 1 Motion-Clip, Hooks, Captions, Hashtags, Creative Score und Export Pack.`
    : `${formatted} Credits include 3 image variations, 1 motion clip, hooks, captions, hashtags, Creative Score and Export Pack.`;
}

export function getSocialAssetPackPreviewFreeNote(language: "en" | "de"): string {
  return language === "de"
    ? "Die Vorschau ist kostenlos. Es werden keine Credits verbraucht."
    : "Preview is free. No credits are used.";
}

export function getSocialAssetPackRefundNote(language: "en" | "de"): string {
  return language === "de"
    ? "Schlägt ein Teil des Renderings fehl, werden Credits für den fehlgeschlagenen Teil automatisch erstattet."
    : "If part of the render fails, credits for the failed part are refunded automatically.";
}

export function getSocialAssetPackBuyCreditsLabel(language: "en" | "de"): string {
  return language === "de" ? "Credits kaufen" : "Buy Credits";
}

export function getSocialAssetPackIncludedListItems(
  language: "en" | "de"
): readonly string[] {
  const isDe = language === "de";
  return [
    isDe ? "3 Bild-Varianten" : "3 image variations",
    isDe ? "1 Motion-Clip" : "1 motion clip",
    isDe ? "5 Hooks" : "5 hooks",
    isDe ? "3 Captions" : "3 captions",
    isDe ? "Hashtags" : "hashtags",
    "TikTok / Reels / Story / Feed",
    "Creative Score",
    "Export Pack",
  ];
}

export function packWorkflowKey(
  packJobId: string,
  slot: string
): string {
  return `${SOCIAL_ASSET_PACK_ID}:${packJobId}:${slot}`;
}

export function parsePackJobIdFromWorkflow(
  workflow: string | null | undefined
): string | null {
  if (!workflow?.startsWith(`${SOCIAL_ASSET_PACK_ID}:`)) return null;
  const parts = workflow.split(":");
  return parts[1] ?? null;
}

export const SOCIAL_ASSET_PACK_INCLUDED_OUTPUTS: SocialAssetPackIncludedOutputs =
  {
    imageVariations: 3,
    motionClips: 1,
    hooks: 5,
    captions: 3,
    hashtags: true,
    creativeScore: true,
    exportPackage: true,
  };

export const SOCIAL_ASSET_PACK_FORMAT_SUGGESTIONS: readonly SocialAssetFormatSuggestion[] =
  ["TikTok", "Reels", "Story", "Feed"];

export const SOCIAL_ASSET_PACK_COPY: Record<"en" | "de", SocialAssetPackCopy> = {
  en: {
    title: "Social Asset Pack",
    description:
      "Turn one idea into image variations, a motion clip, hooks, captions, hashtags and export-ready formats.",
    previewCta: "Preview Pack",
    previewFreeNote: "Preview is free. No credits are used.",
    costNote:
      "45 Credits include 3 image variations, 1 motion clip, hooks, captions, hashtags, Creative Score and Export Pack.",
    includedTitle: "Included in this pack",
    contentPlanLabel: "Your content plan",
    contentPlanReady:
      "Your content plan is ready — review below, then render when you're happy.",
    contentPlanProgress: (ready, total) =>
      `${ready} of ${total} planned outputs ready`,
    improvedPromptLabel: "Improved prompt",
    hooksLabel: "Hooks",
    captionsLabel: "Captions",
    hashtagsLabel: "Hashtags",
    formatsLabel: "Formats",
    creativeScorePreviewLabel: "Creative Score preview",
    creativeScoreAdvisory: "Advisory only — not a performance guarantee.",
    estimatedCostLabel: "Estimated render cost",
    exportSummaryLabel: "Export-ready package summary",
    renderLaterCta: "Render pack",
    renderCta: "Render Social Asset Pack",
    renderingLabel: "Rendering pack…",
    chargeWhenRenderNote:
      "Credits are charged only when rendering starts — not during preview.",
    partialRefundNote:
      "If part of the render fails, credits for the failed part are refunded automatically.",
    partialVideoFailMessage:
      "Your images were created. Video rendering failed and video credits were refunded.",
    fullFailMessage:
      "Pack rendering failed. Your credits were refunded.",
    completedMessage: "Social Asset Pack saved to your Creator Gallery.",
    previewBeforeRenderNote:
      "Run the free preview to build your content plan before rendering.",
  },
  de: {
    title: "Social Asset Pack",
    description:
      "Verwandle eine Idee in Bild-Varianten, einen Motion-Clip, Hooks, Captions, Hashtags und export-fertige Formate.",
    previewCta: "Pack-Vorschau",
    previewFreeNote: "Die Vorschau ist kostenlos. Es werden keine Credits verbraucht.",
    costNote:
      "45 Credits enthalten 3 Bildvarianten, 1 Motion-Clip, Hooks, Captions, Hashtags, Creative Score und Export Pack.",
    includedTitle: "Enthalten in diesem Pack",
    contentPlanLabel: "Dein Content-Plan",
    contentPlanReady:
      "Dein Content-Plan ist bereit — prüfe unten, dann rendern, wenn du zufrieden bist.",
    contentPlanProgress: (ready, total) =>
      `${ready} von ${total} geplanten Outputs bereit`,
    improvedPromptLabel: "Verbesserter Prompt",
    hooksLabel: "Hooks",
    captionsLabel: "Captions",
    hashtagsLabel: "Hashtags",
    formatsLabel: "Formate",
    creativeScorePreviewLabel: "Creative Score Vorschau",
    creativeScoreAdvisory:
      "Nur beratend — keine Leistungsgarantie.",
    estimatedCostLabel: "Geschätzte Render-Kosten",
    exportSummaryLabel: "Export-ready Paket-Zusammenfassung",
    renderLaterCta: "Pack rendern",
    renderCta: "Social Asset Pack rendern",
    renderingLabel: "Pack wird gerendert…",
    chargeWhenRenderNote:
      "Credits werden erst beim Rendern abgebucht — nicht in der Vorschau.",
    partialRefundNote:
      "Schlägt ein Teil des Renderings fehl, werden Credits für den fehlgeschlagenen Teil automatisch erstattet.",
    partialVideoFailMessage:
      "Deine Bilder wurden erstellt. Video-Rendering ist fehlgeschlagen — Video-Credits wurden erstattet.",
    fullFailMessage:
      "Pack-Rendering fehlgeschlagen. Deine Credits wurden erstattet.",
    completedMessage: "Social Asset Pack in deiner Creator Gallery gespeichert.",
    previewBeforeRenderNote:
      "Starte die kostenlose Vorschau, um deinen Content-Plan zu erstellen.",
  },
};

function truncateTopic(prompt: string, max = 72): string {
  const t = prompt.trim();
  if (!t) return "";
  if (t.length <= max) return t;
  return `${t.slice(0, max).trim()}…`;
}

/** Local prompt polish — no external API. */
export function improvePromptForPack(
  prompt: string,
  language: "en" | "de"
): string {
  const topic = truncateTopic(prompt) || (language === "de" ? "dein Produkt" : "your product");
  const base = prompt.trim();

  if (language === "de") {
    if (base.length >= 48 && /licht|light|studio|composition|komposition/i.test(base)) {
      return base;
    }
    return `${topic}, weiches Studiolicht, klare Produktfokussierung, moderne Social-Komposition, premium Creator-Look, 4:5 und 9:16 Varianten.`;
  }

  if (base.length >= 48 && /light|lighting|studio|composition|social/i.test(base)) {
    return base;
  }
  return `${topic}, soft studio lighting, clear product focus, modern social composition, premium creator look, 4:5 and 9:16 variants.`;
}

function buildSocialAssetPlan(language: "en" | "de"): SocialAssetPlanItem[] {
  const isDe = language === "de";
  const outputs = SOCIAL_ASSET_PACK_INCLUDED_OUTPUTS;
  return [
    {
      id: "image_variations",
      label: isDe
        ? `${outputs.imageVariations} Bild-Varianten`
        : `${outputs.imageVariations} image variations`,
      detail: isDe ? "Feed, TikTok, Story" : "Feed, TikTok, Story",
    },
    {
      id: "motion_clip",
      label: isDe
        ? `${outputs.motionClips} Motion-Clip`
        : `${outputs.motionClips} motion clip`,
      detail: isDe ? "5 Sekunden · Reels-ready" : "5 seconds · Reels-ready",
    },
    {
      id: "hooks",
      label: isDe ? `${outputs.hooks} Hooks` : `${outputs.hooks} hooks`,
    },
    {
      id: "captions",
      label: isDe
        ? `${outputs.captions} Captions`
        : `${outputs.captions} captions`,
    },
    {
      id: "hashtags",
      label: isDe ? "Hashtags" : "Hashtags",
    },
    {
      id: "formats",
      label: "TikTok / Reels / Story / Feed",
    },
    {
      id: "creative_score",
      label: "Creative Score",
      detail: isDe ? "6 Kategorien" : "6 categories",
    },
    {
      id: "export_pack",
      label: "Export Pack",
    },
  ];
}

function buildCreativeScorePreview(
  prompt: string,
  language: "en" | "de"
): SocialAssetPackPreviewResponse["creativeScorePreview"] {
  const score = buildRuleBasedCreativeScore({
    assetUrl: "",
    prompt,
    outputType: "image",
    language,
  });
  const isDe = language === "de";
  return {
    score: score.score,
    rating: score.rating,
    note: isDe
      ? "Vorschau basiert auf deinem Prompt — der finale Score folgt nach dem Rendern."
      : "Preview based on your prompt — final score runs after rendering.",
    positives: score.positives.slice(0, 3),
    improvements: score.improvements.slice(0, 2),
    dimensions: score.dimensions.map((dimension) => ({
      id: dimension.id,
      score: dimension.score,
    })),
  };
}

function buildExportPackageSummary(
  topic: string,
  language: "en" | "de"
): string {
  if (language === "de") {
    return `Export-Paket für ${topic}: 3 Bild-Varianten (Feed, TikTok, Story), 1 Motion-Clip, 5 Hooks, 3 Captions, Hashtags und Creative Score — gruppiert in deiner Creator Gallery.`;
  }
  return `Export package for ${topic}: 3 image variations (Feed, TikTok, Story), 1 motion clip, 5 hooks, 3 captions, hashtags and Creative Score — grouped in your Creator Gallery.`;
}

/**
 * Builds a full pack preview without image/video generation or credit charges.
 * Hooks/captions use AI when configured; otherwise viral template fallback (not raw prompt).
 */
export async function buildSocialAssetPackPreview(input: {
  prompt: string;
  language?: "en" | "de";
}): Promise<SocialAssetPackPreviewResponse> {
  const language = input.language === "de" ? "de" : "en";
  const topic =
    extractProductLabel(input.prompt) ||
    (language === "de" ? "deine Idee" : "your idea");
  const improvedPrompt = improvePromptForPack(input.prompt, language);
  const expansion = await generateCampaignExpansion({
    prompt: input.prompt,
    language,
  });

  let hooks = expansion.viral_hooks.slice(0, HOOKS_CAPTIONS_HOOK_COUNT);
  if (hooks.length < HOOKS_CAPTIONS_HOOK_COUNT) {
    hooks = [
      ...hooks,
      ...buildHooks(topic, language).slice(
        hooks.length,
        HOOKS_CAPTIONS_HOOK_COUNT
      ),
    ];
  }

  const captions = buildCaptionsFromScript(
    expansion.video_script,
    topic,
    language
  ).slice(0, HOOKS_CAPTIONS_CAPTION_COUNT);

  const hashtags =
    expansion.hashtags.length > 0
      ? expansion.hashtags
      : buildHashtags(language);

  return {
    packName: SOCIAL_ASSET_PACK_NAME,
    assetPlan: buildSocialAssetPlan(language),
    improvedPrompt,
    hooks,
    captions,
    hashtags,
    formatSuggestions: [...SOCIAL_ASSET_PACK_FORMAT_SUGGESTIONS],
    includedOutputs: { ...SOCIAL_ASSET_PACK_INCLUDED_OUTPUTS },
    estimatedCredits: getSocialAssetPackTotalCredits(),
    creativeScorePreview: buildCreativeScorePreview(improvedPrompt, language),
    exportPackageSummary: buildExportPackageSummary(topic, language),
  };
}

export function getSocialAssetPackCopy(language: "en" | "de"): SocialAssetPackCopy {
  const base = SOCIAL_ASSET_PACK_COPY[language];
  return {
    ...base,
    previewFreeNote: getSocialAssetPackPreviewFreeNote(language),
    costNote: getSocialAssetPackCostNote(language),
    partialRefundNote: getSocialAssetPackRefundNote(language),
  };
}

/**
 * Hooks, Captions & Hashtags — copy generation (AI when configured, rule-based fallback).
 */

import {
  extractCampaignProductLabel,
  generateCampaignExpansion,
} from "@/lib/intelligence/campaign-expansion-engine";

export const HOOKS_CAPTIONS_ID = "hooks_captions";

export const HOOKS_CAPTIONS_HOOK_COUNT = 5;

export const HOOKS_CAPTIONS_CAPTION_COUNT = 3;

export const HOOKS_CAPTIONS_CREDITS = 0;

export type HooksCaptionsPlatform = "TikTok" | "Reels" | "Story" | "Feed";

export type HooksCaptionsPlatformVariant = {
  platform: HooksCaptionsPlatform;
  hook: string;
  caption: string;
};

export type HooksCaptionsGenerateResponse = {
  topic: string;
  hooks: string[];
  captions: string[];
  hashtags: string[];
  platformVariants: HooksCaptionsPlatformVariant[];
  creditsCharged: typeof HOOKS_CAPTIONS_CREDITS;
};

export type HooksCaptionsGenerateRequest = {
  prompt?: string;
  language?: "en" | "de";
  assetPrompt?: string;
};

export const HOOKS_CAPTIONS_PLATFORMS: readonly HooksCaptionsPlatform[] = [
  "TikTok",
  "Reels",
  "Story",
  "Feed",
];

export const HOOKS_CAPTIONS_UI_COPY = {
  en: {
    title: "Hooks & Captions",
    description: "Generate hooks, captions and hashtags for your asset.",
    generateCta: "Generate copy · Free",
    generating: "Generating…",
    costNote: "Free for MVP — no credits charged for copy generation.",
    hooksLabel: "Hooks",
    captionsLabel: "Captions",
    hashtagsLabel: "Hashtags",
    platformsLabel: "Platform variants",
    copyAll: "Copy all",
    copyHooks: "Copy hooks",
    copyCaptions: "Copy captions",
    copyHashtags: "Copy hashtags",
    copied: "Copied",
    copy: "Copy",
    errorGeneric: "Could not generate copy. Try again.",
    promptHint: "Describe your asset or campaign idea (min. 3 characters).",
  },
  de: {
    title: "Hooks & Captions",
    description: "Generiere Hooks, Captions und Hashtags für dein Asset.",
    generateCta: "Copy generieren · Kostenlos",
    generating: "Generiere…",
    costNote: "Kostenlos im MVP — keine Credits für Copy-Generierung.",
    hooksLabel: "Hooks",
    captionsLabel: "Captions",
    hashtagsLabel: "Hashtags",
    platformsLabel: "Plattform-Varianten",
    copyAll: "Alles kopieren",
    copyHooks: "Hooks kopieren",
    copyCaptions: "Captions kopieren",
    copyHashtags: "Hashtags kopieren",
    copied: "Kopiert",
    copy: "Kopieren",
    errorGeneric: "Copy konnte nicht generiert werden. Bitte erneut versuchen.",
    promptHint: "Beschreibe dein Asset oder Kampagnen-Idee (mind. 3 Zeichen).",
  },
} as const;

export function extractProductLabel(
  prompt: string,
  maxLen = 48
): string {
  return extractCampaignProductLabel(prompt, maxLen);
}

export function buildHooks(product: string, language: "en" | "de"): string[] {
  const label =
    product.trim() || (language === "de" ? "dieses Produkt" : "this product");
  const short =
    product.trim().length > 36
      ? extractProductLabel(product, 36)
      : label;

  if (language === "de") {
    return [
      `Wusstest du, dass ${label} sofort Premium im Feed wirkt?`,
      `Stopp scrolling — das musst du sehen: ${short}.`,
      `3 Sekunden, die alles verändern: ${label}.`,
      `POV: ${label} stoppt den Scroll in 2 Sekunden.`,
      `Creator-Tipp: Teste ${label} mit diesem Hook zuerst.`,
    ];
  }
  return [
    `Did you know ${label} can look premium in feed instantly?`,
    `Stop scrolling — you need to see this: ${short}.`,
    `3 seconds that change everything: ${label}.`,
    `POV: ${label} stops the scroll in 2 seconds.`,
    `Creator tip: test ${label} with this hook first.`,
  ];
}

export function buildCaptions(topic: string, language: "en" | "de"): string[] {
  if (language === "de") {
    return [
      `${topic} — klar, premium, bereit für Reels & TikTok.`,
      `Neuer Look für ${topic}. Speichern & teilen.`,
      `So präsentierst du ${topic} scroll-stopping — Link in Bio.`,
    ];
  }
  return [
    `${topic} — clean, premium, ready for Reels & TikTok.`,
    `Fresh look for ${topic}. Save & share.`,
    `How to present ${topic} scroll-stopping — link in bio.`,
  ];
}

export function buildHashtags(language: "en" | "de"): string[] {
  void language;
  return [
    "#ContentCreator",
    "#SocialMedia",
    "#Reels",
    "#BrandContent",
    "#CreatorEconomy",
  ];
}

export function buildPlatformVariants(
  topic: string,
  language: "en" | "de"
): HooksCaptionsPlatformVariant[] {
  if (language === "de") {
    return [
      {
        platform: "TikTok",
        hook: `POV: ${topic} stoppt den Scroll in 2 Sekunden.`,
        caption: `${topic} — schnell, laut, speicherbar. Trend testen.`,
      },
      {
        platform: "Reels",
        hook: `So startest du Reels mit ${topic}.`,
        caption: `${topic} im Premium-Look — speichern für später.`,
      },
      {
        platform: "Story",
        hook: `Swipe-up Energy für ${topic}.`,
        caption: `${topic} — Story-ready, Link in Bio.`,
      },
      {
        platform: "Feed",
        hook: `Feed-Hero: ${topic} mit klarem Hook.`,
        caption: `${topic} — polished, on-brand, teilen.`,
      },
    ];
  }

  return [
    {
      platform: "TikTok",
      hook: `POV: ${topic} stops the scroll in 2 seconds.`,
      caption: `${topic} — fast, bold, save-worthy. Test this trend.`,
    },
    {
      platform: "Reels",
      hook: `How to open Reels with ${topic}.`,
      caption: `${topic} in a premium look — save for later.`,
    },
    {
      platform: "Story",
      hook: `Swipe-up energy for ${topic}.`,
      caption: `${topic} — story-ready, link in bio.`,
    },
    {
      platform: "Feed",
      hook: `Feed hero: ${topic} with a clear hook.`,
      caption: `${topic} — polished, on-brand, shareable.`,
    },
  ];
}

function buildCaptionsFromScript(
  videoScript: string,
  topic: string,
  language: "en" | "de"
): string[] {
  const lines = videoScript
    .split(/\n+/)
    .map((line) => line.replace(/^\[[^\]]+\]\s*/, "").trim())
    .filter(Boolean);

  const fromScript = lines.slice(0, HOOKS_CAPTIONS_CAPTION_COUNT);
  if (fromScript.length >= HOOKS_CAPTIONS_CAPTION_COUNT) {
    return fromScript;
  }

  return buildCaptions(topic, language).slice(0, HOOKS_CAPTIONS_CAPTION_COUNT);
}

/**
 * Rule-based bundle — synchronous fallback.
 */
export function buildHooksCaptionsBundle(input: {
  prompt: string;
  language?: "en" | "de";
}): HooksCaptionsGenerateResponse {
  const language = input.language === "de" ? "de" : "en";
  const topic =
    extractProductLabel(input.prompt) ||
    (language === "de" ? "deine Idee" : "your idea");

  return {
    topic,
    hooks: buildHooks(topic, language).slice(0, HOOKS_CAPTIONS_HOOK_COUNT),
    captions: buildCaptions(topic, language).slice(
      0,
      HOOKS_CAPTIONS_CAPTION_COUNT
    ),
    hashtags: buildHashtags(language),
    platformVariants: buildPlatformVariants(topic, language),
    creditsCharged: HOOKS_CAPTIONS_CREDITS,
  };
}

/**
 * AI copy when OpenAI/Gemini is configured; otherwise viral hook templates (not raw prompt).
 */
export async function generateHooksCaptionsBundle(input: {
  prompt: string;
  language?: "en" | "de";
}): Promise<HooksCaptionsGenerateResponse> {
  const language = input.language === "de" ? "de" : "en";
  const topic =
    extractProductLabel(input.prompt) ||
    (language === "de" ? "deine Idee" : "your idea");

  const expansion = await generateCampaignExpansion({
    prompt: input.prompt,
    language,
  });

  const hooks = expansion.viral_hooks.slice(0, HOOKS_CAPTIONS_HOOK_COUNT);
  const paddedHooks =
    hooks.length >= HOOKS_CAPTIONS_HOOK_COUNT
      ? hooks
      : [
          ...hooks,
          ...buildHooks(topic, language).slice(
            hooks.length,
            HOOKS_CAPTIONS_HOOK_COUNT
          ),
        ];

  const hashtags =
    expansion.hashtags.length > 0
      ? expansion.hashtags
      : buildHashtags(language);

  return {
    topic,
    hooks: paddedHooks,
    captions: buildCaptionsFromScript(
      expansion.video_script,
      topic,
      language
    ),
    hashtags,
    platformVariants: buildPlatformVariants(topic, language),
    creditsCharged: HOOKS_CAPTIONS_CREDITS,
  };
}

export function getHooksCaptionsUiCopy(language: "en" | "de" = "en") {
  return HOOKS_CAPTIONS_UI_COPY[language === "de" ? "de" : "en"];
}

export function formatHooksCaptionsForClipboard(
  result: HooksCaptionsGenerateResponse,
  language: "en" | "de"
): string {
  const copy = getHooksCaptionsUiCopy(language);
  const lines = [
    copy.hooksLabel,
    ...result.hooks.map((hook, index) => `${index + 1}. ${hook}`),
    "",
    copy.captionsLabel,
    ...result.captions.map((caption, index) => `${index + 1}. ${caption}`),
    "",
    copy.hashtagsLabel,
    result.hashtags.join(" "),
    "",
    copy.platformsLabel,
    ...result.platformVariants.map(
      (variant) =>
        `${variant.platform}\nHook: ${variant.hook}\nCaption: ${variant.caption}`
    ),
  ];
  return lines.join("\n");
}

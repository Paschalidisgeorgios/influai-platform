/**
 * Hooks, Captions & Hashtags — local copy generation (no provider calls, no credits).
 */

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

function truncateTopic(prompt: string, max = 72): string {
  const t = prompt.trim();
  if (!t) return "";
  if (t.length <= max) return t;
  return `${t.slice(0, max).trim()}…`;
}

export function buildHooks(topic: string, language: "en" | "de"): string[] {
  if (language === "de") {
    return [
      `Stopp — so wirkt ${topic} im Feed.`,
      `3 Sekunden, die ${topic} unübersehbar machen.`,
      `Würdest du für ${topic} stoppen oder swipen?`,
      `Das sieht aus wie Premium-Content für ${topic}.`,
      `Creator-Tipp: ${topic} mit diesem Hook testen.`,
    ];
  }
  return [
    `Stop scrolling — this is how ${topic} hits in feed.`,
    `3 seconds that make ${topic} impossible to ignore.`,
    `Would you stop or swipe for ${topic}?`,
    `This looks like premium creator content for ${topic}.`,
    `Creator tip: test ${topic} with this hook first.`,
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

/**
 * Builds hooks, captions, hashtags and platform variants — no external APIs.
 */
export function buildHooksCaptionsBundle(input: {
  prompt: string;
  language?: "en" | "de";
}): HooksCaptionsGenerateResponse {
  const language = input.language === "de" ? "de" : "en";
  const topic =
    truncateTopic(input.prompt, 56) ||
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

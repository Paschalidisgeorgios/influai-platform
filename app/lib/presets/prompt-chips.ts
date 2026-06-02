/**
 * Dashboard prompt guidance chips — append-only fragments, no provider names.
 */

export type PromptChip = {
  id: string;
  label: { en: string; de: string };
  fragment: { en: string; de: string };
};

export const STARTER_PROMPT_CHIPS: readonly PromptChip[] = [
  {
    id: "product_shot",
    label: { en: "Product shot", de: "Product shot" },
    fragment: {
      en: "professional product shot on a clean surface, soft studio lighting, centered composition",
      de: "professioneller Product Shot auf cleanem Untergrund, weiches Studiolicht, zentrierte Komposition",
    },
  },
  {
    id: "ugc_visual",
    label: { en: "UGC visual", de: "UGC Visual" },
    fragment: {
      en: "authentic UGC-style visual, natural handheld feel, relatable creator angle",
      de: "authentisches UGC-Visual, natürlicher Handheld-Feel, relatable Creator-Winkel",
    },
  },
  {
    id: "motion_reel",
    label: { en: "Motion reel", de: "Motion Reel" },
    fragment: {
      en: "short motion reel clip, dynamic camera movement, scroll-stopping opening frame",
      de: "kurzer Motion-Reel-Clip, dynamische Kamerabewegung, scroll-stoppender Eröffnungsframe",
    },
  },
  {
    id: "beauty_ad",
    label: { en: "Beauty ad", de: "Beauty Ad" },
    fragment: {
      en: "premium beauty product ad, soft diffused lighting, glossy skin highlights",
      de: "Premium Beauty-Produkt-Ad, weiches diffuses Licht, dezente Haut-Highlights",
    },
  },
  {
    id: "fitness_promo",
    label: { en: "Fitness promo", de: "Fitness Promo" },
    fragment: {
      en: "fitness promo visual, bold energetic lighting, athletic motivation mood",
      de: "Fitness-Promo-Visual, markantes energiegeladenes Licht, athletische Motivationsstimmung",
    },
  },
  {
    id: "street_style",
    label: { en: "Street style", de: "Street Style" },
    fragment: {
      en: "street style outfit visual, urban backdrop, candid editorial framing",
      de: "Street-Style-Outfit-Visual, urbaner Hintergrund, candid Editorial-Framing",
    },
  },
  {
    id: "story_format",
    label: { en: "Story format", de: "Story Format" },
    fragment: {
      en: "vertical 9:16 story format, mobile-first composition, bold subject focus",
      de: "vertikales 9:16 Story-Format, Mobile-first-Komposition, starker Motivfokus",
    },
  },
  {
    id: "feed_post",
    label: { en: "Feed post", de: "Feed Post" },
    fragment: {
      en: "square 1:1 feed post composition, scroll-stopping focal point",
      de: "quadratische 1:1 Feed-Post-Komposition, scroll-stoppender Fokuspunkt",
    },
  },
] as const;

export const STYLE_PROMPT_CHIPS: readonly PromptChip[] = [
  {
    id: "clean",
    label: { en: "clean", de: "clean" },
    fragment: {
      en: "clean minimal aesthetic",
      de: "cleane minimalistische Ästhetik",
    },
  },
  {
    id: "cinematic",
    label: { en: "cinematic", de: "cinematic" },
    fragment: {
      en: "cinematic lighting and depth",
      de: "cinematisches Licht und Tiefe",
    },
  },
  {
    id: "luxury",
    label: { en: "luxury", de: "luxury" },
    fragment: {
      en: "luxury premium mood and styling",
      de: "luxuriöse Premium-Stimmung und Styling",
    },
  },
  {
    id: "natural",
    label: { en: "natural", de: "natural" },
    fragment: {
      en: "natural light, authentic feel",
      de: "natürliches Licht, authentischer Feel",
    },
  },
  {
    id: "bold",
    label: { en: "bold", de: "bold" },
    fragment: {
      en: "bold high-contrast look",
      de: "boldes kontrastreiches Look",
    },
  },
  {
    id: "street",
    label: { en: "street", de: "street" },
    fragment: {
      en: "streetwear editorial vibe",
      de: "Streetwear-Editorial-Vibe",
    },
  },
] as const;

export const PLATFORM_PROMPT_CHIPS: readonly PromptChip[] = [
  {
    id: "tiktok",
    label: { en: "TikTok", de: "TikTok" },
    fragment: {
      en: "optimized for TikTok vertical format",
      de: "optimiert für TikTok-Vertikalformat",
    },
  },
  {
    id: "reels",
    label: { en: "Reels", de: "Reels" },
    fragment: {
      en: "optimized for Instagram Reels, 9:16 vertical",
      de: "optimiert für Instagram Reels, 9:16 vertikal",
    },
  },
  {
    id: "story",
    label: { en: "Story", de: "Story" },
    fragment: {
      en: "optimized for Stories, vertical full-screen",
      de: "optimiert für Stories, vertikal full-screen",
    },
  },
  {
    id: "feed",
    label: { en: "Feed", de: "Feed" },
    fragment: {
      en: "optimized for feed post, balanced composition",
      de: "optimiert für Feed-Post, ausgewogene Komposition",
    },
  },
] as const;

export function getPromptChipFragment(
  chip: PromptChip,
  language: "en" | "de"
): string {
  return language === "de" ? chip.fragment.de : chip.fragment.en;
}

export function getPromptChipLabel(
  chip: PromptChip,
  language: "en" | "de"
): string {
  return language === "de" ? chip.label.de : chip.label.en;
}

/** Append a fragment — never replaces the user's existing prompt. */
export function appendPromptFragment(prompt: string, fragment: string): string {
  const trimmed = prompt.trim();
  const frag = fragment.trim();
  if (!frag) return trimmed;
  if (!trimmed) return frag;
  const needle = frag.slice(0, Math.min(20, frag.length)).toLowerCase();
  if (trimmed.toLowerCase().includes(needle)) return trimmed;
  return `${trimmed}, ${frag}`;
}

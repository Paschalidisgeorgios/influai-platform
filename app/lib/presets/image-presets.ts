/**
 * Image style presets — prompt fragments only, no provider names.
 */

export type ImagePreset = {
  id: string;
  label: { en: string; de: string };
  /** Appended to user prompt when selected */
  fragment: { en: string; de: string };
  tags: string[];
};

export const IMAGE_PRESETS: readonly ImagePreset[] = [
  {
    id: "product_shot",
    label: { en: "Product Shot", de: "Product Shot" },
    fragment: {
      en: "soft studio lighting, clean product focus, shallow depth of field, neutral background, centered composition, square social format",
      de: "weiches Studiolicht, klares Produktfokus, geringe Schärfentiefe, neutraler Hintergrund, zentrierte Komposition, quadratisches Social-Format",
    },
    tags: ["lighting", "composition", "background", "social"],
  },
  {
    id: "beauty_ad",
    label: { en: "Beauty Ad", de: "Beauty Ad" },
    fragment: {
      en: "soft diffused beauty lighting, glossy skin highlights, clean minimal backdrop, close-up composition, premium cosmetic ad style, vertical social format",
      de: "weiches Beauty-Licht, dezente Haut-Highlights, minimaler Hintergrund, Close-up-Komposition, Premium-Kosmetik-Ad-Stil, vertikales Social-Format",
    },
    tags: ["lighting", "beauty", "composition"],
  },
  {
    id: "fashion_creator",
    label: { en: "Fashion Creator", de: "Fashion Creator" },
    fragment: {
      en: "editorial fashion lighting, confident pose, urban or studio backdrop, full-body or three-quarter framing, high-contrast social-ready look",
      de: "editoriales Fashion-Licht, selbstbewusste Pose, urbaner oder Studio-Hintergrund, Ganzkörper oder Dreiviertel, kontrastreicher Social-Look",
    },
    tags: ["lighting", "camera", "composition"],
  },
  {
    id: "fitness_promo",
    label: { en: "Fitness Promo", de: "Fitness Promo" },
    fragment: {
      en: "bold directional lighting, energetic mood, dynamic athlete pose, dark gym or outdoor backdrop, high contrast, vertical promo composition",
      de: "markantes Seitenlicht, energiegeladene Stimmung, dynamische Pose, dunkler Gym- oder Outdoor-Hintergrund, hoher Kontrast, vertikale Promo-Komposition",
    },
    tags: ["lighting", "mood", "composition"],
  },
  {
    id: "food_visual",
    label: { en: "Food Visual", de: "Food Visual" },
    fragment: {
      en: "warm appetizing light, overhead or 45-degree camera angle, textured surface backdrop, shallow depth of field, food photography composition",
      de: "warmes appetitliches Licht, Overhead- oder 45-Grad-Kamera, strukturierter Untergrund, geringe Schärfentiefe, Food-Photo-Komposition",
    },
    tags: ["lighting", "camera", "composition"],
  },
  {
    id: "minimal_brand",
    label: { en: "Minimal Brand Visual", de: "Minimal Brand Visual" },
    fragment: {
      en: "minimal clean background, soft even lighting, strong negative space, brand-forward composition, muted premium palette, square format",
      de: "minimaler cleaner Hintergrund, weiches gleichmäßiges Licht, viel Negativraum, brand-forward Komposition, gedämpfte Premium-Palette, quadratisches Format",
    },
    tags: ["background", "lighting", "composition"],
  },
  {
    id: "street_style",
    label: { en: "Street Style", de: "Street Style" },
    fragment: {
      en: "natural daylight, candid street-style framing, urban background with depth, editorial fashion angle, authentic social aesthetic",
      de: "natürliches Tageslicht, candid Street-Style-Framing, urbaner Hintergrund mit Tiefe, editorischer Fashion-Winkel, authentische Social-Ästhetik",
    },
    tags: ["lighting", "camera", "background"],
  },
  {
    id: "luxury_lifestyle",
    label: { en: "Luxury Lifestyle", de: "Luxury Lifestyle" },
    fragment: {
      en: "cinematic rim light, dark luxury backdrop, reflective surfaces, elegant composition, premium mood, vertical social ad framing",
      de: "cinematisches Randlicht, dunkler Luxury-Hintergrund, reflektierende Flächen, elegante Komposition, Premium-Stimmung, vertikales Social-Ad-Framing",
    },
    tags: ["lighting", "mood", "composition"],
  },
] as const;

const PRESET_BY_ID = new Map(IMAGE_PRESETS.map((p) => [p.id, p]));

export function getImagePreset(id: string): ImagePreset | null {
  return PRESET_BY_ID.get(id) ?? null;
}

export function appendImagePresetFragment(
  prompt: string,
  presetId: string,
  language: "en" | "de" = "en"
): string {
  const preset = getImagePreset(presetId);
  if (!preset) return prompt;
  const fragment =
    language === "de" ? preset.fragment.de : preset.fragment.en;
  const trimmed = prompt.trim();
  if (!trimmed) return fragment;
  const needle = fragment.slice(0, 24).toLowerCase();
  if (trimmed.toLowerCase().includes(needle)) return trimmed;
  return `${trimmed}, ${fragment}`;
}

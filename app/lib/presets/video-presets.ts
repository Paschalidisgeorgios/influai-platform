/**
 * Video motion presets — prompt fragments only, no provider names.
 */

export type VideoPreset = {
  id: string;
  label: { en: string; de: string };
  fragment: { en: string; de: string };
  tags: string[];
};

export const VIDEO_PRESETS: readonly VideoPreset[] = [
  {
    id: "street_handheld",
    label: { en: "Street handheld", de: "Street Handheld" },
    fragment: {
      en: "handheld camera with subtle shake, subject walking through city, urban background, 9:16 vertical, moderate motion intensity, natural daylight mood",
      de: "Handheld-Kamera mit leichtem Shake, Motiv läuft durch die Stadt, urbaner Hintergrund, 9:16 vertikal, moderate Bewegungsintensität, natürliches Tageslicht",
    },
    tags: ["camera", "motion", "format"],
  },
  {
    id: "slow_cinematic_zoom",
    label: { en: "Cinematic zoom", de: "Cinematic Zoom" },
    fragment: {
      en: "slow cinematic push-in zoom, minimal subject movement, dramatic lighting, shallow depth of field, 9:16 vertical, low motion intensity, premium mood",
      de: "langsamer cinematic Push-in-Zoom, minimale Motivbewegung, dramatisches Licht, geringe Schärfentiefe, 9:16 vertikal, niedrige Bewegungsintensität, Premium-Stimmung",
    },
    tags: ["camera", "lighting", "motion"],
  },
  {
    id: "product_rotation",
    label: { en: "Product rotation", de: "Produkt-Rotation" },
    fragment: {
      en: "smooth orbiting camera around product, clean studio background, soft product lighting, 5 second clip, square or vertical format, controlled motion intensity",
      de: "sanfte Orbit-Kamera um Produkt, cleaner Studio-Hintergrund, weiches Produktlicht, 5 Sekunden Clip, quadratisch oder vertikal, kontrollierte Bewegungsintensität",
    },
    tags: ["camera", "lighting", "duration"],
  },
  {
    id: "luxury_ad_motion",
    label: { en: "Luxury ad motion", de: "Luxury Ad Motion" },
    fragment: {
      en: "slow elegant camera drift, luxury subject reveal, dark premium backdrop, rim lighting, 9:16 vertical, low-to-moderate motion, cinematic atmosphere",
      de: "langsame elegante Kamerafahrt, Luxury-Motiv-Reveal, dunkler Premium-Hintergrund, Randlicht, 9:16 vertikal, niedrig-moderate Bewegung, cinematic Atmosphäre",
    },
    tags: ["camera", "lighting", "mood"],
  },
  {
    id: "tiktok_hook",
    label: { en: "TikTok hook shot", de: "TikTok Hook Shot" },
    fragment: {
      en: "fast opening hook movement, bold subject entrance, high contrast lighting, 9:16 vertical, high motion intensity in first second, social-native pacing",
      de: "schnelle Hook-Bewegung zu Beginn, markanter Motiv-Einstieg, kontrastreiches Licht, 9:16 vertikal, hohe Bewegungsintensität in der ersten Sekunde, Social-Pacing",
    },
    tags: ["camera", "motion", "format"],
  },
  {
    id: "creator_walking",
    label: { en: "Creator walking shot", de: "Creator Walking Shot" },
    fragment: {
      en: "tracking shot following creator walking forward, steady gimbal feel, lifestyle environment, 9:16 vertical, moderate motion intensity, warm natural light",
      de: "Tracking-Shot folgt Creator nach vorne, stabiles Gimbal-Feeling, Lifestyle-Umgebung, 9:16 vertikal, moderate Bewegungsintensität, warmes natürliches Licht",
    },
    tags: ["camera", "subject", "motion"],
  },
  {
    id: "beauty_reveal",
    label: { en: "Beauty product reveal", de: "Beauty Product Reveal" },
    fragment: {
      en: "slow reveal camera move toward beauty product, soft diffused lighting, clean backdrop, gentle subject motion, 9:16 vertical, low motion intensity",
      de: "langsamer Reveal zur Beauty-Produkt, weiches diffuses Licht, cleaner Hintergrund, sanfte Motivbewegung, 9:16 vertikal, niedrige Bewegungsintensität",
    },
    tags: ["camera", "lighting", "motion"],
  },
  {
    id: "fitness_action",
    label: { en: "Fitness action clip", de: "Fitness Action Clip" },
    fragment: {
      en: "dynamic action camera, athlete movement mid-workout, bold gym lighting, energetic mood, 9:16 vertical, high motion intensity, short punchy clip",
      de: "dynamische Action-Kamera, Athletenbewegung im Workout, markantes Gym-Licht, energiegeladene Stimmung, 9:16 vertikal, hohe Bewegungsintensität, kurzer Clip",
    },
    tags: ["camera", "motion", "mood"],
  },
] as const;

/** Primary motion options shown on the Create Motion Video workflow. */
export const PRIMARY_MOTION_VIDEO_PRESET_IDS = [
  "street_handheld",
  "slow_cinematic_zoom",
  "product_rotation",
  "luxury_ad_motion",
  "tiktok_hook",
] as const;

const PRESET_BY_ID = new Map(VIDEO_PRESETS.map((p) => [p.id, p]));

export function getVideoPreset(id: string): VideoPreset | null {
  return PRESET_BY_ID.get(id) ?? null;
}

export function getPrimaryMotionVideoPresets(): VideoPreset[] {
  return PRIMARY_MOTION_VIDEO_PRESET_IDS.map((id) => getVideoPreset(id)).filter(
    (preset): preset is VideoPreset => preset != null
  );
}

export function appendVideoPresetFragment(
  prompt: string,
  presetId: string,
  language: "en" | "de" = "en"
): string {
  const preset = getVideoPreset(presetId);
  if (!preset) return prompt;
  const fragment =
    language === "de" ? preset.fragment.de : preset.fragment.en;
  const trimmed = prompt.trim();
  if (!trimmed) return fragment;
  const needle = fragment.slice(0, 24).toLowerCase();
  if (trimmed.toLowerCase().includes(needle)) return trimmed;
  return `${trimmed}, ${fragment}`;
}

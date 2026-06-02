/**
 * Static Social Asset Pack showcase content — landing demo only (no API, no credits).
 */

export type SocialAssetPackShowcaseCopy = {
  label: string;
  previewBillingNote: string;
  title: string;
  subtitle: string;
  proofLine: string;
  ideaLabel: string;
  idea: string;
  cta: string;
  variationLabels: [string, string, string];
  outputs: {
    imageVariations: string;
    motionClip: string;
    hooks: string;
    captions: string;
    hashtags: string;
    creativeScore: string;
    exportPack: string;
  };
  hooks: readonly string[];
  captions: readonly string[];
  hashtags: string;
  scoreValue: number;
  scoreHint: string;
  improvedPrompt: string;
  scoreDimensions: readonly { id: string; score: number }[];
  weakestDimensionId: string;
  motionClipHint: string;
  progressLabel: string;
};

export const SOCIAL_ASSET_PACK_SHOWCASE_DEMO: Record<
  "en" | "de",
  SocialAssetPackShowcaseCopy
> = {
  en: {
    label: "Workflow Preview — no credits required",
    previewBillingNote:
      "Preview is free. Rendering starts only after credit confirmation.",
    title: "Social Asset Pack",
    subtitle:
      "From one idea, you get image variations, a motion clip, hooks, captions and export-ready formats.",
    proofLine:
      "1 idea → 3 image variations → 1 motion clip → hooks → captions → export",
    ideaLabel: "Your idea",
    idea: "Premium skincare on marble, soft studio light",
    cta: "Preview your first pack",
    variationLabels: ["Feed", "TikTok", "Story"],
    outputs: {
      imageVariations: "3 image variations",
      motionClip: "1 motion clip",
      hooks: "5 hooks",
      captions: "3 captions",
      hashtags: "Hashtags",
      creativeScore: "Creative Score",
      exportPack: "Export Pack",
    },
    hooks: [
      "Stop scrolling — this glow hits different.",
      "Marble + skincare = instant premium feed.",
      "Your routine deserves this lighting.",
      "POV: the serum that fixed my texture.",
      "Would you save this for your shelfie?",
    ],
    captions: [
      "Soft light, clean marble, skincare that looks as good as it feels.",
      "Studio-grade visuals for your daily routine — no filter needed.",
      "Save this for your next self-care Sunday post.",
    ],
    hashtags: "#skincare #beauty #selfcare #reels #glowingskin",
    scoreValue: 84,
    scoreHint: "Strong hook clarity and visual focus.",
    improvedPrompt:
      "Luxury skincare on white marble, soft diffused studio light, premium editorial product photography, shallow depth of field",
    scoreDimensions: [
      { id: "hook_clarity", score: 88 },
      { id: "subject_focus", score: 82 },
      { id: "format_fit", score: 79 },
      { id: "mobile_readability", score: 86 },
    ],
    weakestDimensionId: "format_fit",
    motionClipHint: "5s motion clip · Reels-ready",
    progressLabel: "Building your content plan…",
  },
  de: {
    label: "Workflow-Vorschau — keine Credits erforderlich",
    previewBillingNote:
      "Die Vorschau ist kostenlos. Rendering startet erst nach Credit-Bestätigung.",
    title: "Social Asset Pack",
    subtitle:
      "Aus einer Idee entstehen Bildvarianten, Motion-Clip, Hooks, Captions und exportfertige Formate.",
    proofLine:
      "1 Idee → 3 Bildvarianten → 1 Motion-Clip → Hooks → Captions → Export",
    ideaLabel: "Deine Idee",
    idea: "Premium-Skincare auf Marmor, weiches Studiolicht",
    cta: "Erstes Paket previewen",
    variationLabels: ["Feed", "TikTok", "Story"],
    outputs: {
      imageVariations: "3 Bild-Varianten",
      motionClip: "1 Motion-Clip",
      hooks: "5 Hooks",
      captions: "3 Captions",
      hashtags: "Hashtags",
      creativeScore: "Creative Score",
      exportPack: "Export Pack",
    },
    hooks: [
      "Stopp — dieser Glow wirkt anders.",
      "Marmor + Skincare = Premium-Feed in Sekunden.",
      "Deine Routine verdient dieses Licht.",
      "POV: Das Serum, das meine Textur gerettet hat.",
      "Würdest du das für dein Shelfie speichern?",
    ],
    captions: [
      "Weiches Licht, cleaner Marmor — Skincare, die so gut aussieht wie sie wirkt.",
      "Studio-Visuals für deine Routine — ohne Filter.",
      "Speichern für deinen nächsten Self-Care-Sunday-Post.",
    ],
    hashtags: "#skincare #beauty #selfcare #reels #glowingskin",
    scoreValue: 84,
    scoreHint: "Starke Hook-Klarheit und visueller Fokus.",
    improvedPrompt:
      "Luxus-Skincare auf weißem Marmor, weiches diffuses Studiolicht, Premium-Editorial-Produktfotografie, geringe Schärfentiefe",
    scoreDimensions: [
      { id: "hook_clarity", score: 88 },
      { id: "subject_focus", score: 82 },
      { id: "format_fit", score: 79 },
      { id: "mobile_readability", score: 86 },
    ],
    weakestDimensionId: "format_fit",
    motionClipHint: "5s Motion-Clip · Reels-ready",
    progressLabel: "Content-Plan wird erstellt…",
  },
};

/** Illustrative stills for demo image variations (no generation). */
export const SHOWCASE_VARIATION_IMAGES = [
  "/assets/hero-model1.png.jpg",
  "/assets/hero-model2.png.jpg",
  "/assets/hero-streetfoto.png.png",
] as const;

export const SHOWCASE_VARIATION_IMAGE_FALLBACK = "/assets/hero-model.png.png";

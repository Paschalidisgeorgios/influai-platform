import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type ImageMode =
  | "standard"
  | "fast_draft"
  | "premium_image"
  | "reference_edit"
  | "brand_assets"
  | "ugc_look";

type GenerateMode = ImageMode | "video_image_to_video" | "lip_sync";

const FAL_KLING_I2V_MODEL = "fal-ai/kling-video/v2.1/standard/image-to-video";
/** Image + audio → talking video (fal.ai) */
const FAL_LIP_SYNC_IMAGE_MODEL = "fal-ai/ai-avatar";
/** Video + audio → lip-synced video (fal.ai Sync Lipsync 2 Pro) */
const FAL_LIP_SYNC_VIDEO_MODEL = "fal-ai/sync-lipsync/v2/pro";

/** Brand Assets — FLUX Dev via fal.ai (stable; Recraft endpoint returned 422) */
const FAL_BRAND_ASSETS_MODEL = "fal-ai/flux/dev";

const ACTIVE_GENERATION_LIMIT = 2;

const PLANNED_IMAGE_MODES = new Set([
  "video",
  "video_studio",
  "lip_sync_studio",
  "cinema_agent",
  "omni_campaign_agent",
  "social_planner",
]);

function getCreditCostForMode(mode: GenerateMode): number {
  if (mode === "lip_sync") {
    return 30;
  }

  if (mode === "video_image_to_video") {
    return 25;
  }

  return getCreditCostForImageMode(mode);
}

function getCreditCostForImageMode(imageMode: ImageMode): number {
  switch (imageMode) {
    case "ugc_look":
      return 2;
    case "reference_edit":
      return 5;
    case "brand_assets":
      return 4;
    case "premium_image":
      return 3;
    case "fast_draft":
      return 1;
    case "standard":
    default:
      return 1;
  }
}

function parseGenerateMode(value: unknown): GenerateMode {
  if (value === "video_image_to_video") return "video_image_to_video";
  if (value === "lip_sync") return "lip_sync";
  return parseImageMode(value);
}

function parseImageMode(value: unknown): ImageMode {
  if (value === "fast_draft") return "fast_draft";
  if (value === "premium_image") return "premium_image";
  if (value === "reference_edit") return "reference_edit";
  if (value === "brand_assets") return "brand_assets";
  if (value === "ugc_look") return "ugc_look";
  return "standard";
}

function getPlannedModeRejection(value: unknown): string | null {
  if (typeof value !== "string") return null;
  if (!PLANNED_IMAGE_MODES.has(value)) return null;

  return "This image mode is not enabled.";
}

function isMissingColumnError(error: { message?: string; code?: string } | null) {
  if (!error?.message) return false;

  return (
    error.code === "PGRST204" ||
    /column.*does not exist|Could not find the .* column/i.test(error.message)
  );
}

type GenerationJobConfig = {
  provider: string;
  model: string;
  workflow: string;
  creditsUsed: number;
  transactionSource: string;
};

function resolveGenerationJobConfig(mode: GenerateMode):
  | { ok: true; config: GenerationJobConfig }
  | { ok: false; error: string } {
  if (mode === "video_image_to_video") {
    if (process.env.ENABLE_FAL_VIDEO_STUDIO !== "true") {
      return {
        ok: false,
        error:
          "Video Studio is not enabled. Set ENABLE_FAL_VIDEO_STUDIO=true on the server.",
      };
    }

    return {
      ok: true,
      config: {
        provider: "fal",
        model: FAL_KLING_I2V_MODEL,
        workflow: "video_image_to_video",
        creditsUsed: getCreditCostForMode("video_image_to_video"),
        transactionSource: "video_image_to_video_generation_job",
      },
    };
  }

  if (mode === "lip_sync") {
    if (process.env.ENABLE_FAL_LIP_SYNC !== "true") {
      return {
        ok: false,
        error:
          "Lip Sync Studio is not enabled. Set ENABLE_FAL_LIP_SYNC=true on the server.",
      };
    }

    return {
      ok: true,
      config: {
        provider: "fal",
        model: FAL_LIP_SYNC_IMAGE_MODEL,
        workflow: "lip_sync",
        creditsUsed: getCreditCostForMode("lip_sync"),
        transactionSource: "lip_sync_generation_job",
      },
    };
  }

  const imageMode = mode as ImageMode;

  if (imageMode === "fast_draft") {
    if (process.env.ENABLE_FAL_FAST_DRAFT !== "true") {
      return {
        ok: false,
        error: "Fast Draft is not enabled. Set ENABLE_FAL_FAST_DRAFT=true on the server.",
      };
    }

    return {
      ok: true,
      config: {
        provider: "fal",
        model: "fal-ai/flux/schnell",
        workflow: "fast_draft",
        creditsUsed: getCreditCostForImageMode("fast_draft"),
        transactionSource: "fast_draft_generation_job",
      },
    };
  }

  if (imageMode === "premium_image") {
    if (process.env.ENABLE_FAL_PREMIUM_IMAGE !== "true") {
      return {
        ok: false,
        error:
          "Premium Image is not enabled. Set ENABLE_FAL_PREMIUM_IMAGE=true on the server.",
      };
    }

    return {
      ok: true,
      config: {
        provider: "fal",
        model: "fal-ai/flux/dev",
        workflow: "premium_image",
        creditsUsed: getCreditCostForImageMode("premium_image"),
        transactionSource: "premium_image_generation_job",
      },
    };
  }

  if (imageMode === "reference_edit") {
    if (process.env.ENABLE_FAL_REFERENCE_EDIT !== "true") {
      return {
        ok: false,
        error:
          "Reference Edit is not enabled. Set ENABLE_FAL_REFERENCE_EDIT=true on the server.",
      };
    }

    return {
      ok: true,
      config: {
        provider: "fal",
        model: "fal-ai/nano-banana-pro/edit",
        workflow: "reference_edit",
        creditsUsed: getCreditCostForImageMode("reference_edit"),
        transactionSource: "reference_edit_generation_job",
      },
    };
  }

  if (imageMode === "brand_assets") {
    if (process.env.ENABLE_FAL_BRAND_ASSETS !== "true") {
      return {
        ok: false,
        error:
          "Brand Assets is not enabled. Set ENABLE_FAL_BRAND_ASSETS=true on the server.",
      };
    }

    return {
      ok: true,
      config: {
        provider: "fal",
        model: FAL_BRAND_ASSETS_MODEL,
        workflow: "brand_assets",
        creditsUsed: getCreditCostForImageMode("brand_assets"),
        transactionSource: "brand_assets_generation_job",
      },
    };
  }

  if (imageMode === "ugc_look") {
    if (process.env.ENABLE_UGC_LOOK !== "true") {
      return {
        ok: false,
        error: "UGC Look is not enabled. Set ENABLE_UGC_LOOK=true on the server.",
      };
    }

    return {
      ok: true,
      config: {
        provider: "openai",
        model: "gpt-image-1",
        workflow: "ugc_look",
        creditsUsed: getCreditCostForImageMode("ugc_look"),
        transactionSource: "ugc_look_generation_job",
      },
    };
  }

  return {
    ok: true,
    config: {
      provider: "openai",
      model: "gpt-image-1",
      workflow: "standard",
      creditsUsed: getCreditCostForImageMode("standard"),
      transactionSource: "standard_generation_job",
    },
  };
}

type ImageSize = "1024x1024" | "1024x1536" | "1536x1024";

type OutputFormat = {
  key: string;
  platform: string;
  label: string;
  aspectRatio: string;
  imageSize: ImageSize;
  width: number;
  height: number;
};

type CharacterRecord = {
  id: string;
  name: string;
  description: string | null;
  appearance_prompt: string | null;
  style_prompt: string | null;
  reference_image_url: string | null;
};

const OUTPUT_FORMATS: Record<string, OutputFormat> = {
  square: {
    key: "square",
    platform: "general",
    label: "Square",
    aspectRatio: "1:1",
    imageSize: "1024x1024",
    width: 1024,
    height: 1024,
  },
  tiktok: {
    key: "tiktok",
    platform: "tiktok",
    label: "TikTok / Reels",
    aspectRatio: "9:16",
    imageSize: "1024x1536",
    width: 1024,
    height: 1536,
  },
  instagram_post: {
    key: "instagram_post",
    platform: "instagram",
    label: "Instagram Post",
    aspectRatio: "4:5",
    imageSize: "1024x1536",
    width: 1024,
    height: 1536,
  },
  instagram_story: {
    key: "instagram_story",
    platform: "instagram",
    label: "Instagram Story",
    aspectRatio: "9:16",
    imageSize: "1024x1536",
    width: 1024,
    height: 1536,
  },
  youtube_thumbnail: {
    key: "youtube_thumbnail",
    platform: "youtube",
    label: "YouTube Thumbnail",
    aspectRatio: "16:9",
    imageSize: "1536x1024",
    width: 1536,
    height: 1024,
  },
  youtube_shorts: {
    key: "youtube_shorts",
    platform: "youtube",
    label: "YouTube Shorts",
    aspectRatio: "9:16",
    imageSize: "1024x1536",
    width: 1024,
    height: 1536,
  },
};

function getOutputFormat(formatKey: unknown): OutputFormat {
  if (typeof formatKey !== "string") {
    return OUTPUT_FORMATS.square;
  }

  return OUTPUT_FORMATS[formatKey] ?? OUTPUT_FORMATS.square;
}

type EffectivePlatform =
  | "youtube_thumbnail"
  | "tiktok"
  | "instagram_post"
  | "instagram_story"
  | "youtube_shorts"
  | "square";

type ContentType =
  | "automotive"
  | "fitness"
  | "beauty"
  | "fashion"
  | "product"
  | "food"
  | "crypto"
  | "creator"
  | "general";

type DetectedLocation = {
  key: string;
  label: string;
};

type CreativeBrief = {
  normalizedText: string;
  isShort: boolean;
  platform: EffectivePlatform;
  contentTypes: ContentType[];
  subjectHints: string[];
  location: DetectedLocation | null;
  sceneDirection: string;
  formatBlock: string;
  brandSafetyBlock: string;
};

const CONTENT_DETECTORS: { type: ContentType; pattern: RegExp }[] = [
  {
    type: "automotive",
    pattern:
      /\b(cars?|autos?|sportwagen|luxusauto|fahrzeug|vehicles?|automotive|supercar|sports?\s*car|luxury\s*cars?)\b/i,
  },
  {
    type: "fitness",
    pattern:
      /\b(fitness|gym|workout|leggings|athlete|sport|training|muskel|fitnessstudio)\b/i,
  },
  {
    type: "beauty",
    pattern:
      /\b(beauty|skincare|makeup|cosmetics|perfume|parfum|schönheit|kosmetik|skincare)\b/i,
  },
  {
    type: "fashion",
    pattern:
      /\b(fashion|outfit|streetwear|dress|mode|model|creator|editorial)\b/i,
  },
  {
    type: "product",
    pattern:
      /\b(product|produkt|bottle|watch|sneaker|supplement|werbung|kampagne|ad\b|commercial)\b/i,
  },
  {
    type: "food",
    pattern:
      /\b(food|restaurant|burger|pizza|coffee|essen|gastronomie)\b/i,
  },
  {
    type: "crypto",
    pattern: /\b(crypto|bitcoin|ethereum|trading|crash|chart|blockchain)\b/i,
  },
  {
    type: "creator",
    pattern:
      /\b(creator|influencer|girl|woman|man|portrait|model|mädchen|frau)\b/i,
  },
];

const LOCATION_DETECTORS: {
  key: string;
  label: string;
  pattern: RegExp;
  hints: string[];
}[] = [
  {
    key: "new_york",
    label: "New York City",
    pattern: /\b(new\s*york|nyc|manhattan|times\s*square)\b/i,
    hints: [
      "recognizable Manhattan / New York City atmosphere",
      "Times Square lights or cinematic city street if suitable",
      "wet asphalt reflections and neon glow for night/cinematic mood",
    ],
  },
  {
    key: "dubai",
    label: "Dubai",
    pattern: /\bdubai\b/i,
    hints: [
      "luxury skyline and modern architecture",
      "premium Gulf city atmosphere with dramatic lighting",
    ],
  },
  {
    key: "paris",
    label: "Paris",
    pattern: /\bparis|pariser\b/i,
    hints: [
      "elegant Parisian street or boulevard",
      "fashion/editorial European atmosphere",
    ],
  },
  {
    key: "gym",
    label: "Luxury gym",
    pattern: /\b(gym|fitnessstudio|fitness\s*studio)\b/i,
    hints: [
      "modern luxury gym interior",
      "cinematic fitness environment with premium equipment",
    ],
  },
  {
    key: "studio",
    label: "Premium studio",
    pattern: /\b(studio|studiolicht|clean\s*background)\b/i,
    hints: ["clean premium studio lighting", "controlled commercial backdrop"],
  },
  {
    key: "los_angeles",
    label: "Los Angeles",
    pattern: /\blos\s*angeles\b/i,
    hints: ["sunlit LA urban or coastal creator aesthetic"],
  },
  {
    key: "london",
    label: "London",
    pattern: /\blondon\b/i,
    hints: ["recognizable London urban atmosphere"],
  },
  {
    key: "berlin",
    label: "Berlin",
    pattern: /\bberlin\b/i,
    hints: ["modern Berlin street or urban creative energy"],
  },
  {
    key: "miami",
    label: "Miami",
    pattern: /\bmiami\b/i,
    hints: ["vibrant Miami coastal or nightlife energy"],
  },
  {
    key: "tokyo",
    label: "Tokyo",
    pattern: /\btokyo\b/i,
    hints: ["Tokyo urban neon or street atmosphere"],
  },
];

function normalizePromptText(prompt: string) {
  const trimmed = prompt.trim();

  const wrappedMatch = trimmed.match(
    /based on this request:\s*([\s\S]+?)(?:\n\nFocus on|\s*$)/i
  );

  const core = (wrappedMatch?.[1] ?? trimmed)
    .replace(/\s+/g, " ")
    .replace(/^[:\-–—]+\s*/, "")
    .trim();

  const withoutCreatePrefix = core
    .replace(
      /^(erstelle(\s+mir)?|create|generate|mach(\s+mir)?|bitte)\s+(ein(en)?|a|an|mir)?\s*/i,
      ""
    )
    .replace(
      /^(thumbnail|vorschaubild)\s+(für|for)\s+(youtube|tiktok|instagram)\s*/i,
      ""
    )
    .trim();

  return withoutCreatePrefix || core;
}

function detectPlatform(
  prompt: string,
  outputFormat: OutputFormat
): EffectivePlatform {
  const text = normalizePromptText(prompt).toLowerCase();

  const promptSaysThumbnail =
    /\b(youtube|yt)\b/.test(text) &&
    /\b(thumbnail|thumb|vorschaubild|video\s*thumbnail)\b/.test(text);
  const promptSaysThumbnailOnly =
    /\b(thumbnail|thumb|vorschaubild)\b/.test(text) &&
    /\b(youtube|video)\b/.test(text);

  if (
    outputFormat.key === "youtube_thumbnail" ||
    promptSaysThumbnail ||
    promptSaysThumbnailOnly
  ) {
    return "youtube_thumbnail";
  }

  if (
    outputFormat.key === "tiktok" ||
    /\b(tiktok|reels?|reel)\b/.test(text)
  ) {
    return "tiktok";
  }

  if (
    outputFormat.key === "instagram_story" ||
    /\b(story|hochformat|instagram\s*story)\b/.test(text)
  ) {
    return "instagram_story";
  }

  if (
    outputFormat.key === "youtube_shorts" ||
    /\b(youtube\s*shorts?|shorts)\b/.test(text)
  ) {
    return "youtube_shorts";
  }

  if (
    outputFormat.key === "instagram_post" ||
    /\b(instagram\s*post|feed\s*post|instagram)\b/.test(text)
  ) {
    return "instagram_post";
  }

  if (outputFormat.key === "square" || /\b(square|quadrat|1:1)\b/.test(text)) {
    return "square";
  }

  return (outputFormat.key as EffectivePlatform) || "square";
}

function detectContentType(prompt: string): ContentType[] {
  const text = normalizePromptText(prompt);
  const found = CONTENT_DETECTORS.filter(({ pattern }) => pattern.test(text)).map(
    ({ type }) => type
  );

  return found.length > 0 ? found : ["general"];
}

function detectSubject(prompt: string): string[] {
  const types = detectContentType(prompt);
  const hints: string[] = [];

  if (types.includes("automotive")) {
    hints.push(
      "multiple luxury cars or supercars when context allows — not a single tiny car",
      "cinematic automotive scene with dynamic street perspective",
      "reflections, headlights, motion energy, premium automotive campaign style"
    );
  }

  if (types.includes("fitness")) {
    hints.push(
      "premium fitness creator campaign visual",
      "luxury gym or athletic environment, confident pose, athletic styling"
    );
  }

  if (types.includes("beauty")) {
    hints.push(
      "luxury beauty campaign aesthetic",
      "clean studio or glossy premium lighting, refined skincare/cosmetics mood"
    );
  }

  if (types.includes("fashion")) {
    hints.push(
      "editorial fashion campaign with premium styling",
      "magazine-quality composition and confident creator/model presence"
    );
  }

  if (types.includes("product")) {
    hints.push(
      "clear hero product focus with commercial lighting",
      "clean background or premium ad photography layout"
    );
  }

  if (types.includes("food")) {
    hints.push(
      "appetizing commercial food photography",
      "high detail textures, premium restaurant/ad lighting"
    );
  }

  if (types.includes("crypto")) {
    hints.push(
      "dramatic finance/crypto campaign mood",
      "bold charts, coins, screens or crash energy — readable at thumbnail size, high contrast"
    );
  }

  if (types.includes("creator") && !types.includes("fashion")) {
    hints.push(
      "creator-forward composition with expressive subject readable on mobile"
    );
  }

  return hints;
}

function detectLocation(prompt: string): DetectedLocation | null {
  const text = normalizePromptText(prompt);

  for (const location of LOCATION_DETECTORS) {
    if (location.pattern.test(text)) {
      return { key: location.key, label: location.label };
    }
  }

  if (/\b(city|stadt|urban|street|straße)\b/i.test(text)) {
    return { key: "urban", label: "Urban city" };
  }

  return null;
}

function buildPlatformFormatBlock(
  platform: EffectivePlatform,
  outputFormat: OutputFormat
) {
  if (platform === "youtube_thumbnail") {
    return `
Platform: YouTube Thumbnail (${outputFormat.label})
Aspect ratio: ${outputFormat.aspectRatio} wide

Format requirements:
- high-impact YouTube thumbnail concept (not a generic snapshot)
- wide 16:9 composition, bold visual hierarchy, strong focal point
- high contrast, dramatic lighting, dynamic composition
- clear subject separation, creator-style viral thumbnail aesthetic
- thumbnail optimized for clicks; readable at small preview size
- empty space for future title text (typically left or right third — do not render text)
- no actual text, no logo, no watermark in the image
    `.trim();
  }

  if (
    platform === "tiktok" ||
    platform === "instagram_story" ||
    platform === "youtube_shorts"
  ) {
    const label =
      platform === "tiktok"
        ? "TikTok / Reels"
        : platform === "instagram_story"
          ? "Instagram Story"
          : "YouTube Shorts";

    return `
Platform: ${label}
Aspect ratio: ${outputFormat.aspectRatio} vertical 9:16

Format requirements:
- mobile-first vertical composition, centered hero subject
- space for captions, stickers and platform UI (headroom + lower third)
- strong hook visual, premium social ad / creator campaign look
- no actual text, no logo, no watermark in the image
    `.trim();
  }

  if (platform === "instagram_post") {
    return `
Platform: Instagram Post
Aspect ratio: ${outputFormat.aspectRatio} portrait feed

Format requirements:
- polished Instagram feed composition with editorial framing
- premium creator campaign look, clean subject focus
- no actual text, no logo, no watermark in the image
    `.trim();
  }

  return `
Platform: Square social asset
Aspect ratio: ${outputFormat.aspectRatio}

Format requirements:
- balanced square composition with clean subject focus
- premium social asset layout, campaign-ready polish
- no actual text, no logo, no watermark in the image
  `.trim();
}

function buildLocationHints(location: DetectedLocation | null, platform: EffectivePlatform) {
  if (!location) return [];

  const detector = LOCATION_DETECTORS.find((entry) => entry.key === location.key);
  const hints = detector?.hints ?? [`recognizable ${location.label} atmosphere`];

  if (platform === "youtube_thumbnail" && location.key === "new_york") {
    return [
      ...hints,
      "recognizable Manhattan / New York City atmosphere",
      "Times Square lights or cinematic city street if suitable",
      "wet asphalt reflections and neon glow for night/cinematic mood",
      "cinematic NYC street scene with depth — skyline, traffic, urban scale",
    ];
  }

  return hints;
}

function buildSceneDirection({
  normalizedText,
  platform,
  contentTypes,
  subjectHints,
  location,
  isShort,
}: {
  normalizedText: string;
  platform: EffectivePlatform;
  contentTypes: ContentType[];
  subjectHints: string[];
  location: DetectedLocation | null;
  isShort: boolean;
}) {
  const parts: string[] = [
    "Creative interpretation (expand the user request — do not replace their wording):",
    `User intent: "${normalizedText}"`,
  ];

  if (isShort || platform === "youtube_thumbnail") {
    if (platform === "youtube_thumbnail") {
      parts.push(
        "Deliver a click-worthy YouTube thumbnail concept with story-in-one-frame clarity."
      );

      if (
        contentTypes.includes("automotive") &&
        location?.key === "new_york"
      ) {
        parts.push(
          "Scene: high-impact YouTube thumbnail about multiple luxury cars or supercars in New York City — Manhattan atmosphere, Times Square lights if suitable, cinematic automotive street scene, not a single isolated car."
        );
      } else if (contentTypes.includes("automotive")) {
        parts.push(
          "Scene: high-impact automotive thumbnail — multiple luxury cars or supercars, cinematic road or city context, reflections and headlights, strong scale and motion."
        );
      } else if (contentTypes.includes("crypto")) {
        parts.push(
          "Scene: dramatic crypto/finance thumbnail — bold visual metaphor for crash or market tension, extreme contrast."
        );
      }
    } else if (
      platform === "tiktok" ||
      platform === "instagram_story" ||
      platform === "youtube_shorts"
    ) {
      parts.push(
        "Scene: vertical creator ad with one clear hero moment and immediate visual hook."
      );
    } else if (platform === "instagram_post") {
      parts.push(
        "Scene: premium Instagram feed campaign frame with editorial polish."
      );
    } else if (isShort) {
      parts.push(
        "Scene: expand this short brief into a complete professional campaign visual."
      );
    }
  }

  if (subjectHints.length > 0) {
    parts.push("Subject direction:");
    subjectHints.forEach((hint) => parts.push(`- ${hint}`));
  }

  const locationHints = buildLocationHints(location, platform);

  if (locationHints.length > 0) {
    parts.push(`Location direction (${location?.label ?? "environment"}):`);
    locationHints.forEach((hint) => parts.push(`- ${hint}`));
  }

  return parts.join("\n");
}

function buildBrandSafetyBlock(platform: EffectivePlatform) {
  const needsOverlaySpace =
    platform === "youtube_thumbnail" ||
    platform === "tiktok" ||
    platform === "instagram_story" ||
    platform === "instagram_post" ||
    platform === "youtube_shorts";

  if (!needsOverlaySpace) {
    return `
Brand safety:
- no actual text, no logo, no watermark in the image
    `.trim();
  }

  return `
Brand safety (mandatory):
- no actual text rendered in the image
- no logo, no watermark, no UI mockup typography
- leave clean negative space for future title or caption overlay where relevant
- composition must stay readable after post-production text is added
  `.trim();
}

function buildCreativeBrief({
  prompt,
  outputFormat,
  character,
}: {
  prompt: string;
  outputFormat: OutputFormat;
  character?: CharacterRecord | null;
}): CreativeBrief {
  const normalizedText = normalizePromptText(prompt);
  const wordCount = normalizedText.split(/\s+/).filter(Boolean).length;
  const isShort = wordCount <= 20 || normalizedText.length <= 160;
  const platform = detectPlatform(prompt, outputFormat);
  const contentTypes = detectContentType(prompt);
  const subjectHints = detectSubject(prompt);
  const location = detectLocation(prompt);

  const sceneDirection = buildSceneDirection({
    normalizedText,
    platform,
    contentTypes,
    subjectHints,
    location,
    isShort,
  });

  let formatBlock = buildPlatformFormatBlock(platform, outputFormat);

  if (character) {
    formatBlock += `\n\nStyle profile active: apply profile look/mood while respecting all format rules above.`;
  }

  return {
    normalizedText,
    isShort,
    platform,
    contentTypes,
    subjectHints,
    location,
    sceneDirection,
    formatBlock,
    brandSafetyBlock: buildBrandSafetyBlock(platform),
  };
}

function buildQualityRules() {
  return `
Quality standards:
- premium editorial / commercial photography
- realistic materials, textures and lighting
- sharp detail on the main subject
- high-end social campaign finish
- no distorted anatomy, no plastic skin, no deformed hands
- no blurry low-quality output
  `.trim();
}

function assembleFinalPrompt(sections: string[]) {
  return sections.filter((section) => section.trim().length > 0).join("\n\n");
}

function buildVideoImageToVideoFinalPrompt(motionInstruction: string) {
  return assembleFinalPrompt([
    `Animate the provided source image into a short cinematic social media video.`,
    `Keep the main subject recognizable.`,
    `Use smooth camera motion.`,
    `Premium creator campaign look.`,
    `No text, no logo, no watermark.`,
    `User motion direction (preserve intent — do not replace):
${motionInstruction.trim()}`,
  ]);
}

function buildLipSyncFinalPrompt(instructions: string) {
  const sections = [
    `Create a premium talking creator / UGC lip-sync video.`,
    `Sync mouth movement naturally to the provided audio.`,
    `Keep the subject recognizable.`,
    `Premium creator campaign look.`,
    `No text, no logo, no watermark.`,
  ];

  if (instructions.trim()) {
    sections.push(
      `Optional direction from user (preserve intent):
${instructions.trim()}`
    );
  }

  return assembleFinalPrompt(sections);
}

function parseSourceMediaType(value: unknown): "image" | "video" {
  return value === "video" ? "video" : "image";
}

function buildReferenceEditFinalPrompt(editInstruction: string) {
  return assembleFinalPrompt([
    `Edit the provided source image according to the instructions below.

User edit instructions:
${editInstruction.trim()}`,
    `Preserve important subject details unless the instruction says otherwise.`,
    `Create a production-ready campaign asset.`,
    `No text, no logo, no watermark unless explicitly requested.`,
    buildQualityRules(),
  ]);
}

function userRequestsBrandedTextOrLogo(prompt: string) {
  const text = prompt.toLowerCase();

  const requestsText =
    /\b(text|headline|caption|typography|slogan|title|wording|lettering|font|subtitle|tagline)\b/i.test(
      prompt
    ) || /\b(mit text|with text|schreibe|write)\b/i.test(text);

  const requestsLogo =
    /\b(logo|brand mark|brandmark|emblem|wordmark|icon mark)\b/i.test(text);

  return { requestsText, requestsLogo };
}

function buildBrandAssetsSafetyBlock(userPrompt: string) {
  const { requestsText } = userRequestsBrandedTextOrLogo(userPrompt);

  const sections = [
    `Brand Assets — mandatory (always apply):
- Create a premium brand-ready advertising visual.
- If no real brand assets or exact brand name are provided, use unbranded packaging.
- Product labels should be blank or minimal.
- No readable text.
- No fake logo.
- No fake brand name.
- No random typography.
- Leave clean negative space for future real branding, headline or campaign copy.
- Clean commercial composition.
- Product must be sharp, polished and usable as an ad creative.
- High-end lighting, premium material detail, realistic reflections.`,
  ];

  if (requestsText) {
    sections.push(
      `User requested text — apply conservatively:
- Only include exact user-provided text. Avoid fake unreadable typography.`
    );
  }

  return sections.join("\n\n");
}

function buildBrandAssetsFinalPrompt({
  prompt,
  outputFormat,
}: {
  prompt: string;
  outputFormat: OutputFormat;
}) {
  const brief = buildCreativeBrief({ prompt, outputFormat });

  return assembleFinalPrompt([
    `Create a premium brand-ready advertising visual.

User brief (preserve exactly — do not replace or contradict):
${prompt}`,
    brief.sceneDirection,
    brief.formatBlock,
    buildBrandAssetsSafetyBlock(prompt),
    buildQualityRules(),
    `Output target: ${outputFormat.label} · brand-ready campaign asset.`,
  ]);
}

function buildBrandAssetsCharacterStylePrompt({
  character,
  prompt,
  outputFormat,
}: {
  character: CharacterRecord;
  prompt: string;
  outputFormat: OutputFormat;
}) {
  const brief = buildCreativeBrief({ prompt, outputFormat, character });

  return assembleFinalPrompt([
    `Create a premium brand-ready advertising visual using a saved style profile.

Style profile (creative direction only — not exact identity lock):
Name: ${character.name}
Description: ${character.description ?? "—"}
Appearance: ${character.appearance_prompt ?? "—"}
Style: ${character.style_prompt ?? "—"}

User brief (preserve exactly — do not replace or contradict):
${prompt}`,
    brief.sceneDirection,
    brief.formatBlock,
    buildBrandAssetsSafetyBlock(prompt),
    buildQualityRules(),
    `Blend the style profile aesthetic with the brand asset direction and format rules above.`,
  ]);
}

function buildStandardFinalPrompt({
  prompt,
  outputFormat,
}: {
  prompt: string;
  outputFormat: OutputFormat;
}) {
  const brief = buildCreativeBrief({ prompt, outputFormat });

  return assembleFinalPrompt([
    `Create a premium AI-generated campaign visual.

User request (preserve exactly — do not replace or contradict):
${prompt}`,
    brief.sceneDirection,
    brief.formatBlock,
    brief.brandSafetyBlock,
    buildQualityRules(),
    `Output target: ${outputFormat.label} · professional creator-brand campaign asset.`,
  ]);
}

function userRequestedStudioLook(prompt: string) {
  const text = normalizePromptText(prompt).toLowerCase();
  return /\b(studio|luxury|editorial|high-end commercial|campaign shoot|magazine|glossy ad)\b/i.test(
    text
  );
}

function promptMentionsCarContext(prompt: string) {
  const text = normalizePromptText(prompt).toLowerCase();
  return (
    detectContentType(prompt).includes("automotive") ||
    /\b(car|auto|vehicle|dashboard|driving|parking|commute|on the go|on-the-go|road trip|steering|windshield|seat)\b/i.test(
      text
    )
  );
}

function promptMentionsFitnessContext(prompt: string) {
  const text = normalizePromptText(prompt).toLowerCase();
  return (
    detectContentType(prompt).includes("fitness") ||
    /\b(gym|workout|fitness|leggings|pre-workout|shaker|training|gym bag)\b/i.test(
      text
    )
  );
}

function promptMentionsBeautyContext(prompt: string) {
  const text = normalizePromptText(prompt).toLowerCase();
  return (
    detectContentType(prompt).includes("beauty") ||
    /\b(skincare|makeup|beauty|serum|moisturizer|bathroom|mirror selfie|routine)\b/.test(
      text
    )
  );
}

function buildUGCLookNegativeBlock() {
  return `
UGC Look — explicitly avoid (mandatory unless the user clearly requested studio/luxury):
- no studio lighting
- no perfect editorial lighting
- no luxury campaign set
- no hyper-polished ad layout
- no plastic skin
- no overly symmetrical composition
- no fake text, no fake logos, no watermarks
- not a studio shoot
- not luxury editorial
- not overly polished
- not a cinematic advertisement
  `.trim();
}

function buildUGCLookQualityRules() {
  return `
Quality standards (UGC Look):
- high-quality but believable organic creator content (not "bad quality" on purpose)
- natural skin texture with realistic pores and tone
- sharp enough for social feeds while still feeling phone-captured
- attractive but imperfect framing — candid, not art-directed symmetry
- no distorted anatomy, no deformed hands
- subtle sensor noise or minor motion blur only when it supports realism
  `.trim();
}

function buildUGCLookPlatformFormatBlock(
  platform: EffectivePlatform,
  outputFormat: OutputFormat
) {
  if (platform === "youtube_thumbnail") {
    return `
Platform: YouTube Thumbnail (${outputFormat.label})
Aspect ratio: ${outputFormat.aspectRatio} wide

Format requirements:
- creator-shot thumbnail energy (phone or casual camera feel — not a luxury studio set)
- wide composition with a clear focal subject
- strong hook visual readable at small preview size
- empty space for future title text — do not render text
- no actual text, no logo, no watermark in the image
    `.trim();
  }

  if (
    platform === "tiktok" ||
    platform === "instagram_story" ||
    platform === "youtube_shorts"
  ) {
    const label =
      platform === "tiktok"
        ? "TikTok / Reels"
        : platform === "instagram_story"
          ? "Instagram Story"
          : "YouTube Shorts";

    return `
Platform: ${label}
Aspect ratio: ${outputFormat.aspectRatio} vertical 9:16

Format requirements:
- vertical 9:16, mobile-first framing
- close creator framing suitable for short-form video
- space for captions and app UI (headroom + lower third)
- handheld social video frame look — feels like a still from a real short-form video
- organic TikTok/Reels creator post aesthetic
- no actual text, no logo, no watermark in the image
    `.trim();
  }

  if (platform === "instagram_post") {
    return `
Platform: Instagram Post
Aspect ratio: ${outputFormat.aspectRatio} portrait feed

Format requirements:
- casual creator feed photo — phone or everyday camera
- believable real-life creator post, not a magazine editorial
- no actual text, no logo, no watermark in the image
    `.trim();
  }

  return `
Platform: Square social asset
Aspect ratio: ${outputFormat.aspectRatio}

Format requirements:
- balanced square composition with natural creator framing
- believable organic social content — not a polished campaign layout
- no actual text, no logo, no watermark in the image
  `.trim();
}

function buildUGCSubjectHints(prompt: string, contentTypes: ContentType[]) {
  const hints: string[] = [];
  const allowLuxury = userRequestedStudioLook(prompt);

  if (contentTypes.includes("automotive")) {
    hints.push(
      allowLuxury
        ? "cars in a believable everyday setting — still shot like a creator, not a dealership studio"
        : "everyday car interior or exterior context — dashboard, seat, window, parking lot or street",
      "natural daylight or casual parking-lot lighting",
      "casual creator selfie angle or passenger-seat POV when suitable"
    );
  }

  if (contentTypes.includes("fitness")) {
    hints.push(
      "gym bag, shaker, leggings, casual pre-workout vibe",
      allowLuxury
        ? "real gym or car-before-gym environment — still organic creator energy"
        : "real gym or car-before-gym environment — not a luxury studio gym unless explicitly requested",
      "authentic pre-workout creator moment"
    );
  }

  if (contentTypes.includes("beauty")) {
    hints.push(
      "bathroom mirror or phone selfie angle, natural indoor light",
      "real shelf or countertop context — casual recommendation vibe",
      allowLuxury
        ? "skincare/makeup shown like a real creator routine"
        : "avoid glossy studio beauty lighting unless explicitly requested"
    );
  }

  if (contentTypes.includes("fashion")) {
    hints.push(
      "creator outfit check or mirror selfie — everyday styling, not runway editorial"
    );
  }

  if (contentTypes.includes("product")) {
    hints.push(
      "product held in hand or on a real surface",
      "creator-shot product recommendation in a real home/car/bathroom/gym setting",
      "imperfect but attractive framing"
    );
  }

  if (contentTypes.includes("food")) {
    hints.push(
      "casual food creator shot — kitchen table, cafe, or car snack moment",
      "natural light, not restaurant studio plating unless requested"
    );
  }

  if (contentTypes.includes("creator") && !contentTypes.includes("fashion")) {
    hints.push(
      "expressive creator presence readable on mobile — candid, not posed like a catalog"
    );
  }

  return hints;
}

function buildUGCLookContextBlock({
  prompt,
  platform,
  contentTypes,
}: {
  prompt: string;
  platform: EffectivePlatform;
  contentTypes: ContentType[];
}) {
  const sections: string[] = [];

  if (promptMentionsCarContext(prompt)) {
    sections.push(
      `Auto / on-the-go context:`,
      `- everyday car interior, dashboard, seat or window context`,
      `- natural daylight or parking-lot lighting`,
      `- casual creator angle — commuting or parked moment`
    );
  }

  if (promptMentionsFitnessContext(prompt)) {
    sections.push(
      `Fitness context:`,
      `- gym bag, shaker, leggings, casual pre-workout vibe`,
      `- real gym or car-before-gym environment`,
      `- not a luxury studio gym unless explicitly requested`
    );
  }

  if (promptMentionsBeautyContext(prompt)) {
    sections.push(
      `Beauty / skincare context:`,
      `- bathroom mirror or phone selfie, natural indoor light`,
      `- real shelf or countertop context`,
      `- casual recommendation vibe — friend sharing a product`
    );
  }

  if (
    contentTypes.includes("product") ||
    /\b(product|unboxing|review|recommend|haul)\b/i.test(normalizePromptText(prompt))
  ) {
    sections.push(
      `Product UGC context:`,
      `- product held in hand or used in a real setting`,
      `- real home, car, bathroom or gym background`,
      `- creator-shot product recommendation`,
      `- imperfect but attractive framing`
    );
  }

  if (
    platform === "tiktok" ||
    platform === "instagram_story" ||
    platform === "youtube_shorts"
  ) {
    sections.push(
      `Short-form vertical context:`,
      `- vertical 9:16, mobile-first framing`,
      `- close creator framing`,
      `- space for captions and app UI`,
      `- handheld social video frame look`,
      `- feels like a still from a real short-form video`
    );
  }

  return sections.length > 0 ? sections.join("\n") : "";
}

function buildUGCLookSceneDirection({
  normalizedText,
  platform,
  prompt,
  contentTypes,
  location,
  isShort,
}: {
  normalizedText: string;
  platform: EffectivePlatform;
  prompt: string;
  contentTypes: ContentType[];
  location: DetectedLocation | null;
  isShort: boolean;
}) {
  const parts: string[] = [
    "Creative interpretation (expand the user request — keep casual UGC energy, do not replace their wording):",
    `User intent: "${normalizedText}"`,
  ];

  if (isShort) {
    if (
      platform === "tiktok" ||
      platform === "instagram_story" ||
      platform === "youtube_shorts"
    ) {
      parts.push(
        "Scene: one believable creator moment captured on a phone — candid, immediate, organic."
      );
    } else if (platform === "instagram_post") {
      parts.push(
        "Scene: casual creator feed post — real environment, natural light, not a magazine shoot."
      );
    } else {
      parts.push(
        "Scene: expand into a complete believable creator post — everyday setting, phone-camera realism."
      );
    }
  }

  const subjectHints = buildUGCSubjectHints(prompt, contentTypes);

  if (subjectHints.length > 0) {
    parts.push("Subject direction (UGC):");
    subjectHints.forEach((hint) => parts.push(`- ${hint}`));
  }

  const locationHints = buildLocationHints(location, platform);

  if (locationHints.length > 0) {
    parts.push(`Environment (${location?.label ?? "real-world setting"}):`);
    locationHints.forEach((hint) => parts.push(`- ${hint} (everyday, not a film set)`));
  }

  if (userRequestedStudioLook(prompt)) {
    parts.push(
      "Note: user mentioned studio/luxury — keep smartphone UGC framing but allow slightly elevated styling."
    );
  }

  return parts.join("\n");
}

function buildUGCLookStyleBlock({
  prompt,
  platform,
  contentTypes,
}: {
  prompt: string;
  platform: EffectivePlatform;
  contentTypes: ContentType[];
}) {
  const sections: string[] = [
    `UGC Look style (mandatory):`,
    `- authentic user-generated content`,
    `- casual smartphone photo, shot on phone`,
    `- natural everyday lighting`,
    `- slightly imperfect framing`,
    `- candid creator content`,
    `- realistic casual environment`,
    `- organic TikTok/Reels style`,
    `- not a studio shoot`,
    `- not luxury editorial`,
    `- not overly polished`,
    `- not a cinematic advertisement`,
    `- natural skin texture`,
    `- subtle noise or minor motion blur if suitable`,
    `- believable real-life creator post`,
    `- high-quality but organic — attractive, not sloppy or low-res on purpose`,
    `- no text, no logo, no watermark`,
  ];

  const contextBlock = buildUGCLookContextBlock({ prompt, platform, contentTypes });

  if (contextBlock) {
    sections.push("", contextBlock);
  }

  return sections.join("\n");
}

function buildUGCLookFinalPrompt({
  prompt,
  outputFormat,
}: {
  prompt: string;
  outputFormat: OutputFormat;
}) {
  const brief = buildCreativeBrief({ prompt, outputFormat });
  const ugcSceneDirection = buildUGCLookSceneDirection({
    normalizedText: brief.normalizedText,
    platform: brief.platform,
    prompt,
    contentTypes: brief.contentTypes,
    location: brief.location,
    isShort: brief.isShort,
  });
  const ugcFormatBlock = buildUGCLookPlatformFormatBlock(
    brief.platform,
    outputFormat
  );

  return assembleFinalPrompt([
    `Create an authentic creator-style UGC photo for social media.
This must look like real smartphone content — believable, organic, and creator-shot (not a luxury studio or editorial campaign).`,
    `User request (preserve exactly — do not replace or contradict):
${prompt}`,
    ugcSceneDirection,
    ugcFormatBlock,
    brief.brandSafetyBlock,
    buildUGCLookStyleBlock({
      prompt,
      platform: brief.platform,
      contentTypes: brief.contentTypes,
    }),
    buildUGCLookNegativeBlock(),
    buildUGCLookQualityRules(),
    `Output target: ${outputFormat.label} · UGC Look (authentic creator-style).`,
  ]);
}

function buildUGCLookCharacterStylePrompt({
  character,
  prompt,
  outputFormat,
}: {
  character: CharacterRecord;
  prompt: string;
  outputFormat: OutputFormat;
}) {
  const brief = buildCreativeBrief({ prompt, outputFormat, character });
  const ugcSceneDirection = buildUGCLookSceneDirection({
    normalizedText: brief.normalizedText,
    platform: brief.platform,
    prompt,
    contentTypes: brief.contentTypes,
    location: brief.location,
    isShort: brief.isShort,
  });
  let ugcFormatBlock = buildUGCLookPlatformFormatBlock(
    brief.platform,
    outputFormat
  );
  ugcFormatBlock += `\n\nStyle profile active: apply profile mood while keeping UGC smartphone realism (not studio polish).`;

  return assembleFinalPrompt([
    `Create an authentic creator-style UGC photo for social media using a saved style profile.
Keep the output believable as real smartphone content — organic creator energy, not a luxury studio shoot.`,
    `Style profile (creative direction only — not exact identity lock):
Name: ${character.name}
Description: ${character.description ?? "—"}
Appearance: ${character.appearance_prompt ?? "—"}
Style: ${character.style_prompt ?? "—"}`,
    `User request (preserve exactly — do not replace or contradict):
${prompt}`,
    ugcSceneDirection,
    ugcFormatBlock,
    brief.brandSafetyBlock,
    buildUGCLookStyleBlock({
      prompt,
      platform: brief.platform,
      contentTypes: brief.contentTypes,
    }),
    buildUGCLookNegativeBlock(),
    buildUGCLookQualityRules(),
    `Blend the style profile aesthetic with the UGC Look rules above.`,
  ]);
}

function buildCharacterStylePrompt({
  character,
  prompt,
  outputFormat,
}: {
  character: CharacterRecord;
  prompt: string;
  outputFormat: OutputFormat;
}) {
  const brief = buildCreativeBrief({ prompt, outputFormat, character });

  return assembleFinalPrompt([
    `Create a premium AI-generated campaign visual using a saved style profile.

Style profile (creative direction only — not exact identity lock):
Name: ${character.name}
Description: ${character.description ?? "—"}
Appearance: ${character.appearance_prompt ?? "—"}
Style: ${character.style_prompt ?? "—"}

User request (preserve exactly — do not replace or contradict):
${prompt}`,
    brief.sceneDirection,
    brief.formatBlock,
    brief.brandSafetyBlock,
    buildQualityRules(),
    `Blend the style profile aesthetic with the format and scene direction above.`,
  ]);
}

async function refundCredits(
  userId: string,
  creditsToRefund: number = getCreditCostForImageMode("standard")
) {
  if (creditsToRefund <= 0) return;

  const { error } = await supabaseAdmin.rpc("refund_user_credits", {
    target_user_id: userId,
    credits_to_refund: creditsToRefund,
  });

  if (error) {
    console.error("Credit refund error:", error);
  }

  const { error: transactionError } = await supabaseAdmin
    .from("credit_transactions")
    .insert({
      user_id: userId,
      amount: creditsToRefund,
      type: "refund",
      source: "generation_job_create_failure",
    });

  if (transactionError) {
    console.error("Refund transaction log error:", transactionError);
  }
}

async function triggerWorker(generationId: string, origin: string) {
  const response = await fetch(`${origin}/api/generate/process`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-worker-secret": process.env.GENERATION_WORKER_SECRET!,
    },
    body: JSON.stringify({
      generationId,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.error("Worker trigger failed:", {
      status: response.status,
      body: text,
    });
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Missing authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const prompt = body.prompt;
    const characterId = body.characterId ?? null;
    const plannedModeError = getPlannedModeRejection(body.imageMode);

    if (plannedModeError) {
      return NextResponse.json({ error: plannedModeError }, { status: 400 });
    }

    const imageMode = parseGenerateMode(body.imageMode);
    const outputFormat = getOutputFormat(body.outputFormat);
    const sourceImageUrl =
      typeof body.sourceImageUrl === "string"
        ? body.sourceImageUrl.trim()
        : "";
    const editInstruction =
      typeof body.editInstruction === "string"
        ? body.editInstruction.trim()
        : "";
    const motionInstruction =
      typeof body.motionInstruction === "string"
        ? body.motionInstruction.trim()
        : "";
    const sourceMediaUrl =
      typeof body.sourceMediaUrl === "string" ? body.sourceMediaUrl.trim() : "";
    const audioUrl =
      typeof body.audioUrl === "string" ? body.audioUrl.trim() : "";
    const sourceMediaType = parseSourceMediaType(body.sourceMediaType);
    const lipSyncInstructions =
      typeof body.lipSyncInstructions === "string"
        ? body.lipSyncInstructions.trim()
        : typeof body.instructions === "string"
          ? body.instructions.trim()
          : "";

    if (imageMode === "lip_sync") {
      if (!sourceMediaUrl) {
        return NextResponse.json(
          { error: "Source media is required for Lip Sync Studio." },
          { status: 400 }
        );
      }

      if (!audioUrl) {
        return NextResponse.json(
          { error: "Audio is required for Lip Sync Studio." },
          { status: 400 }
        );
      }

      const lipJobConfigResult = resolveGenerationJobConfig(imageMode);

      if (!lipJobConfigResult.ok) {
        return NextResponse.json(
          { error: lipJobConfigResult.error },
          { status: 400 }
        );
      }

      const lipJobConfig = lipJobConfigResult.config;
      const lipModel =
        sourceMediaType === "video"
          ? FAL_LIP_SYNC_VIDEO_MODEL
          : FAL_LIP_SYNC_IMAGE_MODEL;
      const finalPrompt = buildLipSyncFinalPrompt(lipSyncInstructions);
      const promptLabel =
        lipSyncInstructions || "Lip Sync generation";

      const { count: lipActiveCount, error: lipActiveError } =
        await supabaseAdmin
          .from("generations")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("status", "processing");

      if (lipActiveError) {
        console.error("Active generation count error:", lipActiveError);

        return NextResponse.json(
          { error: "Could not verify active generations" },
          { status: 500 }
        );
      }

      if ((lipActiveCount ?? 0) >= ACTIVE_GENERATION_LIMIT) {
        return NextResponse.json(
          {
            error: "Too many active generations",
            reason: "active_generation_limit",
            limit: ACTIVE_GENERATION_LIMIT,
          },
          { status: 429 }
        );
      }

      const { data: lipCreditSuccess, error: lipCreditError } =
        await supabaseAdmin.rpc("consume_user_credits", {
          target_user_id: user.id,
          credits_to_consume: lipJobConfig.creditsUsed,
        });

      if (lipCreditError) {
        console.error("Credit consume error:", lipCreditError);

        return NextResponse.json(
          { error: "Credit check failed" },
          { status: 500 }
        );
      }

      if (!lipCreditSuccess) {
        return NextResponse.json(
          {
            error: "Not enough credits",
            requiredCredits: lipJobConfig.creditsUsed,
            reason: "insufficient_credits",
          },
          { status: 402 }
        );
      }

      const lipInsertBase: Record<string, unknown> = {
        user_id: user.id,
        prompt: promptLabel,
        final_prompt: finalPrompt,
        image_url: null,
        video_url: null,
        status: "processing",
        provider: lipJobConfig.provider,
        model: lipModel,
        workflow: lipJobConfig.workflow,
        source_image_url:
          sourceMediaType === "image" ? sourceMediaUrl : null,
        source_video_url:
          sourceMediaType === "video" ? sourceMediaUrl : null,
        audio_url: audioUrl,
        social_platform: outputFormat.platform,
        output_format: outputFormat.label,
        image_size: outputFormat.imageSize,
        output_width: outputFormat.width,
        output_height: outputFormat.height,
        credits_used: lipJobConfig.creditsUsed,
        character_id: null,
        error_message: null,
        started_at: new Date().toISOString(),
      };

      let lipGenerationError: { message?: string; code?: string } | null = null;
      let lipGeneration: { id: string } | null = null;

      const lipInsertAttempt = await supabaseAdmin
        .from("generations")
        .insert(lipInsertBase)
        .select("id")
        .single();

      if (lipInsertAttempt.error && isMissingColumnError(lipInsertAttempt.error)) {
        const lipFallback = await supabaseAdmin
          .from("generations")
          .insert({
            user_id: lipInsertBase.user_id,
            prompt: lipInsertBase.prompt,
            final_prompt: lipInsertBase.final_prompt,
            image_url: null,
            status: "processing",
            provider: lipInsertBase.provider,
            model: lipModel,
            workflow: lipInsertBase.workflow,
            reference_image_url:
              sourceMediaType === "image" ? sourceMediaUrl : null,
            social_platform: lipInsertBase.social_platform,
            output_format: lipInsertBase.output_format,
            image_size: lipInsertBase.image_size,
            output_width: lipInsertBase.output_width,
            output_height: lipInsertBase.output_height,
            credits_used: lipInsertBase.credits_used,
            character_id: null,
            error_message: null,
            started_at: lipInsertBase.started_at,
          })
          .select("id")
          .single();

        lipGenerationError = lipFallback.error;
        lipGeneration = lipFallback.data;
      } else {
        lipGenerationError = lipInsertAttempt.error;
        lipGeneration = lipInsertAttempt.data;
      }

      if (lipGenerationError || !lipGeneration) {
        console.error(
          "Lip sync generation create error:",
          JSON.stringify(lipGenerationError, null, 2)
        );

        await refundCredits(user.id, lipJobConfig.creditsUsed);

        return NextResponse.json(
          { error: "Failed to create lip sync job. Credits refunded." },
          { status: 500 }
        );
      }

      const { error: lipTxError } = await supabaseAdmin
        .from("credit_transactions")
        .insert({
          user_id: user.id,
          amount: -lipJobConfig.creditsUsed,
          type: "usage",
          source: lipJobConfig.transactionSource,
        });

      if (lipTxError) {
        console.error("Credit transaction log error:", lipTxError);
      }

      const lipOrigin =
        req.headers.get("origin") ??
        process.env.NEXT_PUBLIC_APP_URL ??
        new URL(req.url).origin;

      try {
        await triggerWorker(lipGeneration.id, lipOrigin);
      } catch (error) {
        console.error("Worker trigger exception:", error);
      }

      return NextResponse.json({
        success: true,
        queued: true,
        generationId: lipGeneration.id,
        creditsUsed: lipJobConfig.creditsUsed,
        characterId: null,
        imageMode,
        workflow: lipJobConfig.workflow,
        provider: lipJobConfig.provider,
        model: lipModel,
        sourceMediaUrl,
        audioUrl,
        sourceMediaType,
        outputFormat,
      });
    }

    if (imageMode === "video_image_to_video") {
      if (!sourceImageUrl) {
        return NextResponse.json(
          { error: "Source image is required for Video Studio." },
          { status: 400 }
        );
      }

      if (!motionInstruction) {
        return NextResponse.json(
          { error: "Motion prompt is required for Video Studio." },
          { status: 400 }
        );
      }

      const videoJobConfigResult = resolveGenerationJobConfig(imageMode);

      if (!videoJobConfigResult.ok) {
        return NextResponse.json(
          { error: videoJobConfigResult.error },
          { status: 400 }
        );
      }

      const videoJobConfig = videoJobConfigResult.config;
      const finalPrompt = buildVideoImageToVideoFinalPrompt(motionInstruction);

      const { count: videoActiveCount, error: videoActiveError } =
        await supabaseAdmin
          .from("generations")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("status", "processing");

      if (videoActiveError) {
        console.error("Active generation count error:", videoActiveError);

        return NextResponse.json(
          { error: "Could not verify active generations" },
          { status: 500 }
        );
      }

      if ((videoActiveCount ?? 0) >= ACTIVE_GENERATION_LIMIT) {
        return NextResponse.json(
          {
            error: "Too many active generations",
            reason: "active_generation_limit",
            limit: ACTIVE_GENERATION_LIMIT,
          },
          { status: 429 }
        );
      }

      const { data: videoCreditSuccess, error: videoCreditError } =
        await supabaseAdmin.rpc("consume_user_credits", {
          target_user_id: user.id,
          credits_to_consume: videoJobConfig.creditsUsed,
        });

      if (videoCreditError) {
        console.error("Credit consume error:", videoCreditError);

        return NextResponse.json(
          { error: "Credit check failed" },
          { status: 500 }
        );
      }

      if (!videoCreditSuccess) {
        return NextResponse.json(
          {
            error: "Not enough credits",
            requiredCredits: videoJobConfig.creditsUsed,
            reason: "insufficient_credits",
          },
          { status: 402 }
        );
      }

      const videoInsertBase = {
        user_id: user.id,
        prompt: motionInstruction,
        final_prompt: finalPrompt,
        image_url: null,
        video_url: null,
        status: "processing",
        provider: videoJobConfig.provider,
        model: videoJobConfig.model,
        workflow: videoJobConfig.workflow,
        reference_image_url: sourceImageUrl,
        source_image_url: sourceImageUrl,
        social_platform: outputFormat.platform,
        output_format: outputFormat.label,
        image_size: outputFormat.imageSize,
        output_width: outputFormat.width,
        output_height: outputFormat.height,
        credits_used: videoJobConfig.creditsUsed,
        duration_seconds: 5,
        character_id: null,
        error_message: null,
        started_at: new Date().toISOString(),
      };

      let videoGenerationError: { message?: string; code?: string } | null =
        null;
      let videoGeneration: { id: string } | null = null;

      const videoInsertAttempt = await supabaseAdmin
        .from("generations")
        .insert(videoInsertBase)
        .select("id")
        .single();

      if (
        videoInsertAttempt.error &&
        isMissingColumnError(videoInsertAttempt.error)
      ) {
        const videoFallback = await supabaseAdmin
          .from("generations")
          .insert({
            user_id: videoInsertBase.user_id,
            prompt: videoInsertBase.prompt,
            final_prompt: videoInsertBase.final_prompt,
            image_url: null,
            status: "processing",
            provider: videoInsertBase.provider,
            model: videoJobConfig.model,
            workflow: videoInsertBase.workflow,
            reference_image_url: sourceImageUrl,
            social_platform: videoInsertBase.social_platform,
            output_format: videoInsertBase.output_format,
            image_size: videoInsertBase.image_size,
            output_width: videoInsertBase.output_width,
            output_height: videoInsertBase.output_height,
            credits_used: videoInsertBase.credits_used,
            character_id: null,
            error_message: null,
            started_at: videoInsertBase.started_at,
          })
          .select("id")
          .single();

        videoGenerationError = videoFallback.error;
        videoGeneration = videoFallback.data;
      } else {
        videoGenerationError = videoInsertAttempt.error;
        videoGeneration = videoInsertAttempt.data;
      }

      if (videoGenerationError || !videoGeneration) {
        console.error(
          "Video generation create error:",
          JSON.stringify(videoGenerationError, null, 2)
        );

        await refundCredits(user.id, videoJobConfig.creditsUsed);

        return NextResponse.json(
          { error: "Failed to create video job. Credits refunded." },
          { status: 500 }
        );
      }

      const { error: videoTxError } = await supabaseAdmin
        .from("credit_transactions")
        .insert({
          user_id: user.id,
          amount: -videoJobConfig.creditsUsed,
          type: "usage",
          source: videoJobConfig.transactionSource,
        });

      if (videoTxError) {
        console.error("Credit transaction log error:", videoTxError);
      }

      const videoOrigin =
        req.headers.get("origin") ??
        process.env.NEXT_PUBLIC_APP_URL ??
        new URL(req.url).origin;

      try {
        await triggerWorker(videoGeneration.id, videoOrigin);
      } catch (error) {
        console.error("Worker trigger exception:", error);
      }

      return NextResponse.json({
        success: true,
        queued: true,
        generationId: videoGeneration.id,
        creditsUsed: videoJobConfig.creditsUsed,
        characterId: null,
        imageMode,
        workflow: videoJobConfig.workflow,
        provider: videoJobConfig.provider,
        model: videoJobConfig.model,
        sourceImageUrl,
        outputFormat,
      });
    }

    const jobConfigResult = resolveGenerationJobConfig(imageMode);

    if (!jobConfigResult.ok) {
      return NextResponse.json({ error: jobConfigResult.error }, { status: 400 });
    }

    const jobConfig = jobConfigResult.config;

    if (imageMode === "reference_edit") {
      if (!sourceImageUrl) {
        return NextResponse.json(
          { error: "Source image is required for Reference Edit." },
          { status: 400 }
        );
      }

      if (!editInstruction) {
        return NextResponse.json(
          { error: "Edit instructions are required for Reference Edit." },
          { status: 400 }
        );
      }
    }

    if (imageMode !== "reference_edit" && (!prompt || typeof prompt !== "string")) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const effectivePrompt =
      imageMode === "reference_edit"
        ? editInstruction
        : typeof prompt === "string"
          ? prompt
          : "";

    let finalPrompt =
      imageMode === "reference_edit"
        ? buildReferenceEditFinalPrompt(editInstruction)
        : imageMode === "brand_assets"
          ? buildBrandAssetsFinalPrompt({
              prompt: effectivePrompt,
              outputFormat,
            })
          : imageMode === "ugc_look"
            ? buildUGCLookFinalPrompt({
                prompt: effectivePrompt,
                outputFormat,
              })
          : buildStandardFinalPrompt({
              prompt: effectivePrompt,
              outputFormat,
            });

    let usedCharacterId: string | null = null;
    let referenceImageUrl: string | null =
      imageMode === "reference_edit" ? sourceImageUrl : null;

    if (imageMode !== "reference_edit" && characterId && typeof characterId === "string") {
      const { data: character, error: characterError } = await supabaseAdmin
        .from("ai_characters")
        .select(
          `
          id,
          name,
          description,
          appearance_prompt,
          style_prompt,
          reference_image_url
        `
        )
        .eq("id", characterId)
        .eq("user_id", user.id)
        .single();

      if (characterError || !character) {
        return NextResponse.json(
          { error: "Character not found" },
          { status: 404 }
        );
      }

      usedCharacterId = character.id;
      referenceImageUrl = character.reference_image_url ?? null;

      finalPrompt =
        imageMode === "brand_assets"
          ? buildBrandAssetsCharacterStylePrompt({
              character,
              prompt: effectivePrompt,
              outputFormat,
            })
          : imageMode === "ugc_look"
            ? buildUGCLookCharacterStylePrompt({
                character,
                prompt: effectivePrompt,
                outputFormat,
              })
          : buildCharacterStylePrompt({
              character,
              prompt: effectivePrompt,
              outputFormat,
            });
    }

    const { count: activeGenerationCount, error: activeCountError } =
      await supabaseAdmin
        .from("generations")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "processing");

    if (activeCountError) {
      console.error("Active generation count error:", activeCountError);

      return NextResponse.json(
        { error: "Could not verify active generations" },
        { status: 500 }
      );
    }

    if ((activeGenerationCount ?? 0) >= ACTIVE_GENERATION_LIMIT) {
      return NextResponse.json(
        {
          error: "Too many active generations",
          reason: "active_generation_limit",
          limit: ACTIVE_GENERATION_LIMIT,
        },
        { status: 429 }
      );
    }

    const { data: creditSuccess, error: creditError } =
      await supabaseAdmin.rpc("consume_user_credits", {
        target_user_id: user.id,
        credits_to_consume: jobConfig.creditsUsed,
      });

    if (creditError) {
      console.error("Credit consume error:", creditError);

      return NextResponse.json(
        { error: "Credit check failed" },
        { status: 500 }
      );
    }

    if (!creditSuccess) {
      return NextResponse.json(
        {
          error: "Not enough credits",
          requiredCredits: jobConfig.creditsUsed,
          reason: "insufficient_credits",
        },
        { status: 402 }
      );
    }

    const generationInsertBase = {
      user_id: user.id,
      prompt: effectivePrompt,
      final_prompt: finalPrompt,
      image_url: null,
      status: "processing",
      provider: jobConfig.provider,
      model: jobConfig.model,
      workflow: jobConfig.workflow,
      reference_image_url: referenceImageUrl,
      social_platform: outputFormat.platform,
      output_format: outputFormat.label,
      image_size: outputFormat.imageSize,
      output_width: outputFormat.width,
      output_height: outputFormat.height,
      credits_used: jobConfig.creditsUsed,
      character_id: usedCharacterId,
      error_message: null,
      started_at: new Date().toISOString(),
    };

    const generationInsertExtended =
      imageMode === "reference_edit"
        ? {
            ...generationInsertBase,
            source_image_url: sourceImageUrl,
            edit_instruction: editInstruction,
          }
        : generationInsertBase;

    let generationCreateError: { message?: string; code?: string } | null =
      null;
    let generation: { id: string } | null = null;

    const extendedInsert = await supabaseAdmin
      .from("generations")
      .insert(generationInsertExtended)
      .select("id")
      .single();

    if (extendedInsert.error && isMissingColumnError(extendedInsert.error)) {
      const fallbackInsert = await supabaseAdmin
        .from("generations")
        .insert(generationInsertBase)
        .select("id")
        .single();

      generationCreateError = fallbackInsert.error;
      generation = fallbackInsert.data;
    } else {
      generationCreateError = extendedInsert.error;
      generation = extendedInsert.data;
    }

    if (generationCreateError || !generation) {
      console.error(
        "Generation create error:",
        JSON.stringify(generationCreateError, null, 2)
      );

      await refundCredits(user.id, jobConfig.creditsUsed);

      return NextResponse.json(
        { error: "Failed to create generation job. Credits refunded." },
        { status: 500 }
      );
    }

    const { error: transactionError } = await supabaseAdmin
      .from("credit_transactions")
      .insert({
        user_id: user.id,
        amount: -jobConfig.creditsUsed,
        type: "usage",
        source: jobConfig.transactionSource,
      });

    if (transactionError) {
      console.error("Credit transaction log error:", transactionError);
    }

    const origin =
      req.headers.get("origin") ??
      process.env.NEXT_PUBLIC_APP_URL ??
      new URL(req.url).origin;

    try {
      await triggerWorker(generation.id, origin);
    } catch (error) {
      console.error("Worker trigger exception:", error);
    }

    return NextResponse.json({
      success: true,
      queued: true,
      generationId: generation.id,
      creditsUsed: jobConfig.creditsUsed,
      characterId: usedCharacterId,
      imageMode,
      workflow: jobConfig.workflow,
      provider: jobConfig.provider,
      model: jobConfig.model,
      referenceImageUrl,
      sourceImageUrl: imageMode === "reference_edit" ? sourceImageUrl : undefined,
      outputFormat,
    });
  } catch (error) {
    console.error(
      "Generate route error:",
      error instanceof Error ? error.message : JSON.stringify(error, null, 2)
    );

    return NextResponse.json(
      { error: "Failed to create generation job." },
      { status: 500 }
    );
  }
}
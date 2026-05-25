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
  | "brand_assets";

/** Brand Assets — FLUX Dev via fal.ai (stable; Recraft endpoint returned 422) */
const FAL_BRAND_ASSETS_MODEL = "fal-ai/flux/dev";

const PLANNED_IMAGE_MODES = new Set([
  "video",
  "lip_sync",
  "video_studio",
  "lip_sync_studio",
]);

function getCreditCostForImageMode(imageMode: ImageMode): number {
  switch (imageMode) {
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

function parseImageMode(value: unknown): ImageMode {
  if (value === "fast_draft") return "fast_draft";
  if (value === "premium_image") return "premium_image";
  if (value === "reference_edit") return "reference_edit";
  if (value === "brand_assets") return "brand_assets";
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

function resolveGenerationJobConfig(imageMode: ImageMode):
  | { ok: true; config: GenerationJobConfig }
  | { ok: false; error: string } {
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
  const { requestsText, requestsLogo } =
    userRequestsBrandedTextOrLogo(userPrompt);

  const sections = [
    `Brand Assets — mandatory (always apply):
- Create a premium brand-ready advertising visual.
- If no real brand assets or brand name are provided, use unbranded packaging.
- Product labels should be blank or minimal.
- No readable text.
- No fake logo.
- No fake brand name.
- No random typography.
- Leave clean negative space for future real branding, headline or campaign copy.
- Clean commercial composition.
- Product must be sharp, polished and usable as an ad creative.
- High-end lighting, premium material detail, realistic reflections.
- No watermark.`,
    `Product and ad layout direction:
- prioritize packaging cleanliness, blank or minimal labels, and clear product hero focus
- strong product clarity with commercial ad layout and readable visual hierarchy without typography
- avoid cluttered label mockups, gibberish packaging text, invented brand marks, or pseudo-brand packaging
- surfaces should look ready for real branding in post-production`,
  ];

  if (requestsText || requestsLogo) {
    sections.push(
      `User mentioned text or logo — apply conservatively:
- avoid fake unreadable typography and invented brand names
- keep text areas clean unless exact wording was provided in the user brief
- do not generate random logos, pseudo-brand marks, or illegible label text
- prefer unbranded or blank label zones when exact copy or logo assets are not provided${
        requestsText
          ? "\n- only render text if exact words were given; otherwise leave headline and copy zones empty"
          : ""
      }${
        requestsLogo
          ? "\n- only render a logo if a real logo asset was provided; otherwise use unbranded packaging"
          : ""
      }`
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

    const imageMode = parseImageMode(body.imageMode);
    const outputFormat = getOutputFormat(body.outputFormat);
    const sourceImageUrl =
      typeof body.sourceImageUrl === "string"
        ? body.sourceImageUrl.trim()
        : "";
    const editInstruction =
      typeof body.editInstruction === "string"
        ? body.editInstruction.trim()
        : "";

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
          : buildCharacterStylePrompt({
              character,
              prompt: effectivePrompt,
              outputFormat,
            });
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
        { error: "Not enough credits" },
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
/**
 * Smart Prompt Engine — InfluExAi
 * Analysiert User-Prompts und reichert sie intelligent an.
 * Läuft SERVER-SIDE vor der Generation.
 */

export type UserIntent = "creator" | "brand" | "agency" | "personal" | "unknown";
export type PromptQuality = "excellent" | "good" | "basic" | "minimal";
export type ContentCategory =
  | "fitness"
  | "beauty"
  | "fashion"
  | "food"
  | "product"
  | "automotive"
  | "travel"
  | "lifestyle"
  | "crypto"
  | "tech"
  | "ugc"
  | "professional"
  | "general";

export type PromptAnalysis = {
  originalPrompt: string;
  cleanedPrompt: string;
  detectedLanguage: "de" | "en" | "mixed";
  userIntent: UserIntent;
  contentCategory: ContentCategory;
  quality: PromptQuality;
  wordCount: number;
  hasStyleDirection: boolean;
  hasPlatformHint: boolean;
  hasProductMention: boolean;
  hasBrandMention: boolean;
  suggestions: string[];
  autoEnhanced: boolean;
};

export type EnhancedPromptResult = {
  analysis: PromptAnalysis;
  enhancedPrompt: string;
  autoSelectedMode: string | null;
  confidenceScore: number; // 0-100
};

// ─── LANGUAGE DETECTION ───────────────────────────────────────────────────────

const GERMAN_INDICATORS =
  /\b(erstelle|mache|zeige|fitness|schön|kampagne|bild|marke|produkt|mädchen|frau|mann|person|hintergrund|stil|farbe|qualität)\b/i;
const ENGLISH_INDICATORS =
  /\b(create|make|show|fitness|beautiful|campaign|image|brand|product|girl|woman|man|person|background|style|color|quality)\b/i;

function detectLanguage(text: string): "de" | "en" | "mixed" {
  const hasGerman = GERMAN_INDICATORS.test(text);
  const hasEnglish = ENGLISH_INDICATORS.test(text);
  if (hasGerman && hasEnglish) return "mixed";
  if (hasGerman) return "de";
  return "en";
}

// ─── QUALITY ASSESSMENT ───────────────────────────────────────────────────────

function assessPromptQuality(text: string): PromptQuality {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const hasStyleWords =
    /\b(cinematic|editorial|luxury|premium|ugc|aesthetic|moody|vibrant|clean|dark|bright|minimal|bold)\b/i.test(
      text
    );
  const hasPlatformWords =
    /\b(instagram|tiktok|youtube|reels?|story|thumbnail|feed|post|ad)\b/i.test(text);
  const hasSubjectDetail =
    /\b(wearing|holding|standing|sitting|looking|smiling|posing|running|working)\b/i.test(
      text
    );

  if (wordCount >= 15 && hasStyleWords && hasPlatformWords) return "excellent";
  if (wordCount >= 8 && (hasStyleWords || hasPlatformWords || hasSubjectDetail))
    return "good";
  if (wordCount >= 4) return "basic";
  return "minimal";
}

// ─── INTENT DETECTION ─────────────────────────────────────────────────────────

function detectUserIntent(text: string): UserIntent {
  const lower = text.toLowerCase();

  if (
    /\b(brand|marke|produkt|product|company|firma|business|corporate|agency|agentur|client|kunde)\b/.test(
      lower
    )
  )
    return "brand";
  if (
    /\b(ugc|content creator|influencer|channel|followers|subscriber|audience)\b/.test(
      lower
    )
  )
    return "creator";
  if (/\b(portfolio|client|project|campaign plan|brief)\b/.test(lower))
    return "agency";
  if (/\b(me|ich|myself|selfie|personal|privat|persönlich)\b/.test(lower))
    return "personal";
  return "unknown";
}

// ─── CATEGORY DETECTION ───────────────────────────────────────────────────────

function detectCategory(text: string): ContentCategory {
  const lower = text.toLowerCase();

  if (/\b(fitness|gym|workout|sport|training|athlet|yoga|muscle|abs|protein)\b/.test(lower))
    return "fitness";
  if (/\b(beauty|skincare|makeup|cosmetic|serum|moisturizer|lipstick|foundation)\b/.test(lower))
    return "beauty";
  if (/\b(fashion|outfit|clothing|dress|style|wardrobe|model|designer|vogue)\b/.test(lower))
    return "fashion";
  if (/\b(food|restaurant|dish|cuisine|meal|eat|drink|coffee|cook)\b/.test(lower))
    return "food";
  if (/\b(car|auto|vehicle|suv|supercar|driving|automotive|motorsport)\b/.test(lower))
    return "automotive";
  if (/\b(travel|destination|holiday|vacation|beach|mountain|city|explore)\b/.test(lower))
    return "travel";
  if (/\b(crypto|bitcoin|blockchain|nft|defi|trading|chart|finance)\b/.test(lower))
    return "crypto";
  if (/\b(tech|app|software|startup|saas|code|developer|digital)\b/.test(lower))
    return "tech";
  if (/\b(product|packaging|bottle|box|jar|supplement|item)\b/.test(lower))
    return "product";
  if (/\b(ugc|authentic|real|raw|phone|handheld|organic)\b/.test(lower)) return "ugc";
  if (/\b(professional|corporate|business|office|headshot|linkedin)\b/.test(lower))
    return "professional";
  return "general";
}

// ─── AUTO MODE SELECTION ──────────────────────────────────────────────────────

function autoSelectMode(analysis: PromptAnalysis): string | null {
  const { userIntent, contentCategory } = analysis;

  // UGC Intent → UGC Look
  if (contentCategory === "ugc") return "ugc_look";
  if (userIntent === "creator" && !analysis.hasStyleDirection) return "ugc_look";

  // Brand/Product → Brand Assets
  if (contentCategory === "product" && userIntent === "brand") return "brand_assets";

  // High quality indicators → Premium
  if (
    /\b(premium|luxury|editorial|magazine|high-end|professional)\b/i.test(
      analysis.originalPrompt
    )
  )
    return "premium_image";

  // UGC keywords
  if (
    /\b(ugc|authentic|real person|real creator|organic|candid)\b/i.test(
      analysis.originalPrompt
    )
  )
    return "ugc_look";

  return null; // Standard bleibt
}

// ─── PROMPT ENHANCEMENT ───────────────────────────────────────────────────────

function buildEnhancedPrompt(analysis: PromptAnalysis): string {
  const { cleanedPrompt, contentCategory, quality } = analysis;

  if (quality === "excellent") return cleanedPrompt;

  const enhancements: string[] = [cleanedPrompt];

  // Category-specific quality boosts
  const categoryBoosts: Record<ContentCategory, string> = {
    fitness:
      "premium fitness campaign aesthetic, athletic energy, professional gym lighting",
    beauty:
      "luxury beauty campaign, soft commercial lighting, clean product focus",
    fashion:
      "editorial fashion photography, magazine-quality composition, confident styling",
    food: "commercial food photography, appetizing detail, premium restaurant aesthetic",
    automotive:
      "cinematic automotive campaign, dynamic perspective, premium car photography",
    travel:
      "cinematic travel photography, golden hour lighting, immersive destination mood",
    crypto: "bold financial campaign aesthetic, high contrast, screen-glow lighting",
    tech: "clean tech product aesthetic, minimal background, precise detail",
    product: "premium product photography, clean commercial lighting, sharp detail",
    ugc: "authentic creator content style, natural lighting, organic social media aesthetic",
    professional:
      "professional corporate photography, clean background, confident presence",
    lifestyle: "premium lifestyle campaign, natural light, aspirational mood",
    general:
      "professional campaign visual, clean composition, high-end social media aesthetic",
  };

  const boost = categoryBoosts[contentCategory];
  if (boost && quality !== "good") enhancements.push(boost);

  // Platform optimization if missing
  if (!analysis.hasPlatformHint) {
    enhancements.push("social media campaign ready, scroll-stopping composition");
  }

  // Quality baseline
  if (quality === "minimal" || quality === "basic") {
    enhancements.push(
      "ultra realistic, sharp focus, premium commercial photography, no text, no logo"
    );
  }

  return enhancements.join(", ");
}

// ─── GENERATE SUGGESTIONS ─────────────────────────────────────────────────────

function generateSuggestions(analysis: PromptAnalysis): string[] {
  const suggestions: string[] = [];

  if (analysis.quality === "minimal") {
    suggestions.push("Füge mehr Details hinzu für bessere Ergebnisse");
    suggestions.push("Beschreibe den Stil: cinematic, editorial, UGC, luxury");
  }
  if (!analysis.hasPlatformHint) {
    suggestions.push("Nenne deine Zielplattform: Instagram, TikTok, YouTube");
  }
  if (!analysis.hasStyleDirection) {
    suggestions.push("Beschreibe die Stimmung: premium, authentisch, energetisch, clean");
  }
  if (analysis.wordCount < 5) {
    suggestions.push(
      "Kürzere Prompts → weniger präzise Ergebnisse. Mehr Details = bessere Bilder"
    );
  }

  return suggestions.slice(0, 3);
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

export function analyzeAndEnhancePrompt(rawPrompt: string): EnhancedPromptResult {
  const cleaned = rawPrompt
    .trim()
    .replace(
      /^(erstelle|create|generate|mache|zeige|bitte|please)\s+(mir\s+)?(ein(en|em)?\s+|a\s+|an\s+)?/i,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();

  const words = cleaned.split(/\s+/).filter(Boolean);

  const analysis: PromptAnalysis = {
    originalPrompt: rawPrompt,
    cleanedPrompt: cleaned,
    detectedLanguage: detectLanguage(rawPrompt),
    userIntent: detectUserIntent(rawPrompt),
    contentCategory: detectCategory(rawPrompt),
    quality: assessPromptQuality(rawPrompt),
    wordCount: words.length,
    hasStyleDirection:
      /\b(cinematic|editorial|luxury|premium|ugc|aesthetic|moody|vibrant|clean|dark|minimal|bold|authentic|organic)\b/i.test(
        rawPrompt
      ),
    hasPlatformHint:
      /\b(instagram|tiktok|youtube|reels?|story|thumbnail|feed|post|ad|twitter|linkedin)\b/i.test(
        rawPrompt
      ),
    hasProductMention:
      /\b(product|produkt|item|bottle|box|packaging|jar|supplement)\b/i.test(rawPrompt),
    hasBrandMention: /\b(brand|marke|logo|company|firma)\b/i.test(rawPrompt),
    suggestions: [],
    autoEnhanced: false,
  };

  analysis.suggestions = generateSuggestions(analysis);

  const enhancedPrompt = buildEnhancedPrompt(analysis);
  analysis.autoEnhanced = enhancedPrompt !== cleaned;

  const autoSelectedMode = autoSelectMode(analysis);

  // Confidence Score
  const qualityScore = { excellent: 100, good: 75, basic: 45, minimal: 20 }[
    analysis.quality
  ];
  const bonuses = [
    analysis.hasPlatformHint ? 10 : 0,
    analysis.hasStyleDirection ? 10 : 0,
    analysis.wordCount > 10 ? 10 : 0,
  ].reduce((a, b) => a + b, 0);
  const confidenceScore = Math.min(100, qualityScore + bonuses);

  return {
    analysis,
    enhancedPrompt,
    autoSelectedMode,
    confidenceScore,
  };
}

// ─── VIRAL SCORE ──────────────────────────────────────────────────────────────

export type ViralScore = {
  score: number; // 0-10
  label: string;
  tips: string[];
};

export function calculateViralScore(
  prompt: string,
  imageMode: string,
  platform: string
): ViralScore {
  let score = 5;
  const tips: string[] = [];

  if (/\b(bold|striking|contrast|pop|scroll-stop|eye-catching|vibrant)\b/i.test(prompt))
    score += 1;
  else tips.push("Füge visuelle Kontraste hinzu für mehr Scroll-Stop-Power");

  if (/\b(face|person|creator|model|human|expression|emotion)\b/i.test(prompt)) score += 1;
  else tips.push("Gesichter und Emotionen steigern Engagement um bis zu 38%");

  if (platform === "tiktok" || platform === "instagram_story") {
    if (/\b(vertical|9:16|portrait|mobile)\b/i.test(prompt)) score += 1;
    else tips.push("Vertikales Format (9:16) für TikTok/Reels optimiert");
  }

  if (imageMode === "ugc_look") score += 1;

  if (/\b(text|logo|watermark)\b/i.test(prompt)) {
    score -= 1;
    tips.push("Kein Text im Bild → sauberer für Overlays");
  }

  score = Math.max(1, Math.min(10, score));

  const labels: Record<number, string> = {
    10: "Viral-ready 🔥",
    9: "Sehr stark",
    8: "Stark",
    7: "Gut",
    6: "Solide",
    5: "Durchschnitt",
    4: "Verbesserbar",
    3: "Schwach",
    2: "Überarbeiten",
    1: "Neu versuchen",
  };

  return { score, label: labels[score] ?? "Solide", tips: tips.slice(0, 2) };
}

/** Maps engine mode hints to registered model mode ids. */
export function resolveAutoModelModeId(
  autoMode: string,
  availableModeIds: readonly string[]
): string | null {
  if (availableModeIds.includes(autoMode)) return autoMode;

  const aliases: Record<string, string> = {
    ugc_look: "fast_draft_image",
    brand_assets: "premium_image",
  };

  const mapped = aliases[autoMode] ?? autoMode;
  return availableModeIds.includes(mapped) ? mapped : null;
}

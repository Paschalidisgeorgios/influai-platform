/**
 * Creative Score — evaluates creator/social content quality.
 * No virality guarantees; scores are advisory only.
 */

import type { CreativeScoreDimensionId } from "@/lib/copy/creative-score-copy";
import {
  clampCreativeScore,
  estimatePotentialScoreAfterFix,
  findWeakestDimension,
  getRecommendedFixForDimension,
  normalizeCreativeScoreDimensionId,
} from "@/app/lib/creative-score/score-improve-helpers";

export type CreativeScoreRating = "low" | "medium" | "high";

export type CreativeScoreDimension = {
  id: CreativeScoreDimensionId;
  score: number;
};

export type CreativeScoreResult = {
  score: number;
  rating: CreativeScoreRating;
  dimensions: CreativeScoreDimension[];
  positives: string[];
  improvements: string[];
  hooks: string[];
  captions: string[];
  hashtags: string[];
  improvedPrompt?: string;
  weakestDimensionId: CreativeScoreDimensionId;
  recommendedFix: string;
  estimatedPotentialScore: number;
};

export type CreativeScoreInput = {
  assetUrl: string;
  prompt: string;
  outputType: "image" | "video";
  actionId?: string;
  language?: "en" | "de";
};

function clampScore(value: number): number {
  return clampCreativeScore(value);
}

function ratingFromScore(score: number): CreativeScoreRating {
  if (score >= 80) return "high";
  if (score >= 60) return "medium";
  return "low";
}

function stripJsonFence(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/i);
  if (fenced?.[1]) return fenced[1].trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);
  return trimmed;
}

function normalizeStringList(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    .map((item) => item.trim())
    .slice(0, max);
}

function normalizeDimensions(value: unknown): CreativeScoreDimension[] {
  const allowed: CreativeScoreDimensionId[] = [
    "hook_clarity",
    "subject_focus",
    "mobile_readability",
    "format_fit",
    "scroll_stop_potential",
    "brand_consistency",
  ];

  if (!Array.isArray(value)) return [];

  const byId = new Map<CreativeScoreDimensionId, number>();

  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const rawId = typeof row.id === "string" ? row.id : "";
    const id = normalizeCreativeScoreDimensionId(rawId);
    if (!id || !allowed.includes(id)) continue;

    const dimScore =
      typeof row.score === "number"
        ? clampScore(row.score)
        : typeof row.score === "string"
          ? clampScore(Number.parseFloat(row.score))
          : NaN;
    if (Number.isNaN(dimScore)) continue;

    const existing = byId.get(id);
    if (existing === undefined || dimScore < existing) {
      byId.set(id, dimScore);
    }
  }

  return allowed
    .filter((id) => byId.has(id))
    .map((id) => ({ id, score: byId.get(id)! }));
}

export function validateCreativeScorePayload(raw: unknown): CreativeScoreResult | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;

  const score =
    typeof obj.score === "number"
      ? clampScore(obj.score)
      : typeof obj.score === "string"
        ? clampScore(Number.parseFloat(obj.score))
        : NaN;

  if (Number.isNaN(score)) return null;

  const positives = normalizeStringList(obj.positives, 5);
  const improvements = normalizeStringList(obj.improvements, 5);
  const hooks = normalizeStringList(obj.hooks, 3);
  const captions = normalizeStringList(obj.captions, 3);
  const hashtags = normalizeStringList(obj.hashtags, 8).map((tag) =>
    tag.startsWith("#") ? tag : `#${tag.replace(/^#+/, "")}`
  );

  if (positives.length === 0 && improvements.length === 0) return null;

  const improvedPrompt =
    typeof obj.improvedPrompt === "string" ? obj.improvedPrompt.trim() : undefined;

  const dimensions = normalizeDimensions(obj.dimensions);

  return {
    score,
    rating: ratingFromScore(score),
    dimensions,
    positives,
    improvements,
    hooks,
    captions,
    hashtags,
    improvedPrompt: improvedPrompt || undefined,
    weakestDimensionId: "mobile_readability",
    recommendedFix: "",
    estimatedPotentialScore: score,
  };
}

function dimensionScore(base: number, bonus: number, penalty: number): number {
  return clampScore(base + bonus - penalty);
}

function buildRuleBasedDimensions(
  input: CreativeScoreInput
): CreativeScoreDimension[] {
  const prompt = input.prompt.trim().toLowerCase();
  const isVideo = input.outputType === "video";
  const wordCount = prompt.split(/\s+/).filter(Boolean).length;

  const hookClarity = dimensionScore(
    58,
    /hook|opening|stop scroll|scroll.?stop|motion|camera|movement/.test(prompt)
      ? 18
      : 0,
    wordCount < 5 ? 12 : 0
  );

  const subjectFocus = dimensionScore(
    56,
    /product|hero|subject|portrait|centered|focus|close.?up/.test(prompt) ? 20 : 0,
    /busy|crowded|clutter/.test(prompt) ? 14 : 0
  );

  const mobileReadability = dimensionScore(
    57,
    /clean|minimal|simple|single|clear|legible|mobile/.test(prompt) ? 18 : 0,
    /detailed|complex|busy/.test(prompt) ? 10 : 0
  );

  const formatFit = dimensionScore(
    54,
    /9:16|4:5|1:1|vertical|square|reel|story|feed|tiktok|instagram/.test(prompt)
      ? 24
      : 0,
    0
  );

  const scrollStopPotential = dimensionScore(
    isVideo ? 52 : 58,
    /thumbnail|cover|bold|close.?up|face|product shot|contrast|hook/.test(prompt)
      ? 20
      : 0,
    isVideo && !/opening|first frame|hook|motion/.test(prompt) ? 8 : 0
  );

  const brandConsistency = dimensionScore(
    55,
    /brand|studio|lighting|light|palette|consistent|commercial|ad|product/.test(
      prompt
    )
      ? 20
      : 0,
    /flat|muted|low contrast|mismatch/.test(prompt) ? 10 : 0
  );

  return [
    { id: "hook_clarity", score: hookClarity },
    { id: "subject_focus", score: subjectFocus },
    { id: "mobile_readability", score: mobileReadability },
    { id: "format_fit", score: formatFit },
    { id: "scroll_stop_potential", score: scrollStopPotential },
    { id: "brand_consistency", score: brandConsistency },
  ];
}

function attachImprovementMetadata(
  result: Omit<
    CreativeScoreResult,
    "weakestDimensionId" | "recommendedFix" | "estimatedPotentialScore"
  >,
  language: "en" | "de"
): CreativeScoreResult {
  const dimensions =
    result.dimensions.length > 0 ? result.dimensions : buildRuleBasedDimensions({
      assetUrl: "",
      prompt: result.improvedPrompt ?? "",
      outputType: "image",
      language,
    });

  const weakest = findWeakestDimension(dimensions);
  const weakestDimensionId =
    weakest?.id ?? dimensions[0]?.id ?? "mobile_readability";

  return {
    ...result,
    dimensions,
    score:
      dimensions.length > 0
        ? averageDimensionScore(dimensions)
        : result.score,
    weakestDimensionId,
    recommendedFix: getRecommendedFixForDimension(weakestDimensionId, language),
    estimatedPotentialScore: estimatePotentialScoreAfterFix(
      result.score,
      weakest?.score ?? result.score
    ),
  };
}

function averageDimensionScore(dimensions: CreativeScoreDimension[]): number {
  if (!dimensions.length) return 62;
  const sum = dimensions.reduce((acc, d) => acc + d.score, 0);
  return clampScore(Math.round(sum / dimensions.length));
}

export function buildRuleBasedCreativeScore(
  input: CreativeScoreInput
): CreativeScoreResult {
  const isDe = input.language === "de";
  const prompt = input.prompt.trim();
  const isVideo = input.outputType === "video";
  const dimensions = buildRuleBasedDimensions(input);
  const score = averageDimensionScore(dimensions);
  const positives: string[] = [];
  const improvements: string[] = [];

  const dim = (id: CreativeScoreDimensionId) =>
    dimensions.find((d) => d.id === id)?.score ?? 0;

  if (dim("hook_clarity") >= 70) {
    positives.push(
      isDe ? "Hook-Idee ist im Prompt erkennbar" : "Hook idea is clear in the prompt"
    );
  } else {
    improvements.push(
      isDe
        ? "Opening-Hook oder Scroll-Stop-Moment schärfer formulieren"
        : "Sharpen the opening hook or scroll-stop moment"
    );
  }

  if (dim("brand_consistency") >= 70) {
    positives.push(
      isDe ? "Markenkonsistente Beleuchtung ist adressiert" : "Brand-consistent lighting is addressed"
    );
  } else if (dim("brand_consistency") < 65) {
    improvements.push(
      isDe ? "Markenkonsistente Beleuchtung und Farben definieren" : "Define brand-consistent lighting and colors"
    );
  }

  if (dim("subject_focus") >= 70) {
    positives.push(
      isDe ? "Motivfokus wirkt klar genug für Social" : "Subject focus reads clearly enough for social"
    );
  } else {
    improvements.push(
      isDe ? "Ein klares Hauptmotiv statt vieler Elemente" : "One clear hero subject instead of many elements"
    );
  }

  if (dim("format_fit") >= 70) {
    positives.push(
      isDe ? "Format passt zu Feed, Reel oder Story" : "Format fits feed, reel or story placement"
    );
  } else {
    improvements.push(
      isDe
        ? "Ziel-Format (9:16, 4:5, 1:1) explizit benennen"
        : "Name the target format (9:16, 4:5, 1:1) explicitly"
    );
  }

  if (dim("mobile_readability") < 65) {
    improvements.push(
      isDe
        ? "Einfacherer Hintergrund für kleine Screens"
        : "Simplify background for small screens"
    );
  }

  if (dim("brand_consistency") >= 68) {
    positives.push(
      isDe ? "Gute Basis für markenkonsistenten Content" : "Solid base for brand-consistent content"
    );
  }

  if (dim("scroll_stop_potential") < 65) {
    improvements.push(
      isDe
        ? "Scroll-Stop: engerer Crop, klarer Fokus, weniger Ablenkung"
        : "Scroll-stop strength: tighter crop, clearer focus, less distraction"
    );
  }

  if (isVideo && dim("hook_clarity") < 68) {
    improvements.push(
      isDe ? "Stärkere Bewegung oder Kameraführung im Opening" : "Stronger motion or camera move in the opening"
    );
  }

  const topic = prompt.slice(0, 72) || (isDe ? "dein Creator-Asset" : "your creator asset");

  const hooks = isDe
    ? [
        `Stopp — ${topic} in 3 Sekunden erklärt.`,
        `So wirkt ${topic} im Feed, ohne laut zu sein.`,
        `Würdest du hier scrollen? Genau deshalb zählt der Hook.`,
      ]
    : [
        `Stop — ${topic} explained in 3 seconds.`,
        `How ${topic} reads in-feed without shouting.`,
        `Would you scroll here? That's why the hook matters.`,
      ];

  const captions = isDe
    ? [
        `${topic} — klar, social-ready, ohne Hype.`,
        `Neuer Look für ${topic}. Mehr Fokus, ruhiger Hintergrund, stärkerer Hook.`,
      ]
    : [
        `${topic} — clear, social-ready, no hype.`,
        `Fresh take on ${topic}. More focus, calmer background, stronger hook.`,
      ];

  const hashtags = [
    "#CreatorContent",
    "#SocialMedia",
    "#ContentStudio",
    isVideo ? "#Reels" : "#ProductPhoto",
    "#ScrollStop",
  ];

  const improvedPrompt = [
    prompt.trim(),
    isDe
      ? "Stärkerer Hook, mehr Kontrast, klares Hauptmotiv, mobile-tauglicher Crop, ad-ready Beleuchtung."
      : "Stronger hook, more contrast, clear hero subject, mobile-friendly crop, ad-ready lighting.",
  ]
    .filter(Boolean)
    .join(". ");

  return attachImprovementMetadata(
    {
      score,
      rating: ratingFromScore(score),
      dimensions,
      positives: positives.slice(0, 4),
      improvements: improvements.slice(0, 5),
      hooks,
      captions,
      hashtags,
      improvedPrompt,
    },
    isDe ? "de" : "en"
  );
}

const SYSTEM_PROMPT = `You are a senior social content strategist for InfluExAI Creator Studio.

Evaluate creator/social content based on the user's prompt and asset type (image or video).

Return ONLY valid JSON with this shape:
{
  "score": number,
  "dimensions": [
    { "id": "hook_clarity", "score": number },
    { "id": "subject_focus", "score": number },
    { "id": "mobile_readability", "score": number },
    { "id": "format_fit", "score": number },
    { "id": "scroll_stop_potential", "score": number },
    { "id": "brand_consistency", "score": number }
  ],
  "positives": string[],
  "improvements": string[],
  "hooks": string[],
  "captions": string[],
  "hashtags": string[],
  "improvedPrompt": string
}

Rules:
- score is 0-100 advisory Creative Score (average of dimensions, rounded).
- Evaluate: Hook Clarity, Subject Focus, Mobile Readability, Format Fit, Scroll-Stop Potential, Brand Consistency.
- Never claim guaranteed virality. Never use "Viral Chance" or fake viral percentages.
- positives and improvements: short practical notes (max ~14 words each).
- Do not use "+" or "-" prefixes in JSON strings.
- hooks: 3 short social opening lines.
- captions: 2 short post captions.
- hashtags: 5-8 relevant tags with # prefix.
- improvedPrompt: one improved generation prompt for a follow-up image variant.
- No provider or model names.
- No markdown fences.`;

async function callOpenAiCreativeScore(
  input: CreativeScoreInput
): Promise<CreativeScoreResult | null> {
  if (!process.env.OPENAI_API_KEY?.trim()) return null;

  const OpenAI = (await import("openai")).default;
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const isDe = input.language === "de";
  const userText = [
    `Output type: ${input.outputType}`,
    `Prompt: ${input.prompt.trim()}`,
    input.actionId ? `Action: ${input.actionId}` : null,
    `Asset URL (context only): ${input.assetUrl}`,
    isDe ? "Respond with practical German copy in string fields." : null,
  ]
    .filter(Boolean)
    .join("\n");

  const response = await openai.chat.completions.create({
    model: process.env.PROMPT_COPILOT_MODEL?.trim() || "gpt-4o-mini",
    temperature: 0.4,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userText },
    ],
  });

  const content = response.choices?.[0]?.message?.content?.trim();
  if (!content) return null;

  try {
    const parsed = JSON.parse(stripJsonFence(content)) as unknown;
    return validateCreativeScorePayload(parsed);
  } catch {
    return null;
  }
}

export async function generateCreativeScore(
  input: CreativeScoreInput
): Promise<CreativeScoreResult> {
  const language = input.language === "de" ? "de" : "en";
  const fallback = buildRuleBasedCreativeScore(input);

  try {
    const ai = await callOpenAiCreativeScore(input);
    if (ai) {
      const dimensions =
        ai.dimensions.length > 0 ? ai.dimensions : fallback.dimensions;
      return attachImprovementMetadata(
        {
          ...ai,
          dimensions,
          score:
            dimensions.length > 0
              ? averageDimensionScore(dimensions)
              : ai.score,
          improvedPrompt: ai.improvedPrompt || fallback.improvedPrompt,
        },
        language
      );
    }
  } catch {
    /* use fallback */
  }

  return fallback;
}

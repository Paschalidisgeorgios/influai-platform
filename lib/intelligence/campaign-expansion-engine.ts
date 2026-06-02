/**
 * CampaignExpansionEngine — server-side viral content generation after image create.
 * Text copilot only; never used on the client.
 */

import OpenAI from "openai";

export type CampaignExpansionResult = {
  viral_hooks: string[];
  video_script: string;
  hashtags: string[];
};

export type CampaignExpansionLanguage = "de" | "en";

const SYSTEM_PROMPT = `You are the Lead Growth Strategist for InfluExAi. Analyze the user's creative prompt and return a valid JSON object containing:
1. "viral_hooks": an array of 3 high-converting opening hooks for TikTok/Reels.
2. "video_script": a concise 15-second video ad script.
3. "hashtags": 5 relevant social hashtags.

Rules:
- Return strictly raw JSON without markdown code blocks.
- Do not include unsafe, misleading, illegal, hateful or explicit claims.
- Do not invent unverifiable medical, financial or legal claims.
- Keep the tone commercially strong, but not deceptive.
- Make the output useful for brands, creators and agencies.`;

function getCopilotConfig() {
  const provider = (
    process.env.PROMPT_COPILOT_PROVIDER ?? "openai"
  ).trim().toLowerCase();
  const model = (
    process.env.PROMPT_COPILOT_MODEL ?? "gpt-4o-mini"
  ).trim();
  return { provider, model };
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

function normalizeHashtag(tag: string): string {
  const t = tag.trim();
  if (!t) return "";
  return t.startsWith("#") ? t : `#${t.replace(/^#+/, "")}`;
}

export function validateCampaignExpansionPayload(
  raw: unknown
): CampaignExpansionResult | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;

  const viral_hooks = Array.isArray(obj.viral_hooks)
    ? obj.viral_hooks
        .filter((h): h is string => typeof h === "string" && h.trim().length > 0)
        .map((h) => h.trim())
        .slice(0, 3)
    : [];

  const video_script =
    typeof obj.video_script === "string" ? obj.video_script.trim() : "";

  const hashtags = Array.isArray(obj.hashtags)
    ? obj.hashtags
        .filter((h): h is string => typeof h === "string" && h.trim().length > 0)
        .map(normalizeHashtag)
        .filter(Boolean)
        .slice(0, 5)
    : [];

  if (viral_hooks.length === 0 || !video_script || hashtags.length === 0) {
    return null;
  }

  return { viral_hooks, video_script, hashtags };
}

/** Short product label for hooks — strips shoot/format noise, keeps core product. */
export function extractCampaignProductLabel(
  prompt: string,
  maxLen = 48
): string {
  const trimmed = prompt.trim();
  if (!trimmed) return "";

  const cleaned = trimmed
    .replace(/\b(soft|hard|studio|natural|golden|warm|cool)\s+light(ing)?\b/gi, "")
    .replace(/\b(soft|studio)\s+light\b/gi, "")
    .replace(/\bon\s+(marble|white|black|concrete|wooden|gray|grey)\b/gi, "")
    .replace(
      /\b(white|black|marble|concrete|wooden|gray|grey)\s+(background|surface|table|floor)\b/gi,
      ""
    )
    .replace(/\b(white|black)\s+background\b/gi, "")
    .replace(/\bmarble\b/gi, "")
    .replace(
      /\b(instagram|tiktok|youtube|facebook|linkedin)\s+(square|story|post|reel|feed|format)?\b/gi,
      ""
    )
    .replace(/\binstagram\s+square\b/gi, "")
    .replace(
      /\b(square|vertical|horizontal|portrait|landscape)\s*(format|shot|crop)?\b/gi,
      ""
    )
    .replace(/\b(4k|8k|hd|uhd|cinematic|editorial)\b/gi, "")
    .replace(/\bon\s+$/gi, "")
    .replace(/^on\s+/gi, "")
    .replace(/,+\s*,+/g, ",")
    .replace(/\s+/g, " ")
    .replace(/,\s*$/g, "")
    .trim();

  const firstSegment = cleaned.split(/[,.\n;]/)[0]?.trim() ?? cleaned;
  const result =
    firstSegment.length > 0
      ? firstSegment
      : (trimmed.split(/[,.\n;]/)[0]?.trim() ?? trimmed);

  if (result.length <= maxLen) return result;
  const cut = result.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(" ");
  return lastSpace > 16 ? cut.slice(0, lastSpace).trim() : cut.trim();
}

export function buildRuleBasedCampaignExpansion(
  prompt: string,
  language: CampaignExpansionLanguage
): CampaignExpansionResult {
  const product =
    extractCampaignProductLabel(prompt) ||
    (language === "de" ? "dieses Produkt" : "this product");
  const shortDesc =
    extractCampaignProductLabel(prompt, 36) ||
    (language === "de" ? "deine Idee" : "your idea");

  if (language === "de") {
    return {
      viral_hooks: [
        `Wusstest du, dass ${product} sofort Premium im Feed wirkt?`,
        `Stopp scrolling — das musst du sehen: ${shortDesc}.`,
        `3 Sekunden, die alles verändern: ${product}.`,
      ],
      video_script: `[0–3s] Hook: ${shortDesc} — Scroll-Stop in 2 Sekunden.\n[3–8s] Nutzen von ${product} visuell zeigen.\n[8–12s] Social Proof oder Ergebnis andeuten.\n[12–15s] CTA: Jetzt entdecken / Link in Bio.`,
      hashtags: [
        "#ContentCreator",
        "#SocialMediaMarketing",
        "#BrandGrowth",
        "#ReelsTips",
        "#InfluencerMarketing",
      ],
    };
  }

  return {
    viral_hooks: [
      `Did you know ${product} can look premium in feed instantly?`,
      `Stop scrolling — you need to see this: ${shortDesc}.`,
      `3 seconds that change everything: ${product}.`,
    ],
    video_script: `[0–3s] Hook: ${shortDesc} — scroll-stop in 2 seconds.\n[3–8s] Show the benefit of ${product} visually.\n[8–12s] Hint at proof or outcome.\n[12–15s] CTA: Discover now / link in bio.`,
    hashtags: [
      "#ContentCreator",
      "#SocialMediaMarketing",
      "#BrandGrowth",
      "#ReelsTips",
      "#InfluencerMarketing",
    ],
  };
}

async function callOpenAiCopilot(
  prompt: string,
  language: CampaignExpansionLanguage,
  model: string
): Promise<CampaignExpansionResult | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  const openai = new OpenAI({ apiKey });
  const languageHint =
    language === "de"
      ? "Write all output in German."
      : "Write all output in English.";

  const response = await openai.chat.completions.create({
    model,
    temperature: 0.7,
    messages: [
      { role: "system", content: `${SYSTEM_PROMPT}\n${languageHint}` },
      {
        role: "user",
        content: `Creative prompt:\n${prompt}`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) return null;

  try {
    const parsed = JSON.parse(stripJsonFence(content)) as unknown;
    return validateCampaignExpansionPayload(parsed);
  } catch {
    return null;
  }
}

async function callGeminiCopilot(
  prompt: string,
  language: CampaignExpansionLanguage,
  model: string
): Promise<CampaignExpansionResult | null> {
  const apiKey =
    process.env.GEMINI_API_KEY?.trim() ??
    process.env.GOOGLE_API_KEY?.trim();
  if (!apiKey) return null;

  const languageHint =
    language === "de"
      ? "Write all output in German."
      : "Write all output in English.";

  const geminiModel = model.includes("gemini") ? model : "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `${SYSTEM_PROMPT}\n${languageHint}\n\nCreative prompt:\n${prompt}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) return null;

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return null;

  try {
    const parsed = JSON.parse(stripJsonFence(text)) as unknown;
    return validateCampaignExpansionPayload(parsed);
  } catch {
    return null;
  }
}

async function callTextCopilot(
  prompt: string,
  language: CampaignExpansionLanguage
): Promise<CampaignExpansionResult | null> {
  const { provider, model } = getCopilotConfig();

  try {
    if (provider === "gemini") {
      return await callGeminiCopilot(prompt, language, model);
    }
    if (provider === "openai") {
      return await callOpenAiCopilot(prompt, language, model);
    }
  } catch (error) {
    console.warn("[CampaignExpansionEngine] text copilot failed:", error);
  }

  return null;
}

/**
 * Generates campaign expansion content. Never throws — always returns a valid result
 * (AI output or rule-based fallback).
 */
export async function generateCampaignExpansion(params: {
  prompt: string;
  language: CampaignExpansionLanguage;
}): Promise<CampaignExpansionResult> {
  const prompt = params.prompt.trim();
  const language = params.language === "de" ? "de" : "en";

  if (!prompt) {
    return buildRuleBasedCampaignExpansion("", language);
  }

  const aiResult = await callTextCopilot(prompt, language);
  if (aiResult) return aiResult;

  return buildRuleBasedCampaignExpansion(prompt, language);
}

/** Exposed for diagnostics — which copilot config is active. */
export function getCampaignExpansionCopilotInfo() {
  const { provider, model } = getCopilotConfig();
  return { provider, model };
}

import type { CreativeModality, FormatHint, IntentSignals, UserPersonaHint } from "./types";

const VIDEO_TERMS =
  /\b(video|motion|animate|animation|cinematic|dolly|pan|zoom|runway|kling|clip|reel|story)\b/i;
const LIP_SYNC_TERMS =
  /\b(lip[\s-]?sync|talking head|voiceover|speak|dialogue|portrait video|avatar speak)\b/i;
const MOTION_TERMS =
  /\b(motion transfer|driving video|pose|skeletal|avatar mesh|live avatar)\b/i;
const ENHANCE_TERMS =
  /\b(upscale|enhance|22k|inpaint|restore|sharpen|denoise|refine)\b/i;
const THUMBNAIL_TERMS = /\b(thumbnail|youtube|click.?worthy|title space)\b/i;
const VERTICAL_TERMS = /\b(tiktok|reels|shorts|story|9:16|vertical|portrait)\b/i;
const CINEMATIC_TERMS = /\b(anamorphic|21:9|widescreen|cinematic|film grain|hollywood)\b/i;
const BRAND_TERMS = /\b(brand|campaign|product shot|catalog|e-?commerce|sku)\b/i;
const AGENCY_TERMS = /\b(agency|client|deliverable|batch|multi-asset)\b/i;

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function scoreModality(prompt: string, pattern: RegExp): number {
  const matches = prompt.match(new RegExp(pattern.source, "gi"));
  return matches?.length ?? 0;
}

export function analyzePromptIntent(rawPrompt: string): IntentSignals {
  const normalizedPrompt = rawPrompt.trim().replace(/\s+/g, " ");
  const lower = normalizedPrompt.toLowerCase();
  const words = normalizedPrompt.split(/\s+/).filter(Boolean);

  const scores: Record<CreativeModality, number> = {
    lip_sync: scoreModality(lower, LIP_SYNC_TERMS) * 3,
    motion: scoreModality(lower, MOTION_TERMS) * 2.5,
    video: scoreModality(lower, VIDEO_TERMS) * 2,
    enhance: scoreModality(lower, ENHANCE_TERMS) * 2,
    image: words.length > 0 ? 1 : 0,
  };

  if (scores.video > 0 && scores.lip_sync > 0) {
    scores.lip_sync += 1;
  }

  const modalities = (Object.entries(scores) as [CreativeModality, number][])
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([key]) => key);

  const primaryModality = modalities[0] ?? "image";

  let formatHint: FormatHint = "unknown";
  if (THUMBNAIL_TERMS.test(lower)) formatHint = "thumbnail";
  else if (VERTICAL_TERMS.test(lower)) formatHint = "vertical";
  else if (CINEMATIC_TERMS.test(lower)) formatHint = "cinematic";
  else if (/\b(16:9|landscape|banner)\b/i.test(lower)) formatHint = "horizontal";
  else if (/\b(1:1|square|feed)\b/i.test(lower)) formatHint = "square";

  let personaHint: UserPersonaHint = "unknown";
  if (AGENCY_TERMS.test(lower)) personaHint = "agency";
  else if (BRAND_TERMS.test(lower)) personaHint = "brand";
  else if (/\b(creator|influencer|ugc|social)\b/i.test(lower)) personaHint = "creator";

  const keywords = unique(
    lower
      .split(/[^a-z0-9äöüß]+/i)
      .filter((w) => w.length >= 4)
      .slice(0, 12)
  );

  const topScore = scores[primaryModality];
  const secondScore = modalities[1] ? scores[modalities[1]] : 0;
  const confidence =
    words.length === 0
      ? 0.35
      : Math.min(0.98, 0.45 + (topScore - secondScore) * 0.12 + Math.min(words.length, 20) * 0.015);

  return {
    rawPrompt,
    normalizedPrompt,
    wordCount: words.length,
    modalities: modalities.length ? modalities : ["image"],
    primaryModality,
    formatHint,
    personaHint,
    keywords,
    confidence,
  };
}

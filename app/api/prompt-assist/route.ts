import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  getModeCopy,
  getModeOutputType,
  getModePromptHint,
} from "@/app/lib/model-modes/mode-copy";
import { getImagePreset } from "@/app/lib/presets/image-presets";
import { getVideoPreset } from "@/app/lib/presets/video-presets";

export const runtime = "nodejs";

type PromptAssistBody = {
  prompt?: string;
  modelModeId?: string;
  actionId?: string;
  presetId?: string;
};

function isOpenAIUnavailable(error: unknown): boolean {
  if (!error || typeof error !== "object") return true;
  const err = error as { status?: number; code?: string; message?: string };
  const message = (err.message || "").toLowerCase();
  return (
    err.status === 429 ||
    err.status === 402 ||
    err.code === "insufficient_quota" ||
    message.includes("quota") ||
    message.includes("billing") ||
    message.includes("rate limit")
  );
}

function buildSystemPrompt(
  outputType: "image" | "video",
  modelModeId: string
): string {
  const hint = getModePromptHint(modelModeId, "en");
  const copy = getModeCopy(modelModeId, "en");
  const bestFor = copy?.bestFor.en.join(", ") ?? "";

  if (outputType === "video") {
    return `You are a social video creative director for InfluExAI.
Enhance prompts for short creator videos (reels, ads, product motion).
Focus on: camera movement, subject motion, lighting, mood, pacing, and vertical social format.
Mode guidance: ${copy?.summary.en ?? ""}
Best for: ${bestFor}
Prompt hint: ${hint}
Keep the user's core idea. Return ONLY the enhanced prompt — no provider or model names.`;
  }

  return `You are a creator visual director for InfluExAI.
Enhance prompts for social-ready images and product visuals.
Focus on: lighting, composition, subject clarity, mood, and scroll-stopping social aesthetics.
Mode guidance: ${copy?.summary.en ?? ""}
Best for: ${bestFor}
Prompt hint: ${hint}
Keep the user's core idea. Return ONLY the enhanced prompt — no provider or model names.`;
}

function presetContext(presetId: string, outputType: "image" | "video"): string {
  if (outputType === "video") {
    const preset = getVideoPreset(presetId);
    return preset ? `Style preset context: ${preset.fragment.en}` : "";
  }
  const preset = getImagePreset(presetId);
  return preset ? `Style preset context: ${preset.fragment.en}` : "";
}

export async function POST(req: NextRequest) {
  let prompt = "";

  try {
    const body = (await req.json()) as PromptAssistBody;
    prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    const modelModeId =
      typeof body.modelModeId === "string" ? body.modelModeId.trim() : "";
    const presetId =
      typeof body.presetId === "string" ? body.presetId.trim() : "";

    if (!prompt) {
      return NextResponse.json({ error: "Prompt required" }, { status: 400 });
    }

    const outputType =
      body.actionId === "create_video"
        ? "video"
        : body.actionId === "create_image"
          ? "image"
          : getModeOutputType(modelModeId) ??
            (modelModeId.includes("video") ? "video" : "image");

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        enhanced: prompt,
        fallback: true,
        reason: "missing_openai_key",
      });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const presetLine = presetId ? presetContext(presetId, outputType) : "";

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: buildSystemPrompt(outputType, modelModeId || "auto_image"),
        },
        {
          role: "user",
          content: `USER PROMPT:\n${prompt}\n\n${presetLine}\n\nEnhance this ${outputType} generation prompt.`,
        },
      ],
      temperature: 0.85,
    });

    const enhanced =
      response.choices?.[0]?.message?.content?.trim() || prompt;

    return NextResponse.json({
      enhanced,
      fallback: false,
      outputType,
    });
  } catch (error: unknown) {
    if (!prompt) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    if (isOpenAIUnavailable(error)) {
      return NextResponse.json({
        enhanced: prompt,
        fallback: true,
        reason: "openai_unavailable",
      });
    }
    return NextResponse.json({
      enhanced: prompt,
      fallback: true,
      reason: "assist_error",
    });
  }
}

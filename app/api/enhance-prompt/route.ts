import { NextRequest, NextResponse } from "next/server";

import OpenAI from "openai";

function isOpenAIUnavailable(error: unknown): boolean {
  if (!error || typeof error !== "object") return true;

  const err = error as {
    status?: number;
    code?: string;
    message?: string;
  };

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

function fallbackResponse(
  prompt: string,
  reason: "missing_openai_key" | "openai_unavailable"
) {
  return NextResponse.json(
    {
      enhanced: prompt,
      fallback: true,
      reason,
    },
    { status: 200 }
  );
}

export async function POST(req: NextRequest) {
  let prompt = "";

  try {
    const body = await req.json();

    prompt =
      typeof body.prompt === "string"
        ? body.prompt.trim()
        : "";

    const dna =
      typeof body.dna === "string"
        ? body.dna
        : "";

    const lighting =
      typeof body.lighting === "string"
        ? body.lighting
        : "";

    const cameraAngle =
      typeof body.cameraAngle === "string"
        ? body.cameraAngle
        : "";

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt required" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      console.log(
        "Prompt enhancement fallback: missing_openai_key"
      );
      return fallbackResponse(
        prompt,
        "missing_openai_key"
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response =
      await openai.chat.completions.create({
        model: "gpt-4o-mini",

        messages: [
          {
            role: "system",

            content: `
You are a cinematic AI creative director.

Enhance prompts for ultra realistic influencer photography.

Focus on:
- cinematic photography
- luxury aesthetics
- influencer visuals
- fashion/editorial quality
- realistic beauty
- social media quality
- visual consistency

Keep prompts concise but highly detailed.

Return ONLY the final enhanced prompt.
`,
          },

          {
            role: "user",

            content: `
USER PROMPT:
${prompt}

CHARACTER DNA:
${dna}

LIGHTING:
${lighting}

CAMERA:
${cameraAngle}

Create an enhanced cinematic AI image prompt.
`,
          },
        ],

        temperature: 0.9,
      });

    const enhanced =
      response.choices?.[0]?.message?.content?.trim() ||
      "";

    if (!enhanced) {
      console.log(
        "Prompt enhancement fallback: empty_response"
      );
      return fallbackResponse(
        prompt,
        "openai_unavailable"
      );
    }

    return NextResponse.json({
      enhanced,
      fallback: false,
    });
  } catch (error: unknown) {
    const reason = isOpenAIUnavailable(error)
      ? "openai_unavailable"
      : "openai_unavailable";

    console.log(
      `Prompt enhancement fallback: ${reason}`
    );

    if (!prompt) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    return fallbackResponse(prompt, reason);
  }
}

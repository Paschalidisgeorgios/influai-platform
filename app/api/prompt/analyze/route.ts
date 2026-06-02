import { NextResponse } from "next/server";
import {
  analyzeAndEnhancePrompt,
  calculateViralScore,
} from "@/lib/ai/smartPromptEngine";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, imageMode = "standard", platform = "square" } = body as {
      prompt?: unknown;
      imageMode?: unknown;
      platform?: unknown;
    };

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const result = analyzeAndEnhancePrompt(prompt.trim());
    const viralScore = calculateViralScore(
      prompt,
      typeof imageMode === "string" ? imageMode : "standard",
      typeof platform === "string" ? platform : "square"
    );

    return NextResponse.json({ success: true, ...result, viralScore });
  } catch (error) {
    console.error("Prompt analyze error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}

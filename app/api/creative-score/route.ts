import { NextResponse } from "next/server";
import { authenticateBearerUser } from "@/app/lib/supabase-admin";
import { buildRuleBasedCreativeScore } from "@/lib/intelligence/creative-score-engine";

export const runtime = "nodejs";

type RequestBody = {
  assetUrl?: string;
  prompt?: string;
  outputType?: "image" | "video";
  actionId?: string;
  currentLanguage?: "en" | "de";
};

export async function POST(req: Request) {
  const { user, error: authError } = await authenticateBearerUser(req);
  if (!user) {
    return NextResponse.json(
      { success: false, error: authError ?? "Unauthorized" },
      { status: 401 }
    );
  }

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  const assetUrl = typeof body.assetUrl === "string" ? body.assetUrl.trim() : "";
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const outputType = body.outputType === "video" ? "video" : "image";
  const language = body.currentLanguage === "de" ? "de" : "en";

  if (!assetUrl) {
    return NextResponse.json(
      { success: false, error: "assetUrl is required." },
      { status: 400 }
    );
  }

  if (!prompt) {
    return NextResponse.json(
      { success: false, error: "prompt is required." },
      { status: 400 }
    );
  }

  try {
    // Advisory score only — no LLM/provider calls (cost: 0; improve render is credit-gated separately).
    const result = buildRuleBasedCreativeScore({
      assetUrl,
      prompt,
      outputType,
      actionId: typeof body.actionId === "string" ? body.actionId : undefined,
      language,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Creative Score failed.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

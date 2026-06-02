import { NextResponse } from "next/server";
import { isLaunchFeatureEnabled } from "@/app/lib/config/launch";
import { buildSocialAssetPackPreview } from "@/app/lib/packs/social-asset-pack";
import type { SocialAssetPackPreviewRequest } from "@/app/lib/packs/types";

export const runtime = "nodejs";

/**
 * Free preview — no credits, no image/video provider calls, no auth required.
 */
export async function POST(req: Request) {
  if (!isLaunchFeatureEnabled("enableSocialAssetPack")) {
    return NextResponse.json({ error: "Pack is not available." }, { status: 403 });
  }

  let body: SocialAssetPackPreviewRequest;

  try {
    body = (await req.json()) as SocialAssetPackPreviewRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const language = body.language === "de" ? "de" : "en";

  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
  }

  if (prompt.length > 4000) {
    return NextResponse.json(
      { error: "Prompt is too long." },
      { status: 400 }
    );
  }

  const preview = await buildSocialAssetPackPreview({ prompt, language });

  return NextResponse.json(preview);
}

import { NextResponse } from "next/server";
import { isLaunchFeatureEnabled } from "@/app/lib/config/launch";
import {
  generateHooksCaptionsBundle,
  type HooksCaptionsGenerateRequest,
} from "@/app/lib/copy/hooks-captions";

export const runtime = "nodejs";

/**
 * Free copy generation — no credits, no image/video/LLM provider calls.
 */
export async function POST(req: Request) {
  if (!isLaunchFeatureEnabled("enableSocialAssetPack")) {
    return NextResponse.json({ error: "Copy tool is not available." }, { status: 403 });
  }

  let body: HooksCaptionsGenerateRequest;

  try {
    body = (await req.json()) as HooksCaptionsGenerateRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const prompt =
    typeof body.prompt === "string"
      ? body.prompt.trim()
      : typeof body.assetPrompt === "string"
        ? body.assetPrompt.trim()
        : "";
  const language = body.language === "de" ? "de" : "en";

  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
  }

  if (prompt.length > 4000) {
    return NextResponse.json({ error: "Prompt is too long." }, { status: 400 });
  }

  const result = await generateHooksCaptionsBundle({ prompt, language });

  return NextResponse.json(result);
}

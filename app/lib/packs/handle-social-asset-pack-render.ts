/**
 * Social Asset Pack paid render — shared by pack route and unified tool handler.
 * Credits are validated before any provider calls (see renderSocialAssetPack).
 */

import { NextResponse } from "next/server";
import { authenticateBearerUser } from "@/app/lib/supabase-admin";
import { isLaunchFeatureEnabled } from "@/app/lib/config/launch";
import {
  assertToolCanRun,
  isToolRunBlockedError,
  isToolRunInsufficientCreditsError,
} from "@/app/lib/tools/assert-tool-can-run";
import {
  renderSocialAssetPack,
  SocialAssetPackRenderError,
} from "@/app/lib/packs/render-social-asset-pack";
import type { SocialAssetPackRenderRequest } from "@/app/lib/packs/types";

export async function handleSocialAssetPackRenderRequest(
  req: Request
): Promise<Response> {
  if (!isLaunchFeatureEnabled("enableSocialAssetPack")) {
    return NextResponse.json(
      { success: false, error: "Pack is not available.", code: "PACK_DISABLED" },
      { status: 403 }
    );
  }

  const { supabase, user, error: authError } = await authenticateBearerUser(req);
  if (!user) {
    return NextResponse.json(
      { success: false, error: authError ?? "Unauthorized", code: "UNAUTHENTICATED" },
      { status: 401 }
    );
  }

  let body: SocialAssetPackRenderRequest;
  try {
    body = (await req.json()) as SocialAssetPackRenderRequest;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body.", code: "BODY_INVALID" },
      { status: 400 }
    );
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const language = body.language === "de" ? "de" : "en";
  const improvedPrompt =
    typeof body.improvedPrompt === "string" ? body.improvedPrompt.trim() : undefined;

  if (!prompt) {
    return NextResponse.json(
      { success: false, error: "Prompt is required.", code: "MISSING_PROMPT" },
      { status: 400 }
    );
  }

  if (prompt.length > 4000) {
    return NextResponse.json(
      { success: false, error: "Prompt is too long.", code: "PROMPT_TOO_LONG" },
      { status: 400 }
    );
  }

  const { data: creditRow } = await supabase
    .from("user_credits")
    .select("credits")
    .eq("user_id", user.id)
    .maybeSingle();

  try {
    assertToolCanRun({
      toolId: "social_asset_pack",
      userCreditBalance: creditRow?.credits ?? 0,
      language,
    });
  } catch (gateError) {
    if (isToolRunBlockedError(gateError)) {
      return NextResponse.json(
        {
          success: false,
          error: gateError.userMessage,
          code: gateError.code,
          creditsCharged: 0,
          creditsRefunded: 0,
        },
        { status: gateError.status }
      );
    }
    if (isToolRunInsufficientCreditsError(gateError)) {
      return NextResponse.json(
        {
          success: false,
          error: gateError.userMessage,
          code: "INSUFFICIENT_CREDITS",
          creditsCharged: 0,
          creditsRefunded: 0,
        },
        { status: gateError.status }
      );
    }
    throw gateError;
  }

  try {
    const result = await renderSocialAssetPack({
      supabase,
      userId: user.id,
      prompt,
      language,
      improvedPrompt,
    });

    const httpStatus =
      result.status === "failed" ? 502 : result.status === "partial" ? 207 : 200;

    return NextResponse.json(result, { status: httpStatus });
  } catch (error) {
    if (error instanceof SocialAssetPackRenderError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
          creditsCharged: 0,
          creditsRefunded: 0,
        },
        { status: error.status }
      );
    }

    console.error("[social-asset-pack-render]", error);
    return NextResponse.json(
      {
        success: false,
        error:
          language === "de"
            ? "Pack-Rendering fehlgeschlagen."
            : "Pack rendering failed.",
        code: "PACK_RENDER_FAILED",
        creditsCharged: 0,
        creditsRefunded: 0,
      },
      { status: 500 }
    );
  }
}

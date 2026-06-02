import { NextResponse } from "next/server";
import { isLaunchFeatureEnabled } from "@/app/lib/config/launch";
import {
  buildExportPackManifest,
  type ExportPackPreviewRequest,
} from "@/app/lib/export/export-pack";

export const runtime = "nodejs";

/**
 * Free export manifest — no credits, no provider calls.
 */
export async function POST(req: Request) {
  if (!isLaunchFeatureEnabled("enableGallery")) {
    return NextResponse.json({ error: "Export pack is not available." }, { status: 403 });
  }

  let body: ExportPackPreviewRequest;

  try {
    body = (await req.json()) as ExportPackPreviewRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const language = body.language === "de" ? "de" : "en";
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const assetPrompts = Array.isArray(body.assetPrompts)
    ? body.assetPrompts.filter((p): p is string => typeof p === "string")
    : [];

  if (!prompt && assetPrompts.length === 0) {
    return NextResponse.json(
      { error: "Prompt or asset context is required." },
      { status: 400 }
    );
  }

  const manifest = buildExportPackManifest({
    prompt,
    language,
    assetPrompts,
    selectedAssets: [],
  });

  return NextResponse.json(manifest);
}

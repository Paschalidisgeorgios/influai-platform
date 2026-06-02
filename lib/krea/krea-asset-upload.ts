/**
 * Upload external media to Krea Assets so video/edit APIs accept start_image / init_video.
 * Krea rejects arbitrary Supabase URLs with "Invalid asset URL" (422).
 */

import { getKreaSdkClient } from "./krea-sdk-client";

const KREA_HOST_PATTERNS = ["gen.krea.ai", "krea.ai/", "api.krea.ai"];

function isLikelyKreaAssetUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return KREA_HOST_PATTERNS.some(
      (pattern) => host.includes(pattern.replace(/\/$/, "")) || url.includes(pattern)
    );
  } catch {
    return false;
  }
}

function defaultMimeForKind(kind: "image" | "video"): string {
  return kind === "video" ? "video/mp4" : "image/jpeg";
}

function filenameFromSourceUrl(
  sourceUrl: string,
  kind: "image" | "video"
): string {
  try {
    const base = new URL(sourceUrl).pathname.split("/").pop()?.trim() ?? "";
    if (
      base &&
      (kind === "video"
        ? /\.(mp4|mov|webm)$/i.test(base)
        : /\.(jpg|jpeg|png|webp|heic|heif)$/i.test(base))
    ) {
      return base;
    }
  } catch {
    /* ignore */
  }
  return kind === "video" ? "asset.mp4" : "asset.jpg";
}

/** Returns a Krea-accessible asset URL for the given remote image or video. */
export async function ensureKreaAssetUrl(
  sourceUrl: string,
  options?: { description?: string; kind?: "image" | "video" | "auto" }
): Promise<string> {
  const trimmed = sourceUrl.trim();
  if (!trimmed) {
    throw new Error("MISSING_SOURCE_MEDIA");
  }

  if (isLikelyKreaAssetUrl(trimmed)) {
    return trimmed;
  }

  const response = await fetch(trimmed);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch source media for Krea asset upload (${response.status}).`
    );
  }

  const contentType = response.headers.get("content-type") || "";
  const kind =
    options?.kind === "auto" || !options?.kind
      ? contentType.startsWith("video/")
        ? "video"
        : "image"
      : options.kind;
  const mime = contentType || defaultMimeForKind(kind);
  const buffer = Buffer.from(await response.arrayBuffer());
  const blob = new Blob([buffer], { type: mime });
  const filename = filenameFromSourceUrl(trimmed, kind);

  const client = getKreaSdkClient();
  const asset = await client.assets.upload(blob, {
    description:
      options?.description ??
      (kind === "video" ? "InfluExAi driving video" : "InfluExAi reference"),
    filename,
  });

  if (!asset.image_url?.trim()) {
    throw new Error("Krea asset upload did not return image_url.");
  }

  return asset.image_url.trim();
}

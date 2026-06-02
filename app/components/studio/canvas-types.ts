/** Shared types for the action-first creator canvas */

export type CreatorCanvasAsset = {
  id?: string;
  url: string;
  outputType: "image" | "video";
  prompt?: string;
  createdAt?: string;
  generationId?: string;
  /** Which studio created this asset — used for provider-neutral labels */
  sourceStudio?: "image" | "video";
  /** User-facing model mode used at generation time — never shown as raw engine id */
  modelModeId?: string;
  creditsUsed?: number;
};

export function getCreatorSourceLabel(
  asset: Pick<CreatorCanvasAsset, "outputType" | "sourceStudio">,
  isDe = false
): string {
  const studio = asset.sourceStudio ?? asset.outputType;
  if (studio === "video") {
    return isDe ? "Erstellt mit Video Studio" : "Created with Video Studio";
  }
  return isDe ? "Erstellt mit Image Studio" : "Created with Image Studio";
}

export function formatCanvasDate(
  iso: string | undefined,
  isDe = false
): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString(isDe ? "de-DE" : "en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return null;
  }
}

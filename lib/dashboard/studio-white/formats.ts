import type { StudioFormatId } from "@/lib/dashboard/v2/constants";

/** Map UI format cards to backend outputFormat keys. */
export function studioFormatToApi(format: StudioFormatId): string {
  switch (format) {
    case "vertical":
      return "tiktok";
    case "landscape":
      return "youtube_thumbnail";
    default:
      return "square";
  }
}

export function apiFormatToStudio(format: string): StudioFormatId {
  if (format === "tiktok" || format === "instagram_story" || format === "youtube_shorts") {
    return "vertical";
  }
  if (format === "youtube_thumbnail") return "landscape";
  return "square";
}

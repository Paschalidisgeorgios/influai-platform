/** Central object-position for non-hero landing media (previews, scroll sections) */

export const MEDIA_FOCAL_POINTS = {
  hero: "center 30%",
  creator: "center 30%",
  lipsync: "center 30%",
  motion: "center 20%",
} as const;

export type MediaFocalKey = keyof typeof MEDIA_FOCAL_POINTS;

/** Maps hero backdrop track index → focal key (synced with HERO_LIVE_MEDIA) */
export const HERO_TRACK_FOCAL_KEYS: MediaFocalKey[] = [
  "hero",
  "creator",
  "lipsync",
  "motion",
];

export function getMediaFocalPoint(key: MediaFocalKey): string {
  return MEDIA_FOCAL_POINTS[key];
}

export function focalStyle(key: MediaFocalKey): { objectPosition: string } {
  return { objectPosition: MEDIA_FOCAL_POINTS[key] };
}

/** Custom landing assets — drop files here to override fallbacks. */

/** Primary hero still — public/assets/hero-model1.png.jpg */
export const HERO_MODEL1_STILL = "/assets/hero-model1.png.jpg";
export const HERO_MODEL1_STILL_FALLBACK = "/assets/hero-model.png.png";

export const LANDING_MODEL_IMAGE = HERO_MODEL1_STILL;
export const LANDING_MODEL_IMAGE_FALLBACK = HERO_MODEL1_STILL_FALLBACK;
export const LANDING_ZOOM_IMAGE =
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=2400&q=85";
export const LANDING_COMPARE_MASTER = LANDING_MODEL_IMAGE;
export const LANDING_COMPARE_MASTER_FALLBACK = LANDING_MODEL_IMAGE_FALLBACK;

export const LANDING_ZOOM_FALLBACK = "/images/hero (20).jpg";

export const LANDING_VIDEO_LIPSYNC = "/assets/preview-lipsync.mp4";
export const LANDING_VIDEO_LIPSYNC_FALLBACK = "/assets/preview-lipsync.mp4.mp4";
export const LANDING_VIDEO_LIPSYNC_POSTER = HERO_MODEL1_STILL;

export const LANDING_VIDEO_MOTION = "/assets/preview-motion.mp4";
export const LANDING_VIDEO_MOTION_FALLBACK = "/assets/preview-motion.mp4.mp4";
export const LANDING_VIDEO_MOTION_POSTER = "/assets/hero-model2.png.jpg";

/** Hero live canvas — index syncs 1:1 with agent loop (4 stages). */
export const HERO_LIVE_MODEL_IMAGE = HERO_MODEL1_STILL;
export const HERO_LIVE_MODEL_IMAGE_FALLBACK = HERO_MODEL1_STILL_FALLBACK;
export const HERO_LIVE_PREVIEW_VIDEO = "/assets/hero-model3.png.mp4";
export const HERO_LIVE_PREVIEW_VIDEO_FALLBACK = "/assets/preview-motion.mp4.mp4";

export type HeroLiveMedia = {
  kind: "image" | "video";
  src: string;
  fallback: string;
};

export const HERO_LIVE_MEDIA: HeroLiveMedia[] = [
  {
    kind: "image",
    src: HERO_LIVE_MODEL_IMAGE,
    fallback: HERO_LIVE_MODEL_IMAGE_FALLBACK,
  },
  {
    kind: "video",
    src: HERO_LIVE_PREVIEW_VIDEO,
    fallback: HERO_LIVE_PREVIEW_VIDEO_FALLBACK,
  },
  {
    kind: "video",
    src: LANDING_VIDEO_LIPSYNC,
    fallback: LANDING_VIDEO_LIPSYNC_FALLBACK,
  },
  {
    kind: "video",
    src: LANDING_VIDEO_MOTION,
    fallback: LANDING_VIDEO_MOTION_FALLBACK,
  },
];

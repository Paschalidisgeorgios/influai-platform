/**
 * Krea capability matrix for InfluExAi (server-side reference).
 * Do not expose provider names prominently in UI — use product mode labels.
 */

export type KreaCapabilityStatus =
  | "production"
  | "legacy_fallback"
  | "coming_soon"
  | "not_supported";

export type KreaCapabilityRow = {
  workflow: string;
  status: KreaCapabilityStatus;
  kreaEndpoint?: string;
  credits?: number;
  notes?: string;
};

/** Confirmed Krea endpoints used by the app. */
export const KREA_CAPABILITY_MATRIX: readonly KreaCapabilityRow[] = [
  {
    workflow: "standard",
    status: "production",
    kreaEndpoint: "POST /generate/image/{model}",
    credits: 1,
  },
  {
    workflow: "fast_draft",
    status: "production",
    kreaEndpoint: "POST /generate/image/{model}",
    credits: 1,
  },
  {
    workflow: "ugc_look",
    status: "production",
    kreaEndpoint: "POST /generate/image/{model}",
    credits: 2,
    notes: "UGC prompt blocks applied in queue before worker.",
  },
  {
    workflow: "premium_image",
    status: "production",
    kreaEndpoint: "POST /generate/image/{model}",
    credits: 3,
  },
  {
    workflow: "brand_assets",
    status: "production",
    kreaEndpoint: "POST /generate/image/{model}",
    credits: 4,
    notes: "Brand safety prompt blocks applied in queue.",
  },
  {
    workflow: "reference_edit",
    status: "production",
    kreaEndpoint: "POST /generate/image/google/nano-banana-pro",
    credits: 5,
  },
  {
    workflow: "enhance_asset",
    status: "production",
    kreaEndpoint: "POST /generate/enhance/topaz/standard-enhance",
    credits: 4,
  },
  {
    workflow: "video_image_to_video",
    status: "production",
    kreaEndpoint: "POST /generate/video/kling/kling-2.5",
    credits: 25,
    notes: "Async job polling via GET /jobs/{id}.",
  },
  {
    workflow: "video_restyle",
    status: "coming_soon",
    notes: "Krea video restyle endpoint not wired — keep hidden in UI.",
  },
  {
    workflow: "motion_transfer",
    status: "coming_soon",
    notes: "Krea motion transfer / animate creator endpoint not confirmed.",
  },
  {
    workflow: "lip_sync",
    status: "legacy_fallback",
    notes:
      "fal Sync Lipsync + optional ElevenLabs TTS until Krea lip-sync is confirmed.",
    credits: 30,
  },
  {
    workflow: "talking_creator",
    status: "legacy_fallback",
    notes: "fal pipeline until Krea talking-head flow is confirmed.",
    credits: 60,
  },
  {
    workflow: "creator_video",
    status: "legacy_fallback",
    credits: 40,
  },
] as const;

export const KREA_REFUND_ERROR_MESSAGE =
  "Krea generation failed. Your credits were refunded.";

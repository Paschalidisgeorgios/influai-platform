/**
 * Krea capability matrix for InfluExAi (server-side reference).
 * Do not expose provider names prominently in UI — use product mode labels.
 */

export type KreaCapabilityStatus =
  | "production"
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
    kreaEndpoint: "POST /generate/video/kling/kling-3.0",
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
    status: "not_supported",
    notes: "Krea lip-sync endpoint not wired — generation blocked on Krea-only platform.",
    credits: 30,
  },
  {
    workflow: "talking_creator",
    status: "not_supported",
    notes: "Talking-head pipeline not wired via Krea yet.",
    credits: 60,
  },
  {
    workflow: "creator_video",
    status: "not_supported",
    credits: 40,
  },
] as const;

/** @deprecated Use lib/generation/generation-errors — white-label copy only. */
export { GENERATION_FAILED_REFUNDED_EN as KREA_REFUND_ERROR_MESSAGE } from "@/lib/generation/generation-errors";

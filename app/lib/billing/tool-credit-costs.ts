/**
 * Central credit costs for creator tools and image/video modes.
 * UI and server handlers must resolve costs from here — never hardcode in components.
 */

import type { CreatorToolId } from "@/app/lib/tools/creator-tools";
import { getSocialAssetPackTotalCredits } from "@/app/lib/packs/social-asset-pack";
import { ANIMATE_IMAGE_CREDITS } from "@/app/lib/animate/animate-image-config";
import {
  LIPSYNC_CREATOR_CREDITS_SYSTEM_VOICE,
  LIPSYNC_CREATOR_CREDITS_UPLOAD_AUDIO,
} from "@/app/lib/lipsync/lipsync-creator-config";
import { AI_AVATAR_CREDITS_MIN } from "@/app/lib/avatar/ai-avatar-config";
import { MOTION_TRANSFER_CREDITS_MIN } from "@/app/lib/motion/motion-transfer-config";
import { TRAIN_CREATOR_STYLE_CREDITS_MIN } from "@/app/lib/training/train-creator-style-config";
import { TRAIN_BRAND_KIT_CREDITS_MIN } from "@/app/lib/training/train-brand-kit-config";
import { TRAIN_PRODUCT_MODEL_CREDITS_MIN } from "@/app/lib/training/train-product-model-config";
import { TRAIN_CREATOR_IDENTITY_CREDITS_MIN } from "@/app/lib/training/train-creator-identity-config";
import { OBJECT_3D_CREDITS_MIN } from "@/app/lib/three-d/object-3d-config";
import { AUDIO_SOUND_DESIGN_CREDITS_MIN } from "@/app/lib/audio/audio-sound-design-config";

/** Image mode credit defaults (also mirrored in engine catalog). */
export const IMAGE_MODE_CREDIT_COSTS = {
  auto_image: 1,
  fast_draft_image: 1,
  premium_image: 3,
  realtime_image: 1,
} as const;

export const CREATE_MOTION_VIDEO_CREDITS = 25;

/** Minimum billable credits per creator tool id. */
export const CREATOR_TOOL_CREDIT_COSTS: Record<CreatorToolId, number> = {
  create_image: IMAGE_MODE_CREDIT_COSTS.auto_image,
  create_video: CREATE_MOTION_VIDEO_CREDITS,
  social_asset_pack: getSocialAssetPackTotalCredits(),
  create_style_variant: IMAGE_MODE_CREDIT_COSTS.fast_draft_image,
  improve_prompt: 0,
  check_creative_score: 0,
  hooks_captions: 0,
  export_pack: 0,
  export_asset: 0,
  use_reference_image: 5,
  edit_image: 5,
  match_style: 5,
  enhance_asset: 3,
  background_remove: 2,
  upscale_image: 3,
  animate_image: ANIMATE_IMAGE_CREDITS,
  lipsync_creator: LIPSYNC_CREATOR_CREDITS_UPLOAD_AUDIO,
  ai_avatar: AI_AVATAR_CREDITS_MIN,
  motion_transfer: MOTION_TRANSFER_CREDITS_MIN,
  train_creator_style: TRAIN_CREATOR_STYLE_CREDITS_MIN,
  train_brand_kit: TRAIN_BRAND_KIT_CREDITS_MIN,
  train_product_model: TRAIN_PRODUCT_MODEL_CREDITS_MIN,
  train_creator_identity: TRAIN_CREATOR_IDENTITY_CREDITS_MIN,
  object_3d: OBJECT_3D_CREDITS_MIN,
  audio_sound_design: AUDIO_SOUND_DESIGN_CREDITS_MIN,
};

export const LIPSYNC_CREDIT_TIERS = {
  uploadAudio: LIPSYNC_CREATOR_CREDITS_UPLOAD_AUDIO,
  systemVoice: LIPSYNC_CREATOR_CREDITS_SYSTEM_VOICE,
} as const;

export function getCreatorToolCreditCost(toolId: CreatorToolId): number {
  return CREATOR_TOOL_CREDIT_COSTS[toolId] ?? 0;
}

export function getImageModeCreditCost(modeId: keyof typeof IMAGE_MODE_CREDIT_COSTS): number {
  return IMAGE_MODE_CREDIT_COSTS[modeId];
}

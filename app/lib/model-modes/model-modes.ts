/**
 * InfluExAI — model mode registry (user-facing creation presets).
 */

import type { ModelMode } from "./types";
import { ANIMATE_IMAGE_CREDITS } from "@/app/lib/animate/animate-image-config";
import { LIPSYNC_CREATOR_CREDITS_UPLOAD_AUDIO } from "@/app/lib/lipsync/lipsync-creator-config";
import { AI_AVATAR_CREDITS_MIN } from "@/app/lib/avatar/ai-avatar-config";
import { MOTION_TRANSFER_CREDITS_MIN } from "@/app/lib/motion/motion-transfer-config";
import { TRAIN_CREATOR_STYLE_CREDITS_MIN } from "@/app/lib/training/train-creator-style-config";
import { TRAIN_BRAND_KIT_CREDITS_MIN } from "@/app/lib/training/train-brand-kit-config";
import { TRAIN_PRODUCT_MODEL_CREDITS_MIN } from "@/app/lib/training/train-product-model-config";
import { TRAIN_CREATOR_IDENTITY_CREDITS_MIN } from "@/app/lib/training/train-creator-identity-config";
import { OBJECT_3D_CREDITS_MIN } from "@/app/lib/three-d/object-3d-config";
import { AUDIO_SOUND_DESIGN_CREDITS_MIN } from "@/app/lib/audio/audio-sound-design-config";

export const MODEL_MODE_REGISTRY: readonly ModelMode[] = [
  // ── Active image modes ──
  {
    id: "auto_image",
    label: "Auto",
    description: "Best balance of quality and speed for your prompt.",
    group: "image",
    actionId: "create_image",
    engineId: "smart_auto_pilot",
    status: "active",
    accessTier: "free",
    isPremium: false,
    outputType: "image",
    resolveCreditsFromEngine: true,
    canShowToUser: true,
    canRunGeneration: true,
  },
  {
    id: "fast_draft_image",
    label: "Fast Draft",
    description: "Quick drafts for testing ideas.",
    group: "image",
    actionId: "create_image",
    engineId: "krea_flux_fast_draft",
    status: "active",
    accessTier: "free",
    isPremium: false,
    outputType: "image",
    resolveCreditsFromEngine: true,
    canShowToUser: true,
    canRunGeneration: true,
  },
  {
    id: "premium_image",
    label: "Premium Image",
    description: "More polished visuals with stronger detail for final assets.",
    group: "image",
    actionId: "create_image",
    engineId: "krea_flux_11_pro_ultra",
    status: "active",
    accessTier: "creator",
    isPremium: true,
    outputType: "image",
    resolveCreditsFromEngine: true,
    canShowToUser: true,
    canRunGeneration: true,
  },
  {
    id: "realtime_image",
    label: "Realtime Render",
    description: "Explore visual directions quickly.",
    group: "image",
    actionId: "create_image",
    engineId: "krea_nano_realtime",
    status: "active",
    accessTier: "creator",
    isPremium: true,
    outputType: "image",
    resolveCreditsFromEngine: true,
    canShowToUser: true,
    canRunGeneration: true,
  },
  // ── Active video modes ──
  {
    id: "auto_video",
    label: "Auto Video",
    description: "Render a short motion clip for social content.",
    group: "video",
    actionId: "create_video",
    engineId: "fal_kling_v3_t2v",
    status: "active",
    accessTier: "creator",
    isPremium: true,
    outputType: "video",
    creditCost: 25,
    canShowToUser: true,
    canRunGeneration: true,
  },
  {
    id: "cinematic_text_video",
    label: "Cinematic Video",
    description: "Cinematic motion and framing for premium clips.",
    group: "video",
    actionId: "create_video",
    engineId: "fal_kling_v3_t2v",
    status: "active",
    accessTier: "creator",
    isPremium: true,
    outputType: "video",
    creditCost: 25,
    canShowToUser: true,
    canRunGeneration: true,
  },
  // ── Locked future tools (Coming soon — metadata only) ──
  {
    id: "animate_image",
    label: "Animate Image",
    description: "Turn an existing image into motion.",
    group: "animate",
    actionId: "animate_image",
    status: "locked",
    accessTier: "creator",
    isPremium: true,
    outputType: "video",
    creditCost: ANIMATE_IMAGE_CREDITS,
    requiresImageAsset: true,
    comingSoonReason:
      "Turn an existing image into motion — request access to get notified when image-to-video unlocks.",
    canShowToUser: true,
    canRunGeneration: false,
  },
  {
    id: "lipsync_creator",
    label: "LipSync Creator",
    description: "Create talking creator videos.",
    group: "lipsync",
    actionId: "lipsync_creator",
    status: "locked",
    accessTier: "pro",
    isPremium: true,
    outputType: "video",
    creditCost: LIPSYNC_CREATOR_CREDITS_UPLOAD_AUDIO,
    requiresVideoAsset: true,
    comingSoonReason:
      "Create talking creator videos — request access or upgrade when lip-sync unlocks.",
    canShowToUser: true,
    canRunGeneration: false,
  },
  {
    id: "ai_avatar",
    label: "AI Avatar",
    description: "Generate avatar-style creator videos.",
    group: "avatar",
    actionId: "ai_avatar",
    status: "locked",
    accessTier: "pro",
    isPremium: true,
    outputType: "video",
    creditCost: AI_AVATAR_CREDITS_MIN,
    comingSoonReason:
      "Generate avatar-style creator videos — request access or upgrade when avatar generation unlocks.",
    canShowToUser: true,
    canRunGeneration: false,
  },
  {
    id: "enhance_asset",
    label: "Enhance Asset",
    description: "Upscale or clean up your asset.",
    group: "enhance",
    actionId: "enhance_asset",
    status: "locked",
    accessTier: "creator",
    isPremium: true,
    outputType: "image",
    creditCost: 3,
    requiresAsset: true,
    comingSoonReason:
      "Sharpen, clean artifacts and prepare assets for export when enhancement unlocks.",
    canShowToUser: true,
    canRunGeneration: false,
  },
  {
    id: "background_remove",
    label: "Background Remove",
    description: "Remove backgrounds from product or creator assets.",
    group: "enhance",
    actionId: "background_remove",
    status: "locked",
    accessTier: "creator",
    isPremium: true,
    outputType: "image",
    creditCost: 2,
    requiresImageAsset: true,
    comingSoonReason:
      "Remove backgrounds from product or creator assets when the workflow unlocks.",
    canShowToUser: true,
    canRunGeneration: false,
  },
  {
    id: "upscale_image",
    label: "Upscale",
    description: "Prepare your asset for higher-quality export.",
    group: "enhance",
    actionId: "upscale_image",
    status: "locked",
    accessTier: "creator",
    isPremium: true,
    outputType: "image",
    creditCost: 3,
    requiresAsset: true,
    comingSoonReason:
      "Prepare your asset for higher-quality export when upscaling unlocks.",
    canShowToUser: true,
    canRunGeneration: false,
  },
  {
    id: "object_3d",
    label: "3D Object",
    description: "Create 3D-style product assets.",
    group: "three_d",
    actionId: "object_3d",
    status: "locked",
    accessTier: "pro",
    isPremium: true,
    outputType: "three_d",
    creditCost: OBJECT_3D_CREDITS_MIN,
    comingSoonReason:
      "Create 3D-style product assets from a prompt or reference image — request Pro access when 3D rendering unlocks.",
    canShowToUser: true,
    canRunGeneration: false,
  },
  {
    id: "motion_transfer",
    label: "Motion Transfer",
    description:
      "Apply a motion style or reference movement to a creator asset.",
    group: "motion",
    actionId: "motion_transfer",
    status: "locked",
    accessTier: "pro",
    isPremium: true,
    outputType: "video",
    creditCost: MOTION_TRANSFER_CREDITS_MIN,
    requiresImageAsset: true,
    requiresVideoAsset: true,
    comingSoonReason:
      "Apply motion style or reference movement — request access or upgrade when motion transfer unlocks.",
    canShowToUser: true,
    canRunGeneration: false,
  },
  {
    id: "audio_sound_design",
    label: "Audio Sound Design",
    description: "Create sound or audio ideas for creator videos.",
    group: "audio",
    actionId: "audio_sound_design",
    status: "locked",
    accessTier: "creator",
    isPremium: true,
    outputType: "audio",
    creditCost: AUDIO_SOUND_DESIGN_CREDITS_MIN,
    comingSoonReason:
      "Create sound or audio ideas for creator videos — request access when audio generation unlocks.",
    canShowToUser: true,
    canRunGeneration: false,
  },
  // ── Locked reference & edit (Coming soon — metadata only) ──
  {
    id: "use_reference_image",
    label: "Use Reference Image",
    description:
      "Create a new asset using an uploaded image as visual reference.",
    group: "edit",
    actionId: "use_reference_image",
    status: "locked",
    accessTier: "creator",
    isPremium: true,
    outputType: "image",
    creditCost: 5,
    requiresImageAsset: true,
    comingSoonReason:
      "Upload a reference image, describe your goal, and generate a matching asset when rendering unlocks.",
    canShowToUser: true,
    canRunGeneration: false,
  },
  {
    id: "edit_image",
    label: "Edit Image",
    description:
      "Change style, background, lighting or composition of an existing image.",
    group: "edit",
    actionId: "edit_image",
    status: "locked",
    accessTier: "creator",
    isPremium: true,
    outputType: "image",
    creditCost: 5,
    requiresImageAsset: true,
    comingSoonReason:
      "Upload or select an image, describe your edit, and save a new Gallery version when rendering unlocks.",
    canShowToUser: true,
    canRunGeneration: false,
  },
  {
    id: "match_style",
    label: "Match Style",
    description:
      "Use a reference image to match mood, color and visual style.",
    group: "edit",
    actionId: "match_style",
    status: "locked",
    accessTier: "creator",
    isPremium: true,
    outputType: "image",
    creditCost: 5,
    requiresImageAsset: true,
    comingSoonReason:
      "Add a reference image and prompt to match lighting, color mood and visual style when rendering unlocks.",
    canShowToUser: true,
    canRunGeneration: false,
  },
  // ── Locked training (Coming soon — metadata only) ──
  {
    id: "train_creator_style",
    label: "Train Creator Style",
    description:
      "Train a reusable visual style from your own creator assets.",
    group: "training",
    actionId: "train_creator_style",
    status: "locked",
    accessTier: "pro",
    isPremium: true,
    outputType: "model",
    creditCost: TRAIN_CREATOR_STYLE_CREDITS_MIN,
    comingSoonReason:
      "Train a reusable creator look from your assets — request Pro access when style training unlocks.",
    canShowToUser: true,
    canRunGeneration: false,
  },
  {
    id: "train_brand_kit",
    label: "Train Brand Kit",
    description: "Train a consistent brand visual system.",
    group: "training",
    actionId: "train_brand_kit",
    status: "locked",
    accessTier: "pro",
    isPremium: true,
    outputType: "model",
    creditCost: TRAIN_BRAND_KIT_CREDITS_MIN,
    comingSoonReason:
      "Train a consistent brand visual system — request Pro access when brand training unlocks.",
    canShowToUser: true,
    canRunGeneration: false,
  },
  {
    id: "train_product_model",
    label: "Train Product Model",
    description: "Train a reusable product model for consistent visuals.",
    group: "training",
    actionId: "train_product_model",
    status: "locked",
    accessTier: "pro",
    isPremium: true,
    outputType: "model",
    creditCost: TRAIN_PRODUCT_MODEL_CREDITS_MIN,
    comingSoonReason:
      "Train a reusable product model for consistent visuals — request Pro access when product training unlocks.",
    canShowToUser: true,
    canRunGeneration: false,
  },
  {
    id: "train_creator_identity",
    label: "Train Creator Identity",
    description:
      "Create more consistent creator-style visuals from an approved image set.",
    group: "training",
    actionId: "train_creator_identity",
    status: "locked",
    accessTier: "pro",
    isPremium: true,
    outputType: "model",
    creditCost: TRAIN_CREATOR_IDENTITY_CREDITS_MIN,
    comingSoonReason:
      "Create more consistent creator-style visuals from your own approved image set — request Pro access when identity training unlocks.",
    canShowToUser: true,
    canRunGeneration: false,
  },
] as const;

const MODE_BY_ID = new Map<string, ModelMode>(
  MODEL_MODE_REGISTRY.map((mode) => [mode.id, mode])
);

export function getModelModeById(modelModeId: string): ModelMode | null {
  return MODE_BY_ID.get(modelModeId.trim()) ?? null;
}

export function getAllModelModes(): readonly ModelMode[] {
  return MODEL_MODE_REGISTRY;
}

export const DEFAULT_MODEL_MODE_BY_ACTION: Record<string, string> = {
  create_image: "auto_image",
  create_video: "auto_video",
};

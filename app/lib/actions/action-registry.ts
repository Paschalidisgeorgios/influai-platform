/**
 * InfluExAi — Action Registry (launch MVP layer above engine catalog).
 */

import type { ActionDefinition, ActionId } from "./types";
import {
  ANIMATE_IMAGE_CREDITS,
  ANIMATE_IMAGE_ENGINE_ID,
} from "@/app/lib/animate/animate-image-config";
import {
  LIPSYNC_CREATOR_CREDITS_UPLOAD_AUDIO,
  LIPSYNC_CREATOR_ENGINE_ID,
} from "@/app/lib/lipsync/lipsync-creator-config";
import {
  AI_AVATAR_CREDITS_MIN,
  AI_AVATAR_ENGINE_ID,
} from "@/app/lib/avatar/ai-avatar-config";
import {
  MOTION_TRANSFER_CREDITS_MIN,
  MOTION_TRANSFER_ENGINE_ID,
} from "@/app/lib/motion/motion-transfer-config";
import {
  OBJECT_3D_CREDITS_MIN,
  OBJECT_3D_ENGINE_ID,
} from "@/app/lib/three-d/object-3d-config";
import {
  AUDIO_SOUND_DESIGN_CREDITS_MIN,
  AUDIO_SOUND_DESIGN_ENGINE_ID,
} from "@/app/lib/audio/audio-sound-design-config";
import {
  TRAIN_CREATOR_STYLE_CREDITS_MIN,
  TRAIN_CREATOR_STYLE_ENGINE_ID,
} from "@/app/lib/training/train-creator-style-config";
import {
  TRAIN_BRAND_KIT_CREDITS_MIN,
  TRAIN_BRAND_KIT_ENGINE_ID,
} from "@/app/lib/training/train-brand-kit-config";
import {
  TRAIN_PRODUCT_MODEL_CREDITS_MIN,
  TRAIN_PRODUCT_MODEL_ENGINE_ID,
} from "@/app/lib/training/train-product-model-config";
import {
  TRAIN_CREATOR_IDENTITY_CREDITS_MIN,
  TRAIN_CREATOR_IDENTITY_ENGINE_ID,
} from "@/app/lib/training/train-creator-identity-config";

export const ACTION_REGISTRY: readonly ActionDefinition[] = [
  {
    id: "create_image",
    label: "Create Image",
    outputType: "image",
    status: "active",
    allowedEngines: [
      "smart_auto_pilot",
      "krea_flux_11_pro_ultra",
      "krea_flux_fast_draft",
      "krea_nano_realtime",
    ],
    defaultEngine: "smart_auto_pilot",
    description:
      "Generate creator visuals, product shots and social assets.",
  },
  {
    id: "create_video",
    label: "Create Motion Video",
    outputType: "video",
    status: "active",
    allowedEngines: ["fal_kling_v3_t2v"],
    defaultEngine: "fal_kling_v3_t2v",
    description: "Turn an idea into a short AI-generated motion video.",
  },
  {
    id: "improve_prompt",
    label: "Improve Prompt",
    outputType: "prompt",
    status: "active",
    cost: 0,
    description: "Improve your idea as you type.",
  },
  {
    id: "check_creative_score",
    label: "Creative Score",
    outputType: "analysis",
    status: "active",
    cost: 0,
    description:
      "Get feedback on clarity, composition, hooks and social readiness.",
  },
  {
    id: "create_style_variant",
    label: "Style Variant",
    outputType: "image",
    status: "active",
    allowedEngines: ["krea_flux_fast_draft"],
    defaultEngine: "krea_flux_fast_draft",
    description: "Fast draft variant of an existing creator visual.",
  },
  {
    id: "export_asset",
    label: "Export",
    outputType: "image",
    status: "active",
    cost: 0,
    description: "Download the asset to your device.",
  },
  {
    id: "animate_image",
    label: "Animate Image",
    outputType: "video",
    status: "active",
    cost: ANIMATE_IMAGE_CREDITS,
    allowedEngines: [ANIMATE_IMAGE_ENGINE_ID],
    description: "Turn an existing image into motion.",
  },
  {
    id: "lipsync_creator",
    label: "LipSync Creator",
    outputType: "video",
    status: "active",
    cost: LIPSYNC_CREATOR_CREDITS_UPLOAD_AUDIO,
    allowedEngines: [LIPSYNC_CREATOR_ENGINE_ID],
    description: "Create talking creator videos.",
  },
  {
    id: "ai_avatar",
    label: "AI Avatar",
    outputType: "video",
    status: "active",
    cost: AI_AVATAR_CREDITS_MIN,
    allowedEngines: [AI_AVATAR_ENGINE_ID],
    description: "Generate avatar-style creator videos.",
  },
  {
    id: "enhance_asset",
    label: "Enhance Asset",
    outputType: "image",
    status: "active",
    cost: 4,
    allowedEngines: ["fal_image_upscale"],
    description: "Upscale or clean up your asset.",
  },
  {
    id: "background_remove",
    label: "Background Remove",
    outputType: "image",
    status: "active",
    cost: 2,
    allowedEngines: ["fal_background_removal"],
    description: "Remove backgrounds from product or creator assets.",
  },
  {
    id: "upscale_image",
    label: "Upscale",
    outputType: "image",
    status: "active",
    cost: 4,
    allowedEngines: ["fal_image_upscale"],
    description: "Prepare your asset for higher-quality export.",
  },
  {
    id: "object_3d",
    label: "3D Object",
    outputType: "three_d",
    status: "active",
    cost: OBJECT_3D_CREDITS_MIN,
    allowedEngines: [OBJECT_3D_ENGINE_ID],
    description: "Create 3D-style product assets.",
  },
  {
    id: "motion_transfer",
    label: "Motion Transfer",
    outputType: "video",
    status: "active",
    cost: MOTION_TRANSFER_CREDITS_MIN,
    allowedEngines: [MOTION_TRANSFER_ENGINE_ID],
    description:
      "Apply a motion style or reference movement to a creator asset.",
  },
  {
    id: "audio_sound_design",
    label: "Audio Sound Design",
    outputType: "audio",
    status: "active",
    cost: AUDIO_SOUND_DESIGN_CREDITS_MIN,
    allowedEngines: [AUDIO_SOUND_DESIGN_ENGINE_ID],
    description: "Create sound or audio ideas for creator videos.",
  },
  {
    id: "use_reference_image",
    label: "Use Reference Image",
    outputType: "image",
    status: "active",
    cost: 4,
    description:
      "Create a new asset using an uploaded image as visual reference.",
  },
  {
    id: "edit_image",
    label: "Edit Image",
    outputType: "image",
    status: "active",
    cost: 4,
    allowedEngines: ["fal_reference_edit"],
    description:
      "Change style, background, lighting or composition of an existing image.",
  },
  {
    id: "match_style",
    label: "Match Style",
    outputType: "image",
    status: "active",
    cost: 4,
    allowedEngines: ["fal_style_transfer"],
    description:
      "Use a reference image to match mood, color and visual style.",
  },
  {
    id: "train_creator_style",
    label: "Train Creator Style",
    outputType: "model",
    status: "active",
    cost: TRAIN_CREATOR_STYLE_CREDITS_MIN,
    allowedEngines: [TRAIN_CREATOR_STYLE_ENGINE_ID],
    description:
      "Train a reusable visual style from your own creator assets.",
  },
  {
    id: "train_brand_kit",
    label: "Train Brand Kit",
    outputType: "model",
    status: "active",
    cost: TRAIN_BRAND_KIT_CREDITS_MIN,
    allowedEngines: [TRAIN_BRAND_KIT_ENGINE_ID],
    description: "Train a consistent brand visual system.",
  },
  {
    id: "train_product_model",
    label: "Train Product Model",
    outputType: "model",
    status: "active",
    cost: TRAIN_PRODUCT_MODEL_CREDITS_MIN,
    allowedEngines: [TRAIN_PRODUCT_MODEL_ENGINE_ID],
    description: "Train a reusable product model for consistent visuals.",
  },
  {
    id: "train_creator_identity",
    label: "Train Creator Identity",
    outputType: "model",
    status: "active",
    cost: TRAIN_CREATOR_IDENTITY_CREDITS_MIN,
    allowedEngines: [TRAIN_CREATOR_IDENTITY_ENGINE_ID],
    description:
      "Create more consistent creator-style visuals from an approved image set.",
  },
] as const;

const ACTION_ID_ALIASES: Record<string, ActionId> = {
  create_campaign_image: "create_image",
  create_video_from_text: "create_video",
  avatar_video: "ai_avatar",
};

const ACTION_BY_ID = new Map<ActionId, ActionDefinition>(
  ACTION_REGISTRY.map((action) => [action.id, action])
);

export function getActionById(actionId: string): ActionDefinition | null {
  const trimmed = actionId.trim();
  const canonical = (ACTION_ID_ALIASES[trimmed] ?? trimmed) as ActionId;
  return ACTION_BY_ID.get(canonical) ?? null;
}

export function getAllActions(): readonly ActionDefinition[] {
  return ACTION_REGISTRY;
}

export function isActionActive(action: ActionDefinition): boolean {
  return action.status === "active";
}

export function isActionLocked(action: ActionDefinition): boolean {
  return action.status === "locked";
}

/** True only for launch-active generation actions (never locked / coming soon). */
export function isActionRunnable(action: ActionDefinition): boolean {
  return isActionActive(action);
}

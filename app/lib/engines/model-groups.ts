/**
 * Creator capability groups — internal inventory taxonomy.
 * Normal users see model modes, not these capability ids.
 */

export type UserFacingCapability =
  | "image_generation"
  | "video_generation"
  | "image_to_video"
  | "realtime_image"
  | "image_edit"
  | "enhance"
  | "background_remove"
  | "lipsync"
  | "avatar"
  | "motion_transfer"
  | "training"
  | "three_d"
  | "audio"
  | "analysis";

/** Matches ModelInventoryEntryShape.outputType */
export type InventoryOutputType =
  | "image"
  | "video"
  | "audio"
  | "three_d"
  | "model"
  | "analysis";

export const INVENTORY_OUTPUT_TYPES = [
  "image",
  "video",
  "audio",
  "three_d",
  "model",
  "analysis",
] as const satisfies readonly InventoryOutputType[];

export type CapabilityGroupMeta = {
  id: UserFacingCapability;
  label: { en: string; de: string };
  defaultOutputType: InventoryOutputType;
  defaultInputTypes: readonly string[];
};

export const CAPABILITY_GROUPS: Record<UserFacingCapability, CapabilityGroupMeta> =
  {
    image_generation: {
      id: "image_generation",
      label: { en: "Image Generation", de: "Bildgenerierung" },
      defaultOutputType: "image",
      defaultInputTypes: ["text"],
    },
    video_generation: {
      id: "video_generation",
      label: { en: "Video Generation", de: "Videogenerierung" },
      defaultOutputType: "video",
      defaultInputTypes: ["text"],
    },
    image_to_video: {
      id: "image_to_video",
      label: { en: "Image to Video", de: "Bild zu Video" },
      defaultOutputType: "video",
      defaultInputTypes: ["image", "text"],
    },
    realtime_image: {
      id: "realtime_image",
      label: { en: "Realtime Image", de: "Realtime-Bild" },
      defaultOutputType: "image",
      defaultInputTypes: ["text"],
    },
    image_edit: {
      id: "image_edit",
      label: { en: "Image Edit", de: "Bildbearbeitung" },
      defaultOutputType: "image",
      defaultInputTypes: ["image", "text"],
    },
    enhance: {
      id: "enhance",
      label: { en: "Enhance", de: "Verbessern" },
      defaultOutputType: "image",
      defaultInputTypes: ["image"],
    },
    background_remove: {
      id: "background_remove",
      label: { en: "Background Remove", de: "Hintergrund entfernen" },
      defaultOutputType: "image",
      defaultInputTypes: ["image"],
    },
    lipsync: {
      id: "lipsync",
      label: { en: "LipSync", de: "LipSync" },
      defaultOutputType: "video",
      defaultInputTypes: ["video", "audio"],
    },
    avatar: {
      id: "avatar",
      label: { en: "AI Avatar", de: "AI Avatar" },
      defaultOutputType: "video",
      defaultInputTypes: ["text", "image"],
    },
    motion_transfer: {
      id: "motion_transfer",
      label: { en: "Motion Transfer", de: "Motion Transfer" },
      defaultOutputType: "video",
      defaultInputTypes: ["video", "image"],
    },
    training: {
      id: "training",
      label: { en: "Training", de: "Training" },
      defaultOutputType: "model",
      defaultInputTypes: ["image"],
    },
    three_d: {
      id: "three_d",
      label: { en: "3D", de: "3D" },
      defaultOutputType: "three_d",
      defaultInputTypes: ["image", "text"],
    },
    audio: {
      id: "audio",
      label: { en: "Audio", de: "Audio" },
      defaultOutputType: "audio",
      defaultInputTypes: ["text"],
    },
    analysis: {
      id: "analysis",
      label: { en: "Analysis", de: "Analyse" },
      defaultOutputType: "analysis",
      defaultInputTypes: ["text", "image", "video"],
    },
  };

export function getCapabilityMeta(
  capability: UserFacingCapability
): CapabilityGroupMeta {
  return CAPABILITY_GROUPS[capability];
}

export function capabilityFromEngineGroup(input: {
  engineId: string;
  group?: string;
}): UserFacingCapability {
  if (input.engineId === "fal_background_removal") return "background_remove";
  if (input.engineId === "fal_image_upscale") return "enhance";
  if (input.engineId === "krea_topaz_standard") return "enhance";
  if (input.engineId === "krea_nano_realtime") return "realtime_image";
  if (input.engineId === "smart_auto_pilot") return "image_generation";

  switch (input.group) {
    case "video_text_to_video":
      return "video_generation";
    case "video_image_to_video":
      return "image_to_video";
    case "realtime":
      return "realtime_image";
    case "edit":
      return "image_edit";
    case "enhancer":
      return "enhance";
    case "lipsync":
      return "lipsync";
    case "avatar":
      return "avatar";
    case "motion":
      return "motion_transfer";
    case "training":
      return "training";
    case "three_d":
      return "three_d";
    case "audio":
      return "audio";
    case "image":
    default:
      return "image_generation";
  }
}

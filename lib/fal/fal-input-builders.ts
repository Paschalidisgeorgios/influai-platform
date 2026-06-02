import type { EngineModelConfig } from "@/lib/ai/model-registry";

export type FalInputParams = {
  model: EngineModelConfig;
  prompt?: string;
  selectedFormat?: string;
  inputs?: {
    sourceImageUrl?: string;
    sourceVideoUrl?: string;
    sourceAudioUrl?: string;
    scriptText?: string;
    duration?: number;
    resolution?: string;
  };
};

function aspectRatio(selectedFormat?: string): string {
  switch (selectedFormat) {
    case "tiktok":
    case "instagram_story":
    case "youtube_shorts":
    case "9:16":
      return "9:16";
    case "youtube_thumbnail":
    case "landscape":
    case "16:9":
      return "16:9";
    case "1:1":
      return "1:1";
    default:
      return "9:16";
  }
}

function imageSize(selectedFormat?: string): string {
  switch (selectedFormat) {
    case "tiktok":
    case "instagram_story":
    case "youtube_shorts":
      return "portrait_16_9";
    case "youtube_thumbnail":
    case "landscape":
      return "landscape_16_9";
    default:
      return "square_hd";
  }
}

export function buildFalInput(params: FalInputParams): Record<string, unknown> {
  const { model, prompt, inputs, selectedFormat } = params;

  switch (model.id) {
    case "fal_flux_schnell":
      return {
        prompt: prompt?.trim() ?? "",
        image_size: imageSize(selectedFormat),
      };

    case "fal_kling_v3_t2v":
    case "fal_seedance_2_t2v":
      return {
        prompt: prompt?.trim() ?? "",
        aspect_ratio: aspectRatio(selectedFormat),
        duration: inputs?.duration ?? 5,
      };

    case "fal_kling_v3_i2v":
    case "fal_seedance_2_i2v":
      return {
        prompt: prompt?.trim() ?? "",
        image_url: inputs?.sourceImageUrl,
        aspect_ratio: aspectRatio(selectedFormat),
        duration: inputs?.duration ?? 5,
      };

    case "fal_kling_v3_motion_control":
      return {
        image_url: inputs?.sourceImageUrl,
        video_url: inputs?.sourceVideoUrl,
        prompt:
          prompt?.trim() ??
          "Transfer the motion naturally while preserving the character identity.",
      };

    case "fal_topaz_image_upscale":
      return {
        image_url: inputs?.sourceImageUrl,
      };

    case "fal_topaz_video_upscale":
      return {
        video_url: inputs?.sourceVideoUrl,
      };

    case "fal_sync_lipsync_v2":
    case "fal_sync_lipsync_v3":
      return {
        video_url: inputs?.sourceVideoUrl,
        audio_url: inputs?.sourceAudioUrl,
      };

    default:
      throw new Error("FAL_MODEL_INPUT_BUILDER_NOT_IMPLEMENTED");
  }
}

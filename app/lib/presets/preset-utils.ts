/**
 * Unified preset access for model modes.
 */

import { getModeOutputType } from "@/app/lib/model-modes/mode-copy";
import {
  IMAGE_PRESETS,
  appendImagePresetFragment,
  type ImagePreset,
} from "./image-presets";
import {
  VIDEO_PRESETS,
  appendVideoPresetFragment,
  getPrimaryMotionVideoPresets,
  type VideoPreset,
} from "./video-presets";

export type StudioPreset = ImagePreset | VideoPreset;

export function getPresetsForModelMode(
  modelModeId: string,
  options?: { primaryOnly?: boolean }
): readonly StudioPreset[] {
  const outputType = getModeOutputType(modelModeId);
  if (outputType === "video") {
    return options?.primaryOnly ? getPrimaryMotionVideoPresets() : VIDEO_PRESETS;
  }
  return IMAGE_PRESETS;
}

export function appendPresetFragment(
  prompt: string,
  presetId: string,
  modelModeId: string,
  language: "en" | "de" = "en"
): string {
  const outputType = getModeOutputType(modelModeId);
  if (outputType === "video") {
    return appendVideoPresetFragment(prompt, presetId, language);
  }
  return appendImagePresetFragment(prompt, presetId, language);
}

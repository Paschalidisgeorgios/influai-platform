/**
 * Client-safe Krea model selectors for dashboard tool workspaces.
 * No API keys — metadata only from the central registry.
 */

import type { ModelOption } from "@/lib/dashboard/workspace-types";
import { sanitizeUserFacingEngineText } from "@/lib/dashboard/white-label-engines";
import type { ActiveTool } from "@/lib/dashboard/creative-tool-matrix";
import type { LandingLanguage } from "@/app/components/landing/magnificContent";
import {
  getDefaultKreaImageStudioModel,
  getKreaImageStudioModel,
  KREA_IMAGE_MODELS,
} from "./krea-image-studio-models";
import { isModelPickerSelectable } from "@/lib/dashboard/studio-white/model-availability";
import {
  getDefaultKreaModelForTool,
  getKreaModelById,
  getKreaModelCatalogForTool,
  getKreaModelDescription,
  getKreaModelSelectOptionsForTool,
  type KreaToolKey,
  type ModelAvailability,
} from "./krea-model-registry";

const TOOL_KEY_MAP: Partial<Record<NonNullable<ActiveTool>, KreaToolKey>> = {
  image: "image",
  video: "video",
  enhancer: "enhancer",
  realtime: "realtime",
  edit: "edit",
  lipsync: "lipsync",
  motion_transfer: "motion_transfer",
  "3d_objects": "3d_objects",
  video_restyle: "video_restyle",
  audio: "audio",
  apps: "apps",
  product_photography: "product_photography",
  brand_assets: "brand_assets",
  campaign_builder: "campaign_builder",
  style_profiles: "style_profiles",
  batch_generator: "batch_generator",
  train_lora: "train_lora",
};

export function activeToolToRegistryKey(
  tool: ActiveTool
): KreaToolKey | null {
  if (!tool) return null;
  return TOOL_KEY_MAP[tool] ?? null;
}

function availabilityNote(
  availability: ModelAvailability,
  language: LandingLanguage
): string | null {
  if (availability === "not_configured") {
    return language === "de"
      ? "Diese Engine ist noch nicht vollständig angebunden."
      : "This engine is not fully connected yet.";
  }
  return null;
}

/** Image Studio white-label catalog — hidden omitted; only not_configured disabled. */
export function getImageStudioModelCatalog(
  language: LandingLanguage = "en"
): ModelOption[] {
  const lang = language === "de" ? "de" : "en";

  return KREA_IMAGE_MODELS.filter((entry) => entry.availability !== "hidden").map(
    (entry) => ({
      value: entry.id,
      label: sanitizeUserFacingEngineText(entry.label),
      note: sanitizeUserFacingEngineText(
        [
          lang === "de" ? entry.descriptionDe : entry.descriptionEn,
          entry.isRecommended ? (lang === "de" ? "Empfohlen" : "Recommended") : null,
          availabilityNote(entry.availability, language),
        ]
          .filter(Boolean)
          .join(" · ")
      ),
      disabled: entry.availability === "not_configured",
      availability: entry.availability,
      credits: entry.credits,
    })
  );
}

export function getDefaultImageStudioModelId(): string {
  return getDefaultKreaImageStudioModel().id;
}

export function isImageStudioModelSelectable(modelId: string): boolean {
  const entry = getKreaImageStudioModel(modelId);
  if (!entry) return false;
  return isModelPickerSelectable(entry.availability);
}

export function getImageStudioCredits(modelId: string): number | undefined {
  return getKreaImageStudioModel(modelId)?.credits;
}

export function getModelCatalogForActiveTool(
  tool: ActiveTool,
  language: LandingLanguage = "en"
): ModelOption[] {
  const key = activeToolToRegistryKey(tool);
  if (!key) return [];
  return getModelCatalogForTool(key, language);
}

/** Full catalog — includes not_configured models as disabled options. */
export function getModelCatalogForTool(
  tool: KreaToolKey,
  language: LandingLanguage = "en"
): ModelOption[] {
  const lang = language === "de" ? "de" : "en";

  return getKreaModelCatalogForTool(tool)
    .filter((entry) => entry.availability !== "hidden")
    .map((entry) => ({
    value: entry.id,
    label: sanitizeUserFacingEngineText(entry.label),
    note: sanitizeUserFacingEngineText(
      [
        getKreaModelDescription(entry, lang),
        entry.isRecommended ? (lang === "de" ? "Empfohlen" : "Recommended") : null,
        entry.isPremium ? "Premium" : null,
        availabilityNote(entry.availability, language),
      ]
        .filter(Boolean)
        .join(" · ")
    ),
    disabled: entry.availability === "not_configured",
    availability: entry.availability,
    credits: entry.credits,
  }));
}

export function getModelOptionsForActiveTool(tool: ActiveTool): ModelOption[] {
  const key = activeToolToRegistryKey(tool);
  if (!key) return [];
  return getModelOptionsForTool(key);
}

export function getModelOptionsForTool(tool: KreaToolKey): ModelOption[] {
  return getKreaModelSelectOptionsForTool(tool)
    .filter((opt) => opt.availability !== "hidden")
    .map((opt) => ({
    value: opt.value,
    label: sanitizeUserFacingEngineText(opt.label),
    note: sanitizeUserFacingEngineText(
      [
        opt.note,
        opt.isRecommended ? "Recommended" : null,
        opt.isPremium ? "Premium" : null,
        opt.availability === "not_configured"
          ? "This engine is not fully connected yet."
          : null,
      ]
        .filter(Boolean)
        .join(" · ")
    ),
    disabled: opt.availability === "not_configured",
    availability: opt.availability,
    credits: opt.credits,
  }));
}

export function getDefaultModelIdForActiveTool(tool: ActiveTool): string {
  const key = activeToolToRegistryKey(tool);
  if (!key) return "";
  return getDefaultKreaModelForTool(key)?.id ?? "";
}

export function getDefaultModelIdForTool(tool: KreaToolKey): string {
  return getDefaultKreaModelForTool(tool)?.id ?? "";
}

export function getCreditsForModelId(modelId: string): number | undefined {
  return getImageStudioCredits(modelId) ?? getKreaModelById(modelId)?.credits;
}

export function isModelSelectable(modelId: string, tool: ActiveTool): boolean {
  if (tool === "image" && getKreaImageStudioModel(modelId)) {
    return isImageStudioModelSelectable(modelId);
  }
  const key = activeToolToRegistryKey(tool);
  if (!key) return false;
  const entry = getKreaModelCatalogForTool(key).find((m) => m.id === modelId);
  return entry ? isModelPickerSelectable(entry.availability) : false;
}

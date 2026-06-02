/**
 * Client-safe Krea model selectors for dashboard tool workspaces.
 * No API keys — metadata only from the central registry.
 */

import type { ModelOption } from "@/lib/dashboard/workspace-types";
import { sanitizeUserFacingEngineText } from "@/lib/dashboard/white-label-engines";
import type { ActiveTool } from "@/lib/dashboard/creative-tool-matrix";
import type { LandingLanguage } from "@/app/components/landing/magnificContent";
import {
  getKreaImageStudioModel,
  KREA_IMAGE_MODELS,
} from "./krea-image-studio-models";
import { isModelPickerSelectable } from "@/lib/dashboard/studio-white/model-availability";
import {
  filterModelOptionsToLaunchActive,
  getDefaultLaunchImageStudioId,
  getDefaultLaunchVideoEngineId,
  getLaunchCreditsForPickerValue,
  isLaunchActivePickerValue,
} from "@/lib/dashboard/launch-engine-picker";
import {
  getDefaultEngineModelForTool,
  getEngineModelById,
  getEngineModelCatalogForTool,
  getEngineModelDescription,
  isEnginePlanLimitedModel,
  kreaPlanLimitUserMessage,
  type EngineModelConfig,
  type EngineToolKey,
  type EngineAvailability,
} from "./model-registry";
import {
  getDefaultKreaModelForTool,
  getKreaModelById,
  getKreaModelDescription,
  getKreaModelSelectOptionsForTool,
  getKreaMotionTransferModels,
  type KreaToolKey,
} from "./krea-model-registry";

const TOOL_KEY_MAP: Partial<Record<NonNullable<ActiveTool>, EngineToolKey>> = {
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
): EngineToolKey | null {
  if (!tool) return null;
  return TOOL_KEY_MAP[tool] ?? null;
}

function availabilityNote(
  availability: EngineAvailability,
  language: LandingLanguage
): string | null {
  if (availability === "not_configured") {
    return language === "de" ? "Demnächst verfügbar." : "Coming soon.";
  }
  return null;
}

/** Image Studio white-label catalog — hidden omitted; only not_configured disabled. */
export function getImageStudioModelCatalog(
  language: LandingLanguage = "en"
): ModelOption[] {
  const lang = language === "de" ? "de" : "en";

  return filterModelOptionsToLaunchActive(
    KREA_IMAGE_MODELS.filter(
      (entry) =>
        entry.availability !== "hidden" && isLaunchActivePickerValue(entry.id)
    ).map((entry) => ({
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
      credits: getLaunchCreditsForPickerValue(entry.id) ?? entry.credits,
      isRecommended: entry.isRecommended === true,
    }))
  );
}

export function getDefaultImageStudioModelId(): string {
  return getDefaultLaunchImageStudioId();
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
  tool: EngineToolKey,
  language: LandingLanguage = "en"
): ModelOption[] {
  const lang = language === "de" ? "de" : "en";

  return filterModelOptionsToLaunchActive(
    getEngineModelCatalogForTool(tool)
      .filter((entry) => entry.availability !== "hidden")
      .map((entry) => ({
        value: entry.id,
        label: sanitizeUserFacingEngineText(entry.label),
        note: sanitizeUserFacingEngineText(
          [
            getEngineModelDescription(entry, lang),
            entry.isRecommended ? (lang === "de" ? "Empfohlen" : "Recommended") : null,
            entry.isPremium ? "Premium" : null,
          ]
            .filter(Boolean)
            .join(" · ")
        ),
        disabled: false,
        availability: entry.availability,
        credits: getLaunchCreditsForPickerValue(entry.id) ?? entry.credits,
        isRecommended: entry.isRecommended,
      }))
  );
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
          ? "Coming soon."
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
  return getDefaultModelIdForTool(key);
}

export function getDefaultModelIdForTool(tool: EngineToolKey): string {
  if (tool === "video") return getDefaultLaunchVideoEngineId();
  if (tool === "image") return getDefaultLaunchImageStudioId();
  return getDefaultEngineModelForTool(tool)?.id ?? "";
}

export function getCreditsForModelId(modelId: string): number | undefined {
  return getImageStudioCredits(modelId) ?? getEngineModelById(modelId)?.credits;
}

export function getMotionTransferModelCatalog(
  language: LandingLanguage = "en"
): ModelOption[] {
  return getModelCatalogForTool("motion_transfer", language);
}

export function getDefaultMotionTransferModelId(): string {
  return getDefaultEngineModelForTool("motion_transfer")?.id ?? "";
}

export function getMotionTransferCredits(modelId: string): number | undefined {
  return getEngineModelById(modelId)?.credits;
}

export function isMotionTransferModelSelectable(modelId: string): boolean {
  const entry = getEngineModelById(modelId);
  if (!entry) return false;
  return isModelPickerSelectable(entry.availability);
}

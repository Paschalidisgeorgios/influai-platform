/**
 * Gallery asset → next workflow execution (provider-safe).
 */

import { getDefaultModelModeIdForAction } from "@/app/lib/model-modes/get-visible-model-modes";
import type { ActionId } from "@/app/lib/actions/types";
import type { GalleryAssetRow } from "@/app/components/gallery/GalleryAssetCard";
import {
  handleGenerateForTool,
  type ToolGenerateResult,
} from "@/lib/dashboard/tool-generate";
import type { ActiveTool } from "@/lib/dashboard/creative-tool-matrix";

const DEFAULT_PROMPTS: Partial<Record<ActionId, { en: string; de: string }>> = {
  animate_image: {
    en: "Subtle cinematic motion, social-ready pacing.",
    de: "Dezente cineastische Bewegung, social-ready Tempo.",
  },
  enhance_asset: {
    en: "Enhance clarity, sharpness and export quality.",
    de: "Klarheit, Schärfe und Export-Qualität verbessern.",
  },
  edit_image: {
    en: "Refine lighting, background and composition for social ads.",
    de: "Licht, Hintergrund und Komposition für Social Ads verfeinern.",
  },
  match_style: {
    en: "Match the color mood and visual style of this reference.",
    de: "Farbstimmung und visuellen Stil dieser Referenz anpassen.",
  },
  use_reference_image: {
    en: "Create a new asset guided by this reference look.",
    de: "Neues Asset im Stil dieser Referenz erstellen.",
  },
};

function promptForAsset(
  asset: GalleryAssetRow,
  actionId: ActionId,
  language: "en" | "de"
): string {
  const trimmed = asset.prompt?.trim();
  if (trimmed) return trimmed;
  const fallback = DEFAULT_PROMPTS[actionId];
  if (!fallback) return language === "de" ? "Creator-Asset" : "Creator asset";
  return language === "de" ? fallback.de : fallback.en;
}

function toolKeyForAction(actionId: ActionId): ActiveTool {
  if (actionId === "animate_image") return "video";
  if (actionId === "enhance_asset") return "enhancer";
  if (actionId === "edit_image" || actionId === "match_style") return "edit";
  return "image";
}

export async function runGalleryAssetWorkflow(input: {
  asset: GalleryAssetRow;
  actionId: ActionId;
  token: string;
  language: "en" | "de";
}): Promise<ToolGenerateResult> {
  const { asset, actionId, token, language } = input;
  const sourceUrl = asset.image_url?.trim();
  if (!sourceUrl) {
    return {
      success: false,
      error:
        language === "de"
          ? "Für diesen Workflow wird ein Bild-Asset benötigt."
          : "An image asset is required for this workflow.",
    };
  }

  const prompt = promptForAsset(asset, actionId, language);
  const modelModeId = getDefaultModelModeIdForAction(actionId);

  return handleGenerateForTool({
    toolKey: toolKeyForAction(actionId),
    token,
    actionId,
    modelModeId,
    prompt,
    sourceImageUrl: sourceUrl,
    editInstruction:
      actionId === "edit_image" || actionId === "match_style"
        ? prompt
        : undefined,
    motionInstruction:
      actionId === "animate_image" ? prompt : undefined,
    currentLanguage: language,
  });
}

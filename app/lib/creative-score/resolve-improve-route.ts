/**
 * Creative Score — safe "Improve this asset" routing.
 * Never runs unvalidated generation tools; falls back to prompt preview.
 */

import {
  getCreatorToolById,
  isCreatorToolProviderValidated,
  resolveCreatorToolCreditCost,
} from "@/app/lib/tools/creator-tools";
import { isCreatorToolRunnable } from "@/app/lib/tools/resolve-tool";
import type { AccessTier } from "@/app/lib/model-modes/types";

export type CreativeScoreImproveInput = {
  improvedPrompt?: string;
  improvements: string[];
};

export type CreativeScoreImproveRoute =
  | {
      mode: "image_variant";
      creditCost: number;
      canRun: boolean;
    }
  | {
      mode: "prompt_preview";
    };

export function buildImprovedPromptFromScore(
  score: CreativeScoreImproveInput,
  basePrompt: string
): string {
  if (score.improvedPrompt?.trim()) return score.improvedPrompt.trim();

  const guidance =
    score.improvements.slice(0, 3).join(". ") ||
    "Stronger hook, clearer subject focus, mobile-friendly composition, ad-ready lighting.";

  const trimmed = basePrompt.trim();
  if (!trimmed) return guidance;
  return `${trimmed}. ${guidance}`;
}

export function resolveCreativeScoreImproveRoute(input: {
  outputType: "image" | "video";
  userPlan?: AccessTier | string | null;
}): CreativeScoreImproveRoute {
  if (input.outputType !== "image") {
    return { mode: "prompt_preview" };
  }

  const variantTool = getCreatorToolById("create_style_variant");
  if (!variantTool) {
    return { mode: "prompt_preview" };
  }

  const providerValidated = isCreatorToolProviderValidated(variantTool);
  const canRun = isCreatorToolRunnable("create_style_variant", {
    userPlan: input.userPlan,
  });

  if (!providerValidated || !canRun) {
    return { mode: "prompt_preview" };
  }

  const creditCost = resolveCreatorToolCreditCost(variantTool);

  return {
    mode: "image_variant",
    creditCost,
    canRun: true,
  };
}

export function getCreativeScoreImproveButtonLabel(
  route: CreativeScoreImproveRoute,
  language: "en" | "de"
): string {
  const copy =
    language === "de"
      ? {
          improve: (credits: number) =>
            credits === 1
              ? `Asset verbessern · ${credits} Credit`
              : `Asset verbessern · ${credits} Credits`,
          preview: "Verbesserung ansehen",
        }
      : {
          improve: (credits: number) =>
            credits === 1
              ? `Improve this asset · ${credits} Credit`
              : `Improve this asset · ${credits} Credits`,
          preview: "Preview improvement",
        };

  if (route.mode === "image_variant" && route.canRun) {
    return copy.improve(route.creditCost);
  }
  return copy.preview;
}

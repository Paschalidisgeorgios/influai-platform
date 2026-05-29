/**
 * Client-safe Krea model selectors for dashboard tool workspaces.
 * No API keys — metadata only from the central registry.
 */

import type { ModelOption } from "@/app/dashboard/components/studio/ToolWorkspace";
import { sanitizeUserFacingEngineText } from "@/lib/dashboard/white-label-engines";
import type { ActiveTool } from "@/lib/dashboard/creative-tool-matrix";
import {
  getDefaultKreaModelForTool,
  getKreaModelSelectOptionsForTool,
  type InfluExAiToolKey,
} from "./krea-model-registry";

const TOOL_KEY_MAP: Partial<Record<NonNullable<ActiveTool>, InfluExAiToolKey>> = {
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
};

export function activeToolToRegistryKey(
  tool: ActiveTool
): InfluExAiToolKey | null {
  if (!tool) return null;
  return TOOL_KEY_MAP[tool] ?? null;
}

export function getModelOptionsForActiveTool(tool: ActiveTool): ModelOption[] {
  const key = activeToolToRegistryKey(tool);
  if (!key) return [];
  return getModelOptionsForTool(key);
}

export function getModelOptionsForTool(tool: InfluExAiToolKey): ModelOption[] {
  return getKreaModelSelectOptionsForTool(tool).map((opt) => ({
    value: opt.value,
    label: sanitizeUserFacingEngineText(opt.label),
    note: sanitizeUserFacingEngineText(
      [
        opt.note,
        opt.isRecommended ? "Recommended" : null,
        opt.isPremium ? "Premium" : null,
        opt.availability === "experimental" ? "Preview" : null,
      ]
        .filter(Boolean)
        .join(" · ")
    ),
  }));
}

export function getDefaultModelIdForActiveTool(tool: ActiveTool): string {
  const key = activeToolToRegistryKey(tool);
  if (!key) return "";
  return getDefaultKreaModelForTool(key)?.id ?? "";
}

export function getDefaultModelIdForTool(tool: InfluExAiToolKey): string {
  return getDefaultKreaModelForTool(tool)?.id ?? "";
}

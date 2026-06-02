/**
 * Creator Toolbox → in-page workflow routing (Create page only).
 * No provider routes — maps live tools to existing safe UI panels.
 */

import { isLaunchFeatureEnabled } from "@/app/lib/config/launch";
import type { ObsidianEngineId } from "@/lib/obsidian/dashboard-tokens";
import {
  getCreatorToolById,
  type CreatorToolId,
} from "./creator-tools";
import { isCreatorToolLaunchGateOpen } from "./launch-tool-gate";
import { toolHasRunnableHandler } from "./tool-handler-registry";

export type ToolboxWorkflowRoute =
  | {
      kind: "engine";
      engineId: ObsidianEngineId;
      panelId?: string;
    }
  | {
      kind: "creative_score";
      panelId: "creator-canvas";
    };

const ROUTES: Partial<Record<CreatorToolId, ToolboxWorkflowRoute>> = {
  social_asset_pack: {
    kind: "engine",
    engineId: "social-asset-pack",
    panelId: "social-asset-pack-panel",
  },
  create_image: {
    kind: "engine",
    engineId: "create-image",
    panelId: "create-prompt",
  },
  create_video: {
    kind: "engine",
    engineId: "create-video",
    panelId: "create-prompt",
  },
  hooks_captions: {
    kind: "engine",
    engineId: "hooks-captions",
    panelId: "hooks-captions-panel",
  },
  export_pack: {
    kind: "engine",
    engineId: "export-pack",
    panelId: "export-pack-panel",
  },
  check_creative_score: {
    kind: "creative_score",
    panelId: "creator-canvas",
  },
};

export const TOOLBOX_ASSET_REQUIRED_COPY: Partial<
  Record<CreatorToolId, { en: string; de: string }>
> = {
  check_creative_score: {
    en: "Generate or select an asset on the canvas first, then open Creative Score to review hook clarity, contrast, and social readiness.",
    de: "Erstelle oder wähle zuerst ein Asset auf der Canvas, dann öffne Creative Score für Hook-Klarheit, Kontrast und Social-Tauglichkeit.",
  },
};

/** Tools the Creator Toolbox routes on the Create page (not href-only tools). */
export function isToolboxRoutedTool(toolId: CreatorToolId): boolean {
  return toolId in ROUTES;
}

/** Whether the tool has a wired in-page workflow on the Create page. */
export function hasSafeToolboxWorkflow(toolId: CreatorToolId): boolean {
  return getToolboxWorkflowRoute(toolId) != null;
}

export function getToolboxWorkflowRoute(
  toolId: CreatorToolId
): ToolboxWorkflowRoute | null {
  const tool = getCreatorToolById(toolId);
  if (!tool) return null;

  const route = ROUTES[toolId];
  if (!route) return null;

  if (!isCreatorToolLaunchGateOpen(tool)) return null;

  if (toolId === "check_creative_score") {
    return isLaunchFeatureEnabled("enableCreativeScore") ? route : null;
  }

  if (toolId === "hooks_captions") {
    return isLaunchFeatureEnabled("enableSocialAssetPack") ? route : null;
  }

  if (toolId === "export_pack") {
    return isLaunchFeatureEnabled("enableGallery") ? route : null;
  }

  if (tool.callsProvider && !toolHasRunnableHandler(toolId)) {
    return null;
  }

  return route;
}

export function scrollToToolboxPanel(panelId: string): void {
  document.getElementById(panelId)?.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
}

/**
 * Creative suite navigation — Krea-only active tools from creative-tool-matrix.
 */

import {
  CREATIVE_TOOL_MATRIX,
  PRIMARY_NAV_MATRIX,
  getCommandBarBadgePills,
  getEngineMatrixTools,
  getMatrixEntry,
  getOptionalMatrixTools,
  isToolActive,
  pathnameToMatrixTool,
  type ActiveTool,
  type CreativeToolMatrixEntry,
  type ImageModeKey,
  type ImplementationType,
  type OutputType,
  type ToolCategory,
  type WorkspaceKind,
} from "./creative-tool-matrix";

export type {
  ActiveTool,
  CreativeToolMatrixEntry,
  ImageModeKey,
  ImplementationType,
  OutputType,
  ToolCategory,
  WorkspaceKind,
};

/** @deprecated Use matrix directly — always "active". */
export type ToolStatus = "active";
export type ToolNavSection = "primary" | "engines" | "optional";

export type ToolDefinition = CreativeToolMatrixEntry & {
  section: ToolNavSection;
  status: ToolStatus;
  workspace?: "image" | "video" | "lip_sync";
};

function toLegacyWorkspace(
  kind: WorkspaceKind
): "image" | "video" | "lip_sync" | undefined {
  if (kind === "studio_image") return "image";
  if (kind === "studio_video") return "video";
  if (kind === "studio_lip_sync") return "lip_sync";
  return undefined;
}

function toToolDefinition(entry: CreativeToolMatrixEntry): ToolDefinition {
  return {
    ...entry,
    section: entry.category === "optional" ? "optional" : "engines",
    status: "active",
    workspace: toLegacyWorkspace(entry.workspaceKind),
  };
}

export const PRIMARY_NAV_ITEMS = PRIMARY_NAV_MATRIX.map((item) => ({
  ...item,
  status: "active" as ToolStatus,
}));

export function getAllTools(): ToolDefinition[] {
  return CREATIVE_TOOL_MATRIX.map(toToolDefinition);
}

export function getCreationEngineTools(): ToolDefinition[] {
  return getEngineMatrixTools().map(toToolDefinition);
}

export function getOptionalTools(): ToolDefinition[] {
  return getOptionalMatrixTools().map(toToolDefinition);
}

export function getToolByKey(key: ActiveTool): ToolDefinition | null {
  const entry = getMatrixEntry(key);
  if (!entry) return null;
  return toToolDefinition(entry);
}

export { isToolActive, getCommandBarBadgePills };

export function pathnameToActiveTool(pathname: string): ActiveTool {
  return pathnameToMatrixTool(pathname);
}

export {
  CREATIVE_TOOL_MATRIX,
  getMatrixEntry,
  getAllMatrixTools,
} from "./creative-tool-matrix";

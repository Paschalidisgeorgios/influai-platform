import { getCreatorToolById, getCreatorToolLabel } from "@/app/lib/tools/creator-tools";
import type { ModelMode } from "./types";

/** User-facing mode label — German workflow names from creator-tools when applicable. */
export function getModelModeDisplayLabel(
  mode: Pick<ModelMode, "label" | "actionId">,
  language: "en" | "de" = "en"
): string {
  if (language !== "de") return mode.label;

  const tool = getCreatorToolById(mode.actionId);
  if (tool && tool.labelEn === mode.label) {
    return getCreatorToolLabel(tool, "de");
  }

  return mode.label;
}

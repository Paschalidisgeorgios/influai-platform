/**
 * Unified model catalog for dashboard pickers — Krea + fal.ai engines.
 */

import type { ModelOption } from "@/lib/dashboard/workspace-types";
import type { EngineModelConfig, EngineToolKey } from "@/lib/ai/model-registry";
import {
  getEngineModelById,
  getEngineModelCatalogForTool,
  getEngineModelDescription,
  getEngineModelRegistry,
  isEngineModelExecutable,
  isEnginePlanLimitedModel,
  kreaPlanLimitUserMessage,
} from "@/lib/ai/model-registry";
import { sanitizeUserFacingEngineText } from "@/lib/dashboard/white-label-engines";

export type EnginePickerCategoryTab =
  | "recommended"
  | "image"
  | "video"
  | "edit"
  | "enhancer"
  | "motion"
  | "lipsync"
  | "3d"
  | "training"
  | "not_connected"
  | "all";

const TAB_TO_REGISTRY_CATEGORY: Partial<
  Record<EnginePickerCategoryTab, EngineModelConfig["category"] | EngineModelConfig["category"][]>
> = {
  image: "image",
  video: "video",
  edit: "edit",
  enhancer: "enhancer",
  motion: ["motion_transfer", "video_restyle"],
  lipsync: "lipsync",
  "3d": "3d",
  training: ["training", "workflow"],
};

export function registryEntryToModelOption(
  entry: EngineModelConfig,
  language: "de" | "en"
): ModelOption {
  const lang = language === "de" ? "de" : "en";
  const failed = entry.availability === "failed_validation";
  const planLimited = isEnginePlanLimitedModel(entry);
  const includeAdminHints = false;
  return {
    value: entry.id,
    label: sanitizeUserFacingEngineText(entry.label),
    note: sanitizeUserFacingEngineText(
      [
        getEngineModelDescription(entry, lang),
        planLimited && includeAdminHints
          ? kreaPlanLimitUserMessage(lang)
          : null,
        failed && includeAdminHints
          ? lang === "de"
            ? "Validierung fehlgeschlagen — Engine deaktiviert."
            : "Validation failed — engine disabled."
          : null,
      ]
        .filter(Boolean)
        .join(" · ")
    ),
    disabled:
      entry.availability === "not_configured" || failed || !isEngineModelExecutable(entry),
    credits: entry.credits,
    isRecommended: entry.isRecommended,
    availability: entry.availability,
  };
}

export function getEnginePickerCatalog(options: {
  tool?: EngineToolKey;
  language?: "de" | "en";
  includeUnavailable?: boolean;
}): ModelOption[] {
  const lang = options.language === "de" ? "de" : "en";
  const entries = options.tool
    ? getEngineModelCatalogForTool(options.tool)
    : [...getEngineModelRegistry()].filter((e) => e.availability !== "hidden");

  return entries
    .filter((e) => options.includeUnavailable || e.availability !== "hidden")
    .map((e) => registryEntryToModelOption(e, lang));
}

/** @deprecated Use getEnginePickerCatalog */
export const getKreaPickerCatalog = getEnginePickerCatalog;

export function filterPickerCatalog(
  catalog: ModelOption[],
  tab: EnginePickerCategoryTab,
  search: string,
  showUnavailable: boolean
): ModelOption[] {
  const q = search.trim().toLowerCase();

  return catalog.filter((item) => {
    const entry = getEngineModelById(item.value);
    if (!entry) return false;

    if (tab === "not_connected") {
      return (
        entry.availability === "not_configured" ||
        entry.availability === "failed_validation"
      );
    }
    if (tab === "recommended" && !entry.isRecommended) return false;
    if (tab !== "all" && tab !== "recommended") {
      const cats = TAB_TO_REGISTRY_CATEGORY[tab as Exclude<EnginePickerCategoryTab, "all" | "recommended" | "not_connected">];
      if (cats) {
        const list = Array.isArray(cats) ? cats : [cats];
        if (!list.includes(entry.category)) return false;
      }
    }
    if (
      !showUnavailable &&
      (entry.availability === "not_configured" ||
        entry.availability === "failed_validation")
    ) {
      return false;
    }

    if (q) {
      const hay = `${item.label} ${item.note ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }

    return true;
  });
}

export function isRegistryModelSelectable(modelId: string): boolean {
  const entry = getEngineModelById(modelId);
  if (!entry) return false;
  return isEngineModelExecutable(entry);
}

export const PICKER_CATEGORY_TABS: {
  id: EnginePickerCategoryTab;
  labelDe: string;
  labelEn: string;
}[] = [
  { id: "recommended", labelDe: "Empfohlen", labelEn: "Recommended" },
  { id: "all", labelDe: "Alle", labelEn: "All" },
  { id: "image", labelDe: "Bild", labelEn: "Image" },
  { id: "video", labelDe: "Video", labelEn: "Video" },
  { id: "edit", labelDe: "Edit", labelEn: "Edit" },
  { id: "enhancer", labelDe: "Enhance", labelEn: "Enhance" },
  { id: "motion", labelDe: "Motion", labelEn: "Motion" },
  { id: "lipsync", labelDe: "Lipsync", labelEn: "Lipsync" },
  { id: "3d", labelDe: "3D", labelEn: "3D" },
  { id: "training", labelDe: "Training", labelEn: "Training" },
  { id: "not_connected", labelDe: "Nicht angebunden", labelEn: "Not connected" },
];

export type KreaPickerCategoryTab = EnginePickerCategoryTab;

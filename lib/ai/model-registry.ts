/**
 * InfluExAi — unified multi-provider engine registry (Krea + fal.ai).
 * Krea image generation remains primary; fal covers blocked Krea tools.
 */

import {
  getKreaModelById,
  getKreaModelCatalogForTool,
  getKreaModelDescription,
  getKreaModelRegistry,
  getKreaRequiredInputs,
  isKreaModelExecutable,
  isKreaPlanLimitedModel,
  kreaPlanLimitUserMessage,
  TOOL_DEFAULT_KREA_MODEL_ID,
  type KreaModelCategory,
  type KreaModelConfig,
  type KreaToolKey,
  type ModelAvailability,
} from "./krea-model-registry";
import {
  FAL_MODEL_REGISTRY_ENTRIES,
  FAL_TOOL_DEFAULT_MODEL_ID,
} from "./fal-model-registry";
import { isFalProviderEnabled } from "@/lib/providers/flags";

export type AIProvider = "krea" | "fal";

export type EngineCategory =
  | "image"
  | "video"
  | "edit"
  | "enhancer"
  | "realtime"
  | "lipsync"
  | "motion_transfer"
  | "video_restyle"
  | "3d"
  | "audio"
  | "training"
  | "workflow";

export type EngineToolKey = KreaToolKey;

export type EngineAvailability = ModelAvailability;

export type EngineRequiredInput =
  | "prompt"
  | "sourceImageUrl"
  | "sourceVideoUrl"
  | "sourceAudioUrl"
  | "referenceImageUrl"
  | "scriptText"
  | "trainingImages";

export type EngineOutputType =
  | "image"
  | "video"
  | "audio"
  | "text"
  | "mesh"
  | "style";

export type EngineModelConfig = {
  id: string;
  label: string;
  provider: AIProvider;
  /** Krea API path or fal endpoint id */
  providerModel: string;
  category: EngineCategory;
  tools: EngineToolKey[];
  capabilities: string[];
  requiredInputs: EngineRequiredInput[];
  outputType: EngineOutputType;
  credits: number;
  availability: EngineAvailability;
  descriptionEn: string;
  descriptionDe: string;
  isRecommended?: boolean;
  isPremium?: boolean;
  /** Krea registry ids this fal engine replaces when plan-limited */
  replacesBlockedKreaModelIds?: string[];
  validation?: {
    lastStatus?: "passed" | "failed" | "skipped";
    lastCheckedAt?: string;
    lastErrorCode?: string;
    notes?: string;
  };
};

function mapKreaCategory(category: KreaModelCategory): EngineCategory {
  if (category === "3d") return "3d";
  if (category === "style_training") return "training";
  return category as EngineCategory;
}

function mapKreaOutputType(
  outputType: KreaModelConfig["outputType"]
): EngineOutputType {
  if (outputType === "model") return "style";
  return outputType;
}

export function kreaConfigToEngine(entry: KreaModelConfig): EngineModelConfig {
  return {
    id: entry.id,
    label: entry.label,
    provider: "krea",
    providerModel: entry.internalModel ?? entry.model ?? "",
    category: mapKreaCategory(entry.category),
    tools: [...entry.tools],
    capabilities: [...entry.capabilities],
    requiredInputs: getKreaRequiredInputs(entry),
    outputType: mapKreaOutputType(entry.outputType),
    credits: entry.credits,
    availability: entry.availability,
    descriptionEn: entry.descriptionEn,
    descriptionDe: entry.descriptionDe,
    isRecommended: entry.isRecommended,
    isPremium: entry.isPremium,
    validation: entry.validation,
  };
}

const ENGINE_REGISTRY: EngineModelConfig[] = [
  ...getKreaModelRegistry().map(kreaConfigToEngine),
  ...FAL_MODEL_REGISTRY_ENTRIES,
];

const ENGINE_BY_ID = new Map<string, EngineModelConfig>(
  ENGINE_REGISTRY.map((entry) => [entry.id, entry])
);

export function getEngineModelRegistry(): readonly EngineModelConfig[] {
  return ENGINE_REGISTRY;
}

export function getEngineModelById(id: string): EngineModelConfig | undefined {
  return ENGINE_BY_ID.get(id.trim());
}

export function getEngineModelDescription(
  entry: EngineModelConfig,
  language: "en" | "de" = "en"
): string {
  if (entry.provider === "krea") {
    const krea = getKreaModelById(entry.id);
    if (krea) return getKreaModelDescription(krea, language);
  }
  return language === "de" ? entry.descriptionDe : entry.descriptionEn;
}

export function isEngineModelExecutable(entry: EngineModelConfig): boolean {
  if (
    entry.availability === "failed_validation" ||
    entry.availability === "not_configured" ||
    entry.availability === "hidden"
  ) {
    return false;
  }
  if (entry.provider === "fal" && !isFalProviderEnabled()) {
    return false;
  }
  if (entry.provider === "krea") {
    const krea = getKreaModelById(entry.id);
    if (!krea) return false;
    return isKreaModelExecutable(krea);
  }
  return (
    entry.availability === "active" || entry.availability === "experimental"
  );
}

export function isEnginePlanLimitedModel(entry: EngineModelConfig): boolean {
  if (entry.provider !== "krea") return false;
  const krea = getKreaModelById(entry.id);
  return krea ? isKreaPlanLimitedModel(krea) : false;
}

export { kreaPlanLimitUserMessage };

export type GetEngineModelsOptions = {
  includeUnavailable?: boolean;
  selectableOnly?: boolean;
  /** Prefer fal models when Krea equivalents are plan-limited */
  preferFal?: boolean;
};

function isKreaShadowedByFal(kreaEntry: EngineModelConfig): boolean {
  if (!isFalProviderEnabled() || kreaEntry.provider !== "krea") return false;
  if (kreaEntry.availability !== "failed_validation") return false;
  return FAL_MODEL_REGISTRY_ENTRIES.some(
    (fal) =>
      fal.replacesBlockedKreaModelIds?.includes(kreaEntry.id) &&
      (fal.availability === "active" || fal.availability === "experimental")
  );
}

export function getEngineModelsForTool(
  tool: EngineToolKey,
  options: GetEngineModelsOptions = {}
): EngineModelConfig[] {
  const {
    includeUnavailable = false,
    selectableOnly = true,
    preferFal = isFalProviderEnabled(),
  } = options;

  const kreaEntries = getKreaModelCatalogForTool(tool).map(kreaConfigToEngine);
  const falEntries = FAL_MODEL_REGISTRY_ENTRIES.filter((entry) =>
    entry.tools.includes(tool)
  );

  let combined: EngineModelConfig[];

  if (preferFal && isFalProviderEnabled()) {
    combined = [...falEntries, ...kreaEntries];
  } else {
    combined = [...kreaEntries, ...falEntries];
  }

  const seen = new Set<string>();
  combined = combined.filter((entry) => {
    if (seen.has(entry.id)) return false;
    seen.add(entry.id);
    return true;
  });

  return combined
    .filter((entry) => {
      if (entry.availability === "hidden") return false;
      if (isKreaShadowedByFal(entry)) return false;
      if (selectableOnly && !includeUnavailable) {
        return isEngineModelExecutable(entry);
      }
      if (!includeUnavailable && entry.availability === "not_configured") {
        return false;
      }
      return true;
    })
    .sort(sortEngineModelsForDisplay);
}

export function getEngineModelCatalogForTool(
  tool: EngineToolKey
): EngineModelConfig[] {
  return getEngineModelsForTool(tool, {
    includeUnavailable: true,
    selectableOnly: false,
    preferFal: isFalProviderEnabled(),
  });
}

export function getDefaultEngineModelForTool(
  tool: EngineToolKey
): EngineModelConfig | undefined {
  if (isFalProviderEnabled()) {
    const falDefaultId = FAL_TOOL_DEFAULT_MODEL_ID[tool];
    if (falDefaultId) {
      const falDefault = getEngineModelById(falDefaultId);
      if (falDefault && isEngineModelExecutable(falDefault)) {
        return falDefault;
      }
    }
  }

  const kreaDefaultId = TOOL_DEFAULT_KREA_MODEL_ID[tool];
  if (kreaDefaultId) {
    const kreaDefault = getEngineModelById(kreaDefaultId);
    if (kreaDefault && isEngineModelExecutable(kreaDefault)) {
      return kreaDefault;
    }
  }

  return getEngineModelsForTool(tool, { selectableOnly: true })[0];
}

function sortEngineModelsForDisplay(
  a: EngineModelConfig,
  b: EngineModelConfig
): number {
  if (a.isRecommended !== b.isRecommended) {
    return a.isRecommended ? -1 : 1;
  }
  if (a.provider !== b.provider) {
    if (a.provider === "fal" && isFalProviderEnabled()) return -1;
    if (b.provider === "fal" && isFalProviderEnabled()) return 1;
  }
  const order: EngineAvailability[] = [
    "active",
    "experimental",
    "failed_validation",
    "not_configured",
    "hidden",
  ];
  return order.indexOf(a.availability) - order.indexOf(b.availability);
}

export function resolveEngineStoredModelId(entry: EngineModelConfig): string {
  if (entry.provider === "fal") {
    return `fal/${entry.providerModel}`;
  }
  return entry.providerModel.startsWith("krea/")
    ? entry.providerModel
    : `krea/${entry.providerModel}`;
}

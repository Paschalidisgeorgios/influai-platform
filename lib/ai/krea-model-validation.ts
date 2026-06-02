/**
 * Server-side Krea model validation — dry run + limited live image tests.
 * Dev/admin only; never import from client components.
 */

import {
  getKreaImageStudioModel,
  KREA_IMAGE_MODELS,
  SMART_AUTO_PILOT_STUDIO_ID,
} from "./krea-image-studio-models";
import {
  getKreaInternalModel,
  getKreaModelById,
  getKreaModelRegistry,
  getKreaMotionTransferModels,
  isExecutableModelPath,
  isKreaModelExecutable,
  isKreaPlanLimitedModel,
  isKreaTrainingApiPath,
  isPendingRegistryModelPath,
  isKreaTrainingModel,
  resolveKreaInternalModel,
  resolveKreaModelId,
  type KreaModelCategory,
  type KreaModelConfig,
  type KreaToolKey,
  type ModelAvailability,
} from "./krea-model-registry";
import {
  auditRegistryModelPath,
  countOfficialCatalogStats,
} from "@/lib/krea/krea-official-catalog";
import { generateViaKreaSubscribe } from "@/lib/krea/krea-subscribe-generation";
import { runKreaModel } from "@/lib/krea/krea-generation-router";
import { resolveMotionValidationFixtures, resolvePortraitValidationFixture } from "@/lib/krea/krea-validation-fixtures";

export type ValidationMode = "dry_run" | "live_test";

export type ValidationToolFilter =
  | "image"
  | "video"
  | "edit"
  | "enhancer"
  | "lipsync"
  | "motion_transfer"
  | "video_restyle"
  | "3d_objects"
  | "audio"
  | "train_lora"
  | "style_training";

export type ModelValidationResult = {
  modelId: string;
  label: string;
  internalModel: string | null;
  source: "studio" | "registry";
  status: "passed" | "failed" | "skipped";
  errorCode?: string;
  message?: string;
  warnings: string[];
  hasImageUrl?: boolean;
  imageUrlStart?: string;
};

export type ModelValidationSummary = {
  success: true;
  mode: ValidationMode;
  tool?: ValidationToolFilter;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  tested?: number;
  officialCatalog?: ReturnType<typeof countOfficialCatalogStats>;
  results: ModelValidationResult[];
};

const VALID_AVAILABILITY: ModelAvailability[] = [
  "active",
  "experimental",
  "not_configured",
  "failed_validation",
  "hidden",
];

const VALID_OUTPUT_TYPES = new Set([
  "image",
  "video",
  "audio",
  "text",
  "mesh",
  "style",
  "model",
]);

const LIVE_TEST_NOT_IMPLEMENTED_TOOLS = new Set<ValidationToolFilter>([
  "lipsync",
  "audio",
  "train_lora",
  "style_training",
]);

export const KREA_VALIDATION_TEST_PROMPT =
  "Minimal premium product campaign visual, black background, amber studio light, no readable text, no logo";

const KREA_PLAN_LIMIT_VALIDATION_MESSAGE =
  "Krea returned 402. This model may require a higher API plan.";

function mapKreaLiveTestProviderError(e: unknown): {
  errorCode: string;
  message: string;
} {
  const message = e instanceof Error ? e.message : "Provider call failed";
  const isPlanLimit =
    message.includes("(402)") ||
    /higher plan|plan limit|not available for current plan/i.test(message);
  if (isPlanLimit) {
    return {
      errorCode: "KREA_PLAN_LIMIT",
      message: KREA_PLAN_LIMIT_VALIDATION_MESSAGE,
    };
  }
  return { errorCode: "PROVIDER_FAILED", message: message.slice(0, 400) };
}

type Candidate = {
  modelId: string;
  label: string;
  source: "studio" | "registry";
};

function toolToRegistryKey(tool: ValidationToolFilter): KreaToolKey {
  return tool as KreaToolKey;
}

/** Whether a registry row belongs to the validation tool filter. */
function registryEntryMatchesTool(
  entry: KreaModelConfig,
  tool: ValidationToolFilter
): boolean {
  if (entry.availability === "hidden") return false;

  const registryKey = toolToRegistryKey(tool);

  if (entry.tools.includes(registryKey)) return true;

  switch (tool) {
    case "image":
      return entry.category === "image" || entry.category === "realtime";
    case "video":
      return entry.category === "video";
    case "motion_transfer":
      return entry.category === "motion_transfer";
    case "lipsync":
      return entry.category === "lipsync";
    case "enhancer":
      return entry.category === "enhancer";
    case "edit":
      return entry.category === "edit";
    case "video_restyle":
      return entry.category === "video_restyle";
    case "audio":
      return entry.category === "audio";
    case "3d_objects":
      return entry.category === "3d";
    case "train_lora":
    case "style_training":
      return (
        entry.category === "training" ||
        entry.category === "style_training" ||
        entry.tools.includes(tool)
      );
    default:
      return entry.category === (registryKey as KreaModelCategory);
  }
}

function collectRegistryCandidatesForTool(tool: ValidationToolFilter): Candidate[] {
  if (tool === "motion_transfer") {
    return getKreaMotionTransferModels({
      includeUnavailable: true,
      selectableOnly: false,
    }).map((entry) => ({
      modelId: entry.id,
      label: entry.label,
      source: "registry" as const,
    }));
  }

  const out: Candidate[] = [];
  for (const entry of getKreaModelRegistry()) {
    if (!registryEntryMatchesTool(entry, tool)) continue;
    out.push({ modelId: entry.id, label: entry.label, source: "registry" });
  }
  return out;
}

function collectCandidates(
  tool?: ValidationToolFilter,
  modelIds?: string[]
): Candidate[] {
  const seen = new Set<string>();
  const out: Candidate[] = [];

  const add = (c: Candidate) => {
    if (seen.has(c.modelId)) return;
    seen.add(c.modelId);
    out.push(c);
  };

  if (modelIds?.length) {
    for (const rawId of modelIds) {
      const id = resolveKreaModelId(rawId);
      const studio = getKreaImageStudioModel(id);
      if (studio) {
        add({ modelId: studio.id, label: studio.label, source: "studio" });
        continue;
      }
      const entry = getKreaModelById(id);
      if (entry) {
        add({ modelId: entry.id, label: entry.label, source: "registry" });
      } else {
        add({ modelId: id, label: rawId, source: "registry" });
      }
    }
    return out;
  }

  if (!tool) {
    for (const studio of KREA_IMAGE_MODELS) {
      if (studio.availability !== "hidden") {
        add({ modelId: studio.id, label: studio.label, source: "studio" });
      }
    }
    for (const entry of getKreaModelRegistry()) {
      if (entry.availability === "hidden") continue;
      add({ modelId: entry.id, label: entry.label, source: "registry" });
    }
    return out;
  }

  if (tool === "image") {
    for (const studio of KREA_IMAGE_MODELS) {
      if (studio.availability !== "hidden") {
        add({ modelId: studio.id, label: studio.label, source: "studio" });
      }
    }
    return out;
  }

  for (const candidate of collectRegistryCandidatesForTool(tool)) {
    add(candidate);
  }

  return out;
}

/** Resolved candidate list for a validation request (exported for admin route / tests). */
export function collectValidationCandidates(
  tool?: ValidationToolFilter,
  modelIds?: string[]
): Candidate[] {
  return collectCandidates(tool, modelIds);
}

const VALIDATION_TOOL_FILTERS = new Set<ValidationToolFilter>([
  "image",
  "video",
  "edit",
  "enhancer",
  "lipsync",
  "motion_transfer",
  "video_restyle",
  "3d_objects",
  "audio",
  "train_lora",
  "style_training",
]);

export function parseValidationToolFilter(
  value: unknown
): ValidationToolFilter | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim() as ValidationToolFilter;
  return VALIDATION_TOOL_FILTERS.has(trimmed) ? trimmed : undefined;
}

function dryRunRegistryEntry(entry: KreaModelConfig): ModelValidationResult {
  const warnings: string[] = [];
  const internalModel = getKreaInternalModel(entry);
  let errorCode: string | undefined;

  if (
    entry.availability === "not_configured" ||
    isPendingRegistryModelPath(internalModel)
  ) {
    return {
      modelId: entry.id,
      label: entry.label,
      internalModel: internalModel || null,
      source: "registry",
      status: "skipped",
      errorCode: "NOT_EXECUTABLE",
      message: isPendingRegistryModelPath(internalModel)
        ? `Placeholder path "${internalModel}" — awaiting official Krea subscribe path`
        : "Model marked not_configured in registry",
      warnings: [],
    };
  }

  if (!entry.id?.trim()) errorCode = "MISSING_ID";
  else if (!entry.label?.trim()) errorCode = "MISSING_LABEL";
  else if (entry.provider !== "krea") errorCode = "INVALID_PROVIDER";
  else if (!internalModel) errorCode = "MISSING_INTERNAL_MODEL";
  else if (internalModel === "auto") {
    errorCode = "INVALID_INTERNAL_MODEL";
    warnings.push("internalModel auto must be resolved before provider call");
  } else if (internalModel.startsWith("resolver/")) {
    if (entry.id === "smart-auto-pilot" || entry.id === "smart_auto_pilot") {
      try {
        resolveKreaInternalModel(entry.id, "image");
      } catch {
        errorCode = "RESOLVER_REQUIRED";
        warnings.push("Smart Auto-Pilot resolver failed");
      }
    } else {
      warnings.push(`Resolver path "${internalModel}" — resolved at runtime`);
    }
  } else if (isKreaTrainingModel(entry)) {
    if (!isKreaTrainingApiPath(internalModel)) {
      errorCode = "INVALID_INTERNAL_MODEL";
      warnings.push(`Training workflow expects styles/* path, got "${internalModel}"`);
    } else {
      warnings.push(
        "Training workflow — must use /api/krea/train-lora, not /api/krea/image/generate"
      );
      if (!entry.requires?.some((r) => r.includes("reference"))) {
        warnings.push("Training workflows should declare requires: reference_images");
      }
    }
  } else if (!isExecutableModelPath(internalModel)) {
    errorCode = "INVALID_INTERNAL_MODEL";
    warnings.push(`internalModel "${internalModel}" is not executable`);
  } else {
    const audit = auditRegistryModelPath(internalModel);
    if (!audit.ok && audit.reason === "not_in_openapi") {
      errorCode = "NOT_IN_OFFICIAL_CATALOG";
      warnings.push(
        `internalModel "${internalModel}" is not in the official Krea OpenAPI catalog`
      );
    }
  }

  if (!errorCode && !entry.category) errorCode = "MISSING_CATEGORY";
  else if (!errorCode && !entry.tools?.length) errorCode = "EMPTY_TOOLS";
  else if (!errorCode && !entry.capabilities?.length) errorCode = "EMPTY_CAPABILITIES";
  else if (!errorCode && (typeof entry.credits !== "number" || entry.credits < 0)) {
    errorCode = "INVALID_CREDITS";
  } else if (!errorCode && !VALID_AVAILABILITY.includes(entry.availability)) {
    errorCode = "INVALID_AVAILABILITY";
  } else if (!errorCode && !VALID_OUTPUT_TYPES.has(entry.outputType)) {
    errorCode = "INVALID_OUTPUT_TYPE";
  }

  if (
    internalModel.startsWith("openai/") &&
    entry.capabilities.includes("text_to_image")
  ) {
    warnings.push("OpenAI path present — generation disabled in this workspace");
    if (!errorCode) errorCode = "OPENAI_GENERATION_DISABLED";
  }

  if (entry.requires?.length) {
    const cat = entry.category as KreaModelCategory;
    if (cat === "edit" && !entry.requires.some((r) => r.includes("image"))) {
      warnings.push("Edit model may require source inputs for live test");
    }
  }

  return {
    modelId: entry.id,
    label: entry.label,
    internalModel: internalModel || null,
    source: "registry",
    status: errorCode ? "failed" : "passed",
    errorCode,
    warnings,
  };
}

function dryRunStudio(studioId: string): ModelValidationResult {
  const studio = getKreaImageStudioModel(studioId);
  if (!studio) {
    return {
      modelId: studioId,
      label: studioId,
      internalModel: null,
      source: "studio",
      status: "failed",
      errorCode: "MISSING_ID",
      warnings: [],
    };
  }

  const warnings: string[] = [];
  let errorCode: string | undefined;
  let resolvedPath: string | null = null;

  if (studio.availability === "not_configured") {
    return {
      modelId: studio.id,
      label: studio.label,
      internalModel: null,
      source: "studio",
      status: "skipped",
      errorCode: "NOT_EXECUTABLE",
      message: "Studio model not configured",
      warnings: [],
    };
  }

  if (studio.provider !== "krea") errorCode = "INVALID_PROVIDER";
  else if (typeof studio.credits !== "number") errorCode = "INVALID_CREDITS";
  else if (!VALID_AVAILABILITY.includes(studio.availability)) {
    errorCode = "INVALID_AVAILABILITY";
  }

  if (studio.id === SMART_AUTO_PILOT_STUDIO_ID) {
    try {
      resolvedPath = resolveKreaInternalModel(studio.id, "image");
    } catch {
      errorCode = errorCode ?? "RESOLVER_REQUIRED";
      warnings.push("Smart Auto-Pilot resolver failed");
    }
  } else if (studio.availability === "active" || studio.availability === "experimental") {
    try {
      resolvedPath = resolveKreaInternalModel(studio.id, "image");
    } catch (e) {
      if (!errorCode) {
        errorCode = "MODEL_NOT_CONFIGURED";
        warnings.push(
          e instanceof Error ? e.message : "Could not resolve internal model"
        );
      }
    }
  }

  const registry = getKreaModelById(studio.targetRegistryId);
  if (registry) {
    if (
      registry.availability === "not_configured" ||
      isPendingRegistryModelPath(getKreaInternalModel(registry))
    ) {
      warnings.push(
        `targetRegistryId "${studio.targetRegistryId}" is a placeholder — studio stays disabled until wired`
      );
    } else {
      const regCheck = dryRunRegistryEntry(registry);
      if (regCheck.status === "failed") {
        warnings.push(...regCheck.warnings);
        if (!errorCode) errorCode = regCheck.errorCode;
      } else if (regCheck.warnings.length) {
        warnings.push(...regCheck.warnings);
      }
    }
  } else if (
    studio.targetRegistryId !== "smart_auto_pilot" &&
    studio.targetRegistryId !== "auto"
  ) {
    warnings.push(`targetRegistryId "${studio.targetRegistryId}" not in registry`);
    if (!errorCode) errorCode = "MISSING_REGISTRY_TARGET";
  }

  return {
    modelId: studio.id,
    label: studio.label,
    internalModel: resolvedPath,
    source: "studio",
    status: errorCode ? "failed" : "passed",
    errorCode,
    warnings,
  };
}

function dryRunCandidate(candidate: Candidate): ModelValidationResult {
  if (candidate.source === "studio") {
    return dryRunStudio(candidate.modelId);
  }
  const entry = getKreaModelById(candidate.modelId);
  if (!entry) {
    return {
      modelId: candidate.modelId,
      label: candidate.label,
      internalModel: null,
      source: "registry",
      status: "failed",
      errorCode: "MISSING_ID",
      warnings: [],
    };
  }
  return dryRunRegistryEntry(entry);
}

async function liveTestCategoryCandidate(
  candidate: Candidate,
  expect: "image" | "video"
): Promise<ModelValidationResult> {
  const registryEntry = getKreaModelById(candidate.modelId);
  if (registryEntry && !isKreaModelExecutable(registryEntry)) {
    if (isKreaPlanLimitedModel(registryEntry)) {
      return {
        modelId: candidate.modelId,
        label: candidate.label,
        internalModel: getKreaInternalModel(registryEntry),
        source: candidate.source,
        status: "failed",
        errorCode: "KREA_PLAN_LIMIT",
        message: KREA_PLAN_LIMIT_VALIDATION_MESSAGE,
        warnings: [],
      };
    }
    return {
      modelId: candidate.modelId,
      label: candidate.label,
      internalModel: getKreaInternalModel(registryEntry),
      source: candidate.source,
      status: "skipped",
      errorCode: "NOT_EXECUTABLE",
      warnings: [],
    };
  }

  if (
    registryEntry?.requiredInputs?.some((input) =>
      ["sourceImageUrl", "sourceVideoUrl", "referenceImageUrl", "trainingImages"].includes(
        input
      )
    ) ||
    registryEntry?.requires?.some((r) =>
      ["source_image_url", "source_video_url", "reference_image_url", "reference_images"].includes(
        r
      )
    )
  ) {
    return {
      modelId: candidate.modelId,
      label: candidate.label,
      internalModel: registryEntry ? getKreaInternalModel(registryEntry) : null,
      source: candidate.source,
      status: "skipped",
      errorCode: "REQUIRES_INPUT",
      message: `Requires: ${registryEntry?.requiredInputs?.join(", ")}`,
      warnings: [],
    };
  }

  let modelPath: string;
  try {
    const tool =
      expect === "video"
        ? "video"
        : registryEntry?.category === "enhancer"
          ? "enhancer"
          : "image";
    modelPath = resolveKreaInternalModel(candidate.modelId, tool as never);
  } catch (e) {
    return {
      modelId: candidate.modelId,
      label: candidate.label,
      internalModel: null,
      source: candidate.source,
      status: "failed",
      errorCode: "MODEL_NOT_CONFIGURED",
      message: e instanceof Error ? e.message : "Resolve failed",
      warnings: [],
    };
  }

  try {
    const result = await generateViaKreaSubscribe({
      modelPath,
      prompt: KREA_VALIDATION_TEST_PROMPT,
      aspectRatio: "1:1",
      expect,
      ...(expect === "video" ? { duration: 3 } : {}),
    });

    const ok =
      expect === "video" ? Boolean(result.videoUrl) : Boolean(result.imageUrl);
    return {
      modelId: candidate.modelId,
      label: candidate.label,
      internalModel: modelPath,
      source: candidate.source,
      status: ok ? "passed" : "failed",
      errorCode: ok ? undefined : "NO_OUTPUT_URL",
      hasImageUrl: Boolean(result.imageUrl),
      imageUrlStart: result.imageUrl?.slice(0, 48),
      warnings: [],
    };
  } catch (e) {
    const mapped = mapKreaLiveTestProviderError(e);
    return {
      modelId: candidate.modelId,
      label: candidate.label,
      internalModel: modelPath,
      source: candidate.source,
      status: "failed",
      errorCode: mapped.errorCode,
      message: mapped.message,
      warnings: [],
    };
  }
}

async function liveTestImageCandidate(
  candidate: Candidate
): Promise<ModelValidationResult> {
  const studio = getKreaImageStudioModel(candidate.modelId);
  if (studio?.availability === "not_configured") {
    return {
      modelId: candidate.modelId,
      label: candidate.label,
      internalModel: null,
      source: candidate.source,
      status: "skipped",
      errorCode: "NOT_EXECUTABLE",
      message: "Studio model not configured",
      warnings: [],
    };
  }

  const registryEntry = getKreaModelById(candidate.modelId);
  if (registryEntry && !isKreaModelExecutable(registryEntry) && !studio) {
    return {
      modelId: candidate.modelId,
      label: candidate.label,
      internalModel: getKreaInternalModel(registryEntry),
      source: "registry",
      status: "skipped",
      errorCode: "NOT_EXECUTABLE",
      warnings: [],
    };
  }

  if (registryEntry?.requires?.length) {
    return {
      modelId: candidate.modelId,
      label: candidate.label,
      internalModel: getKreaInternalModel(registryEntry),
      source: candidate.source,
      status: "skipped",
      errorCode: "REQUIRES_INPUT",
      message: `Requires: ${registryEntry.requires.join(", ")}`,
      warnings: [],
    };
  }

  let modelPath: string;
  try {
    modelPath = resolveKreaInternalModel(candidate.modelId, "image");
  } catch (e) {
    return {
      modelId: candidate.modelId,
      label: candidate.label,
      internalModel: null,
      source: candidate.source,
      status: "failed",
      errorCode: "MODEL_NOT_CONFIGURED",
      message: e instanceof Error ? e.message : "Resolve failed",
      warnings: [],
    };
  }

  try {
    const result = await generateViaKreaSubscribe({
      modelPath,
      prompt: KREA_VALIDATION_TEST_PROMPT,
      aspectRatio: "1:1",
      expect: "image",
    });

    const hasImageUrl = Boolean(result.imageUrl);
    return {
      modelId: candidate.modelId,
      label: candidate.label,
      internalModel: modelPath,
      source: candidate.source,
      status: hasImageUrl ? "passed" : "failed",
      errorCode: hasImageUrl ? undefined : "NO_OUTPUT_URL",
      hasImageUrl,
      imageUrlStart: result.imageUrl?.slice(0, 48),
      warnings: [],
    };
  } catch (e) {
    const mapped = mapKreaLiveTestProviderError(e);
    return {
      modelId: candidate.modelId,
      label: candidate.label,
      internalModel: modelPath,
      source: candidate.source,
      status: "failed",
      errorCode: mapped.errorCode,
      message: mapped.message,
      warnings: [],
    };
  }
}

async function liveTestMotionTransferCandidate(
  candidate: Candidate
): Promise<ModelValidationResult> {
  const registryEntry = getKreaModelById(candidate.modelId);

  if (!registryEntry) {
    return {
      modelId: candidate.modelId,
      label: candidate.label,
      internalModel: null,
      source: candidate.source,
      status: "failed",
      errorCode: "MODEL_NOT_CONFIGURED",
      message: `Unknown model id "${candidate.modelId}"`,
      warnings: [],
    };
  }

  if (!isKreaModelExecutable(registryEntry)) {
    if (isKreaPlanLimitedModel(registryEntry)) {
      return {
        modelId: candidate.modelId,
        label: candidate.label,
        internalModel: getKreaInternalModel(registryEntry),
        source: candidate.source,
        status: "failed",
        errorCode: "KREA_PLAN_LIMIT",
        message: KREA_PLAN_LIMIT_VALIDATION_MESSAGE,
        warnings: [],
      };
    }
    return {
      modelId: candidate.modelId,
      label: candidate.label,
      internalModel: getKreaInternalModel(registryEntry),
      source: candidate.source,
      status: "skipped",
      errorCode: "NOT_EXECUTABLE",
      message: "Model has no verified Krea subscribe path",
      warnings: [],
    };
  }

  const fixtures = resolveMotionValidationFixtures();
  if (!fixtures.ok) {
    return {
      modelId: candidate.modelId,
      label: candidate.label,
      internalModel: getKreaInternalModel(registryEntry),
      source: candidate.source,
      status:
        fixtures.errorCode === "MISSING_VALIDATION_FIXTURE" ? "skipped" : "failed",
      errorCode: fixtures.errorCode,
      message: fixtures.message,
      warnings: [],
    };
  }

  let modelPath: string;
  try {
    modelPath = resolveKreaInternalModel(candidate.modelId, "motion_transfer");
  } catch (e) {
    return {
      modelId: candidate.modelId,
      label: candidate.label,
      internalModel: getKreaInternalModel(registryEntry),
      source: candidate.source,
      status: "failed",
      errorCode: "MODEL_NOT_CONFIGURED",
      message: e instanceof Error ? e.message : "Resolve failed",
      warnings: [],
    };
  }

  try {
    const result = await runKreaModel({
      model: registryEntry,
      prompt:
        "Apply the driving motion to the portrait while preserving identity and likeness.",
      inputs: {
        sourceImageUrl: fixtures.portraitUrl,
        sourceVideoUrl: fixtures.motionVideoUrl,
      },
    });

    const hasVideoUrl = Boolean(result.videoUrl);
    return {
      modelId: candidate.modelId,
      label: candidate.label,
      internalModel: modelPath,
      source: candidate.source,
      status: hasVideoUrl ? "passed" : "failed",
      errorCode: hasVideoUrl ? undefined : "NO_OUTPUT_URL",
      warnings: [],
    };
  } catch (e) {
    const mapped = mapKreaLiveTestProviderError(e);
    return {
      modelId: candidate.modelId,
      label: candidate.label,
      internalModel: modelPath,
      source: candidate.source,
      status: "failed",
      errorCode: mapped.errorCode,
      message: mapped.message,
      warnings: [],
    };
  }
}

async function liveTestEnhancerCandidate(
  candidate: Candidate
): Promise<ModelValidationResult> {
  const registryEntry = getKreaModelById(candidate.modelId);

  if (!registryEntry) {
    return {
      modelId: candidate.modelId,
      label: candidate.label,
      internalModel: null,
      source: candidate.source,
      status: "failed",
      errorCode: "MODEL_NOT_CONFIGURED",
      message: `Unknown model id "${candidate.modelId}"`,
      warnings: [],
    };
  }

  if (!isKreaModelExecutable(registryEntry)) {
    if (isKreaPlanLimitedModel(registryEntry)) {
      return {
        modelId: candidate.modelId,
        label: candidate.label,
        internalModel: getKreaInternalModel(registryEntry),
        source: candidate.source,
        status: "failed",
        errorCode: "KREA_PLAN_LIMIT",
        message: KREA_PLAN_LIMIT_VALIDATION_MESSAGE,
        warnings: [],
      };
    }
    return {
      modelId: candidate.modelId,
      label: candidate.label,
      internalModel: getKreaInternalModel(registryEntry),
      source: candidate.source,
      status: "skipped",
      errorCode: "NOT_EXECUTABLE",
      message: "Model has no verified Krea subscribe path",
      warnings: [],
    };
  }

  const portrait = resolvePortraitValidationFixture();
  if (!portrait.ok) {
    return {
      modelId: candidate.modelId,
      label: candidate.label,
      internalModel: getKreaInternalModel(registryEntry),
      source: candidate.source,
      status:
        portrait.errorCode === "MISSING_VALIDATION_FIXTURE" ? "skipped" : "failed",
      errorCode: portrait.errorCode,
      message: portrait.message,
      warnings: [],
    };
  }

  let modelPath: string;
  try {
    modelPath = resolveKreaInternalModel(candidate.modelId, "enhancer");
  } catch (e) {
    return {
      modelId: candidate.modelId,
      label: candidate.label,
      internalModel: getKreaInternalModel(registryEntry),
      source: candidate.source,
      status: "failed",
      errorCode: "MODEL_NOT_CONFIGURED",
      message: e instanceof Error ? e.message : "Resolve failed",
      warnings: [],
    };
  }

  try {
    const result = await runKreaModel({
      model: registryEntry,
      inputs: { sourceImageUrl: portrait.portraitUrl },
    });

    const hasImageUrl = Boolean(result.imageUrl);
    return {
      modelId: candidate.modelId,
      label: candidate.label,
      internalModel: modelPath,
      source: candidate.source,
      status: hasImageUrl ? "passed" : "failed",
      errorCode: hasImageUrl ? undefined : "NO_OUTPUT_URL",
      hasImageUrl,
      imageUrlStart: result.imageUrl?.slice(0, 48),
      warnings: [],
    };
  } catch (e) {
    const mapped = mapKreaLiveTestProviderError(e);
    return {
      modelId: candidate.modelId,
      label: candidate.label,
      internalModel: modelPath,
      source: candidate.source,
      status: "failed",
      errorCode: mapped.errorCode,
      message: mapped.message,
      warnings: [],
    };
  }
}

function skipTrainingLive(candidate: Candidate): ModelValidationResult {
  return {
    modelId: candidate.modelId,
    label: candidate.label,
    internalModel: getKreaModelById(candidate.modelId)
      ? getKreaInternalModel(getKreaModelById(candidate.modelId)!)
      : null,
    source: candidate.source,
    status: "skipped",
    errorCode: "TRAINING_LIVE_MANUAL",
    message: "Training live validation must be run manually.",
    warnings: [],
  };
}

function skipNonImageLive(
  candidate: Candidate,
  tool: ValidationToolFilter
): ModelValidationResult {
  return {
    modelId: candidate.modelId,
    label: candidate.label,
    internalModel: null,
    source: candidate.source,
    status: "skipped",
    errorCode: "KREA_TOOL_NOT_IMPLEMENTED",
    message: `Live test not implemented for tool "${tool}"`,
    warnings: [],
  };
}

export async function runKreaModelValidation(options: {
  tool?: ValidationToolFilter;
  modelIds?: string[];
  mode?: ValidationMode;
  maxModels?: number;
}): Promise<ModelValidationSummary> {
  const mode = options.mode ?? "dry_run";
  const defaultMax =
    mode === "live_test"
      ? 3
      : options.tool === "image" || options.tool === undefined
        ? 500
        : 200;
  const maxModels =
    mode === "live_test"
      ? Math.min(options.maxModels ?? defaultMax, 10)
      : Math.min(options.maxModels ?? defaultMax, 500);

  let candidates = collectCandidates(options.tool, options.modelIds);
  candidates = candidates.slice(0, maxModels);

  const results: ModelValidationResult[] = [];

  for (const candidate of candidates) {
    if (mode === "dry_run") {
      results.push(dryRunCandidate(candidate));
      continue;
    }

    const registryEntry = getKreaModelById(candidate.modelId);
    if (
      options.tool === "train_lora" ||
      options.tool === "style_training" ||
      (registryEntry && isKreaTrainingModel(registryEntry))
    ) {
      results.push(skipTrainingLive(candidate));
      continue;
    }

    if (options.tool && LIVE_TEST_NOT_IMPLEMENTED_TOOLS.has(options.tool)) {
      results.push(skipNonImageLive(candidate, options.tool));
      continue;
    }

    const entry = getKreaModelById(candidate.modelId);
    if (
      options.tool === "motion_transfer" ||
      entry?.category === "motion_transfer"
    ) {
      results.push(await liveTestMotionTransferCandidate(candidate));
      continue;
    }
    if (options.tool === "video" || entry?.category === "video") {
      results.push(await liveTestCategoryCandidate(candidate, "video"));
      continue;
    }
    if (options.tool === "enhancer" || entry?.category === "enhancer") {
      results.push(await liveTestEnhancerCandidate(candidate));
      continue;
    }
    if (options.tool === "edit" || entry?.category === "edit") {
      results.push(skipNonImageLive(candidate, "edit"));
      continue;
    }

    if (candidate.source === "studio" || options.tool === "image" || !options.tool) {
      results.push(await liveTestImageCandidate(candidate));
    } else {
      if (entry?.category === "image" || entry?.tools.includes("image")) {
        results.push(await liveTestImageCandidate(candidate));
      } else {
        results.push(skipNonImageLive(candidate, options.tool ?? "video"));
      }
    }
  }

  const passed = results.filter((r) => r.status === "passed").length;
  const failed = results.filter((r) => r.status === "failed").length;
  const skipped = results.filter((r) => r.status === "skipped").length;

  const summary: ModelValidationSummary = {
    success: true,
    mode,
    tool: options.tool,
    total: results.length,
    passed,
    failed,
    skipped,
    results,
    officialCatalog: countOfficialCatalogStats(),
  };

  if (mode === "live_test") {
    summary.tested = results.filter((r) => r.status !== "skipped").length;
  }

  return summary;
}

export function countRegistryModels(): {
  total: number;
  image: number;
  active: number;
  experimental: number;
  notConfigured: number;
} {
  const all = getKreaModelRegistry();
  return {
    total: all.length,
    image: all.filter((e) => e.tools.includes("image")).length,
    active: all.filter((e) => e.availability === "active").length,
    experimental: all.filter((e) => e.availability === "experimental").length,
    notConfigured: all.filter((e) => e.availability === "not_configured").length,
  };
}

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
  isExecutableModelPath,
  isKreaModelExecutable,
  isKreaTrainingApiPath,
  isKreaTrainingModel,
  resolveKreaInternalModel,
  type KreaModelCategory,
  type KreaModelConfig,
  type KreaToolKey,
  type ModelAvailability,
} from "./krea-model-registry";
import { createKreaImageJob, waitForKreaJob } from "@/lib/providers";

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
  results: ModelValidationResult[];
};

const VALID_AVAILABILITY: ModelAvailability[] = [
  "active",
  "experimental",
  "not_configured",
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

export const KREA_VALIDATION_TEST_PROMPT =
  "Minimal premium product campaign visual, black background, amber studio light, no readable text, no logo";

type Candidate = {
  modelId: string;
  label: string;
  source: "studio" | "registry";
};

function toolToRegistryKey(tool: ValidationToolFilter): KreaToolKey {
  return tool as KreaToolKey;
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
    for (const id of modelIds) {
      const studio = getKreaImageStudioModel(id);
      if (studio) {
        add({ modelId: studio.id, label: studio.label, source: "studio" });
        continue;
      }
      const entry = getKreaModelById(id);
      if (entry) {
        add({ modelId: entry.id, label: entry.label, source: "registry" });
      } else {
        add({ modelId: id, label: id, source: "registry" });
      }
    }
    return out;
  }

  if (!tool || tool === "image") {
    for (const studio of KREA_IMAGE_MODELS) {
      if (studio.availability !== "hidden") {
        add({ modelId: studio.id, label: studio.label, source: "studio" });
      }
    }
  }

  if (tool) {
    const key = toolToRegistryKey(tool);
    for (const entry of getKreaModelRegistry()) {
      if (entry.availability === "hidden") continue;
      if (!entry.tools.includes(key)) continue;
      add({ modelId: entry.id, label: entry.label, source: "registry" });
    }
  } else {
    for (const entry of getKreaModelRegistry()) {
      if (entry.availability === "hidden") continue;
      add({ modelId: entry.id, label: entry.label, source: "registry" });
    }
  }

  return out;
}

function dryRunRegistryEntry(entry: KreaModelConfig): ModelValidationResult {
  const warnings: string[] = [];
  const internalModel = getKreaInternalModel(entry);
  let errorCode: string | undefined;

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
  } else if (!entry.category) errorCode = "MISSING_CATEGORY";
  else if (!entry.tools?.length) errorCode = "EMPTY_TOOLS";
  else if (!entry.capabilities?.length) errorCode = "EMPTY_CAPABILITIES";
  else if (typeof entry.credits !== "number" || entry.credits < 0) {
    errorCode = "INVALID_CREDITS";
  } else if (!VALID_AVAILABILITY.includes(entry.availability)) {
    errorCode = "INVALID_AVAILABILITY";
  } else if (!VALID_OUTPUT_TYPES.has(entry.outputType)) {
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
    const regCheck = dryRunRegistryEntry(registry);
    warnings.push(...regCheck.warnings);
    if (regCheck.status === "failed" && !errorCode) {
      errorCode = regCheck.errorCode;
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
    const job = await createKreaImageJob({
      prompt: KREA_VALIDATION_TEST_PROMPT,
      aspectRatio: "1:1",
      modelPath,
    });

    if (!job.providerJobId) {
      return {
        modelId: candidate.modelId,
        label: candidate.label,
        internalModel: modelPath,
        source: candidate.source,
        status: "failed",
        errorCode: "PROVIDER_BAD_RESPONSE",
        message: "No job_id returned",
        warnings: [],
      };
    }

    const result = await waitForKreaJob(job.providerJobId, {
      modelPath,
      expect: "image",
      maxAttempts: 45,
      intervalMs: 2000,
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
    const message = e instanceof Error ? e.message : "Provider call failed";
    return {
      modelId: candidate.modelId,
      label: candidate.label,
      internalModel: modelPath,
      source: candidate.source,
      status: "failed",
      errorCode: "PROVIDER_FAILED",
      message: message.slice(0, 400),
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

    if (candidate.source === "studio" || options.tool === "image" || !options.tool) {
      results.push(await liveTestImageCandidate(candidate));
    } else {
      const entry = getKreaModelById(candidate.modelId);
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

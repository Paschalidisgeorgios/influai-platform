/**
 * fal.ai model validation — dev/admin only; no user credits.
 */

import type { EngineModelConfig } from "@/lib/ai/model-registry";
import { FAL_MODEL_REGISTRY_ENTRIES } from "@/lib/ai/fal-model-registry";
import { runFalModel } from "@/lib/fal/fal-adapters";
import { isFalKeyConfigured } from "@/lib/fal/fal-client";
import { mapFalProviderError } from "@/lib/fal/fal-errors";
import { isFalProviderEnabled } from "@/lib/providers/flags";
import {
  resolveMotionValidationFixtures,
  resolvePortraitValidationFixture,
} from "@/lib/krea/krea-validation-fixtures";

export type FalValidationResult = {
  modelId: string;
  label: string;
  providerModel: string;
  provider: "fal";
  status: "passed" | "failed" | "skipped";
  errorCode?: string;
  message?: string;
  adminHint?: string;
  hasOutputUrl?: boolean;
};

export const FAL_VALIDATION_TEST_PROMPT =
  "Minimal premium product campaign visual, black background, amber studio light, no readable text";

const FAL_VALIDATION_SCRIPT = "Hello, this is a short validation test for InfluExAi.";

function resolveAudioFixture():
  | { ok: true; audioUrl: string }
  | { ok: false; errorCode: string; message: string } {
  const audioUrl = process.env.FAL_VALIDATION_AUDIO_URL?.trim() ?? "";
  if (!audioUrl) {
    return {
      ok: false,
      errorCode: "MISSING_VALIDATION_FIXTURE",
      message: "Set FAL_VALIDATION_AUDIO_URL for lipsync/avatar audio live tests.",
    };
  }
  try {
    const parsed = new URL(audioUrl);
    if (parsed.protocol !== "https:") {
      return {
        ok: false,
        errorCode: "INVALID_VALIDATION_ASSET_URL",
        message: "FAL_VALIDATION_AUDIO_URL must use HTTPS.",
      };
    }
  } catch {
    return {
      ok: false,
      errorCode: "INVALID_VALIDATION_ASSET_URL",
      message: "Invalid FAL_VALIDATION_AUDIO_URL.",
    };
  }
  return { ok: true, audioUrl };
}

async function liveTestFalModel(model: EngineModelConfig): Promise<FalValidationResult> {
  const base: FalValidationResult = {
    modelId: model.id,
    label: model.label,
    providerModel: model.providerModel,
    provider: "fal",
    status: "failed",
  };

  if (model.availability === "not_configured") {
    return {
      ...base,
      status: "skipped",
      errorCode: "NOT_CONFIGURED",
      message: "Model is not configured.",
    };
  }

  if (!isFalProviderEnabled() || !isFalKeyConfigured()) {
    return {
      ...base,
      status: "skipped",
      errorCode: "MISSING_FAL_KEY",
      message: "FAL_KEY or ENABLE_FAL_PROVIDER not configured.",
    };
  }

  const inputs: NonNullable<Parameters<typeof runFalModel>[0]["inputs"]> = {
    duration: 5,
  };

  const needsPortrait = model.requiredInputs.includes("sourceImageUrl");
  const needsVideo = model.requiredInputs.includes("sourceVideoUrl");
  const needsAudio = model.requiredInputs.includes("sourceAudioUrl");
  const needsScript = model.requiredInputs.includes("scriptText");

  if (needsPortrait) {
    const portrait = resolvePortraitValidationFixture();
    if (!portrait.ok) {
      return {
        ...base,
        status: "skipped",
        errorCode: portrait.errorCode,
        message: portrait.message,
      };
    }
    inputs.sourceImageUrl = portrait.portraitUrl;
  }

  if (needsVideo) {
    const motion = resolveMotionValidationFixtures();
    if (!motion.ok) {
      return {
        ...base,
        status: "skipped",
        errorCode: motion.errorCode,
        message: motion.message,
      };
    }
    inputs.sourceVideoUrl = motion.motionVideoUrl;
  }

  if (needsAudio) {
    const audio = resolveAudioFixture();
    if (!audio.ok) {
      return {
        ...base,
        status: "skipped",
        errorCode: audio.errorCode,
        message: audio.message,
      };
    }
    inputs.sourceAudioUrl = audio.audioUrl;
  }

  if (needsScript) {
    inputs.scriptText = FAL_VALIDATION_SCRIPT;
  }

  try {
    const result = await runFalModel({
      model,
      prompt: FAL_VALIDATION_TEST_PROMPT,
      selectedFormat: "tiktok",
      inputs,
    });

    const hasOutput = Boolean(result.imageUrl || result.videoUrl || result.audioUrl);
    if (!hasOutput) {
      return {
        ...base,
        status: "failed",
        errorCode: "NO_OUTPUT_URL",
        message: "Provider returned no output URL.",
      };
    }

    return {
      ...base,
      status: "passed",
      hasOutputUrl: true,
      message: "Live validation passed.",
    };
  } catch (error) {
    const mapped = mapFalProviderError(error);
    return {
      ...base,
      status: "failed",
      errorCode: mapped.errorCode,
      message: mapped.message,
      ...(mapped.adminHint ? { adminHint: mapped.adminHint } : {}),
    };
  }
}

export function collectFalValidationCandidates(modelIds?: string[]): EngineModelConfig[] {
  if (modelIds?.length) {
    return FAL_MODEL_REGISTRY_ENTRIES.filter((entry) => modelIds.includes(entry.id));
  }
  return [...FAL_MODEL_REGISTRY_ENTRIES];
}

function unknownFalResult(modelId: string): FalValidationResult {
  return {
    modelId,
    label: modelId,
    providerModel: "",
    provider: "fal",
    status: "failed",
    errorCode: "UNKNOWN_MODEL",
    message: `Unknown fal model id: ${modelId}`,
  };
}

export async function runFalModelValidation(params: {
  mode: "dry_run" | "live_test";
  modelIds?: string[];
  maxModels?: number;
}): Promise<{
  success: true;
  provider: "fal";
  mode: "dry_run" | "live_test";
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  results: FalValidationResult[];
}> {
  const requestedIds = params.modelIds?.length ? [...params.modelIds] : undefined;
  let candidates = collectFalValidationCandidates(params.modelIds);

  if (requestedIds?.length && candidates.length === 0) {
    const results = requestedIds.map(unknownFalResult);
    return {
      success: true,
      provider: "fal",
      mode: params.mode,
      total: results.length,
      passed: 0,
      failed: results.length,
      skipped: 0,
      results,
    };
  }

  if (params.maxModels && params.maxModels > 0) {
    candidates = candidates.slice(0, params.maxModels);
  }

  const results: FalValidationResult[] = [];

  if (requestedIds?.length) {
    for (const id of requestedIds) {
      if (!candidates.some((c) => c.id === id)) {
        results.push(unknownFalResult(id));
      }
    }
  }

  for (const model of candidates) {
    if (params.mode === "dry_run") {
      results.push({
        modelId: model.id,
        label: model.label,
        providerModel: model.providerModel,
        provider: "fal",
        status:
          model.availability === "not_configured" ? "skipped" : "passed",
        message: "Dry run — schema/registry check only.",
      });
      continue;
    }
    results.push(await liveTestFalModel(model));
  }

  const passed = results.filter((r) => r.status === "passed").length;
  const failed = results.filter((r) => r.status === "failed").length;
  const skipped = results.filter((r) => r.status === "skipped").length;

  return {
    success: true,
    provider: "fal",
    mode: params.mode,
    total: results.length,
    passed,
    failed,
    skipped,
    results,
  };
}

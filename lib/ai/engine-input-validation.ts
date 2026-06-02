/**
 * Engine input validation — server-side only.
 */

import type { EngineModelConfig, EngineRequiredInput } from "./model-registry";

export type EngineInputValidationCode =
  | "MISSING_PROMPT"
  | "MISSING_SOURCE_IMAGE"
  | "MISSING_SOURCE_VIDEO"
  | "MISSING_SOURCE_AUDIO"
  | "MISSING_SCRIPT"
  | "MISSING_REFERENCE_IMAGE"
  | "MISSING_TRAINING_IMAGES"
  | "INVALID_INPUT_URL";

const INPUT_FIELD_MAP: Record<
  EngineRequiredInput,
  { key: string; code: EngineInputValidationCode }
> = {
  prompt: { key: "prompt", code: "MISSING_PROMPT" },
  sourceImageUrl: { key: "sourceImageUrl", code: "MISSING_SOURCE_IMAGE" },
  sourceVideoUrl: { key: "sourceVideoUrl", code: "MISSING_SOURCE_VIDEO" },
  sourceAudioUrl: { key: "sourceAudioUrl", code: "MISSING_SOURCE_AUDIO" },
  referenceImageUrl: { key: "referenceImageUrl", code: "MISSING_REFERENCE_IMAGE" },
  scriptText: { key: "scriptText", code: "MISSING_SCRIPT" },
  trainingImages: { key: "trainingImages", code: "MISSING_TRAINING_IMAGES" },
};

function isValidHttpUrl(value: unknown): boolean {
  if (typeof value !== "string" || !value.trim()) return false;
  const t = value.trim();
  if (t.startsWith("blob:")) return false;
  try {
    const url = new URL(t);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function resolveInputValue(
  inputKey: EngineRequiredInput,
  params: {
    prompt?: string;
    inputs?: Record<string, unknown>;
  }
): unknown {
  const map = INPUT_FIELD_MAP[inputKey];
  if (inputKey === "prompt") return params.prompt;
  return params.inputs?.[map.key];
}

export function validateEngineInputs(params: {
  model: EngineModelConfig;
  prompt?: string;
  inputs?: Record<string, unknown>;
}): {
  ok: boolean;
  code?: EngineInputValidationCode;
  missing?: string[];
} {
  const required = params.model.requiredInputs ?? [];
  const missing: string[] = [];

  for (const req of required) {
    const value = resolveInputValue(req, params);

    if (req === "prompt" || req === "scriptText") {
      if (typeof value !== "string" || !value.trim()) {
        missing.push(req);
      }
      continue;
    }

    if (req === "trainingImages") {
      if (!Array.isArray(value) || value.length === 0) {
        missing.push(req);
      }
      continue;
    }

    if (!isValidHttpUrl(value)) {
      missing.push(req);
    }
  }

  if (missing.length) {
    const first = missing[0] as EngineRequiredInput;
    return {
      ok: false,
      code: INPUT_FIELD_MAP[first]?.code ?? "MISSING_PROMPT",
      missing,
    };
  }

  return { ok: true };
}

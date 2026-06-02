/**
 * Krea input validation — server-side only.
 */

import type {
  KreaModelConfig,
  KreaRequiredInput,
} from "./krea-model-registry";
import { getKreaRequiredInputs } from "./krea-model-registry";

export type KreaInputValidationCode =
  | "MISSING_PROMPT"
  | "MISSING_SOURCE_IMAGE"
  | "MISSING_SOURCE_VIDEO"
  | "MISSING_SOURCE_AUDIO"
  | "MISSING_TRAINING_IMAGES"
  | "MISSING_SCRIPT"
  | "MISSING_REFERENCE_IMAGE"
  | "INVALID_INPUT_URL";

const INPUT_FIELD_MAP: Record<
  KreaRequiredInput,
  { key: string; code: KreaInputValidationCode }
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
  inputKey: KreaRequiredInput,
  params: {
    prompt?: string;
    inputs?: Record<string, unknown>;
  }
): unknown {
  const map = INPUT_FIELD_MAP[inputKey];
  if (inputKey === "prompt") return params.prompt;
  return params.inputs?.[map.key];
}

export function validateKreaInputs(params: {
  model: KreaModelConfig;
  prompt?: string;
  inputs?: Record<string, unknown>;
}): {
  ok: boolean;
  code?: KreaInputValidationCode;
  missing?: string[];
} {
  const required = getKreaRequiredInputs(params.model);
  const missing: string[] = [];

  for (const req of required) {
    const value = resolveInputValue(req, params);

    if (req === "prompt") {
      if (typeof value !== "string" || !value.trim()) {
        missing.push("prompt");
      }
      continue;
    }

    if (req === "trainingImages") {
      const arr = Array.isArray(value) ? value : [];
      const valid =
        arr.length > 0 &&
        arr.every((u) => typeof u === "string" && isValidHttpUrl(u));
      if (!valid) missing.push("trainingImages");
      continue;
    }

    if (req === "scriptText") {
      if (typeof value !== "string" || !value.trim()) {
        missing.push("scriptText");
      }
      continue;
    }

    if (
      req === "sourceImageUrl" ||
      req === "sourceVideoUrl" ||
      req === "sourceAudioUrl" ||
      req === "referenceImageUrl"
    ) {
      if (!isValidHttpUrl(value)) {
        missing.push(INPUT_FIELD_MAP[req].key);
      }
    }
  }

  if (missing.length === 0) {
    return { ok: true };
  }

  const first = missing[0];
  let code: KreaInputValidationCode = "MISSING_PROMPT";
  if (first === "sourceImageUrl" || first === "referenceImageUrl") {
    code =
      first === "referenceImageUrl"
        ? "MISSING_REFERENCE_IMAGE"
        : "MISSING_SOURCE_IMAGE";
  } else if (first === "sourceVideoUrl") code = "MISSING_SOURCE_VIDEO";
  else if (first === "sourceAudioUrl") code = "MISSING_SOURCE_AUDIO";
  else if (first === "trainingImages") code = "MISSING_TRAINING_IMAGES";
  else if (first === "scriptText") code = "MISSING_SCRIPT";
  else if (first === "prompt") code = "MISSING_PROMPT";
  else if (
    params.inputs?.[first] &&
    typeof params.inputs[first] === "string" &&
    String(params.inputs[first]).startsWith("blob:")
  ) {
    code = "INVALID_INPUT_URL";
  }

  return { ok: false, code, missing };
}

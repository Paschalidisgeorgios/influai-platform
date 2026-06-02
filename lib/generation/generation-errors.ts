/**
 * Structured generation errors — white-label user copy, safe for client formatting.
 * Internal logs may still reference provider names.
 */

import { isDevRuntime } from "@/lib/env/runtime-ui";

export type GenerationErrorCode =
  | "MODEL_NOT_CONFIGURED"
  | "ENGINE_NOT_CONFIGURED"
  | "INSUFFICIENT_CREDITS"
  | "ACTION_UNAVAILABLE"
  | "PROMPT_ASSIST_FAILED"
  | "GALLERY_SAVE_FAILED"
  | "FAL_BALANCE_EXHAUSTED"
  | "NO_OUTPUT_URL"
  | "GENERATION_TIMEOUT"
  | "UPLOAD_FAILED"
  | "PROVIDER_ERROR"
  | "GENERATION_FAILED"
  | "MISSING_SOURCE_IMAGE"
  | "KREA_MOTION_NOT_IMPLEMENTED"
  | "KREA_LIPSYNC_NOT_IMPLEMENTED"
  | "KREA_VIDEO_NOT_IMPLEMENTED";

export type GenerationLanguage = "de" | "en";

export type GenerationErrorPayload = {
  success: false;
  code: GenerationErrorCode;
  error: string;
  reason?: string;
  requestId?: string;
  refunded?: boolean;
};

const STORED_PREFIX = "GEN_ERR:";

const COPY: Record<
  GenerationErrorCode,
  {
    error: Record<GenerationLanguage, string>;
    reason: Record<GenerationLanguage, string>;
  }
> = {
  MODEL_NOT_CONFIGURED: {
    error: {
      en: "This creation mode is not available yet. Your credits were not charged.",
      de: "Dieser Erstellungsmodus ist noch nicht verfügbar. Es wurden keine Credits abgebucht.",
    },
    reason: { en: "", de: "" },
  },
  ENGINE_NOT_CONFIGURED: {
    error: {
      en: "This creation mode is not available yet. Your credits were not charged.",
      de: "Dieser Erstellungsmodus ist noch nicht verfügbar. Es wurden keine Credits abgebucht.",
    },
    reason: { en: "", de: "" },
  },
  INSUFFICIENT_CREDITS: {
    error: {
      en: "You need more credits to generate this. Your credits were not charged.",
      de: "Du brauchst mehr Credits für diese Generierung. Es wurden keine Credits abgebucht.",
    },
    reason: { en: "", de: "" },
  },
  ACTION_UNAVAILABLE: {
    error: {
      en: "This action is not available yet.",
      de: "Diese Aktion ist noch nicht verfügbar.",
    },
    reason: { en: "", de: "" },
  },
  PROMPT_ASSIST_FAILED: {
    error: {
      en: "Prompt assist is temporarily unavailable. Your original prompt was kept.",
      de: "Prompt Assist ist vorübergehend nicht verfügbar. Dein ursprünglicher Prompt blieb erhalten.",
    },
    reason: { en: "", de: "" },
  },
  GALLERY_SAVE_FAILED: {
    error: {
      en: "We could not save this to your Creator Gallery. Please try again.",
      de: "Speichern in der Creator Gallery ist fehlgeschlagen. Bitte erneut versuchen.",
    },
    reason: { en: "", de: "" },
  },
  FAL_BALANCE_EXHAUSTED: {
    error: {
      en: "Video generation is temporarily unavailable. Your credits were not charged.",
      de: "Video-Generierung ist vorübergehend nicht verfügbar. Es wurden keine Credits abgebucht.",
    },
    reason: { en: "", de: "" },
  },
  MISSING_SOURCE_IMAGE: {
    error: {
      en: "Please upload a source image first.",
      de: "Bitte lade zuerst ein Quellbild hoch.",
    },
    reason: {
      en: "Reason: A source image is required for this workflow.",
      de: "Grund: Für diesen Workflow wird ein Quellbild benötigt.",
    },
  },
  KREA_MOTION_NOT_IMPLEMENTED: {
    error: {
      en: "This action is not available yet. Your credits were not charged.",
      de: "Diese Aktion ist noch nicht verfügbar. Es wurden keine Credits abgebucht.",
    },
    reason: { en: "", de: "" },
  },
  KREA_LIPSYNC_NOT_IMPLEMENTED: {
    error: {
      en: "This action is not available yet. Your credits were not charged.",
      de: "Diese Aktion ist noch nicht verfügbar. Es wurden keine Credits abgebucht.",
    },
    reason: { en: "", de: "" },
  },
  KREA_VIDEO_NOT_IMPLEMENTED: {
    error: {
      en: "Video generation is temporarily unavailable. Your credits were not charged.",
      de: "Video-Generierung ist vorübergehend nicht verfügbar. Es wurden keine Credits abgebucht.",
    },
    reason: { en: "", de: "" },
  },
  NO_OUTPUT_URL: {
    error: {
      en: "Generation failed. Credits were refunded.",
      de: "Generierung fehlgeschlagen. Credits wurden erstattet.",
    },
    reason: { en: "", de: "" },
  },
  GENERATION_TIMEOUT: {
    error: {
      en: "Generation timed out. Credits were refunded.",
      de: "Zeitüberschreitung bei der Generierung. Credits wurden erstattet.",
    },
    reason: { en: "", de: "" },
  },
  UPLOAD_FAILED: {
    error: {
      en: "We could not save your result. Credits were refunded.",
      de: "Ergebnis konnte nicht gespeichert werden. Credits wurden erstattet.",
    },
    reason: { en: "", de: "" },
  },
  PROVIDER_ERROR: {
    error: {
      en: "Generation failed. Credits were refunded.",
      de: "Generierung fehlgeschlagen. Credits wurden erstattet.",
    },
    reason: { en: "", de: "" },
  },
  GENERATION_FAILED: {
    error: {
      en: "Generation failed. Credits were refunded.",
      de: "Generierung fehlgeschlagen. Credits wurden erstattet.",
    },
    reason: { en: "", de: "" },
  },
};

/** @deprecated Use buildGenerationErrorPayload — kept for imports only. */
export const GENERATION_FAILED_REFUNDED_EN =
  COPY.GENERATION_FAILED.error.en;

export function classifyGenerationError(cause: unknown): GenerationErrorCode {
  const message =
    cause instanceof Error
      ? cause.message
      : typeof cause === "string"
        ? cause
        : "Generation failed";

  const lower = message.toLowerCase();

  if (
    lower.includes("insufficient credits") ||
    lower.includes("not enough credits") ||
    lower.includes("insufficient_credits")
  ) {
    return "INSUFFICIENT_CREDITS";
  }

  if (
    lower.includes("not available yet") ||
    lower.includes("action is not available")
  ) {
    return "ACTION_UNAVAILABLE";
  }

  if (lower.includes("prompt assist") || lower.includes("enhance prompt")) {
    return "PROMPT_ASSIST_FAILED";
  }

  if (
    lower.includes("gallery") &&
    (lower.includes("save") || lower.includes("insert failed"))
  ) {
    return "GALLERY_SAVE_FAILED";
  }

  if (
    lower.includes("exhausted balance") ||
    lower.includes("user is locked") ||
    lower.includes("fal_balance_exhausted")
  ) {
    return "FAL_BALANCE_EXHAUSTED";
  }

  if (
    lower.includes("fal_key") ||
    lower.includes("elevenlabs_api_key") ||
    lower.includes("krea_api_key")
  ) {
    return "ENGINE_NOT_CONFIGURED";
  }

  if (
    lower.includes("not configured") ||
    lower.includes("provider is disabled") ||
    lower.includes("engine is not configured") ||
    lower.includes("not fully connected")
  ) {
    return lower.includes("model") ? "MODEL_NOT_CONFIGURED" : "ENGINE_NOT_CONFIGURED";
  }

  if (
    lower.includes("motion transfer") &&
    (lower.includes("not implemented") || lower.includes("not available"))
  ) {
    return "KREA_MOTION_NOT_IMPLEMENTED";
  }

  if (
    lower.includes("lip sync") &&
    (lower.includes("not implemented") || lower.includes("not available"))
  ) {
    return "KREA_LIPSYNC_NOT_IMPLEMENTED";
  }

  if (lower.includes("source image") && lower.includes("required")) {
    return "MISSING_SOURCE_IMAGE";
  }

  if (
    lower.includes("did not return") &&
    (lower.includes("url") || lower.includes("image") || lower.includes("video"))
  ) {
    return "NO_OUTPUT_URL";
  }

  if (
    lower.includes("timed out") ||
    lower.includes("timeout") ||
    lower.includes("max wait")
  ) {
    return "GENERATION_TIMEOUT";
  }

  if (
    lower.includes("upload") ||
    lower.includes("storage") ||
    lower.includes("failed to download provider")
  ) {
    return "UPLOAD_FAILED";
  }

  if (
    lower.includes("api request failed") ||
    lower.includes("job failed") ||
    lower.includes("job_id") ||
    lower.includes("poll failed")
  ) {
    return "PROVIDER_ERROR";
  }

  return "GENERATION_FAILED";
}

export function buildGenerationErrorPayload(
  code: GenerationErrorCode,
  options?: {
    language?: GenerationLanguage;
    requestId?: string;
    refunded?: boolean;
    includeReason?: boolean;
  }
): GenerationErrorPayload {
  const lang = options?.language ?? "en";
  const includeReason = options?.includeReason !== false;
  const block = COPY[code];
  const reason = block.reason[lang]?.trim();

  return {
    success: false,
    code,
    error: block.error[lang],
    ...(includeReason && reason ? { reason } : {}),
    ...(options?.requestId ? { requestId: options.requestId } : {}),
    ...(options?.refunded !== undefined ? { refunded: options.refunded } : {}),
  };
}

export function buildGenerationErrorFromCause(
  cause: unknown,
  options?: {
    language?: GenerationLanguage;
    requestId?: string;
    refunded?: boolean;
  }
): GenerationErrorPayload {
  return buildGenerationErrorPayload(classifyGenerationError(cause), options);
}

/** Persisted on generations.error_message — includes machine-readable code. */
export function encodeStoredGenerationError(
  payload: GenerationErrorPayload
): string {
  const reasonLine = payload.reason ? `\n${payload.reason}` : "";
  return `${STORED_PREFIX}${payload.code}::${payload.error}${reasonLine}`.slice(
    0,
    500
  );
}

export function parseStoredGenerationError(
  raw: string | null | undefined
): { code: GenerationErrorCode; error: string; reason?: string } | null {
  if (!raw?.trim()) return null;
  const trimmed = raw.trim();
  if (!trimmed.startsWith(STORED_PREFIX)) return null;

  const body = trimmed.slice(STORED_PREFIX.length);
  const sep = body.indexOf("::");
  if (sep < 0) return null;

  const code = body.slice(0, sep) as GenerationErrorCode;
  if (!(code in COPY)) return null;

  const rest = body.slice(sep + 2);
  const newline = rest.indexOf("\n");
  if (newline < 0) {
    return { code, error: rest };
  }

  return {
    code,
    error: rest.slice(0, newline),
    reason: rest.slice(newline + 1).trim() || undefined,
  };
}

export function formatGenerationErrorDisplay(
  code: GenerationErrorCode,
  language: GenerationLanguage,
  options?: { includeReason?: boolean }
): string {
  const payload = buildGenerationErrorPayload(code, {
    language,
    includeReason: options?.includeReason,
  });
  return payload.reason ? `${payload.error}\n${payload.reason}` : payload.error;
}

const LEGACY_KREA_REFUND =
  /^krea generation failed\. your credits were refunded\.?$/i;

export function sanitizeLegacyErrorMessage(
  raw: string | null | undefined,
  language: GenerationLanguage
): string {
  if (!raw?.trim()) {
    return formatGenerationErrorDisplay("GENERATION_FAILED", language);
  }

  const parsed = parseStoredGenerationError(raw);
  if (parsed) {
    return formatGenerationErrorDisplay(parsed.code, language);
  }

  let text = raw.replace(/\bkrea\s*ai\b/gi, "engine");
  text = text.replace(/\bkrea\b/gi, "engine");
  text = text.replace(/\bfal_key\b/gi, "fallback engine");
  text = text.replace(/\belevenlabs_api_key\b/gi, "voice engine");
  text = text.replace(/\bfal\.ai\b/gi, "fallback engine");

  if (/fal_key is not configured/i.test(text)) {
    return formatGenerationErrorDisplay("ENGINE_NOT_CONFIGURED", language);
  }

  if (LEGACY_KREA_REFUND.test(text.trim())) {
    return formatGenerationErrorDisplay("GENERATION_FAILED", language);
  }

  if (/generation failed.*refund/i.test(text) && !text.includes("Grund:") && !text.includes("Reason:")) {
    return formatGenerationErrorDisplay("GENERATION_FAILED", language);
  }

  return text.slice(0, 500);
}

function looksLikeInternalApiError(message: string): boolean {
  return /localhost|127\.0\.0\.1|^\s*at\s+\S|stack trace|debugReason|requestId|kreaModelId|validationStatus|providerPayload|GEN_ERR:|KREA_API_KEY/im.test(
    message
  );
}

export function formatStoredGenerationError(
  raw: string | null | undefined,
  language: GenerationLanguage
): string {
  return sanitizeLegacyErrorMessage(raw, language);
}

export function formatGenerationErrorFromApi(
  data: {
    error?: string;
    reason?: string;
    code?: string;
  },
  language: GenerationLanguage
): string {
  const code = data.code as GenerationErrorCode | undefined;
  if (code && code in COPY) {
    return formatGenerationErrorDisplay(code, language, { includeReason: false });
  }

  if (
    data.code?.toUpperCase() === "INSUFFICIENT_CREDITS" ||
    data.error?.toLowerCase().includes("not enough credits")
  ) {
    return formatGenerationErrorDisplay("INSUFFICIENT_CREDITS", language, {
      includeReason: false,
    });
  }

  const main = data.error?.trim();
  if (main) {
    const fallback = formatGenerationErrorDisplay("GENERATION_FAILED", language);
    const sanitized = sanitizeLegacyErrorMessage(main, language);
    if (!isDevRuntime() && looksLikeInternalApiError(sanitized)) {
      return fallback;
    }
    if (data.reason?.trim()) {
      const reasonSanitized = sanitizeLegacyErrorMessage(
        data.reason.replace(/\bkrea\b/gi, "engine"),
        language
      );
      if (
        reasonSanitized &&
        !looksLikeInternalApiError(reasonSanitized) &&
        !sanitized.includes(reasonSanitized) &&
        !sanitized.includes("Grund:") &&
        !sanitized.includes("Reason:")
      ) {
        return `${sanitized}\n${reasonSanitized}`;
      }
    }
    return sanitized;
  }

  return formatGenerationErrorDisplay("GENERATION_FAILED", language);
}

export function generationErrorResponse(
  cause: unknown,
  options?: {
    status?: number;
    requestId?: string;
    refunded?: boolean;
    language?: GenerationLanguage;
  }
): { body: GenerationErrorPayload; status: number } {
  const body = buildGenerationErrorFromCause(cause, {
    requestId: options?.requestId,
    refunded: options?.refunded,
    language: options?.language,
  });
  return { body, status: options?.status ?? 500 };
}

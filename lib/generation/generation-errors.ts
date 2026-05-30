/**
 * Structured generation errors — white-label user copy, safe for client formatting.
 * Internal logs may still reference provider names.
 */

export type GenerationErrorCode =
  | "MODEL_NOT_CONFIGURED"
  | "ENGINE_NOT_CONFIGURED"
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
      en: "Generation failed. Your credits were refunded.",
      de: "Generierung fehlgeschlagen. Deine Credits wurden erstattet.",
    },
    reason: {
      en: "Reason: The selected model is not configured.",
      de: "Grund: Das Modell ist nicht konfiguriert.",
    },
  },
  ENGINE_NOT_CONFIGURED: {
    error: {
      en: "The selected engine is not fully connected yet. No credits were charged.",
      de: "Die ausgewählte Engine ist noch nicht vollständig angebunden. Es wurden keine Credits abgezogen.",
    },
    reason: {
      en: "Reason: The processing engine is not configured.",
      de: "Grund: Die Rechen-Engine ist nicht konfiguriert.",
    },
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
      en: "The selected engine is not fully connected yet. No credits were charged.",
      de: "Die ausgewählte Engine ist noch nicht vollständig angebunden. Es wurden keine Credits abgezogen.",
    },
    reason: {
      en: "Reason: Motion transfer is not available on this engine yet.",
      de: "Grund: Motion Transfer ist für diese Engine noch nicht verfügbar.",
    },
  },
  KREA_LIPSYNC_NOT_IMPLEMENTED: {
    error: {
      en: "The selected engine is not fully connected yet. No credits were charged.",
      de: "Die ausgewählte Engine ist noch nicht vollständig angebunden. Es wurden keine Credits abgezogen.",
    },
    reason: {
      en: "Reason: Lip sync is not available on this engine yet.",
      de: "Grund: Lip Sync ist für diese Engine noch nicht verfügbar.",
    },
  },
  KREA_VIDEO_NOT_IMPLEMENTED: {
    error: {
      en: "The selected engine is not fully connected yet. No credits were charged.",
      de: "Die ausgewählte Engine ist noch nicht vollständig angebunden. Es wurden keine Credits abgezogen.",
    },
    reason: {
      en: "Reason: Video generation is not available on this engine yet.",
      de: "Grund: Video-Generierung ist für diese Engine noch nicht verfügbar.",
    },
  },
  NO_OUTPUT_URL: {
    error: {
      en: "Generation failed. Your credits were refunded.",
      de: "Generierung fehlgeschlagen. Deine Credits wurden erstattet.",
    },
    reason: {
      en: "Reason: The engine did not return an output URL.",
      de: "Grund: Das Modell hat keine Ausgabe-URL zurückgegeben.",
    },
  },
  GENERATION_TIMEOUT: {
    error: {
      en: "Generation failed. Your credits were refunded.",
      de: "Generierung fehlgeschlagen. Deine Credits wurden erstattet.",
    },
    reason: {
      en: "Reason: The generation timed out.",
      de: "Grund: Die Generierung hat zu lange gedauert.",
    },
  },
  UPLOAD_FAILED: {
    error: {
      en: "Generation failed. Your credits were refunded.",
      de: "Generierung fehlgeschlagen. Deine Credits wurden erstattet.",
    },
    reason: {
      en: "Reason: The upload failed.",
      de: "Grund: Der Upload ist fehlgeschlagen.",
    },
  },
  PROVIDER_ERROR: {
    error: {
      en: "The rendering engine returned an error. Your credits were refunded.",
      de: "Die Rechen-Engine hat einen Fehler zurückgegeben. Deine Credits wurden erstattet.",
    },
    reason: {
      en: "Reason: The processing engine returned an error.",
      de: "Grund: Die Rechen-Engine hat einen Fehler zurückgegeben.",
    },
  },
  GENERATION_FAILED: {
    error: {
      en: "Generation failed. Your credits were refunded.",
      de: "Generierung fehlgeschlagen. Deine Credits wurden erstattet.",
    },
    reason: {
      en: "Reason: The generation could not be completed.",
      de: "Grund: Die Generierung konnte nicht abgeschlossen werden.",
    },
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

  return {
    success: false,
    code,
    error: block.error[lang],
    ...(includeReason ? { reason: block.reason[lang] } : {}),
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

  const main = data.error?.trim();
  if (main) {
    const sanitized = sanitizeLegacyErrorMessage(main, language);
    if (data.reason?.trim()) {
      const reasonSanitized = data.reason
        .replace(/\bkrea\b/gi, "engine")
        .trim();
      if (
        reasonSanitized &&
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

/**
 * Structured errors for POST /api/krea/image/generate — safe for clients; debugReason dev-only.
 */

export type KreaImageRouteErrorCode =
  | "ROUTE_HIT"
  | "BODY_INVALID"
  | "MISSING_PROMPT"
  | "MISSING_KREA_API_KEY"
  | "UNAUTHENTICATED"
  | "CREDIT_QUERY_FAILED"
  | "INSUFFICIENT_CREDITS"
  | "MODEL_NOT_CONFIGURED"
  | "PROVIDER_REQUEST_FAILED"
  | "PROVIDER_BAD_RESPONSE"
  | "NO_OUTPUT_URL"
  | "GENERATION_INSERT_FAILED"
  | "CREDIT_REFUND_FAILED"
  | "UNKNOWN_SERVER_ERROR";

export type KreaImageRouteErrorBody = {
  success: false;
  code: KreaImageRouteErrorCode;
  error: string;
  step: string;
  requestId: string;
  refunded?: boolean;
  debugReason?: string;
  requiredCredits?: number;
};

const USER_ERROR: Record<KreaImageRouteErrorCode, string> = {
  ROUTE_HIT: "Request received.",
  BODY_INVALID: "Invalid request body.",
  MISSING_PROMPT: "Prompt is required.",
  MISSING_KREA_API_KEY: "The processing engine is not configured.",
  UNAUTHENTICATED: "Unauthorized.",
  CREDIT_QUERY_FAILED: "Credit check failed.",
  INSUFFICIENT_CREDITS: "Not enough credits.",
  MODEL_NOT_CONFIGURED: "The selected model is not configured.",
  PROVIDER_REQUEST_FAILED: "The processing engine rejected the request.",
  PROVIDER_BAD_RESPONSE: "The processing engine returned an invalid response.",
  NO_OUTPUT_URL: "Generation completed without an image output.",
  GENERATION_INSERT_FAILED: "Failed to create generation record.",
  CREDIT_REFUND_FAILED: "Generation failed; credit refund may be delayed.",
  UNKNOWN_SERVER_ERROR: "Image generation failed.",
};

const USER_ERROR_DE: Partial<Record<KreaImageRouteErrorCode, string>> = {
  MISSING_PROMPT: "Prompt ist erforderlich.",
  MISSING_KREA_API_KEY: "Die Rechen-Engine ist nicht konfiguriert.",
  UNAUTHENTICATED: "Nicht autorisiert.",
  CREDIT_QUERY_FAILED: "Credit-Prüfung fehlgeschlagen.",
  INSUFFICIENT_CREDITS: "Nicht genug Credits.",
  MODEL_NOT_CONFIGURED: "Das ausgewählte Modell ist nicht konfiguriert.",
  PROVIDER_REQUEST_FAILED:
    "Die Rechen-Engine hat einen Fehler zurückgegeben. Deine Credits wurden erstattet.",
  PROVIDER_BAD_RESPONSE:
    "Die Rechen-Engine hat einen Fehler zurückgegeben. Deine Credits wurden erstattet.",
  NO_OUTPUT_URL:
    "Die Rechen-Engine hat kein Bild zurückgegeben. Deine Credits wurden erstattet.",
  GENERATION_INSERT_FAILED: "Generierung konnte nicht gespeichert werden.",
  UNKNOWN_SERVER_ERROR:
    "Die Rechen-Engine hat einen Fehler zurückgegeben. Deine Credits wurden erstattet.",
};

export function isDevEnvironment(): boolean {
  return process.env.NODE_ENV === "development";
}

export function truncateDebugReason(message: string, max = 400): string {
  return message.length > max ? `${message.slice(0, max)}…` : message;
}

export function buildKreaImageRouteError(
  code: KreaImageRouteErrorCode,
  options: {
    requestId: string;
    step: string;
    debugReason?: string;
    refunded?: boolean;
    requiredCredits?: number;
    language?: "de" | "en";
  }
): KreaImageRouteErrorBody {
  const lang = options.language ?? "de";
  const error =
    lang === "de"
      ? (USER_ERROR_DE[code] ?? USER_ERROR[code])
      : USER_ERROR[code];

  return {
    success: false,
    code,
    error,
    step: options.step,
    requestId: options.requestId,
    ...(options.refunded !== undefined ? { refunded: options.refunded } : {}),
    ...(options.requiredCredits !== undefined
      ? { requiredCredits: options.requiredCredits }
      : {}),
    ...(isDevEnvironment() && options.debugReason
      ? { debugReason: truncateDebugReason(options.debugReason) }
      : {}),
  };
}

export function classifyProviderFailure(message: string): KreaImageRouteErrorCode {
  const lower = message.toLowerCase();
  if (
    lower.includes("422") ||
    lower.includes("validation failed") ||
    lower.includes("did not return a job_id")
  ) {
    return "PROVIDER_BAD_RESPONSE";
  }
  if (
    lower.includes("api request failed") ||
    lower.includes("404") ||
    lower.includes("403") ||
    lower.includes("401")
  ) {
    return "PROVIDER_REQUEST_FAILED";
  }
  if (lower.includes("did not return an image") || lower.includes("no image url")) {
    return "NO_OUTPUT_URL";
  }
  if (lower.includes("job failed") || lower.includes("poll failed")) {
    return "PROVIDER_BAD_RESPONSE";
  }
  return "UNKNOWN_SERVER_ERROR";
}

export function httpStatusForKreaImageError(code: KreaImageRouteErrorCode): number {
  switch (code) {
    case "BODY_INVALID":
    case "MISSING_PROMPT":
    case "MODEL_NOT_CONFIGURED":
      return 400;
    case "UNAUTHENTICATED":
      return 401;
    case "INSUFFICIENT_CREDITS":
      return 402;
    case "MISSING_KREA_API_KEY":
      return 503;
    default:
      return 500;
  }
}

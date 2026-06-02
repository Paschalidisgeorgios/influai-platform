/**
 * Structured errors for POST /api/krea/image/generate — safe for clients; debugReason dev-only.
 */

import { isDevRuntime } from "@/lib/env/runtime-ui";

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
  step?: string;
  requestId?: string;
  refunded?: boolean;
  debugReason?: string;
  requiredCredits?: number;
  creditsAvailable?: number;
};

const USER_ERROR: Record<KreaImageRouteErrorCode, string> = {
  ROUTE_HIT: "Request received.",
  BODY_INVALID: "Invalid request body.",
  MISSING_PROMPT: "Prompt is required.",
  MISSING_KREA_API_KEY: "The processing engine is not configured.",
  UNAUTHENTICATED: "Unauthorized.",
  CREDIT_QUERY_FAILED: "Credit check failed.",
  INSUFFICIENT_CREDITS:
    "You need more credits to generate this. Your credits were not charged.",
  MODEL_NOT_CONFIGURED: "This workflow is not available for rendering yet.",
  PROVIDER_REQUEST_FAILED: "The processing engine rejected the request.",
  PROVIDER_BAD_RESPONSE: "The processing engine returned an invalid response.",
  NO_OUTPUT_URL: "Generation completed without an image output.",
  GENERATION_INSERT_FAILED: "We could not save this to your Creator Gallery. Please try again.",
  CREDIT_REFUND_FAILED: "Generation failed; credit refund may be delayed.",
  UNKNOWN_SERVER_ERROR: "Image generation failed.",
};

const USER_ERROR_DE: Partial<Record<KreaImageRouteErrorCode, string>> = {
  MISSING_PROMPT: "Prompt ist erforderlich.",
  MISSING_KREA_API_KEY: "Die Rechen-Engine ist nicht konfiguriert.",
  UNAUTHENTICATED: "Nicht autorisiert.",
  CREDIT_QUERY_FAILED: "Credit-Prüfung fehlgeschlagen.",
  INSUFFICIENT_CREDITS:
    "Du brauchst mehr Credits für diese Generierung. Es wurden keine Credits abgebucht.",
  MODEL_NOT_CONFIGURED:
    "Dieser Workflow ist für Rendering noch nicht verfügbar.",
  PROVIDER_REQUEST_FAILED:
    "Die Rechen-Engine hat einen Fehler zurückgegeben. Deine Credits wurden erstattet.",
  PROVIDER_BAD_RESPONSE:
    "Die Rechen-Engine hat einen Fehler zurückgegeben. Deine Credits wurden erstattet.",
  NO_OUTPUT_URL:
    "Die Rechen-Engine hat kein Bild zurückgegeben. Deine Credits wurden erstattet.",
  GENERATION_INSERT_FAILED:
    "Speichern in der Creator Gallery ist fehlgeschlagen. Bitte erneut versuchen.",
  UNKNOWN_SERVER_ERROR:
    "Die Rechen-Engine hat einen Fehler zurückgegeben. Deine Credits wurden erstattet.",
};

export function isDevEnvironment(): boolean {
  return isDevRuntime();
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
    creditsAvailable?: number;
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
    ...(isDevRuntime() ? { step: options.step, requestId: options.requestId } : {}),
    ...(options.refunded !== undefined ? { refunded: options.refunded } : {}),
    ...(options.requiredCredits !== undefined
      ? { requiredCredits: options.requiredCredits }
      : {}),
    ...(options.creditsAvailable !== undefined
      ? { creditsAvailable: options.creditsAvailable }
      : {}),
    ...(isDevRuntime() && options.debugReason
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
    lower.includes("krea api error") ||
    lower.includes("404") ||
    lower.includes("403") ||
    lower.includes("401") ||
    lower.includes("402") ||
    lower.includes("requires a higher plan")
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

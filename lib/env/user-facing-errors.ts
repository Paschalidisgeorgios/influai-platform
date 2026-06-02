/**
 * Sanitize API / legacy error strings before showing in user UI.
 */

import { isDevRuntime } from "./runtime-ui";
import type { GenerationLanguage } from "@/lib/generation/generation-errors";
import { sanitizeLegacyErrorMessage } from "@/lib/generation/generation-errors";

const INTERNAL_MESSAGE_PATTERNS: RegExp[] = [
  /^\s*at\s+\S/m,
  /stack trace/i,
  /localhost/i,
  /127\.0\.0\.1/,
  /ECONNREFUSED/i,
  /ENOTFOUND/i,
  /debugReason/i,
  /requestId/i,
  /kreaModelId/i,
  /\bfal_[a-z0-9_]+\b/i,
  /\bkrea[-_][a-z0-9_]+\b/i,
  /validationStatus/i,
  /providerPayload/i,
  /GEN_ERR:/,
  /ENGINE_NOT_CONFIGURED::/,
  /\{"success":false/i,
  /ENABLE_[A-Z_]+ is false/i,
  /KREA_API_KEY/i,
  /INTERNAL_VALIDATION/i,
];

function looksLikeInternalErrorMessage(message: string): boolean {
  return INTERNAL_MESSAGE_PATTERNS.some((pattern) => pattern.test(message));
}

/** Safe error line for toast / inline UI — never leaks stack traces or provider payloads. */
export function sanitizeUserFacingApiError(
  message: string | undefined | null,
  fallback: string,
  language: GenerationLanguage = "en"
): string {
  const trimmed = message?.trim();
  if (!trimmed) return fallback;

  if (!isDevRuntime() && looksLikeInternalErrorMessage(trimmed)) {
    return fallback;
  }

  if (/\n\s+at\s+\S/m.test(trimmed)) {
    return fallback;
  }

  const sanitized = sanitizeLegacyErrorMessage(trimmed, language);
  if (!isDevRuntime() && looksLikeInternalErrorMessage(sanitized)) {
    return fallback;
  }

  return sanitized.slice(0, 400);
}

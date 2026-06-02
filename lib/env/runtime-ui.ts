/**
 * Runtime UI gates — dev/debug surfaces vs production user UI.
 */

export function isDevRuntime(): boolean {
  return process.env.NODE_ENV === "development";
}

export function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production";
}

/** True when dev-only UI (badges, hints, raw errors) may render. */
export function isDevUiEnabled(): boolean {
  return isDevRuntime();
}

const INTERNAL_API_ERROR_KEYS = new Set([
  "debugReason",
  "step",
  "requestId",
  "nodeEnv",
  "vercelEnv",
  "missing",
  "registryStats",
  "stack",
  "stackTrace",
  "internalReason",
  "providerPayload",
  "resolvedModelDebug",
]);

const INTERNAL_SUCCESS_KEYS = new Set([
  "provider",
  "model",
  "modelId",
  "kreaModelId",
  "storedModel",
]);

function stripInternalApiFields<T extends Record<string, unknown>>(body: T): T {
  if (isDevRuntime()) return body;

  const sanitized = { ...body };
  for (const key of INTERNAL_API_ERROR_KEYS) {
    delete sanitized[key];
  }
  for (const key of INTERNAL_SUCCESS_KEYS) {
    delete sanitized[key];
  }
  return sanitized;
}

/** Remove debug/internal fields from JSON API bodies in production. */
export function sanitizePublicApiErrorBody<T extends Record<string, unknown>>(
  body: T
): T {
  return stripInternalApiFields(body);
}

export function buildPublicErrorJson(
  body: Record<string, unknown>,
  init?: ResponseInit
): Response {
  return Response.json(stripInternalApiFields(body), init);
}

export function buildPublicJson(
  body: Record<string, unknown>,
  init?: ResponseInit
): Response {
  return Response.json(stripInternalApiFields(body), init);
}

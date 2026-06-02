/** fal.ai provider errors — server-side only; never log credentials. */

export const FAL_BALANCE_EXHAUSTED_CODE = "FAL_BALANCE_EXHAUSTED" as const;

export const FAL_ADMIN_BALANCE_HINT =
  "fal.ai balance exhausted. Top up provider balance.";

export const FAL_BALANCE_USER_MESSAGE = {
  de: "Diese Engine ist vorübergehend nicht verfügbar. Es wurden keine Credits abgezogen.",
  en: "This engine is temporarily unavailable. No credits were charged.",
} as const;

export type FalUserLanguage = keyof typeof FAL_BALANCE_USER_MESSAGE;

export class FalGenerationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number = 503,
    public readonly adminHint?: string
  ) {
    super(message);
    this.name = "FalGenerationError";
  }
}

type FalApiErrorBody = {
  detail?: unknown;
  message?: unknown;
};

export function extractFalProviderMessage(error: unknown): string | undefined {
  if (!(error instanceof Error)) {
    return typeof error === "string" ? error : undefined;
  }

  const apiError = error as Error & { body?: FalApiErrorBody; status?: number };
  const detail = apiError.body?.detail;
  if (typeof detail === "string" && detail.trim()) return detail.trim();
  if (Array.isArray(detail) && detail.length > 0) {
    return JSON.stringify(detail).slice(0, 400);
  }

  const bodyMessage = apiError.body?.message;
  if (typeof bodyMessage === "string" && bodyMessage.trim()) return bodyMessage.trim();
  if (error.message && error.message !== "Forbidden") return error.message;
  if (apiError.status === 403) {
    return "Forbidden — check provider permissions or account balance.";
  }

  return error.message;
}

export function isFalBalanceExhaustedMessage(message: string | undefined): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return (
    lower.includes("exhausted balance") ||
    lower.includes("user is locked") ||
    (lower.includes("top up") && lower.includes("balance"))
  );
}

export function mapFalProviderError(error: unknown): {
  errorCode: string;
  message: string;
  adminHint?: string;
} {
  const providerMessage = extractFalProviderMessage(error);

  if (providerMessage?.includes("NO_OUTPUT_URL")) {
    return { errorCode: "NO_OUTPUT_URL", message: "Provider returned no output URL." };
  }

  if (
    providerMessage?.includes("MISSING_VALIDATION") ||
    providerMessage?.includes("MISSING_")
  ) {
    return {
      errorCode: "MISSING_VALIDATION_FIXTURE",
      message: providerMessage.slice(0, 400),
    };
  }

  if (isFalBalanceExhaustedMessage(providerMessage)) {
    return {
      errorCode: FAL_BALANCE_EXHAUSTED_CODE,
      message: (providerMessage ?? FAL_ADMIN_BALANCE_HINT).slice(0, 400),
      adminHint: FAL_ADMIN_BALANCE_HINT,
    };
  }

  return {
    errorCode: "PROVIDER_FAILED",
    message: (providerMessage ?? "Provider request failed.").slice(0, 400),
  };
}

export function throwMappedFalError(error: unknown): never {
  const mapped = mapFalProviderError(error);
  throw new FalGenerationError(
    mapped.message,
    mapped.errorCode,
    mapped.errorCode === FAL_BALANCE_EXHAUSTED_CODE ? 503 : 502,
    mapped.adminHint
  );
}

export function isFalBalanceExhaustedError(error: unknown): boolean {
  if (error instanceof FalGenerationError) {
    return error.code === FAL_BALANCE_EXHAUSTED_CODE;
  }
  return isFalBalanceExhaustedMessage(extractFalProviderMessage(error));
}

export function getFalBalanceUserMessage(language: FalUserLanguage): string {
  return FAL_BALANCE_USER_MESSAGE[language];
}

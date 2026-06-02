import { FEATURE_DISABLED_MESSAGE } from "@/lib/launch/messages";
import { getKreaApiKey } from "./krea";
import { isKreaEnabled } from "./krea-workflows";

/** Server-side feature gates — safe at build time (no API key reads). */
export function isKreaProviderEnabled(): boolean {
  return isKreaEnabled();
}

/** fal.ai provider for video, motion, lipsync, enhancer when Krea is plan-limited. */
export function isFalProviderEnabled(): boolean {
  if (process.env.ENABLE_FAL_PROVIDER === "false") return false;
  if (process.env.ENABLE_FAL_PROVIDER === "true") {
    return Boolean(process.env.FAL_KEY?.trim());
  }
  return Boolean(process.env.FAL_KEY?.trim());
}

export function isCreatifyProviderEnabled(): boolean {
  return process.env.ENABLE_CREATIFY_PROVIDER === "true";
}

export function assertKreaConfigured(): void {
  if (!isKreaProviderEnabled()) {
    throw new Error(FEATURE_DISABLED_MESSAGE);
  }
  getKreaApiKey();
}
export function assertFalConfigured(): void {
  if (!isFalProviderEnabled()) {
    throw new Error(FEATURE_DISABLED_MESSAGE);
  }
  if (!process.env.FAL_KEY?.trim()) {
    throw new Error("FAL_KEY is not configured.");
  }
}

export function assertCreatifyConfigured(): void {
  if (!isCreatifyProviderEnabled()) {
    throw new Error(FEATURE_DISABLED_MESSAGE);
  }
  if (!process.env.CREATIFY_API_KEY?.trim()) {
    throw new Error("CREATIFY_API_KEY is not configured.");
  }

  if (!process.env.CREATIFY_API_ID?.trim()) {
    throw new Error(
      "CREATIFY_API_ID is not configured (required by Creatify X-API-ID header)."
    );
  }
}

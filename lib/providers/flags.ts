import { FEATURE_DISABLED_MESSAGE } from "@/lib/launch/messages";
import { getKreaApiKey } from "./krea";
import { isKreaEnabled } from "./krea-workflows";

/** Server-side feature gates — safe at build time (no API key reads). */
export function isKreaProviderEnabled(): boolean {
  return isKreaEnabled();
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

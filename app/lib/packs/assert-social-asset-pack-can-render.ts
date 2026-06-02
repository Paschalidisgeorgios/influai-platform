/**
 * Server-only gate for paid Social Asset Pack render.
 * Does not depend on client-side tool resolution or engine registry checks.
 */

import { isLaunchFeatureEnabled } from "@/app/lib/config/launch";
import {
  ToolRunBlockedError,
  ToolRunInsufficientCreditsError,
  getToolRunBlockedUserMessage,
} from "@/app/lib/tools/assert-tool-can-run";
import { getSocialAssetPackTotalCredits } from "./social-asset-pack";

function hasPackProviderEnv(): boolean {
  if (process.env.NEXT_PUBLIC_APP_URL?.trim()) return true;
  if (process.env.NODE_ENV === "production") return true;
  if (process.env.KREA_API_KEY?.trim()) return true;
  if (process.env.FAL_KEY?.trim()) return true;
  return false;
}

export function assertSocialAssetPackCanRender(input: {
  userCreditBalance?: number | null;
  language?: "en" | "de";
}): { requiredCredits: number } {
  const language = input.language === "de" ? "de" : "en";

  if (!isLaunchFeatureEnabled("enableSocialAssetPack")) {
    throw new ToolRunBlockedError(
      "TOOL_DISABLED",
      language === "de" ? "Pack ist nicht verfügbar." : "Pack is not available.",
      403,
      "enableSocialAssetPack=false"
    );
  }

  if (!hasPackProviderEnv()) {
    throw new ToolRunBlockedError(
      "PROVIDER_ROUTE_MISSING",
      getToolRunBlockedUserMessage(language),
      403,
      "pack provider env missing"
    );
  }

  const requiredCredits = getSocialAssetPackTotalCredits();

  if (
    typeof input.userCreditBalance === "number" &&
    input.userCreditBalance < requiredCredits
  ) {
    throw new ToolRunInsufficientCreditsError(
      requiredCredits,
      language === "de" ? "Nicht genug Credits." : "Not enough credits."
    );
  }

  return { requiredCredits };
}

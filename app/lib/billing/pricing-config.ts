/**
 * Launch-safe monetization pricing config.
 * Package definitions live in credit-packages.ts — this file adds UX copy helpers.
 */

import {
  CREDIT_PACKAGES,
  getCreditPackageByKey,
  getRecommendedPackageKey,
  type CreditPackage,
  type PackageKey,
} from "./credit-packages";

export const MONETIZATION_COPY = {
  creditsUsedFor: {
    en: "Credits are used for image generation, video rendering and premium creator tools.",
    de: "Credits werden für Bildgenerierung, Video-Rendering und Premium-Creator-Tools verwendet.",
  },
  costBeforeRender: {
    en: "Actual usage depends on the selected mode. You always see the credit cost before rendering.",
    de: "Die tatsächliche Nutzung hängt vom gewählten Modus ab. Du siehst die Credit-Kosten immer vor dem Rendern.",
  },
  buyToKeepCreating: {
    en: "Add credits to keep creating.",
    de: "Credits hinzufügen, um weiter zu erstellen.",
  },
  upgradeAdvanced: {
    en: "Upgrade Plan",
    de: "Plan upgraden",
  },
  exportIncluded: {
    en: "Download is included — no extra charge for this asset.",
    de: "Download ist enthalten — keine Extra-Kosten für dieses Asset.",
  },
  hdRenderSeparate: {
    en: "HD upscale or re-render may use additional credits.",
    de: "HD-Upscale oder Re-Render kann zusätzliche Credits kosten.",
  },
  betterValue: {
    en: "Better value",
    de: "Besseres Preis-Leistungs-Verhältnis",
  },
  saveVsStarter: {
    en: (pct: number) => `Save ${pct}% vs Starter`,
    de: (pct: number) => `${pct}% günstiger als Starter`,
  },
} as const;

/** Custom top-up rate — must match app/api/stripe/checkout route (€0.10/credit). */
export const CUSTOM_CREDIT_UNIT_EUR = 0.1;

export function getStripePricingPackages(): readonly CreditPackage[] {
  return CREDIT_PACKAGES;
}

export function getPackageByKey(key: PackageKey): CreditPackage | undefined {
  return getCreditPackageByKey(key);
}

export function getRecommendedPackageForCredits(required: number): PackageKey {
  return getRecommendedPackageKey(required);
}

export {
  CREATOR_TOOL_CREDIT_COSTS,
  getCreatorToolCreditCost,
  IMAGE_MODE_CREDIT_COSTS,
  CREATE_MOTION_VIDEO_CREDITS,
} from "./tool-credit-costs";

/**
 * Access tier metadata — soft hints only until subscription tiers are enforced.
 */

import type { AccessTier } from "@/app/lib/model-modes/types";

const TIER_RANK: Record<AccessTier, number> = {
  free: 0,
  creator: 1,
  pro: 2,
  enterprise: 3,
};

export function normalizeUserPlan(
  plan?: AccessTier | string | null
): AccessTier {
  const value = (plan ?? "free").toString().trim().toLowerCase();
  if (value === "creator" || value === "pro" || value === "enterprise") {
    return value;
  }
  return "free";
}

export function meetsAccessTier(
  userTier: AccessTier,
  requiredTier: AccessTier
): boolean {
  return TIER_RANK[userTier] >= TIER_RANK[requiredTier];
}

/**
 * Show upgrade hint when mode requires a higher tier.
 * Does NOT block generation — credit balance remains the gate.
 */
export function shouldShowUpgradeHint(
  userPlan: AccessTier | string | null | undefined,
  requiredTier: AccessTier
): boolean {
  const userTier = normalizeUserPlan(userPlan);
  return !meetsAccessTier(userTier, requiredTier);
}

export function getAccessTierLabel(
  tier: AccessTier,
  language: "en" | "de" = "en"
): string {
  const labels: Record<AccessTier, { en: string; de: string }> = {
    free: { en: "Free", de: "Free" },
    creator: { en: "Creator", de: "Creator" },
    pro: { en: "Pro", de: "Pro" },
    enterprise: { en: "Enterprise", de: "Enterprise" },
  };
  return language === "de" ? labels[tier].de : labels[tier].en;
}

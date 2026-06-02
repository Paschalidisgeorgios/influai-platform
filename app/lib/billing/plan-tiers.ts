/**
 * Plan tier metadata — upgrade pressure and comparison UX.
 * Subscriptions are not enforced yet; credits remain the generation gate.
 */

import type { AccessTier } from "@/app/lib/model-modes/types";

export type PlanTierId = AccessTier;

export type PlanTierDefinition = {
  id: PlanTierId;
  label: string;
  tagline: string;
  features: string[];
  /** Future: included monthly credits when subscription exists */
  monthlyCreditsIncluded?: number;
  hasSubscriptionCheckout: boolean;
};

export const PLAN_TIERS: Record<PlanTierId, PlanTierDefinition> = {
  free: {
    id: "free",
    label: "Free",
    tagline: "Explore and plan before you render.",
    features: [
      "Prompt assist",
      "Creative Score (basic)",
      "Gallery browsing",
      "Mode & preset browsing",
      "Image generation when you have credits",
    ],
    hasSubscriptionCheckout: false,
  },
  creator: {
    id: "creator",
    label: "Creator",
    tagline: "Regular image and video creation.",
    features: [
      "Premium image modes",
      "Video generation with credits",
      "Style variants",
      "Larger gallery limits (when enabled)",
    ],
    monthlyCreditsIncluded: undefined,
    hasSubscriptionCheckout: false,
  },
  pro: {
    id: "pro",
    label: "Pro",
    tagline: "Advanced creator workflows.",
    features: [
      "Future: Animate Image",
      "Future: LipSync Creator",
      "Future: AI Avatar",
      "Future: Enhance & Upscale",
      "Future: 3D generation",
      "Priority limits (when enabled)",
    ],
    hasSubscriptionCheckout: false,
  },
  enterprise: {
    id: "enterprise",
    label: "Enterprise",
    tagline: "Teams and high-volume production.",
    features: ["Custom limits", "Dedicated support", "Team workflows"],
    hasSubscriptionCheckout: false,
  },
};

export const PLAN_TIER_ORDER: PlanTierId[] = [
  "free",
  "creator",
  "pro",
  "enterprise",
];

export function getPlanTier(id: PlanTierId): PlanTierDefinition {
  return PLAN_TIERS[id];
}

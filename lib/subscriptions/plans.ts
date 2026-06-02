export type SubscriptionPlanKey = "creator" | "pro" | "studio";

export type SubscriptionPlan = {
  key: SubscriptionPlanKey;
  name: string;
  priceEurMonthly: number;
  creditsPerMonth: number;
  stripePriceId: string;
  features: string[];
  highlight?: boolean;
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    key: "creator",
    name: "Creator",
    priceEurMonthly: 19,
    creditsPerMonth: 200,
    stripePriceId: process.env.STRIPE_SUB_PRICE_CREATOR!,
    features: [
      "200 Credits/Monat",
      "Alle Image-Modi",
      "Style Profiles",
      "Asset Gallery",
      "Email Support",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    priceEurMonthly: 49,
    creditsPerMonth: 600,
    stripePriceId: process.env.STRIPE_SUB_PRICE_PRO!,
    highlight: true,
    features: [
      "600 Credits/Monat",
      "Alle Image & Video-Modi",
      "Unbegrenzte Style Profiles",
      "Asset Gallery + Export",
      "Priority Support",
      "Credits Rollover (50%)",
    ],
  },
  {
    key: "studio",
    name: "Studio",
    priceEurMonthly: 99,
    creditsPerMonth: 1500,
    stripePriceId: process.env.STRIPE_SUB_PRICE_STUDIO!,
    features: [
      "1500 Credits/Monat",
      "Alle Modi + Beta Features",
      "Team Workspace (3 Seats)",
      "Brand Kit",
      "API Access",
      "100% Credits Rollover",
      "Dedicated Support",
    ],
  },
];

export function getSubscriptionPlanByKey(
  key: string
): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find((plan) => plan.key === key);
}

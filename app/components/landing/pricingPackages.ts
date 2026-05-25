export type PackageKey = "starter" | "professional" | "ultimate";

/** Must match Stripe checkout / webhook credit grants (100, 500, 2000). */
export type PricingPackage = {
  key: PackageKey;
  name: string;
  credits: number;
  priceEur: number;
  highlight?: boolean;
  badge?: string;
};

export const PRICING_PACKAGES: PricingPackage[] = [
  {
    key: "starter",
    name: "Starter",
    credits: 100,
    priceEur: 9,
  },
  {
    key: "professional",
    name: "Professional",
    credits: 500,
    priceEur: 29,
    highlight: true,
    badge: "Recommended",
  },
  {
    key: "ultimate",
    name: "Ultimate",
    credits: 2000,
    priceEur: 79,
  },
];

/** Fixed format — avoids Intl/locale differences between SSR and browser. */
export function formatEurPrice(amount: number) {
  return `€${amount}`;
}

export function formatCredits(amount: number) {
  return String(amount);
}

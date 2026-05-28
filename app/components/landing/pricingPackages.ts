export type PackageKey = "starter" | "professional" | "ultimate";

/**
 * Stripe checkout + webhook currently grant 100 / 500 / 2000 credits per package.
 * `displayCredits` is shown in dashboard billing UI until backend packages align.
 */
export type PricingPackage = {
  key: PackageKey;
  name: string;
  /** Credits granted at checkout (must match app/api/stripe/*). */
  credits: number;
  /** Marketing display in dashboard billing UI. */
  displayCredits: number;
  priceEur: number;
  highlight?: boolean;
  badge?: string;
};

export const PRICING_PACKAGES: PricingPackage[] = [
  {
    key: "starter",
    name: "Starter",
    credits: 100,
    displayCredits: 50,
    priceEur: 9,
  },
  {
    key: "professional",
    name: "Professional",
    credits: 500,
    displayCredits: 250,
    priceEur: 29,
    highlight: true,
    badge: "Recommended",
  },
  {
    key: "ultimate",
    name: "Ultimate",
    credits: 2000,
    displayCredits: 1000,
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

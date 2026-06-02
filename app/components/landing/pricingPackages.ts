export type PricingPackageKey = "starter" | "professional" | "ultimate";

export type PricingPackage = {
  key: PricingPackageKey;
  credits: number;
  displayCredits: number;
  priceEur: number;
  priceLabel: string;
};

export const PRICING_PACKAGES: readonly PricingPackage[] = [
  {
    key: "starter",
    credits: 100,
    displayCredits: 100,
    priceEur: 9,
    priceLabel: "€9",
  },
  {
    key: "professional",
    credits: 500,
    displayCredits: 500,
    priceEur: 29,
    priceLabel: "€29",
  },
  {
    key: "ultimate",
    credits: 2000,
    displayCredits: 2000,
    priceEur: 79,
    priceLabel: "€79",
  },
] as const;

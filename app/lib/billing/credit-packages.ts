/**
 * Single source of truth for credit packages across landing, dashboard and billing UI.
 * Stripe checkout keys (starter / professional / ultimate) are internal — user-facing
 * labels are Starter, Creator and Pro. Do not change webhook grant amounts here without
 * aligning app/api/stripe/checkout and webhook metadata.
 */

export type PackageKey = "starter" | "professional" | "ultimate";

export type CreditPackage = {
  /** Stripe checkout + webhook key */
  key: PackageKey;
  /** User-facing package name */
  label: string;
  credits: number;
  priceEur: number;
  priceLabel: string;
  /** Short tagline for cards and summaries */
  copy: { en: string; de: string };
  /** What credits approximately buy — not exact guarantees */
  approximateUsage: { en: string; de: string };
  ctaLabel: { en: string; de: string };
  badge?: { en: string; de: string };
  highlight?: boolean;
};

export const CREDIT_PACKAGES: readonly CreditPackage[] = [
  {
    key: "starter",
    label: "Starter",
    credits: 100,
    priceEur: 9,
    priceLabel: "€9",
    copy: {
      en: "Test ideas and create your first assets.",
      de: "Ideen testen und erste Assets erstellen.",
    },
    approximateUsage: {
      en: "Enough to test ideas, create first assets and render several premium images.",
      de: "Reicht zum Testen von Ideen, ersten Assets und mehreren Premium-Bildern.",
    },
    ctaLabel: { en: "Buy Starter", de: "Starter kaufen" },
  },
  {
    key: "professional",
    label: "Creator",
    credits: 500,
    priceEur: 29,
    priceLabel: "€29",
    badge: { en: "Most Popular", de: "Am beliebtesten" },
    highlight: true,
    copy: {
      en: "Regular content creation, variants and motion workflows.",
      de: "Regelmäßige Content-Erstellung, Varianten und Motion-Workflows.",
    },
    approximateUsage: {
      en: "Best for regular content creation, variants and motion workflows. Around 20 motion videos or multiple Social Asset Packs.",
      de: "Am besten für regelmäßige Content-Erstellung, Varianten und Motion-Workflows. Rund 20 Motion-Videos oder mehrere Social Asset Packs.",
    },
    ctaLabel: { en: "Buy Creator", de: "Creator kaufen" },
  },
  {
    key: "ultimate",
    label: "Pro",
    credits: 2000,
    priceEur: 79,
    priceLabel: "€79",
    copy: {
      en: "High-volume creators and premium workflows.",
      de: "Creator mit hohem Output und Premium-Workflows.",
    },
    approximateUsage: {
      en: "For frequent creators, larger asset packs, premium rendering and advanced workflows.",
      de: "Für häufige Creator, größere Asset-Packs, Premium-Rendering und erweiterte Workflows.",
    },
    ctaLabel: { en: "Buy Pro", de: "Pro kaufen" },
  },
] as const;

/** Reference costs for pricing UX — advisory; actual mode costs may vary. */
export const CREDIT_MODE_COST_REFERENCES = [
  {
    id: "fast_draft",
    labelEn: "Fast Draft Image",
    labelDe: "Fast Draft Image",
    credits: 1,
  },
  {
    id: "premium_image",
    labelEn: "Premium Image",
    labelDe: "Premium Image",
    credits: 3,
  },
  {
    id: "motion_video",
    labelEn: "Motion Video",
    labelDe: "Motion Video",
    credits: 25,
  },
  {
    id: "social_asset_pack",
    labelEn: "Social Asset Pack",
    labelDe: "Social Asset Pack",
    credits: 45,
  },
] as const;

/** Shown near credit packs — actual costs vary by mode. */
export const CREDIT_USAGE_DISCLAIMER = {
  en: "Actual usage depends on the selected mode. You always see the credit cost before rendering.",
  de: "Die tatsächliche Nutzung hängt vom gewählten Modus ab. Die Kosten werden immer vor dem Rendern angezeigt.",
} as const;

export function getCreditUsageDisclaimer(language: "en" | "de"): string {
  return CREDIT_USAGE_DISCLAIMER[language];
}

/** @deprecated Use CREDIT_PACKAGES — kept for gradual migration */
export const CREDIT_PACKAGE_RECOMMENDATIONS = CREDIT_PACKAGES.map((pkg) => ({
  id: pkg.key,
  label: pkg.label,
  displayCredits: pkg.credits,
  grantedCredits: pkg.credits,
  suggestedPriceEur: pkg.priceEur,
  description: pkg.approximateUsage.en,
  highlight: pkg.highlight,
}));

export function getCreditPackages(): readonly CreditPackage[] {
  return CREDIT_PACKAGES;
}

export function getCreditPackageByKey(
  key: PackageKey
): CreditPackage | undefined {
  return CREDIT_PACKAGES.find((pkg) => pkg.key === key);
}

/** @deprecated Use getCreditPackageByKey */
export function getCreditPackageRecommendation(key: PackageKey) {
  const pkg = getCreditPackageByKey(key);
  if (!pkg) return undefined;
  return CREDIT_PACKAGE_RECOMMENDATIONS.find((p) => p.id === key);
}

export function formatEurPrice(amount: number): string {
  return `€${amount}`;
}

export function formatCredits(amount: number): string {
  return amount.toLocaleString("en-US");
}

export function formatPackageCredits(
  credits: number,
  language: "en" | "de"
): string {
  const formatted = credits.toLocaleString(language === "de" ? "de-DE" : "en-US");
  return `${formatted} ${language === "de" ? "Credits" : "Credits"}`;
}

export function getCreditPackageRateEur(pkg: CreditPackage): number {
  return pkg.priceEur / pkg.credits;
}

/** Percent savings vs Starter rate — null for baseline package. */
export function getCreditPackageSavingsPercent(
  pkg: CreditPackage
): number | null {
  const baseline = CREDIT_PACKAGES[0];
  if (!baseline || pkg.key === baseline.key) return null;
  const baselineRate = getCreditPackageRateEur(baseline);
  const rate = getCreditPackageRateEur(pkg);
  if (baselineRate <= 0) return null;
  return Math.round((1 - rate / baselineRate) * 100);
}

export function getBestPackageForMissingCredits(missing: number): CreditPackage {
  const sorted = [...CREDIT_PACKAGES].sort((a, b) => a.credits - b.credits);
  return (
    sorted.find((pkg) => pkg.credits >= missing) ??
    sorted[sorted.length - 1]!
  );
}

export function getRecommendedPackageKey(required: number): PackageKey {
  if (required <= 100) return "starter";
  if (required <= 500) return "professional";
  return "ultimate";
}

/** Landing / dashboard display rows — single source for names, credits, prices, CTAs. */
export function getCreditPackageDisplayRows(language: "en" | "de") {
  const lang = language === "de" ? "de" : "en";
  return CREDIT_PACKAGES.map((pkg) => ({
    key: pkg.key,
    name: pkg.label,
    credits: pkg.credits,
    creditsLabel: formatPackageCredits(pkg.credits, lang),
    priceEur: pkg.priceEur,
    priceLabel: pkg.priceLabel,
    popular: Boolean(pkg.highlight),
    badge: pkg.badge?.[lang],
    ctaLabel: pkg.ctaLabel[lang],
    savingsPercent: getCreditPackageSavingsPercent(pkg),
    copy: pkg.copy[lang],
    approximateUsage: pkg.approximateUsage[lang],
  }));
}

export function formatCreditPackagesPricingSummary(language: "en" | "de"): string {
  const rows = getCreditPackageDisplayRows(language);
  if (language === "de") {
    return rows
      .map((row) => {
        const badge = row.badge ? ` (${row.badge})` : "";
        return `${row.name}: ${row.creditsLabel} für ${row.priceLabel}${badge}`;
      })
      .join(" · ");
  }
  return rows
    .map((row) => {
      const badge = row.badge ? ` (${row.badge})` : "";
      return `${row.name}: ${row.creditsLabel} for ${row.priceLabel}${badge}`;
    })
    .join(" · ");
}

export type CheckoutResult = { url?: string; error?: string };

/** Redirect checkout via existing /api/stripe/checkout — no webhook changes. */
export async function startCreditPackageCheckout(
  packageKey: PackageKey,
  accessToken: string,
  origin?: string
): Promise<CheckoutResult> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
  if (origin) headers["x-origin"] = origin;

  const response = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers,
    body: JSON.stringify({ packageKey }),
  });

  const data = (await response.json()) as { url?: string; error?: string };
  if (!response.ok || !data.url) {
    return { error: data.error ?? "Checkout failed." };
  }
  return { url: data.url };
}

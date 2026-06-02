"use client";

import Link from "next/link";
import { PLAN_TIER_ORDER, getPlanTier } from "@/app/lib/billing/plan-tiers";
import { CREDIT_PACKAGES } from "@/app/lib/billing/credit-packages";
import type { PackageKey } from "@/app/lib/billing/credit-packages";
import CreditPackCard from "@/app/components/billing/CreditPackCard";
import BillingCheckoutButton, {
  BillingCreditsLink,
} from "@/app/components/billing/BillingCheckoutButton";
import { CREDITS_PAGE } from "@/lib/copy/launch-user-copy";

type Props = {
  language?: "en" | "de";
  showCreditPacks?: boolean;
  className?: string;
};

const TIER_TO_PACKAGE: Partial<Record<string, PackageKey>> = {
  creator: "professional",
  pro: "ultimate",
};

export default function PlanComparisonCards({
  language = "en",
  showCreditPacks = true,
  className = "",
}: Props) {
  const isDe = language === "de";
  const lang = isDe ? "de" : "en";

  return (
    <div className={`space-y-10 ${className}`}>
      <div className="grid gap-4 md:grid-cols-3">
        {PLAN_TIER_ORDER.filter((id) => id !== "enterprise").map((tierId) => {
          const tier = getPlanTier(tierId);
          const packageKey = TIER_TO_PACKAGE[tierId];
          const matchedPackage = packageKey
            ? CREDIT_PACKAGES.find((pkg) => pkg.key === packageKey)
            : undefined;

          return (
            <div
              key={tierId}
              className={`rounded-2xl border p-5 ${
                tierId === "creator"
                  ? "border-amber-500/40 bg-amber-500/5"
                  : "border-neutral-800 bg-neutral-900/40"
              }`}
            >
              <h3 className="text-lg font-bold text-white">{tier.label}</h3>
              <p className="mt-1 text-sm text-neutral-400">{tier.tagline}</p>
              <ul className="mt-4 space-y-2">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-2 text-xs text-neutral-300">
                    <span className="text-emerald-400">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              {tierId === "free" ? (
                <Link
                  href="/auth"
                  className="mt-5 inline-block rounded-xl border border-neutral-700 px-4 py-2 text-sm font-semibold text-white hover:border-amber-500/40"
                >
                  {isDe ? "Kostenlos starten" : "Start free"}
                </Link>
              ) : matchedPackage ? (
                <BillingCheckoutButton
                  packageKey={matchedPackage.key}
                  label={matchedPackage.ctaLabel[lang]}
                  className="mt-5"
                />
              ) : (
                <BillingCreditsLink>
                  {CREDITS_PAGE.buyCredits[lang]}
                </BillingCreditsLink>
              )}
            </div>
          );
        })}
      </div>

      {showCreditPacks ? (
        <div>
          <h3 className="text-center text-sm font-bold uppercase tracking-wider text-neutral-500">
            {CREDITS_PAGE.creditPacks[lang]}
          </h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {CREDIT_PACKAGES.map((pkg) => (
              <CreditPackCard key={pkg.key} pkg={pkg} language={lang} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

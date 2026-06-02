"use client";

import CreditPackCard from "@/app/components/billing/CreditPackCard";
import CreditModeCostReference from "@/app/components/billing/CreditModeCostReference";
import { CREDIT_PACKAGES } from "@/app/lib/billing/credit-packages";
import { LANDING_LAYOUT } from "@/lib/obsidian/premium-tokens";
import type { LandingLanguage } from "./magnificContent";
import { magnificContent } from "./magnificContent";

export default function BrutalistPricingGrid({
  currentLanguage,
}: {
  currentLanguage: LandingLanguage;
}) {
  const t = magnificContent[currentLanguage].pricing;
  const lang = currentLanguage === "de" ? "de" : "en";

  return (
    <section id="pricing" className={`bg-[#050505] ${LANDING_LAYOUT.section}`}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-2xl font-black uppercase italic leading-none tracking-tight text-white sm:text-4xl md:text-5xl">
          {t.headline}
        </h2>
        <p className="mt-4 text-sm text-neutral-400">{t.subheadline}</p>

        <div className={`${LANDING_LAYOUT.afterHeader} grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-6`}>
          {CREDIT_PACKAGES.map((pkg) => (
            <CreditPackCard
              key={pkg.key}
              pkg={pkg}
              language={lang}
              appearance="landing"
            />
          ))}
        </div>

        <div className="mx-auto mt-8 max-w-2xl">
          <CreditModeCostReference language={lang} />
        </div>
      </div>
    </section>
  );
}

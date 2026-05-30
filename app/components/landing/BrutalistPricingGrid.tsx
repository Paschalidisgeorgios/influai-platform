"use client";

import { motion } from "framer-motion";
import type { LandingLanguage } from "./magnificContent";
import { magnificContent } from "./magnificContent";
import { PRICING_PACKAGES, formatEurPrice } from "./pricingPackages";
import type { PackageKey } from "./pricingPackages";
import LandingCheckoutButton from "./LandingCheckoutButton";
import { OBS_SPRING } from "@/lib/obsidian/dashboard-tokens";

export default function BrutalistPricingGrid({
  currentLanguage,
}: {
  currentLanguage: LandingLanguage;
}) {
  const t = magnificContent[currentLanguage].pricing;

  return (
    <section id="pricing" className="bg-[#050505] py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-2xl font-black uppercase italic leading-none tracking-tight text-white sm:text-4xl md:text-5xl">
          {t.headline}
        </h2>
        <p className="mt-4 text-sm text-neutral-500">{t.subheadline}</p>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {PRICING_PACKAGES.map((plan, index) => {
            const details = t.plans[plan.key as PackageKey];
            const credits = plan.credits;

            return (
              <motion.article
                key={plan.key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...OBS_SPRING, delay: index * 0.08 }}
                className="group flex flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl transition hover:border-amber-500/30 hover:shadow-[0_0_30px_rgba(245,158,11,0.1)]"
              >
                {details.badge ? (
                  <span className="mb-4 inline-flex w-fit rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-400">
                    {details.badge}
                  </span>
                ) : (
                  <span className="mb-4 h-6" />
                )}

                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-white">{plan.name}</h3>
                  <p className="mt-2 text-3xl font-black text-white">
                    {formatEurPrice(plan.priceEur)}
                    <span className="ml-2 text-xs font-bold uppercase tracking-widest text-neutral-500">
                      {t.oneTime}
                    </span>
                  </p>
                  <p className="mt-2 text-lg font-black text-amber-400">
                    {credits} {currentLanguage === "de" ? "Credits" : "Credits"}
                  </p>
                  <p className="mt-6 text-sm leading-relaxed text-neutral-400">{details.tagline}</p>
                </div>

                <div className="mt-8">
                  <LandingCheckoutButton
                    packageKey={plan.key}
                    language={currentLanguage}
                    label={details.buyLabel}
                    highlighted={plan.key === "professional"}
                    pulseOnCardHover={plan.key !== "professional"}
                  />
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

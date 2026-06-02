"use client";

import { motion } from "framer-motion";
import type { LandingLanguage } from "./magnificContent";
import { magnificContent } from "./magnificContent";
import {
  getCreditPackageDisplayRows,
} from "@/app/lib/billing/credit-packages";
import CreditModeCostReference from "@/app/components/billing/CreditModeCostReference";
import { MONETIZATION_COPY } from "@/app/lib/billing/pricing-config";
import { OBS_SPRING } from "@/lib/obsidian/dashboard-tokens";

export default function CreditValueStrip({
  currentLanguage,
}: {
  currentLanguage: LandingLanguage;
}) {
  const t = magnificContent[currentLanguage].creditValue;
  const lang = currentLanguage === "de" ? "de" : "en";
  const packs = getCreditPackageDisplayRows(lang);

  return (
    <section className="border-y border-white/10 bg-[#050505] py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={OBS_SPRING}
          className="max-w-3xl"
        >
          <h2 className="text-2xl font-black uppercase italic tracking-tight text-white sm:text-3xl">
            {t.headline}
          </h2>
          <p className="mt-4 text-base leading-7 text-white/65 sm:text-lg">{t.subline}</p>
          {"billingLines" in t && t.billingLines?.length ? (
            <ul className="mt-4 space-y-2 text-sm text-white/60">
              {t.billingLines.map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="text-amber-400">·</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </motion.div>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {packs.map((pack, index) => (
            <motion.article
              key={pack.key}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ...OBS_SPRING, delay: index * 0.06 }}
              whileHover={{ y: -2 }}
              className={`rounded-3xl border p-6 backdrop-blur-xl transition ${
                pack.popular
                  ? "border-amber-500/35 bg-amber-500/8 shadow-[0_0_30px_rgba(245,158,11,0.12)]"
                  : "border-white/10 bg-white/[0.05] hover:border-amber-500/30 hover:shadow-[0_0_30px_rgba(245,158,11,0.12)]"
              }`}
            >
              {pack.badge ? (
                <span className="mb-3 inline-flex rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-300">
                  {pack.badge}
                </span>
              ) : (
                <span className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/15 text-sm font-black text-amber-400">
                  {index + 1}
                </span>
              )}
              <h3 className="text-lg font-black uppercase tracking-tight text-white">
                {pack.name}
              </h3>
              <p className="mt-2 text-2xl font-black text-white">{pack.priceLabel}</p>
              <p className="mt-1 text-sm font-bold text-amber-300">{pack.creditsLabel}</p>
              {pack.savingsPercent !== null && pack.savingsPercent > 0 ? (
                <p className="mt-2 text-xs font-semibold text-emerald-400">
                  {MONETIZATION_COPY.saveVsStarter[lang](pack.savingsPercent)} ·{" "}
                  {MONETIZATION_COPY.betterValue[lang]}
                </p>
              ) : null}
              <p className="mt-3 text-sm leading-relaxed text-neutral-400">
                {pack.approximateUsage}
              </p>
            </motion.article>
          ))}
        </div>

        <div className="mx-auto mt-8 max-w-2xl">
          <CreditModeCostReference language={lang} />
        </div>
        <p className="mt-4 text-center text-sm font-medium text-amber-400/90">{t.conversion}</p>
      </div>
    </section>
  );
}

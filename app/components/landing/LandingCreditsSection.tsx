"use client";

import { motion } from "framer-motion";
import { Coins } from "lucide-react";
import type { LandingLanguage } from "./magnificContent";
import { magnificContent } from "./magnificContent";
import { getCreditPackageDisplayRows } from "@/app/lib/billing/credit-packages";
import { LANDING_SECTION_SCROLL_MT } from "@/lib/landing/landing-section-nav";
import { LANDING_LAYOUT, PREMIUM_CLASSES } from "@/lib/obsidian/premium-tokens";
import { OBS_SPRING } from "@/lib/obsidian/dashboard-tokens";

export default function LandingCreditsSection({
  currentLanguage,
}: {
  currentLanguage: LandingLanguage;
}) {
  const t = magnificContent[currentLanguage].landingCredits;
  const m = t.mockup;
  const lang = currentLanguage === "de" ? "de" : "en";
  const packs = getCreditPackageDisplayRows(lang);

  return (
    <section
      id="credits"
      className={`border-t border-white/[0.06] bg-transparent ${LANDING_SECTION_SCROLL_MT} ${LANDING_LAYOUT.sectionCompact}`}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className={`grid lg:grid-cols-2 lg:items-start ${LANDING_LAYOUT.gridWide}`}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={OBS_SPRING}
          >
            <p className={PREMIUM_CLASSES.mono}>Credits</p>
            <h2 className="mt-2 text-2xl font-black uppercase italic tracking-tight text-white sm:text-3xl md:text-4xl">
              {t.headline}
            </h2>
            <p className="mt-4 text-base leading-7 text-white/65 sm:text-lg">{t.body}</p>
            <p className="mt-6 rounded-xl border border-[#d8ad5f]/20 bg-[#d8ad5f]/5 px-4 py-3 text-sm text-[#f0d4a8]/80">
              {t.footnote}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...OBS_SPRING, delay: 0.08 }}
            className={`${PREMIUM_CLASSES.glass} p-5 sm:p-6`}
            aria-hidden
          >
            <div className="flex items-center gap-2 border-b border-white/[0.08] pb-4">
              <Coins className="h-4 w-4 text-[#d8ad5f]" aria-hidden />
              <span className="text-sm font-semibold text-white">{m.yourCredits}</span>
            </div>

            <div className="mt-4 rounded-xl border border-[#8B5CF6]/25 bg-[#8B5CF6]/8 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                {m.availableLabel}
              </p>
              <p className="mt-1 text-3xl font-black tabular-nums text-white">
                {m.availableValue}
              </p>
            </div>

            <ul className="mt-4 space-y-2">
              {[m.usageImages, m.usageVideos, m.usagePremium].map((label) => (
                <li
                  key={label}
                  className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-[#111827]/60 px-3 py-2 text-xs"
                >
                  <span className="text-white/70">{label}</span>
                  <span className="text-[#9CA3AF]">—</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 space-y-2 border-t border-white/[0.08] pt-4">
              {packs.map((pack) => (
                <div
                  key={pack.key}
                  className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2.5 ${
                    pack.popular
                      ? "border-[#d8ad5f]/35 bg-[#d8ad5f]/8"
                      : "border-white/[0.08] bg-[#070A12]/60"
                  }`}
                >
                  <div>
                    <span className="text-sm font-semibold text-white">{pack.name}</span>
                    <span className="ml-2 text-xs text-white/50">
                      — {pack.creditsLabel} · {pack.priceLabel}
                    </span>
                  </div>
                  {pack.badge ? (
                    <span className="rounded-full bg-[#d8ad5f]/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#efc777]">
                      {pack.badge}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

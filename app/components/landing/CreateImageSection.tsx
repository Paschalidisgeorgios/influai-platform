"use client";

import { motion } from "framer-motion";
import { ImageIcon } from "lucide-react";
import { resolveCreditCostForModelMode } from "@/app/lib/billing/credit-costs";
import { formatCreditLabel } from "@/app/lib/model-modes/mode-marketing-copy";
import type { LandingLanguage } from "./magnificContent";
import { magnificContent } from "./magnificContent";
import { LANDING_LAYOUT, PREMIUM_CLASSES } from "@/lib/obsidian/premium-tokens";
import { OBS_SPRING } from "@/lib/obsidian/dashboard-tokens";

export default function CreateImageSection({
  currentLanguage,
}: {
  currentLanguage: LandingLanguage;
}) {
  const t = magnificContent[currentLanguage].createImage;
  const lang = currentLanguage === "de" ? "de" : "en";

  return (
    <section
      id="product"
      className={`border-t border-white/[0.06] bg-[#050505] ${LANDING_LAYOUT.section}`}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={OBS_SPRING}
          className="max-w-3xl"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#8B5CF6]/15 text-[#C4B5FD]">
              <ImageIcon className="h-4 w-4" aria-hidden />
            </span>
            <p className={PREMIUM_CLASSES.mono}>{t.eyebrow}</p>
          </div>
          <h2 className="mt-3 text-2xl font-black uppercase italic tracking-tight text-white sm:text-3xl md:text-4xl">
            {t.headline}
          </h2>
          <p className="mt-4 text-base leading-7 text-white/65 sm:text-lg">{t.body}</p>
        </motion.div>

        <div className={`${LANDING_LAYOUT.afterHeader} grid grid-cols-1 gap-4 sm:grid-cols-2`}>
          {t.modes.map((mode, index) => {
            const creditCost = resolveCreditCostForModelMode(mode.id);

            return (
            <motion.article
              key={mode.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ...OBS_SPRING, delay: index * 0.06 }}
              className={`${PREMIUM_CLASSES.glassCard} p-5 sm:p-6`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-bold uppercase tracking-wide text-amber-400">
                  {mode.title}
                </h3>
                <div className="flex flex-wrap items-center gap-1.5">
                  {creditCost > 0 ? (
                    <span className="rounded-full border border-amber-500/35 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
                      {formatCreditLabel(creditCost, lang)}
                    </span>
                  ) : null}
                  <span className="rounded-full border border-[#22C55E]/25 bg-[#22C55E]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#86EFAC]">
                    {t.availableLabel}
                  </span>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[#9CA3AF]">{mode.body}</p>
            </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

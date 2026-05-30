"use client";

import { motion } from "framer-motion";
import type { LandingLanguage } from "./magnificContent";
import { magnificContent } from "./magnificContent";
import { OBS_SPRING } from "@/lib/obsidian/dashboard-tokens";

export default function CreditValueStrip({
  currentLanguage,
}: {
  currentLanguage: LandingLanguage;
}) {
  const t = magnificContent[currentLanguage].creditValue;

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
        </motion.div>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {t.tiers.map((tier, index) => (
            <motion.article
              key={tier.key}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ...OBS_SPRING, delay: index * 0.06 }}
              whileHover={{ y: -2 }}
              className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl transition hover:border-amber-500/30 hover:shadow-[0_0_30px_rgba(245,158,11,0.12)]"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/15 text-sm font-black text-amber-400">
                {index + 1}
              </span>
              <h3 className="mt-4 text-sm font-bold uppercase tracking-wide text-white">
                {tier.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-400">{tier.body}</p>
            </motion.article>
          ))}
        </div>

        <p className="mt-8 text-center text-sm font-medium text-amber-400/90">{t.conversion}</p>
      </div>
    </section>
  );
}

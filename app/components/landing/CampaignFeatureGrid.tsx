"use client";

import { motion } from "framer-motion";
import type { LandingLanguage } from "./magnificContent";
import { magnificContent } from "./magnificContent";
import { OBS_SPRING } from "@/lib/obsidian/dashboard-tokens";

export default function CampaignFeatureGrid({
  currentLanguage,
}: {
  currentLanguage: LandingLanguage;
}) {
  const t = magnificContent[currentLanguage].campaignFeatures;

  return (
    <section className="bg-[#050505] py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={OBS_SPRING}
          className="text-center text-2xl font-black uppercase italic tracking-tight text-white sm:text-3xl md:text-4xl"
        >
          {t.headline}
        </motion.h2>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {t.cards.map((card, index) => (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ...OBS_SPRING, delay: index * 0.05 }}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl"
            >
              <h3 className="text-sm font-bold uppercase tracking-wide text-amber-400">{card.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-neutral-400">{card.body}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

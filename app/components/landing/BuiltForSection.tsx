"use client";

import { motion } from "framer-motion";
import { Briefcase, ShoppingBag, User, Video } from "lucide-react";
import type { LandingLanguage } from "./magnificContent";
import { magnificContent } from "./magnificContent";
import { LANDING_LAYOUT, PREMIUM_CLASSES } from "@/lib/obsidian/premium-tokens";
import { OBS_SPRING } from "@/lib/obsidian/dashboard-tokens";

const CARD_ICONS = [User, Video, ShoppingBag, Briefcase] as const;

export default function BuiltForSection({
  currentLanguage,
}: {
  currentLanguage: LandingLanguage;
}) {
  const t = magnificContent[currentLanguage].builtFor;

  return (
    <section
      id="built-for"
      className={`border-t border-white/[0.06] bg-[#050505] ${LANDING_LAYOUT.sectionCompact}`}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={OBS_SPRING}
          className="mx-auto max-w-3xl text-center text-xl font-black uppercase italic tracking-tight text-white sm:text-2xl md:text-3xl"
        >
          {t.headline}
        </motion.h2>

        <div className={`${LANDING_LAYOUT.afterHeader} grid grid-cols-1 gap-3 sm:grid-cols-2 lg:gap-4`}>
          {t.cards.map((card, index) => {
            const Icon = CARD_ICONS[index] ?? User;
            return (
              <motion.article
                key={card.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...OBS_SPRING, delay: index * 0.05 }}
                className={`rounded-2xl border border-white/[0.08] bg-[#111827]/40 p-4 sm:p-5 ${PREMIUM_CLASSES.cardHoverLift}`}
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#8B5CF6]/25 bg-[#8B5CF6]/10 text-[#C4B5FD]">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-amber-400">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/60">
                      {card.body}
                    </p>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

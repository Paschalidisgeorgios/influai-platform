"use client";

import { motion } from "framer-motion";
import type { LandingLanguage } from "./magnificContent";
import { magnificContent } from "./magnificContent";
import { LANDING_LAYOUT, PREMIUM_CLASSES } from "@/lib/obsidian/premium-tokens";
import { OBS_SPRING } from "@/lib/obsidian/dashboard-tokens";

export default function CreatorWorkflowSection({
  currentLanguage,
}: {
  currentLanguage: LandingLanguage;
}) {
  const t = magnificContent[currentLanguage].creatorWorkflow;

  return (
    <section
      id="workflow"
      className={`border-t border-white/[0.06] bg-[#070A12] ${LANDING_LAYOUT.section}`}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={OBS_SPRING}
          className="mx-auto max-w-3xl text-center"
        >
          <p className={PREMIUM_CLASSES.mono}>Workflow</p>
          <h2 className="mt-2 text-2xl font-black uppercase italic tracking-tight text-white sm:text-3xl md:text-4xl">
            {t.headline}
          </h2>
          <p className="mt-4 text-base leading-7 text-white/65">{t.tagline}</p>
        </motion.div>

        <ol className={`${LANDING_LAYOUT.afterHeaderLg} grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5`}>
          {t.steps.map((step, index) => (
            <motion.li
              key={step}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ...OBS_SPRING, delay: index * 0.05 }}
              className={`relative flex flex-col rounded-2xl border border-white/[0.08] bg-[#111827]/50 p-4 sm:p-5 ${index === 0 ? "lg:col-span-1" : ""}`}
            >
              <span className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#8B5CF6]/15 text-xs font-bold text-[#C4B5FD]">
                {index + 1}
              </span>
              <span className="text-sm font-semibold leading-snug text-white">{step}</span>
              {index < t.steps.length - 1 ? (
                <span
                  className="absolute -right-2 top-1/2 hidden h-px w-4 -translate-y-1/2 bg-gradient-to-r from-[#8B5CF6]/40 to-transparent lg:block"
                  aria-hidden
                />
              ) : null}
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

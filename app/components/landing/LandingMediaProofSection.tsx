"use client";

import { motion } from "framer-motion";
import type { LandingLanguage } from "./magnificContent";
import MediaProofGrid from "./MediaProofGrid";
import { LANDING_MEDIA_PROOF_SECTION_COPY } from "@/lib/landing/landing-media-proof";
import { LANDING_SECTION_SCROLL_MT } from "@/lib/landing/landing-section-nav";
import { LANDING_LAYOUT, PREMIUM_CLASSES } from "@/lib/obsidian/premium-tokens";
import { OBS_SPRING } from "@/lib/obsidian/dashboard-tokens";

type Props = {
  currentLanguage: LandingLanguage;
};

export default function LandingMediaProofSection({ currentLanguage }: Props) {
  const lang = currentLanguage === "de" ? "de" : "en";
  const copy = LANDING_MEDIA_PROOF_SECTION_COPY[lang];

  return (
    <section
      id="media-proof"
      className={`border-t border-white/[0.06] bg-transparent ${LANDING_SECTION_SCROLL_MT} ${LANDING_LAYOUT.sectionCompact}`}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={OBS_SPRING}
          className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="max-w-2xl">
            <p className={PREMIUM_CLASSES.mono}>{copy.eyebrow}</p>
            <h2 className="mt-2 text-xl font-black uppercase italic tracking-tight text-white sm:text-2xl md:text-3xl">
              {copy.headline}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/60 sm:text-base">
              {copy.body}
            </p>
          </div>
          <span className="shrink-0 self-start rounded-full border border-white/[0.1] bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-400 sm:self-auto">
            {copy.demoBadge}
          </span>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ ...OBS_SPRING, delay: 0.05 }}
        >
          <MediaProofGrid language={currentLanguage} />
        </motion.div>
      </div>
    </section>
  );
}

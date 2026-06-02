"use client";

import { motion } from "framer-motion";
import { Copy, Minus, Plus, Sparkles } from "lucide-react";
import type { LandingLanguage } from "./magnificContent";
import { magnificContent } from "./magnificContent";
import { LANDING_LAYOUT, PREMIUM_CLASSES } from "@/lib/obsidian/premium-tokens";
import { OBS_SPRING } from "@/lib/obsidian/dashboard-tokens";

export default function CreativeScoreSection({
  currentLanguage,
}: {
  currentLanguage: LandingLanguage;
}) {
  const t = magnificContent[currentLanguage].creativeScore;

  return (
    <section
      id="creative-score"
      className={`border-t border-white/[0.06] bg-transparent ${LANDING_LAYOUT.sectionCompact}`}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className={`grid lg:grid-cols-2 lg:items-start ${LANDING_LAYOUT.gridWide}`}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={OBS_SPRING}
          >
            <p className={PREMIUM_CLASSES.mono}>Creative Score</p>
            <h2 className="mt-2 text-2xl font-black uppercase italic tracking-tight text-white sm:text-3xl md:text-4xl">
              {t.headline}
            </h2>
            <p className="mt-4 text-base leading-7 text-white/65 sm:text-lg">{t.body}</p>
            <p className="mt-4 text-xs text-white/40">{t.disclaimer}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...OBS_SPRING, delay: 0.08 }}
            className={`${PREMIUM_CLASSES.glass} ${PREMIUM_CLASSES.glowPurple} p-5 sm:p-6`}
            aria-hidden
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#8B5CF6]" aria-hidden />
                <span className="text-sm font-semibold text-white">{t.scoreLabel}</span>
              </div>
              <p className="text-2xl font-black tabular-nums text-[#C4B5FD]">
                {t.scoreValue}
                <span className="text-base font-semibold text-white/40">/{t.scoreMax}</span>
              </p>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#86EFAC]">
                  {t.worksTitle}
                </p>
                <ul className="mt-2 space-y-1.5">
                  {t.works.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-xs leading-relaxed text-white/75"
                    >
                      <Plus className="mt-0.5 h-3 w-3 shrink-0 text-[#22C55E]" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#d8ad5f]/90">
                  {t.improveTitle}
                </p>
                <ul className="mt-2 space-y-1.5">
                  {t.improve.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-xs leading-relaxed text-white/60"
                    >
                      <Minus className="mt-0.5 h-3 w-3 shrink-0 text-[#d8ad5f]/80" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-5 border-t border-white/[0.08] pt-4">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                {t.socialTitle}
              </p>
              <div className="mt-3 space-y-3">
                <SocialBlock label={t.hooksLabel} text={t.sampleHook} copyLabel={t.copyHookLabel} />
                <SocialBlock
                  label={t.captionsLabel}
                  text={t.sampleCaption}
                  copyLabel={t.copyCaptionLabel}
                />
                <SocialBlock
                  label={t.hashtagsLabel}
                  text={t.sampleHashtags}
                  copyLabel={t.copyHashtagsLabel}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function SocialBlock({
  label,
  text,
  copyLabel,
}: {
  label: string;
  text: string;
  copyLabel: string;
}) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-[#070A12]/80 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">{label}</p>
      <p className="mt-1.5 text-xs leading-relaxed text-white/70">{text}</p>
      <span className="mt-2 inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-[10px] font-medium text-white/50">
        <Copy className="h-3 w-3" aria-hidden />
        {copyLabel}
      </span>
    </div>
  );
}

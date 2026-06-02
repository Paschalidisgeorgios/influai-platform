"use client";

import { motion } from "framer-motion";
import {
  Check,
  Clapperboard,
  FlaskConical,
  ImageIcon,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import type { LandingLanguage } from "./magnificContent";
import { magnificContent } from "./magnificContent";
import { LANDING_LAYOUT, PREMIUM_CLASSES } from "@/lib/obsidian/premium-tokens";
import { OBS_SPRING } from "@/lib/obsidian/dashboard-tokens";

export default function ExampleWorkflowsSection({
  currentLanguage,
}: {
  currentLanguage: LandingLanguage;
}) {
  const t = magnificContent[currentLanguage].exampleWorkflows;

  return (
    <section
      id="example-workflows"
      className={`border-t border-white/[0.06] bg-[#070A12] ${LANDING_LAYOUT.sectionCompact}`}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={OBS_SPRING}
          className="mx-auto max-w-3xl text-center"
        >
          <p className={PREMIUM_CLASSES.mono}>{t.eyebrow}</p>
          <h2 className="mt-2 text-xl font-black uppercase italic tracking-tight text-white sm:text-2xl md:text-3xl">
            {t.headline}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/50">{t.tagline}</p>
        </motion.div>

        <div className={`${LANDING_LAYOUT.afterHeader} grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3`}>
          {t.projects.map((project, index) => (
            <motion.article
              key={project.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ...OBS_SPRING, delay: index * 0.06 }}
              className={`flex flex-col rounded-2xl border border-white/[0.08] bg-[#111827]/50 p-4 sm:p-5 ${PREMIUM_CLASSES.cardHoverLift}`}
            >
              <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                <h3 className="text-sm font-bold leading-snug text-white">
                  {project.title}
                </h3>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
                  <FlaskConical className="h-3 w-3" aria-hidden />
                  {t.demoProjectLabel}
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                    {t.roughIdeaLabel}
                  </p>
                  <p className="mt-1 rounded-lg border border-white/[0.06] bg-[#070A12]/80 px-3 py-2 text-xs leading-relaxed text-white/70">
                    &ldquo;{project.roughIdea}&rdquo;
                  </p>
                </div>

                <div>
                  <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                    <ImageIcon className="h-3 w-3" aria-hidden />
                    {t.assetTypesLabel}
                  </p>
                  <ul className="flex flex-wrap gap-1.5">
                    {project.assetTypes.map((asset) => (
                      <li
                        key={asset}
                        className="inline-flex items-center gap-1 rounded-md border border-white/[0.08] bg-[#0E1220] px-2 py-1 text-[10px] text-white/60"
                      >
                        {asset.includes("motion") || asset.includes("Motion") ? (
                          <Clapperboard className="h-2.5 w-2.5 shrink-0 text-[#C4B5FD]" aria-hidden />
                        ) : (
                          <ImageIcon className="h-2.5 w-2.5 shrink-0 text-[#C4B5FD]" aria-hidden />
                        )}
                        {asset}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-[#0E1220]/80 px-3 py-2">
                  <div>
                    <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                      <MessageSquare className="h-3 w-3" aria-hidden />
                      {t.hooksCaptionsLabel}
                    </p>
                    <p className="mt-0.5 text-xs text-white/65">{project.hooksCaptions}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#22C55E]">
                    <Check className="h-3 w-3" aria-hidden />
                    {t.hooksCaptionsIncluded}
                  </span>
                </div>

                <div className="mt-auto flex items-center gap-3 border-t border-white/[0.06] pt-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#22C55E]/30 bg-[#22C55E]/10">
                    <TrendingUp className="h-4 w-4 text-[#22C55E]" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-white/45">
                      {t.creativeScoreLabel}
                    </p>
                    <p className="text-sm font-bold text-white">
                      {project.creativeScore}
                      <span className="text-xs font-normal text-white/40"> /100</span>
                    </p>
                    <p className="truncate text-[10px] text-white/45">{project.scoreHint}</p>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { LandingLanguage } from "./magnificContent";
import { PRODUCT_THEATRE_COPY } from "@/lib/landing/product-theatre-content";
import type { NarrativeStepId } from "@/lib/landing/motion-narrative-content";
import { packAssemblyToNarrativeStep } from "@/lib/landing/pack-theatre-sync";
import { LANDING_SECTION_SCROLL_MT } from "@/lib/landing/landing-section-nav";
import { LANDING_LAYOUT, PREMIUM_CLASSES } from "@/lib/obsidian/premium-tokens";
import { OBS_SPRING } from "@/lib/obsidian/dashboard-tokens";
import ObsidianButton from "@/app/components/shared/ObsidianButton";
import SocialAssetPackShowcase from "@/app/components/pack/SocialAssetPackShowcase";
import { AgentVisualEffectsProvider } from "@/lib/studio/agent-visual-effects-context";
import MotionNarrativeStage from "./MotionNarrativeStage";

type Props = {
  currentLanguage: LandingLanguage;
  studioHref: string;
};

export default function ProductTheatreSection({
  currentLanguage,
  studioHref,
}: Props) {
  const lang = currentLanguage === "de" ? "de" : "en";
  const copy = PRODUCT_THEATRE_COPY[lang];
  const [narrativeStep, setNarrativeStep] = useState<NarrativeStepId>("idea");

  return (
    <section
      id="workflow"
      className={`relative border-t border-white/[0.06] bg-transparent ${LANDING_SECTION_SCROLL_MT} ${LANDING_LAYOUT.sectionCompact}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(245,158,11,0.08),transparent)]" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <motion.header
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={OBS_SPRING}
          className="mx-auto max-w-2xl text-center"
        >
          <p className={PREMIUM_CLASSES.mono}>{copy.eyebrow}</p>
          <h2 className="mt-2 text-2xl font-black uppercase italic tracking-tight text-white sm:text-3xl md:text-4xl">
            {copy.headline}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/60 sm:text-base">
            {copy.body}
          </p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ ...OBS_SPRING, delay: 0.05 }}
          className={LANDING_LAYOUT.afterHeaderLg}
        >
          <div className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,0.38fr)_minmax(0,1.62fr)] lg:gap-8">
            <AgentVisualEffectsProvider enabled>
              <SocialAssetPackShowcase
                mode="demo"
                language={lang}
                studioHref={studioHref}
                theatreLayout
                className="order-1 min-w-0 lg:order-2"
                onDemoAssemblyStepChange={(step) =>
                  setNarrativeStep(packAssemblyToNarrativeStep(step))
                }
              />
            </AgentVisualEffectsProvider>

            <MotionNarrativeStage
              language={currentLanguage}
              layout="sidebar"
              activeStep={narrativeStep}
              onStepChange={setNarrativeStep}
              autoPlay={false}
              className="order-2 min-w-0 lg:order-1"
            />
          </div>

          <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-5 sm:flex-row sm:items-center">
            <p className="max-w-md text-center text-[11px] leading-relaxed text-neutral-500 sm:text-left">
              {copy.disclaimer}
            </p>
            <ObsidianButton
              href={studioHref}
              variant="primary"
              size="md"
              surface="landing"
              className="shrink-0"
            >
              {copy.cta}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </ObsidianButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

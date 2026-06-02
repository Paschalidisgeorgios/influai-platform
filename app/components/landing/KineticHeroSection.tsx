"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { LandingLanguage } from "./magnificContent";
import { getKineticHeroCopy } from "@/lib/landing/kinetic-hero-content";
import { LANDING_LAYOUT } from "@/lib/obsidian/premium-tokens";
import { OBS, OBS_SPRING } from "@/lib/obsidian/dashboard-tokens";
import ObsidianButton from "@/app/components/shared/ObsidianButton";
import HeroWordReveal from "./obsidian/HeroWordReveal";
import KineticRotatingWords from "./KineticRotatingWords";
import HeroPackProofCard from "./HeroPackProofCard";
import { ParallaxDepthLayers } from "@/app/components/motion/ParallaxDepthBackdrop";
import { useSubtleParallax } from "@/lib/motion/use-subtle-parallax";

type Props = {
  currentLanguage: LandingLanguage;
  studioHref: string;
};

export default function KineticHeroSection({
  currentLanguage,
  studioHref,
}: Props) {
  const copy = getKineticHeroCopy(currentLanguage);
  const reduceMotion = useReducedMotion();
  const wordCount = copy.headline.split(/\s+/).filter(Boolean).length;
  const { containerRef, getLayerStyle, enabled } = useSubtleParallax<HTMLElement>({
    maxPx: reduceMotion ? 0 : 10,
    disabled: Boolean(reduceMotion),
  });

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden bg-transparent text-white"
    >
      <ParallaxDepthLayers
        variant="landing-hero"
        getLayerStyle={getLayerStyle}
        enabled={enabled}
      />

      <div
        className={`relative z-10 mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-14 lg:py-20`}
      >
        <div className={`grid items-start lg:grid-cols-2 lg:items-center ${LANDING_LAYOUT.heroGrid}`}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              ...OBS_SPRING,
              delay: reduceMotion ? 0 : 0.06,
            }}
            className="order-1 min-w-0 w-full lg:order-2 lg:justify-self-end"
          >
            <HeroPackProofCard language={currentLanguage} />
          </motion.div>

          <div className="order-2 max-w-xl lg:order-1 lg:max-w-none [text-shadow:0_1px_14px_rgba(0,0,0,0.75)]">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={OBS_SPRING}
              className={`mb-4 inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 ${OBS.mono} text-amber-200/90`}
            >
              {copy.badge}
            </motion.span>

            <div key={`${currentLanguage}-headline`}>
              <HeroWordReveal text={copy.headline} sentenceCase className="max-w-none" />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                ...OBS_SPRING,
                delay: reduceMotion ? 0 : wordCount * 0.1 + 0.12,
              }}
              className="mt-4 flex min-h-[2.75rem] flex-wrap items-center justify-start gap-x-2 gap-y-1 sm:min-h-[3rem]"
            >
              <span className="text-base font-medium text-white/45 sm:text-lg">
                {copy.rotatingPrefix}
              </span>
              <KineticRotatingWords words={copy.rotatingWords} />
            </motion.div>

            <motion.p
              key={`${currentLanguage}-sub`}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                ...OBS_SPRING,
                delay: reduceMotion ? 0 : wordCount * 0.1 + 0.2,
              }}
              className="mt-5 max-w-xl text-base leading-7 text-white/65 sm:text-lg"
            >
              {copy.subheadline}
            </motion.p>

            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                ...OBS_SPRING,
                delay: reduceMotion ? 0 : wordCount * 0.1 + 0.26,
              }}
              className="mt-4 max-w-xl text-sm font-medium tracking-wide text-amber-500/80"
            >
              {copy.proofLine}
            </motion.p>

            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                ...OBS_SPRING,
                delay: reduceMotion ? 0 : wordCount * 0.1 + 0.32,
              }}
              className="mt-6 flex flex-wrap items-center gap-3"
            >
              <ObsidianButton
                href={studioHref}
                variant="primary"
                size="lg"
                surface="landing"
              >
                {copy.primaryCta}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </ObsidianButton>
              <ObsidianButton
                href="#workflow"
                variant="secondary"
                size="lg"
                surface="landing"
              >
                {copy.secondaryCta}
              </ObsidianButton>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

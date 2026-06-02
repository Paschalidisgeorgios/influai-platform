"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { LandingLanguage } from "../magnificContent";
import { magnificContent } from "../magnificContent";
import { LANDING_LAYOUT } from "@/lib/obsidian/premium-tokens";
import { OBS, OBS_SPRING } from "@/lib/obsidian/dashboard-tokens";
import ObsidianButton from "@/app/components/shared/ObsidianButton";
import HeroWordReveal from "./HeroWordReveal";
import SocialAssetPackShowcase from "@/app/components/pack/SocialAssetPackShowcase";
import { AgentVisualEffectsProvider } from "@/lib/studio/agent-visual-effects-context";
import { ParallaxDepthLayers } from "@/app/components/motion/ParallaxDepthBackdrop";
import { useSubtleParallax } from "@/lib/motion/use-subtle-parallax";

export default function ObsidianHero({
  currentLanguage,
  studioHref,
}: {
  currentLanguage: LandingLanguage;
  studioHref: string;
}) {
  const t = magnificContent[currentLanguage].hero;
  const wordCount = t.headline.split(/\s+/).filter(Boolean).length;
  const { containerRef, getLayerStyle, enabled } = useSubtleParallax<HTMLElement>({
    maxPx: 12,
  });

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden bg-[#050505] text-white"
    >
      <ParallaxDepthLayers
        variant="landing-hero"
        getLayerStyle={getLayerStyle}
        enabled={enabled}
      />

      <div
        className={`relative z-10 mx-auto max-w-7xl px-4 sm:px-6 ${LANDING_LAYOUT.heroWrap}`}
      >
        <div className={`grid items-center lg:grid-cols-2 ${LANDING_LAYOUT.heroGrid}`}>
          <div className="max-w-xl">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={OBS_SPRING}
              className={`mb-4 inline-flex rounded-full border border-neutral-800/80 bg-neutral-900/40 px-3 py-1 ${OBS.mono} text-neutral-400`}
            >
              {t.badge}
            </motion.span>

            <div key={currentLanguage}>
              <HeroWordReveal text={t.headline} sentenceCase />
            </div>

            <motion.p
              key={`${currentLanguage}-subtitle`}
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ ...OBS_SPRING, delay: wordCount * 0.14 + 0.2 }}
              className="mt-5 max-w-xl text-base leading-7 text-white/65 sm:text-lg"
            >
              {t.subtitle}
            </motion.p>

            {t.trustLine ? (
              <motion.p
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ ...OBS_SPRING, delay: wordCount * 0.14 + 0.28 }}
                className="mt-4 max-w-xl text-sm font-medium tracking-wide text-white/50"
              >
                {t.trustLine}
              </motion.p>
            ) : null}

            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ ...OBS_SPRING, delay: wordCount * 0.14 + 0.32 }}
              className="mt-6 flex flex-wrap items-center gap-3"
            >
              <ObsidianButton
                href={studioHref}
                variant="primary"
                size="lg"
                surface="landing"
              >
                {t.cta}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </ObsidianButton>
              {t.secondaryCta ? (
                <ObsidianButton
                  href="#workflow"
                  variant="secondary"
                  size="lg"
                  surface="landing"
                >
                  {t.secondaryCta}
                </ObsidianButton>
              ) : null}
            </motion.div>
          </div>

          <div className="min-w-0 w-full overflow-hidden lg:max-w-lg lg:justify-self-end">
            <AgentVisualEffectsProvider enabled>
              <SocialAssetPackShowcase
                mode="demo"
                language={currentLanguage}
                studioHref={studioHref}
              />
            </AgentVisualEffectsProvider>
          </div>
        </div>
      </div>
    </section>
  );
}

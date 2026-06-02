"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ImageIcon, Sparkles, Video } from "lucide-react";
import type { LandingLanguage } from "../magnificContent";
import { magnificContent } from "../magnificContent";
import {
  HERO_LIVE_MODEL_IMAGE,
  HERO_LIVE_MODEL_IMAGE_FALLBACK,
} from "../landingAssets";
import { PREMIUM_CLASSES } from "@/lib/obsidian/premium-tokens";
import { OBS_SPRING } from "@/lib/obsidian/dashboard-tokens";
import { useState } from "react";
import { ParallaxDepthLayers } from "@/app/components/motion/ParallaxDepthBackdrop";
import { useSubtleParallax } from "@/lib/motion/use-subtle-parallax";

export default function HeroStudioMockup({
  currentLanguage,
}: {
  currentLanguage: LandingLanguage;
}) {
  const m = magnificContent[currentLanguage].hero.studioMockup;
  const [previewSrc, setPreviewSrc] = useState(HERO_LIVE_MODEL_IMAGE);
  const { containerRef, getLayerStyle, enabled } = useSubtleParallax<HTMLDivElement>({
    maxPx: 6,
  });

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...OBS_SPRING, delay: 0.15 }}
      className={`relative isolate w-full overflow-hidden ${PREMIUM_CLASSES.glass} ${PREMIUM_CLASSES.glowPurple} p-4 sm:p-5`}
      aria-hidden
    >
      <ParallaxDepthLayers
        variant="pack-showcase"
        getLayerStyle={getLayerStyle}
        enabled={enabled}
        layers={[
          {
            className:
              "absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_50%_100%,rgba(139,92,246,0.28),transparent_55%)]",
            depth: 0.35,
            maxPx: 4,
          },
        ]}
      />
      <div className="relative z-[1]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#8B5CF6]/60 to-transparent" />

      <div className="mb-3 flex items-center justify-between gap-2">
        <span className={PREMIUM_CLASSES.mono}>{m.studioLabel}</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d8ad5f]/30 bg-[#d8ad5f]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#efc777]">
          <Sparkles className="h-3 w-3" aria-hidden />
          {m.creditsBadge}
        </span>
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-[#070A12]/80 p-3">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
          {m.promptLabel}
        </p>
        <div className="min-h-[52px] rounded-lg border border-white/[0.06] bg-[#111827]/80 px-3 py-2.5 text-xs leading-relaxed text-white/70">
          {m.promptSample}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div
          className={`rounded-xl px-3 py-2.5 ${PREMIUM_CLASSES.cardBase} ${PREMIUM_CLASSES.cardSelected} bg-[#111827]/90`}
        >
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#8B5CF6]/15 text-[#C4B5FD]">
              <ImageIcon className="h-3.5 w-3.5" aria-hidden />
            </span>
            <span className="text-[11px] font-semibold text-white">{m.createImage}</span>
          </div>
        </div>
        <div
          className={`rounded-xl px-3 py-2.5 ${PREMIUM_CLASSES.cardBase} bg-[#111827]/50 opacity-80`}
        >
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.06] text-[#9CA3AF]">
              <Video className="h-3.5 w-3.5" aria-hidden />
            </span>
            <span className="text-[11px] font-semibold text-[#9CA3AF]">{m.createVideo}</span>
          </div>
        </div>
      </div>

      <div className="relative mt-3 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0E1220]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_20%,rgba(34,211,238,0.12),transparent_50%)]" />
        <div className="relative aspect-[4/3] w-full">
          <Image
            src={previewSrc}
            alt=""
            fill
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 480px"
            priority
            unoptimized
            onError={() => setPreviewSrc(HERO_LIVE_MODEL_IMAGE_FALLBACK)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070A12]/90 via-transparent to-transparent" />
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2">
            <span className="rounded-md border border-white/10 bg-black/40 px-2 py-0.5 text-[10px] font-medium text-white/80 backdrop-blur-sm">
              {m.canvasLabel}
            </span>
            <span className="rounded-md border border-[#8B5CF6]/30 bg-[#8B5CF6]/20 px-2 py-0.5 text-[10px] font-semibold text-[#C4B5FD] backdrop-blur-sm">
              {m.canvasReady}
            </span>
          </div>
        </div>
      </div>
      </div>
    </motion.div>
  );
}

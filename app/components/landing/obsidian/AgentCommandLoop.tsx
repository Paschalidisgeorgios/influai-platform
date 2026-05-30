"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Cpu } from "lucide-react";
import type { HeroTrack, LandingLanguage } from "../magnificContent";
import { magnificContent } from "../magnificContent";
import { engineModulesCopy, TRACK_MODULE_HIGHLIGHT } from "../agentModules";
import {
  HERO_MODEL1_STILL,
  HERO_MODEL1_STILL_FALLBACK,
} from "../landingAssets";
import { MEDIA_FOCAL_POINTS } from "../mediaFocalPoints";
import { OBS, OBS_SPRING } from "@/lib/obsidian/dashboard-tokens";

export type HeroLoopPhase = "typing" | "rendering" | "result";

function trackVariants(direction: HeroTrack["direction"]) {
  switch (direction) {
    case "left":
      return {
        initial: { opacity: 0, x: -100, filter: "blur(8px)" },
        animate: { opacity: 1, x: 0, filter: "blur(0px)" },
        exit: { opacity: 0, x: 72, filter: "blur(4px)" },
      };
    case "right":
      return {
        initial: { opacity: 0, x: 100, filter: "blur(8px)" },
        animate: { opacity: 1, x: 0, filter: "blur(0px)" },
        exit: { opacity: 0, x: -72, filter: "blur(4px)" },
      };
    case "top":
      return {
        initial: { opacity: 0, y: -80, filter: "blur(8px)" },
        animate: { opacity: 1, y: 0, filter: "blur(0px)" },
        exit: { opacity: 0, y: 48, filter: "blur(4px)" },
      };
    case "bottom":
      return {
        initial: { opacity: 0, y: 80, filter: "blur(8px)" },
        animate: { opacity: 1, y: 0, filter: "blur(0px)" },
        exit: { opacity: 0, y: -48, filter: "blur(4px)" },
      };
  }
}

type Props = {
  currentLanguage: LandingLanguage;
  activeTrack: number;
  phase: HeroLoopPhase;
  typed: string;
  renderProgress: number;
};

export default function AgentCommandLoop({
  currentLanguage,
  activeTrack,
  phase,
  typed,
  renderProgress,
}: Props) {
  const hero = magnificContent[currentLanguage].hero;
  const tracks = hero.tracks;
  const track = tracks[activeTrack];
  const modulesCopy = engineModulesCopy(currentLanguage);
  const highlightedId = TRACK_MODULE_HIGHLIGHT[activeTrack] ?? modulesCopy.modules[0]?.id;
  const [previewSrc, setPreviewSrc] = useState(HERO_MODEL1_STILL);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={OBS_SPRING}
      className={`relative w-full overflow-hidden ${OBS.glass} p-5 sm:p-6`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent"
      />

      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className={OBS.mono}>OMNI-DIRECTIONAL AGENT LOOP</p>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-800/80 bg-neutral-950/60 px-2.5 py-1 text-[10px] font-medium text-neutral-400">
            <Cpu className="h-3 w-3 text-amber-500" />
            {activeTrack + 1}/{tracks.length}
          </span>
        </div>

        <div className="relative min-h-[96px] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentLanguage}-${activeTrack}`}
              initial={trackVariants(track.direction).initial}
              animate={trackVariants(track.direction).animate}
              exit={trackVariants(track.direction).exit}
              transition={OBS_SPRING}
              className="absolute inset-0"
            >
              <p className="text-sm font-bold tracking-tight text-white sm:text-base">{track.title}</p>
              <p className="mt-2 max-w-sm text-xs leading-relaxed text-neutral-400 sm:text-sm">{track.sub}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-3 flex gap-2" aria-hidden>
          {tracks.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all ${
                i === activeTrack
                  ? "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.9)]"
                  : "bg-neutral-800"
              }`}
            />
          ))}
        </div>

        <div
          className={`mt-4 rounded-xl border bg-neutral-950/60 px-4 py-3 font-mono text-xs leading-relaxed sm:text-sm ${
            phase === "typing" ? "border-amber-500/30 text-neutral-200" : "border-neutral-800/80 text-neutral-500"
          }`}
        >
          <span className="text-amber-500">&gt; </span>
          {typed}
          {phase === "typing" ? (
            <motion.span
              animate={{ opacity: [1, 0.15, 1] }}
              transition={{ repeat: Infinity, duration: 0.7 }}
              className="ml-0.5 inline-block h-4 w-0.5 bg-amber-500 align-middle"
            />
          ) : null}
        </div>

        <AnimatePresence mode="wait">
          {phase === "rendering" ? (
            <motion.div
              key="render"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={OBS_SPRING}
              className="mt-3 overflow-hidden"
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                {hero.generateLabel}
              </p>
              <div className="mt-2 flex items-center justify-between text-[10px] font-medium uppercase tracking-widest text-neutral-500">
                <span>{hero.renderLabel}</span>
                <span>{Math.round(renderProgress)}%</span>
              </div>
              <div className="mt-2 h-px overflow-hidden rounded-full bg-neutral-800">
                <motion.div
                  className="h-full rounded-full bg-amber-500 shadow-[0_0_14px_rgba(245,158,11,0.95)]"
                  style={{ width: `${renderProgress}%` }}
                />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {phase === "result" ? (
            <motion.div
              key={`preview-${activeTrack}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={OBS_SPRING}
              className="mt-3"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-amber-500/30 bg-neutral-950 sm:aspect-video">
                <Image
                  src={previewSrc}
                  alt=""
                  fill
                  className="object-cover"
                  style={{ objectPosition: MEDIA_FOCAL_POINTS.creator }}
                  sizes="(max-width: 1024px) 100vw, 480px"
                  unoptimized
                  onError={() => setPreviewSrc(HERO_MODEL1_STILL_FALLBACK)}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-400">
                  {hero.previewLabel}
                </span>
              </div>
              <p className="mt-2 text-[10px] font-medium uppercase tracking-widest text-amber-400/90">
                {hero.resultLabel}
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="mt-5 border-t border-neutral-800/80 pt-5">
          <p className={`mb-3 ${OBS.mono} text-neutral-500`}>{modulesCopy.title}</p>
          <div className="grid grid-cols-2 gap-2">
            {modulesCopy.modules.map((mod) => {
              const active = mod.id === highlightedId;
              return (
                <motion.div
                  key={mod.id}
                  layout
                  transition={OBS_SPRING}
                  className={`rounded-xl border px-3 py-2 ${
                    active
                      ? "border-amber-500/50 bg-amber-500/10"
                      : "border-white/10 bg-white/[0.05]"
                  }`}
                >
                  <p className="text-[11px] font-bold text-white">{mod.title}</p>
                  <p className="mt-0.5 text-[10px] leading-snug text-neutral-500">{mod.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

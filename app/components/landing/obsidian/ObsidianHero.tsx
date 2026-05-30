"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LandingLanguage } from "../magnificContent";
import { magnificContent } from "../magnificContent";
import {
  HERO_LIVE_MEDIA,
  HERO_LIVE_MODEL_IMAGE,
  HERO_LIVE_MODEL_IMAGE_FALLBACK,
  HERO_LIVE_PREVIEW_VIDEO,
  type HeroLiveMedia,
} from "../landingAssets";
import { focalStyle, HERO_TRACK_FOCAL_KEYS } from "../mediaFocalPoints";
import { OBS, OBS_SPRING } from "@/lib/obsidian/dashboard-tokens";
import AgentCommandLoop, { type HeroLoopPhase } from "./AgentCommandLoop";
import HeroWordReveal from "./HeroWordReveal";
import { useHeroMediaLayout } from "./useHeroMediaLayout";

const TYPE_MS = 2400;
const RENDER_MS = 1400;
const TRACK_CYCLE_MS = 6000;
const CROSSFADE_MS = 0.65;

function resolveMediaSrc(media: HeroLiveMedia, resolved: Record<number, string>, index: number) {
  return resolved[index] ?? media.src;
}

function getCanvasMediaIndex(activeTrack: number) {
  return Math.min(activeTrack, HERO_LIVE_MEDIA.length - 1);
}

function HeroMediaBackdrop({
  activeTrack,
  phase,
  resolvedSrc,
  onResolveSrc,
  layout,
}: {
  activeTrack: number;
  phase: HeroLoopPhase;
  resolvedSrc: Record<number, string>;
  onResolveSrc: (index: number, src: string) => void;
  layout: ReturnType<typeof useHeroMediaLayout>;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasIndex = getCanvasMediaIndex(activeTrack);
  const media = HERO_LIVE_MEDIA[canvasIndex];
  const src = resolveMediaSrc(media, resolvedSrc, canvasIndex);
  const focalKey = HERO_TRACK_FOCAL_KEYS[canvasIndex] ?? "hero";
  const mediaPositionStyle = focalStyle(focalKey);
  const bgOpacity = phase === "result" ? 1 : phase === "rendering" ? 0.55 : 0.35;
  const isVideoMode = media.kind === "video";

  const mediaTransform = {
    scale: layout.scale,
    x: layout.translateX,
    y: layout.translateY,
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideoMode) return;
    if (bgOpacity > 0.25) void video.play().catch(() => undefined);
    else video.pause();
  }, [isVideoMode, bgOpacity, src, activeTrack]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${canvasIndex}-${media.kind}-${src}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: bgOpacity }}
          exit={{ opacity: 0 }}
          transition={{ duration: CROSSFADE_MS, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <motion.div
            className="absolute inset-0 origin-center"
            animate={mediaTransform}
            transition={OBS_SPRING}
          >
            {media.kind === "image" ? (
              <Image
                src={src}
                alt=""
                fill
                className="h-full w-full object-cover"
                style={mediaPositionStyle}
                sizes="100vw"
                priority
                unoptimized
                onError={() => onResolveSrc(canvasIndex, media.fallback)}
              />
            ) : (
              <video
                ref={videoRef}
                src={src}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                className="h-full w-full object-cover"
                style={mediaPositionStyle}
                onError={() => onResolveSrc(canvasIndex, media.fallback)}
              />
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/82 to-[#050505]/25" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/35" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_78%_42%,rgba(245,158,11,0.1),transparent_58%)]" />
    </div>
  );
}

export default function ObsidianHero({
  currentLanguage,
  studioHref,
}: {
  currentLanguage: LandingLanguage;
  studioHref: string;
}) {
  const t = magnificContent[currentLanguage].hero;
  const tracks = t.tracks;
  const wordCount = t.headline.split(/\s+/).filter(Boolean).length;
  const heroMediaLayout = useHeroMediaLayout();

  const [activeTrack, setActiveTrack] = useState(0);
  const [phase, setPhase] = useState<HeroLoopPhase>("typing");
  const [typed, setTyped] = useState("");
  const [renderProgress, setRenderProgress] = useState(0);
  const [resolvedSrc, setResolvedSrc] = useState<Record<number, string>>({
    0: HERO_LIVE_MODEL_IMAGE,
    1: HERO_LIVE_PREVIEW_VIDEO,
  });

  const track = tracks[activeTrack];
  const charDelay = useMemo(
    () => Math.max(14, Math.floor(TYPE_MS / Math.max(track.typewriter.length, 1))),
    [track.typewriter.length]
  );

  const resetLoop = useCallback((trackIndex: number) => {
    setActiveTrack(trackIndex);
    setPhase("typing");
    setTyped("");
    setRenderProgress(0);
  }, []);

  const handleResolveSrc = useCallback((index: number, src: string) => {
    setResolvedSrc((prev) => ({ ...prev, [index]: src }));
  }, []);

  useEffect(() => {
    const img = new window.Image();
    img.src = HERO_LIVE_MODEL_IMAGE;
    img.onerror = () => handleResolveSrc(0, HERO_LIVE_MODEL_IMAGE_FALLBACK);
  }, [handleResolveSrc]);

  useEffect(() => {
    resetLoop(0);
  }, [currentLanguage, resetLoop]);

  useEffect(() => {
    setTyped("");
    setRenderProgress(0);
    setPhase("typing");
  }, [activeTrack, track.typewriter]);

  useEffect(() => {
    if (phase !== "typing") return;
    if (typed.length < track.typewriter.length) {
      const id = window.setTimeout(
        () => setTyped(track.typewriter.slice(0, typed.length + 1)),
        charDelay
      );
      return () => window.clearTimeout(id);
    }
    const id = window.setTimeout(() => setPhase("rendering"), 280);
    return () => window.clearTimeout(id);
  }, [phase, typed, track.typewriter, charDelay]);

  useEffect(() => {
    if (phase !== "rendering") return;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const pct = Math.min(100, ((now - start) / RENDER_MS) * 100);
      setRenderProgress(pct);
      if (pct < 100) frame = requestAnimationFrame(tick);
      else setPhase("result");
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [phase, activeTrack]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveTrack((prev) => {
        const next = (prev + 1) % tracks.length;
        setPhase("typing");
        setTyped("");
        setRenderProgress(0);
        return next;
      });
    }, TRACK_CYCLE_MS);
    return () => window.clearInterval(id);
  }, [tracks.length]);

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#050505] text-white">
      <HeroMediaBackdrop
        activeTrack={activeTrack}
        phase={phase}
        resolvedSrc={resolvedSrc}
        onResolveSrc={handleResolveSrc}
        layout={heroMediaLayout}
      />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-center px-4 py-24 sm:px-6 lg:py-28">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:items-center lg:gap-12">
          <div className="max-w-xl">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={OBS_SPRING}
              className={`mb-5 inline-flex rounded-full border border-neutral-800/80 bg-neutral-900/40 px-3 py-1 ${OBS.mono} text-neutral-400`}
            >
              {t.badge}
            </motion.span>

            <div key={currentLanguage}>
              <HeroWordReveal text={t.headline} />
            </div>

            <motion.p
              key={`${currentLanguage}-subtitle`}
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ ...OBS_SPRING, delay: wordCount * 0.14 + 0.2 }}
              className="mt-6 max-w-xl text-base leading-7 text-white/65 sm:text-lg"
            >
              {t.subtitle}
            </motion.p>

            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ ...OBS_SPRING, delay: wordCount * 0.14 + 0.32 }}
            >
              <Link href={studioHref} className={`mt-8 inline-flex items-center gap-2 px-8 py-4 text-sm ${OBS.amberBtn}`}>
                {t.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>

          <div className="hidden w-full lg:block lg:max-w-lg lg:justify-self-end">
            <AgentCommandLoop
              currentLanguage={currentLanguage}
              activeTrack={activeTrack}
              phase={phase}
              typed={typed}
              renderProgress={renderProgress}
            />
          </div>
        </div>

        <div className="mt-8 lg:hidden">
          <AgentCommandLoop
            currentLanguage={currentLanguage}
            activeTrack={activeTrack}
            phase={phase}
            typed={typed}
            renderProgress={renderProgress}
          />
        </div>
      </div>
    </section>
  );
}

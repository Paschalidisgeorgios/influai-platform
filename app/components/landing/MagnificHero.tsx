"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Cpu } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { HeroTrack, LandingLanguage } from "./magnificContent";
import { magnificContent } from "./magnificContent";
import {
  HERO_LIVE_MEDIA,
  HERO_LIVE_MODEL_IMAGE,
  HERO_LIVE_MODEL_IMAGE_FALLBACK,
  HERO_LIVE_PREVIEW_VIDEO,
  HERO_LIVE_PREVIEW_VIDEO_FALLBACK,
  type HeroLiveMedia,
} from "./landingAssets";

export type HeroLoopPhase = "typing" | "rendering" | "result";

const TYPE_MS = 2400;
const RENDER_MS = 1400;
const TRACK_CYCLE_MS = 6000;
const CROSSFADE_MS = 0.7;

const HERO_MEDIA_POSITION = { objectPosition: "center 75%" } as const;
const MEDIA_CLASS =
  "h-full w-full object-contain object-[center_75%] shadow-2xl";

const spring = { type: "spring" as const, stiffness: 420, damping: 28, mass: 0.85 };

function AnimatedHeadline({ text }: { text: string }) {
  const words = text.split(/\s+/).filter(Boolean);

  return (
    <h1 className="mb-6 text-6xl font-extrabold uppercase italic leading-none tracking-tighter md:text-8xl lg:text-9xl">
      {words.map((word, index) => (
        <motion.span
          key={`${text}-${index}-${word}`}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 420,
            damping: 28,
            delay: index * 0.07,
          }}
          className="mr-[0.22em] inline-block bg-gradient-to-r from-white via-neutral-100 to-neutral-500 bg-clip-text text-transparent last:mr-0"
        >
          {word}
        </motion.span>
      ))}
    </h1>
  );
}

function trackVariants(direction: HeroTrack["direction"]) {
  switch (direction) {
    case "left":
      return {
        initial: { opacity: 0, x: -120, filter: "blur(6px)" },
        animate: { opacity: 1, x: 0, filter: "blur(0px)" },
        exit: { opacity: 0, x: 80, filter: "blur(4px)" },
      };
    case "right":
      return {
        initial: { opacity: 0, x: 120, filter: "blur(6px)" },
        animate: { opacity: 1, x: 0, filter: "blur(0px)" },
        exit: { opacity: 0, x: -80, filter: "blur(4px)" },
      };
    case "top":
      return {
        initial: { opacity: 0, y: -90, filter: "blur(6px)" },
        animate: { opacity: 1, y: 0, filter: "blur(0px)" },
        exit: { opacity: 0, y: 60, filter: "blur(4px)" },
      };
    case "bottom":
      return {
        initial: { opacity: 0, y: 90, filter: "blur(6px)" },
        animate: { opacity: 1, y: 0, filter: "blur(0px)" },
        exit: { opacity: 0, y: -60, filter: "blur(4px)" },
      };
  }
}

function resolveMediaSrc(media: HeroLiveMedia, resolved: Record<number, string>, index: number) {
  return resolved[index] ?? media.src;
}

/** Maps agent loop index → canvas media (0 = image, 1 = video, 2+ = extended assets). */
function getCanvasMediaIndex(activeTrack: number) {
  return Math.min(activeTrack, HERO_LIVE_MEDIA.length - 1);
}

function HeroLiveMediaCanvas({
  activeTrack,
  phase,
  resolvedSrc,
  onResolveSrc,
}: {
  activeTrack: number;
  phase: HeroLoopPhase;
  resolvedSrc: Record<number, string>;
  onResolveSrc: (index: number, src: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasIndex = getCanvasMediaIndex(activeTrack);
  const media = HERO_LIVE_MEDIA[canvasIndex];
  const src = resolveMediaSrc(media, resolvedSrc, canvasIndex);

  const bgOpacity =
    phase === "result" ? 1 : phase === "rendering" ? 0.45 : 0.12;

  const isVideoMode = media.kind === "video";

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideoMode) return;

    if (bgOpacity > 0.2) {
      void video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }, [isVideoMode, bgOpacity, src, activeTrack]);

  return (
    <div className="absolute inset-0 z-0 h-full w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${canvasIndex}-${media.kind}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: bgOpacity }}
          exit={{ opacity: 0 }}
          transition={{ duration: CROSSFADE_MS, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {media.kind === "image" ? (
            <Image
              src={src}
              alt=""
              fill
              className={MEDIA_CLASS}
              style={HERO_MEDIA_POSITION}
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
              className={MEDIA_CLASS}
              style={HERO_MEDIA_POSITION}
              onError={() => onResolveSrc(canvasIndex, media.fallback)}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function AgentCommandLoop({
  currentLanguage,
  activeTrack,
  phase,
  typed,
  renderProgress,
  onTrackSelect,
}: {
  currentLanguage: LandingLanguage;
  activeTrack: number;
  phase: HeroLoopPhase;
  typed: string;
  renderProgress: number;
  onTrackSelect: (index: number) => void;
}) {
  const hero = magnificContent[currentLanguage].hero;
  const tracks = hero.tracks;
  const track = tracks[activeTrack];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-20 w-full max-w-md overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/80 p-6 shadow-2xl backdrop-blur-md sm:max-w-lg"
    >
      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-300">
            Agent Command Loop
          </p>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-700 bg-neutral-950 px-2.5 py-1 text-[10px] font-medium text-neutral-400">
            <Cpu className="h-3 w-3 text-white" />
            {activeTrack + 1}/{tracks.length}
          </span>
        </div>

        <div className="relative min-h-[120px] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentLanguage}-${activeTrack}`}
              initial={trackVariants(track.direction).initial}
              animate={trackVariants(track.direction).animate}
              exit={trackVariants(track.direction).exit}
              transition={spring}
              className="absolute inset-0"
            >
              <p className="text-sm font-semibold tracking-tight text-white sm:text-base">
                {track.title}
              </p>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-400">
                {track.sub}
              </p>
              <p className="mt-2 max-w-sm text-xs leading-relaxed text-neutral-500">
                {track.desc}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-3 flex gap-2">
          {tracks.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Track ${i + 1}`}
              onClick={() => onTrackSelect(i)}
              className={`h-1 flex-1 rounded-full transition-all ${
                i === activeTrack
                  ? "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.9)]"
                  : "bg-neutral-700 hover:bg-neutral-600"
              }`}
            />
          ))}
        </div>

        <div
          className={`mt-4 rounded-xl border bg-neutral-950/60 px-4 py-3 text-xs leading-relaxed sm:text-sm ${
            phase === "typing"
              ? "border-neutral-600 text-neutral-200"
              : "border-neutral-800 text-neutral-500"
          }`}
        >
          <span className="text-white">&gt; </span>
          {typed}
          {phase === "typing" ? (
            <motion.span
              animate={{ opacity: [1, 0.1, 1] }}
              transition={{ repeat: Infinity, duration: 0.7 }}
              className="ml-0.5 inline-block h-4 w-0.5 bg-white align-middle shadow-[0_0_8px_rgba(255,255,255,0.9)]"
            />
          ) : null}
        </div>

        <AnimatePresence>
          {phase === "rendering" ? (
            <motion.div
              key="render"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 overflow-hidden"
            >
              <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-widest text-neutral-400">
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

        <AnimatePresence>
          {phase === "result" ? (
            <motion.p
              key="result"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 text-[10px] font-medium uppercase tracking-widest text-neutral-300"
            >
              {hero.resultLabel}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function MagnificHero({
  currentLanguage,
  studioHref,
}: {
  currentLanguage: LandingLanguage;
  studioHref: string;
}) {
  const t = magnificContent[currentLanguage].hero;
  const tracks = t.tracks;
  const wordCount = t.headline.split(/\s+/).filter(Boolean).length;

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

    const id = window.setTimeout(() => setPhase("rendering"), 320);
    return () => window.clearTimeout(id);
  }, [phase, typed, track.typewriter, charDelay]);

  useEffect(() => {
    if (phase !== "rendering") return;

    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const pct = Math.min(100, ((now - start) / RENDER_MS) * 100);
      setRenderProgress(pct);
      if (pct < 100) {
        frame = requestAnimationFrame(tick);
      } else {
        setPhase("result");
      }
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
    <section className="relative flex h-screen min-h-[92vh] overflow-hidden bg-neutral-950 font-sans text-white">
      <HeroLiveMediaCanvas
        activeTrack={activeTrack}
        phase={phase}
        resolvedSrc={resolvedSrc}
        onResolveSrc={handleResolveSrc}
      />

      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-black via-black/40 to-transparent" />

      <div className="relative z-20 mx-auto flex min-h-[92vh] max-w-7xl flex-col px-4 pb-6 pt-20 sm:px-6 sm:pb-8 sm:pt-24">
        <div className="relative z-20 max-w-3xl flex-1">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 inline-flex rounded-full border border-neutral-700 bg-neutral-900/80 px-3 py-1 text-xs font-medium uppercase tracking-widest text-neutral-300"
          >
            {t.badge}
          </motion.span>

          <div key={currentLanguage} className="relative z-20">
            <AnimatedHeadline text={t.headline} />
          </div>

          <motion.p
            key={`${currentLanguage}-subtitle`}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
              delay: wordCount * 0.07 + 0.15,
            }}
            className="relative z-20 max-w-xl text-base text-neutral-400"
          >
            {t.subtitle}
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
              delay: wordCount * 0.07 + 0.35,
            }}
            className="relative z-20"
          >
            <Link
              href={studioHref}
              className="group relative z-20 mt-10 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-black tracking-wider text-black shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-all hover:bg-neutral-200 hover:shadow-[0_0_50px_rgba(255,255,255,0.3)]"
            >
              {t.cta}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </div>

        <div className="relative z-20 mt-10 flex justify-end lg:absolute lg:bottom-8 lg:right-6 lg:mt-0 xl:right-8">
          <AgentCommandLoop
            currentLanguage={currentLanguage}
            activeTrack={activeTrack}
            phase={phase}
            typed={typed}
            renderProgress={renderProgress}
            onTrackSelect={resetLoop}
          />
        </div>
      </div>
    </section>
  );
}

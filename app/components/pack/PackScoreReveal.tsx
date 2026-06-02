"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { CREATIVE_SCORE_PANEL_COPY } from "@/lib/copy/creative-score-copy";
import type {
  PackAssemblyStepId,
  PackScoreDimension,
  PackShowcaseMode,
} from "./pack-showcase-types";
import { stepIndex } from "./pack-showcase-types";
import { PACK_SHOWCASE_STYLES, usePackMotion } from "./use-pack-motion";

type Props = {
  language: "en" | "de";
  mode: PackShowcaseMode;
  activeStep: PackAssemblyStepId;
  score: number;
  scoreHint: string;
  scoreLabel: string;
  scoreDimensions?: readonly PackScoreDimension[];
  weakestDimensionId?: string;
  scorePreview?: boolean;
  className?: string;
};

export default function PackScoreReveal({
  language,
  mode,
  activeStep,
  score,
  scoreHint,
  scoreLabel,
  scoreDimensions = [],
  weakestDimensionId,
  scorePreview = false,
  className = "",
}: Props) {
  const { reduceMotion, revealAt, hoverDepth, scoreGlow } = usePackMotion();
  const [displayScore, setDisplayScore] = useState(0);
  const [revealedCount, setRevealedCount] = useState(0);
  const [countDone, setCountDone] = useState(false);
  const isDe = language === "de";
  const panelCopy = CREATIVE_SCORE_PANEL_COPY[language];

  const visible =
    mode === "preview" ||
    mode === "result" ||
    stepIndex(activeStep) >= stepIndex("score");

  const dimensions = useMemo(() => scoreDimensions.slice(0, 4), [scoreDimensions]);

  useEffect(() => {
    if (!visible || score <= 0) {
      setDisplayScore(0);
      setRevealedCount(0);
      setCountDone(false);
      return;
    }

    if (reduceMotion) {
      setDisplayScore(score);
      setRevealedCount(dimensions.length);
      setCountDone(true);
      return;
    }

    setCountDone(false);
    const start = performance.now();
    const duration = 900;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      setDisplayScore(Math.round(score * eased));
      if (t < 1) {
        window.requestAnimationFrame(tick);
      } else {
        setCountDone(true);
      }
    };

    window.requestAnimationFrame(tick);
  }, [visible, score, reduceMotion, dimensions.length]);

  useEffect(() => {
    if (!visible || dimensions.length === 0) {
      setRevealedCount(0);
      return;
    }

    if (reduceMotion) {
      setRevealedCount(dimensions.length);
      return;
    }

    setRevealedCount(0);
    const timers = dimensions.map((_, index) =>
      window.setTimeout(() => setRevealedCount(index + 1), 920 + index * 140)
    );

    return () => {
      timers.forEach(window.clearTimeout);
    };
  }, [visible, dimensions, reduceMotion]);

  if (!visible) {
    return mode === "demo" ? (
      <div className={`min-h-[7rem] ${className}`} aria-hidden />
    ) : null;
  }

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
      className={`${PACK_SHOWCASE_STYLES.scoreShell} ${className}`}
    >
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-500/10 blur-2xl"
        aria-hidden
      />

      <div className="relative flex items-start gap-2.5">
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center">
          <motion.div
            {...scoreGlow}
            className="absolute inset-0 rounded-full bg-amber-500/15"
            aria-hidden
          />
          <div
            className="absolute inset-0 rounded-full border border-amber-500/30 shadow-[0_0_16px_rgba(245,158,11,0.2)]"
            aria-hidden
          />
          <Sparkles className="relative h-4 w-4 text-amber-300" aria-hidden />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
              {scoreLabel}
            </p>
            <motion.p
              key={displayScore}
              initial={reduceMotion ? false : { opacity: 0.6, scale: 0.92 }}
              animate={{
                opacity: 1,
                scale: countDone && !reduceMotion ? [1, 1.04, 1] : 1,
              }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : countDone
                    ? { scale: { duration: 0.5, ease: "easeOut" } }
                    : { duration: 0.2 }
              }
              className="font-mono text-lg font-bold tabular-nums tracking-tight text-amber-200 sm:text-xl"
            >
              {displayScore}
              <span className="text-sm font-semibold text-neutral-500">/100</span>
            </motion.p>
            {scorePreview ? (
              <span className="rounded-full border border-amber-500/35 bg-amber-500/10 px-1.5 py-px text-[8px] font-bold uppercase tracking-wide text-amber-300">
                {isDe ? "Score-Vorschau" : "Score preview"}
              </span>
            ) : null}
          </div>

          {scoreHint ? (
            <p className="mt-1 break-words text-[10px] leading-snug text-neutral-400">
              {scoreHint}
            </p>
          ) : null}

          <p className="mt-1 text-[9px] leading-snug text-neutral-600">
            {panelCopy.advisory}
          </p>
        </div>
      </div>

      {dimensions.length > 0 ? (
        <div className="relative mt-2.5 space-y-1.5">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-neutral-500">
            {panelCopy.subscoresLabel}
          </p>
          <div
            className="flex min-h-[1.75rem] flex-wrap gap-1"
            aria-label={panelCopy.subscoresLabel}
          >
            {dimensions.map((dimension, index) => {
              const isWeakest = dimension.id === weakestDimensionId;
              const isRevealed = index < revealedCount;

              return (
                <motion.span
                  key={dimension.id}
                  {...revealAt(index)}
                  {...(isRevealed ? hoverDepth : {})}
                  initial={false}
                  animate={{ opacity: isRevealed ? 1 : 0 }}
                  transition={
                    reduceMotion ? { duration: 0 } : { duration: 0.28, ease: "easeOut" }
                  }
                  className={`inline-flex max-w-full items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold transition-shadow ${
                    isWeakest
                      ? "border-amber-500/45 bg-amber-500/12 text-amber-100 shadow-[0_0_14px_rgba(245,158,11,0.2)]"
                      : "border-white/[0.08] bg-neutral-900/55 text-neutral-400 hover:border-amber-500/20 hover:shadow-[0_0_10px_rgba(245,158,11,0.08)]"
                  }`}
                >
                  <span className="truncate">{dimension.label}</span>
                  <span className="font-mono tabular-nums text-neutral-200">
                    {dimension.score}
                  </span>
                  {isWeakest ? (
                    <span className="sr-only">{panelCopy.weakestPointLabel}</span>
                  ) : null}
                </motion.span>
              );
            })}
          </div>
        </div>
      ) : scorePreview && score > 0 ? (
        <p className="relative mt-2 text-[9px] text-neutral-500">
          {isDe
            ? "Teilwerte folgen nach dem Rendern."
            : "Subscores will appear after rendering."}
        </p>
      ) : null}
    </motion.div>
  );
}

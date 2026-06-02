"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Clapperboard,
  Hash,
  ImageIcon,
  LayoutGrid,
  MessageSquare,
  Play,
} from "lucide-react";
import { SHOWCASE_VARIATION_IMAGE_FALLBACK } from "@/app/lib/showcase/social-asset-pack-showcase-demo";
import type {
  PackAssemblyStepId,
  PackShowcaseData,
  PackShowcaseMode,
} from "./pack-showcase-types";
import { stepIndex } from "./pack-showcase-types";
import { PACK_SHOWCASE_STYLES, usePackMotion } from "./use-pack-motion";

type Props = {
  data: PackShowcaseData;
  language: "en" | "de";
  mode: PackShowcaseMode;
  activeStep: PackAssemblyStepId;
  className?: string;
};

export default function PackAssetGrid({
  data,
  language,
  mode,
  activeStep,
  className = "",
}: Props) {
  const { fadeIn, pulse, reduceMotion, revealAt, hoverDepth } = usePackMotion();
  const [imageFallbackIndex, setImageFallbackIndex] = useState<number | null>(
    null
  );
  const labels = data.labels.outputs;

  const showImages =
    mode === "preview" ||
    mode === "result" ||
    stepIndex(activeStep) >= stepIndex("images");
  const showMotion =
    mode === "preview" ||
    mode === "result" ||
    stepIndex(activeStep) >= stepIndex("motion");
  const showCopy =
    mode === "preview" ||
    mode === "result" ||
    stepIndex(activeStep) >= stepIndex("copy");

  const showFormats =
    (mode === "preview" || mode === "result") &&
    Boolean(data.formatSuggestions?.length);

  const imageSlots = data.imageUrls ?? [null, null, null];

  const copyMeta = [
    { key: "hooks", label: labels.hooks, icon: MessageSquare, count: data.hooks.length },
    {
      key: "captions",
      label: labels.captions,
      icon: MessageSquare,
      count: data.captions.length,
    },
    { key: "hashtags", label: labels.hashtags, icon: Hash, count: data.hashtags ? 1 : 0 },
  ] as const;

  return (
    <div className={`min-w-0 space-y-3 overflow-hidden ${className}`}>
      {showImages ? (
        <motion.div
          {...fadeIn}
          className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:gap-2"
        >
          <div className="min-w-0 flex-1">
            <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold text-neutral-300">
              <ImageIcon className="h-3 w-3 shrink-0 text-amber-400/80" aria-hidden />
              <span className="truncate">{labels.imageVariations}</span>
            </p>
            <div className="grid min-w-0 grid-cols-3 gap-1 sm:gap-1.5">
              {imageSlots.slice(0, 3).map((src, index) => (
                <motion.div
                  key={`img-${index}`}
                  {...revealAt(index)}
                  {...hoverDepth}
                  className={PACK_SHOWCASE_STYLES.variationCard}
                >
                  <div
                    className={PACK_SHOWCASE_STYLES.variationShine}
                    aria-hidden
                  />
                  {src ? (
                    <Image
                      src={
                        imageFallbackIndex === index
                          ? SHOWCASE_VARIATION_IMAGE_FALLBACK
                          : src
                      }
                      alt=""
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      sizes="(max-width: 640px) 28vw, 100px"
                      unoptimized
                      onError={() => setImageFallbackIndex(index)}
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-neutral-900 via-[#0E1220] to-neutral-950 p-1 text-center">
                      <ImageIcon
                        className="h-4 w-4 text-amber-500/40"
                        aria-hidden
                      />
                      <span className="text-[8px] font-medium leading-tight text-neutral-500">
                        {data.labels.variationLabels[index]}
                      </span>
                    </div>
                  )}
                  <span className="absolute bottom-0.5 left-0.5 z-[1] max-w-[calc(100%-0.25rem)] truncate rounded border border-white/10 bg-black/60 px-1 py-px text-[7px] font-semibold text-white/90 backdrop-blur-sm">
                    {data.labels.variationLabels[index]}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {showMotion ? (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.28, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              {...hoverDepth}
              className="mx-auto w-full max-w-[5.5rem] shrink-0 sm:mx-0 sm:w-[4.5rem]"
            >
              <p className="mb-1.5 flex items-center justify-center gap-1 text-[10px] font-semibold text-neutral-300 sm:justify-start">
                <Clapperboard
                  className="h-3 w-3 shrink-0 text-amber-400/80"
                  aria-hidden
                />
                <span className="truncate">{labels.motionClip}</span>
              </p>
              <div className={PACK_SHOWCASE_STYLES.motionCard}>
                <div
                  className={PACK_SHOWCASE_STYLES.motionGlow}
                  aria-hidden
                />
                {data.videoUrl ? (
                  <video
                    src={data.videoUrl}
                    className="relative z-[1] h-full w-full object-cover"
                    muted
                    playsInline
                    loop
                    autoPlay={!reduceMotion}
                  />
                ) : (
                  <>
                    <motion.div
                      className="pointer-events-none absolute inset-0 z-[1] rounded-lg ring-1 ring-amber-500/20"
                      animate={
                        reduceMotion
                          ? undefined
                          : {
                              boxShadow: [
                                "inset 0 0 12px rgba(245,158,11,0.08)",
                                "inset 0 0 20px rgba(245,158,11,0.16)",
                                "inset 0 0 12px rgba(245,158,11,0.08)",
                              ],
                            }
                      }
                      transition={
                        reduceMotion
                          ? undefined
                          : {
                              duration: 2.6,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }
                      }
                      aria-hidden
                    />
                    <motion.div
                      {...pulse}
                      className="absolute inset-0 z-[2] flex flex-col items-center justify-center gap-0.5"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/15 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
                        <Play
                          className="h-3 w-3 text-amber-300/90"
                          aria-hidden
                        />
                      </span>
                      <span className="text-[7px] font-semibold uppercase tracking-wide text-neutral-500">
                        5s
                      </span>
                    </motion.div>
                  </>
                )}
              </div>
              <p className="mt-1 text-center text-[9px] leading-tight text-neutral-500 sm:text-left">
                {data.labels.motionClipHint}
              </p>
            </motion.div>
          ) : null}
        </motion.div>
      ) : null}

      {showCopy && (data.hooks.length > 0 || data.hashtags) ? (
        <motion.div {...fadeIn} className="min-w-0 space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {copyMeta.map(({ key, label, icon: Icon, count }, index) => (
              <motion.div
                key={key}
                {...revealAt(index)}
                {...hoverDepth}
                className={PACK_SHOWCASE_STYLES.copyChip}
              >
                <Check
                  className="h-3 w-3 shrink-0 text-emerald-500/80"
                  aria-hidden
                />
                <Icon className="h-3 w-3 shrink-0 text-amber-400/70" aria-hidden />
                <span className="text-[10px] font-semibold leading-snug text-neutral-200">
                  {label}
                </span>
                {count > 0 ? (
                  <span className="rounded-full bg-amber-500/15 px-1.5 py-px text-[9px] font-bold tabular-nums text-amber-300/90">
                    {count}
                  </span>
                ) : null}
              </motion.div>
            ))}
          </div>

          {data.hooks.length > 0 ? (
            <motion.div
              {...revealAt(3)}
              className="min-w-0 rounded-lg border border-white/[0.08] bg-neutral-950/60 p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
            >
              <p className="text-[9px] font-semibold uppercase tracking-wide text-neutral-500">
                {labels.hooks}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {data.hooks.slice(0, 5).map((hook, hookIndex) => (
                  <motion.span
                    key={hook}
                    {...revealAt(4 + hookIndex)}
                    className={PACK_SHOWCASE_STYLES.hookPill}
                  >
                    <span className="line-clamp-1 max-w-[140px]">{hook}</span>
                  </motion.span>
                ))}
                {data.hooks.length > 5 ? (
                  <span className="self-center px-1 text-[10px] text-neutral-600">
                    +{data.hooks.length - 5}
                  </span>
                ) : null}
              </div>
            </motion.div>
          ) : null}

          {data.captions.length > 0 ? (
            <motion.div
              {...revealAt(9)}
              className="min-w-0 rounded-lg border border-white/[0.08] bg-neutral-950/60 p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
            >
              <p className="text-[9px] font-semibold uppercase tracking-wide text-neutral-500">
                {labels.captions}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {data.captions.slice(0, 3).map((caption, captionIndex) => (
                  <motion.span
                    key={caption}
                    {...revealAt(10 + captionIndex)}
                    className={PACK_SHOWCASE_STYLES.hookPill}
                  >
                    <span className="line-clamp-2 max-w-[180px]">{caption}</span>
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ) : null}

          {data.hashtags ? (
            <motion.p
              {...revealAt(14)}
              className="break-words rounded-lg border border-white/[0.06] bg-neutral-950/40 px-2.5 py-2 text-[10px] leading-snug text-neutral-400"
            >
              <Hash
                className="mr-1 inline h-3 w-3 text-amber-400/60"
                aria-hidden
              />
              {data.hashtags}
            </motion.p>
          ) : null}
        </motion.div>
      ) : null}

      {showFormats ? (
        <motion.div {...fadeIn} className="flex min-w-0 flex-wrap items-center gap-1.5">
          <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold text-neutral-500">
            <LayoutGrid className="h-3 w-3" aria-hidden />
            {language === "de" ? "Plattform-Formate" : "Platform formats"}
          </span>
          {data.formatSuggestions!.map((format, index) => (
            <motion.span
              key={format}
              {...revealAt(index)}
              className="rounded-full border border-white/[0.08] bg-neutral-900/60 px-2 py-0.5 text-[9px] font-medium text-neutral-300 transition-colors hover:border-amber-500/25 hover:text-amber-100/90"
            >
              {format}
            </motion.span>
          ))}
        </motion.div>
      ) : null}
    </div>
  );
}

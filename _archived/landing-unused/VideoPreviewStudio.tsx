"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { LandingLanguage } from "./magnificContent";
import { magnificContent } from "./magnificContent";
import {
  LANDING_VIDEO_LIPSYNC,
  LANDING_VIDEO_LIPSYNC_FALLBACK,
  LANDING_VIDEO_LIPSYNC_POSTER,
  LANDING_VIDEO_MOTION,
  LANDING_VIDEO_MOTION_FALLBACK,
  LANDING_VIDEO_MOTION_POSTER,
} from "./landingAssets";
import { MEDIA_FOCAL_POINTS } from "./mediaFocalPoints";
import { OBS_SPRING } from "@/lib/obsidian/dashboard-tokens";

function PreviewVideoCard({
  primarySrc,
  fallbackSrc,
  poster,
  focalKey,
  title,
  desc,
  pill,
  loadingLabel,
}: {
  primarySrc: string;
  fallbackSrc: string;
  poster: string;
  focalKey: "lipsync" | "motion";
  title: string;
  desc: string;
  pill: string;
  loadingLabel: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState(primarySrc);
  const [failed, setFailed] = useState(false);

  const objectPosition = MEDIA_FOCAL_POINTS[focalKey];

  useEffect(() => {
    const video = videoRef.current;
    if (!video || failed) return;
    void video.play().catch(() => undefined);
  }, [src, failed]);

  return (
    <article className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] shadow-2xl">
      <div className="relative aspect-[9/16] w-full bg-neutral-950 sm:aspect-[4/5]">
        {!failed ? (
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
            style={{ objectPosition }}
            onError={() => {
              if (src !== fallbackSrc) {
                setSrc(fallbackSrc);
                return;
              }
              setFailed(true);
            }}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center backdrop-blur-xl">
            <div className="h-10 w-10 rounded-full border border-amber-500/30 bg-amber-500/10" />
            <p className="text-sm font-medium text-neutral-300">{loadingLabel}</p>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute bottom-0 left-0 p-5 sm:p-6">
          <span className="mb-2 inline-flex rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-400">
            {pill}
          </span>
          <p className="text-sm font-bold uppercase tracking-wide text-white">{title}</p>
          <p className="mt-1 text-xs text-neutral-400">{desc}</p>
        </div>
      </div>
    </article>
  );
}

export default function VideoPreviewStudio({
  currentLanguage,
}: {
  currentLanguage: LandingLanguage;
}) {
  const t = magnificContent[currentLanguage].video;
  const isDe = currentLanguage === "de";
  const loadingLabel = isDe ? "Preview-Modul wird geladen" : "Preview module loading";

  return (
    <section className="w-full bg-[#050505] py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={OBS_SPRING}
          className="mb-10 text-center sm:mb-12"
        >
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.35em] text-amber-400/80">
            {isDe ? "Studio Preview" : "Studio Preview"}
          </p>
          <h2 className="mt-4 text-2xl font-black uppercase italic leading-none tracking-tight text-white sm:text-4xl md:text-5xl">
            Motion Transfer · Lip-Sync
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ ...OBS_SPRING, delay: 0.08 }}
          className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8"
        >
          <PreviewVideoCard
            primarySrc={LANDING_VIDEO_LIPSYNC}
            fallbackSrc={LANDING_VIDEO_LIPSYNC_FALLBACK}
            poster={LANDING_VIDEO_LIPSYNC_POSTER}
            focalKey="lipsync"
            title={t.lipsync.title}
            desc={t.lipsync.desc}
            pill={t.lipsync.pill}
            loadingLabel={loadingLabel}
          />
          <PreviewVideoCard
            primarySrc={LANDING_VIDEO_MOTION}
            fallbackSrc={LANDING_VIDEO_MOTION_FALLBACK}
            poster={LANDING_VIDEO_MOTION_POSTER}
            focalKey="motion"
            title={t.motion.title}
            desc={t.motion.desc}
            pill={t.motion.pill}
            loadingLabel={loadingLabel}
          />
        </motion.div>
      </div>
    </section>
  );
}

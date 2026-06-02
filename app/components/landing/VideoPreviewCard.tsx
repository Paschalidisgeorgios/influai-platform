"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { LANDING_MEDIA_IMAGE_FALLBACK } from "@/lib/landing/landing-media-proof";

export type VideoPreviewCardProps = {
  posterSrc: string;
  videoSrc?: string;
  alt: string;
  title: string;
  hint?: string;
  /** CSS aspect-ratio, default 9/16 for Reels */
  aspectRatio?: string;
  className?: string;
};

/**
 * Short motion preview — poster by default; muted loop only when in view
 * and a video source is provided. Never plays sound.
 */
export default function VideoPreviewCard({
  posterSrc,
  videoSrc,
  alt,
  title,
  hint,
  aspectRatio = "9/16",
  className = "",
}: VideoPreviewCardProps) {
  const rootRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inView = useInView(rootRef, { amount: 0.35, margin: "120px 0px" });
  const reduceMotion = useReducedMotion();
  const [videoReady, setVideoReady] = useState(false);
  const canPlayVideo = Boolean(videoSrc) && inView && !reduceMotion;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!canPlayVideo) {
      video.pause();
      return;
    }

    video.muted = true;
    video.playsInline = true;
    video.loop = true;
    const playPromise = video.play();
    if (playPromise) {
      void playPromise.catch(() => {
        /* Autoplay blocked — poster remains visible */
      });
    }

    return () => {
      video.pause();
    };
  }, [canPlayVideo]);

  return (
    <article
      ref={rootRef}
      className={`relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#0a0a0a] ${className}`}
      style={{ aspectRatio }}
      aria-label={title}
    >
      <Image
        src={posterSrc}
        alt={alt}
        fill
        loading="lazy"
        sizes="(max-width: 640px) 50vw, 240px"
        className={`object-cover transition-opacity duration-300 ${
          videoReady && canPlayVideo ? "opacity-0" : "opacity-100"
        }`}
        onError={(event) => {
          const img = event.currentTarget;
          if (img.src.includes(LANDING_MEDIA_IMAGE_FALLBACK)) return;
          img.src = LANDING_MEDIA_IMAGE_FALLBACK;
        }}
      />

      {videoSrc ? (
        <video
          ref={videoRef}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
            videoReady && canPlayVideo ? "opacity-100" : "opacity-0"
          }`}
          muted
          loop
          playsInline
          preload="none"
          poster={posterSrc}
          aria-hidden
          onLoadedData={() => setVideoReady(true)}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : null}

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
        aria-hidden
      />

      {!canPlayVideo || !videoSrc ? (
        <motion.div
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1"
          animate={
            reduceMotion
              ? undefined
              : {
                  opacity: [0.85, 1, 0.85],
                }
          }
          transition={
            reduceMotion
              ? undefined
              : { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
          }
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-500/35 bg-amber-500/15 shadow-[0_0_14px_rgba(245,158,11,0.2)]">
            <Play className="h-3.5 w-3.5 text-amber-200/90" aria-hidden />
          </span>
        </motion.div>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 z-[1] space-y-0.5 bg-gradient-to-t from-black/80 to-transparent px-2.5 pb-2 pt-6">
        <p className="text-[10px] font-semibold text-white">{title}</p>
        {hint ? (
          <p className="text-[9px] text-neutral-400">{hint}</p>
        ) : null}
      </div>
    </article>
  );
}

"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import type { LandingLanguage } from "./magnificContent";
import { magnificContent } from "./magnificContent";
import { LANDING_ZOOM_FALLBACK, LANDING_ZOOM_IMAGE } from "./landingAssets";
import { MEDIA_FOCAL_POINTS } from "./mediaFocalPoints";

export default function ScrollZoomSection({
  currentLanguage,
}: {
  currentLanguage: LandingLanguage;
}) {
  const t = magnificContent[currentLanguage].zoom;
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.55, 1], [0.6, 1.2, 1.15]);
  const rotateX = useTransform(scrollYProgress, [0, 0.55, 1], [-5, 0, 0]);
  const rotateY = useTransform(scrollYProgress, [0, 0.55, 1], [5, 0, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.12, 0.88, 1], [0.35, 1, 1, 0.92]);
  const textOpacity = useTransform(scrollYProgress, [0.4, 0.6], [0, 1]);
  const textY = useTransform(scrollYProgress, [0.4, 0.62], [40, 0]);

  return (
    <section
      id="product"
      ref={ref}
      className="relative min-h-[190vh] bg-[#050505] text-white"
    >
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden px-4 py-16 sm:px-6 [perspective:1200px]">
        <motion.div
          style={{
            scale,
            rotateX,
            rotateY,
            opacity,
            transformPerspective: 1200,
          }}
          className="relative h-[58vh] w-full max-w-6xl overflow-hidden rounded-3xl border border-neutral-800/80 bg-neutral-900/40 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl will-change-transform"
        >
          <Image
            src={LANDING_ZOOM_IMAGE}
            alt=""
            fill
            className="object-cover"
            style={{ objectPosition: MEDIA_FOCAL_POINTS.creator }}
            sizes="100vw"
            priority
            unoptimized
            onError={(e) => {
              const img = e.currentTarget;
              if (img.src !== LANDING_ZOOM_FALLBACK) img.src = LANDING_ZOOM_FALLBACK;
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,0.65)_100%)]" />
        </motion.div>

        <motion.div
          style={{ opacity: textOpacity, y: textY }}
          className="mt-12 max-w-4xl text-center"
        >
          <h2 className="text-2xl font-extrabold uppercase italic leading-none tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
            <span className="bg-gradient-to-r from-white via-neutral-100 to-neutral-500 bg-clip-text text-transparent">
              {t.headline}
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-sm leading-relaxed text-neutral-400 md:text-base">
            {t.body}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

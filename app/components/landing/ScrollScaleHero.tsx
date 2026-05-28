"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

type ScrollScaleHeroProps = {
  title?: string;
  nextTitle?: string;
  nextSubtitle?: string;
  className?: string;
};

export default function ScrollScaleHero({
  title = "This is InfluExAi",
  nextTitle = "From single assets to complete campaign systems.",
  nextSubtitle =
    "Generate visuals, creator content, brand assets and ad-ready formats in one focused AI studio.",
  className = "",
}: ScrollScaleHeroProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 18]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.72, 0.92], [1, 1, 0]);
  const nextOpacity = useTransform(scrollYProgress, [0.72, 0.9], [0, 1]);
  const nextY = useTransform(scrollYProgress, [0.72, 0.9], [40, 0]);

  return (
    <section
      ref={sectionRef}
      aria-label={title}
      className={`relative h-[240vh] bg-slate-50 ${className}`}
    >
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden px-6">
        {prefersReducedMotion ? (
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-5xl font-black tracking-tighter text-slate-950 md:text-7xl">
              {title}
            </h2>
            <div className="mt-10 space-y-4">
              <p className="text-2xl font-bold text-slate-900 md:text-3xl">{nextTitle}</p>
              <p className="text-base leading-7 text-slate-600 md:text-lg">{nextSubtitle}</p>
            </div>
          </div>
        ) : (
          <>
            <motion.h2
              style={{ scale, opacity: titleOpacity }}
              className="whitespace-nowrap text-center text-6xl font-black tracking-tighter text-slate-950 md:text-8xl lg:text-[10rem]"
            >
              {title}
            </motion.h2>

            <motion.div
              style={{ opacity: nextOpacity, y: nextY }}
              className="pointer-events-none absolute inset-x-6 bottom-[12vh] mx-auto max-w-3xl text-center md:bottom-[14vh]"
            >
              <p className="text-xl font-bold tracking-tight text-slate-900 md:text-3xl">
                {nextTitle}
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
                {nextSubtitle}
              </p>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}

"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useRef } from "react";

type ScrollTextRevealProps = {
  text?: string;
  className?: string;
};

const DEFAULT_TEXT = "Create campaign-ready visuals. Instantly.";

export default function ScrollTextReveal({
  text = DEFAULT_TEXT,
  className = "",
}: ScrollTextRevealProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const words = text.split(/\s+/).filter(Boolean);

  return (
    <section
      ref={sectionRef}
      aria-label={text}
      className={`relative h-[220vh] bg-[#0D0D0F] ${className}`}
    >
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden px-6">
        <h2 className="max-w-6xl text-center text-5xl font-black tracking-tight md:text-7xl lg:text-8xl">
          {prefersReducedMotion ? (
            <span className="text-[#d8ad5f]">{text}</span>
          ) : (
            words.map((word, index) => (
              <ScrollRevealWord
                key={`${word}-${index}`}
                word={word}
                index={index}
                total={words.length}
                scrollYProgress={scrollYProgress}
              />
            ))
          )}
        </h2>
      </div>
    </section>
  );
}

function ScrollRevealWord({
  word,
  index,
  total,
  scrollYProgress,
}: {
  word: string;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}) {
  const start = Math.min(0.9, 0.05 + (index / Math.max(total, 1)) * 0.55);
  const end = Math.min(0.98, start + 0.15);

  const opacity = useTransform(scrollYProgress, [start, end], [0.1, 1]);
  const y = useTransform(scrollYProgress, [start, end], [16, 0]);
  const color = useTransform(
    scrollYProgress,
    [start, end],
    ["rgba(255,255,255,0.15)", "#d8ad5f"]
  );

  return (
    <motion.span
      aria-hidden="true"
      style={{ opacity, y, color }}
      className="mr-[0.28em] inline-block last:mr-0"
    >
      {word}
    </motion.span>
  );
}

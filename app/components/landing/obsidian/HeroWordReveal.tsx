"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { OBS_SPRING } from "@/lib/obsidian/dashboard-tokens";

type Props = {
  text: string;
  className?: string;
  /** When true, preserves natural sentence casing instead of uppercase display. */
  sentenceCase?: boolean;
};

/** Cinematic word reveal — heavy spring, blur dissolve, luxury tracking */
export default function HeroWordReveal({
  text,
  className = "",
  sentenceCase = false,
}: Props) {
  const words = text.split(/\s+/).filter(Boolean);
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const skipMotion = !mounted || Boolean(reduceMotion);

  return (
    <h1
      className={`max-w-2xl text-[2rem] font-black not-italic tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12] ${
        sentenceCase ? "normal-case" : "uppercase tracking-[0.06em]"
      } ${className}`}
    >
      <span className="inline-flex flex-wrap gap-x-[0.35em] gap-y-1">
        {words.map((word, index) => (
          <motion.span
            key={`${word}-${index}`}
            initial={
              skipMotion
                ? { opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }
                : { opacity: 0, y: 28, filter: "blur(14px)", scale: 0.96 }
            }
            animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
            transition={
              skipMotion
                ? { duration: 0 }
                : {
                    ...OBS_SPRING,
                    delay: 0.08 + index * 0.14,
                  }
            }
            className="inline-block origin-left bg-gradient-to-br from-white via-neutral-100 to-neutral-400/90 bg-clip-text text-transparent"
          >
            {word}
          </motion.span>
        ))}
      </span>
    </h1>
  );
}

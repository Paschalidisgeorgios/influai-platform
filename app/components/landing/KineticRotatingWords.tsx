"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const ROTATE_MS = 2800;

type Props = {
  words: readonly string[];
  className?: string;
};

/**
 * Fixed-width rotating phrase — longest word reserves space (no layout shift).
 */
export default function KineticRotatingWords({ words, className = "" }: Props) {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const longest = useMemo(
    () => words.reduce((a, b) => (a.length >= b.length ? a : b), ""),
    [words]
  );

  const current = words[index] ?? words[0] ?? "";
  const skipMotion = !mounted || Boolean(reduceMotion);

  useEffect(() => {
    setIndex(0);
  }, [words]);

  useEffect(() => {
    if (reduceMotion || words.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [reduceMotion, words]);

  if (!words.length) return null;

  return (
    <span
      className={`relative inline-grid place-items-center text-center ${className}`}
      aria-live="polite"
      aria-atomic="true"
    >
      <span
        className="invisible col-start-1 row-start-1 whitespace-nowrap px-0.5 text-[1.35rem] font-black sm:text-[1.5rem]"
        aria-hidden
      >
        {longest}
      </span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={current}
          initial={
            skipMotion ? false : { opacity: 0, y: 14, filter: "blur(6px)" }
          }
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={
            skipMotion ? undefined : { opacity: 0, y: -10, filter: "blur(4px)" }
          }
          transition={{ duration: skipMotion ? 0 : 0.38, ease: [0.22, 1, 0.36, 1] }}
          className="col-start-1 row-start-1 whitespace-nowrap bg-gradient-to-r from-[#f0d4a8] via-[#d8ad5f] to-[#d8ad5f] bg-clip-text text-[1.35rem] font-black tracking-tight text-transparent sm:text-[1.5rem]"
        >
          {current}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

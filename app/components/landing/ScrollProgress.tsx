"use client";

import { useReducedMotion, useScroll, useSpring, motion } from "framer-motion";

export default function ScrollProgress() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  if (prefersReducedMotion) return null;

  return (
    <motion.div
      style={{
        scaleX,
        transformOrigin: "left",
        background: "linear-gradient(to right, #d8ad5f, #efc777)",
      }}
      className="fixed top-0 left-0 right-0 z-50 h-[2px] pointer-events-none"
      aria-hidden="true"
    />
  );
}

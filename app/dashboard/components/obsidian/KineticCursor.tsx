"use client";

import { motion, useMotionValue, useSpring, type MotionValue } from "framer-motion";
import { useEffect } from "react";

type Props = {
  cursorX: MotionValue<number>;
  cursorY: MotionValue<number>;
};

export default function KineticCursor({ cursorX, cursorY }: Props) {
  const innerX = useSpring(cursorX, { stiffness: 900, damping: 38, mass: 0.15 });
  const innerY = useSpring(cursorY, { stiffness: 900, damping: 38, mass: 0.15 });
  const midX = useSpring(cursorX, { stiffness: 420, damping: 28, mass: 0.35 });
  const midY = useSpring(cursorY, { stiffness: 420, damping: 28, mass: 0.35 });
  const outerX = useSpring(cursorX, { stiffness: 180, damping: 22, mass: 0.55 });
  const outerY = useSpring(cursorY, { stiffness: 180, damping: 22, mass: 0.55 });

  useEffect(() => {
    document.body.style.cursor = "none";
    return () => {
      document.body.style.cursor = "";
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[300]">
      <motion.div
        className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2"
        style={{ x: outerX, y: outerY }}
      >
        <div className="h-12 w-12 rounded-full border border-neutral-700/80" />
      </motion.div>
      <motion.div
        className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2"
        style={{ x: midX, y: midY }}
      >
        <div className="h-7 w-7 rounded-full border border-neutral-600/80" />
      </motion.div>
      <motion.div
        className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2"
        style={{ x: innerX, y: innerY }}
      >
        <div className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.95)]" />
      </motion.div>
    </div>
  );
}

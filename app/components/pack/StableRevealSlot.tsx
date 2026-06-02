"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { usePackMotion } from "./use-pack-motion";

type Props = {
  visible: boolean;
  /** e.g. min-h-[4.5rem] — keeps parent height stable when content is faded out. */
  reserveMinHeight?: string;
  children: ReactNode;
  className?: string;
};

/** Opacity-only reveal inside a fixed-height panel (no mount/unmount). */
export default function StableRevealSlot({
  visible,
  reserveMinHeight,
  children,
  className = "",
}: Props) {
  const { reduceMotion } = usePackMotion();

  return (
    <div
      className={`${reserveMinHeight ?? ""} ${className}`}
      aria-hidden={!visible}
    >
      <motion.div
        initial={false}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={
          reduceMotion ? { duration: 0 } : { duration: 0.32, ease: [0.22, 1, 0.36, 1] }
        }
        className={visible ? "" : "pointer-events-none"}
      >
        {children}
      </motion.div>
    </div>
  );
}

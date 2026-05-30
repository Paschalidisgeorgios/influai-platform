"use client";

import { motion } from "framer-motion";
import { useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  variant?: "amber" | "ghost";
  disabled?: boolean;
  onClick?: () => void;
  "aria-label"?: string;
};

export default function ShockwaveButton({
  children,
  className = "",
  variant = "amber",
  disabled = false,
  onClick,
  "aria-label": ariaLabel,
}: Props) {
  const [pulse, setPulse] = useState(0);

  const base =
    variant === "amber"
      ? "rounded-xl bg-amber-500 font-black text-neutral-950 hover:bg-amber-600"
      : "rounded-xl border border-neutral-800/80 bg-neutral-900/40 font-semibold text-neutral-300 hover:border-amber-500/40";

  return (
    <motion.button
      type="button"
      disabled={disabled}
      aria-label={ariaLabel}
      className={`relative overflow-hidden px-5 py-2.5 text-sm transition disabled:opacity-60 ${base} ${className}`}
      animate={
        pulse > 0
          ? {
              boxShadow: [
                "0 0 0 rgba(245,158,11,0)",
                "0 0 40px rgba(245,158,11,0.55)",
                "0 0 0 rgba(245,158,11,0)",
              ],
            }
          : { boxShadow: "0 0 0 rgba(245,158,11,0)" }
      }
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => {
        if (disabled) return;
        setPulse((k) => k + 1);
        onClick?.();
      }}
    >
      {children}
    </motion.button>
  );
}

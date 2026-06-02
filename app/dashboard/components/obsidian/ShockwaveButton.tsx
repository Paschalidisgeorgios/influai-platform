"use client";

import { motion } from "framer-motion";
import { useState, type ReactNode } from "react";
import { obsidianButtonClass } from "@/lib/obsidian/button-tokens";

type Props = {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  onClick?: () => void;
  "aria-label"?: string;
};

export default function ShockwaveButton({
  children,
  className = "",
  variant = "primary",
  disabled = false,
  onClick,
  "aria-label": ariaLabel,
}: Props) {
  const [pulse, setPulse] = useState(0);

  const base = obsidianButtonClass(variant, {
    size: "md",
    className: `relative overflow-hidden px-5 py-2.5 ${className}`,
  });

  return (
    <motion.button
      type="button"
      disabled={disabled}
      aria-label={ariaLabel}
      className={base}
      animate={
        pulse > 0 && variant === "primary"
          ? {
              boxShadow: [
                "0 0 24px rgba(245,158,11,0.32)",
                "0 0 44px rgba(245,158,11,0.55)",
                "0 0 24px rgba(245,158,11,0.32)",
              ],
            }
          : undefined
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

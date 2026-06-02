"use client";

import { motion } from "framer-motion";
import type { NarrativeStepId } from "@/lib/landing/motion-narrative-content";
import { OBS_SPRING } from "@/lib/obsidian/dashboard-tokens";

type Props = {
  stepId: string;
  index: number;
  label: string;
  active: boolean;
  complete: boolean;
  onSelect: () => void;
};

export default function NarrativeStepCard({
  stepId,
  index,
  label,
  active,
  complete,
  onSelect,
}: Props) {
  return (
    <motion.button
      type="button"
      id={`narrative-tab-${stepId}`}
      role="tab"
      aria-selected={active}
      aria-controls={`narrative-panel-${stepId}`}
      onClick={onSelect}
      whileTap={{ scale: 0.98 }}
      transition={OBS_SPRING}
      className={`shrink-0 rounded-xl border px-2.5 py-2 text-left transition-[box-shadow,background-color,border-color] duration-200 sm:min-w-[6.75rem] ${
        active
          ? "border-[#d8ad5f]/45 bg-[#d8ad5f]/10 shadow-[0_0_20px_rgba(216,173,95,0.14)]"
          : complete
            ? "border-white/[0.1] bg-white/[0.03]"
            : "border-white/[0.06] bg-neutral-900/40 backdrop-blur-2xl hover:border-[#d8ad5f]/25"
      }`}
    >
      <span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-[#faf3e3]0/80">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span
        className={`mt-0.5 block text-xs font-semibold leading-tight ${
          active ? "text-white" : complete ? "text-white/75" : "text-white/55"
        }`}
      >
        {label}
      </span>
    </motion.button>
  );
}

export type { NarrativeStepId };

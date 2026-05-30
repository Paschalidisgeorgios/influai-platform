"use client";

import { motion } from "framer-motion";
import { OBS, OBS_SPRING } from "@/lib/obsidian/dashboard-tokens";
import { useLanguage } from "@/hooks/useLanguage";

export type DurationOption = {
  seconds: 5 | 10;
  credits: number;
};

const DEFAULT_OPTIONS: DurationOption[] = [
  { seconds: 5, credits: 25 },
  { seconds: 10, credits: 50 },
];

type Props = {
  value: 5 | 10;
  onChange: (seconds: 5 | 10) => void;
  options?: DurationOption[];
  className?: string;
  label?: string;
};

export default function DurationPills({
  value,
  onChange,
  options = DEFAULT_OPTIONS,
  className = "",
  label,
}: Props) {
  const { isDe } = useLanguage();

  return (
    <div className={className}>
      {label ? (
        <p className={`mb-2 ${OBS.mono}`}>{label}</p>
      ) : (
        <p className={`mb-2 ${OBS.mono}`}>
          {isDe ? "DAUER & PREIS" : "DURATION & PRICING"}
        </p>
      )}
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {options.map((opt, index) => {
          const selected = value === opt.seconds;
          return (
            <motion.button
              key={opt.seconds}
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...OBS_SPRING, delay: index * 0.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onChange(opt.seconds)}
              className={`rounded-full border px-3 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm ${
                selected ? OBS.pillActive : OBS.pillIdle
              }`}
            >
              {opt.seconds}s · {opt.credits}{" "}
              {isDe ? "Credits" : "Credits"}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export function videoCreditsForDuration(seconds: 5 | 10): number {
  return seconds === 10 ? 50 : 25;
}

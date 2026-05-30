"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import CommandBar from "../obsidian/CommandBar";
import { OBS_SPRING } from "@/lib/obsidian/dashboard-tokens";
import { useDashboardLanguage } from "../../DashboardLanguageProvider";

type Pill = { id: string; label: string };

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading?: boolean;
  disabled?: boolean;
  submitLabel?: string;
  engineLabel?: string;
  creditCost?: number;
  formatLabel?: string;
  pills?: Pill[];
  headerSlot?: ReactNode;
  autoFocus?: boolean;
};

export default function SmartCommandBox({
  value,
  onChange,
  onSubmit,
  loading = false,
  disabled = false,
  submitLabel,
  engineLabel,
  creditCost,
  formatLabel,
  pills = [],
  headerSlot,
  autoFocus = true,
}: Props) {
  const { language } = useDashboardLanguage();
  const isDe = language === "de";

  const metaPills: Pill[] = [
    ...(engineLabel
      ? [
          {
            id: "engine",
            label: isDe ? `Engine · ${engineLabel}` : `Engine · ${engineLabel}`,
          },
        ]
      : []),
    ...(creditCost != null
      ? [
          {
            id: "credits",
            label: `${creditCost} ${isDe ? "Credits" : "Credits"}`,
          },
        ]
      : []),
    ...(formatLabel
      ? [
          {
            id: "format",
            label: isDe ? `Format · ${formatLabel}` : `Format · ${formatLabel}`,
          },
        ]
      : []),
    ...pills.filter((p) => !["engine", "cost", "credits", "format"].includes(p.id)),
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={OBS_SPRING}
      className="mx-auto w-full max-w-5xl"
      aria-label={isDe ? "Smart Command" : "Smart Command"}
    >
      <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
        {isDe ? "Was möchtest du erstellen?" : "What do you want to create?"}
      </p>
      <div className="rounded-3xl border border-white/10 bg-white/[0.045] shadow-2xl shadow-black/40">
        <CommandBar
          value={value}
          onChange={onChange}
          onSubmit={onSubmit}
          loading={loading}
          disabled={disabled}
          submitLabel={submitLabel}
          pills={metaPills}
          headerSlot={headerSlot}
          floating={false}
          embedded
          className="w-full"
          autoFocus={autoFocus}
        />
      </div>
    </motion.section>
  );
}

"use client";

import { motion } from "framer-motion";
import { OBS, OBS_SPRING, type ObsidianEngineCard, type ObsidianEngineId } from "@/lib/obsidian/dashboard-tokens";
import { useLanguage } from "@/hooks/useLanguage";

type Props = {
  engines: ObsidianEngineCard[];
  selectedId: ObsidianEngineId;
  onSelect: (id: ObsidianEngineId) => void;
  className?: string;
};

export default function EngineGrid({ engines, selectedId, onSelect, className = "" }: Props) {
  const { isDe } = useLanguage();

  return (
    <div className={`grid w-full grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 ${className}`}>
      {engines.map((engine, index) => {
        const selected = engine.id === selectedId;
        return (
          <motion.button
            key={engine.id}
            type="button"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...OBS_SPRING, delay: index * 0.05 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(engine.id)}
            className={`rounded-3xl border p-3 text-left backdrop-blur-2xl transition sm:p-4 ${
              selected ? OBS.engineActive : OBS.engineIdle
            } ${selected ? "shadow-[0_0_30px_rgba(245,158,11,0.15)]" : ""}`}
          >
            <p className="text-[10px] font-black tracking-wider sm:text-xs">{engine.label}</p>
            <p className="mt-1.5 text-[10px] leading-relaxed text-neutral-500 sm:mt-2 sm:text-[11px]">
              {isDe ? engine.descriptionDe : engine.descriptionEn}
            </p>
            {selected ? (
              <motion.span
                layoutId="engine-laser"
                className="mt-3 block h-px w-full bg-gradient-to-r from-transparent via-amber-500 to-transparent"
                transition={OBS_SPRING}
              />
            ) : null}
          </motion.button>
        );
      })}
    </div>
  );
}

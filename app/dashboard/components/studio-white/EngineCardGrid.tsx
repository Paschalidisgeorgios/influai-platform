"use client";

import { motion } from "framer-motion";
import { OBS, OBS_SPRING } from "@/lib/obsidian/dashboard-tokens";
import type { ModelOption } from "@/lib/dashboard/workspace-types";
import type { ModelAvailability } from "@/lib/ai/krea-model-registry";
import { modelAvailabilityState } from "@/lib/dashboard/studio-white/model-availability";
import type { WhiteLabelEngineCard } from "@/lib/dashboard/white-label-engines";
import { useLanguage } from "@/hooks/useLanguage";

type EngineGridItem = ModelOption | WhiteLabelEngineCard;

type Props = {
  engines: EngineGridItem[];
  selectedId: string;
  onSelect: (id: string) => void;
};

function normalizeEngine(engine: EngineGridItem, isDe: boolean): ModelOption {
  if ("value" in engine) {
    return engine;
  }

  return {
    value: engine.id,
    label: isDe ? engine.labelDe : engine.labelEn,
    note: isDe ? engine.descriptionDe : engine.descriptionEn,
    disabled: false,
    availability: "active",
  };
}

function cardClassName(
  availability: ModelAvailability | undefined,
  selected: boolean,
  isUnavailable: boolean
): string {
  if (isUnavailable) {
    return "cursor-not-allowed border-neutral-800/50 bg-neutral-950/30 opacity-40";
  }
  if (selected) {
    return OBS.engineActive;
  }
  if (availability === "experimental") {
    return "border-amber-500/45 bg-neutral-900/55 text-neutral-100 hover:border-amber-500/70 hover:bg-neutral-900/70";
  }
  return OBS.engineIdle;
}

export default function EngineCardGrid({ engines, selectedId, onSelect }: Props) {
  const { isDe } = useLanguage();
  const items = engines
    .map((engine) => normalizeEngine(engine, isDe))
    .filter((engine) => !modelAvailabilityState(engine.availability).isHidden);

  return (
    <div className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-3 px-4 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((engine, index) => {
        const selected = engine.value === selectedId;
        const { isUnavailable, isExperimental, isSelectable } = modelAvailabilityState(
          engine.availability
        );
        const disabled = !isSelectable || engine.disabled === true;

        return (
          <motion.button
            key={engine.value}
            type="button"
            disabled={disabled}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: isUnavailable ? 0.45 : 1, y: 0 }}
            transition={{ ...OBS_SPRING, delay: index * 0.03 }}
            whileTap={disabled ? undefined : { scale: 0.97 }}
            onClick={() => {
              if (!disabled) onSelect(engine.value);
            }}
            className={`relative rounded-3xl border p-3 text-left backdrop-blur-2xl transition sm:p-3.5 ${cardClassName(
              engine.availability,
              selected,
              isUnavailable
            )}`}
          >
            {isExperimental ? (
              <span className="absolute right-2 top-2 rounded-full border border-amber-500/50 bg-amber-500/15 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-amber-300">
                {isDe ? "Experimental" : "Experimental"}
              </span>
            ) : null}
            <p
              className={`pr-6 text-xs font-bold sm:text-sm ${
                isUnavailable ? "text-neutral-500" : "text-neutral-100"
              }`}
            >
              {engine.label}
            </p>
            <p
              className={`mt-1.5 line-clamp-2 text-[10px] leading-relaxed sm:text-[11px] ${
                isUnavailable ? "text-neutral-600" : "text-neutral-400"
              }`}
            >
              {engine.note}
            </p>
            {engine.credits != null ? (
              <p
                className={`mt-2 text-[10px] font-medium ${
                  isUnavailable ? "text-neutral-700" : "text-neutral-500"
                }`}
              >
                {engine.credits} Credits
              </p>
            ) : null}
            {isUnavailable ? (
              <p className="mt-1.5 text-[9px] font-medium leading-snug text-neutral-600">
                {isDe
                  ? "Diese Engine ist noch nicht vollständig angebunden."
                  : "This engine is not fully connected yet."}
              </p>
            ) : null}
          </motion.button>
        );
      })}
    </div>
  );
}

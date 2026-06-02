"use client";

import { motion } from "framer-motion";
import type { ClientModelModeView } from "@/app/lib/model-modes/get-visible-model-modes";
import { getModeHoverHint, getModeTagline, getModeCreditTitle } from "@/app/lib/model-modes/mode-copy";
import { getModelModeDisplayLabel } from "@/app/lib/model-modes/mode-display-label";
import CreditCostBadge, { PremiumBadge } from "./CreditCostBadge";
import UpgradeHint from "./UpgradeHint";
import { PREMIUM_CLASSES, PREMIUM_SPRING } from "@/lib/obsidian/premium-tokens";
import type { AccessTier } from "@/app/lib/model-modes/types";
import {
  MODEL_DESCRIPTIONS,
  MODEL_DISPLAY_NAMES,
  resolveModelsForModelMode,
} from "@/lib/ai/model-recommendations";

type Props = {
  modes: ClientModelModeView[];
  selectedId: string;
  onSelect: (modelModeId: string) => void;
  language?: "en" | "de";
  userPlan?: AccessTier | string | null;
  onUpgradeClick?: () => void;
  className?: string;
};

export default function ModelModeSelector({
  modes,
  selectedId,
  onSelect,
  language = "en",
  userPlan,
  onUpgradeClick,
  className = "",
}: Props) {
  const isDe = language === "de";

  if (!modes.length) return null;

  const modelHint = resolveModelsForModelMode(selectedId);
  const hintLang = isDe ? "de" : "en";
  const modelDesc =
    MODEL_DESCRIPTIONS[modelHint.activeModel]?.[hintLang] ?? modelHint.rationale;
  const modelLabel =
    MODEL_DISPLAY_NAMES[modelHint.activeModel] ?? modelHint.activeModel;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <p className={PREMIUM_CLASSES.mono}>
        {isDe ? "Qualitätsmodus" : "Quality mode"}
      </p>
      <div className="flex flex-wrap gap-2 pb-1">
        {modes.map((mode) => {
          const selected = mode.id === selectedId;
          const hint = getModeHoverHint(mode.id, language);
          const tagline = getModeTagline(mode.id, language);
          const creditTitle = getModeCreditTitle(mode.id, language);

          return (
            <motion.div
              key={mode.id}
              role="button"
              tabIndex={0}
              whileTap={{ scale: 0.98 }}
              transition={PREMIUM_SPRING}
              title={`${creditTitle}\n${tagline}`}
              onClick={() => onSelect(mode.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(mode.id);
                }
              }}
              className={`group relative flex min-w-[108px] max-w-[160px] cursor-pointer flex-col gap-1 rounded-xl px-3 py-2.5 text-left min-h-[44px] outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070A12] ${
                selected ? PREMIUM_CLASSES.chipActive : PREMIUM_CLASSES.chipIdle
              }`}
            >
              <span className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-semibold text-[#F9FAFB]">
                  {getModelModeDisplayLabel(mode, language)}
                </span>
                {mode.isPremium ? <PremiumBadge /> : null}
              </span>
              <CreditCostBadge credits={mode.creditCost} />
              {tagline ? (
                <span className="line-clamp-2 text-[11px] leading-snug text-neutral-400">
                  {tagline}
                </span>
              ) : null}
              <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-[#111827] px-2 py-1 text-[10px] text-[#9CA3AF] shadow-lg group-hover:block">
                {hint}
              </span>
              {mode.showUpgradeHint ? (
                <div
                  className="mt-0.5"
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  <UpgradeHint
                    requiredTier={mode.accessTier}
                    userPlan={userPlan}
                    language={language}
                    onUpgradeClick={onUpgradeClick}
                  />
                </div>
              ) : null}
            </motion.div>
          );
        })}
      </div>
      <p className="text-xs text-white/40" role="note">
        <span className="text-white/50">{modelLabel}</span>
        {" · "}
        {modelDesc}
      </p>
    </div>
  );
}

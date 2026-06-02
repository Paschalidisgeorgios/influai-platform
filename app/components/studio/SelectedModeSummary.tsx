"use client";

import { formatBestForLine } from "@/app/lib/model-modes/mode-copy";
import { getModeCreditTitle, getModeTagline } from "@/app/lib/model-modes/mode-marketing-copy";
import CreditCostBadge, { PremiumBadge } from "./CreditCostBadge";

type Props = {
  modelModeId: string;
  modeLabel: string;
  creditCost: number;
  isPremium?: boolean;
  language?: "en" | "de";
  className?: string;
};

export default function SelectedModeSummary({
  modelModeId,
  modeLabel,
  creditCost,
  isPremium = false,
  language = "en",
  className = "",
}: Props) {
  const creditTitle = getModeCreditTitle(modelModeId, language);
  const summary = getModeTagline(modelModeId, language);
  const bestFor = formatBestForLine(modelModeId, language);

  if (!summary && !bestFor) return null;

  return (
    <div
      className={`rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 ${className}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-white">{modeLabel}</span>
        {isPremium ? <PremiumBadge /> : null}
      </div>
      {creditTitle ? (
        <p className="mt-2 text-xs font-medium text-amber-400/90">{creditTitle}</p>
      ) : (
        <CreditCostBadge credits={creditCost} className="mt-2" />
      )}
      {summary ? (
        <p className="mt-1.5 text-xs leading-relaxed text-neutral-400">{summary}</p>
      ) : null}
      {bestFor ? (
        <p className="mt-1.5 text-[11px] text-neutral-400">{bestFor}</p>
      ) : null}
    </div>
  );
}

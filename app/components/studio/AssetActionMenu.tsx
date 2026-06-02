"use client";

import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { buildRevenueNextActions } from "@/app/lib/studio/revenue-next-actions";
import {
  getRevenueActionLabel,
  canAffordRevenueAction,
} from "@/app/lib/studio/revenue-next-actions";
import type { RevenueActionId } from "@/app/lib/studio/revenue-next-actions";
import { A11Y } from "@/lib/obsidian/a11y-tokens";
import type { CreativeScoreData } from "./CreativeScorePanel";

export type VideoCopyActionId = "copy_best_hook" | "copy_caption" | "copy_hashtags";

type Props = {
  outputType: "image" | "video";
  modelModeId?: string | null;
  creditBalance?: number;
  isDe?: boolean;
  disabled?: boolean;
  busyActionId?: string | null;
  creativeScore?: CreativeScoreData | null;
  onAction: (actionId: RevenueActionId | VideoCopyActionId) => void;
  onBuyCredits?: () => void;
  className?: string;
};

export default function AssetActionMenu({
  outputType,
  modelModeId,
  creditBalance = 0,
  isDe = false,
  disabled = false,
  busyActionId = null,
  creativeScore = null,
  onAction,
  onBuyCredits,
  className = "",
}: Props) {
  const { freeActions, paidActions, primaryAction } = useMemo(
    () =>
      buildRevenueNextActions({
        outputType,
        modelModeId,
        creditBalance,
        hasCreativeScore: Boolean(creativeScore),
      }),
    [outputType, modelModeId, creditBalance, creativeScore]
  );

  const runnable = useMemo(() => {
    const primary = primaryAction ? [primaryAction] : [];
    const paid = paidActions.filter((a) => !a.isPrimary);
    return [...primary, ...freeActions, ...paid];
  }, [freeActions, paidActions, primaryAction]);

  return (
    <div
      role="toolbar"
      aria-label={isDe ? "Asset-Aktionen" : "Asset actions"}
      className={`flex max-w-full flex-wrap items-center justify-center gap-2 px-2 ${className}`}
    >
      {runnable.map((action) => {
        const label = getRevenueActionLabel(action, isDe ? "de" : "en");
        const busy = busyActionId === action.id;
        const unaffordable =
          action.tier === "paid" &&
          !canAffordRevenueAction(action, creditBalance);

        return (
          <button
            key={action.id}
            type="button"
            disabled={
              disabled ||
              busy ||
              action.tier === "locked" ||
              Boolean(action.requiresCreativeScore)
            }
            onClick={() => {
              if (unaffordable) {
                onBuyCredits?.();
                return;
              }
              onAction(action.id);
            }}
            aria-label={label}
            className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold shadow-sm backdrop-blur-md transition-[box-shadow,color] hover:shadow-[0_0_16px_rgba(245,158,11,0.1)] outline-none focus-visible:ring-2 focus-visible:ring-amber-400/75 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0E1220] ${A11Y.disabled} disabled:border-neutral-700/80 disabled:bg-neutral-900/60 disabled:text-neutral-500 ${
              action.isPrimary
                ? "border-amber-400/60 bg-amber-500/15 text-amber-100 ring-1 ring-amber-400/30 hover:shadow-[0_0_16px_rgba(245,158,11,0.2)] disabled:ring-0"
                : "border-neutral-200/90 bg-white/90 text-neutral-800 hover:ring-1 hover:ring-amber-400/35 hover:text-amber-800 dark:border-neutral-700/80 dark:bg-neutral-900/90 dark:text-neutral-100 dark:hover:text-amber-300"
            }`}
          >
            {busy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            ) : null}
            <span>{label}</span>
            {action.creditCost > 0 ? (
              <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400">
                {action.creditCost} {isDe ? "Cr" : "cr"}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

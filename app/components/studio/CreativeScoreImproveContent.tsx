"use client";

import { useCallback, useState } from "react";
import { Check, Copy, Loader2 } from "lucide-react";
import {
  CREATIVE_SCORE_DIMENSION_LABELS,
  CREATIVE_SCORE_PANEL_COPY,
  type CreativeScoreDimensionId,
} from "@/lib/copy/creative-score-copy";
import {
  buildImprovedPromptFromScore,
  type CreativeScoreImproveRoute,
} from "@/app/lib/creative-score/resolve-improve-route";
import { formatWeakestPointLine } from "@/app/lib/creative-score/score-improve-helpers";
import { obsidianButtonClass } from "@/lib/obsidian/button-tokens";
import type { CreativeScoreData } from "./CreativeScorePanel";

type Props = {
  result: CreativeScoreData;
  basePrompt: string;
  language: "en" | "de";
  improveRoute?: CreativeScoreImproveRoute | null;
  creditBalance?: number;
  improving?: boolean;
  onImprove?: (data: CreativeScoreData) => void;
  onApplyImprovedPrompt?: (prompt: string) => void;
  onBuyCredits?: () => void;
  onRetry?: () => void;
  compact?: boolean;
};

function CopyButton({ text, isDe }: { text: string; isDe: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!text.trim()) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      disabled={!text.trim()}
      className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2 py-1 text-[11px] font-semibold text-neutral-600 transition hover:border-amber-400/60 hover:text-amber-700 disabled:opacity-40 dark:border-neutral-700/80 dark:bg-neutral-950/60 dark:text-neutral-400 dark:hover:text-amber-400"
    >
      {copied ? (
        <Check className="h-3 w-3 text-emerald-500" aria-hidden />
      ) : (
        <Copy className="h-3 w-3" aria-hidden />
      )}
      {copied ? (isDe ? "Kopiert" : "Copied") : isDe ? "Kopieren" : "Copy"}
    </button>
  );
}

function SubscoreBar({
  label,
  score,
  isWeakest,
}: {
  label: string;
  score: number;
  isWeakest: boolean;
}) {
  return (
    <div
      className={
        isWeakest
          ? "rounded-lg border border-amber-500/35 bg-amber-500/8 p-2"
          : ""
      }
    >
      <div className="mb-1 flex justify-between gap-2 text-[10px]">
        <span
          className={
            isWeakest
              ? "font-semibold text-amber-600 dark:text-amber-300"
              : "text-neutral-500"
          }
        >
          {label}
        </span>
        <span
          className={`font-mono tabular-nums ${
            isWeakest
              ? "font-bold text-amber-600 dark:text-amber-300"
              : "text-neutral-400"
          }`}
        >
          {score}/100
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
        <div
          className={`h-full rounded-full ${
            isWeakest
              ? "bg-gradient-to-r from-amber-600 to-amber-400"
              : "bg-gradient-to-r from-[#8B5CF6]/70 to-[#8B5CF6]/40"
          }`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
    </div>
  );
}

export default function CreativeScoreImproveContent({
  result,
  basePrompt,
  language,
  improveRoute = null,
  creditBalance = 0,
  improving = false,
  onImprove,
  onApplyImprovedPrompt,
  onBuyCredits,
  onRetry,
  compact = false,
}: Props) {
  const isDe = language === "de";
  const copy = isDe ? CREATIVE_SCORE_PANEL_COPY.de : CREATIVE_SCORE_PANEL_COPY.en;
  const variantRoute =
    improveRoute?.mode === "image_variant" ? improveRoute : null;

  const insufficientImproveCredits =
    variantRoute?.canRun === true &&
    variantRoute.creditCost > 0 &&
    typeof creditBalance === "number" &&
    creditBalance < variantRoute.creditCost;

  const improvedPromptPreview = buildImprovedPromptFromScore(result, basePrompt);
  const dimensions = result.dimensions ?? [];
  const weakestId = result.weakestDimensionId;
  const weakestDimension = dimensions.find((d) => d.id === weakestId) ?? null;

  const improveCtaLabel =
    variantRoute?.canRun && variantRoute.creditCost > 0
      ? copy.improveAssetCta(variantRoute.creditCost)
      : copy.previewImprovementCta;

  const handleImprove = () => {
    if (variantRoute?.canRun && onImprove) {
      if (insufficientImproveCredits) {
        onBuyCredits?.();
        return;
      }
      onImprove(result);
      return;
    }
    onApplyImprovedPrompt?.(improvedPromptPreview);
  };

  return (
    <div className={`space-y-4 ${compact ? "" : "mt-4"}`}>
      <p className="text-lg font-black text-neutral-900 dark:text-white">
        {copy.scoreFormat(result.score)}
      </p>

      {dimensions.length > 0 ? (
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            {copy.subscoresLabel}
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {dimensions.map((dim) => (
              <SubscoreBar
                key={dim.id}
                label={
                  CREATIVE_SCORE_DIMENSION_LABELS[
                    dim.id as CreativeScoreDimensionId
                  ][language]
                }
                score={dim.score}
                isWeakest={dim.id === weakestId}
              />
            ))}
          </div>
        </div>
      ) : null}

      {weakestDimension ? (
        <div className="rounded-xl border border-amber-500/35 bg-amber-500/8 px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700/80 dark:text-amber-300/80">
            {copy.weakestPointLabel}
          </p>
          <p className="mt-1 text-sm font-semibold text-amber-700 dark:text-amber-300">
            {formatWeakestPointLine(weakestDimension, language)}
          </p>
        </div>
      ) : null}

      {result.recommendedFix ? (
        <div className="rounded-xl border border-white/[0.08] bg-neutral-50 px-3 py-2.5 dark:bg-neutral-900/40">
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            {copy.recommendedFixLabel}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
            {result.recommendedFix}
          </p>
        </div>
      ) : null}

      <div className="rounded-xl border border-white/[0.08] bg-neutral-50 px-3 py-2.5 dark:bg-neutral-900/40">
        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
          {copy.estimatedImprovementLabel}
        </p>
        <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">
          {copy.potentialScoreLabel}:{" "}
          <span className="font-bold text-neutral-900 dark:text-white">
            ~{result.estimatedPotentialScore}/100
          </span>
        </p>
        <p className="mt-1 text-[11px] text-neutral-500">{copy.potentialScoreNote}</p>
      </div>

      <div className="rounded-xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/6 px-3 py-2.5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            {copy.improvedPromptLabel}
          </p>
          <CopyButton text={improvedPromptPreview} isDe={isDe} />
        </div>
        <p className="text-sm leading-relaxed text-neutral-800 dark:text-neutral-200">
          {improvedPromptPreview}
        </p>
      </div>

      <div className="space-y-2 border-t border-neutral-200/80 pt-4 dark:border-neutral-800">
        <button
          type="button"
          onClick={handleImprove}
          disabled={improving}
          className={`${obsidianButtonClass("primary", { size: "md", fullWidth: true })} gap-2`}
        >
          {improving ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : null}
          {insufficientImproveCredits
            ? isDe
              ? "Credits kaufen"
              : "Buy credits"
            : improveCtaLabel}
        </button>
        {variantRoute?.canRun && variantRoute.creditCost > 0 ? (
          <p className="text-center text-[11px] text-neutral-500">
            {copy.improveCost(variantRoute.creditCost)}
          </p>
        ) : (
          <p className="text-center text-[11px] text-neutral-500">
            {copy.improvePromptOnly}
          </p>
        )}
        {insufficientImproveCredits ? (
          <p className="text-center text-xs text-amber-600 dark:text-amber-400">
            {copy.insufficientCredits}
          </p>
        ) : null}
      </div>

      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-xl border border-neutral-300 px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:hover:text-white"
        >
          {copy.runAgain}
        </button>
      ) : null}
    </div>
  );
}

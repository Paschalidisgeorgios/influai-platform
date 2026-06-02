"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Sparkles, X } from "lucide-react";
import { CREATIVE_SCORE_PANEL_COPY } from "@/lib/copy/creative-score-copy";
import { obsidianButtonClass } from "@/lib/obsidian/button-tokens";
import type { CreativeScoreDimensionId } from "@/lib/copy/creative-score-copy";
import {
  type CreativeScoreImproveRoute,
} from "@/app/lib/creative-score/resolve-improve-route";
import CreativeScoreImproveContent from "./CreativeScoreImproveContent";
import CreativeScoreComparison, {
  type CreativeScoreComparisonData,
} from "./CreativeScoreComparison";

export type CreativeScoreData = {
  score: number;
  rating: "low" | "medium" | "high";
  dimensions?: { id: CreativeScoreDimensionId; score: number }[];
  positives: string[];
  improvements: string[];
  hooks: string[];
  captions: string[];
  hashtags: string[];
  improvedPrompt?: string;
  weakestDimensionId: CreativeScoreDimensionId;
  recommendedFix: string;
  estimatedPotentialScore: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  assetUrl: string;
  prompt: string;
  outputType: "image" | "video";
  isDe?: boolean;
  getToken: () => Promise<string | null>;
  onScoreReady?: (data: CreativeScoreData) => void;
  autoRun?: boolean;
  improveRoute?: CreativeScoreImproveRoute | null;
  onImproveAsset?: (data: CreativeScoreData) => void;
  onApplyImprovedPrompt?: (prompt: string) => void;
  creditBalance?: number;
  onBuyCredits?: () => void;
  comparison?: CreativeScoreComparisonData | null;
  scoringImproved?: boolean;
  onExportBest?: (url: string) => void;
  onCreateAnotherImprovement?: () => void;
};

export default function CreativeScorePanel({
  open,
  onClose,
  assetUrl,
  prompt,
  outputType,
  isDe = false,
  getToken,
  onScoreReady,
  autoRun = true,
  improveRoute = null,
  onImproveAsset,
  onApplyImprovedPrompt,
  creditBalance = 0,
  onBuyCredits,
  comparison = null,
  scoringImproved = false,
  onExportBest,
  onCreateAnotherImprovement,
}: Props) {
  const language = isDe ? "de" : "en";
  const copy = isDe ? CREATIVE_SCORE_PANEL_COPY.de : CREATIVE_SCORE_PANEL_COPY.en;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreativeScoreData | null>(null);
  const [improving, setImproving] = useState(false);

  const runScore = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) {
        setError(isDe ? "Bitte erneut einloggen." : "Please sign in again.");
        return;
      }

      const res = await fetch("/api/creative-score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          assetUrl,
          prompt,
          outputType,
          actionId: outputType === "video" ? "create_video" : "create_image",
          currentLanguage: language,
        }),
      });

      const data = (await res.json()) as CreativeScoreData & {
        success?: boolean;
        error?: string;
      };

      if (!res.ok || data.success === false) {
        setError(
          data.error ??
            (isDe ? "Creative Score fehlgeschlagen." : "Creative Score failed.")
        );
        return;
      }

      setResult(data);
      onScoreReady?.(data);
    } catch {
      setError(isDe ? "Creative Score fehlgeschlagen." : "Creative Score failed.");
    } finally {
      setLoading(false);
    }
  }, [assetUrl, getToken, isDe, language, onScoreReady, outputType, prompt]);

  useEffect(() => {
    if (!open) return;
    if (autoRun && !result && !loading && !error) {
      void runScore();
    }
  }, [open, autoRun, result, loading, error, runScore]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setResult(null);
      setError(null);
    }
  }, [open, assetUrl]);

  if (!open) return null;

  const handleImprove = (data: CreativeScoreData) => {
    setImproving(true);
    onImproveAsset?.(data);
    window.setTimeout(() => setImproving(false), 400);
  };

  return (
    <>
      <button
        type="button"
        aria-label={isDe ? "Panel schließen" : "Close panel"}
        className="fixed inset-0 z-[95] bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-labelledby="creative-score-title"
        className="fixed inset-y-0 right-0 z-[96] flex w-full max-w-md flex-col border-l border-neutral-200/80 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-950"
      >
        <header className="flex items-center justify-between gap-3 border-b border-neutral-200/80 px-5 py-4 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#8B5CF6]" aria-hidden />
            <h2
              id="creative-score-title"
              className="text-sm font-bold text-neutral-900 dark:text-white"
            >
              Creative Score
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={isDe ? "Schließen" : "Close"}
            className="rounded-lg border border-neutral-200 p-1.5 text-neutral-500 hover:text-neutral-900 dark:border-neutral-700 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <p className="text-xs leading-relaxed text-neutral-500">{copy.advisory}</p>

          {loading ? (
            <div className="mt-8 flex flex-col items-center gap-3 text-neutral-500">
              <Loader2 className="h-8 w-8 animate-spin text-[#8B5CF6]" aria-hidden />
              <p className="text-sm">{copy.calculating}</p>
            </div>
          ) : null}

          {error ? (
            <div className="mt-4 space-y-3">
              <p role="alert" className="text-sm text-red-500">
                {error}
              </p>
              <button
                type="button"
                onClick={() => void runScore()}
                className={obsidianButtonClass("primary", { size: "sm" })}
              >
                {copy.runAgain}
              </button>
            </div>
          ) : null}

          {comparison ? (
            <CreativeScoreComparison
              data={comparison}
              language={language}
              outputType={outputType}
              scoringImproved={scoringImproved}
              onExportBest={onExportBest}
              onCreateAnotherImprovement={onCreateAnotherImprovement}
              className="mt-4"
            />
          ) : null}

          {!comparison && result ? (
            <CreativeScoreImproveContent
              result={result}
              basePrompt={prompt}
              language={language}
              improveRoute={improveRoute}
              creditBalance={creditBalance}
              improving={improving}
              onImprove={
                onImproveAsset ? (data) => handleImprove(data) : undefined
              }
              onApplyImprovedPrompt={onApplyImprovedPrompt}
              onBuyCredits={onBuyCredits}
              onRetry={() => void runScore()}
            />
          ) : null}
        </div>
      </aside>
    </>
  );
}

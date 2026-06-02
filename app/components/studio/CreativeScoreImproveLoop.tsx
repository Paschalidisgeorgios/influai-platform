"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { CREATIVE_SCORE_PANEL_COPY } from "@/lib/copy/creative-score-copy";
import type { CreativeScoreImproveRoute } from "@/app/lib/creative-score/resolve-improve-route";
import CreativeScoreImproveContent from "./CreativeScoreImproveContent";
import type { CreativeScoreData } from "./CreativeScorePanel";

type Props = {
  assetUrl: string;
  prompt: string;
  outputType: "image" | "video";
  language: "en" | "de";
  getToken: () => Promise<string | null>;
  improveRoute?: CreativeScoreImproveRoute | null;
  creditBalance?: number;
  onScoreReady?: (data: CreativeScoreData) => void;
  onImprove?: (data: CreativeScoreData) => void;
  onApplyImprovedPrompt?: (prompt: string) => void;
  onBuyCredits?: () => void;
  improving?: boolean;
  autoRun?: boolean;
  className?: string;
};

export default function CreativeScoreImproveLoop({
  assetUrl,
  prompt,
  outputType,
  language,
  getToken,
  improveRoute = null,
  creditBalance = 0,
  onScoreReady,
  onImprove,
  onApplyImprovedPrompt,
  onBuyCredits,
  improving = false,
  autoRun = true,
  className = "",
}: Props) {
  const isDe = language === "de";
  const copy = isDe ? CREATIVE_SCORE_PANEL_COPY.de : CREATIVE_SCORE_PANEL_COPY.en;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreativeScoreData | null>(null);

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
    setResult(null);
    setError(null);
  }, [assetUrl, prompt]);

  useEffect(() => {
    if (!autoRun || !assetUrl || !prompt.trim()) return;
    if (!result && !loading && !error) {
      void runScore();
    }
  }, [autoRun, assetUrl, prompt, result, loading, error, runScore]);

  return (
    <section
      className={`rounded-2xl border border-white/10 bg-white/[0.03] p-4 ${className}`}
      aria-labelledby="creative-score-loop-title"
    >
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[#8B5CF6]" aria-hidden />
        <h3
          id="creative-score-loop-title"
          className="text-sm font-bold text-neutral-100"
        >
          Creative Score
        </h3>
      </div>
      <p className="mt-1 text-xs text-neutral-500">{copy.advisory}</p>

      {loading ? (
        <div className="mt-6 flex flex-col items-center gap-3 text-neutral-500">
          <Loader2 className="h-7 w-7 animate-spin text-[#8B5CF6]" aria-hidden />
          <p className="text-sm">{copy.calculating}</p>
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 space-y-3">
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
          <button
            type="button"
            onClick={() => void runScore()}
            className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-neutral-300 hover:border-amber-500/30"
          >
            {copy.runAgain}
          </button>
        </div>
      ) : null}

      {result ? (
        <CreativeScoreImproveContent
          result={result}
          basePrompt={prompt}
          language={language}
          improveRoute={improveRoute}
          creditBalance={creditBalance}
          improving={improving}
          onImprove={onImprove}
          onApplyImprovedPrompt={onApplyImprovedPrompt}
          onBuyCredits={onBuyCredits}
          onRetry={() => void runScore()}
          compact
        />
      ) : null}
    </section>
  );
}

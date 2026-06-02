"use client";

import { useCallback } from "react";
import { ArrowRight, Download, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { CREATIVE_SCORE_PANEL_COPY } from "@/lib/copy/creative-score-copy";
import { obsidianButtonClass } from "@/lib/obsidian/button-tokens";
import {
  pickBestExportUrl,
  type CreativeScoreDimensionRow,
} from "@/app/lib/creative-score/score-improve-helpers";

export type CreativeScoreComparisonData = {
  originalUrl: string;
  improvedUrl: string;
  originalScore: number;
  improvedScore: number | null;
  improvedPrompt: string;
  whatChanged: string[];
  hook?: string;
  caption?: string;
};

type Props = {
  data: CreativeScoreComparisonData;
  language: "en" | "de";
  outputType?: "image" | "video";
  scoringImproved?: boolean;
  onExportBest?: (url: string) => void;
  onCreateAnotherImprovement?: () => void;
  className?: string;
};

function ScoreBadge({
  label,
  score,
  loading,
  variant,
}: {
  label: string;
  score: number | null;
  loading?: boolean;
  variant: "original" | "improved";
}) {
  const isImproved = variant === "improved";
  return (
    <div
      className={`mt-2 rounded-lg px-3 py-2 ${
        isImproved
          ? "border border-amber-500/30 bg-amber-500/10"
          : "border border-white/10 bg-white/[0.04]"
      }`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
        {label}
      </p>
      {loading ? (
        <div className="mt-1 flex items-center gap-2 text-sm text-neutral-400">
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          …
        </div>
      ) : (
        <p
          className={`mt-0.5 text-xl font-black tabular-nums ${
            isImproved ? "text-amber-300" : "text-white/90"
          }`}
        >
          {score ?? "—"}
          <span className="text-sm font-semibold text-neutral-500">/100</span>
        </p>
      )}
    </div>
  );
}

function AssetPreview({
  url,
  label,
  outputType,
}: {
  url: string;
  label: string;
  outputType: "image" | "video";
}) {
  return (
    <figure className="overflow-hidden rounded-xl border border-white/10 bg-black/40">
      <figcaption className="border-b border-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
        {label}
      </figcaption>
      {outputType === "video" ? (
        <video
          src={url}
          controls
          playsInline
          className="aspect-[4/5] w-full object-contain"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={label} className="aspect-[4/5] w-full object-contain" />
      )}
    </figure>
  );
}

export default function CreativeScoreComparison({
  data,
  language,
  outputType = "image",
  scoringImproved = false,
  onExportBest,
  onCreateAnotherImprovement,
  className = "",
}: Props) {
  const isDe = language === "de";
  const copy = isDe ? CREATIVE_SCORE_PANEL_COPY.de : CREATIVE_SCORE_PANEL_COPY.en;

  const scoreDelta =
    data.improvedScore !== null ? data.improvedScore - data.originalScore : null;

  const handleExport = useCallback(() => {
    const url = pickBestExportUrl(
      data.originalUrl,
      data.improvedUrl,
      data.originalScore,
      data.improvedScore
    );
    if (onExportBest) {
      onExportBest(url);
      return;
    }
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.download = "";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }, [data, onExportBest]);

  return (
    <section
      className={`rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 ${className}`}
      aria-labelledby="creative-score-comparison-title"
    >
      <div className="flex items-start gap-2">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
        <div>
          <h3
            id="creative-score-comparison-title"
            className="text-sm font-bold text-emerald-200/95"
          >
            {copy.comparisonTitle}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-neutral-400">
            {copy.comparisonSubtitle}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <div>
          <AssetPreview
            url={data.originalUrl}
            label={copy.originalLabel}
            outputType={outputType}
          />
          <ScoreBadge
            label={copy.originalScoreLabel}
            score={data.originalScore}
            variant="original"
          />
        </div>

        <div
          className="hidden justify-center sm:flex"
          aria-hidden
        >
          <ArrowRight className="h-5 w-5 text-neutral-600" />
        </div>

        <div>
          <AssetPreview
            url={data.improvedUrl}
            label={copy.improvedLabel}
            outputType={outputType}
          />
          <ScoreBadge
            label={copy.improvedScoreLabel}
            score={data.improvedScore}
            loading={scoringImproved}
            variant="improved"
          />
        </div>
      </div>

      {scoreDelta !== null ? (
        <p className="mt-3 text-center text-xs text-neutral-500">
          {copy.scoreDeltaApprox(scoreDelta)}
        </p>
      ) : scoringImproved ? (
        <p className="mt-3 flex items-center justify-center gap-2 text-xs text-neutral-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          {copy.scoringImproved}
        </p>
      ) : null}

      {data.whatChanged.length > 0 ? (
        <div className="mt-4 rounded-xl border border-white/[0.08] bg-[#0E1220]/50 px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            {copy.whatChangedLabel}
          </p>
          <ul className="mt-2 space-y-1.5">
            {data.whatChanged.map((line) => (
              <li
                key={line}
                className="flex items-start gap-2 text-sm leading-relaxed text-neutral-300"
              >
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400/80" />
                {line}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-4 rounded-xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/6 px-3 py-2.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
          {copy.improvedPromptLabel}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-neutral-200">
          {data.improvedPrompt}
        </p>
      </div>

      {data.hook ? (
        <div className="mt-3 rounded-xl border border-white/[0.08] bg-[#0E1220]/50 px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            {copy.newHookLabel}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-neutral-300">{data.hook}</p>
        </div>
      ) : null}

      {data.caption ? (
        <div className="mt-3 rounded-xl border border-white/[0.08] bg-[#0E1220]/50 px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            {copy.newCaptionLabel}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-neutral-300">
            {data.caption}
          </p>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleExport}
          className={`${obsidianButtonClass("primary", { size: "sm" })} flex-1 sm:flex-none`}
        >
          <Download className="h-3.5 w-3.5" aria-hidden />
          {copy.exportBestCta}
        </button>
        {onCreateAnotherImprovement ? (
          <button
            type="button"
            onClick={onCreateAnotherImprovement}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-neutral-300 transition hover:border-amber-500/30 hover:text-amber-300 sm:flex-none"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden />
            {copy.createAnotherCta}
          </button>
        ) : null}
      </div>
    </section>
  );
}
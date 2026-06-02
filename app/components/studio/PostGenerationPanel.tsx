"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, LayoutGrid } from "lucide-react";
import { DEFAULT_STYLE_VARIANT_INSTRUCTION } from "@/app/lib/actions/resolve-action";
import {
  formatToolGenerateError,
  handleGenerateForTool,
  resolveToolCreditCostFromInput,
} from "@/lib/dashboard/tool-generate";
import { buildRevenueNextActions } from "@/app/lib/studio/revenue-next-actions";
import { buildNextActions } from "@/app/lib/studio/next-actions";
import NextActionCards from "./NextActionCards";
import CreativeScoreImproveLoop from "./CreativeScoreImproveLoop";
import CreativeScoreComparison, {
  type CreativeScoreComparisonData,
} from "./CreativeScoreComparison";
import CreativeScorePanel, {
  type CreativeScoreData,
} from "./CreativeScorePanel";
import {
  buildImprovedPromptFromScore,
  resolveCreativeScoreImproveRoute,
} from "@/app/lib/creative-score/resolve-improve-route";
import { fetchCreativeScore } from "@/app/lib/creative-score/fetch-creative-score";
import { buildWhatChangedSummary } from "@/app/lib/creative-score/score-improve-helpers";
import {
  type CreatorCanvasAsset,
  formatCanvasDate,
  getCreatorSourceLabel,
} from "./canvas-types";
import type { RevenueActionId } from "@/app/lib/studio/revenue-next-actions";
import { obsidianButtonClass } from "@/lib/obsidian/button-tokens";

type Props = {
  asset: CreatorCanvasAsset;
  modelModeId?: string | null;
  creditsUsed?: number;
  creditBalance?: number;
  language?: "en" | "de";
  getToken: () => Promise<string | null>;
  onCreditsUsed?: (payload?: { creditsAfter?: number | null }) => void;
  onAssetCreated?: (asset: CreatorCanvasAsset) => void;
  onVariantNotice?: (message: string | null) => void;
  onRegenerateWithMode?: (modelModeId: string, prompt: string) => void;
  onBuyCredits?: () => void;
  onUpgrade?: () => void;
  showPreview?: boolean;
  className?: string;
  /** Open variant composer or Creative Score when the panel mounts */
  initialAction?: "variant" | "score" | null;
};

export default function PostGenerationPanel({
  asset,
  modelModeId,
  creditsUsed,
  creditBalance = 0,
  language = "en",
  getToken,
  onCreditsUsed,
  onAssetCreated,
  onVariantNotice,
  onRegenerateWithMode,
  onBuyCredits,
  onUpgrade,
  showPreview = true,
  className = "",
  initialAction = null,
}: Props) {
  const isDe = language === "de";
  const lang = isDe ? "de" : "en";
  const [scoreOpen, setScoreOpen] = useState(false);
  const [creativeScore, setCreativeScore] = useState<CreativeScoreData | null>(
    null
  );
  const [busyActionId, setBusyActionId] = useState<string | null>(null);
  const [showVariantComposer, setShowVariantComposer] = useState(false);
  const [variantStyleNote, setVariantStyleNote] = useState("");
  const [variantError, setVariantError] = useState<string | null>(null);
  const [copyNotice, setCopyNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [improvingFromScore, setImprovingFromScore] = useState(false);
  const [comparison, setComparison] = useState<CreativeScoreComparisonData | null>(
    null
  );
  const [scoringImproved, setScoringImproved] = useState(false);

  useEffect(() => {
    setComparison(null);
    setScoringImproved(false);
  }, [asset.url, asset.generationId]);

  useEffect(() => {
    if (!initialAction) return;
    if (initialAction === "score") {
      setScoreOpen(true);
    }
    if (initialAction === "variant") {
      setShowVariantComposer(true);
      setVariantError(null);
    }
  }, [initialAction, asset.url]);

  const sourceLabel = getCreatorSourceLabel(asset, isDe);
  const formattedDate = formatCanvasDate(asset.createdAt, isDe);

  const revenue = useMemo(
    () =>
      buildRevenueNextActions({
        outputType: asset.outputType,
        modelModeId,
        creditBalance,
        hasCreativeScore: Boolean(creativeScore),
      }),
    [asset.outputType, modelModeId, creditBalance, creativeScore]
  );

  const legacy = useMemo(
    () =>
      buildNextActions({
        outputType: asset.outputType,
        modelModeId,
        creditBalance,
        hasCreativeScore: Boolean(creativeScore),
      }),
    [asset.outputType, modelModeId, creditBalance, creativeScore]
  );

  const handleExport = useCallback(() => {
    if (!asset.url) return;
    const anchor = document.createElement("a");
    anchor.href = asset.url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.download = "";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }, [asset.url]);

  const notifyAssetCreated = useCallback(
    (
      url: string,
      outputType: "image" | "video",
      prompt: string,
      generationId?: string,
      nextModelModeId?: string,
      nextCredits?: number
    ) => {
      onAssetCreated?.({
        id: generationId,
        url,
        outputType,
        prompt,
        createdAt: new Date().toISOString(),
        generationId,
        sourceStudio: outputType,
        modelModeId: nextModelModeId,
        creditsUsed: nextCredits,
      });
    },
    [onAssetCreated]
  );

  const runStyleVariant = useCallback(
    async (
      styleOverride?: string,
      options?: {
        fromCreativeScore?: boolean;
        scoreSnapshot?: CreativeScoreData;
      }
    ) => {
      if (!asset.prompt?.trim()) {
        setVariantError(
          isDe
            ? "Für eine Variante wird ein Prompt benötigt."
            : "A prompt is required to create a variant."
        );
        return;
      }

      const styleBit =
        styleOverride?.trim() ||
        variantStyleNote.trim() ||
        DEFAULT_STYLE_VARIANT_INSTRUCTION;
      const variantPrompt = `${asset.prompt.trim()}. Style direction: ${styleBit}`;
      const variantCost = resolveToolCreditCostFromInput({
        toolKey: "image",
        actionId: "create_style_variant",
      });

      setBusyActionId("create_style_variant");
      setVariantError(null);
      setActionError(null);
      onVariantNotice?.(null);

      try {
        const token = await getToken();
        if (!token) {
          setVariantError(isDe ? "Bitte erneut einloggen." : "Please sign in again.");
          return;
        }

        const result = await handleGenerateForTool({
          toolKey: "image",
          token,
          prompt: variantPrompt,
          actionId: "create_style_variant",
          sourceImageUrl: asset.outputType === "image" ? asset.url : undefined,
          currentLanguage: lang,
        });

        if (!result.success) {
          setVariantError(formatToolGenerateError(result, lang));
          if (result.status === 402 || result.code === "INSUFFICIENT_CREDITS") {
            onBuyCredits?.();
          }
          return;
        }

        onCreditsUsed?.({ creditsAfter: result.creditsAfter ?? null });

        const newUrl = result.imageUrl;
        if (newUrl) {
          if (options?.fromCreativeScore && asset.url && options.scoreSnapshot) {
            const improvedPromptUsed = buildImprovedPromptFromScore(
              options.scoreSnapshot,
              asset.prompt?.trim() ?? ""
            );
            setComparison({
              originalUrl: asset.url,
              improvedUrl: newUrl,
              originalScore: options.scoreSnapshot.score,
              improvedScore: null,
              improvedPrompt: improvedPromptUsed,
              whatChanged: buildWhatChangedSummary(
                options.scoreSnapshot.dimensions ?? [],
                options.scoreSnapshot.dimensions ?? [],
                lang,
                options.scoreSnapshot.recommendedFix
              ),
              hook: options.scoreSnapshot.hooks[0],
              caption: options.scoreSnapshot.captions[0],
            });
            setScoringImproved(true);
            void fetchCreativeScore({
              assetUrl: newUrl,
              prompt: variantPrompt,
              outputType: "image",
              language: lang,
              getToken,
            }).then((improvedScoreResult) => {
              setScoringImproved(false);
              if (!improvedScoreResult || !options.scoreSnapshot) return;
              setComparison((prev) =>
                prev
                  ? {
                      ...prev,
                      improvedScore: improvedScoreResult.score,
                      whatChanged: buildWhatChangedSummary(
                        options.scoreSnapshot!.dimensions ?? [],
                        improvedScoreResult.dimensions ?? [],
                        lang,
                        options.scoreSnapshot!.recommendedFix
                      ),
                      hook: improvedScoreResult.hooks[0] ?? prev.hook,
                      caption: improvedScoreResult.captions[0] ?? prev.caption,
                    }
                  : null
              );
            });
          }
          notifyAssetCreated(
            newUrl,
            "image",
            variantPrompt,
            result.generationId,
            "fast_draft_image",
            variantCost
          );
          setShowVariantComposer(false);
          setVariantStyleNote("");
          onVariantNotice?.(
            options?.fromCreativeScore
              ? isDe
                ? "Verbesserte Version gespeichert — Original bleibt in der Gallery."
                : "Improved version saved — original preserved in Gallery."
              : isDe
                ? "Neue Variante in der Creator Gallery gespeichert."
                : "New variant saved to Creator Gallery."
          );
        } else if (result.generationId) {
          onVariantNotice?.(
            isDe
              ? "Variante wird generiert — sie erscheint in der Creator Gallery."
              : "Variant is generating — it will appear in Creator Gallery."
          );
          setShowVariantComposer(false);
        }
      } catch {
        setVariantError(
          isDe ? "Variante fehlgeschlagen." : "Variant generation failed."
        );
      } finally {
        setBusyActionId(null);
      }
    },
    [
      asset.outputType,
      asset.prompt,
      asset.url,
      getToken,
      isDe,
      lang,
      notifyAssetCreated,
      onBuyCredits,
      onCreditsUsed,
      onVariantNotice,
      variantStyleNote,
    ]
  );

  const improveRoute = useMemo(
    () =>
      resolveCreativeScoreImproveRoute({
        outputType: asset.outputType,
      }),
    [asset.outputType]
  );

  const handleImproveFromScore = useCallback(
    async (score: CreativeScoreData) => {
      if (improveRoute.mode !== "image_variant" || !improveRoute.canRun) {
        return;
      }
      const styleNote = buildImprovedPromptFromScore(
        score,
        asset.prompt?.trim() ?? ""
      );
      setImprovingFromScore(true);
      try {
        await runStyleVariant(styleNote, {
          fromCreativeScore: true,
          scoreSnapshot: score,
        });
      } finally {
        setImprovingFromScore(false);
      }
    },
    [asset.prompt, improveRoute, runStyleVariant]
  );

  const handleExportBest = useCallback(
    (url: string) => {
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.download = "";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    },
    []
  );

  const handleCreateAnotherImprovement = useCallback(() => {
    setComparison(null);
    setScoringImproved(false);
    document
      .getElementById("creative-score-loop-title")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const runPremiumRender = useCallback(async () => {
    if (!asset.prompt?.trim()) return;
    const premiumCost = resolveToolCreditCostFromInput({
      toolKey: "image",
      modelModeId: "premium_image",
      actionId: "create_image",
    });

    setBusyActionId("make_it_premium");
    setActionError(null);
    onVariantNotice?.(null);

    try {
      const token = await getToken();
      if (!token) {
        setActionError(isDe ? "Bitte erneut einloggen." : "Please sign in again.");
        return;
      }

      const result = await handleGenerateForTool({
        toolKey: "image",
        token,
        prompt: asset.prompt.trim(),
        actionId: "create_image",
        modelModeId: "premium_image",
        currentLanguage: lang,
      });

      if (!result.success) {
        setActionError(formatToolGenerateError(result, lang));
        if (result.status === 402 || result.code === "INSUFFICIENT_CREDITS") {
          onBuyCredits?.();
        }
        return;
      }

      onCreditsUsed?.({ creditsAfter: result.creditsAfter ?? null });

      if (result.imageUrl) {
        notifyAssetCreated(
          result.imageUrl,
          "image",
          asset.prompt.trim(),
          result.generationId,
          "premium_image",
          premiumCost
        );
        onVariantNotice?.(
          isDe
            ? "Premium-Version in der Creator Gallery gespeichert."
            : "Premium version saved to Creator Gallery."
        );
      } else if (result.generationId) {
        onVariantNotice?.(
          isDe
            ? "Premium-Render läuft — Ergebnis erscheint in der Gallery."
            : "Premium render in progress — result will appear in Gallery."
        );
      }
    } catch {
      setActionError(
        isDe ? "Premium-Render fehlgeschlagen." : "Premium render failed."
      );
    } finally {
      setBusyActionId(null);
    }
  }, [
    asset.prompt,
    getToken,
    isDe,
    lang,
    notifyAssetCreated,
    onBuyCredits,
    onCreditsUsed,
    onVariantNotice,
  ]);

  const runAnotherVideo = useCallback(async () => {
    if (!asset.prompt?.trim()) return;
    const targetMode = modelModeId ?? "auto_video";
    const videoCost = resolveToolCreditCostFromInput({
      toolKey: "video",
      modelModeId: targetMode,
      actionId: "create_video",
    });

    setBusyActionId("create_another_video");
    setActionError(null);
    onVariantNotice?.(null);

    try {
      const token = await getToken();
      if (!token) {
        setActionError(isDe ? "Bitte erneut einloggen." : "Please sign in again.");
        return;
      }

      const result = await handleGenerateForTool({
        toolKey: "video",
        token,
        prompt: asset.prompt.trim(),
        motionInstruction: asset.prompt.trim(),
        actionId: "create_video",
        modelModeId: targetMode,
        currentLanguage: lang,
      });

      if (!result.success) {
        setActionError(formatToolGenerateError(result, lang));
        if (result.status === 402 || result.code === "INSUFFICIENT_CREDITS") {
          onBuyCredits?.();
        }
        return;
      }

      onCreditsUsed?.({ creditsAfter: result.creditsAfter ?? null });

      if (result.videoUrl) {
        notifyAssetCreated(
          result.videoUrl,
          "video",
          asset.prompt.trim(),
          result.generationId,
          targetMode,
          videoCost
        );
        onVariantNotice?.(
          isDe
            ? "Neue Video-Version in der Creator Gallery gespeichert."
            : "New video version saved to Creator Gallery."
        );
      } else if (result.generationId) {
        onVariantNotice?.(
          isDe
            ? "Video wird gerendert — Ergebnis erscheint in der Gallery."
            : "Video is rendering — result will appear in Gallery."
        );
      }
    } catch {
      setActionError(
        isDe ? "Video-Render fehlgeschlagen." : "Video render failed."
      );
    } finally {
      setBusyActionId(null);
    }
  }, [
    asset.prompt,
    getToken,
    isDe,
    lang,
    modelModeId,
    notifyAssetCreated,
    onBuyCredits,
    onCreditsUsed,
    onVariantNotice,
  ]);

  const copySocialBundle = useCallback(async () => {
    if (!creativeScore) {
      setScoreOpen(true);
      return;
    }
    const parts = [
      creativeScore.hooks[0] ? `Hook: ${creativeScore.hooks[0]}` : "",
      creativeScore.captions[0]
        ? `Caption: ${creativeScore.captions[0]}`
        : "",
      creativeScore.hashtags.length
        ? `Hashtags: ${creativeScore.hashtags.join(" ")}`
        : "",
    ].filter(Boolean);

    try {
      await navigator.clipboard.writeText(parts.join("\n\n"));
      setCopyNotice(isDe ? "Social-Copy kopiert." : "Social copy copied.");
      window.setTimeout(() => setCopyNotice(null), 2500);
    } catch {
      setCopyNotice(isDe ? "Kopieren fehlgeschlagen." : "Copy failed.");
    }
  }, [creativeScore, isDe]);

  const handleNextAction = useCallback(
    (actionId: RevenueActionId | "buy_credits") => {
      if (actionId === "buy_credits") {
        onBuyCredits?.();
        return;
      }

      if (
        actionId === "animate_image" ||
        actionId === "enhance_asset" ||
        actionId === "enhance_video" ||
        actionId === "lipsync_creator" ||
        actionId === "ai_avatar"
      ) {
        return;
      }

      if (actionId === "check_creative_score") {
        setScoreOpen(true);
        return;
      }

      if (actionId === "export_asset") {
        handleExport();
        return;
      }

      if (actionId === "create_style_variant") {
        setShowVariantComposer(true);
        setVariantError(null);
        return;
      }

      if (actionId === "copy_social_copy") {
        void copySocialBundle();
        return;
      }

      if (actionId === "make_it_premium") {
        if (onRegenerateWithMode && asset.prompt) {
          onRegenerateWithMode("premium_image", asset.prompt);
          return;
        }
        void runPremiumRender();
        return;
      }

      if (actionId === "create_another_video") {
        if (onRegenerateWithMode && asset.prompt) {
          onRegenerateWithMode(modelModeId ?? "auto_video", asset.prompt);
          return;
        }
        void runAnotherVideo();
        return;
      }
    },
    [
      asset.prompt,
      copySocialBundle,
      handleExport,
      modelModeId,
      onBuyCredits,
      onRegenerateWithMode,
      runAnotherVideo,
      runPremiumRender,
    ]
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {showPreview ? (
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40">
          {asset.outputType === "video" ? (
            <video
              src={asset.url}
              controls
              playsInline
              className="max-h-[45vh] w-full object-contain"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={asset.url}
              alt={
                asset.prompt ??
                (isDe ? "Generiertes Creator-Asset" : "Generated creator asset")
              }
              className="max-h-[45vh] w-full object-contain"
            />
          )}
        </div>
      ) : null}

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-amber-500/80">
          {sourceLabel}
        </p>
        {asset.prompt ? (
          <p className="mt-2 text-sm leading-relaxed text-neutral-300">
            {asset.prompt}
          </p>
        ) : null}
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-neutral-500">
          {typeof creditsUsed === "number" ? (
            <span>
              {isDe
                ? `${creditsUsed} Credits verwendet`
                : `${creditsUsed} credits used`}
            </span>
          ) : null}
          {formattedDate ? <span>{formattedDate}</span> : null}
        </div>
        <Link
          href="/dashboard/gallery"
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-[11px] font-semibold text-neutral-400 transition hover:border-amber-500/30 hover:text-amber-300"
        >
          <LayoutGrid className="h-3.5 w-3.5" aria-hidden />
          {isDe ? "Creator Gallery" : "Creator Gallery"}
        </Link>
      </div>

      {copyNotice ? (
        <p className="flex items-center gap-1.5 text-xs text-emerald-400">
          <Check className="h-3.5 w-3.5" />
          {copyNotice}
        </p>
      ) : null}

      <NextActionCards
        freeActions={legacy.freeActions}
        paidActions={legacy.paidActions}
        lockedActions={legacy.lockedActions}
        primaryAction={legacy.primaryAction}
        lowCredits={revenue.lowCredits}
        creditBalance={creditBalance}
        language={language}
        busyActionId={busyActionId}
        onAction={handleNextAction}
        onBuyCredits={onBuyCredits}
        onUpgrade={onUpgrade}
      />

      <CreativeScoreImproveLoop
        assetUrl={asset.url}
        prompt={
          asset.prompt?.trim() ||
          (isDe ? "Creator-Asset ohne Prompt" : "Creator asset without prompt")
        }
        outputType={asset.outputType}
        language={lang}
        getToken={getToken}
        improveRoute={improveRoute}
        creditBalance={creditBalance}
        onScoreReady={setCreativeScore}
        onImprove={
          improveRoute.mode === "image_variant" && improveRoute.canRun
            ? (score) => void handleImproveFromScore(score)
            : undefined
        }
        onBuyCredits={onBuyCredits}
        improving={improvingFromScore || busyActionId === "create_style_variant"}
        onApplyImprovedPrompt={(improved) => {
          void navigator.clipboard.writeText(improved);
          onVariantNotice?.(
            isDe
              ? "Verbesserter Prompt kopiert — kein Render bis du bereit bist."
              : "Improved prompt copied — no render until you are ready."
          );
        }}
      />

      {comparison ? (
        <CreativeScoreComparison
          data={comparison}
          language={lang}
          outputType={asset.outputType}
          scoringImproved={scoringImproved}
          onExportBest={handleExportBest}
          onCreateAnotherImprovement={handleCreateAnotherImprovement}
        />
      ) : null}

      {showVariantComposer && asset.outputType === "image" ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <label
            htmlFor="post-gen-variant-note"
            className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-neutral-500"
          >
            {isDe ? "Stil-Richtung (optional)" : "Style direction (optional)"}
          </label>
          <textarea
            id="post-gen-variant-note"
            rows={2}
            value={variantStyleNote}
            onChange={(e) => setVariantStyleNote(e.target.value)}
            placeholder={
              isDe
                ? "z. B. clean premium social ad style …"
                : "e.g. clean premium social ad style …"
            }
            className="mb-3 w-full resize-none rounded-xl border border-white/10 bg-neutral-950/60 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-amber-500/40"
          />
          <button
            type="button"
            disabled={busyActionId === "create_style_variant"}
            onClick={() => void runStyleVariant()}
            className={`${obsidianButtonClass("primary", { size: "sm" })} gap-2`}
          >
            {isDe ? "Variante generieren" : "Generate variant"}
          </button>
        </div>
      ) : null}

      {variantError || actionError ? (
        <p role="alert" className="text-sm text-red-400">
          {variantError ?? actionError}
        </p>
      ) : null}

      <CreativeScorePanel
        open={scoreOpen}
        onClose={() => setScoreOpen(false)}
        assetUrl={asset.url}
        prompt={
          asset.prompt?.trim() ||
          (isDe ? "Creator-Asset ohne Prompt" : "Creator asset without prompt")
        }
        outputType={asset.outputType}
        isDe={isDe}
        getToken={getToken}
        onScoreReady={setCreativeScore}
        improveRoute={improveRoute}
        creditBalance={creditBalance}
        onImproveAsset={
          improveRoute.mode === "image_variant" && improveRoute.canRun
            ? handleImproveFromScore
            : undefined
        }
        onBuyCredits={onBuyCredits}
      />
    </div>
  );
}

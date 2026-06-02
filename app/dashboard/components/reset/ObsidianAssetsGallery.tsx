"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, X, ZoomIn } from "lucide-react";
import CreatorCanvas from "@/app/components/studio/CreatorCanvas";
import CreativeScorePanel, {
  type CreativeScoreData,
} from "@/app/components/studio/CreativeScorePanel";
import type { CreativeScoreComparisonData } from "@/app/components/studio/CreativeScoreComparison";
import { fetchCreativeScore } from "@/app/lib/creative-score/fetch-creative-score";
import { buildWhatChangedSummary } from "@/app/lib/creative-score/score-improve-helpers";
import {
  buildImprovedPromptFromScore,
  resolveCreativeScoreImproveRoute,
} from "@/app/lib/creative-score/resolve-improve-route";
import {
  formatToolGenerateError,
  handleGenerateForTool,
} from "@/lib/dashboard/tool-generate";
import {
  galleryRowToCanvasAsset,
  type GalleryAssetRow,
} from "@/app/components/gallery/GalleryAssetCard";
import GalleryAssetCard from "@/app/components/gallery/GalleryAssetCard";
import GalleryEmptyState from "@/app/components/gallery/GalleryEmptyState";
import GalleryHooksCaptionsSheet from "@/app/components/gallery/GalleryHooksCaptionsSheet";
import GallerySkeletonGrid from "@/app/components/gallery/GallerySkeletonGrid";
import ToolDetailPanel from "@/app/components/studio/ToolDetailPanel";
import type { CreatorCanvasAsset } from "@/app/components/studio/canvas-types";
import { runGalleryAssetWorkflow } from "@/app/lib/gallery/gallery-asset-workflows";
import {
  filterGalleryAssets,
  type GalleryCardAction,
  type GalleryFilter,
} from "@/app/lib/gallery/gallery-card-actions";
import {
  resolveCreatorTool,
  type ResolvedCreatorTool,
} from "@/app/lib/tools/resolve-tool";
import { createClient } from "@/lib/supabase/client";
import { OBS } from "@/lib/obsidian/dashboard-tokens";
import { useDashboardLanguage } from "../../DashboardLanguageProvider";
import { GALLERY_FILTERS, GALLERY_NOTICES } from "@/lib/copy/gallery-copy";
import { useCreativeSuite } from "../creative-suite/CreativeSuiteProvider";
import { useStudioUpsell } from "../studio-white/StudioUpsellProvider";
import { areCreditsConfirmed } from "@/lib/billing/credit-ui-state";

type GenerationAsset = GalleryAssetRow;

const FILTER_ORDER: GalleryFilter[] = [
  "all",
  "images",
  "videos",
  "packs",
  "favorites",
];

export default function ObsidianAssetsGallery() {
  const { language } = useDashboardLanguage();
  const isDe = language === "de";
  const {
    galleryRefreshKey,
    onGenerationQueued,
    credits,
    creditsLoading,
    creditsError,
  } = useCreativeSuite();
  const creditsConfirmed = areCreditsConfirmed(creditsLoading, creditsError);
  const { openUpsell } = useStudioUpsell();
  const supabase = createClient();

  const [assets, setAssets] = useState<GenerationAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<GalleryFilter>("all");
  const [previewAsset, setPreviewAsset] = useState<GenerationAsset | null>(null);
  const [previewAction, setPreviewAction] = useState<"variant" | "score" | null>(
    null
  );
  const [scoreAsset, setScoreAsset] = useState<GenerationAsset | null>(null);
  const [scoreComparison, setScoreComparison] =
    useState<CreativeScoreComparisonData | null>(null);
  const [scoreComparisonLoading, setScoreComparisonLoading] = useState(false);
  const [canvasAsset, setCanvasAsset] = useState<CreatorCanvasAsset | null>(
    null
  );
  const [variantNotice, setVariantNotice] = useState<string | null>(null);
  const [galleryNotice, setGalleryNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [hooksAsset, setHooksAsset] = useState<GenerationAsset | null>(null);
  const [detailTool, setDetailTool] = useState<ResolvedCreatorTool | null>(null);

  const toolContext = useMemo(
    () => ({ language: language === "de" ? "de" : "en" } as const),
    [language]
  );

  const getToken = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  }, [supabase.auth]);

  const loadAssets = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        setAssets([]);
        return;
      }

      const res = await fetch("/api/generations?limit=60&status=completed", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setAssets([]);
        return;
      }

      const data = (await res.json()) as {
        generations?: GenerationAsset[];
        items?: GenerationAsset[];
      };
      const rows = data.generations ?? data.items ?? [];
      const completed = rows.filter((row) => {
        const status = (row.status ?? "").toLowerCase();
        const hasMedia = Boolean(row.image_url || row.video_url);
        if (!hasMedia) return false;
        if (!status) return true;
        return status === "completed" || status === "succeeded" || status === "success";
      });
      setAssets(completed);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    void loadAssets();
  }, [loadAssets, galleryRefreshKey]);

  useEffect(() => {
    if (!previewAsset) {
      setCanvasAsset(null);
      return;
    }
    setCanvasAsset(galleryRowToCanvasAsset(previewAsset));
  }, [previewAsset]);

  const filtered = useMemo(
    () => filterGalleryAssets(assets, filter, search),
    [assets, filter, search]
  );

  const showNotice = useCallback(
    (message: string) => {
      setGalleryNotice(message);
      window.setTimeout(() => setGalleryNotice(null), 2500);
    },
    []
  );

  const toggleFavorite = async (asset: GenerationAsset) => {
    const token = await getToken();
    if (!token) return;
    setBusyId(asset.id);
    try {
      const res = await fetch("/api/generations/favorite", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          generationId: asset.id,
          isFavorite: !asset.is_favorite,
        }),
      });
      if (res.ok) {
        setAssets((prev) =>
          prev.map((a) =>
            a.id === asset.id ? { ...a, is_favorite: !a.is_favorite } : a
          )
        );
      }
    } finally {
      setBusyId(null);
    }
  };

  const deleteAsset = async (asset: GenerationAsset) => {
    const token = await getToken();
    if (!token) return;
    setBusyId(asset.id);
    try {
      const res = await fetch("/api/generations/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ generationId: asset.id }),
      });
      if (res.ok) {
        setAssets((prev) => prev.filter((a) => a.id !== asset.id));
        if (previewAsset?.id === asset.id) {
          setPreviewAsset(null);
          setPreviewAction(null);
        }
        if (scoreAsset?.id === asset.id) setScoreAsset(null);
      }
    } finally {
      setBusyId(null);
    }
  };

  const exportAsset = (asset: GenerationAsset) => {
    const url = asset.video_url ?? asset.image_url;
    if (!url) return;
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.download = "";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const copyPrompt = async (asset: GenerationAsset) => {
    const prompt = asset.prompt?.trim();
    if (!prompt) {
      showNotice(isDe ? GALLERY_NOTICES.promptMissing.de : GALLERY_NOTICES.promptMissing.en);
      return;
    }
    try {
      await navigator.clipboard.writeText(prompt);
      showNotice(isDe ? GALLERY_NOTICES.promptCopied.de : GALLERY_NOTICES.promptCopied.en);
    } catch {
      showNotice(isDe ? "Kopieren fehlgeschlagen." : "Copy failed.");
    }
  };

  const openToolDetail = useCallback(
    (action: GalleryCardAction) => {
      if (!action.creatorToolId) return;
      const resolved = resolveCreatorTool(action.creatorToolId, toolContext);
      if (resolved) setDetailTool(resolved);
    },
    [toolContext]
  );

  const runGenerationAction = useCallback(
    async (
      asset: GenerationAsset,
      actionId:
        | "animate_image"
        | "enhance_asset"
        | "edit_image"
        | "match_style"
        | "use_reference_image",
      creditCost?: number
    ) => {
      setBusyId(asset.id);
      try {
        const token = await getToken();
        if (!token) return;

        const result = await runGalleryAssetWorkflow({
          asset,
          actionId,
          token,
          language,
        });

        if (!result.success) {
          showNotice(formatToolGenerateError(result, language));
          if (result.status === 402 || result.code === "INSUFFICIENT_CREDITS") {
            openUpsell({
              balance: credits,
              requiredCredits: creditCost ?? 0,
            });
          }
          return;
        }

        onGenerationQueued({ creditsAfter: result.creditsAfter ?? null });
        showNotice(
          isDe
            ? "Neues Asset wird in der Gallery gespeichert."
            : "New asset will be saved to Gallery."
        );
        void loadAssets();
      } catch {
        showNotice(
          isDe ? "Workflow fehlgeschlagen." : "Workflow failed."
        );
      } finally {
        setBusyId(null);
      }
    },
    [
      credits,
      getToken,
      isDe,
      language,
      loadAssets,
      onGenerationQueued,
      openUpsell,
      showNotice,
    ]
  );

  const handleCardAction = useCallback(
    (action: GalleryCardAction, asset: GenerationAsset) => {
      if (action.behavior === "detail_panel") {
        openToolDetail(action);
        return;
      }

      switch (action.id) {
        case "view":
          setPreviewAction(null);
          setPreviewAsset(asset);
          break;
        case "copy_prompt":
          void copyPrompt(asset);
          break;
        case "create_variant":
          setPreviewAction("variant");
          setPreviewAsset(asset);
          break;
        case "check_creative_score":
          setScoreComparison(null);
          setScoreAsset(asset);
          break;
        case "generate_hooks_captions":
          setHooksAsset(asset);
          break;
        case "export_asset":
          exportAsset(asset);
          break;
        case "favorite":
          void toggleFavorite(asset);
          break;
        case "animate_image":
          void runGenerationAction(
            asset,
            "animate_image",
            action.creditCost
          );
          break;
        case "enhance_asset":
          void runGenerationAction(
            asset,
            "enhance_asset",
            action.creditCost
          );
          break;
        case "edit_image":
          void runGenerationAction(asset, "edit_image", action.creditCost);
          break;
        case "match_style":
          void runGenerationAction(asset, "match_style", action.creditCost);
          break;
        case "use_as_reference":
          void runGenerationAction(
            asset,
            "use_reference_image",
            action.creditCost
          );
          break;
        default:
          break;
      }
    },
    [copyPrompt, exportAsset, openToolDetail, runGenerationAction, toggleFavorite]
  );

  const scoreCanvasAsset = scoreAsset
    ? galleryRowToCanvasAsset(scoreAsset)
    : null;

  const scoreImproveRoute = useMemo(
    () =>
      scoreCanvasAsset
        ? resolveCreativeScoreImproveRoute({
            outputType: scoreCanvasAsset.outputType,
          })
        : { mode: "prompt_preview" as const },
    [scoreCanvasAsset]
  );

  const handleImproveFromScore = useCallback(
    async (score: CreativeScoreData) => {
      if (!scoreAsset || !scoreCanvasAsset) return;
      const route = resolveCreativeScoreImproveRoute({
        outputType: scoreCanvasAsset.outputType,
      });
      if (route.mode !== "image_variant" || !route.canRun) return;

      const styleNote = buildImprovedPromptFromScore(
        score,
        scoreAsset.prompt?.trim() ?? ""
      );
      const basePrompt = scoreAsset.prompt?.trim();
      if (!basePrompt) {
        showNotice(
          isDe
            ? "Für eine Variante wird ein Prompt benötigt."
            : "A prompt is required to create a variant."
        );
        return;
      }

      const variantPrompt = `${basePrompt}. Style direction: ${styleNote}`;

      setBusyId("creative_score_improve");
      try {
        const token = await getToken();
        if (!token) return;

        const result = await handleGenerateForTool({
          toolKey: "image",
          token,
          prompt: variantPrompt,
          actionId: "create_style_variant",
          sourceImageUrl:
            scoreCanvasAsset.outputType === "image"
              ? scoreCanvasAsset.url
              : undefined,
          currentLanguage: language,
        });

        if (!result.success) {
          showNotice(formatToolGenerateError(result, language));
          if (result.status === 402 || result.code === "INSUFFICIENT_CREDITS") {
            openUpsell({ balance: credits, requiredCredits: route.creditCost });
          }
          return;
        }

        onGenerationQueued({ creditsAfter: result.creditsAfter ?? null });
        void loadAssets();

        const newUrl = result.imageUrl;
        if (newUrl && scoreCanvasAsset.url) {
          const improvedPromptUsed = buildImprovedPromptFromScore(
            score,
            basePrompt
          );
          setScoreComparison({
            originalUrl: scoreCanvasAsset.url,
            improvedUrl: newUrl,
            originalScore: score.score,
            improvedScore: null,
            improvedPrompt: improvedPromptUsed,
            whatChanged: buildWhatChangedSummary(
              score.dimensions ?? [],
              score.dimensions ?? [],
              language,
              score.recommendedFix
            ),
            hook: score.hooks[0],
            caption: score.captions[0],
          });
          setScoreComparisonLoading(true);
          void fetchCreativeScore({
            assetUrl: newUrl,
            prompt: variantPrompt,
            outputType: "image",
            language,
            getToken,
          }).then((improvedScoreResult) => {
            setScoreComparisonLoading(false);
            if (!improvedScoreResult) return;
            setScoreComparison((prev) =>
              prev
                ? {
                    ...prev,
                    improvedScore: improvedScoreResult.score,
                    whatChanged: buildWhatChangedSummary(
                      score.dimensions ?? [],
                      improvedScoreResult.dimensions ?? [],
                      language,
                      score.recommendedFix
                    ),
                    hook: improvedScoreResult.hooks[0] ?? prev.hook,
                    caption: improvedScoreResult.captions[0] ?? prev.caption,
                  }
                : null
            );
          });
          showNotice(
            isDe
              ? "Verbesserte Version gespeichert — Original bleibt in der Gallery."
              : "Improved version saved — original preserved in Gallery."
          );
        } else {
          showNotice(
            isDe
              ? "Verbesserte Variante wird in der Gallery gespeichert."
              : "Improved variant will be saved to Gallery."
          );
        }
      } catch {
        showNotice(
          isDe ? "Verbesserung fehlgeschlagen." : "Improvement failed."
        );
      } finally {
        setBusyId(null);
      }
    },
    [
      credits,
      getToken,
      isDe,
      language,
      loadAssets,
      onGenerationQueued,
      openUpsell,
      scoreAsset,
      scoreCanvasAsset,
    ]
  );

  const isGalleryEmpty = !loading && assets.length === 0;
  const isFilterEmpty = !loading && assets.length > 0 && filtered.length === 0;

  const clearFilters = () => {
    setFilter("all");
    setSearch("");
  };

  return (
    <div className="mx-auto max-w-6xl">
      <header className={`mb-6 ${OBS.glassPad}`}>
        <p className={`${OBS.mono} text-amber-500/80`}>
          {isDe ? "Creator Gallery" : "Creator Gallery"}
        </p>
        <h1 className={`mt-2 ${OBS.titleHero}`}>
          {isDe ? "Creator Gallery" : "Creator Gallery"}
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          {isDe
            ? "Jedes Asset ist der Startpunkt für den nächsten Workflow — Score, Hooks, Varianten, Animation und mehr."
            : "Every asset is a starting point for the next workflow — score, hooks, variants, animation, and more."}
        </p>
      </header>

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={isDe ? "Assets durchsuchen …" : "Search assets …"}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-white placeholder:text-neutral-500 outline-none focus-visible:border-amber-500/50 focus-visible:ring-2 focus-visible:ring-amber-500/35 min-h-[44px]"
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTER_ORDER.map((key) => {
          const active = filter === key;
          const label = isDe ? GALLERY_FILTERS[key].de : GALLERY_FILTERS[key].en;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              aria-pressed={active}
              className={`rounded-full border px-3.5 py-2 text-xs font-semibold transition outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070A12] min-h-[40px] ${
                active
                  ? "border-amber-500/50 bg-amber-500/15 text-amber-300"
                  : "border-white/10 bg-white/[0.03] text-neutral-400 hover:border-white/20 hover:text-neutral-200"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {galleryNotice ? (
        <p className="mb-4 text-center text-xs text-emerald-400/90">{galleryNotice}</p>
      ) : null}

      {loading ? (
        <GallerySkeletonGrid count={8} />
      ) : isGalleryEmpty ? (
        <GalleryEmptyState language={isDe ? "de" : "en"} />
      ) : isFilterEmpty ? (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <p className="max-w-lg text-sm text-neutral-400">
            {isDe ? "Keine Treffer für diese Filter." : "No assets match these filters."}
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-6 rounded-xl border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:bg-white/5"
          >
            {isDe ? "Filter zurücksetzen" : "Clear filters"}
          </button>
        </div>
      ) : (
        <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
          {filtered.map((asset) => (
            <GalleryAssetCard
              key={asset.id}
              asset={asset}
              isDe={isDe}
              busy={busyId === asset.id}
              toolContext={toolContext}
              onAction={handleCardAction}
              onDelete={(row) => void deleteAsset(row)}
            />
          ))}
        </div>
      )}

      {previewAsset ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-md">
          <div className={`relative my-8 w-full max-w-4xl ${OBS.glassPad}`}>
            <button
              type="button"
              onClick={() => {
                setPreviewAsset(null);
                setPreviewAction(null);
                setVariantNotice(null);
              }}
              className="absolute right-4 top-4 z-10 rounded-lg border border-neutral-700 p-1.5 text-neutral-400 hover:text-white"
              aria-label={isDe ? "Schließen" : "Close"}
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mb-4 pr-12">
              <p className={`${OBS.mono} text-amber-500/70`}>
                <ZoomIn className="mr-1 inline h-3.5 w-3.5" />
                {isDe ? "Creator Gallery" : "Creator Gallery"}
              </p>
            </div>

            {variantNotice ? (
              <p className="mb-4 text-center text-xs text-emerald-400/90">
                {variantNotice}
              </p>
            ) : null}

            <CreatorCanvas
              asset={canvasAsset}
              isDe={isDe}
              creditBalance={creditsConfirmed ? credits : undefined}
              getToken={getToken}
              initialAction={previewAction}
              onAssetCreated={() => {
                onGenerationQueued({});
                void loadAssets();
                setVariantNotice(
                  isDe
                    ? "Neue Variante in der Creator Gallery gespeichert."
                    : "New variant saved to Creator Gallery."
                );
              }}
              onCreditsUsed={() => onGenerationQueued({})}
              onVariantNotice={setVariantNotice}
              onBuyCredits={() =>
                openUpsell({ balance: credits, requiredCredits: 25 })
              }
              onUpgrade={() =>
                openUpsell({
                  balance: credits,
                  requiredCredits: 25,
                  isPremium: true,
                })
              }
            />
          </div>
        </div>
      ) : null}

      {hooksAsset ? (
        <GalleryHooksCaptionsSheet
          open
          onClose={() => setHooksAsset(null)}
          prompt={
            hooksAsset.prompt?.trim() ||
            (isDe ? "Creator-Asset ohne Prompt" : "Creator asset without prompt")
          }
          language={language}
        />
      ) : null}

      {detailTool ? (
        <ToolDetailPanel
          open
          resolved={detailTool}
          language={language}
          onClose={() => setDetailTool(null)}
          onUpgrade={() =>
            openUpsell({
              balance: credits,
              requiredCredits: detailTool.requiredCredits,
              isPremium: detailTool.status === "pro_locked",
            })
          }
        />
      ) : null}

      {scoreAsset && scoreCanvasAsset ? (
        <CreativeScorePanel
          open
          onClose={() => {
            setScoreAsset(null);
            setScoreComparison(null);
            setScoreComparisonLoading(false);
          }}
          assetUrl={scoreCanvasAsset.url}
          prompt={
            scoreAsset.prompt?.trim() ||
            (isDe ? "Creator-Asset ohne Prompt" : "Creator asset without prompt")
          }
          outputType={scoreCanvasAsset.outputType}
          isDe={isDe}
          getToken={getToken}
          improveRoute={scoreImproveRoute}
          creditBalance={creditsConfirmed ? credits : undefined}
          comparison={scoreComparison}
          scoringImproved={scoreComparisonLoading}
          onExportBest={(url) => {
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.target = "_blank";
            anchor.rel = "noopener noreferrer";
            anchor.download = "";
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
          }}
          onCreateAnotherImprovement={() => {
            setScoreComparison(null);
            setScoreComparisonLoading(false);
          }}
          onImproveAsset={
            scoreImproveRoute.mode === "image_variant" &&
            scoreImproveRoute.canRun
              ? handleImproveFromScore
              : undefined
          }
          onBuyCredits={() =>
            openUpsell({
              balance: credits,
              requiredCredits:
                scoreImproveRoute.mode === "image_variant"
                  ? scoreImproveRoute.creditCost
                  : 0,
            })
          }
        />
      ) : null}
    </div>
  );
}

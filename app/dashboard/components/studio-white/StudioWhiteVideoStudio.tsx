"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { canvasAssetFromPreview } from "@/lib/dashboard/studio-white/preview";
import {
  formatToolGenerateError,
  handleGenerateForTool,
  resolveToolCreditCostFromInput,
  getDefaultModelModeForTool,
} from "@/lib/dashboard/tool-generate";
import {
  getDefaultModelModeIdForAction,
  getPrimaryModelModesForAction,
  getApiModelIdForModelMode,
} from "@/app/lib/model-modes/get-visible-model-modes";
import ModelModeSelector from "@/app/components/studio/ModelModeSelector";
import ModelsQualityDrawer, {
  ModelsQualityDrawerTrigger,
} from "@/app/components/studio/ModelsQualityDrawer";
import SelectedModeSummary from "@/app/components/studio/SelectedModeSummary";
import PromptBelowInputArea from "@/app/components/studio/PromptBelowInputArea";
import ModeHelpText from "@/app/components/studio/ModeHelpText";
import { getModePromptHint } from "@/app/lib/model-modes/mode-copy";
import { appendPromptFragment } from "@/app/lib/presets/prompt-chips";
import { studioFormatToApi } from "@/lib/dashboard/studio-white/formats";
import { VIDEO_STUDIO_PLACEHOLDERS } from "@/lib/dashboard/studio-white/placeholders";
import {
  getVideoDurationOptions,
} from "@/lib/dashboard/video-studio-credits";
import type { StudioFormatId } from "@/lib/dashboard/v2/constants";
import { useWorkspaceGeneration } from "@/app/dashboard/hooks/useWorkspaceGeneration";
import { useLanguage } from "@/hooks/useLanguage";
import { useCreativeSuite } from "../creative-suite/CreativeSuiteProvider";
import { useStudioUpsell } from "./StudioUpsellProvider";
import DurationPills from "../obsidian/DurationPills";
import { getEngineModelById } from "@/lib/ai/model-registry";
import FormatAspectGrid from "./FormatAspectGrid";
import StudioWhiteToolFrame from "./StudioWhiteToolFrame";
import StudioCreditMeter from "./StudioCreditMeter";
import SmartCommandBox from "@/components/dashboard/SmartCommandBox";
import {
  getGenerateButtonState,
  VIDEO_LOADING_MESSAGES,
} from "@/lib/copy/launch-user-copy";
import { areCreditsConfirmed } from "@/lib/billing/credit-ui-state";

export default function StudioWhiteVideoStudio() {
  const searchParams = useSearchParams();
  const { isDe, language } = useLanguage();
  const lang = language === "de" ? "de" : "en";
  const {
    credits,
    creditsLoading,
    creditsError,
    onGenerationQueued,
  } = useCreativeSuite();
  const creditsConfirmed = areCreditsConfirmed(creditsLoading, creditsError);
  const { handleInsufficientCredits, openUpsell } = useStudioUpsell();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const getToken = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  }, [supabase.auth]);

  const {
    preview,
    setLoading: setPreviewLoading,
    setError: setPreviewError,
    clearPreviewError,
    pollGeneration,
    setSuccess: setPreviewSuccess,
  } = useWorkspaceGeneration(getToken);

  const [prompt, setPrompt] = useState("");
  const [formatId, setFormatId] = useState<StudioFormatId>("vertical");
  const videoActionId = "create_video";
  const modelModes = useMemo(
    () => getPrimaryModelModesForAction(videoActionId),
    []
  );

  const [selectedModelModeId, setSelectedModelModeId] = useState(
    () => getDefaultModelModeIdForAction(videoActionId) || getDefaultModelModeForTool("video")
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const selectedEngine =
    getApiModelIdForModelMode(selectedModelModeId) ?? "fal_kling_v3_t2v";
  const [videoDuration, setVideoDuration] = useState<5 | 10>(5);
  const [sourceImageUrl, setSourceImageUrl] = useState<string | null>(null);
  const [sourcePreviewUrl, setSourcePreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [canvasAsset, setCanvasAsset] = useState<
    import("@/app/components/studio/canvas-types").CreatorCanvasAsset | null
  >(null);
  const [variantNotice, setVariantNotice] = useState<string | null>(null);

  useEffect(() => {
    const engineParam = searchParams.get("engine");
    const durationParam = searchParams.get("duration");
    const promptParam = searchParams.get("prompt");

    if (engineParam) {
      const matchingMode = modelModes.find(
        (m) => getApiModelIdForModelMode(m.id) === engineParam
      );
      if (matchingMode) setSelectedModelModeId(matchingMode.id);
    }
    if (durationParam === "5" || durationParam === "10") {
      setVideoDuration(Number(durationParam) as 5 | 10);
    }
    if (promptParam) {
      setPrompt(promptParam);
    }
  }, [searchParams, modelModes]);

  useEffect(() => {
    const asset = canvasAssetFromPreview(preview, "video");
    if (asset) setCanvasAsset(asset);
  }, [preview]);

  const selectedEngineConfig = useMemo(
    () => getEngineModelById(selectedEngine),
    [selectedEngine]
  );
  const requiresSourceImage =
    selectedEngineConfig?.requiredInputs.includes("sourceImageUrl") ?? false;

  const selectedModelMode = modelModes.find((m) => m.id === selectedModelModeId);
  const videoCreditCost = resolveToolCreditCostFromInput({
    toolKey: "video",
    modelModeId: selectedModelModeId,
    actionId: videoActionId,
    durationSeconds: videoDuration,
  });

  const durationOptions = useMemo(
    () => getVideoDurationOptions(selectedEngine),
    [selectedEngine]
  );

  const promptHint = useMemo(() => {
    if (requiresSourceImage) {
      return lang === "de"
        ? "Tipp: Quellbild hochladen und die gewünschte Kamerabewegung beschreiben — z. B. langsamer Zoom oder Schwenk."
        : "Tip: Upload a source image and describe the camera motion — e.g. slow zoom or pan.";
    }
    return getModePromptHint(selectedModelModeId, lang);
  }, [requiresSourceImage, selectedModelModeId, lang]);

  const handleAppendPrompt = useCallback((fragment: string) => {
    setPrompt((current) => appendPromptFragment(current, fragment));
  }, []);

  const canGenerate =
    creditsConfirmed &&
    prompt.trim().length > 0 &&
    !uploading &&
    !loading &&
    credits >= videoCreditCost &&
    (!requiresSourceImage || !!sourceImageUrl);

  const uploadSourceImage = async (file: File) => {
    setUploading(true);
    setError(null);
    setSourcePreviewUrl(URL.createObjectURL(file));
    try {
      const token = await getToken();
      if (!token) throw new Error("Session expired");

      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/reference-sources/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.imageUrl) throw new Error(data.error || "Upload failed");
      setSourceImageUrl(data.imageUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleGenerate = async () => {
    if (!creditsConfirmed) return;

    if (credits < videoCreditCost) {
      openUpsell({
        requiredCredits: videoCreditCost,
        balance: credits,
        modelModeLabel: selectedModelMode?.label ?? "Video",
        isPremium: selectedModelMode?.isPremium ?? true,
      });
      return;
    }
    if (!canGenerate) return;
    setLoading(true);
    setIsPreviewOpen(true);
    setError(null);
    clearPreviewError();
    setPreviewLoading(
      VIDEO_LOADING_MESSAGES[lang][0] ?? "Creating your video…"
    );

    try {
      const token = await getToken();
      if (!token) throw new Error("Session expired");

      const result = await handleGenerateForTool({
        toolKey: "video",
        token,
        sourceImageUrl: requiresSourceImage ? sourceImageUrl ?? undefined : undefined,
        motionInstruction: prompt.trim(),
        outputFormat: studioFormatToApi(formatId),
        modelModeId: selectedModelModeId,
        actionId: videoActionId,
        durationSeconds: videoDuration,
        currentLanguage: lang,
      });

      if (!result.success) {
        handleInsufficientCredits(result.status, result.code);
        const msg = formatToolGenerateError(result, lang);
        setPreviewError(msg);
        return;
      }

      onGenerationQueued({ creditsSpent: videoCreditCost });
      if (result.videoUrl) {
        setCanvasAsset({
          url: result.videoUrl,
          outputType: "video",
          prompt: prompt.trim(),
          createdAt: new Date().toISOString(),
          sourceStudio: "video",
          modelModeId: selectedModelModeId,
          creditsUsed: videoCreditCost,
        });
        setPreviewSuccess({
          type: "video",
          url: result.videoUrl,
          prompt: prompt.trim(),
          model: selectedModelModeId,
          credits: videoCreditCost,
        });
      } else if (result.generationId) {
        pollGeneration(result.generationId, lang);
      }
    } catch (e) {
      setPreviewError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const generateLabel = creditsConfirmed
    ? getGenerateButtonState({
        creditCost: videoCreditCost,
        creditsAvailable: credits,
        isDe: lang === "de",
        isVideo: true,
      }).label
    : lang === "de"
      ? "Credits werden geladen…"
      : "Loading credits…";

  const handleRegenerateWithMode = useCallback(
    (modelModeId: string, nextPrompt: string) => {
      setSelectedModelModeId(modelModeId);
      setPrompt(nextPrompt);
      setIsPreviewOpen(false);
      setVariantNotice(
        lang === "de"
          ? "Bereit für eine weitere Video-Version — tippe auf Generieren."
          : "Ready for another video version — tap Generate."
      );
    },
    [lang]
  );

  const durationRow = (
    <DurationPills
      className="mx-auto w-full max-w-4xl px-4"
      value={videoDuration}
      onChange={setVideoDuration}
      options={durationOptions}
    />
  );

  const steps = (
    <div className="rounded-3xl border border-neutral-800/80 bg-neutral-900/50 p-4 shadow-2xl backdrop-blur-xl">
      <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">
        {requiresSourceImage
          ? lang === "de"
            ? "Quellbild"
            : "Source image"
          : lang === "de"
            ? "Quellbild (optional)"
            : "Source image (optional)"}
      </p>
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void uploadSourceImage(file);
          e.target.value = "";
        }}
      />
      {sourcePreviewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={sourcePreviewUrl}
          alt=""
          className="mx-auto mt-3 w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900/40 object-contain p-2"
        />
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="mt-3 flex h-32 w-full items-center justify-center rounded-xl border border-dashed border-neutral-700 bg-neutral-900/40 text-sm font-semibold text-neutral-400 hover:border-amber-500/50"
        >
          + {lang === "de" ? "Bild hochladen" : "Upload image"}
        </button>
      )}
      {uploading ? (
        <p className="mt-2 text-xs text-neutral-500">
          {lang === "de" ? "Wird hochgeladen…" : "Uploading…"}
        </p>
      ) : null}
    </div>
  );

  return (
    <StudioWhiteToolFrame
      layout="guided"
      promptPlacement="top"
      showCommandBar={false}
      isPreviewOpen={isPreviewOpen}
      onPreviewClose={() => setIsPreviewOpen(false)}
      sourceStudio="video"
      getToken={getToken}
      canvasAsset={canvasAsset}
      onCanvasAssetChange={setCanvasAsset}
      variantNotice={variantNotice}
      onVariantNotice={setVariantNotice}
      modelModeId={canvasAsset?.modelModeId ?? selectedModelModeId}
      creditsUsed={canvasAsset?.creditsUsed ?? videoCreditCost}
      creditBalance={creditsConfirmed ? credits : undefined}
      onRegenerateWithMode={handleRegenerateWithMode}
      onBuyCredits={() =>
        openUpsell({
          requiredCredits: videoCreditCost,
          balance: credits,
          modelModeLabel: selectedModelMode?.label,
          isPremium: true,
        })
      }
      onUpgrade={() =>
        openUpsell({
          requiredCredits: videoCreditCost,
          balance: credits,
          modelModeLabel: selectedModelMode?.label,
          isPremium: true,
        })
      }
      creditMeter={
        <StudioCreditMeter
          creditCost={videoCreditCost}
          costLabel={`${videoDuration}s · ${selectedModelMode?.label ?? "Video"}`}
          isPremium
        />
      }
      commandBox={
        <SmartCommandBox
          value={prompt}
          onChange={setPrompt}
          onGenerate={() => void handleGenerate()}
          onInsufficientCredits={() =>
            openUpsell({
              requiredCredits: videoCreditCost,
              balance: credits,
              modelModeLabel: selectedModelMode?.label,
              isPremium: true,
            })
          }
          isGenerating={loading}
          disabled={!canGenerate}
          submitLabel={generateLabel}
          selectedModelLabel={selectedModelMode?.label ?? "Video"}
          currentLanguage={lang}
          formatLabel={formatId}
          commandHeading={lang === "de" ? "Video-Prompt" : "Video prompt"}
          typewriterPlaceholders={
            lang === "de" ? VIDEO_STUDIO_PLACEHOLDERS.de : VIDEO_STUDIO_PLACEHOLDERS.en
          }
          recommendationText={requiresSourceImage ? promptHint : undefined}
          headerSlot={durationRow}
          errorMessage={error}
          belowInputSlot={
            <div className="space-y-3 text-left">
              <PromptBelowInputArea
                prompt={prompt}
                modelModeId={selectedModelModeId}
                actionId={videoActionId}
                language={lang}
                modelSelectable
                onAppendPrompt={handleAppendPrompt}
                onUseImproved={setPrompt}
              />
              {!requiresSourceImage ? (
                <ModeHelpText modelModeId={selectedModelModeId} language={lang} />
              ) : null}
            </div>
          }
        />
      }
      previewState={preview}
      engineGrid={
        <div className="space-y-3">
          <SelectedModeSummary
            modelModeId={selectedModelModeId}
            modeLabel={selectedModelMode?.label ?? "Video"}
            creditCost={videoCreditCost}
            isPremium={selectedModelMode?.isPremium ?? true}
            language={lang}
          />
          <div className="flex items-start justify-between gap-3">
            <ModelModeSelector
              modes={modelModes}
              selectedId={selectedModelModeId}
              onSelect={setSelectedModelModeId}
              language={lang}
              onUpgradeClick={() =>
                openUpsell({
                  requiredCredits: videoCreditCost,
                  balance: credits,
                  isPremium: true,
                  modelModeLabel: selectedModelMode?.label,
                })
              }
            />
            <ModelsQualityDrawerTrigger
              language={lang}
              onClick={() => setDrawerOpen(true)}
            />
          </div>
          <ModelsQualityDrawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            language={lang}
            selectedModelModeId={selectedModelModeId}
            onSelectActive={(id) => {
              setSelectedModelModeId(id);
              setDrawerOpen(false);
            }}
          />
        </div>
      }
      formatGrid={
        <FormatAspectGrid selectedId={formatId} onSelect={setFormatId} />
      }
      steps={steps}
    />
  );
}

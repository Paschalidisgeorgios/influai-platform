"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { canvasAssetFromPreview } from "@/lib/dashboard/studio-white/preview";
import {
  consumeResumePromptFlag,
  getLastPrompt,
  markGenerationFailed,
  markRecentAssetGenerated,
  saveWorkspaceSession,
} from "@/lib/dashboard/workspace-persistence";
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
import AiAgentStudio from "@/app/dashboard/AiAgentStudio";
import ModeHelpText from "@/app/components/studio/ModeHelpText";
import { appendPromptFragment } from "@/app/lib/presets/prompt-chips";
import {
  canRunUpgrade,
  getUpgradeCost,
  runCampaignUpgrade,
} from "@/lib/dashboard/campaign-upgrade-client";
import type { CampaignUpgradeAction } from "@/lib/intelligence/campaign-upgrade-config";
import { studioFormatToApi } from "@/lib/dashboard/studio-white/formats";
import type { StudioFormatId } from "@/lib/dashboard/v2/constants";
import { STUDIO_FORMATS } from "@/lib/dashboard/v2/constants";
import { useWorkspaceGeneration } from "@/app/dashboard/hooks/useWorkspaceGeneration";
import { useDashboardLanguage } from "../../DashboardLanguageProvider";
import { useCreativeSuite } from "../creative-suite/CreativeSuiteProvider";
import { useStudioUpsell } from "./StudioUpsellProvider";
import FormatAspectGrid from "./FormatAspectGrid";
import StudioWhiteToolFrame from "./StudioWhiteToolFrame";
import StudioCreditMeter from "./StudioCreditMeter";
import CampaignExpansionPanel from "./CampaignExpansionPanel";
import WorkspaceGreeting from "../dashboard/WorkspaceGreeting";
import SmartCommandBox from "@/components/dashboard/SmartCommandBox";
import WorkspaceIntentHint from "../dashboard/WorkspaceIntentHint";
import {
  getGenerateButtonState,
  IMAGE_LOADING_MESSAGES,
} from "@/lib/copy/launch-user-copy";
import {
  areCreditsConfirmed,
} from "@/lib/billing/credit-ui-state";

export default function StudioWhiteImageStudio() {
  const { language } = useDashboardLanguage();
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

  const imageActionId = "create_image";
  const modelModes = useMemo(
    () => getPrimaryModelModesForAction(imageActionId),
    []
  );

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
    setSuccess,
    clearPreviewError,
    pollGeneration,
  } = useWorkspaceGeneration(getToken);

  const [prompt, setPrompt] = useState("");
  const [promptHydrated, setPromptHydrated] = useState(false);
  const [formatId, setFormatId] = useState<StudioFormatId>("square");
  const [selectedModelModeId, setSelectedModelModeId] = useState(
    () => getDefaultModelModeIdForAction(imageActionId) || getDefaultModelModeForTool("image")
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [upgradeNotice, setUpgradeNotice] = useState<string | null>(null);
  const [canvasAsset, setCanvasAsset] = useState<
    import("@/app/components/studio/canvas-types").CreatorCanvasAsset | null
  >(null);
  const [variantNotice, setVariantNotice] = useState<string | null>(null);

  const selectedModelMode = modelModes.find((m) => m.id === selectedModelModeId);
  const creditCost = resolveToolCreditCostFromInput({
    toolKey: "image",
    modelModeId: selectedModelModeId,
    actionId: imageActionId,
  });
  const modelSelectable = Boolean(selectedModelMode?.canRunGeneration);
  const selectedModelLabel = selectedModelMode?.label ?? "Auto";
  const formatLabel =
    STUDIO_FORMATS.find((f) => f.id === formatId)?.label ?? formatId;

  const canGenerate =
    creditsConfirmed &&
    prompt.trim().length > 0 &&
    !loading &&
    modelSelectable &&
    credits >= creditCost;

  const modelBlockedHint =
    !modelSelectable && selectedModelMode
      ? lang === "de"
        ? "Dieser Modus ist noch nicht verfügbar."
        : "This mode is not available yet."
      : undefined;

  const handleAppendPrompt = useCallback((fragment: string) => {
    setPrompt((current) => appendPromptFragment(current, fragment));
  }, []);

  useEffect(() => {
    saveWorkspaceSession({ lastView: "image" });
  }, []);

  useEffect(() => {
    if (promptHydrated) return;
    consumeResumePromptFlag();
    const saved = getLastPrompt();
    if (saved) {
      setPrompt((current) => (current.trim() ? current : saved));
    }
    setPromptHydrated(true);
  }, [promptHydrated]);

  useEffect(() => {
    const asset = canvasAssetFromPreview(preview, "image");
    if (asset) setCanvasAsset(asset);
  }, [preview]);

  useEffect(() => {
    if (!promptHydrated || !prompt.trim()) return;
    const timer = window.setTimeout(() => {
      saveWorkspaceSession({
        lastView: "image",
        lastPrompt: prompt.trim(),
        lastModel: getApiModelIdForModelMode(selectedModelModeId) ?? selectedModelModeId,
        lastFormat: formatId,
      });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [prompt, selectedModelModeId, formatId, promptHydrated]);

  const handleGenerate = async () => {
    if (!creditsConfirmed) return;

    if (!canGenerate) {
      if (credits < creditCost) {
        openUpsell({
          requiredCredits: creditCost,
          balance: credits,
          modelModeLabel: selectedModelLabel,
          isPremium: selectedModelMode?.isPremium,
        });
      }
      return;
    }
    setLoading(true);
    setIsPreviewOpen(true);
    clearPreviewError();
    setPreviewLoading(
      IMAGE_LOADING_MESSAGES[lang][0] ?? "Creating your image…"
    );

    saveWorkspaceSession({
      lastView: "image",
      lastPrompt: prompt.trim(),
      lastModel: getApiModelIdForModelMode(selectedModelModeId) ?? selectedModelModeId,
      lastFormat: formatId,
    });

    try {
      const token = await getToken();
      if (!token) throw new Error("Session expired");

      const result = await handleGenerateForTool({
        toolKey: "image",
        token,
        prompt: prompt.trim(),
        outputFormat: studioFormatToApi(formatId),
        modelModeId: selectedModelModeId,
        actionId: imageActionId,
        currentLanguage: lang,
      });

      if (!result.success) {
        handleInsufficientCredits(result.status, result.code);
        const msg = formatToolGenerateError(result, lang);
        setPreviewError(msg);
        markGenerationFailed();
        saveWorkspaceSession({
          lastView: "image",
          lastPrompt: prompt.trim(),
          lastModel: getApiModelIdForModelMode(selectedModelModeId) ?? selectedModelModeId,
          lastFormat: formatId,
        });
        return;
      }

      onGenerationQueued({
        creditsSpent:
          typeof result.creditsAfter === "number" ? undefined : creditCost,
        creditsAfter: result.creditsAfter ?? null,
      });
      markRecentAssetGenerated();
      saveWorkspaceSession({
        lastView: "image",
        lastPrompt: prompt.trim(),
        lastModel: getApiModelIdForModelMode(selectedModelModeId) ?? selectedModelModeId,
        lastFormat: formatId,
      });

      if (result.imageUrl) {
        setCanvasAsset({
          url: result.imageUrl,
          outputType: "image",
          prompt: prompt.trim(),
          createdAt: new Date().toISOString(),
          generationId: result.generationId,
          sourceStudio: "image",
          modelModeId: selectedModelModeId,
          creditsUsed: creditCost,
        });
        setSuccess({
          type: "image",
          url: result.imageUrl,
          prompt: prompt.trim(),
          model: selectedModelModeId,
          format: formatId,
          credits: creditCost,
          generationId: result.generationId,
          campaignExpansion: result.campaignExpansion ?? null,
          campaignExpansionWarning: result.campaignExpansionWarning,
        });
        return;
      }

      if (result.generationId) {
        pollGeneration(result.generationId, lang);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Generation failed";
      setPreviewError(msg);
      markGenerationFailed();
    } finally {
      setLoading(false);
    }
  };

  const imageResult =
    preview.status === "success" && preview.result?.type === "image"
      ? preview.result
      : null;

  const handleCampaignUpgrade = useCallback(
    async (action: CampaignUpgradeAction) => {
      const cost = getUpgradeCost(action);
      if (!canRunUpgrade(cost, credits)) {
        openUpsell();
        return;
      }

      const token = await getToken();
      if (!token || !imageResult?.url) return;

      setUpgradeNotice(null);
      const upgradeResult = await runCampaignUpgrade({
        token,
        upgradeAction: action,
        sourceGenerationId: imageResult.generationId,
        script: imageResult.campaignExpansion?.video_script,
        imageUrl: imageResult.url,
        currentLanguage: lang,
      });

      if (!upgradeResult.success) {
        if (upgradeResult.status === 402 || upgradeResult.code === "INSUFFICIENT_CREDITS") {
          openUpsell();
          return;
        }
        if (upgradeResult.code === "KREA_TOOL_NOT_IMPLEMENTED") {
          setUpgradeNotice(
            lang === "de"
              ? "Diese Engine wird gerade angebunden. Es wurden keine Credits abgezogen."
              : "This engine is being connected. No credits were charged."
          );
          return;
        }
        setUpgradeNotice(upgradeResult.error);
      }
    },
    [credits, getToken, imageResult, lang, openUpsell]
  );

  const handleRegenerateWithMode = useCallback(
    (modelModeId: string, nextPrompt: string) => {
      setSelectedModelModeId(modelModeId);
      setPrompt(nextPrompt);
      setIsPreviewOpen(false);
      setVariantNotice(
        lang === "de"
          ? "Modus gewechselt — tippe auf Generieren für die nächste Version."
          : "Mode switched — tap Generate for the next version."
      );
    },
    [lang]
  );

  const expansionInner =
    imageResult?.url ? (
      <>
        <CampaignExpansionPanel
          expansion={imageResult.campaignExpansion ?? null}
          warning={imageResult.campaignExpansionWarning}
          imageUrl={imageResult.url}
          generationId={imageResult.generationId}
          credits={credits}
          isDe={lang === "de"}
          onUpgrade={handleCampaignUpgrade}
        />
        {upgradeNotice ? (
          <p className="mx-auto mt-3 max-w-4xl text-center text-xs text-neutral-400">
            {upgradeNotice}
          </p>
        ) : null}
      </>
    ) : null;

  return (
    <StudioWhiteToolFrame
      layout="guided"
      promptPlacement="top"
      showCommandBar={false}
      isPreviewOpen={isPreviewOpen}
      onPreviewClose={() => setIsPreviewOpen(false)}
      sourceStudio="image"
      getToken={getToken}
      canvasAsset={canvasAsset}
      onCanvasAssetChange={(asset) => {
        setCanvasAsset(asset);
        onGenerationQueued({});
      }}
      variantNotice={variantNotice}
      onVariantNotice={setVariantNotice}
      onCreditsUsed={(payload) => {
        onGenerationQueued({
          creditsAfter: payload?.creditsAfter ?? null,
        });
      }}
      modelModeId={canvasAsset?.modelModeId ?? selectedModelModeId}
      creditsUsed={
        canvasAsset?.creditsUsed ??
        (imageResult?.credits ?? creditCost)
      }
      creditBalance={creditsConfirmed ? credits : undefined}
      onRegenerateWithMode={handleRegenerateWithMode}
      onBuyCredits={openUpsell}
      onUpgrade={() =>
        openUpsell({
          balance: credits,
          requiredCredits: creditCost,
          isPremium: selectedModelMode?.isPremium,
        })
      }
      greetingSlot={<WorkspaceGreeting variant="compact" />}
      commandBox={
        <SmartCommandBox
          value={prompt}
          onChange={setPrompt}
          onGenerate={() => void handleGenerate()}
          onInsufficientCredits={openUpsell}
          isGenerating={loading}
          disabled={!canGenerate}
          submitLabel={
            creditsConfirmed
              ? getGenerateButtonState({
                  creditCost,
                  creditsAvailable: credits,
                  isDe: lang === "de",
                }).label
              : lang === "de"
                ? "Credits werden geladen…"
                : "Loading credits…"
          }
          selectedModelLabel={selectedModelLabel}
          selectedModelCredits={creditCost}
          creditsAvailable={creditsConfirmed ? credits : null}
          currentLanguage={lang}
          formatLabel={formatLabel}
          recommendationText={modelBlockedHint}
          autoFocus
          belowInputSlot={
            <div className="space-y-3 text-left">
              <AiAgentStudio
                prompt={prompt}
                imageMode={selectedModelModeId}
                platform={formatId}
                language={lang}
                availableModelModeIds={modelModes.map((m) => m.id)}
                onUseEnhanced={setPrompt}
                onAutoMode={setSelectedModelModeId}
              />
              <PromptBelowInputArea
                prompt={prompt}
                modelModeId={selectedModelModeId}
                actionId={imageActionId}
                language={lang}
                modelSelectable={modelSelectable}
                onAppendPrompt={handleAppendPrompt}
                onUseImproved={setPrompt}
              />
              <ModeHelpText modelModeId={selectedModelModeId} language={lang} />
            </div>
          }
        />
      }
      intentHintSlot={
        <WorkspaceIntentHint
          prompt={prompt}
          engineLabel={selectedModelLabel}
          formatLabel={formatLabel}
        />
      }
      creditMeter={
        <StudioCreditMeter
          creditCost={creditCost}
          costLabel={selectedModelLabel}
          isPremium={selectedModelMode?.isPremium}
        />
      }
      previewState={preview}
      engineGrid={
        <div className="space-y-3">
          <SelectedModeSummary
            modelModeId={selectedModelModeId}
            modeLabel={selectedModelLabel}
            creditCost={creditCost}
            isPremium={selectedModelMode?.isPremium}
            language={lang}
          />
          <div className="flex items-center justify-between gap-3">
            <ModelModeSelector
              modes={modelModes}
              selectedId={selectedModelModeId}
              onSelect={setSelectedModelModeId}
              language={lang}
              onUpgradeClick={openUpsell}
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
      expansionSlot={expansionInner}
    />
  );
}

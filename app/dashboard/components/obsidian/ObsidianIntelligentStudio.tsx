"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { canvasAssetFromPreview } from "@/lib/dashboard/studio-white/preview";
import {
  markGenerationFailed,
  markRecentAssetGenerated,
} from "@/lib/dashboard/workspace-persistence";
import {
  handleGenerateForTool,
  resolveToolCreditCostFromInput,
  getDefaultModelModeForTool,
} from "@/lib/dashboard/tool-generate";
import {
  getDefaultModelModeIdForAction,
  getPrimaryModelModesForAction,
} from "@/app/lib/model-modes/get-visible-model-modes";
import { getModelModeDisplayLabel } from "@/app/lib/model-modes/mode-display-label";
import { getCreateImageToolCopy, getCreateMotionVideoToolCopy } from "@/app/lib/tools/creator-tools";
import { appendPresetFragment } from "@/app/lib/presets/preset-utils";
import { getVideoPreset } from "@/app/lib/presets/video-presets";
import PromptBelowInputArea from "@/app/components/studio/PromptBelowInputArea";
import AiAgentStudio from "@/app/dashboard/AiAgentStudio";
import CreatePageHeader from "./CreatePageHeader";
import { appendPromptFragment } from "@/app/lib/presets/prompt-chips";
import { studioFormatToApi } from "@/lib/dashboard/studio-white/formats";
import type { StudioFormatId } from "@/lib/dashboard/v2/constants";
import { STUDIO_FORMATS } from "@/lib/dashboard/v2/constants";
import { useWorkspaceGeneration } from "@/app/dashboard/hooks/useWorkspaceGeneration";
import { useLanguage } from "@/hooks/useLanguage";
import { useCreativeSuite } from "../creative-suite/CreativeSuiteProvider";
import { useStudioUpsell } from "../studio-white/StudioUpsellProvider";
import StudioWhiteToolFrame from "../studio-white/StudioWhiteToolFrame";
import FormatAspectGrid from "../studio-white/FormatAspectGrid";
import StickyCreditCostBar from "@/app/components/studio/StickyCreditCostBar";
import DurationPills from "./DurationPills";
import SmartCommandBox from "@/components/dashboard/SmartCommandBox";
import {
  CREATE_PAGE,
  formatCreatePageError,
  getGenerateButtonState,
  IMAGE_LOADING_MESSAGES,
  VIDEO_LOADING_MESSAGES,
  type CreateOnboardingGoalId,
} from "@/lib/copy/launch-user-copy";
import { getLaunchDefaultDashboardAction } from "@/app/lib/config/launch";
import {
  areCreditsConfirmed,
  creditBalanceForPaidActions,
} from "@/lib/billing/credit-ui-state";
import { getLaunchHomeEngines } from "@/app/lib/config/launch-nav";
import type { ObsidianEngineId } from "@/lib/obsidian/dashboard-tokens";
import CreateOnboardingPanel from "./CreateOnboardingPanel";
import AgentPackGeneratorPanel from "@/app/components/studio/AgentPackGeneratorPanel";
import type {
  AgentPackGeneratorPanelHandle,
  PackOverlayControlState,
} from "@/lib/studio/pack-overlay-control";
import HooksCaptionsPanel from "@/app/components/studio/HooksCaptionsPanel";
import ExportPackPanel from "@/app/components/studio/ExportPackPanel";
import {
  resolveCreatorTool,
  type ResolvedCreatorTool,
} from "@/app/lib/tools/resolve-tool";
import type {
  CreatorToolboxGroupId,
  CreatorToolId,
} from "@/app/lib/tools/creator-tools";
import { isToolDetailPanelStatus } from "@/app/lib/tools/creator-tools";
import StudioWorkspaceShell from "@/app/components/studio/StudioWorkspaceShell";
import ContextActionBar from "@/app/components/studio/ContextActionBar";
import AgentPromptWorkspace from "@/app/components/studio/AgentPromptWorkspace";
import AgentWorkspaceCreditPreview from "@/app/components/studio/AgentWorkspaceCreditPreview";
import AgentWorkflowPanel from "@/app/components/studio/AgentWorkflowPanel";
import type { AgentWorkflowMode } from "@/app/lib/agent/agent-workflow";
import { STUDIO_CATEGORY_COPY } from "@/app/lib/studio/studio-categories";
import { getObsidianEngineLabel } from "@/lib/obsidian/dashboard-tokens";
import CategoryWorkspaceHint from "@/app/components/studio/CategoryWorkspaceHint";
import ToolDetailPanel from "@/app/components/studio/ToolDetailPanel";
import type { ToolboxLaunchResult } from "@/app/components/studio/CreatorToolbox";
import {
  getToolboxWorkflowRoute,
  scrollToToolboxPanel,
  TOOLBOX_ASSET_REQUIRED_COPY,
} from "@/app/lib/tools/toolbox-workflow-routing";
import { getHooksCaptionsUiCopy } from "@/app/lib/copy/hooks-captions";
import { getExportPackUiCopy } from "@/app/lib/export/export-pack";
import {
  formatPackRenderCta,
  getSocialAssetPackCopy,
  getSocialAssetPackTotalCredits,
} from "@/app/lib/packs/social-asset-pack";
import GeneratorOverlay from "@/app/components/studio/GeneratorOverlay";
import GeneratorOverlayHeader from "@/app/components/studio/GeneratorOverlayHeader";
import GeneratorOverlayFooter from "@/app/components/studio/GeneratorOverlayFooter";
import AgentGeneratorStage from "@/app/components/studio/AgentGeneratorStage";
import GeneratorOverlayTimeline from "@/app/components/studio/GeneratorOverlayTimeline";
import { getDashboardCommandCopy } from "@/lib/studio/dashboard-command-copy";
import CreateImageOverlayControls from "@/app/components/studio/CreateImageOverlayControls";
import CreateMotionVideoOverlayControls from "@/app/components/studio/CreateMotionVideoOverlayControls";
import { buildStudioCategoryToolView } from "@/app/lib/studio/studio-categories";
import {
  formatDashboardCreditsBadge,
  getDashboardStatusBadgeLabel,
} from "@/lib/studio/dashboard-tool-badges";

export type ObsidianIntelligentStudioProps = {
  /** Generator opens in focus overlay — calmer dashboard behind. */
  overlayMode?: boolean;
  initialToolId?: CreatorToolId | null;
  /** Prefill from dashboard command surface idea box. */
  initialPrompt?: string;
  onOverlayClose?: () => void;
  /** Focus target when the overlay closes (dashboard tool button). */
  returnFocusRef?: RefObject<HTMLElement | null>;
};

export default function ObsidianIntelligentStudio({
  overlayMode = false,
  initialToolId = null,
  initialPrompt = "",
  onOverlayClose,
  returnFocusRef,
}: ObsidianIntelligentStudioProps = {}) {
  const { isDe, language } = useLanguage();
  const lang = language === "de" ? "de" : "en";
  const {
    credits,
    creditsLoading,
    creditsError,
    onGenerationQueued,
  } = useCreativeSuite();
  const creditsConfirmed = areCreditsConfirmed(creditsLoading, creditsError);
  const confirmedBalance = creditBalanceForPaidActions(
    creditsLoading,
    creditsError,
    credits
  );
  const { handleInsufficientCredits, openUpsell } = useStudioUpsell();
  const supabase = createClient();

  const homeEngines = useMemo(() => getLaunchHomeEngines(), []);
  const packEngine = homeEngines.find((e) => e.id === "social-asset-pack")!;
  const imageEngine = homeEngines.find((e) => e.id === "create-image")!;
  const videoEngine = homeEngines.find((e) => e.id === "create-video")!;

  const scrollToPackPanel = useCallback(() => {
    document
      .getElementById("social-asset-pack-panel")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);
  const [selectedEngine, setSelectedEngine] = useState<ObsidianEngineId>(
    () => getLaunchDefaultDashboardAction()
  );
  const engine =
    homeEngines.find((e) => e.id === selectedEngine) ?? homeEngines[0]!;
  const isHooksCaptionsWorkflow = selectedEngine === "hooks-captions";
  const isExportPackWorkflow = selectedEngine === "export-pack";
  const isOptimizeWorkflow = isHooksCaptionsWorkflow || isExportPackWorkflow;
  const isPackWorkflow =
    !isOptimizeWorkflow && engine.toolKey === "pack";
  const isVideoEngine =
    !isOptimizeWorkflow && !isPackWorkflow && engine.toolKey === "video";
  const isImageEngine =
    !isOptimizeWorkflow && !isPackWorkflow && !isVideoEngine;
  const createImageCopy = isImageEngine ? getCreateImageToolCopy(lang) : null;
  const createMotionVideoCopy = isVideoEngine
    ? getCreateMotionVideoToolCopy(lang)
    : null;
  const actionId = isVideoEngine ? "create_video" : "create_image";
  const toolKey = isVideoEngine ? "video" : "image";
  const sourceStudio = isVideoEngine ? "video" : "image";
  const packCopy = getSocialAssetPackCopy(lang);
  const hooksCaptionsCopy = getHooksCaptionsUiCopy(lang);
  const exportPackCopy = getExportPackUiCopy(lang);
  const packCredits = getSocialAssetPackTotalCredits();

  const modelModes = useMemo(
    () => getPrimaryModelModesForAction(actionId),
    [actionId]
  );

  const [selectedModelModeId, setSelectedModelModeId] = useState(
    () =>
      getDefaultModelModeIdForAction("create_image") ||
      getDefaultModelModeForTool("image")
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedMotionPresetId, setSelectedMotionPresetId] = useState<
    string | null
  >(null);
  const [prompt, setPrompt] = useState("");
  const [formatId, setFormatId] = useState<StudioFormatId>("square");
  const [videoDuration, setVideoDuration] = useState<5 | 10>(5);
  const [loading, setLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [hasGenerations, setHasGenerations] = useState<boolean | null>(null);
  const [onboardingGoalId, setOnboardingGoalId] =
    useState<CreateOnboardingGoalId | null>(null);
  const [canvasAsset, setCanvasAsset] = useState<
    import("@/app/components/studio/canvas-types").CreatorCanvasAsset | null
  >(null);
  const [canvasInitialAction, setCanvasInitialAction] = useState<
    "variant" | "score" | null
  >(null);
  const [variantNotice, setVariantNotice] = useState<string | null>(null);
  const [loadingTick, setLoadingTick] = useState(0);
  const [selectedCategory, setSelectedCategory] =
    useState<CreatorToolboxGroupId>("create");
  const [detailTool, setDetailTool] = useState<ResolvedCreatorTool | null>(null);
  const [detailLaunchContext, setDetailLaunchContext] = useState<string | null>(
    null
  );
  const packPanelRef = useRef<AgentPackGeneratorPanelHandle>(null);
  const [packControl, setPackControl] = useState<PackOverlayControlState | null>(
    null
  );

  const handlePackControlStateChange = useCallback(
    (state: PackOverlayControlState) => {
      setPackControl(state);
    },
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

  useEffect(() => {
    const isHomeEngine = homeEngines.some((e) => e.id === selectedEngine);
    const isOptimizeEngine =
      selectedEngine === "hooks-captions" || selectedEngine === "export-pack";
    if (!isHomeEngine && !isOptimizeEngine && homeEngines[0]) {
      setSelectedEngine(homeEngines[0].id);
    }
  }, [homeEngines, selectedEngine]);

  useEffect(() => {
    if (isPackWorkflow || isOptimizeWorkflow) return;
    const defaultId =
      getDefaultModelModeIdForAction(actionId) ||
      getDefaultModelModeForTool(toolKey);
    if (defaultId) setSelectedModelModeId(defaultId);
    setFormatId(isVideoEngine ? "vertical" : "square");
    setSelectedMotionPresetId(null);
  }, [actionId, isVideoEngine, toolKey, isPackWorkflow, isOptimizeWorkflow]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session || cancelled) return;
      const { count, error } = await supabase
        .from("generations")
        .select("id", { count: "exact", head: true })
        .eq("user_id", session.user.id);
      if (cancelled) return;
      if (error) {
        setHasGenerations(null);
        return;
      }
      setHasGenerations((count ?? 0) > 0);
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  useEffect(() => {
    const asset = canvasAssetFromPreview(preview, toolKey);
    if (asset) setCanvasAsset(asset);
  }, [preview, toolKey]);

  useEffect(() => {
    if (preview.status !== "loading") return;
    const messages = isVideoEngine
      ? VIDEO_LOADING_MESSAGES[lang]
      : IMAGE_LOADING_MESSAGES[lang];
    setPreviewLoading(messages[0] ?? "");
    const id = window.setInterval(() => {
      setLoadingTick((t) => t + 1);
    }, 3200);
    return () => window.clearInterval(id);
  }, [preview.status, isVideoEngine, lang, setPreviewLoading]);

  useEffect(() => {
    if (preview.status !== "loading") return;
    const messages = isVideoEngine
      ? VIDEO_LOADING_MESSAGES[lang]
      : IMAGE_LOADING_MESSAGES[lang];
    setPreviewLoading(
      messages[loadingTick % messages.length] ?? messages[0] ?? ""
    );
  }, [loadingTick, preview.status, isVideoEngine, lang, setPreviewLoading]);

  const selectedModelMode = modelModes.find((m) => m.id === selectedModelModeId);
  const selectedMotionPresetLabel =
    overlayMode && isVideoEngine && selectedMotionPresetId
      ? (() => {
          const preset = getVideoPreset(selectedMotionPresetId);
          return preset ? (isDe ? preset.label.de : preset.label.en) : null;
        })()
      : null;
  const selectedModelLabel = isExportPackWorkflow
    ? exportPackCopy.title
    : isHooksCaptionsWorkflow
      ? hooksCaptionsCopy.title
      : isPackWorkflow
        ? packCopy.title
        : selectedMotionPresetLabel ??
          (selectedModelMode
            ? getModelModeDisplayLabel(selectedModelMode, lang)
            : isVideoEngine
              ? "Auto Video"
              : isDe
                ? "Auto"
                : "Auto");
  const formatLabel =
    STUDIO_FORMATS.find((f) => f.id === formatId)?.label ?? formatId;

  const creditCost = isOptimizeWorkflow
    ? 0
    : isPackWorkflow
      ? packCredits
      : resolveToolCreditCostFromInput({
          toolKey,
          modelModeId: selectedModelModeId,
          actionId,
          durationSeconds: isVideoEngine ? videoDuration : undefined,
        });

  const modelSelectable = isPackWorkflow || isOptimizeWorkflow
    ? true
    : Boolean(selectedModelMode?.canRunGeneration);
  const modelBlockedHint =
    isPackWorkflow || isOptimizeWorkflow
      ? undefined
      : !modelSelectable && selectedModelMode
        ? lang === "de"
          ? "Dieser Modus ist noch nicht verfügbar."
          : "This mode is not available yet."
        : undefined;

  const buttonState = creditsConfirmed
    ? getGenerateButtonState({
        creditCost,
        creditsAvailable: credits,
        isDe,
        isVideo: isVideoEngine,
      })
    : {
        label: isDe ? "Credits werden geladen…" : "Loading credits…",
        canGenerate: false,
        insufficient: false,
      };

  const canGenerate =
    creditsConfirmed &&
    !isPackWorkflow &&
    !isOptimizeWorkflow &&
    prompt.trim().length > 0 &&
    !loading &&
    modelSelectable &&
    buttonState.canGenerate;

  const durationOptions = useMemo(
    () =>
      ([5, 10] as const).map((seconds) => ({
        seconds,
        credits: creditCost,
      })),
    [creditCost]
  );

  const promptPlaceholder = isExportPackWorkflow
    ? exportPackCopy.promptHint
    : isHooksCaptionsWorkflow
      ? hooksCaptionsCopy.promptHint
      : isDe
        ? CREATE_PAGE.promptPlaceholder.de
        : CREATE_PAGE.promptPlaceholder.en;

  const handleOnboardingGoalSelect = useCallback(
    ({ goalId, prompt: goalPrompt }: { goalId: CreateOnboardingGoalId; prompt: string }) => {
      setOnboardingGoalId(goalId);
      setPrompt(goalPrompt);
      setSelectedEngine("social-asset-pack");
    },
    []
  );

  const handlePreviewPackFromOnboarding = useCallback(() => {
    setSelectedEngine("social-asset-pack");
    scrollToPackPanel();
  }, [scrollToPackPanel]);

  const handleAppendPrompt = useCallback((fragment: string) => {
    setPrompt((current) => appendPromptFragment(current, fragment));
  }, []);

  const handleSelectMotionPreset = useCallback(
    (presetId: string) => {
      setSelectedMotionPresetId(presetId);
      setPrompt((current) =>
        appendPresetFragment(current, presetId, selectedModelModeId, lang)
      );
    },
    [selectedModelModeId, lang]
  );

  const activeCanvasAsset = useMemo(
    () =>
      canvasAsset ??
      canvasAssetFromPreview(preview, sourceStudio, {
        modelModeId: selectedModelModeId,
        creditsUsed: creditCost,
      }),
    [canvasAsset, preview, sourceStudio, selectedModelModeId, creditCost]
  );

  const initialToolAppliedRef = useRef(false);

  const handleToolboxToolLaunch = useCallback(
    (resolved: ResolvedCreatorTool): ToolboxLaunchResult => {
      const route = getToolboxWorkflowRoute(resolved.tool.id);
      if (!route) return { launched: false };

      if (route.kind === "creative_score") {
        setSelectedCategory("optimize");
        if (!activeCanvasAsset?.url) {
          const copy = TOOLBOX_ASSET_REQUIRED_COPY.check_creative_score;
          return {
            launched: false,
            launchContext: isDe ? copy?.de : copy?.en,
          };
        }
        setCanvasInitialAction(null);
        requestAnimationFrame(() => setCanvasInitialAction("score"));
        scrollToToolboxPanel(route.panelId);
        return { launched: true };
      }

      if (
        route.engineId === "hooks-captions" ||
        route.engineId === "export-pack"
      ) {
        setSelectedCategory("optimize");
      } else {
        setSelectedCategory("create");
      }

      setSelectedEngine(route.engineId);
      const panelId = route.panelId;
      if (panelId) {
        requestAnimationFrame(() => scrollToToolboxPanel(panelId));
      }
      return { launched: true };
    },
    [activeCanvasAsset?.url, isDe]
  );

  useEffect(() => {
    initialToolAppliedRef.current = false;
  }, [initialToolId]);

  useEffect(() => {
    if (!overlayMode || !initialToolId || initialToolAppliedRef.current) {
      return;
    }
    const resolved = resolveCreatorTool(initialToolId, { language: lang });
    if (!resolved) return;
    initialToolAppliedRef.current = true;
    handleToolboxToolLaunch(resolved);
  }, [overlayMode, initialToolId, lang, handleToolboxToolLaunch]);

  useEffect(() => {
    if (!overlayMode || !initialPrompt.trim()) return;
    setPrompt(initialPrompt.trim());
  }, [overlayMode, initialPrompt]);

  const handleContextToolSelect = useCallback((resolved: ResolvedCreatorTool) => {
    setDetailTool(resolved);
    setDetailLaunchContext(null);
  }, []);

  const showCreateEngineContent =
    selectedCategory === "create" &&
    (isPackWorkflow || isImageEngine || isVideoEngine);
  const showOptimizeEngineContent =
    selectedCategory === "optimize" && isOptimizeWorkflow;
  const isImageOverlayLayout = overlayMode && isImageEngine;
  const isVideoOverlayLayout = overlayMode && isVideoEngine;
  const isCreateOverlayLayout = isImageOverlayLayout || isVideoOverlayLayout;

  const createImageModeControls = isImageEngine ? (
    <CreateImageOverlayControls
      language={lang}
      modelModes={modelModes}
      selectedModelModeId={selectedModelModeId}
      selectedModelMode={selectedModelMode}
      creditCost={creditCost}
      formatId={formatId}
      onSelectModelMode={setSelectedModelModeId}
      onFormatChange={setFormatId}
      drawerOpen={drawerOpen}
      onDrawerOpenChange={setDrawerOpen}
      onUpgradeClick={openUpsell}
      showToolIntro={!isImageOverlayLayout}
      createImageCopy={createImageCopy}
    />
  ) : null;

  const createMotionVideoModeControls = isVideoEngine ? (
    <CreateMotionVideoOverlayControls
      language={lang}
      modelModes={modelModes}
      selectedModelModeId={selectedModelModeId}
      selectedModelMode={selectedModelMode}
      creditCost={creditCost}
      formatId={formatId}
      videoDuration={videoDuration}
      durationOptions={durationOptions}
      selectedMotionPresetId={selectedMotionPresetId}
      onSelectModelMode={setSelectedModelModeId}
      onFormatChange={setFormatId}
      onDurationChange={setVideoDuration}
      onSelectMotionPreset={handleSelectMotionPreset}
      drawerOpen={drawerOpen}
      onDrawerOpenChange={setDrawerOpen}
      onUpgradeClick={openUpsell}
      compact={isVideoOverlayLayout}
      showToolIntro={!isVideoOverlayLayout}
      createMotionVideoCopy={createMotionVideoCopy}
    />
  ) : null;

  const engineGridContent =
    showCreateEngineContent || showOptimizeEngineContent ? (
      isExportPackWorkflow ? (
        <ExportPackPanel
          prompt={prompt}
          language={lang}
          getAccessToken={getToken}
          showHeader={false}
          className="scroll-mt-24"
        />
      ) : isHooksCaptionsWorkflow ? (
        <HooksCaptionsPanel
          prompt={prompt}
          language={lang}
          showHeader={false}
          className="scroll-mt-24"
        />
      ) : isPackWorkflow ? (
        <AgentPackGeneratorPanel
          prompt={prompt}
          onPromptChange={setPrompt}
          language={lang}
          creditBalance={confirmedBalance}
          getAccessToken={getToken}
          onUseImprovedPrompt={setPrompt}
          onInsufficientCredits={() =>
            openUpsell({
              balance: credits,
              requiredCredits: packCredits,
            })
          }
          onRenderComplete={() => onGenerationQueued({})}
          showHeader={false}
          className="scroll-mt-24 min-h-[min(100dvh,920px)]"
        />
      ) : (
        <div className="space-y-3">
          {isImageEngine && !isImageOverlayLayout
            ? createImageModeControls
            : null}
          {isVideoEngine && !isVideoOverlayLayout
            ? createMotionVideoModeControls
            : null}
        </div>
      )
    ) : (
      <CategoryWorkspaceHint categoryId={selectedCategory} language={lang} />
    );

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
    setLoadingTick(0);
    const loadingMessages = isVideoEngine
      ? VIDEO_LOADING_MESSAGES[lang]
      : IMAGE_LOADING_MESSAGES[lang];
    setPreviewLoading(loadingMessages[0] ?? "");

    try {
      const token = await getToken();
      if (!token) throw new Error("Session expired");

      const result = await handleGenerateForTool({
        toolKey,
        token,
        prompt: prompt.trim(),
        motionInstruction: isVideoEngine ? prompt.trim() : undefined,
        outputFormat: studioFormatToApi(formatId),
        modelModeId: selectedModelModeId,
        actionId,
        durationSeconds: isVideoEngine ? videoDuration : undefined,
        currentLanguage: lang,
      });

      if (!result.success) {
        handleInsufficientCredits(result.status, result.code);
        setPreviewError(
          formatCreatePageError(
            {
              error: result.error,
              code: result.code,
              status: result.status,
              refunded: result.reason === "refunded",
            },
            lang
          )
        );
        markGenerationFailed();
        return;
      }

      onGenerationQueued({
        creditsSpent:
          typeof result.creditsAfter === "number" ? undefined : creditCost,
        creditsAfter: result.creditsAfter ?? null,
      });
      markRecentAssetGenerated();

      const assetUrl = result.imageUrl ?? result.videoUrl;
      if (assetUrl) {
        setCanvasAsset({
          url: assetUrl,
          outputType: isVideoEngine ? "video" : "image",
          prompt: prompt.trim(),
          createdAt: new Date().toISOString(),
          generationId: result.generationId,
          sourceStudio,
          modelModeId: selectedModelModeId,
          creditsUsed: creditCost,
        });
        setSuccess({
          type: isVideoEngine ? "video" : "image",
          url: assetUrl,
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
    } catch {
      setPreviewError(
        formatCreatePageError({}, lang)
      );
      markGenerationFailed();
    } finally {
      setLoading(false);
    }
  };

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

  const previewError =
    preview.status === "error"
      ? preview.message
      : null;

  const stickyWorkflow = isExportPackWorkflow
    ? "export"
    : isHooksCaptionsWorkflow
      ? "copy"
      : isPackWorkflow
        ? "pack"
        : isVideoEngine
          ? "video"
          : "image";
  const packRenderCta = formatPackRenderCta(packCredits, lang);
  const stickyActionDisabled = isExportPackWorkflow
    ? false
    : isHooksCaptionsWorkflow
      ? prompt.trim().length < 3
      : isPackWorkflow
        ? prompt.trim().length < 3
        : !prompt.trim().length || !modelSelectable;

  function handleStickyPrimaryAction() {
    if (isExportPackWorkflow) {
      document
        .getElementById("export-pack-panel")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (isHooksCaptionsWorkflow) {
      document
        .getElementById("hooks-captions-panel")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (isPackWorkflow) {
      document
        .getElementById("social-asset-pack-panel")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    void handleGenerate();
  }

  const stickyCreditBar = (
    <StickyCreditCostBar
      variant="docked"
      modeLabel={selectedModelLabel}
      creditCost={creditCost}
      creditBalance={credits}
      creditsConfirmed={creditsConfirmed}
      language={lang}
      workflow={stickyWorkflow}
      packCtaLabel={packRenderCta}
      isGenerating={loading}
      actionDisabled={stickyActionDisabled}
      onPrimaryAction={handleStickyPrimaryAction}
      onBuyCredits={() =>
        openUpsell({
          balance: credits,
          requiredCredits: creditCost,
          modelModeLabel: selectedModelLabel,
          isPremium: selectedModelMode?.isPremium,
        })
      }
    />
  );

  const workspaceToolLabel = useMemo(() => {
    if (isPackWorkflow) {
      return getObsidianEngineLabel(packEngine, lang);
    }
    if (isHooksCaptionsWorkflow) {
      return hooksCaptionsCopy.title;
    }
    if (isExportPackWorkflow) {
      return exportPackCopy.title;
    }
    if (isImageEngine && createImageCopy) {
      return createImageCopy.label;
    }
    if (isVideoEngine && createMotionVideoCopy) {
      return createMotionVideoCopy.label;
    }
    const category = STUDIO_CATEGORY_COPY[selectedCategory];
    return isDe ? category.labelDe : category.labelEn;
  }, [
    isPackWorkflow,
    isHooksCaptionsWorkflow,
    isExportPackWorkflow,
    isImageEngine,
    isVideoEngine,
    createImageCopy,
    createMotionVideoCopy,
    packEngine,
    hooksCaptionsCopy.title,
    exportPackCopy.title,
    selectedCategory,
    lang,
    isDe,
  ]);

  const workspaceToolDescription = useMemo(() => {
    if (isPackWorkflow) {
      return isDe ? packEngine.descriptionDe : packEngine.descriptionEn;
    }
    if (isHooksCaptionsWorkflow) {
      return hooksCaptionsCopy.description;
    }
    if (isExportPackWorkflow) {
      return exportPackCopy.description;
    }
    if (isImageEngine && createImageCopy) {
      return createImageCopy.description;
    }
    if (isVideoEngine && createMotionVideoCopy) {
      return createMotionVideoCopy.description;
    }
    const category = STUDIO_CATEGORY_COPY[selectedCategory];
    return isDe ? category.descriptionDe : category.descriptionEn;
  }, [
    isPackWorkflow,
    isHooksCaptionsWorkflow,
    isExportPackWorkflow,
    isImageEngine,
    isVideoEngine,
    createImageCopy,
    createMotionVideoCopy,
    packEngine,
    hooksCaptionsCopy.description,
    exportPackCopy.description,
    selectedCategory,
    isDe,
  ]);

  const packWorkspaceAgentMode: AgentWorkflowMode = useMemo(() => {
    if (!isPackWorkflow) return "idle";
    return prompt.trim().length >= 3 ? "planning" : "idle";
  }, [isPackWorkflow, prompt]);

  const overlayToolView = useMemo(() => {
    if (!initialToolId) return null;
    const resolved = resolveCreatorTool(initialToolId, { language: lang });
    if (!resolved) return null;
    return buildStudioCategoryToolView(
      resolved,
      resolved.tool.toolboxGroup,
      lang
    );
  }, [initialToolId, lang]);

  const overlayHeaderCostLabel = useMemo(() => {
    if (overlayToolView) {
      return formatDashboardCreditsBadge(overlayToolView, lang);
    }
    if (isPackWorkflow) {
      const n = packCredits.toLocaleString(isDe ? "de-DE" : "en-US");
      return isDe ? `${n} Credits` : `${n} credits`;
    }
    if (!isOptimizeWorkflow && creditCost > 0) {
      const n = creditCost.toLocaleString(isDe ? "de-DE" : "en-US");
      return isDe ? `${n} Credits` : `${n} credits`;
    }
    return null;
  }, [
    overlayToolView,
    isPackWorkflow,
    isOptimizeWorkflow,
    packCredits,
    creditCost,
    lang,
    isDe,
  ]);

  const overlayHeaderStatusLabel = useMemo(() => {
    if (overlayHeaderCostLabel) return null;
    if (overlayToolView) {
      return getDashboardStatusBadgeLabel(overlayToolView.status, lang);
    }
    return null;
  }, [overlayHeaderCostLabel, overlayToolView, lang]);

  const selectedContextToolId = useMemo((): CreatorToolId | null => {
    const byEngine: Record<string, CreatorToolId> = {
      "social-asset-pack": "social_asset_pack",
      "create-image": "create_image",
      "create-video": "create_video",
      "hooks-captions": "hooks_captions",
      "export-pack": "export_pack",
    };
    return byEngine[selectedEngine] ?? null;
  }, [selectedEngine]);

  const contextToolLaunch = useCallback(
    (resolved: ResolvedCreatorTool): ToolboxLaunchResult => {
      const result = handleToolboxToolLaunch(resolved);
      if (!result.launched && result.launchContext) {
        setDetailTool(resolved);
        setDetailLaunchContext(result.launchContext);
      } else if (
        !result.launched &&
        isToolDetailPanelStatus(resolved.status)
      ) {
        setDetailTool(resolved);
        setDetailLaunchContext(null);
      }
      return result;
    },
    [handleToolboxToolLaunch]
  );

  const isPackOverlayBusy = Boolean(
    overlayMode && isPackWorkflow && packControl?.busy
  );
  const isRenderInProgress =
    loading || preview.status === "loading" || isPackOverlayBusy;

  const overlayPromptPlaceholder = getDashboardCommandCopy(lang).promptPlaceholder;

  const generatorPromptSlot = (
    <div
      data-generator-overlay-initial-focus
      className={
        overlayMode
          ? "min-w-0 [&_section]:mx-0 [&_section]:max-w-none [&_textarea]:min-h-[6.5rem] [&_textarea]:py-4 [&_textarea]:text-base [&_textarea]:sm:min-h-[7.5rem] [&>div>div]:rounded-xl [&>div>div]:border-[rgba(255,165,0,0.18)] [&>div>div]:bg-[#141414] [&>div>div]:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] [&>div>div]:focus-within:border-amber-500/45 [&>div>div]:focus-within:shadow-[0_0_28px_rgba(245,158,11,0.14)]"
          : "min-w-0"
      }
    >
    <SmartCommandBox
      value={prompt}
      onChange={setPrompt}
      onGenerate={() => void handleGenerate()}
      onInsufficientCredits={openUpsell}
      isGenerating={loading}
      disabled={
        isExportPackWorkflow
          ? false
          : isHooksCaptionsWorkflow
            ? prompt.trim().length < 3 || loading
            : !prompt.trim().length ||
              loading ||
              (!isPackWorkflow && !modelSelectable)
      }
      submitLabel={isPackWorkflow ? undefined : buttonState.label}
      selectedModelLabel={selectedModelLabel}
      selectedModelCredits={creditCost}
      creditsAvailable={creditsConfirmed ? credits : null}
      currentLanguage={lang}
      placeholder={overlayMode ? overlayPromptPlaceholder : promptPlaceholder}
      formatLabel={isPackWorkflow ? undefined : formatLabel}
      recommendationText={modelBlockedHint}
      hideHeader
      hideSubmit
      autoFocus
      enableTypewriterGhost={true}
    />
    </div>
  );

  const availableModelModeIds = useMemo(
    () => modelModes.map((m) => m.id),
    [modelModes]
  );

  const generatorPromptAssistSlot =
    isPackWorkflow || isOptimizeWorkflow ? null : (
      <div className="space-y-3 text-left">
        <AiAgentStudio
          prompt={prompt}
          imageMode={selectedModelModeId}
          platform={formatId}
          language={lang}
          availableModelModeIds={availableModelModeIds}
          onUseEnhanced={setPrompt}
          onAutoMode={setSelectedModelModeId}
        />
        <PromptBelowInputArea
          prompt={prompt}
          modelModeId={selectedModelModeId}
          actionId={actionId}
          language={lang}
          modelSelectable={modelSelectable}
          onAppendPrompt={handleAppendPrompt}
          onUseImproved={setPrompt}
        />
      </div>
    );

  const generatorAgentStepsSlot = overlayMode ? (
    <GeneratorOverlayTimeline
      language={lang}
      mode={
        isPackWorkflow
          ? packWorkspaceAgentMode
          : prompt.trim().length >= 3
            ? "planning"
            : "idle"
      }
    />
  ) : isPackWorkflow && selectedCategory === "create" ? (
    <AgentWorkflowPanel
      language={lang}
      mode={packWorkspaceAgentMode}
      showHeader={false}
      className="border-neutral-800/80 bg-[#0a0a0a]/40"
    />
  ) : null;

  const studioPreviewFrame = (
    <StudioWhiteToolFrame
      className="flex min-h-0 w-full flex-col px-1 pb-2 pt-1 sm:px-2"
      layout="guided"
      promptPlacement="top"
      showCommandBar={false}
      persistentPreview
      showPreviewClosedHint={false}
      canvasInitialAction={canvasInitialAction}
      isPreviewOpen={isPreviewOpen}
      onPreviewClose={() => setIsPreviewOpen(false)}
      sourceStudio={sourceStudio}
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
      creditsUsed={canvasAsset?.creditsUsed ?? creditCost}
      creditBalance={creditsConfirmed ? credits : undefined}
      onRegenerateWithMode={handleRegenerateWithMode}
      onBuyCredits={openUpsell}
      onUpgrade={() =>
        openUpsell({
          balance: credits,
          requiredCredits: creditCost,
          isPremium: true,
        })
      }
      engineGrid={isCreateOverlayLayout ? undefined : engineGridContent}
      formatGrid={
        showCreateEngineContent &&
        !isPackWorkflow &&
        !isOptimizeWorkflow &&
        !isCreateOverlayLayout ? (
          <FormatAspectGrid selectedId={formatId} onSelect={setFormatId} />
        ) : undefined
      }
      durationRow={
        showCreateEngineContent && isVideoEngine && !isVideoOverlayLayout ? (
          <DurationPills
            value={videoDuration}
            onChange={setVideoDuration}
            options={durationOptions}
          />
        ) : undefined
      }
      previewState={preview}
    />
  );

  const generatorSettingsSlot = isImageOverlayLayout
    ? createImageModeControls
    : isVideoOverlayLayout
      ? createMotionVideoModeControls
      : null;

  const generatorPreviewSlot = studioPreviewFrame;

  if (overlayMode && isPackWorkflow) {
    return (
      <AgentPackGeneratorPanel
        ref={packPanelRef}
        prompt={prompt}
        onPromptChange={setPrompt}
        language={lang}
        creditBalance={confirmedBalance}
        getAccessToken={getToken}
        onUseImprovedPrompt={setPrompt}
        onInsufficientCredits={() =>
          openUpsell({
            balance: credits,
            requiredCredits: packCredits,
          })
        }
        onRenderComplete={() => onGenerationQueued({})}
        showHeader
        headerTitle={workspaceToolLabel}
        onClose={() => onOverlayClose?.()}
        controlSurface="overlay"
        className="fixed inset-0 z-[80]"
        onPackControlStateChange={handlePackControlStateChange}
      />
    );
  }

  if (overlayMode) {
    return (
      <GeneratorOverlay
        open
        language={lang}
        isRenderInProgress={isRenderInProgress}
        isGenerating={isRenderInProgress}
        returnFocusRef={returnFocusRef}
        onOpenChange={(next) => {
          if (!next) onOverlayClose?.();
        }}
        header={
          <GeneratorOverlayHeader
            toolName={workspaceToolLabel}
            toolId={initialToolId ?? selectedContextToolId}
            language={lang}
            costLabel={overlayHeaderCostLabel}
            statusLabel={overlayHeaderStatusLabel}
            statusTone={overlayToolView?.status ?? "preview"}
            closeDisabled={isRenderInProgress}
            onClose={() => onOverlayClose?.()}
          />
        }
        footer={
          <GeneratorOverlayFooter
            language={lang}
            modeLabel={selectedModelLabel}
            creditCost={isPackWorkflow ? packCredits : creditCost}
            creditBalance={credits}
            creditsConfirmed={creditsConfirmed}
            workflow={stickyWorkflow}
            packCtaLabel={packRenderCta}
            isGenerating={isPackWorkflow ? isPackOverlayBusy : loading}
            actionDisabled={
              isPackWorkflow
                ? !packControl?.canRender
                : stickyActionDisabled
            }
            onPrimaryAction={() => {
              if (isPackWorkflow) {
                packPanelRef.current?.runRender();
                return;
              }
              if (isImageEngine || isVideoEngine) {
                void handleGenerate();
                return;
              }
              handleStickyPrimaryAction();
            }}
            onBuyCredits={() =>
              openUpsell({
                balance: credits,
                requiredCredits: isPackWorkflow ? packCredits : creditCost,
                modelModeLabel: selectedModelLabel,
                isPremium: selectedModelMode?.isPremium,
              })
            }
            showPreview={isPackWorkflow}
            previewDisabled={!packControl?.canPreview}
            onPreview={() => packPanelRef.current?.runPreview()}
          />
        }
      >
        <AgentGeneratorStage
          layout="stacked"
          language={lang}
          promptSlot={generatorPromptSlot}
          promptAssistSlot={generatorPromptAssistSlot}
          settingsSlot={generatorSettingsSlot}
          agentStepsSlot={generatorAgentStepsSlot}
          previewSlot={generatorPreviewSlot}
          composeScrollable={false}
          previewScrollable={!isPackWorkflow}
          className="h-full"
        />
      </GeneratorOverlay>
    );
  }

  return (
    <StudioWorkspaceShell
      selectedCategoryId={selectedCategory}
      onCategoryChange={setSelectedCategory}
      language={lang}
      compact={overlayMode}
      contextBar={
        <ContextActionBar
          categoryId={selectedCategory}
          language={lang}
          selectedToolId={
            selectedCategory === "create" || selectedCategory === "optimize"
              ? selectedContextToolId
              : null
          }
          onSelectTool={handleContextToolSelect}
          onLaunchTool={contextToolLaunch}
        />
      }
      workspace={
        <AgentPromptWorkspace
          categoryId={selectedCategory}
          language={lang}
          toolLabel={workspaceToolLabel}
          toolDescription={workspaceToolDescription}
          packRecommended={isPackWorkflow}
          headerSlot={
            overlayMode ? null : (
              <>
                <CreatePageHeader />
                <CreateOnboardingPanel
                  isDe={isDe}
                  hasGenerations={hasGenerations}
                  selectedGoalId={onboardingGoalId}
                  previewDisabled={prompt.trim().length < 3}
                  onSelectGoal={handleOnboardingGoalSelect}
                  onPreviewPack={handlePreviewPackFromOnboarding}
                />
              </>
            )
          }
          promptSlot={generatorPromptSlot}
          promptAssistSlot={generatorPromptAssistSlot}
          creditPreviewSlot={
            <AgentWorkspaceCreditPreview
              modeLabel={selectedModelLabel}
              creditCost={isPackWorkflow ? packCredits : creditCost}
              creditBalance={creditsConfirmed ? credits : undefined}
              creditsConfirmed={creditsConfirmed}
              language={lang}
              previewOnly={isPackWorkflow}
            />
          }
          primaryCtaSlot={stickyCreditBar}
          agentStepsSlot={generatorAgentStepsSlot}
          previewSlot={generatorPreviewSlot}
        />
      }
      detailPanel={
        !overlayMode && detailTool ? (
          <ToolDetailPanel
            open
            resolved={detailTool}
            language={lang}
            launchContext={detailLaunchContext}
            onClose={() => {
              setDetailTool(null);
              setDetailLaunchContext(null);
              onOverlayClose?.();
            }}
            onUpgrade={() =>
              openUpsell({
                balance: credits,
                requiredCredits: creditCost,
                isPremium: true,
              })
            }
            onLaunchWorkflow={() => {
              const result = contextToolLaunch(detailTool);
              if (!result.launched && result.launchContext) {
                setDetailLaunchContext(result.launchContext);
              } else if (result.launched) {
                setDetailTool(null);
                setDetailLaunchContext(null);
              }
            }}
            onPreviewWorkflow={() => {
              const result = contextToolLaunch(detailTool);
              if (!result.launched && result.launchContext) {
                setDetailLaunchContext(result.launchContext);
                return;
              }
              if (result.launched) {
                setDetailTool(null);
                setDetailLaunchContext(null);
              }
              if (detailTool.tool.id === "social_asset_pack") {
                scrollToPackPanel();
              }
            }}
          />
        ) : null
      }
    />
  );
}

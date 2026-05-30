"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  consumeResumePromptFlag,
  getLastPrompt,
  markGenerationFailed,
  markRecentAssetGenerated,
  saveWorkspaceSession,
} from "@/lib/dashboard/workspace-persistence";
import {
  getDefaultImageStudioModelId,
  getImageStudioModelCatalog,
  getImageStudioCredits,
  isImageStudioModelSelectable,
} from "@/lib/ai/krea-model-ui";
import {
  formatToolGenerateError,
  handleGenerateForTool,
} from "@/lib/dashboard/tool-generate";
import { studioFormatToApi } from "@/lib/dashboard/studio-white/formats";
import type { StudioFormatId } from "@/lib/dashboard/v2/constants";
import { useWorkspaceGeneration } from "@/app/dashboard/hooks/useWorkspaceGeneration";
import { useDashboardLanguage } from "../../DashboardLanguageProvider";
import { useCreativeSuite } from "../creative-suite/CreativeSuiteProvider";
import { useStudioUpsell } from "./StudioUpsellProvider";
import EngineCardGrid from "./EngineCardGrid";
import FormatAspectGrid from "./FormatAspectGrid";
import StudioWhiteToolFrame from "./StudioWhiteToolFrame";
import StudioCreditMeter from "./StudioCreditMeter";
import WorkspaceGreeting from "../dashboard/WorkspaceGreeting";
import SmartCommandBox from "../dashboard/SmartCommandBox";
import WorkspaceIntentHint from "../dashboard/WorkspaceIntentHint";
import { STUDIO_FORMATS } from "@/lib/dashboard/v2/constants";

export default function StudioWhiteImageStudio() {
  const { language } = useDashboardLanguage();
  const lang = language === "de" ? "de" : "en";
  const { credits, onGenerationQueued } = useCreativeSuite();
  const { handleInsufficientCredits } = useStudioUpsell();
  const supabase = createClient();

  const modelCatalog = useMemo(
    () => getImageStudioModelCatalog(lang),
    [lang]
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
  const [selectedEngine, setSelectedEngine] = useState(
    () =>
      getDefaultImageStudioModelId() ||
      modelCatalog.find((m) => !m.disabled)?.value ||
      ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedModel = modelCatalog.find((m) => m.value === selectedEngine);
  const creditCost = getImageStudioCredits(selectedEngine) ?? selectedModel?.credits ?? 1;
  const modelSelectable = isImageStudioModelSelectable(selectedEngine);
  const formatLabel =
    STUDIO_FORMATS.find((f) => f.id === formatId)?.label ?? formatId;

  const submitLabel =
    lang === "de"
      ? `Generieren (${creditCost} Credits)`
      : `Generate (${creditCost} Credits)`;

  const canGenerate =
    prompt.trim().length > 0 &&
    !loading &&
    modelSelectable &&
    credits >= creditCost;

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
    if (!promptHydrated || !prompt.trim()) return;
    const timer = window.setTimeout(() => {
      saveWorkspaceSession({
        lastView: "image",
        lastPrompt: prompt.trim(),
        lastModel: selectedEngine,
        lastFormat: formatId,
      });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [prompt, selectedEngine, formatId, promptHydrated]);

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setError(null);
    clearPreviewError();
    setPreviewLoading(
      lang === "de" ? "Bild wird generiert …" : "Generating image …"
    );

    saveWorkspaceSession({
      lastView: "image",
      lastPrompt: prompt.trim(),
      lastModel: selectedEngine,
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
        kreaModelId: selectedEngine,
      });

      if (!result.success) {
        handleInsufficientCredits(result.status, result.code);
        const msg = formatToolGenerateError(result, lang);
        setError(null);
        setPreviewError(msg);
        markGenerationFailed();
        saveWorkspaceSession({
          lastView: "image",
          lastPrompt: prompt.trim(),
          lastModel: selectedEngine,
          lastFormat: formatId,
        });
        return;
      }

      onGenerationQueued({ creditsSpent: creditCost });
      setError(null);
      markRecentAssetGenerated();
      saveWorkspaceSession({
        lastView: "image",
        lastPrompt: prompt.trim(),
        lastModel: selectedEngine,
        lastFormat: formatId,
      });

      if (result.imageUrl) {
        setSuccess({
          type: "image",
          url: result.imageUrl,
          prompt: prompt.trim(),
          model: selectedEngine,
          credits: creditCost,
        });
        return;
      }

      if (result.generationId) {
        pollGeneration(result.generationId, lang);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Generation failed";
      setError(null);
      setPreviewError(msg);
      markGenerationFailed();
    } finally {
      setLoading(false);
    }
  };

  return (
    <StudioWhiteToolFrame
      layout="guided"
      promptPlacement="top"
      showCommandBar={false}
      greetingSlot={<WorkspaceGreeting variant="compact" />}
      commandBox={
        <SmartCommandBox
          value={prompt}
          onChange={setPrompt}
          onSubmit={() => void handleGenerate()}
          loading={loading}
          disabled={!canGenerate}
          submitLabel={submitLabel}
          engineLabel={selectedModel?.label ?? "Image Engine"}
          creditCost={creditCost}
          formatLabel={formatLabel}
          autoFocus
        />
      }
      intentHintSlot={
        <WorkspaceIntentHint
          prompt={prompt}
          engineLabel={selectedModel?.label}
          formatLabel={formatLabel}
        />
      }
      creditMeter={
        <StudioCreditMeter
          creditCost={creditCost}
          costLabel={selectedModel?.label ?? "Image"}
        />
      }
      previewState={preview}
      idlePreviewLabel={
        lang === "de"
          ? "Deine Vorschau erscheint hier."
          : "Your preview will appear here."
      }
      idlePreviewSubtext={
        lang === "de"
          ? "Nach Generate erscheint dein Ergebnis hier."
          : "Your result will appear here after you click Generate."
      }
      error={error}
      engineGrid={
        <EngineCardGrid
          engines={modelCatalog}
          selectedId={selectedEngine}
          onSelect={setSelectedEngine}
        />
      }
      formatGrid={
        <FormatAspectGrid selectedId={formatId} onSelect={setFormatId} />
      }
    />
  );
}

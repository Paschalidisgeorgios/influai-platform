"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  OBS,
  OBS_SPRING,
  OBSIDIAN_HOME_ENGINES,
  type ObsidianEngineId,
} from "@/lib/obsidian/dashboard-tokens";
import {
  formatToolGenerateError,
  handleGenerateForTool,
} from "@/lib/dashboard/tool-generate";
import { studioFormatToApi } from "@/lib/dashboard/studio-white/formats";
import { useWorkspaceGeneration } from "@/app/dashboard/hooks/useWorkspaceGeneration";
import { useLanguage } from "@/hooks/useLanguage";
import { useCreativeSuite } from "../creative-suite/CreativeSuiteProvider";
import { useStudioUpsell } from "../studio-white/StudioUpsellProvider";
import DurationPills, { videoCreditsForDuration } from "./DurationPills";
import EngineGrid from "./EngineGrid";
import { mediaFromPreview } from "@/lib/dashboard/studio-white/preview";
import WorkspaceGreeting from "../dashboard/WorkspaceGreeting";
import SmartCommandBox from "../dashboard/SmartCommandBox";
import WorkspaceIntentHint from "../dashboard/WorkspaceIntentHint";

export default function ObsidianIntelligentStudio() {
  const router = useRouter();
  const { isDe } = useLanguage();
  const { credits, onGenerationQueued } = useCreativeSuite();
  const { handleInsufficientCredits } = useStudioUpsell();
  const supabase = createClient();

  const [prompt, setPrompt] = useState("");
  const [selectedEngine, setSelectedEngine] = useState<ObsidianEngineId>("flux-pro");
  const [videoDuration, setVideoDuration] = useState<5 | 10>(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const engine = OBSIDIAN_HOME_ENGINES.find((e) => e.id === selectedEngine)!;
  const isVideoEngine = engine.toolKey === "video";

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
  } = useWorkspaceGeneration(getToken);

  const creditCost = isVideoEngine ? videoCreditsForDuration(videoDuration) : 1;
  const canGenerate = prompt.trim().length > 0 && !loading && credits >= creditCost;

  const { src, kind } = mediaFromPreview(preview);

  async function handleGenerate() {
    if (!canGenerate) return;

    if (isVideoEngine) {
      const params = new URLSearchParams({
        engine: engine.kreaModelId,
        duration: String(videoDuration),
      });
      if (prompt.trim()) params.set("prompt", prompt.trim());
      router.push(`/dashboard/video?${params.toString()}`);
      return;
    }

    setLoading(true);
    setError(null);
    clearPreviewError();
    setPreviewLoading(isDe ? "Bild wird generiert …" : "Generating image …");

    try {
      const token = await getToken();
      if (!token) throw new Error("Session expired");

      const result = await handleGenerateForTool({
        toolKey: "image",
        token,
        prompt: prompt.trim(),
        outputFormat: studioFormatToApi("square"),
        kreaModelId: engine.kreaModelId,
      });

      if (!result.success) {
        handleInsufficientCredits(result.status, result.code);
        const msg = formatToolGenerateError(result, isDe ? "de" : "en");
        setError(msg);
        setPreviewError(msg);
        return;
      }

      onGenerationQueued();
      if (result.generationId) {
        pollGeneration(result.generationId, isDe ? "de" : "en");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Generation failed";
      setError(msg);
      setPreviewError(msg);
    } finally {
      setLoading(false);
    }
  }

  const submitLabel = isDe
    ? isVideoEngine
      ? `Video generieren (${creditCost} Credits)`
      : `Generieren (${creditCost} Credits)`
    : isVideoEngine
      ? `Generate Video (${creditCost} Credits)`
      : `Generate (${creditCost} Credits)`;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 pb-10 sm:gap-8">
      <WorkspaceGreeting />

      <SmartCommandBox
        value={prompt}
        onChange={setPrompt}
        onSubmit={() => void handleGenerate()}
        loading={loading}
        disabled={!canGenerate}
        submitLabel={submitLabel}
        engineLabel={engine.label}
        creditCost={creditCost}
        headerSlot={
          isVideoEngine ? (
            <DurationPills value={videoDuration} onChange={setVideoDuration} />
          ) : undefined
        }
        autoFocus
      />

      <WorkspaceIntentHint prompt={prompt} engineLabel={engine.label} />

      {error ? (
        <div
          role="alert"
          className="mx-auto w-full max-w-5xl rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm font-medium text-red-300"
        >
          {error}
        </div>
      ) : null}

      <EngineGrid
        engines={OBSIDIAN_HOME_ENGINES}
        selectedId={selectedEngine}
        onSelect={setSelectedEngine}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...OBS_SPRING, delay: 0.08 }}
        className={`relative aspect-video w-full max-w-4xl overflow-hidden ${OBS.glass}`}
      >
        {src ? (
          kind === "video" ? (
            <video src={src} controls autoPlay loop muted playsInline className="h-full w-full object-contain" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="" className="h-full w-full object-contain" />
          )
        ) : (
          <div className="flex h-full min-h-[220px] items-center justify-center sm:min-h-[280px]">
            <p className={`${OBS.mono} px-4 text-center text-neutral-600`}>
              {preview.status === "loading"
                ? preview.message
                : isDe
                  ? "Deine Vorschau erscheint hier"
                  : "Your preview will appear here"}
            </p>
          </div>
        )}
      </motion.div>

      <p className={`${OBS.mono} text-center text-neutral-600`}>
        {isDe
          ? "Video-Engines öffnen das Video Studio · Bild-Engines generieren direkt"
          : "Video engines open Video Studio · Image engines generate inline"}
      </p>
    </div>
  );
}

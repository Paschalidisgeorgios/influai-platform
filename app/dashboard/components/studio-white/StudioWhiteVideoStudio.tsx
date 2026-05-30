"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  formatToolGenerateError,
  handleGenerateForTool,
} from "@/lib/dashboard/tool-generate";
import { VIDEO_ENGINE_ENGINES } from "@/lib/dashboard/white-label-engines";
import { studioFormatToApi } from "@/lib/dashboard/studio-white/formats";
import type { StudioFormatId } from "@/lib/dashboard/v2/constants";
import { useWorkspaceGeneration } from "@/app/dashboard/hooks/useWorkspaceGeneration";
import { useLanguage } from "@/hooks/useLanguage";
import { useCreativeSuite } from "../creative-suite/CreativeSuiteProvider";
import { useStudioUpsell } from "./StudioUpsellProvider";
import DurationPills, { videoCreditsForDuration } from "../obsidian/DurationPills";
import EngineCardGrid from "./EngineCardGrid";
import FormatAspectGrid from "./FormatAspectGrid";
import StudioWhiteToolFrame from "./StudioWhiteToolFrame";
import StudioCreditMeter from "./StudioCreditMeter";

export default function StudioWhiteVideoStudio() {
  const searchParams = useSearchParams();
  const { isDe, language } = useLanguage();
  const lang = language === "de" ? "de" : "en";
  const { credits, onGenerationQueued } = useCreativeSuite();
  const { handleInsufficientCredits } = useStudioUpsell();
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
  } = useWorkspaceGeneration(getToken);

  const [prompt, setPrompt] = useState("");
  const [formatId, setFormatId] = useState<StudioFormatId>("vertical");
  const [selectedEngine, setSelectedEngine] = useState(
    VIDEO_ENGINE_ENGINES[0]?.id ?? "kling-3"
  );
  const [videoDuration, setVideoDuration] = useState<5 | 10>(5);
  const [sourceImageUrl, setSourceImageUrl] = useState<string | null>(null);
  const [sourcePreviewUrl, setSourcePreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const engineParam = searchParams.get("engine");
    const durationParam = searchParams.get("duration");
    const promptParam = searchParams.get("prompt");

    if (engineParam && VIDEO_ENGINE_ENGINES.some((e) => e.id === engineParam)) {
      setSelectedEngine(engineParam);
    }
    if (durationParam === "5" || durationParam === "10") {
      setVideoDuration(Number(durationParam) as 5 | 10);
    }
    if (promptParam) {
      setPrompt(promptParam);
    }
  }, [searchParams]);

  const videoCreditCost = videoCreditsForDuration(videoDuration);
  const selectedEngineCard = VIDEO_ENGINE_ENGINES.find((e) => e.id === selectedEngine);

  const pills = useMemo(
    () => [
      {
        id: "engine",
        label: `🎥 ${lang === "de" ? selectedEngineCard?.labelDe : selectedEngineCard?.labelEn ?? "Kling 3.0 Cinematic"}`,
      },
      {
        id: "duration",
        label: `${videoDuration}s · ${videoCreditCost} Credits`,
      },
    ],
    [selectedEngineCard, videoDuration, videoCreditCost, lang]
  );

  const canGenerate =
    !!sourceImageUrl &&
    prompt.trim().length > 0 &&
    !uploading &&
    !loading &&
    credits >= videoCreditCost;

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
    if (!canGenerate || !sourceImageUrl) return;
    setLoading(true);
    setError(null);
    clearPreviewError();
    setPreviewLoading(
      lang === "de" ? "Video wird generiert …" : "Generating video …"
    );

    try {
      const token = await getToken();
      if (!token) throw new Error("Session expired");

      const result = await handleGenerateForTool({
        toolKey: "video",
        token,
        sourceImageUrl,
        motionInstruction: prompt.trim(),
        outputFormat: studioFormatToApi(formatId),
        kreaModelId: selectedEngine,
        durationSeconds: videoDuration,
      });

      if (!result.success) {
        handleInsufficientCredits(result.status, result.code);
        const msg = formatToolGenerateError(result, lang);
        setError(msg);
        setPreviewError(msg);
        return;
      }

      onGenerationQueued({ creditsSpent: videoCreditCost });
      if (result.generationId) {
        pollGeneration(result.generationId, lang);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Generation failed";
      setError(msg);
      setPreviewError(msg);
    } finally {
      setLoading(false);
    }
  };

  const generateLabel =
    lang === "de"
      ? `Video generieren (${videoCreditCost} Credits)`
      : `Generate Video (${videoCreditCost} Credits)`;

  const durationRow = (
    <DurationPills
      className="mx-auto w-full max-w-4xl px-4"
      value={videoDuration}
      onChange={setVideoDuration}
    />
  );

  const steps = (
    <div className="rounded-3xl border border-neutral-800/80 bg-neutral-900/50 p-4 shadow-2xl backdrop-blur-xl">
      <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">
        {lang === "de" ? "Quellbild" : "Source image"}
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
      creditMeter={
        <StudioCreditMeter
          creditCost={videoCreditCost}
          costLabel={`${videoDuration}s Video`}
        />
      }
      previewState={preview}
      fallbackPreviewSrc="/assets/preview-video.mp4"
      fallbackPreviewKind="video"
      showIdleFallback
      idlePreviewLabel={
        lang === "de"
          ? "Dein Video erscheint hier — vollständig sichtbar."
          : "Your video appears here — fully visible."
      }
      prompt={prompt}
      onPromptChange={setPrompt}
      onSubmit={() => void handleGenerate()}
      pills={pills}
      loading={loading}
      disabled={!canGenerate}
      error={error}
      submitLabel={generateLabel}
      engineGrid={
        <EngineCardGrid
          engines={VIDEO_ENGINE_ENGINES}
          selectedId={selectedEngine}
          onSelect={setSelectedEngine}
        />
      }
      formatGrid={
        <FormatAspectGrid selectedId={formatId} onSelect={setFormatId} />
      }
      durationRow={durationRow}
      steps={steps}
    />
  );
}

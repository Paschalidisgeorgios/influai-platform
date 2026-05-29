"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getDefaultModelIdForTool } from "@/lib/ai/krea-model-ui";
import {
  VIDEO_ENGINE_ENGINES,
  whiteLabelCardToModelOption,
} from "@/lib/dashboard/white-label-engines";
import { createClient } from "@/lib/supabase/client";
import { handleGenerateForTool } from "@/lib/dashboard/tool-generate";
import { getMatrixEntry } from "@/lib/dashboard/creative-tool-matrix";
import { useWorkspaceGeneration } from "@/app/dashboard/hooks/useWorkspaceGeneration";
import { useDashboardLanguage } from "../../DashboardLanguageProvider";
import { useCreativeSuite } from "./CreativeSuiteProvider";
import ToolWorkspace from "../studio/ToolWorkspace";

export default function VideoEngineToolPanel() {
  const tool = getMatrixEntry("video");
  const { language } = useDashboardLanguage();
  const lang = language === "de" ? "de" : "en";
  const { credits, onGenerationQueued } = useCreativeSuite();
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

  const modelOptions = useMemo(
    () =>
      VIDEO_ENGINE_ENGINES.map((c) =>
        whiteLabelCardToModelOption(c, lang, tool?.creditCost)
      ),
    [lang, tool?.creditCost]
  );
  const [selectedModel, setSelectedModel] = useState(
    () => VIDEO_ENGINE_ENGINES[0]?.id ?? getDefaultModelIdForTool("video")
  );

  useEffect(() => {
    setSelectedModel(VIDEO_ENGINE_ENGINES[0]?.id ?? getDefaultModelIdForTool("video"));
  }, []);

  const [motionPrompt, setMotionPrompt] = useState("");
  const [format, setFormat] = useState("tiktok");
  const [videoDuration, setVideoDuration] = useState<5 | 10>(5);
  const [resolution, setResolution] = useState("720p");
  const [sourceImageUrl, setSourceImageUrl] = useState<string | null>(null);
  const [sourcePreviewUrl, setSourcePreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!tool) return null;

  const missingSourceHint =
    lang === "de"
      ? "Bitte lade zuerst ein Quellbild hoch, um ein Video zu generieren."
      : "Please upload a source image before generating a video.";

  const videoCreditCost = videoDuration === 10 ? 50 : 25;

  const canGenerate =
    !!sourceImageUrl &&
    motionPrompt.trim().length > 0 &&
    !!selectedModel &&
    !uploading &&
    !loading &&
    credits >= videoCreditCost;

  const generateLabel =
    lang === "de"
      ? `Video generieren (${videoCreditCost} Credits)`
      : `Generate Video (${videoCreditCost} Credits)`;

  const generateHint =
    !sourceImageUrl && !uploading ? missingSourceHint : null;

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
        motionInstruction: motionPrompt.trim(),
        outputFormat: format,
        kreaModelId: selectedModel,
      });

      if (!result.success) {
        setError(result.error);
        setPreviewError(result.error);
        return;
      }

      onGenerationQueued();
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

  return (
    <ToolWorkspace
      embedded
      title={lang === "de" ? tool.titleDe : tool.titleEn}
      subtitle={lang === "de" ? tool.subtitleDe : tool.subtitleEn}
      modelOptions={modelOptions}
      selectedModel={selectedModel}
      onModelChange={setSelectedModel}
      promptText={motionPrompt}
      onPromptChange={setMotionPrompt}
      selectedFormat={format}
      onFormatChange={setFormat}
      badges={tool.commandBarBadges}
      creditCost={videoCreditCost}
      availableCredits={credits}
      onGenerate={handleGenerate}
      generateDisabled={!canGenerate}
      loading={loading}
      generateHint={generateHint}
      modelGridColumns={4}
      modelLabelEn="Video Engine"
      modelLabelDe="Video Engine"
      previewState={preview}
      idlePreviewLabel={
        lang === "de"
          ? "Dein Video erscheint hier."
          : "Your video will appear here."
      }
      generateLabel={generateLabel}
      promptPlaceholder={
        lang === "de"
          ? "z.B. langsamer Kameraflug, sanfte Kopfbewegung, hochwertiger Werbelook"
          : "e.g. slow camera move, subtle head motion, premium campaign vibe"
      }
    >
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
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
            className="h-52 w-full rounded-xl border border-gray-200 object-contain bg-gray-50"
          />
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex h-40 w-full items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white text-sm text-slate-600"
          >
            + {lang === "de" ? "Bild hochladen" : "Upload image"}
          </button>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
          {lang === "de" ? "Dauer" : "Duration"}
        </p>
        <div className="flex flex-wrap gap-2">
          {(
            [
              {
                sec: 5 as const,
                labelEn: "5 Seconds (Standard)",
                labelDe: "5 Sekunden (Standard)",
                credits: 25,
              },
              {
                sec: 10 as const,
                labelEn: "10 Seconds (Extended)",
                labelDe: "10 Sekunden (Erweitert)",
                credits: 50,
              },
            ] as const
          ).map((opt) => (
            <button
              key={opt.sec}
              type="button"
              onClick={() => setVideoDuration(opt.sec)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                videoDuration === opt.sec
                  ? "border-orange-500 bg-orange-50 text-orange-700 ring-1 ring-orange-500"
                  : "border-gray-200 bg-white text-slate-700 hover:border-orange-300"
              }`}
            >
              {lang === "de" ? opt.labelDe : opt.labelEn} · {opt.credits}c
            </button>
          ))}
        </div>
      </div>
      <label className="block">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
          Resolution
        </span>
        <select
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-slate-900"
        >
          <option value="720p">720p</option>
          <option value="1080p">1080p</option>
        </select>
      </label>

      {uploading ? (
        <p className="text-xs text-slate-500">
          {lang === "de" ? "Wird hochgeladen…" : "Uploading…"}
        </p>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </ToolWorkspace>
  );
}

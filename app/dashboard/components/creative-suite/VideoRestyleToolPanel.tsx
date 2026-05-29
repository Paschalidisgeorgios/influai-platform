"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getDefaultModelIdForTool } from "@/lib/ai/krea-model-ui";
import {
  VIDEO_ENGINE_ENGINES,
  whiteLabelCardToModelOption,
} from "@/lib/dashboard/white-label-engines";
import { createClient } from "@/lib/supabase/client";
import { handleGenerateForTool } from "@/lib/dashboard/tool-generate";
import { useWorkspaceGeneration } from "@/app/dashboard/hooks/useWorkspaceGeneration";
import { useCreativeSuite } from "./CreativeSuiteProvider";
import { useDashboardLanguage } from "../../DashboardLanguageProvider";
import ToolWorkspace from "../studio/ToolWorkspace";
import { getMatrixEntry } from "@/lib/dashboard/creative-tool-matrix";

export default function VideoRestyleToolPanel() {
  const tool = getMatrixEntry("video_restyle");
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
    () => VIDEO_ENGINE_ENGINES[0]?.id ?? getDefaultModelIdForTool("video_restyle")
  );

  useEffect(() => {
    setSelectedModel(
      VIDEO_ENGINE_ENGINES[0]?.id ?? getDefaultModelIdForTool("video_restyle")
    );
  }, []);

  const [stylePrompt, setStylePrompt] = useState("");
  const [sourceImageUrl, setSourceImageUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [format, setFormat] = useState("square");

  const uploadImage = useCallback(
    async (file: File) => {
      setUploading(true);
      setError(null);
      setPreviewUrl(URL.createObjectURL(file));

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
        if (!res.ok || !data.imageUrl) {
          throw new Error(data.error || "Upload failed");
        }
        setSourceImageUrl(data.imageUrl);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [getToken]
  );

  const canGenerate =
    !!sourceImageUrl &&
    stylePrompt.trim().length > 0 &&
    !uploading &&
    !loading &&
    credits >= (tool?.creditCost ?? 0);

  const handleGenerate = async () => {
    if (!canGenerate || !sourceImageUrl) return;
    setLoading(true);
    setError(null);
    clearPreviewError();
    setPreviewLoading(
      lang === "de" ? "Restyle wird erstellt …" : "Creating restyle …"
    );

    try {
      const token = await getToken();
      if (!token) {
        setError("Session expired.");
        setPreviewError("Session expired.");
        return;
      }

      const editInstruction = `Restyle this campaign visual: ${stylePrompt.trim()}. Premium video restyle look, cinematic color grade, maintain subject.`;

      const result = await handleGenerateForTool({
        toolKey: "video_restyle",
        token,
        sourceImageUrl,
        editInstruction,
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
    } catch {
      const msg = lang === "de" ? "Generierung fehlgeschlagen." : "Generation failed.";
      setError(msg);
      setPreviewError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!tool) return null;

  return (
    <ToolWorkspace
      embedded
      title={lang === "de" ? tool.titleDe : tool.titleEn}
      subtitle={lang === "de" ? tool.subtitleDe : tool.subtitleEn}
      modelOptions={modelOptions}
      selectedModel={selectedModel}
      onModelChange={setSelectedModel}
      promptText={stylePrompt}
      onPromptChange={setStylePrompt}
      selectedFormat={format}
      onFormatChange={setFormat}
      badges={tool.commandBarBadges}
      creditCost={tool.creditCost}
      availableCredits={credits}
      onGenerate={handleGenerate}
      generateDisabled={!canGenerate}
      loading={loading}
      previewState={preview}
      idlePreviewLabel={
        lang === "de"
          ? "Dein Restyle erscheint hier."
          : "Your restyle will appear here."
      }
      modelGridColumns={4}
      formatVariant="popover"
      modelLabelEn="Style Engine"
      modelLabelDe="Style Engine"
      generateLabel={lang === "de" ? "Restyle erstellen" : "Create restyle"}
      promptPlaceholder={
        lang === "de"
          ? "z.B. cinematic teal-orange, luxury brand, high contrast"
          : "e.g. cinematic teal-orange, luxury brand, high contrast"
      }
    >
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
          {lang === "de" ? "Referenz / Frame" : "Reference / frame"}
        </p>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void uploadImage(f);
            e.target.value = "";
          }}
        />
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt=""
            className="h-48 w-full rounded-xl border border-gray-200 object-contain bg-gray-50"
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
      {uploading ? (
        <p className="text-xs text-slate-500">
          {lang === "de" ? "Wird hochgeladen…" : "Uploading…"}
        </p>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </ToolWorkspace>
  );
}

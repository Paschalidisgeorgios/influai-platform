"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { getDefaultModelIdForTool } from "@/lib/ai/krea-model-ui";
import { createClient } from "@/lib/supabase/client";
import { handleGenerateForTool } from "@/lib/dashboard/tool-generate";
import { getMatrixEntry } from "@/lib/dashboard/creative-tool-matrix";
import { useWorkspaceGeneration } from "@/app/dashboard/hooks/useWorkspaceGeneration";
import { useDashboardLanguage } from "../../DashboardLanguageProvider";
import { useCreativeSuite } from "./CreativeSuiteProvider";
import ToolWorkspace from "../studio/ToolWorkspace";
import LipSyncModeCards from "../studio/LipSyncModeCards";
import LipSyncVoiceLibrary from "../studio/LipSyncVoiceLibrary";
import { LIP_SYNC_RECOMMENDED_VOICE_KEYS } from "@/lib/lip-sync/elevenlabs-voices";

type LipSyncMode = "system_voice" | "audio_upload" | "record";

const LIP_SYNC_CREDITS = 30;

export default function LipSyncToolPanel() {
  const tool = getMatrixEntry("lipsync");
  const { language } = useDashboardLanguage();
  const lang = language === "de" ? "de" : "en";
  const { credits, onGenerationQueued } = useCreativeSuite();
  const supabase = createClient();

  const videoRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLInputElement>(null);

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

  const [selectedModel] = useState(() => getDefaultModelIdForTool("lipsync"));

  const [inputMode, setInputMode] = useState<LipSyncMode>("system_voice");
  const [scriptText, setScriptText] = useState("");
  const [voiceKey, setVoiceKey] = useState<string>(
    LIP_SYNC_RECOMMENDED_VOICE_KEYS[0] ?? "sarah"
  );
  const [format, setFormat] = useState("tiktok");
  const [sourceVideoUrl, setSourceVideoUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [sourceVideoPreview, setSourceVideoPreview] = useState<string | null>(null);
  const [audioLabel, setAudioLabel] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const emptyModelOptions = useMemo(
    () => [{ value: selectedModel, label: "ElevenLabs", note: "" }],
    [selectedModel]
  );

  if (!tool) return null;

  const effectiveAudioMode =
    inputMode === "record" ? "audio_upload" : inputMode;

  const canGenerate =
    !!sourceVideoUrl &&
    !uploading &&
    !loading &&
    !isRecording &&
    credits >= LIP_SYNC_CREDITS &&
    (effectiveAudioMode === "audio_upload"
      ? !!audioUrl
      : scriptText.trim().length > 0 && !!voiceKey);

  const uploadViaForm = async (file: File, type: "source" | "audio") => {
    const token = await getToken();
    if (!token) throw new Error("Session expired");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    const res = await fetch("/api/lip-sync/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Upload failed");
    return data as { fileUrl?: string; sourceUrl?: string; audioUrl?: string };
  };

  const resolveUploadUrl = (
    data: { fileUrl?: string; sourceUrl?: string; audioUrl?: string },
    kind: "source" | "audio"
  ) => data.fileUrl ?? (kind === "source" ? data.sourceUrl : data.audioUrl);

  const uploadSource = async (file: File) => {
    setUploading(true);
    setError(null);
    setSourceVideoPreview(URL.createObjectURL(file));
    try {
      const data = await uploadViaForm(file, "source");
      const url = resolveUploadUrl(data, "source");
      if (!url || url.startsWith("blob:")) {
        throw new Error(
          lang === "de" ? "Upload fehlgeschlagen." : "Upload failed."
        );
      }
      setSourceVideoUrl(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const uploadAudio = async (file: File) => {
    setUploading(true);
    setError(null);
    setAudioLabel(file.name);
    try {
      const data = await uploadViaForm(file, "audio");
      const url = resolveUploadUrl(data, "audio");
      if (!url || url.startsWith("blob:")) {
        throw new Error(
          lang === "de" ? "Upload fehlgeschlagen." : "Upload failed."
        );
      }
      setAudioUrl(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const startAudioRecord = async () => {
    setError(null);
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setError(
        lang === "de"
          ? "Aufnahme wird in diesem Browser nicht unterstützt."
          : "Recording is not supported in this browser."
      );
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) audioChunksRef.current.push(ev.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        if (blob.size === 0) return;
        const file = new File([blob], `lip-sync-recording-${Date.now()}.webm`, {
          type: "audio/webm",
        });
        await uploadAudio(file);
      };
      recorder.start();
      setIsRecording(true);
    } catch {
      setError(
        lang === "de"
          ? "Mikrofonzugriff verweigert."
          : "Microphone access was denied."
      );
    }
  };

  const stopAudioRecord = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
    mediaRecorderRef.current = null;
    setIsRecording(false);
  };

  const handleGenerate = async () => {
    if (!canGenerate || !sourceVideoUrl) return;
    setLoading(true);
    setError(null);
    clearPreviewError();
    setPreviewLoading(
      lang === "de" ? "Lip-Sync wird generiert …" : "Generating lip-sync …"
    );
    try {
      const token = await getToken();
      if (!token) throw new Error("Session expired");

      const lipSyncInputMode: "audio_upload" | "system_voice" =
        effectiveAudioMode === "audio_upload" ? "audio_upload" : "system_voice";

      const result = await handleGenerateForTool({
        toolKey: "lipsync",
        token,
        sourceVideoUrl,
        outputFormat: format,
        kreaModelId: selectedModel,
        lipSyncInputMode,
        audioUrl:
          lipSyncInputMode === "audio_upload" ? audioUrl ?? undefined : undefined,
        scriptText:
          lipSyncInputMode !== "audio_upload" ? scriptText.trim() : undefined,
        voiceKey: lipSyncInputMode !== "audio_upload" ? voiceKey : undefined,
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

  const voiceCopy = {
    title: lang === "de" ? "Stimmen" : "Voices",
    subtitle:
      lang === "de"
        ? "Wähle eine Stimme und höre die Vorschau."
        : "Pick a voice and play the preview.",
    femaleSection: lang === "de" ? "Frauen" : "Women",
    maleSection: lang === "de" ? "Männer" : "Men",
    recommendedBadge: lang === "de" ? "Empfohlen" : "Recommended",
    notConfiguredYet:
      lang === "de" ? "Noch nicht konfiguriert" : "Not configured yet",
    previewNotAvailable:
      lang === "de"
        ? "Vorschau noch nicht verfügbar"
        : "Preview not available yet",
  };

  const generateLabel =
    lang === "de"
      ? `Lip-Sync Video generieren (${LIP_SYNC_CREDITS} Credits)`
      : `Generate Lip-Sync Video (${LIP_SYNC_CREDITS} Credits)`;

  return (
    <ToolWorkspace
      embedded
      title={lang === "de" ? tool.titleDe : tool.titleEn}
      subtitle={lang === "de" ? tool.subtitleDe : tool.subtitleEn}
      modelOptions={emptyModelOptions}
      selectedModel={selectedModel}
      onModelChange={() => {}}
      promptText={scriptText}
      onPromptChange={setScriptText}
      showPrompt={inputMode === "system_voice"}
      showModelSelect={false}
      selectedFormat={format}
      onFormatChange={setFormat}
      badges={tool.commandBarBadges}
      creditCost={LIP_SYNC_CREDITS}
      availableCredits={credits}
      onGenerate={handleGenerate}
      generateDisabled={!canGenerate}
      loading={loading}
      previewState={preview}
      idlePreviewLabel={
        lang === "de"
          ? "Dein Lip-Sync-Video erscheint hier."
          : "Your lip-sync video will appear here."
      }
      generateLabel={generateLabel}
      promptPlaceholder={
        lang === "de"
          ? "Sprechertext eingeben und Sprache generieren…"
          : "Enter script to generate speech…"
      }
    >
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
          {lang === "de" ? "Schritt 1: Gesicht hinzufügen" : "Step 1: Add Face"}
        </p>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <input
            ref={videoRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadSource(file);
              e.target.value = "";
            }}
          />
          {sourceVideoPreview ? (
            <video
              src={sourceVideoPreview}
              controls
              className="h-44 w-full rounded-xl border border-gray-200 bg-black object-contain"
            />
          ) : (
            <button
              type="button"
              onClick={() => videoRef.current?.click()}
              className="flex h-36 w-full items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-sm font-semibold text-slate-600 hover:border-orange-300"
            >
              + {lang === "de" ? "Gesichts-Video hochladen" : "Upload face video"}
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
          {lang === "de" ? "Schritt 2: Audio" : "Step 2: Audio"}
        </p>
        <LipSyncModeCards
          mode={inputMode}
          onChange={setInputMode}
          language={lang}
        />

        {inputMode === "audio_upload" ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <input
              ref={audioRef}
              type="file"
              accept="audio/mpeg,audio/mp3,audio/wav,audio/aac,audio/webm,audio/mp4"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadAudio(file);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => audioRef.current?.click()}
              className="flex h-28 w-full items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-sm font-semibold text-slate-600 hover:border-orange-300"
            >
              {audioLabel ??
                (lang === "de" ? "+ Audiodatei hochladen" : "+ Upload audio file")}
            </button>
          </div>
        ) : inputMode === "record" ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <button
              type="button"
              onClick={isRecording ? stopAudioRecord : startAudioRecord}
              className={`w-full rounded-xl px-4 py-3 text-sm font-bold text-white transition ${
                isRecording
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-orange-500 hover:bg-orange-600"
              }`}
            >
              {isRecording
                ? lang === "de"
                  ? "Aufnahme stoppen"
                  : "Stop recording"
                : lang === "de"
                  ? "Aufnahme starten"
                  : "Start recording"}
            </button>
            {audioLabel ? (
              <p className="mt-2 text-xs font-medium text-slate-600">{audioLabel}</p>
            ) : null}
          </div>
        ) : (
          <LipSyncVoiceLibrary
            copy={voiceCopy}
            voiceKey={voiceKey}
            onVoiceKeyChange={setVoiceKey}
            isEnabled
            language={lang}
          />
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

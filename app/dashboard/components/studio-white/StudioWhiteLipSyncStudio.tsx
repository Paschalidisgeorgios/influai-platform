"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  formatToolGenerateError,
  handleGenerateForTool,
} from "@/lib/dashboard/tool-generate";
import { studioFormatToApi } from "@/lib/dashboard/studio-white/formats";
import type { StudioFormatId } from "@/lib/dashboard/v2/constants";
import { LIP_SYNC_RECOMMENDED_VOICE_KEYS } from "@/lib/lip-sync/elevenlabs-voices";
import { useWorkspaceGeneration } from "@/app/dashboard/hooks/useWorkspaceGeneration";
import { useDashboardLanguage } from "../../DashboardLanguageProvider";
import { useCreativeSuite } from "../creative-suite/CreativeSuiteProvider";
import LipSyncModeCards from "../studio/LipSyncModeCards";
import LipSyncVoiceLibrary from "../studio/LipSyncVoiceLibrary";
import { useStudioUpsell } from "./StudioUpsellProvider";
import FormatAspectGrid from "./FormatAspectGrid";
import StudioWhiteToolFrame from "./StudioWhiteToolFrame";
import SmartCommandBox from "@/components/dashboard/SmartCommandBox";
import { areCreditsConfirmed } from "@/lib/billing/credit-ui-state";

type LipSyncMode = "system_voice" | "audio_upload" | "record";

const LIP_SYNC_CREDITS = 30;

export default function StudioWhiteLipSyncStudio() {
  const { language } = useDashboardLanguage();
  const lang = language === "de" ? "de" : "en";
  const {
    credits,
    creditsLoading,
    creditsError,
    onGenerationQueued,
  } = useCreativeSuite();
  const creditsConfirmed = areCreditsConfirmed(creditsLoading, creditsError);
  const { handleInsufficientCredits } = useStudioUpsell();
  const supabase = createClient();

  const videoRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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

  const [inputMode, setInputMode] = useState<LipSyncMode>("system_voice");
  const [scriptText, setScriptText] = useState("");
  const [voiceKey, setVoiceKey] = useState<string>(
    LIP_SYNC_RECOMMENDED_VOICE_KEYS[0] ?? "sarah"
  );
  const [formatId, setFormatId] = useState<StudioFormatId>("vertical");
  const [sourceVideoUrl, setSourceVideoUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [sourceVideoPreview, setSourceVideoPreview] = useState<string | null>(null);
  const [audioLabel, setAudioLabel] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const effectiveAudioMode = inputMode === "record" ? "audio_upload" : inputMode;

  const canGenerate =
    creditsConfirmed &&
    !!sourceVideoUrl &&
    !uploading &&
    !loading &&
    !isRecording &&
    credits >= LIP_SYNC_CREDITS &&
    (effectiveAudioMode === "audio_upload"
      ? !!audioUrl
      : scriptText.trim().length > 0 && !!voiceKey);

  const pills = useMemo(
    () => [
      { id: "voice", label: "🎙 ElevenLabs Voice Pipeline" },
      { id: "cost", label: `${LIP_SYNC_CREDITS} Credits` },
    ],
    []
  );

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
        throw new Error(lang === "de" ? "Upload fehlgeschlagen." : "Upload failed.");
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
        throw new Error(lang === "de" ? "Upload fehlgeschlagen." : "Upload failed.");
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
        lang === "de" ? "Mikrofonzugriff verweigert." : "Microphone access was denied."
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
    if (!creditsConfirmed) return;
    if (!canGenerate || !sourceVideoUrl) return;
    setLoading(true);
    setIsPreviewOpen(true);
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
        outputFormat: studioFormatToApi(formatId),
        lipSyncInputMode,
        audioUrl:
          lipSyncInputMode === "audio_upload" ? audioUrl ?? undefined : undefined,
        scriptText:
          lipSyncInputMode !== "audio_upload" ? scriptText.trim() : undefined,
        voiceKey: lipSyncInputMode !== "audio_upload" ? voiceKey : undefined,
      });

      if (!result.success) {
        handleInsufficientCredits(result.status, result.code);
        setPreviewError(formatToolGenerateError(result, lang));
        return;
      }

      onGenerationQueued();
      if (result.generationId) {
        pollGeneration(result.generationId, lang);
      }
    } catch (e) {
      setPreviewError(e instanceof Error ? e.message : "Generation failed");
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
      lang === "de" ? "Vorschau noch nicht verfügbar" : "Preview not available yet",
  };

  const steps = (
    <>
      <div className="rounded-3xl border border-neutral-800/80 bg-neutral-900/50 p-5 shadow-2xl backdrop-blur-xl">
        <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">
          {lang === "de" ? "Schritt 1 — Gesichts-Video" : "Step 1 — Face video"}
        </p>
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
            className="mx-auto mt-4 w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900/40 object-contain p-2"
          />
        ) : (
          <button
            type="button"
            onClick={() => videoRef.current?.click()}
            className="mt-4 flex h-32 w-full items-center justify-center rounded-xl border border-dashed border-neutral-700 bg-neutral-900/40 text-sm font-semibold text-neutral-400 hover:border-amber-500/50"
          >
            + {lang === "de" ? "Gesichts-Video hochladen" : "Upload face video"}
          </button>
        )}
      </div>

      <div className="rounded-3xl border border-neutral-800/80 bg-neutral-900/50 p-5 shadow-2xl backdrop-blur-xl">
        <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">
          {lang === "de" ? "Schritt 2 — Audio" : "Step 2 — Audio"}
        </p>
        <div className="mt-4">
          <LipSyncModeCards mode={inputMode} onChange={setInputMode} language={lang} />
        </div>

        {inputMode === "audio_upload" ? (
          <div className="mt-4">
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
              className="flex h-28 w-full items-center justify-center rounded-xl border border-dashed border-neutral-700 bg-neutral-900/40 text-sm font-semibold text-neutral-400 hover:border-amber-500/50"
            >
              {audioLabel ??
                (lang === "de" ? "+ Audiodatei hochladen" : "+ Upload audio file")}
            </button>
          </div>
        ) : inputMode === "record" ? (
          <div className="mt-4">
            <button
              type="button"
              onClick={isRecording ? stopAudioRecord : startAudioRecord}
              className={`w-full rounded-xl px-4 py-3 text-sm font-bold text-white transition ${
                isRecording
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-amber-500 hover:bg-amber-600"
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
              <p className="mt-2 text-xs font-medium text-neutral-400">{audioLabel}</p>
            ) : null}
          </div>
        ) : (
          <div className="mt-4">
            <LipSyncVoiceLibrary
              copy={voiceCopy}
              voiceKey={voiceKey}
              onVoiceKeyChange={setVoiceKey}
              isEnabled
              language={lang}
            />
          </div>
        )}
      </div>

      {uploading ? (
        <p className="text-xs text-neutral-500">
          {lang === "de" ? "Wird hochgeladen…" : "Uploading…"}
        </p>
      ) : null}
    </>
  );

  return (
    <StudioWhiteToolFrame
      layout="guided"
      promptPlacement="top"
      isPreviewOpen={isPreviewOpen}
      onPreviewClose={() => setIsPreviewOpen(false)}
      previewState={preview}
      showCommandBar={false}
      commandBox={
        inputMode === "system_voice" ? (
          <SmartCommandBox
            value={scriptText}
            onChange={setScriptText}
            onGenerate={() => void handleGenerate()}
            isGenerating={loading}
            disabled={!canGenerate}
            submitLabel={
              lang === "de"
                ? `Generieren (${LIP_SYNC_CREDITS} Credits)`
                : `Generate (${LIP_SYNC_CREDITS} Credits)`
            }
            selectedModelLabel={lang === "de" ? "Lip Sync" : "Lip Sync"}
            selectedModelCredits={LIP_SYNC_CREDITS}
            creditsAvailable={creditsConfirmed ? credits : null}
            currentLanguage={lang}
          />
        ) : undefined
      }
      formatGrid={
        <FormatAspectGrid selectedId={formatId} onSelect={setFormatId} />
      }
      steps={steps}
    />
  );
}

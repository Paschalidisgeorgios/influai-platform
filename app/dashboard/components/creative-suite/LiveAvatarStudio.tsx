"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { KG } from "@/lib/kinetic-glass/classes";
import {
  getDefaultMotionTransferModelId,
  getMotionTransferCredits,
  getMotionTransferModelCatalog,
} from "@/lib/ai/krea-model-ui";
import { getKreaModelById } from "@/lib/ai/krea-model-registry";
import {
  canMotionGenerate,
  formatMotionGenerateBlockReason,
  getMotionGenerateBlockReason,
} from "@/lib/dashboard/motion-generate-guards";
import { useDashboardLanguage } from "../../DashboardLanguageProvider";
import { publicLaunchFlags } from "@/lib/launch/public-flags";
import MotionTransferActivatingCard from "../obsidian/MotionTransferActivatingCard";
import { useCreativeSuite } from "./CreativeSuiteProvider";
import { useStudioUpsell } from "../studio-white/StudioUpsellProvider";
import EngineCardGrid from "../studio-white/EngineCardGrid";
import StudioMediaCanvas from "../studio-white/StudioMediaCanvas";

const RECORD_LIMIT_SECONDS = 10;
const MAX_DRIVING_VIDEO_BYTES = 20 * 1024 * 1024;

const IMAGE_ACCEPT = "image/png,image/jpeg,image/webp";
const VIDEO_ACCEPT = "video/mp4,video/webm,video/quicktime";

type Copy = {
  imageCardTitle: string;
  imageCardHint: string;
  videoCardTitle: string;
  videoCardHint: string;
  replace: string;
  remove: string;
  uploading: string;
  consentLabel: string;
  generate: string;
  generating: string;
  credits: string;
  record: string;
  stopRecording: string;
  recording: string;
  resultTitle: string;
  download: string;
  openInAssets: string;
  generateAgain: string;
  needInputs: string;
  webcamUnsupported: string;
  webcamDenied: string;
};

const COPY: Record<"en" | "de", Copy> = {
  en: {
    imageCardTitle: "Source Character",
    imageCardHint: "PNG, JPEG or WebP portrait",
    videoCardTitle: "Driving Video",
    videoCardHint: "MP4, WebM or MOV · max 20MB",
    replace: "Replace",
    remove: "Remove",
    uploading: "Uploading…",
    consentLabel:
      "I confirm that I have the rights and consent to use this image and video and will not impersonate real people without permission.",
    generate: "Generate Live Avatar (60 Credits)",
    generating: "Generating…",
    credits: "60 Credits",
    record: "Record motion video",
    stopRecording: "Stop recording",
    recording: "Recording…",
    resultTitle: "Your live avatar",
    download: "Download",
    openInAssets: "Open in Assets",
    generateAgain: "Generate Again",
    needInputs: "Add a portrait, a motion video and confirm consent to continue.",
    webcamUnsupported: "Recording is not supported in this browser. Please upload a video instead.",
    webcamDenied: "Camera access was denied. Please upload a video instead.",
  },
  de: {
    imageCardTitle: "Quell-Character",
    imageCardHint: "PNG, JPEG oder WebP Porträt",
    videoCardTitle: "Bewegungs-Video",
    videoCardHint: "MP4, WebM oder MOV · max. 20MB",
    replace: "Ersetzen",
    remove: "Entfernen",
    uploading: "Wird hochgeladen…",
    consentLabel:
      "Ich bestätige, dass ich die Rechte und Zustimmung zur Nutzung dieses Bildes und Videos habe und keine realen Personen ohne Erlaubnis imitiere.",
    generate: "Live Avatar erstellen",
    generating: "Wird erstellt…",
    credits: "60 Credits",
    record: "Bewegungs-Video aufnehmen",
    stopRecording: "Aufnahme stoppen",
    recording: "Aufnahme läuft…",
    resultTitle: "Dein Live Avatar",
    download: "Herunterladen",
    openInAssets: "In Assets öffnen",
    generateAgain: "Erneut erstellen",
    needInputs:
      "Füge ein Porträt und ein Bewegungs-Video hinzu und bestätige die Zustimmung.",
    webcamUnsupported:
      "Aufnahme wird in diesem Browser nicht unterstützt. Bitte lade ein Video hoch.",
    webcamDenied:
      "Kamerazugriff wurde verweigert. Bitte lade ein Video hoch.",
  },
};

type UploadState = {
  previewUrl: string | null;
  remoteUrl: string | null;
  uploading: boolean;
  error: string | null;
};

const emptyUpload: UploadState = {
  previewUrl: null,
  remoteUrl: null,
  uploading: false,
  error: null,
};

export default function LiveAvatarStudio() {
  const router = useRouter();
  const { language } = useDashboardLanguage();
  const { credits, onGenerationQueued } = useCreativeSuite();
  const { handleInsufficientCredits } = useStudioUpsell();
  const copy = COPY[language === "de" ? "de" : "en"];
  const lang = language === "de" ? "de" : "en";

  const motionEngineCatalog = useMemo(
    () => getMotionTransferModelCatalog(lang),
    [lang]
  );

  const supabaseRef = useRef(createClient());

  // Required states (per spec)
  const [sourceImageFile, setSourceImageFile] = useState<File | null>(null);
  const [sourceImagePreviewUrl, setSourceImagePreviewUrl] = useState<string | null>(
    null
  );
  const [sourceImageUrl, setSourceImageUrl] = useState<string | null>(null);

  const [sourceVideoFile, setSourceVideoFile] = useState<File | null>(null);
  const [sourceVideoPreviewUrl, setSourceVideoPreviewUrl] = useState<string | null>(
    null
  );
  const [sourceVideoUrl, setSourceVideoUrl] = useState<string | null>(null);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [recordedVideoBlob, setRecordedVideoBlob] = useState<Blob | null>(null);
  const [recordedVideoPreviewUrl, setRecordedVideoPreviewUrl] = useState<
    string | null
  >(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultVideoUrl, setResultVideoUrl] = useState<string | null>(null);

  const [consentAccepted, setConsentAccepted] = useState(false);
  const [orientation, setOrientation] = useState<
    "portrait" | "landscape" | "auto"
  >("auto");
  const [selectedMotionEngine, setSelectedMotionEngine] = useState(
    getDefaultMotionTransferModelId
  );

  const selectedMotionCredits =
    getMotionTransferCredits(selectedMotionEngine) ?? 25;
  const selectedMotionModel = getKreaModelById(selectedMotionEngine);

  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (sourceImagePreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(sourceImagePreviewUrl);
      }
      if (sourceVideoPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(sourceVideoPreviewUrl);
      }
      if (recordedVideoPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(recordedVideoPreviewUrl);
      }
    };
  }, [sourceImagePreviewUrl, sourceVideoPreviewUrl, recordedVideoPreviewUrl]);

  const getToken = useCallback(async () => {
    const {
      data: { session },
    } = await supabaseRef.current.auth.getSession();
    return session?.access_token ?? null;
  }, []);

  const uploadToLiveAvatarStorage = useCallback(
    async (file: File, kind: "image" | "video") => {
      const token = await getToken();
      if (!token) throw new Error("Session expired.");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", kind);

      const res = await fetch("/api/live-avatar/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.fileUrl) {
        throw new Error(data.error || "Upload failed.");
      }

      return data.fileUrl as string;
    },
    [getToken]
  );

  const handleSelectImage = useCallback(
    async (file: File | null) => {
      if (!file) return;
      setErrorMessage(null);
      setRecordingError(null);
      setSourceImageFile(file);
      setIsUploadingImage(true);

      if (sourceImagePreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(sourceImagePreviewUrl);
      }
      const blobUrl = URL.createObjectURL(file);
      setSourceImagePreviewUrl(blobUrl);

      try {
        const remoteUrl = await uploadToLiveAvatarStorage(file, "image");
        setSourceImageUrl(remoteUrl);
      } catch (e) {
        setErrorMessage(e instanceof Error ? e.message : "Upload failed.");
        setSourceImageUrl(null);
      } finally {
        setIsUploadingImage(false);
      }
    },
    [sourceImagePreviewUrl, uploadToLiveAvatarStorage]
  );

  const handleSelectVideo = useCallback(
    async (file: File | null) => {
      if (!file) return;
      if (file.size > MAX_DRIVING_VIDEO_BYTES) {
        setErrorMessage(
          language === "de"
            ? "Das Bewegungs-Video darf maximal 20MB groß sein."
            : "The driving video must be under 20MB."
        );
        return;
      }
      setErrorMessage(null);
      setRecordingError(null);
      setSourceVideoFile(file);
      setIsUploadingVideo(true);
      setRecordedVideoBlob(null);
      if (recordedVideoPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(recordedVideoPreviewUrl);
        setRecordedVideoPreviewUrl(null);
      }

      if (sourceVideoPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(sourceVideoPreviewUrl);
      }
      const blobUrl = URL.createObjectURL(file);
      setSourceVideoPreviewUrl(blobUrl);

      try {
        const remoteUrl = await uploadToLiveAvatarStorage(file, "video");
        setSourceVideoUrl(remoteUrl);
      } catch (e) {
        setErrorMessage(e instanceof Error ? e.message : "Upload failed.");
        setSourceVideoUrl(null);
      } finally {
        setIsUploadingVideo(false);
      }
    },
    [language, recordedVideoPreviewUrl, sourceVideoPreviewUrl, uploadToLiveAvatarStorage]
  );

  const removeImage = useCallback(() => {
    setSourceImageFile(null);
    setSourceImageUrl(null);
    if (sourceImagePreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(sourceImagePreviewUrl);
    }
    setSourceImagePreviewUrl(null);
  }, [sourceImagePreviewUrl]);

  const removeVideo = useCallback(() => {
    setSourceVideoFile(null);
    setSourceVideoUrl(null);
    if (sourceVideoPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(sourceVideoPreviewUrl);
    }
    setSourceVideoPreviewUrl(null);
    if (recordedVideoPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(recordedVideoPreviewUrl);
    }
    setRecordedVideoPreviewUrl(null);
    setRecordedVideoBlob(null);
  }, [sourceVideoPreviewUrl, recordedVideoPreviewUrl]);

  const openCamera = useCallback(async () => {
    setRecordingError(null);
    setErrorMessage(null);

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setRecordingError(copy.webcamUnsupported);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: true,
      });
      setCameraStream(stream);
      setIsCameraOpen(true);
    } catch {
      setRecordingError(copy.webcamDenied);
    }
  }, [copy.webcamDenied, copy.webcamUnsupported]);

  const closeCamera = useCallback(() => {
    setIsCameraOpen(false);
    setIsRecording(false);
    setRecordingSeconds(0);
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
    mediaRecorderRef.current = null;

    setCameraStream((stream) => {
      stream?.getTracks().forEach((t) => t.stop());
      return null;
    });
  }, []);

  useEffect(() => {
    if (!cameraVideoRef.current) return;
    if (!cameraStream) {
      cameraVideoRef.current.srcObject = null;
      return;
    }
    cameraVideoRef.current.srcObject = cameraStream;
    void cameraVideoRef.current.play().catch(() => {});
  }, [cameraStream]);

  const stopRecording = useCallback(() => {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
  }, []);

  const startRecording = useCallback(async () => {
    setRecordingError(null);
    setErrorMessage(null);

    if (!cameraStream) {
      await openCamera();
      // If openCamera failed, cameraStream will still be null.
      return;
    }

    recordedChunksRef.current = [];
    setRecordedVideoBlob(null);
    if (recordedVideoPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(recordedVideoPreviewUrl);
      setRecordedVideoPreviewUrl(null);
    }

    const mimeType = MediaRecorder.isTypeSupported("video/webm")
      ? "video/webm"
      : "";
    const recorder = new MediaRecorder(cameraStream, mimeType ? { mimeType } : undefined);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) recordedChunksRef.current.push(event.data);
    };

    recorder.onstop = async () => {
      setIsRecording(false);
      setRecordingSeconds(0);

      const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
      if (blob.size === 0) return;
      setRecordedVideoBlob(blob);

      const previewUrl = URL.createObjectURL(blob);
      setRecordedVideoPreviewUrl(previewUrl);
      setSourceVideoPreviewUrl(previewUrl);

      const file = new File([blob], `motion-${Date.now()}.webm`, { type: "video/webm" });
      setSourceVideoFile(file);
      setIsUploadingVideo(true);

      try {
        const remoteUrl = await uploadToLiveAvatarStorage(file, "video");
        setSourceVideoUrl(remoteUrl);
      } catch (e) {
        setErrorMessage(e instanceof Error ? e.message : "Upload failed.");
        setSourceVideoUrl(null);
      } finally {
        setIsUploadingVideo(false);
      }
    };

    recorder.start(250);
    setIsRecording(true);
    setRecordingSeconds(0);

    recordTimerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => {
        const next = prev + 1;
        if (next >= RECORD_LIMIT_SECONDS) stopRecording();
        return next;
      });
    }, 1000);
  }, [
    cameraStream,
    openCamera,
    recordedVideoPreviewUrl,
    stopRecording,
    uploadToLiveAvatarStorage,
  ]);

  useEffect(() => {
    return () => {
      closeCamera();
    };
  }, [closeCamera]);

  const generateBlockReason = getMotionGenerateBlockReason({
    sourceImageUrl,
    sourceVideoUrl,
    consentAccepted,
    selectedModel: selectedMotionModel,
    credits,
    isUploading: isUploadingImage || isUploadingVideo,
    isRecording,
  });

  const canGenerate = generateBlockReason === null && !isGenerating;

  const handleGenerate = async () => {
    if (isGenerating || !sourceImageUrl || !sourceVideoUrl) return;
    if (!canMotionGenerate({
      sourceImageUrl,
      sourceVideoUrl,
      consentAccepted,
      selectedModel: selectedMotionModel,
      credits,
      isUploading: isUploadingImage || isUploadingVideo,
      isRecording,
    })) {
      const reason = getMotionGenerateBlockReason({
        sourceImageUrl,
        sourceVideoUrl,
        consentAccepted,
        selectedModel: selectedMotionModel,
        credits,
        isUploading: isUploadingImage || isUploadingVideo,
        isRecording,
      });
      if (reason) {
        setErrorMessage(
          formatMotionGenerateBlockReason(reason, language === "de" ? "de" : "en")
        );
      }
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setResultVideoUrl(null);

    try {
      const token = await getToken();
      if (!token) {
        setErrorMessage("Session expired. Please sign in again.");
        setIsGenerating(false);
        return;
      }

      const res = await fetch("/api/live-avatar/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sourceImageUrl,
          sourceVideoUrl,
          consentAccepted: consentAccepted,
          orientation,
          kreaModelId: selectedMotionEngine,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.videoUrl) {
        handleInsufficientCredits(res.status, data.code);
        setErrorMessage(data.error || "Generation failed.");
        setIsGenerating(false);
        return;
      }

      setResultVideoUrl(data.videoUrl as string);
      onGenerationQueued();
    } catch {
      setErrorMessage("Generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForAgain = () => {
    setResultVideoUrl(null);
    setErrorMessage(null);
  };

  const motionPreviewSrc = useMemo(() => {
    if (recordedVideoPreviewUrl) return recordedVideoPreviewUrl;
    if (sourceVideoPreviewUrl) return sourceVideoPreviewUrl;
    return null;
  }, [recordedVideoPreviewUrl, sourceVideoPreviewUrl]);

  const previewSrc = resultVideoUrl ?? motionPreviewSrc;

  if (!publicLaunchFlags.motionTransfer) {
    return (
      <div className="relative mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-5xl flex-col items-center justify-center px-4 pb-10">
        <MotionTransferActivatingCard />
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-5xl flex-col items-center px-4 pb-10">
      {isGenerating ? (
        <div className={`mx-auto mb-6 flex h-[40vh] w-full max-w-4xl flex-col items-center justify-center ${KG.glassFloat}`}>
          <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
          <p className="mt-3 text-sm font-medium text-neutral-400">{copy.generating}</p>
        </div>
      ) : (
        <StudioMediaCanvas
          src={previewSrc}
          kind="video"
          emptyLabel={
            language === "de"
              ? "Dein Live Avatar erscheint hier — vollständig sichtbar, zentriert."
              : "Your live avatar appears here — fully visible, centered."
          }
        />
      )}

      <EngineCardGrid
        engines={motionEngineCatalog}
        selectedId={selectedMotionEngine}
        onSelect={setSelectedMotionEngine}
        motionOnlyTabs
      />

      <div className="mt-6 grid w-full max-w-4xl grid-cols-1 gap-4 lg:grid-cols-3">
        <div className={KG.glassCard}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">
              {copy.imageCardTitle}
            </p>
            <span className="text-[11px] font-medium text-neutral-500">{copy.imageCardHint}</span>
          </div>

          <div className="mt-3 overflow-hidden rounded-2xl border border-neutral-800/50 bg-neutral-900/40">
            {sourceImagePreviewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={sourceImagePreviewUrl}
                alt=""
                className={`mx-auto ${KG.previewCanvas}`}
              />
            ) : (
              <button
                type="button"
                onClick={() => document.getElementById("live-avatar-image")?.click()}
                className="flex h-44 w-full items-center justify-center text-sm font-semibold text-neutral-400 hover:text-white"
              >
                + {copy.imageCardTitle}
              </button>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input
              id="live-avatar-image"
              type="file"
              accept={IMAGE_ACCEPT}
              className="hidden"
              onChange={(e) => {
                void handleSelectImage(e.target.files?.[0] ?? null);
                e.currentTarget.value = "";
              }}
            />
            {sourceImagePreviewUrl ? (
              <>
                <button
                  type="button"
                  onClick={() => document.getElementById("live-avatar-image")?.click()}
                  className="rounded-full border border-neutral-700 bg-neutral-900/60 px-3 py-1.5 text-xs font-bold text-neutral-300 hover:border-white/30"
                >
                  {copy.replace}
                </button>
                <button
                  type="button"
                  onClick={removeImage}
                  className="rounded-full border border-neutral-700 bg-neutral-900/60 px-3 py-1.5 text-xs font-bold text-neutral-400 hover:border-white/30"
                >
                  {copy.remove}
                </button>
              </>
            ) : null}
            {isUploadingImage ? (
              <span className="text-xs font-medium text-neutral-500">{copy.uploading}</span>
            ) : null}
          </div>
        </div>

        <div className={`border-dashed ${KG.glassCard}`}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">
              {copy.videoCardTitle}
            </p>
            <span className="text-[11px] font-medium text-neutral-500">{copy.videoCardHint}</span>
          </div>

          <div className="mt-3 overflow-hidden rounded-2xl border border-neutral-800/50 bg-neutral-900/40">
            {isCameraOpen && !motionPreviewSrc ? (
              <video
                ref={cameraVideoRef}
                playsInline
                muted
                className={`mx-auto ${KG.previewCanvas}`}
              />
            ) : motionPreviewSrc ? (
              <video
                src={motionPreviewSrc}
                controls
                playsInline
                className={`mx-auto ${KG.previewCanvas}`}
              />
            ) : (
              <div className="flex h-44 w-full items-center justify-center text-sm font-semibold text-neutral-500">
                {language === "de" ? "Video hochladen oder Kamera öffnen" : "Upload a video or open camera"}
              </div>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input
              id="live-avatar-video"
              type="file"
              accept={VIDEO_ACCEPT}
              className="hidden"
              onChange={(e) => {
                void handleSelectVideo(e.target.files?.[0] ?? null);
                e.currentTarget.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => document.getElementById("live-avatar-video")?.click()}
              className="rounded-full border border-neutral-700 bg-neutral-900/60 px-3 py-1.5 text-xs font-bold text-neutral-300 hover:border-white/30"
            >
              {language === "de" ? "Video hochladen" : "Upload video"}
            </button>

            {!isCameraOpen ? (
              <button
                type="button"
                onClick={openCamera}
                className="rounded-full border border-neutral-700 bg-neutral-900/60 px-3 py-1.5 text-xs font-bold text-neutral-300 hover:border-white/30"
              >
                {language === "de" ? "Kamera öffnen" : "Open camera"}
              </button>
            ) : (
              <button
                type="button"
                onClick={closeCamera}
                className="rounded-full border border-neutral-700 bg-neutral-900/60 px-3 py-1.5 text-xs font-bold text-neutral-300 hover:border-white/30"
              >
                {language === "de" ? "Kamera schließen" : "Close camera"}
              </button>
            )}

            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!isCameraOpen || isUploadingVideo}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                isRecording
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-40"
              }`}
            >
              {isRecording
                ? `${copy.stopRecording} (${RECORD_LIMIT_SECONDS - recordingSeconds}s)`
                : copy.record}
            </button>

            {sourceVideoPreviewUrl ? (
              <button
                type="button"
                onClick={removeVideo}
                className="rounded-full border border-neutral-700 bg-neutral-900/60 px-3 py-1.5 text-xs font-bold text-neutral-400 hover:border-white/30"
              >
                {copy.remove}
              </button>
            ) : null}

            {isUploadingVideo ? (
              <span className="text-xs font-medium text-neutral-500">{copy.uploading}</span>
            ) : null}
          </div>

          {recordingError ? (
            <p className="mt-2 text-xs font-medium text-red-400">{recordingError}</p>
          ) : null}
        </div>

        <div className={KG.glassCard}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">
              {language === "de" ? "Einstellungen" : "Settings"}
            </p>
            <span className="text-[11px] font-medium text-neutral-500">
              {selectedMotionCredits}{" "}
              {language === "de" ? "Credits" : "Credits"}
            </span>
          </div>

          <div className="mt-3 rounded-2xl border border-neutral-800/50 bg-neutral-900/40 p-3">
            <select
              value={orientation}
              onChange={(e) =>
                setOrientation(e.target.value as "portrait" | "landscape" | "auto")
              }
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm font-semibold text-white"
            >
              <option value="auto">{language === "de" ? "Auto" : "Auto"}</option>
              <option value="portrait">{language === "de" ? "Porträt" : "Portrait"}</option>
              <option value="landscape">{language === "de" ? "Landscape" : "Landscape"}</option>
            </select>

            <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-800 bg-neutral-950/40 p-3">
              <input
                type="checkbox"
                checked={consentAccepted}
                onChange={(e) => setConsentAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-amber-500"
              />
              <span className="text-[11px] font-medium leading-4 text-neutral-300">
                {copy.consentLabel}
              </span>
            </label>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={!canGenerate}
              className={`mt-3 inline-flex w-full items-center justify-center px-4 py-2.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40 ${KG.amberBtn}`}
            >
              {isGenerating
                ? copy.generating
                : language === "de"
                  ? `Motion Transfer erstellen (${selectedMotionCredits} Credits)`
                  : `Generate Motion Transfer (${selectedMotionCredits} Credits)`}
            </button>

            {!canGenerate && generateBlockReason ? (
              <p className="mt-2 text-[11px] font-medium leading-snug text-amber-500/80">
                {formatMotionGenerateBlockReason(
                  generateBlockReason,
                  language === "de" ? "de" : "en"
                )}
              </p>
            ) : null}

            <p className="mt-2 text-[11px] font-medium text-neutral-500">
              {credits} {language === "de" ? "Credits verfügbar" : "credits available"}
            </p>
          </div>
        </div>
      </div>

      {errorMessage ? (
        <p className="mt-4 text-sm font-medium text-red-400">{errorMessage}</p>
      ) : null}

      {generateBlockReason && !resultVideoUrl && !isGenerating ? (
        <p className="mt-4 text-xs font-medium text-neutral-500">
          {formatMotionGenerateBlockReason(
            generateBlockReason,
            language === "de" ? "de" : "en"
          )}
        </p>
      ) : null}

      {resultVideoUrl ? (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <a
            href={resultVideoUrl}
            download
            className="rounded-full border border-neutral-700 bg-neutral-900/60 px-4 py-2 text-xs font-bold text-neutral-300 transition hover:border-white/30"
          >
            {copy.download}
          </a>
          <button
            type="button"
            onClick={() => router.push("/dashboard/assets")}
            className="rounded-full border border-neutral-700 bg-neutral-900/60 px-4 py-2 text-xs font-bold text-neutral-300 transition hover:border-white/30"
          >
            {copy.openInAssets}
          </button>
          <button
            type="button"
            onClick={resetForAgain}
            className={`rounded-full px-4 py-2 text-xs font-bold ${KG.amberBtn}`}
          >
            {copy.generateAgain}
          </button>
        </div>
      ) : null}
    </div>
  );
}

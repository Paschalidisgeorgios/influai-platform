"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useDashboardLanguage } from "../../DashboardLanguageProvider";
import { useCreativeSuite } from "./CreativeSuiteProvider";

const LIVE_AVATAR_CREDITS = 60;
const RECORD_LIMIT_SECONDS = 10;

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
    imageCardTitle: "Add character",
    imageCardHint: "PNG, JPEG or WebP",
    videoCardTitle: "Add motion video",
    videoCardHint: "MP4, WebM or MOV",
    replace: "Replace",
    remove: "Remove",
    uploading: "Uploading…",
    consentLabel:
      "I confirm that I have the rights and consent to use this image and video and will not impersonate real people without permission.",
    generate: "Generate Live Avatar",
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
    imageCardTitle: "Creator-Bild hinzufügen",
    imageCardHint: "PNG, JPEG oder WebP",
    videoCardTitle: "Bewegungs-Video hinzufügen",
    videoCardHint: "MP4, WebM oder MOV",
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
  const copy = COPY[language === "de" ? "de" : "en"];

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
    [recordedVideoPreviewUrl, sourceVideoPreviewUrl, uploadToLiveAvatarStorage]
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

  const canGenerate =
    !!sourceImageUrl &&
    !sourceImageUrl.startsWith("blob:") &&
    !!sourceVideoUrl &&
    !sourceVideoUrl.startsWith("blob:") &&
    consentAccepted &&
    !isUploadingImage &&
    !isUploadingVideo &&
    !isRecording &&
    !isGenerating;

  const handleGenerate = async () => {
    if (!canGenerate || !sourceImageUrl || !sourceVideoUrl) return;

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
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.videoUrl) {
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

  return (
    <div className="space-y-4">
      {/* Compact central bar (responsive) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
          {/* Left: character image */}
          <div className="flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {language === "de" ? "Character" : "Character"}
              </p>
              <span className="text-[11px] font-medium text-slate-500">PNG/JPG/WebP</span>
            </div>

            <div className="mt-2 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
              {sourceImagePreviewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={sourceImagePreviewUrl}
                  alt=""
                  className="h-44 w-full object-cover sm:h-40"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => document.getElementById("live-avatar-image")?.click()}
                  className="flex h-44 w-full items-center justify-center text-sm font-semibold text-slate-500 sm:h-40"
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
                    className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-gray-200"
                  >
                    {copy.replace}
                  </button>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-gray-200"
                  >
                    {copy.remove}
                  </button>
                </>
              ) : null}
              {isUploadingImage ? (
                <span className="text-xs font-medium text-slate-500">{copy.uploading}</span>
              ) : null}
            </div>
          </div>

          {/* Plus */}
          <div className="hidden w-10 items-center justify-center lg:flex">
            <span className="text-2xl font-black text-slate-300">+</span>
          </div>

          {/* Middle: motion video / live camera */}
          <div className="flex-[1.2]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {language === "de" ? "Body motion & expression" : "Body motion & expression"}
              </p>
              <span className="text-[11px] font-medium text-slate-500">MP4/WebM/MOV</span>
            </div>

            <div className="mt-2 overflow-hidden rounded-xl border border-gray-200 bg-black">
              {isCameraOpen && !motionPreviewSrc ? (
                <video
                  ref={cameraVideoRef}
                  playsInline
                  muted
                  className="h-44 w-full object-cover sm:h-40"
                />
              ) : motionPreviewSrc ? (
                <video
                  src={motionPreviewSrc}
                  controls
                  playsInline
                  className="h-44 w-full object-cover sm:h-40"
                />
              ) : (
                <div className="flex h-44 w-full items-center justify-center bg-gray-50 text-sm font-semibold text-slate-500 sm:h-40">
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
                className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-gray-200"
              >
                {language === "de" ? "Video hochladen" : "Upload video"}
              </button>

              {!isCameraOpen ? (
                <button
                  type="button"
                  onClick={openCamera}
                  className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-gray-200"
                >
                  {language === "de" ? "Kamera öffnen" : "Open camera"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={closeCamera}
                  className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-gray-200"
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
                    : "bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-40"
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
                  className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-gray-200"
                >
                  {copy.remove}
                </button>
              ) : null}

              {isUploadingVideo ? (
                <span className="text-xs font-medium text-slate-500">{copy.uploading}</span>
              ) : null}
            </div>

            {recordingError ? (
              <p className="mt-2 text-xs font-medium text-red-600">{recordingError}</p>
            ) : null}
          </div>

          {/* Right: orientation + generate */}
          <div className="flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {language === "de" ? "Orientation" : "Orientation"}
              </p>
              <span className="text-[11px] font-medium text-slate-500">
                {LIVE_AVATAR_CREDITS} Credits
              </span>
            </div>

            <div className="mt-2 rounded-xl border border-gray-200 bg-gray-50 p-3">
              <select
                value={orientation}
                onChange={(e) =>
                  setOrientation(e.target.value as "portrait" | "landscape" | "auto")
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900"
              >
                <option value="auto">{language === "de" ? "Auto" : "Auto"}</option>
                <option value="portrait">{language === "de" ? "Porträt" : "Portrait"}</option>
                <option value="landscape">{language === "de" ? "Landscape" : "Landscape"}</option>
              </select>

              <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-white p-3">
                <input
                  type="checkbox"
                  checked={consentAccepted}
                  onChange={(e) => setConsentAccepted(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-orange-500"
                />
                <span className="text-[11px] font-medium leading-4 text-slate-700">
                  {copy.consentLabel}
                </span>
              </label>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={!canGenerate}
                className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isGenerating ? copy.generating : copy.generate}
              </button>
              <p className="mt-2 text-[11px] font-medium text-slate-500">
                {language === "de"
                  ? "Schritt 3: Generieren (Credits werden nur bei Erfolg behalten)."
                  : "Step 3: Generate (credits are refunded on failure)."}
              </p>

              <p className="mt-2 text-xs font-medium text-slate-500">
                {credits} {language === "de" ? "Credits verfügbar" : "credits available"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 shadow-sm">
          {errorMessage}
        </div>
      ) : null}

      {/* Result */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-900">{copy.resultTitle}</h3>
          {resultVideoUrl ? (
            <div className="flex flex-wrap gap-2">
              <a
                href={resultVideoUrl}
                download
                className="inline-flex items-center rounded-full bg-gray-100 px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-gray-200"
              >
                {copy.download}
              </a>
              <button
                type="button"
                onClick={() => router.push("/dashboard/assets")}
                className="inline-flex items-center rounded-full bg-gray-100 px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-gray-200"
              >
                {copy.openInAssets}
              </button>
              <button
                type="button"
                onClick={resetForAgain}
                className="inline-flex items-center rounded-full bg-orange-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-orange-600"
              >
                {copy.generateAgain}
              </button>
            </div>
          ) : null}
        </div>

        <div className="mt-3">
          {resultVideoUrl ? (
            <video
              src={resultVideoUrl}
              controls
              playsInline
              className="w-full rounded-xl bg-black"
            />
          ) : (
            <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white text-sm font-medium text-slate-400">
              {isGenerating ? copy.generating : "—"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

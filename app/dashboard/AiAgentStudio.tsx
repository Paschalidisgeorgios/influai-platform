"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Clapperboard,
  CreditCard,
  ExternalLink,
  GalleryVerticalEnd,
  ImageIcon,
  ImageOff,
  Loader2,
  Lock,
  Megaphone,
  Mic,
  MonitorPlay,
  PenLine,
  Plus,
  Search,
  Send,
  Sparkles,
  Square,
  Upload,
  UserRound,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useDashboardLanguage } from "./DashboardLanguageProvider";
import { formatCopy } from "./i18n";

type Character = {
  id: string;
  name: string;
  reference_image_url: string | null;
  face_workflow?: string | null;
};

type RegenerateDraft = {
  prompt: string;
  characterId: string | null;
  source?: "gallery" | "campaign_planner";
  loadedAt?: number;
};

type Workflow = "standard";
type AgentMode = "auto" | "portrait" | "product" | "campaign";
type ImageModeKey =
  | "standard"
  | "fast_draft"
  | "premium_image"
  | "reference_edit"
  | "brand_assets"
  | "ugc_look";
type ImageModeCardStatus = "live" | "beta" | "planned";

const FAST_DRAFT_PUBLIC_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_FAL_FAST_DRAFT === "true";
const PREMIUM_IMAGE_PUBLIC_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_FAL_PREMIUM_IMAGE === "true";
const REFERENCE_EDIT_PUBLIC_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_FAL_REFERENCE_EDIT === "true";
const BRAND_ASSETS_PUBLIC_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_FAL_BRAND_ASSETS === "true";
const UGC_LOOK_PUBLIC_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_UGC_LOOK === "true";
const VIDEO_STUDIO_PUBLIC_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_FAL_VIDEO_STUDIO === "true";
const LIP_SYNC_PUBLIC_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_FAL_LIP_SYNC === "true";

type StudioTab = "image" | "video" | "lip_sync";

const LIP_SYNC_SOURCE_MAX_BYTES = 50 * 1024 * 1024;
const LIP_SYNC_AUDIO_MAX_BYTES = 25 * 1024 * 1024;

function isLipSyncWorkflow(workflow?: string | null) {
  return workflow === "lip_sync";
}

function isVideoStudioWorkflow(workflow?: string | null) {
  return workflow === "video_image_to_video";
}

function resolveSubmitImageMode(imageMode: ImageModeKey): ImageModeKey {
  if (imageMode === "brand_assets" && BRAND_ASSETS_PUBLIC_ENABLED) {
    return "brand_assets";
  }

  if (imageMode === "ugc_look" && UGC_LOOK_PUBLIC_ENABLED) {
    return "ugc_look";
  }

  if (imageMode === "reference_edit" && REFERENCE_EDIT_PUBLIC_ENABLED) {
    return "reference_edit";
  }

  if (imageMode === "fast_draft" && FAST_DRAFT_PUBLIC_ENABLED) {
    return "fast_draft";
  }

  if (imageMode === "premium_image" && PREMIUM_IMAGE_PUBLIC_ENABLED) {
    return "premium_image";
  }

  return "standard";
}
type ImageModeStatus = "live" | "planned";

type OutputFormatKey =
  | "square"
  | "tiktok"
  | "instagram_post"
  | "instagram_story"
  | "youtube_thumbnail"
  | "youtube_shorts";

type OutputFormat = {
  key: OutputFormatKey;
  label: string;
  platform: string;
  ratio: string;
  description: string;
  icon: typeof Square;
};

type AgentResult = {
  id: string;
  prompt: string;
  image_url: string | null;
  video_url?: string | null;
  workflow?: string | null;
  status: "processing" | "completed" | "failed" | "insufficient_credits" | "active_generation_limit";
  error_message: string | null;
  requiredCredits?: number | null;
  output_format?: string | null;
  image_size?: string | null;
};

type AiAgentStudioProps = {
  charactersRefreshKey?: number;
  regenerateDraft?: RegenerateDraft | null;
  onGenerationQueued?: () => void;
  onClearRegenerateDraft?: () => void;
  onOpenGallery?: () => void;
  onOpenCredits?: () => void;
};

function shouldShowCreditsRefundedHint(
  errorMessage: string | null,
  hasGenerationId: boolean,
  signInAgain: string,
  networkError: string
): boolean {
  if (errorMessage?.toLowerCase().includes("refund")) {
    return false;
  }

  if (!hasGenerationId) {
    if (errorMessage === signInAgain || errorMessage === networkError) {
      return false;
    }
  }

  return true;
}

function getRequiredCreditsForImageMode(imageMode: ImageModeKey): number {
  switch (imageMode) {
    case "ugc_look":
      return 2;
    case "premium_image":
      return 3;
    case "reference_edit":
      return 5;
    case "brand_assets":
      return 4;
    case "fast_draft":
      return 1;
    case "standard":
    default:
      return 1;
  }
}

function getRequiredCreditsForStudio(
  studioTab: StudioTab,
  imageMode: ImageModeKey
): number {
  if (studioTab === "lip_sync" && LIP_SYNC_PUBLIC_ENABLED) {
    return 30;
  }

  if (studioTab === "video" && VIDEO_STUDIO_PUBLIC_ENABLED) {
    return 25;
  }

  return getRequiredCreditsForImageMode(resolveSubmitImageMode(imageMode));
}

const agentModes: {
  key: AgentMode;
  label: string;
  description: string;
}[] = [
  {
    key: "auto",
    label: "Auto",
    description: "Balanced creative direction for most prompts.",
  },
  {
    key: "portrait",
    label: "Portrait",
    description:
      "Best for creator portraits, editorials and people-focused visuals.",
  },
  {
    key: "product",
    label: "Product",
    description: "Best for product shots, brand visuals and ad creatives.",
  },
  {
    key: "campaign",
    label: "Campaign",
    description: "Best for social ads, campaign concepts and creator marketing.",
  },
];

const outputFormats: OutputFormat[] = [
  {
    key: "square",
    label: "Square",
    platform: "General",
    ratio: "1:1",
    description: "Universal post",
    icon: Square,
  },
  {
    key: "tiktok",
    label: "TikTok / Reels",
    platform: "TikTok",
    ratio: "9:16",
    description: "Vertical short-form",
    icon: MonitorPlay,
  },
  {
    key: "instagram_post",
    label: "Instagram Post",
    platform: "Instagram",
    ratio: "4:5",
    description: "Feed portrait",
    icon: ImageIcon,
  },
  {
    key: "instagram_story",
    label: "Instagram Story",
    platform: "Instagram",
    ratio: "9:16",
    description: "Story format",
    icon: ImageIcon,
  },
  {
    key: "youtube_thumbnail",
    label: "YouTube Thumb",
    platform: "YouTube",
    ratio: "16:9",
    description: "Wide thumbnail",
    icon: Clapperboard,
  },
  {
    key: "youtube_shorts",
    label: "YouTube Shorts",
    platform: "YouTube",
    ratio: "9:16",
    description: "Vertical shorts",
    icon: Clapperboard,
  },
];

const quickPrompts = [
  {
    label: "Creator ad",
    icon: MonitorPlay,
    format: "tiktok" as OutputFormatKey,
    prompt:
      "Create a cinematic vertical creator ad for a premium fitness brand, confident female creator, luxury atmosphere, strong social media hook, polished commercial lighting, high-end campaign look.",
  },
  {
    label: "Luxury portrait",
    icon: UserRound,
    format: "instagram_post" as OutputFormatKey,
    prompt:
      "Create a premium editorial portrait of a confident creator with long red hair, realistic skin texture, cinematic golden lighting, elegant fashion styling, high-end social media campaign aesthetic.",
  },
  {
    label: "Product campaign",
    icon: ImageIcon,
    format: "square" as OutputFormatKey,
    prompt:
      "Create a premium product campaign visual with luxury lighting, clean composition, modern creator-brand aesthetic, high contrast, elegant commercial photography, no text, no logo.",
  },
  {
    label: "Ad concept",
    icon: Megaphone,
    format: "instagram_story" as OutputFormatKey,
    prompt:
      "Create a premium social media campaign visual with a strong visual hook, modern creator-brand aesthetic, luxury lighting and high-end commercial quality.",
  },
  {
    label: "Research style",
    icon: Search,
    format: "square" as OutputFormatKey,
    prompt:
      "Create a visual concept inspired by high-performing creator ads: strong composition, clear subject focus, premium commercial style and polished social media campaign quality.",
  },
];

const examplePrompts = [
  "Create a premium fitness creator campaign for Instagram...",
  "Create a cinematic product ad with luxury lighting...",
  "Create a TikTok-ready vertical creator visual...",
  "Create a high-end beauty campaign image...",
  "Create a YouTube thumbnail concept without text...",
];

function buildAgentPrompt(prompt: string, mode: AgentMode) {
  if (mode === "portrait") {
    return `
Mode: creator portrait.

Create a premium creator portrait based on this request:
${prompt}

Focus on realistic facial detail, elegant styling, editorial lighting, social-media-ready framing and premium campaign quality.
    `.trim();
  }

  if (mode === "product") {
    return `
Mode: product / brand visual.

Create a premium product or brand campaign visual based on this request:
${prompt}

Focus on commercial quality, elegant composition, clean lighting, product clarity and high-end advertising aesthetics.
    `.trim();
  }

  if (mode === "campaign") {
    return `
Mode: social media campaign.

Create a cinematic campaign visual based on this request:
${prompt}

Focus on a strong hook, modern creator-brand aesthetics, premium social media composition and high conversion visual appeal.
    `.trim();
  }

  return prompt.trim();
}

function ModeCardBody({
  Icon,
  isLive,
  isSelected,
  label,
  description,
  statusLabel,
  creditNote,
  bestFor,
  comingSoonNote,
  statusTone = "live",
  showLock = false,
}: {
  Icon: typeof ImageIcon;
  isLive: boolean;
  isSelected: boolean;
  label: string;
  description: string;
  statusLabel: string;
  creditNote?: string;
  bestFor?: string;
  comingSoonNote?: string;
  statusTone?: "live" | "beta" | "planned";
  showLock?: boolean;
}) {
  return (
    <>
      {!isLive && (
        <div
          className="pointer-events-none absolute inset-0 rounded-xl bg-[linear-gradient(135deg,rgba(255,255,255,0.03)_0%,transparent_50%)]"
          aria-hidden
        />
      )}

      <div className="relative flex items-start justify-between gap-1.5">
        <div
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg sm:h-7 sm:w-7 ${
            isSelected && isLive
              ? "bg-[#d8ad5f] text-black"
              : isLive
                ? "bg-white/[0.08] text-white/60"
                : "bg-white/[0.05] text-white/45"
          }`}
        >
          <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </div>

        <span
          className={`shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.08em] sm:px-2 sm:text-[9px] ${
            statusTone === "live"
              ? "bg-emerald-500/15 text-emerald-200"
              : statusTone === "beta"
                ? "border border-amber-400/30 bg-amber-500/12 text-amber-100"
                : "border border-[#d8ad5f]/20 bg-[#d8ad5f]/8 text-[#d8ad5f]/80"
          }`}
        >
          {statusLabel}
        </span>
      </div>

      <p
        className={`relative mt-1.5 text-[11px] font-black leading-tight sm:mt-2 sm:text-xs ${
          isLive ? "text-white" : "text-white/55"
        }`}
      >
        {label}
      </p>

      <p className="relative mt-0.5 line-clamp-2 flex-1 text-[9px] leading-3.5 text-white/36 sm:line-clamp-3 sm:text-[10px] sm:leading-4">
        {description}
      </p>

      {creditNote ? (
        <p className="relative mt-1 text-[9px] font-bold uppercase tracking-[0.08em] text-[#d8ad5f]/85">
          {creditNote}
        </p>
      ) : null}

      {bestFor ? (
        <p className="relative mt-0.5 line-clamp-2 text-[8px] leading-3.5 text-white/32 sm:text-[9px]">
          {bestFor}
        </p>
      ) : null}

      {comingSoonNote && !isLive ? (
        <p className="relative mt-1 text-[8px] font-bold uppercase tracking-[0.1em] text-[#d8ad5f]/60">
          {comingSoonNote}
        </p>
      ) : null}

      {showLock && (
        <Lock className="relative mt-1 h-2.5 w-2.5 text-white/25 sm:h-3 sm:w-3" aria-hidden />
      )}
    </>
  );
}

const REFERENCE_EDIT_MAX_BYTES = 12 * 1024 * 1024;

function ReferenceEditPanel({
  label,
  copy,
  panelRef,
  getAccessToken,
  isEnabled,
  sourcePreviewUrl,
  onSourcePreviewUrlChange,
  editInstruction,
  onEditInstructionChange,
}: {
  label: string;
  copy: {
    statusPlanned: string;
    statusActive: string;
    introPlanned: string;
    introActive: string;
    sourceLabel: string;
    sourcePlaceholder: string;
    sourceHint: string;
    uploadSourceImage: string;
    uploading: string;
    clearImage: string;
    invalidFile: string;
    fileTooLarge: string;
    uploadFailed: string;
    instructionLabel: string;
    instructionPlaceholder: string;
    previewLabel: string;
    previewPlaceholder: string;
    generateDisabled: string;
    generationNotActive: string;
    plannedNote: string;
    activeNote: string;
  };
  panelRef: React.RefObject<HTMLDivElement | null>;
  getAccessToken: () => Promise<string | null>;
  isEnabled: boolean;
  sourcePreviewUrl: string | null;
  onSourcePreviewUrlChange: (url: string | null) => void;
  editInstruction: string;
  onEditInstructionChange: (value: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const blobPreviewRef = useRef<string | null>(null);
  const [localFileError, setLocalFileError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    return () => {
      if (blobPreviewRef.current) {
        URL.revokeObjectURL(blobPreviewRef.current);
      }
    };
  }, []);

  function revokeBlobPreview() {
    if (blobPreviewRef.current) {
      URL.revokeObjectURL(blobPreviewRef.current);
      blobPreviewRef.current = null;
    }
  }

  function clearSourceImage() {
    revokeBlobPreview();
    onSourcePreviewUrlChange(null);
    setLocalFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSourceFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    const mime = file.type.toLowerCase();
    const allowedMime = new Set([
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ]);
    const allowedByName = /\.(png|jpe?g|webp)$/i.test(file.name);

    if (!(allowedMime.has(mime) || (allowedByName && file.type.startsWith("image/")))) {
      setLocalFileError(copy.invalidFile);
      return;
    }

    if (file.size > REFERENCE_EDIT_MAX_BYTES) {
      setLocalFileError(copy.fileTooLarge);
      return;
    }

    setLocalFileError(null);
    revokeBlobPreview();

    const blobUrl = URL.createObjectURL(file);
    blobPreviewRef.current = blobUrl;
    onSourcePreviewUrlChange(blobUrl);
    setUploading(true);

    try {
      const token = await getAccessToken();

      if (!token) {
        setLocalFileError(copy.uploadFailed);
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/reference-sources/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = (await response.json()) as {
        imageUrl?: string;
        error?: string;
      };

      if (!response.ok || !data.imageUrl) {
        setLocalFileError(data.error ?? copy.uploadFailed);
        return;
      }

      revokeBlobPreview();
      onSourcePreviewUrlChange(data.imageUrl);
    } catch {
      setLocalFileError(copy.uploadFailed);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  const panelStatus = isEnabled ? copy.statusActive : copy.statusPlanned;
  const panelIntro = isEnabled ? copy.introActive : copy.introPlanned;

  return (
    <motion.div
      ref={panelRef}
      id="reference-edit-preview"
      aria-label={copy.sourceLabel}
      initial={false}
      className="mt-2.5 rounded-xl border border-[#d8ad5f]/15 bg-[linear-gradient(165deg,rgba(216,173,95,0.07)_0%,rgba(0,0,0,0.35)_45%)] p-2.5 sm:p-3"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={handleSourceFileChange}
      />

      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-black text-white/85 sm:text-xs">{label}</p>
          <p className="mt-0.5 text-[9px] leading-4 text-white/38">{panelIntro}</p>
        </div>
        <span className="shrink-0 rounded-full border border-[#d8ad5f]/25 bg-[#d8ad5f]/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.1em] text-[#d8ad5f]/90">
          {panelStatus}
        </span>
      </div>

      <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 sm:gap-2.5">
        <div className="flex min-h-[7rem] flex-col rounded-lg border border-dashed border-white/12 bg-black/30 p-2 sm:min-h-[7.5rem]">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/40">
              {copy.sourceLabel}
            </p>
            {sourcePreviewUrl ? (
              <button
                type="button"
                onClick={clearSourceImage}
                disabled={uploading}
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold text-white/45 transition hover:bg-white/[0.06] hover:text-white/70 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-3 w-3" aria-hidden />
                {copy.clearImage}
              </button>
            ) : null}
          </div>

          {sourcePreviewUrl ? (
            <div className="relative mt-2 flex flex-1 overflow-hidden rounded-lg border border-white/10 bg-black/50">
              <img
                src={sourcePreviewUrl}
                alt=""
                className="h-full max-h-[5.5rem] w-full object-contain sm:max-h-[6rem]"
              />
            </div>
          ) : (
            <div className="mt-2 flex flex-1 flex-col items-center justify-center gap-1.5 text-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06] text-white/35">
                <Upload className="h-4 w-4" aria-hidden />
              </div>
              <p className="text-[10px] font-semibold text-white/50">
                {copy.sourcePlaceholder}
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="mt-0.5 inline-flex items-center justify-center gap-1.5 rounded-full border border-[#d8ad5f]/30 bg-[#d8ad5f]/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-[#d8ad5f]/90 transition hover:bg-[#d8ad5f]/18 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploading ? (
                  <>
                    <Loader2
                      className="h-3 w-3 animate-spin"
                      aria-hidden
                    />
                    {copy.uploading}
                  </>
                ) : (
                  copy.uploadSourceImage
                )}
              </button>
            </div>
          )}

          <p className="mt-1.5 text-center text-[9px] text-white/28">{copy.sourceHint}</p>
          {localFileError ? (
            <p className="mt-1 text-center text-[9px] font-medium text-amber-200/80">
              {localFileError}
            </p>
          ) : null}
        </div>

        <div className="flex min-h-[7rem] flex-col sm:min-h-[7.5rem]">
          <label
            htmlFor="reference-edit-instruction"
            className="text-[9px] font-black uppercase tracking-[0.12em] text-white/40"
          >
            {copy.instructionLabel}
          </label>
          <textarea
            id="reference-edit-instruction"
            value={editInstruction}
            onChange={(event) => onEditInstructionChange(event.target.value)}
            rows={4}
            placeholder={copy.instructionPlaceholder}
            className="mt-1.5 min-h-[5rem] flex-1 resize-y rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-[10px] leading-4 text-white/70 placeholder:text-white/22 outline-none focus-visible:ring-2 focus-visible:ring-[#d8ad5f]/30 sm:min-h-[5.5rem]"
          />
        </div>

        <div className="flex min-h-[7rem] flex-col sm:min-h-[7.5rem] lg:col-span-1">
          <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/40">
            {copy.previewLabel}
          </p>
          <div className="mt-1.5 flex flex-1 flex-col items-center justify-center rounded-lg border border-white/[0.08] bg-black/35 px-2 py-3 text-center">
            <ImageOff className="h-5 w-5 text-white/20" aria-hidden />
            <p className="mt-2 text-[10px] text-white/32">{copy.previewPlaceholder}</p>
          </div>
        </div>
      </div>

      {!isEnabled ? (
        <>
          <div className="mt-2.5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              disabled
              aria-disabled="true"
              title={copy.generateDisabled}
              className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-white/35"
            >
              <Lock className="h-3.5 w-3.5" aria-hidden />
              {copy.generateDisabled}
            </button>
            <p className="text-[9px] leading-3.5 text-white/30 sm:max-w-[55%]">
              {copy.plannedNote}
            </p>
          </div>

          <p className="mt-2 text-[9px] leading-4 text-white/32">
            {copy.generationNotActive}
          </p>
        </>
      ) : (
        <p className="mt-2.5 text-[9px] leading-4 text-white/32">{copy.activeNote}</p>
      )}
    </motion.div>
  );
}

function VideoStudioPanel({
  label,
  copy,
  panelRef,
  getAccessToken,
  isEnabled,
  sourcePreviewUrl,
  onSourcePreviewUrlChange,
  motionPrompt,
  onMotionPromptChange,
  onMotionKeyDown,
}: {
  label: string;
  copy: {
    statusPlanned: string;
    statusActive: string;
    introPlanned: string;
    introActive: string;
    sourceLabel: string;
    sourcePlaceholder: string;
    sourceHint: string;
    uploadSourceImage: string;
    uploading: string;
    clearImage: string;
    invalidFile: string;
    fileTooLarge: string;
    uploadFailed: string;
    motionLabel: string;
    motionPlaceholder: string;
    motionHint: string;
    activeNote: string;
  };
  panelRef: React.RefObject<HTMLDivElement | null>;
  getAccessToken: () => Promise<string | null>;
  isEnabled: boolean;
  sourcePreviewUrl: string | null;
  onSourcePreviewUrlChange: (url: string | null) => void;
  motionPrompt: string;
  onMotionPromptChange: (value: string) => void;
  onMotionKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const blobPreviewRef = useRef<string | null>(null);
  const [localFileError, setLocalFileError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    return () => {
      if (blobPreviewRef.current) {
        URL.revokeObjectURL(blobPreviewRef.current);
      }
    };
  }, []);

  function revokeBlobPreview() {
    if (blobPreviewRef.current) {
      URL.revokeObjectURL(blobPreviewRef.current);
      blobPreviewRef.current = null;
    }
  }

  function clearSourceImage() {
    revokeBlobPreview();
    onSourcePreviewUrlChange(null);
    setLocalFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSourceFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    const mime = file.type.toLowerCase();
    const allowedMime = new Set([
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ]);
    const allowedByName = /\.(png|jpe?g|webp)$/i.test(file.name);

    if (!(allowedMime.has(mime) || (allowedByName && file.type.startsWith("image/")))) {
      setLocalFileError(copy.invalidFile);
      return;
    }

    if (file.size > REFERENCE_EDIT_MAX_BYTES) {
      setLocalFileError(copy.fileTooLarge);
      return;
    }

    setLocalFileError(null);
    revokeBlobPreview();

    const blobUrl = URL.createObjectURL(file);
    blobPreviewRef.current = blobUrl;
    onSourcePreviewUrlChange(blobUrl);
    setUploading(true);

    try {
      const token = await getAccessToken();

      if (!token) {
        setLocalFileError(copy.uploadFailed);
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/reference-sources/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = (await response.json()) as {
        imageUrl?: string;
        error?: string;
      };

      if (!response.ok || !data.imageUrl) {
        setLocalFileError(data.error ?? copy.uploadFailed);
        return;
      }

      revokeBlobPreview();
      onSourcePreviewUrlChange(data.imageUrl);
    } catch {
      setLocalFileError(copy.uploadFailed);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  const panelStatus = isEnabled ? copy.statusActive : copy.statusPlanned;
  const panelIntro = isEnabled ? copy.introActive : copy.introPlanned;

  return (
    <motion.div
      ref={panelRef}
      id="video-studio-panel"
      aria-label={label}
      initial={false}
      className="mt-2.5 rounded-xl border border-sky-500/15 bg-[linear-gradient(165deg,rgba(56,189,248,0.08)_0%,rgba(0,0,0,0.35)_45%)] p-2.5 sm:p-3"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={handleSourceFileChange}
      />

      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-black text-white/85 sm:text-xs">{label}</p>
          <p className="mt-0.5 text-[9px] leading-4 text-white/38">{panelIntro}</p>
        </div>
        <span className="shrink-0 rounded-full border border-sky-500/25 bg-sky-500/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.1em] text-sky-100/90">
          {panelStatus}
        </span>
      </div>

      <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5">
        <div className="flex min-h-[7rem] flex-col rounded-lg border border-dashed border-white/12 bg-black/30 p-2 sm:min-h-[7.5rem]">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/40">
              {copy.sourceLabel}
            </p>
            {sourcePreviewUrl ? (
              <button
                type="button"
                onClick={clearSourceImage}
                disabled={uploading}
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold text-white/45 transition hover:bg-white/[0.06] hover:text-white/70 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-3 w-3" aria-hidden />
                {copy.clearImage}
              </button>
            ) : null}
          </div>

          {sourcePreviewUrl ? (
            <div className="relative mt-2 flex flex-1 overflow-hidden rounded-lg border border-white/10 bg-black/50">
              <img
                src={sourcePreviewUrl}
                alt=""
                className="h-full max-h-[5.5rem] w-full object-contain sm:max-h-[6rem]"
              />
            </div>
          ) : (
            <div className="mt-2 flex flex-1 flex-col items-center justify-center gap-1.5 text-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06] text-white/35">
                <Upload className="h-4 w-4" aria-hidden />
              </div>
              <p className="text-[10px] font-semibold text-white/50">
                {copy.sourcePlaceholder}
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || !isEnabled}
                className="mt-0.5 inline-flex items-center justify-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-sky-100/90 transition hover:bg-sky-500/18 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                    {copy.uploading}
                  </>
                ) : (
                  copy.uploadSourceImage
                )}
              </button>
            </div>
          )}

          <p className="mt-1.5 text-center text-[9px] text-white/28">{copy.sourceHint}</p>
          {localFileError ? (
            <p className="mt-1 text-center text-[9px] font-medium text-amber-200/80">
              {localFileError}
            </p>
          ) : null}
        </div>

        <div className="flex min-h-[7rem] flex-col sm:min-h-[7.5rem]">
          <label
            htmlFor="video-studio-motion"
            className="text-[9px] font-black uppercase tracking-[0.12em] text-white/40"
          >
            {copy.motionLabel}
          </label>
          <textarea
            id="video-studio-motion"
            value={motionPrompt}
            onChange={(event) => onMotionPromptChange(event.target.value)}
            onKeyDown={onMotionKeyDown}
            rows={5}
            disabled={!isEnabled}
            placeholder={copy.motionPlaceholder}
            className="mt-1.5 min-h-[5rem] flex-1 resize-y rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-[10px] leading-4 text-white/70 placeholder:text-white/22 outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30 disabled:opacity-50 sm:min-h-[5.5rem]"
          />
          <p className="mt-1.5 text-[9px] text-white/28">{copy.motionHint}</p>
        </div>
      </div>

      {isEnabled ? (
        <p className="mt-2.5 text-[9px] leading-4 text-white/32">{copy.activeNote}</p>
      ) : (
        <p className="mt-2.5 text-[9px] leading-4 text-white/32">{copy.introPlanned}</p>
      )}
    </motion.div>
  );
}

function LipSyncStudioPanel({
  label,
  copy,
  panelRef,
  getAccessToken,
  isEnabled,
  sourcePreviewUrl,
  sourceMediaType,
  onSourceChange,
  audioPreviewLabel,
  audioUrl,
  onAudioChange,
  instructions,
  onInstructionsChange,
  onInstructionsKeyDown,
}: {
  label: string;
  copy: {
    statusPlanned: string;
    statusActive: string;
    introPlanned: string;
    introActive: string;
    sourceLabel: string;
    sourcePlaceholder: string;
    sourceHint: string;
    uploadSource: string;
    audioLabel: string;
    audioPlaceholder: string;
    audioHint: string;
    uploadAudio: string;
    uploading: string;
    clearSource: string;
    clearAudio: string;
    invalidSource: string;
    invalidAudio: string;
    sourceTooLarge: string;
    audioTooLarge: string;
    uploadFailed: string;
    instructionsLabel: string;
    instructionsPlaceholder: string;
    activeNote: string;
  };
  panelRef: React.RefObject<HTMLDivElement | null>;
  getAccessToken: () => Promise<string | null>;
  isEnabled: boolean;
  sourcePreviewUrl: string | null;
  sourceMediaType: "image" | "video" | null;
  onSourceChange: (
    url: string | null,
    mediaType: "image" | "video" | null
  ) => void;
  audioPreviewLabel: string | null;
  audioUrl: string | null;
  onAudioChange: (url: string | null, label: string | null) => void;
  instructions: string;
  onInstructionsChange: (value: string) => void;
  onInstructionsKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}) {
  const sourceInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const blobPreviewRef = useRef<string | null>(null);
  const [localFileError, setLocalFileError] = useState<string | null>(null);
  const [uploadingSource, setUploadingSource] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);

  useEffect(() => {
    return () => {
      if (blobPreviewRef.current) {
        URL.revokeObjectURL(blobPreviewRef.current);
      }
    };
  }, []);

  function revokeBlobPreview() {
    if (blobPreviewRef.current) {
      URL.revokeObjectURL(blobPreviewRef.current);
      blobPreviewRef.current = null;
    }
  }

  function clearSource() {
    revokeBlobPreview();
    onSourceChange(null, null);
    setLocalFileError(null);
    if (sourceInputRef.current) {
      sourceInputRef.current.value = "";
    }
  }

  function clearAudio() {
    onAudioChange(null, null);
    setLocalFileError(null);
    if (audioInputRef.current) {
      audioInputRef.current.value = "";
    }
  }

  async function uploadLipSyncFile(
    file: File,
    uploadType: "source" | "audio"
  ): Promise<{ fileUrl?: string; fileType?: string; error?: string }> {
    const token = await getAccessToken();

    if (!token) {
      return { error: copy.uploadFailed };
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", uploadType);

    const response = await fetch("/api/lip-sync/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = (await response.json()) as {
      fileUrl?: string;
      fileType?: string;
      error?: string;
    };

    if (!response.ok || !data.fileUrl) {
      return { error: data.error ?? copy.uploadFailed };
    }

    return { fileUrl: data.fileUrl, fileType: data.fileType };
  }

  async function handleSourceFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    const mime = file.type.toLowerCase();
    const isImage =
      mime.startsWith("image/") || /\.(png|jpe?g|webp)$/i.test(file.name);
    const isVideo =
      mime.startsWith("video/") || /\.(mp4|webm|mov)$/i.test(file.name);

    if (!isImage && !isVideo) {
      setLocalFileError(copy.invalidSource);
      return;
    }

    if (file.size > LIP_SYNC_SOURCE_MAX_BYTES) {
      setLocalFileError(copy.sourceTooLarge);
      return;
    }

    setLocalFileError(null);
    revokeBlobPreview();

    const blobUrl = URL.createObjectURL(file);
    blobPreviewRef.current = blobUrl;
    const previewType: "image" | "video" = isVideo ? "video" : "image";
    onSourceChange(blobUrl, previewType);
    setUploadingSource(true);

    try {
      const result = await uploadLipSyncFile(file, "source");

      if (!result.fileUrl) {
        setLocalFileError(result.error ?? copy.uploadFailed);
        return;
      }

      revokeBlobPreview();
      const mediaType =
        result.fileType === "video"
          ? "video"
          : result.fileType === "image"
            ? "image"
            : previewType;
      onSourceChange(result.fileUrl, mediaType);
    } catch {
      setLocalFileError(copy.uploadFailed);
    } finally {
      setUploadingSource(false);
      if (sourceInputRef.current) {
        sourceInputRef.current.value = "";
      }
    }
  }

  async function handleAudioFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    const mime = file.type.toLowerCase();
    const allowedAudio =
      mime.startsWith("audio/") || /\.(mp3|wav|aac|ogg|m4a)$/i.test(file.name);

    if (!allowedAudio) {
      setLocalFileError(copy.invalidAudio);
      return;
    }

    if (file.size > LIP_SYNC_AUDIO_MAX_BYTES) {
      setLocalFileError(copy.audioTooLarge);
      return;
    }

    setLocalFileError(null);
    setUploadingAudio(true);

    try {
      const result = await uploadLipSyncFile(file, "audio");

      if (!result.fileUrl) {
        setLocalFileError(result.error ?? copy.uploadFailed);
        return;
      }

      onAudioChange(result.fileUrl, file.name);
    } catch {
      setLocalFileError(copy.uploadFailed);
    } finally {
      setUploadingAudio(false);
      if (audioInputRef.current) {
        audioInputRef.current.value = "";
      }
    }
  }

  const panelStatus = isEnabled ? copy.statusActive : copy.statusPlanned;
  const panelIntro = isEnabled ? copy.introActive : copy.introPlanned;
  const uploading = uploadingSource || uploadingAudio;

  return (
    <motion.div
      ref={panelRef}
      id="lip-sync-studio-panel"
      aria-label={label}
      initial={false}
      className="mt-2.5 rounded-xl border border-violet-500/15 bg-[linear-gradient(165deg,rgba(139,92,246,0.08)_0%,rgba(0,0,0,0.35)_45%)] p-2.5 sm:p-3"
    >
      <input
        ref={sourceInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,video/mp4,video/webm,video/quicktime,.mov"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={handleSourceFileChange}
      />
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/mp4,audio/aac,audio/ogg,.mp3,.wav,.aac,.ogg,.m4a"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={handleAudioFileChange}
      />

      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-black text-white/85 sm:text-xs">{label}</p>
          <p className="mt-0.5 text-[9px] leading-4 text-white/38">{panelIntro}</p>
        </div>
        <span className="shrink-0 rounded-full border border-violet-500/25 bg-violet-500/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.1em] text-violet-100/90">
          {panelStatus}
        </span>
      </div>

      <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5">
        <div className="flex min-h-[7rem] flex-col rounded-lg border border-dashed border-white/12 bg-black/30 p-2 sm:min-h-[7.5rem]">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/40">
              {copy.sourceLabel}
            </p>
            {sourcePreviewUrl ? (
              <button
                type="button"
                onClick={clearSource}
                disabled={uploading}
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold text-white/45 transition hover:bg-white/[0.06] hover:text-white/70 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-3 w-3" aria-hidden />
                {copy.clearSource}
              </button>
            ) : null}
          </div>

          {sourcePreviewUrl ? (
            <div className="relative mt-2 flex flex-1 items-center justify-center overflow-hidden rounded-md bg-black/50">
              {sourceMediaType === "video" ? (
                <video
                  src={sourcePreviewUrl}
                  className="max-h-28 w-full object-contain"
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={sourcePreviewUrl}
                  alt=""
                  className="max-h-28 w-full object-contain"
                />
              )}
            </div>
          ) : (
            <button
              type="button"
              disabled={!isEnabled || uploadingSource}
              onClick={() => sourceInputRef.current?.click()}
              className="mt-2 flex flex-1 flex-col items-center justify-center gap-2 rounded-md border border-white/10 bg-black/35 px-3 py-4 text-center transition hover:border-violet-500/30 hover:bg-violet-500/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploadingSource ? (
                <Loader2 className="h-5 w-5 animate-spin text-violet-200" />
              ) : (
                <Upload className="h-5 w-5 text-violet-200/80" />
              )}
              <span className="text-[10px] font-bold text-white/55">
                {uploadingSource ? copy.uploading : copy.uploadSource}
              </span>
              <span className="text-[9px] text-white/30">{copy.sourceHint}</span>
            </button>
          )}
        </div>

        <div className="flex min-h-[7rem] flex-col rounded-lg border border-dashed border-white/12 bg-black/30 p-2 sm:min-h-[7.5rem]">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/40">
              {copy.audioLabel}
            </p>
            {audioUrl ? (
              <button
                type="button"
                onClick={clearAudio}
                disabled={uploading}
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold text-white/45 transition hover:bg-white/[0.06] hover:text-white/70 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-3 w-3" aria-hidden />
                {copy.clearAudio}
              </button>
            ) : null}
          </div>

          {audioUrl ? (
            <div className="mt-2 flex flex-1 flex-col justify-center gap-2 rounded-md border border-white/10 bg-black/40 p-3">
              <Mic className="h-5 w-5 text-violet-200/80" aria-hidden />
              <p className="line-clamp-2 text-[10px] font-semibold text-white/65">
                {audioPreviewLabel ?? copy.audioPlaceholder}
              </p>
              <audio src={audioUrl} controls className="w-full" />
            </div>
          ) : (
            <button
              type="button"
              disabled={!isEnabled || uploadingAudio}
              onClick={() => audioInputRef.current?.click()}
              className="mt-2 flex flex-1 flex-col items-center justify-center gap-2 rounded-md border border-white/10 bg-black/35 px-3 py-4 text-center transition hover:border-violet-500/30 hover:bg-violet-500/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploadingAudio ? (
                <Loader2 className="h-5 w-5 animate-spin text-violet-200" />
              ) : (
                <Mic className="h-5 w-5 text-violet-200/80" />
              )}
              <span className="text-[10px] font-bold text-white/55">
                {uploadingAudio ? copy.uploading : copy.uploadAudio}
              </span>
              <span className="text-[9px] text-white/30">{copy.audioHint}</span>
            </button>
          )}
        </div>
      </div>

      <div className="mt-2.5">
        <label
          htmlFor="lip-sync-instructions"
          className="text-[9px] font-black uppercase tracking-[0.12em] text-white/40"
        >
          {copy.instructionsLabel}
        </label>
        <textarea
          id="lip-sync-instructions"
          value={instructions}
          onChange={(event) => onInstructionsChange(event.target.value)}
          onKeyDown={onInstructionsKeyDown}
          rows={3}
          disabled={!isEnabled}
          placeholder={copy.instructionsPlaceholder}
          className="mt-1.5 w-full resize-y rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-[10px] leading-4 text-white/70 placeholder:text-white/22 outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30 disabled:opacity-50"
        />
      </div>

      {localFileError ? (
        <p className="mt-2 text-[10px] font-semibold text-red-200/90">{localFileError}</p>
      ) : null}

      {isEnabled ? (
        <p className="mt-2.5 text-[9px] leading-4 text-white/32">{copy.activeNote}</p>
      ) : null}
    </motion.div>
  );
}

export default function AiAgentStudio({
  charactersRefreshKey = 0,
  regenerateDraft = null,
  onGenerationQueued,
  onClearRegenerateDraft,
  onOpenGallery,
  onOpenCredits,
}: AiAgentStudioProps) {
  const { copy, format } = useDashboardLanguage();
  const a = copy.agent;
  const suite = copy.studioSuite;
  const supabase = createClient();

  const imageModes = useMemo(
    () => [
      {
        key: "standard" as const,
        label: a.imageModes.standard.label,
        description: a.imageModes.standard.description,
        status: "live" as ImageModeCardStatus,
        creditNote: suite.modes.standard.credits,
        bestFor: suite.modes.standard.bestFor,
        icon: ImageIcon,
      },
      {
        key: "ugc_look" as const,
        label: a.imageModes.ugcLook.label,
        description: a.imageModes.ugcLook.description,
        hoverHint: a.imageModes.ugcLook.hoverHint,
        status: (UGC_LOOK_PUBLIC_ENABLED ? "beta" : "planned") as ImageModeCardStatus,
        creditNote: suite.modes.ugcLook.credits,
        bestFor: suite.modes.ugcLook.bestFor,
        icon: Clapperboard,
      },
      {
        key: "fast_draft" as const,
        label: a.imageModes.fastDraft.label,
        description: a.imageModes.fastDraft.description,
        status: (FAST_DRAFT_PUBLIC_ENABLED
          ? "beta"
          : "planned") as ImageModeCardStatus,
        creditNote: suite.modes.fastDraft.credits,
        bestFor: suite.modes.fastDraft.bestFor,
        icon: Zap,
      },
      {
        key: "premium_image" as const,
        label: a.imageModes.premium.label,
        description: a.imageModes.premium.description,
        status: (PREMIUM_IMAGE_PUBLIC_ENABLED
          ? "beta"
          : "planned") as ImageModeCardStatus,
        creditNote: suite.modes.premium.credits,
        bestFor: suite.modes.premium.bestFor,
        icon: Sparkles,
      },
      {
        key: "reference_edit" as const,
        label: a.imageModes.referenceEdit.label,
        description: a.imageModes.referenceEdit.description,
        hoverHint: a.imageModes.referenceEdit.hoverHint,
        comingSoonNote: a.imageModes.comingSoon,
        status: (REFERENCE_EDIT_PUBLIC_ENABLED
          ? "beta"
          : "planned") as ImageModeCardStatus,
        creditNote: suite.modes.referenceEdit.credits,
        bestFor: suite.modes.referenceEdit.bestFor,
        icon: PenLine,
      },
      {
        key: "brand_assets" as const,
        label: a.imageModes.brandAssets.label,
        description: a.imageModes.brandAssets.description,
        hoverHint: a.imageModes.brandAssets.hoverHint,
        comingSoonNote: a.imageModes.comingSoon,
        status: (BRAND_ASSETS_PUBLIC_ENABLED
          ? "beta"
          : "planned") as ImageModeCardStatus,
        creditNote: suite.modes.brandAssets.credits,
        bestFor: suite.modes.brandAssets.bestFor,
        icon: Megaphone,
      },
    ],
    [a, suite]
  );

  const localizedOutputFormats = useMemo(
    () =>
      outputFormats.map((formatOption) => ({
        ...formatOption,
        label: a.formats[formatOption.key].label,
        platform: a.formats[formatOption.key].platform,
        description: a.formats[formatOption.key].description,
      })),
    [a]
  );

  const formRef = useRef<HTMLFormElement | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);
  const submitInFlightRef = useRef(false);
  const referenceEditPanelRef = useRef<HTMLDivElement | null>(null);
  const videoStudioPanelRef = useRef<HTMLDivElement | null>(null);
  const lipSyncPanelRef = useRef<HTMLDivElement | null>(null);

  const [studioTab, setStudioTab] = useState<StudioTab>("image");
  const [videoSourceUrl, setVideoSourceUrl] = useState<string | null>(null);
  const [videoMotionPrompt, setVideoMotionPrompt] = useState("");
  const [lipSyncSourceUrl, setLipSyncSourceUrl] = useState<string | null>(null);
  const [lipSyncSourceMediaType, setLipSyncSourceMediaType] = useState<
    "image" | "video" | null
  >(null);
  const [lipSyncAudioUrl, setLipSyncAudioUrl] = useState<string | null>(null);
  const [lipSyncAudioLabel, setLipSyncAudioLabel] = useState<string | null>(null);
  const [lipSyncInstructions, setLipSyncInstructions] = useState("");

  const [prompt, setPrompt] = useState("");
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState("");
  const [workflow] = useState<Workflow>("standard");
  const [imageMode, setImageMode] = useState<ImageModeKey>("standard");
  const [referenceEditSourceUrl, setReferenceEditSourceUrl] = useState<
    string | null
  >(null);
  const [referenceEditInstruction, setReferenceEditInstruction] = useState("");

  const isVideoStudioActive =
    studioTab === "video" && VIDEO_STUDIO_PUBLIC_ENABLED;
  const isLipSyncActive =
    studioTab === "lip_sync" && LIP_SYNC_PUBLIC_ENABLED;
  const videoStudioReady =
    Boolean(videoSourceUrl?.trim()) && Boolean(videoMotionPrompt.trim());
  const videoSubmitBlocked = isVideoStudioActive && !videoStudioReady;
  const lipSyncReady =
    Boolean(lipSyncSourceUrl?.trim()) &&
    Boolean(lipSyncAudioUrl?.trim()) &&
    Boolean(lipSyncSourceMediaType);
  const lipSyncSubmitBlocked = isLipSyncActive && !lipSyncReady;

  const imageModeActiveNote = useMemo(() => {
    if (isLipSyncActive) {
      return a.imageModeLipSyncActiveNote;
    }

    if (isVideoStudioActive) {
      return a.imageModeVideoStudioActiveNote;
    }

    if (imageMode === "ugc_look" && UGC_LOOK_PUBLIC_ENABLED) {
      return a.imageModeUGCLookActiveNote;
    }

    if (imageMode === "brand_assets" && BRAND_ASSETS_PUBLIC_ENABLED) {
      return a.imageModeBrandAssetsActiveNote;
    }

    if (imageMode === "reference_edit" && REFERENCE_EDIT_PUBLIC_ENABLED) {
      return a.imageModeReferenceEditActiveNote;
    }

    if (imageMode === "fast_draft" && FAST_DRAFT_PUBLIC_ENABLED) {
      return a.imageModeFastDraftActiveNote;
    }

    if (imageMode === "premium_image" && PREMIUM_IMAGE_PUBLIC_ENABLED) {
      return a.imageModePremiumActiveNote;
    }

    return a.imageModeStandardActiveNote;
  }, [a, imageMode, isVideoStudioActive, isLipSyncActive]);

  const imageModeUsesBetaBadge =
    isLipSyncActive ||
    isVideoStudioActive ||
    (imageMode === "ugc_look" && UGC_LOOK_PUBLIC_ENABLED) ||
    (imageMode === "brand_assets" && BRAND_ASSETS_PUBLIC_ENABLED) ||
    (imageMode === "reference_edit" && REFERENCE_EDIT_PUBLIC_ENABLED) ||
    (imageMode === "fast_draft" && FAST_DRAFT_PUBLIC_ENABLED) ||
    (imageMode === "premium_image" && PREMIUM_IMAGE_PUBLIC_ENABLED);

  const isReferenceEditActive =
    imageMode === "reference_edit" && REFERENCE_EDIT_PUBLIC_ENABLED;

  const referenceEditReady =
    isReferenceEditActive &&
    Boolean(referenceEditSourceUrl?.trim()) &&
    Boolean(referenceEditInstruction.trim());

  const referenceEditSubmitBlocked =
    isReferenceEditActive && !referenceEditReady;
  const [agentMode, setAgentMode] = useState<AgentMode>("auto");
  const [outputFormatKey, setOutputFormatKey] =
    useState<OutputFormatKey>("square");
  const [formatMenuOpen, setFormatMenuOpen] = useState(false);

  const [loadingCharacters, setLoadingCharacters] = useState(false);
  const [queuing, setQueuing] = useState(false);
  const [queuedGenerationId, setQueuedGenerationId] = useState<string | null>(
    null
  );

  const [agentResult, setAgentResult] = useState<AgentResult | null>(null);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [exampleIndex, setExampleIndex] = useState(0);
  const [typedExample, setTypedExample] = useState("");

  const selectedCharacter = useMemo(() => {
    return characters.find((character) => character.id === selectedCharacterId);
  }, [characters, selectedCharacterId]);

  const selectedOutputFormat = useMemo(() => {
    return (
      localizedOutputFormats.find((format) => format.key === outputFormatKey) ??
      localizedOutputFormats[0]
    );
  }, [outputFormatKey, localizedOutputFormats]);

  const isSubmitBlocked =
    submitInFlightRef.current ||
    queuing ||
    agentResult?.status === "processing";

  const resultStatusLabel =
    agentResult?.status === "processing"
      ? copy.gallery.processing
      : agentResult?.status === "completed"
        ? copy.gallery.completed
        : agentResult?.status === "insufficient_credits"
          ? a.insufficientCreditsTitle
          : agentResult?.status === "active_generation_limit"
            ? a.activeGenerationLimitTitle
            : agentResult?.status === "failed"
              ? copy.gallery.failed
              : "—";

  const resultStatusDescription =
    agentResult?.status === "processing"
      ? a.processingHint
      : agentResult?.status === "completed"
        ? a.completed
        : agentResult?.status === "insufficient_credits"
          ? a.insufficientCreditsIntro
          : agentResult?.status === "active_generation_limit"
            ? a.activeGenerationLimitIntro
            : agentResult?.status === "failed"
              ? a.failed
              : "";

  useEffect(() => {
    loadCharacters();
  }, [charactersRefreshKey]);

  useEffect(() => {
    if (imageMode === "ugc_look" && !UGC_LOOK_PUBLIC_ENABLED) {
      setImageMode("standard");
    }

    if (imageMode === "fast_draft" && !FAST_DRAFT_PUBLIC_ENABLED) {
      setImageMode("standard");
    }

    if (imageMode === "premium_image" && !PREMIUM_IMAGE_PUBLIC_ENABLED) {
      setImageMode("standard");
    }
  }, [imageMode]);

  useEffect(() => {
    if (!regenerateDraft) return;

    setStudioTab("image");
    setPrompt(regenerateDraft.prompt);
    setSelectedCharacterId(regenerateDraft.characterId ?? "");
    setQueuedGenerationId(null);
    setAgentResult(null);
    setErrorMessage(null);
    setStatusMessage(
      regenerateDraft.source === "campaign_planner"
        ? a.campaignPromptLoaded
        : a.promptLoadedRegeneration
    );

    window.setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 120);
  }, [regenerateDraft, a.campaignPromptLoaded, a.promptLoadedRegeneration]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setExampleIndex((current) => (current + 1) % examplePrompts.length);
    }, 4400);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const currentText = examplePrompts[exampleIndex];
    let charIndex = 0;

    setTypedExample("");

    const typing = window.setInterval(() => {
      charIndex += 1;
      setTypedExample(currentText.slice(0, charIndex));

      if (charIndex >= currentText.length) {
        window.clearInterval(typing);
      }
    }, 24);

    return () => window.clearInterval(typing);
  }, [exampleIndex]);

  useEffect(() => {
    if (!queuedGenerationId) return;

    let cancelled = false;
    let intervalId: number | null = null;

    async function pollGeneration() {
      try {
        const token = await getAccessToken();

        if (!token || cancelled) return;

        const response = await fetch("/api/generations?limit=24&offset=0", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || cancelled) return;

        const generations = data.generations ?? [];

        const found = generations.find(
          (generation: AgentResult) => generation.id === queuedGenerationId
        );

        if (!found) return;

        setAgentResult({
          id: found.id,
          prompt: found.prompt,
          image_url: found.image_url,
          video_url: found.video_url ?? null,
          workflow: found.workflow ?? null,
          status: found.status,
          error_message: found.error_message,
          output_format: found.output_format,
          image_size: found.image_size,
        });

        if (found.status === "completed" || found.status === "failed") {
          if (intervalId) {
            window.clearInterval(intervalId);
          }
        }
      } catch (error) {
        console.error("Agent result polling error:", error);
      }
    }

    pollGeneration();
    intervalId = window.setInterval(pollGeneration, 2500);

    return () => {
      cancelled = true;

      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [queuedGenerationId]);

  async function getAccessToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session?.access_token ?? null;
  }

  async function loadCharacters() {
    try {
      setLoadingCharacters(true);

      const token = await getAccessToken();

      if (!token) return;

      const response = await fetch("/api/characters", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Agent character API error:", data.error);
        return;
      }

      setCharacters(data.characters || []);
    } catch (error) {
      console.error("Agent character load error:", error);
    } finally {
      setLoadingCharacters(false);
    }
  }

  function insertQuickPrompt(value: string, format?: OutputFormatKey) {
    setPrompt((current) => {
      if (!current.trim()) return value;
      return `${current.trim()}\n\n${value}`;
    });

    if (format) {
      setOutputFormatKey(format);
    }
  }

  function scrollToResult() {
    window.setTimeout(() => {
      resultRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 150);
  }

  function submitFromTextarea(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter") return;
    if (event.shiftKey) return;

    event.preventDefault();

    if (studioTab === "video" || studioTab === "lip_sync") {
      return;
    }

    if (isSubmitBlocked) {
      setErrorMessage(a.generationAlreadyProcessing);
      return;
    }

    formRef.current?.requestSubmit();
  }

  function submitVideoFromMotionPrompt(
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (event.key !== "Enter") return;
    if (event.shiftKey) return;

    event.preventDefault();

    if (!isVideoStudioActive) return;

    if (isSubmitBlocked) {
      setErrorMessage(a.generationAlreadyProcessing);
      return;
    }

    formRef.current?.requestSubmit();
  }

  function submitLipSyncFromInstructions(
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (event.key !== "Enter") return;
    if (event.shiftKey) return;

    event.preventDefault();

    if (!isLipSyncActive) return;

    if (isSubmitBlocked) {
      setErrorMessage(a.generationAlreadyProcessing);
      return;
    }

    formRef.current?.requestSubmit();
  }

  function getSafeErrorMessage(status: number, apiError?: string) {
    if (status === 401) return a.signInAgain;
    if (status === 402) return a.notEnoughCredits;
    if (status === 404) return a.profileNotFound;
    if (status === 400) return apiError || a.describePrompt;

    return apiError || a.queueFailed;
  }

  async function queueGeneration(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitInFlightRef.current || queuing || agentResult?.status === "processing") {
      setErrorMessage(a.generationAlreadyProcessing);
      return;
    }

    if (isLipSyncActive) {
      if (!lipSyncSourceUrl?.trim() || !lipSyncSourceMediaType) {
        setErrorMessage(a.lipSyncMissingSource);
        return;
      }

      if (!lipSyncAudioUrl?.trim()) {
        setErrorMessage(a.lipSyncMissingAudio);
        return;
      }

      const temporaryGenerationId = `temp-${Date.now()}`;
      const promptLabel =
        lipSyncInstructions.trim() || a.imageModes.lipSync.label;
      submitInFlightRef.current = true;

      try {
        setQueuing(true);
        setQueuedGenerationId(null);
        setErrorMessage(null);
        setStatusMessage(a.generatingLipSync);

        setAgentResult({
          id: temporaryGenerationId,
          prompt: promptLabel,
          image_url: null,
          video_url: null,
          workflow: "lip_sync",
          status: "processing",
          error_message: null,
          output_format: selectedOutputFormat.label,
          image_size: "",
        });

        scrollToResult();

        const token = await getAccessToken();

        if (!token) {
          setAgentResult({
            id: temporaryGenerationId,
            prompt: promptLabel,
            image_url: null,
            status: "failed",
            error_message: a.signInAgain,
            output_format: selectedOutputFormat.label,
            image_size: "",
          });
          setErrorMessage(a.signInAgain);
          return;
        }

        const response = await fetch("/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            imageMode: "lip_sync",
            sourceMediaUrl: lipSyncSourceUrl,
            audioUrl: lipSyncAudioUrl,
            sourceMediaType: lipSyncSourceMediaType,
            lipSyncInstructions: lipSyncInstructions.trim() || undefined,
            outputFormat: outputFormatKey,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 402) {
            const requiredCredits =
              typeof data.requiredCredits === "number" ? data.requiredCredits : 30;

            setAgentResult({
              id: temporaryGenerationId,
              prompt: promptLabel,
              image_url: null,
              status: "insufficient_credits",
              error_message: null,
              requiredCredits,
              output_format: selectedOutputFormat.label,
              image_size: "",
            });
            setErrorMessage(null);
            setStatusMessage(null);
            scrollToResult();
            return;
          }

          if (
            response.status === 429 &&
            data.reason === "active_generation_limit"
          ) {
            setAgentResult({
              id: temporaryGenerationId,
              prompt: promptLabel,
              image_url: null,
              status: "active_generation_limit",
              error_message: null,
              output_format: selectedOutputFormat.label,
              image_size: "",
            });
            setErrorMessage(null);
            setStatusMessage(null);
            scrollToResult();
            return;
          }

          const safeMessage = getSafeErrorMessage(response.status, data.error);
          setAgentResult({
            id: temporaryGenerationId,
            prompt: promptLabel,
            image_url: null,
            status: "failed",
            error_message: safeMessage,
            output_format: selectedOutputFormat.label,
            image_size: "",
          });
          setErrorMessage(safeMessage);
          return;
        }

        const generationId =
          typeof data.generationId === "string" ? data.generationId : null;

        if (!generationId) {
          setAgentResult({
            id: temporaryGenerationId,
            prompt: promptLabel,
            image_url: null,
            status: "failed",
            error_message: a.noGenerationId,
            output_format: selectedOutputFormat.label,
            image_size: "",
          });
          setErrorMessage(a.noGenerationId);
          return;
        }

        setQueuedGenerationId(generationId);
        setAgentResult({
          id: generationId,
          prompt: promptLabel,
          image_url: null,
          video_url: null,
          workflow: "lip_sync",
          status: "processing",
          error_message: null,
          output_format: selectedOutputFormat.label,
          image_size: "",
        });
        onGenerationQueued?.();
        scrollToResult();
      } catch {
        setAgentResult({
          id: temporaryGenerationId,
          prompt: promptLabel,
          image_url: null,
          status: "failed",
          error_message: a.networkError,
          output_format: selectedOutputFormat.label,
          image_size: "",
        });
        setErrorMessage(a.networkError);
      } finally {
        submitInFlightRef.current = false;
        setQueuing(false);
      }

      return;
    }

    if (isVideoStudioActive) {
      if (!videoSourceUrl?.trim()) {
        setErrorMessage(a.videoStudioMissingSource);
        return;
      }

      if (!videoMotionPrompt.trim()) {
        setErrorMessage(a.videoStudioMissingMotion);
        return;
      }

      const temporaryGenerationId = `temp-${Date.now()}`;
      submitInFlightRef.current = true;

      try {
        setQueuing(true);
        setQueuedGenerationId(null);
        setErrorMessage(null);
        setStatusMessage(
          format(a.preparingFormat, {
            format: selectedOutputFormat.label,
            ratio: selectedOutputFormat.ratio,
          })
        );

        setAgentResult({
          id: temporaryGenerationId,
          prompt: videoMotionPrompt.trim(),
          image_url: null,
          video_url: null,
          workflow: "video_image_to_video",
          status: "processing",
          error_message: null,
          output_format: selectedOutputFormat.label,
          image_size: "",
        });

        scrollToResult();

        const token = await getAccessToken();

        if (!token) {
          setAgentResult({
            id: temporaryGenerationId,
            prompt: videoMotionPrompt.trim(),
            image_url: null,
            status: "failed",
            error_message: a.signInAgain,
            output_format: selectedOutputFormat.label,
            image_size: "",
          });
          setErrorMessage(a.signInAgain);
          return;
        }

        const response = await fetch("/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            imageMode: "video_image_to_video",
            motionInstruction: videoMotionPrompt.trim(),
            sourceImageUrl: videoSourceUrl,
            outputFormat: outputFormatKey,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 402) {
            const requiredCredits =
              typeof data.requiredCredits === "number" ? data.requiredCredits : 25;

            setAgentResult({
              id: temporaryGenerationId,
              prompt: videoMotionPrompt.trim(),
              image_url: null,
              status: "insufficient_credits",
              error_message: null,
              requiredCredits,
              output_format: selectedOutputFormat.label,
              image_size: "",
            });
            setErrorMessage(null);
            setStatusMessage(null);
            scrollToResult();
            return;
          }

          if (
            response.status === 429 &&
            data.reason === "active_generation_limit"
          ) {
            setAgentResult({
              id: temporaryGenerationId,
              prompt: videoMotionPrompt.trim(),
              image_url: null,
              status: "active_generation_limit",
              error_message: null,
              output_format: selectedOutputFormat.label,
              image_size: "",
            });
            setErrorMessage(null);
            setStatusMessage(null);
            scrollToResult();
            return;
          }

          const safeMessage = getSafeErrorMessage(response.status, data.error);
          setAgentResult({
            id: temporaryGenerationId,
            prompt: videoMotionPrompt.trim(),
            image_url: null,
            status: "failed",
            error_message: safeMessage,
            output_format: selectedOutputFormat.label,
            image_size: "",
          });
          setErrorMessage(safeMessage);
          return;
        }

        const generationId =
          typeof data.generationId === "string" ? data.generationId : null;

        if (!generationId) {
          setAgentResult({
            id: temporaryGenerationId,
            prompt: videoMotionPrompt.trim(),
            image_url: null,
            status: "failed",
            error_message: a.noGenerationId,
            output_format: selectedOutputFormat.label,
            image_size: "",
          });
          setErrorMessage(a.noGenerationId);
          return;
        }

        setQueuedGenerationId(generationId);
        setAgentResult({
          id: generationId,
          prompt: videoMotionPrompt.trim(),
          image_url: null,
          video_url: null,
          workflow: "video_image_to_video",
          status: "processing",
          error_message: null,
          output_format: selectedOutputFormat.label,
          image_size: "",
        });
        setVideoMotionPrompt("");
        onGenerationQueued?.();
        scrollToResult();
      } catch {
        setAgentResult({
          id: temporaryGenerationId,
          prompt: videoMotionPrompt.trim(),
          image_url: null,
          status: "failed",
          error_message: a.networkError,
          output_format: selectedOutputFormat.label,
          image_size: "",
        });
        setErrorMessage(a.networkError);
      } finally {
        submitInFlightRef.current = false;
        setQueuing(false);
      }

      return;
    }

    const cleanPrompt = prompt.trim();
    const isReferenceEditMode =
      imageMode === "reference_edit" && REFERENCE_EDIT_PUBLIC_ENABLED;

    if (isReferenceEditMode) {
      if (!referenceEditSourceUrl?.trim()) {
        setErrorMessage(a.referenceEditMissingSource);
        return;
      }

      if (!referenceEditInstruction.trim()) {
        setErrorMessage(a.referenceEditMissingInstruction);
        return;
      }
    } else if (!cleanPrompt) {
      setErrorMessage(a.describePrompt);
      return;
    }

    const effectivePrompt = isReferenceEditMode
      ? referenceEditInstruction.trim()
      : cleanPrompt;

    const temporaryGenerationId = `temp-${Date.now()}`;

    submitInFlightRef.current = true;

    try {
      setQueuing(true);
      setQueuedGenerationId(null);
      setErrorMessage(null);
      setStatusMessage(
        selectedCharacter
          ? format(a.preparingWithProfile, { name: selectedCharacter.name })
          : format(a.preparingFormat, {
              format: selectedOutputFormat.label,
              ratio: selectedOutputFormat.ratio,
            })
      );

      setAgentResult({
        id: temporaryGenerationId,
        prompt: effectivePrompt,
        image_url: null,
        status: "processing",
        error_message: null,
        output_format: selectedOutputFormat.label,
        image_size: "",
      });

      scrollToResult();

      const token = await getAccessToken();

      if (!token) {
        setAgentResult({
          id: temporaryGenerationId,
          prompt: cleanPrompt,
          image_url: null,
          status: "failed",
          error_message: "Please sign in again.",
          output_format: selectedOutputFormat.label,
          image_size: "",
        });

        setErrorMessage(a.signInAgain);
        return;
      }

      const agentPrompt = isReferenceEditMode
        ? effectivePrompt
        : buildAgentPrompt(cleanPrompt, agentMode);

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: agentPrompt,
          characterId: isReferenceEditMode ? null : selectedCharacterId || null,
          workflow,
          imageMode: resolveSubmitImageMode(imageMode),
          outputFormat: outputFormatKey,
          ...(isReferenceEditMode
            ? {
                sourceImageUrl: referenceEditSourceUrl,
                editInstruction: referenceEditInstruction.trim(),
              }
            : {}),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 402) {
          const requiredCredits =
            typeof data.requiredCredits === "number"
              ? data.requiredCredits
              : getRequiredCreditsForStudio(studioTab, imageMode);

          setAgentResult({
            id: temporaryGenerationId,
            prompt: effectivePrompt,
            image_url: null,
            status: "insufficient_credits",
            error_message: null,
            requiredCredits,
            output_format: selectedOutputFormat.label,
            image_size: "",
          });

          setErrorMessage(null);
          setStatusMessage(null);
          scrollToResult();
          return;
        }

        if (
          response.status === 429 &&
          data.reason === "active_generation_limit"
        ) {
          setAgentResult({
            id: temporaryGenerationId,
            prompt: effectivePrompt,
            image_url: null,
            status: "active_generation_limit",
            error_message: null,
            output_format: selectedOutputFormat.label,
            image_size: "",
          });

          setErrorMessage(null);
          setStatusMessage(null);
          scrollToResult();
          return;
        }

        const safeMessage = getSafeErrorMessage(response.status, data.error);

        setAgentResult({
          id: temporaryGenerationId,
          prompt: cleanPrompt,
          image_url: null,
          status: "failed",
          error_message: safeMessage,
          output_format: selectedOutputFormat.label,
          image_size: "",
        });

        setErrorMessage(safeMessage);
        return;
      }

      const generationId =
        typeof data.generationId === "string" ? data.generationId : null;

      if (!generationId) {
        setAgentResult({
          id: temporaryGenerationId,
          prompt: cleanPrompt,
          image_url: null,
          status: "failed",
          error_message: "Generation was queued, but no generation ID returned.",
          output_format: selectedOutputFormat.label,
          image_size: "",
        });

        setErrorMessage(a.noGenerationId);
        return;
      }

      setQueuedGenerationId(generationId);

      setAgentResult((current) => ({
        id: generationId,
        prompt: current?.prompt ?? cleanPrompt,
        image_url: null,
        status: "processing",
        error_message: null,
        output_format: selectedOutputFormat.label,
        image_size: "",
      }));

      setStatusMessage(
        selectedCharacter
          ? format(a.queuedWithProfile, { name: selectedCharacter.name })
          : format(a.preparingFormat, {
              format: selectedOutputFormat.label,
              ratio: selectedOutputFormat.ratio,
            })
      );

      setPrompt("");
      setAgentMode("auto");
      onClearRegenerateDraft?.();
      onGenerationQueued?.();
      scrollToResult();
    } catch (error) {
      console.error("Agent queue error:", error);

      setAgentResult({
        id: temporaryGenerationId,
        prompt: cleanPrompt,
        image_url: null,
        status: "failed",
        error_message: "Network error. Please try again.",
        output_format: selectedOutputFormat.label,
        image_size: "",
      });

      setErrorMessage(a.networkError);
    } finally {
      submitInFlightRef.current = false;
      setQueuing(false);
    }
  }

  const FormatIcon = selectedOutputFormat.icon;

  return (
    <section
      id="agent"
      className="relative min-h-[100dvh] overflow-x-hidden overflow-y-auto bg-[#06060a] px-3 pb-28 pt-[4.75rem] sm:px-6 sm:pb-16 sm:pt-10 lg:px-10 lg:pb-10 lg:pt-10"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="agent-film-bg absolute inset-0 overflow-hidden" />
        <div className="agent-film-noise absolute inset-0" />

        <motion.div
          className="absolute left-1/2 top-[66%] h-[38rem] w-[80rem] -translate-x-1/2 rounded-[100%] bg-[#d8ad5f]/22 blur-[120px]"
          animate={{
            x: ["-50%", "-48%", "-52%", "-50%"],
            scale: [1, 1.08, 0.98, 1],
            opacity: [0.3, 0.62, 0.38, 0.3],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute left-[10%] bottom-[8%] h-[28rem] w-[28rem] rounded-full bg-white/12 blur-[120px]"
          animate={{
            x: [0, 80, -40, 0],
            y: [0, -55, 30, 0],
            opacity: [0.16, 0.36, 0.2, 0.16],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute right-[12%] bottom-[18%] h-[28rem] w-[28rem] rounded-full bg-[#d8ad5f]/18 blur-[120px]"
          animate={{
            x: [0, -70, 40, 0],
            y: [0, 35, -25, 0],
            opacity: [0.2, 0.48, 0.28, 0.2],
          }}
          transition={{
            duration: 13,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(6,6,10,0.92)_0%,rgba(6,6,10,0.68)_36%,rgba(38,30,36,0.34)_60%,rgba(18,15,24,0.72)_100%)]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full min-w-0 max-w-6xl flex-col items-center justify-start py-4 sm:py-8 lg:min-h-[calc(100dvh-5rem)] lg:justify-center lg:py-10">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-xs font-semibold text-white/45"
        >
          InfluExAi Agent
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mt-3 text-center text-2xl font-black tracking-[-0.055em] text-white sm:text-3xl lg:text-5xl"
        >
          {a.title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-4 max-w-2xl text-center text-xs leading-6 text-white/50 sm:text-sm"
        >
          {a.subtitle}
        </motion.p>

        {statusMessage && (
          <div className="mt-6 w-full max-w-3xl rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 text-sm font-bold text-white">
            {statusMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mt-6 flex w-full max-w-3xl items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-100">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <motion.form
          ref={formRef}
          initial={{ opacity: 0, y: 22, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.16 }}
          onSubmit={queueGeneration}
          className="relative isolate mt-6 w-full max-w-5xl overflow-visible rounded-[1.35rem] border border-white/12 bg-white/[0.075] shadow-[0_30px_110px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:mt-8 sm:rounded-[1.7rem]"
        >
          <div className="pointer-events-none absolute inset-0 rounded-[1.7rem] bg-[radial-gradient(circle_at_50%_100%,rgba(216,173,95,0.16),transparent_42%)]" />
          <div className="pointer-events-none absolute inset-0 rounded-[1.7rem] bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent_38%)]" />

          <div className="relative z-10">
            {studioTab === "image" ? (
              <>
                <textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  onKeyDown={submitFromTextarea}
                  placeholder={typedExample || a.promptPlaceholder}
                  className="min-h-[104px] w-full resize-y bg-transparent px-4 py-4 text-base leading-relaxed text-white outline-none placeholder:text-white/32 sm:min-h-[78px] sm:resize-none sm:px-6 sm:py-5 sm:text-lg"
                />

                <p className="border-t border-white/10 px-4 py-2 text-[11px] font-medium text-white/35 sm:px-6">
                  {a.enterHint}
                </p>
              </>
            ) : studioTab === "video" ? (
              <div className="border-t border-white/10 px-4 py-4 sm:px-6">
                <p className="text-sm font-semibold text-white/70">
                  {a.imageModes.videoStudio.label}
                </p>
                <p className="mt-1 text-xs text-white/40">
                  {a.videoStudioLongerHint}
                </p>
              </div>
            ) : (
              <div className="border-t border-white/10 px-4 py-4 sm:px-6">
                <p className="text-sm font-semibold text-white/70">
                  {a.imageModes.lipSync.label}
                </p>
                <p className="mt-1 text-xs text-white/40">
                  {a.lipSyncLongerHint}
                </p>
              </div>
            )}

            <div className="border-t border-white/10 px-3 py-3 sm:px-4 sm:py-4">
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setStudioTab("image")}
                    className={`rounded-full px-4 py-2 text-xs font-black transition ${
                      studioTab === "image"
                        ? "bg-white text-black"
                        : "border border-white/10 bg-black/25 text-white/55"
                    }`}
                  >
                    {a.studioTabImage}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (VIDEO_STUDIO_PUBLIC_ENABLED) {
                        setStudioTab("video");
                      }
                    }}
                    disabled={!VIDEO_STUDIO_PUBLIC_ENABLED}
                    title={
                      VIDEO_STUDIO_PUBLIC_ENABLED
                        ? a.imageModes.videoStudio.description
                        : a.studioTabVideoPlanned
                    }
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-45 ${
                      studioTab === "video" && VIDEO_STUDIO_PUBLIC_ENABLED
                        ? "bg-sky-500/20 text-sky-100 ring-1 ring-sky-500/30"
                        : "border border-white/10 bg-black/25 text-white/55"
                    }`}
                  >
                    <Clapperboard className="h-3.5 w-3.5" aria-hidden />
                    <span className="flex flex-col items-start sm:flex-row sm:items-center sm:gap-1.5">
                      <span>
                        {VIDEO_STUDIO_PUBLIC_ENABLED
                          ? a.studioTabVideo
                          : a.studioTabVideoPlanned}
                      </span>
                      {VIDEO_STUDIO_PUBLIC_ENABLED ? (
                        <span className="text-[9px] font-bold text-sky-200/80">
                          · {suite.modes.videoStudio.credits}
                        </span>
                      ) : null}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (LIP_SYNC_PUBLIC_ENABLED) {
                        setStudioTab("lip_sync");
                      }
                    }}
                    disabled={!LIP_SYNC_PUBLIC_ENABLED}
                    title={
                      LIP_SYNC_PUBLIC_ENABLED
                        ? a.imageModes.lipSync.description
                        : a.studioTabLipSyncPlanned
                    }
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-45 ${
                      studioTab === "lip_sync" && LIP_SYNC_PUBLIC_ENABLED
                        ? "bg-violet-500/20 text-violet-100 ring-1 ring-violet-500/30"
                        : "border border-white/10 bg-black/25 text-white/55"
                    }`}
                  >
                    <Mic className="h-3.5 w-3.5" aria-hidden />
                    <span className="flex flex-col items-start sm:flex-row sm:items-center sm:gap-1.5">
                      <span>
                        {LIP_SYNC_PUBLIC_ENABLED
                          ? a.studioTabLipSync
                          : a.studioTabLipSyncPlanned}
                      </span>
                      {LIP_SYNC_PUBLIC_ENABLED ? (
                        <span className="text-[9px] font-bold text-violet-200/80">
                          · {suite.modes.lipSync.credits}
                        </span>
                      ) : null}
                    </span>
                  </button>
                </div>

                {studioTab === "video" ? (
                  <VideoStudioPanel
                    label={a.imageModes.videoStudio.label}
                    copy={a.imageModes.videoStudio.panel}
                    panelRef={videoStudioPanelRef}
                    getAccessToken={getAccessToken}
                    isEnabled={VIDEO_STUDIO_PUBLIC_ENABLED}
                    sourcePreviewUrl={videoSourceUrl}
                    onSourcePreviewUrlChange={setVideoSourceUrl}
                    motionPrompt={videoMotionPrompt}
                    onMotionPromptChange={setVideoMotionPrompt}
                    onMotionKeyDown={submitVideoFromMotionPrompt}
                  />
                ) : null}

                {studioTab === "lip_sync" ? (
                  <LipSyncStudioPanel
                    label={a.imageModes.lipSync.label}
                    copy={a.imageModes.lipSync.panel}
                    panelRef={lipSyncPanelRef}
                    getAccessToken={getAccessToken}
                    isEnabled={LIP_SYNC_PUBLIC_ENABLED}
                    sourcePreviewUrl={lipSyncSourceUrl}
                    sourceMediaType={lipSyncSourceMediaType}
                    onSourceChange={(url, mediaType) => {
                      setLipSyncSourceUrl(url);
                      setLipSyncSourceMediaType(mediaType);
                    }}
                    audioPreviewLabel={lipSyncAudioLabel}
                    audioUrl={lipSyncAudioUrl}
                    onAudioChange={(url, label) => {
                      setLipSyncAudioUrl(url);
                      setLipSyncAudioLabel(label);
                    }}
                    instructions={lipSyncInstructions}
                    onInstructionsChange={setLipSyncInstructions}
                    onInstructionsKeyDown={submitLipSyncFromInstructions}
                  />
                ) : null}

                {studioTab === "image" ? (
                <fieldset className="rounded-2xl border border-white/10 bg-black/20 p-2.5 sm:p-3">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2 px-0.5">
                    <legend className="text-[10px] font-black uppercase tracking-[0.22em] text-white/40">
                      {suite.title}
                    </legend>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] ${
                        imageModeUsesBetaBadge
                          ? "border border-amber-400/25 bg-amber-500/10 text-amber-100"
                          : "border border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
                      }`}
                    >
                      {imageModeActiveNote}
                    </span>
                  </div>

                  <p className="mb-1 px-0.5 text-[10px] leading-4 text-white/32">
                    {a.imageModeIntro}
                  </p>
                  <p className="mb-2.5 px-0.5 text-[10px] leading-4 text-white/28">
                    {suite.workflowChargeNote}
                  </p>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 sm:gap-2.5">
                    {imageModes.map((mode) => {
                      const Icon = mode.icon;
                      const isSelectable =
                        mode.status === "live" || mode.status === "beta";
                      const isSelected = isSelectable && imageMode === mode.key;
                      const statusLabel =
                        mode.status === "live"
                          ? a.imageModes.live
                          : mode.status === "beta"
                            ? a.imageModes.beta
                            : a.imageModes.planned;

                      const isReferenceEditPlanned =
                        mode.key === "reference_edit" &&
                        !REFERENCE_EDIT_PUBLIC_ENABLED;
                      const plannedTitle =
                        "hoverHint" in mode && mode.hoverHint
                          ? `${mode.description} — ${mode.hoverHint}`
                          : `${mode.description} — ${a.imageModes.plannedTooltip}`;

                      return (
                        <div
                          key={mode.key}
                          className={`relative flex flex-col rounded-xl border p-2 text-left sm:p-2.5 ${
                            isReferenceEditPlanned
                              ? "min-h-[4.75rem] sm:min-h-[5.25rem]"
                              : "min-h-[5rem] sm:min-h-[5.75rem]"
                          } ${
                            isSelectable
                              ? isSelected
                                ? "border-[#d8ad5f]/50 bg-[#d8ad5f]/12 ring-1 ring-[#d8ad5f]/25"
                                : "border-white/10 bg-white/[0.04]"
                              : isReferenceEditPlanned
                                ? "border-[#d8ad5f]/15 bg-[linear-gradient(160deg,rgba(216,173,95,0.06)_0%,rgba(255,255,255,0.02)_55%)]"
                                : "border-white/[0.08] bg-white/[0.025]"
                          }`}
                        >
                          {isSelectable ? (
                            <button
                              type="button"
                              aria-pressed={isSelected}
                              onClick={() => setImageMode(mode.key)}
                              title={mode.description}
                              className="flex h-full w-full flex-col text-left outline-none focus-visible:ring-2 focus-visible:ring-[#d8ad5f]/40 rounded-lg"
                            >
                              <ModeCardBody
                                Icon={Icon}
                                isLive={isSelectable}
                                isSelected={isSelected}
                                label={mode.label}
                                description={mode.description}
                                statusLabel={statusLabel}
                                statusTone={mode.status}
                                creditNote={mode.creditNote}
                                bestFor={mode.bestFor}
                              />
                            </button>
                          ) : isReferenceEditPlanned ? (
                            <button
                              type="button"
                              title={plannedTitle}
                              onClick={() => {
                                referenceEditPanelRef.current?.scrollIntoView({
                                  behavior: "smooth",
                                  block: "nearest",
                                });
                              }}
                              className="flex h-full w-full flex-col text-left outline-none focus-visible:ring-2 focus-visible:ring-[#d8ad5f]/35 rounded-lg"
                            >
                              <ModeCardBody
                                Icon={Icon}
                                isLive={false}
                                isSelected={false}
                                label={mode.label}
                                description={mode.description}
                                statusLabel={statusLabel}
                                statusTone="planned"
                                creditNote={mode.creditNote}
                                bestFor={mode.bestFor}
                                comingSoonNote={
                                  "comingSoonNote" in mode
                                    ? mode.comingSoonNote
                                    : undefined
                                }
                              />
                            </button>
                          ) : (
                            <div
                              role="presentation"
                              aria-disabled="true"
                              title={plannedTitle}
                              className="flex h-full cursor-not-allowed flex-col"
                            >
                              <ModeCardBody
                                Icon={Icon}
                                isLive={false}
                                isSelected={false}
                                label={mode.label}
                                description={mode.description}
                                statusLabel={statusLabel}
                                statusTone="planned"
                                creditNote={mode.creditNote}
                                bestFor={mode.bestFor}
                                comingSoonNote={
                                  "comingSoonNote" in mode
                                    ? mode.comingSoonNote
                                    : undefined
                                }
                                showLock
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <ReferenceEditPanel
                    label={a.imageModes.referenceEdit.label}
                    copy={a.imageModes.referenceEdit.panel}
                    panelRef={referenceEditPanelRef}
                    getAccessToken={getAccessToken}
                    isEnabled={REFERENCE_EDIT_PUBLIC_ENABLED}
                    sourcePreviewUrl={referenceEditSourceUrl}
                    onSourcePreviewUrlChange={setReferenceEditSourceUrl}
                    editInstruction={referenceEditInstruction}
                    onEditInstructionChange={setReferenceEditInstruction}
                  />

                  <div className="mt-3 rounded-xl border border-white/[0.06] bg-black/25 px-2.5 py-2.5 sm:px-3">
                    <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/35">
                      {a.imageModeRoadmapLabel}
                    </p>
                    <p className="mt-1 text-[10px] leading-4 text-white/28">
                      {a.imageModeRoadmapNote}
                    </p>
                    <p className="mt-1 text-[10px] leading-4 text-white/28">
                      {a.futureModulesPlannedNote}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {a.studioRoadmapChips.map((chip) => (
                        <span
                          key={chip}
                          className="pointer-events-none rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[9px] font-semibold text-white/42"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  </div>
                </fieldset>
                ) : null}

                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-2 text-xs font-bold text-white/65">
                    <Plus className="h-3.5 w-3.5 shrink-0" />
                    <span>{a.agent}</span>
                  </div>

                  <select
                    value={selectedCharacterId}
                    onChange={(event) => {
                      setSelectedCharacterId(event.target.value);
                    }}
                    aria-label={a.styleProfileAria}
                    className="max-w-full rounded-full border border-white/10 bg-black/35 px-3 py-2 text-xs font-bold text-white outline-none sm:max-w-[280px]"
                  >
                    <option value="">
                      {loadingCharacters
                        ? a.loadingStyleProfiles
                        : a.styleProfileNone}
                    </option>

                    {characters.map((character) => (
                      <option key={character.id} value={character.id}>
                        {character.name}
                      </option>
                    ))}
                  </select>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setFormatMenuOpen((current) => !current)}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-2 text-xs font-bold text-white transition hover:border-white/20"
                    >
                      <FormatIcon className="h-3.5 w-3.5 shrink-0" />
                      <span>{a.socialFormat}</span>
                      <span className="shrink-0 text-white/40">
                        {selectedOutputFormat.ratio}
                      </span>
                    </button>

                    {formatMenuOpen && (
                      <div className="absolute left-0 right-0 top-12 z-50 max-h-[min(60vh,320px)] overflow-y-auto overscroll-contain rounded-2xl border border-white/10 bg-[#101014] p-1.5 shadow-2xl sm:right-auto sm:w-64">
                        <div className="space-y-1">
                          {localizedOutputFormats.map((format) => {
                            const Icon = format.icon;
                            const active = outputFormatKey === format.key;

                            return (
                              <button
                                key={format.key}
                                type="button"
                                onClick={() => {
                                  setOutputFormatKey(format.key);
                                  setFormatMenuOpen(false);
                                }}
                                className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                                  active
                                    ? "bg-white text-black"
                                    : "text-white/70 hover:bg-white/[0.06] hover:text-white"
                                }`}
                              >
                                <span className="flex min-w-0 items-center gap-2.5">
                                  <Icon className="h-3.5 w-3.5 shrink-0" />

                                  <span className="min-w-0">
                                    <span className="block truncate text-xs font-black">
                                      {format.label}
                                    </span>
                                    <span
                                      className={`block truncate text-[11px] ${
                                        active
                                          ? "text-black/55"
                                          : "text-white/35"
                                      }`}
                                    >
                                      {format.platform}
                                    </span>
                                  </span>
                                </span>

                                <span
                                  className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-black ${
                                    active
                                      ? "bg-black/10 text-black"
                                      : "bg-white/[0.06] text-white/55"
                                  }`}
                                >
                                  {format.ratio}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="rounded-full bg-[#d8ad5f] px-3 py-2 text-xs font-black text-black">
                    {selectedCharacter ? a.styleProfile : a.standard}
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap gap-2">
                    {agentModes.map((mode) => (
                      <button
                        key={mode.key}
                        type="button"
                        onClick={() => setAgentMode(mode.key)}
                        className={`rounded-full px-3 py-2 text-xs font-bold transition sm:px-4 ${
                          agentMode === mode.key
                            ? "bg-white text-black"
                            : "border border-white/10 bg-black/25 text-white/55"
                        }`}
                        title={a.modes[mode.key].description}
                      >
                        {a.modes[mode.key].label}
                      </button>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.96 }}
                    type="submit"
                    disabled={
                      isSubmitBlocked ||
                      referenceEditSubmitBlocked ||
                      videoSubmitBlocked ||
                      lipSyncSubmitBlocked
                    }
                    title={
                      isLipSyncActive
                        ? a.generateLipSync
                        : isVideoStudioActive
                          ? a.generateVideo
                          : undefined
                    }
                    className={`inline-flex h-12 shrink-0 items-center justify-center self-end rounded-full shadow-xl transition disabled:opacity-50 sm:self-auto ${
                      isLipSyncActive
                        ? "min-w-[3rem] gap-2 bg-violet-500 px-4 text-white hover:bg-violet-400"
                        : isVideoStudioActive
                          ? "min-w-[3rem] gap-2 bg-sky-500 px-4 text-black hover:bg-sky-400"
                          : "w-12 bg-white text-black hover:bg-white/85"
                    }`}
                  >
                    {isSubmitBlocked ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isLipSyncActive ? (
                      <>
                        <Mic className="h-4 w-4" aria-hidden />
                        <span className="hidden text-xs font-black sm:inline">
                          {a.generateLipSync}
                        </span>
                      </>
                    ) : isVideoStudioActive ? (
                      <>
                        <Clapperboard className="h-4 w-4" aria-hidden />
                        <span className="hidden text-xs font-black sm:inline">
                          {a.generateVideo}
                        </span>
                      </>
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.form>

        <div ref={resultRef} className="mt-6 w-full max-w-5xl scroll-mt-24 sm:mt-8 sm:scroll-mt-28">
          {agentResult && (
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              className="overflow-hidden rounded-[1.35rem] border border-white/10 bg-white/[0.06] shadow-[0_30px_110px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:rounded-[1.7rem]"
            >
              <div className="border-b border-white/10 p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#d8ad5f]">
                      {a.latestResult}
                    </p>

                    <h3 className="mt-2 text-xl font-black text-white sm:text-2xl">
                      {agentResult.status === "processing"
                        ? isLipSyncWorkflow(agentResult.workflow)
                          ? a.generatingLipSync
                          : isVideoStudioWorkflow(agentResult.workflow)
                            ? a.generatingVideo
                            : a.generating
                        : agentResult.status === "completed"
                          ? a.completed
                          : agentResult.status === "insufficient_credits"
                            ? a.insufficientCreditsTitle
                            : agentResult.status === "active_generation_limit"
                              ? a.activeGenerationLimitTitle
                              : a.failed}
                    </h3>

                    <p className="mt-2 text-sm text-white/45">
                      {resultStatusDescription}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs font-bold text-white/55">
                      {agentResult.output_format ?? selectedOutputFormat.label}
                    </span>

                    <span
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black ${
                        agentResult.status === "completed"
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
                          : agentResult.status === "insufficient_credits"
                            ? "border-amber-500/25 bg-amber-500/10 text-amber-100"
                            : agentResult.status === "active_generation_limit"
                              ? "border-sky-500/25 bg-sky-500/10 text-sky-100"
                            : agentResult.status === "failed"
                              ? "border-red-500/20 bg-red-500/10 text-red-200"
                              : "border-[#d8ad5f]/25 bg-[#d8ad5f]/10 text-[#d8ad5f]"
                      }`}
                    >
                      {agentResult.status === "processing" && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      )}

                      {agentResult.status === "completed" && (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}

                      {agentResult.status === "insufficient_credits" && (
                        <CreditCard className="h-3.5 w-3.5" />
                      )}

                      {agentResult.status === "active_generation_limit" && (
                        <Clock className="h-3.5 w-3.5" />
                      )}

                      {agentResult.status === "failed" && (
                        <AlertCircle className="h-3.5 w-3.5" />
                      )}

                      {resultStatusLabel}
                    </span>
                  </div>
                </div>

                {agentResult.status === "processing" && (
                  <div className="mt-5">
                    <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
                      <motion.div
                        className="h-full rounded-full bg-[#d8ad5f]"
                        initial={{ width: "12%" }}
                        animate={{ width: ["12%", "68%", "42%", "88%"] }}
                        transition={{
                          duration: 3.2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    </div>

                    <div className="mt-3 flex items-start gap-2 text-xs font-bold leading-5 text-white/40">
                      <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>
                        {a.processingHint}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid gap-0 lg:grid-cols-[1fr_360px]">
                <div className="relative flex min-h-[min(320px,50dvh)] items-center justify-center bg-black/45 sm:min-h-[420px]">
                  {agentResult.status === "processing" && (
                    <div className="flex w-full max-w-md flex-col items-center justify-center gap-5 p-10 text-center">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-[#d8ad5f]/30 blur-2xl" />

                        <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-[#d8ad5f]/25 bg-[#d8ad5f]/10">
                          <Loader2 className="h-9 w-9 animate-spin text-[#d8ad5f]" />
                        </div>
                      </div>

                      <div>
                        <p className="text-lg font-black text-white">
                          {isLipSyncWorkflow(agentResult.workflow)
                            ? a.generatingLipSync
                            : isVideoStudioWorkflow(agentResult.workflow)
                              ? a.generatingVideo
                              : a.generating}
                        </p>

                        <p className="mt-3 text-sm leading-6 text-white/45">
                          {isLipSyncWorkflow(agentResult.workflow)
                            ? a.lipSyncLongerHint
                            : isVideoStudioWorkflow(agentResult.workflow)
                              ? a.videoStudioLongerHint
                              : a.processingStay}
                        </p>
                      </div>

                      <div className="w-full rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left">
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/30">
                          {a.currentJob}
                        </p>

                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/55">
                          {agentResult.prompt}
                        </p>
                      </div>
                    </div>
                  )}

                  {agentResult.status === "insufficient_credits" && (
                    <motion.div className="flex flex-col items-center justify-center gap-4 p-8 text-center sm:p-10">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-amber-500/25 bg-amber-500/10 text-amber-100">
                        <CreditCard className="h-8 w-8" aria-hidden />
                      </div>

                      <div className="max-w-md space-y-2">
                        <p className="text-base font-black text-white">
                          {a.insufficientCreditsIntro}
                        </p>
                        <p className="text-sm leading-6 text-white/55">
                          {format(a.insufficientCreditsModeRequires, {
                            count:
                              agentResult.requiredCredits ??
                              getRequiredCreditsForStudio(studioTab, imageMode),
                          })}
                        </p>
                        <p className="text-sm leading-6 text-white/45">
                          {a.insufficientCreditsBuyMore}
                        </p>
                      </div>

                      {onOpenCredits ? (
                        <button
                          type="button"
                          onClick={onOpenCredits}
                          className="inline-flex items-center justify-center rounded-full bg-[#d8ad5f] px-5 py-3 text-sm font-black text-black transition hover:bg-[#efc777]"
                        >
                          <CreditCard className="mr-2 h-4 w-4" aria-hidden />
                          {a.buyCredits}
                        </button>
                      ) : null}
                    </motion.div>
                  )}

                  {agentResult.status === "active_generation_limit" && (
                    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center sm:p-10">
                      <motion.div className="flex h-16 w-16 items-center justify-center rounded-full border border-sky-500/25 bg-sky-500/10 text-sky-100">
                        <Clock className="h-8 w-8" aria-hidden />
                      </motion.div>

                      <motion.div className="max-w-md space-y-2">
                        <p className="text-base font-black text-white">
                          {a.activeGenerationLimitTitle}
                        </p>
                        <p className="text-sm leading-6 text-white/55">
                          {a.activeGenerationLimitIntro}
                        </p>
                      </motion.div>
                    </div>
                  )}

                  {agentResult.status === "failed" && (
                    <div className="flex flex-col items-center justify-center gap-4 p-10 text-center">
                      <AlertCircle className="h-12 w-12 text-red-200" />

                      <p className="text-sm font-bold text-red-100">
                        {a.failed}
                      </p>

                      {shouldShowCreditsRefundedHint(
                        agentResult.error_message,
                        Boolean(agentResult.id),
                        a.signInAgain,
                        a.networkError
                      ) && (
                        <p className="text-xs font-semibold text-red-100/80">
                          {a.creditsRefundedHint}
                        </p>
                      )}

                      <p className="max-w-md text-xs leading-6 text-red-100/60">
                        {agentResult.error_message ?? copy.gallery.unknownError}
                      </p>
                    </div>
                  )}

                  {agentResult.status === "completed" &&
                    agentResult.video_url && (
                      <video
                        src={agentResult.video_url}
                        controls
                        playsInline
                        className="max-h-[640px] w-full object-contain"
                      />
                    )}

                  {agentResult.status === "completed" &&
                    !agentResult.video_url &&
                    agentResult.image_url && (
                      <img
                        src={agentResult.image_url}
                        alt={agentResult.prompt}
                        className="max-h-[640px] w-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    )}

                  {agentResult.status === "completed" &&
                    !agentResult.video_url &&
                    !agentResult.image_url && (
                      <div className="flex flex-col items-center justify-center gap-4 p-10 text-center">
                        <ImageOff className="h-12 w-12 text-white/45" />

                        <p className="text-sm font-bold text-white">
                          {a.imageUrlMissing}
                        </p>
                      </div>
                    )}
                </div>

                <aside className="flex flex-col justify-between gap-5 border-t border-white/10 p-4 sm:gap-6 sm:p-5 lg:border-l lg:border-t-0 lg:min-h-[280px]">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-white/35">
                      {copy.gallery.prompt}
                    </p>

                    <p className="mt-3 line-clamp-6 text-sm leading-6 text-white/65">
                      {agentResult.prompt}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-1">
                    {agentResult.video_url && (
                      <a
                        href={agentResult.video_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-white/85"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        {a.openVideo}
                      </a>
                    )}

                    {agentResult.image_url && !agentResult.video_url && (
                      <a
                        href={agentResult.image_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-white/85"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        {a.openImage}
                      </a>
                    )}

                    {agentResult.status === "insufficient_credits" &&
                    onOpenCredits ? (
                      <button
                        type="button"
                        onClick={onOpenCredits}
                        className="inline-flex items-center justify-center rounded-full bg-[#d8ad5f] px-5 py-3 text-sm font-black text-black transition hover:bg-[#efc777]"
                      >
                        <CreditCard className="mr-2 h-4 w-4" aria-hidden />
                        {a.openCredits}
                      </button>
                    ) : null}

                    {agentResult.status === "completed" && (
                      <button
                        type="button"
                        onClick={onOpenGallery}
                        className="inline-flex items-center justify-center rounded-full border border-[#d8ad5f]/30 bg-[#d8ad5f]/10 px-5 py-3 text-sm font-bold text-[#d8ad5f] transition hover:bg-[#d8ad5f]/15"
                      >
                        <GalleryVerticalEnd className="mr-2 h-4 w-4" />
                        {a.viewInGallery}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setQueuedGenerationId(null);
                        setAgentResult(null);
                        setStatusMessage(null);
                        setErrorMessage(null);

                        window.scrollTo({
                          top: 0,
                          behavior: "smooth",
                        });
                      }}
                      className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-bold text-white/70 transition hover:border-white/20 hover:text-white"
                    >
                      {a.createAnother}
                    </button>
                  </div>
                </aside>
              </div>
            </motion.div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.28 }}
          className="mt-5 flex w-full max-w-4xl flex-wrap justify-center gap-2 px-1 sm:gap-3"
        >
          {quickPrompts.slice(0, 4).map((quickPrompt) => {
            const Icon = quickPrompt.icon;

            return (
              <motion.button
                key={quickPrompt.label}
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() =>
                  insertQuickPrompt(quickPrompt.prompt, quickPrompt.format)
                }
                className="inline-flex max-w-full items-center gap-2 rounded-xl border border-white/12 bg-white/[0.07] px-3 py-2 text-xs font-bold text-white/68 transition hover:border-[#d8ad5f]/35 hover:text-[#d8ad5f] sm:px-4 sm:py-2.5"
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{quickPrompt.label}</span>
              </motion.button>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.38 }}
          className="mt-6 flex max-w-3xl items-center justify-center gap-2 text-center text-xs text-white/28"
        >
          <Wand2 className="h-3.5 w-3.5 shrink-0" />
          <span>
            {a.styleProfilesFooter}
          </span>
        </motion.div>
      </div>

      <style jsx global>{`
        .agent-film-bg {
          background:
            radial-gradient(circle at 50% 100%, rgba(216, 173, 95, 0.38), transparent 34%),
            radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.16), transparent 30%),
            radial-gradient(circle at 0% 55%, rgba(216, 173, 95, 0.22), transparent 32%),
            radial-gradient(circle at 100% 55%, rgba(255, 255, 255, 0.12), transparent 34%),
            radial-gradient(circle at 42% 78%, rgba(93, 72, 255, 0.22), transparent 38%),
            linear-gradient(to bottom, #07070a 0%, #111014 40%, #2b2131 65%, #13103d 100%);
          filter: saturate(1.25);
          animation: agentBaseGlow 14s ease-in-out infinite alternate;
        }

        .agent-film-noise {
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.018) 1px, transparent 1px);
          background-size: 72px 72px;
          mask-image: linear-gradient(to bottom, transparent, black 38%, black 100%);
          opacity: 0.14;
          animation: agentGridDrift 18s linear infinite;
        }

        @keyframes agentBaseGlow {
          0% {
            transform: scale(1.05);
            filter: saturate(1.1) hue-rotate(0deg);
            opacity: 0.78;
          }

          50% {
            transform: scale(1.11);
            filter: saturate(1.35) hue-rotate(5deg);
            opacity: 1;
          }

          100% {
            transform: scale(1.08);
            filter: saturate(1.22) hue-rotate(-4deg);
            opacity: 0.86;
          }
        }

        @keyframes agentGridDrift {
          from {
            background-position: 0 0;
          }

          to {
            background-position: 72px 72px;
          }
        }
      `}</style>
    </section>
  );
}
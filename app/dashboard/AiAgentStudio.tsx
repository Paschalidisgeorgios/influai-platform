"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Clapperboard,
  CreditCard,
  Copy,
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
import { formatCopy, type DashboardLanguage } from "./i18n";

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
/**
 * Lip Sync stays Planned for this release cycle.
 * Keep UI visible as roadmap-only and prevent generation triggers.
 */
const LIP_SYNC_PUBLIC_ENABLED = false;

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

type SuggestedCaption = {
  displayText: string;
  body: string;
  hashtagsLine: string;
};

const CAPTION_STOP_WORDS = new Set([
  "create",
  "generate",
  "make",
  "design",
  "a",
  "an",
  "the",
  "with",
  "and",
  "for",
  "in",
  "on",
  "at",
  "to",
  "of",
  "cinematic",
  "premium",
  "vertical",
  "horizontal",
  "photo",
  "image",
  "visual",
  "shot",
  "campaign",
  "aesthetic",
  "lighting",
  "commercial",
  "high",
  "end",
  "social",
  "media",
  "no",
  "text",
  "logo",
  "her",
  "his",
  "their",
  "she",
  "he",
  "showing",
  "featuring",
  "portrait",
  "creator",
  "ad",
  "concept",
]);

function workflowToImageMode(workflow: string | null | undefined): ImageModeKey {
  switch (workflow) {
    case "ugc_look":
      return "ugc_look";
    case "brand_assets":
      return "brand_assets";
    case "fast_draft":
      return "fast_draft";
    case "premium_image":
      return "premium_image";
    case "reference_edit":
      return "reference_edit";
    default:
      return "standard";
  }
}

function resolveFormatKeyFromResult(
  outputFormat: string | null | undefined,
  fallback: OutputFormatKey
): OutputFormatKey {
  if (!outputFormat) return fallback;

  const lower = outputFormat.toLowerCase();

  if (lower.includes("tiktok") || lower.includes("reels")) return "tiktok";
  if (lower.includes("story")) return "instagram_story";
  if (lower.includes("instagram")) return "instagram_post";
  if (lower.includes("thumbnail")) return "youtube_thumbnail";
  if (lower.includes("shorts")) return "youtube_shorts";
  if (lower.includes("square") || lower.includes("1:1")) return "square";

  const keys: OutputFormatKey[] = [
    "square",
    "tiktok",
    "instagram_post",
    "instagram_story",
    "youtube_thumbnail",
    "youtube_shorts",
  ];

  for (const key of keys) {
    if (lower.includes(key.replaceAll("_", " ")) || lower.includes(key)) {
      return key;
    }
  }

  return fallback;
}

function cleanPromptForCaption(raw: string): string {
  let cleaned = raw.trim();

  const stripPatterns = [
    /^(create|generate|make|design)\s+(a\s+)?(cinematic\s+|premium\s+|vertical\s+|professional\s+)*(photo|image|visual|shot|portrait|ad)\s+(of|for|showing)\s+/i,
    /^(create|generate|make)\s+/i,
    /\s+(no text|no logo|no watermark).*$/i,
    /\s*,\s*high[- ]end.*$/i,
  ];

  for (const pattern of stripPatterns) {
    cleaned = cleaned.replace(pattern, "");
  }

  return cleaned.replace(/\s+/g, " ").replace(/[,.]+\s*$/, "").trim();
}

function extractSignificantWords(prompt: string): string[] {
  const cleaned = cleanPromptForCaption(prompt).toLowerCase();
  const words = cleaned
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !CAPTION_STOP_WORDS.has(word));

  return [...new Set(words)];
}

function hashString(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }

  return Math.abs(hash);
}

function capitalizeFirst(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function lowerFirst(value: string): string {
  if (!value) return value;
  return value.charAt(0).toLowerCase() + value.slice(1);
}

function buildHashtagThemes(
  prompt: string,
  formatKey: OutputFormatKey,
  imageMode: ImageModeKey
): string[] {
  const words = extractSignificantWords(prompt);
  const tags: string[] = [];

  const push = (tag: string) => {
    const normalized = tag.replace(/[^a-z0-9]/gi, "").toLowerCase();

    if (normalized.length > 2 && !tags.includes(normalized)) {
      tags.push(normalized);
    }
  };

  words.forEach((word) => push(word));

  const blob = words.join(" ");

  if (/\b(fitness|gym|workout|protein|preworkout)\b/.test(blob)) {
    [
      "fitnesscreator",
      "preworkout",
      "gymroutine",
      "healthylifestyle",
      "creatorcontent",
      "wellness",
    ].forEach(push);
  }

  if (/\b(food|recipe|cook|kitchen)\b/.test(blob)) {
    ["foodcontent", "recipeoftheday", "homecooking", "foodcreator"].forEach(push);
  }

  if (/\b(fashion|style|outfit|luxury)\b/.test(blob)) {
    ["styleinspo", "ootd", "fashioncreator", "luxurylifestyle"].forEach(push);
  }

  if (/\b(product|brand|skincare|beauty)\b/.test(blob)) {
    ["brandcontent", "productshot", "creatormarketing", "ugcstyle"].forEach(push);
  }

  if (imageMode === "ugc_look") push("authenticcontent");
  if (imageMode === "brand_assets") push("brandmarketing");

  switch (formatKey) {
    case "tiktok":
      push("tiktok");
      push("reels");
      break;
    case "instagram_post":
    case "instagram_story":
      push("instagram");
      push("creatordaily");
      break;
    case "youtube_thumbnail":
      push("youtube");
      push("thumbnail");
      break;
    case "youtube_shorts":
      push("youtubeshorts");
      push("shorts");
      break;
    default:
      push("creatorcontent");
  }

  return tags.slice(0, 8);
}

function formatHashtags(tags: string[]): string {
  return tags.map((tag) => `#${tag}`).join(" ");
}

function buildCaptionBody(
  prompt: string,
  imageMode: ImageModeKey,
  formatKey: OutputFormatKey,
  styleProfileName: string | null | undefined,
  locale: DashboardLanguage
): string {
  const cleaned = cleanPromptForCaption(prompt);
  const lower = cleaned.toLowerCase();

  const styleNote =
    styleProfileName &&
    (imageMode === "brand_assets" || imageMode === "premium_image")
      ? locale === "de"
        ? ` Im Look von ${styleProfileName}.`
        : ` In the ${styleProfileName} signature style.`
      : styleProfileName && imageMode === "ugc_look"
        ? locale === "de"
          ? ` Authentisch im Stil von ${styleProfileName}.`
          : ` Authentic vibes with ${styleProfileName}.`
        : "";

  if (
    /\b(pre[- ]?workout|before (the )?gym)\b/.test(lower) &&
    /\b(protein|shake|fuel|car)\b/.test(lower)
  ) {
    return locale === "de"
      ? `Kurzer Moment vor dem Training. Auftanken, fokussiert bleiben und heute für dich selbst da sein.${styleNote}`
      : `Pre-workout moments before the real work starts. Fuel up, stay focused, and show up for yourself today.${styleNote}`;
  }

  const subject = cleaned.length > 0 ? cleaned : prompt.slice(0, 120);
  const shortSubject =
    subject.length > 72 ? `${subject.slice(0, 72).trim()}…` : subject;

  if (formatKey === "youtube_thumbnail") {
    const hook = capitalizeFirst(shortSubject).replace(/\.$/, "");
    return locale === "de" ? `${hook} — jetzt ansehen` : `${hook} — watch this`;
  }

  if (imageMode === "ugc_look") {
    const templates =
      locale === "de"
        ? [
            `${capitalizeFirst(shortSubject)}. Einfach echt — genau so läuft es gerade.`,
            `Kleiner Moment aus dem Alltag: ${lowerFirst(shortSubject)}. Mehr davon folgt.`,
            `Heute on point: ${lowerFirst(shortSubject)}. Swipe, speichern, weitermachen.`,
          ]
        : [
            `${capitalizeFirst(shortSubject)}. Keeping it real — this is the energy today.`,
            `Little behind-the-scenes moment: ${lowerFirst(shortSubject)}. Save this if it resonates.`,
            `Today's vibe: ${lowerFirst(shortSubject)}. Posting it as-is.`,
          ];

    return templates[hashString(prompt) % templates.length] + styleNote;
  }

  if (imageMode === "brand_assets") {
    return locale === "de"
      ? `Kampagnenvisual für ${lowerFirst(shortSubject)}. Klar, hochwertig und scroll-stark.${styleNote}`
      : `Campaign visual for ${lowerFirst(shortSubject)}. Polished, clear, and built to stop the scroll.${styleNote}`;
  }

  if (imageMode === "premium_image") {
    return locale === "de"
      ? `Premium-Look für ${lowerFirst(shortSubject)}. Stilvoll inszeniert und bereit für den Feed.${styleNote}`
      : `Premium look for ${lowerFirst(shortSubject)}. Elevated styling, ready for your feed.${styleNote}`;
  }

  const isVerticalSocial =
    formatKey === "tiktok" ||
    formatKey === "instagram_post" ||
    formatKey === "instagram_story" ||
    formatKey === "youtube_shorts";

  if (isVerticalSocial) {
    return locale === "de"
      ? `${capitalizeFirst(shortSubject)}. Speichern, teilen und dranbleiben.${styleNote}`
      : `${capitalizeFirst(shortSubject)}. Save it, share it, and keep the momentum going.${styleNote}`;
  }

  return locale === "de"
    ? `${capitalizeFirst(shortSubject)}. Bereit für deinen nächsten Post.${styleNote}`
    : `${capitalizeFirst(shortSubject)}. Ready for your next post.${styleNote}`;
}

function buildSuggestedCaption(params: {
  prompt: string;
  formatKey: OutputFormatKey;
  imageMode: ImageModeKey;
  styleProfileName?: string | null;
  locale: DashboardLanguage;
}): SuggestedCaption {
  const { prompt, formatKey, imageMode, styleProfileName, locale } = params;
  const body = buildCaptionBody(
    prompt,
    imageMode,
    formatKey,
    styleProfileName,
    locale
  );
  const tagCount =
    formatKey === "youtube_thumbnail"
      ? 5
      : formatKey === "youtube_shorts"
        ? 6
        : 7;
  const hashtagsLine = formatHashtags(
    buildHashtagThemes(prompt, formatKey, imageMode).slice(0, tagCount)
  );

  return {
    body,
    hashtagsLine,
    displayText: `${body}\n\n${hashtagsLine}`,
  };
}

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

function ImageModeChip({
  label,
  selected,
  disabled,
  onClick,
  title,
}: {
  label: string;
  selected: boolean;
  disabled?: boolean;
  onClick?: () => void;
  title?: string;
}) {
  if (disabled) {
    return (
      <span
        title={title}
        className="inline-flex cursor-not-allowed items-center rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[11px] font-bold text-white/30"
      >
        {label}
      </span>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={selected}
      title={title}
      onClick={onClick}
      className={`inline-flex items-center rounded-full border px-3 py-2 text-[11px] font-black transition outline-none focus-visible:ring-2 focus-visible:ring-[#d8ad5f]/40 ${
        selected
          ? "border-[#d8ad5f]/50 bg-[#d8ad5f]/15 text-[#f0d4a8] ring-1 ring-[#d8ad5f]/25"
          : "border-white/10 bg-black/25 text-white/60 hover:border-white/20 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

function getImageModeChipLabel(
  key: ImageModeKey,
  chips: {
    standard: string;
    fastDraft: string;
    ugcLook: string;
    premium: string;
    brandAssets: string;
    referenceEdit: string;
  }
) {
  switch (key) {
    case "fast_draft":
      return chips.fastDraft;
    case "ugc_look":
      return chips.ugcLook;
    case "premium_image":
      return chips.premium;
    case "brand_assets":
      return chips.brandAssets;
    case "reference_edit":
      return chips.referenceEdit;
    case "standard":
    default:
      return chips.standard;
  }
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
  const { copy, format, language } = useDashboardLanguage();
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
  const [captionCopied, setCaptionCopied] = useState(false);
  const [processingStepIndex, setProcessingStepIndex] = useState(0);

  const processingSteps = useMemo(
    () => [
      a.processingStepBrief,
      a.processingStepDirection,
      a.processingStepFormat,
      a.processingStepSaving,
    ],
    [a]
  );

  const activeProcessingStep =
    processingSteps[processingStepIndex % processingSteps.length] ??
    a.processingStepBrief;

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
    if (agentResult?.status !== "processing") {
      setProcessingStepIndex(0);
      return;
    }

    const interval = window.setInterval(() => {
      setProcessingStepIndex((current) => (current + 1) % processingSteps.length);
    }, 2800);

    return () => window.clearInterval(interval);
  }, [agentResult?.status, processingSteps.length]);

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
  const showSplitWorkspace = Boolean(agentResult);

  const selectedImageModeEntry = useMemo(
    () => imageModes.find((mode) => mode.key === imageMode),
    [imageModes, imageMode]
  );

  const activeModeShortLine = useMemo(() => {
    if (!selectedImageModeEntry) return "";
    if ("hoverHint" in selectedImageModeEntry && selectedImageModeEntry.hoverHint) {
      return selectedImageModeEntry.hoverHint;
    }
    return selectedImageModeEntry.description;
  }, [selectedImageModeEntry]);

  useEffect(() => {
    setCaptionCopied(false);
  }, [agentResult?.id, agentResult?.status]);

  const suggestedCaption = useMemo(() => {
    if (
      agentResult?.status !== "completed" ||
      !agentResult.image_url ||
      agentResult.video_url
    ) {
      return null;
    }

    const resolvedImageMode = workflowToImageMode(agentResult.workflow ?? null);
    const resolvedFormatKey = resolveFormatKeyFromResult(
      agentResult.output_format,
      outputFormatKey
    );

    return buildSuggestedCaption({
      prompt: agentResult.prompt,
      formatKey: resolvedFormatKey,
      imageMode: resolvedImageMode,
      styleProfileName: selectedCharacter?.name ?? null,
      locale: language,
    });
  }, [
    agentResult,
    language,
    outputFormatKey,
    selectedCharacter?.name,
  ]);

  async function copySuggestedCaption() {
    if (!suggestedCaption) return;

    try {
      await navigator.clipboard.writeText(suggestedCaption.displayText);
      setCaptionCopied(true);
      window.setTimeout(() => setCaptionCopied(false), 2200);
    } catch (error) {
      console.error("Caption copy failed:", error);
    }
  }

  const formSurfaceClass = showSplitWorkspace
    ? "relative isolate flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl"
    : "relative isolate w-full max-w-3xl overflow-visible rounded-[1.75rem] border border-white/10 bg-white/[0.05] shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl";

  function renderComposerContent() {
    return (
      <>
        {studioTab === "image" ? (
          <>
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={submitFromTextarea}
              placeholder={typedExample || a.promptPlaceholder}
              className={`w-full resize-none rounded-2xl border border-white/10 bg-black/35 px-4 py-4 text-white outline-none placeholder:text-white/30 focus-visible:ring-2 focus-visible:ring-[#d8ad5f]/35 ${
                showSplitWorkspace
                  ? "min-h-[88px] text-sm leading-relaxed"
                  : "min-h-[132px] text-base leading-relaxed sm:min-h-[148px] sm:text-lg"
              }`}
            />
            <p className="mt-2 text-[10px] font-medium text-white/32">{a.enterHint}</p>
          </>
        ) : studioTab === "video" ? (
          <p className="text-sm leading-6 text-white/50">{a.videoStudioLongerHint}</p>
        ) : (
          <p className="text-sm leading-6 text-white/50">{a.lipSyncLongerHint}</p>
        )}

        <div className="mt-4 space-y-4">
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
              {a.imageStudioTab}
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
              <span>
                {VIDEO_STUDIO_PUBLIC_ENABLED
                  ? a.studioTabVideo
                  : a.studioTabVideoPlanned}
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
              <span>
                {LIP_SYNC_PUBLIC_ENABLED
                  ? a.studioTabLipSync
                  : a.studioTabLipSyncPlanned}
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
            <>
              <div className="flex flex-wrap gap-2">
                {imageModes.map((mode) => {
                  const isSelectable =
                    mode.status === "live" || mode.status === "beta";
                  const isSelected = isSelectable && imageMode === mode.key;
                  const chipLabel = getImageModeChipLabel(
                    mode.key,
                    a.imageModeChips
                  );
                  const chipTitle =
                    "hoverHint" in mode && mode.hoverHint
                      ? `${mode.description} — ${mode.hoverHint}`
                      : mode.description;

                  return (
                    <ImageModeChip
                      key={mode.key}
                      label={chipLabel}
                      selected={isSelected}
                      disabled={!isSelectable}
                      title={chipTitle}
                      onClick={
                        isSelectable
                          ? () => setImageMode(mode.key)
                          : undefined
                      }
                    />
                  );
                })}
              </div>
              {activeModeShortLine ? (
                <p className="text-xs leading-5 text-white/42">{activeModeShortLine}</p>
              ) : null}
              {isReferenceEditActive ? (
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
              ) : null}
            </>
          ) : null}

          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
              {a.styleProfile}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <select
                value={selectedCharacterId}
                onChange={(event) => {
                  setSelectedCharacterId(event.target.value);
                }}
                aria-label={a.styleProfileAria}
                className="w-full max-w-full rounded-full border border-white/10 bg-black/35 px-3 py-2.5 text-xs font-bold text-white outline-none sm:w-auto sm:min-w-[200px] sm:max-w-[280px]"
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

                {formatMenuOpen ? (
                  <div className="absolute left-0 right-0 top-12 z-50 max-h-[min(60vh,320px)] overflow-y-auto overscroll-contain rounded-2xl border border-white/10 bg-[#101014] p-1.5 shadow-2xl sm:right-auto sm:w-64">
                    <div className="space-y-1">
                      {localizedOutputFormats.map((formatOption) => {
                        const Icon = formatOption.icon;
                        const active = outputFormatKey === formatOption.key;

                        return (
                          <button
                            key={formatOption.key}
                            type="button"
                            onClick={() => {
                              setOutputFormatKey(formatOption.key);
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
                                  {formatOption.label}
                                </span>
                                <span
                                  className={`block truncate text-[11px] ${
                                    active ? "text-black/55" : "text-white/35"
                                  }`}
                                >
                                  {formatOption.platform}
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
                              {formatOption.ratio}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
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
            className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-full px-5 text-sm font-black shadow-xl transition disabled:opacity-50 ${
              isLipSyncActive
                ? "bg-violet-500 text-white hover:bg-violet-400"
                : isVideoStudioActive
                  ? "bg-sky-500 text-black hover:bg-sky-400"
                  : "bg-[#d8ad5f] text-black hover:bg-[#efc777]"
            }`}
          >
            {isSubmitBlocked ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isLipSyncActive ? (
              <>
                <Mic className="h-4 w-4" aria-hidden />
                <span>{a.generateLipSync}</span>
              </>
            ) : isVideoStudioActive ? (
              <>
                <Clapperboard className="h-4 w-4" aria-hidden />
                <span>{a.generateVideo}</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" aria-hidden />
                <span>{a.generateButton}</span>
              </>
            )}
          </motion.button>
        </div>
      </>
    );
  }

  function renderResultPanel() {
    if (!agentResult) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur-xl"
      >
        <div className="shrink-0 border-b border-white/10 px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#d8ad5f]">
                {a.latestResult}
              </p>
              <h3 className="mt-2 text-lg font-black text-white sm:text-xl">
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
            </div>

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

          {agentResult.status === "processing" ? (
            <div className="mt-4 space-y-3">
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
              <p className="text-sm font-bold text-[#d8ad5f]">
                {activeProcessingStep}
              </p>
              <p className="text-xs leading-5 text-white/40">{a.processingHint}</p>
            </div>
          ) : null}
        </div>

        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-black/45">
          {agentResult.status === "processing" ? (
            <div className="flex w-full max-w-md flex-col items-center justify-center gap-5 p-8 text-center sm:p-10">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-[#d8ad5f]/30 blur-2xl" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-[#d8ad5f]/25 bg-[#d8ad5f]/10">
                  <Loader2 className="h-10 w-10 animate-spin text-[#d8ad5f]" />
                </div>
              </div>
              <div>
                <p className="text-lg font-black text-white">
                  {activeProcessingStep}
                </p>
                <p className="mt-3 text-sm leading-6 text-white/45">
                  {isLipSyncWorkflow(agentResult.workflow)
                    ? a.lipSyncLongerHint
                    : isVideoStudioWorkflow(agentResult.workflow)
                      ? a.videoStudioLongerHint
                      : a.processingStay}
                </p>
              </div>
            </div>
          ) : null}

          {agentResult.status === "insufficient_credits" ? (
            <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
              <CreditCard className="h-12 w-12 text-amber-100" />
              <p className="text-base font-black text-white">
                {a.insufficientCreditsIntro}
              </p>
              <p className="text-sm text-white/55">
                {format(a.insufficientCreditsModeRequires, {
                  count:
                    agentResult.requiredCredits ??
                    getRequiredCreditsForStudio(studioTab, imageMode),
                })}
              </p>
              {onOpenCredits ? (
                <button
                  type="button"
                  onClick={onOpenCredits}
                  className="inline-flex items-center justify-center rounded-full bg-[#d8ad5f] px-5 py-3 text-sm font-black text-black"
                >
                  {a.buyCredits}
                </button>
              ) : null}
            </div>
          ) : null}

          {agentResult.status === "active_generation_limit" ? (
            <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
              <Clock className="h-12 w-12 text-sky-100" />
              <p className="text-base font-black text-white">
                {a.activeGenerationLimitTitle}
              </p>
              <p className="text-sm text-white/55">
                {a.activeGenerationLimitIntro}
              </p>
            </div>
          ) : null}

          {agentResult.status === "failed" ? (
            <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-200" />
              <p className="text-sm font-bold text-red-100">{a.failed}</p>
              {shouldShowCreditsRefundedHint(
                agentResult.error_message,
                Boolean(agentResult.id),
                a.signInAgain,
                a.networkError
              ) ? (
                <p className="text-xs font-semibold text-red-100/80">
                  {a.creditsRefundedHint}
                </p>
              ) : null}
              <p className="max-w-md text-xs leading-6 text-red-100/60">
                {agentResult.error_message ?? copy.gallery.unknownError}
              </p>
            </div>
          ) : null}

          {agentResult.status === "completed" && agentResult.video_url ? (
            <video
              src={agentResult.video_url}
              controls
              playsInline
              className="max-h-full w-full object-contain"
            />
          ) : null}

          {agentResult.status === "completed" &&
          !agentResult.video_url &&
          agentResult.image_url ? (
            <img
              src={agentResult.image_url}
              alt={agentResult.prompt}
              className="max-h-full w-full object-contain"
              referrerPolicy="no-referrer"
            />
          ) : null}

          {agentResult.status === "completed" &&
          !agentResult.video_url &&
          !agentResult.image_url ? (
            <div className="flex flex-col items-center gap-3 p-8 text-center">
              <ImageOff className="h-12 w-12 text-white/45" />
              <p className="text-sm font-bold text-white">{a.imageUrlMissing}</p>
            </div>
          ) : null}
        </div>

        <div className="shrink-0 space-y-3 border-t border-white/10 p-4 sm:p-5">
          <p className="line-clamp-2 text-xs leading-5 text-white/45">
            {agentResult.prompt}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {agentResult.video_url ? (
              <a
                href={agentResult.video_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex flex-1 items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-black text-black"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                {a.openVideo}
              </a>
            ) : null}
            {agentResult.image_url && !agentResult.video_url ? (
              <a
                href={agentResult.image_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex flex-1 items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-black text-black"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                {a.openImage}
              </a>
            ) : null}
            {agentResult.status === "completed" && onOpenGallery ? (
              <button
                type="button"
                onClick={onOpenGallery}
                className="inline-flex flex-1 items-center justify-center rounded-full border border-[#d8ad5f]/30 bg-[#d8ad5f]/10 px-5 py-3 text-sm font-bold text-[#d8ad5f]"
              >
                <GalleryVerticalEnd className="mr-2 h-4 w-4" />
                {a.viewInGallery}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => {
                setQueuedGenerationId(null);
                setAgentResult(null);
                setStatusMessage(null);
                setErrorMessage(null);
              }}
              className="inline-flex flex-1 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-bold text-white/70"
            >
              {a.createAnother}
            </button>
          </div>

          {agentResult.status === "completed" &&
          agentResult.image_url &&
          !agentResult.video_url &&
          suggestedCaption ? (
            <div className="rounded-xl border border-[#d8ad5f]/25 bg-[#d8ad5f]/[0.07] p-3.5 sm:p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#d8ad5f]">
                    {a.suggestedCaptionTitle}
                  </p>
                  <p className="mt-1 text-[11px] text-white/42">
                    {a.suggestedCaptionSubtitle}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void copySuggestedCaption()}
                  className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-black transition ${
                    captionCopied
                      ? "border border-emerald-500/30 bg-emerald-500/15 text-emerald-100"
                      : "bg-[#d8ad5f] text-black hover:bg-[#efc777]"
                  }`}
                >
                  {captionCopied ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                      <span>{a.suggestedCaptionCopied}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" aria-hidden />
                      <span>{a.suggestedCaptionCopy}</span>
                    </>
                  )}
                </button>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-white/82">
                {suggestedCaption.body}
              </p>
              <p className="mt-2 break-words text-xs leading-relaxed text-[#d8ad5f]/90">
                {suggestedCaption.hashtagsLine}
              </p>
            </div>
          ) : null}
        </div>
      </motion.div>
    );
  }

  return (
    <section
      id="agent"
      className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[#06060a]"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-50">
        <div className="agent-film-bg absolute inset-0" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(6,6,10,0.95),rgba(6,6,10,0.88))]" />
      </div>

      <div className="relative z-10 flex h-full min-h-0 flex-col overflow-hidden px-3 py-3 sm:px-5 sm:py-4">
        {statusMessage ? (
          <div className="mb-2 shrink-0 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-bold text-white">
            {statusMessage}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mb-2 flex shrink-0 items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-100">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        ) : null}

        {!showSplitWorkspace ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto overscroll-contain lg:overflow-hidden">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl text-center text-2xl font-black tracking-[-0.04em] text-white sm:text-3xl lg:text-4xl"
            >
              {a.searchHeadline}
            </motion.h1>

            <motion.form
              ref={formRef}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              onSubmit={queueGeneration}
              className={`${formSurfaceClass} mt-6 w-full`}
            >
              <div className="relative z-10 flex flex-col p-4 sm:p-5">
                {renderComposerContent()}
              </div>
            </motion.form>
          </div>
        ) : (
          <div className="grid h-full min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-[2fr_3fr] lg:gap-5">
            <motion.form
              ref={formRef}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35 }}
              onSubmit={queueGeneration}
              className={formSurfaceClass}
            >
              <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain p-4">
                {renderComposerContent()}
              </div>
            </motion.form>

            <div
              ref={resultRef}
              className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden"
            >
              {renderResultPanel()}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .agent-film-bg {
          background:
            radial-gradient(circle at 50% 0%, rgba(216, 173, 95, 0.12), transparent 42%),
            linear-gradient(to bottom, #07070a 0%, #0a0a0e 100%);
        }
      `}</style>
    </section>
  );
}

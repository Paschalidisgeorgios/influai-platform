/**
 * Export Pack — prepare creator-ready formats from already-generated assets.
 * Basic export is free; HD upscale is a separate credit-gated action.
 */

import {
  buildCaptions,
  buildHashtags,
  type HooksCaptionsPlatform,
} from "@/app/lib/copy/hooks-captions";
import { isExportFreeForGeneratedAsset } from "@/app/lib/billing/monetization-rules";

export const EXPORT_PACK_ID = "export_pack";

export const EXPORT_PACK_CREDITS = 0;

/** Shown when user opts into HD upscale — separate paid action, not run from export pack. */
export const EXPORT_PACK_HD_UPSCALE_CREDIT_HINT = 4;

export type ExportPackPlatform = HooksCaptionsPlatform;

export type ExportFormatSuggestion = {
  platform: ExportPackPlatform;
  aspectRatio: string;
  resolutionHint: string;
  usageNote: string;
};

export type ExportPackAssetRef = {
  id: string;
  url: string;
  outputType: "image" | "video";
  prompt?: string | null;
  createdAt?: string | null;
};

export type ExportPackManifest = {
  topic: string;
  formatSuggestions: ExportFormatSuggestion[];
  captions: string[];
  hashtags: string[];
  selectedAssets: ExportPackAssetRef[];
  exportCredits: typeof EXPORT_PACK_CREDITS;
  hdUpscaleCreditHint: number;
  exportPolicyNote: string;
};

export type ExportPackPreviewRequest = {
  prompt?: string;
  language?: "en" | "de";
  assetPrompts?: string[];
};

export const EXPORT_PACK_UI_COPY = {
  en: {
    title: "Export Pack",
    description: "Prepare your assets for TikTok, Reels, Story and Feed.",
    prepareCta: "Prepare export pack · Free",
    preparing: "Preparing…",
    costNote:
      "Downloading assets you already generated is free. HD upscale is a separate action with its own credit cost.",
    formatsLabel: "Format suggestions",
    captionsLabel: "Captions",
    hashtagsLabel: "Hashtags",
    assetsLabel: "Selected assets",
    assetsEmpty:
      "No completed assets yet — generate images or videos first, then return here.",
    downloadAsset: "Download",
    downloadAll: "Download selected",
    copyManifest: "Copy export summary",
    copyCaptions: "Copy captions",
    copyHashtags: "Copy hashtags",
    copied: "Copied",
    copy: "Copy",
    hdUpscaleTitle: "HD Upscale (optional, separate)",
    hdUpscaleNote:
      "Higher-resolution export uses the Upscale tool and charges credits before rendering — not included in this free export pack.",
    hdUpscaleCredits: "credits if you run upscale",
    freeExportBadge: "Free export",
    errorGeneric: "Could not prepare export pack. Try again.",
    promptHint: "Describe your campaign or leave blank to use selected asset prompts.",
    selectAssets: "Select assets to include",
  },
  de: {
    title: "Export-Paket",
    description:
      "Bereite creator-ready Formate für TikTok, Reels, Story und Feed vor.",
    prepareCta: "Export-Paket vorbereiten · Kostenlos",
    preparing: "Wird vorbereitet…",
    costNote:
      "Der Download bereits generierter Assets ist kostenlos. HD-Upscale ist eine separate Aktion mit eigenen Credit-Kosten.",
    formatsLabel: "Format-Vorschläge",
    captionsLabel: "Captions",
    hashtagsLabel: "Hashtags",
    assetsLabel: "Ausgewählte Assets",
    assetsEmpty:
      "Noch keine fertigen Assets — generiere zuerst Bilder oder Videos und kehre dann hierher zurück.",
    downloadAsset: "Download",
    downloadAll: "Ausgewählte herunterladen",
    copyManifest: "Export-Zusammenfassung kopieren",
    copyCaptions: "Captions kopieren",
    copyHashtags: "Hashtags kopieren",
    copied: "Kopiert",
    copy: "Kopieren",
    hdUpscaleTitle: "HD-Upscale (optional, separat)",
    hdUpscaleNote:
      "Export in höherer Auflösung nutzt das Upscale-Tool und bucht Credits vor dem Rendern ab — nicht im kostenlosen Export-Paket enthalten.",
    hdUpscaleCredits: "Credits bei Upscale-Lauf",
    freeExportBadge: "Kostenloser Export",
    errorGeneric: "Export-Paket konnte nicht vorbereitet werden. Bitte erneut versuchen.",
    promptHint:
      "Beschreibe deine Kampagne oder lasse leer, um Prompts der ausgewählten Assets zu nutzen.",
    selectAssets: "Assets zum Export auswählen",
  },
} as const;

const FORMAT_SPECS: Record<
  ExportPackPlatform,
  { aspectRatio: string; resolutionHintEn: string; resolutionHintDe: string; usageEn: string; usageDe: string }
> = {
  TikTok: {
    aspectRatio: "9:16",
    resolutionHintEn: "1080×1920 vertical",
    resolutionHintDe: "1080×1920 vertikal",
    usageEn: "Short-form vertical hook + product focus",
    usageDe: "Kurzes vertikales Hook-Format mit Produktfokus",
  },
  Reels: {
    aspectRatio: "9:16",
    resolutionHintEn: "1080×1920 vertical",
    resolutionHintDe: "1080×1920 vertikal",
    usageEn: "Instagram Reels cover + motion-friendly crop",
    usageDe: "Instagram Reels Cover + motion-freundlicher Crop",
  },
  Story: {
    aspectRatio: "9:16",
    resolutionHintEn: "1080×1920 full-screen",
    resolutionHintDe: "1080×1920 Vollbild",
    usageEn: "Swipe-up story frame with bold headline space",
    usageDe: "Swipe-up Story-Frame mit Platz für Headline",
  },
  Feed: {
    aspectRatio: "1:1 / 4:5",
    resolutionHintEn: "1080×1080 or 1080×1350",
    resolutionHintDe: "1080×1080 oder 1080×1350",
    usageEn: "Square or portrait feed post with clean margins",
    usageDe: "Quadrat- oder Portrait-Feed-Post mit sauberen Rändern",
  },
};

function truncateTopic(prompt: string, max = 72): string {
  const t = prompt.trim();
  if (!t) return "";
  if (t.length <= max) return t;
  return `${t.slice(0, max).trim()}…`;
}

export function buildExportFormatSuggestions(
  language: "en" | "de"
): ExportFormatSuggestion[] {
  const isDe = language === "de";
  return (Object.keys(FORMAT_SPECS) as ExportPackPlatform[]).map((platform) => {
    const spec = FORMAT_SPECS[platform];
    return {
      platform,
      aspectRatio: spec.aspectRatio,
      resolutionHint: isDe ? spec.resolutionHintDe : spec.resolutionHintEn,
      usageNote: isDe ? spec.usageDe : spec.usageEn,
    };
  });
}

export function resolveExportPackTopic(input: {
  prompt?: string;
  assetPrompts?: string[];
  language: "en" | "de";
}): string {
  const fromPrompt = truncateTopic(input.prompt ?? "", 56);
  if (fromPrompt) return fromPrompt;
  const firstAsset = input.assetPrompts?.find((p) => p?.trim())?.trim();
  if (firstAsset) return truncateTopic(firstAsset, 56);
  return input.language === "de" ? "deine Kampagne" : "your campaign";
}

export function buildExportPackManifest(input: {
  prompt?: string;
  language?: "en" | "de";
  assetPrompts?: string[];
  selectedAssets?: ExportPackAssetRef[];
}): ExportPackManifest {
  const language = input.language === "de" ? "de" : "en";
  const isDe = language === "de";
  const topic = resolveExportPackTopic({
    prompt: input.prompt,
    assetPrompts: input.assetPrompts,
    language,
  });

  return {
    topic,
    formatSuggestions: buildExportFormatSuggestions(language),
    captions: buildCaptions(topic, language),
    hashtags: buildHashtags(language),
    selectedAssets: input.selectedAssets ?? [],
    exportCredits: EXPORT_PACK_CREDITS,
    hdUpscaleCreditHint: EXPORT_PACK_HD_UPSCALE_CREDIT_HINT,
    exportPolicyNote: isDe
      ? "Bereits bezahlte/generierte Assets können kostenlos exportiert werden."
      : "Assets you already paid to generate can be exported again at no extra cost.",
  };
}

export function getExportPackUiCopy(language: "en" | "de" = "en") {
  return EXPORT_PACK_UI_COPY[language === "de" ? "de" : "en"];
}

export function formatExportPackForClipboard(
  manifest: ExportPackManifest,
  language: "en" | "de"
): string {
  const copy = getExportPackUiCopy(language);
  const lines = [
    copy.title,
    manifest.topic,
    "",
    copy.formatsLabel,
    ...manifest.formatSuggestions.map(
      (format) =>
        `${format.platform}: ${format.aspectRatio} · ${format.resolutionHint} — ${format.usageNote}`
    ),
    "",
    copy.captionsLabel,
    ...manifest.captions.map((caption, index) => `${index + 1}. ${caption}`),
    "",
    copy.hashtagsLabel,
    manifest.hashtags.join(" "),
    "",
    copy.assetsLabel,
    ...manifest.selectedAssets.map(
      (asset) => `${asset.outputType}: ${asset.prompt ?? asset.id}`
    ),
  ];
  return lines.join("\n");
}

export function canExportAssetWithoutCharge(): boolean {
  return isExportFreeForGeneratedAsset({ creditsAlreadyCharged: true });
}

export function downloadExportAsset(url: string): void {
  if (!url.trim()) return;
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  anchor.download = "";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

export function isExportPackWorkflowAvailable(
  galleryEnabled: boolean
): boolean {
  return galleryEnabled;
}

"use client";

import type { ComponentType } from "react";
import {
  Copy,
  Download,
  Eye,
  Heart,
  ImagePlus,
  Layers,
  Loader2,
  MessageSquareText,
  Palette,
  Play,
  Sparkles,
  Trash2,
  Wand2,
  Zap,
} from "lucide-react";
import type { CreatorCanvasAsset } from "@/app/components/studio/canvas-types";
import {
  buildGalleryCardActions,
  isPackGalleryAsset,
  type GalleryCardAction,
  type GalleryCardActionId,
} from "@/app/lib/gallery/gallery-card-actions";
import type { ResolveCreatorToolContext } from "@/app/lib/tools/resolve-tool";
import { GALLERY_NOTICES } from "@/lib/copy/gallery-copy";
import { formatRelativeTime } from "@/lib/format/relative-time";

export type GalleryAssetRow = {
  id: string;
  prompt?: string | null;
  image_url?: string | null;
  video_url?: string | null;
  created_at?: string | null;
  status?: string | null;
  is_favorite?: boolean | null;
  workflow?: string | null;
  creative_score?: number | null;
};

export function galleryRowToCanvasAsset(row: GalleryAssetRow): CreatorCanvasAsset | null {
  const url = row.video_url ?? row.image_url ?? null;
  if (!url) return null;
  const outputType = row.video_url ? "video" : "image";
  return {
    id: row.id,
    url,
    outputType,
    prompt: row.prompt ?? undefined,
    createdAt: row.created_at ?? undefined,
    generationId: row.id,
    sourceStudio: outputType,
  };
}

const ACTION_ICONS: Record<
  GalleryCardActionId,
  ComponentType<{ className?: string; "aria-hidden"?: boolean }>
> = {
  view: Eye,
  copy_prompt: Copy,
  create_variant: Layers,
  check_creative_score: Sparkles,
  generate_hooks_captions: MessageSquareText,
  export_asset: Download,
  use_as_reference: ImagePlus,
  edit_image: Wand2,
  match_style: Palette,
  animate_image: Play,
  enhance_asset: Zap,
  favorite: Heart,
};

type Props = {
  asset: GalleryAssetRow;
  isDe?: boolean;
  busy?: boolean;
  toolContext?: ResolveCreatorToolContext;
  onAction: (
    action: GalleryCardAction,
    asset: GalleryAssetRow
  ) => void;
  onDelete: (asset: GalleryAssetRow) => void;
};

function GalleryActionButton({
  action,
  isDe,
  isFavorite,
  disabled,
  onClick,
}: {
  action: GalleryCardAction;
  isDe: boolean;
  isFavorite?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  const Icon = ACTION_ICONS[action.id];
  const label = isDe ? action.label.de : action.label.en;
  const isDetail = action.behavior === "detail_panel";
  const statusLabel = action.statusBadge
    ? isDe
      ? action.statusBadge.de
      : action.statusBadge.en
    : null;

  const title = action.creditCost
    ? `${label} · ${action.creditCost} ${action.creditCost === 1 ? "Credit" : "Credits"}`
    : statusLabel
      ? `${label} · ${statusLabel}`
      : label;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        if (disabled) return;
        onClick();
      }}
      title={title}
      aria-label={title}
      className={`inline-flex min-h-11 min-w-[4.5rem] flex-col items-center justify-center gap-1 rounded-xl border px-2.5 py-2 text-[10px] font-semibold transition ${
        isDetail
          ? "border-amber-500/25 bg-amber-500/10 text-amber-200/90 hover:border-amber-400/45 hover:text-amber-200"
          : "border-neutral-700/80 bg-neutral-950/85 text-neutral-200 hover:border-amber-400/50 hover:text-amber-300"
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      <Icon
        className={`h-3.5 w-3.5 ${
          action.id === "favorite" && isFavorite ? "fill-amber-400 text-amber-400" : ""
        }`}
        aria-hidden
      />
      <span className="max-w-[4.75rem] truncate leading-tight">{label}</span>
      {action.creditCost && action.behavior === "run" ? (
        <span className="font-mono text-[9px] text-amber-400/90">{action.creditCost}cr</span>
      ) : null}
      {statusLabel ? (
        <span className="text-[9px] font-normal text-amber-300/80">{statusLabel}</span>
      ) : null}
    </button>
  );
}

export default function GalleryAssetCard({
  asset,
  isDe = false,
  busy = false,
  toolContext,
  onAction,
  onDelete,
}: Props) {
  const url = asset.video_url ?? asset.image_url;
  const kind = asset.video_url ? "video" : "image";
  if (!url) return null;

  const lang = isDe ? "de" : "en";
  const actions = buildGalleryCardActions(kind, {
    ...toolContext,
    language: lang,
  });
  const isPack = isPackGalleryAsset(asset.workflow);
  const viewAction = actions.find((a) => a.id === "view");
  const exportAction = actions.find((a) => a.id === "export_asset");
  const favoriteAction = actions.find((a) => a.id === "favorite");
  const relativeDate = formatRelativeTime(asset.created_at, lang);
  const score = asset.creative_score;

  return (
    <article className="group relative mb-3 w-full break-inside-avoid overflow-hidden rounded-2xl border border-white/10 bg-black/30">
      <div className="relative bg-black/40">
        {kind === "video" ? (
          <video
            src={url}
            controls
            playsInline
            preload="metadata"
            className="relative z-[2] block max-h-[28rem] w-full object-contain"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              if (viewAction) onAction(viewAction, asset);
            }}
            className="block w-full text-left"
            aria-label={
              asset.prompt?.trim() ||
              (isDe ? "Asset öffnen" : "Open asset")
            }
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={asset.prompt ?? (isDe ? "Creator-Asset" : "Creator asset")}
              className="block max-h-[28rem] w-full object-contain"
              loading="lazy"
            />
          </button>
        )}
      </div>

      {typeof score === "number" ? (
        <div
          className={`absolute top-2 right-2 z-[5] rounded-full px-2 py-0.5 text-xs font-bold ${
            score >= 80
              ? "bg-green-500/20 text-green-400"
              : score >= 60
                ? "bg-[#d8ad5f]/20 text-[#d8ad5f]"
                : "bg-white/10 text-white/40"
          }`}
        >
          {score}
        </div>
      ) : null}

      {isPack ? (
        <span className="absolute left-2 top-2 z-[5] rounded-md border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-300">
          {isDe ? GALLERY_NOTICES.packBadge.de : GALLERY_NOTICES.packBadge.en}
        </span>
      ) : null}

      {favoriteAction ? (
        <button
          type="button"
          disabled={busy}
          onClick={(event) => {
            event.stopPropagation();
            onAction(favoriteAction, asset);
          }}
          className={`absolute z-[6] flex min-h-11 min-w-11 items-center justify-center rounded-xl border bg-neutral-950/85 transition ${
            isPack ? "left-2 top-12" : "left-2 top-2"
          } ${
            asset.is_favorite
              ? "border-amber-500/40 text-amber-400"
              : "border-white/10 text-white/50 hover:border-amber-500/30 hover:text-amber-300"
          }`}
          aria-label={
            asset.is_favorite
              ? isDe
                ? "Aus Favoriten entfernen"
                : "Remove from favorites"
              : isDe
                ? "Zu Favoriten"
                : "Add to favorites"
          }
        >
          <Heart
            className={`h-4 w-4 ${asset.is_favorite ? "fill-current" : ""}`}
            aria-hidden
          />
        </button>
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[6] flex justify-center gap-2 p-3 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100 sm:opacity-0">
        <div className="pointer-events-auto flex flex-wrap justify-center gap-2">
          {exportAction ? (
            <button
              type="button"
              disabled={busy}
              onClick={(event) => {
                event.stopPropagation();
                window.open(url, "_blank", "noopener,noreferrer");
              }}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#d8ad5f] px-4 py-2.5 text-xs font-bold text-black transition hover:bg-[#efc777] disabled:opacity-50"
            >
              <Download className="h-4 w-4 shrink-0" aria-hidden />
              {isDe ? "Download" : "Download"}
            </button>
          ) : null}
          {viewAction ? (
            <button
              type="button"
              disabled={busy}
              onClick={(event) => {
                event.stopPropagation();
                onAction(viewAction, asset);
              }}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 bg-black/70 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/10 disabled:opacity-50"
            >
              <Eye className="h-4 w-4 shrink-0" aria-hidden />
              {isDe ? "Details" : "View Details"}
            </button>
          ) : null}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] flex max-h-[55%] flex-col justify-end p-2 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
        {relativeDate ? (
          <p className="pointer-events-none mb-2 text-[10px] font-medium text-neutral-400">
            {relativeDate}
          </p>
        ) : null}
        <div className="pointer-events-auto mb-2 max-h-36 overflow-y-auto overscroll-contain">
          <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
            {actions
              .filter((a) => a.id !== "export_asset" && a.id !== "view")
              .map((action) => (
                <GalleryActionButton
                  key={action.id}
                  action={action}
                  isDe={isDe}
                  isFavorite={Boolean(asset.is_favorite)}
                  disabled={busy && action.id !== "view"}
                  onClick={() => onAction(action, asset)}
                />
              ))}
          </div>
        </div>
        <p className="pointer-events-none line-clamp-2 text-[10px] text-neutral-300">
          {asset.prompt ?? (isDe ? "Ohne Prompt" : "No prompt")}
        </p>
      </div>

      <div className="absolute bottom-2 right-2 z-[4] flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
        <button
          type="button"
          disabled={busy}
          onClick={(event) => {
            event.stopPropagation();
            onDelete(asset);
          }}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-neutral-700/80 bg-neutral-950/80 text-neutral-300 hover:text-red-400"
          aria-label={isDe ? "Löschen" : "Delete"}
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </button>
      </div>
    </article>
  );
}

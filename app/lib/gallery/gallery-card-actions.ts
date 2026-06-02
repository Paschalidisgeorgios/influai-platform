/**
 * Gallery card actions — every asset is a starting point for the next workflow.
 * Unavailable tools open the detail panel; only validated runnable tools execute.
 */

import {
  getCreatorToolById,
  isToolDetailPanelStatus,
  type CreatorToolId,
} from "@/app/lib/tools/creator-tools";
import {
  resolveCreatorTool,
  type ResolveCreatorToolContext,
} from "@/app/lib/tools/resolve-tool";
import { getToolStatusLabel } from "@/app/lib/tools/tool-status";

export type GalleryCardActionId =
  | "view"
  | "copy_prompt"
  | "create_variant"
  | "check_creative_score"
  | "generate_hooks_captions"
  | "export_asset"
  | "use_as_reference"
  | "edit_image"
  | "match_style"
  | "animate_image"
  | "enhance_asset"
  | "favorite";

export type GalleryCardActionBehavior = "run" | "detail_panel";

export type GalleryCardAction = {
  id: GalleryCardActionId;
  label: { en: string; de: string };
  behavior: GalleryCardActionBehavior;
  creatorToolId?: CreatorToolId;
  creditCost?: number;
  statusBadge?: { en: string; de: string };
};

export type GalleryFilter = "all" | "images" | "videos" | "packs" | "favorites";

type GalleryActionSpec = {
  id: GalleryCardActionId;
  label: { en: string; de: string };
  creatorToolId?: CreatorToolId;
  /** Omit for actions that apply to both image and video */
  imageOnly?: boolean;
  /** Always runnable locally — no tool resolution */
  localOnly?: boolean;
};

const GALLERY_ACTION_SPECS: readonly GalleryActionSpec[] = [
  { id: "view", label: { en: "View", de: "Ansehen" }, localOnly: true },
  { id: "copy_prompt", label: { en: "Copy prompt", de: "Prompt kopieren" }, localOnly: true },
  {
    id: "create_variant",
    label: { en: "Create variant", de: "Variante erstellen" },
    creatorToolId: "create_style_variant",
    imageOnly: true,
  },
  {
    id: "check_creative_score",
    label: { en: "Creative Score", de: "Creative Score" },
    creatorToolId: "check_creative_score",
  },
  {
    id: "generate_hooks_captions",
    label: { en: "Hooks & captions", de: "Hooks & Captions" },
    creatorToolId: "hooks_captions",
  },
  { id: "export_asset", label: { en: "Export", de: "Export" }, localOnly: true },
  {
    id: "use_as_reference",
    label: { en: "Use as reference", de: "Als Referenz" },
    creatorToolId: "use_reference_image",
    imageOnly: true,
  },
  {
    id: "edit_image",
    label: { en: "Edit image", de: "Bild bearbeiten" },
    creatorToolId: "edit_image",
    imageOnly: true,
  },
  {
    id: "match_style",
    label: { en: "Match style", de: "Stil anpassen" },
    creatorToolId: "match_style",
    imageOnly: true,
  },
  {
    id: "animate_image",
    label: { en: "Animate image", de: "Bild animieren" },
    creatorToolId: "animate_image",
    imageOnly: true,
  },
  {
    id: "enhance_asset",
    label: { en: "Enhance", de: "Verbessern" },
    creatorToolId: "enhance_asset",
    imageOnly: true,
  },
  { id: "favorite", label: { en: "Favorite", de: "Favorit" }, localOnly: true },
] as const;

export function isPackGalleryAsset(workflow?: string | null): boolean {
  return Boolean(workflow?.startsWith("social_asset_pack:"));
}

function resolveToolBackedAction(
  spec: GalleryActionSpec,
  ctx: ResolveCreatorToolContext,
  language: "en" | "de"
): GalleryCardAction | null {
  if (!spec.creatorToolId) return null;

  const tool = getCreatorToolById(spec.creatorToolId);
  if (!tool) return null;

  const resolved = resolveCreatorTool(spec.creatorToolId, ctx);
  if (!resolved || !resolved.canShowToUser) return null;

  if (resolved.canRun) {
    return {
      id: spec.id,
      label: spec.label,
      behavior: "run",
      creatorToolId: spec.creatorToolId,
      creditCost:
        resolved.requiresCredits && resolved.requiredCredits > 0
          ? resolved.requiredCredits
          : undefined,
    };
  }

  if (
    isToolDetailPanelStatus(resolved.status) ||
    resolved.canPreview ||
    !resolved.canRun
  ) {
    return {
      id: spec.id,
      label: spec.label,
      behavior: "detail_panel",
      creatorToolId: spec.creatorToolId,
      statusBadge: {
        en: getToolStatusLabel(resolved.status, "en"),
        de: getToolStatusLabel(resolved.status, "de"),
      },
    };
  }

  return null;
}

export function buildGalleryCardActions(
  outputType: "image" | "video",
  ctx: ResolveCreatorToolContext = {}
): GalleryCardAction[] {
  const language = ctx.language === "de" ? "de" : "en";
  const isImage = outputType === "image";
  const actions: GalleryCardAction[] = [];

  for (const spec of GALLERY_ACTION_SPECS) {
    if (spec.imageOnly && !isImage) continue;

    if (spec.localOnly) {
      actions.push({
        id: spec.id,
        label: spec.label,
        behavior: "run",
      });
      continue;
    }

    const resolved = resolveToolBackedAction(spec, ctx, language);
    if (resolved) actions.push(resolved);
  }

  return actions;
}

export function getGalleryActionCreatorToolId(
  actionId: GalleryCardActionId
): CreatorToolId | undefined {
  return GALLERY_ACTION_SPECS.find((spec) => spec.id === actionId)?.creatorToolId;
}

export function filterGalleryAssets<
  T extends {
    image_url?: string | null;
    video_url?: string | null;
    workflow?: string | null;
    is_favorite?: boolean | null;
    prompt?: string | null;
  },
>(assets: T[], filter: GalleryFilter, search: string): T[] {
  let rows = assets;

  if (filter === "images") {
    rows = rows.filter((row) => Boolean(row.image_url) && !row.video_url);
  } else if (filter === "videos") {
    rows = rows.filter((row) => Boolean(row.video_url));
  } else if (filter === "packs") {
    rows = rows.filter((row) => isPackGalleryAsset(row.workflow));
  } else if (filter === "favorites") {
    rows = rows.filter((row) => Boolean(row.is_favorite));
  }

  const q = search.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter((row) => (row.prompt ?? "").toLowerCase().includes(q));
}

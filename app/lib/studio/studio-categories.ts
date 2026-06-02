/**
 * Dashboard studio — category → tool mapping (user-facing, no provider ids).
 */

import type { CreatorToolId, CreatorToolboxGroupId } from "@/app/lib/tools/creator-tools";
import {
  CREATOR_TOOL_DETAILS,
  getCreatorToolDescription,
  getCreatorToolLabel,
  resolveCreatorToolCreditCost,
  resolveToolDetailPanelPrimaryCta,
} from "@/app/lib/tools/creator-tools";
import {
  resolveCreatorTool,
  type ResolveCreatorToolContext,
  type ResolvedCreatorTool,
} from "@/app/lib/tools/resolve-tool";
import {
  normalizePublicToolStatus,
  resolveToolStatusMetadata,
  type PublicToolStatus,
} from "@/app/lib/tools/tool-status";

export type StudioCategoryId = CreatorToolboxGroupId;

export type StudioToolPrimaryAction =
  | "run"
  | "preview_workflow"
  | "request_access"
  | "notify_me"
  | "view_upgrade";

/** User-facing tool row for ContextActionBar and category tool lists. */
export type StudioCategoryToolView = {
  id: CreatorToolId;
  label: string;
  description: string;
  category: StudioCategoryId;
  status: PublicToolStatus;
  estimatedCredits?: number;
  primaryAction: StudioToolPrimaryAction | null;
  requiresAsset: boolean;
  canRun: boolean;
  canPreview: boolean;
  resolved: ResolvedCreatorTool;
};

export type StudioCategoryDefinition = {
  id: StudioCategoryId;
  labelEn: string;
  labelDe: string;
  descriptionEn: string;
  descriptionDe: string;
  toolIds: readonly CreatorToolId[];
};

/** Canonical category → tool order for the Agent Workspace. */
export const STUDIO_CATEGORIES: readonly StudioCategoryDefinition[] = [
  {
    id: "create",
    labelEn: "Create",
    labelDe: "Erstellen",
    descriptionEn:
      "Start new assets — social packs, stills, and motion from one idea.",
    descriptionDe:
      "Neue Assets starten — Social Packs, Bilder und Motion aus einer Idee.",
    toolIds: ["social_asset_pack", "create_image", "create_video"],
  },
  {
    id: "edit",
    labelEn: "Edit",
    labelDe: "Bearbeiten",
    descriptionEn:
      "Refine uploads with reference, style, enhancement, cleanup, and upscale.",
    descriptionDe:
      "Uploads verfeinern — Referenz, Stil, Verbesserung, Cleanup und Upscale.",
    toolIds: [
      "use_reference_image",
      "edit_image",
      "match_style",
      "enhance_asset",
      "background_remove",
      "upscale_image",
    ],
  },
  {
    id: "animate",
    labelEn: "Animate",
    labelDe: "Animieren",
    descriptionEn:
      "Add motion, movement transfer, lipsync, and avatar video to existing visuals.",
    descriptionDe:
      "Motion, Transfer, LipSync und Avatar-Video für bestehende Visuals.",
    toolIds: [
      "animate_image",
      "motion_transfer",
      "lipsync_creator",
      "ai_avatar",
    ],
  },
  {
    id: "train",
    labelEn: "Train",
    labelDe: "Trainieren",
    descriptionEn:
      "Build reusable creator styles, brand kits, product models, and identity.",
    descriptionDe:
      "Creator-Stile, Brand Kits, Produktmodelle und Identity trainieren.",
    toolIds: [
      "train_creator_style",
      "train_brand_kit",
      "train_product_model",
      "train_creator_identity",
    ],
  },
  {
    id: "optimize",
    labelEn: "Optimize",
    labelDe: "Optimieren",
    descriptionEn: "Score performance, generate hooks & captions, and export packs.",
    descriptionDe:
      "Performance bewerten, Hooks & Captions erzeugen und Packs exportieren.",
    toolIds: ["check_creative_score", "hooks_captions", "export_pack"],
  },
  {
    id: "advanced",
    labelEn: "Advanced",
    labelDe: "Erweitert",
    descriptionEn: "Experimental 3D objects and audio sound design workflows.",
    descriptionDe: "Experimentelle 3D-Objekte und Audio-Sound-Design.",
    toolIds: ["object_3d", "audio_sound_design"],
  },
] as const;

export const STUDIO_CATEGORY_ORDER: readonly StudioCategoryId[] =
  STUDIO_CATEGORIES.map((category) => category.id);

export const STUDIO_CATEGORY_COPY: Record<
  StudioCategoryId,
  Pick<
    StudioCategoryDefinition,
    "labelEn" | "labelDe" | "descriptionEn" | "descriptionDe"
  >
> = Object.fromEntries(
  STUDIO_CATEGORIES.map((category) => [
    category.id,
    {
      labelEn: category.labelEn,
      labelDe: category.labelDe,
      descriptionEn: category.descriptionEn,
      descriptionDe: category.descriptionDe,
    },
  ])
) as Record<
  StudioCategoryId,
  Pick<
    StudioCategoryDefinition,
    "labelEn" | "labelDe" | "descriptionEn" | "descriptionDe"
  >
>;

const STUDIO_CATEGORY_BY_ID = new Map(
  STUDIO_CATEGORIES.map((category) => [category.id, category])
);

/** Tools that expect an uploaded or gallery asset before generation. */
const STUDIO_TOOL_REQUIRES_ASSET = new Set<CreatorToolId>([
  "use_reference_image",
  "edit_image",
  "match_style",
  "enhance_asset",
  "background_remove",
  "upscale_image",
  "animate_image",
  "motion_transfer",
  "lipsync_creator",
  "ai_avatar",
  "train_creator_style",
  "train_brand_kit",
  "train_product_model",
  "train_creator_identity",
  "check_creative_score",
  "export_pack",
  "object_3d",
]);

export function isStudioCategoryId(value: string): value is StudioCategoryId {
  return (STUDIO_CATEGORY_ORDER as readonly string[]).includes(value);
}

export function getStudioCategory(
  categoryId: StudioCategoryId
): StudioCategoryDefinition | null {
  return STUDIO_CATEGORY_BY_ID.get(categoryId) ?? null;
}

export function getStudioCategoryToolIds(
  categoryId: StudioCategoryId
): readonly CreatorToolId[] {
  return getStudioCategory(categoryId)?.toolIds ?? [];
}

export function studioToolRequiresAsset(toolId: CreatorToolId): boolean {
  return STUDIO_TOOL_REQUIRES_ASSET.has(toolId);
}

export function categoryUsesPromptEngine(categoryId: StudioCategoryId): boolean {
  return categoryId === "create" || categoryId === "optimize";
}

function resolveEstimatedCredits(
  resolved: ResolvedCreatorTool,
  language: "en" | "de"
): number | undefined {
  const detail = CREATOR_TOOL_DETAILS[resolved.tool.id];
  if (detail?.estimatedCredits != null) {
    return detail.estimatedCredits;
  }

  if (resolved.canRun && resolved.requiresCredits) {
    const cost =
      resolved.requiredCredits > 0
        ? resolved.requiredCredits
        : resolveCreatorToolCreditCost(resolved.tool);
    return cost > 0 ? cost : undefined;
  }

  if (resolved.status === "live" && resolved.requiresCredits) {
    const cost = resolveCreatorToolCreditCost(resolved.tool);
    return cost > 0 ? cost : 0;
  }

  void language;
  return undefined;
}

export function resolveStudioToolPrimaryAction(
  resolved: ResolvedCreatorTool
): StudioToolPrimaryAction | null {
  if (resolved.canRun) {
    return "run";
  }

  const publicStatus = normalizePublicToolStatus(resolved.status);

  if (publicStatus === "pro_locked") {
    return "view_upgrade";
  }

  const panelCta = resolveToolDetailPanelPrimaryCta({
    publicStatus,
    audience: resolved.tool.audience,
  });

  if (panelCta === "preview_workflow") return "preview_workflow";
  if (panelCta === "request_access") return "request_access";
  if (panelCta === "notify_me") return "notify_me";

  return null;
}

export function buildStudioCategoryToolView(
  resolved: ResolvedCreatorTool,
  categoryId: StudioCategoryId,
  language: "en" | "de" = "en"
): StudioCategoryToolView {
  const meta = resolveToolStatusMetadata({
    status: resolved.status,
    canRun: resolved.canRun,
    canPreview: resolved.canPreview,
    canShowToUser: resolved.canShowToUser,
    requiresCredits: resolved.requiresCredits,
  });

  const estimated = resolveEstimatedCredits(resolved, language);

  return {
    id: resolved.tool.id,
    label: getCreatorToolLabel(resolved.tool, language),
    description: getCreatorToolDescription(resolved.tool, language),
    category: categoryId,
    status: meta.publicStatus,
    estimatedCredits: estimated,
    primaryAction: resolveStudioToolPrimaryAction(resolved),
    requiresAsset: studioToolRequiresAsset(resolved.tool.id),
    canRun: resolved.canRun,
    canPreview: resolved.canPreview,
    resolved,
  };
}

/** Resolved, user-visible tools for a category — gated by validation and launch flags. */
export function resolveStudioCategoryTools(
  categoryId: StudioCategoryId,
  ctx: ResolveCreatorToolContext = {}
): StudioCategoryToolView[] {
  const language = ctx.language === "de" ? "de" : "en";
  const category = getStudioCategory(categoryId);
  if (!category) return [];

  return category.toolIds
    .map((toolId) => resolveCreatorTool(toolId, ctx))
    .filter(
      (resolved): resolved is ResolvedCreatorTool =>
        resolved != null &&
        resolved.canShowToUser &&
        resolved.tool.toolboxGroup === categoryId
    )
    .map((resolved) => buildStudioCategoryToolView(resolved, categoryId, language));
}

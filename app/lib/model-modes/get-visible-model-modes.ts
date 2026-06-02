/**
 * Client-safe model mode queries for UI pickers.
 */

import { getEngineById } from "@/app/lib/engines/catalog";
import {
  DEFAULT_MODEL_MODE_BY_ACTION,
  getAllModelModes,
  getModelModeById,
} from "./model-modes";
import {
  LAUNCH_ACTIVE_MODEL_MODE_IDS,
  LAUNCH_CONFIG,
} from "@/app/lib/config/launch";
import {
  CREATE_IMAGE_MODE_IDS,
  CREATE_MOTION_VIDEO_MODE_IDS,
} from "@/app/lib/tools/creator-tools";
import type { AccessTier, ModelMode, ModelModeGroup } from "./types";
import { normalizeUserPlan } from "@/app/lib/billing/access-tiers";
import { resolveCreditCostFromMode } from "@/app/lib/billing/credit-costs";

export type ClientModelModeView = ModelMode & {
  creditCost: number;
  showUpgradeHint: boolean;
};

function enrichMode(
  mode: ModelMode,
  userPlan?: AccessTier | string | null
): ClientModelModeView {
  const creditCost = resolveCreditCostFromMode(mode);
  const userTier = normalizeUserPlan(userPlan);
  const showUpgradeHint =
    userTier === "free" && mode.accessTier !== "free" && mode.isPremium;

  return { ...mode, creditCost, showUpgradeHint };
}

/** Map launch engine id → API model id (krea studio id or fal engine id). */
export function getApiModelIdForEngine(engineId: string): string {
  const engine = getEngineById(engineId.trim());
  if (!engine) return engineId.trim();
  return engine.kreaStudioId ?? engine.falRegistryId ?? engine.id;
}

export function getApiModelIdForModelMode(modelModeId: string): string | null {
  const mode = getModelModeById(modelModeId);
  if (!mode?.engineId) return null;
  return getApiModelIdForEngine(mode.engineId);
}

export function getDefaultModelModeIdForAction(actionId: string): string {
  return DEFAULT_MODEL_MODE_BY_ACTION[actionId] ?? "";
}

export function getVisibleModelModesForAction(
  actionId: string,
  userPlan?: AccessTier | string | null
): ClientModelModeView[] {
  return getAllModelModes()
    .filter((mode) => mode.actionId === actionId && mode.canShowToUser)
    .map((mode) => enrichMode(mode, userPlan));
}

export function getRunnableModelModesForAction(
  actionId: string,
  userPlan?: AccessTier | string | null
): ClientModelModeView[] {
  const launchModeSet = LAUNCH_CONFIG.launchMode
    ? new Set<string>(LAUNCH_ACTIVE_MODEL_MODE_IDS)
    : null;

  return getVisibleModelModesForAction(actionId, userPlan).filter(
    (mode) =>
      mode.status === "active" &&
      mode.canRunGeneration &&
      mode.actionId === actionId &&
      (launchModeSet == null || launchModeSet.has(mode.id))
  );
}

/** Primary selector — active runnable modes only (no locked). */
export function getPrimaryModelModesForAction(
  actionId: string,
  userPlan?: AccessTier | string | null
): ClientModelModeView[] {
  const modes = getRunnableModelModesForAction(actionId, userPlan);

  if (actionId === "create_image") {
    return CREATE_IMAGE_MODE_IDS.map((id) =>
      modes.find((mode) => mode.id === id)
    ).filter((mode): mode is ClientModelModeView => mode != null);
  }

  if (actionId === "create_video") {
    return CREATE_MOTION_VIDEO_MODE_IDS.map((id) =>
      modes.find((mode) => mode.id === id)
    ).filter((mode): mode is ClientModelModeView => mode != null);
  }

  return modes;
}

export function getAllVisibleModelModesGrouped(
  userPlan?: AccessTier | string | null
): Record<ModelModeGroup, ClientModelModeView[]> {
  const groups: ModelModeGroup[] = [
    "image",
    "video",
    "animate",
    "lipsync",
    "avatar",
    "enhance",
    "edit",
    "motion",
    "audio",
    "three_d",
    "training",
  ];

  const result = {} as Record<ModelModeGroup, ClientModelModeView[]>;
  for (const group of groups) {
    result[group] = getAllModelModes()
      .filter((mode) => mode.group === group && mode.canShowToUser)
      .map((mode) => enrichMode(mode, userPlan));
  }
  return result;
}

export const MODEL_MODE_GROUP_LABELS: Record<
  ModelModeGroup,
  { en: string; de: string }
> = {
  image: { en: "Image", de: "Bild" },
  video: { en: "Video", de: "Video" },
  animate: { en: "Animate", de: "Animieren" },
  lipsync: { en: "LipSync", de: "LipSync" },
  avatar: { en: "Avatar", de: "Avatar" },
  enhance: { en: "Enhance", de: "Enhancer" },
  edit: { en: "Edit", de: "Bearbeiten" },
  motion: { en: "Motion", de: "Motion" },
  audio: { en: "Audio", de: "Audio" },
  three_d: { en: "3D", de: "3D" },
  training: { en: "Training", de: "Training" },
};

export type ModelsQualityDrawerSectionId =
  | "image"
  | "video"
  | "reference_edit"
  | "training"
  | "enhance"
  | "avatar_lipsync"
  | "three_d";

export type ModelsQualityDrawerSection = {
  id: ModelsQualityDrawerSectionId;
  label: { en: string; de: string };
  modes: ClientModelModeView[];
};

/** User-facing drawer sections (aggregates internal mode groups). */
export const MODELS_QUALITY_DRAWER_SECTIONS: {
  id: ModelsQualityDrawerSectionId;
  label: { en: string; de: string };
  groups: ModelModeGroup[];
}[] = [
  { id: "image", label: { en: "Image", de: "Bild" }, groups: ["image"] },
  {
    id: "video",
    label: { en: "Video", de: "Video" },
    groups: ["video", "animate", "motion", "audio"],
  },
  {
    id: "reference_edit",
    label: { en: "Reference & Edit", de: "Referenz & Bearbeiten" },
    groups: ["edit"],
  },
  { id: "training", label: { en: "Training", de: "Training" }, groups: ["training"] },
  { id: "enhance", label: { en: "Enhance", de: "Enhancer" }, groups: ["enhance"] },
  {
    id: "avatar_lipsync",
    label: { en: "Avatar & LipSync", de: "Avatar & LipSync" },
    groups: ["avatar", "lipsync"],
  },
  { id: "three_d", label: { en: "3D", de: "3D" }, groups: ["three_d"] },
];

const PROVIDER_TERM_PATTERN =
  /\b(krea|fal\.?ai|kling|flux|nano|lora|topaz|bria|seedance|sync-lipsync)\b/gi;

/** Strip provider/model vendor terms from user-visible copy. */
export function sanitizeUserFacingModeText(text: string): string {
  return text
    .replace(PROVIDER_TERM_PATTERN, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([.,;])/g, "$1")
    .trim();
}

export function isRunnableModelMode(
  mode: Pick<ModelMode, "status" | "canRunGeneration">
): boolean {
  return mode.status === "active" && mode.canRunGeneration;
}

function sortModesForDrawer(modes: ClientModelModeView[]): ClientModelModeView[] {
  return [...modes].sort((a, b) => {
    const aRun = isRunnableModelMode(a) ? 0 : 1;
    const bRun = isRunnableModelMode(b) ? 0 : 1;
    if (aRun !== bRun) return aRun - bRun;
    return a.label.localeCompare(b.label);
  });
}

function sanitizeModeForDrawer(mode: ClientModelModeView): ClientModelModeView {
  return {
    ...mode,
    label: sanitizeUserFacingModeText(mode.label),
    description: sanitizeUserFacingModeText(mode.description),
    comingSoonReason: mode.comingSoonReason
      ? sanitizeUserFacingModeText(mode.comingSoonReason)
      : undefined,
  };
}

/** Modes grouped for the Models & Quality drawer (active first per section). */
export function getModelsQualityDrawerSections(
  userPlan?: AccessTier | string | null
): ModelsQualityDrawerSection[] {
  const grouped = getAllVisibleModelModesGrouped(userPlan);

  return MODELS_QUALITY_DRAWER_SECTIONS.map((section) => {
    const modes: ClientModelModeView[] = [];
    for (const group of section.groups) {
      const list = grouped[group];
      if (list?.length) modes.push(...list);
    }
    return {
      id: section.id,
      label: section.label,
      modes: sortModesForDrawer(modes.map(sanitizeModeForDrawer)),
    };
  }).filter((section) => section.modes.length > 0);
}

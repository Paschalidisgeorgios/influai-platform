/**
 * Admin-only model inventory view — server-side.
 * Never expose providerModelId to normal client routes.
 */

import {
  getAllModelInventoryEntries,
  getInventoryByCapability,
  type ModelInventoryEntry,
} from "@/app/lib/engines/model-inventory";
import type { UserFacingCapability } from "@/app/lib/engines/model-groups";

export type AdminModelInventoryRow = {
  inventoryId: string;
  capability: UserFacingCapability;
  provider: string;
  /** Masked for admin table — full id available server-side only */
  providerModelRef: string;
  status: string;
  validationStatus: string;
  mappedEngineId: string | null;
  mappedModelModeId: string | null;
  creditsEstimate: number | null;
  canShowToUser: boolean;
  canRunGeneration: boolean;
  outputType: string;
  notes: string | null;
};

function maskProviderModelId(
  providerModelId: string | null,
  inventoryId: string
): string {
  if (!providerModelId) return "— (placeholder)";
  if (providerModelId.length <= 24) return providerModelId;
  return `${providerModelId.slice(0, 20)}…`;
}

function toAdminRow(entry: ModelInventoryEntry): AdminModelInventoryRow {
  return {
    inventoryId: entry.inventoryId,
    capability: entry.userFacingCapability,
    provider: entry.provider ?? "—",
    providerModelRef: maskProviderModelId(
      entry.providerModelId,
      entry.inventoryId
    ),
    status: entry.status,
    validationStatus: entry.validationStatus,
    mappedEngineId: entry.mappedEngineId ?? null,
    mappedModelModeId: entry.mappedModelModeId ?? null,
    creditsEstimate: entry.creditsEstimate ?? null,
    canShowToUser: entry.canShowToUser,
    canRunGeneration: entry.canRunGeneration,
    outputType: entry.outputType,
    notes: entry.notes ?? entry.validationReason ?? null,
  };
}

export function getAdminModelInventoryRows(): AdminModelInventoryRow[] {
  return getAllModelInventoryEntries().map(toAdminRow);
}

export function getAdminModelInventorySummary(): {
  total: number;
  active: number;
  runnable: number;
  placeholders: number;
  byCapability: Record<string, number>;
} {
  const entries = getAllModelInventoryEntries();
  const byCapability: Record<string, number> = {};

  for (const cap of [
    "image_generation",
    "video_generation",
    "image_to_video",
    "realtime_image",
    "image_edit",
    "enhance",
    "background_remove",
    "lipsync",
    "avatar",
    "motion_transfer",
    "training",
    "three_d",
    "audio",
    "analysis",
  ] as UserFacingCapability[]) {
    byCapability[cap] = getInventoryByCapability(cap).length;
  }

  return {
    total: entries.length,
    active: entries.filter((e) => e.status === "active").length,
    runnable: entries.filter((e) => e.canRunGeneration).length,
    placeholders: entries.filter((e) => !e.providerModelId).length,
    byCapability,
  };
}

/** Full entry for trusted admin API routes — do not return from public endpoints */
export function getAdminModelInventoryEntryDetail(
  inventoryId: string
): ModelInventoryEntry | null {
  return (
    getAllModelInventoryEntries().find((e) => e.inventoryId === inventoryId) ??
    null
  );
}

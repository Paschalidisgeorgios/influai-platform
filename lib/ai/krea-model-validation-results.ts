/**
 * Last-known Krea model validation snapshots (manual / dev endpoint updates).
 * Static only — no network at build time.
 */

export type KreaModelValidationStatus = "passed" | "failed" | "skipped";

export type KreaModelValidationRecord = {
  modelId: string;
  lastCheckedAt?: string;
  lastStatus?: KreaModelValidationStatus;
  lastErrorCode?: string;
  notes?: string;
};

/** Verified via dev validation run (2026-05-29). */
export const KREA_MODEL_VALIDATION_RESULTS: readonly KreaModelValidationRecord[] = [
  {
    modelId: "nano_realtime_render",
    lastCheckedAt: "2026-05-29",
    lastStatus: "passed",
    notes: "Studio → google/nano-banana",
  },
  {
    modelId: "flux_1_1_pro_ultra",
    lastCheckedAt: "2026-05-29",
    lastStatus: "passed",
    notes: "Studio → krea/krea-2/large",
  },
  {
    modelId: "flux_fast_draft",
    lastCheckedAt: "2026-05-29",
    lastStatus: "passed",
    notes: "Studio → krea/krea-2/medium — live test OK after aspect_ratio fix",
  },
  {
    modelId: "smart_auto_pilot",
    lastCheckedAt: "2026-05-29",
    lastStatus: "passed",
    notes: "Resolver → google/nano-banana (never sends auto/resolver path to API)",
  },
  {
    modelId: "nano-banana",
    lastCheckedAt: "2026-05-29",
    lastStatus: "passed",
    notes: "Registry id — active",
  },
  {
    modelId: "krea-2-large",
    lastCheckedAt: "2026-05-29",
    lastStatus: "passed",
    notes: "Registry id — active",
  },
  {
    modelId: "krea-2-medium",
    lastCheckedAt: "2026-05-29",
    lastStatus: "passed",
    notes: "Registry id — active (Flux Fast Draft target)",
  },
] as const;

export function getValidationRecord(
  modelId: string
): KreaModelValidationRecord | undefined {
  return KREA_MODEL_VALIDATION_RESULTS.find((r) => r.modelId === modelId.trim());
}

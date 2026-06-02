/**
 * Model inventory status helpers — aligned with engine activation policy.
 */

export type ModelInventoryStatus =
  | "active"
  | "locked"
  | "mapped_but_unvalidated"
  | "validation_blocked_insufficient_balance"
  | "unavailable_plan_limited"
  | "failed_validation"
  | "disabled";

export type ModelValidationStatus =
  | "passed"
  | "not_tested"
  | "blocked"
  | "failed";

export type ModelInventoryProviderName =
  | "krea"
  | "fal"
  | "openai"
  | "elevenlabs"
  | "internal";

/** Provider id on an inventory row; null when not yet mapped to a vendor endpoint. */
export type ModelInventoryProvider = ModelInventoryProviderName | null;

/**
 * Canonical internal inventory row shape (admin / validation only — never end-user UI).
 */
export type ModelInventoryEntryShape = {
  inventoryId: string;
  provider: ModelInventoryProvider;
  providerModelId: string | null;
  userFacingCapability: string;
  inputTypes: string[];
  outputType: "image" | "video" | "audio" | "three_d" | "model" | "analysis";
  status: ModelInventoryStatus;
  mappedEngineId?: string;
  mappedModelModeId?: string;
  creditsEstimate?: number;
  validationStatus: ModelValidationStatus;
  validationReason?: string;
  canShowToUser: boolean;
  canRunGeneration: boolean;
  notes?: string;
};

export function isInventoryActive(status: ModelInventoryStatus): boolean {
  return status === "active";
}

export function isInventoryLocked(status: ModelInventoryStatus): boolean {
  return status === "locked";
}

export function isPlaceholderInventoryEntry(
  providerModelId: string | null
): boolean {
  return providerModelId == null || providerModelId.trim() === "";
}

/** User-facing inventory rows must never run generation unless active + validated. */
export function isInventoryRunnable(entry: {
  status: ModelInventoryStatus;
  canRunGeneration: boolean;
  validationStatus: ModelValidationStatus;
  providerModelId: string | null;
}): boolean {
  if (!entry.canRunGeneration) return false;
  if (!isInventoryActive(entry.status)) return false;
  if (isPlaceholderInventoryEntry(entry.providerModelId)) return false;
  return entry.validationStatus === "passed";
}

export function isInventoryUserVisible(entry: {
  canShowToUser: boolean;
  status: ModelInventoryStatus;
}): boolean {
  return entry.canShowToUser && isInventoryActive(entry.status);
}

export function inventoryStatusFromEngineStatus(
  status: string
): ModelInventoryStatus {
  switch (status) {
    case "active":
      return "active";
    case "mapped_but_unvalidated":
      return "mapped_but_unvalidated";
    case "validation_blocked_insufficient_balance":
      return "validation_blocked_insufficient_balance";
    case "unavailable_plan_limited":
      return "unavailable_plan_limited";
    case "failed_validation":
      return "failed_validation";
    case "disabled":
    default:
      return "disabled";
  }
}

export function deriveInventoryAccessFlags(status: ModelInventoryStatus): {
  canShowToUser: boolean;
  canRunGeneration: boolean;
} {
  if (status === "active") {
    return { canShowToUser: true, canRunGeneration: true };
  }
  if (status === "locked") {
    return { canShowToUser: true, canRunGeneration: false };
  }
  return { canShowToUser: false, canRunGeneration: false };
}

/**
 * Enforces inventory policy:
 * - Placeholder providerModelId → never active / never runnable
 * - Non-active status → canRunGeneration false
 * - validationStatus !== passed → canRunGeneration false
 */
export function enforceInventoryEntryInvariants<
  T extends ModelInventoryEntryShape,
>(entry: T): T {
  const placeholder = isPlaceholderInventoryEntry(entry.providerModelId);
  const access = deriveInventoryAccessFlags(entry.status);

  let status = entry.status;
  let canShowToUser = entry.canShowToUser;
  let canRunGeneration = entry.canRunGeneration;

  if (placeholder && status === "active") {
    status = "mapped_but_unvalidated";
  }

  if (isInventoryLocked(status)) {
    canRunGeneration = false;
  } else if (!isInventoryActive(status)) {
    canRunGeneration = false;
    canShowToUser = false;
  } else {
    if (entry.validationStatus !== "passed") {
      canRunGeneration = false;
    }
    if (placeholder) {
      status = "mapped_but_unvalidated";
      canRunGeneration = false;
      canShowToUser = false;
    }
  }

  if (canRunGeneration && !isInventoryActive(status)) {
    canRunGeneration = false;
  }

  if (
    canShowToUser &&
    !isInventoryActive(status) &&
    !isInventoryLocked(status)
  ) {
    canShowToUser = false;
  }

  if (canRunGeneration && entry.validationStatus !== "passed") {
    canRunGeneration = false;
  }

  if (canRunGeneration && placeholder) {
    canRunGeneration = false;
  }

  return {
    ...entry,
    status,
    canShowToUser: canShowToUser ?? access.canShowToUser,
    canRunGeneration,
  };
}

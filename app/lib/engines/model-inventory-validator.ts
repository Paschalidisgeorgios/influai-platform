/**
 * Model inventory integrity validator — development guardrails.
 * Ensures unvalidated models cannot appear active in the internal inventory.
 */

import { isActionActive, getActionById } from "@/app/lib/actions/action-registry";
import { getAllModelModes } from "@/app/lib/model-modes/model-modes";
import { getEngineById, isEngineActive } from "./catalog";
import { LOCKED_FUTURE_TOOL_MODE_IDS } from "@/app/lib/config/future-tools";
import {
  getAllModelInventoryEntries,
  REQUIRED_ACTIVE_INVENTORY_IDS,
  type ModelInventoryEntry,
} from "./model-inventory";
import {
  isInventoryActive,
  isInventoryLocked,
  isPlaceholderInventoryEntry,
} from "./model-status";

export type ModelInventoryValidationIssue = {
  inventoryId: string;
  message: string;
};

export type ModelInventoryValidationResult = {
  ok: boolean;
  issues: ModelInventoryValidationIssue[];
};

function pushIssue(
  issues: ModelInventoryValidationIssue[],
  inventoryId: string,
  message: string
) {
  issues.push({ inventoryId, message });
}

function hasActiveModeOrAction(entry: ModelInventoryEntry): boolean {
  if (entry.mappedModelModeId) {
    const mode = getAllModelModes().find((m) => m.id === entry.mappedModelModeId);
    if (mode?.status === "active" && mode.canRunGeneration) return true;
  }

  const actionIds = ["create_image", "create_video", "check_creative_score", "improve_prompt"];
  for (const actionId of actionIds) {
    const action = getActionById(actionId);
    if (!action || !isActionActive(action)) continue;
    if (action.defaultEngine === entry.mappedEngineId) return true;
    if (action.allowedEngines?.includes(entry.mappedEngineId ?? "")) return true;
  }

  if (
    entry.inventoryId === "openai_creative_score" ||
    entry.inventoryId === "openai_prompt_assist"
  ) {
    const action = getActionById(
      entry.inventoryId === "openai_creative_score"
        ? "check_creative_score"
        : "improve_prompt"
    );
    return Boolean(action && isActionActive(action));
  }

  return false;
}

export function validateModelInventory(): ModelInventoryValidationResult {
  const issues: ModelInventoryValidationIssue[] = [];
  const entries = getAllModelInventoryEntries();

  if (!entries.length) {
    pushIssue(issues, "inventory", "MODEL_INVENTORY is empty.");
  }

  for (const modeId of LOCKED_FUTURE_TOOL_MODE_IDS) {
    const row = entries.find((e) => e.inventoryId === modeId);
    if (!row) {
      pushIssue(
        issues,
        modeId,
        "Locked future tool inventory row is missing."
      );
      continue;
    }
    if (!isInventoryLocked(row.status) || row.canRunGeneration) {
      pushIssue(
        issues,
        modeId,
        "Future tool inventory must be locked with canRunGeneration false."
      );
    }
    if (!row.canShowToUser) {
      pushIssue(
        issues,
        modeId,
        "Future tool inventory must be visible as Coming soon (canShowToUser true)."
      );
    }
    const mode = getAllModelModes().find((m) => m.id === modeId);
    if (!mode || mode.status !== "locked" || mode.canRunGeneration) {
      pushIssue(
        issues,
        modeId,
        "Future tool model mode must be locked with canRunGeneration false."
      );
    }
  }

  for (const requiredId of REQUIRED_ACTIVE_INVENTORY_IDS) {
    const row = entries.find((e) => e.inventoryId === requiredId);
    if (!row) {
      pushIssue(
        issues,
        requiredId,
        "Required active inventory entry is missing."
      );
      continue;
    }
    if (row.status !== "active" || !row.canRunGeneration) {
      pushIssue(
        issues,
        requiredId,
        "Required launch inventory entry must be active and runnable."
      );
    }
    if (row.validationStatus !== "passed") {
      pushIssue(
        issues,
        requiredId,
        "Required launch inventory entry must have validationStatus passed."
      );
    }
  }

  for (const entry of entries) {
    const active = isInventoryActive(entry.status);

    if (isPlaceholderInventoryEntry(entry.providerModelId) && active) {
      pushIssue(
        issues,
        entry.inventoryId,
        "Placeholder inventory entry (null providerModelId) cannot be active."
      );
    }

    if (isInventoryLocked(entry.status) && entry.canRunGeneration) {
      pushIssue(
        issues,
        entry.inventoryId,
        "Locked inventory entry must have canRunGeneration false."
      );
    }

    if (!active && !isInventoryLocked(entry.status) && entry.canRunGeneration) {
      pushIssue(
        issues,
        entry.inventoryId,
        "Unvalidated inventory entry must have canRunGeneration false."
      );
    }

    if (isInventoryLocked(entry.status) && entry.providerModelId) {
      pushIssue(
        issues,
        entry.inventoryId,
        "Locked inventory entry must not expose a provider model id."
      );
    }

    if (
      entry.status !== "active" &&
      entry.validationStatus === "passed" &&
      entry.canRunGeneration
    ) {
      pushIssue(
        issues,
        entry.inventoryId,
        "Non-active entry cannot be runnable even if validation passed."
      );
    }

    if (active) {
      if (!entry.mappedEngineId && entry.provider !== "openai" && entry.provider !== null) {
        pushIssue(
          issues,
          entry.inventoryId,
          "Active inventory entry must map to an engine (except internal OpenAI analysis)."
        );
      }

      if (entry.mappedEngineId) {
        const engine = getEngineById(entry.mappedEngineId);
        if (!engine) {
          pushIssue(
            issues,
            entry.inventoryId,
            `Active inventory maps to unknown engine "${entry.mappedEngineId}".`
          );
        } else if (!isEngineActive(engine)) {
          pushIssue(
            issues,
            entry.inventoryId,
            `Active inventory maps to inactive engine "${entry.mappedEngineId}".`
          );
        }
      }

      if (
        entry.mappedEngineId &&
        entry.provider !== "openai" &&
        entry.provider !== null &&
        !hasActiveModeOrAction(entry)
      ) {
        pushIssue(
          issues,
          entry.inventoryId,
          "Active inventory must map to at least one active model mode or action."
        );
      }
    }

    if (entry.mappedModelModeId) {
      const mode = getAllModelModes().find((m) => m.id === entry.mappedModelModeId);
      if (!mode) {
        pushIssue(
          issues,
          entry.inventoryId,
          `Inventory references unknown model mode "${entry.mappedModelModeId}".`
        );
      } else if (
        active &&
        mode.status !== "active"
      ) {
        pushIssue(
          issues,
          entry.inventoryId,
          `Active inventory maps to non-active model mode "${entry.mappedModelModeId}".`
        );
      } else if (
        isInventoryLocked(entry.status) &&
        mode.status !== "locked"
      ) {
        pushIssue(
          issues,
          entry.inventoryId,
          `Locked inventory must map to locked model mode "${entry.mappedModelModeId}".`
        );
      }
    }
  }

  const activeRunnable = entries.filter(
    (e) => e.status === "active" && e.canRunGeneration
  );
  const activeEngineIds = new Set(
    activeRunnable.map((e) => e.mappedEngineId).filter(Boolean)
  );

  for (const engineId of activeEngineIds) {
    const engine = getEngineById(engineId!);
    if (engine && !isEngineActive(engine)) {
      pushIssue(
        issues,
        engineId!,
        "Inventory marks engine runnable but ENGINE_REGISTRY engine is not active."
      );
    }
  }

  return { ok: issues.length === 0, issues };
}

/** Throws in development when inventory policy is violated. */
export function assertModelInventoryValidInDevelopment(): void {
  if (process.env.NODE_ENV === "production") return;
  const result = validateModelInventory();
  if (result.ok) return;
  const summary = result.issues
    .map((issue) => `[${issue.inventoryId}] ${issue.message}`)
    .join("\n");
  throw new Error(`Model inventory validation failed:\n${summary}`);
}

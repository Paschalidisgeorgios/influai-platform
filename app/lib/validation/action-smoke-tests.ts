/**
 * Action smoke tests — server-only launch validation.
 * Validates action registry, resolution, and engine bindings without charging credits.
 */

import {
  getActionById,
  getAllActions,
  isActionActive,
} from "@/app/lib/actions/action-registry";
import { resolveActionForGeneration } from "@/app/lib/actions/resolve-action";
import type { ActionDefinition } from "@/app/lib/actions/types";
import { getEngineById } from "@/app/lib/engines/catalog";
import type {
  ActionSmokeTestOptions,
  ActionSmokeTestResult,
  ActionSmokeTestSummary,
} from "./types";
import { MVP_ACTIVE_ACTION_IDS } from "./types";

function smokeTestAction(action: ActionDefinition): ActionSmokeTestResult {
  const base = {
    actionId: action.id,
    outputType: action.outputType,
  };

  if (!isActionActive(action)) {
    return {
      ...base,
      status: "skipped",
      reason: `Action is not active (${action.status}).`,
    };
  }

  try {
    const resolved = resolveActionForGeneration(action.id);

    if (action.allowedEngines?.length) {
      for (const engineId of action.allowedEngines) {
        const engine = getEngineById(engineId);
        if (!engine || engine.status !== "active") {
          return {
            ...base,
            status: "failed",
            reason: `Allowed engine "${engineId}" is missing or not active.`,
          };
        }
      }
    }

    if (resolved.selectedEngineId) {
      const engine = getEngineById(resolved.selectedEngineId);
      if (!engine || engine.status !== "active") {
        return {
          ...base,
          status: "failed",
          selectedEngineId: resolved.selectedEngineId,
          reason: "Default engine is missing or not active.",
        };
      }
    }

    return {
      ...base,
      status: "passed",
      reason: "Action resolves with active engines and expected credits.",
      selectedEngineId: resolved.selectedEngineId ?? undefined,
      estimatedCredits: resolved.credits,
    };
  } catch (error) {
    return {
      ...base,
      status: "failed",
      reason:
        error instanceof Error
          ? error.message.slice(0, 240)
          : "Action resolution failed.",
    };
  }
}

function smokeTestCreateImage(): ActionSmokeTestResult {
  const action = getActionById("create_image");
  if (!action) {
    return {
      actionId: "create_image",
      outputType: "image",
      status: "failed",
      reason: "create_image action not found in registry.",
    };
  }

  const result = smokeTestAction(action);
  if (result.status !== "passed") return result;

  const allowed = action.allowedEngines ?? [];
  const inactive = allowed.filter((id) => {
    const engine = getEngineById(id);
    return !engine || engine.status !== "active";
  });
  if (inactive.length) {
    return {
      ...result,
      status: "failed",
      reason: "create_image references inactive engines in allowedEngines.",
    };
  }

  return {
    ...result,
    reason: "create_image resolves; all allowed engines are active.",
  };
}

function smokeTestCreateVideo(): ActionSmokeTestResult {
  const action = getActionById("create_video");
  if (!action) {
    return {
      actionId: "create_video",
      outputType: "video",
      status: "failed",
      reason: "create_video action not found in registry.",
    };
  }

  const result = smokeTestAction(action);
  if (result.status !== "passed") return result;

  if (action.defaultEngine !== "fal_kling_v3_t2v") {
    return {
      ...result,
      status: "failed",
      reason: "create_video default engine must be the active MVP video engine.",
    };
  }

  return {
    ...result,
    reason: "create_video resolves to active fal_kling_v3_t2v.",
  };
}

function smokeTestZeroCostAction(actionId: string): ActionSmokeTestResult {
  const action = getActionById(actionId);
  if (!action) {
    return {
      actionId,
      outputType: "unknown",
      status: "failed",
      reason: `${actionId} action not found in registry.`,
    };
  }

  const result = smokeTestAction(action);
  if (result.status !== "passed") return result;

  if (typeof action.cost !== "number" || action.cost !== 0) {
    return {
      ...result,
      status: "failed",
      reason: `${actionId} must remain zero-cost for launch.`,
    };
  }

  if (result.estimatedCredits !== 0) {
    return {
      ...result,
      status: "failed",
      reason: `${actionId} resolved with unexpected credit cost.`,
    };
  }

  return {
    ...result,
    reason: `${actionId} resolves as zero-cost internal action.`,
  };
}

function smokeTestStyleVariant(): ActionSmokeTestResult {
  const action = getActionById("create_style_variant");
  if (!action) {
    return {
      actionId: "create_style_variant",
      outputType: "image",
      status: "failed",
      reason: "create_style_variant action not found in registry.",
    };
  }

  const result = smokeTestAction(action);
  if (result.status !== "passed") return result;

  if (action.defaultEngine !== "krea_flux_fast_draft") {
    return {
      ...result,
      status: "failed",
      reason: "Style variant must default to fast draft engine.",
    };
  }

  return {
    ...result,
    reason: "create_style_variant resolves to active krea_flux_fast_draft.",
  };
}

const ACTION_SMOKE_HANDLERS: Record<
  string,
  () => ActionSmokeTestResult
> = {
  create_image: smokeTestCreateImage,
  create_video: smokeTestCreateVideo,
  improve_prompt: () => smokeTestZeroCostAction("improve_prompt"),
  check_creative_score: () => smokeTestZeroCostAction("check_creative_score"),
  create_style_variant: smokeTestStyleVariant,
};

function skippedInactiveAction(actionId: string): ActionSmokeTestResult {
  const action = getActionById(actionId);
  return {
    actionId,
    outputType: action?.outputType ?? "unknown",
    status: "skipped",
    reason: action
      ? `Action is not active (${action.status}).`
      : "Action not found in registry.",
  };
}

export function runActionSmokeTests(
  options: ActionSmokeTestOptions = {}
): ActionSmokeTestSummary {
  const includeInactive = options.includeInactive === true;
  const activeActionIds = new Set(
    getAllActions().filter(isActionActive).map((a) => a.id)
  );

  const targetIds = includeInactive
    ? getAllActions().map((a) => a.id)
    : [...MVP_ACTIVE_ACTION_IDS];

  const results: ActionSmokeTestResult[] = [];

  for (const actionId of targetIds) {
    if (!activeActionIds.has(actionId)) {
      results.push(skippedInactiveAction(actionId));
      continue;
    }

    const handler = ACTION_SMOKE_HANDLERS[actionId];
    if (handler) {
      results.push(handler());
      continue;
    }

    const action = getActionById(actionId);
    if (action) {
      results.push(smokeTestAction(action));
    } else {
      results.push(skippedInactiveAction(actionId));
    }
  }

  const passed = results.filter((r) => r.status === "passed").length;
  const failed = results.filter((r) => r.status === "failed").length;
  const skipped = results.filter((r) => r.status === "skipped").length;

  return {
    success: true,
    ok: failed === 0,
    includeInactive,
    total: results.length,
    passed,
    failed,
    skipped,
    results,
  };
}

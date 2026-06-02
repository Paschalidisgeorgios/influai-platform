/**
 * Central safety gate — must run before credit consumption and provider calls.
 * User-facing errors never expose internal status, model, or provider names.
 */

import { getActionById } from "@/app/lib/actions/action-registry";
import { getModelModeById } from "@/app/lib/model-modes/model-modes";
import { resolveProviderGenerationContext } from "@/app/lib/providers/provider-router";
import { assertSocialAssetPackCanRender } from "@/app/lib/packs/assert-social-asset-pack-can-render";
import {
  getAllCreatorTools,
  getCreatorToolById,
  isSocialAssetPackDeploymentReady,
  normalizeCreatorToolId,
  type CreatorToolDefinition,
  type CreatorToolId,
} from "./creator-tools";
import { isCreatorToolLaunchGateOpen } from "./launch-tool-gate";
import {
  resolveCreatorTool,
  type ResolveCreatorToolContext,
  type ResolvedCreatorTool,
} from "./resolve-tool";
import { isRunnableToolStatus } from "./tool-status";

export const TOOL_RUN_BLOCKED_USER_MESSAGE = {
  en: "This workflow is not available for rendering yet.",
  de: "Dieser Workflow ist für Rendering noch nicht verfügbar.",
} as const;

export type ToolRunBlockedCode =
  | "TOOL_UNKNOWN"
  | "TOOL_DISABLED"
  | "TOOL_STATUS_BLOCKED"
  | "TOOL_NOT_RUNNABLE"
  | "ENGINE_INACTIVE"
  | "CREDITS_UNKNOWN"
  | "PROVIDER_ROUTE_MISSING";

export class ToolRunBlockedError extends Error {
  readonly name = "ToolRunBlockedError";

  constructor(
    readonly code: ToolRunBlockedCode,
    readonly userMessage: string,
    readonly status: number = 403,
    readonly internalReason?: string
  ) {
    super(userMessage);
  }
}

export class ToolRunInsufficientCreditsError extends Error {
  readonly name = "ToolRunInsufficientCreditsError";

  constructor(
    readonly requiredCredits: number,
    readonly userMessage: string,
    readonly status: number = 402
  ) {
    super(userMessage);
  }
}

export function getToolRunBlockedUserMessage(
  language: "en" | "de" = "en"
): string {
  return language === "de"
    ? TOOL_RUN_BLOCKED_USER_MESSAGE.de
    : TOOL_RUN_BLOCKED_USER_MESSAGE.en;
}

function insufficientCreditsMessage(language: "en" | "de"): string {
  return language === "de" ? "Nicht genug Credits." : "Not enough credits.";
}

function block(
  code: ToolRunBlockedCode,
  language: "en" | "de",
  internalReason: string,
  status = 403
): never {
  throw new ToolRunBlockedError(
    code,
    getToolRunBlockedUserMessage(language),
    status,
    internalReason
  );
}

function resolveCreatorToolIdFromAction(actionId: string): CreatorToolId | null {
  const trimmed = actionId.trim();
  if (!trimmed) return null;

  for (const tool of getAllCreatorTools()) {
    if (tool.actionId === trimmed) return tool.id;
  }

  const direct = normalizeCreatorToolId(trimmed);
  if (!direct) return null;

  const tool = getCreatorToolById(direct);
  if (!tool) return null;
  if (tool.actionId === trimmed || tool.id === trimmed) return direct;

  return null;
}

/** Resolve creator tool id from generation request fields. */
export function resolveCreatorToolIdFromRequest(input: {
  toolId?: string;
  actionId?: string;
  modelModeId?: string;
}): CreatorToolId | null {
  if (input.toolId?.trim()) {
    return normalizeCreatorToolId(input.toolId);
  }

  if (input.modelModeId?.trim()) {
    const modeId = input.modelModeId.trim();
    const byModeToolId = normalizeCreatorToolId(modeId);
    if (byModeToolId && getCreatorToolById(byModeToolId)) return byModeToolId;

    const mode = getModelModeById(modeId);
    if (mode?.actionId) {
      const fromModeAction = resolveCreatorToolIdFromAction(mode.actionId);
      if (fromModeAction) return fromModeAction;
    }
  }

  if (input.actionId?.trim()) {
    return resolveCreatorToolIdFromAction(input.actionId);
  }

  return null;
}

function assertProviderRouteForTool(
  tool: CreatorToolDefinition,
  engineId: string | undefined,
  language: "en" | "de"
): void {
  if (!tool.callsProvider) return;

  /** Pack orchestrates Krea + Fal internally — no single launch engine id. */
  if (tool.id === "social_asset_pack") {
    if (!isSocialAssetPackDeploymentReady()) {
      block(
        "PROVIDER_ROUTE_MISSING",
        language,
        "social_asset_pack: deployment env not ready"
      );
    }
    return;
  }

  const action = tool.actionId ? getActionById(tool.actionId) : null;
  const candidateEngineIds = [
    engineId?.trim(),
    tool.primaryEngineId,
    action?.defaultEngine,
    ...(action?.allowedEngines ?? []),
  ].filter((id): id is string => Boolean(id?.trim()));

  const uniqueIds = [...new Set(candidateEngineIds)];

  for (const id of uniqueIds) {
    try {
      resolveProviderGenerationContext(id, { language });
      return;
    } catch {
      /* try next candidate */
    }
  }

  block(
    "PROVIDER_ROUTE_MISSING",
    language,
    `no provider route for tool=${tool.id}`
  );
}

export type AssertToolCanRunInput = {
  toolId?: string;
  actionId?: string;
  modelModeId?: string;
  engineId?: string;
  userPlan?: ResolveCreatorToolContext["userPlan"];
  userCreditBalance?: number | null;
  language?: "en" | "de";
};

export type AssertToolCanRunResult = {
  toolId: CreatorToolId;
  resolved: ResolvedCreatorTool;
  requiredCredits: number;
};

/**
 * Validates that a workflow may render (credits + provider).
 * Throws ToolRunBlockedError or ToolRunInsufficientCreditsError when blocked.
 */
export function assertToolCanRun(
  input: AssertToolCanRunInput
): AssertToolCanRunResult {
  const language = input.language === "de" ? "de" : "en";

  const toolId = resolveCreatorToolIdFromRequest(input);
  if (!toolId) {
    block("TOOL_UNKNOWN", language, "tool id not resolved");
  }

  if (toolId === "social_asset_pack") {
    const { requiredCredits } = assertSocialAssetPackCanRender({
      userCreditBalance: input.userCreditBalance,
      language,
    });
    const resolved = resolveCreatorTool("social_asset_pack", {
      language,
      userPlan: input.userPlan,
    });
    if (!resolved) {
      block("TOOL_UNKNOWN", language, "social_asset_pack not found");
    }
    return {
      toolId: "social_asset_pack",
      resolved: {
        ...resolved,
        status: "live",
        canRun: true,
        providerValidated: true,
        requiresCredits: requiredCredits > 0,
        requiredCredits,
        reasonIfUnavailable: null,
      },
      requiredCredits,
    };
  }

  const resolved = resolveCreatorTool(toolId, {
    language,
    userPlan: input.userPlan,
  });
  if (!resolved) {
    block("TOOL_UNKNOWN", language, `tool not found: ${toolId}`);
  }

  if (resolved.status === "disabled" || !resolved.canShowToUser) {
    block("TOOL_DISABLED", language, `status=${resolved.status}`);
  }

  if (!isRunnableToolStatus(resolved.status)) {
    block(
      "TOOL_STATUS_BLOCKED",
      language,
      `non-runnable status=${resolved.status}`
    );
  }

  if (!resolved.canRun) {
    block("TOOL_NOT_RUNNABLE", language, `canRun=false status=${resolved.status}`);
  }

  if (!isCreatorToolLaunchGateOpen(resolved.tool)) {
    block(
      "TOOL_STATUS_BLOCKED",
      language,
      `launch gate closed for tool=${toolId}`
    );
  }

  if (
    resolved.tool.callsProvider &&
    !resolved.providerValidated &&
    !(
      resolved.tool.id === "social_asset_pack" &&
      isSocialAssetPackDeploymentReady()
    )
  ) {
    block("ENGINE_INACTIVE", language, "provider not validated");
  }

  const requiresKnownCredits =
    resolved.tool.callsProvider &&
    (resolved.requiresCredits || resolved.tool.chargesCredits === true);

  if (requiresKnownCredits && resolved.requiredCredits <= 0) {
    block("CREDITS_UNKNOWN", language, "required credits unresolved");
  }

  if (
    resolved.requiresCredits &&
    resolved.requiredCredits > 0 &&
    typeof input.userCreditBalance === "number" &&
    input.userCreditBalance < resolved.requiredCredits
  ) {
    throw new ToolRunInsufficientCreditsError(
      resolved.requiredCredits,
      insufficientCreditsMessage(language)
    );
  }

  assertProviderRouteForTool(resolved.tool, input.engineId, language);

  return {
    toolId,
    resolved,
    requiredCredits: resolved.requiredCredits,
  };
}

export function isToolRunBlockedError(
  error: unknown
): error is ToolRunBlockedError {
  return error instanceof ToolRunBlockedError;
}

export function isToolRunInsufficientCreditsError(
  error: unknown
): error is ToolRunInsufficientCreditsError {
  return error instanceof ToolRunInsufficientCreditsError;
}

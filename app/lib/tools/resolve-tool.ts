/**

 * Resolve creator tool access — safe launch state per workflow.

 */



import {

  meetsAccessTier,

  normalizeUserPlan,

} from "@/app/lib/billing/access-tiers";

import type { AccessTier } from "@/app/lib/model-modes/types";

import {

  getCreatorToolById,

  getAllCreatorTools,

  isCreatorToolProviderValidated,

  normalizeCreatorToolId,

  resolveCreatorToolCreditCost,

  type CreatorToolDefinition,

  type CreatorToolId,

} from "./creator-tools";

import {

  activationToToolStatus,

  evaluateToolActivation,

  type ToolActivationEvaluation,

} from "./tool-activation";

import {

  blockerFromStatus,

  getFriendlyToolUnavailableReason,

  normalizePublicToolStatus,

  resolveToolCapabilityFlags,

  type ResolvedCreatorToolAccess,

  type ToolStatus,

} from "./tool-status";



export type ResolveCreatorToolContext = {

  language?: "en" | "de";

  userPlan?: AccessTier | string | null;

};



export type ResolvedCreatorTool = ResolvedCreatorToolAccess & {

  tool: CreatorToolDefinition;

  status: ToolStatus;

  providerValidated: boolean;

  activation: ToolActivationEvaluation;

};



function isPlanBlocked(

  tool: CreatorToolDefinition,

  ctx: ResolveCreatorToolContext

): boolean {

  const plan = normalizeUserPlan(ctx.userPlan);

  if (tool.planGate && !meetsAccessTier(plan, tool.planGate)) {

    return true;

  }

  if (

    !tool.planGate &&

    (tool.accessTier === "pro" || tool.accessTier === "enterprise") &&

    !meetsAccessTier(plan, tool.accessTier)

  ) {

    return true;

  }

  return false;

}



function reasonForStatus(

  status: ToolStatus,

  _tool: CreatorToolDefinition,

  language: "en" | "de",

  activation: ToolActivationEvaluation

): string | null {

  return getFriendlyToolUnavailableReason({

    status,

    blocker: activation.blocker ?? blockerFromStatus(status),

    internalDetail: activation.blockerDetail,

    language,

  });

}



function buildResolvedTool(

  tool: CreatorToolDefinition,

  ctx: ResolveCreatorToolContext

): ResolvedCreatorTool {

  const language = ctx.language === "de" ? "de" : "en";

  const providerValidated = isCreatorToolProviderValidated(tool);

  const activation = evaluateToolActivation(tool);

  const planBlocked = isPlanBlocked(tool, ctx);



  const status = activationToToolStatus(tool, activation, {

    providerValidated,

    planBlocked,

  });



  const chargesCredits =

    Boolean(tool.chargesCredits) ||

    tool.statusWhenReady === "credit_gated" ||

    resolveCreatorToolCreditCost(tool) > 0;



  const flags = resolveToolCapabilityFlags(status, {

    allowsPreview: tool.allowsPreview,

    providerValidated,

    chargesCredits: chargesCredits && status === "live",

  });



  const requiresCredits =

    flags.requiresCredits && providerValidated && status === "live";

  const requiredCredits = requiresCredits ? resolveCreatorToolCreditCost(tool) : 0;



  return {

    tool,

    status,

    providerValidated,

    activation,

    canShowToUser: flags.canShowToUser,

    canRun: flags.canRun,

    canPreview:

      flags.canPreview ||

      (tool.allowsPreview === true && status !== "disabled"),

    requiresCredits,

    requiredCredits,

    accessTier: tool.accessTier,

    reasonIfUnavailable: reasonForStatus(status, tool, language, activation),

  };

}



export function resolveCreatorTool(

  toolId: string,

  ctx: ResolveCreatorToolContext = {}

): ResolvedCreatorTool | null {

  const tool = getCreatorToolById(toolId);

  if (!tool) return null;

  return buildResolvedTool(tool, ctx);

}



export function resolveCreatorToolOrThrow(

  toolId: string,

  ctx: ResolveCreatorToolContext = {}

): ResolvedCreatorTool {

  const resolved = resolveCreatorTool(toolId, ctx);

  if (!resolved) {

    const language = ctx.language === "de" ? "de" : "en";

    throw new Error(

      language === "de" ? "Unbekanntes Creator-Tool." : "Unknown creator tool."

    );

  }

  return resolved;

}



export function resolveVisibleCreatorTools(

  ctx: ResolveCreatorToolContext = {}

): ResolvedCreatorTool[] {

  return getAllCreatorTools()

    .map((tool) => buildResolvedTool(tool, ctx))

    .filter((resolved) => resolved.canShowToUser);

}



export function resolveRunnableCreatorTools(

  ctx: ResolveCreatorToolContext = {}

): ResolvedCreatorTool[] {

  return resolveVisibleCreatorTools(ctx).filter((resolved) => resolved.canRun);

}



export function isCreatorToolRunnable(

  toolId: CreatorToolId | string,

  ctx: ResolveCreatorToolContext = {}

): boolean {

  const id = normalizeCreatorToolId(toolId);

  if (!id) return false;

  const resolved = resolveCreatorTool(id, ctx);

  return resolved?.canRun === true;

}



export function mayCreatorToolCallProvider(

  toolId: CreatorToolId | string,

  ctx: ResolveCreatorToolContext = {}

): boolean {

  const resolved = resolveCreatorTool(toolId, ctx);

  if (!resolved) return false;

  return (

    resolved.canRun &&

    resolved.providerValidated &&

    resolved.tool.callsProvider

  );

}



export function mayCreatorToolConsumeCredits(

  toolId: CreatorToolId | string,

  ctx: ResolveCreatorToolContext = {}

): boolean {

  const resolved = resolveCreatorTool(toolId, ctx);

  if (!resolved) return false;

  return (

    resolved.canRun &&

    resolved.providerValidated &&

    resolved.requiresCredits &&

    resolved.requiredCredits > 0

  );

}



export function resolveCreatorToolForModelMode(

  modelMode: { id: string; actionId: string },

  ctx: ResolveCreatorToolContext = {}

): ResolvedCreatorTool | null {

  const byModeId = resolveCreatorTool(modelMode.id, ctx);

  if (byModeId?.tool.id === modelMode.id) return byModeId;

  return resolveCreatorTool(modelMode.actionId, ctx);

}



export {

  assertToolCanRun,

  getToolRunBlockedUserMessage,

  isToolRunBlockedError,

  isToolRunInsufficientCreditsError,

  resolveCreatorToolIdFromRequest,

  ToolRunBlockedError,

  ToolRunInsufficientCreditsError,

  type AssertToolCanRunInput,

  type AssertToolCanRunResult,

} from "./assert-tool-can-run";



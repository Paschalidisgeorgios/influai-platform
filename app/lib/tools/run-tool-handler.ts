/**
 * Unified creator tool handler — routes toolId to registered server handlers.
 * Never exposes provider or model identifiers in responses.
 */

import { NextRequest } from "next/server";
import { runUnifiedGeneration } from "@/app/lib/generation/run-generation";
import { handleSocialAssetPackRenderRequest } from "@/app/lib/packs/handle-social-asset-pack-render";
import { buildSocialAssetPackPreview } from "@/app/lib/packs/social-asset-pack";
import type { SocialAssetPackPreviewRequest } from "@/app/lib/packs/types";
import { isLaunchFeatureEnabled } from "@/app/lib/config/launch";
import { POST as promptAssistPost } from "@/app/api/prompt-assist/route";
import { authenticateBearerUser } from "@/app/lib/supabase-admin";
import { buildRuleBasedCreativeScore } from "@/lib/intelligence/creative-score-engine";
import {
  buildExportPackManifest,
  type ExportPackPreviewRequest,
} from "@/app/lib/export/export-pack";
import {
  buildHooksCaptionsBundle,
  type HooksCaptionsGenerateRequest,
} from "@/app/lib/copy/hooks-captions";
import {
  getCreatorToolById,
  normalizeCreatorToolId,
} from "./creator-tools";
import {
  assertToolCanRun,
  getToolRunBlockedUserMessage,
  isToolRunBlockedError,
} from "./assert-tool-can-run";
import {
  getToolHandlerDefinition,
  type ToolHandlerKind,
} from "./tool-handler-registry";
import { resolveCreatorTool } from "./resolve-tool";

function jsonError(
  error: string,
  status: number,
  code: string,
  extra?: Record<string, unknown>
): Response {
  return Response.json(
    { success: false, error, code, ...extra },
    { status }
  );
}

async function forwardUnifiedGenerate(
  req: Request,
  actionId: string,
  defaultModelModeId?: string
): Promise<Response> {
  let body: Record<string, unknown> = {};
  try {
    const parsed = await req.json();
    if (parsed && typeof parsed === "object") {
      body = parsed as Record<string, unknown>;
    }
  } catch {
    return jsonError("Invalid request body.", 400, "BODY_INVALID");
  }

  const merged = {
    ...body,
    actionId:
      typeof body.actionId === "string" && body.actionId.trim()
        ? body.actionId.trim()
        : actionId,
    modelModeId:
      typeof body.modelModeId === "string" && body.modelModeId.trim()
        ? body.modelModeId.trim()
        : defaultModelModeId,
  };

  const forwardReq = new Request(req.url, {
    method: "POST",
    headers: req.headers,
    body: JSON.stringify(merged),
  });

  return runUnifiedGeneration(forwardReq);
}

async function handlePromptAssist(req: Request): Promise<Response> {
  const { user, error: authError } = await authenticateBearerUser(req);
  if (!user) {
    return jsonError(authError ?? "Unauthorized.", 401, "UNAUTHENTICATED");
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return jsonError("Invalid request body.", 400, "BODY_INVALID");
  }

  const language = body.currentLanguage === "de" ? "de" : "en";

  try {
    assertToolCanRun({ toolId: "improve_prompt", language });
  } catch (gateError) {
    if (isToolRunBlockedError(gateError)) {
      return jsonError(gateError.userMessage, gateError.status, gateError.code);
    }
    throw gateError;
  }

  const forwardReq = new NextRequest(req.url, {
    method: "POST",
    headers: req.headers,
    body: JSON.stringify(body),
  });

  return promptAssistPost(forwardReq);
}

async function handleCreativeScore(req: Request): Promise<Response> {
  const { user, error: authError } = await authenticateBearerUser(req);
  if (!user) {
    return jsonError(authError ?? "Unauthorized.", 401, "UNAUTHENTICATED");
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return jsonError("Invalid request body.", 400, "BODY_INVALID");
  }

  const language = body.currentLanguage === "de" ? "de" : "en";

  try {
    assertToolCanRun({ toolId: "check_creative_score", language });
  } catch (gateError) {
    if (isToolRunBlockedError(gateError)) {
      return jsonError(gateError.userMessage, gateError.status, gateError.code);
    }
    throw gateError;
  }

  const assetUrl = typeof body.assetUrl === "string" ? body.assetUrl.trim() : "";
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const outputType = body.outputType === "video" ? "video" : "image";

  if (!assetUrl) {
    return jsonError("assetUrl is required.", 400, "MISSING_ASSET");
  }
  if (!prompt) {
    return jsonError("prompt is required.", 400, "MISSING_PROMPT");
  }

  const result = buildRuleBasedCreativeScore({
    assetUrl,
    prompt,
    outputType,
    actionId: typeof body.actionId === "string" ? body.actionId : undefined,
    language,
  });

  return Response.json({ success: true, ...result });
}

async function handleHooksCaptions(req: Request): Promise<Response> {
  if (!isLaunchFeatureEnabled("enableSocialAssetPack")) {
    return jsonError("Copy tool is not available.", 403, "TOOL_DISABLED");
  }

  let body: HooksCaptionsGenerateRequest;
  try {
    body = (await req.json()) as HooksCaptionsGenerateRequest;
  } catch {
    return jsonError("Invalid request body.", 400, "BODY_INVALID");
  }

  const language = body.language === "de" ? "de" : "en";

  try {
    assertToolCanRun({ toolId: "hooks_captions", language });
  } catch (gateError) {
    if (isToolRunBlockedError(gateError)) {
      return jsonError(gateError.userMessage, gateError.status, gateError.code);
    }
    throw gateError;
  }

  const prompt =
    typeof body.prompt === "string"
      ? body.prompt.trim()
      : typeof body.assetPrompt === "string"
        ? body.assetPrompt.trim()
        : "";

  if (!prompt) {
    return jsonError("Prompt is required.", 400, "MISSING_PROMPT");
  }

  const result = buildHooksCaptionsBundle({ prompt, language });
  return Response.json({ success: true, ...result });
}

async function handleExportPackPreview(req: Request): Promise<Response> {
  if (!isLaunchFeatureEnabled("enableGallery")) {
    return jsonError("Export pack is not available.", 403, "TOOL_DISABLED");
  }

  let body: ExportPackPreviewRequest;
  try {
    body = (await req.json()) as ExportPackPreviewRequest;
  } catch {
    return jsonError("Invalid request body.", 400, "BODY_INVALID");
  }

  const language = body.language === "de" ? "de" : "en";

  try {
    assertToolCanRun({ toolId: "export_pack", language });
  } catch (gateError) {
    if (isToolRunBlockedError(gateError)) {
      return jsonError(gateError.userMessage, gateError.status, gateError.code);
    }
    throw gateError;
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const assetPrompts = Array.isArray(body.assetPrompts)
    ? body.assetPrompts.filter((p): p is string => typeof p === "string")
    : [];

  if (!prompt && assetPrompts.length === 0) {
    return jsonError("Prompt or asset context is required.", 400, "MISSING_PROMPT");
  }

  const manifest = buildExportPackManifest({
    prompt,
    language,
    assetPrompts,
    selectedAssets: [],
  });

  return Response.json({ success: true, ...manifest });
}

async function handlePackPreview(req: Request): Promise<Response> {
  if (!isLaunchFeatureEnabled("enableSocialAssetPack")) {
    return jsonError("Pack is not available.", 403, "PACK_DISABLED");
  }

  let body: SocialAssetPackPreviewRequest;
  try {
    body = (await req.json()) as SocialAssetPackPreviewRequest;
  } catch {
    return jsonError("Invalid request body.", 400, "BODY_INVALID");
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const language = body.language === "de" ? "de" : "en";

  if (!prompt) {
    return jsonError("Prompt is required.", 400, "MISSING_PROMPT");
  }

  const preview = await buildSocialAssetPackPreview({ prompt, language });
  return Response.json({ success: true, ...preview });
}

async function dispatchHandler(
  kind: ToolHandlerKind,
  toolId: string,
  def: ReturnType<typeof getToolHandlerDefinition>,
  req: Request
): Promise<Response> {
  switch (kind) {
    case "unified_generate":
      if (!def.actionId) {
        return jsonError(
          getToolRunBlockedUserMessage("en"),
          503,
          "HANDLER_MISCONFIGURED"
        );
      }
      return forwardUnifiedGenerate(req, def.actionId, def.defaultModelModeId);

    case "pack_render":
      return handleSocialAssetPackRenderRequest(req);

    case "pack_preview":
      return handlePackPreview(req);

    case "prompt_assist":
      return handlePromptAssist(req);

    case "creative_score":
      return handleCreativeScore(req);

    case "hooks_captions":
      return handleHooksCaptions(req);

    case "export_pack_preview":
      return handleExportPackPreview(req);

    case "client_only":
      return jsonError(
        "This workflow runs in the gallery — no server render required.",
        400,
        "CLIENT_ONLY_TOOL"
      );

    case "blocked":
    default:
      return jsonError(
        getToolRunBlockedUserMessage("en"),
        403,
        "TOOL_NOT_RUNNABLE"
      );
  }
}

export async function runCreatorToolHandler(
  toolId: string,
  req: Request
): Promise<Response> {
  const normalized = normalizeCreatorToolId(toolId);
  if (!normalized || !getCreatorToolById(normalized)) {
    return jsonError("Unknown tool.", 404, "TOOL_UNKNOWN");
  }

  const def = getToolHandlerDefinition(normalized);

  if (def.kind === "blocked") {
    const language =
      req.headers.get("accept-language")?.toLowerCase().includes("de") ? "de" : "en";
    return jsonError(
      getToolRunBlockedUserMessage(language),
      403,
      "TOOL_NOT_RUNNABLE"
    );
  }

  const resolved = resolveCreatorTool(normalized);
  if (resolved && !resolved.canRun && def.kind !== "pack_preview") {
    const language = "en";
    return jsonError(
      getToolRunBlockedUserMessage(language),
      403,
      "TOOL_STATUS_BLOCKED"
    );
  }

  return dispatchHandler(def.kind, normalized, def, req);
}

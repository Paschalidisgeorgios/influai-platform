/**
 * Creator tool smoke tests — dry + optional live provider validation.
 * Server-only launch harness; never exposes secrets or provider payloads.
 */

import { getEngineById } from "@/app/lib/engines/catalog";
import { resolveProviderGenerationContext } from "@/app/lib/providers/provider-router";
import { isFalGenerationHandlerRegistered } from "@/app/lib/providers/fal/fal-router";
import { isKreaGenerationHandlerRegistered } from "@/app/lib/providers/krea/krea-router";
import { isLaunchFeatureEnabled } from "@/app/lib/config/launch";
import { getCreatorToolCreditCost } from "@/app/lib/billing/tool-credit-costs";
import { buildSocialAssetPackPreview } from "@/app/lib/packs/social-asset-pack";
import {
  getCreatorToolById,
  type CreatorToolId,
} from "@/app/lib/tools/creator-tools";
import {
  CREATOR_TOOL_ACTIVATION,
  evaluateToolActivation,
} from "@/app/lib/tools/tool-activation";
import {
  getToolHandlerDefinition,
  toolHasRunnableHandler,
  validateProviderHandlerWiring,
} from "@/app/lib/tools/tool-handler-registry";
import { resolveCreatorTool } from "@/app/lib/tools/resolve-tool";
import { isRunnableToolStatus } from "@/app/lib/tools/tool-status";
import {
  isFalProviderEnabled,
  isKreaProviderEnabled,
} from "@/lib/providers/flags";
import { isRealProviderSmokeTestsEnabled, isTrainingSmokeTestAllowed } from "./internal-auth";
import {
  dryProviderWiringOk,
  runProviderSmokeTest,
  type ProviderSmokeTestOutcome,
} from "./provider-smoke-tests";
import type {
  SmokeValidationMode,
  ToolSmokeTestId,
  ToolSmokeTestOptions,
  ToolSmokeTestResult,
  ToolSmokeTestStatus,
  ToolSmokeTestSummary,
} from "./types";
import { TOOL_SMOKE_TEST_IDS } from "./types";

const SMOKE_PROMPT = "InfluExAI smoke test — minimal product still life.";

/** Maps harness tool ids to internal creator tool ids. */
export const SMOKE_TEST_TOOL_ALIASES: Record<
  ToolSmokeTestId,
  CreatorToolId | null
> = {
  create_image: "create_image",
  create_motion_video: "create_video",
  social_asset_pack_preview: null,
  social_asset_pack_render: "social_asset_pack",
  reference_image: "use_reference_image",
  edit_image: "edit_image",
  match_style: "match_style",
  enhance_asset: "enhance_asset",
  background_remove: "background_remove",
  upscale: "upscale_image",
  animate_image: "animate_image",
  lipsync_creator: "lipsync_creator",
  ai_avatar: "ai_avatar",
  motion_transfer: "motion_transfer",
  train_creator_style: "train_creator_style",
  train_brand_kit: "train_brand_kit",
  train_product_model: "train_product_model",
  train_creator_identity: "train_creator_identity",
  object_3d: "object_3d",
  audio_sound_design: "audio_sound_design",
  creative_score: "check_creative_score",
  hooks_captions: "hooks_captions",
  export_pack: "export_pack",
};

function nowIso(): string {
  return new Date().toISOString();
}

function envVarPresent(key: string): boolean {
  if (key === "KREA_API_KEY") return isKreaProviderEnabled();
  if (key === "FAL_KEY") return isFalProviderEnabled();
  return Boolean(process.env[key]?.trim());
}

function checkToolEnv(toolId: CreatorToolId): { ok: boolean; detail: string } {
  const meta = CREATOR_TOOL_ACTIVATION[toolId];
  const missing = meta.requiredEnvVars.filter((key) => !envVarPresent(key));
  return {
    ok: missing.length === 0,
    detail:
      missing.length === 0
        ? "Required env vars present"
        : `Missing env: ${missing.join(", ")}`,
  };
}

function checkToolStorage(toolId: CreatorToolId): { ok: boolean; detail: string } {
  const meta = CREATOR_TOOL_ACTIVATION[toolId];
  if (!meta.usesGalleryStorage) {
    return { ok: true, detail: "No gallery storage required" };
  }
  const hasSupabase =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()) &&
    Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
  return {
    ok: hasSupabase,
    detail: hasSupabase
      ? "Supabase gallery storage configured"
      : "Supabase storage env missing",
  };
}

function checkToolCredits(toolId: CreatorToolId): { ok: boolean; detail: string } {
  const tool = getCreatorToolById(toolId);
  if (!tool) return { ok: false, detail: "Tool not found" };

  const cost = getCreatorToolCreditCost(toolId);
  if (!tool.chargesCredits && !tool.callsProvider) {
    return { ok: true, detail: "Free workflow" };
  }
  if (tool.chargesCredits && cost <= 0) {
    return { ok: false, detail: "Credit cost not configured" };
  }
  return { ok: true, detail: cost > 0 ? `${cost} credits minimum` : "No charge" };
}

function checkToolHandler(toolId: CreatorToolId): { ok: boolean; detail: string } {
  const def = getToolHandlerDefinition(toolId);
  if (def.kind === "blocked") {
    return { ok: false, detail: def.blockedReason ?? "Handler blocked" };
  }
  if (def.kind === "client_only") {
    return { ok: true, detail: "Client-only workflow" };
  }
  const ready = toolHasRunnableHandler(toolId);
  return {
    ok: ready,
    detail: ready
      ? def.apiRoute ?? "Handler registered"
      : "No runnable handler",
  };
}

function mergeStatus(
  current: ToolSmokeTestStatus,
  next: ToolSmokeTestStatus
): ToolSmokeTestStatus {
  const rank: Record<ToolSmokeTestStatus, number> = {
    failed: 4,
    blocked: 3,
    skipped: 2,
    passed: 1,
  };
  return rank[next] > rank[current] ? next : current;
}

function finalizeResult(
  partial: Omit<ToolSmokeTestResult, "canLaunch" | "testedAt" | "mode"> & {
    mode: SmokeValidationMode;
    runReal: boolean;
  }
): ToolSmokeTestResult {
  const {
    envOk,
    handlerOk,
    creditsOk,
    providerOk,
    storageOk,
    status,
  } = partial;

  const canLaunch =
    status === "passed" &&
    envOk &&
    handlerOk &&
    creditsOk &&
    storageOk &&
    providerOk;

  return {
    ...partial,
    canLaunch,
    testedAt: nowIso(),
  };
}

async function resolveProviderCheck(
  toolId: CreatorToolId,
  runReal: boolean
): Promise<{ ok: boolean; status: ToolSmokeTestStatus; reason: string }> {
  const tool = getCreatorToolById(toolId);
  if (!tool?.callsProvider) {
    return { ok: true, status: "passed", reason: "No provider calls required." };
  }

  const handlerDef = getToolHandlerDefinition(toolId);
  if (handlerDef.kind === "blocked") {
    return {
      ok: false,
      status: "blocked",
      reason: handlerDef.blockedReason ?? "Handler blocked in registry.",
    };
  }

  const wiring = validateProviderHandlerWiring(toolId);
  if (!wiring.ready && !runReal) {
    return { ok: false, status: "blocked", reason: wiring.detail };
  }

  if (toolId === "social_asset_pack") {
    return resolvePackProviderCheck(runReal);
  }

  const meta = CREATOR_TOOL_ACTIVATION[toolId];
  const engineId = meta.primaryEngineId ?? tool.primaryEngineId;
  if (!engineId) {
    return { ok: false, status: "blocked", reason: "No primary engine mapped." };
  }

  const engine = getEngineById(engineId);
  if (!engine) {
    return { ok: false, status: "blocked", reason: "Engine not in catalog." };
  }

  const registryId = engine.falRegistryId ?? engine.kreaRegistryId ?? "";
  const provider =
    engine.provider === "fal"
      ? "fal"
      : engine.provider === "krea" || engine.provider === "internal"
        ? "krea"
        : null;

  if (!provider) {
    return { ok: false, status: "blocked", reason: "Unsupported provider family." };
  }

  const wiringReady =
    provider === "fal"
      ? isFalGenerationHandlerRegistered(engineId)
      : isKreaGenerationHandlerRegistered(engineId);

  if (!runReal) {
    const dry = dryProviderWiringOk({
      provider,
      registryModelId: registryId,
      engineId,
      wiringReady: wiring.ready && wiringReady,
    });
    return {
      ok: dry.status === "passed",
      status: dry.status,
      reason: dry.reason,
    };
  }

  if (!wiringReady) {
    return {
      ok: false,
      status: "blocked",
      reason: "Provider handler not registered for live test.",
    };
  }

  try {
    resolveProviderGenerationContext(engineId);
  } catch (error) {
    return {
      ok: false,
      status: "blocked",
      reason:
        error instanceof Error
          ? error.message.slice(0, 240)
          : "Provider route resolution failed.",
    };
  }

  const live = await runProviderSmokeTest({
    provider,
    registryModelId: registryId,
    runReal: true,
    estimatedCredits: engine.credits,
  });

  return {
    ok: live.status === "passed",
    status: live.status,
    reason: live.reason,
  };
}

async function resolvePackProviderCheck(
  runReal: boolean
): Promise<{ ok: boolean; status: ToolSmokeTestStatus; reason: string }> {
  const imageEngineId = "smart_auto_pilot";
  const videoEngineId = "fal_kling_v3_t2v";

  const imageEngine = getEngineById(imageEngineId);
  const videoEngine = getEngineById(videoEngineId);

  if (!imageEngine || !videoEngine) {
    return {
      ok: false,
      status: "blocked",
      reason: "Pack image or video engine missing from catalog.",
    };
  }

  const imageRegistry = imageEngine.kreaRegistryId ?? "";
  const videoRegistry = videoEngine.falRegistryId ?? "";

  if (!runReal) {
    const imageDry = dryProviderWiringOk({
      provider: "krea",
      registryModelId: imageRegistry,
      engineId: imageEngineId,
      wiringReady: isKreaGenerationHandlerRegistered(imageEngineId),
    });
    const videoDry = dryProviderWiringOk({
      provider: "fal",
      registryModelId: videoRegistry,
      engineId: videoEngineId,
      wiringReady: isFalGenerationHandlerRegistered(videoEngineId),
    });

    const ok = imageDry.status === "passed" && videoDry.status === "passed";
    return {
      ok,
      status: ok ? "passed" : mergeStatus(imageDry.status, videoDry.status),
      reason: ok
        ? "Pack image + video provider wiring ok."
        : `Image: ${imageDry.reason}; Video: ${videoDry.reason}`,
    };
  }

  const [imageLive, videoLive] = await Promise.all([
    runProviderSmokeTest({
      provider: "krea",
      registryModelId: imageRegistry,
      runReal: true,
      estimatedCredits: imageEngine.credits,
    }),
    runProviderSmokeTest({
      provider: "fal",
      registryModelId: videoRegistry,
      runReal: true,
      estimatedCredits: videoEngine.credits,
    }),
  ]);

  return combineProviderOutcomes([imageLive, videoLive], "Pack render providers");
}

function combineProviderOutcomes(
  outcomes: ProviderSmokeTestOutcome[],
  label: string
): { ok: boolean; status: ToolSmokeTestStatus; reason: string } {
  let status: ToolSmokeTestStatus = "passed";
  const reasons: string[] = [];

  for (const outcome of outcomes) {
    status = mergeStatus(status, outcome.status);
    reasons.push(outcome.reason);
  }

  return {
    ok: status === "passed",
    status,
    reason: `${label}: ${reasons.join(" | ")}`,
  };
}

async function smokeTestPackPreview(
  mode: SmokeValidationMode,
  runReal: boolean
): Promise<ToolSmokeTestResult> {
  const launchOk = isLaunchFeatureEnabled("enableSocialAssetPack");
  let status: ToolSmokeTestStatus = launchOk ? "passed" : "blocked";
  let reason = launchOk
    ? "Free preview — local copy only, no provider calls."
    : "Social Asset Pack launch feature disabled.";

  if (launchOk) {
    try {
      const preview = await buildSocialAssetPackPreview({
        prompt: SMOKE_PROMPT,
        language: "en",
      });
      if (!preview.hooks?.length) {
        status = "failed";
        reason = "Preview builder returned empty hooks.";
      }
    } catch (error) {
      status = "failed";
      reason =
        error instanceof Error
          ? error.message.slice(0, 240)
          : "Preview builder failed.";
    }
  }

  return finalizeResult({
    toolId: "social_asset_pack_preview",
    status,
    reason,
    envOk: true,
    handlerOk: launchOk,
    creditsOk: true,
    providerOk: true,
    storageOk: true,
    mode,
    runReal,
  });
}

async function smokeTestCreatorTool(
  harnessId: ToolSmokeTestId,
  creatorToolId: CreatorToolId,
  options: { mode: SmokeValidationMode; runReal: boolean; allowTraining: boolean }
): Promise<ToolSmokeTestResult> {
  const { mode, runReal, allowTraining } = options;
  const tool = getCreatorToolById(creatorToolId);
  const activation = tool ? evaluateToolActivation(tool) : null;
  const resolved = resolveCreatorTool(creatorToolId);

  const env = checkToolEnv(creatorToolId);
  const handler = checkToolHandler(creatorToolId);
  const credits = checkToolCredits(creatorToolId);
  const storage = checkToolStorage(creatorToolId);

  let status: ToolSmokeTestStatus = "passed";
  let reason = "Dry validation passed.";

  if (!tool) {
    return finalizeResult({
      toolId: harnessId,
      creatorToolId,
      status: "failed",
      reason: "Creator tool not found in registry.",
      envOk: false,
      handlerOk: false,
      creditsOk: false,
      providerOk: false,
      storageOk: false,
      resolvedLaunchStatus: undefined,
      mode,
      runReal,
    });
  }

  if (creatorToolId.startsWith("train_") && runReal && !allowTraining) {
    return finalizeResult({
      toolId: harnessId,
      creatorToolId,
      status: "skipped",
      reason:
        "Training live tests skipped — set ALLOW_TRAINING_SMOKE_TESTS=true to enable.",
      envOk: env.ok,
      handlerOk: handler.ok,
      creditsOk: credits.ok,
      providerOk: false,
      storageOk: storage.ok,
      resolvedLaunchStatus: resolved?.status,
      mode,
      runReal,
    });
  }

  if (!env.ok) {
    status = mergeStatus(status, "blocked");
    reason = env.detail;
  }
  if (!handler.ok) {
    status = mergeStatus(status, "blocked");
    reason = handler.detail;
  }
  if (!credits.ok) {
    status = mergeStatus(status, "blocked");
    reason = credits.detail;
  }
  if (!storage.ok) {
    status = mergeStatus(status, "blocked");
    reason = storage.detail;
  }

  if (activation && !activation.checks.find((c) => c.id === "launch_gate")?.passed) {
    status = mergeStatus(status, "blocked");
    reason = "Launch gate closed.";
  }

  let providerOk = true;
  if (tool.callsProvider && handler.ok) {
    const provider = await resolveProviderCheck(creatorToolId, runReal);
    providerOk = provider.ok;
    if (provider.status !== "passed") {
      status = mergeStatus(status, provider.status);
      reason = provider.reason;
    }
  } else if (!tool.callsProvider) {
    providerOk = true;
  } else {
    providerOk = false;
  }

  if (
    resolved &&
    !isRunnableToolStatus(resolved.status) &&
    status === "passed"
  ) {
    status = "blocked";
    reason = `Resolved launch status is ${resolved.status}.`;
  }

  if (
    runReal &&
    tool.callsProvider &&
    status === "passed" &&
    !providerOk
  ) {
    status = "failed";
  }

  return finalizeResult({
    toolId: harnessId,
    creatorToolId,
    status,
    reason,
    envOk: env.ok,
    handlerOk: handler.ok,
    creditsOk: credits.ok,
    providerOk,
    storageOk: storage.ok,
    resolvedLaunchStatus: resolved?.status,
    mode,
    runReal,
  });
}

export async function runToolSmokeTest(
  harnessId: ToolSmokeTestId,
  options: ToolSmokeTestOptions = {}
): Promise<ToolSmokeTestResult> {
  const runReal = isRealProviderSmokeTestsEnabled(options.runRealProviderTests);
  const mode: SmokeValidationMode = runReal ? "live" : "dry";
  const allowTraining = isTrainingSmokeTestAllowed(options.allowTrainingTests);

  if (harnessId === "social_asset_pack_preview") {
    return smokeTestPackPreview(mode, runReal);
  }

  const creatorToolId = SMOKE_TEST_TOOL_ALIASES[harnessId];
  if (!creatorToolId) {
    return finalizeResult({
      toolId: harnessId,
      status: "failed",
      reason: "No creator tool mapping for harness id.",
      envOk: false,
      handlerOk: false,
      creditsOk: false,
      providerOk: false,
      storageOk: false,
      mode,
      runReal,
    });
  }

  return smokeTestCreatorTool(harnessId, creatorToolId, {
    mode,
    runReal,
    allowTraining,
  });
}

export async function runToolSmokeTests(
  options: ToolSmokeTestOptions = {}
): Promise<ToolSmokeTestSummary> {
  const runReal = isRealProviderSmokeTestsEnabled(options.runRealProviderTests);
  const mode: SmokeValidationMode = runReal ? "live" : "dry";

  const ids =
    options.toolIds?.length ?
      (options.toolIds.filter((id) =>
        (TOOL_SMOKE_TEST_IDS as readonly string[]).includes(id)
      ) as ToolSmokeTestId[])
    : ([...TOOL_SMOKE_TEST_IDS] as ToolSmokeTestId[]);

  const results: ToolSmokeTestResult[] = [];
  for (const toolId of ids) {
    results.push(await runToolSmokeTest(toolId, options));
  }

  const passed = results.filter((r) => r.status === "passed").length;
  const failed = results.filter((r) => r.status === "failed").length;
  const blocked = results.filter((r) => r.status === "blocked").length;
  const skipped = results.filter((r) => r.status === "skipped").length;
  const launchReady = results.filter((r) => r.canLaunch).length;

  const mvpLaunchIds: ToolSmokeTestId[] = [
    "create_image",
    "create_motion_video",
    "social_asset_pack_preview",
    "social_asset_pack_render",
    "creative_score",
    "hooks_captions",
    "export_pack",
  ];

  const mvpResults = results.filter((r) =>
    mvpLaunchIds.includes(r.toolId as ToolSmokeTestId)
  );
  const mvpLaunchReady = mvpResults.every((r) => r.canLaunch);

  return {
    success: true,
    ok: failed === 0 && mvpLaunchReady,
    mode,
    runRealProviderTests: runReal,
    total: results.length,
    passed,
    failed,
    blocked,
    skipped,
    launchReady,
    results,
  };
}

export { TOOL_SMOKE_TEST_IDS };

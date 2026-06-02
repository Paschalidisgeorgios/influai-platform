/**
 * Engine smoke tests — server-only launch validation.
 * Never exposes API keys or raw provider model IDs in responses.
 */

import {
  getEngineById,
  getActiveEngines,
  getAllEngines,
  KREA_REGISTRY_TO_ENGINE_ID,
} from "@/app/lib/engines/catalog";
import { resolveEngineForGeneration } from "@/app/lib/engines/resolve-engine";
import { validateEngineCatalog } from "@/app/lib/engines/validate-engine-catalog";
import { isFalGenerationHandlerRegistered } from "@/app/lib/providers/fal/fal-router";
import { runEngineModelValidation } from "@/lib/ai/engine-model-validation";
import { resolveSmartAutoPilotRegistryId } from "@/lib/ai/krea-image-studio-models";
import {
  getEngineModelById,
  isEngineModelExecutable,
} from "@/lib/ai/model-registry";
import {
  isFalProviderEnabled,
  isKreaProviderEnabled,
} from "@/lib/providers/flags";
import type {
  EngineSmokeTestOptions,
  EngineSmokeTestResult,
  EngineSmokeTestSummary,
  SmokeTestStatus,
} from "./types";
import { MVP_ACTIVE_ENGINE_IDS } from "./types";

const ACTIVE_KREA_IMAGE_ENGINE_IDS = new Set([
  "krea_flux_11_pro_ultra",
  "krea_flux_fast_draft",
  "krea_nano_realtime",
]);

function nowIso(): string {
  return new Date().toISOString();
}

function finishResult(
  partial: Omit<
    EngineSmokeTestResult,
    "startedAt" | "finishedAt" | "durationMs"
  > & { startedAt: string; startedMs: number }
): EngineSmokeTestResult {
  const finishedAt = nowIso();
  return {
    ...partial,
    finishedAt,
    durationMs: Date.now() - partial.startedMs,
  };
}

function registryModelIdForEngine(engineId: string): string | null {
  const entry = getEngineById(engineId);
  if (!entry) return null;
  if (entry.falRegistryId) return entry.falRegistryId;
  if (entry.kreaRegistryId) return entry.kreaRegistryId;
  return null;
}

async function runLiveProviderCheck(
  registryModelId: string,
  provider: "krea" | "fal"
): Promise<{ status: SmokeTestStatus; reason?: string }> {
  try {
    const summary = await runEngineModelValidation({
      provider,
      modelIds: [registryModelId],
      mode: "live_test",
      maxModels: 1,
    });
    const row = summary.results?.[0];
    if (!row) {
      return { status: "failed", reason: "Live provider test returned no result." };
    }
    if (row.status === "passed") {
      return { status: "passed", reason: "Live provider test passed." };
    }
    if (row.status === "skipped") {
      return {
        status: "skipped",
        reason: row.message ?? row.errorCode ?? "Live provider test skipped.",
      };
    }
    return {
      status: "failed",
      reason: row.message ?? row.errorCode ?? "Live provider test failed.",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Live provider test failed.";
    return { status: "failed", reason: message.slice(0, 240) };
  }
}

async function smokeTestKreaImageEngine(
  engineId: string,
  runReal: boolean
): Promise<EngineSmokeTestResult> {
  const startedMs = Date.now();
  const startedAt = nowIso();
  const entry = getEngineById(engineId);

  if (!entry) {
    return finishResult({
      engineId,
      provider: "krea",
      outputType: "image",
      status: "failed",
      reason: "Engine not found in launch registry.",
      startedAt,
      startedMs,
    });
  }

  if (entry.status !== "active") {
    return finishResult({
      engineId,
      provider: entry.provider,
      outputType: entry.outputType,
      status: "failed",
      reason: `Engine status is ${entry.status}, expected active.`,
      startedAt,
      startedMs,
    });
  }

  if (!isKreaProviderEnabled()) {
    return finishResult({
      engineId,
      provider: entry.provider,
      outputType: entry.outputType,
      status: "failed",
      reason: "Image provider is not configured on the server.",
      startedAt,
      startedMs,
    });
  }

  const registryId = entry.kreaRegistryId;
  if (!registryId) {
    return finishResult({
      engineId,
      provider: entry.provider,
      outputType: entry.outputType,
      status: "failed",
      reason: "Missing registry binding for Krea image engine.",
      startedAt,
      startedMs,
    });
  }

  const model = getEngineModelById(registryId);
  if (!model || !isEngineModelExecutable(model)) {
    return finishResult({
      engineId,
      provider: entry.provider,
      outputType: entry.outputType,
      status: "failed",
      reason: "Registry model is missing or not executable.",
      startedAt,
      startedMs,
    });
  }

  try {
    const resolved = resolveEngineForGeneration(engineId);
    if (resolved.route !== "krea_image") {
      return finishResult({
        engineId,
        provider: entry.provider,
        outputType: entry.outputType,
        status: "failed",
        reason: "Expected krea_image generation route.",
        startedAt,
        startedMs,
      });
    }
  } catch (error) {
    return finishResult({
      engineId,
      provider: entry.provider,
      outputType: entry.outputType,
      status: "failed",
      reason:
        error instanceof Error
          ? error.message.slice(0, 240)
          : "Engine resolution failed.",
      startedAt,
      startedMs,
    });
  }

  if (!runReal) {
    return finishResult({
      engineId,
      provider: entry.provider,
      outputType: entry.outputType,
      status: "passed",
      reason: "Dry validation passed (registry, active status, router binding).",
      startedAt,
      startedMs,
    });
  }

  const live = await runLiveProviderCheck(registryId, "krea");
  return finishResult({
    engineId,
    provider: entry.provider,
    outputType: entry.outputType,
    status: live.status,
    reason: live.reason,
    startedAt,
    startedMs,
  });
}

async function smokeTestSmartAutoPilot(runReal: boolean): Promise<EngineSmokeTestResult> {
  const engineId = "smart_auto_pilot";
  const startedMs = Date.now();
  const startedAt = nowIso();
  const entry = getEngineById(engineId);

  if (!entry || entry.status !== "active") {
    return finishResult({
      engineId,
      provider: "internal",
      outputType: "image",
      status: "failed",
      reason: "Smart Auto-Pilot is not active in the launch registry.",
      startedAt,
      startedMs,
    });
  }

  const registryId = resolveSmartAutoPilotRegistryId();
  const mappedEngineId =
    KREA_REGISTRY_TO_ENGINE_ID[registryId] ?? "krea_flux_fast_draft";
  const target = getEngineById(mappedEngineId);

  if (!target || target.status !== "active") {
    return finishResult({
      engineId,
      provider: entry.provider,
      outputType: entry.outputType,
      status: "failed",
      reason: "Auto-Pilot resolver did not select an active image engine.",
      startedAt,
      startedMs,
    });
  }

  if (!ACTIVE_KREA_IMAGE_ENGINE_IDS.has(target.id)) {
    return finishResult({
      engineId,
      provider: entry.provider,
      outputType: entry.outputType,
      status: "failed",
      reason: "Auto-Pilot selected a non-MVP image engine.",
      startedAt,
      startedMs,
    });
  }

  const forbiddenIds = getAllEngines()
    .filter(
      (e) =>
        e.status === "unavailable_plan_limited" ||
        e.status === "mapped_but_unvalidated" ||
        e.status === "validation_blocked_insufficient_balance" ||
        e.status === "failed_validation"
    )
    .map((e) => e.id);

  if (forbiddenIds.includes(target.id)) {
    return finishResult({
      engineId,
      provider: entry.provider,
      outputType: entry.outputType,
      status: "failed",
      reason: "Auto-Pilot must not select inactive or plan-limited engines.",
      startedAt,
      startedMs,
    });
  }

  try {
    const resolved = resolveEngineForGeneration(engineId);
    if (!ACTIVE_KREA_IMAGE_ENGINE_IDS.has(resolved.resolvedEngineId)) {
      return finishResult({
        engineId,
        provider: entry.provider,
        outputType: entry.outputType,
        status: "failed",
        reason: "Resolved engine is outside active MVP image set.",
        startedAt,
        startedMs,
      });
    }
  } catch (error) {
    return finishResult({
      engineId,
      provider: entry.provider,
      outputType: entry.outputType,
      status: "failed",
      reason:
        error instanceof Error
          ? error.message.slice(0, 240)
          : "Auto-Pilot resolution failed.",
      startedAt,
      startedMs,
    });
  }

  if (runReal) {
    const live = await smokeTestKreaImageEngine(target.id, true);
    if (live.status !== "passed") {
      return finishResult({
        engineId,
        provider: entry.provider,
        outputType: entry.outputType,
        status: live.status,
        reason: `Auto-Pilot target (${target.id}): ${live.reason ?? "live test failed"}`,
        startedAt,
        startedMs,
      });
    }
  }

  return finishResult({
    engineId,
    provider: entry.provider,
    outputType: entry.outputType,
    status: "passed",
    reason: runReal
      ? "Auto-Pilot resolver and live target test passed."
      : "Auto-Pilot resolver selects only active MVP image engines.",
    startedAt,
    startedMs,
  });
}

async function smokeTestFalKlingT2v(runReal: boolean): Promise<EngineSmokeTestResult> {
  const engineId = "fal_kling_v3_t2v";
  const startedMs = Date.now();
  const startedAt = nowIso();
  const entry = getEngineById(engineId);

  if (!entry) {
    return finishResult({
      engineId,
      provider: "fal",
      outputType: "video",
      status: "failed",
      reason: "Engine not found in launch registry.",
      startedAt,
      startedMs,
    });
  }

  if (entry.status !== "active") {
    return finishResult({
      engineId,
      provider: entry.provider,
      outputType: entry.outputType,
      status: "failed",
      reason: `Engine status is ${entry.status}, expected active.`,
      startedAt,
      startedMs,
    });
  }

  if (!isFalProviderEnabled()) {
    return finishResult({
      engineId,
      provider: entry.provider,
      outputType: entry.outputType,
      status: "failed",
      reason: "Video expansion provider is not configured on the server.",
      startedAt,
      startedMs,
    });
  }

  if (!process.env.FAL_KEY?.trim()) {
    return finishResult({
      engineId,
      provider: entry.provider,
      outputType: entry.outputType,
      status: "failed",
      reason: "Server video provider key is not configured.",
      startedAt,
      startedMs,
    });
  }

  if (!isFalGenerationHandlerRegistered(engineId)) {
    return finishResult({
      engineId,
      provider: entry.provider,
      outputType: entry.outputType,
      status: "failed",
      reason: "Provider router handler is not registered for this engine.",
      startedAt,
      startedMs,
    });
  }

  const registryId = entry.falRegistryId ?? registryModelIdForEngine(engineId);
  if (!registryId) {
    return finishResult({
      engineId,
      provider: entry.provider,
      outputType: entry.outputType,
      status: "failed",
      reason: "Missing registry binding for video engine.",
      startedAt,
      startedMs,
    });
  }

  const model = getEngineModelById(registryId);
  if (!model || !isEngineModelExecutable(model)) {
    return finishResult({
      engineId,
      provider: entry.provider,
      outputType: entry.outputType,
      status: "failed",
      reason: "Registry model is missing or not executable.",
      startedAt,
      startedMs,
    });
  }

  try {
    const resolved = resolveEngineForGeneration(engineId);
    if (resolved.route !== "engine_generate") {
      return finishResult({
        engineId,
        provider: entry.provider,
        outputType: entry.outputType,
        status: "failed",
        reason: "Expected engine_generate route for video engine.",
        startedAt,
        startedMs,
      });
    }
  } catch (error) {
    return finishResult({
      engineId,
      provider: entry.provider,
      outputType: entry.outputType,
      status: "failed",
      reason:
        error instanceof Error
          ? error.message.slice(0, 240)
          : "Engine resolution failed.",
      startedAt,
      startedMs,
    });
  }

  if (!runReal) {
    return finishResult({
      engineId,
      provider: entry.provider,
      outputType: entry.outputType,
      status: "passed",
      reason:
        "Dry validation passed (registry, active status, provider key present, handler registered).",
      startedAt,
      startedMs,
    });
  }

  const live = await runLiveProviderCheck(registryId, "fal");
  return finishResult({
    engineId,
    provider: entry.provider,
    outputType: entry.outputType,
    status: live.status,
    reason: live.reason,
    startedAt,
    startedMs,
  });
}

async function smokeTestEngineById(
  engineId: string,
  runReal: boolean
): Promise<EngineSmokeTestResult> {
  if (engineId === "smart_auto_pilot") {
    return smokeTestSmartAutoPilot(runReal);
  }
  if (engineId === "fal_kling_v3_t2v") {
    return smokeTestFalKlingT2v(runReal);
  }
  if (ACTIVE_KREA_IMAGE_ENGINE_IDS.has(engineId)) {
    return smokeTestKreaImageEngine(engineId, runReal);
  }

  const entry = getEngineById(engineId);
  const startedMs = Date.now();
  const startedAt = nowIso();
  return finishResult({
    engineId,
    provider: entry?.provider ?? "unknown",
    outputType: entry?.outputType ?? "unknown",
    status: "skipped",
    reason: "No smoke test handler defined for this engine id.",
    startedAt,
    startedMs,
  });
}

function skippedInactiveEngine(engineId: string): EngineSmokeTestResult {
  const entry = getEngineById(engineId);
  const startedMs = Date.now();
  const startedAt = nowIso();
  return finishResult({
    engineId,
    provider: entry?.provider ?? "unknown",
    outputType: entry?.outputType ?? "unknown",
    status: "skipped",
    reason: entry
      ? `Engine is not active (${entry.status}).`
      : "Engine not found in registry.",
    startedAt,
    startedMs,
  });
}

export async function runEngineSmokeTests(
  options: EngineSmokeTestOptions = {}
): Promise<EngineSmokeTestSummary> {
  const includeInactive = options.includeInactive === true;
  const runReal =
    options.runRealProviderTests ??
    process.env.RUN_REAL_PROVIDER_SMOKE_TESTS === "true";
  const mode = runReal ? "live" : "dry";

  const catalog = validateEngineCatalog();
  const activeIds = new Set(getActiveEngines().map((e) => e.id));
  const targetIds = includeInactive
    ? getAllEngines().map((e) => e.id)
    : [...MVP_ACTIVE_ENGINE_IDS];

  const results: EngineSmokeTestResult[] = [];

  for (const engineId of targetIds) {
    if (!activeIds.has(engineId)) {
      results.push(skippedInactiveEngine(engineId));
      continue;
    }
    results.push(await smokeTestEngineById(engineId, runReal));
  }

  const passed = results.filter((r) => r.status === "passed").length;
  const failed = results.filter((r) => r.status === "failed").length;
  const skipped = results.filter((r) => r.status === "skipped").length;
  const ok = failed === 0 && catalog.ok;

  return {
    success: true,
    ok,
    mode,
    includeInactive,
    total: results.length,
    passed,
    failed,
    skipped,
    results,
    catalogOk: catalog.ok,
    catalogIssueCount: catalog.issues.length,
  };
}

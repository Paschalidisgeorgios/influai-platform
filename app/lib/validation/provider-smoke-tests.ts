/**
 * Provider smoke tests — minimal live calls with cost guard.
 * Server-only; never exposes API keys or raw provider payloads.
 */

import { runEngineModelValidation } from "@/lib/ai/engine-model-validation";
import { FAL_BALANCE_EXHAUSTED_CODE } from "@/lib/fal/fal-errors";
import type { ToolSmokeTestStatus } from "./types";

export const PROVIDER_SMOKE_BLOCK_BALANCE = "blocked_provider_balance" as const;

/** Max estimated credits for a single provider smoke call. */
export const PROVIDER_SMOKE_MAX_CREDIT_ESTIMATE = 30;

export type ProviderSmokeTestOutcome = {
  status: ToolSmokeTestStatus;
  reason: string;
  blockCode?: typeof PROVIDER_SMOKE_BLOCK_BALANCE;
};

function isBalanceExhaustedMessage(message: string | undefined): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return (
    lower.includes("exhausted balance") ||
    lower.includes("user is locked") ||
    lower.includes("insufficient balance") ||
    lower.includes("insufficient_quota") ||
    (lower.includes("top up") && lower.includes("balance"))
  );
}

function mapValidationRowToOutcome(row: {
  status: string;
  message?: string;
  errorCode?: string;
}): ProviderSmokeTestOutcome {
  if (row.status === "passed") {
    return { status: "passed", reason: "Live provider test passed." };
  }

  if (row.status === "skipped") {
    return {
      status: "skipped",
      reason: row.message ?? row.errorCode ?? "Provider test skipped.",
    };
  }

  const errorCode = row.errorCode ?? "";
  const message = row.message ?? "";

  if (
    errorCode === FAL_BALANCE_EXHAUSTED_CODE ||
    isBalanceExhaustedMessage(message)
  ) {
    return {
      status: "blocked",
      reason: PROVIDER_SMOKE_BLOCK_BALANCE,
      blockCode: PROVIDER_SMOKE_BLOCK_BALANCE,
    };
  }

  return {
    status: "failed",
    reason: message.slice(0, 240) || errorCode || "Live provider test failed.",
  };
}

export function assertProviderSmokeCreditGuard(estimatedCredits: number): void {
  if (estimatedCredits > PROVIDER_SMOKE_MAX_CREDIT_ESTIMATE) {
    throw new Error(
      `Provider smoke credit guard: estimated ${estimatedCredits} exceeds max ${PROVIDER_SMOKE_MAX_CREDIT_ESTIMATE}.`
    );
  }
}

/**
 * Runs a single minimal provider validation call when runReal is true.
 * Dry mode returns passed without calling the provider.
 */
export async function runProviderSmokeTest(params: {
  provider: "krea" | "fal";
  registryModelId: string;
  runReal: boolean;
  estimatedCredits?: number;
}): Promise<ProviderSmokeTestOutcome> {
  const { provider, registryModelId, runReal } = params;

  if (!runReal) {
    return {
      status: "passed",
      reason: "Dry validation — provider wiring only (no live call).",
    };
  }

  if (typeof params.estimatedCredits === "number") {
    try {
      assertProviderSmokeCreditGuard(params.estimatedCredits);
    } catch (error) {
      return {
        status: "skipped",
        reason:
          error instanceof Error
            ? error.message.slice(0, 240)
            : "Provider smoke skipped by credit guard.",
      };
    }
  }

  try {
    const summary = await runEngineModelValidation({
      provider,
      modelIds: [registryModelId],
      mode: "live_test",
      maxModels: 1,
    });

    const row = summary.results?.[0];
    if (!row) {
      return {
        status: "failed",
        reason: "Live provider test returned no result row.",
      };
    }

    return mapValidationRowToOutcome(row);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Provider test failed.";
    if (isBalanceExhaustedMessage(message)) {
      return {
        status: "blocked",
        reason: PROVIDER_SMOKE_BLOCK_BALANCE,
        blockCode: PROVIDER_SMOKE_BLOCK_BALANCE,
      };
    }
    return { status: "failed", reason: message.slice(0, 240) };
  }
}

/**
 * Resolves dry provider wiring without a live call.
 */
export function dryProviderWiringOk(params: {
  provider: "krea" | "fal";
  registryModelId: string;
  engineId: string;
  wiringReady: boolean;
}): ProviderSmokeTestOutcome {
  if (!params.wiringReady) {
    return {
      status: "blocked",
      reason: `Provider handler not registered for ${params.engineId}.`,
    };
  }

  if (!params.registryModelId.trim()) {
    return {
      status: "blocked",
      reason: "Registry model binding missing.",
    };
  }

  return {
    status: "passed",
    reason: `Dry provider wiring ok (${params.provider}).`,
  };
}

/**
 * Engine catalog integrity validator — development guardrails.
 * Does not expose secrets; checks activation policy and handler coverage.
 */

import {
  FAL_MVP_GENERATION_HANDLERS,
  FAL_STUDIO_CATALOG,
  getActiveFalStudioEngines,
} from "./fal-catalog";
import { ENGINE_REGISTRY, getActiveEngines, getAllEngines } from "./catalog";
import { isFalGenerationHandlerRegistered } from "@/app/lib/providers/fal/fal-router";
import { isFalProviderEnabled, isKreaProviderEnabled } from "@/lib/providers/flags";
import { assertModelInventoryValidInDevelopment } from "./model-inventory-validator";

export type CatalogValidationIssue = {
  engineId: string;
  message: string;
};

export type CatalogValidationResult = {
  ok: boolean;
  issues: CatalogValidationIssue[];
};

function envConfigured(name: string): boolean {
  if (name === "FAL_KEY") {
    return Boolean(process.env.FAL_KEY?.trim()) && isFalProviderEnabled();
  }
  if (name === "KREA_API_KEY" || name === "ENABLE_KREA_PROVIDER") {
    return isKreaProviderEnabled();
  }
  return Boolean(process.env[name]?.trim());
}

function pushIssue(
  issues: CatalogValidationIssue[],
  engineId: string,
  message: string
) {
  issues.push({ engineId, message });
}

export function validateEngineCatalog(): CatalogValidationResult {
  const issues: CatalogValidationIssue[] = [];

  const activeFal = getActiveFalStudioEngines();
  if (activeFal.length !== 1 || activeFal[0]?.id !== "fal_kling_v3_t2v") {
    pushIssue(
      issues,
      "fal_catalog",
      `Expected exactly one active fal engine (fal_kling_v3_t2v), found: ${activeFal.map((e) => e.id).join(", ") || "none"}.`
    );
  }

  for (const entry of FAL_STUDIO_CATALOG) {
    if (entry.status === "active") {
      if (!entry.canRunGeneration || !entry.canShowToUser) {
        pushIssue(
          issues,
          entry.id,
          "Active engine must have canRunGeneration and canShowToUser true."
        );
      }
      if (!entry.provider || !entry.outputType || entry.credits <= 0) {
        pushIssue(
          issues,
          entry.id,
          "Active engine missing provider, outputType, or credits."
        );
      }
      if (!entry.model) {
        pushIssue(
          issues,
          entry.id,
          "Active fal engine must have a validated model endpoint."
        );
      }
      for (const envVar of entry.requiresServerEnv ?? []) {
        if (!envConfigured(envVar)) {
          pushIssue(
            issues,
            entry.id,
            `Active engine requires ${envVar} on the server (not configured).`
          );
        }
      }
      if (!isFalGenerationHandlerRegistered(entry.id)) {
        pushIssue(
          issues,
          entry.id,
          "Active fal engine missing provider router handler."
        );
      }
    } else if (entry.canRunGeneration || entry.canShowToUser) {
      pushIssue(
        issues,
        entry.id,
        `Inactive engine (${entry.status}) must not be user-facing or runnable.`
      );
    }
  }

  for (const entry of getAllEngines()) {
    if (
      entry.provider === "fal" &&
      entry.status === "active" &&
      entry.canRunGeneration
    ) {
      if (!FAL_MVP_GENERATION_HANDLERS.has(entry.id)) {
        pushIssue(
          issues,
          entry.id,
          "Unified registry marks fal engine active without MVP handler registration."
        );
      }
    }
    if (
      entry.status !== "active" &&
      (entry.canRunGeneration || entry.canShowToUser)
    ) {
      pushIssue(
        issues,
        entry.id,
        "Unified registry inactive engine has runnable/user-facing flags set."
      );
    }
  }

  const unifiedActiveFal = getActiveEngines().filter((e) => e.provider === "fal");
  if (
    unifiedActiveFal.length !== 1 ||
    unifiedActiveFal[0]?.id !== "fal_kling_v3_t2v"
  ) {
    pushIssue(
      issues,
      "engine_registry",
      "Unified ENGINE_REGISTRY must expose only fal_kling_v3_t2v as active fal engine."
    );
  }

  if (ENGINE_REGISTRY.length === 0) {
    pushIssue(issues, "engine_registry", "ENGINE_REGISTRY is empty.");
  }

  return { ok: issues.length === 0, issues };
}

/** Throws in development when catalog policy is violated. */
export function assertEngineCatalogValidInDevelopment(): void {
  if (process.env.NODE_ENV === "production") return;
  const result = validateEngineCatalog();
  if (!result.ok) {
    const summary = result.issues
      .map((issue) => `[${issue.engineId}] ${issue.message}`)
      .join("\n");
    throw new Error(`Engine catalog validation failed:\n${summary}`);
  }
  assertModelInventoryValidInDevelopment();
}

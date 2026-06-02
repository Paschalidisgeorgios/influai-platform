/**
 * Multi-provider model validation orchestrator — dev/admin only.
 */

import {
  runKreaModelValidation,
  type ValidationMode,
  type ValidationToolFilter,
} from "@/lib/ai/krea-model-validation";
import { runFalModelValidation } from "@/lib/ai/fal-model-validation";
import {
  getEngineModelById,
  getEngineModelRegistry,
} from "@/lib/ai/model-registry";
import type { AIProvider } from "@/lib/ai/model-registry";

export type { ValidationMode, ValidationToolFilter };

export async function runEngineModelValidation(params: {
  provider?: AIProvider;
  tool?: ValidationToolFilter;
  modelIds?: string[];
  mode: ValidationMode;
  maxModels?: number;
}) {
  const provider = params.provider;

  if (provider === "fal") {
    return runFalModelValidation({
      mode: params.mode,
      modelIds: params.modelIds,
      maxModels: params.maxModels,
    });
  }

  if (provider === "krea" || !provider) {
    if (params.modelIds?.length) {
      const hasFal = params.modelIds.some((id) => {
        const entry = getEngineModelById(id);
        return entry?.provider === "fal";
      });
      const hasKrea = params.modelIds.some((id) => {
        const entry = getEngineModelById(id);
        return entry?.provider === "krea";
      });

      if (hasFal && hasKrea) {
        const [kreaIds, falIds] = params.modelIds.reduce<[string[], string[]]>(
          (acc, id) => {
            const entry = getEngineModelById(id);
            if (entry?.provider === "fal") acc[1].push(id);
            else acc[0].push(id);
            return acc;
          },
          [[], []]
        );

        const [kreaSummary, falSummary] = await Promise.all([
          kreaIds.length
            ? runKreaModelValidation({
                tool: params.tool,
                modelIds: kreaIds,
                mode: params.mode,
                maxModels: params.maxModels,
              })
            : null,
          falIds.length
            ? runFalModelValidation({
                mode: params.mode,
                modelIds: falIds,
                maxModels: params.maxModels,
              })
            : null,
        ]);

        const results = [
          ...(kreaSummary?.results ?? []),
          ...(falSummary?.results ?? []),
        ];

        return {
          success: true as const,
          mode: params.mode,
          tool: params.tool,
          total: results.length,
          passed: results.filter((r) => r.status === "passed").length,
          failed: results.filter((r) => r.status === "failed").length,
          skipped: results.filter((r) => r.status === "skipped").length,
          results,
          krea: kreaSummary,
          fal: falSummary,
        };
      }

      const first = getEngineModelById(params.modelIds[0] ?? "");
      if (first?.provider === "fal") {
        return runFalModelValidation({
          mode: params.mode,
          modelIds: params.modelIds,
          maxModels: params.maxModels,
        });
      }
    }

    return runKreaModelValidation({
      tool: params.tool,
      modelIds: params.modelIds,
      mode: params.mode,
      maxModels: params.maxModels,
    });
  }

  throw new Error("PROVIDER_NOT_SUPPORTED");
}

export function countEngineRegistryStats() {
  const registry = getEngineModelRegistry();
  return {
    total: registry.length,
    krea: registry.filter((e) => e.provider === "krea").length,
    fal: registry.filter((e) => e.provider === "fal").length,
    active: registry.filter((e) => e.availability === "active").length,
    experimental: registry.filter((e) => e.availability === "experimental").length,
    failed_validation: registry.filter((e) => e.availability === "failed_validation")
      .length,
    not_configured: registry.filter((e) => e.availability === "not_configured")
      .length,
  };
}

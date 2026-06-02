"use server";

import { validateEngineCatalog } from "@/app/lib/engines/validate-engine-catalog";
import { validateModelInventory } from "@/app/lib/engines/model-inventory-validator";
import { runEngineSmokeTests } from "@/app/lib/validation/engine-smoke-tests";
import { runActionSmokeTests } from "@/app/lib/validation/action-smoke-tests";
import { requireAdminUser } from "./guards";

export type AdminDryValidationResult = {
  ok: boolean;
  catalogOk: boolean;
  catalogIssueCount: number;
  inventoryOk: boolean;
  inventoryIssueCount: number;
  engineSmoke: {
    ok: boolean;
    passed: number;
    failed: number;
    skipped: number;
  };
  actionSmoke: {
    ok: boolean;
    passed: number;
    failed: number;
    skipped: number;
  };
};

export async function runAdminDryValidation(): Promise<AdminDryValidationResult> {
  await requireAdminUser();

  const catalog = validateEngineCatalog();
  const inventory = validateModelInventory();
  const engines = await runEngineSmokeTests({
    includeInactive: false,
    runRealProviderTests: false,
  });
  const actions = runActionSmokeTests({ includeInactive: false });

  return {
    ok: catalog.ok && inventory.ok && engines.ok && actions.ok,
    catalogOk: catalog.ok,
    catalogIssueCount: catalog.issues.length,
    inventoryOk: inventory.ok,
    inventoryIssueCount: inventory.issues.length,
    engineSmoke: {
      ok: engines.ok,
      passed: engines.passed,
      failed: engines.failed,
      skipped: engines.skipped,
    },
    actionSmoke: {
      ok: actions.ok,
      passed: actions.passed,
      failed: actions.failed,
      skipped: actions.skipped,
    },
  };
}

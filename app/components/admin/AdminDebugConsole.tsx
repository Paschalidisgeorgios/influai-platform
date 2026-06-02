"use client";

import { useState, useTransition } from "react";
import type { AdminDryValidationResult } from "@/app/lib/admin/actions";
import { runAdminDryValidation } from "@/app/lib/admin/actions";
import type {
  AdminActionRow,
  AdminCreditEventRow,
  AdminEngineRow,
  AdminGenerationJobRow,
} from "@/app/lib/admin/queries";
import type { AdminModelInventoryRow } from "@/app/lib/admin/model-inventory-view";
import { ActionRegistryTable } from "./ActionRegistryTable";
import { CreditEventsTable } from "./CreditEventsTable";
import { EngineRegistryTable } from "./EngineRegistryTable";
import { GenerationJobsTable } from "./GenerationJobsTable";
import { ModelInventoryTable } from "./ModelInventoryTable";

type Props = {
  adminEmail: string;
  engines: AdminEngineRow[];
  actions: AdminActionRow[];
  jobs: AdminGenerationJobRow[];
  creditEvents: AdminCreditEventRow[];
  inventory: AdminModelInventoryRow[];
  inventorySummary: {
    total: number;
    active: number;
    runnable: number;
    placeholders: number;
  };
};

export function AdminDebugConsole({
  adminEmail,
  engines,
  actions,
  jobs,
  creditEvents,
  inventory,
  inventorySummary,
}: Props) {
  const [validation, setValidation] = useState<AdminDryValidationResult | null>(
    null
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDryValidation() {
    setValidationError(null);
    startTransition(async () => {
      try {
        const result = await runAdminDryValidation();
        setValidation(result);
      } catch {
        setValidationError("Validation could not be run.");
      }
    });
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <header className="space-y-2 border-b border-white/10 pb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-white/45">
          Internal · Launch monitoring
        </p>
        <h1 className="text-3xl font-bold text-white">Admin Debug Console</h1>
        <p className="text-sm text-white/60">
          Signed in as {adminEmail}. Provider metadata stays here — never shown
          in the creator UI.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleDryValidation}
            disabled={isPending}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
          >
            {isPending ? "Running dry validation…" : "Re-run dry catalog validation"}
          </button>
          {validation ? (
            <p
              className={`text-sm ${validation.ok ? "text-emerald-300" : "text-red-300"}`}
            >
              Catalog {validation.catalogOk ? "OK" : `issues (${validation.catalogIssueCount})`}
              {" · "}
              Inventory{" "}
              {validation.inventoryOk
                ? "OK"
                : `issues (${validation.inventoryIssueCount})`}
              {" · "}
              Engines {validation.engineSmoke.passed}/{validation.engineSmoke.passed + validation.engineSmoke.failed} passed
              {" · "}
              Actions {validation.actionSmoke.passed}/{validation.actionSmoke.passed + validation.actionSmoke.failed} passed
            </p>
          ) : null}
          {validationError ? (
            <p className="text-sm text-red-300">{validationError}</p>
          ) : null}
        </div>
      </header>

      <EngineRegistryTable rows={engines} />
      <ModelInventoryTable rows={inventory} summary={inventorySummary} />
      <ActionRegistryTable rows={actions} />
      <GenerationJobsTable rows={jobs} />
      <CreditEventsTable rows={creditEvents} />
    </div>
  );
}

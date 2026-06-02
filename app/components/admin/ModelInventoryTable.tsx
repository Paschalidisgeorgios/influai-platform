"use client";

import type { AdminModelInventoryRow } from "@/app/lib/admin/model-inventory-view";

type Props = {
  rows: AdminModelInventoryRow[];
  summary?: {
    total: number;
    active: number;
    runnable: number;
    placeholders: number;
  };
};

export function ModelInventoryTable({ rows, summary }: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
      <div className="border-b border-white/10 px-4 py-3">
        <h2 className="text-sm font-semibold text-white">Model Inventory</h2>
        <p className="mt-1 text-xs text-white/50">
          Internal capability catalog — not exposed to creator studio users.
        </p>
        {summary ? (
          <p className="mt-2 text-[11px] text-white/40">
            {summary.total} entries · {summary.active} active · {summary.runnable}{" "}
            runnable · {summary.placeholders} placeholders
          </p>
        ) : null}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-xs text-white/70">
          <thead className="border-b border-white/10 text-[10px] uppercase tracking-wider text-white/40">
            <tr>
              <th className="px-3 py-2">Inventory</th>
              <th className="px-2 py-2">Capability</th>
              <th className="px-2 py-2">Provider</th>
              <th className="px-2 py-2">Model ref</th>
              <th className="px-2 py-2">Status</th>
              <th className="px-2 py-2">Validation</th>
              <th className="px-2 py-2">Engine</th>
              <th className="px-2 py-2">Mode</th>
              <th className="px-2 py-2">Cr</th>
              <th className="px-2 py-2">Run</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.inventoryId}
                className="border-b border-white/5 hover:bg-white/[0.03]"
              >
                <td className="px-3 py-2 font-mono text-white/80">
                  {row.inventoryId}
                </td>
                <td className="px-2 py-2">{row.capability}</td>
                <td className="px-2 py-2">{row.provider}</td>
                <td className="max-w-[140px] truncate px-2 py-2 font-mono text-[10px]">
                  {row.providerModelRef}
                </td>
                <td className="px-2 py-2">{row.status}</td>
                <td className="px-2 py-2">{row.validationStatus}</td>
                <td className="px-2 py-2 font-mono text-[10px]">
                  {row.mappedEngineId ?? "—"}
                </td>
                <td className="px-2 py-2 font-mono text-[10px]">
                  {row.mappedModelModeId ?? "—"}
                </td>
                <td className="px-2 py-2">{row.creditsEstimate ?? "—"}</td>
                <td className="px-2 py-2">
                  {row.canRunGeneration ? "yes" : "no"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

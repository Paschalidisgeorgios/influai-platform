"use client";

import { useMemo, useState } from "react";
import type { AdminEngineRow } from "@/app/lib/admin/queries";
import {
  AdminTableShell,
  CopyButton,
  StatusBadge,
} from "./admin-table-shared";

type FilterMode = "all" | "active" | "inactive";

type Props = {
  rows: AdminEngineRow[];
};

export function EngineRegistryTable({ rows }: Props) {
  const [filter, setFilter] = useState<FilterMode>("all");

  const filtered = useMemo(() => {
    if (filter === "active") {
      return rows.filter((row) => row.status === "active");
    }
    if (filter === "inactive") {
      return rows.filter((row) => row.status !== "active");
    }
    return rows;
  }, [filter, rows]);

  return (
    <AdminTableShell
      title="Engine Registry"
      description="Launch catalog — provider metadata for internal monitoring only."
      toolbar={
        <div className="flex gap-2 text-xs">
          {(["all", "active", "inactive"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setFilter(mode)}
              className={`rounded-full px-3 py-1 capitalize ${
                filter === mode
                  ? "bg-white text-black"
                  : "border border-white/15 text-white/70"
              }`}
            >
              {mode === "all" ? "All" : mode === "active" ? "Active only" : "Inactive only"}
            </button>
          ))}
        </div>
      }
    >
      <table className="min-w-full text-left text-sm text-white/85">
        <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-white/45">
          <tr>
            <th className="px-2 py-2">Engine</th>
            <th className="px-2 py-2">Group</th>
            <th className="px-2 py-2">Provider</th>
            <th className="px-2 py-2">Output</th>
            <th className="px-2 py-2">Status</th>
            <th className="px-2 py-2">Credits</th>
            <th className="px-2 py-2">Validation</th>
            <th className="px-2 py-2">User</th>
            <th className="px-2 py-2">Run</th>
            <th className="px-2 py-2">Env vars</th>
            <th className="px-2 py-2">Model ID</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((row) => (
            <tr key={row.engineId} className="border-b border-white/5 align-top">
              <td className="px-2 py-2 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span>{row.engineId}</span>
                  <CopyButton value={row.engineId} />
                </div>
              </td>
              <td className="px-2 py-2">{row.group}</td>
              <td className="px-2 py-2">{row.provider}</td>
              <td className="px-2 py-2">{row.outputType}</td>
              <td className="px-2 py-2">
                <StatusBadge value={row.status} />
              </td>
              <td className="px-2 py-2">{row.credits}</td>
              <td className="px-2 py-2">
                <StatusBadge value={row.validationStatus} />
              </td>
              <td className="px-2 py-2">{row.canShowToUser ? "yes" : "no"}</td>
              <td className="px-2 py-2">{row.canRunGeneration ? "yes" : "no"}</td>
              <td className="px-2 py-2 font-mono text-xs">
                {row.requiredEnvVars.join(", ") || "—"}
              </td>
              <td className="px-2 py-2 font-mono text-xs break-all max-w-[220px]">
                {row.modelId ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminTableShell>
  );
}

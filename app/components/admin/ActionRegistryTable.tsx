"use client";

import { useMemo, useState } from "react";
import type { AdminActionRow } from "@/app/lib/admin/queries";
import {
  AdminTableShell,
  CopyButton,
  StatusBadge,
} from "./admin-table-shared";

type FilterMode = "all" | "active" | "inactive";

type Props = {
  rows: AdminActionRow[];
};

export function ActionRegistryTable({ rows }: Props) {
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
      title="Action Registry"
      description="User-facing actions and engine bindings."
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
            <th className="px-2 py-2">Action</th>
            <th className="px-2 py-2">Label</th>
            <th className="px-2 py-2">Output</th>
            <th className="px-2 py-2">Status</th>
            <th className="px-2 py-2">Default engine</th>
            <th className="px-2 py-2">Allowed engines</th>
            <th className="px-2 py-2">Est. credits</th>
            <th className="px-2 py-2">Visible</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((row) => (
            <tr key={row.actionId} className="border-b border-white/5 align-top">
              <td className="px-2 py-2 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span>{row.actionId}</span>
                  <CopyButton value={row.actionId} />
                </div>
              </td>
              <td className="px-2 py-2">{row.label}</td>
              <td className="px-2 py-2">{row.outputType}</td>
              <td className="px-2 py-2">
                <StatusBadge value={row.status} />
              </td>
              <td className="px-2 py-2 font-mono text-xs">
                {row.defaultEngine ?? "—"}
              </td>
              <td className="px-2 py-2 font-mono text-xs">
                {row.allowedEngines.length ? row.allowedEngines.join(", ") : "—"}
              </td>
              <td className="px-2 py-2">{row.estimatedCredits}</td>
              <td className="px-2 py-2">{row.visibleToUser ? "yes" : "no"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminTableShell>
  );
}

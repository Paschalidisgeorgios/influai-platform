"use client";

import { useMemo, useState } from "react";
import type { AdminGenerationJobRow } from "@/app/lib/admin/queries";
import { AdminTableShell, StatusBadge } from "./admin-table-shared";

type JobFilter = "all" | "failed" | "image" | "video";

type Props = {
  rows: AdminGenerationJobRow[];
};

export function GenerationJobsTable({ rows }: Props) {
  const [filter, setFilter] = useState<JobFilter>("all");

  const filtered = useMemo(() => {
    if (filter === "failed") {
      return rows.filter((row) => row.status === "failed");
    }
    if (filter === "image") {
      return rows.filter((row) => row.outputType === "image");
    }
    if (filter === "video") {
      return rows.filter((row) => row.outputType === "video");
    }
    return rows;
  }, [filter, rows]);

  return (
    <AdminTableShell
      title="Generation Jobs"
      description="Recent jobs from the generations table — internal errors only, no provider payloads."
      toolbar={
        <div className="flex flex-wrap gap-2 text-xs">
          {(
            [
              ["all", "All"],
              ["failed", "Failed"],
              ["image", "Image"],
              ["video", "Video"],
            ] as const
          ).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() => setFilter(mode)}
              className={`rounded-full px-3 py-1 ${
                filter === mode
                  ? "bg-white text-black"
                  : "border border-white/15 text-white/70"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      }
    >
      {rows.length === 0 ? (
        <p className="text-sm text-white/55">No generation jobs found.</p>
      ) : (
        <table className="min-w-full text-left text-sm text-white/85">
          <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-white/45">
            <tr>
              <th className="px-2 py-2">Created</th>
              <th className="px-2 py-2">User</th>
              <th className="px-2 py-2">Action</th>
              <th className="px-2 py-2">Engine</th>
              <th className="px-2 py-2">Output</th>
              <th className="px-2 py-2">Status</th>
              <th className="px-2 py-2">Charged</th>
              <th className="px-2 py-2">Refunded</th>
              <th className="px-2 py-2">Asset</th>
              <th className="px-2 py-2">Error</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id} className="border-b border-white/5 align-top">
                <td className="px-2 py-2 whitespace-nowrap text-xs">
                  {new Date(row.createdAt).toLocaleString()}
                </td>
                <td className="px-2 py-2">{row.userLabel}</td>
                <td className="px-2 py-2 font-mono text-xs">{row.actionId}</td>
                <td className="px-2 py-2 font-mono text-xs">{row.engineId}</td>
                <td className="px-2 py-2">{row.outputType}</td>
                <td className="px-2 py-2">
                  <StatusBadge value={row.status} />
                </td>
                <td className="px-2 py-2">{row.creditsCharged}</td>
                <td className="px-2 py-2">
                  {row.creditsRefunded == null ? "—" : row.creditsRefunded}
                </td>
                <td className="px-2 py-2">{row.hasAssetUrl ? "yes" : "no"}</td>
                <td className="px-2 py-2 max-w-[280px] text-xs text-white/65">
                  {row.errorMessage ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminTableShell>
  );
}

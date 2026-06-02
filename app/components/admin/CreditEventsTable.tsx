"use client";

import type { AdminCreditEventRow } from "@/app/lib/admin/queries";
import { AdminTableShell, StatusBadge } from "./admin-table-shared";

type Props = {
  rows: AdminCreditEventRow[];
};

export function CreditEventsTable({ rows }: Props) {
  return (
    <AdminTableShell
      title="Credits & Refunds"
      description="Recent credit_transactions ledger — purchases, usage, and refunds."
    >
      {rows.length === 0 ? (
        <p className="text-sm text-white/55">No credit events found.</p>
      ) : (
        <table className="min-w-full text-left text-sm text-white/85">
          <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-white/45">
            <tr>
              <th className="px-2 py-2">Created</th>
              <th className="px-2 py-2">User</th>
              <th className="px-2 py-2">Amount</th>
              <th className="px-2 py-2">Type</th>
              <th className="px-2 py-2">Reason</th>
              <th className="px-2 py-2">Generation</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-white/5 align-top">
                <td className="px-2 py-2 whitespace-nowrap text-xs">
                  {new Date(row.createdAt).toLocaleString()}
                </td>
                <td className="px-2 py-2">{row.userLabel}</td>
                <td className="px-2 py-2">
                  <span className={row.amount < 0 ? "text-red-300" : "text-emerald-300"}>
                    {row.amount > 0 ? `+${row.amount}` : row.amount}
                  </span>
                </td>
                <td className="px-2 py-2">
                  <StatusBadge value={row.type} />
                </td>
                <td className="px-2 py-2 font-mono text-xs">{row.reason}</td>
                <td className="px-2 py-2 font-mono text-xs">
                  {row.relatedGenerationId ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminTableShell>
  );
}

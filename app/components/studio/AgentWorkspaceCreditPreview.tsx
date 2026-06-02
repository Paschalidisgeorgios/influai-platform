"use client";

import { AGENT_PROMPT_WORKSPACE_COPY } from "@/lib/studio/agent-prompt-workspace-copy";

type Props = {
  modeLabel: string;
  creditCost: number;
  creditBalance?: number;
  creditsConfirmed?: boolean;
  language?: "en" | "de";
  /** Pack preview — no charge until render */
  previewOnly?: boolean;
  className?: string;
};

export default function AgentWorkspaceCreditPreview({
  modeLabel,
  creditCost,
  creditBalance,
  creditsConfirmed = false,
  language = "en",
  previewOnly = false,
  className = "",
}: Props) {
  const isDe = language === "de";
  const copy = AGENT_PROMPT_WORKSPACE_COPY;
  const locale = isDe ? "de-DE" : "en-US";

  return (
    <div
      className={`rounded-xl border border-neutral-800/80 bg-[#0a0a0a]/50 px-3 py-2.5 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-500">
            {isDe ? copy.creditPreviewLabel.de : copy.creditPreviewLabel.en}
          </p>
          <p className="mt-0.5 truncate text-xs font-semibold text-neutral-200">
            {modeLabel}
          </p>
        </div>
        <p className="shrink-0 text-sm font-bold tabular-nums text-amber-400">
          {previewOnly
            ? isDe
              ? "Vorschau · 0 Credits"
              : "Preview · 0 credits"
            : creditCost > 0
              ? `${creditCost.toLocaleString(locale)} ${isDe ? "Credits" : "credits"}`
              : isDe
                ? "Kostenlos"
                : "Free"}
        </p>
      </div>
      {creditsConfirmed && typeof creditBalance === "number" ? (
        <p className="mt-1.5 text-[10px] text-neutral-500">
          {isDe ? copy.creditBalanceLabel.de : copy.creditBalanceLabel.en}:{" "}
          <span className="font-semibold tabular-nums text-neutral-400">
            {creditBalance.toLocaleString(locale)}
          </span>
        </p>
      ) : null}
    </div>
  );
}

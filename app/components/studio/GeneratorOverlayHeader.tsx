"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Film, X } from "lucide-react";
import { GENERATOR_OVERLAY_COPY } from "@/lib/studio/generator-overlay-copy";
import { CREATOR_TOOL_ICONS } from "@/lib/studio/creator-tool-icons";
import { studioDashboardStatusBadgeClass } from "@/lib/obsidian/status-badge-classes";
import type { CreatorToolId } from "@/app/lib/tools/creator-tools";
import type { PublicToolStatus } from "@/app/lib/tools/tool-status";

function HeaderToolIcon({ toolId }: { toolId: CreatorToolId }) {
  const Icon = CREATOR_TOOL_ICONS[toolId] ?? Film;
  return <Icon className="h-4 w-4" aria-hidden />;
}

type Props = {
  toolName: string;
  toolId?: CreatorToolId | null;
  language?: "en" | "de";
  statusLabel?: string | null;
  statusTone?: PublicToolStatus;
  costLabel?: string | null;
  onClose: () => void;
  closeDisabled?: boolean;
};

export default function GeneratorOverlayHeader({
  toolName,
  toolId,
  language = "en",
  statusLabel,
  statusTone = "live",
  costLabel,
  onClose,
  closeDisabled = false,
}: Props) {
  const isDe = language === "de";
  const closeLabel = isDe
    ? GENERATOR_OVERLAY_COPY.close.de
    : GENERATOR_OVERLAY_COPY.close.en;
  const closeBlockedLabel = isDe
    ? GENERATOR_OVERLAY_COPY.closeBlocked.de
    : GENERATOR_OVERLAY_COPY.closeBlocked.en;

  const cost = costLabel?.trim() || null;
  const status = !cost ? statusLabel?.trim() || null : null;

  const closeButtonClass =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.04] text-neutral-300 transition hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500/50 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <header className="sticky top-0 z-10 flex shrink-0 items-center gap-3 border-b border-[rgba(255,165,0,0.15)] bg-[#0a0a0a] px-4 py-3 sm:px-5 sm:py-4">
      {toolId ? (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-500/35 bg-amber-500/15 text-amber-200">
          <HeaderToolIcon toolId={toolId} />
        </div>
      ) : null}

      <Dialog.Title className="min-w-0 flex-1 truncate text-base font-bold text-white sm:text-lg">
        {toolName}
      </Dialog.Title>

      {cost ? (
        <span className="shrink-0 rounded-md border border-amber-500/30 bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold tabular-nums text-amber-200 sm:text-xs">
          {cost}
        </span>
      ) : null}

      {status ? (
        <span
          className={`${studioDashboardStatusBadgeClass(statusTone)} shrink-0 !text-[9px]`}
        >
          {status}
        </span>
      ) : null}

      {closeDisabled ? (
        <button
          type="button"
          disabled
          className={closeButtonClass}
          aria-label={closeLabel}
          title={closeBlockedLabel}
          aria-describedby="generator-overlay-desc"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      ) : (
        <Dialog.Close
          type="button"
          className={closeButtonClass}
          aria-label={closeLabel}
          onClick={onClose}
        >
          <X className="h-4 w-4" aria-hidden />
        </Dialog.Close>
      )}
    </header>
  );
}

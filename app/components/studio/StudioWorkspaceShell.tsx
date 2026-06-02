"use client";

import type { ReactNode } from "react";
import type { CreatorToolboxGroupId } from "@/app/lib/tools/creator-tools";
import CategoryRail from "./CategoryRail";
import { STICKY_CREDIT_BAR_PAGE_RESERVE } from "@/lib/studio/sticky-credit-bar-layout";
import {
  STUDIO_AGENT_WORKSPACE_SLOT,
  STUDIO_CONTEXT_ACTION_SLOT,
  STUDIO_WORKSPACE_MAIN_COLUMN,
  STUDIO_WORKSPACE_SHELL_ROW,
} from "@/lib/studio/workspace-layout-tokens";

const WORKSPACE_SHELL_HEIGHT =
  "min-h-[min(480px,calc(100dvh-7.5rem))] max-h-[calc(100dvh-7.5rem)] h-[calc(100dvh-7.5rem)] sm:min-h-[min(520px,calc(100dvh-6.5rem))] sm:max-h-[calc(100dvh-6.5rem)] sm:h-[calc(100dvh-6.5rem)] md:min-h-[min(640px,calc(100dvh-6rem))] md:max-h-[calc(100dvh-6rem)] md:h-[calc(100dvh-6rem)]";

const WORKSPACE_SHELL_COMPACT_HEIGHT =
  "min-h-[min(420px,58dvh)] max-h-[min(58dvh,680px)] h-[min(58dvh,680px)]";

type Props = {
  selectedCategoryId: CreatorToolboxGroupId;
  onCategoryChange: (id: CreatorToolboxGroupId) => void;
  language: "en" | "de";
  contextBar: ReactNode;
  workspace: ReactNode;
  detailPanel?: ReactNode;
  /** Fits inside GeneratorOverlay — shorter fixed height */
  compact?: boolean;
  className?: string;
};

/**
 * Fixed outer agent workspace — category rail + center column do not resize on switch.
 */
export default function StudioWorkspaceShell({
  selectedCategoryId,
  onCategoryChange,
  language,
  contextBar,
  workspace,
  detailPanel,
  compact = false,
  className = "",
}: Props) {
  const shellHeight = compact
    ? WORKSPACE_SHELL_COMPACT_HEIGHT
    : WORKSPACE_SHELL_HEIGHT;

  return (
    <div
      className={`relative mx-auto flex w-full min-w-0 max-w-[min(100%,90rem)] flex-col overflow-x-hidden ${compact ? "" : STICKY_CREDIT_BAR_PAGE_RESERVE} ${className}`}
    >
      <div
        className={`rounded-2xl border border-white/[0.08] bg-[#0E1220]/90 shadow-[0_0_60px_rgba(0,0,0,0.35)] ${shellHeight} ${STUDIO_WORKSPACE_SHELL_ROW}`}
      >
        <CategoryRail
          selectedId={selectedCategoryId}
          onSelect={onCategoryChange}
          language={language}
        />
        <div
          id="studio-workspace-panel"
          role="tabpanel"
          aria-labelledby={`category-rail-tab-${selectedCategoryId}`}
          className={STUDIO_WORKSPACE_MAIN_COLUMN}
        >
          <div className={STUDIO_CONTEXT_ACTION_SLOT}>{contextBar}</div>
          <div className={STUDIO_AGENT_WORKSPACE_SLOT}>{workspace}</div>
        </div>
      </div>
      {detailPanel ? <div className="relative z-20">{detailPanel}</div> : null}
    </div>
  );
}

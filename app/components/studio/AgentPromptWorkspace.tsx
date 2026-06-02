"use client";

import type { ReactNode } from "react";
import { Package, Sparkles } from "lucide-react";
import type { CreatorToolboxGroupId } from "@/app/lib/tools/creator-tools";
import { STUDIO_CATEGORY_COPY } from "@/app/lib/studio/studio-categories";
import { AGENT_PROMPT_WORKSPACE_COPY } from "@/lib/studio/agent-prompt-workspace-copy";
import {
  AGENT_PROMPT_AGENT_STEPS_RESERVE,
  AGENT_PROMPT_ASSIST_RESERVE,
  AGENT_PROMPT_COMPOSE_ASSIST,
  AGENT_PROMPT_COMPOSE_COLUMN,
  AGENT_PROMPT_COMPOSE_CREDIT,
  AGENT_PROMPT_COMPOSE_CTA,
  AGENT_PROMPT_COMPOSE_PROMPT,
  AGENT_PROMPT_CONTEXT_STRIP,
  AGENT_PROMPT_GRID,
  AGENT_PROMPT_PACK_HINT_RESERVE,
  AGENT_PROMPT_PREVIEW_COLUMN,
  AGENT_PROMPT_WORKSPACE_PANEL,
  AGENT_PROMPT_WORKSPACE_ROOT,
  AGENT_PROMPT_WORKSPACE_SCROLL,
} from "@/lib/studio/agent-prompt-workspace-tokens";

type Props = {
  categoryId: CreatorToolboxGroupId;
  language: "en" | "de";
  toolLabel?: string;
  toolDescription?: string;
  /** Social Asset Pack highlighted as default Create workflow */
  packRecommended?: boolean;
  promptSlot: ReactNode;
  promptAssistSlot?: ReactNode;
  creditPreviewSlot?: ReactNode;
  primaryCtaSlot?: ReactNode;
  agentStepsSlot?: ReactNode;
  /** Onboarding / page header above the grid */
  headerSlot?: ReactNode;
  previewSlot: ReactNode;
  className?: string;
};

export default function AgentPromptWorkspace({
  categoryId,
  language,
  toolLabel,
  toolDescription,
  packRecommended = false,
  promptSlot,
  promptAssistSlot,
  creditPreviewSlot,
  primaryCtaSlot,
  agentStepsSlot,
  headerSlot,
  previewSlot,
  className = "",
}: Props) {
  const isDe = language === "de";
  const categoryCopy = STUDIO_CATEGORY_COPY[categoryId];
  const ui = AGENT_PROMPT_WORKSPACE_COPY;
  return (
    <div className={`${AGENT_PROMPT_WORKSPACE_ROOT} ${className}`}>
      <div className={AGENT_PROMPT_WORKSPACE_PANEL}>
        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
          <header className={AGENT_PROMPT_CONTEXT_STRIP}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-amber-500/35 bg-amber-500/10 text-amber-400">
                  <Sparkles className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-500/80">
                    {isDe ? ui.workspaceTitle.de : ui.workspaceTitle.en}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#F9FAFB]">
                    <span className="text-neutral-500">
                      {isDe ? categoryCopy.labelDe : categoryCopy.labelEn}
                    </span>
                    {toolLabel ? (
                      <>
                        <span className="mx-1.5 text-neutral-600" aria-hidden>
                          /
                        </span>
                        <span>{toolLabel}</span>
                      </>
                    ) : null}
                  </p>
                  <p className="mt-1 line-clamp-2 max-w-xl text-[11px] leading-relaxed text-neutral-500">
                    {toolDescription ??
                      (isDe
                        ? categoryCopy.descriptionDe
                        : categoryCopy.descriptionEn)}
                  </p>
                </div>
              </div>

              {packRecommended ? (
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/12 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-200">
                  <Package className="h-3 w-3" aria-hidden />
                  {isDe ? ui.packRecommended.de : ui.packRecommended.en}
                </span>
              ) : null}
            </div>

            {categoryId === "create" ? (
              <div className={AGENT_PROMPT_PACK_HINT_RESERVE}>
                {packRecommended ? (
                  <p className="text-[11px] leading-relaxed text-amber-500/70">
                    {isDe ? ui.packPrimaryHint.de : ui.packPrimaryHint.en}
                  </p>
                ) : null}
              </div>
            ) : null}
          </header>

          {headerSlot ? (
            <div className="shrink-0 border-b border-white/[0.04] px-4 py-3 sm:px-5">
              {headerSlot}
            </div>
          ) : null}

          <div className={`${AGENT_PROMPT_GRID} min-h-0 flex-1`}>
            <aside
              className={AGENT_PROMPT_COMPOSE_COLUMN}
              aria-label={isDe ? "Eingabe & Aktionen" : "Input & actions"}
            >
              <section
                id="create-prompt"
                className={`${AGENT_PROMPT_COMPOSE_PROMPT} scroll-mt-24`}
                aria-label={isDe ? "Prompt" : "Prompt"}
              >
                {promptSlot}
              </section>

              <div className={`${AGENT_PROMPT_COMPOSE_ASSIST} ${AGENT_PROMPT_ASSIST_RESERVE}`}>
                {promptAssistSlot ?? null}
              </div>

              {creditPreviewSlot ? (
                <div className={AGENT_PROMPT_COMPOSE_CREDIT}>{creditPreviewSlot}</div>
              ) : null}

              {primaryCtaSlot ? (
                <div className={AGENT_PROMPT_COMPOSE_CTA}>{primaryCtaSlot}</div>
              ) : null}

              {categoryId === "create" ? (
                <div className={AGENT_PROMPT_AGENT_STEPS_RESERVE}>
                  {agentStepsSlot ?? null}
                </div>
              ) : null}
            </aside>

            <section
              className={AGENT_PROMPT_PREVIEW_COLUMN}
              aria-label={isDe ? ui.previewSection.de : ui.previewSection.en}
            >
              <div className={AGENT_PROMPT_WORKSPACE_SCROLL}>{previewSlot}</div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

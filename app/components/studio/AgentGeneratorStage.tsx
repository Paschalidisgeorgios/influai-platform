"use client";

import type { ReactNode } from "react";
import {
  AGENT_GENERATOR_STAGE_COMPOSE,
  AGENT_GENERATOR_STAGE_GRID,
  AGENT_GENERATOR_STAGE_PREVIEW,
  AGENT_GENERATOR_STAGE_ROOT,
  AGENT_GENERATOR_STAGE_SCROLL,
} from "@/lib/studio/agent-generator-stage-tokens";
import GeneratorOverlayVisualStage from "./GeneratorOverlayVisualStage";

type Props = {
  promptSlot: ReactNode;
  promptAssistSlot?: ReactNode;
  /** Mode, format, and tool settings (overlay compose column). */
  settingsSlot?: ReactNode;
  agentStepsSlot?: ReactNode;
  previewSlot: ReactNode;
  /** When false, compose column does not scroll (pack overlay — one scroll region). */
  composeScrollable?: boolean;
  /** When false, preview defers scrolling to embedded panel (pack overlay). */
  previewScrollable?: boolean;
  /** Single column: prompt → timeline → visual stage (generator overlay). */
  layout?: "split" | "stacked";
  language?: "en" | "de";
  className?: string;
};

/**
 * Focused generator body for overlay — prompt, assist, agent timeline, visual stage.
 * No workspace intros or category copy (those live in GeneratorOverlayHeader).
 */
export default function AgentGeneratorStage({
  promptSlot,
  promptAssistSlot,
  settingsSlot,
  agentStepsSlot,
  previewSlot,
  composeScrollable = true,
  previewScrollable = true,
  layout = "split",
  language = "en",
  className = "",
}: Props) {
  const composeClass = composeScrollable
    ? AGENT_GENERATOR_STAGE_COMPOSE
    : `${AGENT_GENERATOR_STAGE_COMPOSE} overflow-hidden`;

  const previewScrollClass = previewScrollable
    ? AGENT_GENERATOR_STAGE_SCROLL
    : "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden";

  if (layout === "stacked") {
    return (
      <div className={`${AGENT_GENERATOR_STAGE_ROOT} ${className}`}>
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
          <section className="shrink-0" aria-label="Prompt">
            {promptSlot}
          </section>

          {agentStepsSlot ? (
            <div className="shrink-0">{agentStepsSlot}</div>
          ) : null}

          {settingsSlot ? <div className="shrink-0">{settingsSlot}</div> : null}

          {promptAssistSlot ? (
            <div className="relative min-h-0 shrink-0">{promptAssistSlot}</div>
          ) : null}

          <GeneratorOverlayVisualStage language={language} className="min-h-[12rem]">
            <div className={previewScrollClass}>{previewSlot}</div>
          </GeneratorOverlayVisualStage>
        </div>
      </div>
    );
  }

  return (
    <div className={`${AGENT_GENERATOR_STAGE_ROOT} ${className}`}>
      <div className={AGENT_GENERATOR_STAGE_GRID}>
        <aside className={composeClass} aria-label="Generator input">
          <section className="shrink-0" aria-label="Prompt">
            {promptSlot}
          </section>

          {promptAssistSlot ? (
            <div className="relative min-h-[6.5rem] shrink-0 sm:min-h-[8rem]">
              {promptAssistSlot}
            </div>
          ) : null}

          {settingsSlot ? (
            <div className="min-h-0 shrink-0">{settingsSlot}</div>
          ) : null}

          {agentStepsSlot ? (
            <div className="min-h-[8.5rem] max-h-[min(220px,28vh)] shrink-0 overflow-hidden sm:min-h-[9.5rem]">
              {agentStepsSlot}
            </div>
          ) : null}
        </aside>

        <section
          className={AGENT_GENERATOR_STAGE_PREVIEW}
          aria-label="Preview"
        >
          <div className={previewScrollClass}>{previewSlot}</div>
        </section>
      </div>
    </div>
  );
}

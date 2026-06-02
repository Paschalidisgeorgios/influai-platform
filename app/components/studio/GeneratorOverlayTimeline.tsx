"use client";

import { AGENT_WORKFLOW_STEPS } from "@/app/lib/agent/agent-workflow";
import type { AgentWorkflowMode } from "@/app/lib/agent/agent-workflow";
import { useAgentWorkflowProgress } from "./use-agent-workflow-progress";

const SHORT_STEP_LABELS: Record<string, { en: string; de: string }> = {
  idea: { en: "Idea", de: "Idee" },
  prompt_assist: { en: "Prompt", de: "Prompt" },
  images: { en: "Images", de: "Bilder" },
  motion: { en: "Motion", de: "Motion" },
  copy: { en: "Copy", de: "Copy" },
  score: { en: "Score", de: "Score" },
  export: { en: "Export", de: "Export" },
};

type Props = {
  language?: "en" | "de";
  mode?: AgentWorkflowMode;
  className?: string;
};

/**
 * Horizontal agent pipeline: circle + label per step, connected by lines.
 */
export default function GeneratorOverlayTimeline({
  language = "en",
  mode = "idle",
  className = "",
}: Props) {
  const isDe = language === "de";
  const { activeIndex, revealedMaxIndex } = useAgentWorkflowProgress(mode);
  const steps = AGENT_WORKFLOW_STEPS;

  return (
    <nav
      aria-label={isDe ? "Content-Assembly-Schritte" : "Content assembly steps"}
      className={`w-full min-w-0 ${className}`}
    >
      <ol className="flex w-full min-w-0 items-start">
        {steps.map((step, index) => {
          const label =
            SHORT_STEP_LABELS[step.id]?.[isDe ? "de" : "en"] ??
            (isDe ? step.labelDe : step.labelEn);
          const isActive = index === activeIndex && mode !== "idle";
          const isComplete =
            index < activeIndex ||
            (index <= revealedMaxIndex && mode === "complete");
          const isLast = index === steps.length - 1;

          const dotClass = isActive
            ? "border-amber-400 bg-amber-400 shadow-[0_0_14px_rgba(245,158,11,0.65)] animate-pulse"
            : isComplete
              ? "border-amber-500/50 bg-amber-500/35"
              : "border-neutral-600 bg-neutral-700";

          const labelClass = isActive
            ? "text-amber-100 [text-shadow:0_0_10px_rgba(251,191,36,0.35)]"
            : isComplete
              ? "text-amber-200/75"
              : "text-neutral-500";

          const lineClass =
            isComplete || (isActive && index > 0)
              ? "bg-amber-500/40"
              : "bg-neutral-700/90";

          return (
            <li key={step.id} className="flex min-w-0 flex-1 items-start">
              <div className="flex min-w-0 flex-col items-center gap-1.5 px-0.5">
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full border transition-colors duration-200 ${dotClass}`}
                  aria-hidden
                />
                <span
                  className={`max-w-[4.5rem] text-center text-[9px] font-semibold uppercase leading-tight tracking-wide sm:max-w-none sm:text-[10px] ${labelClass}`}
                >
                  {label}
                </span>
              </div>
              {!isLast ? (
                <span
                  className={`mx-0.5 mt-[5px] h-px min-w-[6px] flex-1 ${lineClass}`}
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

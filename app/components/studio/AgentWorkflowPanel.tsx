"use client";

import { Check, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import {
  AGENT_WORKFLOW_COPY,
  AGENT_WORKFLOW_SHELL_MIN_HEIGHT_PX,
  AGENT_WORKFLOW_STEPS,
  resolveAgentStepVisualState,
  resolveAgentWorkflowStatus,
  type AgentWorkflowMode,
} from "@/app/lib/agent/agent-workflow";
import type { PackAssemblyStepId } from "@/app/components/pack/pack-showcase-types";
import { usePackMotion } from "@/app/components/pack/use-pack-motion";
import { useAgentWorkflowProgress } from "./use-agent-workflow-progress";
import {
  MODEL_DESCRIPTIONS,
  MODEL_DISPLAY_NAMES,
  resolveModelsForModelMode,
} from "@/lib/ai/model-recommendations";

const ROW_HEIGHT_PX = 36;
const STEP_COUNT = AGENT_WORKFLOW_STEPS.length;

type Props = {
  language: "en" | "de";
  mode: AgentWorkflowMode;
  activeStep?: PackAssemblyStepId;
  progress?: number;
  progressLabel?: string;
  statusLine?: string;
  showHeader?: boolean;
  className?: string;
  /** Optional — shows which engine model backs the current quality mode. */
  modelModeId?: string;
};

export default function AgentWorkflowPanel({
  language,
  mode,
  activeStep: externalActiveStep,
  progress: externalProgress,
  progressLabel,
  statusLine,
  showHeader = true,
  className = "",
  modelModeId,
}: Props) {
  const isDe = language === "de";
  const { reduceMotion } = usePackMotion();
  const { activeIndex, revealedMaxIndex, progress } = useAgentWorkflowProgress(
    mode,
    externalActiveStep,
    externalProgress
  );

  const status =
    statusLine ?? resolveAgentWorkflowStatus(mode, language);
  const showProgressAnim =
    mode === "demo" || mode === "planning" || mode === "rendering" || mode === "preview";
  const progressFill =
    mode === "complete" ? 100 : Math.min(100, Math.max(0, progress));

  const modelHint = modelModeId
    ? resolveModelsForModelMode(modelModeId)
    : null;
  const hintLang = isDe ? "de" : "en";
  const modelDesc = modelHint
    ? (MODEL_DESCRIPTIONS[modelHint.activeModel]?.[hintLang] ??
      modelHint.rationale)
    : null;
  const modelLabel = modelHint
    ? (MODEL_DISPLAY_NAMES[modelHint.activeModel] ?? modelHint.activeModel)
    : null;

  return (
    <section
      className={`flex min-w-0 flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-[#0E1220]/75 backdrop-blur-sm ${className}`}
      style={{ minHeight: AGENT_WORKFLOW_SHELL_MIN_HEIGHT_PX }}
      aria-label={
        isDe
          ? AGENT_WORKFLOW_COPY.title.de
          : AGENT_WORKFLOW_COPY.title.en
      }
    >
      {showHeader ? (
        <div className="shrink-0 border-b border-white/[0.06] px-3 py-2.5 sm:px-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
            </span>
            <div className="min-w-0">
              <h3 className="text-xs font-bold tracking-tight text-[#F9FAFB] sm:text-sm">
                {isDe
                  ? AGENT_WORKFLOW_COPY.title.de
                  : AGENT_WORKFLOW_COPY.title.en}
              </h3>
              <p className="mt-0.5 truncate text-[10px] text-neutral-500 sm:text-[11px]">
                {status}
              </p>
              {modelHint && modelLabel && modelDesc ? (
                <p className="mt-1 text-xs text-white/40" role="note">
                  <span className="text-white/50">{modelLabel}</span>
                  {" · "}
                  {modelDesc}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col gap-3 p-3 sm:p-4">
        {/* Fixed-height progress — always reserved */}
        <div className="h-[3.25rem] shrink-0 rounded-lg border border-neutral-800/80 bg-neutral-950/50 px-3 py-2">
          <div className="flex h-[1.125rem] items-center justify-between gap-2 text-[10px]">
            <span
              className={`min-w-0 truncate font-semibold transition-opacity duration-300 ${
                showProgressAnim ? "text-neutral-300" : "text-neutral-500"
              }`}
            >
              {progressLabel ??
                (isDe
                  ? AGENT_WORKFLOW_COPY.progressDefault.de
                  : AGENT_WORKFLOW_COPY.progressDefault.en)}
            </span>
            <span className="shrink-0 font-mono tabular-nums text-amber-400/90">
              {Math.round(progressFill)}%
            </span>
          </div>
          <div
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]"
            role="progressbar"
            aria-valuenow={Math.round(progressFill)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <motion.div
              className="h-full max-w-full rounded-full bg-gradient-to-r from-amber-700 via-amber-500 to-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.35)]"
              initial={false}
              animate={{
                width: `${progressFill}%`,
                opacity: progressFill > 0 ? 1 : 0.2,
              }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : {
                      width: { duration: 0.4, ease: "easeOut" },
                      opacity: { duration: 0.2 },
                    }
              }
            />
          </div>
        </div>

        {/* Fixed step list — 7 rows, no layout shift */}
        <ol
          className="min-h-0 shrink-0 space-y-1"
          style={{ minHeight: ROW_HEIGHT_PX * STEP_COUNT + (STEP_COUNT - 1) * 4 }}
          aria-label={isDe ? "Agent-Workflow" : "Agent workflow"}
        >
          {AGENT_WORKFLOW_STEPS.map((step, index) => {
            const visual = resolveAgentStepVisualState(
              index,
              activeIndex,
              revealedMaxIndex,
              mode,
              progressFill
            );
            const isActive = visual === "active";
            const isComplete = visual === "complete";
            const isHidden = visual === "hidden";
            const stepDef = AGENT_WORKFLOW_STEPS[index]!;

            return (
              <li
                key={stepDef.id}
                className="list-none"
                style={{ height: ROW_HEIGHT_PX }}
                aria-hidden={isHidden}
              >
                <motion.div
                  initial={false}
                  animate={{
                    opacity: isHidden ? 0.22 : 1,
                  }}
                  transition={
                    reduceMotion ? { duration: 0 } : { duration: 0.28, ease: "easeOut" }
                  }
                  className={`flex h-full items-center gap-2.5 rounded-lg border px-2.5 transition-colors ${
                    isActive
                      ? "border-amber-500/50 bg-amber-500/12 shadow-[0_0_20px_rgba(245,158,11,0.14)]"
                      : isComplete
                        ? "border-emerald-500/20 bg-emerald-500/[0.06]"
                        : "border-white/[0.06] bg-white/[0.02]"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${
                      isActive
                        ? "border-amber-400/50 bg-amber-500/20"
                        : isComplete
                          ? "border-emerald-500/30 bg-emerald-500/10"
                          : "border-neutral-700/80 bg-neutral-900/40"
                    }`}
                  >
                    {mode === "rendering" && isActive ? (
                      <Loader2
                        className="h-3 w-3 animate-spin text-amber-400"
                        aria-hidden
                      />
                    ) : isComplete ? (
                      <Check className="h-3 w-3 text-emerald-400" aria-hidden />
                    ) : isActive ? (
                      <span
                        className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                        aria-hidden
                      />
                    ) : (
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-neutral-600"
                        aria-hidden
                      />
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-[11px] font-semibold leading-tight sm:text-xs ${
                        isActive
                          ? "text-amber-100"
                          : isComplete
                            ? "text-emerald-200/90"
                            : "text-neutral-500"
                      }`}
                    >
                      {isDe ? stepDef.labelDe : stepDef.labelEn}
                    </p>
                    {isActive ? (
                      <p className="truncate text-[10px] text-amber-400/75">
                        {isDe ? stepDef.activeDe : stepDef.activeEn}
                      </p>
                    ) : null}
                  </div>
                </motion.div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

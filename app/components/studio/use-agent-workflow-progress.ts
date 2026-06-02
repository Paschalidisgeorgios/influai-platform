"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useAgentVisualEffectsEnabled } from "@/lib/studio/agent-visual-effects-context";
import {
  AGENT_WORKFLOW_STEPS,
  agentStepIndex,
  type AgentWorkflowMode,
} from "@/app/lib/agent/agent-workflow";
import type { PackAssemblyStepId } from "@/app/components/pack/pack-showcase-types";
import { PACK_ASSEMBLY_STEPS } from "@/app/components/pack/pack-showcase-types";

const STEP_MS = 420;

export type AgentWorkflowProgress = {
  activeStep: PackAssemblyStepId;
  activeIndex: number;
  revealedMaxIndex: number;
  progress: number;
};

function toProgress(activeIndex: number, partial = 0): number {
  const total = AGENT_WORKFLOW_STEPS.length;
  const base = ((activeIndex + partial) / total) * 100;
  return Math.min(100, Math.max(0, Math.round(base)));
}

export function useAgentWorkflowProgress(
  mode: AgentWorkflowMode,
  externalActiveStep?: PackAssemblyStepId,
  externalProgress?: number
): AgentWorkflowProgress {
  const agentEffectsEnabled = useAgentVisualEffectsEnabled();
  const reduceMotion = useReducedMotion() || !agentEffectsEnabled;
  const [activeIndex, setActiveIndex] = useState(0);
  const [revealedMaxIndex, setRevealedMaxIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (mode === "rendering" && externalActiveStep != null) {
      const idx = agentStepIndex(externalActiveStep);
      setActiveIndex(idx);
      setRevealedMaxIndex(AGENT_WORKFLOW_STEPS.length - 1);
      setProgress(
        typeof externalProgress === "number"
          ? externalProgress
          : toProgress(idx, 0.35)
      );
      return;
    }

    if (mode === "complete") {
      const last = AGENT_WORKFLOW_STEPS.length - 1;
      setActiveIndex(last);
      setRevealedMaxIndex(last);
      setProgress(100);
      return;
    }

    if (mode === "idle") {
      setActiveIndex(0);
      setRevealedMaxIndex(0);
      setProgress(0);
      return;
    }

    const animatesLocally =
      mode === "planning" || mode === "demo" || mode === "preview";

    if (!animatesLocally) {
      return;
    }

    if (reduceMotion) {
      const last = AGENT_WORKFLOW_STEPS.length - 1;
      setActiveIndex(last);
      setRevealedMaxIndex(last);
      setProgress(100);
      return;
    }

    setActiveIndex(0);
    setRevealedMaxIndex(0);
    setProgress(mode === "planning" ? 6 : 4);

    const timers: number[] = [];

    AGENT_WORKFLOW_STEPS.forEach((_, index) => {
      timers.push(
        window.setTimeout(() => {
          setRevealedMaxIndex(index);
          setActiveIndex(index);
          setProgress(toProgress(index, 0.2));

          if (index === AGENT_WORKFLOW_STEPS.length - 1) {
            timers.push(
              window.setTimeout(() => {
                setProgress(100);
              }, STEP_MS)
            );
          }
        }, (mode === "planning" ? 120 : 200) + index * STEP_MS)
      );
    });

    return () => {
      timers.forEach(window.clearTimeout);
    };
  }, [mode, externalActiveStep, externalProgress, reduceMotion]);

  const activeStep =
    externalActiveStep ??
    PACK_ASSEMBLY_STEPS[activeIndex] ??
    ("idea" as PackAssemblyStepId);

  return {
    activeStep,
    activeIndex: agentStepIndex(activeStep),
    revealedMaxIndex,
    progress:
      mode === "rendering" && typeof externalProgress === "number"
        ? externalProgress
        : progress,
  };
}

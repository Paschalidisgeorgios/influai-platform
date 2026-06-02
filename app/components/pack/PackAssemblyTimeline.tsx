"use client";

import AgentWorkflowPanel from "@/app/components/studio/AgentWorkflowPanel";
import { packShowcaseModeToAgentMode } from "@/app/lib/agent/agent-workflow";
import type { PackAssemblyStepId, PackShowcaseMode } from "./pack-showcase-types";

type Props = {
  language: "en" | "de";
  mode: PackShowcaseMode;
  activeStep: PackAssemblyStepId;
  progress?: number;
  progressLabel?: string;
  className?: string;
};

/**
 * Stable pack workflow shell — delegates to AgentWorkflowPanel (no layout shift).
 */
export default function PackAssemblyTimeline({
  language,
  mode,
  activeStep,
  progress = 0,
  progressLabel,
  className = "",
}: Props) {
  const agentMode = packShowcaseModeToAgentMode(mode);

  return (
    <AgentWorkflowPanel
      language={language}
      mode={agentMode}
      activeStep={mode === "rendering" ? activeStep : undefined}
      progress={progress}
      progressLabel={progressLabel}
      showHeader={false}
      className={className}
    />
  );
}

/**
 * Content assembly agent — user-facing workflow steps (no provider ids).
 */

import type { PackAssemblyStepId } from "@/app/components/pack/pack-showcase-types";
import { PACK_ASSEMBLY_STEPS } from "@/app/components/pack/pack-showcase-types";

export type AgentWorkflowMode =
  | "idle"
  | "planning"
  | "demo"
  | "preview"
  | "rendering"
  | "complete";

export type AgentWorkflowStep = {
  id: PackAssemblyStepId;
  labelEn: string;
  labelDe: string;
  /** Short agent status when this step is active */
  activeEn: string;
  activeDe: string;
};

/** Ordered assembly pipeline — maps 1:1 to pack showcase steps. */
export const AGENT_WORKFLOW_STEPS: readonly AgentWorkflowStep[] = [
  {
    id: "idea",
    labelEn: "Idea detected",
    labelDe: "Idee erkannt",
    activeEn: "Reading your idea…",
    activeDe: "Idee wird gelesen…",
  },
  {
    id: "prompt_assist",
    labelEn: "Prompt improved",
    labelDe: "Prompt verbessert",
    activeEn: "Sharpening the prompt…",
    activeDe: "Prompt wird geschärft…",
  },
  {
    id: "images",
    labelEn: "Image variations planned",
    labelDe: "Bildvarianten geplant",
    activeEn: "Planning image variations…",
    activeDe: "Bildvarianten werden geplant…",
  },
  {
    id: "motion",
    labelEn: "Motion clip prepared",
    labelDe: "Motion-Clip vorbereitet",
    activeEn: "Preparing motion clip…",
    activeDe: "Motion-Clip wird vorbereitet…",
  },
  {
    id: "copy",
    labelEn: "Hooks & captions generated",
    labelDe: "Hooks & Captions erzeugt",
    activeEn: "Drafting hooks & captions…",
    activeDe: "Hooks & Captions werden erstellt…",
  },
  {
    id: "score",
    labelEn: "Creative Score analyzed",
    labelDe: "Creative Score analysiert",
    activeEn: "Analyzing creative score…",
    activeDe: "Creative Score wird analysiert…",
  },
  {
    id: "export",
    labelEn: "Export package prepared",
    labelDe: "Export-Paket vorbereitet",
    activeEn: "Preparing export package…",
    activeDe: "Export-Paket wird vorbereitet…",
  },
] as const;

export const AGENT_WORKFLOW_SHELL_MIN_HEIGHT_PX = 304;

export const AGENT_WORKFLOW_COPY = {
  title: { en: "Content Assembly Agent", de: "Content-Assembly-Agent" },
  subtitle: {
    en: "InfluExAI plans your pack before any paid render.",
    de: "InfluExAI plant dein Pack vor jedem kostenpflichtigen Render.",
  },
  idleStatus: {
    en: "Ready when you share an idea",
    de: "Bereit, sobald du eine Idee teilst",
  },
  planningStatus: {
    en: "Building your free preview plan…",
    de: "Kostenloser Vorschau-Plan wird erstellt…",
  },
  previewStatus: {
    en: "Preview plan ready — no credits used",
    de: "Vorschau-Plan bereit — keine Credits verbraucht",
  },
  renderingStatus: {
    en: "Assembling your social asset pack…",
    de: "Social Asset Pack wird zusammengestellt…",
  },
  completeStatus: {
    en: "Pack assembly complete",
    de: "Pack-Zusammenstellung abgeschlossen",
  },
  progressDefault: {
    en: "Assembly progress",
    de: "Fortschritt der Zusammenstellung",
  },
} as const;

export function agentStepIndex(stepId: PackAssemblyStepId): number {
  return PACK_ASSEMBLY_STEPS.indexOf(stepId);
}

export function resolveAgentWorkflowStatus(
  mode: AgentWorkflowMode,
  language: "en" | "de"
): string {
  const isDe = language === "de";
  switch (mode) {
    case "idle":
      return isDe
        ? AGENT_WORKFLOW_COPY.idleStatus.de
        : AGENT_WORKFLOW_COPY.idleStatus.en;
    case "planning":
      return isDe
        ? AGENT_WORKFLOW_COPY.planningStatus.de
        : AGENT_WORKFLOW_COPY.planningStatus.en;
    case "preview":
      return isDe
        ? AGENT_WORKFLOW_COPY.previewStatus.de
        : AGENT_WORKFLOW_COPY.previewStatus.en;
    case "rendering":
      return isDe
        ? AGENT_WORKFLOW_COPY.renderingStatus.de
        : AGENT_WORKFLOW_COPY.renderingStatus.en;
    case "complete":
    case "demo":
      return isDe
        ? AGENT_WORKFLOW_COPY.completeStatus.de
        : AGENT_WORKFLOW_COPY.completeStatus.en;
    default:
      return isDe
        ? AGENT_WORKFLOW_COPY.idleStatus.de
        : AGENT_WORKFLOW_COPY.idleStatus.en;
  }
}

export type AgentStepVisualState = "hidden" | "pending" | "active" | "complete";

export function resolveAgentStepVisualState(
  stepIndex: number,
  activeIndex: number,
  revealedMaxIndex: number,
  mode: AgentWorkflowMode,
  progress = 0
): AgentStepVisualState {
  if (stepIndex > revealedMaxIndex) return "hidden";

  if (mode === "complete" || ((mode === "preview" || mode === "demo") && progress >= 100)) {
    return "complete";
  }

  if (mode === "idle") {
    return stepIndex === 0 ? "pending" : "hidden";
  }

  if (stepIndex < activeIndex) return "complete";
  if (stepIndex === activeIndex) return "active";
  return "pending";
}

/** Map pack showcase modes to agent workflow modes. */
export function packShowcaseModeToAgentMode(
  mode: "demo" | "preview" | "rendering" | "result"
): AgentWorkflowMode {
  if (mode === "demo") return "demo";
  if (mode === "preview") return "preview";
  if (mode === "rendering") return "rendering";
  return "complete";
}

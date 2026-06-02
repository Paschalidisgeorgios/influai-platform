/**
 * Social Asset Pack showcase — shared types (UI only, no provider ids).
 */

import type {
  SocialAssetPackPreviewResponse,
  SocialAssetPackRenderResponse,
} from "@/app/lib/packs/types";
import type { SocialAssetPackShowcaseCopy } from "@/app/lib/showcase/social-asset-pack-showcase-demo";

export type PackShowcaseMode = "demo" | "preview" | "rendering" | "result";

export type PackAssemblyStepId =
  | "idea"
  | "prompt_assist"
  | "images"
  | "motion"
  | "copy"
  | "score"
  | "export";

export const PACK_ASSEMBLY_STEPS: readonly PackAssemblyStepId[] = [
  "idea",
  "prompt_assist",
  "images",
  "motion",
  "copy",
  "score",
  "export",
] as const;

export type PackScoreDimension = {
  id: string;
  label: string;
  score: number;
};

export type PackShowcaseLabels = {
  ideaLabel: string;
  proofLine: string;
  outputs: SocialAssetPackShowcaseCopy["outputs"];
  variationLabels: [string, string, string];
  motionClipHint: string;
  progressLabel: string;
};

export type PackShowcaseContent = {
  title: string;
  subtitle: string;
  badgeLabel: string;
  idea: string;
  improvedPrompt?: string;
  hooks: readonly string[];
  captions: readonly string[];
  hashtags: string;
  scoreValue: number;
  scoreHint: string;
  /** Mini subscore chips — mock in demo, real when available after render. */
  scoreDimensions?: readonly PackScoreDimension[];
  weakestDimensionId?: string;
  /** Preview estimate before render completes. */
  scorePreview?: boolean;
  formatSuggestions?: readonly string[];
  estimatedCredits?: number;
  labels: PackShowcaseLabels;
};

export type PackShowcaseAssets = {
  /** Up to 3 image URLs; omit or null slots for text-only preview placeholders. */
  imageUrls?: readonly (string | null)[];
  videoUrl?: string | null;
  showMotionPlaceholder?: boolean;
};

export type PackShowcaseData = PackShowcaseContent & PackShowcaseAssets;

export type SocialAssetPackShowcaseProps = {
  language?: "en" | "de";
  className?: string;
  /** When true, workflow UI is rendered by a parent AgentWorkflowPanel (dashboard agent shell). */
  hideWorkflow?: boolean;
  /** Landing CTA target */
  studioHref?: string;
  onPrimaryAction?: () => void;
  primaryCtaLabel?: string;
  renderCtaLabel?: string;
  onRender?: () => void;
  renderDisabled?: boolean;
  /** Active assembly step (rendering mode) */
  activeStep?: PackAssemblyStepId;
  /** Demo auto-reveal progress 0–100 */
  assemblyProgress?: number;
  /** Product theatre layout — taller shell with amber emphasis */
  theatreLayout?: boolean;
};

export type DemoShowcaseProps = SocialAssetPackShowcaseProps & {
  mode: "demo";
  /** Landing theatre — sync sidebar narrative when assembly step advances */
  onDemoAssemblyStepChange?: (step: PackAssemblyStepId) => void;
};

export type PreviewShowcaseProps = SocialAssetPackShowcaseProps & {
  mode: "preview";
  preview: SocialAssetPackPreviewResponse;
  prompt: string;
};

export type RenderingShowcaseProps = SocialAssetPackShowcaseProps & {
  mode: "rendering";
  prompt: string;
  improvedPrompt?: string;
  activeStep: PackAssemblyStepId;
};

export type ResultShowcaseProps = SocialAssetPackShowcaseProps & {
  mode: "result";
  result: SocialAssetPackRenderResponse;
};

export type PackShowcaseProps =
  | DemoShowcaseProps
  | PreviewShowcaseProps
  | RenderingShowcaseProps
  | ResultShowcaseProps;

export function stepIndex(step: PackAssemblyStepId): number {
  return PACK_ASSEMBLY_STEPS.indexOf(step);
}

export function isStepComplete(
  step: PackAssemblyStepId,
  activeStep: PackAssemblyStepId,
  mode: PackShowcaseMode
): boolean {
  if (mode === "demo" || mode === "result") {
    return stepIndex(step) <= stepIndex(activeStep);
  }
  if (mode === "preview") {
    return true;
  }
  return stepIndex(step) < stepIndex(activeStep);
}

export function isStepActive(
  step: PackAssemblyStepId,
  activeStep: PackAssemblyStepId
): boolean {
  return step === activeStep;
}

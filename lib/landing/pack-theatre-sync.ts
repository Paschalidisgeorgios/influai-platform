import type { PackAssemblyStepId } from "@/app/components/pack/pack-showcase-types";
import type { NarrativeStepId } from "@/lib/landing/motion-narrative-content";

/** Maps pack assembly demo steps → landing narrative sidebar steps. */
export function packAssemblyToNarrativeStep(
  step: PackAssemblyStepId
): NarrativeStepId {
  switch (step) {
    case "idea":
      return "idea";
    case "prompt_assist":
      return "prompt_assist";
    case "images":
    case "motion":
    case "copy":
      return "asset_plan";
    case "score":
      return "creative_score";
    case "export":
      return "export";
    default:
      return "idea";
  }
}

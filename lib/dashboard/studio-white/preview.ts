import type { WorkspacePreviewState } from "@/app/dashboard/hooks/useWorkspaceGeneration";
import type { CreatorCanvasAsset } from "@/app/components/studio/canvas-types";

export function mediaFromPreview(state: WorkspacePreviewState): {
  src: string | null;
  kind: "image" | "video";
} {
  if (state.status !== "success" || !state.result) {
    return { src: null, kind: "image" };
  }
  if (state.result.type === "video") {
    return { src: state.result.url, kind: "video" };
  }
  if (state.result.type === "image") {
    return { src: state.result.url, kind: "image" };
  }
  return { src: null, kind: "image" };
}

export function canvasAssetFromPreview(
  state: WorkspacePreviewState,
  sourceStudio: "image" | "video",
  extras?: { modelModeId?: string; creditsUsed?: number }
): CreatorCanvasAsset | null {
  if (state.status !== "success" || !state.result) return null;
  if (state.result.type === "image") {
    return {
      url: state.result.url,
      outputType: "image",
      prompt: state.result.prompt,
      createdAt: new Date().toISOString(),
      generationId: state.result.generationId,
      sourceStudio,
      modelModeId: extras?.modelModeId ?? state.result.model,
      creditsUsed: extras?.creditsUsed ?? state.result.credits,
    };
  }
  if (state.result.type === "video") {
    return {
      url: state.result.url,
      outputType: "video",
      prompt: state.result.prompt,
      createdAt: new Date().toISOString(),
      sourceStudio,
      modelModeId: extras?.modelModeId,
      creditsUsed: extras?.creditsUsed ?? state.result.credits,
    };
  }
  return null;
}

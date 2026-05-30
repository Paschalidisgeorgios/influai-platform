import type { WorkspacePreviewState } from "@/app/dashboard/hooks/useWorkspaceGeneration";

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

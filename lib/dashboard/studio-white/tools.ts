export type StudioTool =
  | "home"
  | "moodboards"
  | "train-lora"
  | "node-editor"
  | "assets"
  | "image"
  | "video"
  | "enhancer"
  | "realtime"
  | "canvas-edit"
  | "lipsync"
  | "motion"
  | "3d";

export function resolveStudioToolFromPath(pathname: string): StudioTool {
  if (pathname.startsWith("/dashboard/image")) return "image";
  if (pathname.startsWith("/dashboard/video")) return "video";
  if (pathname.startsWith("/dashboard/lipsync")) return "lipsync";
  if (pathname.startsWith("/dashboard/motion-transfer")) return "motion";
  if (pathname.startsWith("/dashboard/enhancer")) return "enhancer";
  if (pathname.startsWith("/dashboard/realtime")) return "realtime";
  if (pathname.startsWith("/dashboard/edit")) return "canvas-edit";
  if (pathname.startsWith("/dashboard/3d")) return "3d";
  if (pathname.startsWith("/dashboard/moodboards")) return "moodboards";
  if (pathname.startsWith("/dashboard/train")) return "train-lora";
  if (pathname.startsWith("/dashboard/nodes")) return "node-editor";
  if (pathname.startsWith("/dashboard/assets")) return "assets";
  if (pathname.startsWith("/dashboard/credits")) return "home";
  return "home";
}

export function studioToolHref(tool: StudioTool): string {
  switch (tool) {
    case "image":
      return "/dashboard/image";
    case "video":
      return "/dashboard/video";
    case "lipsync":
      return "/dashboard/lipsync";
    case "motion":
      return "/dashboard/motion-transfer";
    case "enhancer":
      return "/dashboard/enhancer";
    case "realtime":
      return "/dashboard/realtime";
    case "canvas-edit":
      return "/dashboard/edit";
    case "3d":
      return "/dashboard/3d";
    case "moodboards":
      return "/dashboard/moodboards";
    case "train-lora":
      return "/dashboard/train";
    case "node-editor":
      return "/dashboard/nodes";
    case "assets":
      return "/dashboard/assets";
    default:
      return "/dashboard";
  }
}

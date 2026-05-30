import { isKreaEnabled } from "@/lib/providers/krea-workflows";

export type StudioModeProviderName = "krea" | "disabled";

export function resolveStudioModeProvider(_mode: string): StudioModeProviderName {
  return isKreaEnabled() ? "krea" : "disabled";
}

export function resolvePublicStudioProvider(
  _imageMode: string,
  _studioTab?: string
): StudioModeProviderName {
  return isKreaEnabled() ? "krea" : "disabled";
}

export function resolveWorkflowForImageMode(imageMode: string): string {
  return imageMode.trim().toLowerCase() || "standard";
}

export function formatStudioProviderDebugLine(
  imageMode: string,
  studioTab?: string
): string {
  const provider = resolvePublicStudioProvider(imageMode, studioTab);
  const workflow = resolveWorkflowForImageMode(imageMode);
  return `provider=${provider} workflow=${workflow}`;
}

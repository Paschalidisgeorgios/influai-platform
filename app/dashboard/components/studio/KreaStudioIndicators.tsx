"use client";

import {
  formatStudioProviderDebugLine,
  resolvePublicStudioProvider,
  resolveWorkflowForImageMode,
} from "@/lib/launch/studio-mode-provider";
import { publicLaunchFlags } from "@/lib/launch/public-flags";

type KreaPoweredBadgeProps = {
  label?: string;
  className?: string;
};

export function KreaPoweredBadge({
  label = "Powered by Krea AI",
  className = "",
}: KreaPoweredBadgeProps) {
  if (!publicLaunchFlags.kreaProvider) return null;

  return (
    <span
      className={`inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 ${className}`}
    >
      {label}
    </span>
  );
}

type StudioProviderDebugLineProps = {
  imageMode: string;
  studioTab?: "image" | "video" | "creator_video" | "lip_sync" | "talking_creator";
};

export function StudioProviderDebugLine({
  imageMode,
  studioTab = "image",
}: StudioProviderDebugLineProps) {
  if (process.env.NODE_ENV !== "development") return null;

  const workflow =
    studioTab === "video"
      ? "video_image_to_video"
      : resolveWorkflowForImageMode(imageMode);
  const provider = resolvePublicStudioProvider(workflow);

  return (
    <p className="mt-1 font-mono text-[10px] text-slate-400">
      {formatStudioProviderDebugLine(imageMode, studioTab)}
      {provider !== "krea" && publicLaunchFlags.kreaProvider ? (
        <span className="text-amber-600">
          {" "}
          · legacy flags may route this mode elsewhere
        </span>
      ) : null}
    </p>
  );
}

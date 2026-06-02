"use client";

import { useSyncExternalStore } from "react";
import { Film, Lock } from "lucide-react";
import { CREATOR_TOOL_ICONS } from "@/lib/studio/creator-tool-icons";
import {
  getDashboardHomeCreditBadge,
  isDashboardToolInteractive,
  resolveDashboardToolTrailingBadge,
  resolveDashboardToolVisualVariant,
} from "@/lib/studio/dashboard-tool-badges";
import type { CreatorToolId } from "@/app/lib/tools/creator-tools";
import type { StudioCategoryToolView } from "@/app/lib/studio/studio-categories";
import { resolveToolStatusMetadata } from "@/app/lib/tools/tool-status";
import { studioDashboardStatusBadgeClass } from "@/lib/obsidian/status-badge-classes";
import { A11Y } from "@/lib/obsidian/a11y-tokens";

function DashboardToolChipIcon({
  toolId,
  className,
}: {
  toolId: CreatorToolId;
  className?: string;
}) {
  const Icon = CREATOR_TOOL_ICONS[toolId] ?? Film;
  return <Icon className={className} aria-hidden />;
}

type Props = {
  view: StudioCategoryToolView;
  language?: "en" | "de";
  onClick: (trigger: HTMLButtonElement) => void;
};

const BUTTON_LIVE =
  "border-amber-500/35 bg-amber-500/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-amber-400/55 hover:bg-amber-500/14 hover:shadow-[0_0_22px_rgba(245,158,11,0.2),inset_0_1px_0_rgba(255,255,255,0.06)]";
const BUTTON_GLASS =
  "border-white/[0.1] bg-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:border-amber-500/35 hover:bg-white/[0.07] hover:shadow-[0_0_18px_rgba(245,158,11,0.1)]";
const BUTTON_MUTED =
  "cursor-not-allowed border-white/[0.06] bg-white/[0.02] opacity-60";

const ICON_LIVE =
  "border-amber-500/35 bg-amber-500/18 text-amber-200";
const ICON_GLASS = "border-white/[0.1] bg-white/[0.05] text-neutral-300";
const ICON_MUTED = "border-white/[0.05] bg-white/[0.02] text-neutral-600";

export default function DashboardToolChip({
  view,
  language = "en",
  onClick,
}: Props) {
  /**
   * Hydration safety: `DashboardToolHome` computes `view` during render on both
   * server and client. If any upstream status resolution differs between those
   * environments, it can produce a className mismatch at hydration time.
   *
   * Render a stable, non-interactive fallback until mounted so the first client
   * render matches the server HTML exactly.
   */
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const variant = mounted ? resolveDashboardToolVisualVariant(view) : "glass";
  const interactive = mounted ? isDashboardToolInteractive(view) : false;

  const trailing = mounted
    ? resolveDashboardToolTrailingBadge(view, language)
    : ((): { kind: "credits" | "status"; label: string } => {
        const home = getDashboardHomeCreditBadge(view.id, language);
        return { kind: home ? "credits" : "status", label: home ?? "…" };
      })();

  const meta = resolveToolStatusMetadata({
    status: view.resolved.status,
    canRun: view.canRun,
    canPreview: view.canPreview,
    canShowToUser: view.resolved.canShowToUser,
    requiresCredits: view.resolved.requiresCredits,
  });

  const showLock = mounted ? view.status === "pro_locked" : false;
  const muted = variant === "muted";
  const creditsBadge = trailing.kind === "credits";

  const buttonSurface =
    variant === "live"
      ? BUTTON_LIVE
      : variant === "glass"
        ? BUTTON_GLASS
        : BUTTON_MUTED;

  const iconSurface =
    variant === "live"
      ? ICON_LIVE
      : variant === "glass"
        ? ICON_GLASS
        : ICON_MUTED;

  const badgeClass = !mounted
    ? "rounded-md bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-bold text-neutral-300 ring-1 ring-white/[0.08]"
    : creditsBadge
    ? "rounded-md bg-amber-500/18 px-1.5 py-0.5 text-[9px] font-bold tabular-nums text-amber-100 ring-1 ring-amber-500/25"
    : `${studioDashboardStatusBadgeClass(meta.publicStatus)} !px-1.5 !py-0.5 !text-[9px]`;

  return (
    <button
      type="button"
      disabled={!interactive}
      onClick={
        interactive
          ? (event) => onClick(event.currentTarget)
          : undefined
      }
      aria-disabled={!interactive}
      aria-label={`${view.label} — ${trailing.label}`}
      className={`group mx-auto flex w-full min-w-[260px] items-center gap-2 rounded-xl border p-3 text-left transition-[border-color,background-color,box-shadow] duration-200 ${buttonSurface} ${
        interactive ? `cursor-pointer ${A11Y.focusRing}` : ""
      }`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-shadow duration-200 group-hover:shadow-[0_0_12px_rgba(245,158,11,0.12)] ${iconSurface}`}
      >
        {showLock ? (
          <Lock className="h-4 w-4" aria-hidden />
        ) : (
          <DashboardToolChipIcon toolId={view.id} className="h-4 w-4" />
        )}
      </div>

      <span
        className={`min-w-0 flex-1 text-left text-[15px] font-semibold leading-snug line-clamp-2 ${
          muted ? "text-neutral-500" : "text-white"
        }`}
      >
        {view.label}
      </span>

      <span className={`${badgeClass} shrink-0 self-center whitespace-nowrap`}>
        {showLock && !creditsBadge ? (
          <Lock className="mr-0.5 inline h-2.5 w-2.5" aria-hidden />
        ) : null}
        {trailing.label}
      </span>
    </button>
  );
}

"use client";

import {
  Clapperboard,
  Film,
  ImageIcon,
  Mic2,
  Palette,
  PenLine,
  Sparkles,
  Stamp,
  Video,
  Wand2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useDashboardLanguage } from "../DashboardLanguageProvider";

type StudioTab = "image" | "video" | "creator_video" | "lip_sync" | "talking_creator";

type ToolRailItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  status: "live" | "beta" | "comingSoon" | "planned";
  tab?: StudioTab;
  disabled?: boolean;
  tooltip?: string;
};

type DashboardSidebarToolsProps = {
  videoStudioEnabled: boolean;
  lipSyncEnabled: boolean;
  creatorVideoEnabled: boolean;
  talkingCreatorEnabled: boolean;
  onOpenAgent: (tab: StudioTab) => void;
  onOpenView: (view: "tools" | "characters" | "gallery") => void;
};

function statusBadgeClass(status: ToolRailItem["status"]) {
  if (status === "live") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
  }
  if (status === "beta") {
    return "border-violet-500/30 bg-violet-500/10 text-violet-100";
  }
  if (status === "comingSoon") {
    return "border-amber-500/25 bg-amber-500/10 text-amber-100";
  }
  return "border-white/10 bg-white/[0.04] text-white/40";
}

export default function DashboardSidebarTools({
  videoStudioEnabled,
  lipSyncEnabled,
  creatorVideoEnabled,
  talkingCreatorEnabled,
  onOpenAgent,
  onOpenView,
}: DashboardSidebarToolsProps) {
  const { copy } = useDashboardLanguage();
  const t = copy.sidebar.toolRail;
  const statusLabels = copy.sidebar.toolRailStatuses;

  const studioTools: ToolRailItem[] = [
    {
      id: "image-studio",
      label: t.imageStudio,
      icon: ImageIcon,
      status: "live",
      tab: "image",
      tooltip: t.imageStudioTip,
    },
    {
      id: "video-studio",
      label: t.videoStudio,
      icon: Film,
      status: videoStudioEnabled ? "beta" : "comingSoon",
      tab: "video",
      disabled: !videoStudioEnabled,
      tooltip: t.videoStudioTip,
    },
    {
      id: "lip-sync",
      label: t.lipSync,
      icon: Mic2,
      status: lipSyncEnabled ? "beta" : "comingSoon",
      tab: "lip_sync",
      disabled: !lipSyncEnabled,
      tooltip: t.lipSyncTip,
    },
    {
      id: "creator-video",
      label: t.creatorVideo,
      icon: Video,
      status: creatorVideoEnabled ? "beta" : "comingSoon",
      tab: "creator_video",
      disabled: !creatorVideoEnabled,
      tooltip: t.creatorVideoTip,
    },
    {
      id: "talking-creator",
      label: t.talkingCreator,
      icon: Sparkles,
      status: talkingCreatorEnabled ? "beta" : "comingSoon",
      tab: "talking_creator",
      disabled: !talkingCreatorEnabled,
      tooltip: t.talkingCreatorTip,
    },
    {
      id: "motion-transfer",
      label: t.motionTransfer,
      icon: Wand2,
      status: "comingSoon",
      disabled: true,
      tooltip: t.motionTransferTip,
    },
    {
      id: "brand-assets",
      label: t.brandAssets,
      icon: Palette,
      status: "live",
      tab: "image",
      tooltip: t.brandAssetsTip,
    },
    {
      id: "reference-edit",
      label: t.referenceEdit,
      icon: PenLine,
      status: "live",
      tab: "image",
      tooltip: t.referenceEditTip,
    },
  ];

  const plannedTools: ToolRailItem[] = [
    {
      id: "cinema-agent",
      label: t.cinemaAgent,
      icon: Clapperboard,
      status: "planned",
      disabled: true,
      tooltip: t.cinemaAgentTip,
    },
    {
      id: "omni-agent",
      label: t.omniAgent,
      icon: Sparkles,
      status: "planned",
      disabled: true,
      tooltip: t.omniAgentTip,
    },
    {
      id: "social-planner",
      label: t.socialPlanner,
      icon: Stamp,
      status: "planned",
      disabled: true,
      tooltip: t.socialPlannerTip,
    },
    {
      id: "compliance",
      label: t.compliance,
      icon: Stamp,
      status: "planned",
      disabled: true,
      tooltip: t.complianceTip,
    },
    {
      id: "watermark",
      label: t.watermark,
      icon: Stamp,
      status: "planned",
      disabled: true,
      tooltip: t.watermarkTip,
    },
  ];

  function handleClick(item: ToolRailItem) {
    if (item.disabled || !item.tab) return;
    onOpenAgent(item.tab);
  }

  function renderItem(item: ToolRailItem) {
    const Icon = item.icon;
    const statusLabel =
      item.status === "live"
        ? statusLabels.live
        : item.status === "beta"
          ? statusLabels.beta
          : item.status === "comingSoon"
            ? statusLabels.comingSoon
            : statusLabels.planned;

    return (
      <button
        key={item.id}
        type="button"
        title={item.tooltip}
        disabled={item.disabled}
        onClick={() => handleClick(item)}
        className="group flex w-full items-center gap-2.5 rounded-xl border border-transparent px-2 py-2 text-left transition hover:border-white/10 hover:bg-white/[0.045] disabled:cursor-not-allowed disabled:opacity-45"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-white/65 group-hover:bg-white/[0.08] group-hover:text-white">
          <Icon className="h-3.5 w-3.5" />
        </div>
        <span className="min-w-0 flex-1 truncate text-xs font-semibold text-white/75 group-hover:text-white">
          {item.label}
        </span>
        <span
          className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.08em] ${statusBadgeClass(item.status)}`}
        >
          {statusLabel}
        </span>
      </button>
    );
  }

  return (
    <div className="mt-6 space-y-5">
      <div>
        <p className="mb-2 px-2 text-[10px] font-black uppercase tracking-[0.28em] text-white/25">
          {t.sectionTitle}
        </p>
        <div className="space-y-0.5">{studioTools.map(renderItem)}</div>
      </div>

      <div>
        <p className="mb-2 px-2 text-[10px] font-black uppercase tracking-[0.28em] text-white/25">
          {t.plannedSectionTitle}
        </p>
        <div className="space-y-0.5">{plannedTools.map(renderItem)}</div>
      </div>
    </div>
  );
}

"use client";

import {
  Clapperboard,
  CreditCard,
  Film,
  GalleryVerticalEnd,
  Home,
  ImageIcon,
  LayoutGrid,
  Mic2,
  Sparkles,
  Stamp,
  UserRound,
  Video,
  Wand2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useDashboardLanguage } from "../DashboardLanguageProvider";

export type ToolRailView =
  | "home"
  | "image_studio"
  | "video_studio"
  | "lip_sync"
  | "creator_video"
  | "talking_creator"
  | "motion_transfer"
  | "gallery"
  | "style_profiles"
  | "credits"
  | "tools";

type RailItem = {
  id: ToolRailView;
  label: string;
  icon: LucideIcon;
  disabled?: boolean;
  status?: "live" | "beta" | "comingSoon" | "planned";
};

type DashboardToolRailProps = {
  activeView: ToolRailView;
  videoStudioEnabled: boolean;
  lipSyncEnabled: boolean;
  creatorVideoEnabled: boolean;
  talkingCreatorEnabled: boolean;
  onNavigate: (view: ToolRailView) => void;
};

function statusBadge(status: RailItem["status"], labels: Record<string, string>) {
  if (!status || status === "live") {
    return { text: labels.live, className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" };
  }
  if (status === "beta") {
    return { text: labels.beta, className: "border-violet-500/30 bg-violet-500/10 text-violet-100" };
  }
  if (status === "comingSoon") {
    return { text: labels.comingSoon, className: "border-amber-500/25 bg-amber-500/10 text-amber-100" };
  }
  return { text: labels.planned, className: "border-white/10 bg-white/[0.04] text-white/40" };
}

export default function DashboardToolRail({
  activeView,
  videoStudioEnabled,
  lipSyncEnabled,
  creatorVideoEnabled,
  talkingCreatorEnabled,
  onNavigate,
}: DashboardToolRailProps) {
  const { copy } = useDashboardLanguage();
  const t = copy.toolRail;
  const statuses = copy.workspaces.statuses;

  const mainItems: RailItem[] = [
    { id: "home", label: t.home, icon: Home, status: "live" },
    { id: "image_studio", label: t.imageStudio, icon: ImageIcon, status: "live" },
    {
      id: "video_studio",
      label: t.videoStudio,
      icon: Film,
      status: videoStudioEnabled ? "beta" : "comingSoon",
      disabled: !videoStudioEnabled,
    },
    {
      id: "lip_sync",
      label: t.lipSync,
      icon: Mic2,
      status: lipSyncEnabled ? "beta" : "comingSoon",
      disabled: !lipSyncEnabled,
    },
    {
      id: "creator_video",
      label: t.creatorVideo,
      icon: Video,
      status: creatorVideoEnabled ? "beta" : "comingSoon",
      disabled: !creatorVideoEnabled,
    },
    {
      id: "talking_creator",
      label: t.talkingCreator,
      icon: Sparkles,
      status: talkingCreatorEnabled ? "beta" : "comingSoon",
      disabled: !talkingCreatorEnabled,
    },
    {
      id: "motion_transfer",
      label: t.motionTransfer,
      icon: Wand2,
      status: "comingSoon",
      disabled: true,
    },
    { id: "gallery", label: t.gallery, icon: GalleryVerticalEnd, status: "live" },
    { id: "style_profiles", label: t.styleProfiles, icon: UserRound, status: "live" },
    { id: "credits", label: t.credits, icon: CreditCard, status: "live" },
    { id: "tools", label: t.toolsOverview, icon: LayoutGrid, status: "live" },
  ];

  const plannedItems: RailItem[] = [
    { id: "tools", label: t.cinemaAgent, icon: Clapperboard, status: "planned", disabled: true },
    { id: "tools", label: t.omniAgent, icon: Sparkles, status: "planned", disabled: true },
    { id: "tools", label: t.socialPlanner, icon: Stamp, status: "planned", disabled: true },
    { id: "tools", label: t.compliance, icon: Stamp, status: "planned", disabled: true },
    { id: "tools", label: t.watermark, icon: Stamp, status: "planned", disabled: true },
  ];

  function renderItem(item: RailItem) {
    const Icon = item.icon;
    const active = activeView === item.id;
    const badge = statusBadge(item.status, statuses);

    return (
      <button
        key={`${item.id}-${item.label}`}
        type="button"
        disabled={item.disabled}
        onClick={() => {
          if (!item.disabled) onNavigate(item.id);
        }}
        className={`group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left transition disabled:cursor-not-allowed disabled:opacity-45 ${
          active
            ? "border border-[#d8ad5f]/30 bg-[#d8ad5f]/12 text-white"
            : "border border-transparent text-white/65 hover:border-white/10 hover:bg-white/[0.05] hover:text-white"
        }`}
      >
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            active ? "bg-[#d8ad5f] text-black" : "bg-white/[0.06] text-white/70"
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold">{item.label}</span>
        {item.status && item.status !== "live" ? (
          <span
            className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[7px] font-black uppercase tracking-[0.06em] ${badge.className}`}
          >
            {badge.text}
          </span>
        ) : null}
      </button>
    );
  }

  return (
    <nav className="space-y-5">
      <div className="space-y-0.5">{mainItems.map(renderItem)}</div>
      <div>
        <p className="mb-2 px-2.5 text-[9px] font-black uppercase tracking-[0.24em] text-white/25">
          {t.plannedSection}
        </p>
        <div className="space-y-0.5">{plannedItems.map(renderItem)}</div>
      </div>
    </nav>
  );
}

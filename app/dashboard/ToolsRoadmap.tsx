"use client";

import {
  BadgeCheck,
  CalendarDays,
  Clapperboard,
  Film,
  ImageIcon,
  Mic2,
  ShieldCheck,
  Sparkles,
  Stamp,
  Wand2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { DashboardCopy } from "./i18n";

export type ToolCardStatus = "live" | "beta" | "comingSoon" | "planned";

type ToolsRoadmapProps = {
  copy: DashboardCopy;
  videoStudioEnabled: boolean;
  onOpenAgent: () => void;
};

type ToolCardConfig = {
  id: string;
  icon: LucideIcon;
  title: string;
  benefit: string;
  status: ToolCardStatus;
  modeLabels?: string[];
  openInAgent?: boolean;
};

function getStatusBadgeClass(status: ToolCardStatus) {
  if (status === "live") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
  }
  if (status === "beta") {
    return "border-violet-500/30 bg-violet-500/10 text-violet-100";
  }
  if (status === "comingSoon") {
    return "border-amber-500/25 bg-amber-500/10 text-amber-100";
  }
  return "border-white/10 bg-white/[0.04] text-white/45";
}

function getCardShellClass(status: ToolCardStatus, interactive: boolean) {
  if (interactive) {
    return "border-white/12 bg-white/[0.05] hover:border-[#d8ad5f]/35 hover:bg-white/[0.07]";
  }
  if (status === "live" || status === "beta") {
    return "border-white/10 bg-white/[0.04]";
  }
  return "border-white/[0.06] bg-white/[0.02] opacity-80";
}

export default function ToolsRoadmap({
  copy,
  videoStudioEnabled,
  onOpenAgent,
}: ToolsRoadmapProps) {
  const t = copy.toolsPage;
  const statusLabels = t.statuses;

  const cards: ToolCardConfig[] = [
    {
      id: "image-studio",
      icon: ImageIcon,
      title: t.cards.imageStudio.title,
      benefit: t.cards.imageStudio.benefit,
      status: "live",
      modeLabels: [
        t.imageModes.standard,
        t.imageModes.fastDraft,
        t.imageModes.ugcLook,
        t.imageModes.premium,
        t.imageModes.brandAssets,
        t.imageModes.referenceEdit,
      ],
      openInAgent: true,
    },
    {
      id: "video-studio",
      icon: Film,
      title: t.cards.videoStudio.title,
      benefit: t.cards.videoStudio.benefit,
      status: videoStudioEnabled ? "beta" : "comingSoon",
      openInAgent: videoStudioEnabled,
    },
    {
      id: "lip-sync",
      icon: Mic2,
      title: t.cards.lipSync.title,
      benefit: t.cards.lipSync.benefit,
      status: "planned",
    },
    {
      id: "cinema-agent",
      icon: Clapperboard,
      title: t.cards.cinemaAgent.title,
      benefit: t.cards.cinemaAgent.benefit,
      status: "planned",
    },
    {
      id: "omni-campaign",
      icon: Wand2,
      title: t.cards.omniCampaign.title,
      benefit: t.cards.omniCampaign.benefit,
      status: "planned",
    },
    {
      id: "social-planner",
      icon: CalendarDays,
      title: t.cards.socialPlanner.title,
      benefit: t.cards.socialPlanner.benefit,
      status: "planned",
    },
    {
      id: "compliance",
      icon: ShieldCheck,
      title: t.cards.compliance.title,
      benefit: t.cards.compliance.benefit,
      status: "planned",
    },
    {
      id: "watermarked-promo",
      icon: Stamp,
      title: t.cards.watermarkedPromo.title,
      benefit: t.cards.watermarkedPromo.benefit,
      status: "planned",
    },
  ];

  function getStatusLabel(status: ToolCardStatus) {
    if (status === "live") return statusLabels.live;
    if (status === "beta") return statusLabels.beta;
    if (status === "comingSoon") return statusLabels.comingSoon;
    return statusLabels.planned;
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        const statusLabel = getStatusLabel(card.status);
        const isDisabled = card.status === "planned" || card.status === "comingSoon";
        const showOpenButton = Boolean(card.openInAgent);

        return (
          <article
            key={card.id}
            className={`flex h-full flex-col rounded-[1.25rem] border p-4 transition ${getCardShellClass(
              card.status,
              showOpenButton
            )}`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  isDisabled
                    ? "bg-white/[0.04] text-white/35"
                    : "bg-[#d8ad5f]/15 text-[#d8ad5f]"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3
                    className={`text-sm font-black tracking-tight ${
                      isDisabled ? "text-white/55" : "text-white"
                    }`}
                  >
                    {card.title}
                  </h3>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.1em] ${getStatusBadgeClass(
                      card.status
                    )}`}
                  >
                    {statusLabel}
                  </span>
                </div>

                <p
                  className={`mt-1.5 text-xs leading-5 ${
                    isDisabled ? "text-white/30" : "text-white/45"
                  }`}
                >
                  {card.benefit}
                </p>
              </div>
            </div>

            {card.modeLabels && card.modeLabels.length > 0 ? (
              <div className="mt-3 border-t border-white/[0.06] pt-3">
                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/25">
                  {t.includedModes}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {card.modeLabels.map((mode) => (
                    <span
                      key={mode}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-white/55"
                    >
                      {mode}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {showOpenButton ? (
              <button
                type="button"
                onClick={onOpenAgent}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#d8ad5f]/30 bg-[#d8ad5f]/10 px-3 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-[#f0d7a8] transition hover:border-[#d8ad5f]/50 hover:bg-[#d8ad5f]/15"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {t.openInAgent}
              </button>
            ) : (
              <div className="mt-4 flex items-center gap-2 text-[10px] font-semibold text-white/25">
                <BadgeCheck className="h-3.5 w-3.5 shrink-0 opacity-50" />
                {t.roadmapOnly}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

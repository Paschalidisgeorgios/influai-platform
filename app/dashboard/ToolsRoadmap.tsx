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
  creatorVideoEnabled: boolean;
  lipSyncEnabled: boolean;
  talkingCreatorEnabled?: boolean;
  onOpenImageStudio: () => void;
  onOpenVideoStudio: () => void;
  onOpenLipSync: () => void;
  onOpenCreatorVideo: () => void;
  onOpenTalkingCreator: () => void;
  onOpenGallery: () => void;
  onOpenStyleProfiles: () => void;
  onOpenCredits: () => void;
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
    return "border-green-100 bg-green-50 text-green-700";
  }
  if (status === "beta") {
    return "border-amber-100 bg-amber-50 text-amber-700";
  }
  if (status === "comingSoon") {
    return "border-slate-200 bg-slate-100 text-slate-600";
  }
  return "border-slate-200 bg-slate-100 text-slate-600";
}

export default function ToolsRoadmap({
  copy,
  videoStudioEnabled,
  creatorVideoEnabled,
  lipSyncEnabled,
  talkingCreatorEnabled = false,
  onOpenImageStudio,
  onOpenVideoStudio,
  onOpenLipSync,
  onOpenCreatorVideo,
  onOpenTalkingCreator,
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
      id: "creator-video",
      icon: Film,
      title: t.cards.creatorVideo.title,
      benefit: t.cards.creatorVideo.benefit,
      status: creatorVideoEnabled ? "beta" : "comingSoon",
      openInAgent: creatorVideoEnabled,
    },
    {
      id: "lip-sync",
      icon: Mic2,
      title: t.cards.lipSync.title,
      benefit: t.cards.lipSync.benefit,
      status: lipSyncEnabled ? "beta" : "comingSoon",
      openInAgent: lipSyncEnabled,
    },
    {
      id: "talking-creator",
      icon: Mic2,
      title: t.cards.talkingCreator.title,
      benefit: t.cards.talkingCreator.benefit,
      status: talkingCreatorEnabled ? "beta" : "comingSoon",
      openInAgent: talkingCreatorEnabled,
    },
    {
      id: "motion-transfer",
      icon: Film,
      title: "Motion Transfer",
      benefit: "Animate a creator image using a driving video.",
      status: "comingSoon",
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        const statusLabel = getStatusLabel(card.status);
        const isPlanned = card.status === "planned";
        const isComingSoon = card.status === "comingSoon";
        const showOpenButton = Boolean(card.openInAgent);

        return (
          <article
            key={card.id}
            className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <Icon className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-800">{card.title}</h3>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide ${getStatusBadgeClass(
                      card.status
                    )}`}
                  >
                    {statusLabel}
                  </span>
                </div>

                <p className="mt-1.5 text-xs leading-5 text-slate-600">{card.benefit}</p>
              </div>
            </div>

            {card.modeLabels && card.modeLabels.length > 0 ? (
              <div className="mt-3 border-t border-gray-100 pt-3">
                <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">
                  {t.includedModes}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {card.modeLabels.map((mode) => (
                    <span
                      key={mode}
                      className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-slate-600"
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
                onClick={() => {
                  if (card.id === "image-studio") onOpenImageStudio();
                  else if (card.id === "video-studio") onOpenVideoStudio();
                  else if (card.id === "lip-sync") onOpenLipSync();
                  else if (card.id === "creator-video") onOpenCreatorVideo();
                  else if (card.id === "talking-creator") onOpenTalkingCreator();
                }}
                className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-orange-600"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {t.openInAgent}
              </button>
            ) : (
              <div className="mt-4 flex items-center gap-2 text-[10px] font-medium text-slate-500">
                <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                {isPlanned || isComingSoon ? t.roadmapOnly : t.roadmapOnly}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

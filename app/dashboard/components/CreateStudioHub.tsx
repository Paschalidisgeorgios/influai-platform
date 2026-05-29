"use client";

import { Film, ImageIcon, Mic2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  resolveCreateStudioTab,
  type CreateStudioTab,
} from "@/lib/launch/public-flags";
import StudioWorkspaceView from "./StudioWorkspaceView";
import { useDashboardLanguage } from "../DashboardLanguageProvider";
import { publicLaunchFlags } from "@/lib/launch/public-flags";

export type { CreateStudioTab };

type RegenerateDraft = {
  prompt: string;
  characterId: string | null;
  source?: "gallery" | "campaign_planner";
  loadedAt?: number;
};

type CreateStudioHubProps = {
  initialTab?: CreateStudioTab;
  videoStudioEnabled: boolean;
  lipSyncEnabled: boolean;
  charactersRefreshKey?: number;
  regenerateDraft?: RegenerateDraft | null;
  onClearRegenerateDraft?: () => void;
  onGenerationQueued?: () => void;
  onOpenGallery?: () => void;
  onOpenCredits?: () => void;
};

export default function CreateStudioHub({
  initialTab = "image",
  videoStudioEnabled,
  lipSyncEnabled,
  charactersRefreshKey = 0,
  regenerateDraft = null,
  onClearRegenerateDraft,
  onGenerationQueued,
  onOpenGallery,
  onOpenCredits,
}: CreateStudioHubProps) {
  const { copy } = useDashboardLanguage();
  const t = copy.dashboardNav.createStudio;
  const resolvedInitialTab = useMemo(
    () =>
      resolveCreateStudioTab(initialTab, {
        videoStudioEnabled,
        lipSyncEnabled,
      }),
    [initialTab, videoStudioEnabled, lipSyncEnabled]
  );
  const [tab, setTab] = useState<CreateStudioTab>(resolvedInitialTab);

  useEffect(() => {
    setTab(resolvedInitialTab);
  }, [resolvedInitialTab]);

  useEffect(() => {
    const safeTab = resolveCreateStudioTab(tab, {
      videoStudioEnabled,
      lipSyncEnabled,
    });
    if (safeTab !== tab) {
      setTab(safeTab);
    }
  }, [tab, videoStudioEnabled, lipSyncEnabled]);

  const tabs: {
    id: CreateStudioTab;
    label: string;
    icon: typeof ImageIcon;
    disabled?: boolean;
  }[] = [
    { id: "image", label: t.tabImage, icon: ImageIcon },
    {
      id: "video",
      label: t.tabVideo,
      icon: Film,
      disabled: !videoStudioEnabled,
    },
    {
      id: "lip_sync",
      label: t.tabLipSync,
      icon: Mic2,
      disabled: !lipSyncEnabled,
    },
  ];

  const studioProps = {
    charactersRefreshKey,
    regenerateDraft,
    onClearRegenerateDraft,
    onGenerationQueued,
    onOpenGallery,
    onOpenCredits,
  };

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-6">
      <div className="shrink-0 rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm sm:px-6">
        <h2 className="text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">
          {t.workspaceTitle}
        </h2>
        <p className="mt-1 text-sm font-medium text-slate-600">{t.workspaceSubline}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {tabs.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                disabled={item.disabled}
                onClick={() => setTab(item.id)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
                  active
                    ? "bg-orange-500 text-white shadow-sm"
                    : "border border-gray-200 bg-white text-slate-600 hover:border-gray-300 hover:shadow-sm"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-w-0 flex-1 overflow-visible pb-2">
        <div className="w-full min-w-0 space-y-6">
          <StudioWorkspaceView workspace={tab} {...studioProps} />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useMemo } from "react";
import { Film, ImageIcon, Mic2, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useDashboardLanguage } from "../DashboardLanguageProvider";
import type { CreateStudioTab } from "./CreateStudioHub";

type HomeAsset = {
  id: string;
  prompt: string;
  image_url: string | null;
  video_url: string | null;
  is_favorite: boolean;
  created_at: string;
};

type StudioCard = {
  id: CreateStudioTab;
  title: string;
  body: string;
  status: "live" | "beta" | "comingSoon";
  icon: LucideIcon;
  disabled?: boolean;
};

type CreatorHubHomeProps = {
  loading: boolean;
  recentAssets: HomeAsset[];
  searchQuery?: string;
  videoStudioEnabled: boolean;
  lipSyncEnabled: boolean;
  onOpenStudio: (tab: CreateStudioTab) => void;
  onQuickAction: (action: "template" | "gallery" | "style" | "credits") => void;
  onRegenerate: (prompt: string) => void;
};

function statusBadgeClass(status: StudioCard["status"]) {
  if (status === "live") {
    return "border-green-100 bg-green-50 text-green-700";
  }
  if (status === "beta") {
    return "border-amber-100 bg-amber-50 text-amber-700";
  }
  return "border-gray-200 bg-gray-50 text-slate-500";
}

export default function CreatorHubHome({
  loading,
  recentAssets,
  searchQuery = "",
  videoStudioEnabled,
  lipSyncEnabled,
  onOpenStudio,
  onQuickAction,
  onRegenerate,
}: CreatorHubHomeProps) {
  const { copy } = useDashboardLanguage();
  const h = copy.home;
  const pills = h.quickActionsPills;

  const studios: StudioCard[] = useMemo(
    () => [
      {
        id: "image",
        title: h.toolCards.imageStudio.title,
        body: h.toolCards.imageStudio.body,
        status: "live",
        icon: ImageIcon,
      },
      {
        id: "video",
        title: h.toolCards.videoStudio.title,
        body: h.toolCards.videoStudio.body,
        status: videoStudioEnabled ? "beta" : "comingSoon",
        icon: Film,
        disabled: !videoStudioEnabled,
      },
      {
        id: "lip_sync",
        title: h.toolCards.lipSync.title,
        body: h.toolCards.lipSync.body,
        status: lipSyncEnabled ? "beta" : "comingSoon",
        icon: Mic2,
        disabled: !lipSyncEnabled,
      },
    ],
    [h, videoStudioEnabled, lipSyncEnabled]
  );

  const filteredRecent = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return recentAssets.slice(0, 6);
    return recentAssets
      .filter((asset) => asset.prompt.toLowerCase().includes(query))
      .slice(0, 6);
  }, [recentAssets, searchQuery]);

  const statusLabels = h.statuses;

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          {h.chooseStudio}
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">{h.chooseStudioSubline}</p>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {studios.map((studio) => {
            const Icon = studio.icon;
            const statusLabel =
              studio.status === "live"
                ? statusLabels.live
                : studio.status === "beta"
                  ? statusLabels.beta
                  : statusLabels.comingSoon;

            return (
              <article
                key={studio.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex h-40 items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 sm:h-44">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 text-amber-600 shadow-sm">
                    <Icon className="h-7 w-7" />
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold text-slate-900">{studio.title}</h3>
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusBadgeClass(
                        studio.status
                      )}`}
                    >
                      {statusLabel}
                    </span>
                  </div>

                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">
                    {studio.body}
                  </p>

                  <button
                    type="button"
                    disabled={studio.disabled}
                    onClick={() => onOpenStudio(studio.id)}
                    className="mt-5 w-full rounded-xl bg-[#d8ad5f] px-4 py-2.5 text-sm font-bold text-slate-900 transition-all duration-200 hover:bg-[#efc777] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {studio.disabled ? statusLabels.comingSoon : h.toolCards.open}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="flex flex-wrap gap-2">
        {(
          [
            { id: "template" as const, label: pills.useTemplate },
            { id: "gallery" as const, label: pills.viewGallery },
            { id: "style" as const, label: pills.createStyleProfile },
            { id: "credits" as const, label: pills.addCredits },
          ] as const
        ).map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => onQuickAction(action.id)}
            className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-gray-300 hover:shadow-md"
          >
            {action.label}
          </button>
        ))}
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{h.recentAssetsTitle}</h3>
            <p className="mt-1 text-sm text-slate-500">{h.recentAssetsBody}</p>
          </div>
        </div>

        {loading ? (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="aspect-square animate-pulse rounded-xl bg-gray-100"
              />
            ))}
          </div>
        ) : filteredRecent.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center">
            <Sparkles className="mx-auto h-6 w-6 text-amber-500" />
            <p className="mt-3 text-sm text-slate-500">{h.recentAssetsEmpty}</p>
            <button
              type="button"
              onClick={() => onOpenStudio("image")}
              className="mt-4 rounded-full bg-[#d8ad5f] px-4 py-2 text-xs font-bold text-slate-900 transition hover:bg-[#efc777]"
            >
              {h.createFirstVisual}
            </button>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filteredRecent.map((asset) => {
              const preview = asset.image_url ?? asset.video_url;

              return (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => onRegenerate(asset.prompt)}
                  className="group overflow-hidden rounded-xl border border-gray-100 bg-gray-50 text-left transition-all duration-200 hover:border-amber-200 hover:shadow-md"
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    {preview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={preview}
                        alt=""
                        className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-400">
                        <ImageIcon className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <p className="line-clamp-2 px-2 py-2 text-[11px] font-medium text-slate-600">
                    {asset.prompt}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

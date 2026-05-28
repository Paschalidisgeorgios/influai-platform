"use client";

import { useMemo } from "react";
import { Film, ImageIcon, Mic2, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { DashboardLanguage } from "../i18n";
import { useDashboardLanguage } from "../DashboardLanguageProvider";
import type { CreateStudioTab } from "./CreateStudioHub";
import UserWelcomeBanner from "./UserWelcomeBanner";

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
  userName?: string;
  currentLanguage?: DashboardLanguage;
  onOpenStudio: (tab: CreateStudioTab) => void;
  onRegenerate: (prompt: string) => void;
};

function statusBadgeClass(status: StudioCard["status"]) {
  if (status === "live") {
    return "border-green-100 bg-green-50 text-green-700";
  }
  if (status === "beta") {
    return "border-orange-100 bg-orange-50 text-orange-600";
  }
  return "border-slate-200 bg-slate-100 text-slate-600";
}

export default function CreatorHubHome({
  loading,
  recentAssets,
  searchQuery = "",
  videoStudioEnabled,
  lipSyncEnabled,
  userName,
  currentLanguage,
  onOpenStudio,
  onRegenerate,
}: CreatorHubHomeProps) {
  const { copy, language: contextLanguage } = useDashboardLanguage();
  const activeLanguage = currentLanguage ?? contextLanguage;
  const h = copy.home;

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

  const collageImages = useMemo(
    () =>
      recentAssets
        .map((asset) => asset.image_url ?? asset.video_url)
        .filter((url): url is string => Boolean(url)),
    [recentAssets]
  );

  const statusLabels = h.statuses;

  return (
    <div className="space-y-6">
      <UserWelcomeBanner
        userName={userName}
        currentLanguage={activeLanguage}
        recentAssets={collageImages}
      />

      <section>
        <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
          {h.chooseStudio}
        </h2>
        <p className="mt-1 max-w-2xl text-sm font-medium text-slate-600">
          {h.chooseStudioSubline}
        </p>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                className="flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div>
                  <div className="flex h-40 items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 sm:h-44">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 shadow-sm">
                      <Icon className="h-7 w-7" />
                    </div>
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-bold tracking-tight text-slate-900">
                        {studio.title}
                      </h3>
                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusBadgeClass(
                          studio.status
                        )}`}
                      >
                        {statusLabel}
                      </span>
                    </div>

                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{studio.body}</p>
                  </div>
                </div>

                <div className="px-5 pb-5 sm:px-6 sm:pb-6">
                  <button
                    type="button"
                    disabled={studio.disabled}
                    onClick={() => onOpenStudio(studio.id)}
                    className="min-h-[44px] w-full rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {studio.disabled ? statusLabels.comingSoon : h.toolCards.open}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div>
          <h3 className="text-base font-bold tracking-tight text-slate-900">
            {h.recentAssetsTitle}
          </h3>
          <p className="mt-1 text-sm text-slate-600">{h.recentAssetsBody}</p>
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
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <p className="mt-3 text-sm text-slate-600">{h.recentAssetsEmpty}</p>
            <button
              type="button"
              onClick={() => onOpenStudio("image")}
              className="mt-4 min-h-[44px] rounded-full bg-orange-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-orange-600"
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
                  className="group overflow-hidden rounded-xl border border-gray-200 bg-white text-left shadow-sm transition-all duration-200 hover:border-orange-300 hover:shadow-md"
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
                      <div className="flex h-full items-center justify-center bg-orange-50 text-orange-600">
                        <ImageIcon className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="border-t border-gray-200 bg-gray-50 p-3">
                    <p className="line-clamp-2 text-xs font-medium leading-relaxed text-slate-700">
                      {asset.prompt}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

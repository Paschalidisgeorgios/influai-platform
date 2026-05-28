"use client";

import { useMemo, useState } from "react";
import {
  Download,
  Film,
  FolderOpen,
  ImageIcon,
  ImagePlus,
  Mic2,
  Plus,
  Search,
  Sparkles,
  UserRound,
  Video,
  Wand2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useDashboardLanguage } from "../DashboardLanguageProvider";
import { CAMPAIGN_TEMPLATES } from "../data/campaign-templates";
import { formatCopy } from "../i18n";

type HomeAsset = {
  id: string;
  prompt: string;
  image_url: string | null;
  video_url: string | null;
  is_favorite: boolean;
  created_at: string;
};

type HomeMetrics = {
  credits: number;
  assets: number;
  favorites: number;
  styleProfiles: number;
};

type StudioTab = "image" | "video" | "creator_video" | "lip_sync" | "talking_creator";

type CreatorHubHomeProps = {
  metrics: HomeMetrics;
  loading: boolean;
  recentAssets: HomeAsset[];
  videoStudioEnabled: boolean;
  lipSyncEnabled: boolean;
  creatorVideoEnabled: boolean;
  talkingCreatorEnabled: boolean;
  onOpenAgent: (tab: StudioTab) => void;
  onOpenAgentWithPrompt: (prompt: string) => void;
  onOpenView: (view: "gallery" | "characters" | "credits" | "tools") => void;
  onRegenerate: (prompt: string) => void;
};

type ToolCardConfig = {
  id: string;
  title: string;
  body: string;
  status: "live" | "beta" | "comingSoon";
  icon: LucideIcon;
  cta: string;
  tab?: StudioTab;
  disabled?: boolean;
  action?: () => void;
};

function statusClass(status: ToolCardConfig["status"]) {
  if (status === "live") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
  }
  if (status === "beta") {
    return "border-violet-500/30 bg-violet-500/10 text-violet-100";
  }
  return "border-amber-500/25 bg-amber-500/10 text-amber-100";
}

export default function CreatorHubHome({
  metrics,
  loading,
  recentAssets,
  videoStudioEnabled,
  lipSyncEnabled,
  creatorVideoEnabled,
  talkingCreatorEnabled,
  onOpenAgent,
  onOpenAgentWithPrompt,
  onOpenView,
  onRegenerate,
}: CreatorHubHomeProps) {
  const { copy, language } = useDashboardLanguage();
  const h = copy.home;
  const [hubPrompt, setHubPrompt] = useState("");

  const statusLabels = h.statuses;

  const studioToolCards: ToolCardConfig[] = useMemo(
    () => [
      {
        id: "image-studio",
        title: h.toolCards.imageStudio.title,
        body: h.toolCards.imageStudio.body,
        status: "live",
        icon: ImageIcon,
        cta: h.toolCards.open,
        tab: "image",
      },
      {
        id: "video-studio",
        title: h.toolCards.videoStudio.title,
        body: h.toolCards.videoStudio.body,
        status: videoStudioEnabled ? "beta" : "comingSoon",
        icon: Film,
        cta: videoStudioEnabled ? h.toolCards.start : h.toolCards.comingSoon,
        tab: "video",
        disabled: !videoStudioEnabled,
      },
      {
        id: "lip-sync",
        title: h.toolCards.lipSync.title,
        body: h.toolCards.lipSync.body,
        status: lipSyncEnabled ? "beta" : "comingSoon",
        icon: Mic2,
        cta: lipSyncEnabled ? h.toolCards.start : h.toolCards.comingSoon,
        tab: "lip_sync",
        disabled: !lipSyncEnabled,
      },
      {
        id: "creator-video",
        title: h.toolCards.creatorVideo.title,
        body: h.toolCards.creatorVideo.body,
        status: creatorVideoEnabled ? "beta" : "comingSoon",
        icon: Video,
        cta: creatorVideoEnabled ? h.toolCards.start : h.toolCards.comingSoon,
        tab: "creator_video",
        disabled: !creatorVideoEnabled,
      },
      {
        id: "talking-creator",
        title: h.toolCards.talkingCreator.title,
        body: h.toolCards.talkingCreator.body,
        status: talkingCreatorEnabled ? "beta" : "comingSoon",
        icon: Sparkles,
        cta: talkingCreatorEnabled ? h.toolCards.start : h.toolCards.comingSoon,
        tab: "talking_creator",
        disabled: !talkingCreatorEnabled,
      },
      {
        id: "motion-transfer",
        title: h.toolCards.motionTransfer.title,
        body: h.toolCards.motionTransfer.body,
        status: "comingSoon",
        icon: Wand2,
        cta: h.toolCards.comingSoon,
        disabled: true,
      },
    ],
    [
      h,
      videoStudioEnabled,
      lipSyncEnabled,
      creatorVideoEnabled,
      talkingCreatorEnabled,
    ]
  );

  const recommendedCard = useMemo(() => {
    if (metrics.styleProfiles === 0) {
      return {
        title: h.recommended.title,
        body: h.recommended.createProfile,
        cta: h.recommended.createProfileCta,
        action: () => onOpenView("characters"),
      };
    }

    if (metrics.credits <= 25) {
      return {
        title: h.recommended.lowCreditsTitle,
        body: h.recommended.lowCreditsBody,
        cta: h.recommended.lowCreditsCta,
        action: () => onOpenView("credits"),
      };
    }

    const favoriteAsset = recentAssets.find((asset) => asset.is_favorite);

    return {
      title: h.recommended.variantTitle,
      body: h.recommended.variantBody,
      cta: h.recommended.variantCta,
      action: () => {
        if (favoriteAsset) {
          onRegenerate(favoriteAsset.prompt);
          return;
        }
        onOpenAgent("image");
      },
    };
  }, [h, metrics, onOpenAgent, onOpenView, onRegenerate, recentAssets]);

  function submitHubPrompt() {
    const trimmed = hubPrompt.trim();
    if (trimmed) {
      onOpenAgentWithPrompt(trimmed);
      return;
    }
    onOpenAgent("image");
  }

  return (
    <section className="space-y-5 sm:space-y-6">
      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.28)] sm:p-6">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#d8ad5f]">
          {h.eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">{h.welcome}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/50">{h.intro}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onOpenAgent("image")}
            className="rounded-full bg-[#d8ad5f] px-4 py-2 text-xs font-black text-black"
          >
            {h.createVisual}
          </button>
          <button
            type="button"
            onClick={() => {
              document
                .getElementById("home-templates")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="rounded-full border border-white/15 bg-white/[0.05] px-4 py-2 text-xs font-black text-white/85"
          >
            {h.useTemplate}
          </button>
          <button
            type="button"
            onClick={() => onOpenView("credits")}
            className="rounded-full border border-white/15 bg-white/[0.05] px-4 py-2 text-xs font-black text-white/85"
          >
            {h.addCredits}
          </button>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-[#d8ad5f]/20 bg-gradient-to-br from-[#d8ad5f]/10 via-white/[0.03] to-transparent p-4 sm:p-5">
        <label className="sr-only" htmlFor="creator-hub-prompt">
          {h.promptPlaceholder}
        </label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              id="creator-hub-prompt"
              value={hubPrompt}
              onChange={(event) => setHubPrompt(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  submitHubPrompt();
                }
              }}
              placeholder={h.promptPlaceholder}
              className="w-full rounded-2xl border border-white/10 bg-black/40 py-3.5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/30 focus-visible:ring-2 focus-visible:ring-[#d8ad5f]/35"
            />
          </div>
          <button
            type="button"
            onClick={submitHubPrompt}
            className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-[#d8ad5f] px-6 py-3.5 text-sm font-black text-black shadow-[0_12px_36px_rgba(216,173,95,0.3)]"
          >
            {h.promptCreate}
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">
            {h.metrics.credits}
          </p>
          <p className="mt-2 text-2xl font-black text-[#d8ad5f]">
            {loading ? "…" : metrics.credits}
          </p>
          <p className="mt-1 text-xs text-white/40">
            {formatCopy(h.metrics.enoughFor, { count: String(metrics.credits) })}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">
            {h.metrics.assets}
          </p>
          <p className="mt-2 text-2xl font-black text-white">
            {loading ? "…" : metrics.assets}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">
            {h.metrics.favorites}
          </p>
          <p className="mt-2 text-2xl font-black text-white">
            {loading ? "…" : metrics.favorites}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">
            {h.metrics.profiles}
          </p>
          <p className="mt-2 text-2xl font-black text-white">
            {loading ? "…" : metrics.styleProfiles}
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/40">
          {h.studioToolsTitle}
        </h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {studioToolCards.map((card) => {
            const Icon = card.icon;
            const statusLabel =
              card.status === "live"
                ? statusLabels.live
                : card.status === "beta"
                  ? statusLabels.beta
                  : statusLabels.comingSoon;

            return (
              <article
                key={card.id}
                className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d8ad5f]/15 text-[#d8ad5f]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.08em] ${statusClass(card.status)}`}
                  >
                    {statusLabel}
                  </span>
                </div>
                <h4 className="mt-3 text-sm font-black text-white">{card.title}</h4>
                <p className="mt-2 flex-1 text-xs leading-5 text-white/48">{card.body}</p>
                <button
                  type="button"
                  disabled={card.disabled}
                  onClick={() => {
                    if (card.disabled || !card.tab) return;
                    onOpenAgent(card.tab);
                  }}
                  className="mt-4 inline-flex items-center justify-center rounded-full border border-[#d8ad5f]/30 bg-[#d8ad5f]/10 px-4 py-2 text-xs font-black text-[#f0d7a8] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {card.cta}
                </button>
              </article>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {h.quickActions.map((card, index) => (
          <article
            key={card.title}
            className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-4"
          >
            <h3 className="text-sm font-black text-white">{card.title}</h3>
            <p className="mt-2 flex-1 text-xs leading-5 text-white/48">{card.body}</p>
            <button
              type="button"
              onClick={() => {
                if (index === 0) onOpenAgent("image");
                else if (index === 1) {
                  document
                    .getElementById("home-templates")
                    ?.scrollIntoView({ behavior: "smooth" });
                } else if (index === 2) onOpenView("characters");
                else if (index === 3) onOpenView("gallery");
                else onOpenView("credits");
              }}
              className="mt-4 inline-flex items-center justify-center rounded-full border border-[#d8ad5f]/30 bg-[#d8ad5f]/10 px-4 py-2 text-xs font-black text-[#f0d7a8]"
            >
              {card.cta}
            </button>
          </article>
        ))}
      </div>

      <div
        id="home-templates"
        className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5"
      >
        <h3 className="text-lg font-black text-white">{h.templatesTitle}</h3>
        <p className="mt-1 text-sm text-white/45">{h.templatesSubtitle}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CAMPAIGN_TEMPLATES.map((template) => {
            const title = language === "de" ? template.titleDe : template.titleEn;
            const body = language === "de" ? template.bodyDe : template.bodyEn;

            return (
              <article
                key={template.id}
                className="flex flex-col rounded-xl border border-white/10 bg-black/25 p-3"
              >
                <h4 className="text-xs font-black text-white">{title}</h4>
                <p className="mt-1.5 flex-1 text-[11px] leading-4 text-white/45">
                  {body}
                </p>
                <button
                  type="button"
                  onClick={() => onOpenAgentWithPrompt(template.prompt)}
                  className="mt-3 rounded-full border border-white/12 bg-white/[0.05] px-3 py-1.5 text-[10px] font-black text-white/80 transition hover:border-[#d8ad5f]/35 hover:text-[#d8ad5f]"
                >
                  {h.useTemplateCta}
                </button>
              </article>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <h3 className="text-lg font-black text-white">{h.recentAssetsTitle}</h3>
        <p className="mt-1 text-sm text-white/45">{h.recentAssetsBody}</p>
        {recentAssets.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-white/10 px-4 py-8 text-center">
            <p className="text-sm text-white/45">{h.recentAssetsEmpty}</p>
            <button
              type="button"
              onClick={() => onOpenAgent("image")}
              className="mt-3 rounded-full bg-[#d8ad5f] px-4 py-2 text-xs font-black text-black"
            >
              {h.createFirstVisual}
            </button>
          </div>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {recentAssets.map((asset) => (
              <div
                key={asset.id}
                className="overflow-hidden rounded-xl border border-white/10 bg-black/30"
              >
                {(asset.video_url || asset.image_url) && (
                  <div className="aspect-video bg-black/50">
                    {asset.video_url ? (
                      <video
                        src={asset.video_url}
                        className="h-full w-full object-cover"
                        muted
                        playsInline
                      />
                    ) : (
                      <img
                        src={asset.image_url ?? ""}
                        alt=""
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </div>
                )}
                <div className="p-3">
                  <p className="line-clamp-2 text-xs text-white/60">{asset.prompt}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => onOpenView("gallery")}
                      className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-bold text-white/75"
                    >
                      <FolderOpen className="mr-1 inline h-3 w-3" />
                      {h.assetOpen}
                    </button>
                    <button
                      type="button"
                      onClick={() => onRegenerate(asset.prompt)}
                      className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-bold text-white/75"
                    >
                      <Plus className="mr-1 inline h-3 w-3" />
                      {h.assetVariant}
                    </button>
                    <button
                      type="button"
                      onClick={() => onRegenerate(asset.prompt)}
                      className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-bold text-white/75"
                    >
                      <ImagePlus className="mr-1 inline h-3 w-3" />
                      {h.assetReference}
                    </button>
                    {(asset.video_url || asset.image_url) && (
                      <a
                        href={(asset.video_url || asset.image_url) ?? "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-bold text-white/75"
                      >
                        <Download className="mr-1 inline h-3 w-3" />
                        {h.assetDownload}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-[#d8ad5f]/25 bg-[#d8ad5f]/10 p-4">
        <h3 className="text-sm font-black text-[#f5ddb0]">{recommendedCard.title}</h3>
        <p className="mt-2 text-sm text-white/70">{recommendedCard.body}</p>
        <button
          type="button"
          onClick={recommendedCard.action}
          className="mt-3 rounded-full bg-[#d8ad5f] px-4 py-2 text-xs font-black text-black"
        >
          {recommendedCard.cta}
        </button>
      </div>
    </section>
  );
}

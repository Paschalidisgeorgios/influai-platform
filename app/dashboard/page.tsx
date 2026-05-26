"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bot,
  Clapperboard,
  CreditCard,
  Film,
  GalleryVerticalEnd,
  Home,
  LayoutGrid,
  Lock,
  LogOut,
  Menu,
  Mic2,
  Sparkles,
  UserRound,
  Wand2,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import AiAgentStudio from "./AiAgentStudio";
import CampaignPlanner from "./CampaignPlanner";
import CharacterManager from "./CharacterManager";
import CompactCredits from "./CompactCredits";
import { DashboardLanguageProvider, useDashboardLanguage } from "./DashboardLanguageProvider";
import CreditsCard from "./CreditsCard";
import GenerationGallery from "./GenerationGallery";
import LanguageSelector from "./LanguageSelector";
import ToolsRoadmap from "./ToolsRoadmap";
import { createClient } from "@/lib/supabase/client";

const VIDEO_STUDIO_PUBLIC_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_FAL_VIDEO_STUDIO === "true";
const LIP_SYNC_PUBLIC_ENABLED = false;

type RegenerateDraft = {
  prompt: string;
  characterId: string | null;
  source?: "gallery" | "campaign_planner";
  loadedAt?: number;
};

type DashboardView =
  | "agent"
  | "tools"
  | "planner"
  | "gallery"
  | "characters"
  | "credits";

type SidebarBadgeVariant = "live" | "beta" | "credits";

type SidebarBadge = {
  label: string;
  variant: SidebarBadgeVariant;
};

type LiveSidebarItem = {
  id: DashboardView;
  label: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
  badges?: SidebarBadge[];
};

type ModeAvailability = "live" | "beta" | "planned";

type RoadmapModule = {
  id: string;
  label: string;
  bestFor: string;
  icon: LucideIcon;
  availability: ModeAvailability;
  onSelect?: () => void;
};

function getSidebarBadgeClass(variant: SidebarBadgeVariant) {
  if (variant === "beta") {
    return "border-violet-500/30 bg-violet-500/10 text-violet-100";
  }

  if (variant === "credits") {
    return "border-emerald-500/25 bg-emerald-500/10 text-emerald-200";
  }

  return "border-emerald-500/25 bg-emerald-500/10 text-emerald-200";
}

function ViewShell({
  eyebrow,
  title,
  description,
  badges,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  badges?: SidebarBadge[];
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5 sm:space-y-6">
      <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-4 shadow-[0_20px_70px_rgba(0,0,0,0.28)] sm:rounded-[2rem] sm:p-6">
        <div className="relative">
          <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-[#d8ad5f]/10 blur-3xl" />

          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.34em] text-[#d8ad5f]">
              {eyebrow}
            </p>

            <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
              {title}
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45">
              {description}
            </p>

            {badges && badges.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {badges.map((badge) => (
                  <span
                    key={badge.label}
                    className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] ${getSidebarBadgeClass(
                      badge.variant
                    )}`}
                  >
                    {badge.label}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {children}
    </section>
  );
}

export default function DashboardPage() {
  return (
    <DashboardLanguageProvider>
      <DashboardPageInner />
    </DashboardLanguageProvider>
  );
}

function DashboardPageInner() {
  const { copy } = useDashboardLanguage();
  const supabase = createClient();

  const liveItems: LiveSidebarItem[] = useMemo(
    () => [
      {
        id: "agent",
        label: copy.sidebar.nav.agent.label,
        description: copy.sidebar.nav.agent.description,
        icon: Bot,
        badge: copy.sidebar.live,
      },
      {
        id: "tools",
        label: copy.sidebar.nav.tools.label,
        description: copy.sidebar.nav.tools.description,
        icon: LayoutGrid,
      },
      {
        id: "gallery",
        label: copy.sidebar.nav.gallery.label,
        description: copy.sidebar.nav.gallery.description,
        icon: GalleryVerticalEnd,
      },
      {
        id: "characters",
        label: copy.sidebar.nav.characters.label,
        description: copy.sidebar.nav.characters.description,
        icon: UserRound,
      },
      {
        id: "credits",
        label: copy.sidebar.nav.credits.label,
        description: copy.sidebar.nav.credits.description,
        icon: CreditCard,
      },
    ],
    [copy]
  );

  function getModeAvailabilityLabel(availability: ModeAvailability) {
    if (availability === "live") return copy.sidebar.live;
    if (availability === "beta") return copy.sidebar.beta;
    return copy.sidebar.planned;
  }

  const [activeView, setActiveView] = useState<DashboardView>("agent");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [galleryRefreshKey, setGalleryRefreshKey] = useState(0);
  const [charactersRefreshKey, setCharactersRefreshKey] = useState(0);
  const [creditsRefreshKey, setCreditsRefreshKey] = useState(0);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [regenerateDraft, setRegenerateDraft] =
    useState<RegenerateDraft | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");

    if (checkout === "success") {
      setStatusMessage(copy.page.checkoutSuccess);
      setCreditsRefreshKey((current) => current + 1);
      setActiveView("credits");
    }

    if (checkout === "cancelled") {
      setStatusMessage(copy.page.checkoutCancelled);
      setActiveView("credits");
    }

    if (checkout) {
      window.history.replaceState({}, "", "/dashboard");
    }
  }, [copy]);

  const activeLabel = useMemo(() => {
    const match = liveItems.find((item) => item.id === activeView);
    if (match) return match.label;
    if (activeView === "planner") return copy.campaignPlanner.title;
    return copy.sidebar.nav.agent.label;
  }, [activeView, liveItems, copy]);

  function showStatus(message: string) {
    setStatusMessage(message);

    window.setTimeout(() => {
      setStatusMessage(null);
    }, 4000);
  }

  function openView(view: DashboardView) {
    setActiveView(view);
    setMobileSidebarOpen(false);
  }

  function handleGenerationQueued() {
    setGalleryRefreshKey((current) => current + 1);
    setCreditsRefreshKey((current) => current + 1);
    setRegenerateDraft(null);
    showStatus(copy.page.generationQueued);
  }

  function handleRegenerate(prompt: string, characterId: string | null) {
    setRegenerateDraft({
      prompt,
      characterId,
      source: "gallery",
      loadedAt: Date.now(),
    });

    setActiveView("agent");
    setMobileSidebarOpen(false);
    showStatus(copy.page.promptLoaded);
  }

  function handleUseCampaignPrompt(prompt: string) {
    setRegenerateDraft({
      prompt,
      characterId: null,
      source: "campaign_planner",
      loadedAt: Date.now(),
    });

    setActiveView("agent");
    setMobileSidebarOpen(false);
  }

  function handleClearRegenerateDraft() {
    setRegenerateDraft(null);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  function renderContent() {
    if (activeView === "agent") {
      return (
        <>
          <AiAgentStudio
            charactersRefreshKey={charactersRefreshKey}
            regenerateDraft={regenerateDraft}
            onClearRegenerateDraft={handleClearRegenerateDraft}
            onGenerationQueued={handleGenerationQueued}
            onOpenGallery={() => setActiveView("gallery")}
            onOpenCredits={() => setActiveView("credits")}
          />
        </>
      );
    }

    if (activeView === "tools") {
      return (
        <ViewShell
          eyebrow={copy.page.tools.eyebrow}
          title={copy.page.tools.title}
          description={copy.page.tools.description}
        >
          <ToolsRoadmap
            copy={copy}
            videoStudioEnabled={VIDEO_STUDIO_PUBLIC_ENABLED}
            onOpenAgent={() => openView("agent")}
          />
        </ViewShell>
      );
    }

    if (activeView === "gallery") {
      return (
        <ViewShell
          eyebrow={copy.page.gallery.eyebrow}
          title={copy.page.gallery.title}
          description={copy.page.gallery.description}
        >
          <GenerationGallery
            refreshKey={galleryRefreshKey}
            onRegenerate={handleRegenerate}
          />
        </ViewShell>
      );
    }

    if (activeView === "characters") {
      return (
        <ViewShell
          eyebrow={copy.page.characters.eyebrow}
          title={copy.page.characters.title}
          description={copy.page.characters.description}
        >
          <CharacterManager
            onCharactersChange={() => {
              setCharactersRefreshKey((current) => current + 1);
              showStatus(copy.page.styleProfilesUpdated);
            }}
          />
        </ViewShell>
      );
    }

    if (activeView === "planner") {
      return (
        <ViewShell
          eyebrow={copy.page.planner.eyebrow}
          title={copy.page.planner.title}
          description={copy.page.planner.description}
          badges={[
            {
              label: copy.campaignPlanner.badges.planningBeta,
              variant: "beta",
            },
            {
              label: copy.campaignPlanner.badges.noCredits,
              variant: "credits",
            },
          ]}
        >
          <CampaignPlanner onUsePrompt={handleUseCampaignPrompt} />
        </ViewShell>
      );
    }

    return (
      <ViewShell
        eyebrow={copy.page.credits.eyebrow}
        title={copy.page.credits.title}
        description={copy.page.credits.description}
      >
        <CreditsCard refreshKey={creditsRefreshKey} />
      </ViewShell>
    );
  }

  function SidebarContent() {
    const expansionRoadmapItems: RoadmapModule[] = [
      {
        id: "campaign-planner",
        label: copy.sidebar.nav.planner.label,
        bestFor: copy.sidebar.nav.planner.description,
        icon: Clapperboard,
        availability: "beta",
        onSelect: () => openView("planner"),
      },
      {
        id: "video_studio",
        label: copy.sidebar.expansion.videoStudio.label,
        bestFor: copy.sidebar.expansion.videoStudio.description,
        icon: Film,
        availability: VIDEO_STUDIO_PUBLIC_ENABLED ? "beta" : "planned",
      },
      {
        id: "lip_sync",
        label: copy.sidebar.expansion.lipSyncStudio.label,
        bestFor: copy.sidebar.expansion.lipSyncStudio.description,
        icon: Mic2,
        availability: LIP_SYNC_PUBLIC_ENABLED ? "beta" : "planned",
      },
      {
        id: "cinema-agent",
        label: copy.sidebar.expansion.cinemaAgent.label,
        bestFor: copy.sidebar.expansion.cinemaAgent.description,
        icon: Clapperboard,
        availability: "planned",
      },
      {
        id: "omni-campaign-agent",
        label: copy.sidebar.expansion.omniCampaignAgent.label,
        bestFor: copy.sidebar.expansion.omniCampaignAgent.description,
        icon: Wand2,
        availability: "planned",
      },
    ];

    return (
      <div className="flex h-full flex-col">
        <div>
          <Link
            href="/"
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3 transition hover:border-white/20"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#d8ad5f] text-black shadow-[0_10px_30px_rgba(216,173,95,0.25)]">
              <Sparkles className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-base font-black tracking-tight text-white">
                Influ<span className="text-[#d8ad5f]">ExAi</span>
              </p>
              <p className="text-xs font-semibold text-white/35">
                {copy.sidebar.creatorStudio}
              </p>
            </div>
          </Link>

          <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/[0.08] text-sm font-black text-white">
                G
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-white">
                  Georgios Paschalidis
                </p>
                <p className="text-xs font-medium text-white/35">
                  {copy.sidebar.workspaceOwner}
                </p>
              </div>
            </div>

            <div className="mt-3">
              <LanguageSelector compact />
            </div>
          </div>

          <div className="mt-7">
            <p className="mb-3 px-3 text-[10px] font-black uppercase tracking-[0.3em] text-white/25">
              {copy.sidebar.liveStudio}
            </p>

            <nav className="space-y-2">
              {liveItems.map((item) => {
                const Icon = item.icon;
                const active = activeView === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openView(item.id)}
                    className={`group flex w-full items-center gap-3 rounded-[1.3rem] px-3 py-3 text-left transition ${
                      active
                        ? "border border-white/12 bg-white/[0.09] text-white shadow-inner"
                        : "border border-transparent bg-transparent text-white/60 hover:border-white/10 hover:bg-white/[0.045] hover:text-white"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition ${
                        active
                          ? "bg-[#d8ad5f] text-black"
                          : "bg-white/[0.05] text-white/70 group-hover:bg-white/[0.08] group-hover:text-white"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-bold">
                          {item.label}
                        </p>

                        {item.badge ? (
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] ${getSidebarBadgeClass(
                              "live"
                            )}`}
                          >
                            {item.badge}
                          </span>
                        ) : null}

                        {item.badges?.map((badge) => (
                          <span
                            key={badge.label}
                            className={`rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] ${getSidebarBadgeClass(
                              badge.variant
                            )}`}
                          >
                            {badge.label}
                          </span>
                        ))}
                      </div>

                      <p className="truncate text-xs text-white/30">
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          <details className="mt-5 px-1">
            <summary className="cursor-pointer list-none px-2 text-[10px] font-black uppercase tracking-[0.28em] text-white/30 marker:content-none [&::-webkit-details-marker]:hidden">
              {copy.sidebar.expansionPlanned}
            </summary>
            <p className="mt-2 px-2 text-[10px] leading-4 text-white/30">
              {copy.sidebar.expansionPlannedHint}
            </p>

            <div
              className="mt-2 space-y-1"
              role="list"
              aria-label={copy.sidebar.expansionPlanned}
            >
              {expansionRoadmapItems.map((module) => {
                const Icon = module.icon;
                const statusLabel = getModeAvailabilityLabel(module.availability);
                const isClickable = Boolean(module.onSelect);

                if (isClickable) {
                  return (
                    <button
                      key={module.id}
                      type="button"
                      onClick={module.onSelect}
                      className="flex w-full items-start gap-2.5 rounded-xl border border-violet-500/20 bg-violet-500/[0.06] px-2.5 py-2.5 text-left transition hover:border-violet-500/35 hover:bg-violet-500/10"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-100">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="text-[11px] font-bold text-white/80">
                            {module.label}
                          </p>
                          <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.08em] text-violet-100">
                            {statusLabel}
                          </span>
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-[10px] leading-4 text-white/35">
                          {module.bestFor}
                        </p>
                      </div>
                    </button>
                  );
                }

                return (
                  <div
                    key={module.id}
                    role="listitem"
                    aria-disabled="true"
                    title={`${module.label} — ${statusLabel}. ${copy.sidebar.moduleUnavailable}`}
                    className="flex items-start gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-2.5 py-2.5"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-white/30">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="text-[11px] font-bold text-white/45">
                          {module.label}
                        </p>
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.08em] text-white/40">
                          {statusLabel}
                        </span>
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-[10px] leading-4 text-white/28">
                        {module.bestFor}
                      </p>
                    </div>
                    <Lock
                      className="mt-1 h-3 w-3 shrink-0 text-white/18"
                      aria-hidden
                    />
                  </div>
                );
              })}
            </div>

            <p className="mt-2 px-2 text-[10px] leading-4 text-white/25">
              {copy.sidebar.expansionFootnote}
            </p>
          </details>
        </div>

        <div className="mt-auto space-y-2 pt-6">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-[1.3rem] border border-white/10 bg-white/[0.035] px-4 py-3 text-sm font-bold text-white/65 transition hover:border-white/20 hover:text-white"
          >
            <Home className="h-4 w-4" />
            {copy.sidebar.home}
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-[1.3rem] border border-white/10 bg-white/[0.035] px-4 py-3 text-sm font-bold text-white/65 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-100"
          >
            <LogOut className="h-4 w-4" />
            {copy.sidebar.logout}
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-[#050505] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[18%] top-[14%] h-[360px] w-[360px] rounded-full bg-[#d8ad5f]/8 blur-[120px]" />
        <div className="absolute bottom-[8%] left-[22%] h-[280px] w-[280px] rounded-full bg-violet-700/10 blur-[130px]" />
        <div className="absolute right-[10%] top-[20%] h-[300px] w-[300px] rounded-full bg-white/[0.03] blur-[120px]" />
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 overflow-hidden">
        <aside className="hidden h-full w-[280px] shrink-0 border-r border-white/10 bg-black/75 p-4 backdrop-blur-2xl lg:block">
          <div className="sticky top-4 h-[calc(100vh-32px)] overflow-y-auto overscroll-contain pr-1">
            <SidebarContent />
          </div>
        </aside>

        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
            role="presentation"
          >
            <div
              className="absolute left-0 top-0 flex h-full w-[88%] max-w-[340px] flex-col border-r border-white/10 bg-[#070707] p-4"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-black text-white">{copy.sidebar.studioMenu}</p>

                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/70"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-6 [-webkit-overflow-scrolling:touch]">
                <SidebarContent />
              </div>
            </div>
          </div>
        )}

        <section className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="fixed right-5 top-5 z-50 hidden items-center gap-2 lg:flex">
            <LanguageSelector />
            <CompactCredits
              refreshKey={creditsRefreshKey}
              onOpenCredits={() => setActiveView("credits")}
            />
          </div>

          <header className="sticky top-0 z-40 border-b border-white/10 bg-black/60 backdrop-blur-2xl lg:hidden">
            <div className="flex items-center justify-between gap-2 px-3 py-3 sm:gap-3 sm:px-4 sm:py-4">
              <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(true)}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/70"
                >
                  <Menu className="h-4 w-4" />
                </button>

                <div className="min-w-0">
                  <p className="truncate text-[10px] font-black uppercase tracking-[0.24em] text-[#d8ad5f] sm:text-xs sm:tracking-[0.28em]">
                    InfluExAi
                  </p>
                  <h1 className="truncate text-base font-black tracking-tight text-white sm:text-lg">
                    {activeLabel}
                  </h1>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <LanguageSelector compact />
                <CompactCredits
                  refreshKey={creditsRefreshKey}
                  onOpenCredits={() => setActiveView("credits")}
                />
              </div>
            </div>
          </header>

          <div
            className={
              activeView === "agent"
                ? "min-h-screen"
                : "min-h-0 h-full overflow-y-auto overscroll-contain px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:pt-24"
            }
          >
            {activeView !== "agent" ? (
              <div className="mx-auto w-full max-w-[1700px]">
                {statusMessage && (
                  <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-bold text-white shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
                    {statusMessage}
                  </div>
                )}

                {renderContent()}
              </div>
            ) : (
              <>
                {statusMessage && (
                  <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 text-sm font-bold text-white shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
                    {statusMessage}
                  </div>
                )}

                {renderContent()}
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bot,
  Calendar,
  Clapperboard,
  CreditCard,
  Film,
  GalleryVerticalEnd,
  Home,
  ImageIcon,
  Lock,
  LogOut,
  Megaphone,
  Menu,
  Mic2,
  PenLine,
  Rocket,
  Shield,
  Sparkles,
  Tag,
  UserRound,
  Wand2,
  X,
  Zap,
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
import StudioModesOverview from "./StudioModesOverview";
import { createClient } from "@/lib/supabase/client";

const FAST_DRAFT_PUBLIC_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_FAL_FAST_DRAFT === "true";
const PREMIUM_IMAGE_PUBLIC_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_FAL_PREMIUM_IMAGE === "true";
const REFERENCE_EDIT_PUBLIC_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_FAL_REFERENCE_EDIT === "true";
const BRAND_ASSETS_PUBLIC_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_FAL_BRAND_ASSETS === "true";
const VIDEO_STUDIO_PUBLIC_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_FAL_VIDEO_STUDIO === "true";
const LIP_SYNC_PUBLIC_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_FAL_LIP_SYNC === "true";

type RegenerateDraft = {
  prompt: string;
  characterId: string | null;
  source?: "gallery" | "campaign_planner";
  loadedAt?: number;
};

type DashboardView = "agent" | "planner" | "gallery" | "characters" | "credits";

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

type CreativeModeSidebarItem = {
  id: string;
  label: string;
  credits: string;
  bestFor: string;
  availability: ModeAvailability;
  icon: LucideIcon;
};

type PlannedModule = {
  id: string;
  label: string;
  description: string;
  bestFor: string;
  icon: LucideIcon;
};

function getModeAvailabilityBadgeClass(availability: ModeAvailability) {
  if (availability === "live") {
    return "border-emerald-500/25 bg-emerald-500/10 text-emerald-200";
  }

  if (availability === "beta") {
    return "border-amber-400/25 bg-amber-500/10 text-amber-100";
  }

  return "border-white/12 bg-white/[0.06] text-white/45";
}

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
        id: "planner",
        label: copy.sidebar.nav.planner.label,
        description: copy.sidebar.nav.planner.description,
        icon: Clapperboard,
        badges: [
          {
            label: copy.campaignPlanner.badges.planningBeta,
            variant: "beta",
          },
          {
            label: copy.campaignPlanner.badges.noCredits,
            variant: "credits",
          },
        ],
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

  const creativeModeItems: CreativeModeSidebarItem[] = useMemo(
    () => [
      {
        id: "standard",
        label: copy.studioSuite.modes.standard.label,
        credits: copy.studioSuite.modes.standard.credits,
        bestFor: copy.studioSuite.modes.standard.bestFor,
        availability: "live",
        icon: ImageIcon,
      },
      {
        id: "fast_draft",
        label: copy.studioSuite.modes.fastDraft.label,
        credits: copy.studioSuite.modes.fastDraft.credits,
        bestFor: copy.studioSuite.modes.fastDraft.bestFor,
        availability: FAST_DRAFT_PUBLIC_ENABLED ? "beta" : "planned",
        icon: Zap,
      },
      {
        id: "premium_image",
        label: copy.studioSuite.modes.premium.label,
        credits: copy.studioSuite.modes.premium.credits,
        bestFor: copy.studioSuite.modes.premium.bestFor,
        availability: PREMIUM_IMAGE_PUBLIC_ENABLED ? "beta" : "planned",
        icon: Sparkles,
      },
      {
        id: "reference_edit",
        label: copy.studioSuite.modes.referenceEdit.label,
        credits: copy.studioSuite.modes.referenceEdit.credits,
        bestFor: copy.studioSuite.modes.referenceEdit.bestFor,
        availability: REFERENCE_EDIT_PUBLIC_ENABLED ? "beta" : "planned",
        icon: PenLine,
      },
      {
        id: "brand_assets",
        label: copy.studioSuite.modes.brandAssets.label,
        credits: copy.studioSuite.modes.brandAssets.credits,
        bestFor: copy.studioSuite.modes.brandAssets.bestFor,
        availability: BRAND_ASSETS_PUBLIC_ENABLED ? "beta" : "planned",
        icon: Megaphone,
      },
      {
        id: "video_studio",
        label: copy.studioSuite.modes.videoStudio.label,
        credits: copy.studioSuite.modes.videoStudio.credits,
        bestFor: copy.studioSuite.modes.videoStudio.bestFor,
        availability: VIDEO_STUDIO_PUBLIC_ENABLED ? "beta" : "planned",
        icon: Film,
      },
      {
        id: "lip_sync",
        label: copy.studioSuite.modes.lipSync.label,
        credits: copy.studioSuite.modes.lipSync.credits,
        bestFor: copy.studioSuite.modes.lipSync.bestFor,
        availability: LIP_SYNC_PUBLIC_ENABLED ? "beta" : "planned",
        icon: Mic2,
      },
    ],
    [copy]
  );

  const plannedModules: PlannedModule[] = useMemo(
    () => [
      {
        id: "cinema-agent",
        label: copy.sidebar.expansion.cinemaAgent.label,
        description: copy.sidebar.expansion.cinemaAgent.description,
        bestFor: copy.sidebar.expansion.cinemaAgent.activeNote,
        icon: Clapperboard,
      },
      {
        id: "omni-campaign-agent",
        label: copy.studioSuite.planned.omniCampaignAgent.label,
        description: copy.sidebar.expansion.omniCampaignAgent.description,
        bestFor: copy.studioSuite.planned.omniCampaignAgent.bestFor,
        icon: Wand2,
      },
      {
        id: "social-planner",
        label: copy.studioSuite.planned.socialPlanner.label,
        description: copy.sidebar.expansion.socialPlanner.description,
        bestFor: copy.studioSuite.planned.socialPlanner.bestFor,
        icon: Calendar,
      },
      {
        id: "brand-safety",
        label: copy.studioSuite.planned.brandSafety.label,
        description: copy.sidebar.expansion.brandSafety.description,
        bestFor: copy.studioSuite.planned.brandSafety.bestFor,
        icon: Shield,
      },
      {
        id: "watermarked-promo",
        label: copy.studioSuite.planned.watermarkedPromo.label,
        description: copy.sidebar.watermarkedPromoBody,
        bestFor: copy.studioSuite.planned.watermarkedPromo.bestFor,
        icon: Tag,
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
          <StudioModesOverview />
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

          <div className="mt-7">
            <div className="mb-3 px-3">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/25">
                {copy.sidebar.creativeModes}
              </p>
              <p className="mt-2 text-[11px] leading-5 text-white/35">
                {copy.sidebar.creativeModesHint}
              </p>
            </div>

            <div className="space-y-1.5" role="list">
              {creativeModeItems.map((mode) => {
                const Icon = mode.icon;
                const statusLabel = getModeAvailabilityLabel(mode.availability);

                return (
                  <div
                    key={mode.id}
                    role="listitem"
                    className="flex items-start gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-2.5 py-2.5"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-white/45">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="text-[11px] font-bold text-white/70">
                          {mode.label}
                        </p>
                        <span
                          className={`rounded-full border px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.08em] ${getModeAvailabilityBadgeClass(
                            mode.availability
                          )}`}
                        >
                          {statusLabel}
                        </span>
                        <span className="text-[8px] font-bold uppercase tracking-[0.06em] text-[#d8ad5f]/90">
                          {mode.credits}
                        </span>
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-[10px] leading-4 text-white/30">
                        {mode.bestFor}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-7">
            <div className="mb-3 px-3">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/25">
                {copy.sidebar.expansionPlanned}
              </p>
              <p className="mt-2 text-[11px] leading-5 text-white/35">
                {copy.sidebar.expansionPlannedHint}
              </p>
            </div>

            <div
              className="space-y-2"
              role="list"
              aria-label={copy.sidebar.expansionPlanned}
            >
              {plannedModules.map((module) => (
                <div
                  key={module.id}
                  role="listitem"
                  aria-disabled="true"
                  title={`${module.label} — ${copy.sidebar.planned}. ${copy.sidebar.moduleUnavailable}`}
                  className="relative flex w-full cursor-not-allowed items-start gap-3 rounded-[1.3rem] border border-white/[0.06] bg-white/[0.02] px-3 py-3 text-left"
                >
                  <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-black/30 text-white/30">
                    <module.icon className="h-4 w-4" />
                  </div>

                  <div className="relative min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="text-[11px] font-bold text-white/40">
                        {module.label}
                      </p>
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.1em] text-white/40">
                        {copy.sidebar.planned}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[10px] leading-4 text-white/28">
                      {module.bestFor}
                    </p>
                  </div>

                  <Lock
                    className="relative mt-0.5 h-3.5 w-3.5 shrink-0 text-white/18"
                    aria-hidden
                  />
                </div>
              ))}
            </div>

            <p className="mt-3 px-3 text-[10px] leading-4 text-white/25">
              {copy.sidebar.expansionFootnote}
            </p>
          </div>
        </div>

        <div className="mt-auto space-y-2 pt-8">
          <div className="rounded-[1.3rem] border border-[#d8ad5f]/20 bg-[#d8ad5f]/10 p-4">
            <div className="flex items-center gap-2 text-[#d8ad5f]">
              <Rocket className="h-4 w-4" />
              <p className="text-xs font-black uppercase tracking-[0.18em]">
                {copy.sidebar.roadmap}
              </p>
            </div>

            <p className="mt-2 text-xs leading-5 text-white/40">
              {copy.sidebar.roadmapBody}
            </p>
          </div>

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
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[18%] top-[14%] h-[360px] w-[360px] rounded-full bg-[#d8ad5f]/8 blur-[120px]" />
        <div className="absolute bottom-[8%] left-[22%] h-[280px] w-[280px] rounded-full bg-violet-700/10 blur-[130px]" />
        <div className="absolute right-[10%] top-[20%] h-[300px] w-[300px] rounded-full bg-white/[0.03] blur-[120px]" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        <aside className="hidden w-[320px] border-r border-white/10 bg-black/75 p-4 backdrop-blur-2xl lg:block">
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

        <section className="relative min-w-0 flex-1">
          <div className="fixed right-5 top-5 z-50 hidden items-center gap-2 lg:flex">
            <LanguageSelector />
            <CompactCredits refreshKey={creditsRefreshKey} />
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
                <CompactCredits refreshKey={creditsRefreshKey} />
              </div>
            </div>
          </header>

          <div
            className={
              activeView === "agent"
                ? "min-h-screen"
                : "mx-auto max-w-[1700px] px-3 py-4 sm:px-6 sm:py-6 lg:px-8"
            }
          >
            {statusMessage && activeView !== "agent" && (
              <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 text-sm font-bold text-white shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
                {statusMessage}
              </div>
            )}

            {renderContent()}
          </div>
        </section>
      </div>
    </main>
  );
}
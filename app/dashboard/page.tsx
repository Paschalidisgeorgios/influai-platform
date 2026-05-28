"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bot,
  CreditCard,
  GalleryVerticalEnd,
  Home,
  LayoutGrid,
  LogOut,
  Menu,
  Sparkles,
  UserRound,
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
import CreatorHubHome from "./components/CreatorHubHome";
import DashboardSidebarTools from "./components/DashboardSidebarTools";
import { createClient } from "@/lib/supabase/client";

const VIDEO_STUDIO_PUBLIC_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_FAL_VIDEO_STUDIO === "true";
const CREATOR_VIDEO_PUBLIC_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_CREATOR_VIDEO === "true";
const LIP_SYNC_PUBLIC_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_FAL_LIP_SYNC === "true";
const TALKING_CREATOR_PUBLIC_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_TALKING_CREATOR === "true";

type RegenerateDraft = {
  prompt: string;
  characterId: string | null;
  source?: "gallery" | "campaign_planner";
  loadedAt?: number;
};

type DashboardView =
  | "home"
  | "agent"
  | "tools"
  | "planner"
  | "gallery"
  | "characters"
  | "credits";

type DashboardHomeMetrics = {
  credits: number;
  assets: number;
  favorites: number;
  styleProfiles: number;
};

type HomeAsset = {
  id: string;
  prompt: string;
  image_url: string | null;
  video_url: string | null;
  is_favorite: boolean;
  created_at: string;
};

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
  const { copy, language } = useDashboardLanguage();
  const supabase = createClient();
  const router = useRouter();

  const liveItems: LiveSidebarItem[] = useMemo(
    () => [
      {
        id: "home",
        label: copy.sidebar.nav.home.label,
        description: copy.sidebar.nav.home.description,
        icon: Home,
      },
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
    [copy, language]
  );

  const [activeView, setActiveView] = useState<DashboardView>("home");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [preferredStudioTab, setPreferredStudioTab] = useState<
    "image" | "video" | "creator_video" | "lip_sync" | "talking_creator"
  >("image");

  const [galleryRefreshKey, setGalleryRefreshKey] = useState(0);
  const [charactersRefreshKey, setCharactersRefreshKey] = useState(0);
  const [creditsRefreshKey, setCreditsRefreshKey] = useState(0);
  const [homeLoading, setHomeLoading] = useState(true);
  const [homeMetrics, setHomeMetrics] = useState<DashboardHomeMetrics>({
    credits: 0,
    assets: 0,
    favorites: 0,
    styleProfiles: 0,
  });
  const [recentAssets, setRecentAssets] = useState<HomeAsset[]>([]);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [regenerateDraft, setRegenerateDraft] =
    useState<RegenerateDraft | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function ensureSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;
      if (!session) {
        router.replace("/login?reason=session_expired");
        return;
      }

      setAuthChecked(true);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event: unknown, session: unknown) => {
      if (!mounted) return;

      if (event === "SIGNED_OUT" || !session) {
        router.replace("/login?reason=session_expired");
        return;
      }

      setAuthChecked(true);
      }
    );

    void ensureSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router, supabase.auth]);

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

  useEffect(() => {
    if (!authChecked) return;

    const INACTIVITY_MS = 60 * 60 * 1000;
    let timeoutId: number | null = null;

    const resetTimer = () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }

      timeoutId = window.setTimeout(async () => {
        if (activeView === "agent") {
          resetTimer();
          return;
        }

        await supabase.auth.signOut();
        router.replace("/login?reason=inactivity");
      }, INACTIVITY_MS);
    };

    const events: (keyof WindowEventMap)[] = [
      "mousemove",
      "keydown",
      "click",
      "scroll",
      "touchstart",
    ];

    events.forEach((eventName) => {
      window.addEventListener(eventName, resetTimer, { passive: true });
    });
    resetTimer();

    return () => {
      events.forEach((eventName) => {
        window.removeEventListener(eventName, resetTimer);
      });
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [activeView, authChecked, router, supabase.auth]);

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
    void loadHomeMetrics();
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
    router.replace("/login");
  }

  async function getAccessToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  }

  async function loadHomeMetrics() {
    try {
      setHomeLoading(true);
      const token = await getAccessToken();
      if (!token) return;

      const [creditsRes, galleryRes, charactersRes] = await Promise.all([
        fetch("/api/credits", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/generations?limit=8&offset=0", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/characters", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const creditsData = await creditsRes.json();
      const galleryData = await galleryRes.json();
      const charactersData = await charactersRes.json();

      const assets: HomeAsset[] = Array.isArray(galleryData.generations)
        ? galleryData.generations
        : [];
      const styleProfiles: unknown[] = Array.isArray(charactersData.characters)
        ? charactersData.characters
        : [];

      setHomeMetrics({
        credits: typeof creditsData.credits === "number" ? creditsData.credits : 0,
        assets: assets.length,
        favorites: assets.filter((asset) => Boolean(asset.is_favorite)).length,
        styleProfiles: styleProfiles.length,
      });
      setRecentAssets(assets.slice(0, 4));
    } catch (error) {
      console.error("Dashboard home metrics error:", error);
    } finally {
      setHomeLoading(false);
    }
  }

  useEffect(() => {
    void loadHomeMetrics();
  }, []);

  function openAgentWithTab(
    tab: "image" | "video" | "creator_video" | "lip_sync" | "talking_creator"
  ) {
    setPreferredStudioTab(tab);
    setActiveView("agent");
    setMobileSidebarOpen(false);
  }

  function openAgentWithPrompt(prompt: string) {
    setRegenerateDraft({
      prompt,
      characterId: null,
      source: "gallery",
      loadedAt: Date.now(),
    });
    setPreferredStudioTab("image");
    setActiveView("agent");
    setMobileSidebarOpen(false);
    showStatus(copy.page.promptLoaded);
  }

  function renderContent() {
    if (activeView === "home") {
      return (
        <CreatorHubHome
          metrics={homeMetrics}
          loading={homeLoading}
          recentAssets={recentAssets}
          videoStudioEnabled={VIDEO_STUDIO_PUBLIC_ENABLED}
          lipSyncEnabled={LIP_SYNC_PUBLIC_ENABLED}
          creatorVideoEnabled={CREATOR_VIDEO_PUBLIC_ENABLED}
          talkingCreatorEnabled={TALKING_CREATOR_PUBLIC_ENABLED}
          onOpenAgent={openAgentWithTab}
          onOpenAgentWithPrompt={openAgentWithPrompt}
          onOpenView={openView}
          onRegenerate={(prompt) => handleRegenerate(prompt, null)}
        />
      );
    }

    if (activeView === "agent") {
      return (
        <>
          <AiAgentStudio
            preferredStudioTab={preferredStudioTab}
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
          <div className="mb-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => openAgentWithTab("image")}
              className="rounded-full border border-[#d8ad5f]/30 bg-[#d8ad5f]/10 px-3 py-1.5 text-[11px] font-black text-[#f0d7a8]"
            >
              {copy.toolsPage.openInAgent} · Image Studio
            </button>
            <button
              type="button"
              onClick={() => openAgentWithTab("video")}
              disabled={!VIDEO_STUDIO_PUBLIC_ENABLED}
              className="rounded-full border border-[#d8ad5f]/30 bg-[#d8ad5f]/10 px-3 py-1.5 text-[11px] font-black text-[#f0d7a8] disabled:opacity-40"
            >
              {copy.toolsPage.openInAgent} · Video Studio
            </button>
            <button
              type="button"
              onClick={() => openAgentWithTab("creator_video")}
              disabled={!CREATOR_VIDEO_PUBLIC_ENABLED}
              className="rounded-full border border-[#d8ad5f]/30 bg-[#d8ad5f]/10 px-3 py-1.5 text-[11px] font-black text-[#f0d7a8] disabled:opacity-40"
            >
              {copy.toolsPage.openInAgent} · Creator Video
            </button>
            <button
              type="button"
              onClick={() => openAgentWithTab("lip_sync")}
              disabled={!LIP_SYNC_PUBLIC_ENABLED}
              className="rounded-full border border-[#d8ad5f]/30 bg-[#d8ad5f]/10 px-3 py-1.5 text-[11px] font-black text-[#f0d7a8] disabled:opacity-40"
            >
              {copy.toolsPage.openInAgent} · Lip Sync
            </button>
          </div>
          <ToolsRoadmap
            copy={copy}
            videoStudioEnabled={VIDEO_STUDIO_PUBLIC_ENABLED}
            creatorVideoEnabled={CREATOR_VIDEO_PUBLIC_ENABLED}
            lipSyncEnabled={LIP_SYNC_PUBLIC_ENABLED}
            onOpenAgent={() => openAgentWithTab("image")}
            onOpenCreatorVideo={() => openAgentWithTab("creator_video")}
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

            <DashboardSidebarTools
              videoStudioEnabled={VIDEO_STUDIO_PUBLIC_ENABLED}
              lipSyncEnabled={LIP_SYNC_PUBLIC_ENABLED}
              creatorVideoEnabled={CREATOR_VIDEO_PUBLIC_ENABLED}
              talkingCreatorEnabled={TALKING_CREATOR_PUBLIC_ENABLED}
              onOpenAgent={openAgentWithTab}
              onOpenView={openView}
            />
          </div>
        </div>

        <div className="mt-auto space-y-2 pt-6">
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
    !authChecked ? (
      <main className="flex h-screen items-center justify-center bg-[#050505] text-white">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white/80">
          Loading your studio session…
        </div>
      </main>
    ) : (
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
    )
  );
}
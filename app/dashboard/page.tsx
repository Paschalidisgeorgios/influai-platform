"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Menu, Sparkles, X } from "lucide-react";
import CampaignPlanner from "./CampaignPlanner";
import CharacterManager from "./CharacterManager";
import CompactCredits from "./CompactCredits";
import { DashboardLanguageProvider, useDashboardLanguage } from "./DashboardLanguageProvider";
import CreditsCard from "./CreditsCard";
import GenerationGallery from "./GenerationGallery";
import LanguageSelector from "./LanguageSelector";
import ToolsRoadmap from "./ToolsRoadmap";
import CreatorHubHome from "./components/CreatorHubHome";
import DashboardToolRail, { type ToolRailView } from "./components/DashboardToolRail";
import MotionTransferWorkspace from "./components/MotionTransferWorkspace";
import StudioWorkspaceView from "./components/StudioWorkspaceView";
import { createClient } from "@/lib/supabase/client";
import type { DashboardCopy } from "./i18n";

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
  | ToolRailView
  | "planner";

const STUDIO_FULL_VIEWS: DashboardView[] = [
  "image_studio",
  "video_studio",
  "lip_sync",
  "creator_video",
  "talking_creator",
];

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

function getSidebarBadgeClass(variant: SidebarBadgeVariant) {
  if (variant === "beta") {
    return "border-violet-500/30 bg-violet-500/10 text-violet-100";
  }

  if (variant === "credits") {
    return "border-emerald-500/25 bg-emerald-500/10 text-emerald-200";
  }

  return "border-emerald-500/25 bg-emerald-500/10 text-emerald-200";
}

function getViewLabel(view: DashboardView, copy: DashboardCopy) {
  const labels: Record<string, string> = {
    home: copy.toolRail.home,
    image_studio: copy.toolRail.imageStudio,
    video_studio: copy.toolRail.videoStudio,
    lip_sync: copy.toolRail.lipSync,
    creator_video: copy.toolRail.creatorVideo,
    talking_creator: copy.toolRail.talkingCreator,
    motion_transfer: copy.toolRail.motionTransfer,
    gallery: copy.toolRail.gallery,
    style_profiles: copy.toolRail.styleProfiles,
    credits: copy.toolRail.credits,
    tools: copy.toolRail.toolsOverview,
    planner: copy.page.planner.title,
  };
  return labels[view] ?? copy.toolRail.home;
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

  const [activeView, setActiveView] = useState<DashboardView>("home");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
        if (STUDIO_FULL_VIEWS.includes(activeView)) {
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

  const activeLabel = useMemo(
    () => getViewLabel(activeView, copy),
    [activeView, copy]
  );

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

    setActiveView("image_studio");
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

    setActiveView("image_studio");
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

  function openAgentWithPrompt(prompt: string) {
    setRegenerateDraft({
      prompt,
      characterId: null,
      source: "gallery",
      loadedAt: Date.now(),
    });
    setActiveView("image_studio");
    setMobileSidebarOpen(false);
    showStatus(copy.page.promptLoaded);
  }

  const studioWorkspaceProps = {
    charactersRefreshKey,
    regenerateDraft,
    onClearRegenerateDraft: handleClearRegenerateDraft,
    onGenerationQueued: handleGenerationQueued,
    onOpenGallery: () => openView("gallery"),
    onOpenCredits: () => openView("credits"),
  };

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
          onOpenTool={openView}
          onOpenAgentWithPrompt={openAgentWithPrompt}
          onRegenerate={(prompt) => handleRegenerate(prompt, null)}
        />
      );
    }

    if (activeView === "image_studio") {
      return <StudioWorkspaceView workspace="image" {...studioWorkspaceProps} />;
    }

    if (activeView === "video_studio") {
      return <StudioWorkspaceView workspace="video" {...studioWorkspaceProps} />;
    }

    if (activeView === "lip_sync") {
      return <StudioWorkspaceView workspace="lip_sync" {...studioWorkspaceProps} />;
    }

    if (activeView === "creator_video") {
      return (
        <StudioWorkspaceView workspace="creator_video" {...studioWorkspaceProps} />
      );
    }

    if (activeView === "talking_creator") {
      return (
        <StudioWorkspaceView workspace="talking_creator" {...studioWorkspaceProps} />
      );
    }

    if (activeView === "motion_transfer") {
      return <MotionTransferWorkspace />;
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
            creatorVideoEnabled={CREATOR_VIDEO_PUBLIC_ENABLED}
            lipSyncEnabled={LIP_SYNC_PUBLIC_ENABLED}
            talkingCreatorEnabled={TALKING_CREATOR_PUBLIC_ENABLED}
            onOpenImageStudio={() => openView("image_studio")}
            onOpenVideoStudio={() => openView("video_studio")}
            onOpenLipSync={() => openView("lip_sync")}
            onOpenCreatorVideo={() => openView("creator_video")}
            onOpenTalkingCreator={() => openView("talking_creator")}
            onOpenGallery={() => openView("gallery")}
            onOpenStyleProfiles={() => openView("style_profiles")}
            onOpenCredits={() => openView("credits")}
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

    if (activeView === "style_profiles") {
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
            <DashboardToolRail
              activeView={
                activeView === "planner" ? "tools" : (activeView as ToolRailView)
              }
              videoStudioEnabled={VIDEO_STUDIO_PUBLIC_ENABLED}
              lipSyncEnabled={LIP_SYNC_PUBLIC_ENABLED}
              creatorVideoEnabled={CREATOR_VIDEO_PUBLIC_ENABLED}
              talkingCreatorEnabled={TALKING_CREATOR_PUBLIC_ENABLED}
              onNavigate={openView}
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
              STUDIO_FULL_VIEWS.includes(activeView)
                ? "min-h-screen"
                : "min-h-0 h-full overflow-y-auto overscroll-contain px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:pt-24"
            }
          >
            {!STUDIO_FULL_VIEWS.includes(activeView) ? (
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
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Menu, Sparkles, X } from "lucide-react";
import CharacterManager from "./CharacterManager";
import { DashboardLanguageProvider, useDashboardLanguage } from "./DashboardLanguageProvider";
import CreditsCard from "./CreditsCard";
import GenerationGallery from "./GenerationGallery";
import LanguageSelector from "./LanguageSelector";
import ToolsRoadmap from "./ToolsRoadmap";
import CreateStudioHub, { type CreateStudioTab } from "./components/CreateStudioHub";
import CreatorHubHome from "./components/CreatorHubHome";
import DashboardSidebar, { type DashboardNavView } from "./components/DashboardSidebar";
import DashboardTopBar from "./components/DashboardTopBar";
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

type DashboardView = DashboardNavView;

const STUDIO_FULL_VIEWS: DashboardView[] = ["create_studio"];

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
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (variant === "credits") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return "border-green-200 bg-green-50 text-green-700";
}

function getViewLabel(view: DashboardView, copy: DashboardCopy) {
  const nav = copy.dashboardNav;
  const labels: Record<DashboardView, string> = {
    home: nav.dashboard.label,
    create_studio: nav.createStudio.label,
    gallery: nav.gallery.label,
    style_profiles: nav.styleProfiles.label,
    credits: nav.credits.label,
    upcoming: nav.upcoming.label,
  };
  return labels[view];
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
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
        <div className="relative">
          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">
              {eyebrow}
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {title}
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
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
  const router = useRouter();

  const [activeView, setActiveView] = useState<DashboardView>("home");
  const [createStudioTab, setCreateStudioTab] = useState<CreateStudioTab>("image");
  const [homeSearchQuery, setHomeSearchQuery] = useState("");
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

  function openCreateStudio(tab: CreateStudioTab) {
    setCreateStudioTab(tab);
    setActiveView("create_studio");
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

    openCreateStudio("image");
    showStatus(copy.page.promptLoaded);
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
    if (!authChecked) return;
    void loadHomeMetrics();
  }, [authChecked, creditsRefreshKey]);

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
          loading={homeLoading}
          recentAssets={recentAssets}
          searchQuery={homeSearchQuery}
          videoStudioEnabled={VIDEO_STUDIO_PUBLIC_ENABLED}
          lipSyncEnabled={LIP_SYNC_PUBLIC_ENABLED}
          onOpenStudio={openCreateStudio}
          onRegenerate={(prompt) => handleRegenerate(prompt, null)}
        />
      );
    }

    if (activeView === "create_studio") {
      return (
        <CreateStudioHub
          initialTab={createStudioTab}
          videoStudioEnabled={VIDEO_STUDIO_PUBLIC_ENABLED}
          lipSyncEnabled={LIP_SYNC_PUBLIC_ENABLED}
          {...studioWorkspaceProps}
        />
      );
    }

    if (activeView === "upcoming") {
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
            onOpenImageStudio={() => openCreateStudio("image")}
            onOpenVideoStudio={() => openCreateStudio("video")}
            onOpenLipSync={() => openCreateStudio("lip_sync")}
            onOpenCreatorVideo={() => openCreateStudio("image")}
            onOpenTalkingCreator={() => openCreateStudio("lip_sync")}
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
          <div className="pb-12">
          <CharacterManager
            onCharactersChange={() => {
              setCharactersRefreshKey((current) => current + 1);
              showStatus(copy.page.styleProfilesUpdated);
            }}
          />
          </div>
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

          <div className="mt-6">
            <DashboardSidebar activeView={activeView} onNavigate={openView} />
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
      <main className="flex h-screen items-center justify-center bg-gray-50 text-slate-900">
        <div className="rounded-2xl border border-gray-100 bg-white px-5 py-3 text-sm font-semibold text-slate-600 shadow-sm">
          Loading your studio session…
        </div>
      </main>
    ) : (
    <main className="flex h-screen flex-col overflow-hidden bg-gray-50 text-slate-900">
      <div className="relative z-10 flex min-h-0 flex-1 overflow-hidden">
        <aside className="hidden h-full w-[280px] shrink-0 border-r border-slate-800 bg-slate-900 p-4 lg:block">
          <div className="sticky top-4 h-[calc(100vh-32px)] overflow-y-auto overscroll-contain pr-1">
            <SidebarContent />
          </div>
        </aside>

        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
            role="presentation"
          >
            <div
              className="absolute left-0 top-0 flex h-full w-[88%] max-w-[340px] flex-col border-r border-slate-800 bg-slate-900 p-4"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-white">{copy.sidebar.studioMenu}</p>

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

        <section className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-gray-50">
          {activeView === "home" ? (
            <DashboardTopBar
              credits={homeMetrics.credits}
              creditsLoading={homeLoading}
              searchQuery={homeSearchQuery}
              onSearchChange={setHomeSearchQuery}
              onAddCredits={() => openView("credits")}
              onOpenMenu={() => setMobileSidebarOpen(true)}
            />
          ) : (
            <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-gray-100 bg-white px-4 py-3 sm:px-6">
              <div className="flex min-w-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(true)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-slate-600 lg:hidden"
                >
                  <Menu className="h-4 w-4" />
                </button>
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600">
                    InfluExAi
                  </p>
                  <h1 className="truncate text-base font-semibold text-slate-900 sm:text-lg">
                    {activeLabel}
                  </h1>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <LanguageSelector compact />
              </div>
            </header>
          )}

          <div
            className={
              STUDIO_FULL_VIEWS.includes(activeView)
                ? "flex min-h-0 flex-1 flex-col overflow-hidden p-4 sm:p-6"
                : "min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-6 md:px-8"
            }
          >
            <div
              className={
                STUDIO_FULL_VIEWS.includes(activeView)
                  ? "flex min-h-0 flex-1 flex-col"
                  : "mx-auto w-full max-w-[1200px]"
              }
            >
              {statusMessage ? (
                <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
                  {statusMessage}
                </div>
              ) : null}

              {renderContent()}
            </div>
          </div>
        </section>
      </div>
    </main>
    )
  );
}
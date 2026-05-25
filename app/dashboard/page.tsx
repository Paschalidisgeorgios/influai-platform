"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bot,
  Boxes,
  CreditCard,
  Film,
  GalleryVerticalEnd,
  Home,
  Lock,
  LogOut,
  Menu,
  Mic2,
  Rocket,
  Sparkles,
  UserRound,
  Wand2,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import AiAgentStudio from "./AiAgentStudio";
import CharacterManager from "./CharacterManager";
import CompactCredits from "./CompactCredits";
import CreditsCard from "./CreditsCard";
import GenerationGallery from "./GenerationGallery";
import { createClient } from "@/lib/supabase/client";

type RegenerateDraft = {
  prompt: string;
  characterId: string | null;
};

type DashboardView = "agent" | "gallery" | "characters" | "credits";

type LiveSidebarItem = {
  id: DashboardView;
  label: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
};

type ComingSoonItem = {
  label: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
};

const liveItems: LiveSidebarItem[] = [
  {
    id: "agent",
    label: "AI Agent",
    description: "Generate campaign visuals",
    icon: Bot,
    badge: "Live",
  },
  {
    id: "gallery",
    label: "Asset Gallery",
    description: "Manage generated assets",
    icon: GalleryVerticalEnd,
  },
  {
    id: "characters",
    label: "Style Profiles",
    description: "Reusable creative direction",
    icon: UserRound,
  },
  {
    id: "credits",
    label: "Credits",
    description: "Balance and packages",
    icon: CreditCard,
  },
];

const comingSoonItems: ComingSoonItem[] = [
  {
    label: "Video Studio",
    description: "Short-form video and motion campaign workflows",
    icon: Film,
    badge: "Soon",
  },
  {
    label: "Lip Sync Studio",
    description: "Voice, avatar and talking-content workflows",
    icon: Mic2,
    badge: "Soon",
  },
  {
    label: "Brand Assets",
    description: "Brand kits, reusable campaign rules and assets",
    icon: Boxes,
    badge: "Soon",
  },
  {
    label: "Automation",
    description: "Batch generation and scheduled campaign systems",
    icon: Wand2,
    badge: "Soon",
  },
];

function ViewShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
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
          </div>
        </div>
      </div>

      {children}
    </section>
  );
}

export default function DashboardPage() {
  const supabase = createClient();

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
      setStatusMessage("Credits purchased successfully.");
      setCreditsRefreshKey((current) => current + 1);
      setActiveView("credits");
    }

    if (checkout === "cancelled") {
      setStatusMessage("Checkout cancelled.");
      setActiveView("credits");
    }

    if (checkout) {
      window.history.replaceState({}, "", "/dashboard");
    }
  }, []);

  const activeLabel = useMemo(() => {
    return liveItems.find((item) => item.id === activeView)?.label ?? "AI Agent";
  }, [activeView]);

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
    showStatus("Generation queued successfully.");
  }

  function handleRegenerate(prompt: string, characterId: string | null) {
    setRegenerateDraft({
      prompt,
      characterId,
    });

    setActiveView("agent");
    showStatus("Prompt loaded back into the AI Agent.");
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
        <AiAgentStudio
          charactersRefreshKey={charactersRefreshKey}
          regenerateDraft={regenerateDraft}
          onClearRegenerateDraft={handleClearRegenerateDraft}
          onGenerationQueued={handleGenerationQueued}
          onOpenGallery={() => setActiveView("gallery")}
        />
      );
    }

    if (activeView === "gallery") {
      return (
        <ViewShell
          eyebrow="Creator Assets"
          title="Asset Gallery"
          description="Review generated visuals, manage processing jobs, save favorites, regenerate prompts and download your best campaign assets."
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
          eyebrow="Reusable Creative Direction"
          title="Style Profiles"
          description="Create reusable visual profiles that guide appearance, styling, mood and brand direction for consistent creative output."
        >
          <CharacterManager
            onCharactersChange={() => {
              setCharactersRefreshKey((current) => current + 1);
              showStatus("Style profiles updated.");
            }}
          />
        </ViewShell>
      );
    }

    return (
      <ViewShell
        eyebrow="Billing"
        title="Credits & Plans"
        description="Manage your available credits and purchase the right package for your creator workflow."
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
                Enterprise Creator Studio
              </p>
            </div>
          </Link>

          <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/[0.08] text-sm font-black text-white">
                G
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-black text-white">
                  Georgios Paschalidis
                </p>
                <p className="text-xs font-medium text-white/35">
                  Workspace Owner
                </p>
              </div>
            </div>
          </div>

          <div className="mt-7">
            <p className="mb-3 px-3 text-[10px] font-black uppercase tracking-[0.3em] text-white/25">
              Live Studio
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

                        {item.badge && (
                          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-emerald-200">
                            {item.badge}
                          </span>
                        )}
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
            <p className="mb-3 px-3 text-[10px] font-black uppercase tracking-[0.3em] text-white/25">
              Expansion Modules
            </p>

            <div className="space-y-2">
              {comingSoonItems.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.label}
                    type="button"
                    disabled
                    className="group flex w-full cursor-not-allowed items-center gap-3 rounded-[1.3rem] border border-white/5 bg-white/[0.02] px-3 py-3 text-left text-white/30"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/[0.035] text-white/30">
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-bold">
                          {item.label}
                        </p>

                        <span className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-white/30">
                          {item.badge ?? "Soon"}
                        </span>
                      </div>

                      <p className="truncate text-xs text-white/25">
                        {item.description}
                      </p>
                    </div>

                    <Lock className="h-3.5 w-3.5 text-white/20" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-auto space-y-2 pt-8">
          <div className="rounded-[1.3rem] border border-[#d8ad5f]/20 bg-[#d8ad5f]/10 p-4">
            <div className="flex items-center gap-2 text-[#d8ad5f]">
              <Rocket className="h-4 w-4" />
              <p className="text-xs font-black uppercase tracking-[0.18em]">
                Roadmap
              </p>
            </div>

            <p className="mt-2 text-xs leading-5 text-white/40">
              Video, lip sync and automation modules are planned after the image
              studio is fully polished.
            </p>
          </div>

          <Link
            href="/"
            className="flex items-center gap-3 rounded-[1.3rem] border border-white/10 bg-white/[0.035] px-4 py-3 text-sm font-bold text-white/65 transition hover:border-white/20 hover:text-white"
          >
            <Home className="h-4 w-4" />
            Home
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-[1.3rem] border border-white/10 bg-white/[0.035] px-4 py-3 text-sm font-bold text-white/65 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-100"
          >
            <LogOut className="h-4 w-4" />
            Logout
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
                <p className="text-sm font-black text-white">Studio Menu</p>

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
          <div className="fixed right-5 top-5 z-50 hidden lg:block">
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

              <div className="shrink-0">
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
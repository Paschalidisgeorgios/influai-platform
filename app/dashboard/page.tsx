"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bot,
  CreditCard,
  GalleryVerticalEnd,
  Home,
  LogOut,
  Menu,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import AiAgentStudio from "./AiAgentStudio";
import CharacterManager from "./CharacterManager";
import CreditsCard from "./CreditsCard";
import GenerationGallery from "./GenerationGallery";
import { createClient } from "@/lib/supabase/client";

type RegenerateDraft = {
  prompt: string;
  characterId: string | null;
};

type DashboardView = "agent" | "gallery" | "characters" | "credits";

type SidebarItem = {
  id: DashboardView;
  label: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
};

const sidebarItems: SidebarItem[] = [
  {
    id: "agent",
    label: "AI Agent",
    description: "Create visuals",
    icon: Bot,
    badge: "Live",
  },
  {
    id: "gallery",
    label: "Gallery",
    description: "Generated assets",
    icon: GalleryVerticalEnd,
  },
  {
    id: "characters",
    label: "Style Profiles",
    description: "Reusable looks",
    icon: UserRound,
  },
  {
    id: "credits",
    label: "Credits",
    description: "Balance & plans",
    icon: CreditCard,
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
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.28)]">
        <p className="text-[10px] font-black uppercase tracking-[0.34em] text-[#d8ad5f]">
          {eyebrow}
        </p>

        <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
          {title}
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45">
          {description}
        </p>
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
    return (
      sidebarItems.find((item) => item.id === activeView)?.label ?? "AI Agent"
    );
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
        />
      );
    }

    if (activeView === "gallery") {
      return (
        <ViewShell
          eyebrow="Creator Assets"
          title="Gallery"
          description="Review generated visuals, manage processing jobs, save favorites, regenerate prompts and download your best results."
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
          eyebrow="Reusable Style Profiles"
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
        description="Manage your balance and purchase the right credit package for your creator workflow."
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
                Creator Studio
              </p>
            </div>
          </Link>

          <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/[0.08] text-sm font-black text-white">
                G
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-black text-white">
                  Georgios Paschalidis
                </p>
                <p className="text-xs font-medium text-white/35">
                  AI Creator
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <p className="mb-3 px-3 text-[10px] font-black uppercase tracking-[0.3em] text-white/25">
              Workspace
            </p>

            <nav className="space-y-2">
              {sidebarItems.map((item) => {
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
        </div>

        <div className="mt-auto space-y-2 pt-8">
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
        <aside className="hidden w-[300px] border-r border-white/10 bg-black/75 p-4 backdrop-blur-2xl lg:block">
          <div className="sticky top-4 h-[calc(100vh-32px)]">
            <SidebarContent />
          </div>
        </aside>

        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden">
            <div className="absolute left-0 top-0 h-full w-[88%] max-w-[330px] border-r border-white/10 bg-[#070707] p-4">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-black text-white">Menu</p>

                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/70"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="h-[calc(100%-56px)] overflow-y-auto">
                <SidebarContent />
              </div>
            </div>
          </div>
        )}

        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b border-white/10 bg-black/60 backdrop-blur-2xl lg:hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(true)}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/70"
                >
                  <Menu className="h-4 w-4" />
                </button>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-[#d8ad5f]">
                    InfluExAi
                  </p>
                  <h1 className="text-lg font-black tracking-tight text-white">
                    {activeLabel}
                  </h1>
                </div>
              </div>

              <button
                type="button"
                onClick={() => openView("credits")}
                className="rounded-full bg-[#d8ad5f] px-4 py-2 text-xs font-black text-black"
              >
                Credits
              </button>
            </div>
          </header>

          <div
            className={
              activeView === "agent"
                ? "h-screen min-h-screen"
                : "mx-auto max-w-[1700px] px-4 py-5 sm:px-6 lg:px-8"
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
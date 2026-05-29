"use client";

import Link from "next/link";
import { LogOut, Menu, Sparkles, X } from "lucide-react";
import { useDashboardLanguage } from "../../DashboardLanguageProvider";
import LanguageSelector from "../../LanguageSelector";
import {
  getCreationEngineTools,
  getOptionalTools,
  PRIMARY_NAV_ITEMS,
} from "@/lib/dashboard/tool-suite";
import { pathnameToMatrixTool, type ActiveTool } from "@/lib/dashboard/creative-tool-matrix";
import { useCreativeSuite } from "./CreativeSuiteProvider";
import { createClient } from "@/lib/supabase/client";
import { usePathname, useRouter } from "next/navigation";

type CreativeSuiteSidebarProps = {
  mobileOpen: boolean;
  onMobileClose: () => void;
};

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: typeof Sparkles;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition ${
        active
          ? "bg-white/10 text-white"
          : "text-white/80 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </Link>
  );
}

function isPrimaryActive(pathname: string, id: string): boolean {
  if (id === "home") return pathname === "/dashboard" || pathname === "/dashboard/home";
  if (id === "assets")
    return pathname.startsWith("/dashboard/assets") || pathname.startsWith("/dashboard/gallery");
  return pathname.startsWith(`/dashboard/${id === "train" ? "train" : id}`);
}

function isToolActive(pathname: string, key: ActiveTool): boolean {
  const current = pathnameToMatrixTool(pathname);
  return current === key;
}

export function CreativeSuiteSidebarPanel({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname() ?? "/dashboard";
  const { language, copy } = useDashboardLanguage();
  const { credits, creditsLoading } = useCreativeSuite();
  const router = useRouter();
  const supabase = createClient();

  const engineTools = getCreationEngineTools();
  const optionalTools = getOptionalTools();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  const labelFor = (item: { labelEn: string; labelDe: string }) =>
    language === "de" ? item.labelDe : item.labelEn;

  return (
    <div className="flex h-full flex-col">
      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
        <Link href="/" onClick={onNavigate} className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-black shadow-lg shadow-orange-500/20">
            <Sparkles className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold tracking-tight text-white">
              InfluExAi
            </p>
            <p className="text-[11px] font-medium text-white/45">AI Campaign Studio</p>
          </div>
        </Link>
      </div>

      <p className="px-3 pb-2 pt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-white/35">
        Core
      </p>
      <nav className="space-y-0.5">
        {PRIMARY_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.id}
            href={item.href}
            label={labelFor(item)}
            icon={item.icon}
            active={isPrimaryActive(pathname, item.id)}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <p className="px-3 pb-2 pt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-white/35">
        {language === "de" ? "Creation Engines" : "Creation Engines"}
      </p>
      <nav className="space-y-0.5">
        {engineTools.map((tool) => (
          <NavLink
            key={tool.key}
            href={tool.href}
            label={labelFor(tool)}
            icon={tool.icon}
            active={isToolActive(pathname, tool.key)}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <p className="px-3 pb-2 pt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-white/35">
        {language === "de" ? "Optional" : "Optional"}
      </p>
      <nav className="space-y-0.5 pb-2">
        {optionalTools.map((tool) => (
          <NavLink
            key={tool.key}
            href={tool.href}
            label={labelFor(tool)}
            icon={tool.icon}
            active={isToolActive(pathname, tool.key)}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <div className="mt-auto space-y-3 pt-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
            {copy.dashboardNav.credits.label}
          </p>
          <p className="mt-1 text-lg font-extrabold text-orange-400">
            {creditsLoading ? "…" : credits}
            <span className="ml-1 text-xs font-semibold text-white/50">
              {language === "de" ? "Credits" : "credits"}
            </span>
          </p>
          <Link
            href="/dashboard/credits"
            onClick={onNavigate}
            className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-orange-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-orange-600"
          >
            {language === "de" ? "Credits aufladen" : "Get credits"}
          </Link>
        </div>

        <LanguageSelector compact />

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-white/60 transition hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          {copy.sidebar.logout}
        </button>
      </div>
    </div>
  );
}

export default function CreativeSuiteSidebar({
  mobileOpen,
  onMobileClose,
}: CreativeSuiteSidebarProps) {
  return (
    <>
      <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-white/10 bg-slate-900 lg:flex">
        <div className="flex h-full flex-col overflow-y-auto p-4">
          <CreativeSuiteSidebarPanel />
        </div>
      </aside>

      {mobileOpen ? (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
          role="presentation"
        >
          <div
            className="absolute left-0 top-0 flex h-full w-[min(100%,280px)] flex-col border-r border-white/10 bg-slate-900 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-white">Menu</span>
              <button
                type="button"
                onClick={onMobileClose}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white/70"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <CreativeSuiteSidebarPanel onNavigate={onMobileClose} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function CreativeSuiteMobileHeader({
  title,
  onOpenMenu,
}: {
  title: string;
  onOpenMenu: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
      <button
        type="button"
        onClick={onOpenMenu}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-slate-700"
        aria-label="Open menu"
      >
        <Menu className="h-4 w-4" aria-hidden />
      </button>
      <p className="truncate text-sm font-bold text-slate-900">{title}</p>
      <div className="w-10" />
    </header>
  );
}

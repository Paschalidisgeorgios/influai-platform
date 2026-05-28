"use client";

import {
  CreditCard,
  GalleryVerticalEnd,
  LayoutGrid,
  Sparkles,
  UserRound,
  Wand2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useDashboardLanguage } from "../DashboardLanguageProvider";

export type DashboardNavView =
  | "home"
  | "create_studio"
  | "gallery"
  | "style_profiles"
  | "credits"
  | "upcoming";

type NavItem = {
  id: DashboardNavView;
  label: string;
  sublabel: string;
  icon: LucideIcon;
};

type DashboardSidebarProps = {
  activeView: DashboardNavView;
  onNavigate: (view: DashboardNavView) => void;
};

export default function DashboardSidebar({
  activeView,
  onNavigate,
}: DashboardSidebarProps) {
  const { copy } = useDashboardLanguage();
  const nav = copy.dashboardNav;

  const items: NavItem[] = [
    { id: "home", label: nav.dashboard.label, sublabel: nav.dashboard.sublabel, icon: LayoutGrid },
    {
      id: "create_studio",
      label: nav.createStudio.label,
      sublabel: nav.createStudio.sublabel,
      icon: Wand2,
    },
    {
      id: "gallery",
      label: nav.gallery.label,
      sublabel: nav.gallery.sublabel,
      icon: GalleryVerticalEnd,
    },
    {
      id: "style_profiles",
      label: nav.styleProfiles.label,
      sublabel: nav.styleProfiles.sublabel,
      icon: UserRound,
    },
    {
      id: "credits",
      label: nav.credits.label,
      sublabel: nav.credits.sublabel,
      icon: CreditCard,
    },
    {
      id: "upcoming",
      label: nav.upcoming.label,
      sublabel: nav.upcoming.sublabel,
      icon: Sparkles,
    },
  ];

  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        const active = activeView === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
            className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200 ${
              active
                ? "bg-slate-800 text-white shadow-inner ring-1 ring-[#d8ad5f]/40"
                : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
            }`}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                active ? "bg-[#d8ad5f] text-slate-900" : "bg-slate-800 text-slate-400 group-hover:text-slate-200"
              }`}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{item.label}</p>
              <p className="truncate text-[11px] text-slate-500 group-hover:text-slate-400">
                {item.sublabel}
              </p>
            </div>
          </button>
        );
      })}
    </nav>
  );
}

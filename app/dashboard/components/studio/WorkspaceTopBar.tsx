"use client";

import { Search, Zap } from "lucide-react";
import { useDashboardLanguage } from "../../DashboardLanguageProvider";
import { useCreativeSuite } from "../creative-suite/CreativeSuiteProvider";
import WorkspaceLanguageSwitcher from "./WorkspaceLanguageSwitcher";

type WorkspaceTopBarProps = {
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  showSearch?: boolean;
};

export default function WorkspaceTopBar({
  searchQuery = "",
  onSearchChange,
  showSearch = true,
}: WorkspaceTopBarProps) {
  const { language, copy } = useDashboardLanguage();
  const { credits, creditsLoading } = useCreativeSuite();
  const t = copy.dashboardNav.topBar;

  const creditsLabel =
    language === "de"
      ? `⚡ ${creditsLoading ? "…" : credits} Credits verfügbar`
      : `⚡ ${creditsLoading ? "…" : credits} Credits available`;

  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
          {t.welcome}
        </h1>
        <p className="mt-1 text-sm font-medium text-slate-600">{t.subline}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        {showSearch && onSearchChange ? (
          <label className="relative min-w-0 flex-1 sm:w-48 sm:flex-none">
            <span className="sr-only">{t.searchPlaceholder}</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full rounded-full border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20"
            />
          </label>
        ) : null}

        <div
          className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700"
          title={creditsLabel}
        >
          <Zap className="h-3.5 w-3.5 text-orange-600" aria-hidden />
          <span>{creditsLabel}</span>
        </div>

        <WorkspaceLanguageSwitcher />
      </div>
    </header>
  );
}

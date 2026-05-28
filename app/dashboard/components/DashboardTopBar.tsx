"use client";

import { Menu, Search, Zap } from "lucide-react";
import { useDashboardLanguage } from "../DashboardLanguageProvider";
import LanguageSelector from "../LanguageSelector";
import { formatCopy } from "../i18n";

type DashboardTopBarProps = {
  credits: number;
  creditsLoading?: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onAddCredits: () => void;
  onOpenMenu?: () => void;
};

export default function DashboardTopBar({
  credits,
  creditsLoading = false,
  searchQuery,
  onSearchChange,
  onAddCredits,
  onOpenMenu,
}: DashboardTopBarProps) {
  const { copy } = useDashboardLanguage();
  const t = copy.dashboardNav.topBar;

  return (
    <header className="flex flex-col gap-4 border-b border-gray-100 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 md:px-8">
      <div className="flex min-w-0 items-start gap-3">
        {onOpenMenu ? (
          <button
            type="button"
            onClick={onOpenMenu}
            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-slate-600 lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>
        ) : null}
        <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          {t.welcome}
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">{t.subline}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <label className="relative min-w-0 flex-1 sm:w-56 sm:flex-none">
          <span className="sr-only">{t.searchPlaceholder}</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-[#d8ad5f]/50 focus:bg-white focus:ring-2 focus:ring-[#d8ad5f]/20"
          />
        </label>

        <LanguageSelector compact />

        <div
          className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800"
          title={formatCopy(t.creditsAvailable, {
            count: creditsLoading ? "…" : String(credits),
          })}
        >
          <Zap className="h-3.5 w-3.5 text-amber-600" />
          <span>
            {creditsLoading
              ? "…"
              : formatCopy(t.creditsAvailable, { count: String(credits) })}
          </span>
        </div>

        <button
          type="button"
          onClick={onAddCredits}
          className="rounded-full bg-[#d8ad5f] px-4 py-2 text-xs font-bold text-slate-900 transition-all duration-200 hover:bg-[#efc777] hover:shadow-md"
        >
          {t.addCredits}
        </button>
      </div>
    </header>
  );
}

"use client";

import { Languages } from "lucide-react";

import { useDashboardLanguage } from "./DashboardLanguageProvider";
import type { DashboardLanguage } from "./i18n";

type LanguageSelectorProps = {
  compact?: boolean;
};

export default function LanguageSelector({ compact = false }: LanguageSelectorProps) {
  const { language, setLanguage, copy } = useDashboardLanguage();

  function select(next: DashboardLanguage) {
    if (next !== language) setLanguage(next);
  }

  return (
    <div
      className={`flex items-center rounded-full border border-white/10 bg-black/75 backdrop-blur-2xl ${
        compact ? "gap-0.5 p-0.5" : "gap-1 p-1 shadow-[0_10px_32px_rgba(0,0,0,0.4)]"
      }`}
      role="group"
      aria-label={copy.language.label}
    >
      {!compact && (
        <span className="hidden items-center gap-1.5 pl-2.5 pr-0.5 text-white/40 sm:flex">
          <Languages className="h-3 w-3" />
          <span className="text-[9px] font-black uppercase tracking-[0.14em]">
            {copy.language.label}
          </span>
        </span>
      )}

      <button
        type="button"
        onClick={() => select("en")}
        className={`rounded-full px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] transition sm:px-3 sm:text-[11px] ${
          language === "en"
            ? "bg-[#d8ad5f] text-black"
            : "text-white/50 hover:text-[#d8ad5f]"
        }`}
        aria-pressed={language === "en"}
      >
        {copy.language.english}
      </button>

      <button
        type="button"
        onClick={() => select("de")}
        className={`rounded-full px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] transition sm:px-3 sm:text-[11px] ${
          language === "de"
            ? "bg-[#d8ad5f] text-black"
            : "text-white/50 hover:text-[#d8ad5f]"
        }`}
        aria-pressed={language === "de"}
      >
        {copy.language.german}
      </button>
    </div>
  );
}

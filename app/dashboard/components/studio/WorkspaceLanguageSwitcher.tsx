"use client";

import { useDashboardLanguage } from "../../DashboardLanguageProvider";
import type { DashboardLanguage } from "../../i18n";

export default function WorkspaceLanguageSwitcher() {
  const { language, setLanguage } = useDashboardLanguage();

  function select(next: DashboardLanguage) {
    if (next !== language) setLanguage(next);
  }

  return (
    <div
      className="flex items-center gap-1 rounded-full border border-gray-200 bg-white p-1 shadow-sm"
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => select("de")}
        className={`rounded-full px-3 py-1 text-xs font-bold transition ${
          language === "de"
            ? "bg-slate-900 text-white"
            : "text-slate-500 hover:text-slate-900"
        }`}
        aria-pressed={language === "de"}
      >
        DE
      </button>
      <button
        type="button"
        onClick={() => select("en")}
        className={`rounded-full px-3 py-1 text-xs font-bold transition ${
          language === "en"
            ? "bg-slate-900 text-white"
            : "text-slate-500 hover:text-slate-900"
        }`}
        aria-pressed={language === "en"}
      >
        EN
      </button>
    </div>
  );
}

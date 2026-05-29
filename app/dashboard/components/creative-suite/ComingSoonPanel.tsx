"use client";

import { useDashboardLanguage } from "../../DashboardLanguageProvider";

type ComingSoonPanelProps = {
  title: string;
  description: string;
};

export default function ComingSoonPanel({
  title,
  description,
}: ComingSoonPanelProps) {
  const { language } = useDashboardLanguage();
  const badge = language === "de" ? "Vorschau" : "Preview";
  const cta = language === "de" ? "Vorschau" : "Preview";

  return (
    <div className="mx-auto mt-16 max-w-3xl rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
      <span className="mb-4 inline-flex rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
        {badge}
      </span>
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{title}</h1>
      <p className="mt-3 font-medium text-slate-600">{description}</p>
      <button
        type="button"
        disabled
        className="mt-6 cursor-not-allowed rounded-xl bg-gray-100 px-5 py-2 font-semibold text-slate-400"
      >
        {cta}
      </button>
    </div>
  );
}

"use client";

import { useDashboardLanguage } from "../../DashboardLanguageProvider";

type CreativePageHeaderProps = {
  titleEn: string;
  titleDe: string;
  subtitleEn: string;
  subtitleDe: string;
  badge?: React.ReactNode;
};

export default function CreativePageHeader({
  titleEn,
  titleDe,
  subtitleEn,
  subtitleDe,
  badge,
}: CreativePageHeaderProps) {
  const { language } = useDashboardLanguage();
  const title = language === "de" ? titleDe : titleEn;
  const subtitle = language === "de" ? subtitleDe : subtitleEn;

  return (
    <header className="mb-8 max-w-3xl">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h1>
        {badge}
      </div>
      <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
        {subtitle}
      </p>
    </header>
  );
}

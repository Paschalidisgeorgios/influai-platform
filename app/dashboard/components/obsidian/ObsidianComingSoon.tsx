"use client";

import { OBS } from "@/lib/obsidian/dashboard-tokens";
import { useDashboardLanguage } from "../../DashboardLanguageProvider";

type Props = {
  titleEn: string;
  titleDe: string;
};

export default function ObsidianComingSoon({ titleEn, titleDe }: Props) {
  const { language } = useDashboardLanguage();
  const isDe = language === "de";

  return (
    <div className={`mx-auto max-w-lg text-center ${OBS.glassPad}`}>
      <h1 className={OBS.titleHero}>{isDe ? titleDe : titleEn}</h1>
      <p className={`mt-4 ${OBS.mono} text-neutral-500`}>
        {isDe ? "MODUL IN KALIBRIERUNG" : "MODULE CALIBRATING"}
      </p>
    </div>
  );
}

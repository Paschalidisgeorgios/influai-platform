"use client";

import CreditsCard from "../../CreditsCard";
import { OBS } from "@/lib/obsidian/dashboard-tokens";
import { useDashboardLanguage } from "../../DashboardLanguageProvider";

export default function NewBillingView() {
  const { language } = useDashboardLanguage();
  const isDe = language === "de";

  return (
    <div className="mx-auto max-w-5xl">
      <header className={`mb-6 ${OBS.glassPad}`}>
        <p className={`${OBS.mono} text-amber-500/80`}>Billing</p>
        <h1 className={`mt-2 ${OBS.titleHero}`}>
          {isDe ? "Credits & Pakete" : "Credits & plans"}
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          {isDe
            ? "Guthaben, Starter, Professional, Ultimate und Custom Top-Up."
            : "Balance, Starter, Professional, Ultimate, and custom top-up."}
        </p>
      </header>
      <CreditsCard appearance="dark" refreshKey={0} />
    </div>
  );
}

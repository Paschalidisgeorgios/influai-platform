"use client";

import Link from "next/link";
import { GalleryVerticalEnd } from "lucide-react";
import { OBS } from "@/lib/obsidian/dashboard-tokens";
import { useDashboardLanguage } from "../../DashboardLanguageProvider";

export default function NewAssetsEmpty() {
  const { language } = useDashboardLanguage();
  const isDe = language === "de";

  return (
    <div className="mx-auto max-w-2xl">
      <header className={`mb-6 ${OBS.glassPad}`}>
        <p className={`${OBS.mono} text-amber-500/80`}>
          {isDe ? "Bibliothek" : "Library"}
        </p>
        <h1 className={`mt-2 ${OBS.titleHero}`}>Assets</h1>
      </header>

      <div className={`text-center ${OBS.glassPad}`}>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900/60 text-neutral-500">
          <GalleryVerticalEnd className="h-7 w-7" aria-hidden />
        </div>
        <h2 className={`mt-5 text-lg ${OBS.title}`}>
          {isDe ? "Noch keine Assets" : "No assets yet"}
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-400">
          {isDe
            ? "Generierte Assets erscheinen hier nach dem ersten Render."
            : "Generated assets will appear here after your first render."}
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-black text-neutral-950 transition hover:bg-amber-600"
        >
          {isDe ? "Zur Command Workstation" : "Back to workstation"}
        </Link>
      </div>
    </div>
  );
}

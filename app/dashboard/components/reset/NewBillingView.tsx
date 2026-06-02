"use client";

import { Suspense } from "react";
import CreditsCard from "../../CreditsCard";
import PendingPackageCheckoutEffect from "@/app/components/billing/PendingPackageCheckoutEffect";
import { OBS } from "@/lib/obsidian/dashboard-tokens";
import { useDashboardLanguage } from "../../DashboardLanguageProvider";
import { useCreativeSuite } from "../creative-suite/CreativeSuiteProvider";
import { CREDITS_PAGE } from "@/lib/copy/launch-user-copy";
import Link from "next/link";

export default function NewBillingView() {
  const { language } = useDashboardLanguage();
  const isDe = language === "de";
  const lang = isDe ? "de" : "en";
  const { credits, creditsLoading } = useCreativeSuite();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Suspense fallback={null}>
        <PendingPackageCheckoutEffect />
      </Suspense>
      <header
        className={`relative overflow-hidden ${OBS.glassPad} border-white/10 shadow-[0_0_60px_rgba(245,158,11,0.08)]`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"
        />
        <p className={`${OBS.mono} text-amber-500/80`}>AI Creator Studio</p>
        <h1 className={`mt-2 ${OBS.titleHero}`}>
          {CREDITS_PAGE.title[lang]}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-400">
          {CREDITS_PAGE.subtitle[lang]}
        </p>

        <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className={`${OBS.mono} text-neutral-500`}>
              {CREDITS_PAGE.balance[lang]}
            </p>
            <p className="mt-1 text-4xl font-extrabold tracking-tight text-white">
              {creditsLoading ? "…" : credits.toLocaleString(isDe ? "de-DE" : "en-US")}
              <span className="ml-2 text-lg font-semibold text-amber-400/90">
                Credits
              </span>
            </p>
            <p className="mt-2 text-xs text-neutral-500">
              {isDe ? "Credits verfallen nicht" : "Credits never expire"}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Link
              href="#credit-packages"
              className={`inline-flex shrink-0 items-center justify-center px-6 py-3 text-sm ${OBS.amberBtn}`}
            >
              {CREDITS_PAGE.buyCredits[lang]}
            </Link>
            <Link
              href="/pricing"
              className="inline-flex shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-amber-500/40 hover:text-amber-300"
            >
              {CREDITS_PAGE.upgradePlan[lang]}
            </Link>
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] text-neutral-500">
          {CREDITS_PAGE.footerNote[lang]}
        </p>
      </header>

      <CreditsCard appearance="dark" refreshKey={0} />
    </div>
  );
}

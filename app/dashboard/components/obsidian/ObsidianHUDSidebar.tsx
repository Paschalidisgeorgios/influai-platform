"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import CreativeSuiteSidebar from "../creative-suite/CreativeSuiteSidebar";
import type { DashboardLanguage } from "../../i18n";
import { useDashboardLanguage } from "../../DashboardLanguageProvider";
import ObsidianCreditBadge from "./ObsidianCreditBadge";
import { usePricingUi } from "@/app/components/billing/PricingUiProvider";

/** Stable SSR/first-paint language — must match server HTML until mounted. */
const HYDRATION_SAFE_LANGUAGE: DashboardLanguage = "en";

export default function ObsidianHUDSidebar() {
  const pathname = usePathname() ?? "/dashboard";
  const router = useRouter();
  const supabase = createClient();
  const { language, setLanguage } = useDashboardLanguage();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const { openPricing } = usePricingUi();
  const displayLanguage = mounted ? language : HYDRATION_SAFE_LANGUAGE;
  const isDe = displayLanguage === "de";

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <aside className="flex h-full w-[220px] shrink-0 flex-col border-r border-neutral-800/80 bg-[#050505]/95 px-4 py-5 backdrop-blur-2xl">
      <Link href="/" className="mb-2 flex items-baseline gap-0.5 px-1">
        <span className="text-sm font-black leading-none text-white">Influ</span>
        <span className="text-sm font-black leading-none text-amber-400">Ex</span>
        <span className="text-xs font-black leading-none text-amber-600">AI</span>
      </Link>
      <p className="mb-8 px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
        {isDe ? "AI Creator Studio" : "AI Creator Studio"}
      </p>

      <nav className="flex flex-1 flex-col gap-0.5">
        <button
          type="button"
          onClick={() => openPricing()}
          className="group relative rounded-xl px-3 py-2.5 text-left text-neutral-400 transition-all duration-200 hover:bg-neutral-900/60 hover:text-amber-300 hover:shadow-[0_0_16px_rgba(245,158,11,0.1)]"
        >
          <span className="relative block text-xs font-semibold uppercase tracking-wide after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-amber-500/55 after:transition-transform after:duration-200 group-hover:scale-x-100">
            {isDe ? "Preise" : "Pricing"}
          </span>
        </button>
        <CreativeSuiteSidebar language={displayLanguage} />
      </nav>

      <div className="mt-auto space-y-3 border-t border-neutral-800/80 pt-4">
        <ObsidianCreditBadge />
        <div className="flex gap-1">
          {(["en", "de"] as const).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setLanguage(lang)}
              className={`flex-1 rounded-lg py-1.5 text-[10px] font-bold uppercase tracking-wider ${
                displayLanguage === lang
                  ? "bg-amber-500 text-black"
                  : "text-neutral-600 hover:text-neutral-300"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-800 px-3 py-2.5 text-xs font-semibold text-neutral-500 hover:border-amber-500/40 hover:text-amber-400"
          aria-label={isDe ? "Abmelden" : "Log out"}
        >
          <LogOut className="h-3.5 w-3.5 shrink-0" />
          <span>{isDe ? "Abmelden" : "Log out"}</span>
        </button>
      </div>
    </aside>
  );
}

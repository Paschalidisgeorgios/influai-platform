"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { OBSIDIAN_NAV } from "@/lib/obsidian/dashboard-tokens";
import { useDashboardLanguage } from "../../DashboardLanguageProvider";
import ObsidianCreditBadge from "./ObsidianCreditBadge";

export default function ObsidianHUDSidebar() {
  const pathname = usePathname() ?? "/dashboard";
  const router = useRouter();
  const supabase = createClient();
  const { language, setLanguage } = useDashboardLanguage();
  const isDe = language === "de";

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <aside className="flex h-full w-[220px] shrink-0 flex-col border-r border-neutral-800/80 bg-[#050505]/95 px-4 py-5 backdrop-blur-2xl">
      <Link href="/dashboard" className="mb-8 flex items-baseline gap-0.5 px-1">
        <span className="text-sm font-black leading-none text-white">Influ</span>
        <span className="text-sm font-black leading-none text-amber-400">Ex</span>
        <span className="text-xs font-black leading-none text-amber-600">AI</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-0.5">
        {OBSIDIAN_NAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const label = isDe ? item.labelDe : item.labelEn;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={label}
              className={`rounded-xl px-3 py-2.5 text-left transition ${
                active
                  ? "border border-amber-500/50 bg-amber-500/10 text-amber-400"
                  : "text-neutral-400 hover:bg-neutral-900/60 hover:text-neutral-100"
              }`}
            >
              <span className="block text-xs font-semibold uppercase tracking-wide">
                {label}
              </span>
            </Link>
          );
        })}
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
                language === lang ? "bg-amber-500 text-black" : "text-neutral-600 hover:text-neutral-300"
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

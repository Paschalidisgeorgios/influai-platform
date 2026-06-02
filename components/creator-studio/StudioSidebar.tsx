"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  Home,
  ImageIcon,
  LayoutGrid,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Sparkles,
} from "lucide-react";
import { useUiStore } from "@/stores/uiStore";
import { useUserStore } from "@/stores/userStore";

const NAV = [
  { href: "/studio", label: "Create", icon: Sparkles },
  { href: "/dashboard/gallery", label: "Gallery", icon: LayoutGrid },
  { href: "/dashboard/credits", label: "Credits", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

export default function StudioSidebar() {
  const pathname = usePathname();
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const credits = useUserStore((s) => s.credits);

  return (
    <aside
      className={`flex h-full shrink-0 flex-col border-r border-amber-500/15 bg-[#070707] transition-all duration-300 ${
        collapsed ? "w-[72px]" : "w-[220px]"
      }`}
    >
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-4">
        {!collapsed ? (
          <Link href="/" className="text-sm font-black tracking-tight">
            <span className="text-white">Influ</span>
            <span className="text-amber-400">Ex</span>
            <span className="text-amber-600">AI</span>
          </Link>
        ) : (
          <Home className="mx-auto h-4 w-4 text-amber-400" />
        )}
        <button
          type="button"
          onClick={toggleSidebar}
          className="rounded-lg p-1.5 text-neutral-500 hover:bg-white/5 hover:text-amber-400"
          aria-label="Toggle sidebar"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      {!collapsed ? (
        <p className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
          Creator Studio
        </p>
      ) : null}

      <nav className="flex flex-1 flex-col gap-1 px-2 py-2">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                active
                  ? "border border-amber-500/40 bg-amber-500/10 text-amber-300"
                  : "text-neutral-400 hover:bg-white/5 hover:text-white"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed ? <span>{label}</span> : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/5 p-3">
        <div
          className={`rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-center ${
            collapsed ? "px-1" : ""
          }`}
        >
          {!collapsed ? (
            <p className="text-[10px] uppercase tracking-wider text-neutral-500">
              Credits
            </p>
          ) : null}
          <p className="text-sm font-bold text-amber-300">
            {collapsed ? "⚡" : `${credits.toLocaleString()} ⚡`}
          </p>
        </div>
      </div>
    </aside>
  );
}
